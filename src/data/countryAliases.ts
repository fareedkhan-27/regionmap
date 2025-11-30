// Comprehensive country alias mapping for global coverage
// Each country includes ISO2, ISO3, primary name, and all acceptable input aliases

export interface CountryAlias {
  iso2: string;
  iso3: string;
  name: string;
  aliases: string[];
}

export const COUNTRY_ALIASES: CountryAlias[] = [
  // A
  { iso2: "AF", iso3: "AFG", name: "Afghanistan", aliases: ["afghanistan", "af", "afg"] },
  { iso2: "AL", iso3: "ALB", name: "Albania", aliases: ["albania", "al", "alb", "shqipëri", "shqiperia"] },
  { iso2: "DZ", iso3: "DZA", name: "Algeria", aliases: ["algeria", "dz", "dza", "algérie", "algerie", "الجزائر"] },
  { iso2: "AD", iso3: "AND", name: "Andorra", aliases: ["andorra", "ad", "and"] },
  { iso2: "AO", iso3: "AGO", name: "Angola", aliases: ["angola", "ao", "ago"] },
  { iso2: "AG", iso3: "ATG", name: "Antigua and Barbuda", aliases: ["antigua and barbuda", "antigua", "barbuda", "ag", "atg"] },
  { iso2: "AR", iso3: "ARG", name: "Argentina", aliases: ["argentina", "ar", "arg"] },
  { iso2: "AM", iso3: "ARM", name: "Armenia", aliases: ["armenia", "am", "arm", "հայdelays"] },
  { iso2: "AU", iso3: "AUS", name: "Australia", aliases: ["australia", "au", "aus", "oz", "aussie"] },
  { iso2: "AT", iso3: "AUT", name: "Austria", aliases: ["austria", "at", "aut", "österreich", "osterreich"] },
  { iso2: "AZ", iso3: "AZE", name: "Azerbaijan", aliases: ["azerbaijan", "az", "aze", "azərbaycan"] },
  
  // B
  { iso2: "BS", iso3: "BHS", name: "Bahamas", aliases: ["bahamas", "the bahamas", "bs", "bhs"] },
  { iso2: "BH", iso3: "BHR", name: "Bahrain", aliases: ["bahrain", "bh", "bhr", "البحرين"] },
  { iso2: "BD", iso3: "BGD", name: "Bangladesh", aliases: ["bangladesh", "bd", "bgd", "বাংলাদেশ"] },
  { iso2: "BB", iso3: "BRB", name: "Barbados", aliases: ["barbados", "bb", "brb"] },
  { iso2: "BY", iso3: "BLR", name: "Belarus", aliases: ["belarus", "by", "blr", "беларусь", "byelorussia"] },
  { iso2: "BE", iso3: "BEL", name: "Belgium", aliases: ["belgium", "be", "bel", "belgique", "belgië", "belgie"] },
  { iso2: "BZ", iso3: "BLZ", name: "Belize", aliases: ["belize", "bz", "blz"] },
  { iso2: "BJ", iso3: "BEN", name: "Benin", aliases: ["benin", "bj", "ben", "bénin"] },
  { iso2: "BT", iso3: "BTN", name: "Bhutan", aliases: ["bhutan", "bt", "btn"] },
  { iso2: "BO", iso3: "BOL", name: "Bolivia", aliases: ["bolivia", "bo", "bol", "plurinational state of bolivia"] },
  { iso2: "BA", iso3: "BIH", name: "Bosnia and Herzegovina", aliases: ["bosnia and herzegovina", "bosnia", "herzegovina", "ba", "bih", "bosna i hercegovina"] },
  { iso2: "BW", iso3: "BWA", name: "Botswana", aliases: ["botswana", "bw", "bwa"] },
  { iso2: "BR", iso3: "BRA", name: "Brazil", aliases: ["brazil", "br", "bra", "brasil"] },
  { iso2: "BN", iso3: "BRN", name: "Brunei", aliases: ["brunei", "bn", "brn", "brunei darussalam"] },
  { iso2: "BG", iso3: "BGR", name: "Bulgaria", aliases: ["bulgaria", "bg", "bgr", "българия"] },
  { iso2: "BF", iso3: "BFA", name: "Burkina Faso", aliases: ["burkina faso", "burkina", "bf", "bfa"] },
  { iso2: "BI", iso3: "BDI", name: "Burundi", aliases: ["burundi", "bi", "bdi"] },
  
  // C
  { iso2: "CV", iso3: "CPV", name: "Cabo Verde", aliases: ["cabo verde", "cape verde", "cv", "cpv"] },
  { iso2: "KH", iso3: "KHM", name: "Cambodia", aliases: ["cambodia", "kh", "khm", "kampuchea"] },
  { iso2: "CM", iso3: "CMR", name: "Cameroon", aliases: ["cameroon", "cm", "cmr", "cameroun"] },
  { iso2: "CA", iso3: "CAN", name: "Canada", aliases: ["canada", "ca", "can"] },
  { iso2: "CF", iso3: "CAF", name: "Central African Republic", aliases: ["central african republic", "car", "cf", "caf", "centrafrique"] },
  { iso2: "TD", iso3: "TCD", name: "Chad", aliases: ["chad", "td", "tcd", "tchad"] },
  { iso2: "CL", iso3: "CHL", name: "Chile", aliases: ["chile", "cl", "chl"] },
  { iso2: "CN", iso3: "CHN", name: "China", aliases: ["china", "cn", "chn", "prc", "people's republic of china", "中国"] },
  { iso2: "CO", iso3: "COL", name: "Colombia", aliases: ["colombia", "co", "col"] },
  { iso2: "KM", iso3: "COM", name: "Comoros", aliases: ["comoros", "km", "com", "comores"] },
  { iso2: "CG", iso3: "COG", name: "Congo", aliases: ["congo", "republic of the congo", "congo-brazzaville", "cg", "cog"] },
  { iso2: "CD", iso3: "COD", name: "Democratic Republic of the Congo", aliases: ["democratic republic of the congo", "drc", "dr congo", "congo-kinshasa", "zaire", "cd", "cod"] },
  { iso2: "CR", iso3: "CRI", name: "Costa Rica", aliases: ["costa rica", "cr", "cri"] },
  { iso2: "CI", iso3: "CIV", name: "Côte d'Ivoire", aliases: ["côte d'ivoire", "cote d'ivoire", "ivory coast", "ci", "civ"] },
  { iso2: "HR", iso3: "HRV", name: "Croatia", aliases: ["croatia", "hr", "hrv", "hrvatska"] },
  { iso2: "CU", iso3: "CUB", name: "Cuba", aliases: ["cuba", "cu", "cub"] },
  { iso2: "CY", iso3: "CYP", name: "Cyprus", aliases: ["cyprus", "cy", "cyp", "κύπρος"] },
  { iso2: "CZ", iso3: "CZE", name: "Czechia", aliases: ["czechia", "czech republic", "cz", "cze", "česko", "cesko"] },
  
  // D
  { iso2: "DK", iso3: "DNK", name: "Denmark", aliases: ["denmark", "dk", "dnk", "danmark"] },
  { iso2: "DJ", iso3: "DJI", name: "Djibouti", aliases: ["djibouti", "dj", "dji"] },
  { iso2: "DM", iso3: "DMA", name: "Dominica", aliases: ["dominica", "dm", "dma"] },
  { iso2: "DO", iso3: "DOM", name: "Dominican Republic", aliases: ["dominican republic", "do", "dom", "república dominicana", "republica dominicana"] },
  
  // E
  { iso2: "EC", iso3: "ECU", name: "Ecuador", aliases: ["ecuador", "ec", "ecu"] },
  { iso2: "EG", iso3: "EGY", name: "Egypt", aliases: ["egypt", "eg", "egy", "مصر", "misr"] },
  { iso2: "SV", iso3: "SLV", name: "El Salvador", aliases: ["el salvador", "salvador", "sv", "slv"] },
  { iso2: "GQ", iso3: "GNQ", name: "Equatorial Guinea", aliases: ["equatorial guinea", "gq", "gnq", "guinea ecuatorial"] },
  { iso2: "ER", iso3: "ERI", name: "Eritrea", aliases: ["eritrea", "er", "eri"] },
  { iso2: "EE", iso3: "EST", name: "Estonia", aliases: ["estonia", "ee", "est", "eesti"] },
  { iso2: "SZ", iso3: "SWZ", name: "Eswatini", aliases: ["eswatini", "swaziland", "sz", "swz"] },
  { iso2: "ET", iso3: "ETH", name: "Ethiopia", aliases: ["ethiopia", "et", "eth"] },
  
  // F
  { iso2: "FJ", iso3: "FJI", name: "Fiji", aliases: ["fiji", "fj", "fji"] },
  { iso2: "FI", iso3: "FIN", name: "Finland", aliases: ["finland", "fi", "fin", "suomi"] },
  { iso2: "FR", iso3: "FRA", name: "France", aliases: ["france", "fr", "fra"] },
  
  // G
  { iso2: "GA", iso3: "GAB", name: "Gabon", aliases: ["gabon", "ga", "gab"] },
  { iso2: "GM", iso3: "GMB", name: "Gambia", aliases: ["gambia", "the gambia", "gm", "gmb"] },
  { iso2: "GE", iso3: "GEO", name: "Georgia", aliases: ["georgia", "ge", "geo", "საქართველო"] },
  { iso2: "DE", iso3: "DEU", name: "Germany", aliases: ["germany", "de", "deu", "deutschland"] },
  { iso2: "GH", iso3: "GHA", name: "Ghana", aliases: ["ghana", "gh", "gha"] },
  { iso2: "GR", iso3: "GRC", name: "Greece", aliases: ["greece", "gr", "grc", "hellas", "ελλάδα"] },
  { iso2: "GD", iso3: "GRD", name: "Grenada", aliases: ["grenada", "gd", "grd"] },
  { iso2: "GT", iso3: "GTM", name: "Guatemala", aliases: ["guatemala", "gt", "gtm"] },
  { iso2: "GN", iso3: "GIN", name: "Guinea", aliases: ["guinea", "gn", "gin", "guinée", "guinee"] },
  { iso2: "GW", iso3: "GNB", name: "Guinea-Bissau", aliases: ["guinea-bissau", "guinea bissau", "gw", "gnb"] },
  { iso2: "GY", iso3: "GUY", name: "Guyana", aliases: ["guyana", "gy", "guy"] },
  
  // H
  { iso2: "HT", iso3: "HTI", name: "Haiti", aliases: ["haiti", "ht", "hti", "haïti"] },
  { iso2: "HN", iso3: "HND", name: "Honduras", aliases: ["honduras", "hn", "hnd"] },
  { iso2: "HU", iso3: "HUN", name: "Hungary", aliases: ["hungary", "hu", "hun", "magyarország", "magyarorszag"] },
  
  // I
  { iso2: "IS", iso3: "ISL", name: "Iceland", aliases: ["iceland", "is", "isl", "ísland", "island"] },
  { iso2: "IN", iso3: "IND", name: "India", aliases: ["india", "in", "ind", "भारत", "bharat"] },
  { iso2: "ID", iso3: "IDN", name: "Indonesia", aliases: ["indonesia", "id", "idn"] },
  { iso2: "IR", iso3: "IRN", name: "Iran", aliases: ["iran", "ir", "irn", "islamic republic of iran", "persia", "ایران"] },
  { iso2: "IQ", iso3: "IRQ", name: "Iraq", aliases: ["iraq", "iq", "irq", "العراق"] },
  { iso2: "IE", iso3: "IRL", name: "Ireland", aliases: ["ireland", "ie", "irl", "éire", "eire"] },
  { iso2: "IL", iso3: "ISR", name: "Israel", aliases: ["israel", "il", "isr", "ישראל"] },
  { iso2: "IT", iso3: "ITA", name: "Italy", aliases: ["italy", "it", "ita", "italia"] },
  
  // J
  { iso2: "JM", iso3: "JAM", name: "Jamaica", aliases: ["jamaica", "jm", "jam"] },
  { iso2: "JP", iso3: "JPN", name: "Japan", aliases: ["japan", "jp", "jpn", "日本", "nippon", "nihon"] },
  { iso2: "JO", iso3: "JOR", name: "Jordan", aliases: ["jordan", "jo", "jor", "الأردن"] },
  
  // K
  { iso2: "KZ", iso3: "KAZ", name: "Kazakhstan", aliases: ["kazakhstan", "kz", "kaz", "қазақстан"] },
  { iso2: "KE", iso3: "KEN", name: "Kenya", aliases: ["kenya", "ke", "ken"] },
  { iso2: "KI", iso3: "KIR", name: "Kiribati", aliases: ["kiribati", "ki", "kir"] },
  { iso2: "KP", iso3: "PRK", name: "North Korea", aliases: ["north korea", "dprk", "kp", "prk", "democratic people's republic of korea"] },
  { iso2: "KR", iso3: "KOR", name: "South Korea", aliases: ["south korea", "korea", "kr", "kor", "republic of korea", "rok", "한국"] },
  { iso2: "KW", iso3: "KWT", name: "Kuwait", aliases: ["kuwait", "kw", "kwt", "الكويت"] },
  { iso2: "KG", iso3: "KGZ", name: "Kyrgyzstan", aliases: ["kyrgyzstan", "kg", "kgz", "кыргызстан"] },
  
  // L
  { iso2: "LA", iso3: "LAO", name: "Laos", aliases: ["laos", "la", "lao", "lao pdr", "lao people's democratic republic"] },
  { iso2: "LV", iso3: "LVA", name: "Latvia", aliases: ["latvia", "lv", "lva", "latvija"] },
  { iso2: "LB", iso3: "LBN", name: "Lebanon", aliases: ["lebanon", "lb", "lbn", "لبنان", "lubnan"] },
  { iso2: "LS", iso3: "LSO", name: "Lesotho", aliases: ["lesotho", "ls", "lso"] },
  { iso2: "LR", iso3: "LBR", name: "Liberia", aliases: ["liberia", "lr", "lbr"] },
  { iso2: "LY", iso3: "LBY", name: "Libya", aliases: ["libya", "ly", "lby", "ليبيا"] },
  { iso2: "LI", iso3: "LIE", name: "Liechtenstein", aliases: ["liechtenstein", "li", "lie"] },
  { iso2: "LT", iso3: "LTU", name: "Lithuania", aliases: ["lithuania", "lt", "ltu", "lietuva"] },
  { iso2: "LU", iso3: "LUX", name: "Luxembourg", aliases: ["luxembourg", "lu", "lux", "luxemburg"] },
  
  // M
  { iso2: "MG", iso3: "MDG", name: "Madagascar", aliases: ["madagascar", "mg", "mdg"] },
  { iso2: "MW", iso3: "MWI", name: "Malawi", aliases: ["malawi", "mw", "mwi"] },
  { iso2: "MY", iso3: "MYS", name: "Malaysia", aliases: ["malaysia", "my", "mys"] },
  { iso2: "MV", iso3: "MDV", name: "Maldives", aliases: ["maldives", "mv", "mdv"] },
  { iso2: "ML", iso3: "MLI", name: "Mali", aliases: ["mali", "ml", "mli"] },
  { iso2: "MT", iso3: "MLT", name: "Malta", aliases: ["malta", "mt", "mlt"] },
  { iso2: "MH", iso3: "MHL", name: "Marshall Islands", aliases: ["marshall islands", "mh", "mhl"] },
  { iso2: "MR", iso3: "MRT", name: "Mauritania", aliases: ["mauritania", "mr", "mrt", "موريتانيا"] },
  { iso2: "MU", iso3: "MUS", name: "Mauritius", aliases: ["mauritius", "mu", "mus"] },
  { iso2: "MX", iso3: "MEX", name: "Mexico", aliases: ["mexico", "mx", "mex", "méxico"] },
  { iso2: "FM", iso3: "FSM", name: "Micronesia", aliases: ["micronesia", "federated states of micronesia", "fm", "fsm"] },
  { iso2: "MD", iso3: "MDA", name: "Moldova", aliases: ["moldova", "md", "mda", "republic of moldova"] },
  { iso2: "MC", iso3: "MCO", name: "Monaco", aliases: ["monaco", "mc", "mco"] },
  { iso2: "MN", iso3: "MNG", name: "Mongolia", aliases: ["mongolia", "mn", "mng", "монгол"] },
  { iso2: "ME", iso3: "MNE", name: "Montenegro", aliases: ["montenegro", "me", "mne", "crna gora"] },
  { iso2: "MA", iso3: "MAR", name: "Morocco", aliases: ["morocco", "ma", "mar", "المغرب", "maroc"] },
  { iso2: "MZ", iso3: "MOZ", name: "Mozambique", aliases: ["mozambique", "mz", "moz", "moçambique"] },
  { iso2: "MM", iso3: "MMR", name: "Myanmar", aliases: ["myanmar", "mm", "mmr", "burma"] },
  
  // N
  { iso2: "NA", iso3: "NAM", name: "Namibia", aliases: ["namibia", "na", "nam"] },
  { iso2: "NR", iso3: "NRU", name: "Nauru", aliases: ["nauru", "nr", "nru"] },
  { iso2: "NP", iso3: "NPL", name: "Nepal", aliases: ["nepal", "np", "npl", "नेपाल"] },
  { iso2: "NL", iso3: "NLD", name: "Netherlands", aliases: ["netherlands", "nl", "nld", "holland", "the netherlands", "nederland"] },
  { iso2: "NZ", iso3: "NZL", name: "New Zealand", aliases: ["new zealand", "nz", "nzl", "aotearoa"] },
  { iso2: "NI", iso3: "NIC", name: "Nicaragua", aliases: ["nicaragua", "ni", "nic"] },
  { iso2: "NE", iso3: "NER", name: "Niger", aliases: ["niger", "ne", "ner"] },
  { iso2: "NG", iso3: "NGA", name: "Nigeria", aliases: ["nigeria", "ng", "nga"] },
  { iso2: "MK", iso3: "MKD", name: "North Macedonia", aliases: ["north macedonia", "macedonia", "mk", "mkd", "северна македонија", "fyr macedonia", "fyrom"] },
  { iso2: "NO", iso3: "NOR", name: "Norway", aliases: ["norway", "no", "nor", "norge"] },
  
  // O
  { iso2: "OM", iso3: "OMN", name: "Oman", aliases: ["oman", "om", "omn", "عمان"] },
  
  // P
  { iso2: "PK", iso3: "PAK", name: "Pakistan", aliases: ["pakistan", "pk", "pak", "پاکستان"] },
  { iso2: "PW", iso3: "PLW", name: "Palau", aliases: ["palau", "pw", "plw"] },
  { iso2: "PS", iso3: "PSE", name: "Palestine", aliases: ["palestine", "ps", "pse", "state of palestine", "palestinian territories", "فلسطين"] },
  { iso2: "PA", iso3: "PAN", name: "Panama", aliases: ["panama", "pa", "pan", "panamá"] },
  { iso2: "PG", iso3: "PNG", name: "Papua New Guinea", aliases: ["papua new guinea", "pg", "png"] },
  { iso2: "PY", iso3: "PRY", name: "Paraguay", aliases: ["paraguay", "py", "pry"] },
  { iso2: "PE", iso3: "PER", name: "Peru", aliases: ["peru", "pe", "per", "perú"] },
  { iso2: "PH", iso3: "PHL", name: "Philippines", aliases: ["philippines", "ph", "phl", "pilipinas"] },
  { iso2: "PL", iso3: "POL", name: "Poland", aliases: ["poland", "pl", "pol", "polska"] },
  { iso2: "PT", iso3: "PRT", name: "Portugal", aliases: ["portugal", "pt", "prt"] },
  
  // Q
  { iso2: "QA", iso3: "QAT", name: "Qatar", aliases: ["qatar", "qa", "qat", "قطر"] },
  
  // R
  { iso2: "RO", iso3: "ROU", name: "Romania", aliases: ["romania", "ro", "rou", "românia"] },
  { iso2: "RU", iso3: "RUS", name: "Russia", aliases: ["russia", "ru", "rus", "russian federation", "россия"] },
  { iso2: "RW", iso3: "RWA", name: "Rwanda", aliases: ["rwanda", "rw", "rwa"] },
  
  // S
  { iso2: "KN", iso3: "KNA", name: "Saint Kitts and Nevis", aliases: ["saint kitts and nevis", "st kitts and nevis", "st. kitts and nevis", "kn", "kna"] },
  { iso2: "LC", iso3: "LCA", name: "Saint Lucia", aliases: ["saint lucia", "st lucia", "st. lucia", "lc", "lca"] },
  { iso2: "VC", iso3: "VCT", name: "Saint Vincent and the Grenadines", aliases: ["saint vincent and the grenadines", "st vincent", "st. vincent", "vc", "vct"] },
  { iso2: "WS", iso3: "WSM", name: "Samoa", aliases: ["samoa", "ws", "wsm", "western samoa"] },
  { iso2: "SM", iso3: "SMR", name: "San Marino", aliases: ["san marino", "sm", "smr"] },
  { iso2: "ST", iso3: "STP", name: "São Tomé and Príncipe", aliases: ["são tomé and príncipe", "sao tome and principe", "st", "stp"] },
  { iso2: "SA", iso3: "SAU", name: "Saudi Arabia", aliases: ["saudi arabia", "sa", "sau", "ksa", "kingdom of saudi arabia", "السعودية", "المملكة العربية السعودية"] },
  { iso2: "SN", iso3: "SEN", name: "Senegal", aliases: ["senegal", "sn", "sen", "sénégal"] },
  { iso2: "RS", iso3: "SRB", name: "Serbia", aliases: ["serbia", "rs", "srb", "србија", "srbija"] },
  { iso2: "SC", iso3: "SYC", name: "Seychelles", aliases: ["seychelles", "sc", "syc"] },
  { iso2: "SL", iso3: "SLE", name: "Sierra Leone", aliases: ["sierra leone", "sl", "sle"] },
  { iso2: "SG", iso3: "SGP", name: "Singapore", aliases: ["singapore", "sg", "sgp"] },
  { iso2: "SK", iso3: "SVK", name: "Slovakia", aliases: ["slovakia", "sk", "svk", "slovensko", "slovak republic"] },
  { iso2: "SI", iso3: "SVN", name: "Slovenia", aliases: ["slovenia", "si", "svn", "slovenija"] },
  { iso2: "SB", iso3: "SLB", name: "Solomon Islands", aliases: ["solomon islands", "sb", "slb"] },
  { iso2: "SO", iso3: "SOM", name: "Somalia", aliases: ["somalia", "so", "som", "الصومال"] },
  { iso2: "ZA", iso3: "ZAF", name: "South Africa", aliases: ["south africa", "za", "zaf", "rsa"] },
  { iso2: "SS", iso3: "SSD", name: "South Sudan", aliases: ["south sudan", "ss", "ssd"] },
  { iso2: "ES", iso3: "ESP", name: "Spain", aliases: ["spain", "es", "esp", "españa", "espana"] },
  { iso2: "LK", iso3: "LKA", name: "Sri Lanka", aliases: ["sri lanka", "lk", "lka", "ceylon"] },
  { iso2: "SD", iso3: "SDN", name: "Sudan", aliases: ["sudan", "sd", "sdn", "السودان"] },
  { iso2: "SR", iso3: "SUR", name: "Suriname", aliases: ["suriname", "sr", "sur", "surinam"] },
  { iso2: "SE", iso3: "SWE", name: "Sweden", aliases: ["sweden", "se", "swe", "sverige"] },
  { iso2: "CH", iso3: "CHE", name: "Switzerland", aliases: ["switzerland", "ch", "che", "schweiz", "suisse", "svizzera"] },
  { iso2: "SY", iso3: "SYR", name: "Syria", aliases: ["syria", "sy", "syr", "syrian arab republic", "سوريا"] },
  
  // T
  { iso2: "TW", iso3: "TWN", name: "Taiwan", aliases: ["taiwan", "tw", "twn", "republic of china", "roc", "台灣", "台湾"] },
  { iso2: "TJ", iso3: "TJK", name: "Tajikistan", aliases: ["tajikistan", "tj", "tjk", "тоҷикистон"] },
  { iso2: "TZ", iso3: "TZA", name: "Tanzania", aliases: ["tanzania", "tz", "tza", "united republic of tanzania"] },
  { iso2: "TH", iso3: "THA", name: "Thailand", aliases: ["thailand", "th", "tha", "ประเทศไทย"] },
  { iso2: "TL", iso3: "TLS", name: "Timor-Leste", aliases: ["timor-leste", "east timor", "tl", "tls"] },
  { iso2: "TG", iso3: "TGO", name: "Togo", aliases: ["togo", "tg", "tgo"] },
  { iso2: "TO", iso3: "TON", name: "Tonga", aliases: ["tonga", "to", "ton"] },
  { iso2: "TT", iso3: "TTO", name: "Trinidad and Tobago", aliases: ["trinidad and tobago", "trinidad", "tobago", "tt", "tto"] },
  { iso2: "TN", iso3: "TUN", name: "Tunisia", aliases: ["tunisia", "tn", "tun", "تونس", "tunisie"] },
  { iso2: "TR", iso3: "TUR", name: "Turkey", aliases: ["turkey", "tr", "tur", "türkiye", "turkiye"] },
  { iso2: "TM", iso3: "TKM", name: "Turkmenistan", aliases: ["turkmenistan", "tm", "tkm", "türkmenistan"] },
  { iso2: "TV", iso3: "TUV", name: "Tuvalu", aliases: ["tuvalu", "tv", "tuv"] },
  
  // U
  { iso2: "UG", iso3: "UGA", name: "Uganda", aliases: ["uganda", "ug", "uga"] },
  { iso2: "UA", iso3: "UKR", name: "Ukraine", aliases: ["ukraine", "ua", "ukr", "україна"] },
  { iso2: "AE", iso3: "ARE", name: "United Arab Emirates", aliases: ["united arab emirates", "uae", "ae", "are", "emirates", "الإمارات"] },
  { iso2: "GB", iso3: "GBR", name: "United Kingdom", aliases: ["united kingdom", "uk", "gb", "gbr", "great britain", "britain", "england"] },
  { iso2: "US", iso3: "USA", name: "United States", aliases: ["united states", "us", "usa", "united states of america", "america"] },
  { iso2: "UY", iso3: "URY", name: "Uruguay", aliases: ["uruguay", "uy", "ury"] },
  { iso2: "UZ", iso3: "UZB", name: "Uzbekistan", aliases: ["uzbekistan", "uz", "uzb", "ўзбекистон"] },
  
  // V
  { iso2: "VU", iso3: "VUT", name: "Vanuatu", aliases: ["vanuatu", "vu", "vut"] },
  { iso2: "VA", iso3: "VAT", name: "Vatican City", aliases: ["vatican city", "vatican", "holy see", "va", "vat"] },
  { iso2: "VE", iso3: "VEN", name: "Venezuela", aliases: ["venezuela", "ve", "ven", "bolivarian republic of venezuela"] },
  { iso2: "VN", iso3: "VNM", name: "Vietnam", aliases: ["vietnam", "vn", "vnm", "viet nam", "việt nam"] },
  
  // Y
  { iso2: "YE", iso3: "YEM", name: "Yemen", aliases: ["yemen", "ye", "yem", "اليمن"] },
  
  // Z
  { iso2: "ZM", iso3: "ZMB", name: "Zambia", aliases: ["zambia", "zm", "zmb"] },
  { iso2: "ZW", iso3: "ZWE", name: "Zimbabwe", aliases: ["zimbabwe", "zw", "zwe"] },
  
  // Special territories and dependencies often included in world maps
  { iso2: "XK", iso3: "XKX", name: "Kosovo", aliases: ["kosovo", "xk", "xkx", "kosova", "косово"] },
  { iso2: "PR", iso3: "PRI", name: "Puerto Rico", aliases: ["puerto rico", "pr", "pri"] },
  { iso2: "HK", iso3: "HKG", name: "Hong Kong", aliases: ["hong kong", "hk", "hkg", "香港"] },
  { iso2: "MO", iso3: "MAC", name: "Macau", aliases: ["macau", "macao", "mo", "mac", "澳門"] },
  { iso2: "GL", iso3: "GRL", name: "Greenland", aliases: ["greenland", "gl", "grl", "kalaallit nunaat"] },
  { iso2: "NC", iso3: "NCL", name: "New Caledonia", aliases: ["new caledonia", "nc", "ncl", "nouvelle-calédonie"] },
  { iso2: "FO", iso3: "FRO", name: "Faroe Islands", aliases: ["faroe islands", "fo", "fro", "føroyar"] },
  { iso2: "GU", iso3: "GUM", name: "Guam", aliases: ["guam", "gu", "gum"] },
  { iso2: "VI", iso3: "VIR", name: "U.S. Virgin Islands", aliases: ["u.s. virgin islands", "us virgin islands", "usvi", "vi", "vir"] },
  { iso2: "AS", iso3: "ASM", name: "American Samoa", aliases: ["american samoa", "as", "asm"] },
  { iso2: "GF", iso3: "GUF", name: "French Guiana", aliases: ["french guiana", "gf", "guf", "guyane"] },
  { iso2: "PF", iso3: "PYF", name: "French Polynesia", aliases: ["french polynesia", "pf", "pyf", "polynésie française"] },
  { iso2: "RE", iso3: "REU", name: "Réunion", aliases: ["réunion", "reunion", "re", "reu"] },
  { iso2: "MQ", iso3: "MTQ", name: "Martinique", aliases: ["martinique", "mq", "mtq"] },
  { iso2: "GP", iso3: "GLP", name: "Guadeloupe", aliases: ["guadeloupe", "gp", "glp"] },
  { iso2: "EH", iso3: "ESH", name: "Western Sahara", aliases: ["western sahara", "eh", "esh", "الصحراء الغربية"] },
  { iso2: "CW", iso3: "CUW", name: "Curaçao", aliases: ["curaçao", "curacao", "cw", "cuw"] },
  { iso2: "AW", iso3: "ABW", name: "Aruba", aliases: ["aruba", "aw", "abw"] },
  { iso2: "SX", iso3: "SXM", name: "Sint Maarten", aliases: ["sint maarten", "st maarten", "sx", "sxm"] },
  { iso2: "BM", iso3: "BMU", name: "Bermuda", aliases: ["bermuda", "bm", "bmu"] },
  { iso2: "KY", iso3: "CYM", name: "Cayman Islands", aliases: ["cayman islands", "ky", "cym"] },
  { iso2: "GI", iso3: "GIB", name: "Gibraltar", aliases: ["gibraltar", "gi", "gib"] },
  { iso2: "FK", iso3: "FLK", name: "Falkland Islands", aliases: ["falkland islands", "falklands", "malvinas", "fk", "flk"] },
];

