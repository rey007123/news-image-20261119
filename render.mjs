import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));

// 64x25 dot-matrix world map mask (64 cols x 25 rows, '#' = land, '.' = ocean)
const WORLD_ROWS = [
  "................................................................",
  ".............######....######...................................",
  "..........###########..#####...........#####..##############....",
  "......###############...###.......##########################....",
  ".....#################..........#############################...",
  "......###############..........###############################..",
  ".......#############..........###############################...",
  "........###########...........##############################....",
  ".........#########............#############################.....",
  "..........#######..............####..#####################......",
  "...........#####...............########.################........",
  ".............###................##########..###########.........",
  "..............##................##########...#####..##..........",
  "...............###..............#########....####....##.........",
  "................#####............#######......##.....###........",
  ".................#######.........######................##.......",
  "..................#######........#####..................##......",
  "..................######..........####..................#####...",
  "...................#####..........###..................#######..",
  "...................####...........###..................#######..",
  "....................###..................................####...",
  "....................##......................................##..",
  "....................##..........................................",
  "................................................................",
  "................................................................",
];

function buildDotMapSvg() {
  const cols = 64;
  const rows = 25;
  const w = 342;
  const h = 186;
  const padX = 7;
  const padY = 8;
  const cellX = (w - padX * 2) / (cols - 1);
  const cellY = (h - padY * 2) / (rows - 1);

  const dots = [];
  for (let r = 0; r < rows; r++) {
    const line = WORLD_ROWS[r] || "";
    for (let c = 0; c < cols; c++) {
      if (line[c] === "#") {
        const cx = (padX + c * cellX).toFixed(1);
        const cy = (padY + r * cellY).toFixed(1);
        dots.push(`<circle cx="${cx}" cy="${cy}" r="1.75" fill="#7d95b5" opacity="0.88"/>`);
      }
    }
  }

  const proj = (lon, lat) => {
    const x = padX + ((lon + 180) / 360) * (w - padX * 2);
    const y = padY + ((80 - lat) / 140) * (h - padY * 2);
    return [x.toFixed(1), y.toFixed(1)];
  };

  // Region dots for briefs 12-36
  const briefDots = [
    [42.6, 16.9, "#f59e0b"],  // 12 Jazan
    [20.1, 32.1, "#a855f7"],  // 13 Benghazi
    [-0.1, 51.5, "#38bdf8"],  // 14 London
    [34.5, 31.5, "#f59e0b"],  // 15 Gaza
    [36.5, 45.3, "#38bdf8"],  // 16 Crimea
    [28.5, 43.0, "#38bdf8"],  // 17 Bulgaria
    [-99.1, 19.4, "#22c55e"], // 18 Mexico City
    [8.7, 50.1, "#38bdf8"],   // 19 Frankfurt
    [-66.9, 10.5, "#22c55e"], // 20 Caracas
    [77.2, 28.6, "#ef4444"],  // 21 New Delhi
    [139.7, 35.7, "#ef4444"], // 22 Tokyo
    [-75.7, 45.4, "#22c55e"], // 23 Ottawa
    [147.3, -42.9, "#14b8a6"],// 24 Hobart
    [44.4, 33.3, "#f59e0b"],  // 25 Baghdad
    [36.8, -1.3, "#a855f7"],  // 26 Nairobi
    [50.6, 26.2, "#f59e0b"],  // 27 Manama
    [46.7, 24.7, "#f59e0b"],  // 28 Riyadh
    [-77.0, 38.9, "#22c55e"], // 29-31 Washington
    [-122.4, 37.8, "#22c55e"],// 32 California
    [-68.1, -16.5, "#22c55e"],// 33 La Paz
    [149.1, -35.3, "#14b8a6"],// 34 Canberra
    [106.8, -6.2, "#ef4444"], // 35 Jakarta
    [-122.1, 47.6, "#22c55e"],// 36 Redmond
  ];

  const briefMarkup = briefDots
    .map(([lon, lat, color]) => {
      const [x, y] = proj(lon, lat);
      return `<circle cx="${x}" cy="${y}" r="2.7" fill="${color}" stroke="#0c1b33" stroke-width="0.7"/>`;
    })
    .join("");

  // Numbered pins 1-11 (gently separated in dense Europe/US clusters)
  const pins = [
    { id: 1, lon: 114.1, lat: 23.0, color: "#c9a24b" }, // Shenzhen Summit
    { id: 2, lon: 174.5, lat: -37.0, color: "#94a3b8" }, // Global / NZ GTA VI
    { id: 3, lon: -72.0, lat: 41.5, color: "#b87333" },  // Nasdaq NY
    { id: 4, lon: 3.5, lat: 55.0, color: "#1d4ed8" },    // The Hague
    { id: 5, lon: 31.0, lat: 36.5, color: "#0d9488" },   // Antalya COP31
    { id: 6, lon: 85.8, lat: 19.8, color: "#0284c7" },   // Odisha Akvan
    { id: 7, lon: 31.5, lat: 52.0, color: "#b91c1c" },   // Kyiv
    { id: 8, lon: 121.0, lat: 14.5, color: "#ca8a04" },  // Shenzhen APEC Trade (offset SE)
    { id: 9, lon: -81.5, lat: 25.5, color: "#2563eb" },  // Florida
    { id: 10, lon: -108.0, lat: 36.0, color: "#7c3aed" },// Geology (Grand Canyon / Global)
    { id: 11, lon: 1.5, lat: 44.0, color: "#be123c" },   // Paris
  ];

  const pinMarkup = pins
    .map((p) => {
      const [x, y] = proj(p.lon, p.lat);
      return `
        <g transform="translate(${x},${y})">
          <circle r="6.3" fill="${p.color}" stroke="#0c1b33" stroke-width="1.15"/>
          <text x="0" y="2.5" text-anchor="middle" font-family="Arial,sans-serif" font-size="7.3" font-weight="800" fill="#ffffff">${p.id}</text>
        </g>`;
    })
    .join("");

  return `
    <svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${w}" height="${h}" rx="3" fill="#0d1e36"/>
      <line x1="7" y1="${(h * 0.56).toFixed(1)}" x2="${w - 7}" y2="${(h * 0.56).toFixed(1)}" stroke="#1e3556" stroke-width="0.65" stroke-dasharray="2,3"/>
      <line x1="${(w * 0.5).toFixed(1)}" y1="6" x2="${(w * 0.5).toFixed(1)}" y2="${h - 6}" stroke="#1e3556" stroke-width="0.65" stroke-dasharray="2,3"/>
      ${dots.join("")}
      ${briefMarkup}
      ${pinMarkup}
    </svg>`;
}

