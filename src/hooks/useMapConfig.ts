"use client";

import { useState, useCallback, useMemo } from "react";
import type {
  MapConfig,
  Mode,
  Group,
  TitleConfig,
  BackgroundConfig,
  ResolutionOption,
  CountryCode,
} from "@/types/map";
import { DEFAULT_MAP_CONFIG, DEFAULT_GROUP_COLORS } from "@/types/map";
import { getPresetById } from "@/data/regionPresets";
import { parseCountryInput, validateCountryCodes } from "@/utils/parseCountryInput";

// Generate unique IDs for groups
// Start at 1 because "group-1" is the default initial group
let groupIdCounter = 1;
function generateGroupId(): string {
  groupIdCounter += 1;
  return `group-${groupIdCounter}`;
}

export interface UseMapConfigReturn {
  config: MapConfig;
  // Mode
  setMode: (mode: Mode) => void;
  // Groups
  addGroup: () => string;
  removeGroup: (groupId: string) => void;
  updateGroup: (groupId: string, updates: Partial<Group>) => void;
  setGroupCountries: (groupId: string, countries: CountryCode[]) => void;
  setGroupCountriesFromInput: (
    groupId: string,
    input: string
  ) => { valid: CountryCode[]; invalid: string[] };
  getActiveGroup: () => Group | null;
  setActiveGroup: (groupId: string) => void;
  activeGroupId: string | null;
  // Presets
  applyPreset: (presetId: string) => void;
  applyPresetToGroup: (presetId: string, groupId: string) => void;
  clearGroup: (groupId: string) => void;
  clearAllCountries: () => void;
  // Title & Appearance
  setTitleConfig: (config: Partial<TitleConfig>) => void;
  setBackground: (config: Partial<BackgroundConfig>) => void;
  setBorderColor: (color: string) => void;
  setResolution: (resolution: ResolutionOption) => void;
  setShowLegend: (show: boolean) => void;
  // Computed
  allSelectedCountries: CountryCode[];
  countryColorMap: Record<CountryCode, string>;
  hasSelection: boolean;
  // Reset
  resetConfig: () => void;
}

