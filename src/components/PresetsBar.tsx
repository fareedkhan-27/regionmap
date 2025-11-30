"use client";

import React from "react";
import { REGION_PRESETS } from "@/data/regionPresets";

interface PresetsBarProps {
  onSelectPreset: (presetId: string) => void;
  onClear: () => void;
  className?: string;
}

export default function PresetsBar({
  onSelectPreset,
  onClear,
  className = "",
}: PresetsBarProps) {
  // Show most common presets first
  const displayPresets = REGION_PRESETS.slice(0, 10);

  return (
    <div className={`${className}`}>
      <label className="block text-xs font-medium text-ink-600 dark:text-ink-400 uppercase tracking-wide mb-2">
        Quick Presets
      </label>
      <div className="flex flex-wrap gap-1.5">
        {displayPresets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onSelectPreset(preset.id)}
            className="
              px-2.5 py-1 text-xs font-medium rounded-md
              bg-cream-200 dark:bg-ink-700 
              text-ink-700 dark:text-ink-200
              hover:bg-accent-teal hover:text-white
              dark:hover:bg-accent-teal dark:hover:text-white
              transition-colors duration-150
              focus:outline-none focus:ring-2 focus:ring-accent-teal focus:ring-offset-1
            "
            title={preset.description}
          >
            {preset.name}
          </button>
        ))}
        <button
          type="button"
          onClick={onClear}
          className="
            px-2.5 py-1 text-xs font-medium rounded-md
            bg-cream-300 dark:bg-ink-600
            text-ink-600 dark:text-ink-300
            hover:bg-accent-coral hover:text-white
            dark:hover:bg-accent-coral dark:hover:text-white
            transition-colors duration-150
            focus:outline-none focus:ring-2 focus:ring-accent-coral focus:ring-offset-1
          "
        >
          Clear
        </button>
      </div>
    </div>
  );
}
