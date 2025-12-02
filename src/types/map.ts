// Map configuration types

export type Mode = "single" | "multi";
export type CountryCode = string; // ISO2 codes

export type PatternType = "solid" | "stripes" | "dots" | "crosshatch" | "diagonal";

export interface Group {
  id: string;
  name: string;
  color: string; // HEX color
  pattern?: PatternType; // Optional pattern fill
  countries: CountryCode[]; // Array of ISO2 codes
}

export interface TitleConfig {
  title: string;
  subtitle?: string;
  position: "top-left" | "top-center" | "hidden";
  fontFamily: "sans" | "condensed" | "serif";
  fontSize: "sm" | "md" | "lg";
}

export interface BackgroundConfig {
  type: "transparent" | "solid";
  color?: string;
}

export type ResolutionOption = "1080p" | "4k" | "square" | "svg";

export interface MapConfig {
  mode: Mode;
  groups: Group[];
  titleConfig: TitleConfig;
  background: BackgroundConfig;
  borderColor: string;
  resolution: ResolutionOption;
  showLegend: boolean;
}

// Resolution dimensions mapping
export const RESOLUTION_DIMENSIONS: Record<
  ResolutionOption,
  { width: number; height: number }
> = {
  "1080p": { width: 1920, height: 1080 },
  "4k": { width: 3840, height: 2160 },
  square: { width: 2048, height: 2048 },
  svg: { width: 1920, height: 1080 }, // SVG uses viewBox, actual size is scalable
};

// Default colors for groups
export const DEFAULT_GROUP_COLORS = [
  "#2A9D8F", // Teal
  "#E76F51", // Coral
  "#264653", // Slate
  "#E9C46A", // Gold
  "#6B8E7E", // Sage
  "#9B5DE5", // Purple
  "#F15BB5", // Pink
  "#00BBF9", // Sky Blue
  "#00F5D4", // Mint
  "#FEE440", // Yellow
];

// Generate a random color
export function generateRandomColor(): string {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 60 + Math.floor(Math.random() * 30); // 60-90%
  const lightness = 45 + Math.floor(Math.random() * 20); // 45-65%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// Generate N distinct random colors
export function generateDistinctColors(count: number): string[] {
  const colors: string[] = [];
  const hueStep = 360 / count;

  for (let i = 0; i < count; i++) {
    const hue = Math.floor((i * hueStep + Math.random() * (hueStep * 0.5)) % 360);
    const saturation = 60 + Math.floor(Math.random() * 25);
    const lightness = 45 + Math.floor(Math.random() * 15);
    colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
  }

  return colors;
}

// Default map configuration
export const DEFAULT_MAP_CONFIG: MapConfig = {
  mode: "single",
  groups: [
    {
      id: "group-1",
      name: "Selected Countries",
      color: "#2A9D8F",
      countries: [],
    },
  ],
  titleConfig: {
    title: "",
    subtitle: "",
    position: "top-left",
    fontFamily: "sans",
    fontSize: "md",
  },
  background: {
    type: "solid",
    color: "#FEFDFB",
  },
  borderColor: "#C7C7C3",
  resolution: "1080p",
  showLegend: true,
};

// Validation result type
export interface ValidationResult {
  valid: CountryCode[];
  invalid: string[];
  duplicates: string[];
}

// Country data structure for rendering
export interface CountryRenderData {
  iso2: string;
  iso3: string;
  name: string;
  fillColor: string | null;
  isHighlighted: boolean;
}

// Bounding box for zoom calculations
export interface BoundingBox {
  minLon: number;
  maxLon: number;
  minLat: number;
  maxLat: number;
}
