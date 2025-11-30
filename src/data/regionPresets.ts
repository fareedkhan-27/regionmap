// Region presets for quick country selection
// Each preset contains ISO2 codes for countries in that region

export interface RegionPreset {
  id: string;
  name: string;
  description: string;
  countries: string[]; // ISO2 codes
}

export const REGION_PRESETS: RegionPreset[] = [
  {
    id: "mea",
    name: "MEA",
    description: "Middle East & Africa",
    countries: [
      "DZ", "EG", "LY", "MA", "TN", // North Africa
      "SA", "AE", "QA", "BH", "KW", "OM", "YE", // GCC + Yemen
      "IQ", "JO", "LB", "SY", "PS", // Levant
      "IL", "TR", "IR", // Extended Middle East
      "NG", "ZA", "KE", "GH", "ET", "TZ", "UG", // Sub-Saharan Africa
      "SN", "CI", "CM", "AO", "MZ", "ZW", "ZM", // More Africa
    ],
  },
  {
    id: "latam",
    name: "LATAM",
    description: "Latin America & Caribbean",
    countries: [
      "AR", "BO", "BR", "CL", "CO", "CR", "CU", 
      "DO", "EC", "SV", "GT", "HN", "MX", "NI", 
      "PA", "PY", "PE", "UY", "VE", "PR", "JM",
      "TT", "HT", "BZ", "GY", "SR",
    ],
  },
  {
    id: "eu",
    name: "EU",
    description: "European Union",
    countries: [
      "AT", "BE", "BG", "HR", "CY", "CZ", "DK", 
      "EE", "FI", "FR", "DE", "GR", "HU", "IE", 
      "IT", "LV", "LT", "LU", "MT", "NL", "PL", 
      "PT", "RO", "SK", "SI", "ES", "SE",
    ],
  },
  {
    id: "cee",
    name: "CEE",
    description: "Central & Eastern Europe",
    countries: [
      "AL", "BA", "BG", "HR", "CZ", "EE", "HU", 
      "LV", "LT", "PL", "RO", "RS", "SK", "SI", 
      "MK", "ME", "XK", "MD", "UA", "BY",
    ],
  },
  {
    id: "gcc",
    name: "GCC",
    description: "Gulf Cooperation Council",
    countries: ["SA", "AE", "QA", "BH", "KW", "OM"],
  },
  {
    id: "global_south",
    name: "Global South",
    description: "Developing & Emerging Markets",
    countries: [
      // Africa
      "AF", "NG", "ZA", "KE", "TZ", "UG", "GH", "DZ", "MA", "TN", "EG", "ET", "SN", "CI",
      // South Asia
      "BD", "PK", "IN", "LK", "NP",
      // Southeast Asia
      "PH", "ID", "VN", "TH", "MM", "KH", "LA",
      // Latin America
      "BR", "MX", "CO", "PE", "AR", "CL", "VE", "EC",
      // Other
      "CN", "IR", "IQ",
    ],
  },
  {
    id: "asia_pacific",
    name: "APAC",
    description: "Asia-Pacific Region",
    countries: [
      "CN", "JP", "KR", "IN", "AU", "NZ", "ID", 
      "TH", "MY", "SG", "PH", "VN", "TW", "HK",
      "BD", "PK", "LK", "NP", "MM", "KH", "LA",
    ],
  },
  {
    id: "north_america",
    name: "NA",
    description: "North America",
    countries: ["US", "CA", "MX"],
  },
  {
    id: "brics",
    name: "BRICS",
    description: "BRICS Nations",
    countries: ["BR", "RU", "IN", "CN", "ZA", "IR", "EG", "ET", "AE", "SA"],
  },
  {
    id: "g7",
    name: "G7",
    description: "Group of Seven",
    countries: ["US", "CA", "GB", "DE", "FR", "IT", "JP"],
  },
  {
    id: "g20",
    name: "G20",
    description: "Group of Twenty",
    countries: [
      "AR", "AU", "BR", "CA", "CN", "FR", "DE", 
      "IN", "ID", "IT", "JP", "KR", "MX", "RU", 
      "SA", "ZA", "TR", "GB", "US",
    ],
  },
  {
    id: "nordic",
    name: "Nordic",
    description: "Nordic Countries",
    countries: ["DK", "FI", "IS", "NO", "SE"],
  },
  {
    id: "asean",
    name: "ASEAN",
    description: "Association of Southeast Asian Nations",
    countries: ["BN", "KH", "ID", "LA", "MY", "MM", "PH", "SG", "TH", "VN"],
  },
  {
    id: "opec",
    name: "OPEC",
    description: "Organization of the Petroleum Exporting Countries",
    countries: ["DZ", "AO", "CG", "GQ", "GA", "IR", "IQ", "KW", "LY", "NG", "SA", "AE", "VE"],
  },
];

/**
 * Get a preset by its ID
 */
export function getPresetById(id: string): RegionPreset | undefined {
  return REGION_PRESETS.find((p) => p.id === id);
}

/**
 * Get all preset IDs
 */
export function getAllPresetIds(): string[] {
  return REGION_PRESETS.map((p) => p.id);
}
