"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import WorldMap, { type WorldMapHandle } from "./WorldMap";
import Legend from "./Legend";
import { useMapConfig } from "@/hooks/useMapConfig";
import { exportMapAsImage } from "@/utils/exportImage";
import { REGION_PRESETS } from "@/data/regionPresets";
import { formatCountryList, parseCountryInput } from "@/utils/parseCountryInput";
import type { ResolutionOption } from "@/types/map";
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
    setGroupCountriesFromInput,
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
  
  // Input states - LOCAL state, completely managed here
  const [countryInput, setCountryInput] = useState("");
  const [countryInputTouched, setCountryInputTouched] = useState(false);
  const [groupInputs, setGroupInputs] = useState<Record<string, string>>({ "group-1": "" });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Update map dimensions based on container
  useEffect(() => {
    const updateDimensions = () => {
      const container = document.getElementById("map-container");
      if (container) {
        const rect = container.getBoundingClientRect();
        const padding = isMobile ? 16 : 32;
        const width = Math.max(rect.width - padding, 300);
        const height = Math.max(rect.height - padding, 200);
        setMapDimensions({ width, height });
      }
    };
    
    // Delay to ensure container is rendered
    const timer = setTimeout(updateDimensions, 100);
    window.addEventListener("resize", updateDimensions);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateDimensions);
    };
  }, [isMobile, showMobilePanel]);

  // Dark mode toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

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
    async (format: "png" | "jpg") => {
      const svg = mapRef.current?.getSvgElement();
      if (!svg) return;

      setIsExporting(true);
      setExportSuccess(false);
      
      try {
        await exportMapAsImage(svg, {
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
        });
        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 3000);
      } catch (err) {
        console.error("Export failed:", err);
        alert("Failed to export image. Please try again.");
      } finally {
        setIsExporting(false);
      }
    },
    [config]
  );

  // Zoom controls
  const handleZoomToSelection = () => mapRef.current?.zoomToSelection();
  const handleResetZoom = () => mapRef.current?.resetZoom();

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

  // Mobile bottom sheet content
  const renderMobileContent = () => {
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
              <div className="flex flex-wrap gap-2">
                {REGION_PRESETS.slice(0, 8).map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset.id)}
                    className="px-3 py-1.5 text-xs font-medium rounded-full bg-cream-200 dark:bg-ink-700 text-ink-700 dark:text-ink-200 hover:bg-accent-teal hover:text-white transition-colors"
                  >
                    {preset.name}
                  </button>
                ))}
                {config.mode === "multi" ? (
                  <>
                    <button
                      onClick={handleClearActiveGroup}
                      className="px-3 py-1.5 text-xs font-medium rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-500 hover:text-white transition-colors"
                    >
                      Clear Group
                    </button>
                    <button
                      onClick={handleClearAll}
                      className="px-3 py-1.5 text-xs font-medium rounded-full bg-accent-coral/10 text-accent-coral hover:bg-accent-coral hover:text-white transition-colors"
                    >
                      Clear All
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleClearAll}
                    className="px-3 py-1.5 text-xs font-medium rounded-full bg-accent-coral/10 text-accent-coral hover:bg-accent-coral hover:text-white transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Single Mode: Simple Input */}
            {config.mode === "single" && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider mb-2">
                    Enter Countries
                  </label>
                  <div className="flex gap-2">
                    {config.groups.length > 0 && (
                      <input
                        type="color"
                        value={config.groups[0].color}
                        onChange={(e) => updateGroup(config.groups[0].id, { color: e.target.value })}
                        className="w-12 h-12 rounded-lg cursor-pointer border-2 border-cream-300 dark:border-ink-600 flex-shrink-0"
                      />
                    )}
                    <div className="flex-1">
                      <textarea
                        value={countryInputTouched ? countryInput : (config.groups[0]?.countries.join(", ") ?? "")}
                        onChange={(e) => { setCountryInput(e.target.value); setCountryInputTouched(true); }}
                        placeholder="India, UAE, Brazil, FR..."
                        className="w-full h-20 px-3 py-2 text-sm bg-white dark:bg-ink-800 border border-cream-300 dark:border-ink-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-accent-teal text-ink-800 dark:text-ink-100"
                      />
                    </div>
                  </div>
                  {validationErrors.length > 0 && (
                    <p className="mt-1 text-xs text-accent-coral">
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
                          placeholder="Enter countries: US, UK, France..."
                          className="w-full h-16 px-2 py-1.5 text-xs bg-white dark:bg-ink-900 border border-cream-300 dark:border-ink-600 rounded resize-none focus:outline-none focus:ring-1 focus:ring-accent-teal text-ink-700 dark:text-ink-200"
                        />
                        
                        {/* Country count */}
                        <div className="mt-1.5 text-xs text-ink-500 dark:text-ink-400">
                          {group.countries.length} countries
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case "style":
        return (
          <div className="space-y-4">
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
                  className="w-12 h-12 rounded-lg cursor-pointer border-2 border-cream-300 dark:border-ink-600"
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
                  className="w-12 h-12 rounded-lg cursor-pointer border-2 border-cream-300 dark:border-ink-600"
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
              <div className="grid grid-cols-2 gap-2">
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
                    className="p-3 rounded-lg border-2 border-cream-300 dark:border-ink-600 text-sm font-medium transition-colors hover:border-accent-teal"
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
                className={`w-full py-3 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  showCountryLabels
                    ? "bg-accent-teal text-white"
                    : "bg-cream-200 dark:bg-ink-700 text-ink-600 dark:text-ink-300"
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
          <div className="space-y-4">
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
                className="w-full px-3 py-2.5 text-sm bg-white dark:bg-ink-800 border border-cream-300 dark:border-ink-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-teal text-ink-800 dark:text-ink-100"
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
                className="w-full px-3 py-2.5 text-sm bg-white dark:bg-ink-800 border border-cream-300 dark:border-ink-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-teal text-ink-800 dark:text-ink-100"
              />
            </div>

            {/* Resolution */}
            <div>
              <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider mb-2">
                Resolution
              </label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { value: "1080p", label: "1080p", sub: "1920×1080" },
                  { value: "4k", label: "4K", sub: "3840×2160" },
                  { value: "square", label: "Square", sub: "2048×2048" },
                ] as { value: ResolutionOption; label: string; sub: string }[]).map((res) => (
                  <button
                    key={res.value}
                    onClick={() => setResolution(res.value)}
                    className={`py-2.5 rounded-lg transition-all ${
                      config.resolution === res.value
                        ? "bg-accent-teal text-white shadow-md"
                        : "bg-cream-200 dark:bg-ink-700 text-ink-600 dark:text-ink-300"
                    }`}
                  >
                    <div className="text-sm font-medium">{res.label}</div>
                    <div className="text-[10px] opacity-70">{res.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Export Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleExport("png")}
                disabled={isExporting}
                className="w-full py-3.5 text-sm font-semibold bg-accent-teal text-white rounded-lg hover:bg-accent-teal/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
                className="w-full py-3.5 text-sm font-semibold bg-ink-700 dark:bg-ink-600 text-white rounded-lg hover:bg-ink-600 dark:hover:bg-ink-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Export JPG
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
  };

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${isDarkMode ? "dark" : ""} ${isDarkMode ? "bg-gradient-dark" : "bg-gradient-to-br from-slate-50 to-blue-50"}`}>
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

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Zoom controls - desktop only */}
            {!isMobile && (
              <>
                <button
                  onClick={handleZoomToSelection}
                  disabled={!hasSelection}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/80 dark:bg-void-800/80 backdrop-blur-sm text-space-700 dark:text-neon-cyan border border-space-200 dark:border-neon-cyan/30 hover:border-neon-cyan dark:hover:border-neon-cyan hover:shadow-neon disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
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
          <aside className="w-80 flex-shrink-0 border-r border-neon-cyan/20 dark:border-neon-purple/20 bg-white/40 dark:bg-void-900/40 backdrop-blur-xl overflow-y-auto shadow-glass">
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
                          placeholder="Enter countries: US, UK, France..."
                          className="w-full h-16 px-2 py-1.5 text-xs bg-white dark:bg-ink-900 border border-cream-300 dark:border-ink-600 rounded resize-none focus:outline-none focus:ring-1 focus:ring-accent-teal text-ink-700 dark:text-ink-200"
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
                  <div className="grid grid-cols-2 gap-2">
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
                  </div>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Map Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile: Status bar */}
          {isMobile && (
            <div className="flex-shrink-0 px-3 py-2 bg-cream-50/95 dark:bg-ink-900/95 border-b border-cream-200 dark:border-ink-800 flex items-center justify-between">
              <div className="text-xs text-ink-500 dark:text-ink-400">
                {hasSelection ? (
                  <span className="font-medium text-ink-700 dark:text-ink-200">
                    {allSelectedCountries.length} countries selected
                  </span>
                ) : (
                  <span>👇 Tap buttons below to start</span>
                )}
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={handleZoomToSelection}
                  disabled={!hasSelection}
                  className="px-2 py-1 text-[10px] font-medium rounded bg-cream-200 dark:bg-ink-700 text-ink-600 dark:text-ink-300 disabled:opacity-40"
                >
                  Zoom
                </button>
                <button
                  onClick={handleResetZoom}
                  className="px-2 py-1 text-[10px] font-medium rounded bg-cream-200 dark:bg-ink-700 text-ink-600 dark:text-ink-300"
                >
                  Reset
                </button>
              </div>
            </div>
          )}

          {/* Map container */}
          <div
            id="map-container"
            className={`flex-1 relative overflow-hidden flex items-center justify-center ${
              isMobile ? "p-2" : "p-4"
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
              className="rounded-lg shadow-lg"
            />

            {/* Legend - positioned carefully */}
            {hasSelection && (
              <Legend
                groups={config.groups}
                mode={config.mode}
                isDarkMode={isDarkMode}
                className={`absolute ${isMobile ? "bottom-2 left-2 text-xs" : "bottom-4 left-4"}`}
              />
            )}

            {/* Mobile Floating Controls - Top Right */}
            {isMobile && (
              <div className="absolute top-2 right-2 flex flex-col gap-2">
                {/* Zoom Reset */}
                <button
                  onClick={() => mapRef.current?.resetZoom()}
                  className="p-2.5 bg-white dark:bg-ink-800 rounded-lg shadow-lg border border-cream-200 dark:border-ink-600 text-ink-600 dark:text-ink-300 hover:bg-cream-100 active:bg-cream-200"
                  title="Reset Zoom"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </button>
                
                {/* Labels Toggle */}
                <button
                  onClick={() => setShowCountryLabels(!showCountryLabels)}
                  className={`p-2.5 rounded-lg shadow-lg border transition-colors ${
                    showCountryLabels
                      ? "bg-accent-teal text-white border-accent-teal"
                      : "bg-white dark:bg-ink-800 border-cream-200 dark:border-ink-600 text-ink-600 dark:text-ink-300"
                  }`}
                  title={showCountryLabels ? "Hide Labels" : "Show Labels"}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile: Bottom Navigation */}
      {isMobile && (
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
            <div className="bg-cream-50 dark:bg-ink-900 rounded-t-2xl shadow-2xl max-h-[45vh] flex flex-col">
              {/* Handle with Close Button */}
              <div className="flex items-center justify-between px-4 py-2 flex-shrink-0">
                <div className="flex-1 flex justify-center">
                  <button
                    onClick={() => setShowMobilePanel(false)}
                    className="w-10 h-1 bg-cream-400 dark:bg-ink-600 rounded-full cursor-pointer hover:bg-cream-500 dark:hover:bg-ink-500 transition-colors"
                    aria-label="Close panel"
                  />
                </div>
                <button
                  onClick={() => setShowMobilePanel(false)}
                  className="p-1.5 rounded-lg hover:bg-cream-200 dark:hover:bg-ink-800 text-ink-500 dark:text-ink-400 transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Tab Header */}
              <div className="flex border-b border-cream-200 dark:border-ink-700 px-4 flex-shrink-0">
                {([
                  { id: "select", label: "Select", icon: "🌍" },
                  { id: "style", label: "Style", icon: "🎨" },
                  { id: "export", label: "Export", icon: "📤" },
                ] as { id: MobileTab; label: string; icon: string }[]).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setMobileTab(tab.id)}
                    className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
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
              <div className="flex-1 overflow-y-auto p-4 pb-2 min-h-0">
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
                    className="w-full py-3 text-sm font-semibold bg-accent-teal text-white rounded-xl hover:bg-accent-teal/90 transition-colors shadow-lg flex items-center justify-center gap-2"
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
                  className={`flex-1 flex flex-col items-center py-3 transition-colors active:bg-cream-100 dark:active:bg-ink-800 ${
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
