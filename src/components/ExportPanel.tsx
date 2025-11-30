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
    <div className={`space-y-4 ${className}`}>
      {/* Title Section */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-ink-600 dark:text-ink-400 uppercase tracking-wide">
          Export Title
        </label>
        <input
          type="text"
          value={titleConfig.title}
          onChange={(e) => onTitleChange({ title: e.target.value })}
          placeholder="Map title (optional)"
          className="
            w-full px-3 py-2 text-sm
            bg-white dark:bg-ink-900
            border border-cream-300 dark:border-ink-600
            rounded-md
            focus:outline-none focus:ring-2 focus:ring-accent-teal
            text-ink-800 dark:text-ink-100
            placeholder:text-ink-400
          "
        />
        <input
          type="text"
          value={titleConfig.subtitle ?? ""}
          onChange={(e) => onTitleChange({ subtitle: e.target.value })}
          placeholder="Subtitle (optional)"
          className="
            w-full px-3 py-2 text-sm
            bg-white dark:bg-ink-900
            border border-cream-300 dark:border-ink-600
            rounded-md
            focus:outline-none focus:ring-2 focus:ring-accent-teal
            text-ink-800 dark:text-ink-100
            placeholder:text-ink-400
          "
        />

        {/* Title position */}
        <div className="flex gap-2">
          {(["top-left", "top-center", "hidden"] as const).map((pos) => (
            <button
              key={pos}
              type="button"
              onClick={() => onTitleChange({ position: pos })}
              className={`
                flex-1 py-1.5 text-xs font-medium rounded-md
                transition-colors
                ${
                  titleConfig.position === pos
                    ? "bg-accent-teal text-white"
                    : "bg-cream-200 dark:bg-ink-700 text-ink-600 dark:text-ink-300 hover:bg-cream-300 dark:hover:bg-ink-600"
                }
              `}
            >
              {pos === "top-left" ? "Left" : pos === "top-center" ? "Center" : "Hidden"}
            </button>
          ))}
        </div>

        {/* Font options */}
        <div className="flex gap-2">
          <select
            value={titleConfig.fontFamily}
            onChange={(e) =>
              onTitleChange({
                fontFamily: e.target.value as "sans" | "condensed" | "serif",
              })
            }
            className="
              flex-1 px-2 py-1.5 text-xs
              bg-white dark:bg-ink-900
              border border-cream-300 dark:border-ink-600
              rounded-md
              focus:outline-none focus:ring-2 focus:ring-accent-teal
              text-ink-800 dark:text-ink-100
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
              flex-1 px-2 py-1.5 text-xs
              bg-white dark:bg-ink-900
              border border-cream-300 dark:border-ink-600
              rounded-md
              focus:outline-none focus:ring-2 focus:ring-accent-teal
              text-ink-800 dark:text-ink-100
            "
          >
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
          </select>
        </div>
      </div>

      {/* Resolution Section */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-ink-600 dark:text-ink-400 uppercase tracking-wide">
          Resolution
        </label>
        <div className="grid grid-cols-3 gap-2">
          {RESOLUTIONS.map((res) => (
            <button
              key={res.value}
              type="button"
              onClick={() => onResolutionChange(res.value)}
              className={`
                py-2 px-2 rounded-md text-center transition-colors
                ${
                  resolution === res.value
                    ? "bg-accent-teal text-white"
                    : "bg-cream-200 dark:bg-ink-700 text-ink-600 dark:text-ink-300 hover:bg-cream-300 dark:hover:bg-ink-600"
                }
              `}
            >
              <div className="text-xs font-medium">{res.label}</div>
              <div className="text-[10px] opacity-70">{res.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Background Section */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-ink-600 dark:text-ink-400 uppercase tracking-wide">
          Background
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onBackgroundChange({ type: "transparent" })}
            className={`
              flex-1 py-2 text-xs font-medium rounded-md transition-colors
              ${
                background.type === "transparent"
                  ? "bg-accent-teal text-white"
                  : "bg-cream-200 dark:bg-ink-700 text-ink-600 dark:text-ink-300 hover:bg-cream-300 dark:hover:bg-ink-600"
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
              flex-1 py-2 text-xs font-medium rounded-md transition-colors
              ${
                background.type === "solid"
                  ? "bg-accent-teal text-white"
                  : "bg-cream-200 dark:bg-ink-700 text-ink-600 dark:text-ink-300 hover:bg-cream-300 dark:hover:bg-ink-600"
              }
            `}
          >
            Solid
          </button>
        </div>
        {background.type === "solid" && (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={background.color ?? "#FFFFFF"}
              onChange={(e) =>
                onBackgroundChange({ type: "solid", color: e.target.value })
              }
              className="w-10 h-8 rounded cursor-pointer border-0 bg-transparent"
            />
            <span className="text-xs text-ink-500 dark:text-ink-400">
              {background.color ?? "#FFFFFF"}
            </span>
          </div>
        )}
      </div>

      {/* Export Buttons */}
      <div className="space-y-2 pt-2">
        <button
          type="button"
          onClick={() => onExport("png")}
          disabled={isExporting}
          className="
            w-full py-2.5 text-sm font-semibold
            bg-accent-teal text-white rounded-lg
            hover:bg-accent-teal/90 transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
            focus:outline-none focus:ring-2 focus:ring-accent-teal focus:ring-offset-2
          "
        >
          {isExporting ? "Exporting..." : "Export PNG"}
        </button>
        <button
          type="button"
          onClick={() => onExport("jpg")}
          disabled={isExporting}
          className="
            w-full py-2.5 text-sm font-semibold
            bg-ink-700 dark:bg-ink-600 text-white rounded-lg
            hover:bg-ink-600 dark:hover:bg-ink-500 transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
            focus:outline-none focus:ring-2 focus:ring-ink-700 focus:ring-offset-2
          "
        >
          {isExporting ? "Exporting..." : "Export JPG"}
        </button>
      </div>
    </div>
  );
}
