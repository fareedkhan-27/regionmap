// Flight animation theme configurations

export interface FlightTheme {
  id: string;
  name: string;
  routeColor: string;
  routeWidth: number;
  planeColor: string;
  planeStrokeColor: string;
  glowColor: string;
  glowIntensity: number;
}

export const FLIGHT_THEMES: Record<string, FlightTheme> = {
  classic: {
    id: "classic",
    name: "Classic",
    routeColor: "#3B82F6", // Blue
    routeWidth: 2.5,
    planeColor: "#F59E0B", // Orange
    planeStrokeColor: "#D97706",
    glowColor: "#60A5FA",
    glowIntensity: 3,
  },
  travel: {
    id: "travel",
    name: "Travel",
    routeColor: "#F59E0B", // Amber/Orange
    routeWidth: 3,
    planeColor: "#FBBF24", // Gold
    planeStrokeColor: "#D97706",
    glowColor: "#FCD34D",
    glowIntensity: 4,
  },
  space: {
    id: "space",
    name: "Space",
    routeColor: "#06B6D4", // Cyan
    routeWidth: 2.5,
    planeColor: "#8B5CF6", // Bright purple
    planeStrokeColor: "#7C3AED",
    glowColor: "#22D3EE",
    glowIntensity: 5,
  },
};

export function getFlightTheme(themeId: string): FlightTheme {
  return FLIGHT_THEMES[themeId] || FLIGHT_THEMES.classic;
}

export function getFlightThemeForDarkMode(themeId: string, isDarkMode: boolean): FlightTheme {
  const theme = getFlightTheme(themeId);
  if (!isDarkMode) {
    return theme;
  }
  
  // Adjust colors for dark mode
  const darkModeTheme: FlightTheme = {
    ...theme,
    routeColor: theme.id === "classic" ? "#60A5FA" : theme.id === "travel" ? "#FCD34D" : "#22D3EE",
    planeColor: theme.id === "classic" ? "#FBBF24" : theme.id === "travel" ? "#FCD34D" : "#A78BFA",
    glowColor: theme.id === "classic" ? "#93C5FD" : theme.id === "travel" ? "#FDE68A" : "#67E8F9",
  };
  
  return darkModeTheme;
}

