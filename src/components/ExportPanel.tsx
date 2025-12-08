"use client";

import React from "react";
import type { ResolutionOption, BackgroundConfig, TitleConfig } from "@/types/map";

interface ExportPanelProps {
  resolution: ResolutionOption;
  background: BackgroundConfig;
  titleConfig: TitleConfig;
  onResolutionChange: (resolution: ResolutionOption) => void;
  onBackgroundChange: (config: Partial<BackgroundConfig>) => void;
  onTitleChange: (config: Partial<TitleConfig>) => void;
  onExport: (format: "png" | "jpg") => void;
  isExporting?: boolean;
  className?: string;
}

const RESOLUTIONS: { value: ResolutionOption; label: string; desc: string }[] = [
  { value: "1080p", label: "1080p", desc: "1920×1080" },
  { value: "4k", label: "4K", desc: "3840×2160" },
  { value: "square", label: "Square", desc: "2048×2048" },
];

export default function ExportPanel({
  resolution,
  background,
  titleConfig,
  onResolutionChange,
  onBackgroundChange,
  onTitleChange,
  onExport,
  isExporting = false,
  className = "",
}: ExportPanelProps) {
  return (
    <div className={`space-y-5 ${className}`}>
      {/* Title Section */}
      <div className="space-y-2.5">
        <label className="block text-xs font-semibold text-ink-600 dark:text-ink-400 uppercase tracking-wider mb-2">
          Export Title
        </label>
        <input
          type="text"
          value={titleConfig.title}
          onChange={(e) => onTitleChange({ title: e.target.value })}
          placeholder="Map title (optional)"
          className="
            w-full px-3.5 py-2.5 text-sm
            bg-white dark:bg-ink-900
            border border-cream-300 dark:border-ink-600
            rounded-lg
            focus:outline-none focus:ring-2 focus:ring-accent-teal focus:border-accent-teal
            text-ink-800 dark:text-ink-100
            placeholder:text-ink-400
            transition-all duration-200
          "
        />
        <input
          type="text"
          value={titleConfig.subtitle ?? ""}
          onChange={(e) => onTitleChange({ subtitle: e.target.value })}
          placeholder="Subtitle (optional)"
          className="
            w-full px-3.5 py-2.5 text-sm
            bg-white dark:bg-ink-900
            border border-cream-300 dark:border-ink-600
            rounded-lg
            focus:outline-none focus:ring-2 focus:ring-accent-teal focus:border-accent-teal
            text-ink-800 dark:text-ink-100
            placeholder:text-ink-400
            transition-all duration-200
          "
        />

        {/* Title position */}
        <div className="flex gap-2.5">
          {(["top-left", "top-center", "hidden"] as const).map((pos) => (
            <button
              key={pos}
              type="button"
              onClick={() => onTitleChange({ position: pos })}
              className={`
                flex-1 py-2 text-xs font-medium rounded-lg
                transition-all duration-200
                ${
                  titleConfig.position === pos
                    ? "bg-accent-teal text-white shadow-sm shadow-accent-teal/20"
                    : "bg-cream-200 dark:bg-ink-700 text-ink-600 dark:text-ink-300 hover:bg-cream-300 dark:hover:bg-ink-600 active:scale-[0.98]"
                }
              `}
            >
              {pos === "top-left" ? "Left" : pos === "top-center" ? "Center" : "Hidden"}
            </button>
          ))}
        </div>

        {/* Font options */}
        <div className="flex gap-2.5">
          <select
            value={titleConfig.fontFamily}
            onChange={(e) =>
              onTitleChange({
                fontFamily: e.target.value as "sans" | "condensed" | "serif",
              })
            }
            className="
              flex-1 px-3 py-2.5 text-xs font-medium
              bg-white dark:bg-ink-900
              border border-cream-300 dark:border-ink-600
              rounded-lg
              focus:outline-none focus:ring-2 focus:ring-accent-teal focus:border-accent-teal
              text-ink-800 dark:text-ink-100
              transition-all duration-200
            "
          >
            <option value="sans">Sans-serif</option>
            <option value="condensed">Condensed</option>
            <option value="serif">Serif</option>
          </select>
          <select
            value={titleConfig.fontSize}
            onChange={(e) =>
              onTitleChange({
                fontSize: e.target.value as "sm" | "md" | "lg",
              })
            }
            className="
              flex-1 px-3 py-2.5 text-xs font-medium
              bg-white dark:bg-ink-900
              border border-cream-300 dark:border-ink-600
              rounded-lg
              focus:outline-none focus:ring-2 focus:ring-accent-teal focus:border-accent-teal
              text-ink-800 dark:text-ink-100
              transition-all duration-200
            "
          >
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
          </select>
        </div>
      </div>

      {/* Resolution Section */}
      <div className="space-y-2.5">
        <label className="block text-xs font-semibold text-ink-600 dark:text-ink-400 uppercase tracking-wider mb-2">
          Resolution
        </label>
        <div className="grid grid-cols-3 gap-2.5">
          {RESOLUTIONS.map((res) => (
            <button
              key={res.value}
              type="button"
              onClick={() => onResolutionChange(res.value)}
              className={`
                py-2.5 px-2 rounded-lg text-center transition-all duration-200
                ${
                  resolution === res.value
                    ? "bg-accent-teal text-white shadow-sm shadow-accent-teal/20"
                    : "bg-cream-200 dark:bg-ink-700 text-ink-600 dark:text-ink-300 hover:bg-cream-300 dark:hover:bg-ink-600 active:scale-[0.98]"
                }
              `}
            >
              <div className="text-xs font-semibold">{res.label}</div>
              <div className="text-[10px] opacity-70 mt-0.5">{res.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Background Section */}
      <div className="space-y-2.5">
        <label className="block text-xs font-semibold text-ink-600 dark:text-ink-400 uppercase tracking-wider mb-2">
          Background
        </label>
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={() => onBackgroundChange({ type: "transparent" })}
            className={`
              flex-1 py-2.5 text-xs font-medium rounded-lg transition-all duration-200
              ${
                background.type === "transparent"
                  ? "bg-accent-teal text-white shadow-sm shadow-accent-teal/20"
                  : "bg-cream-200 dark:bg-ink-700 text-ink-600 dark:text-ink-300 hover:bg-cream-300 dark:hover:bg-ink-600 active:scale-[0.98]"
              }
            `}
          >
            Transparent
          </button>
          <button
            type="button"
            onClick={() =>
              onBackgroundChange({
                type: "solid",
                color: background.color ?? "#FFFFFF",
              })
            }
            className={`
              flex-1 py-2.5 text-xs font-medium rounded-lg transition-all duration-200
              ${
                background.type === "solid"
                  ? "bg-accent-teal text-white shadow-sm shadow-accent-teal/20"
                  : "bg-cream-200 dark:bg-ink-700 text-ink-600 dark:text-ink-300 hover:bg-cream-300 dark:hover:bg-ink-600 active:scale-[0.98]"
              }
            `}
          >
            Solid
          </button>
        </div>
        {background.type === "solid" && (
          <div className="flex items-center gap-3 pt-1">
            <input
              type="color"
              value={background.color ?? "#FFFFFF"}
              onChange={(e) =>
                onBackgroundChange({ type: "solid", color: e.target.value })
              }
              className="w-12 h-12 rounded-lg cursor-pointer border-2 border-cream-300 dark:border-ink-600 shadow-sm hover:shadow-md transition-shadow"
            />
            <span className="text-xs font-mono text-ink-500 dark:text-ink-400">
              {background.color ?? "#FFFFFF"}
            </span>
          </div>
        )}
      </div>

      {/* Export Buttons */}
      <div className="space-y-2.5 pt-3">
        <button
          type="button"
          onClick={() => onExport("png")}
          disabled={isExporting}
          className="
            w-full py-3 text-sm font-semibold
            bg-accent-teal text-white rounded-lg
            hover:bg-accent-teal/90 active:scale-[0.98] transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            focus:outline-none focus:ring-2 focus:ring-accent-teal focus:ring-offset-2
            shadow-sm shadow-accent-teal/20
          "
        >
          {isExporting ? "Exporting..." : "Export PNG"}
        </button>
        <button
          type="button"
          onClick={() => onExport("jpg")}
          disabled={isExporting}
          className="
            w-full py-3 text-sm font-semibold
            bg-ink-700 dark:bg-ink-600 text-white rounded-lg
            hover:bg-ink-600 dark:hover:bg-ink-500 active:scale-[0.98] transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            focus:outline-none focus:ring-2 focus:ring-ink-700 focus:ring-offset-2
            shadow-sm
          "
        >
          {isExporting ? "Exporting..." : "Export JPG"}
        </button>
      </div>
    </div>
  );
}
