/** Доработка HTML опубликованной Google-таблицы для корректного отображения. */

export type AdmissionSheetTab = { name: string; gid: string };

export type EnhanceAdmissionSheetOptions = {
  tabs?: AdmissionSheetTab[];
  activeGid?: string;
  locale?: string;
  /** Встроено в iframe сайта — без собственной панели масштаба (она снаружи). */
  embed?: boolean;
};

const SCORE_CELL_RE = /<td(\s[^>]*)?>\s*(\d+[,.]\d)\s*<\/td>/gi;

const INJECTED_STYLE = `
<style id="admission-sheet-enhance">
  html, body {
    margin: 0 !important;
    padding: 0 !important;
    background: #fff;
    height: auto !important;
    min-height: 0 !important;
    max-height: none !important;
    overflow: auto !important;
    display: block !important;
  }
  /* Служебный хром Google */
  #footer,
  #top-bar,
  #doc-title {
    display: none !important;
    height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
    visibility: hidden !important;
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
    overflow: visible !important;
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
  .admission-zoom-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border-bottom: 1px solid #e2e8f0;
    background: #fff;
    position: sticky;
    top: 0;
    z-index: 6;
  }
  body:has(.admission-zoom-bar) .admission-sheet-tabs {
    position: relative;
    top: auto;
  }
  .admission-zoom-bar button {
    appearance: none;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    background: #fff;
    color: #0f172a;
    font: 600 13px/1.2 system-ui, sans-serif;
    padding: 6px 10px;
    cursor: pointer;
  }
  .admission-zoom-bar button.is-active {
    border-color: #0f172a;
    background: #0f172a;
    color: #fff;
  }
  .admission-zoom-bar .admission-zoom-value {
    min-width: 3rem;
    text-align: center;
    font: 600 13px/1.2 system-ui, sans-serif;
    color: #334155;
  }
  #sheets-viewport {
    display: block !important;
    flex: none !important;
    height: auto !important;
    max-height: none !important;
    overflow: visible !important;
    transform-origin: top left;
  }
</style>
`.trim();

const ZOOM_SCRIPT = `
<script id="admission-sheet-zoom">
(function () {
  var STORAGE_KEY = "admission-sheet-zoom";
  var MSG = "admission-sheet";
  var MIN_ZOOM = 10;
  var MAX_ZOOM = 200;
  var viewport = null;
  var valueEl = null;
  var mode = "fit";
  var percent = 70;
  var pinchStartDist = 0;
  var pinchStartPercent = 70;
  var isEmbed = document.documentElement.getAttribute("data-admission-embed") === "1";
  var raf = 0;
  var pendingPercent = null;

  function getViewport() {
    return document.getElementById("sheets-viewport") || document.querySelector(".ritz.grid-container") || document.body;
  }

  function contentWidth() {
    var table = document.querySelector(".waffle") || getViewport();
    return Math.max(table.scrollWidth || 0, table.clientWidth || 0, 1200);
  }

  function contentHeight() {
    var table = document.querySelector(".waffle") || getViewport();
    return Math.max(table.scrollHeight || 0, table.clientHeight || 0, 400);
  }

  function currentScale() {
    if (mode === "fit") {
      return Math.min(1, (document.documentElement.clientWidth - 8) / contentWidth());
    }
    return percent / 100;
  }

  function touchDist(a, b) {
    var dx = a.clientX - b.clientX;
    var dy = a.clientY - b.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function clampPct(p) {
    return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, p));
  }

  function applyNow() {
    if (isEmbed) return;
    viewport = getViewport();
    if (!viewport) return;
    var scale = currentScale();
    var cw = contentWidth();
    var ch = contentHeight();
    viewport.style.transformOrigin = "top left";
    viewport.style.transform = "scale(" + scale + ")";
    viewport.style.width = cw + "px";
    viewport.style.height = ch + "px";
    // Убираем «пустое» место после scale (иначе снизу невидимый хвост/футер).
    viewport.style.marginBottom = (ch * (scale - 1)) + "px";
    viewport.style.marginRight = (cw * (scale - 1)) + "px";
    if (valueEl) valueEl.textContent = Math.round(scale * 100) + "%";
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode: mode, percent: percent })); } catch (e) {}
    document.querySelectorAll("[data-zoom]").forEach(function (btn) {
      var key = btn.getAttribute("data-zoom");
      var active = (key === "fit" && mode === "fit") || (key === String(Math.round(percent)) && mode === "pct");
      btn.classList.toggle("is-active", !!active);
    });
  }

  function apply() {
    if (raf) return;
    raf = requestAnimationFrame(function () {
      raf = 0;
      if (pendingPercent != null) {
        percent = clampPct(pendingPercent);
        pendingPercent = null;
        mode = "pct";
      }
      applyNow();
    });
  }

  function setFit() { mode = "fit"; pendingPercent = null; apply(); }
  function setPct(p) {
    pendingPercent = clampPct(p);
    apply();
  }
  function nudge(delta) {
    if (mode === "fit") percent = currentScale() * 100;
    setPct(percent + delta);
  }

  function notifyParent(payload) {
    if (window.parent && window.parent !== window) {
      try { window.parent.postMessage(Object.assign({ source: MSG }, payload), "*"); } catch (e) {}
    }
  }

  function onPinchStart(e) {
    if (e.touches.length !== 2) return;
    pinchStartDist = touchDist(e.touches[0], e.touches[1]);
    if (pinchStartDist < 8) return;
    if (isEmbed) {
      notifyParent({ type: "pinch-start" });
    } else {
      pinchStartPercent = currentScale() * 100;
    }
  }

  function onPinchMove(e) {
    if (e.touches.length !== 2 || pinchStartDist < 8) return;
    e.preventDefault();
    var factor = touchDist(e.touches[0], e.touches[1]) / pinchStartDist;
    if (!isFinite(factor) || factor <= 0) return;
    if (isEmbed) {
      notifyParent({ type: "pinch", factor: factor });
    } else {
      setPct(pinchStartPercent * factor);
    }
  }

  function onPinchEnd(e) {
    if (e.touches.length < 2) {
      pinchStartDist = 0;
      if (isEmbed) notifyParent({ type: "pinch-end" });
    }
  }

  function bindPinch(target) {
    if (!target) return;
    target.addEventListener("touchstart", onPinchStart, { passive: true });
    target.addEventListener("touchmove", onPinchMove, { passive: false });
    target.addEventListener("touchend", onPinchEnd, { passive: true });
    target.addEventListener("touchcancel", onPinchEnd, { passive: true });
  }

  function init() {
    valueEl = document.getElementById("admission-zoom-value");
    if (!isEmbed) {
      try {
        var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
        // Старые сохранения с минимумом 40% на мобилке давали скачок — игнорируем слишком высокие «дефолты» только если fit нужнее? Нет, уважаем выбор пользователя, но clamp к новому диапазону.
        if (saved && saved.mode === "pct" && saved.percent) {
          mode = "pct";
          percent = clampPct(saved.percent);
        }
      } catch (e) {}
      document.querySelectorAll("[data-zoom]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var key = btn.getAttribute("data-zoom");
          if (key === "fit") setFit();
          else if (key === "-") nudge(-10);
          else if (key === "+") nudge(10);
          else setPct(Number(key));
        });
      });
      window.addEventListener("resize", function () { if (mode === "fit") apply(); });
      apply();
    }
    bindPinch(document.body);
    bindPinch(getViewport());
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
</script>
`.trim();

