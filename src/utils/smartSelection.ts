// src/utils/smartSelection.ts
// Utility functions for smart selection features

import type { CountryCode } from "@/types/map";
import { COUNTRY_ALIASES } from "@/data/countryAliases";
import { getAllNeighbors } from "@/data/countryBorders";
import { getCountriesInContinent, getContinentFromSelection, type Continent } from "@/data/countryContinents";

/**
 * Get all countries that border the current selection
 */
export function getNeighborCountries(selected: CountryCode[]): CountryCode[] {
  if (selected.length === 0) return [];
  return getAllNeighbors(selected);
}

/**
 * Get all countries in the same continent as the first selected country
 */
export function getContinentCountries(selected: CountryCode[]): CountryCode[] {
  if (selected.length === 0) return [];
  
  const continent = getContinentFromSelection(selected);
  if (!continent) return [];
  
  return getCountriesInContinent(continent);
}

/**
 * Get inverse selection - all countries NOT in the current selection
 */
export function getInverseSelection(selected: CountryCode[]): CountryCode[] {
  const allCountries = COUNTRY_ALIASES.map(c => c.iso2 as CountryCode);
  return allCountries.filter(country => !selected.includes(country));
}

/**
 * Check if a smart selection action is available
 */
export function canAddNeighbors(selected: CountryCode[]): boolean {
  return getNeighborCountries(selected).length > 0;
}

export function canSelectContinent(selected: CountryCode[]): boolean {
  return selected.length > 0 && getContinentFromSelection(selected) !== null;
}

export function canInverseSelection(selected: CountryCode[]): boolean {
  return selected.length > 0;
}

