"use client";

import React, { useMemo } from "react";
import type { CountryCode } from "@/types/map";
import {
  calculateFlightDistance,
  estimateFlightTime,
  formatDistance,
  formatFlightTime,
} from "@/utils/flightCalculations";

interface FlightInfoProps {
  origin: CountryCode | null;
  destination: CountryCode | null;
  className?: string;
}

const FlightInfo = React.memo(function FlightInfo({
  origin,
  destination,
  className = "",
}: FlightInfoProps) {
  const { distance, flightTime } = useMemo(() => {
    if (!origin || !destination) {
      return { distance: null, flightTime: null };
    }

    const dist = calculateFlightDistance(origin, destination);
    if (dist === null) {
      return { distance: null, flightTime: null };
    }

    const time = estimateFlightTime(dist);

    return {
      distance: dist,
      flightTime: time,
    };
  }, [origin, destination]);

  if (!origin || !destination || distance === null) {
    return null;
  }

  return (
    <div
      className={`p-3 bg-cream-100 dark:bg-ink-800 rounded-lg border border-cream-300 dark:border-ink-700 shadow-sm ${className}`}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-ink-600 dark:text-ink-400 uppercase tracking-wider">
            Distance
          </span>
          <span className="text-sm font-bold text-ink-800 dark:text-ink-200">
            {formatDistance(distance)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-ink-600 dark:text-ink-400 uppercase tracking-wider">
            Est. Flight Time
          </span>
          <span className="text-sm font-bold text-ink-800 dark:text-ink-200">
            {formatFlightTime(flightTime!)}
          </span>
        </div>
      </div>
    </div>
  );
});

FlightInfo.displayName = "FlightInfo";

export default FlightInfo;

