import { getStrapiURL } from "../utils";

const inFlightRequests = new Map<string, Promise<unknown>>();
const isStrapiDebugLogsEnabled = process.env.STRAPI_DEBUG_LOGS === "true";

function getMethod(options: RequestInit): string {
  return (options.method ?? "GET").toUpperCase();
}

function createRequestDedupKey(requestUrl: string, options: RequestInit): string {
  const headers = Array.from(new Headers(options.headers).entries()).sort(([a], [b]) => a.localeCompare(b));
  const nextData = "next" in options ? (options as { next?: unknown }).next : undefined;
  const body = typeof options.body === "string" ? options.body : "";

  return JSON.stringify({
    method: getMethod(options),
    url: requestUrl,
    cache: options.cache ?? "",
    headers,
    next: nextData ?? null,
    body,
  });
}

export async function fetchAPI<T>(path: string, urlParamsObject = {}, options = {}) {
  if (!getStrapiURL()) {
    return {} as T;
  }

  try {
    const requestedLocale =
      urlParamsObject && typeof urlParamsObject === "object" && "locale" in urlParamsObject
        ? (urlParamsObject as { locale?: string }).locale
        : undefined;

    const queryString = new URLSearchParams(urlParamsObject).toString();
    const requestUrl = `${getStrapiURL()}/api${path}${queryString ? `?${queryString}` : ""}`;

    const mergedOptions = {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    } as RequestInit & { next?: { revalidate?: number } };

    const hasRevalidate = typeof mergedOptions.next?.revalidate === "number";
    if (!hasRevalidate && mergedOptions.cache === undefined) {
      mergedOptions.cache = "no-store";
      const headerEntries = Object.fromEntries(new Headers(mergedOptions.headers).entries());
      mergedOptions.headers = {
        ...headerEntries,
        "Cache-Control": "no-store, no-cache",
        Pragma: "no-cache",
      };
    }

    const requestInit = mergedOptions as RequestInit;
    const executeRequest = async (): Promise<T> => {
      const response = await fetch(requestUrl, requestInit);
      if (!response.ok) {
        if (isStrapiDebugLogsEnabled) {
          console.error(`[Strapi] ${response.status} ${response.statusText}: ${requestUrl.replace(/\?.*/, "")}`);
        }
        return {} as T;
      }
      const data = await response.json();

      if (isStrapiDebugLogsEnabled && requestedLocale !== undefined) {
        const resLocale =
          (data as { data?: { locale?: string } | Array<{ locale?: string }> })?.data != null
            ? Array.isArray((data as { data: unknown }).data)
              ? (data as { data: Array<{ locale?: string }> }).data[0]?.locale
              : (data as { data: { locale?: string } }).data?.locale
            : undefined;
        if (resLocale !== undefined && resLocale !== requestedLocale) {
          console.error("[Strapi] В ответе другая локаль: запрашивали", requestedLocale, ", пришло", resLocale, "|", path);
        }
      }
      return data as T;
    };

    if (getMethod(requestInit) !== "GET") {
      return executeRequest();
    }

    const dedupKey = createRequestDedupKey(requestUrl, requestInit);
    const existingRequest = inFlightRequests.get(dedupKey);
    if (existingRequest) {
      return (await existingRequest) as T;
    }

    const requestPromise = executeRequest().finally(() => {
      inFlightRequests.delete(dedupKey);
    });
    inFlightRequests.set(dedupKey, requestPromise);
    return await requestPromise;
  } catch {
    if (isStrapiDebugLogsEnabled) {
      console.error("[Strapi] Запрос не выполнен (сеть/URL):", getStrapiURL() + path);
    }
    return {} as T;
  }
}
