// World map projection and zoom utilities using D3

import * as d3 from "d3";
import type { GeoPermissibleObjects, GeoProjection } from "d3-geo";
import type { BoundingBox, CountryCode } from "@/types/map";

// Create Natural Earth projection
export function createProjection(
  width: number,
  height: number
): GeoProjection {
  return d3
    .geoNaturalEarth1()
    .scale(width / 5.5)
    .translate([width / 2, height / 2]);
}

// Create Mercator projection (alternative)
export function createMercatorProjection(
  width: number,
  height: number
): GeoProjection {
  return d3
    .geoMercator()
    .scale(width / 6.5)
    .translate([width / 2, height / 1.5]);
}

// Path generator factory
export function createPathGenerator(projection: GeoProjection) {
  return d3.geoPath().projection(projection);
}

// Calculate bounding box for a set of features
export function calculateBoundingBox(
  features: GeoPermissibleObjects[]
): BoundingBox | null {
  if (features.length === 0) return null;

  let minLon = Infinity;
  let maxLon = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;

  for (const feature of features) {
    const bounds = d3.geoBounds(feature);
    minLon = Math.min(minLon, bounds[0][0]);
    minLat = Math.min(minLat, bounds[0][1]);
    maxLon = Math.max(maxLon, bounds[1][0]);
    maxLat = Math.max(maxLat, bounds[1][1]);
  }

  return { minLon, maxLon, minLat, maxLat };
}

// Calculate zoom transform to fit bounds
export function calculateZoomTransform(
  bbox: BoundingBox,
  width: number,
  height: number,
  projection: GeoProjection,
  padding: number = 50
): { scale: number; translate: [number, number] } {
  const [[x0, y0], [x1, y1]] = [
    projection([bbox.minLon, bbox.maxLat]) ?? [0, 0],
    projection([bbox.maxLon, bbox.minLat]) ?? [width, height],
  ];

  const bboxWidth = Math.abs(x1 - x0);
  const bboxHeight = Math.abs(y1 - y0);

  const availableWidth = width - padding * 2;
  const availableHeight = height - padding * 2;

  const scale = Math.min(
    availableWidth / bboxWidth,
    availableHeight / bboxHeight,
    4 // Max zoom level
  );

  const centerX = (x0 + x1) / 2;
  const centerY = (y0 + y1) / 2;

  const translate: [number, number] = [
    width / 2 - centerX * scale,
    height / 2 - centerY * scale,
  ];

  return { scale, translate };
}