// Lead SVG 1: Shenzhen Three-Way Summit
const SVG_LEAD_1 = `
<svg viewBox="0 0 326 96" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sky1" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0d213f"/>
      <stop offset="100%" stop-color="#1e4270"/>
    </linearGradient>
    <linearGradient id="gold1" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#b88c2c"/>
      <stop offset="50%" stop-color="#f0d584"/>
      <stop offset="100%" stop-color="#b88c2c"/>
    </linearGradient>
  </defs>
  <rect width="326" height="96" fill="url(#sky1)"/>
  <path d="M0 78 L18 78 L18 46 L28 46 L28 78 L42 78 L42 32 L54 26 L66 32 L66 78 L258 78 L258 38 L270 38 L270 78 L284 78 L284 22 L294 10 L304 22 L304 78 L326 78 L326 96 L0 96 Z" fill="#102848" opacity="0.88"/>
  <!-- Flags: US, China, Russia -->
  <rect x="92" y="13" width="2" height="40" fill="#cbd5e1"/>
  <rect x="94" y="14" width="22" height="13" fill="#b91c1c"/>
  <rect x="94" y="14" width="10" height="7" fill="#1e3a8a"/>
  <rect x="94" y="16" width="22" height="2" fill="#f8fafc" opacity="0.9"/>
  <rect x="94" y="20" width="22" height="2" fill="#f8fafc" opacity="0.9"/>

  <rect x="153" y="9" width="2" height="44" fill="#cbd5e1"/>
  <rect x="155" y="10" width="24" height="14" fill="#dc2626"/>
  <circle cx="160" cy="15" r="2.2" fill="#facc15"/>
  <circle cx="165" cy="13" r="0.9" fill="#facc15"/>
  <circle cx="166" cy="16" r="0.9" fill="#facc15"/>

  <rect x="215" y="13" width="2" height="40" fill="#cbd5e1"/>
  <rect x="217" y="14" width="22" height="4.3" fill="#f8fafc"/>
  <rect x="217" y="18.3" width="22" height="4.3" fill="#1d4ed8"/>
  <rect x="217" y="22.6" width="22" height="4.3" fill="#dc2626"/>

  <!-- Round table & 3 leaders -->
  <ellipse cx="163" cy="75" rx="84" ry="13" fill="#1e293b" stroke="url(#gold1)" stroke-width="2"/>
  <circle cx="107" cy="48" r="9" fill="#e2c4a6"/>
  <path d="M98 44 Q107 37 116 44 Z" fill="#eab308"/>
  <path d="M90 71 C90 59 98 56 107 56 C116 56 124 59 124 71 Z" fill="#1e293b"/>
  <polygon points="105,57 109,57 108,67 106,67" fill="#dc2626"/>

  <circle cx="163" cy="44" r="9.5" fill="#e5c6a8"/>
  <path d="M153 42 Q163 34 173 42 Z" fill="#1f2937"/>
  <path d="M144 69 C144 57 152 54 163 54 C174 54 182 57 182 69 Z" fill="#0f172a"/>
  <polygon points="161,55 165,55 164,65 162,65" fill="#b91c1c"/>

  <circle cx="219" cy="48" r="9" fill="#e6cab0"/>
  <path d="M202 71 C202 59 210 56 219 56 C228 56 236 59 236 71 Z" fill="#1e293b"/>
  <polygon points="217,57 221,57 220,67 218,67" fill="#991b1b"/>
</svg>`;

// Lead SVG 2: GTA VI Global Launch
const SVG_LEAD_2 = `
<svg viewBox="0 0 326 96" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="vice2" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#3b0764"/>
      <stop offset="50%" stop-color="#be185d"/>
      <stop offset="100%" stop-color="#f97316"/>
    </linearGradient>
    <linearGradient id="sun2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fde047"/>
      <stop offset="100%" stop-color="#fb7185"/>
    </linearGradient>
  </defs>
  <rect width="326" height="96" fill="url(#vice2)"/>
  <circle cx="163" cy="56" r="30" fill="url(#sun2)" opacity="0.92"/>
  <rect x="128" y="56" width="70" height="2.8" fill="#be185d" opacity="0.72"/>
  <rect x="128" y="63" width="70" height="3.2" fill="#be185d" opacity="0.78"/>
  <path d="M38 82 Q42 54 48 36" stroke="#1e1b4b" stroke-width="4" fill="none"/>
  <path d="M48 36 Q26 30 16 40 M48 36 Q32 20 22 24 M48 36 Q64 22 76 30 M48 36 Q68 36 78 46" stroke="#1e1b4b" stroke-width="2.8" fill="none" stroke-linecap="round"/>
  <path d="M288 82 Q282 56 276 38" stroke="#1e1b4b" stroke-width="4" fill="none"/>
  <path d="M276 38 Q254 32 244 42 M276 38 Q262 22 250 26 M276 38 Q294 24 306 32 M276 38 Q296 38 308 48" stroke="#1e1b4b" stroke-width="2.8" fill="none" stroke-linecap="round"/>
  <text x="163" y="22" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" font-weight="900" letter-spacing="5" fill="#fde047">GTA</text>
  <text x="163" y="62" text-anchor="middle" font-family="Georgia,serif" font-size="40" font-weight="900" fill="#ffffff" stroke="#0c1b33" stroke-width="2.4">VI</text>
  <rect x="220" y="8" width="96" height="16" rx="3" fill="#0c1b33" opacity="0.9"/>
  <text x="268" y="19" text-anchor="middle" font-family="Arial,sans-serif" font-size="8" font-weight="700" fill="#67e8f9">99 METACRITIC</text>
</svg>`;

