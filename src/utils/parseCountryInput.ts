// Utility for parsing user country input

import { resolveCountryToken, getCountryByISO2 } from "@/data/countryAliases";
import type { ValidationResult, CountryCode } from "@/types/map";

/**
 * Parse a string of country names/codes into validated ISO2 codes
 * Supports comma-separated, newline-separated, or mixed
 */
export function parseCountryInput(input: string): ValidationResult {
  const result: ValidationResult = {
    valid: [],
    invalid: [],
    duplicates: [],
  };

  if (!input.trim()) {
    return result;
  }

  // Split by commas, newlines, semicolons, or tabs
  const tokens = input
    .split(/[,;\n\t]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  const seenCodes = new Set<string>();

  for (const token of tokens) {
    const iso2 = resolveCountryToken(token);

    if (iso2) {
      if (seenCodes.has(iso2)) {
        result.duplicates.push(token);
      } else {
        seenCodes.add(iso2);
        result.valid.push(iso2);
      }
    } else {
      result.invalid.push(token);
    }
  }

  return result;
}

/**
 * Get display names for a list of ISO2 codes
 */
export function getCountryNames(codes: CountryCode[]): string[] {
  return codes
    .map((code) => {
      const country = getCountryByISO2(code);
      return country?.name ?? code;
    });
}

/**
 * Format a list of countries for display
 */
export function formatCountryList(codes: CountryCode[], maxDisplay: number = 5): string {
  if (codes.length === 0) return "No countries selected";

  const names = getCountryNames(codes);
  
  if (names.length <= maxDisplay) {
    return names.join(", ");
  }

  const displayed = names.slice(0, maxDisplay);
  const remaining = names.length - maxDisplay;
  return `${displayed.join(", ")} +${remaining} more`;
}

/**
 * Validate and clean a list of ISO2 codes
 */
export function validateCountryCodes(codes: string[]): CountryCode[] {
  return codes
    .map((code) => code.toUpperCase())
    .filter((code) => getCountryByISO2(code) !== null);
}

/**
 * Merge two arrays of country codes, removing duplicates
 */
export function mergeCountryCodes(
  existing: CountryCode[],
  newCodes: CountryCode[]
): CountryCode[] {
  const set = new Set([...existing, ...newCodes]);
  return Array.from(set);
}
