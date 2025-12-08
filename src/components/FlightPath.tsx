"use client";

import React, { useEffect, useRef, useState } from "react";
import type { FlightTheme } from "@/data/flightThemes";
import { getFlightThemeForDarkMode } from "@/data/flightThemes";

interface FlightPathProps {
  origin: { x: number; y: number } | null;
  destination: { x: number; y: number } | null;
  isPlaying: boolean;
  durationMs: number;
  onComplete?: () => void;
  onProgress?: (progress: number, planePosition: { x: number; y: number }) => void;
  onStop?: () => void;
  width: number;
  height: number;
  isDarkMode?: boolean;
  theme?: FlightTheme;
  themeId?: string;
}

export default function FlightPath({
  origin,
  destination,
  isPlaying,
  durationMs,
  onComplete,
  onProgress,
  onStop,
  width,
  height,
  isDarkMode = false,
  theme,
  themeId = "classic",
}: FlightPathProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const planeRef = useRef<SVGGElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [planePosition, setPlanePosition] = useState<{ x: number; y: number; angle: number } | null>(null);

  // Don't render if origin or destination is missing
  if (!origin || !destination) {
    return null;
  }

  // Calculate control point for quadratic Bézier curve
  // Control point is offset upward to create an arc
  const midX = (origin.x + destination.x) / 2;
  const midY = (origin.y + destination.y) / 2;
  const distance = Math.sqrt(
    Math.pow(destination.x - origin.x, 2) + Math.pow(destination.y - origin.y, 2)
  );
  
  // Control point offset: 30-40% of distance above midpoint
  const controlOffset = distance * 0.35;
  const controlX = midX;
  const controlY = midY - controlOffset;

  // Create path string for quadratic Bézier curve
  const pathString = `M ${origin.x} ${origin.y} Q ${controlX} ${controlY} ${destination.x} ${destination.y}`;

  // Animation loop with defensive checks
  useEffect(() => {
    if (!isPlaying || !pathRef.current) {
      return;
    }

    const path = pathRef.current;
    const totalLength = path.getTotalLength();
    
    // Defensive check: if path has zero or invalid length, stop immediately
    if (!totalLength || totalLength <= 0 || !isFinite(totalLength)) {
      console.warn("FlightPath: Invalid path length, stopping animation");
      if (onStop) {
        onStop();
      } else if (onComplete) {
        onComplete();
      }
      return;
    }
    
    const animate = (currentTime: number) => {
      // Defensive check: ensure we're still supposed to be playing
      if (!isPlaying || !pathRef.current) {
        if (onStop) {
          onStop();
        }
        return;
      }

      if (!startTimeRef.current) {
        startTimeRef.current = currentTime;
      }

      const elapsed = currentTime - startTimeRef.current;
      const newProgress = Math.min(elapsed / durationMs, 1);

      // Get point along path with defensive checks
      const pointLength = Math.min(newProgress * totalLength, totalLength);
      let point;
      try {
        point = path.getPointAtLength(pointLength);
        if (!point || !isFinite(point.x) || !isFinite(point.y)) {
          throw new Error("Invalid point");
        }
      } catch (error) {
        console.warn("FlightPath: Error getting point at length, stopping animation", error);
        if (onStop) {
          onStop();
        } else if (onComplete) {
          onComplete();
        }
        return;
      }
      
      // Calculate angle based on path direction
      const lookAhead = Math.min(10, totalLength - pointLength);
      let nextPoint;
      try {
        if (lookAhead > 0) {
          nextPoint = path.getPointAtLength(pointLength + lookAhead);
        } else {
          // At the end, use the destination point
          nextPoint = path.getPointAtLength(totalLength);
        }
        if (!nextPoint || !isFinite(nextPoint.x) || !isFinite(nextPoint.y)) {
          throw new Error("Invalid next point");
        }
      } catch (error) {
        console.warn("FlightPath: Error getting next point, stopping animation", error);
        if (onStop) {
          onStop();
        } else if (onComplete) {
          onComplete();
        }
        return;
      }
      
      const dx = nextPoint.x - point.x;
      const dy = nextPoint.y - point.y;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);

      setProgress(newProgress);
      setPlanePosition({ x: point.x, y: point.y, angle });

      // Call progress callback
      if (onProgress) {
        onProgress(newProgress, { x: point.x, y: point.y });
      }

      if (newProgress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete
        if (onComplete) {
          onComplete();
        }
        startTimeRef.current = null;
      }
    };

    // Reset state when starting
    startTimeRef.current = null;
    setProgress(0);
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      startTimeRef.current = null;
    };
  }, [isPlaying, durationMs, onComplete, onProgress, onStop]);

  // Reset progress when not playing
  useEffect(() => {
    if (!isPlaying) {
      setProgress(0);
      setPlanePosition(null);
      startTimeRef.current = null;
    }
  }, [isPlaying]);

  // Get theme colors
  const flightTheme = theme || getFlightThemeForDarkMode(themeId, isDarkMode);
  const strokeColor = flightTheme.routeColor;
  const planeColor = flightTheme.planeColor;
  const planeStrokeColor = flightTheme.planeStrokeColor;
  const glowColor = flightTheme.glowColor;
  const routeWidth = flightTheme.routeWidth;

  // Calculate animated dash offset
  const dashOffset = progress * 20;

  return (
    <g>
      {/* SVG Filters */}
      <defs>
        {/* Glow filter for route */}
        <filter id="routeGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={flightTheme.glowIntensity} result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        
        {/* Drop shadow for plane */}
        <filter id="planeShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="1" dy="1" stdDeviation="2" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Dotted route line with glow */}
      <path
        ref={pathRef}
        d={pathString}
        fill="none"
        stroke={strokeColor}
        strokeWidth={routeWidth}
        strokeDasharray="5,5"
        strokeDashoffset={dashOffset}
        strokeOpacity={0.7}
        filter="url(#routeGlow)"
        style={{ pointerEvents: "none" }}
      />

      {/* Plane icon */}
      {planePosition && (
        <g
          ref={planeRef}
          transform={`translate(${planePosition.x}, ${planePosition.y}) rotate(${planePosition.angle})`}
          style={{ pointerEvents: "none" }}
          filter="url(#planeShadow)"
        >
          {/* Airplane SVG - realistic commercial airliner design, nose pointing right (east) */}
          
          {/* Main fuselage - streamlined body */}
          <ellipse cx="0" cy="0" rx="8" ry="1.8" fill={planeColor} />
          
          {/* Nose cone - pointed front */}
          <path
            d="M 8,0 L 9.5,-0.8 L 9.5,0.8 Z"
            fill={planeColor}
          />
          
          {/* Main wings - wider and more realistic */}
          <path
            d="M -5,-4 L -5,-3.5 L 3,-2.5 L 3,2.5 L -5,3.5 L -5,4 Z"
            fill={planeColor}
            opacity={0.95}
          />
          
          {/* Wing details - subtle separation */}
          <line x1="-5" y1="-3.5" x2="3" y2="-2.5" stroke={planeStrokeColor} strokeWidth="0.3" opacity={0.4} />
          <line x1="-5" y1="3.5" x2="3" y2="2.5" stroke={planeStrokeColor} strokeWidth="0.3" opacity={0.4} />
          
          {/* Tail fin - vertical stabilizer */}
          <path
            d="M -7,0 L -7.5,-2.5 L -6.5,-2.5 L -6.5,-1.5 L -6,-1.5 L -6,1.5 L -6.5,1.5 L -6.5,2.5 L -7.5,2.5 Z"
            fill={planeColor}
          />
          
          {/* Horizontal stabilizer - tail wings */}
          <path
            d="M -6.5,-1.2 L -7.5,-1.5 L -7.5,1.5 L -6.5,1.2 Z"
            fill={planeColor}
            opacity={0.9}
          />
          
          {/* Cockpit windows - multiple windows for realism */}
          <circle cx="3" cy="0" r="0.8" fill="white" opacity={0.85} />
          <circle cx="1.5" cy="0" r="0.7" fill="white" opacity={0.75} />
          
          {/* Engine nacelles under wings */}
          <ellipse cx="-2" cy="-3.2" rx="1.2" ry="0.8" fill={planeStrokeColor} opacity={0.7} />
          <ellipse cx="-2" cy="3.2" rx="1.2" ry="0.8" fill={planeStrokeColor} opacity={0.7} />
          
          {/* Outline stroke for definition */}
          <ellipse cx="0" cy="0" rx="8" ry="1.8" fill="none" stroke={planeStrokeColor} strokeWidth="0.4" />
          <path
            d="M 8,0 L 9.5,-0.8 L 9.5,0.8 Z"
            fill="none"
            stroke={planeStrokeColor}
            strokeWidth="0.4"
          />
        </g>
      )}

      {/* Origin marker */}
      <circle
        cx={origin.x}
        cy={origin.y}
        r="4"
        fill={strokeColor}
        stroke="white"
        strokeWidth="1.5"
        opacity={0.8}
      />

      {/* Destination marker */}
      <circle
        cx={destination.x}
        cy={destination.y}
        r="4"
        fill={strokeColor}
        stroke="white"
        strokeWidth="1.5"
        opacity={0.8}
      />
    </g>
  );
}


