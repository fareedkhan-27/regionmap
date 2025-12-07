// Flight distance and time calculation utilities

import type { CountryCode } from "@/types/map";
import { COUNTRY_CENTROIDS } from "./countryCentroids";

/**
 * Calculate the great circle distance between two points using the Haversine formula
 * @param lat1 Latitude of first point in degrees
 * @param lon1 Longitude of first point in degrees
 * @param lat2 Latitude of second point in degrees
 * @param lon2 Longitude of second point in degrees
 * @returns Distance in kilometers
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate flight distance between two countries
 * @param origin Country code of origin
 * @param destination Country code of destination
 * @returns Distance in kilometers, or null if either country doesn't have a centroid
 */
export function calculateFlightDistance(
  origin: CountryCode | null,
  destination: CountryCode | null
): number | null {
  if (!origin || !destination) {
    return null;
  }

  const originCentroid = COUNTRY_CENTROIDS[origin.toUpperCase()];
  const destCentroid = COUNTRY_CENTROIDS[destination.toUpperCase()];

  if (!originCentroid || !destCentroid) {
    return null;
  }

  const [lon1, lat1] = originCentroid;
  const [lon2, lat2] = destCentroid;

  return haversineDistance(lat1, lon1, lat2, lon2);
}

/**
 * Estimate flight time based on distance
 * Uses average commercial aircraft cruise speed of ~900 km/h
 * @param distanceKm Distance in kilometers
 * @returns Estimated flight time in hours
 */
export function estimateFlightTime(distanceKm: number): number {
  const averageCruiseSpeed = 900; // km/h
  return distanceKm / averageCruiseSpeed;
}

/**
 * Format flight time as a human-readable string
 * @param hours Flight time in hours
 * @returns Formatted string like "8h 30m" or "45m"
 */
export function formatFlightTime(hours: number): string {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  if (h === 0) {
    return `${m}m`;
  } else if (m === 0) {
    return `${h}h`;
  } else {
    return `${h}h ${m}m`;
  }
}

/**
 * Format distance as a human-readable string
 * @param distanceKm Distance in kilometers
 * @returns Formatted string like "5,234 km" or "234 km"
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${Math.round(distanceKm).toLocaleString()} km`;
}

