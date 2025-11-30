"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { FeatureCollection, Feature, Geometry } from "geojson";
import {
  createProjection,
  createPathGenerator,
  calculateBoundingBox,
  calculateZoomTransform,
  getISO2FromFeatureId,
  createGraticule,
} from "@/utils/worldMap";
import type { CountryCode, MapConfig } from "@/types/map";

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
    },
    ref
  ) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const gRef = useRef<SVGGElement>(null);
    const [geoData, setGeoData] = useState<FeatureCollection | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
    const projectionRef = useRef(createProjection(width, height));

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
      getSvgElement: () => svgRef.current,
      zoomToSelection: () => zoomToSelectedCountries(),
      resetZoom: () => resetMapZoom(),
    }));

    // Load world topology data
    useEffect(() => {
      const loadWorldData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          // Fetch from world-atlas CDN
          const response = await fetch(
            "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"
          );
          if (!response.ok) {
            throw new Error("Failed to load world map data");
          }
          const topology = (await response.json()) as Topology<{
            countries: GeometryCollection<CountryProperties>;
          }>;
          
          // Convert TopoJSON to GeoJSON
          const countries = topojson.feature(
            topology,
            topology.objects.countries
          ) as FeatureCollection;
          
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
          g.attr("transform", event.transform);
        });

      svg.call(zoom);
      zoomRef.current = zoom;

      return () => {
        svg.on(".zoom", null);
      };
    }, [geoData]);

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
        projectionRef.current,
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
    }, [geoData, selectedCountries, width, height]);

    // Reset zoom
    const resetMapZoom = useCallback(() => {
      if (!svgRef.current || !zoomRef.current) return;

      const svg = d3.select(svgRef.current);
      svg
        .transition()
        .duration(750)
        .call(zoomRef.current.transform, d3.zoomIdentity);
    }, []);

    // Auto-zoom when selection changes
    useEffect(() => {
      if (selectedCountries.length > 0) {
        const timer = setTimeout(() => {
          zoomToSelectedCountries();
        }, 300);
        return () => clearTimeout(timer);
      }
    }, [selectedCountries, zoomToSelectedCountries]);

    // Theme colors
    const colors = {
      ocean: isDarkMode ? "#1a2332" : config.background.type === "solid" ? (config.background.color ?? "#FEFDFB") : "#F5F7FA",
      land: isDarkMode ? "#2d3748" : "#E8E8E4",
      border: isDarkMode ? "#4a5568" : config.borderColor,
      graticule: isDarkMode ? "#2d3748" : "#E0E0DC",
    };

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

    const pathGenerator = createPathGenerator(projectionRef.current);
    const graticule = createGraticule();

    return (
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

            return (
              <path
                key={feature.id ?? Math.random()}
                d={pathGenerator(feature) ?? undefined}
                fill={isSelected && fillColor ? fillColor : colors.land}
                stroke={colors.border}
                strokeWidth={isSelected ? 0.75 : 0.5}
                strokeLinejoin="round"
                filter={isSelected ? "url(#country-shadow)" : undefined}
                data-iso2={iso2 ?? undefined}
                data-name={(feature.properties as CountryProperties)?.name}
                className={`transition-colors duration-200 ${
                  isSelected ? "opacity-100" : "opacity-90"
                }`}
              >
                <title>
                  {(feature.properties as CountryProperties)?.name ?? "Unknown"}
                  {iso2 ? ` (${iso2})` : ""}
                </title>
              </path>
            );
          })}
        </g>
      </svg>
    );
  }
);

WorldMap.displayName = "WorldMap";

export default WorldMap;