function buildZoomBarHtml(locale: string): string {
  const fitLabel = locale === "en" ? "Fit width" : locale === "be" ? "Па шырыні" : "По ширине";
  return `<div class="admission-zoom-bar" role="toolbar" aria-label="Zoom">
  <button type="button" data-zoom="-" aria-label="Zoom out">−</button>
  <span class="admission-zoom-value" id="admission-zoom-value">70%</span>
  <button type="button" data-zoom="+" aria-label="Zoom in">+</button>
  <button type="button" data-zoom="fit">${escapeHtml(fitLabel)}</button>
  <button type="button" data-zoom="50">50%</button>
  <button type="button" data-zoom="65">65%</button>
  <button type="button" data-zoom="80">80%</button>
  <button type="button" data-zoom="100">100%</button>
</div>`;
}

function buildTabsHtml(
  tabs: AdmissionSheetTab[],
  activeGid: string,
  locale: string,
  embed = false
): string {
  if (tabs.length <= 1) return "";
  const links = tabs
    .map((tab) => {
      const classes = tab.gid === activeGid ? ' class="is-active"' : "";
      const params = new URLSearchParams({ locale, gid: tab.gid });
      if (embed) params.set("embed", "1");
      const href = `/api/admission-sheet?${params.toString()}`;
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
 * Также убираем номера строк/футер Google и добавляем вкладки + масштаб.
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
  const embed = options.embed === true;
  const tabsHtml = buildTabsHtml(tabs, activeGid, locale, embed);
  const zoomHtml = embed ? "" : buildZoomBarHtml(locale);
  const chromeHtml = `${tabsHtml}${zoomHtml}`;

  if (chromeHtml && !result.includes('class="admission-sheet-tabs"') && !result.includes('class="admission-zoom-bar"')) {
    if (/<div id="top-bar">[\s\S]*?<div id="sheets-viewport"/i.test(result)) {
      result = result.replace(
        /<div id="top-bar">[\s\S]*?<div id="sheets-viewport"/i,
        `${chromeHtml}<div id="sheets-viewport"`
      );
    } else if (/<body[^>]*>/i.test(result)) {
      result = result.replace(/<body[^>]*>/i, (bodyTag) => `${bodyTag}${chromeHtml}`);
    } else {
      result = `${chromeHtml}${result}`;
    }
  }

  if (embed && !/data-admission-embed=/i.test(result)) {
    if (/<html\b[^>]*>/i.test(result)) {
      result = result.replace(/<html\b([^>]*)>/i, '<html$1 data-admission-embed="1">');
    } else {
      result = `<html data-admission-embed="1">${result}</html>`;
    }
  }

  if (!result.includes('id="admission-sheet-zoom"')) {
    if (/<\/body>/i.test(result)) {
      result = result.replace(/<\/body>/i, `${ZOOM_SCRIPT}</body>`);
    } else {
      result = `${result}${ZOOM_SCRIPT}`;
    }
  }

  return result;
}
