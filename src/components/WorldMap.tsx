"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle,
  lazy,
  Suspense,
} from "react";
import * as d3 from "d3";
import type { FeatureCollection, Feature, Geometry } from "geojson";
import {
  createProjection,
  createPathGenerator,
  calculateBoundingBox,
  calculateZoomTransform,
  getISO2FromFeatureId,
  createGraticule,
} from "@/utils/worldMap";
import { getCountryCentroid, COUNTRY_CENTROIDS } from "@/utils/countryCentroids";
import { getCachedGeoData } from "@/utils/geoDataCache";
import type { CountryCode, MapConfig } from "@/types/map";

// Lazy load FlightPath component
const FlightPath = lazy(() => import("./FlightPath"));

interface CountryProperties {
  name: string;
}

interface WorldMapProps {
  config: MapConfig;
  countryColorMap: Record<CountryCode, string>;
  selectedCountries: CountryCode[];
  width?: number;
  height?: number;
  className?: string;
  isDarkMode?: boolean;
  showLabels?: boolean;
  onCountryClick?: (iso2: CountryCode) => void;
  flightOrigin?: CountryCode | null;
  flightDestination?: CountryCode | null;
  isFlightPlaying?: boolean;
  flightDurationMs?: number;
  onFlightComplete?: () => void;
  onFlightProgress?: (progress: number, planePosition: { x: number; y: number }) => void;
  onFlightStop?: () => void;
  flightTheme?: string;
}

export interface WorldMapHandle {
  getSvgElement: () => SVGSVGElement | null;
  zoomToSelection: () => void;
  resetZoom: () => void;
}

