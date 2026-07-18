import { describe, expect, it, vi } from "vitest";
import {
  buildAdmissionSheetStaticHtmlUrl,
  extractSheetGidsFromPubHtmlShell,
  extractSheetTabsFromPubHtmlShell,
  getAdmissionSheetFetchUrl,
  getAdmissionSheetOpenUrl,
  getAdmissionSheetViewPath,
  resolveAdmissionSheetHtml,
  resolveAdmissionSheetHtmlUrl,
} from "./admission-campaign";
import { enhanceAdmissionSheetHtml } from "./admission-sheet-html";
import type { GlobalSettings } from "./strapi";

function settings(sheetUrl: string, sheetOpenUrl?: string): GlobalSettings {
  return {
    admissionCampaign: {
      sheetUrl,
      sheetOpenUrl: sheetOpenUrl ?? null,
    },
  } as GlobalSettings;
}

const IFRAME_SHEET =
  '<iframe src="https://docs.google.com/spreadsheets/d/e/2PACX-abc/pubhtml?widget=true&amp;headers=false"></iframe>';

describe("admission sheet URLs", () => {
  it("decodes &amp; and does not set single=true without gid", () => {
    const url = getAdmissionSheetFetchUrl(settings(IFRAME_SHEET));
    expect(url).toContain("widget=true");
    expect(url).toContain("headers=false");
    expect(url).not.toContain("single=true");
    expect(url).not.toContain("&amp;");
  });

  it("builds static HTML URL when gid is known", () => {
    const url = getAdmissionSheetFetchUrl(
      settings(IFRAME_SHEET, "https://docs.google.com/spreadsheets/d/1ABC/edit#gid=1799188760")
    );
    expect(url).toBe(
      "https://docs.google.com/spreadsheets/d/e/2PACX-abc/pubhtml?gid=1799188760&single=true&widget=false&headers=false"
    );
  });

  it("extracts src from pasted iframe HTML", () => {
    const url = getAdmissionSheetFetchUrl(settings(IFRAME_SHEET));
    expect(url.startsWith("https://docs.google.com/spreadsheets/d/e/2PACX-abc/pubhtml")).toBe(true);
  });

  it("converts edit open URL to htmlview for browser", () => {
    const url = getAdmissionSheetOpenUrl(
      settings(
        IFRAME_SHEET,
        "https://docs.google.com/spreadsheets/d/1URWiZ9MszMA9SiYdcczELVQRFUou6RET/edit?usp=sharing&ouid=1&rtpof=true&sd=true#gid=1799188760"
      )
    );
    expect(url).toContain("/htmlview");
    expect(url).not.toContain("/edit");
    expect(url).toContain("gid=1799188760");
  });

  it("returns same-origin view path", () => {
    expect(getAdmissionSheetViewPath("ru")).toBe("/api/admission-sheet?locale=ru");
    expect(getAdmissionSheetViewPath("be")).toBe("/api/admission-sheet?locale=be");
  });

  it("extracts sheet gids from pubhtml shell", () => {
    expect(extractSheetGidsFromPubHtmlShell("a?gid=1799188760&x b#gid=2 c&gid=1799188760")).toEqual([
      "1799188760",
      "2",
    ]);
    expect(extractSheetGidsFromPubHtmlShell("sheets: gid=1799188760 and gid=1571435077")).toEqual([
      "1799188760",
      "1571435077",
    ]);
  });

  it("extracts named sheet tabs from pubhtml shell", () => {
    const html = `name: "У", foo: 1, gid: "1799188760"}); name: "Э", gid: "1571435077"}); name: "Уз", gid: "949742609"}`;
    expect(extractSheetTabsFromPubHtmlShell(html)).toEqual([
      { name: "У", gid: "1799188760" },
      { name: "Э", gid: "1571435077" },
      { name: "Уз", gid: "949742609" },
    ]);
  });

  it("resolves static URL by probing shell when gid missing", async () => {
    const fetchMock = vi.fn(async () =>
      new Response('name: "У", gid: "1799188760"}); name: "Э", gid: "1571435077"}', {
        status: 200,
        headers: { "Content-Type": "text/html" },
      })
    );
    const resolved = await resolveAdmissionSheetHtml(settings(IFRAME_SHEET), {
      fetchImpl: fetchMock as unknown as typeof fetch,
    });
    expect(resolved?.htmlUrl).toBe(
      buildAdmissionSheetStaticHtmlUrl("https://docs.google.com/spreadsheets/d/e/2PACX-abc/pubhtml", "1799188760")
    );
    expect(resolved?.tabs.map((t) => t.name)).toEqual(["У", "Э"]);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("honors preferred gid when present in tabs", async () => {
    const fetchMock = vi.fn(async () =>
      new Response('name: "У", gid: "1"}); name: "Э", gid: "2"}', {
        status: 200,
        headers: { "Content-Type": "text/html" },
      })
    );
    const resolved = await resolveAdmissionSheetHtml(settings(IFRAME_SHEET), {
      preferredGid: "2",
      fetchImpl: fetchMock as unknown as typeof fetch,
    });
    expect(resolved?.activeGid).toBe("2");
    expect(resolved?.htmlUrl).toContain("gid=2");
  });
});

describe("enhanceAdmissionSheetHtml", () => {
  it("marks score cells, hides chrome, injects tabs", () => {
    const input = `<!DOCTYPE html><html><head><title>t</title></head><body>
      <div id="top-bar"><div id="doc-title"><span class="name">File : У</span></div></div>
      <div id="sheets-viewport">
      <div id="footer">Published by Google</div>
      <table><tr>
        <th class="row-headers-background"><div class="row-header-wrapper">1</div></th>
        <td class="s16" rowspan="2">3,0</td>
        <td class="s17" rowspan="2">3,1</td>
      </tr></table>
      </div>
    </body></html>`;
    const out = enhanceAdmissionSheetHtml(input, {
      tabs: [
        { name: "У", gid: "1" },
        { name: "Э", gid: "2" },
      ],
      activeGid: "1",
      locale: "ru",
    });
    expect(out).toContain('data-score-header="1"');
    expect(out).toContain("writing-mode: vertical-rl");
    expect(out).toContain("#footer");
    expect(out).toContain("display: none !important");
    expect(out).toContain("admission-sheet-tabs");
    expect(out).toContain("gid=2");
    expect(out).toContain("is-active");
    expect(out).not.toContain('id="top-bar"');
    expect(out).not.toContain("File : У");
  });
});
