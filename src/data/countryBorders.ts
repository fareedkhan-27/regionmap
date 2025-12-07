// src/data/countryBorders.ts
// Country border relationships - which countries share borders
// Based on real-world geographic borders

import type { CountryCode } from "@/types/map";

export const COUNTRY_BORDERS: Record<CountryCode, CountryCode[]> = {
  // Middle East
  "AE": ["SA", "OM"],
  "SA": ["AE", "QA", "BH", "KW", "OM", "IQ", "JO", "YE"],
  "QA": ["SA"],
  "BH": ["SA"],
  "KW": ["SA", "IQ"],
  "OM": ["AE", "SA", "YE"],
  "YE": ["SA", "OM"],
  "IQ": ["SA", "KW", "IR", "TR", "SY", "JO"],
  "IR": ["IQ", "TR", "AF", "PK", "AM", "AZ", "TM"],
  "JO": ["SA", "IQ", "SY", "IL", "PS"],
  "SY": ["IQ", "JO", "IL", "LB", "TR"],
  "LB": ["SY", "IL"],
  "IL": ["JO", "SY", "LB", "PS", "EG"],
  "PS": ["IL", "JO", "EG"],
  "TR": ["IQ", "IR", "SY", "GR", "BG", "GE", "AM", "AZ"],
  
  // Europe
  "FR": ["ES", "IT", "CH", "DE", "BE", "LU", "AD", "MC"],
  "DE": ["FR", "BE", "NL", "DK", "PL", "CZ", "AT", "CH", "LU"],
  "IT": ["FR", "CH", "AT", "SI", "SM", "VA"],
  "ES": ["FR", "PT", "AD"],
  "PT": ["ES"],
  "GB": ["IE"],
  "IE": ["GB"],
  "NL": ["DE", "BE"],
  "BE": ["FR", "DE", "NL", "LU"],
  "CH": ["FR", "DE", "IT", "AT", "LI"],
  "AT": ["DE", "IT", "CH", "SI", "HU", "CZ", "SK"],
  "PL": ["DE", "CZ", "SK", "UA", "BY", "LT"],
  "CZ": ["DE", "AT", "SK", "PL"],
  "SK": ["CZ", "AT", "PL", "UA", "HU"],
  "HU": ["AT", "SK", "UA", "RO", "RS", "HR", "SI"],
  "RO": ["HU", "UA", "MD", "BG", "RS"],
  "BG": ["RO", "RS", "MK", "GR", "TR"],
  "GR": ["BG", "MK", "AL", "TR"],
  "RS": ["HU", "RO", "BG", "MK", "AL", "ME", "BA", "HR"],
  "HR": ["HU", "SI", "BA", "RS", "IT"],
  "SI": ["IT", "AT", "HU", "HR"],
  "BA": ["HR", "RS", "ME"],
  "ME": ["BA", "RS", "AL"],
  "AL": ["ME", "RS", "MK", "GR"],
  "MK": ["AL", "RS", "BG", "GR"],
  "UA": ["PL", "SK", "HU", "RO", "MD", "BY", "RU"],
  "BY": ["PL", "LT", "LV", "RU", "UA"],
  "RU": ["UA", "BY", "EE", "LV", "LT", "PL", "NO", "FI", "GE", "AZ", "KZ", "CN", "MN", "KP", "JP"],
  "FI": ["RU", "SE", "NO"],
  "SE": ["FI", "NO", "DK"],
  "NO": ["RU", "FI", "SE", "DK"],
  "DK": ["DE", "SE", "NO"],
  "EE": ["RU", "LV"],
  "LV": ["RU", "BY", "EE", "LT"],
  "LT": ["RU", "BY", "LV", "PL"],
  "MD": ["RO", "UA"],
  "GE": ["RU", "TR", "AM", "AZ"],
  "AM": ["GE", "AZ", "IR", "TR"],
  "AZ": ["GE", "AM", "IR", "RU", "TR"],
  
  // Asia
  "CN": ["RU", "MN", "KP", "LA", "MM", "VN", "IN", "PK", "AF", "TJ", "KZ", "KG"],
  "IN": ["CN", "PK", "AF", "NP", "BT", "BD", "MM", "LK"],
  "PK": ["CN", "IN", "AF", "IR"],
  "AF": ["CN", "PK", "IR", "TJ", "UZ", "TM"],
  "BD": ["IN", "MM"],
  "MM": ["CN", "IN", "BD", "LA", "TH"],
  "TH": ["MM", "LA", "KH", "MY"],
  "LA": ["CN", "MM", "TH", "VN", "KH"],
  "VN": ["CN", "LA", "KH", "TH"],
  "KH": ["TH", "LA", "VN"],
  "MY": ["TH", "SG", "BN", "ID"],
  "SG": ["MY"],
  "BN": ["MY"],
  "ID": ["MY", "PG", "TL", "PH"],
  "PH": ["ID"],
  "JP": ["RU", "KR", "CN"],
  "KR": ["KP", "CN", "JP"],
  "KP": ["CN", "KR", "RU"],
  "MN": ["CN", "RU"],
  "KZ": ["RU", "CN", "KG", "UZ", "TM"],
  "UZ": ["AF", "KZ", "KG", "TJ", "TM"],
  "KG": ["CN", "KZ", "UZ", "TJ"],
  "TJ": ["CN", "AF", "UZ", "KG"],
  "TM": ["AF", "IR", "KZ", "UZ"],
  "NP": ["IN", "CN"],
  "BT": ["IN", "CN"],
  "LK": ["IN"],
  
  // Africa
  "EG": ["LY", "SD", "IL", "PS"],
  "LY": ["EG", "TN", "DZ", "NE", "TD", "SD"],
  "TN": ["LY", "DZ"],
  "DZ": ["TN", "LY", "NE", "ML", "MR", "MA", "EH"],
  "MA": ["DZ", "EH", "ES"],
  "SD": ["EG", "LY", "TD", "CF", "SS", "ET", "ER"],
  "ET": ["SD", "ER", "DJ", "SO", "KE"],
  "ER": ["SD", "ET", "DJ"],
  "DJ": ["ER", "ET", "SO"],
  "SO": ["DJ", "ET", "KE"],
  "KE": ["ET", "SO", "UG", "TZ", "SS"],
  "UG": ["KE", "SS", "CD", "RW", "TZ"],
  "TZ": ["KE", "UG", "RW", "BI", "CD", "ZM", "MW", "MZ"],
  "RW": ["UG", "TZ", "BI", "CD"],
  "BI": ["RW", "TZ", "CD"],
  "CD": ["UG", "RW", "BI", "TZ", "ZM", "AO", "CF", "SS", "CM", "CG"],
  "SS": ["SD", "ET", "KE", "UG", "CD", "CF"],
  "CF": ["CD", "SS", "SD", "TD", "CM"],
  "TD": ["LY", "SD", "CF", "CM", "NG", "NE"],
  "CM": ["NG", "TD", "CF", "CG", "GQ", "GA", "CD"],
  "NG": ["TD", "CM", "NE", "BJ"],
  "NE": ["DZ", "LY", "TD", "NG", "BJ", "BF", "ML"],
  "ML": ["DZ", "NE", "BF", "CI", "GN", "SN", "MR"],
  "SN": ["ML", "MR", "GM", "GN", "GW"],
  "MR": ["DZ", "ML", "SN", "MA", "EH"],
  "GM": ["SN"],
  "GW": ["SN", "GN"],
  "GN": ["ML", "SN", "GW", "CI", "LR", "SL"],
  "SL": ["GN", "LR"],
  "LR": ["GN", "SL", "CI"],
  "CI": ["ML", "GN", "LR", "BF", "GH"],
  "BF": ["ML", "NE", "NG", "BJ", "TG", "GH", "CI"],
  "GH": ["CI", "BF", "TG"],
  "TG": ["GH", "BF", "BJ"],
  "BJ": ["NG", "NE", "BF", "TG"],
  "AO": ["CD", "ZM", "NA", "CG"],
  "CG": ["CD", "CM", "CF", "GA", "AO"],
  "GA": ["CM", "CG", "GQ"],
  "GQ": ["CM", "GA"],
  "ZM": ["CD", "TZ", "MW", "MZ", "ZW", "NA", "AO"],
  "MW": ["ZM", "TZ", "MZ"],
  "MZ": ["ZM", "MW", "TZ", "ZW", "ZA", "SZ"],
  "ZW": ["ZM", "MZ", "ZA", "BW"],
  "BW": ["ZW", "ZA", "NA"],
  "ZA": ["ZW", "BW", "NA", "SZ", "MZ", "LS"],
  "NA": ["ZA", "BW", "ZM", "AO"],
  "SZ": ["ZA", "MZ"],
  "LS": ["ZA"],
  
  // Americas
  "US": ["CA", "MX"],
  "CA": ["US"],
  "MX": ["US", "GT", "BZ"],
  "GT": ["MX", "BZ", "HN", "SV"],
  "BZ": ["MX", "GT"],
  "HN": ["GT", "SV", "NI"],
  "SV": ["GT", "HN"],
  "NI": ["HN", "CR"],
  "CR": ["NI", "PA"],
  "PA": ["CR", "CO"],
  "CO": ["PA", "VE", "BR", "PE", "EC"],
  "VE": ["CO", "BR", "GY"],
  "GY": ["VE", "BR", "SR"],
  "SR": ["GY", "BR", "GF"],
  "GF": ["SR", "BR"],
  "BR": ["CO", "VE", "GY", "SR", "GF", "PE", "BO", "PY", "AR", "UY"],
  "PE": ["CO", "EC", "BR", "BO", "CL"],
  "EC": ["CO", "PE"],
  "BO": ["PE", "BR", "PY", "AR", "CL"],
  "PY": ["BR", "BO", "AR"],
  "AR": ["BR", "PY", "BO", "CL", "UY"],
  "CL": ["PE", "BO", "AR"],
  "UY": ["BR", "AR"],
  
  // Islands (no land borders)
  "MG": [],
  "MU": [],
  "SC": [],
  "KM": [],
  "CV": [],
  "FJ": [],
  "NC": [],
  "PF": [],
  "IS": [],
  "MT": [],
  "CY": [],
};

/**
 * Get all countries that border a given country
 */
export function getNeighboringCountries(country: CountryCode): CountryCode[] {
  return COUNTRY_BORDERS[country] || [];
}

/**
 * Get all countries that border any of the selected countries
 * Excludes countries already in the selection
 */
export function getAllNeighbors(selected: CountryCode[]): CountryCode[] {
  const neighbors = new Set<CountryCode>();
  
  selected.forEach(country => {
    const borders = getNeighboringCountries(country);
    borders.forEach(neighbor => neighbors.add(neighbor));
  });
  
  // Remove countries that are already selected
  return Array.from(neighbors).filter(n => !selected.includes(n));
}

/**
 * Check if two countries share a border
 */
export function areNeighbors(country1: CountryCode, country2: CountryCode): boolean {
  const borders = getNeighboringCountries(country1);
  return borders.includes(country2);
}

