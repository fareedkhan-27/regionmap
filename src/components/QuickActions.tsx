// src/components/QuickActions.tsx
// Smart selection quick actions component

"use client";

import React, { useState, useRef, useEffect } from "react";
import type { CountryCode } from "@/types/map";
import { getAllContinents, getContinentFromSelection, type Continent } from "@/data/countryContinents";
import { canAddNeighbors, canSelectContinent, canInverseSelection } from "@/utils/smartSelection";

interface QuickActionsProps {
  selectedCountries: CountryCode[];
  onAddNeighbors: () => void;
  onSelectContinent: (continent: Continent) => void;
  onInverseSelection: () => void;
  className?: string;
}

export default function QuickActions({
  selectedCountries,
  onAddNeighbors,
  onSelectContinent,
  onInverseSelection,
  className = "",
}: QuickActionsProps) {
  const [isContinentDropdownOpen, setIsContinentDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const continents = getAllContinents();
  const hasSelection = selectedCountries.length > 0;
  const canAdd = canAddNeighbors(selectedCountries);
  const canContinent = canSelectContinent(selectedCountries);
  const canInverse = canInverseSelection(selectedCountries);
  const currentContinent = getContinentFromSelection(selectedCountries);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsContinentDropdownOpen(false);
      }
    };

    if (isContinentDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isContinentDropdownOpen]);

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-xs font-medium text-ink-600 dark:text-ink-400 uppercase tracking-wide">
        Quick Actions
      </label>
      
      <div className="space-y-2">
        {/* Add Neighbors Button */}
        <button
          type="button"
          onClick={onAddNeighbors}
          disabled={!canAdd}
          className={`
            w-full px-3 py-2 text-sm font-medium rounded-md transition-colors
            flex items-center justify-center gap-2
            ${
              canAdd
                ? "bg-accent-teal text-white hover:bg-accent-teal/90"
                : "bg-cream-200 dark:bg-ink-700 text-ink-400 dark:text-ink-500 cursor-not-allowed"
            }
          `}
          title={canAdd ? "Add all countries that border your selection" : "Select at least one country first"}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Add Neighbors
        </button>

        {/* Select Continent Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => canContinent && setIsContinentDropdownOpen(!isContinentDropdownOpen)}
            disabled={!canContinent}
            className={`
              w-full px-3 py-2 text-sm font-medium rounded-md transition-colors
              flex items-center justify-between
              ${
                canContinent
                  ? "bg-cream-200 dark:bg-ink-700 text-ink-700 dark:text-ink-200 hover:bg-cream-300 dark:hover:bg-ink-600"
                  : "bg-cream-200 dark:bg-ink-700 text-ink-400 dark:text-ink-500 cursor-not-allowed"
              }
            `}
            title={canContinent ? "Select entire continent" : "Select at least one country first"}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Select Continent
            </span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isContinentDropdownOpen && canContinent && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-ink-800 border border-cream-300 dark:border-ink-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {continents.map((continent) => (
                <button
                  key={continent}
                  type="button"
                  onClick={() => {
                    onSelectContinent(continent);
                    setIsContinentDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 text-sm text-left text-ink-700 dark:text-ink-200 hover:bg-accent-teal hover:text-white transition-colors first:rounded-t-md last:rounded-b-md"
                >
                  {continent}
                </button>
              ))}
            </div>
          )}
          {/* Show selected continent label */}
          {currentContinent && (
            <div className="mt-1 text-xs text-ink-500 dark:text-ink-400 text-center">
              Current: {currentContinent}
            </div>
          )}
        </div>

        {/* Inverse Selection Button */}
        <button
          type="button"
          onClick={onInverseSelection}
          disabled={!canInverse}
          className={`
            w-full px-3 py-2 text-sm font-medium rounded-md transition-colors
            flex items-center justify-center gap-2
            ${
              canInverse
                ? "bg-accent-coral text-white hover:bg-accent-coral/90"
                : "bg-cream-200 dark:bg-ink-700 text-ink-400 dark:text-ink-500 cursor-not-allowed"
            }
          `}
          title={canInverse ? "Select all countries except your current selection" : "Select at least one country first"}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Inverse Selection
        </button>
      </div>

      {hasSelection && (
        <div className="text-xs text-ink-500 dark:text-ink-400 pt-2 border-t border-cream-200 dark:border-ink-700">
          {selectedCountries.length} {selectedCountries.length === 1 ? "country" : "countries"} selected
        </div>
      )}
    </div>
  );
}

