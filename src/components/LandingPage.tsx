"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Real World Map",
      description: "Accurate Natural Earth projection with 200+ countries. No abstract shapes—just a proper political world map.",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
      title: "Multi-Group Colors",
      description: "Highlight different regions with different colors. Perfect for comparative analysis or segmented presentations.",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "Instant Presets",
      description: "One-click selection for MEA, LATAM, EU, GCC, BRICS, G20, and more. No manual country picking needed.",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      ),
      title: "HD Export",
      description: "Download publication-ready PNG or JPG at 1080p, 4K, or square format. Add custom titles and branding.",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
        </svg>
      ),
      title: "Smart Recognition",
      description: "Type 'UAE', 'United Arab Emirates', or 'AE'—all work. Supports names, ISO codes, and common aliases.",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ),
      title: "Dark Mode",
      description: "Full dark theme support. Easy on the eyes during late-night presentation prep.",
    },
  ];

  const useCases = [
    {
      title: "Business Presentations",
      description: "Show your market coverage, expansion plans, or regional performance at a glance.",
      image: "📊",
    },
    {
      title: "Educational Materials",
      description: "Create geography lessons, history timelines, or current events visualizations.",
      image: "🎓",
    },
    {
      title: "Reports & Documents",
      description: "Add professional maps to annual reports, research papers, or policy briefs.",
      image: "📄",
    },
    {
      title: "Social Media",
      description: "Generate eye-catching infographics for LinkedIn, Twitter, or Instagram.",
      image: "📱",
    },
  ];

  const presets = [
    { name: "MEA", count: 30, color: "#2A9D8F" },
    { name: "LATAM", count: 25, color: "#E76F51" },
    { name: "EU", count: 27, color: "#264653" },
    { name: "GCC", count: 6, color: "#E9C46A" },
    { name: "BRICS", count: 10, color: "#9B5DE5" },
    { name: "G20", count: 19, color: "#00BBF9" },
    { name: "ASEAN", count: 10, color: "#F15BB5" },
    { name: "Nordic", count: 5, color: "#00F5D4" },
  ];

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-cream-50/95 backdrop-blur-sm border-b border-cream-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-accent-teal flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-semibold text-ink-900">Region Map Generator</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm text-ink-600 hover:text-ink-900 transition-colors">Features</a>
              <a href="#use-cases" className="text-sm text-ink-600 hover:text-ink-900 transition-colors">Use Cases</a>
              <a href="#presets" className="text-sm text-ink-600 hover:text-ink-900 transition-colors">Presets</a>
              <Link
                href="/app"
                className="px-4 py-2 bg-accent-teal text-white text-sm font-medium rounded-lg hover:bg-accent-teal/90 transition-colors"
              >
                Launch App →
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-ink-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-cream-200">
              <div className="flex flex-col gap-4">
                <a href="#features" className="text-sm text-ink-600" onClick={() => setIsMenuOpen(false)}>Features</a>
                <a href="#use-cases" className="text-sm text-ink-600" onClick={() => setIsMenuOpen(false)}>Use Cases</a>
                <a href="#presets" className="text-sm text-ink-600" onClick={() => setIsMenuOpen(false)}>Presets</a>
                <Link
                  href="/app"
                  className="px-4 py-2 bg-accent-teal text-white text-sm font-medium rounded-lg text-center"
                >
                  Launch App →
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-teal/10 text-accent-teal text-sm font-medium rounded-full mb-6">
            <span className="w-2 h-2 bg-accent-teal rounded-full animate-pulse" />
            100% Free • No Sign-up Required
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-ink-900 leading-tight mb-6">
            Create Beautiful
            <span className="text-accent-teal"> World Maps</span>
            <br />in Seconds
          </h1>
          
          <p className="text-lg sm:text-xl text-ink-600 max-w-2xl mx-auto mb-8">
            Highlight countries, apply region presets, customize colors, and export 
            publication-ready maps. Perfect for presentations, reports, and infographics.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/app"
              className="px-8 py-4 bg-accent-teal text-white font-semibold rounded-xl hover:bg-accent-teal/90 transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              Start Creating — It's Free
            </Link>
            <a
              href="#features"
              className="px-8 py-4 bg-cream-200 text-ink-700 font-semibold rounded-xl hover:bg-cream-300 transition-colors"
            >
              See How It Works
            </a>
          </div>

          {/* Hero visual */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-cream-50 via-transparent to-transparent z-10 pointer-events-none" />
            <div className="bg-white rounded-2xl shadow-lifted p-4 sm:p-6 border border-cream-200">
              <div className="aspect-video bg-cream-100 rounded-lg flex items-center justify-center overflow-hidden">
                {/* Stylized map preview */}
                <svg viewBox="0 0 800 450" className="w-full h-full">
                  <rect width="800" height="450" fill="#F5F7FA" />
                  {/* Simplified world map silhouette with highlighted regions */}
                  <ellipse cx="400" cy="225" rx="350" ry="180" fill="none" stroke="#E0E0DC" strokeWidth="1" />
                  {/* MEA region highlight */}
                  <ellipse cx="450" cy="220" rx="80" ry="100" fill="#2A9D8F" opacity="0.3" />
                  {/* LATAM region */}
                  <ellipse cx="250" cy="280" rx="60" ry="90" fill="#E76F51" opacity="0.3" />
                  {/* EU region */}
                  <ellipse cx="420" cy="140" rx="50" ry="40" fill="#264653" opacity="0.3" />
                  {/* Grid lines */}
                  <line x1="100" y1="225" x2="700" y2="225" stroke="#E0E0DC" strokeWidth="1" />
                  <line x1="400" y1="50" x2="400" y2="400" stroke="#E0E0DC" strokeWidth="1" />
                  {/* Location markers */}
                  <circle cx="470" cy="200" r="8" fill="#2A9D8F" />
                  <circle cx="230" cy="300" r="8" fill="#E76F51" />
                  <circle cx="430" cy="130" r="8" fill="#264653" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-ink-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-ink-600 max-w-2xl mx-auto">
              A complete toolkit for creating professional map visualizations without design skills or expensive software.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-xl bg-cream-50 hover:bg-cream-100 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-accent-teal/10 text-accent-teal flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-ink-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-ink-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Presets Section */}
      <section id="presets" className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-ink-900 mb-4">
              14 Built-in Region Presets
            </h2>
            <p className="text-lg text-ink-600 max-w-2xl mx-auto">
              Select entire regions with one click. No need to remember which countries belong where.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {presets.map((preset, index) => (
              <div
                key={index}
                className="px-4 py-3 bg-white rounded-lg shadow-soft border border-cream-200 flex items-center gap-3"
              >
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: preset.color }}
                />
                <span className="font-medium text-ink-800">{preset.name}</span>
                <span className="text-sm text-ink-500">{preset.count} countries</span>
              </div>
            ))}
          </div>

          <p className="text-center text-ink-500 mt-6">
            + APAC, North America, Global South, OPEC, G7, Nordic...
          </p>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-ink-900 mb-4">
              Built For Everyone
            </h2>
            <p className="text-lg text-ink-600 max-w-2xl mx-auto">
              Whether you're in business, education, or research—create maps that communicate.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase, index) => (
              <div
                key={index}
                className="p-6 rounded-xl bg-cream-50 text-center"
              >
                <div className="text-4xl mb-4">{useCase.image}</div>
                <h3 className="text-lg font-semibold text-ink-900 mb-2">
                  {useCase.title}
                </h3>
                <p className="text-sm text-ink-600">
                  {useCase.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-accent-slate to-ink-900 rounded-2xl p-8 sm:p-12 text-white">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Create Your Map?
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
              No account needed. No watermarks. No limits. Just open the app and start creating.
            </p>
            <Link
              href="/app"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-ink-900 font-semibold rounded-xl hover:bg-cream-100 transition-colors"
            >
              Launch Region Map Generator
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 border-t border-cream-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent-teal flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm text-ink-600">
                Region Map Generator • Built by{" "}
                <a href="https://linkedin.com/in/fareedkhankk" target="_blank" rel="noopener noreferrer" className="text-accent-teal hover:underline">
                  Fareed Khan
                </a>
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-ink-500">
              <span>© {new Date().getFullYear()}</span>
              <a href="#" className="hover:text-ink-700">Privacy</a>
              <a href="#" className="hover:text-ink-700">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