// Build fast lookup maps
const ALIAS_TO_ISO2: Record<string, string> = {};
const ISO2_TO_COUNTRY: Record<string, CountryAlias> = {};
const ISO3_TO_ISO2: Record<string, string> = {};

for (const country of COUNTRY_ALIASES) {
  // Map all aliases to ISO2
  for (const alias of country.aliases) {
    ALIAS_TO_ISO2[alias.toLowerCase()] = country.iso2;
  }
  // Map ISO2 to full country data
  ISO2_TO_COUNTRY[country.iso2] = country;
  // Map ISO3 to ISO2
  ISO3_TO_ISO2[country.iso3.toLowerCase()] = country.iso2;
}

/**
 * Resolve a user input token to ISO2 country code
 * Handles names, ISO2, ISO3, and common aliases
 */
export function resolveCountryToken(token: string): string | null {
  const key = token.trim().toLowerCase();
  if (!key) return null;
  return ALIAS_TO_ISO2[key] ?? null;
}

/**
 * Get full country data by ISO2 code
 */
export function getCountryByISO2(iso2: string): CountryAlias | null {
  return ISO2_TO_COUNTRY[iso2.toUpperCase()] ?? null;
}

/**
 * Get all ISO2 codes
 */
export function getAllISO2Codes(): string[] {
  return Object.keys(ISO2_TO_COUNTRY);
}

/**
 * Check if a code is valid ISO2
 */
export function isValidISO2(code: string): boolean {
  return code.toUpperCase() in ISO2_TO_COUNTRY;
}
