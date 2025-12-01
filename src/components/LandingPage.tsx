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
      gradient: "from-neon-cyan to-neon-blue",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
      title: "Multi-Group Colors",
      description: "Highlight different regions with different colors. Perfect for comparative analysis or segmented presentations.",
      gradient: "from-neon-purple to-neon-pink",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "Instant Presets",
      description: "One-click selection for MEA, LATAM, EU, GCC, BRICS, G20, and more. No manual country picking needed.",
      gradient: "from-neon-gold to-orange-500",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      ),
      title: "HD Export",
      description: "Download publication-ready PNG or JPG at 1080p, 4K, or square format. Add custom titles and branding.",
      gradient: "from-neon-emerald to-green-500",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
        </svg>
      ),
      title: "Smart Recognition",
      description: "Type 'UAE', 'United Arab Emirates', or 'AE'—all work. Supports names, ISO codes, and common aliases.",
      gradient: "from-blue-500 to-neon-purple",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ),
      title: "Dark Mode",
      description: "Full dark theme support. Easy on the eyes during late-night presentation prep.",
      gradient: "from-space-600 to-space-900",
    },
  ];

  const useCases = [
    {
      title: "Business Presentations",
      description: "Show your market coverage, expansion plans, or regional performance at a glance.",
      image: "📊",
      gradient: "from-neon-cyan/20 to-neon-blue/20",
    },
    {
      title: "Educational Materials",
      description: "Create geography lessons, history timelines, or current events visualizations.",
      image: "🎓",
      gradient: "from-neon-purple/20 to-neon-pink/20",
    },
    {
      title: "Reports & Documents",
      description: "Add professional maps to annual reports, research papers, or policy briefs.",
      image: "📄",
      gradient: "from-neon-emerald/20 to-green-500/20",
    },
    {
      title: "Social Media",
      description: "Generate eye-catching infographics for LinkedIn, Twitter, or Instagram.",
      image: "📱",
      gradient: "from-neon-gold/20 to-orange-500/20",
    },
  ];

  const presets = [
    { name: "MEA", count: 30, gradient: "from-neon-cyan to-neon-blue" },
    { name: "LATAM", count: 25, gradient: "from-orange-500 to-red-500" },
    { name: "EU", count: 27, gradient: "from-blue-600 to-space-700" },
    { name: "GCC", count: 6, gradient: "from-neon-gold to-orange-500" },
    { name: "BRICS", count: 10, gradient: "from-neon-purple to-pink-600" },
    { name: "G20", count: 19, gradient: "from-neon-cyan to-neon-emerald" },
    { name: "ASEAN", count: 10, gradient: "from-neon-pink to-purple-600" },
    { name: "Nordic", count: 5, gradient: "from-cyan-400 to-blue-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-dark relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-neon-cyan/10 rounded-full blur-3xl animate-float" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-neon-gold/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-void-900/70 backdrop-blur-xl border-b border-neon-cyan/20 shadow-neon-purple">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-cyber flex items-center justify-center shadow-neon animate-float">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-bold bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">Region Map Generator</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm text-neon-cyan/70 hover:text-neon-cyan transition-all duration-300 font-medium">Features</a>
              <a href="#use-cases" className="text-sm text-neon-cyan/70 hover:text-neon-cyan transition-all duration-300 font-medium">Use Cases</a>
              <a href="#presets" className="text-sm text-neon-cyan/70 hover:text-neon-cyan transition-all duration-300 font-medium">Presets</a>
              <Link
                href="/app"
                className="px-6 py-2.5 bg-gradient-cyber text-white text-sm font-bold rounded-xl hover:shadow-neon hover:scale-105 transition-all duration-300"
              >
                Launch App →
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-neon-cyan hover:text-white transition-colors"
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
            <div className="md:hidden py-4 border-t border-neon-purple/30 backdrop-blur-xl">
              <div className="flex flex-col gap-4">
                <a href="#features" className="text-sm text-neon-cyan/70 hover:text-neon-cyan transition-colors" onClick={() => setIsMenuOpen(false)}>Features</a>
                <a href="#use-cases" className="text-sm text-neon-cyan/70 hover:text-neon-cyan transition-colors" onClick={() => setIsMenuOpen(false)}>Use Cases</a>
                <a href="#presets" className="text-sm text-neon-cyan/70 hover:text-neon-cyan transition-colors" onClick={() => setIsMenuOpen(false)}>Presets</a>
                <Link
                  href="/app"
                  className="px-6 py-3 bg-gradient-cyber text-white text-sm font-bold rounded-xl text-center shadow-neon"
                >
                  Launch App →
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-sm font-bold rounded-full mb-8 shadow-neon backdrop-blur-sm animate-scale-in">
            <span className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse shadow-neon" />
            100% Free • Powered by Claude AI
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-8 animate-slide-up">
            <span className="bg-gradient-to-r from-white via-neon-cyan to-white bg-clip-text text-transparent">
              Create Stunning
            </span>
            <br />
            <span className="bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent animate-shimmer bg-[length:200%_auto]">
              World Maps
            </span>
            <br />
            <span className="text-white">in Seconds</span>
          </h1>

          <p className="text-xl sm:text-2xl text-neon-cyan/70 max-w-3xl mx-auto mb-10 leading-relaxed animate-fade-in">
            Highlight countries, apply region presets, customize colors, and export
            <span className="text-neon-gold font-bold"> publication-ready maps</span>. Perfect for presentations, reports, and infographics.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 animate-scale-in">
            <Link
              href="/app"
              className="group px-10 py-5 bg-gradient-cyber text-white font-black text-lg rounded-2xl hover:shadow-neon hover:scale-110 transition-all duration-300 relative overflow-hidden"
            >
              <span className="relative z-10">Start Creating — It's Free</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </Link>
            <a
              href="#features"
              className="px-10 py-5 bg-void-800/50 backdrop-blur-sm text-neon-cyan border-2 border-neon-cyan/30 font-bold text-lg rounded-2xl hover:bg-void-800 hover:border-neon-cyan hover:shadow-neon transition-all duration-300"
            >
              See How It Works
            </a>
          </div>

          {/* Hero Visual - Futuristic Map Preview */}
          <div className="relative animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-t from-void-900 via-transparent to-transparent z-10 pointer-events-none" />
            <div className="bg-void-800/40 backdrop-blur-xl rounded-3xl shadow-glass p-6 sm:p-8 border-2 border-neon-purple/30 hover:border-neon-cyan/50 transition-all duration-500 group">
              <div className="aspect-video bg-gradient-to-br from-void-900 to-space-900 rounded-2xl flex items-center justify-center overflow-hidden relative">
                {/* Animated Grid Background */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(#00F5FF 1px, transparent 1px), linear-gradient(90deg, #00F5FF 1px, transparent 1px)", backgroundSize: "50px 50px" }} />
                </div>

                {/* Stylized map with glowing regions */}
                <svg viewBox="0 0 800 450" className="w-full h-full relative z-10">
                  <defs>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Grid lines */}
                  <line x1="100" y1="225" x2="700" y2="225" stroke="#00F5FF" strokeWidth="1" opacity="0.3" />
                  <line x1="400" y1="50" x2="400" y2="400" stroke="#00F5FF" strokeWidth="1" opacity="0.3" />

                  {/* Glowing regions */}
                  <ellipse cx="450" cy="220" rx="80" ry="100" fill="none" stroke="#00F5FF" strokeWidth="2" opacity="0.6" filter="url(#glow)" className="animate-pulse" />
                  <ellipse cx="250" cy="280" rx="60" ry="90" fill="none" stroke="#A855F7" strokeWidth="2" opacity="0.6" filter="url(#glow)" className="animate-pulse" style={{ animationDelay: "0.5s" }} />
                  <ellipse cx="420" cy="140" rx="50" ry="40" fill="none" stroke="#FFD700" strokeWidth="2" opacity="0.6" filter="url(#glow)" className="animate-pulse" style={{ animationDelay: "1s" }} />

                  {/* Animated markers */}
                  <circle cx="470" cy="200" r="8" fill="#00F5FF" className="animate-pulse" filter="url(#glow)" />
                  <circle cx="230" cy="300" r="8" fill="#A855F7" className="animate-pulse" style={{ animationDelay: "0.5s" }} filter="url(#glow)" />
                  <circle cx="430" cy="130" r="8" fill="#FFD700" className="animate-pulse" style={{ animationDelay: "1s" }} filter="url(#glow)" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-black mb-6">
              <span className="bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent">
                Everything You Need
              </span>
            </h2>
            <p className="text-xl text-neon-cyan/70 max-w-3xl mx-auto leading-relaxed">
              A complete toolkit for creating professional map visualizations without design skills or expensive software—
              <span className="text-neon-gold font-bold">powered by Claude AI</span>.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-8 rounded-2xl bg-void-800/40 backdrop-blur-xl border-2 border-neon-cyan/20 hover:border-neon-cyan/60 transition-all duration-500 hover:shadow-neon hover:scale-105 animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-neon group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-neon-cyan transition-colors">
                  {feature.title}
                </h3>
                <p className="text-neon-cyan/60 leading-relaxed group-hover:text-neon-cyan/80 transition-colors">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Presets Section */}
      <section id="presets" className="relative py-24 px-4 sm:px-6 bg-void-950/50">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black mb-6">
              <span className="bg-gradient-to-r from-neon-gold via-orange-500 to-neon-pink bg-clip-text text-transparent">
                14 Built-in Region Presets
              </span>
            </h2>
            <p className="text-xl text-neon-cyan/70 max-w-3xl mx-auto leading-relaxed">
              Select entire regions with one click. No need to remember which countries belong where—
              <span className="text-neon-purple font-bold">Claude's intelligence handles it</span>.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {presets.map((preset, index) => (
              <div
                key={index}
                className="group px-6 py-4 bg-void-800/60 backdrop-blur-xl rounded-2xl border-2 border-neon-cyan/20 hover:border-neon-cyan hover:shadow-neon transition-all duration-300 hover:scale-110 animate-scale-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${preset.gradient} shadow-neon`} />
                  <div>
                    <span className="font-bold text-white block group-hover:text-neon-cyan transition-colors">{preset.name}</span>
                    <span className="text-sm text-neon-cyan/50">{preset.count} countries</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-neon-purple/70 text-lg font-medium">
            + APAC, North America, Global South, OPEC, G7, Nordic...
          </p>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="relative py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-black mb-6">
              <span className="bg-gradient-to-r from-neon-emerald via-neon-cyan to-neon-blue bg-clip-text text-transparent">
                Built For Everyone
              </span>
            </h2>
            <p className="text-xl text-neon-cyan/70 max-w-3xl mx-auto leading-relaxed">
              Whether you're in business, education, or research—create maps that communicate powerfully.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase, index) => (
              <div
                key={index}
                className={`group p-8 rounded-2xl bg-gradient-to-br ${useCase.gradient} backdrop-blur-xl border-2 border-white/10 hover:border-white/30 transition-all duration-500 hover:scale-105 text-center animate-scale-in`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-6xl mb-4 group-hover:scale-125 transition-transform duration-300">{useCase.image}</div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {useCase.title}
                </h3>
                <p className="text-sm text-white/70 leading-relaxed group-hover:text-white/90 transition-colors">
                  {useCase.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="relative bg-void-800/60 backdrop-blur-2xl rounded-3xl p-12 sm:p-16 border-2 border-neon-cyan/30 hover:border-neon-purple/60 transition-all duration-500 shadow-glass overflow-hidden group">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/20 via-neon-purple/20 to-neon-pink/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10">
              <h2 className="text-4xl sm:text-5xl font-black mb-6 bg-gradient-to-r from-neon-cyan via-white to-neon-purple bg-clip-text text-transparent">
                Ready to Create Your Map?
              </h2>
              <p className="text-xl text-neon-cyan/70 mb-10 max-w-2xl mx-auto leading-relaxed">
                No account needed. No watermarks. No limits. Just open the app and start creating—
                <span className="text-neon-gold font-bold">powered by Claude AI</span>.
              </p>
              <Link
                href="/app"
                className="inline-flex items-center gap-3 px-12 py-6 bg-gradient-cyber text-white font-black text-xl rounded-2xl hover:shadow-neon hover:scale-110 transition-all duration-300 group"
              >
                Launch Region Map Generator
                <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-4 sm:px-6 border-t border-neon-cyan/20 bg-void-950/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-cyber flex items-center justify-center shadow-neon">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm text-neon-cyan/70">
                Region Map Generator • Built by{" "}
                <a href="https://linkedin.com/in/fareedkhankk" target="_blank" rel="noopener noreferrer" className="text-neon-gold hover:text-neon-cyan font-bold transition-colors">
                  Fareed Khan
                </a>
                {" "}with{" "}
                <span className="text-neon-purple font-bold">Claude AI</span>
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-neon-cyan/50">
              <span>© {new Date().getFullYear()}</span>
              <a href="#" className="hover:text-neon-cyan transition-colors">Privacy</a>
              <a href="#" className="hover:text-neon-cyan transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