// Lead SVG 3: Anthropic Record $81.3bn IPO
const SVG_LEAD_3 = `
<svg viewBox="0 0 326 96" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="mkt3" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#052e22"/>
      <stop offset="100%" stop-color="#0b4635"/>
    </linearGradient>
  </defs>
  <rect width="326" height="96" fill="url(#mkt3)"/>
  <!-- Grid lines -->
  <line x1="18" y1="24" x2="308" y2="24" stroke="#155e49" stroke-width="0.7"/>
  <line x1="18" y1="44" x2="308" y2="44" stroke="#155e49" stroke-width="0.7"/>
  <line x1="18" y1="64" x2="308" y2="64" stroke="#155e49" stroke-width="0.7"/>
  <!-- Rising bars & line -->
  <rect x="34" y="58" width="16" height="22" fill="#10b981" opacity="0.35"/>
  <rect x="64" y="50" width="16" height="30" fill="#10b981" opacity="0.45"/>
  <rect x="94" y="44" width="16" height="36" fill="#10b981" opacity="0.55"/>
  <rect x="124" y="34" width="16" height="46" fill="#10b981" opacity="0.65"/>
  <rect x="154" y="24" width="16" height="56" fill="#34d399" opacity="0.8"/>
  <polyline points="24,68 72,56 120,44 166,24 218,16 296,12" fill="none" stroke="#6ee7b7" stroke-width="2.8"/>
  <circle cx="296" cy="12" r="4.5" fill="#fde047" stroke="#052e22" stroke-width="1.5"/>
  <!-- Valuation & IPO callout box -->
  <rect x="192" y="26" width="122" height="42" rx="4" fill="#062119" stroke="#34d399" stroke-width="1.2"/>
  <text x="253" y="42" text-anchor="middle" font-family="Georgia,serif" font-size="16" font-weight="700" fill="#fde047">$81.3bn</text>
  <text x="253" y="54" text-anchor="middle" font-family="Arial,sans-serif" font-size="7.8" font-weight="700" fill="#a7f3d0">PRICED AT $83 · ~$1.5TN</text>
  <text x="253" y="63" text-anchor="middle" font-family="Arial,sans-serif" font-size="7" font-weight="700" fill="#6ee7b7">BIGGEST IPO ON RECORD</text>
</svg>`;

