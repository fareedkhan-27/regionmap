"use client";

import React, { useMemo } from "react";
import type { Group, Mode } from "@/types/map";

interface LegendProps {
  groups: Group[];
  mode: Mode;
  className?: string;
  isDarkMode?: boolean;
}

const Legend = React.memo(function Legend({
  groups,
  mode,
  className = "",
  isDarkMode = false,
}: LegendProps) {
  // Filter to only groups with countries (memoized)
  const activeGroups = useMemo(
    () => groups.filter((g) => g.countries.length > 0),
    [groups]
  );

  if (activeGroups.length === 0) {
    return null;
  }

  return (
    <div
      className={`
        rounded-lg p-3.5 sm:p-4 shadow-soft border border-cream-200 dark:border-ink-700
        ${isDarkMode ? "bg-ink-800/95 text-ink-100" : "bg-white/95 text-ink-800"}
        backdrop-blur-sm
        ${className}
      `}
    >
      <h4
        className={`
          text-xs font-semibold uppercase tracking-wider mb-3
          ${isDarkMode ? "text-ink-400" : "text-ink-500"}
        `}
      >
        Legend
      </h4>
      <ul className="space-y-2">
        {activeGroups.map((group) => (
          <li key={group.id} className="flex items-center gap-2.5">
            <span
              className="w-4 h-4 rounded-md flex-shrink-0 shadow-sm border border-cream-300 dark:border-ink-600"
              style={{ backgroundColor: group.color }}
            />
            <span className="text-sm font-medium truncate flex-1">
              {mode === "single" ? "Selected Countries" : group.name}
            </span>
            <span
              className={`
                text-xs font-semibold ml-auto px-1.5 py-0.5 rounded
                ${isDarkMode ? "text-ink-300 bg-ink-700" : "text-ink-600 bg-cream-100"}
              `}
            >
              {group.countries.length}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
});

Legend.displayName = "Legend";

export default Legend;
