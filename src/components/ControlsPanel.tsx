"use client";

import React, { useState } from "react";
import type { Mode, Group, CountryCode, TitleConfig, BackgroundConfig, ResolutionOption } from "@/types/map";
import { formatCountryList } from "@/utils/parseCountryInput";
import PresetsBar from "./PresetsBar";
import GroupsPanel from "./GroupsPanel";
import ExportPanel from "./ExportPanel";
import CountrySelector from "./CountrySelector";
import FlightInfo from "./FlightInfo";
import QuickActions from "./QuickActions";
import { FLIGHT_THEMES } from "@/data/flightThemes";

interface ControlsPanelProps {
  // Mode
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  // Groups (for multi mode)
  groups: Group[];
  activeGroupId: string | null;
  onAddGroup: () => void;
  onRemoveGroup: (groupId: string) => void;
  onUpdateGroup: (groupId: string, updates: Partial<Group>) => void;
  onSetGroupCountries: (
    groupId: string,
    input: string
  ) => { valid: CountryCode[]; invalid: string[] };
  onSelectGroup: (groupId: string) => void;
  // Single mode
  singleGroupInput?: string;
  onSingleGroupInputChange?: (input: string) => void;
  onValidateSingleGroup?: () => { valid: CountryCode[]; invalid: string[] };
  // Presets
  onApplyPreset: (presetId: string) => void;
  onClearAll: () => void;
  // Title & Appearance
  titleConfig: TitleConfig;
  background: BackgroundConfig;
  borderColor: string;
  resolution: ResolutionOption;
  onTitleChange: (config: Partial<TitleConfig>) => void;
  onBackgroundChange: (config: Partial<BackgroundConfig>) => void;
  onBorderColorChange: (color: string) => void;
  onResolutionChange: (resolution: ResolutionOption) => void;
  // Export
  onExport: (format: "png" | "jpg") => void;
  isExporting?: boolean;
  // Selection info
  selectedCountries: CountryCode[];
  className?: string;
  // Flight controls
  enableFlightAnimation?: boolean;
  onToggleFlightAnimation?: (enabled: boolean) => void;
  flightOrigin?: CountryCode | null;
  flightDestination?: CountryCode | null;
  onFlightOriginChange?: (code: CountryCode | null) => void;
  onFlightDestinationChange?: (code: CountryCode | null) => void;
  flightTheme?: string;
  onFlightThemeChange?: (theme: string) => void;
  flightDurationMs?: number;
  onFlightDurationChange?: (ms: number) => void;
  isFlightPlaying?: boolean;
  onPlayFlight?: () => void;
  onStopFlight?: () => void;
  onSurpriseMe?: () => void;
  // Quick Actions
  onAddNeighbors?: () => void;
  onSelectContinent?: (continent: string) => void;
  onInverseSelection?: () => void;
}

type Section = "selection" | "appearance" | "export" | "flight";