// 8 Mid Cards (4..11, strictly Thursday 19 Nov 2026)
const MID_CARDS = [
  {
    num: 4,
    color: "#1d4ed8",
    kicker: "THE HAGUE · LAW",
    source: "ICJ · REUTERS",
    headline: "World Court rules on Myanmar's Rohingya case",
    deck: "ICJ delivers judgment in The Gambia's 2019 genocide case over the 2017 campaign.",
    svg: `<svg viewBox="0 0 244 48" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect width="244" height="48" fill="#172554"/>
      <rect x="64" y="36" width="114" height="12" fill="#1e3a8a"/>
      <polygon points="121,7 156,22 86,22" fill="#c9a24b"/>
      <rect x="93" y="22" width="7" height="15" fill="#e2e8f0"/>
      <rect x="118" y="22" width="7" height="15" fill="#e2e8f0"/>
      <rect x="143" y="22" width="7" height="15" fill="#e2e8f0"/>
      <line x1="186" y1="18" x2="216" y2="18" stroke="#fde047" stroke-width="1.8"/>
      <line x1="201" y1="11" x2="201" y2="39" stroke="#fde047" stroke-width="1.8"/>
      <path d="M182 26 Q186 31 190 26 Z" fill="#fde047"/>
      <path d="M212 26 Q216 31 220 26 Z" fill="#fde047"/>
    </svg>`,
  },
  {
    num: 5,
    color: "#0d9488",
    kicker: "ANTALYA · CLIMATE",
    source: "REUTERS",
    headline: "COP31 enters its final 48 hours",
    deck: "Ministers take over draft text; fossil-fuel phase-out and $120bn adaptation fund unresolved.",
    svg: `<svg viewBox="0 0 244 48" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect width="244" height="48" fill="#0f2f30"/>
      <circle cx="88" cy="24" r="15" fill="#0d9488" stroke="#99f6e4" stroke-width="1.4"/>
      <path d="M77 20 Q88 14 98 22 M76 28 Q88 33 100 26" fill="none" stroke="#ccfbf1" stroke-width="1.5"/>
      <text x="166" y="22" text-anchor="middle" font-family="Georgia,serif" font-size="14" font-weight="700" fill="#fde047">48 HRS</text>
      <text x="166" y="34" text-anchor="middle" font-family="Arial,sans-serif" font-size="7.6" font-weight="700" fill="#99f6e4">$120BN GAP UNRESOLVED</text>
    </svg>`,
  },
  {
    num: 6,
    color: "#0284c7",
    kicker: "ODISHA · STORM",
    source: "IMD",
    headline: "Akvan bears down as 200,000 flee the coast",
    deck: "Red alerts across 11 districts, schools shut; landfall near Puri forecast for Friday.",
    svg: `<svg viewBox="0 0 244 48" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect width="244" height="48" fill="#0c2d48"/>
      <path d="M0 0 L82 0 L64 20 L52 36 L40 48 L0 48 Z" fill="#1e3a5f"/>
      <g transform="translate(138,24)">
        <circle r="18" fill="none" stroke="#38bdf8" stroke-width="1.8" stroke-dasharray="15,5" opacity="0.65"/>
        <circle r="11" fill="none" stroke="#7dd3fc" stroke-width="2.2" stroke-dasharray="11,4"/>
        <circle r="5" fill="#0c2d48" stroke="#f8fafc" stroke-width="1.8"/>
      </g>
      <text x="176" y="21" font-family="Arial,sans-serif" font-size="8.2" font-weight="800" fill="#fca5a5">11 DISTRICTS</text>
      <text x="176" y="32" font-family="Arial,sans-serif" font-size="7.5" font-weight="700" fill="#bae6fd">RED ALERT</text>
    </svg>`,
  },
  {
    num: 7,
    color: "#b91c1c",
    kicker: "KYIV · WAR",
    source: "REUTERS · FT",
    headline: "Left off the agenda, Ukraine watches Shenzhen",
    deck: "White House says war won't be raised at 3-way summit as Kyiv fears being carved up.",
    svg: `<svg viewBox="0 0 244 48" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect width="244" height="48" fill="#1e293b"/>
      <rect x="46" y="10" width="44" height="14" fill="#2563eb"/>
      <rect x="46" y="24" width="44" height="14" fill="#facc15"/>
      <line x1="104" y1="24" x2="146" y2="24" stroke="#94a3b8" stroke-width="1.6" stroke-dasharray="3,3"/>
      <rect x="154" y="10" width="74" height="28" rx="3" fill="#0f172a" stroke="#ef4444" stroke-width="1.2"/>
      <text x="191" y="22" text-anchor="middle" font-family="Arial,sans-serif" font-size="7.5" font-weight="800" fill="#fca5a5">OFF AGENDA</text>
      <text x="191" y="32" text-anchor="middle" font-family="Arial,sans-serif" font-size="7.2" font-weight="700" fill="#cbd5e1">AT SHENZHEN</text>
    </svg>`,
  },
  {
    num: 8,
    color: "#ca8a04",
    kicker: "SHENZHEN · TRADE",
    source: "APEC · AP",
    headline: "APEC leaders adopt the Shenzhen Declaration",
    deck: "21 economies back digital-trade rules and an Asia-Pacific community roadmap.",
    svg: `<svg viewBox="0 0 244 48" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect width="244" height="48" fill="#1c2434"/>
      <circle cx="88" cy="24" r="16" fill="none" stroke="#eab308" stroke-width="1.8"/>
      <ellipse cx="88" cy="24" rx="8" ry="16" fill="none" stroke="#eab308" stroke-width="1.2"/>
      <line x1="72" y1="24" x2="104" y2="24" stroke="#eab308" stroke-width="1.2"/>
      <text x="166" y="22" text-anchor="middle" font-family="Georgia,serif" font-size="13.5" font-weight="700" fill="#fde047">21 ECONOMIES</text>
      <text x="166" y="34" text-anchor="middle" font-family="Arial,sans-serif" font-size="7.3" font-weight="700" fill="#cbd5e1">DIGITAL TRADE PACT</text>
    </svg>`,
  },
  {
    num: 9,
    color: "#2563eb",
    kicker: "FLORIDA · WEATHER",
    source: "AP · NWS",
    headline: "Flooded Florida braces for still more rain",
    deck: "A foot of rain in hours hits Hollywood; 300 rescue calls overnight and schools shut Thursday.",
    svg: `<svg viewBox="0 0 244 48" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect width="244" height="48" fill="#0f2544"/>
      <path d="M54 22 Q54 12 66 12 Q72 6 84 10 Q96 10 96 20 Q96 26 88 26 L60 26 Q54 26 54 22 Z" fill="#94a3b8"/>
      <line x1="62" y1="29" x2="58" y2="39" stroke="#38bdf8" stroke-width="1.8"/>
      <line x1="74" y1="29" x2="70" y2="39" stroke="#38bdf8" stroke-width="1.8"/>
      <line x1="86" y1="29" x2="82" y2="39" stroke="#38bdf8" stroke-width="1.8"/>
      <text x="168" y="21" text-anchor="middle" font-family="Georgia,serif" font-size="13.5" font-weight="700" fill="#7dd3fc">300 RESCUES</text>
      <text x="168" y="33" text-anchor="middle" font-family="Arial,sans-serif" font-size="7.4" font-weight="700" fill="#e2e8f0">12 INCHES IN HOURS</text>
    </svg>`,
  },
  {
    num: 10,
    color: "#7c3aed",
    kicker: "SCIENCE · GEOLOGY",
    source: "NATURE",
    headline: "Earth's missing billion years are explained",
    deck: "Nature study links mantle currents and ancient ice sheets to the Great Unconformity.",
    svg: `<svg viewBox="0 0 244 48" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect width="244" height="48" fill="#231942"/>
      <!-- Rock strata layers -->
      <rect x="44" y="10" width="156" height="8" fill="#c084fc" opacity="0.8"/>
      <path d="M44 21 Q64 17 84 21 T124 21 T164 21 T200 21" fill="none" stroke="#fde047" stroke-width="2"/>
      <rect x="44" y="24" width="156" height="7" fill="#7c3aed" opacity="0.75"/>
      <rect x="44" y="33" width="156" height="8" fill="#4c1d95"/>
      <text x="122" y="16.5" text-anchor="middle" font-family="Arial,sans-serif" font-size="7.2" font-weight="800" fill="#1e1b4b">GREAT UNCONFORMITY · 1 BN YRS</text>
    </svg>`,
  },
  {
    num: 11,
    color: "#be123c",
    kicker: "PARIS · POLITICS",
    source: "AFP",
    headline: "Mélenchon could win, says France's justice minister",
    deck: "Cabinet minister concedes the hard-left leader is a plausible presidential contender.",
    svg: `<svg viewBox="0 0 244 48" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect width="244" height="48" fill="#1e1b2e"/>
      <rect x="52" y="10" width="16" height="28" fill="#1d4ed8"/>
      <rect x="68" y="10" width="16" height="28" fill="#f8fafc"/>
      <rect x="84" y="10" width="16" height="28" fill="#dc2626"/>
      <text x="166" y="22" text-anchor="middle" font-family="Georgia,serif" font-size="13" font-weight="700" fill="#ffffff">ÉLYSÉE 2027</text>
      <text x="166" y="33" text-anchor="middle" font-family="Arial,sans-serif" font-size="7.3" font-weight="700" fill="#fda4af">MINISTER WARNS ON LEFT</text>
    </svg>`,
  },
];