const WorldMap = forwardRef<WorldMapHandle, WorldMapProps>(
  (
    {
      config,
      countryColorMap,
      selectedCountries,
      width = 960,
      height = 500,
      className = "",
      isDarkMode = false,
      showLabels = false,
      onCountryClick,
      flightOrigin,
      flightDestination,
      isFlightPlaying = false,
      flightDurationMs = 5000,
      onFlightComplete,
      onFlightProgress,
      onFlightStop,
      flightTheme = "classic",
    },
    ref
  ) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const gRef = useRef<SVGGElement>(null);
    const [geoData, setGeoData] = useState<FeatureCollection | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);
    const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
    
    // IMPORTANT: Map and routes share this exact projection instance; if you change projection or dimensions, keep both in sync.
    // Create projection as memoized value that updates when width/height changes
    const projection = useMemo(() => createProjection(width, height), [width, height]);
    const projectionRef = useRef(projection);
    
    // Keep ref in sync with memoized projection
    useEffect(() => {
      projectionRef.current = projection;
    }, [projection]);

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
      getSvgElement: () => svgRef.current,
      zoomToSelection: () => zoomToSelectedCountries(),
      resetZoom: () => resetMapZoom(),
    }));

    // Load world topology data (using cache)
    useEffect(() => {
      const loadWorldData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          // Use cached geo data (already converted to FeatureCollection)
          const countries = await getCachedGeoData();
          setGeoData(countries);
        } catch (err) {
          console.error("Error loading world data:", err);
          setError(err instanceof Error ? err.message : "Failed to load map");
        } finally {
          setIsLoading(false);
        }
      };

      loadWorldData();
    }, []);

    // Initialize zoom behavior
    useEffect(() => {
      if (!svgRef.current || !gRef.current) return;

      const svg = d3.select(svgRef.current);
      const g = d3.select(gRef.current);

      const zoom = d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([1, 8])
        .on("zoom", (event) => {
          // Only allow manual zoom if not during flight
          if (!isFlightPlaying) {
            g.attr("transform", event.transform);
          }
        });

      svg.call(zoom);
      zoomRef.current = zoom;

      // Disable zoom/pan interactions during flight animation
      if (isFlightPlaying) {
        svg.on("wheel.zoom", null);
        svg.on("mousedown.zoom", null);
        svg.on("touchstart.zoom", null);
        svg.style("cursor", "default");
      } else {
        svg.style("cursor", "grab");
      }

      return () => {
        svg.on(".zoom", null);
      };
    }, [geoData, isFlightPlaying]);

    // Update projection when dimensions change
    useEffect(() => {
      projectionRef.current = createProjection(width, height);
    }, [width, height]);

    // Zoom to selected countries
    const zoomToSelectedCountries = useCallback(() => {
      if (
        !svgRef.current ||
        !geoData ||
        !zoomRef.current ||
        selectedCountries.length === 0
      )
        return;

      const selectedFeatures = geoData.features.filter((f) => {
        const iso2 = getISO2FromFeatureId(f.id as string | number);
        return iso2 && selectedCountries.includes(iso2);
      });

      if (selectedFeatures.length === 0) return;

      const bbox = calculateBoundingBox(selectedFeatures);
      if (!bbox) return;

      const { scale, translate } = calculateZoomTransform(
        bbox,
        width,
        height,
        projection,
        60
      );

      const svg = d3.select(svgRef.current);
      svg
        .transition()
        .duration(750)
        .call(
          zoomRef.current.transform,
          d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
        );
    }, [geoData, selectedCountries, width, height, projection]);

    // Reset zoom
    const resetMapZoom = useCallback(() => {
      if (!svgRef.current || !zoomRef.current) return;

      const svg = d3.select(svgRef.current);
      svg
        .transition()
        .duration(750)
        .call(zoomRef.current.transform, d3.zoomIdentity);
    }, []);

    // Auto-zoom when selection changes (but not during flight)
    useEffect(() => {
      if (selectedCountries.length > 0 && !isFlightPlaying) {
        const timer = setTimeout(() => {
          zoomToSelectedCountries();
        }, 300);
        return () => clearTimeout(timer);
      }
    }, [selectedCountries, zoomToSelectedCountries, isFlightPlaying]);

    // Handle flight progress for cinematic zoom
    const handleFlightProgress = useCallback((progress: number, planePosition: { x: number; y: number }) => {
      if (!svgRef.current || !zoomRef.current || !projection || !isFlightPlaying) return;

      const svg = d3.select(svgRef.current);
      let scale: number;
      let translate: [number, number];

      if (progress <= 0.2) {
        // Takeoff phase: zoom in near origin (1.0 → 1.3)
        const takeoffProgress = progress / 0.2;
        scale = 1.0 + (0.3 * takeoffProgress);
        
        if (flightOrigin) {
          const originCoords = getCountryCentroid(flightOrigin, projection, width, height);
          if (originCoords) {
            translate = [
              width / 2 - originCoords.x * scale,
              height / 2 - originCoords.y * scale,
            ];
          } else {
            translate = [0, 0];
            scale = 1.0;
          }
        } else {
          translate = [0, 0];
          scale = 1.0;
        }
      } else if (progress <= 0.8) {
        // Cruise phase: follow plane, zoom out (1.3 → 0.7)
        const cruiseProgress = (progress - 0.2) / 0.6;
        scale = 1.3 - (0.6 * cruiseProgress);
        
        // Center on plane position
        translate = [
          width / 2 - planePosition.x * scale,
          height / 2 - planePosition.y * scale,
        ];
      } else {
        // Landing phase: zoom in near destination (0.7 → 1.2)
        const landingProgress = (progress - 0.8) / 0.2;
        scale = 0.7 + (0.5 * landingProgress);
        
        if (flightDestination) {
          const destCoords = getCountryCentroid(flightDestination, projection, width, height);
          if (destCoords) {
            translate = [
              width / 2 - destCoords.x * scale,
              height / 2 - destCoords.y * scale,
            ];
          } else {
            translate = [0, 0];
            scale = 1.0;
          }
        } else {
          translate = [0, 0];
          scale = 1.0;
        }
      }

      // Apply zoom transform directly (no transition for smooth frame-by-frame animation)
      const transform = d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale);
      if (zoomRef.current) {
        svg.call(zoomRef.current.transform, transform);
      }
    }, [width, height, flightOrigin, flightDestination, isFlightPlaying, projection]);

    // Use provided progress handler or fallback to internal handler
    const progressHandler = useMemo(() => {
      return onFlightProgress || handleFlightProgress;
    }, [onFlightProgress, handleFlightProgress]);

    // Theme colors (memoized)
    const colors = useMemo(() => ({
      ocean: isDarkMode ? "#1a2332" : config.background.type === "solid" ? (config.background.color ?? "#FEFDFB") : "#F5F7FA",
      land: isDarkMode ? "#2d3748" : "#E8E8E4",
      border: isDarkMode ? "#4a5568" : config.borderColor,
      graticule: isDarkMode ? "#2d3748" : "#E0E0DC",
    }), [isDarkMode, config.background, config.borderColor]);

    // Memoize path generator and graticule
    // IMPORTANT: Map and routes share this exact projection instance; if you change projection or dimensions, keep both in sync.
    const pathGenerator = useMemo(() => createPathGenerator(projection), [projection]);
    const graticule = useMemo(() => createGraticule(), []);

    // Memoize patterns for each group
    const memoizedPatterns = useMemo(() => 
      config.groups.map((group) => {
        const patternId = `pattern-${group.id}`;
        const pattern = group.pattern || "solid";

        if (pattern === "solid") return null;

        return (
          <pattern
            key={patternId}
            id={patternId}
            patternUnits="userSpaceOnUse"
            width="8"
            height="8"
            patternTransform="rotate(0)"
          >
            <rect width="8" height="8" fill={group.color} opacity="0.3" />
            {pattern === "stripes" && (
              <>
                <line x1="0" y1="0" x2="0" y2="8" stroke={group.color} strokeWidth="3" />
                <line x1="4" y1="0" x2="4" y2="8" stroke={group.color} strokeWidth="3" />
              </>
            )}
            {pattern === "dots" && (
              <>
                <circle cx="2" cy="2" r="1.5" fill={group.color} />
                <circle cx="6" cy="6" r="1.5" fill={group.color} />
              </>
            )}
            {pattern === "crosshatch" && (
              <>
                <line x1="0" y1="0" x2="8" y2="8" stroke={group.color} strokeWidth="1.5" />
                <line x1="8" y1="0" x2="0" y2="8" stroke={group.color} strokeWidth="1.5" />
              </>
            )}
            {pattern === "diagonal" && (
              <>
                <line x1="0" y1="0" x2="8" y2="8" stroke={group.color} strokeWidth="2" />
              </>
            )}
          </pattern>
        );
      }),
      [config.groups]
    );

    if (isLoading) {
      return (
        <div
          className={`flex items-center justify-center bg-cream-100 dark:bg-ink-900 ${className}`}
          style={{ width, height }}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-accent-teal border-t-transparent rounded-full animate-spin" />
            <span className="text-ink-500 dark:text-ink-400 text-sm">
              Loading world map...
            </span>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div
          className={`flex items-center justify-center bg-cream-100 dark:bg-ink-900 ${className}`}
          style={{ width, height }}
        >
          <div className="text-center p-6">
            <p className="text-accent-coral font-medium mb-2">
              Failed to load map
            </p>
            <p className="text-ink-500 dark:text-ink-400 text-sm">{error}</p>
          </div>
        </div>
      );
    }

    if (!geoData) return null;

    return (
      <>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className={`${className} select-none`}
        style={{
          backgroundColor: colors.ocean,
        }}
      >
        <defs>
          {/* Subtle shadow for highlighted countries */}
          <filter id="country-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.15" />
          </filter>

          {/* Pattern for non-selected countries */}
          <pattern
            id="subtle-pattern"
            patternUnits="userSpaceOnUse"
            width="4"
            height="4"
          >
            <rect width="4" height="4" fill={colors.land} />
          </pattern>

          {/* Patterns for each group (memoized) */}
          {memoizedPatterns}
        </defs>

        <g ref={gRef}>
          {/* Graticule (grid lines) */}
          <path
            d={pathGenerator(graticule()) ?? undefined}
            fill="none"
            stroke={colors.graticule}
            strokeWidth={0.3}
            strokeOpacity={0.5}
          />

          {/* Countries */}
          {geoData.features.map((feature: Feature<Geometry>) => {
            const iso2 = getISO2FromFeatureId(feature.id as string | number);
            const isSelected = iso2 ? selectedCountries.includes(iso2) : false;
            const fillColor = iso2 ? countryColorMap[iso2] : null;

            // Find which group this country belongs to (for pattern)
            const countryGroup = iso2 ? config.groups.find(g => g.countries.includes(iso2)) : null;
            const pattern = countryGroup?.pattern || "solid";

            // Determine fill: pattern URL or solid color
            let fill: string;
            if (isSelected && fillColor) {
              if (pattern !== "solid" && countryGroup) {
                fill = `url(#pattern-${countryGroup.id})`;
              } else {
                fill = fillColor;
              }
            } else {
              fill = colors.land;
            }

            return (
              <path
                key={feature.id ?? Math.random()}
                d={pathGenerator(feature) ?? undefined}
                fill={fill}
                stroke={colors.border}
                strokeWidth={isSelected ? 0.75 : 0.5}
                strokeLinejoin="round"
                filter={isSelected ? "url(#country-shadow)" : undefined}
                data-iso2={iso2 ?? undefined}
                data-name={(feature.properties as CountryProperties)?.name}
                onClick={() => {
                  if (iso2 && onCountryClick) {
                    onCountryClick(iso2);
                  }
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  const countryName = (feature.properties as CountryProperties)?.name ?? "Unknown";
                  const touch = e.touches[0];
                  if (touch) {
                    setTooltip({
                      x: touch.clientX,
                      y: touch.clientY - 40,
                      text: `${countryName}${iso2 ? ` (${iso2})` : ""}`,
                    });
                  }
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  setTimeout(() => setTooltip(null), 1500);
                  if (iso2 && onCountryClick) {
                    onCountryClick(iso2);
                  }
                }}
                onMouseEnter={(e) => {
                  const countryName = (feature.properties as CountryProperties)?.name ?? "Unknown";
                  setTooltip({
                    x: e.clientX,
                    y: e.clientY - 40,
                    text: `${countryName}${iso2 ? ` (${iso2})` : ""}`,
                  });
                }}
                onMouseMove={(e) => {
                  setTooltip((prev) =>
                    prev ? { ...prev, x: e.clientX, y: e.clientY - 40 } : null
                  );
                }}
                onMouseLeave={() => {
                  setTooltip(null);
                }}
                className={`transition-all duration-200 ${
                  isSelected ? "opacity-100" : "opacity-90"
                } ${onCountryClick ? "cursor-pointer hover:opacity-100 hover:brightness-95" : ""}`}
                style={{
                  pointerEvents: "auto",
                }}
              >
                <title>
                  {(feature.properties as CountryProperties)?.name ?? "Unknown"}
                  {iso2 ? ` (${iso2})` : ""}
                </title>
              </path>
            );
          })}

          {/* Flight Path Animation - Lazy loaded */}
          {flightOrigin && flightDestination && (() => {
            // Get lat/lon coordinates for great circle path
            const originCentroid = COUNTRY_CENTROIDS[flightOrigin.toUpperCase()];
            const destCentroid = COUNTRY_CENTROIDS[flightDestination.toUpperCase()];
            
            if (!originCentroid || !destCentroid) {
              // If flight is playing but centroids are invalid, stop it
              if (isFlightPlaying && onFlightStop) {
                setTimeout(() => {
                  onFlightStop();
                }, 0);
              }
              return null;
            }
            
            // Use the same projection instance as map paths for perfect alignment
            const originCoords = getCountryCentroid(flightOrigin, projection, width, height);
            const destCoords = getCountryCentroid(flightDestination, projection, width, height);
            
            // Defensive check: if projected coordinates are missing, stop the flight
            if (!originCoords || !destCoords) {
              if (isFlightPlaying && onFlightStop) {
                setTimeout(() => {
                  onFlightStop();
                }, 0);
              }
              return null;
            }
            
            return (
              <Suspense fallback={null}>
                <FlightPath
                  origin={originCoords}
                  destination={destCoords}
                  originLonLat={originCentroid}
                  destinationLonLat={destCentroid}
                  projection={projection}
                  isPlaying={isFlightPlaying}
                  durationMs={flightDurationMs}
                  onComplete={onFlightComplete}
                  onProgress={progressHandler}
                  onStop={onFlightStop}
                  width={width}
                  height={height}
                  isDarkMode={isDarkMode}
                  themeId={flightTheme}
                />
              </Suspense>
            );
          })()}

          {/* Country Labels - show for selected countries, or all if nothing selected */}
          {showLabels && geoData.features.map((feature: Feature<Geometry>) => {
            const iso2 = getISO2FromFeatureId(feature.id as string | number);
            const isSelected = iso2 ? selectedCountries.includes(iso2) : false;
            const hasAnySelection = selectedCountries.length > 0;

            // Show label if: country is selected, OR nothing is selected (show all)
            if (hasAnySelection && !isSelected) return null;

            const countryName = (feature.properties as CountryProperties)?.name ?? "";
            const centroid = pathGenerator.centroid(feature);

            if (!centroid || isNaN(centroid[0]) || isNaN(centroid[1])) return null;

            // Calculate country bounds to determine size
            const bounds = pathGenerator.bounds(feature);
            const boundsWidth = bounds[1][0] - bounds[0][0];
            const boundsHeight = bounds[1][1] - bounds[0][1];
            const countrySize = Math.max(boundsWidth, boundsHeight);

            // Only show labels for countries large enough to accommodate text
            // This prevents overlap in crowded regions
            const minSizeThreshold = hasAnySelection ? width * 0.02 : width * 0.015;
            if (countrySize < minSizeThreshold) return null;

            // Smaller, more conservative font sizes to prevent overlap
            const baseFontSize = hasAnySelection
              ? Math.max(6, Math.min(9, width / 150))  // Reduced from /120
              : Math.max(3, Math.min(5, width / 200)); // Reduced from /180

            // Scale font based on country size for better fit
            const fontSize = Math.min(baseFontSize, countrySize / 8);

            // Prefer ISO codes for cleaner look and less overlap
            const displayName = hasAnySelection
              ? (countryName.length > 8 ? (iso2 || countryName.slice(0, 3)) : (iso2 || countryName))
              : (iso2 || countryName.slice(0, 2));

            return (
              <text
                key={`label-${feature.id}`}
                x={centroid[0]}
                y={centroid[1]}
                textAnchor="middle"
                dominantBaseline="central"
                fill={isDarkMode ? "#FEFDFB" : "#1A1A19"}
                fontSize={fontSize}
                fontWeight={hasAnySelection ? "500" : "400"}
                fontFamily="system-ui, -apple-system, sans-serif"
                letterSpacing="0.3"
                style={{
                  textShadow: isDarkMode
                    ? "0 1px 2px rgba(0,0,0,0.9), 0 0 3px rgba(0,0,0,0.6)"
                    : "0 1px 1px rgba(255,255,255,0.95), 0 0 2px rgba(255,255,255,0.8)",
                  pointerEvents: "none",
                  opacity: hasAnySelection ? 0.95 : 0.75,
                }}
              >
                {displayName}
              </text>
            );
          })}
        </g>
      </svg>

      {/* Floating tooltip for mobile/iPad and desktop */}
      {tooltip && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'none',
            zIndex: 9999,
          }}
          className="px-3 py-1.5 bg-ink-900 dark:bg-white text-white dark:text-ink-900 rounded-lg shadow-lg text-sm font-medium whitespace-nowrap"
        >
          {tooltip.text}
        </div>
      )}
    </>
    );
  }
);

WorldMap.displayName = "WorldMap";

export default WorldMap;
