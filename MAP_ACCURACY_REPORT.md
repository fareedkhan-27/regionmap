# Map Accuracy Report

**Date**: December 2024  
**Review Scope**: Map data source, projection configuration, and country mapping accuracy

---

## Section 1: Map Data Source & Projection

### Data Source
- **TopoJSON Source**: `https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json`
- **Package**: world-atlas@2 (Natural Earth data)
- **Resolution**: 110m (1:110,000,000 scale)
- **Format**: TopoJSON converted to GeoJSON via `topojson-client`

### Country Identifier
- **Primary Identifier**: Feature `id` field (numeric)
- **ID Format**: ISO 3166-1 numeric codes (3-digit strings like "004", "008", etc.)
- **Special Cases**: Negative IDs for non-standard entities (e.g., Kosovo: `-99`)
- **Mapping Function**: `getISO2FromFeatureId()` in `src/utils/worldMap.ts`
  - Converts numeric ID → ISO2 code via `ISO_NUMERIC_TO_ISO2` lookup table
  - Handles padding (e.g., `4` → `"004"` → `"AF"`)
  - Handles negative IDs as strings (e.g., `-99` → `"XK"`)

### Projection Configuration
- **Projection Type**: `d3.geoNaturalEarth1()` (Natural Earth projection)
- **Configuration**:
  ```typescript
  d3.geoNaturalEarth1()
    .scale(width / 5.5)
    .translate([width / 2, height / 2])
  ```
- **SVG Alignment**:
  - SVG uses `viewBox="0 0 ${width} ${height}"`
  - Projection translate matches SVG center: `[width/2, height/2]`
  - Scale factor: `width / 5.5` (empirically tuned)
- **Transform Stack**:
  - Map paths and flight routes both rendered inside `<g ref={gRef}>`
  - Zoom transforms applied via D3 zoom behavior: `g.attr("transform", event.transform)`
  - ✅ **No misalignment from extra transforms** - both map and routes share same transform context

### Projection Consistency
- ✅ **Fixed in recent changes**: Projection is now memoized and shared between map paths and flight routes
- ✅ **Responsive**: Projection recalculates when `width`/`height` change
- ✅ **Single source of truth**: Both `pathGenerator` and flight route calculations use the same `projection` instance

---

## Section 2: Country Coverage Check

### Mapping Tables

#### 1. ISO_NUMERIC_TO_ISO2 (`src/utils/worldMap.ts`)
- **Purpose**: Maps TopoJSON numeric IDs → ISO2 codes
- **Count**: ~200+ entries
- **Coverage**: Includes standard ISO 3166-1 numeric codes + special cases (Kosovo: `-99`)

#### 2. COUNTRY_ALIASES (`src/data/countryAliases.ts`)
- **Purpose**: Maps user input (names, ISO2, ISO3, aliases) → ISO2 codes
- **Count**: 281 entries
- **Coverage**: Includes all UN member states + dependencies/territories

### Coverage Analysis

#### Countries in TopoJSON (Estimated)
The world-atlas@2 countries-110m.json typically contains:
- **~177-180** UN member states
- **~20-30** dependencies and territories
- **Total**: ~200-210 distinct features

**Note**: Exact count requires fetching and parsing the TopoJSON file. The mapping table `ISO_NUMERIC_TO_ISO2` suggests coverage of ~200+ countries/territories.

#### Countries in countryAliases.ts
- **Total entries**: 281
- **Breakdown**:
  - UN member states: ~193
  - Dependencies/territories: ~88
  - Includes special cases: Kosovo (XK), Palestine (PS), etc.

### Potential Gaps

#### Missing from ISO_NUMERIC_TO_ISO2 (Possible)
Based on common world-atlas coverage, these may be missing:

1. **French Territories** (may be included in world-atlas):
   - Mayotte (YT) - ISO numeric: 175
   - Saint Pierre and Miquelon (PM) - ISO numeric: 666
   - Wallis and Futuna (WF) - ISO numeric: 876

2. **British Territories**:
   - British Virgin Islands (VG) - ISO numeric: 092
   - Anguilla (AI) - ISO numeric: 660
   - Montserrat (MS) - ISO numeric: 500
   - Turks and Caicos (TC) - ISO numeric: 796

3. **Other Dependencies**:
   - Christmas Island (CX) - ISO numeric: 162
   - Cocos Islands (CC) - ISO numeric: 166
   - Norfolk Island (NF) - ISO numeric: 574
   - Pitcairn (PN) - ISO numeric: 612
   - Saint Helena (SH) - ISO numeric: 654
   - Tokelau (TK) - ISO numeric: 772

**Note**: These are *potential* gaps. Verification requires:
1. Fetching the actual TopoJSON file
2. Extracting all feature IDs
3. Comparing against `ISO_NUMERIC_TO_ISO2`

#### Missing from countryAliases.ts (Possible)
If TopoJSON includes territories not in `countryAliases.ts`, users won't be able to select them via text input, but they may still appear on the map.

### Suspicious Mappings

#### Verified Correct Mappings
- ✅ Kosovo (`-99` → `XK`) - Correctly handled as special case
- ✅ All major UN member states appear correctly mapped

#### Potential Issues (Requires Verification)
1. **Duplicate Numeric Codes**: 
   - Check: `ISO_NUMERIC_TO_ISO2` should have unique keys
   - Status: ✅ Appears unique (no duplicates visible in code)

2. **Missing Negative ID Handling**:
   - Current: Only `-99` (Kosovo) handled
   - Risk: If TopoJSON uses other negative IDs, they won't map correctly
   - Recommendation: Add defensive logging for unmapped IDs

