// Cache for geoJSON data to avoid re-fetching on every component mount
let cachedGeoData: any = null;
let loadingPromise: Promise<any> | null = null;

export async function getCachedGeoData(): Promise<any> {
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
      const topology = await response.json();
      cachedGeoData = topology;
      return topology;
    } catch (error) {
      loadingPromise = null; // Reset on error so we can retry
      throw error;
    }
  })();

  return loadingPromise;
}