export function useMapConfig(): UseMapConfigReturn {
  const [config, setConfig] = useState<MapConfig>(DEFAULT_MAP_CONFIG);
  const [activeGroupId, setActiveGroupIdState] = useState<string | null>(
    DEFAULT_MAP_CONFIG.groups[0]?.id ?? null
  );

  // Mode
  const setMode = useCallback((mode: Mode) => {
    setConfig((prev) => {
      if (mode === "single") {
        // Merge all groups into one
        const allCountries = prev.groups.flatMap((g) => g.countries);
        const uniqueCountries = [...new Set(allCountries)];
        return {
          ...prev,
          mode,
          groups: [
            {
              id: prev.groups[0]?.id ?? generateGroupId(),
              name: "Selected Countries",
              color: prev.groups[0]?.color ?? DEFAULT_GROUP_COLORS[0],
              countries: uniqueCountries,
            },
          ],
        };
      } else {
        // Keep current groups or create initial if empty
        if (prev.groups.length === 0) {
          return {
            ...prev,
            mode,
            groups: [
              {
                id: generateGroupId(),
                name: "Group 1",
                color: DEFAULT_GROUP_COLORS[0],
                countries: [],
              },
            ],
          };
        }
        return { ...prev, mode };
      }
    });
  }, []);

  // Groups
  const addGroup = useCallback(() => {
    const newId = generateGroupId();
    setConfig((prev) => {
      const newIndex = prev.groups.length;

      // Get all currently used colors
      const usedColors = new Set(prev.groups.map(g => g.color));

      // Find first unused color from default palette
      const availableColor = DEFAULT_GROUP_COLORS.find(color => !usedColors.has(color));

      // Use available color if found, otherwise fall back to modulo rotation
      const newColor = availableColor ?? DEFAULT_GROUP_COLORS[newIndex % DEFAULT_GROUP_COLORS.length];

      const newGroup: Group = {
        id: newId,
        name: `Group ${newIndex + 1}`,
        color: newColor,
        countries: [],
      };
      return {
        ...prev,
        groups: [...prev.groups, newGroup],
      };
    });
    // Set the new group as active
    setActiveGroupIdState(newId);
    return newId;
  }, []);

  const removeGroup = useCallback((groupId: string) => {
    setConfig((prev) => {
      const filtered = prev.groups.filter((g) => g.id !== groupId);
      // Ensure at least one group remains
      if (filtered.length === 0) {
        return prev;
      }
      return { ...prev, groups: filtered };
    });
    
    // Update active group ID if we're removing the active one
    setActiveGroupIdState((prevActiveId) => {
      if (prevActiveId === groupId) {
        return null; // Will be set by the caller
      }
      return prevActiveId;
    });
  }, []);

  const updateGroup = useCallback((groupId: string, updates: Partial<Group>) => {
    setConfig((prev) => ({
      ...prev,
      groups: prev.groups.map((g) =>
        g.id === groupId ? { ...g, ...updates } : g
      ),
    }));
  }, []);

  const setGroupCountries = useCallback(
    (groupId: string, countries: CountryCode[]) => {
      updateGroup(groupId, { countries: validateCountryCodes(countries) });
    },
    [updateGroup]
  );

  const setGroupCountriesFromInput = useCallback(
    (groupId: string, input: string) => {
      const result = parseCountryInput(input);
      setGroupCountries(groupId, result.valid);
      return { valid: result.valid, invalid: result.invalid };
    },
    [setGroupCountries]
  );

  const getActiveGroup = useCallback((): Group | null => {
    return config.groups.find((g) => g.id === activeGroupId) ?? null;
  }, [config.groups, activeGroupId]);

  const setActiveGroup = useCallback((groupId: string) => {
    setActiveGroupIdState(groupId);
  }, []);

  // Presets - apply to specific group
  const applyPresetToGroup = useCallback(
    (presetId: string, targetGroupId: string) => {
      const preset = getPresetById(presetId);
      if (!preset) return;

      setGroupCountries(targetGroupId, preset.countries);
    },
    [setGroupCountries]
  );

  // Legacy applyPreset for backwards compatibility
  const applyPreset = useCallback(
    (presetId: string) => {
      const preset = getPresetById(presetId);
      if (!preset) return;

      if (config.mode === "single") {
        // Apply to the single group
        setConfig((prev) => ({
          ...prev,
          groups: [
            {
              ...prev.groups[0],
              countries: preset.countries,
            },
          ],
        }));
      } else {
        // Apply to active group, or first group if none active
        const targetGroupId = activeGroupId || config.groups[0]?.id;
        if (targetGroupId) {
          setGroupCountries(targetGroupId, preset.countries);
        }
      }
    },
    [config.mode, activeGroupId, config.groups, setGroupCountries]
  );

  // Clear a single group's countries
  const clearGroup = useCallback((groupId: string) => {
    setConfig((prev) => ({
      ...prev,
      groups: prev.groups.map((g) => 
        g.id === groupId ? { ...g, countries: [] } : g
      ),
    }));
  }, []);

  const clearAllCountries = useCallback(() => {
    setConfig((prev) => ({
      ...prev,
      groups: prev.groups.map((g) => ({ ...g, countries: [] })),
    }));
  }, []);

  // Title & Appearance
  const setTitleConfig = useCallback((updates: Partial<TitleConfig>) => {
    setConfig((prev) => ({
      ...prev,
      titleConfig: { ...prev.titleConfig, ...updates },
    }));
  }, []);

  const setBackground = useCallback((updates: Partial<BackgroundConfig>) => {
    setConfig((prev) => ({
      ...prev,
      background: { ...prev.background, ...updates },
    }));
  }, []);

  const setBorderColor = useCallback((color: string) => {
    setConfig((prev) => ({ ...prev, borderColor: color }));
  }, []);

  const setResolution = useCallback((resolution: ResolutionOption) => {
    setConfig((prev) => ({ ...prev, resolution }));
  }, []);

  const setShowLegend = useCallback((show: boolean) => {
    setConfig((prev) => ({ ...prev, showLegend: show }));
  }, []);

  // Computed values
  const allSelectedCountries = useMemo(() => {
    const all = config.groups.flatMap((g) => g.countries);
    return [...new Set(all)];
  }, [config.groups]);

  const countryColorMap = useMemo(() => {
    const map: Record<CountryCode, string> = {};
    // Later groups override earlier ones
    for (const group of config.groups) {
      for (const country of group.countries) {
        map[country] = group.color;
      }
    }
    return map;
  }, [config.groups]);

  const hasSelection = allSelectedCountries.length > 0;

  // Reset
  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_MAP_CONFIG);
    setActiveGroupIdState(DEFAULT_MAP_CONFIG.groups[0]?.id ?? null);
  }, []);

  return {
    config,
    setMode,
    addGroup,
    removeGroup,
    updateGroup,
    setGroupCountries,
    setGroupCountriesFromInput,
    getActiveGroup,
    setActiveGroup,
    activeGroupId,
    applyPreset,
    applyPresetToGroup,
    clearGroup,
    clearAllCountries,
    setTitleConfig,
    setBackground,
    setBorderColor,
    setResolution,
    setShowLegend,
    allSelectedCountries,
    countryColorMap,
    hasSelection,
    resetConfig,
  };
}
