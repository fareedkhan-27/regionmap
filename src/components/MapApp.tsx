"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import WorldMap, { type WorldMapHandle } from "./WorldMap";
import Legend from "./Legend";
import CountrySelector from "./CountrySelector";
import FlightInfo from "./FlightInfo";
import QuickActions from "./QuickActions";
import { useMapConfig } from "@/hooks/useMapConfig";
import { exportMapAsImage, exportMapAsSvg } from "@/utils/exportImage";
import { REGION_PRESETS } from "@/data/regionPresets";
import { formatCountryList, parseCountryInput } from "@/utils/parseCountryInput";
import type { ResolutionOption, CountryCode } from "@/types/map";
import { COUNTRY_ALIASES, getCountryByISO2 } from "@/data/countryAliases";
import { hasCentroid, getCountryCentroid } from "@/utils/countryCentroids";
import { FLIGHT_THEMES } from "@/data/flightThemes";
import { VALID_FLIGHT_COUNTRIES, getTwoRandomFlightCountries, isValidFlightCountry } from "@/data/validFlightCountries";
import { getNeighborCountries, getInverseSelection } from "@/utils/smartSelection";
import { getCountriesInContinent, type Continent } from "@/data/countryContinents";
import packageJson from "../../package.json";

type MobileTab = "select" | "style" | "export";

