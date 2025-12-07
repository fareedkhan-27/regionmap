// Single source of truth for countries that support flight animations
// Only includes countries that:
// 1. Have valid centroids in COUNTRY_CENTROIDS
// 2. Can be used for flight path calculations

import type { CountryCode } from "@/types/map";
import { COUNTRY_CENTROIDS } from "@/utils/countryCentroids";

/**
 * Array of all country codes that have valid centroids for flight animations
 * This is the single source of truth for valid flight countries
 */
export const VALID_FLIGHT_COUNTRIES: CountryCode[] = Object.keys(
  COUNTRY_CENTROIDS
) as CountryCode[];

/**
 * Check if a country code is valid for flight animations
 */
export function isValidFlightCountry(code: CountryCode | null): boolean {
  if (!code) return false;
  return VALID_FLIGHT_COUNTRIES.includes(code.toUpperCase() as CountryCode);
}

/**
 * Get a random valid flight country
 */
export function getRandomFlightCountry(): CountryCode | null {
  if (VALID_FLIGHT_COUNTRIES.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * VALID_FLIGHT_COUNTRIES.length);
  return VALID_FLIGHT_COUNTRIES[randomIndex];
}

/**
 * Get two distinct random flight countries
 */
export function getTwoRandomFlightCountries(): {
  origin: CountryCode;
  destination: CountryCode;
} | null {
  if (VALID_FLIGHT_COUNTRIES.length < 2) return null;

  const shuffled = [...VALID_FLIGHT_COUNTRIES].sort(() => Math.random() - 0.5);
  return {
    origin: shuffled[0],
    destination: shuffled[1],
  };
}

