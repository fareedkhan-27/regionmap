"use client";

import React, { useState } from "react";
import type { Group, CountryCode } from "@/types/map";
import { DEFAULT_GROUP_COLORS } from "@/types/map";
import { formatCountryList } from "@/utils/parseCountryInput";

interface GroupsPanelProps {
  groups: Group[];
  activeGroupId: string | null;
  onAddGroup: () => void;
  onRemoveGroup: (groupId: string) => void;
  onUpdateGroup: (groupId: string, updates: Partial<Group>) => void;
  onSetGroupCountries: (
    groupId: string,
    input: string
  ) => { valid: CountryCode[]; invalid: string[] };
  onSelectGroup: (groupId: string) => void;
  className?: string;
}

export default function GroupsPanel({
  groups,
  activeGroupId,
  onAddGroup,
  onRemoveGroup,
  onUpdateGroup,
  onSetGroupCountries,
  onSelectGroup,
  className = "",
}: GroupsPanelProps) {
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string[]>
  >({});

  const handleInputChange = (groupId: string, value: string) => {
    setInputValues((prev) => ({ ...prev, [groupId]: value }));
  };

  const handleValidate = (groupId: string) => {
    const input = inputValues[groupId] ?? "";
    const result = onSetGroupCountries(groupId, input);

    if (result.invalid.length > 0) {
      setValidationErrors((prev) => ({
        ...prev,
        [groupId]: result.invalid,
      }));
    } else {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[groupId];
        return next;
      });
    }

    // Clear input after validation
    setInputValues((prev) => {
      const next = { ...prev };
      delete next[groupId];
      return next;
    });
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {groups.map((group, index) => {
        const isActive = group.id === activeGroupId;
        const inputValue =
          inputValues[group.id] ?? group.countries.join(", ") ?? "";
        const errors = validationErrors[group.id] ?? [];

        return (
          <div
            key={group.id}
            className={`
              rounded-lg border-2 transition-all duration-200 overflow-hidden
              ${
                isActive
                  ? "border-accent-teal bg-accent-teal/5 dark:bg-accent-teal/10 shadow-sm shadow-accent-teal/10"
                  : "border-cream-300 dark:border-ink-600 bg-cream-50 dark:bg-ink-800/50 hover:border-cream-400 dark:hover:border-ink-500"
              }
            `}
          >
            {/* Group Header */}
            <div
              className="flex items-center gap-3 p-3.5 cursor-pointer"
              onClick={() => onSelectGroup(group.id)}
            >
              {/* Color picker */}
              <input
                type="color"
                value={group.color}
                onChange={(e) =>
                  onUpdateGroup(group.id, { color: e.target.value })
                }
                onClick={(e) => e.stopPropagation()}
                className="w-10 h-10 rounded-lg cursor-pointer border-2 border-cream-300 dark:border-ink-600 shadow-sm hover:shadow-md transition-shadow flex-shrink-0"
                title="Pick group color"
              />

              {/* Group name input */}
              <input
                type="text"
                value={group.name}
                onChange={(e) =>
                  onUpdateGroup(group.id, { name: e.target.value })
                }
                onClick={(e) => e.stopPropagation()}
                className="
                  flex-1 px-2.5 py-1.5 text-sm font-medium
                  bg-transparent border-b-2 border-transparent
                  hover:border-ink-300 dark:hover:border-ink-500
                  focus:border-accent-teal focus:outline-none
                  text-ink-800 dark:text-ink-100
                  transition-colors duration-200
                "
                placeholder="Group name"
              />

              {/* Country count badge */}
              <span
                className={`
                  px-2 py-0.5 text-xs font-medium rounded-full
                  ${
                    group.countries.length > 0
                      ? "bg-accent-teal/20 text-accent-teal"
                      : "bg-ink-200 dark:bg-ink-600 text-ink-500 dark:text-ink-400"
                  }
                `}
              >
                {group.countries.length}
              </span>

              {/* Delete button (disabled if only one group) */}
              {groups.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveGroup(group.id);
                  }}
                  className="
                    p-1 rounded text-ink-400 hover:text-accent-coral
                    hover:bg-accent-coral/10 transition-colors
                  "
                  title="Remove group"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Expanded content when active */}
            {isActive && (
              <div className="px-3.5 pb-3.5 space-y-2.5">
                {/* Countries textarea */}
                <textarea
                  value={inputValue}
                  onChange={(e) => handleInputChange(group.id, e.target.value)}
                  placeholder="e.g., India, UAE, Brazil, FR, DEU"
                  className="
                    w-full h-28 px-3.5 py-2.5 text-sm
                    bg-white dark:bg-ink-900
                    border border-cream-300 dark:border-ink-600
                    rounded-lg resize-none
                    focus:outline-none focus:ring-2 focus:ring-accent-teal focus:border-accent-teal
                    text-ink-800 dark:text-ink-100
                    placeholder:text-ink-400
                    transition-all duration-200
                  "
                />

                {/* Validation errors */}
                {errors.length > 0 && (
                  <div className="text-xs text-accent-coral font-medium px-2.5 py-1.5 bg-accent-coral/10 dark:bg-accent-coral/20 rounded-md">
                    Not recognized: {errors.join(", ")}
                  </div>
                )}

                {/* Current selection summary */}
                {group.countries.length > 0 && (
                  <div className="text-xs text-ink-500 dark:text-ink-400 px-2 py-1.5 bg-cream-100 dark:bg-ink-800/50 rounded-md">
                    <span className="font-medium">{group.countries.length} countries:</span> {formatCountryList(group.countries, 8)}
                  </div>
                )}

                {/* Validate button */}
                <button
                  type="button"
                  onClick={() => handleValidate(group.id)}
                  className="
                    w-full py-2.5 text-sm font-semibold
                    bg-accent-teal text-white rounded-lg
                    hover:bg-accent-teal/90 active:scale-[0.98] transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-accent-teal focus:ring-offset-2
                    shadow-sm shadow-accent-teal/20
                  "
                >
                  Update Selection
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Add group button */}
      <button
        type="button"
        onClick={onAddGroup}
        className="
          w-full py-2 text-sm font-medium
          border-2 border-dashed border-cream-400 dark:border-ink-600
          text-ink-500 dark:text-ink-400 rounded-lg
          hover:border-accent-teal hover:text-accent-teal
          transition-colors
          focus:outline-none focus:ring-2 focus:ring-accent-teal
        "
      >
        + Add Group
      </button>
    </div>
  );
}