3. **ISO2 Code Validation**:
   - Current: `getISO2FromFeatureId()` returns `null` for unmapped IDs
   - Impact: Countries with unmapped IDs won't be selectable/highlightable
   - Recommendation: Log unmapped IDs for investigation

---

## Section 3: Potential Minimal Fixes

### Fix 1: Add Missing Numeric Mappings (If Needed)
**File**: `src/utils/worldMap.ts`  
**Change**: Add any missing ISO numeric → ISO2 mappings found in TopoJSON  
**Risk**: Low - only adds mappings, doesn't change existing logic  
**Verification**: Fetch TopoJSON, extract all IDs, compare with `ISO_NUMERIC_TO_ISO2`

### Fix 2: Add Defensive Logging for Unmapped IDs
**File**: `src/components/WorldMap.tsx`  
**Change**: Add console warning when `getISO2FromFeatureId()` returns `null`  
**Code**:
```typescript
const iso2 = getISO2FromFeatureId(feature.id as string | number);
if (!iso2 && feature.id !== undefined) {
  console.warn(`Unmapped country ID in TopoJSON: ${feature.id}`, feature.properties);
}
```
**Risk**: Very Low - only adds logging  
**Benefit**: Helps identify missing mappings during development

### Fix 3: Add Missing Territories to countryAliases.ts (If Needed)
**File**: `src/data/countryAliases.ts`  
**Change**: Add any territories present in TopoJSON but missing from aliases  
**Risk**: Low - only adds entries  
**Verification**: Compare TopoJSON feature IDs → ISO2 → countryAliases.ts coverage

### Fix 4: Verify Projection Scale Factor
**File**: `src/utils/worldMap.ts`  
**Current**: `scale(width / 5.5)`  
**Note**: This is an empirical value. If map appears too small/large, adjust:
- Larger map: decrease divisor (e.g., `width / 5.0`)
- Smaller map: increase divisor (e.g., `width / 6.0`)
**Risk**: Low - only affects visual scale, not accuracy  
**Recommendation**: Keep current unless user reports sizing issues

### Fix 5: Add Type Safety for CountryProperties
**File**: `src/utils/geoDataCache.ts`  
**Current**: `interface CountryProperties { name: string; }`  
**Note**: TopoJSON may have additional properties (e.g., `iso_a2`, `iso_a3`)  
**Change**: Extend interface if needed:
```typescript
interface CountryProperties {
  name?: string;
  iso_a2?: string;
  iso_a3?: string;
  // ... other properties if present
}
```
**Risk**: Very Low - only adds type information  
**Benefit**: Better type safety and potential for alternative ID resolution

---

## Summary

### Projection Accuracy
✅ **EXCELLENT**: Projection setup is consistent and properly aligned
- Single projection instance shared between map and routes
- SVG viewBox matches projection dimensions
- No transform misalignment issues
- Projection recalculates correctly when dimensions change

### Country Mapping Accuracy
✅ **VERIFIED - 99.4% Coverage**: 
- **Total features in TopoJSON**: 177
- **Unique IDs**: 174
- **Mapped IDs**: 173/174 (99.4%)
- **Unmapped IDs**: 1 (ID "260" - French Southern and Antarctic Lands)

### Fixes Applied (December 2024)

#### ✅ Fix 1: Added Missing Numeric Mapping
- **File**: `src/utils/worldMap.ts`
- **Change**: Added `"260": "TF"` to `ISO_NUMERIC_TO_ISO2`
- **Result**: 100% mapping coverage achieved

#### ✅ Fix 2: Added Missing Territory to countryAliases.ts
- **File**: `src/data/countryAliases.ts`
- **Change**: Added French Southern and Antarctic Lands (TF/ATF)
- **Result**: All mapped countries now have aliases

#### ✅ Fix 3: Added Defensive Logging
- **File**: `src/components/WorldMap.tsx`
- **Change**: Added console warning for unmapped IDs (development mode only)
- **Result**: Future unmapped IDs will be logged for investigation

### Final Status
- ✅ **100% TopoJSON Coverage**: All 174 unique IDs now mapped
- ✅ **Complete Alias Coverage**: All mapped ISO2 codes have entries in countryAliases.ts
- ✅ **Defensive Logging**: Unmapped IDs will be logged in development mode

---

## Verification Results (Completed)

### Analysis Performed
1. ✅ **Fetched TopoJSON**: Retrieved from `https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json`
2. ✅ **Extracted Feature IDs**: Found 177 features, 174 unique IDs
3. ✅ **Compared with Mappings**: Identified 1 missing mapping (ID "260")
4. ✅ **Verified countryAliases.ts**: Confirmed all mapped ISO2 codes have entries

### Findings
- **TopoJSON Structure**:
  - IDs are strings (e.g., "004", "260")
  - Properties only contain `name` field
  - No embedded ISO codes in properties
  - No negative IDs in this dataset

- **Coverage**:
  - 173/174 IDs were already mapped (99.4%)
  - 1 missing mapping identified and fixed: "260" → "TF"
  - All mapped ISO2 codes exist in countryAliases.ts

### Files Modified
1. `src/utils/worldMap.ts` - Added "260": "TF" mapping
2. `src/data/countryAliases.ts` - Added French Southern and Antarctic Lands entry
3. `src/components/WorldMap.tsx` - Added defensive logging for unmapped IDs

### Build Status
✅ All changes compile successfully  
✅ No linter errors  
✅ Type checking passes

---

**End of Report**

