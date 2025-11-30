import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://regionmap.app"),
  title: "Region Map Generator | Create Beautiful World Maps in Seconds",
  description: "Free online tool to create custom world maps. Highlight countries, apply region presets (MEA, LATAM, EU, GCC, BRICS), customize colors, and export HD images for presentations and reports.",
  keywords: [
    "world map generator",
    "region map",
    "country map maker",
    "map visualization",
    "highlight countries",
    "MEA map",
    "LATAM map",
    "EU map",
    "GCC countries",
    "BRICS map",
    "free map tool",
    "business presentation map",
    "infographic map",
  ],
  authors: [{ name: "Fareed Khan", url: "https://linkedin.com/in/faraborz" }],
  creator: "Fareed Khan",
  publisher: "Fareed Khan",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://regionmap.app",
    siteName: "Region Map Generator",
    title: "Region Map Generator | Create Beautiful World Maps in Seconds",
    description: "Free online tool to create custom world maps. Highlight countries, apply region presets, and export HD images.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Region Map Generator - Create Beautiful World Maps",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Region Map Generator | Create Beautiful World Maps in Seconds",
    description: "Free online tool to create custom world maps. Highlight countries, apply region presets, and export HD images.",
    images: ["/og-image.png"],
    creator: "@faraborz",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://regionmap.app",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FEFDFB" },
    { media: "(prefers-color-scheme: dark)", color: "#0D0D0C" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Region Map Generator",
              description: "Free online tool to create custom world maps with highlighted regions",
              url: "https://regionmap.app",
              applicationCategory: "DesignApplication",
              operatingSystem: "Web Browser",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              author: {
                "@type": "Person",
                name: "Fareed Khan",
                url: "https://linkedin.com/in/faraborz",
              },
            }),
          }}
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
