"use client";

import React from "react";
import { REGION_PRESETS } from "@/data/regionPresets";

interface PresetsBarProps {
  onSelectPreset: (presetId: string) => void;
  onClear: () => void;
  className?: string;
}

const PresetsBar = React.memo(function PresetsBar({
  onSelectPreset,
  onClear,
  className = "",
}: PresetsBarProps) {
  // Show most common presets first
  const displayPresets = REGION_PRESETS.slice(0, 10);

  return (
    <div className={`${className}`}>
      <label className="block text-xs font-semibold text-ink-600 dark:text-ink-400 uppercase tracking-wider mb-2.5">
        Quick Presets
      </label>
      <div className="flex flex-wrap gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
        {displayPresets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onSelectPreset(preset.id)}
            className="
              px-3 py-1.5 min-h-[32px] text-xs font-semibold rounded-lg
              bg-cream-200 dark:bg-ink-700 
              text-ink-700 dark:text-ink-200
              hover:bg-accent-teal hover:text-white
              dark:hover:bg-accent-teal dark:hover:text-white
              active:scale-[0.95] transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-accent-teal focus:ring-offset-1
              flex-shrink-0
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
            px-3 py-1.5 min-h-[32px] text-xs font-semibold rounded-lg
            bg-cream-300 dark:bg-ink-600
            text-ink-600 dark:text-ink-300
            hover:bg-accent-coral hover:text-white
            dark:hover:bg-accent-coral dark:hover:text-white
            active:scale-[0.95] transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-accent-coral focus:ring-offset-1
            flex-shrink-0
          "
        >
          Clear
        </button>
      </div>
    </div>
  );
});

PresetsBar.displayName = "PresetsBar";

export default PresetsBar;
