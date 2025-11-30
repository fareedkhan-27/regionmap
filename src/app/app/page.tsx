"use client";

import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues with D3
const MapApp = dynamic(() => import("@/components/MapApp"), {
  ssr: false,
  loading: () => (
    <div className="h-screen flex items-center justify-center bg-cream-50 dark:bg-ink-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-3 border-accent-teal border-t-transparent rounded-full animate-spin" />
        <p className="text-ink-500 dark:text-ink-400 text-sm font-medium">
          Loading Region Map Generator...
        </p>
      </div>
    </div>
  ),
});

export default function AppPage() {
  return <MapApp />;
}
