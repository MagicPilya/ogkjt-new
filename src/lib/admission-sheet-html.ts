/** Доработка HTML опубликованной Google-таблицы для корректного отображения. */

export type AdmissionSheetTab = { name: string; gid: string };

export type EnhanceAdmissionSheetOptions = {
  tabs?: AdmissionSheetTab[];
  activeGid?: string;
  locale?: string;
};

const SCORE_CELL_RE = /<td(\s[^>]*)?>\s*(\d+[,.]\d)\s*<\/td>/gi;

const INJECTED_STYLE = `
<style id="admission-sheet-enhance">
  html, body {
    margin: 0;
    padding: 0;
    background: #fff;
  }
  /* Служебный хром Google */
  #footer,
  #top-bar,
  #doc-title {
    display: none !important;
  }
  /* Номера строк слева */
  .row-headers-background,
  .row-header-wrapper,
  th.row-header,
  th.row-header-shim,
  th.freezebar-origin-ltr {
    display: none !important;
  }
  .ritz.grid-container {
    overflow: auto !important;
  }
  td[data-score-header="1"] {
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    white-space: nowrap !important;
    overflow: visible !important;
    text-overflow: clip;
    vertical-align: middle !important;
    text-align: center !important;
    line-height: 1.15;
    padding: 6px 2px !important;
  }
  .admission-sheet-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding: 10px 12px;
    border-bottom: 1px solid #e2e8f0;
    background: #f8fafc;
    position: sticky;
    top: 0;
    z-index: 5;
  }
  .admission-sheet-tabs a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 2.25rem;
    padding: 6px 12px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    background: #fff;
    color: #0f172a;
    font: 600 14px/1.2 system-ui, sans-serif;
    text-decoration: none;
  }
  .admission-sheet-tabs a:hover {
    background: #f1f5f9;
  }
  .admission-sheet-tabs a.is-active {
    border-color: #0f172a;
    background: #0f172a;
    color: #fff;
  }
</style>
`.trim();

function buildTabsHtml(tabs: AdmissionSheetTab[], activeGid: string, locale: string): string {
  if (tabs.length <= 1) return "";
  const links = tabs
    .map((tab) => {
      const classes = tab.gid === activeGid ? ' class="is-active"' : "";
      const href = `/api/admission-sheet?locale=${encodeURIComponent(locale)}&gid=${encodeURIComponent(tab.gid)}`;
      const label = escapeHtml(tab.name);
      return `<a${classes} href="${href}">${label}</a>`;
    })
    .join("");
  return `<nav class="admission-sheet-tabs" aria-label="Sheets">${links}</nav>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Google Publish to web не сохраняет поворот текста: баллы (3,0…10,0) остаются
 * горизонтальными в узких колонках и обрезаются. Помечаем такие ячейки и крутим через CSS.
 * Также убираем номера строк/футер Google и добавляем переключатель вкладок.
 */
export function enhanceAdmissionSheetHtml(html: string, options: EnhanceAdmissionSheetOptions = {}): string {
  let result = html.replace(SCORE_CELL_RE, (_match, attrs = "", score: string) => {
    const safeAttrs = String(attrs);
    if (/data-score-header\s*=/i.test(safeAttrs)) {
      return `<td${safeAttrs}>${score}</td>`;
    }
    return `<td${safeAttrs} data-score-header="1">${score}</td>`;
  });

  if (!result.includes('id="admission-sheet-enhance"')) {
    if (/<\/head>/i.test(result)) {
      result = result.replace(/<\/head>/i, `${INJECTED_STYLE}</head>`);
    } else {
      result = `${INJECTED_STYLE}${result}`;
    }
  }

  const tabs = options.tabs ?? [];
  const activeGid = options.activeGid || tabs[0]?.gid || "";
  const locale = options.locale || "ru";
  const tabsHtml = buildTabsHtml(tabs, activeGid, locale);

  if (tabsHtml) {
    if (/class="admission-sheet-tabs"/i.test(result)) {
      return result;
    }
    if (/<div id="top-bar">[\s\S]*?<div id="sheets-viewport"/i.test(result)) {
      result = result.replace(
        /<div id="top-bar">[\s\S]*?<div id="sheets-viewport"/i,
        `${tabsHtml}<div id="sheets-viewport"`
      );
    } else if (/<body[^>]*>/i.test(result)) {
      result = result.replace(/<body[^>]*>/i, (bodyTag) => `${bodyTag}${tabsHtml}`);
    } else {
      result = `${tabsHtml}${result}`;
    }
  }

  return result;
}