export default function ControlsPanel({
  mode,
  onModeChange,
  groups,
  activeGroupId,
  onAddGroup,
  onRemoveGroup,
  onUpdateGroup,
  onSetGroupCountries,
  onSelectGroup,
  onApplyPreset,
  onClearAll,
  titleConfig,
  background,
  borderColor,
  resolution,
  onTitleChange,
  onBackgroundChange,
  onBorderColorChange,
  onResolutionChange,
  onExport,
  isExporting = false,
  selectedCountries,
  className = "",
  enableFlightAnimation = false,
  onToggleFlightAnimation,
  flightOrigin,
  flightDestination,
  onFlightOriginChange,
  onFlightDestinationChange,
  flightTheme = "classic",
  onFlightThemeChange,
  flightDurationMs = 5000,
  onFlightDurationChange,
  isFlightPlaying = false,
  onPlayFlight,
  onStopFlight,
  onSurpriseMe,
  onAddNeighbors,
  onSelectContinent,
  onInverseSelection,
}: ControlsPanelProps) {
  const [activeSection, setActiveSection] = useState<Section>("selection");
  const [singleInput, setSingleInput] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Handle single mode validation
  const handleSingleValidate = () => {
    if (groups.length > 0) {
      const result = onSetGroupCountries(groups[0].id, singleInput);
      if (result.invalid.length > 0) {
        setValidationErrors(result.invalid);
      } else {
        setValidationErrors([]);
      }
      setSingleInput("");
    }
  };

  const sections: { id: Section; label: string; icon: JSX.Element }[] = [
    {
      id: "selection",
      label: "Countries",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: "appearance",
      label: "Style",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
    },
    {
      id: "flight",
      label: "Flight",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      ),
    },
    {
      id: "export",
      label: "Export",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      ),
    },
  ];

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Section Tabs */}
      <div className="flex border-b border-cream-300 dark:border-ink-700">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => setActiveSection(section.id)}
            className={`
              flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium
              transition-colors border-b-2 -mb-px
              ${
                activeSection === section.id
                  ? "border-accent-teal text-accent-teal"
                  : "border-transparent text-ink-500 dark:text-ink-400 hover:text-ink-700 dark:hover:text-ink-200"
              }
            `}
          >
            {section.icon}
            <span className="hidden sm:inline">{section.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 custom-scrollbar">
        {/* Selection Section */}
        {activeSection === "selection" && (
          <div className="space-y-5">
            {/* Mode Toggle */}
            <div className="space-y-2.5">
              <label className="block text-xs font-semibold text-ink-600 dark:text-ink-400 uppercase tracking-wider mb-2">
                Selection Mode
              </label>
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => onModeChange("single")}
                  className={`
                    flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                    ${
                      mode === "single"
                        ? "bg-accent-teal text-white shadow-md shadow-accent-teal/20"
                        : "bg-cream-200 dark:bg-ink-700 text-ink-600 dark:text-ink-300 hover:bg-cream-300 dark:hover:bg-ink-600 active:scale-[0.98]"
                    }
                  `}
                >
                  Single Color
                </button>
                <button
                  type="button"
                  onClick={() => onModeChange("multi")}
                  className={`
                    flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                    ${
                      mode === "multi"
                        ? "bg-accent-teal text-white shadow-md shadow-accent-teal/20"
                        : "bg-cream-200 dark:bg-ink-700 text-ink-600 dark:text-ink-300 hover:bg-cream-300 dark:hover:bg-ink-600 active:scale-[0.98]"
                    }
                  `}
                >
                  Multi-Group
                </button>
              </div>
            </div>

            {/* Presets */}
            <PresetsBar onSelectPreset={onApplyPreset} onClear={onClearAll} />

            {/* Quick Actions */}
            {onAddNeighbors && onSelectContinent && onInverseSelection && (
              <QuickActions
                selectedCountries={selectedCountries}
                onAddNeighbors={onAddNeighbors}
                onSelectContinent={onSelectContinent}
                onInverseSelection={onInverseSelection}
              />
            )}

            {/* Single Mode Input */}
            {mode === "single" && groups.length > 0 && (
              <div className="space-y-2.5">
                <label className="block text-xs font-semibold text-ink-600 dark:text-ink-400 uppercase tracking-wider mb-2">
                  Enter Countries
                </label>
                <p className="text-xs text-ink-500 dark:text-ink-400 mb-2">
                  Type country names, ISO codes, or common aliases (comma or line separated)
                </p>
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex-shrink-0 mt-1 shadow-sm border border-cream-300 dark:border-ink-600"
                    style={{ backgroundColor: groups[0].color }}
                  />
                  <div className="flex-1 space-y-2.5">
                    <textarea
                      value={singleInput || groups[0].countries.join(", ")}
                      onChange={(e) => setSingleInput(e.target.value)}
                      placeholder="e.g., India, UAE, Brazil, FR, DEU"
                      className="
                        w-full h-32 px-3.5 py-2.5 text-sm
                        bg-white dark:bg-ink-900
                        border border-cream-300 dark:border-ink-600
                        rounded-lg resize-none
                        focus:outline-none focus:ring-2 focus:ring-accent-teal focus:border-accent-teal
                        text-ink-800 dark:text-ink-100
                        placeholder:text-ink-400
                        transition-all duration-200
                      "
                    />
                    {validationErrors.length > 0 && (
                      <div className="text-xs text-accent-coral font-medium px-2 py-1.5 bg-accent-coral/10 dark:bg-accent-coral/20 rounded-md">
                        Not recognized: {validationErrors.join(", ")}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={handleSingleValidate}
                      className="
                        w-full py-2.5 text-sm font-semibold
                        bg-accent-teal text-white rounded-lg
                        hover:bg-accent-teal/90 active:scale-[0.98] transition-all duration-200
                        focus:outline-none focus:ring-2 focus:ring-accent-teal focus:ring-offset-2
                        shadow-sm shadow-accent-teal/20
                      "
                    >
                      Generate Map
                    </button>
                  </div>
                  <input
                    type="color"
                    value={groups[0].color}
                    onChange={(e) =>
                      onUpdateGroup(groups[0].id, { color: e.target.value })
                    }
                    className="w-10 h-10 rounded-lg cursor-pointer border-2 border-cream-300 dark:border-ink-600 flex-shrink-0 mt-1 shadow-sm hover:shadow-md transition-shadow"
                    title="Pick highlight color"
                  />
                </div>
              </div>
            )}

            {/* Multi Mode Groups */}
            {mode === "multi" && (
              <GroupsPanel
                groups={groups}
                activeGroupId={activeGroupId}
                onAddGroup={onAddGroup}
                onRemoveGroup={onRemoveGroup}
                onUpdateGroup={onUpdateGroup}
                onSetGroupCountries={onSetGroupCountries}
                onSelectGroup={onSelectGroup}
              />
            )}

            {/* Selection summary */}
            {selectedCountries.length > 0 && (
              <div className="p-4 bg-cream-100 dark:bg-ink-800 rounded-lg border border-cream-200 dark:border-ink-700">
                <div className="text-xs font-semibold text-ink-600 dark:text-ink-400 uppercase tracking-wider mb-2">
                  Total Selected
                </div>
                <div className="text-base font-semibold text-ink-800 dark:text-ink-200 mb-1.5">
                  {selectedCountries.length} {selectedCountries.length === 1 ? 'country' : 'countries'}
                </div>
                <div className="text-xs text-ink-500 dark:text-ink-400 leading-relaxed">
                  {formatCountryList(selectedCountries, 6)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Appearance Section */}
        {activeSection === "appearance" && (
          <div className="space-y-5">
            {/* Border Color */}
            <div className="space-y-2.5">
              <label className="block text-xs font-semibold text-ink-600 dark:text-ink-400 uppercase tracking-wider mb-2">
                Country Borders
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={borderColor}
                  onChange={(e) => onBorderColorChange(e.target.value)}
                  className="w-12 h-12 rounded-lg cursor-pointer border-2 border-cream-300 dark:border-ink-600 shadow-sm hover:shadow-md transition-shadow"
                />
                <span className="text-sm font-mono text-ink-600 dark:text-ink-400">
                  {borderColor}
                </span>
              </div>
            </div>

            {/* Background for preview */}
            <div className="space-y-2.5">
              <label className="block text-xs font-semibold text-ink-600 dark:text-ink-400 uppercase tracking-wider mb-2">
                Map Background
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={background.color ?? "#FEFDFB"}
                  onChange={(e) =>
                    onBackgroundChange({ type: "solid", color: e.target.value })
                  }
                  className="w-12 h-12 rounded-lg cursor-pointer border-2 border-cream-300 dark:border-ink-600 shadow-sm hover:shadow-md transition-shadow"
                />
                <span className="text-sm font-mono text-ink-600 dark:text-ink-400">
                  {background.color ?? "#FEFDFB"}
                </span>
              </div>
            </div>

            {/* Color presets for quick styling */}
            <div className="space-y-2.5">
              <label className="block text-xs font-semibold text-ink-600 dark:text-ink-400 uppercase tracking-wider mb-2">
                Quick Styles
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { bg: "#FEFDFB", border: "#C7C7C3", name: "Light" },
                  { bg: "#1A1A19", border: "#4a5568", name: "Dark" },
                  { bg: "#F0F4F8", border: "#90CDF4", name: "Ocean" },
                  { bg: "#FFFBEB", border: "#D69E2E", name: "Warm" },
                ].map((style) => (
                  <button
                    key={style.name}
                    type="button"
                    onClick={() => {
                      onBackgroundChange({ type: "solid", color: style.bg });
                      onBorderColorChange(style.border);
                    }}
                    className="
                      p-3 rounded-lg border-2 border-cream-300 dark:border-ink-600
                      hover:border-accent-teal hover:shadow-md active:scale-[0.98] transition-all duration-200
                      text-xs font-semibold text-ink-600 dark:text-ink-400
                    "
                    style={{ backgroundColor: style.bg }}
                  >
                    <span style={{ color: style.border === "#4a5568" ? "#fff" : "#333" }}>
                      {style.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Flight Section */}
        {activeSection === "flight" && (
          <div className="space-y-4">
            {/* Enable Flight Animation Toggle */}
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={enableFlightAnimation}
                  onChange={(e) => onToggleFlightAnimation?.(e.target.checked)}
                  className="w-4 h-4 rounded border-cream-300 dark:border-ink-600 text-accent-teal focus:ring-accent-teal"
                />
                <span className="text-xs font-medium text-ink-600 dark:text-ink-400 uppercase tracking-wide">
                  Enable Flight Animation
                </span>
              </label>
            </div>

            {enableFlightAnimation && (
              <>
                {/* Origin Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-ink-600 dark:text-ink-400 uppercase tracking-wide">
                    Origin
                  </label>
                  <CountrySelector
                    value={flightOrigin || null}
                    onChange={onFlightOriginChange || (() => {})}
                    placeholder="Select origin country..."
                    disabled={isFlightPlaying}
                    flightOnly={true}
                  />
                </div>

                {/* Destination Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-ink-600 dark:text-ink-400 uppercase tracking-wide">
                    Destination
                  </label>
                  <CountrySelector
                    value={flightDestination || null}
                    onChange={onFlightDestinationChange || (() => {})}
                    placeholder="Select destination country..."
                    disabled={isFlightPlaying}
                    flightOnly={true}
                  />
                </div>

                {/* Theme Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-ink-600 dark:text-ink-400 uppercase tracking-wide">
                    Theme
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.values(FLIGHT_THEMES).map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => onFlightThemeChange?.(theme.id)}
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

                {/* Duration Slider */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-ink-600 dark:text-ink-400 uppercase tracking-wide">
                    Duration: {flightDurationMs ? flightDurationMs / 1000 : 5}s
                  </label>
                  <input
                    type="range"
                    min="3000"
                    max="10000"
                    step="500"
                    value={flightDurationMs || 5000}
                    onChange={(e) => onFlightDurationChange?.(Number(e.target.value))}
                    disabled={isFlightPlaying}
                    className="w-full"
                  />
                </div>

                {/* Play Flight Button */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onPlayFlight}
                    disabled={!flightOrigin || !flightDestination || isFlightPlaying}
                    className="
                      flex-1 py-3 text-sm font-semibold bg-accent-teal text-white rounded-lg
                      hover:bg-accent-teal/90 disabled:opacity-50 disabled:cursor-not-allowed
                      transition-colors flex items-center justify-center gap-2
                    "
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
                  {isFlightPlaying && onStopFlight && (
                    <button
                      type="button"
                      onClick={onStopFlight}
                      className="
                        px-4 py-3 text-sm font-semibold bg-accent-coral text-white rounded-lg
                        hover:bg-accent-coral/90 transition-colors flex items-center justify-center
                      "
                      title="Stop Flight"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Surprise Me Button */}
                <button
                  type="button"
                  onClick={onSurpriseMe}
                  disabled={isFlightPlaying}
                  className="
                    w-full py-2 text-sm font-medium bg-cream-200 dark:bg-ink-700
                    text-ink-600 dark:text-ink-300 rounded-lg
                    hover:bg-cream-300 dark:hover:bg-ink-600 disabled:opacity-50
                    disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2
                  "
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
              </>
            )}
          </div>
        )}

        {/* Export Section */}
        {activeSection === "export" && (
          <ExportPanel
            resolution={resolution}
            background={background}
            titleConfig={titleConfig}
            onResolutionChange={onResolutionChange}
            onBackgroundChange={onBackgroundChange}
            onTitleChange={onTitleChange}
            onExport={onExport}
            isExporting={isExporting}
          />
        )}
      </div>
    </div>
  );
}
