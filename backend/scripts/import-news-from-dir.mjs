#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";

const SOURCE_ROOT = process.argv[2];
const STRAPI_URL = (process.env.STRAPI_URL || "http://127.0.0.1:1337").replace(/\/+$/, "");
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || "";
const DRY_RUN = process.env.DRY_RUN === "1";
const NEWS_COLLECTION_API_PATH = (process.env.NEWS_COLLECTION_API_PATH || "/api/articles").trim();

if (!SOURCE_ROOT) {
  console.error("Usage: node scripts/import-news-from-dir.mjs <source-dir>");
  process.exit(1);
}

if (!STRAPI_TOKEN) {
  console.error("Missing STRAPI_TOKEN env.");
  process.exit(1);
}

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const FILE_EXT = new Set([".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx"]);

const mediaCache = new Map();

function textNode(text) {
  return { type: "text", text };
}

function paragraphBlock(text) {
  return { type: "paragraph", children: [textNode(text)] };
}

function stripMarkdown(input) {
  return String(input || "")
    .replace(/!\[[^\]]*]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/[*_~`>#-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function markdownToBlocks(markdown) {
  const source = String(markdown || "").replace(/\r\n/g, "\n").trim();
  if (!source) return [paragraphBlock("")];

  const chunks = source.split(/\n\s*\n/g).map((s) => s.trim()).filter(Boolean);
  const out = [];

  for (const chunk of chunks) {
    const lines = chunk.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;

    const heading = lines[0].match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      out.push({
        type: "heading",
        level: heading[1].length,
        children: [textNode(stripMarkdown(heading[2]))],
      });
      continue;
    }

    if (lines.every((l) => l.startsWith(">"))) {
      const quoteText = lines.map((l) => l.replace(/^>\s?/, "")).join(" ");
      out.push({ type: "quote", children: [textNode(stripMarkdown(quoteText))] });
      continue;
    }

    if (lines.every((l) => /^[-*]\s+/.test(l))) {
      out.push({
        type: "list",
        format: "unordered",
        children: lines.map((l) => ({
          type: "list-item",
          children: [textNode(stripMarkdown(l.replace(/^[-*]\s+/, "")))],
        })),
      });
      continue;
    }

    out.push(paragraphBlock(stripMarkdown(lines.join(" "))));
  }

  return out.length ? out : [paragraphBlock(stripMarkdown(source))];
}

function transliterateSlug(text) {
  const map = new Map([
    ["а", "a"], ["б", "b"], ["в", "v"], ["г", "g"], ["д", "d"], ["е", "e"], ["ё", "e"],
    ["ж", "zh"], ["з", "z"], ["и", "i"], ["й", "y"], ["к", "k"], ["л", "l"], ["м", "m"],
    ["н", "n"], ["о", "o"], ["п", "p"], ["р", "r"], ["с", "s"], ["т", "t"], ["у", "u"],
    ["ф", "f"], ["х", "h"], ["ц", "c"], ["ч", "ch"], ["ш", "sh"], ["щ", "sch"], ["ъ", ""],
    ["ы", "y"], ["ь", ""], ["э", "e"], ["ю", "yu"], ["я", "ya"],
  ]);
  return String(text || "")
    .toLowerCase()
    .split("")
    .map((ch) => map.get(ch) ?? ch)
    .join("")
    .replace(/[^a-z0-9._~-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

function toPosixLike(p) {
  return p.replaceAll("\\", "/");
}

async function resolveAssetPath(rawPath, articleDir) {
  if (!rawPath) return null;
  const normalized = toPosixLike(String(rawPath));
  const basename = path.basename(normalized);
  const candidates = [
    rawPath,
    path.join(articleDir, "images", basename),
    path.join(articleDir, "files", basename),
    path.join(articleDir, basename),
  ];

  const marker = "/out/";
  const idx = normalized.toLowerCase().indexOf(marker);
  if (idx >= 0) {
    const suffix = normalized.slice(idx + marker.length);
    candidates.push(path.join(SOURCE_ROOT, suffix));
  }

  for (const c of candidates) {
    if (await fileExists(c)) return c;
  }
  return null;
}

async function strapiFetch(url, init = {}) {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${STRAPI_TOKEN}`,
      ...(init.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status} ${res.statusText} :: ${text.slice(0, 400)}`);
  }
  return res;
}

function getItemPublishedAt(item) {
  return item?.publishedAt ?? item?.attributes?.publishedAt ?? null;
}

async function findExistingArticle(title, date) {
  const qs = new URLSearchParams();
  qs.set("publicationState", "preview");
  qs.set("pagination[pageSize]", "5");
  qs.set("filters[title][$eq]", title);
  if (date) qs.set("filters[date][$eq]", date);
  const url = `${STRAPI_URL}${NEWS_COLLECTION_API_PATH}?${qs.toString()}`;
  const res = await strapiFetch(url);
  const json = await res.json();
  const data = Array.isArray(json?.data) ? json.data : [];
  return data[0] || null;
}

async function uploadMedia(filePath) {
  const abs = path.resolve(filePath);
  const stat = await fs.stat(abs);
  const hash = createHash("sha256");
  hash.update(abs);
  hash.update(String(stat.size));
  hash.update(String(stat.mtimeMs));
  const cacheKey = hash.digest("hex");
  if (mediaCache.has(cacheKey)) return mediaCache.get(cacheKey);

  const buf = await fs.readFile(abs);
  const form = new FormData();
  form.append("files", new Blob([buf]), path.basename(abs));

  if (DRY_RUN) {
    const fake = { id: -1 };
    mediaCache.set(cacheKey, fake);
    return fake;
  }

  const res = await strapiFetch(`${STRAPI_URL}/api/upload`, { method: "POST", body: form });
  const uploaded = await res.json();
  const file = Array.isArray(uploaded) ? uploaded[0] : null;
  if (!file?.id) throw new Error(`Upload failed for ${abs}`);
  mediaCache.set(cacheKey, file);
  return file;
}

async function readMeta(metaPath) {
  const raw = await fs.readFile(metaPath, "utf8");
  return JSON.parse(raw);
}

async function importArticle(metaPath) {
  const articleDir = path.dirname(metaPath);
  const meta = await readMeta(metaPath);
  const title = String(meta.ai_title || "").trim();
  if (!title) {
    return { status: "skip", reason: "empty title", title: path.basename(articleDir) };
  }

  const date = meta.published_at ? String(meta.published_at).slice(0, 10) : null;
  const existing = await findExistingArticle(title, date);
  if (existing && getItemPublishedAt(existing)) {
    return { status: "skip", reason: "already published", title };
  }

  const imagePaths = Array.isArray(meta.downloaded_images) ? meta.downloaded_images : [];
  const filePaths = Array.isArray(meta.downloaded_pdfs) ? meta.downloaded_pdfs : [];

  const uploadedImages = [];
  for (const raw of imagePaths) {
    const resolved = await resolveAssetPath(raw, articleDir);
    if (!resolved) continue;
    const ext = path.extname(resolved).toLowerCase();
    if (!IMAGE_EXT.has(ext)) continue;
    const media = await uploadMedia(resolved);
    if (media?.id > 0) uploadedImages.push(media.id);
  }

  const uploadedFiles = [];
  for (const raw of filePaths) {
    const resolved = await resolveAssetPath(raw, articleDir);
    if (!resolved) continue;
    const ext = path.extname(resolved).toLowerCase();
    if (!FILE_EXT.has(ext)) continue;
    const media = await uploadMedia(resolved);
    if (media?.id > 0) uploadedFiles.push(media.id);
  }

  const announcement = String(meta.ai_announce || "").trim() || stripMarkdown(meta.ai_content || "").slice(0, 700);
  const slugSeed = `${date || ""}-${title}`;
  const slug = transliterateSlug(slugSeed) || `news-${Date.now()}`;

  const data = {
    title,
    slug,
    announcement,
    content: markdownToBlocks(meta.ai_content || ""),
    date,
    cover: uploadedImages[0] || null,
    Media: uploadedImages.slice(1),
    files: uploadedFiles,
    publishedAt: new Date().toISOString(),
  };

  if (DRY_RUN) {
    return { status: "dry", title, media: uploadedImages.length + uploadedFiles.length };
  }

  await strapiFetch(`${STRAPI_URL}${NEWS_COLLECTION_API_PATH}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });

  return { status: "created", title, media: uploadedImages.length + uploadedFiles.length };
}

async function listMetaFiles(rootDir) {
  const entries = await fs.readdir(rootDir, { withFileTypes: true });
  const out = [];
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const p = path.join(rootDir, e.name, "meta.json");
    if (await fileExists(p)) out.push(p);
  }
  return out.sort();
}

async function main() {
  const metas = await listMetaFiles(SOURCE_ROOT);
  console.log(`Found ${metas.length} meta.json files`);

  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const metaPath of metas) {
    try {
      const result = await importArticle(metaPath);
      if (result.status === "created") created += 1;
      else if (result.status === "dry") created += 1;
      else skipped += 1;
      console.log(`[${result.status}] ${result.title}${result.reason ? ` (${result.reason})` : ""}`);
    } catch (err) {
      failed += 1;
      console.error(`[fail] ${metaPath} :: ${err?.message || err}`);
    }
  }

  console.log(`Done. created=${created}, skipped=${skipped}, failed=${failed}`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
