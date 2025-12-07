// Country centroids (approximate lat/lon coordinates)
// Used for flight path animations and other geographic calculations

import type { GeoProjection } from "d3-geo";
import type { CountryCode } from "@/types/map";

// Approximate country centroids as [longitude, latitude]
// These are approximate center points for major countries
// For more accuracy, these could be calculated from GeoJSON features
export const COUNTRY_CENTROIDS: Record<CountryCode, [number, number]> = {
  // Major countries - approximate centroids
  US: [-98.5795, 39.8283], // United States
  CA: [-106.3468, 56.1304], // Canada
  MX: [-102.5528, 23.6345], // Mexico
  BR: [-51.9253, -14.2350], // Brazil
  AR: [-63.6167, -38.4161], // Argentina
  CL: [-71.5430, -35.6751], // Chile
  CO: [-74.2973, 4.5709], // Colombia
  PE: [-75.0152, -9.1900], // Peru
  
  // Europe
  GB: [-3.4360, 55.3781], // United Kingdom
  FR: [2.2137, 46.2276], // France
  DE: [10.4515, 51.1657], // Germany
  IT: [12.5674, 41.8719], // Italy
  ES: [-3.7492, 40.4637], // Spain
  NL: [5.2913, 52.1326], // Netherlands
  BE: [4.4699, 50.5039], // Belgium
  CH: [8.2275, 46.8182], // Switzerland
  AT: [14.5501, 47.5162], // Austria
  SE: [18.6435, 60.1282], // Sweden
  NO: [8.4689, 60.4720], // Norway
  DK: [9.5018, 56.2639], // Denmark
  FI: [25.7482, 61.9241], // Finland
  PL: [19.1451, 51.9194], // Poland
  PT: [-8.2245, 39.3999], // Portugal
  GR: [21.8243, 39.0742], // Greece
  IE: [-8.2439, 53.4129], // Ireland
  CZ: [15.4726, 49.8175], // Czechia
  HU: [19.5033, 47.1625], // Hungary
  RO: [24.9668, 45.9432], // Romania
  BG: [25.4858, 42.7339], // Bulgaria
  
  // Asia
  CN: [104.1954, 35.8617], // China
  IN: [78.9629, 20.5937], // India
  JP: [138.2529, 36.2048], // Japan
  KR: [127.7669, 35.9078], // South Korea
  ID: [113.9213, -0.7893], // Indonesia
  TH: [100.9925, 15.8700], // Thailand
  VN: [108.2772, 14.0583], // Vietnam
  PH: [121.7740, 12.8797], // Philippines
  MY: [101.9758, 4.2105], // Malaysia
  SG: [103.8198, 1.3521], // Singapore
  PK: [69.3451, 30.3753], // Pakistan
  BD: [90.3563, 23.6850], // Bangladesh
  LK: [80.7718, 7.8731], // Sri Lanka
  MM: [95.9562, 21.9162], // Myanmar
  KZ: [66.9237, 48.0196], // Kazakhstan
  UZ: [64.5853, 41.3775], // Uzbekistan
  SA: [45.0792, 23.8859], // Saudi Arabia
  AE: [53.8478, 23.4241], // UAE
  IQ: [43.6793, 33.2232], // Iraq
  IR: [53.6880, 32.4279], // Iran
  IL: [34.8516, 31.0461], // Israel
  TR: [35.2433, 38.9637], // Turkey
  
  // Africa
  NG: [8.6753, 9.0820], // Nigeria
  ZA: [22.9375, -30.5595], // South Africa
  EG: [30.8025, 26.0975], // Egypt
  KE: [37.9062, -0.0236], // Kenya
  ET: [40.4897, 9.1450], // Ethiopia
  GH: [-1.0232, 7.9465], // Ghana
  TZ: [34.8888, -6.3690], // Tanzania
  UG: [32.2903, 1.3733], // Uganda
  DZ: [1.6596, 28.0339], // Algeria
  MA: [-7.0926, 31.7917], // Morocco
  TN: [9.5375, 33.8869], // Tunisia
  SD: [30.2176, 12.8628], // Sudan
  
  // Oceania
  AU: [133.7751, -25.2744], // Australia
  NZ: [174.8860, -40.9006], // New Zealand
  FJ: [178.0650, -16.5783], // Fiji
  
  // Other important countries
  RU: [105.3188, 61.5240], // Russia
  UA: [31.1656, 48.3794], // Ukraine
  BY: [27.9534, 53.7098], // Belarus
  RS: [21.0059, 44.0165], // Serbia
  HR: [15.2000, 45.1000], // Croatia
  BA: [17.6791, 43.9159], // Bosnia
  AL: [20.1683, 41.1533], // Albania
  XK: [20.9029, 42.6026], // Kosovo
  MD: [28.3699, 47.4116], // Moldova
  GE: [43.3569, 42.3154], // Georgia
  AM: [45.0382, 40.0691], // Armenia
  AZ: [47.5769, 40.1431], // Azerbaijan
  
  // Middle East
  JO: [36.2384, 30.5852], // Jordan
  LB: [35.8623, 33.8547], // Lebanon
  SY: [38.9968, 34.8021], // Syria
  KW: [47.4818, 29.3117], // Kuwait
  QA: [51.1839, 25.3548], // Qatar
  BH: [50.5577, 26.0667], // Bahrain
  OM: [55.9233, 21.4733], // Oman
  YE: [44.1910, 15.5527], // Yemen
  
  // Central America & Caribbean
  CU: [-77.7812, 21.5218], // Cuba
  JM: [-77.2975, 18.1096], // Jamaica
  DO: [-70.1627, 18.7357], // Dominican Republic
  HT: [-72.2852, 18.9712], // Haiti
  CR: [-83.7534, 9.7489], // Costa Rica
  PA: [-80.7821, 8.5380], // Panama
  GT: [-90.2308, 15.7835], // Guatemala
  HN: [-86.2419, 15.2000], // Honduras
  SV: [-88.8965, 13.7942], // El Salvador
  NI: [-85.2072, 12.2650], // Nicaragua
  
  // South America
  VE: [-66.5897, 6.4238], // Venezuela
  EC: [-78.1834, -1.8312], // Ecuador
  BO: [-63.5887, -16.2902], // Bolivia
  PY: [-58.4438, -23.4425], // Paraguay
  UY: [-55.7658, -32.5228], // Uruguay
  GY: [-58.9302, 4.8604], // Guyana
  SR: [-56.0278, 3.9193], // Suriname
  
  // Additional countries
  IS: [-19.0208, 64.9631], // Iceland
  EE: [25.0136, 58.5953], // Estonia
  LV: [24.6032, 56.8796], // Latvia
  LT: [23.8813, 55.1694], // Lithuania
  LU: [6.1296, 49.8153], // Luxembourg
  MT: [14.3754, 35.9375], // Malta
  CY: [33.4299, 35.1264], // Cyprus
  
  // More Asian countries
  TW: [120.9605, 23.6978], // Taiwan
  HK: [114.1694, 22.3193], // Hong Kong
  MO: [113.5439, 22.1987], // Macau
  MN: [103.8467, 46.8625], // Mongolia
  KG: [74.7661, 41.2044], // Kyrgyzstan
  TJ: [71.2761, 38.8610], // Tajikistan
  TM: [59.5563, 38.9697], // Turkmenistan
  AF: [66.2385, 33.9391], // Afghanistan
  NP: [84.1240, 28.3949], // Nepal
  BT: [90.4336, 27.5142], // Bhutan
  MV: [73.2207, 3.2028], // Maldives
  
  // More African countries
  SN: [-14.4524, 14.4974], // Senegal
  CI: [-5.5471, 7.5400], // Côte d'Ivoire
  CM: [12.3547, 7.3697], // Cameroon
  AO: [17.8739, -11.2027], // Angola
  MZ: [35.5296, -18.6657], // Mozambique
  ZW: [29.1549, -19.0154], // Zimbabwe
  ZM: [27.8493, -13.1339], // Zambia
  MW: [34.3015, -13.2543], // Malawi
  MG: [46.8691, -18.7669], // Madagascar
  MU: [57.5522, -20.3484], // Mauritius
  RE: [55.5364, -21.1151], // Réunion
  
  // Additional countries for completeness
  PS: [35.2332, 31.9522], // Palestine
  GL: [-42.6043, 71.7069], // Greenland
  PR: [-66.5901, 18.2208], // Puerto Rico
  VI: [-64.8963, 18.3358], // U.S. Virgin Islands
  GU: [144.7937, 13.4443], // Guam
  AS: [-170.1322, -14.2710], // American Samoa
};

/**
 * Get country centroid coordinates in SVG space
 * @param iso2 Country ISO2 code
 * @param projection D3 geo projection
 * @param width Map width
 * @param height Map height
 * @returns SVG coordinates { x, y } or null if country not found
 */
export function getCountryCentroid(
  iso2: CountryCode,
  projection: GeoProjection,
  width: number,
  height: number
): { x: number; y: number } | null {
  const centroid = COUNTRY_CENTROIDS[iso2.toUpperCase()];
  if (!centroid) {
    return null;
  }

  const [lon, lat] = centroid;
  const projected = projection([lon, lat]);
  
  if (!projected) {
    return null;
  }

  return {
    x: projected[0],
    y: projected[1],
  };
}

/**
 * Check if a country has a centroid defined
 */
export function hasCentroid(iso2: CountryCode): boolean {
  return iso2.toUpperCase() in COUNTRY_CENTROIDS;
}