// 25 strictly verified Thursday 19 Nov 2026 briefs (12..36)
const BRIEFS = [
  { n: 12, city: "JAZAN", text: "Saudi Arabia says danger has passed in three southern cities." },
  { n: 13, city: "BENGHAZI", text: "Cocaine and millions of illicit pills seized in eastern Libya." },
  { n: 14, city: "LONDON", text: "Van Gogh sells for a record $190.4m after Nazi-history row." },
  { n: 15, city: "GAZA", text: "Israeli tanks cross Yellow Line in central raid; Hamas calls it breach." },
  { n: 16, city: "CRIMEA", text: "Kerch Bridge attacked again; traffic and Azov lane halted." },
  { n: 17, city: "BULGARIA", text: "LPG tanker Gas Husky sinks after 4 Black Sea hits; 19 saved." },
  { n: 18, city: "MEXICO CITY", text: "Banxico minutes show 3–2 vote to cut rate to 6.25%." },
  { n: 19, city: "FRANKFURT", text: "FT reports Deutsche Bank handled $582m in Epstein-linked deals." },
  { n: 20, city: "CARACAS", text: "Hegseth signs US–Venezuela military training and intel deal." },
  { n: 21, city: "NEW DELHI", text: "PM Modi meets Prince William and Catherine on UK–India ties." },
  { n: 22, city: "TOKYO", text: "India and Japan review defence tech at 2+2 ministerial dialogue." },
  { n: 23, city: "OTTAWA", text: "PM Carney says Canada rethinks China ties, seeks right US deal." },
  { n: 24, city: "HOBART", text: "Ben Duckett's 133 puts England ahead 2–1 in Australia ODI series." },
  { n: 25, city: "BAGHDAD", text: "Six French ISIL members jailed for life in Iraq." },
  { n: 26, city: "NAIROBI", text: "Kenya floods kill 6 as President Ruto gives State of the Nation." },
  { n: 27, city: "MANAMA", text: "Bapco oil refinery back on its feet after Gulf attacks." },
  { n: 28, city: "RIYADH", text: "Gulf leaders urge Trump not to strike Iran." },
  { n: 29, city: "WASHINGTON", text: "Vance says US seeks no 'forever war' in the Gulf." },
  { n: 30, city: "WASHINGTON", text: "Senators warn AI cyber threats are outpacing US defences." },
  { n: 31, city: "WASHINGTON", text: "Rep. Liu Yunping becomes first Asian-American caucus chair." },
  { n: 32, city: "CALIFORNIA", text: "Atmospheric river triggers Bay Area flood and mudslide alerts." },
  { n: 33, city: "LA PAZ", text: "Bolivia declares El Niño emergency as 78,000 families are hit." },
  { n: 34, city: "CANBERRA", text: "Australia sanctions West Bank settlers (3 people, 4 groups)." },
  { n: 35, city: "JAKARTA", text: "Bank Indonesia lifts benchmark rate to 6.0% to back rupiah." },
  { n: 36, city: "REDMOND", text: "Microsoft in talks to sell AI cloud services to ByteDance." },
];

