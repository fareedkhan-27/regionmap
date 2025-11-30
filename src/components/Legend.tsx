"use client";

import React from "react";
import type { Group, Mode } from "@/types/map";

interface LegendProps {
  groups: Group[];
  mode: Mode;
  className?: string;
  isDarkMode?: boolean;
}

export default function Legend({
  groups,
  mode,
  className = "",
  isDarkMode = false,
}: LegendProps) {
  // Filter to only groups with countries
  const activeGroups = groups.filter((g) => g.countries.length > 0);

  if (activeGroups.length === 0) {
    return null;
  }

  return (
    <div
      className={`
        rounded-lg p-3 shadow-soft
        ${isDarkMode ? "bg-ink-800/90 text-ink-100" : "bg-white/95 text-ink-800"}
        backdrop-blur-sm
        ${className}
      `}
    >
      <h4
        className={`
          text-xs font-semibold uppercase tracking-wider mb-2
          ${isDarkMode ? "text-ink-400" : "text-ink-500"}
        `}
      >
        Legend
      </h4>
      <ul className="space-y-1.5">
        {activeGroups.map((group) => (
          <li key={group.id} className="flex items-center gap-2">
            <span
              className="w-4 h-4 rounded-sm flex-shrink-0 shadow-sm"
              style={{ backgroundColor: group.color }}
            />
            <span className="text-sm font-medium truncate">
              {mode === "single" ? "Selected Countries" : group.name}
            </span>
            <span
              className={`
                text-xs ml-auto
                ${isDarkMode ? "text-ink-500" : "text-ink-400"}
              `}
            >
              {group.countries.length}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
