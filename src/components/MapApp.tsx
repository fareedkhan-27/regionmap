"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import WorldMap, { type WorldMapHandle } from "./WorldMap";
import Legend from "./Legend";
import { useMapConfig } from "@/hooks/useMapConfig";
import { exportMapAsImage } from "@/utils/exportImage";
import { REGION_PRESETS } from "@/data/regionPresets";
import { formatCountryList, parseCountryInput } from "@/utils/parseCountryInput";
import type { ResolutionOption } from "@/types/map";

type MobileTab = "select" | "style" | "export";

export default function MapApp() {
  const mapRef = useRef<WorldMapHandle>(null);
  const {
    config,
    setMode,
    addGroup,
    removeGroup,
    updateGroup,
    setGroupCountriesFromInput,
    setActiveGroup,
    activeGroupId,
    applyPreset,
    clearAllCountries,
    setTitleConfig,
    setBackground,
    setBorderColor,
    setResolution,
    allSelectedCountries,
    countryColorMap,
    hasSelection,
  } = useMapConfig();

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobilePanel, setShowMobilePanel] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("select");
  const [mapDimensions, setMapDimensions] = useState({ width: 960, height: 540 });
  
  // Input states
  const [countryInput, setCountryInput] = useState("");
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

  // Handle country input validation
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

  // Preset selection
  const handlePresetSelect = (presetId: string) => {
    applyPreset(presetId);
    if (isMobile) {
      setShowMobilePanel(false);
    }
  };

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
                Quick Presets
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
                <button
                  onClick={clearAllCountries}
                  className="px-3 py-1.5 text-xs font-medium rounded-full bg-accent-coral/10 text-accent-coral hover:bg-accent-coral hover:text-white transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Country Input */}
            <div>
              <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider mb-2">
                Enter Countries
              </label>
              <div className="flex gap-2">
                {config.groups.length > 0 && (
                  <div
                    className="w-10 h-10 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: config.groups[0].color }}
                  />
                )}
                <div className="flex-1">
                  <textarea
                    value={countryInput || (config.groups[0]?.countries.join(", ") ?? "")}
                    onChange={(e) => setCountryInput(e.target.value)}
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
              <button
                onClick={handleValidateInput}
                className="w-full mt-3 py-3 text-sm font-semibold bg-accent-teal text-white rounded-lg hover:bg-accent-teal/90 transition-colors"
              >
                Generate Map
              </button>
            </div>

            {/* Color Picker for Single Mode */}
            {config.mode === "single" && config.groups.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider mb-2">
                  Highlight Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={config.groups[0].color}
                    onChange={(e) => updateGroup(config.groups[0].id, { color: e.target.value })}
                    className="w-12 h-12 rounded-lg cursor-pointer border-2 border-cream-300 dark:border-ink-600"
                  />
                  <span className="text-sm text-ink-600 dark:text-ink-400 font-mono">
                    {config.groups[0].color}
                  </span>
                </div>
              </div>
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
    <div className={`h-screen flex flex-col overflow-hidden ${isDarkMode ? "dark" : ""}`}>
      {/* Header */}
      <header className="flex-shrink-0 border-b border-cream-300 dark:border-ink-700 bg-cream-50 dark:bg-ink-900 z-20">
        <div className="flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-teal flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-semibold text-ink-900 dark:text-ink-50 truncate">
                Region Map Generator
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Zoom controls - desktop only */}
            {!isMobile && (
              <>
                <button
                  onClick={handleZoomToSelection}
                  disabled={!hasSelection}
                  className="px-2.5 py-1.5 text-xs font-medium rounded-md bg-cream-200 dark:bg-ink-700 text-ink-600 dark:text-ink-300 hover:bg-cream-300 dark:hover:bg-ink-600 disabled:opacity-50 transition-colors"
                >
                  Zoom to Selection
                </button>
                <button
                  onClick={handleResetZoom}
                  className="px-2.5 py-1.5 text-xs font-medium rounded-md bg-cream-200 dark:bg-ink-700 text-ink-600 dark:text-ink-300 hover:bg-cream-300 dark:hover:bg-ink-600 transition-colors"
                >
                  Reset
                </button>
              </>
            )}
            
            {/* Dark mode toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg bg-cream-200 dark:bg-ink-700 text-ink-600 dark:text-ink-300 hover:bg-cream-300 dark:hover:bg-ink-600 transition-colors"
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
      <main className="flex-1 flex overflow-hidden bg-cream-100 dark:bg-ink-950">
        {/* Desktop: Side Panel */}
        {!isMobile && (
          <aside className="w-80 flex-shrink-0 border-r border-cream-300 dark:border-ink-700 bg-cream-50 dark:bg-ink-900 overflow-y-auto">
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
                  Region Presets
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
                  <button
                    onClick={clearAllCountries}
                    className="px-2.5 py-1 text-xs font-medium rounded-md bg-accent-coral/10 text-accent-coral hover:bg-accent-coral hover:text-white transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Country Input */}
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
                    value={countryInput || (config.groups[0]?.countries.join(", ") ?? "")}
                    onChange={(e) => setCountryInput(e.target.value)}
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
                    {allSelectedCountries.length} countries
                  </span>
                ) : (
                  "Tap menu to select countries"
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
          </div>
        </div>
      </main>

      {/* Mobile: Bottom Navigation */}
      {isMobile && (
        <>
          {/* Bottom Sheet */}
          <div
            className={`fixed inset-x-0 bottom-0 z-30 transform transition-transform duration-300 ease-out ${
              showMobilePanel ? "translate-y-0" : "translate-y-full"
            }`}
          >
            {/* Backdrop */}
            {showMobilePanel && (
              <div
                className="fixed inset-0 bg-black/30 -z-10"
                onClick={() => setShowMobilePanel(false)}
              />
            )}
            
            {/* Panel */}
            <div className="bg-cream-50 dark:bg-ink-900 rounded-t-2xl shadow-2xl max-h-[70vh] flex flex-col">
              {/* Handle */}
              <div className="flex justify-center py-2">
                <div className="w-10 h-1 bg-cream-400 dark:bg-ink-600 rounded-full" />
              </div>
              
              {/* Tab Header */}
              <div className="flex border-b border-cream-200 dark:border-ink-700 px-4">
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
              
              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-4 pb-6">
                {renderMobileContent()}
              </div>
            </div>
          </div>

          {/* Bottom Tab Bar */}
          <nav className="flex-shrink-0 bg-cream-50 dark:bg-ink-900 border-t border-cream-300 dark:border-ink-700 safe-area-bottom">
            <div className="flex">
              {([
                { id: "select", label: "Select", icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )},
                { id: "style", label: "Style", icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                )},
                { id: "export", label: "Export", icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                )},
              ] as { id: MobileTab; label: string; icon: JSX.Element }[]).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setMobileTab(tab.id);
                    setShowMobilePanel(true);
                  }}
                  className={`flex-1 flex flex-col items-center py-2 transition-colors ${
                    showMobilePanel && mobileTab === tab.id
                      ? "text-accent-teal"
                      : "text-ink-500 dark:text-ink-400"
                  }`}
                >
                  {tab.icon}
                  <span className="text-[10px] mt-0.5 font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