export default function MapApp() {
  const mapRef = useRef<WorldMapHandle>(null);
  const {
    config,
    setMode,
    addGroup: addGroupToConfig,
    removeGroup: removeGroupFromConfig,
    updateGroup,
    setGroupCountries,
    setGroupCountriesFromInput,
    toggleCountryInGroup,
    setActiveGroup: setActiveGroupInConfig,
    activeGroupId: activeGroupIdFromConfig,
    applyPreset,
    applyPresetToGroup,
    clearGroup: clearGroupInConfig,
    clearAllCountries,
    setTitleConfig,
    setBackground,
    setBorderColor,
    setResolution,
    allSelectedCountries,
    countryColorMap,
    hasSelection,
    undo,
    redo,
    canUndo,
    canRedo,
    randomizeGroupColors,
    colorAllCountries,
    exportConfig,
    importConfig,
  } = useMapConfig();

  // LOCAL state for active group - don't rely on hook
  const [localActiveGroupId, setLocalActiveGroupId] = useState<string>("group-1");
  
  // Use local state, but sync with config when needed
  const activeGroupId = localActiveGroupId;
  const setActiveGroup = useCallback((id: string) => {
    setLocalActiveGroupId(id);
    setActiveGroupInConfig(id);
  }, [setActiveGroupInConfig]);

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobilePanel, setShowMobilePanel] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("select");
  const [showCountryLabels, setShowCountryLabels] = useState(false);
  const [mapDimensions, setMapDimensions] = useState({ width: 960, height: 540 });
  const [isFlightMode, setIsFlightMode] = useState(false); // Mobile-only flight-focused mode
  
  // Input states - LOCAL state, completely managed here
  const [countryInput, setCountryInput] = useState("");
  const [countryInputTouched, setCountryInputTouched] = useState(false);
  const [groupInputs, setGroupInputs] = useState<Record<string, string>>({ "group-1": "" });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Flight animation state
  const [flightOrigin, setFlightOrigin] = useState<CountryCode | null>(null);
  const [flightDestination, setFlightDestination] = useState<CountryCode | null>(null);
  const [isFlightPlaying, setIsFlightPlaying] = useState(false);
  const [flightDurationMs, setFlightDurationMs] = useState(5000);
  const [enableFlightAnimation, setEnableFlightAnimation] = useState(false);
  const [flightTheme, setFlightTheme] = useState<string>("classic");

  // Check for mobile viewport (debounced)
  useEffect(() => {
    let resizeTimer: NodeJS.Timeout;
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobile();
    
    // Debounced resize handler
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(checkMobile, 150);
    };
    
    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Update map dimensions based on container (with debouncing)
  useEffect(() => {
    let resizeTimer: NodeJS.Timeout;
    
    const updateDimensions = () => {
      const container = document.getElementById("map-container");
      if (container) {
        const rect = container.getBoundingClientRect();
        // Responsive padding: mobile flight mode (8px), mobile normal (12px), desktop (16-24px)
        const padding = (isMobile && isFlightMode) 
          ? 8 
          : isMobile 
          ? 12 
          : window.innerWidth < 1024 
          ? 16 
          : 24;
        const width = Math.max(rect.width - padding * 2, 300);
        const height = Math.max(rect.height - padding * 2, 200);
        setMapDimensions({ width, height });
      }
    };
    
    // Initial delay to ensure container is rendered
    const initialTimer = setTimeout(updateDimensions, 100);
    
    // Debounced resize handler
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateDimensions, 150);
    };
    
    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(initialTimer);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, [isMobile, showMobilePanel, isFlightMode]);

  // Auto-enter flight mode on mobile when flight animation is enabled
  useEffect(() => {
    if (isMobile && enableFlightAnimation && !isFlightMode) {
      setIsFlightMode(true);
      setShowMobilePanel(false); // Close any open panels
    } else if (isMobile && !enableFlightAnimation && isFlightMode) {
      setIsFlightMode(false);
    }
  }, [isMobile, enableFlightAnimation, isFlightMode]);

  // Dark mode toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Handle group input change (just update local state, don't parse yet)
  const handleGroupInputChange = useCallback((groupId: string, value: string) => {
    setGroupInputs(prev => ({ ...prev, [groupId]: value }));
  }, []);

  // Keep a ref to the latest groupInputs for use in callbacks
  const groupInputsRef = useRef(groupInputs);
  useEffect(() => {
    groupInputsRef.current = groupInputs;
  }, [groupInputs]);

  // Apply group input (parse and validate on blur)
  const applyGroupInput = useCallback((groupId: string) => {
    // Get the current input value from ref (always latest)
    const input = groupInputsRef.current[groupId] || "";
    const result = setGroupCountriesFromInput(groupId, input);
    
    // Update the input to show the validated countries
    setGroupInputs(prev => ({ 
      ...prev, 
      [groupId]: result.valid.join(", ")
    }));
    
    return result;
  }, [setGroupCountriesFromInput]);

  // Apply all group inputs at once
  const applyAllGroupInputs = useCallback(() => {
    let allErrors: string[] = [];
    const newInputs: Record<string, string> = {};
    
    // Process all groups
    config.groups.forEach(group => {
      const input = groupInputs[group.id] || "";
      const result = setGroupCountriesFromInput(group.id, input);
      newInputs[group.id] = result.valid.join(", ");
      allErrors = [...allErrors, ...result.invalid];
    });
    
    // Batch update all inputs at once
    setGroupInputs(prev => ({ ...prev, ...newInputs }));
    
    if (allErrors.length > 0) {
      setValidationErrors([...new Set(allErrors)]);
    } else {
      setValidationErrors([]);
    }
  }, [config.groups, groupInputs, setGroupCountriesFromInput]);

  // Handle adding a new group - make it active automatically
  const handleAddGroup = useCallback(() => {
    const newGroupId = addGroupToConfig();
    // Set local active state to new group
    setLocalActiveGroupId(newGroupId);
    // Initialize the new group's input to empty
    setGroupInputs(prev => ({ ...prev, [newGroupId]: "" }));
  }, [addGroupToConfig]);

  // Handle removing a group
  const handleRemoveGroup = useCallback((groupId: string) => {
    // Don't allow removing the last group
    if (config.groups.length <= 1) {
      return;
    }
    
    // Find another group to set as active before removing
    const remainingGroups = config.groups.filter(g => g.id !== groupId);
    const newActiveId = remainingGroups[0]?.id || "group-1";
    
    // Clean up the input state for this group
    setGroupInputs(prev => {
      const newInputs = { ...prev };
      delete newInputs[groupId];
      return newInputs;
    });
    
    // Set new active group (locally and in config)
    setLocalActiveGroupId(newActiveId);
    setActiveGroupInConfig(newActiveId);
    
    // Now remove the group from config
    removeGroupFromConfig(groupId);
  }, [removeGroupFromConfig, config.groups, setActiveGroupInConfig]);

  // Handle country input validation for single mode
  const handleValidateInput = useCallback(() => {
    if (!countryInput.trim()) return;
    
    const result = parseCountryInput(countryInput);
    if (config.groups.length > 0) {
      const groupId = activeGroupId || config.groups[0].id;
      setGroupCountriesFromInput(groupId, countryInput);
    }
    
    if (result.invalid.length > 0) {
      setValidationErrors(result.invalid);
    } else {
      setValidationErrors([]);
      setCountryInput("");
      if (isMobile) {
        setShowMobilePanel(false);
      }
    }
  }, [countryInput, config.groups, activeGroupId, setGroupCountriesFromInput, isMobile]);

  // Export handler
  const handleExport = useCallback(
    async (format: "png" | "jpg" | "svg") => {
      const svg = mapRef.current?.getSvgElement();
      if (!svg) return;

      setIsExporting(true);
      setExportSuccess(false);

      try {
        const exportOptions = {
          format,
          resolution: config.resolution,
          background: config.background,
          title: config.titleConfig.title || undefined,
          subtitle: config.titleConfig.subtitle || undefined,
          titlePosition: config.titleConfig.position,
          fontFamily: config.titleConfig.fontFamily,
          fontSize: config.titleConfig.fontSize,
          filename: config.titleConfig.title
            ? config.titleConfig.title.toLowerCase().replace(/\s+/g, "-")
            : "region-map",
        };

        if (format === "svg") {
          await exportMapAsSvg(svg, exportOptions);
        } else {
          await exportMapAsImage(svg, exportOptions);
        }

        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 3000);
      } catch (err) {
        console.error("Export failed:", err);
        alert("Failed to export. Please try again.");
      } finally {
        setIsExporting(false);
      }
    },
    [config]
  );

  // Zoom controls
  const handleZoomToSelection = () => mapRef.current?.zoomToSelection();
  const handleResetZoom = () => mapRef.current?.resetZoom();

  // Country click handler
  const handleCountryClick = useCallback((iso2: string) => {
    // Determine which group to toggle the country in
    const targetGroupId = activeGroupId || config.groups[0]?.id;
    if (!targetGroupId) return;

    toggleCountryInGroup(targetGroupId, iso2);
  }, [activeGroupId, config.groups, toggleCountryInGroup]);

  // Save/Load handlers
  const handleSaveConfig = useCallback(() => {
    const json = exportConfig();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `map-config-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [exportConfig]);

  const handleLoadConfig = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const json = event.target?.result as string;
        const success = importConfig(json);
        if (!success) {
          alert('Failed to load configuration. Invalid file format.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [importConfig]);

  // URL Sharing handler
  const handleShareURL = useCallback(() => {
    try {
      const json = exportConfig();
      const compressed = btoa(encodeURIComponent(json));
      const url = `${window.location.origin}${window.location.pathname}?config=${compressed}`;
      navigator.clipboard.writeText(url);
      alert('Share URL copied to clipboard!');
    } catch {
      alert('Failed to generate share URL. Configuration may be too large.');
    }
  }, [exportConfig]);

  // Load config from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const configParam = params.get('config');
    if (configParam) {
      try {
        const json = decodeURIComponent(atob(configParam));
        importConfig(json);
      } catch {
        console.error('Failed to load configuration from URL');
      }
    }
  }, [importConfig]);

  // Preset selection - applies to active group only
  const handlePresetSelect = useCallback((presetId: string) => {
    // Get the target group - active group or first group
    const targetGroupId = activeGroupId || config.groups[0]?.id;
    
    if (!targetGroupId) return;

    // Update the group input to reflect the preset
    const preset = REGION_PRESETS.find(p => p.id === presetId);
    if (preset) {
      const countriesStr = preset.countries.join(", ");
      
      // Update the config (countries in group)
      if (config.mode === "single") {
        applyPreset(presetId);
      } else {
        applyPresetToGroup(presetId, targetGroupId);
      }
      
      // Update the input display
      setGroupInputs(prev => {
        
        return {
          ...prev,
          [targetGroupId]: countriesStr
        };
      });
      
      // For single mode, also update countryInput
      if (config.mode === "single") {
        setCountryInput(countriesStr);
        setCountryInputTouched(true);
      }
    }
    if (isMobile) {
      setShowMobilePanel(false);
    }
  }, [activeGroupId, config.groups, config.mode, applyPreset, applyPresetToGroup, isMobile]);

  // Clear active group only (for multi-group mode)
  const handleClearActiveGroup = useCallback(() => {
    const targetGroupId = activeGroupId || config.groups[0]?.id;
    if (!targetGroupId) return;
    
    clearGroupInConfig(targetGroupId);
    setGroupInputs(prev => ({
      ...prev,
      [targetGroupId]: ""
    }));
    setValidationErrors([]);
  }, [activeGroupId, config.groups, clearGroupInConfig]);

  // Clear all countries handler (clears everything)
  const handleClearAll = useCallback(() => {
    // Clear the config
    clearAllCountries();
    // Clear single mode input and mark as touched (so it shows empty)
    setCountryInput("");
    setCountryInputTouched(true);
    // Clear all group inputs by setting each to empty string
    const clearedInputs: Record<string, string> = {};
    config.groups.forEach(group => {
      clearedInputs[group.id] = "";
    });
    setGroupInputs(clearedInputs);
    // Clear any validation errors
    setValidationErrors([]);
  }, [clearAllCountries, config.groups]);

  // Flight animation handlers
  const handleFlightOriginChange = useCallback((countryCode: CountryCode | null) => {
    setFlightOrigin(countryCode);
  }, []);

  const handleFlightDestinationChange = useCallback((countryCode: CountryCode | null) => {
    setFlightDestination(countryCode);
  }, []);

  const handlePlayFlight = useCallback(() => {
    if (flightOrigin && flightDestination && !isFlightPlaying) {
      // Prevent playing if origin and destination are the same
      if (flightOrigin === flightDestination) {
        return;
      }
      
      // Verify both countries are valid for flight
      if (!isValidFlightCountry(flightOrigin) || !isValidFlightCountry(flightDestination)) {
        console.warn("Invalid flight countries selected:", { flightOrigin, flightDestination });
        setIsFlightPlaying(false);
        return;
      }
      
      setIsFlightPlaying(true);
    }
  }, [flightOrigin, flightDestination, isFlightPlaying]);

  const handleStopFlight = useCallback(() => {
    setIsFlightPlaying(false);
    // Reset zoom immediately
    setTimeout(() => {
      mapRef.current?.resetZoom();
    }, 100);
  }, []);

  const handleSurpriseMe = useCallback(() => {
    if (isFlightPlaying) return;

    // Use the single source of truth for valid flight countries
    const randomPair = getTwoRandomFlightCountries();
    
    if (!randomPair) {
      console.warn("Not enough valid flight countries available");
      return;
    }

    const { origin, destination } = randomPair;

    // Verify both have centroids before setting
    if (!hasCentroid(origin) || !hasCentroid(destination)) {
      console.warn("Selected countries missing centroids:", { origin, destination });
      setIsFlightPlaying(false);
      return;
    }

    setFlightOrigin(origin);
    setFlightDestination(destination);

    // Verify centroids can be projected before auto-playing
    // We'll do a quick check - if projection fails, don't start flight
    // The actual projection check happens in WorldMap, but we can prevent stuck state here
    setTimeout(() => {
      // Only start if we have valid countries
      if (isValidFlightCountry(origin) && isValidFlightCountry(destination)) {
        setIsFlightPlaying(true);
      } else {
        console.warn("Invalid countries selected, not starting flight");
        setIsFlightPlaying(false);
      }
    }, 200);
  }, [isFlightPlaying]);

  const handleFlightComplete = useCallback(() => {
    setIsFlightPlaying(false);
    // Reset zoom after flight completes for better UX
    setTimeout(() => {
      mapRef.current?.resetZoom();
    }, 500);
  }, []);

  const handleFlightProgress = useCallback((progress: number, planePosition: { x: number; y: number }) => {
    // Progress callback is handled in WorldMap for zoom animation
    // This can be used for additional effects if needed
  }, []);

  // Quick Actions handlers
  const handleAddNeighbors = useCallback(() => {
    const neighbors = getNeighborCountries(allSelectedCountries);
    if (neighbors.length === 0) return;

    const targetGroupId = activeGroupId || config.groups[0]?.id;
    if (!targetGroupId) return;

    const currentGroup = config.groups.find(g => g.id === targetGroupId);
    if (!currentGroup) return;

    // Merge neighbors with existing countries (avoid duplicates)
    const merged = [...new Set([...currentGroup.countries, ...neighbors])];
    setGroupCountries(targetGroupId, merged);
  }, [allSelectedCountries, activeGroupId, config.groups, setGroupCountries]);

  const handleSelectContinent = useCallback((continent: Continent) => {
    const countries = getCountriesInContinent(continent);
    if (countries.length === 0) return;

    const targetGroupId = activeGroupId || config.groups[0]?.id;
    if (!targetGroupId) return;

    setGroupCountries(targetGroupId, countries);
  }, [activeGroupId, setGroupCountries]);

  const handleInverseSelection = useCallback(() => {
    const inverse = getInverseSelection(allSelectedCountries);
    if (inverse.length === 0) return;

    const targetGroupId = activeGroupId || config.groups[0]?.id;
    if (!targetGroupId) return;

    setGroupCountries(targetGroupId, inverse);
  }, [allSelectedCountries, activeGroupId, setGroupCountries]);

  // Mobile bottom sheet content (memoized)
  const renderMobileContent = useCallback(() => {
    switch (mobileTab) {
      case "select":
        return (
          <div className="space-y-4">
            {/* Mode Toggle */}
            <div>
              <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider mb-2">
                Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setMode("single")}
                  className={`py-2.5 text-sm font-medium rounded-lg transition-all ${
                    config.mode === "single"
                      ? "bg-accent-teal text-white shadow-md"
                      : "bg-cream-200 dark:bg-ink-700 text-ink-600 dark:text-ink-300"
                  }`}
                >
                  Single Color
                </button>
                <button
                  onClick={() => setMode("multi")}
                  className={`py-2.5 text-sm font-medium rounded-lg transition-all ${
                    config.mode === "multi"
                      ? "bg-accent-teal text-white shadow-md"
                      : "bg-cream-200 dark:bg-ink-700 text-ink-600 dark:text-ink-300"
                  }`}
                >
                  Multi-Group
                </button>
              </div>
            </div>

            {/* Quick Presets */}
            <div>
              <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider mb-2">
                Quick Presets {config.mode === "multi" && activeGroupId && (
                  <span className="text-accent-teal normal-case font-normal">
                    → applies to selected group
                  </span>
                )}
              </label>
              <div className="flex flex-wrap gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
                {REGION_PRESETS.slice(0, 8).map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset.id)}
                    className="px-3 py-2 min-h-[36px] text-xs font-medium rounded-full bg-cream-200 dark:bg-ink-700 text-ink-700 dark:text-ink-200 hover:bg-accent-teal hover:text-white active:scale-95 transition-all touch-manipulation flex-shrink-0"
                  >
                    {preset.name}
                  </button>
                ))}
                {config.mode === "multi" ? (
                  <>
                    <button
                      onClick={handleClearActiveGroup}
                      className="px-3 py-2 min-h-[36px] text-xs font-medium rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-500 hover:text-white active:scale-95 transition-all touch-manipulation flex-shrink-0"
                    >
                      Clear Group
                    </button>
                    <button
                      onClick={handleClearAll}
                      className="px-3 py-2 min-h-[36px] text-xs font-medium rounded-full bg-accent-coral/10 text-accent-coral hover:bg-accent-coral hover:text-white active:scale-95 transition-all touch-manipulation flex-shrink-0"
                    >
                      Clear All
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleClearAll}
                    className="px-3 py-2 min-h-[36px] text-xs font-medium rounded-full bg-accent-coral/10 text-accent-coral hover:bg-accent-coral hover:text-white active:scale-95 transition-all touch-manipulation flex-shrink-0"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <QuickActions
              selectedCountries={allSelectedCountries}
              onAddNeighbors={handleAddNeighbors}
              onSelectContinent={handleSelectContinent}
              onInverseSelection={handleInverseSelection}
            />

            {/* Single Mode: Simple Input */}
            {config.mode === "single" && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider mb-2">
                    Enter Countries
                  </label>
                  <p className="text-xs text-ink-500 dark:text-ink-400 mb-2.5">
                    Type country names, ISO codes, or aliases (comma or line separated)
                  </p>
                  <div className="flex gap-2.5">
                    {config.groups.length > 0 && (
                      <input
                        type="color"
                        value={config.groups[0].color}
                        onChange={(e) => updateGroup(config.groups[0].id, { color: e.target.value })}
                        className="w-12 h-12 rounded-lg cursor-pointer border-2 border-cream-300 dark:border-ink-600 flex-shrink-0 shadow-sm hover:shadow-md transition-shadow"
                      />
                    )}
                    <div className="flex-1">
                      <textarea
                        value={countryInputTouched ? countryInput : (config.groups[0]?.countries.join(", ") ?? "")}
                        onChange={(e) => { setCountryInput(e.target.value); setCountryInputTouched(true); }}
                        placeholder="e.g., India, UAE, Brazil, FR, DEU"
                        className="w-full h-24 px-3.5 py-2.5 text-sm bg-white dark:bg-ink-800 border border-cream-300 dark:border-ink-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-accent-teal focus:border-accent-teal text-ink-800 dark:text-ink-100 placeholder:text-ink-400 transition-all duration-200"
                      />
                    </div>
                  </div>
                  {validationErrors.length > 0 && (
                    <p className="mt-2 text-xs text-accent-coral font-medium px-2.5 py-1.5 bg-accent-coral/10 dark:bg-accent-coral/20 rounded-md">
                      Not found: {validationErrors.join(", ")}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Multi-Group Mode: Group Management */}
            {config.mode === "multi" && (
              <>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider">
                      Groups ({config.groups.length})
                    </label>
                    <button
                      onClick={handleAddGroup}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-accent-teal text-white hover:bg-accent-teal/90 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Group
                    </button>
                  </div>

                  {/* Group List */}
                  <div className="space-y-3">
                    {config.groups.map((group, index) => (
                      <div
                        key={group.id}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          activeGroupId === group.id
                            ? "border-accent-teal bg-accent-teal/5"
                            : "border-cream-200 dark:border-ink-700 bg-cream-50 dark:bg-ink-800"
                        }`}
                        onClick={() => setActiveGroup(group.id)}
                      >
                        {/* Group Header */}
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="color"
                            value={group.color}
                            onChange={(e) => updateGroup(group.id, { color: e.target.value })}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveGroup(group.id);
                            }}
                            className="w-8 h-8 rounded cursor-pointer border border-cream-300 dark:border-ink-600 flex-shrink-0"
                          />
                          <input
                            type="text"
                            value={group.name}
                            onChange={(e) => updateGroup(group.id, { name: e.target.value })}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveGroup(group.id);
                            }}
                            onFocus={() => setActiveGroup(group.id)}
                            placeholder={`Group ${index + 1}`}
                            className="flex-1 px-2 py-1 text-sm font-medium bg-transparent border-b border-cream-300 dark:border-ink-600 focus:border-accent-teal focus:outline-none text-ink-800 dark:text-ink-100"
                          />
                          {config.groups.length > 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveGroup(group.id);
                              }}
                              className="p-1.5 text-ink-400 hover:text-accent-coral hover:bg-accent-coral/10 rounded transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>

                        {/* Pattern selector */}
                        <div className="flex gap-1 mb-2">
                          {(["solid", "stripes", "dots", "crosshatch", "diagonal"] as const).map((patternType) => (
                            <button
                              key={patternType}
                              onClick={(e) => {
                                e.stopPropagation();
                                updateGroup(group.id, { pattern: patternType });
                              }}
                              className={`flex-1 px-1.5 py-1 text-[10px] font-medium rounded transition-colors ${
                                (group.pattern || "solid") === patternType
                                  ? "bg-accent-teal text-white"
                                  : "bg-cream-100 dark:bg-ink-700 text-ink-600 dark:text-ink-300"
                              }`}
                              title={patternType}
                            >
                              {patternType === "solid" ? "●" : patternType === "stripes" ? "|||" : patternType === "dots" ? "⋮⋮" : patternType === "crosshatch" ? "╬" : "/"}
                            </button>
                          ))}
                        </div>

                        {/* Country Input for this group */}
                        <textarea
                          value={groupInputs[group.id] ?? ""}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleGroupInputChange(group.id, e.target.value);
                          }}
                          onBlur={() => applyGroupInput(group.id)}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveGroup(group.id);
                          }}
                          onFocus={() => setActiveGroup(group.id)}
                          placeholder="e.g., US, UK, France, DE, IT"
                          className="w-full h-20 px-3 py-2 text-sm bg-white dark:bg-ink-900 border border-cream-300 dark:border-ink-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-accent-teal focus:border-accent-teal text-ink-700 dark:text-ink-200 placeholder:text-ink-400 transition-all duration-200"
                        />

                        {/* Country count */}
                        <div className="mt-2 text-xs text-ink-500 dark:text-ink-400 font-medium">
                          {group.countries.length} {group.countries.length === 1 ? 'country' : 'countries'} selected
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Flight Animation Section */}
            <div className="pt-4 border-t border-cream-200 dark:border-ink-700">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider">
                  Flight Animation
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableFlightAnimation}
                    onChange={(e) => setEnableFlightAnimation(e.target.checked)}
                    className="w-4 h-4 rounded border-cream-300 dark:border-ink-600 text-accent-teal focus:ring-accent-teal"
                  />
                  <span className="text-xs text-ink-600 dark:text-ink-400">Enable</span>
                </label>
              </div>

              {enableFlightAnimation && (
                <div className="space-y-3">
                  <CountrySelector
                    value={flightOrigin}
                    onChange={handleFlightOriginChange}
                    label="Origin"
                    disabled={isFlightPlaying}
                    flightOnly={true}
                  />
                  <CountrySelector
                    value={flightDestination}
                    onChange={handleFlightDestinationChange}
                    label="Destination"
                    disabled={isFlightPlaying}
                    flightOnly={true}
                  />
                  <div>
                    <label className="block text-xs font-medium text-ink-600 dark:text-ink-400 uppercase tracking-wide mb-2">
                      Theme
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.values(FLIGHT_THEMES).map((theme) => (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => setFlightTheme(theme.id)}
                          disabled={isFlightPlaying}
                          className={`
                            py-2 px-3 text-xs font-medium rounded-md transition-colors
                            ${
                              flightTheme === theme.id
                                ? "bg-accent-teal text-white"
                                : "bg-cream-200 dark:bg-ink-700 text-ink-600 dark:text-ink-300 hover:bg-cream-300 dark:hover:bg-ink-600"
                            }
                            disabled:opacity-50 disabled:cursor-not-allowed
                          `}
                        >
                          {theme.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-ink-600 dark:text-ink-400 mb-1">
                      Duration: {flightDurationMs / 1000}s
                    </label>
                    <input
                      type="range"
                      min="3000"
                      max="10000"
                      step="500"
                      value={flightDurationMs}
                      onChange={(e) => setFlightDurationMs(Number(e.target.value))}
                      disabled={isFlightPlaying}
                      className="w-full"
                    />
                  </div>
                  <button
                    onClick={handlePlayFlight}
                    disabled={!flightOrigin || !flightDestination || isFlightPlaying}
                    className="w-full py-3 text-sm font-semibold bg-accent-teal text-white rounded-lg hover:bg-accent-teal/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {isFlightPlaying ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Flying...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Play Flight
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleSurpriseMe}
                    disabled={isFlightPlaying}
                    className="w-full py-2 text-sm font-medium bg-cream-200 dark:bg-ink-700 text-ink-600 dark:text-ink-300 rounded-lg hover:bg-cream-300 dark:hover:bg-ink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    Surprise Me
                  </button>
                  
                  {/* Flight Distance & Time Info */}
                  {flightOrigin && flightDestination && (
                    <FlightInfo
                      origin={flightOrigin}
                      destination={flightDestination}
                      className="mt-3"
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case "style":
        return (
          <div className="space-y-5">
            {/* Border Color */}
            <div>
              <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider mb-2">
                Border Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.borderColor}
                  onChange={(e) => setBorderColor(e.target.value)}
                  className="w-12 h-12 rounded-lg cursor-pointer border-2 border-cream-300 dark:border-ink-600 shadow-sm hover:shadow-md transition-shadow"
                />
                <span className="text-sm text-ink-600 dark:text-ink-400 font-mono">
                  {config.borderColor}
                </span>
              </div>
            </div>

            {/* Background Color */}
            <div>
              <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider mb-2">
                Background
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.background.color || "#FEFDFB"}
                  onChange={(e) => setBackground({ type: "solid", color: e.target.value })}
                  className="w-12 h-12 rounded-lg cursor-pointer border-2 border-cream-300 dark:border-ink-600 shadow-sm hover:shadow-md transition-shadow"
                />
                <span className="text-sm text-ink-600 dark:text-ink-400 font-mono">
                  {config.background.color || "#FEFDFB"}
                </span>
              </div>
            </div>

            {/* Quick Style Presets */}
            <div>
              <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider mb-2">
                Quick Styles
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { name: "Light", bg: "#FEFDFB", border: "#C7C7C3" },
                  { name: "Dark", bg: "#1A1A19", border: "#4a5568" },
                  { name: "Ocean", bg: "#F0F4F8", border: "#90CDF4" },
                  { name: "Warm", bg: "#FFFBEB", border: "#D69E2E" },
                ].map((style) => (
                  <button
                    key={style.name}
                    onClick={() => {
                      setBackground({ type: "solid", color: style.bg });
                      setBorderColor(style.border);
                    }}
                    className="p-3.5 rounded-lg border-2 border-cream-300 dark:border-ink-600 text-sm font-semibold transition-all duration-200 hover:border-accent-teal hover:shadow-md active:scale-[0.98]"
                    style={{ backgroundColor: style.bg }}
                  >
                    <span style={{ color: style.name === "Dark" ? "#fff" : "#1A1A19" }}>
                      {style.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Country Labels Toggle */}
            <div>
              <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider mb-2">
                Country Labels
              </label>
              <button
                onClick={() => setShowCountryLabels(!showCountryLabels)}
                className={`w-full py-3 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] ${
                  showCountryLabels
                    ? "bg-accent-teal text-white shadow-sm shadow-accent-teal/20"
                    : "bg-cream-200 dark:bg-ink-700 text-ink-600 dark:text-ink-300 hover:bg-cream-300 dark:hover:bg-ink-600"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                {showCountryLabels ? "Labels On" : "Show Labels"}
              </button>
            </div>
          </div>
        );

      case "export":
        return (
          <div className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider mb-2">
                Export Title (Optional)
              </label>
              <input
                type="text"
                value={config.titleConfig.title}
                onChange={(e) => setTitleConfig({ title: e.target.value })}
                placeholder="My Region Map"
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-ink-800 border border-cream-300 dark:border-ink-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-teal focus:border-accent-teal text-ink-800 dark:text-ink-100 placeholder:text-ink-400 transition-all duration-200"
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider mb-2">
                Subtitle (Optional)
              </label>
              <input
                type="text"
                value={config.titleConfig.subtitle || ""}
                onChange={(e) => setTitleConfig({ subtitle: e.target.value })}
                placeholder="Q4 2024 Coverage"
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-ink-800 border border-cream-300 dark:border-ink-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-teal focus:border-accent-teal text-ink-800 dark:text-ink-100 placeholder:text-ink-400 transition-all duration-200"
              />
            </div>

            {/* Resolution */}
            <div>
              <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider mb-2">
                Resolution
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {([
                  { value: "1080p", label: "1080p", sub: "1920×1080" },
                  { value: "4k", label: "4K", sub: "3840×2160" },
                  { value: "square", label: "Square", sub: "2048×2048" },
                ] as { value: ResolutionOption; label: string; sub: string }[]).map((res) => (
                  <button
                    key={res.value}
                    onClick={() => setResolution(res.value)}
                    className={`py-2.5 rounded-lg transition-all duration-200 active:scale-[0.98] ${
                      config.resolution === res.value
                        ? "bg-accent-teal text-white shadow-sm shadow-accent-teal/20"
                        : "bg-cream-200 dark:bg-ink-700 text-ink-600 dark:text-ink-300 hover:bg-cream-300 dark:hover:bg-ink-600"
                    }`}
                  >
                    <div className="text-xs font-semibold">{res.label}</div>
                    <div className="text-[10px] opacity-70 mt-0.5">{res.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Export Buttons */}
            <div className="space-y-2.5 pt-3">
              <button
                onClick={() => handleExport("png")}
                disabled={isExporting}
                className="w-full py-3.5 text-sm font-semibold bg-accent-teal text-white rounded-lg hover:bg-accent-teal/90 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm shadow-accent-teal/20"
              >
                {isExporting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Exporting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Export PNG
                  </>
                )}
              </button>
              <button
                onClick={() => handleExport("jpg")}
                disabled={isExporting}
                className="w-full py-3.5 text-sm font-semibold bg-ink-700 dark:bg-ink-600 text-white rounded-lg hover:bg-ink-600 dark:hover:bg-ink-500 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Export JPG
              </button>
              <button
                onClick={() => handleExport("svg")}
                disabled={isExporting}
                className="w-full py-3.5 text-sm font-semibold bg-purple-600 dark:bg-purple-500 text-white rounded-lg hover:bg-purple-500 dark:hover:bg-purple-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Export SVG
              </button>
            </div>

            {/* Success Message */}
            {exportSuccess && (
              <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-lg text-sm text-center">
                ✓ Image downloaded successfully!
              </div>
            )}
          </div>
        );
    }
  }, [
    config,
    activeGroupId,
    setMode,
    handlePresetSelect,
    handleClearActiveGroup,
    handleClearAll,
    allSelectedCountries,
    handleAddNeighbors,
    handleSelectContinent,
    handleInverseSelection,
    countryInput,
    countryInputTouched,
    setCountryInput,
    setCountryInputTouched,
    validationErrors,
    groupInputs,
    handleGroupInputChange,
    applyGroupInput,
    applyAllGroupInputs,
    handleAddGroup,
    handleRemoveGroup,
    updateGroup,
    setActiveGroup,
    enableFlightAnimation,
    setEnableFlightAnimation,
    flightOrigin,
    flightDestination,
    handleFlightOriginChange,
    handleFlightDestinationChange,
    flightTheme,
    setFlightTheme,
    flightDurationMs,
    setFlightDurationMs,
    isFlightPlaying,
    handlePlayFlight,
    handleStopFlight,
    handleSurpriseMe,
    setBackground,
    setBorderColor,
    setTitleConfig,
    setResolution,
    showCountryLabels,
    setShowCountryLabels,
    handleExport,
    isExporting,
    exportSuccess,
    mobileTab,
  ]);

  return (
    <div className={`h-screen max-h-screen flex flex-col overflow-hidden ${isDarkMode ? "dark" : ""} ${isDarkMode ? "bg-gradient-dark" : "bg-gradient-to-br from-slate-50 to-blue-50"}`}>
      {/* Header */}
      <header className="flex-shrink-0 border-b border-neon-cyan/20 dark:border-neon-purple/30 bg-white/70 dark:bg-void-900/70 backdrop-blur-xl z-20 shadow-lg dark:shadow-neon-purple">
        <div className="flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-cyber flex items-center justify-center flex-shrink-0 shadow-neon animate-float">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold bg-gradient-to-r from-space-600 to-neon-purple dark:from-neon-cyan dark:to-neon-purple bg-clip-text text-transparent truncate">
                  Region Map Generator
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-gradient-gold text-void-900 shadow-neon-gold">
                  v{packageJson.version}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-void-600 dark:text-neon-cyan/70 truncate font-medium">
                Global Region Map Visualizer • by <span className="text-neon-gold">Fareed Khan</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {/* Zoom controls - desktop only */}
            {!isMobile && (
              <>
                {/* Core Actions - Always Visible */}
                <button
                  onClick={undo}
                  disabled={!canUndo}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/80 dark:bg-void-800/80 backdrop-blur-sm text-space-700 dark:text-neon-cyan border border-space-200 dark:border-neon-cyan/30 hover:border-neon-cyan dark:hover:border-neon-cyan hover:shadow-neon disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
                  title="Undo (Ctrl+Z)"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                </button>
                <button
                  onClick={redo}
                  disabled={!canRedo}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/80 dark:bg-void-800/80 backdrop-blur-sm text-space-700 dark:text-neon-cyan border border-space-200 dark:border-neon-cyan/30 hover:border-neon-cyan dark:hover:border-neon-cyan hover:shadow-neon disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
                  title="Redo (Ctrl+Y)"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
                  </svg>
                </button>
                <button
                  onClick={handleZoomToSelection}
                  disabled={!hasSelection}
                  className="hidden lg:inline-flex px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/80 dark:bg-void-800/80 backdrop-blur-sm text-space-700 dark:text-neon-cyan border border-space-200 dark:border-neon-cyan/30 hover:border-neon-cyan dark:hover:border-neon-cyan hover:shadow-neon disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
                >
                  Zoom to Selection
                </button>
                <button
                  onClick={handleResetZoom}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/80 dark:bg-void-800/80 backdrop-blur-sm text-space-700 dark:text-neon-purple border border-space-200 dark:border-neon-purple/30 hover:border-neon-purple dark:hover:border-neon-purple hover:shadow-neon-purple transition-all duration-300"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowCountryLabels(!showCountryLabels)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg backdrop-blur-sm border transition-all duration-300 ${
                    showCountryLabels
                      ? "bg-gradient-cyber text-white border-neon-cyan shadow-neon"
                      : "bg-white/80 dark:bg-void-800/80 text-space-700 dark:text-neon-emerald border-space-200 dark:border-neon-emerald/30 hover:border-neon-emerald hover:shadow-neon-purple"
                  }`}
                  title="Toggle country name labels"
                >
                  Labels
                </button>
                {/* Random & Fun Features - Hidden on medium screens */}
                <button
                  onClick={randomizeGroupColors}
                  className="hidden xl:inline-flex px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/80 dark:bg-void-800/80 backdrop-blur-sm text-space-700 dark:text-neon-pink border border-space-200 dark:border-neon-pink/30 hover:border-neon-pink dark:hover:border-neon-pink hover:shadow-neon-pink transition-all duration-300"
                  title="Randomize group colors"
                >
                  🎨 Random
                </button>
                <button
                  onClick={colorAllCountries}
                  className="hidden xl:inline-flex px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white border border-purple-400 hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                  title="Color all countries in the world"
                >
                  🌍 All
                </button>
                {/* Save/Load/Share - Hidden on medium screens */}
                <button
                  onClick={handleSaveConfig}
                  className="hidden xl:inline-flex px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/80 dark:bg-void-800/80 backdrop-blur-sm text-space-700 dark:text-neon-cyan border border-space-200 dark:border-neon-cyan/30 hover:border-neon-cyan dark:hover:border-neon-cyan hover:shadow-neon transition-all duration-300"
                  title="Save configuration"
                >
                  💾
                </button>
                <button
                  onClick={handleLoadConfig}
                  className="hidden xl:inline-flex px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/80 dark:bg-void-800/80 backdrop-blur-sm text-space-700 dark:text-neon-cyan border border-space-200 dark:border-neon-cyan/30 hover:border-neon-cyan dark:hover:border-neon-cyan hover:shadow-neon transition-all duration-300"
                  title="Load configuration"
                >
                  📂
                </button>
                <button
                  onClick={handleShareURL}
                  className="hidden xl:inline-flex px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/80 dark:bg-void-800/80 backdrop-blur-sm text-space-700 dark:text-neon-purple border border-space-200 dark:border-neon-purple/30 hover:border-neon-purple dark:hover:border-neon-purple hover:shadow-neon-purple transition-all duration-300"
                  title="Copy share URL"
                >
                  🔗
                </button>
              </>
            )}
            
            {/* Dark mode toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg bg-gradient-gold dark:bg-gradient-cyber text-void-900 dark:text-white shadow-neon-gold dark:shadow-neon hover:scale-110 transition-all duration-300"
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 dark:bg-gradient-dark">
        {/* Desktop: Side Panel */}
        {!isMobile && (
          <aside className="w-64 lg:w-80 xl:w-96 flex-shrink-0 border-r border-neon-cyan/20 dark:border-neon-purple/20 bg-white/40 dark:bg-void-900/40 backdrop-blur-xl overflow-y-auto shadow-glass custom-scrollbar">
            <div className="p-4 space-y-6">
              {/* Mode Toggle */}
              <div>
                <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider mb-2">
                  Selection Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setMode("single")}
                    className={`py-2 text-sm font-medium rounded-lg transition-all ${
                      config.mode === "single"
                        ? "bg-accent-teal text-white"
                        : "bg-cream-200 dark:bg-ink-700 text-ink-600 dark:text-ink-300"
                    }`}
                  >
                    Single Color
                  </button>
                  <button
                    onClick={() => setMode("multi")}
                    className={`py-2 text-sm font-medium rounded-lg transition-all ${
                      config.mode === "multi"
                        ? "bg-accent-teal text-white"
                        : "bg-cream-200 dark:bg-ink-700 text-ink-600 dark:text-ink-300"
                    }`}
                  >
                    Multi-Group
                  </button>
                </div>
              </div>

              {/* Presets */}
              <div>
                <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider mb-2">
                  Region Presets {config.mode === "multi" && (
                    <span className="text-accent-teal normal-case font-normal text-[10px]">
                      → selected group
                    </span>
                  )}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {REGION_PRESETS.slice(0, 10).map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handlePresetSelect(preset.id)}
                      className="px-2.5 py-1 text-xs font-medium rounded-md bg-cream-200 dark:bg-ink-700 text-ink-700 dark:text-ink-200 hover:bg-accent-teal hover:text-white transition-colors"
                      title={preset.description}
                    >
                      {preset.name}
                    </button>
                  ))}
                  {config.mode === "multi" ? (
                    <>
                      <button
                        onClick={handleClearActiveGroup}
                        className="px-2.5 py-1 text-xs font-medium rounded-md bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-500 hover:text-white transition-colors"
                        title="Clear selected group only"
                      >
                        Clear Group
                      </button>
                      <button
                        onClick={handleClearAll}
                        className="px-2.5 py-1 text-xs font-medium rounded-md bg-accent-coral/10 text-accent-coral hover:bg-accent-coral hover:text-white transition-colors"
                        title="Clear all groups"
                      >
                        Clear All
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleClearAll}
                      className="px-2.5 py-1 text-xs font-medium rounded-md bg-accent-coral/10 text-accent-coral hover:bg-accent-coral hover:text-white transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <QuickActions
                selectedCountries={allSelectedCountries}
                onAddNeighbors={handleAddNeighbors}
                onSelectContinent={handleSelectContinent}
                onInverseSelection={handleInverseSelection}
              />

              {/* Single Mode: Simple Country Input */}
              {config.mode === "single" && (
                <div>
                  <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider mb-2">
                    Enter Countries
                  </label>
                  <div className="flex gap-2 items-start">
                    {config.groups.length > 0 && (
                      <input
                        type="color"
                        value={config.groups[0].color}
                        onChange={(e) => updateGroup(config.groups[0].id, { color: e.target.value })}
                        className="w-10 h-10 rounded cursor-pointer flex-shrink-0"
                      />
                    )}
                    <textarea
                      value={countryInputTouched ? countryInput : (config.groups[0]?.countries.join(", ") ?? "")}
                      onChange={(e) => { setCountryInput(e.target.value); setCountryInputTouched(true); }}
                      placeholder="India, UAE, Brazil, FR, DEU..."
                      className="flex-1 h-24 px-3 py-2 text-sm bg-white dark:bg-ink-800 border border-cream-300 dark:border-ink-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-accent-teal text-ink-800 dark:text-ink-100"
                    />
                  </div>
                  {validationErrors.length > 0 && (
                    <p className="mt-1 text-xs text-accent-coral">
                      Not found: {validationErrors.join(", ")}
                    </p>
                  )}
                  <button
                    onClick={handleValidateInput}
                    className="w-full mt-2 py-2 text-sm font-medium bg-accent-teal text-white rounded-lg hover:bg-accent-teal/90 transition-colors"
                  >
                    Generate Map
                  </button>
                </div>
              )}

              {/* Multi-Group Mode: Group Management */}
              {config.mode === "multi" && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider">
                      Groups ({config.groups.length})
                    </label>
                    <button
                      onClick={handleAddGroup}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-accent-teal text-white hover:bg-accent-teal/90 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Group
                    </button>
                  </div>

                  {/* Group List */}
                  <div className="space-y-3">
                    {config.groups.map((group, index) => (
                      <div
                        key={group.id}
                        className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                          activeGroupId === group.id
                            ? "border-accent-teal bg-accent-teal/5"
                            : "border-cream-200 dark:border-ink-700 bg-cream-100 dark:bg-ink-800 hover:border-cream-300"
                        }`}
                        onClick={() => setActiveGroup(group.id)}
                      >
                        {/* Group Header */}
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="color"
                            value={group.color}
                            onChange={(e) => updateGroup(group.id, { color: e.target.value })}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveGroup(group.id);
                            }}
                            className="w-8 h-8 rounded cursor-pointer border border-cream-300 dark:border-ink-600 flex-shrink-0"
                          />
                          <input
                            type="text"
                            value={group.name}
                            onChange={(e) => updateGroup(group.id, { name: e.target.value })}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveGroup(group.id);
                            }}
                            onFocus={() => setActiveGroup(group.id)}
                            placeholder={`Group ${index + 1}`}
                            className="flex-1 px-2 py-1 text-sm font-medium bg-transparent border-b border-cream-300 dark:border-ink-600 focus:border-accent-teal focus:outline-none text-ink-800 dark:text-ink-100"
                          />
                          {config.groups.length > 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveGroup(group.id);
                              }}
                              className="p-1.5 text-ink-400 hover:text-accent-coral hover:bg-accent-coral/10 rounded transition-colors"
                              title="Remove group"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>

                        {/* Pattern selector */}
                        <div className="flex gap-1 mb-2">
                          {(["solid", "stripes", "dots", "crosshatch", "diagonal"] as const).map((patternType) => (
                            <button
                              key={patternType}
                              onClick={(e) => {
                                e.stopPropagation();
                                updateGroup(group.id, { pattern: patternType });
                              }}
                              className={`flex-1 px-2 py-1 text-[10px] font-medium rounded transition-colors ${
                                (group.pattern || "solid") === patternType
                                  ? "bg-accent-teal text-white"
                                  : "bg-cream-100 dark:bg-ink-700 text-ink-600 dark:text-ink-300"
                              }`}
                              title={patternType}
                            >
                              {patternType === "solid" ? "●" : patternType === "stripes" ? "|||" : patternType === "dots" ? "⋮⋮" : patternType === "crosshatch" ? "╬" : "/"}
                            </button>
                          ))}
                        </div>

                        {/* Country Input for this group */}
                        <textarea
                          value={groupInputs[group.id] ?? ""}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleGroupInputChange(group.id, e.target.value);
                          }}
                          onBlur={() => applyGroupInput(group.id)}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveGroup(group.id);
                          }}
                          onFocus={() => setActiveGroup(group.id)}
                          placeholder="e.g., US, UK, France, DE, IT"
                          className="w-full h-20 px-3 py-2 text-sm bg-white dark:bg-ink-900 border border-cream-300 dark:border-ink-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-accent-teal focus:border-accent-teal text-ink-800 dark:text-ink-100 placeholder:text-ink-400 transition-all duration-200"
                        />

                        {/* Country count */}
                        <div className="mt-1.5 text-xs text-ink-500 dark:text-ink-400">
                          {group.countries.length} countries
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Validation errors */}
                  {validationErrors.length > 0 && (
                    <p className="mt-2 text-xs text-accent-coral">
                      Not found: {validationErrors.join(", ")}
                    </p>
                  )}
                </div>
              )}

              {/* Selection Summary */}
              {hasSelection && (
                <div className="p-3 bg-cream-100 dark:bg-ink-800 rounded-lg">
                  <div className="text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider mb-1">
                    Selected
                  </div>
                  <div className="text-sm font-medium text-ink-800 dark:text-ink-200">
                    {allSelectedCountries.length} countries
                  </div>
                  <div className="text-xs text-ink-500 dark:text-ink-400 mt-1">
                    {formatCountryList(allSelectedCountries, 6)}
                  </div>
                </div>
              )}

              <hr className="border-cream-300 dark:border-ink-700" />

              {/* Style Options */}
              <div>
                <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider mb-2">
                  Map Style
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-ink-600 dark:text-ink-400 w-16">Borders</span>
                    <input
                      type="color"
                      value={config.borderColor}
                      onChange={(e) => setBorderColor(e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-ink-600 dark:text-ink-400 w-16">Background</span>
                    <input
                      type="color"
                      value={config.background.color || "#FEFDFB"}
                      onChange={(e) => setBackground({ type: "solid", color: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <hr className="border-cream-300 dark:border-ink-700" />

              {/* Export */}
              <div>
                <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider mb-2">
                  Export Settings
                </label>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={config.titleConfig.title}
                    onChange={(e) => setTitleConfig({ title: e.target.value })}
                    placeholder="Title (optional)"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-ink-800 border border-cream-300 dark:border-ink-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-teal text-ink-800 dark:text-ink-100"
                  />
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["1080p", "4k", "square"] as ResolutionOption[]).map((res) => (
                      <button
                        key={res}
                        onClick={() => setResolution(res)}
                        className={`py-1.5 text-xs font-medium rounded transition-all ${
                          config.resolution === res
                            ? "bg-accent-teal text-white"
                            : "bg-cream-200 dark:bg-ink-700 text-ink-600 dark:text-ink-300"
                        }`}
                      >
                        {res}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleExport("png")}
                      disabled={isExporting}
                      className="py-2.5 text-sm font-semibold bg-accent-teal text-white rounded-lg hover:bg-accent-teal/90 disabled:opacity-50 transition-colors"
                    >
                      {isExporting ? "..." : "PNG"}
                    </button>
                    <button
                      onClick={() => handleExport("jpg")}
                      disabled={isExporting}
                      className="py-2.5 text-sm font-semibold bg-ink-700 text-white rounded-lg hover:bg-ink-600 disabled:opacity-50 transition-colors"
                    >
                      {isExporting ? "..." : "JPG"}
                    </button>
                    <button
                      onClick={() => handleExport("svg")}
                      disabled={isExporting}
                      className="py-2.5 text-sm font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-500 disabled:opacity-50 transition-colors"
                    >
                      {isExporting ? "..." : "SVG"}
                    </button>
                  </div>
                </div>
              </div>

              <hr className="border-cream-300 dark:border-ink-700" />

              {/* Flight Animation */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider">
                    Flight Animation
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableFlightAnimation}
                      onChange={(e) => setEnableFlightAnimation(e.target.checked)}
                      className="w-4 h-4 rounded border-cream-300 dark:border-ink-600 text-accent-teal focus:ring-accent-teal"
                    />
                    <span className="text-xs text-ink-600 dark:text-ink-400">Enable</span>
                  </label>
                </div>

                {enableFlightAnimation && (
                  <div className="space-y-3">
                    <CountrySelector
                      value={flightOrigin}
                      onChange={handleFlightOriginChange}
                      label="Origin"
                      disabled={isFlightPlaying}
                      className="mb-2"
                      flightOnly={true}
                    />
                    <CountrySelector
                      value={flightDestination}
                      onChange={handleFlightDestinationChange}
                      label="Destination"
                      disabled={isFlightPlaying}
                      className="mb-2"
                      flightOnly={true}
                    />
                    <div>
                      <label className="block text-xs font-medium text-ink-600 dark:text-ink-400 uppercase tracking-wide mb-2">
                        Theme
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {Object.values(FLIGHT_THEMES).map((theme) => (
                          <button
                            key={theme.id}
                            type="button"
                            onClick={() => setFlightTheme(theme.id)}
                            disabled={isFlightPlaying}
                            className={`
                              py-2 px-2 text-xs font-medium rounded-md transition-colors
                              ${
                                flightTheme === theme.id
                                  ? "bg-accent-teal text-white"
                                  : "bg-cream-200 dark:bg-ink-700 text-ink-600 dark:text-ink-300 hover:bg-cream-300 dark:hover:bg-ink-600"
                              }
                              disabled:opacity-50 disabled:cursor-not-allowed
                            `}
                          >
                            {theme.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-ink-600 dark:text-ink-400 mb-1">
                        Duration: {flightDurationMs / 1000}s
                      </label>
                      <input
                        type="range"
                        min="3000"
                        max="10000"
                        step="500"
                        value={flightDurationMs}
                        onChange={(e) => setFlightDurationMs(Number(e.target.value))}
                        disabled={isFlightPlaying}
                        className="w-full"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handlePlayFlight}
                        disabled={!flightOrigin || !flightDestination || isFlightPlaying}
                        className="flex-1 py-2.5 text-sm font-semibold bg-accent-teal text-white rounded-lg hover:bg-accent-teal/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                      >
                        {isFlightPlaying ? (
                          <>
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Flying...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Play Flight
                          </>
                        )}
                      </button>
                      {isFlightPlaying && (
                        <button
                          onClick={handleStopFlight}
                          className="px-4 py-2.5 text-sm font-semibold bg-accent-coral text-white rounded-lg hover:bg-accent-coral/90 transition-colors flex items-center justify-center"
                          title="Stop Flight"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <button
                      onClick={handleSurpriseMe}
                      disabled={isFlightPlaying}
                      className="w-full py-2 text-sm font-medium bg-cream-200 dark:bg-ink-700 text-ink-600 dark:text-ink-300 rounded-lg hover:bg-cream-300 dark:hover:bg-ink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      Surprise Me
                    </button>
                    
                    {/* Flight Distance & Time Info */}
                    {flightOrigin && flightDestination && (
                      <FlightInfo
                        origin={flightOrigin}
                        destination={flightDestination}
                        className="mt-3"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </aside>
        )}

        {/* Map Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile: Status bar - hidden in flight mode */}
          {isMobile && !isFlightMode && (
            <div className="flex-shrink-0 px-3 sm:px-4 py-2.5 bg-cream-50/95 dark:bg-ink-900/95 border-b border-cream-200 dark:border-ink-800 flex items-center justify-between safe-area-top">
              <div className="text-xs sm:text-sm text-ink-500 dark:text-ink-400 flex-1 min-w-0">
                {hasSelection ? (
                  <span className="font-medium text-ink-700 dark:text-ink-200 truncate">
                    {allSelectedCountries.length} {allSelectedCountries.length === 1 ? 'country' : 'countries'} selected
                  </span>
                ) : (
                  <span className="truncate">👇 Tap buttons below to start</span>
                )}
              </div>
              <div className="flex gap-2 ml-2 flex-shrink-0">
                <button
                  onClick={handleZoomToSelection}
                  disabled={!hasSelection}
                  className="px-3 py-2 min-h-[36px] text-xs font-medium rounded-lg bg-cream-200 dark:bg-ink-700 text-ink-600 dark:text-ink-300 disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation active:scale-95 transition-transform"
                >
                  Zoom
                </button>
                <button
                  onClick={handleResetZoom}
                  className="px-3 py-2 min-h-[36px] text-xs font-medium rounded-lg bg-cream-200 dark:bg-ink-700 text-ink-600 dark:text-ink-300 touch-manipulation active:scale-95 transition-transform"
                >
                  Reset
                </button>
              </div>
            </div>
          )}

          {/* Map container */}
          <div
            id="map-container"
            className={`flex-1 relative overflow-hidden flex items-center justify-center transition-all duration-300 ${
              isMobile && isFlightMode 
                ? "p-2" 
                : isMobile 
                ? "p-3 sm:p-2" 
                : "p-2 sm:p-4 lg:p-6"
            }`}
          >
            <WorldMap
              ref={mapRef}
              config={config}
              countryColorMap={countryColorMap}
              selectedCountries={allSelectedCountries}
              width={mapDimensions.width}
              height={mapDimensions.height}
              isDarkMode={isDarkMode}
              showLabels={showCountryLabels}
              onCountryClick={handleCountryClick}
              flightOrigin={enableFlightAnimation ? flightOrigin : null}
              flightDestination={enableFlightAnimation ? flightDestination : null}
              isFlightPlaying={isFlightPlaying}
              flightDurationMs={flightDurationMs}
              onFlightComplete={handleFlightComplete}
              onFlightProgress={handleFlightProgress}
              onFlightStop={handleStopFlight}
              flightTheme={flightTheme}
              className="rounded-lg shadow-lg"
            />

            {/* Legend - positioned carefully, hidden in flight mode on mobile */}
            {hasSelection && !(isMobile && isFlightMode) && (
              <Legend
                groups={config.groups}
                mode={config.mode}
                isDarkMode={isDarkMode}
                className={`absolute ${isMobile ? "bottom-2 left-2 text-xs" : "bottom-4 left-4"}`}
              />
            )}

            {/* Mobile Floating Controls - Top Right */}
            {isMobile && !isFlightMode && (
              <div className="absolute top-3 right-3 flex flex-col gap-2.5">
                {/* Zoom Reset */}
                <button
                  onClick={() => mapRef.current?.resetZoom()}
                  className="p-3 min-w-[44px] min-h-[44px] bg-white/95 dark:bg-ink-800/95 backdrop-blur-sm rounded-lg shadow-lg border border-cream-200 dark:border-ink-600 text-ink-600 dark:text-ink-300 active:bg-cream-100 active:scale-95 transition-all touch-manipulation flex items-center justify-center"
                  title="Reset Zoom"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </button>
                
                {/* Labels Toggle */}
                <button
                  onClick={() => setShowCountryLabels(!showCountryLabels)}
                  className={`p-3 min-w-[44px] min-h-[44px] rounded-lg shadow-lg border transition-all touch-manipulation active:scale-95 flex items-center justify-center ${
                    showCountryLabels
                      ? "bg-accent-teal text-white border-accent-teal"
                      : "bg-white/95 dark:bg-ink-800/95 backdrop-blur-sm border-cream-200 dark:border-ink-600 text-ink-600 dark:text-ink-300"
                  }`}
                  title={showCountryLabels ? "Hide Labels" : "Show Labels"}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </button>
              </div>
            )}

            {/* Mobile Flight Mode Controls Overlay */}
            {isMobile && isFlightMode && (
              <div className="absolute inset-0 pointer-events-none z-10">
                {/* Back to Editing Button - Top Left */}
                <div className="absolute top-3 left-3 pointer-events-auto">
                  <button
                    onClick={() => {
                      setIsFlightMode(false);
                      setEnableFlightAnimation(false);
                    }}
                    className="px-4 py-2.5 min-h-[44px] bg-white/95 dark:bg-ink-800/95 backdrop-blur-sm rounded-lg shadow-lg border border-cream-200 dark:border-ink-600 text-ink-700 dark:text-ink-200 text-sm font-medium flex items-center gap-2 active:bg-cream-100 dark:active:bg-ink-700 active:scale-95 transition-all touch-manipulation"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back
                  </button>
                </div>

                {/* Flight Controls - Bottom Center (compact) */}
                <div className="absolute bottom-3 left-3 right-3 pointer-events-auto safe-area-bottom">
                  <div className="bg-white/95 dark:bg-ink-800/95 backdrop-blur-sm rounded-xl shadow-2xl border border-cream-200 dark:border-ink-600 p-4 space-y-3 max-h-[55vh] overflow-y-auto custom-scrollbar touch-pan-y">
                    {/* Origin & Destination - Compact */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-medium text-ink-600 dark:text-ink-400 uppercase tracking-wide mb-1">
                          Origin
                        </label>
                        <CountrySelector
                          value={flightOrigin}
                          onChange={handleFlightOriginChange}
                          placeholder="Origin..."
                          disabled={isFlightPlaying}
                          flightOnly={true}
                          className="text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-ink-600 dark:text-ink-400 uppercase tracking-wide mb-1">
                          Destination
                        </label>
                        <CountrySelector
                          value={flightDestination}
                          onChange={handleFlightDestinationChange}
                          placeholder="Dest..."
                          disabled={isFlightPlaying}
                          flightOnly={true}
                          className="text-xs"
                        />
                      </div>
                    </div>

                    {/* Theme & Duration - Compact Row */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-medium text-ink-600 dark:text-ink-400 uppercase tracking-wide mb-1">
                          Theme
                        </label>
                        <div className="grid grid-cols-3 gap-1">
                          {Object.values(FLIGHT_THEMES).map((theme) => (
                            <button
                              key={theme.id}
                              type="button"
                              onClick={() => setFlightTheme(theme.id)}
                              disabled={isFlightPlaying}
                              className={`
                                py-1 px-1.5 text-[10px] font-medium rounded transition-colors
                                ${
                                  flightTheme === theme.id
                                    ? "bg-accent-teal text-white"
                                    : "bg-cream-200 dark:bg-ink-700 text-ink-600 dark:text-ink-300"
                                }
                                disabled:opacity-50
                              `}
                            >
                              {theme.name}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-ink-600 dark:text-ink-400 uppercase tracking-wide mb-1">
                          Duration: {flightDurationMs / 1000}s
                        </label>
                        <input
                          type="range"
                          min="3000"
                          max="10000"
                          step="500"
                          value={flightDurationMs}
                          onChange={(e) => setFlightDurationMs(Number(e.target.value))}
                          disabled={isFlightPlaying}
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Play/Stop & Surprise Me - Compact */}
                    <div className="flex gap-2">
                      <button
                        onClick={handlePlayFlight}
                        disabled={!flightOrigin || !flightDestination || isFlightPlaying}
                        className="flex-1 py-3 min-h-[44px] text-sm font-semibold bg-accent-teal text-white rounded-lg hover:bg-accent-teal/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 touch-manipulation flex items-center justify-center gap-1.5"
                      >
                        {isFlightPlaying ? (
                          <>
                            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Flying...
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Play
                          </>
                        )}
                      </button>
                      {isFlightPlaying && (
                        <button
                          onClick={handleStopFlight}
                          className="px-4 py-3 min-h-[44px] min-w-[44px] text-sm font-semibold bg-accent-coral text-white rounded-lg hover:bg-accent-coral/90 active:scale-95 transition-all touch-manipulation flex items-center justify-center"
                          title="Stop Flight"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={handleSurpriseMe}
                        disabled={isFlightPlaying}
                        className="px-4 py-3 min-h-[44px] min-w-[44px] text-sm font-medium bg-cream-200 dark:bg-ink-700 text-ink-600 dark:text-ink-300 rounded-lg hover:bg-cream-300 dark:hover:bg-ink-600 disabled:opacity-50 active:scale-95 transition-all touch-manipulation flex items-center justify-center"
                        title="Surprise Me"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      </button>
                    </div>

                    {/* Flight Info - Compact */}
                    {flightOrigin && flightDestination && (
                      <FlightInfo
                        origin={flightOrigin}
                        destination={flightDestination}
                        className="mt-1"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile: Bottom Navigation - hidden in flight mode */}
      {isMobile && !isFlightMode && (
        <>
          {/* Bottom Sheet - positioned above the nav bar */}
          <div
            className={`fixed inset-x-0 z-30 transform transition-transform duration-300 ease-out ${
              showMobilePanel ? "translate-y-0" : "translate-y-full"
            }`}
            style={{ bottom: '64px' }} /* Height of bottom nav */
          >
            {/* Backdrop */}
            {showMobilePanel && (
              <div
                className="fixed inset-0 bg-black/30 -z-10"
                onClick={() => setShowMobilePanel(false)}
              />
            )}
            
            {/* Panel */}
            <div className="bg-cream-50 dark:bg-ink-900 rounded-t-2xl shadow-2xl max-h-[60vh] sm:max-h-[50vh] flex flex-col safe-area-bottom">
              {/* Handle with Close Button */}
              <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
                <div className="flex-1 flex justify-center">
                  <button
                    onClick={() => setShowMobilePanel(false)}
                    className="w-12 h-1.5 bg-cream-400 dark:bg-ink-600 rounded-full cursor-pointer hover:bg-cream-500 dark:hover:bg-ink-500 transition-colors touch-manipulation"
                    aria-label="Close panel"
                  />
                </div>
                <button
                  onClick={() => setShowMobilePanel(false)}
                  className="p-2.5 min-w-[44px] min-h-[44px] rounded-lg hover:bg-cream-200 dark:hover:bg-ink-800 text-ink-500 dark:text-ink-400 transition-colors touch-manipulation flex items-center justify-center"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Tab Header */}
              <div className="flex border-b border-cream-200 dark:border-ink-700 px-2 sm:px-4 flex-shrink-0">
                {([
                  { id: "select", label: "Select", icon: "🌍" },
                  { id: "style", label: "Style", icon: "🎨" },
                  { id: "export", label: "Export", icon: "📤" },
                ] as { id: MobileTab; label: string; icon: string }[]).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setMobileTab(tab.id)}
                    className={`flex-1 py-3.5 min-h-[44px] text-sm font-medium border-b-2 transition-colors touch-manipulation ${
                      mobileTab === tab.id
                        ? "border-accent-teal text-accent-teal"
                        : "border-transparent text-ink-500 dark:text-ink-400"
                    }`}
                  >
                    <span className="mr-1.5">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
              
              {/* Tab Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 pb-2 min-h-0 custom-scrollbar touch-pan-y">
                {renderMobileContent()}
              </div>
              
              {/* Fixed Action Button at Bottom - Always visible in Select and Style tabs */}
              {mobileTab !== "export" && (
                <div className="flex-shrink-0 px-4 py-3 border-t border-cream-200 dark:border-ink-700 bg-cream-50 dark:bg-ink-900">
                  <button
                    onClick={() => {
                      if (config.mode === "multi") {
                        applyAllGroupInputs();
                      } else {
                        handleValidateInput();
                      }
                      setShowMobilePanel(false);
                    }}
                    className="w-full py-3.5 min-h-[48px] text-sm font-semibold bg-accent-teal text-white rounded-xl hover:bg-accent-teal/90 active:scale-98 transition-all shadow-lg flex items-center justify-center gap-2 touch-manipulation"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Generate Map
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Tab Bar - Fixed at bottom */}
          <nav 
            className="fixed bottom-0 left-0 right-0 z-40 bg-cream-50 dark:bg-ink-900 border-t border-cream-300 dark:border-ink-700"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          >
            <div className="flex">
              {([
                { id: "select", label: "Select", icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )},
                { id: "style", label: "Style", icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                )},
                { id: "export", label: "Export", icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                )},
              ] as { id: MobileTab; label: string; icon: JSX.Element }[]).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    // Toggle panel if clicking the same tab that's already open
                    if (showMobilePanel && mobileTab === tab.id) {
                      setShowMobilePanel(false);
                    } else {
                      setMobileTab(tab.id);
                      setShowMobilePanel(true);
                    }
                  }}
                  className={`flex-1 flex flex-col items-center py-3 min-h-[64px] transition-colors active:bg-cream-100 dark:active:bg-ink-800 touch-manipulation ${
                    showMobilePanel && mobileTab === tab.id
                      ? "text-accent-teal"
                      : "text-ink-600 dark:text-ink-400"
                  }`}
                >
                  {tab.icon}
                  <span className="text-xs mt-1 font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </nav>
          
          {/* Spacer for fixed bottom nav */}
          <div className="h-16" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} />
        </>
      )}
    </div>
  );
}
