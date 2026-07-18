"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Minus, Plus, Maximize2 } from "lucide-react";
import type { Locale } from "@/lib/i18n";

const PRESETS = [50, 65, 80, 100] as const;
const DEFAULT_NATURAL = { width: 1800, height: 820 };
const MIN_ZOOM = 40;
const MAX_ZOOM = 150;
const ZOOM_STEP = 10;
const PINCH_MESSAGE_SOURCE = "admission-sheet";

type ZoomMode = "fit" | number;

const ui = {
  ru: {
    fit: "По ширине",
    zoomOut: "Уменьшить",
    zoomIn: "Увеличить",
    openInNewTab: "Открыть таблицу в новой вкладке",
    pinchHint: "На телефоне: масштабируйте двумя пальцами",
  },
  be: {
    fit: "Па шырыні",
    zoomOut: "Паменшыць",
    zoomIn: "Павялічыць",
    openInNewTab: "Адкрыць табліцу ў новай укладцы",
    pinchHint: "На тэлефоне: маштабуйце двума пальцамі",
  },
  en: {
    fit: "Fit width",
    zoomOut: "Zoom out",
    zoomIn: "Zoom in",
    openInNewTab: "Open the spreadsheet in a new tab",
    pinchHint: "On mobile: pinch with two fingers to zoom",
  },
} as const;

interface AdmissionSheetEmbedProps {
  /** URL для iframe (обычно с embed=1). */
  src: string;
  /** URL «открыть в новой вкладке» (полная страница с зумом). */
  openHref: string;
  title: string;
  locale: Locale;
}

function clampZoom(value: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(value)));
}

function touchDistance(a: Touch, b: Touch): number {
  const dx = a.clientX - b.clientX;
  const dy = a.clientY - b.clientY;
  return Math.hypot(dx, dy);
}

export function AdmissionSheetEmbed({ src, openHref, title, locale }: AdmissionSheetEmbedProps) {
  const labels = ui[locale];
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const modeRef = useRef<ZoomMode>("fit");
  const scaleRef = useRef(1);
  const pinchBasePercentRef = useRef(70);
  const localPinchStartDistRef = useRef(0);

  const [mode, setMode] = useState<ZoomMode>("fit");
  const [natural, setNatural] = useState(DEFAULT_NATURAL);
  const [containerWidth, setContainerWidth] = useState(0);

  const measureNaturalSize = useCallback(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    const root =
      (doc.querySelector(".waffle") as HTMLElement | null) ||
      (doc.querySelector(".ritz.grid-container") as HTMLElement | null) ||
      (doc.querySelector("#sheets-viewport") as HTMLElement | null) ||
      doc.body;
    if (!root) return;
    const width = Math.max(root.scrollWidth, root.clientWidth, DEFAULT_NATURAL.width);
    const height = Math.max(root.scrollHeight, root.clientHeight, 640);
    setNatural({ width, height });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const sync = () => setContainerWidth(el.clientWidth);
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const fitScale =
    containerWidth > 0 ? Math.min(1, (containerWidth - 2) / natural.width) : 0.7;
  const scale = mode === "fit" ? fitScale : mode / 100;
  const zoomPercent = Math.round(scale * 100);

  useEffect(() => {
    modeRef.current = mode;
    scaleRef.current = scale;
  }, [mode, scale]);

  const applyZoomPercent = useCallback((percent: number) => {
    setMode(clampZoom(percent));
  }, []);

  // Pinch из iframe (таблица) через postMessage
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || data.source !== PINCH_MESSAGE_SOURCE) return;

      if (data.type === "pinch-start") {
        pinchBasePercentRef.current = Math.round(scaleRef.current * 100);
        return;
      }
      if (data.type === "pinch" && typeof data.factor === "number" && data.factor > 0) {
        applyZoomPercent(pinchBasePercentRef.current * data.factor);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [applyZoomPercent]);

  // Pinch по области контейнера (на случай жеста по рамке/скроллу)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 2) return;
      localPinchStartDistRef.current = touchDistance(e.touches[0], e.touches[1]);
      pinchBasePercentRef.current = Math.round(scaleRef.current * 100);
    };

    const onMove = (e: TouchEvent) => {
      if (e.touches.length !== 2 || localPinchStartDistRef.current < 8) return;
      e.preventDefault();
      const factor = touchDistance(e.touches[0], e.touches[1]) / localPinchStartDistRef.current;
      if (!Number.isFinite(factor) || factor <= 0) return;
      applyZoomPercent(pinchBasePercentRef.current * factor);
    };

    const onEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) localPinchStartDistRef.current = 0;
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd, { passive: true });
    el.addEventListener("touchcancel", onEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
    };
  }, [applyZoomPercent]);

  const setPreset = (value: ZoomMode) => setMode(value);
  const nudgeZoom = (delta: number) => {
    const base = mode === "fit" ? zoomPercent : mode;
    setMode(clampZoom(base + delta));
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
          <button
            type="button"
            onClick={() => nudgeZoom(-ZOOM_STEP)}
            className="inline-flex size-8 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label={labels.zoomOut}
            title={labels.zoomOut}
          >
            <Minus className="size-4" />
          </button>
          <span className="min-w-[3.25rem] text-center text-sm font-medium tabular-nums text-slate-700 dark:text-slate-200">
            {zoomPercent}%
          </span>
          <button
            type="button"
            onClick={() => nudgeZoom(ZOOM_STEP)}
            className="inline-flex size-8 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label={labels.zoomIn}
            title={labels.zoomIn}
          >
            <Plus className="size-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setPreset("fit")}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
            mode === "fit"
              ? "border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900"
              : "border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          }`}
        >
          <Maximize2 className="size-3.5" />
          {labels.fit}
        </button>

        {PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => setPreset(preset)}
            className={`rounded-lg border px-2.5 py-1.5 text-sm font-medium tabular-nums transition-colors ${
              mode === preset
                ? "border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900"
                : "border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            {preset}%
          </button>
        ))}
      </div>

      <p className="mb-2 text-xs text-slate-500 dark:text-slate-400 md:hidden">{labels.pinchHint}</p>

      <div
        ref={containerRef}
        className="overflow-auto rounded-2xl border border-slate-200 bg-white touch-pan-x touch-pan-y dark:border-slate-800 dark:bg-slate-900"
        style={{ maxHeight: "min(75vh, 900px)" }}
      >
        <div
          style={{
            width: natural.width * scale,
            height: natural.height * scale,
            position: "relative",
          }}
        >
          <iframe
            ref={iframeRef}
            title={title}
            src={src}
            loading="lazy"
            referrerPolicy="no-referrer"
            onLoad={measureNaturalSize}
            className="absolute left-0 top-0 border-0 origin-top-left"
            style={{
              width: natural.width,
              height: natural.height,
              transform: `scale(${scale})`,
            }}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <a
          href={openHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          {labels.openInNewTab}
        </a>
      </div>
    </div>
  );
}
