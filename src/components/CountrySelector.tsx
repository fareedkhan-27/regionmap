"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { COUNTRY_ALIASES } from "@/data/countryAliases";
import type { CountryCode } from "@/types/map";
import { VALID_FLIGHT_COUNTRIES } from "@/data/validFlightCountries";

interface CountrySelectorProps {
  value: CountryCode | null;
  onChange: (value: CountryCode | null) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  flightOnly?: boolean; // If true, only show countries valid for flight animations
}

export default function CountrySelector({
  value,
  onChange,
  placeholder = "Select country...",
  label,
  disabled = false,
  className = "",
  flightOnly = false,
}: CountrySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get available countries (filtered by flightOnly if needed)
  const availableCountries = useMemo(() => {
    if (flightOnly) {
      return COUNTRY_ALIASES.filter((country) =>
        VALID_FLIGHT_COUNTRIES.includes(country.iso2 as CountryCode)
      );
    }
    return COUNTRY_ALIASES;
  }, [flightOnly]);

  // Debounce search query
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 200);
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  // Filter countries based on debounced search query (memoized)
  const filteredCountries = useMemo(() => {
    if (!debouncedQuery) return availableCountries;
    const query = debouncedQuery.toLowerCase();
    return availableCountries.filter((country) => (
      country.name.toLowerCase().includes(query) ||
      country.iso2.toLowerCase().includes(query) ||
      country.iso3.toLowerCase().includes(query) ||
      country.aliases.some((alias) => alias.toLowerCase().includes(query))
    ));
  }, [availableCountries, debouncedQuery]);

  const selectedCountry = value
    ? COUNTRY_ALIASES.find((c) => c.iso2 === value)
    : null;

  const handleSelect = (iso2: CountryCode) => {
    onChange(iso2);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full px-3 py-2 text-sm text-left
            bg-white dark:bg-ink-800
            border border-cream-300 dark:border-ink-600
            rounded-lg
            focus:outline-none focus:ring-2 focus:ring-accent-teal
            disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center justify-between
            ${isOpen ? "ring-2 ring-accent-teal" : ""}
          `}
        >
          <span className="truncate text-ink-800 dark:text-ink-100">
            {selectedCountry
              ? `${selectedCountry.name} (${selectedCountry.iso2})`
              : placeholder}
          </span>
          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
            {selectedCountry && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="p-0.5 hover:bg-cream-200 dark:hover:bg-ink-700 rounded"
                title="Clear selection"
              >
                <svg className="w-4 h-4 text-ink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <svg
              className={`w-4 h-4 text-ink-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-ink-800 border border-cream-300 dark:border-ink-600 rounded-lg shadow-lg max-h-60 overflow-hidden">
            {/* Search input */}
            <div className="p-2 border-b border-cream-200 dark:border-ink-700">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search countries..."
                className="w-full px-2 py-1.5 text-sm bg-cream-50 dark:bg-ink-900 border border-cream-300 dark:border-ink-600 rounded focus:outline-none focus:ring-1 focus:ring-accent-teal text-ink-800 dark:text-ink-100"
                autoFocus
              />
            </div>

            {/* Country list */}
            <div className="overflow-y-auto max-h-48">
              {filteredCountries.length === 0 ? (
                <div className="px-3 py-2 text-sm text-ink-500 dark:text-ink-400 text-center">
                  No countries found
                </div>
              ) : (
                filteredCountries.map((country) => (
                  <button
                    key={country.iso2}
                    type="button"
                    onClick={() => handleSelect(country.iso2)}
                    className={`
                      w-full px-3 py-2 text-sm text-left
                      hover:bg-cream-100 dark:hover:bg-ink-700
                      transition-colors
                      ${value === country.iso2 ? "bg-accent-teal/10 text-accent-teal" : "text-ink-800 dark:text-ink-200"}
                    `}
                  >
                    {country.name} ({country.iso2})
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

