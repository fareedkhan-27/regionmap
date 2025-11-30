# Region Map Generator

A responsive web application for creating custom world maps with highlighted regions. Built with Next.js 14, React, D3.js, and TypeScript.

![Region Map Generator](./preview.png)

## Features

- **Real World Map**: Uses accurate TopoJSON world atlas data from Natural Earth
- **Global Country Recognition**: Supports country names, ISO2 codes, ISO3 codes, and common aliases
- **Two Selection Modes**:
  - **Single Color**: Highlight all selected countries with one color
  - **Multi-Group**: Create multiple groups with different colors
- **Region Presets**: Quick selection for MEA, LATAM, EU, CEE, GCC, APAC, BRICS, G7, G20, and more
- **Auto-Zoom**: Automatically zooms to selected regions
- **Dark Mode**: Full dark mode support
- **High-Quality Export**: Export as PNG or JPG in 1080p, 4K, or square format
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Map Rendering**: D3.js (d3-geo, d3-zoom)
- **Data Format**: TopoJSON (world-atlas)
- **Export**: Canvas API

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd region-map-generator

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── globals.css      # Global styles with Tailwind
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Main page
├── components/
│   ├── MapApp.tsx       # Main application component
│   ├── WorldMap.tsx     # D3-based world map renderer
│   ├── ControlsPanel.tsx# Controls sidebar
│   ├── GroupsPanel.tsx  # Multi-group management
│   ├── PresetsBar.tsx   # Region preset buttons
│   ├── Legend.tsx       # Map legend
│   └── ExportPanel.tsx  # Export settings & buttons
├── data/
│   ├── countryAliases.ts # Country name/code mappings
│   └── regionPresets.ts  # Pre-defined region selections
├── hooks/
│   └── useMapConfig.ts   # Map configuration state management
├── types/
│   └── map.ts           # TypeScript type definitions
└── utils/
    ├── parseCountryInput.ts  # Input parsing & validation
    ├── worldMap.ts          # D3 projection utilities
    └── exportImage.ts       # PNG/JPG export logic
```

## Usage

### Selecting Countries

Enter country names or codes in the text area, separated by commas or newlines:

```
India, UAE, Brazil, France
IN, AE, BR, FR
IND, ARE, BRA, FRA
```

All of these formats work and can be mixed.

### Supported Input Formats

- **Full Names**: "United States", "United Arab Emirates"
- **Common Names**: "USA", "UAE", "UK"
- **ISO2 Codes**: "US", "AE", "GB"
- **ISO3 Codes**: "USA", "ARE", "GBR"
- **Aliases**: "America", "Emirates", "Britain"

### Region Presets

Click any preset button to quickly select:

| Preset | Description |
|--------|-------------|
| MEA | Middle East & Africa |
| LATAM | Latin America & Caribbean |
| EU | European Union (27 members) |
| CEE | Central & Eastern Europe |
| GCC | Gulf Cooperation Council |
| Global South | Developing & Emerging Markets |
| APAC | Asia-Pacific |
| NA | North America |
| BRICS | BRICS Nations (expanded) |
| G7 | Group of Seven |
| G20 | Group of Twenty |
| Nordic | Nordic Countries |
| ASEAN | Southeast Asian Nations |
| OPEC | Petroleum Exporting Countries |

### Multi-Group Mode

1. Switch to "Multi-Group" mode
2. Click on a group card to select it
3. Add countries to the selected group
4. Click "+ Add Group" for additional groups
5. Each group can have its own color

### Exporting

1. Go to the "Export" tab
2. Set optional title and subtitle
3. Choose resolution (1080p, 4K, or Square)
4. Select background (transparent or solid)
5. Click "Export PNG" or "Export JPG"

## API Reference

### useMapConfig Hook

```typescript
const {
  config,           // Current map configuration
  setMode,          // Switch between 'single' and 'multi' mode
  addGroup,         // Add a new group
  removeGroup,      // Remove a group by ID
  updateGroup,      // Update group properties
  setGroupCountries,// Set countries for a group
  applyPreset,      // Apply a region preset
  clearAllCountries,// Clear all selections
  setTitleConfig,   // Update title settings
  setBackground,    // Update background settings
  setBorderColor,   // Set country border color
  setResolution,    // Set export resolution
  allSelectedCountries,  // All selected country codes
  countryColorMap,  // Map of country code -> color
  hasSelection,     // Boolean: has any selection
} = useMapConfig();
```

### Country Resolution

```typescript
import { resolveCountryToken } from '@/data/countryAliases';

// Returns ISO2 code or null
resolveCountryToken('India');    // 'IN'
resolveCountryToken('UAE');      // 'AE'
resolveCountryToken('deu');      // 'DE'
resolveCountryToken('invalid');  // null
```

## Customization

### Adding New Presets

Edit `src/data/regionPresets.ts`:

```typescript
export const REGION_PRESETS: RegionPreset[] = [
  // ... existing presets
  {
    id: "my_preset",
    name: "My Preset",
    description: "Description here",
    countries: ["US", "CA", "MX"], // ISO2 codes
  },
];
```

### Adding Country Aliases

Edit `src/data/countryAliases.ts`:

```typescript
{
  iso2: "XX",
  iso3: "XXX",
  name: "Country Name",
  aliases: ["country name", "xx", "xxx", "other alias"],
}
```

### Theming

The app uses Tailwind CSS with custom colors defined in `tailwind.config.ts`. Main color schemes:

- `cream`: Light mode neutrals
- `ink`: Dark mode neutrals  
- `accent.teal`: Primary accent
- `accent.coral`: Error/warning
- `accent.gold`: Highlight
- `accent.sage`: Secondary accent

## Browser Support

- Chrome 90+
- Firefox 90+
- Safari 14+
- Edge 90+

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run lint` and `npm run build`
5. Submit a pull request

## Acknowledgments

- World map data from [Natural Earth](https://www.naturalearthdata.com/)
- TopoJSON from [world-atlas](https://github.com/topojson/world-atlas)
- D3.js for powerful geo projections