const leftBriefs = BRIEFS.slice(0, 13);
const rightBriefs = BRIEFS.slice(13);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Thursday 19 November 2026 — The Day in World News</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    width: 1024px;
    height: 1024px;
    overflow: hidden;
    background: #f7f4ec;
    color: #111827;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  .page {
    width: 1024px;
    height: 1024px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* MASTHEAD: 76px */
  .masthead {
    height: 76px;
    background: #0c1b33;
    border-bottom: 2.5px solid #c9a24b;
    padding: 6px 12px;
    display: flex;
    align-items: center;
    gap: 12px;
    color: #ffffff;
  }
  .cal-box {
    width: 60px;
    height: 62px;
    border-radius: 4px;
    overflow: hidden;
    border: 1.5px solid #c9a24b;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    background: #ffffff;
  }
  .cal-top {
    background: #b91c1c;
    color: #ffffff;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.7px;
    text-align: center;
    padding: 2px 0;
  }
  .cal-day {
    color: #0c1b33;
    font-family: Georgia, serif;
    font-size: 24px;
    font-weight: 900;
    line-height: 1;
    text-align: center;
    padding-top: 3px;
  }
  .cal-sub {
    color: #475569;
    font-size: 8px;
    font-weight: 800;
    letter-spacing: 0.5px;
    text-align: center;
    padding-top: 1px;
  }
  .mast-center { flex: 1; min-width: 0; }
  .mast-toprow {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1px;
  }
  .mast-kicker {
    color: #e6c675;
    font-size: 9.2px;
    font-weight: 800;
    letter-spacing: 2px;
  }
  .mast-pill {
    background: rgba(201, 162, 75, 0.16);
    border: 1px solid #c9a24b;
    color: #f8e7b7;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.8px;
    padding: 1.5px 7px;
    border-radius: 3px;
  }
  .mast-title {
    font-family: Georgia, "Times New Roman", serif;
    font-size: 30px;
    font-weight: 700;
    line-height: 1.03;
    letter-spacing: -0.3px;
    color: #ffffff;
  }
  .mast-sub {
    font-family: Georgia, "Times New Roman", serif;
    font-style: italic;
    font-size: 11px;
    color: #cbd5e1;
    margin-top: 2px;
  }

  /* CONTENT BODY: 948px */
  .body {
    flex: 1;
    padding: 6px 10px;
    display: flex;
    flex-direction: column;
    gap: 5.5px;
    overflow: hidden;
  }

  /* REGION COUNT BAR: 20px */
  .region-bar {
    height: 20px;
    display: flex;
    align-items: stretch;
    border-radius: 3px;
    overflow: hidden;
    border: 1px solid #d5cfc1;
    font-size: 8px;
    font-weight: 800;
    letter-spacing: 0.3px;
    color: #ffffff;
  }
  .rb-seg {
    display: flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    padding: 0 4px;
  }

  /* 6-KPI STRIP: 42px */
  .kpi-strip {
    height: 42px;
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 6px;
  }
  .kpi-tile {
    background: #ffffff;
    border: 1px solid #d5cfc1;
    border-top: 2.5px solid #0c1b33;
    border-radius: 3px;
    padding: 3px 6px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .kpi-tile.c1 { border-top-color: #059669; }
  .kpi-tile.c2 { border-top-color: #be185d; }
  .kpi-tile.c3 { border-top-color: #0284c7; }
  .kpi-tile.c4 { border-top-color: #0d9488; }
  .kpi-tile.c5 { border-top-color: #1d4ed8; }
  .kpi-tile.c6 { border-top-color: #b45309; }
  .kpi-v {
    font-family: Georgia, serif;
    font-size: 14px;
    font-weight: 700;
    color: #0c1b33;
    line-height: 1.05;
  }
  .kpi-l {
    font-size: 7.5px;
    font-weight: 700;
    color: #475569;
    line-height: 1.15;
    margin-top: 1px;
  }

  /* ROW 1: 3 LEAD CARDS (208px) */
  .lead-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    height: 208px;
  }
  .lead-card {
    background: #ffffff;
    border: 1px solid #d5cfc1;
    border-top-width: 3px;
    border-radius: 3px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .lead-card.rank-1 { border-top-color: #c9a24b; }
  .lead-card.rank-2 { border-top-color: #94a3b8; }
  .lead-card.rank-3 { border-top-color: #b87333; }
  .lead-art {
    position: relative;
    height: 94px;
    background: #0c1b33;
    overflow: hidden;
  }
  .lead-badge {
    position: absolute;
    top: 5px;
    left: 5px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 900;
    color: #0c1b33;
    border: 1.5px solid #ffffff;
    box-shadow: 0 1px 3px rgba(0,0,0,0.45);
  }
  .badge-1 { background: #e6c15a; }
  .badge-2 { background: #d1d5db; }
  .badge-3 { background: #d98a4e; color: #ffffff; }
  .lead-cap {
    position: absolute;
    left: 0; right: 0; bottom: 0;
    background: rgba(12, 27, 51, 0.9);
    color: #f1f5f9;
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 0.65px;
    padding: 2.5px 6px;
    text-transform: uppercase;
  }
  .lead-text {
    padding: 6px 8px;
    display: flex;
    flex-direction: column;
    gap: 3px;
    flex: 1;
  }
  .meta-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 8px;
    font-weight: 800;
    letter-spacing: 0.4px;
  }
  .kicker { color: #991b1b; }
  .source { color: #64748b; }
  .lead-h {
    font-family: Georgia, "Times New Roman", serif;
    font-size: 13.8px;
    font-weight: 700;
    line-height: 1.14;
    color: #0f172a;
  }
  .lead-p {
    font-size: 9.7px;
    line-height: 1.26;
    color: #334155;
  }

  /* ROWS 2 & 3: 8 MID CARDS (264px total) */
  .mid-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(2, 129px);
    gap: 6px;
    height: 264px;
  }
  .mid-card {
    background: #ffffff;
    border: 1px solid #d5cfc1;
    border-radius: 3px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .mid-art {
    position: relative;
    height: 46px;
    background: #0c1b33;
    overflow: hidden;
  }
  .mid-dot {
    position: absolute;
    top: 4px;
    left: 4px;
    width: 17px;
    height: 17px;
    border-radius: 50%;
    color: #ffffff;
    font-size: 9px;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1.2px solid #ffffff;
  }
  .mid-text {
    padding: 4.5px 6.5px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
  }
  .mid-meta {
    display: flex;
    justify-content: space-between;
    font-size: 7.2px;
    font-weight: 800;
    letter-spacing: 0.3px;
  }
  .mid-h {
    font-family: Georgia, "Times New Roman", serif;
    font-size: 10.6px;
    font-weight: 700;
    line-height: 1.14;
    color: #0f172a;
  }
  .mid-p {
    font-size: 8.6px;
    line-height: 1.2;
    color: #334155;
  }

  /* BOTTOM SPLIT: MAP + 25 BRIEFS (334px) */
  .bottom {
    display: grid;
    grid-template-columns: 356px 1fr;
    gap: 8px;
    flex: 1;
    min-height: 0;
  }
  .bottom-left {
    display: flex;
    flex-direction: column;
    gap: 5px;
    min-height: 0;
  }
  .map-panel {
    background: #0c1b33;
    border: 1px solid #1e3556;
    border-radius: 3px;
    padding: 5px 6px 6px 6px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .panel-hdr {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 8.2px;
    font-weight: 800;
    letter-spacing: 0.8px;
    color: #e6c675;
  }
  .panel-sub {
    color: #94a3b8;
    font-weight: 600;
    letter-spacing: 0.3px;
  }
  .map-legend {
    background: #ffffff;
    border: 1px solid #d5cfc1;
    border-radius: 3px;
    padding: 5px 7px;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .leg-title {
    font-size: 7.8px;
    font-weight: 800;
    letter-spacing: 0.6px;
    color: #0c1b33;
    border-bottom: 1px solid #e2ddd2;
    padding-bottom: 2px;
  }
  .leg-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5px 6px;
    font-size: 7.8px;
    color: #334155;
    line-height: 1.22;
  }
  .leg-item strong { color: #0c1b33; }
  .dot-key {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    font-size: 7.3px;
    font-weight: 700;
    color: #475569;
    border-top: 1px solid #e2ddd2;
    padding-top: 3px;
  }
  .dk-i { display: inline-flex; align-items: center; gap: 3px; }
  .dk-c { width: 6px; height: 6px; border-radius: 50%; display: inline-block; }

  /* BRIEFS PANEL */
  .briefs-panel {
    background: #ffffff;
    border: 1px solid #d5cfc1;
    border-radius: 3px;
    padding: 5px 8px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .briefs-hdr {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1.5px solid #0c1b33;
    padding-bottom: 2.5px;
    margin-bottom: 4px;
  }
  .briefs-title {
    font-size: 8.8px;
    font-weight: 800;
    letter-spacing: 0.8px;
    color: #0c1b33;
  }
  .briefs-sub {
    font-size: 7.8px;
    font-weight: 700;
    color: #64748b;
  }
  .briefs-cols {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 9px;
    flex: 1;
  }
  .brief-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .brief-item {
    font-size: 8.4px;
    line-height: 1.2;
    color: #1e293b;
    display: flex;
    gap: 4px;
    align-items: baseline;
  }
  .b-num {
    font-weight: 800;
    color: #0c1b33;
    min-width: 13px;
    flex-shrink: 0;
  }
  .b-city {
    font-weight: 800;
    color: #991b1b;
    font-size: 7.6px;
    letter-spacing: 0.25px;
  }

  /* FULL-WIDTH RED DATE CHECK BAR: 40px */
  .date-check {
    background: #fef2f2;
    border: 1.5px solid #b91c1c;
    border-radius: 3px;
    padding: 4.5px 8px;
    font-size: 8.15px;
    line-height: 1.28;
    color: #450a0a;
  }
  .dc-badge {
    display: inline-block;
    background: #b91c1c;
    color: #ffffff;
    font-size: 7.5px;
    font-weight: 800;
    letter-spacing: 0.55px;
    padding: 1px 5px;
    border-radius: 2px;
    margin-right: 5px;
  }
</style>
</head>
<body>
<div class="page">
  <header class="masthead">
    <div class="cal-box">
      <div class="cal-top">NOV 19</div>
      <div class="cal-day">19</div>
      <div class="cal-sub">THU 2026</div>
    </div>
    <div class="mast-center">
      <div class="mast-toprow">
        <div class="mast-kicker">THE DAY IN WORLD NEWS</div>
        <div class="mast-pill">36 VERIFIED STORIES · 6 CONTINENTS · STRICTLY 19 NOV</div>
      </div>
      <div class="mast-title">Thursday 19 November 2026</div>
      <div class="mast-sub">Three leaders meet in Shenzhen · A court rules on Myanmar · The biggest IPO ever debuts</div>
    </div>
  </header>

  <main class="body">
    <!-- Proportional Region Count Bar (11 Americas, 7 Europe, 6 Asia, 6 Middle East, 4 Oceania/Global, 2 Africa = 36) -->
    <div class="region-bar">
      <div class="rb-seg" style="flex:11;background:#15803d;">AMERICAS · 11</div>
      <div class="rb-seg" style="flex:7;background:#1d4ed8;">EUROPE · 7</div>
      <div class="rb-seg" style="flex:6;background:#b91c1c;">ASIA · 6</div>
      <div class="rb-seg" style="flex:6;background:#b45309;">MIDDLE EAST · 6</div>
      <div class="rb-seg" style="flex:4;background:#0f766e;">GLOBAL / OCEANIA · 4</div>
      <div class="rb-seg" style="flex:2;background:#6d28d9;">AFRICA · 2</div>
    </div>

    <!-- 6-KPI Strip -->
    <section class="kpi-strip">
      <div class="kpi-tile c1">
        <div class="kpi-v">$81.3bn</div>
        <div class="kpi-l">Anthropic record IPO</div>
      </div>
      <div class="kpi-tile c2">
        <div class="kpi-v">15.9m</div>
        <div class="kpi-l">GTA VI pre-orders</div>
      </div>
      <div class="kpi-tile c3">
        <div class="kpi-v">200,000</div>
        <div class="kpi-l">Evacuated for Akvan</div>
      </div>
      <div class="kpi-tile c4">
        <div class="kpi-v">$120bn</div>
        <div class="kpi-l">COP31 adaptation gap</div>
      </div>
      <div class="kpi-tile c5">
        <div class="kpi-v">730,000</div>
        <div class="kpi-l">Rohingya in ICJ case</div>
      </div>
      <div class="kpi-tile c6">
        <div class="kpi-v">$190.4m</div>
        <div class="kpi-l">Record Van Gogh sale</div>
      </div>
    </section>

    <!-- Row 1: 3 Lead Cards -->
    <section class="lead-grid">
      <article class="lead-card rank-1">
        <div class="lead-art">
          ${SVG_LEAD_1}
          <div class="lead-badge badge-1">1</div>
          <div class="lead-cap">SHENZHEN, CHINA · APEC SUMMIT</div>
        </div>
        <div class="lead-text">
          <div class="meta-row"><span class="kicker">SHENZHEN · SUMMIT</span><span class="source">REUTERS · AP</span></div>
          <h2 class="lead-h">Trump, Xi and Putin hold first three-way summit</h2>
          <p class="lead-p">Arms control and the Iran war top the agenda at the landmark Shenzhen APEC trilateral; Trump and Putin also hold a separate one-on-one meeting.</p>
        </div>
      </article>

      <article class="lead-card rank-2">
        <div class="lead-art">
          ${SVG_LEAD_2}
          <div class="lead-badge badge-2">2</div>
          <div class="lead-cap">NEW ZEALAND WESTWARD · ROLLING LAUNCH</div>
        </div>
        <div class="lead-text">
          <div class="meta-row"><span class="kicker">GLOBAL · GAMES</span><span class="source">BBC · BLOOMBERG</span></div>
          <h2 class="lead-h">GTA VI arrives worldwide after a 13-year wait</h2>
          <p class="lead-p">Midnight rolling release sweeps west from New Zealand with 15.9m pre-orders at $79.99 on PS5 and Xbox (no PC yet), debuting to a 99 Metacritic score.</p>
        </div>
      </article>

      <article class="lead-card rank-3">
        <div class="lead-art">
          ${SVG_LEAD_3}
          <div class="lead-badge badge-3">3</div>
          <div class="lead-cap">NEW YORK · NASDAQ DEBUT</div>
        </div>
        <div class="lead-text">
          <div class="meta-row"><span class="kicker">NASDAQ · MARKETS</span><span class="source">BLOOMBERG · CNBC</span></div>
          <h2 class="lead-h">Anthropic debuts in the biggest IPO on record</h2>
          <p class="lead-p">Priced at $83 above range to raise $81.3bn at ~$1.5tn valuation; Thursday's first trades set the real market price with up to a fifth allocated to retail.</p>
        </div>
      </article>
    </section>

    <!-- Rows 2 & 3: 8 Mid Cards (4..11) -->
    <section class="mid-grid">
      ${MID_CARDS.map(
        (c) => `
      <article class="mid-card">
        <div class="mid-art">
          ${c.svg}
          <div class="mid-dot" style="background:${c.color}">${c.num}</div>
        </div>
        <div class="mid-text">
          <div class="mid-meta"><span class="kicker">${c.kicker}</span><span class="source">${c.source}</span></div>
          <h3 class="mid-h">${c.headline}</h3>
          <p class="mid-p">${c.deck}</p>
        </div>
      </article>`
      ).join("")}
    </section>

    <!-- Bottom Split: World Map + 25 Briefs -->
    <section class="bottom">
      <div class="bottom-left">
        <div class="map-panel">
          <div class="panel-hdr">
            <span>GLOBAL DATELINE MAP · PINS 1–11 &amp; BRIEFS 12–36</span>
            <span class="panel-sub">6 CONTINENTS</span>
          </div>
          ${buildDotMapSvg()}
        </div>
        <div class="map-legend">
          <div class="leg-title">PINNED STORIES (1–11) &amp; BRIEF REGION DOTS (12–36)</div>
          <div class="leg-grid">
            <div class="leg-item"><strong>1</strong> Shenzhen · <strong>2</strong> NZ/Global</div>
            <div class="leg-item"><strong>3</strong> New York · <strong>4</strong> The Hague</div>
            <div class="leg-item"><strong>5</strong> Antalya · <strong>6</strong> Odisha</div>
            <div class="leg-item"><strong>7</strong> Kyiv · <strong>8</strong> APEC Trade</div>
            <div class="leg-item"><strong>9</strong> Florida · <strong>10</strong> Geology</div>
            <div class="leg-item"><strong>11</strong> Paris · <strong>●</strong> Briefs 12–36</div>
          </div>
          <div class="dot-key">
            <span class="dk-i"><span class="dk-c" style="background:#22c55e"></span>Americas</span>
            <span class="dk-i"><span class="dk-c" style="background:#38bdf8"></span>Europe</span>
            <span class="dk-i"><span class="dk-c" style="background:#ef4444"></span>Asia</span>
            <span class="dk-i"><span class="dk-c" style="background:#f59e0b"></span>M. East</span>
            <span class="dk-i"><span class="dk-c" style="background:#a855f7"></span>Africa</span>
            <span class="dk-i"><span class="dk-c" style="background:#14b8a6"></span>Oceania</span>
          </div>
        </div>
      </div>

      <div class="briefs-panel">
        <div class="briefs-hdr">
          <span class="briefs-title">ALSO ON THURSDAY 19 NOVEMBER · 25 VERIFIED WORLD BRIEFS (12–36)</span>
          <span class="briefs-sub">ZERO CARRYOVERS</span>
        </div>
        <div class="briefs-cols">
          <ul class="brief-list">
            ${leftBriefs
              .map(
                (b) =>
                  `<li class="brief-item"><span class="b-num">${b.n}</span><span><span class="b-city">${b.city}:</span> ${b.text}</span></li>`
              )
              .join("")}
          </ul>
          <ul class="brief-list">
            ${rightBriefs
              .map(
                (b) =>
                  `<li class="brief-item"><span class="b-num">${b.n}</span><span><span class="b-city">${b.city}:</span> ${b.text}</span></li>`
              )
              .join("")}
          </ul>
        </div>
      </div>
    </section>

    <!-- Full-Width Red DATE CHECK Bar -->
    <footer class="date-check">
      <span class="dc-badge">DATE CHECK — FIRST REPORTED BEFORE THURSDAY 19 NOV, SO LEFT OUT AS TODAY'S NEWS:</span>
      the Iranian drone interceptions over Kuwait &amp; Bahrain (18 Nov) · EU's €45bn Ukraine loan proposal (18 Nov) · House Democrats' 251–11 vote for Jeffries (18 Nov) · Voyager 1 crossing 1 light-day at 10:16 GMT (18 Nov) · Pew's 2035 Islam projection (18 Nov) · Peltola's Alaska win &amp; Nvidia's Q3 release (17 Nov).
    </footer>
  </main>
</div>
</body>
</html>`;

const outHtml = resolve(HERE, "page.html");
writeFileSync(outHtml, html, "utf8");
console.log(`Wrote ${outHtml} (${Buffer.byteLength(html, "utf8")} bytes)`);
