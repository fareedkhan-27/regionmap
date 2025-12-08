// Cache for geoJSON data to avoid re-fetching on every component mount
import * as topojson from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { FeatureCollection } from "geojson";

interface CountryProperties {
  name: string;
}

let cachedGeoData: FeatureCollection | null = null;
let loadingPromise: Promise<FeatureCollection> | null = null;

export async function getCachedGeoData(): Promise<FeatureCollection> {
  // Return cached data if available
  if (cachedGeoData) {
    return cachedGeoData;
  }

  // Return existing promise if already loading
  if (loadingPromise) {
    return loadingPromise;
  }

  // Start loading
  loadingPromise = (async () => {
    try {
      const response = await fetch(
        "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"
      );
      if (!response.ok) {
        throw new Error("Failed to load world map data");
      }
      const topology = (await response.json()) as Topology<{
        countries: GeometryCollection<CountryProperties>;
      }>;

      // Convert TopoJSON to GeoJSON
      const countries = topojson.feature(
        topology,
        topology.objects.countries
      ) as FeatureCollection;

      cachedGeoData = countries;
      loadingPromise = null; // Clear the promise once resolved
      return countries;
    } catch (error) {
      loadingPromise = null; // Reset on error so we can retry
      throw error;
    }
  })();

  return loadingPromise;
}