// Country ID mappings for different TopoJSON sources
// The world-atlas package uses numeric IDs based on ISO 3166-1 numeric codes
export const ISO_NUMERIC_TO_ISO2: Record<string, string> = {
  "004": "AF", "008": "AL", "010": "AQ", "012": "DZ", "020": "AD", "024": "AO",
  "028": "AG", "032": "AR", "051": "AM", "036": "AU", "040": "AT",
  "031": "AZ", "044": "BS", "048": "BH", "050": "BD", "052": "BB",
  "112": "BY", "056": "BE", "084": "BZ", "204": "BJ", "064": "BT",
  "068": "BO", "070": "BA", "072": "BW", "076": "BR", "096": "BN",
  "100": "BG", "854": "BF", "108": "BI", "132": "CV", "116": "KH",
  "120": "CM", "124": "CA", "140": "CF", "148": "TD", "152": "CL",
  "156": "CN", "170": "CO", "174": "KM", "178": "CG", "180": "CD",
  "188": "CR", "384": "CI", "191": "HR", "192": "CU", "196": "CY",
  "203": "CZ", "208": "DK", "262": "DJ", "212": "DM", "214": "DO",
  "218": "EC", "818": "EG", "222": "SV", "226": "GQ", "232": "ER",
  "233": "EE", "748": "SZ", "231": "ET", "242": "FJ", "246": "FI",
  "250": "FR", "266": "GA", "270": "GM", "268": "GE", "276": "DE",
  "288": "GH", "300": "GR", "308": "GD", "320": "GT", "324": "GN",
  "624": "GW", "328": "GY", "332": "HT", "340": "HN", "348": "HU",
  "352": "IS", "356": "IN", "360": "ID", "364": "IR", "368": "IQ",
  "372": "IE", "376": "IL", "380": "IT", "388": "JM", "392": "JP",
  "400": "JO", "398": "KZ", "404": "KE", "296": "KI", "408": "KP",
  "410": "KR", "414": "KW", "417": "KG", "418": "LA", "428": "LV",
  "422": "LB", "426": "LS", "430": "LR", "434": "LY", "438": "LI",
  "440": "LT", "442": "LU", "450": "MG", "454": "MW", "458": "MY",
  "462": "MV", "466": "ML", "470": "MT", "584": "MH", "478": "MR",
  "480": "MU", "484": "MX", "583": "FM", "498": "MD", "492": "MC",
  "496": "MN", "499": "ME", "504": "MA", "508": "MZ", "104": "MM",
  "516": "NA", "520": "NR", "524": "NP", "528": "NL", "554": "NZ",
  "558": "NI", "562": "NE", "566": "NG", "807": "MK", "578": "NO",
  "512": "OM", "586": "PK", "585": "PW", "275": "PS", "591": "PA",
  "598": "PG", "600": "PY", "604": "PE", "608": "PH", "616": "PL",
  "620": "PT", "634": "QA", "642": "RO", "643": "RU", "646": "RW",
  "659": "KN", "662": "LC", "670": "VC", "882": "WS", "674": "SM",
  "678": "ST", "682": "SA", "686": "SN", "688": "RS", "690": "SC",
  "694": "SL", "702": "SG", "703": "SK", "705": "SI", "090": "SB",
  "706": "SO", "710": "ZA", "728": "SS", "724": "ES", "144": "LK",
  "729": "SD", "740": "SR", "752": "SE", "756": "CH", "760": "SY",
  "158": "TW", "762": "TJ", "834": "TZ", "764": "TH", "626": "TL",
  "768": "TG", "776": "TO", "780": "TT", "788": "TN", "792": "TR",
  "795": "TM", "798": "TV", "800": "UG", "804": "UA", "784": "AE",
  "826": "GB", "840": "US", "858": "UY", "860": "UZ", "548": "VU",
  "336": "VA", "862": "VE", "704": "VN", "887": "YE", "894": "ZM",
  "716": "ZW", "-99": "XK", "630": "PR", "344": "HK", "446": "MO",
  "304": "GL", "540": "NC", "234": "FO", "316": "GU", "850": "VI",
  "016": "AS", "254": "GF", "258": "PF", "638": "RE", "474": "MQ",
  "312": "GP", "732": "EH", "531": "CW", "533": "AW", "534": "SX",
  "060": "BM", "136": "KY", "292": "GI", "238": "FK",
};

// Reverse mapping: ISO2 to numeric
export const ISO2_TO_NUMERIC: Record<string, string> = Object.fromEntries(
  Object.entries(ISO_NUMERIC_TO_ISO2).map(([num, iso2]) => [iso2, num])
);

// Get ISO2 code from a feature's ID (handles various formats)
export function getISO2FromFeatureId(id: string | number): string | null {
  // Handle negative IDs (like Kosovo: -99) specially
  const idNum = typeof id === 'number' ? id : parseInt(id, 10);
  if (idNum < 0) {
    // For negative IDs, use the string directly
    return ISO_NUMERIC_TO_ISO2[String(idNum)] ?? null;
  }
  // For positive IDs, pad to 3 digits
  const idStr = String(idNum).padStart(3, "0");
  return ISO_NUMERIC_TO_ISO2[idStr] ?? null;
}

// Get numeric ID from ISO2
export function getNumericFromISO2(iso2: string): string | null {
  return ISO2_TO_NUMERIC[iso2.toUpperCase()] ?? null;
}

// Graticule generator for grid lines
export function createGraticule() {
  return d3.geoGraticule().step([15, 15]);
}

// Sphere outline for ocean/globe edge
export function createSphere() {
  return { type: "Sphere" as const };
}
