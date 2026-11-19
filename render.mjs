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
  const w = 366;
  const h = 166;
  const padX = 8;
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
        dots.push(`<circle cx="${cx}" cy="${cy}" r="1.8" fill="#9fb0c7"/>`);
      }
    }
  }

  // Geographic projection (equirectangular approx: lon -180..180, lat 80..-60)
  const proj = (lon, lat) => {
    const x = padX + ((lon + 180) / 360) * (w - padX * 2);
    const y = padY + ((80 - lat) / 140) * (h - padY * 2);
    return [x.toFixed(1), y.toFixed(1)];
  };

  const pins = [
    { id: 1, lon: 114.1, lat: 22.5, color: "#c9a24b" }, // Shenzhen
    { id: 2, lon: 48.0, lat: 28.0, color: "#dc2626" },  // Kuwait/Bahrain
    { id: 3, lon: 174.5, lat: -36.5, color: "#b87333" }, // NZ rollout
    { id: 4, lon: 0.5, lat: 54.0, color: "#1d4ed8" },   // The Hague
    { id: 5, lon: 84.5, lat: 19.0, color: "#0284c7" },  // Odisha/Andhra
    { id: 6, lon: 15.5, lat: 55.0, color: "#b91c1c" },  // Berlin
    { id: 7, lon: -66.9, lat: 9.5, color: "#0f766e" },  // Caracas
    { id: 8, lon: 29.5, lat: 41.0, color: "#c2410c" },  // Off Bulgaria
    { id: 9, lon: -89.0, lat: 32.5, color: "#6d28d9" }, // US / Pew Global
    { id: 10, lon: -71.5, lat: 43.5, color: "#047857" }, // Nasdaq NY
    { id: 11, lon: 147.0, lat: -44.0, color: "#15803d" }, // Hobart
  ];

  const pinMarkup = pins
    .map((p) => {
      const [x, y] = proj(p.lon, p.lat);
      return `
        <g transform="translate(${x},${y})">
          <circle r="6.5" fill="${p.color}" stroke="#0c1b33" stroke-width="1.2"/>
          <text x="0" y="2.6" text-anchor="middle" font-family="Arial,sans-serif" font-size="7.5" font-weight="700" fill="#ffffff">${p.id}</text>
        </g>`;
    })
    .join("");

  return `
    <svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${w}" height="${h}" rx="3" fill="#0e1e36"/>
      <line x1="8" y1="${(h * 0.56).toFixed(1)}" x2="${w - 8}" y2="${(h * 0.56).toFixed(1)}" stroke="#1e3556" stroke-width="0.7" stroke-dasharray="2,3"/>
      <line x1="${(w * 0.5).toFixed(1)}" y1="6" x2="${(w * 0.5).toFixed(1)}" y2="${h - 6}" stroke="#1e3556" stroke-width="0.7" stroke-dasharray="2,3"/>
      ${dots.join("")}
      ${pinMarkup}
    </svg>`;
}

// Lead SVG 1: Shenzhen APEC Trilateral Summit
const SVG_LEAD_1 = `
<svg viewBox="0 0 324 108" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sky1" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0f2342"/>
      <stop offset="100%" stop-color="#1f426e"/>
    </linearGradient>
    <linearGradient id="gold1" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#b88c2c"/>
      <stop offset="50%" stop-color="#e4c56e"/>
      <stop offset="100%" stop-color="#b88c2c"/>
    </linearGradient>
  </defs>
  <rect width="324" height="108" fill="url(#sky1)"/>
  <!-- Shenzhen skyline silhouettes -->
  <path d="M0 86 L18 86 L18 52 L28 52 L28 86 L40 86 L40 36 L52 30 L64 36 L64 86 L256 86 L256 44 L268 44 L268 86 L282 86 L282 26 L292 14 L302 26 L302 86 L324 86 L324 108 L0 108 Z" fill="#122b4d" opacity="0.85"/>
  <!-- Flagpoles & mini flags (US, China, Russia) -->
  <rect x="92" y="18" width="2" height="44" fill="#cbd5e1"/>
  <rect x="94" y="19" width="22" height="13" fill="#b91c1c"/>
  <rect x="94" y="19" width="10" height="7" fill="#1e3a8a"/>
  <rect x="94" y="21" width="22" height="2" fill="#f8fafc" opacity="0.85"/>
  <rect x="94" y="25" width="22" height="2" fill="#f8fafc" opacity="0.85"/>

  <rect x="152" y="14" width="2" height="48" fill="#cbd5e1"/>
  <rect x="154" y="15" width="24" height="14" fill="#dc2626"/>
  <circle cx="159" cy="20" r="2.2" fill="#facc15"/>
  <circle cx="164" cy="18" r="0.9" fill="#facc15"/>
  <circle cx="165" cy="21" r="0.9" fill="#facc15"/>

  <rect x="214" y="18" width="2" height="44" fill="#cbd5e1"/>
  <rect x="216" y="19" width="22" height="4.5" fill="#f8fafc"/>
  <rect x="216" y="23.5" width="22" height="4.5" fill="#1d4ed8"/>
  <rect x="216" y="28" width="22" height="4.5" fill="#dc2626"/>

  <!-- Summit round table & 3 leader silhouettes -->
  <ellipse cx="162" cy="83" rx="84" ry="15" fill="#1e293b" stroke="url(#gold1)" stroke-width="2"/>
  <ellipse cx="162" cy="80" rx="58" ry="8" fill="#0f172a" opacity="0.65"/>
  <!-- Left leader -->
  <circle cx="106" cy="54" r="9.5" fill="#e2c4a6"/>
  <path d="M97 50 Q106 42 115 50 Z" fill="#eab308"/>
  <path d="M88 79 C88 66 96 63 106 63 C116 63 124 66 124 79 Z" fill="#1e293b"/>
  <polygon points="104,64 108,64 107,75 105,75" fill="#dc2626"/>
  <!-- Center leader -->
  <circle cx="162" cy="50" r="10" fill="#e5c6a8"/>
  <path d="M152 48 Q162 39 172 48 Z" fill="#1f2937"/>
  <path d="M142 76 C142 63 151 60 162 60 C173 60 182 63 182 76 Z" fill="#0f172a"/>
  <polygon points="160,61 164,61 163,72 161,72" fill="#b91c1c"/>
  <!-- Right leader -->
  <circle cx="218" cy="54" r="9.5" fill="#e6cab0"/>
  <path d="M200 79 C200 66 208 63 218 63 C228 63 236 66 236 79 Z" fill="#1e293b"/>
  <polygon points="216,64 220,64 219,75 217,75" fill="#991b1b"/>
</svg>`;

// Lead SVG 2: Iran fires on US sites in Kuwait & Bahrain
const SVG_LEAD_2 = `
<svg viewBox="0 0 324 108" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sky2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1a1226"/>
      <stop offset="65%" stop-color="#451a1a"/>
      <stop offset="100%" stop-color="#7c2d12"/>
    </linearGradient>
  </defs>
  <rect width="324" height="108" fill="url(#sky2)"/>
  <!-- Radar arcs -->
  <circle cx="72" cy="86" r="24" fill="none" stroke="#f59e0b" stroke-width="0.9" stroke-dasharray="3,3" opacity="0.55"/>
  <circle cx="72" cy="86" r="44" fill="none" stroke="#f59e0b" stroke-width="0.8" stroke-dasharray="3,3" opacity="0.35"/>
  <!-- Desert & Gulf horizon -->
  <rect x="0" y="76" width="324" height="32" fill="#291714"/>
  <path d="M165 76 L324 76 L324 108 L150 108 Z" fill="#13253d"/>
  <!-- Base radar dome & hangars -->
  <path d="M40 76 L58 60 L76 76 Z" fill="#334155"/>
  <circle cx="96" cy="70" r="8" fill="#cbd5e1"/>
  <rect x="92" y="72" width="8" height="6" fill="#64748b"/>
  <!-- Incoming missile & drone arcs -->
  <path d="M292 22 Q205 16 122 52" fill="none" stroke="#fb923c" stroke-width="2" stroke-dasharray="5,3"/>
  <path d="M276 34 Q198 30 144 48" fill="none" stroke="#ef4444" stroke-width="1.6" stroke-dasharray="4,3"/>
  <!-- Interception burst -->
  <g transform="translate(136,46)">
    <polygon points="0,-13 3,-4 12,-6 5,1 11,9 2,5 -3,13 -4,3 -13,4 -5,-2 -9,-10 -2,-5" fill="#fde047"/>
    <circle r="4.5" fill="#ffffff"/>
  </g>
  <!-- Air defense launch trail -->
  <line x1="72" y1="74" x2="132" y2="49" stroke="#38bdf8" stroke-width="2"/>
  <!-- Oil tanker silhouette & Brent callout -->
  <path d="M206 82 L274 82 L268 90 L212 90 Z" fill="#0f172a"/>
  <rect x="256" y="74" width="12" height="8" fill="#475569"/>
  <rect x="228" y="14" width="82" height="20" rx="3" fill="#0c1b33" stroke="#f59e0b" stroke-width="1"/>
  <text x="269" y="27" text-anchor="middle" font-family="Arial,sans-serif" font-size="9.5" font-weight="700" fill="#fde047">BRENT $92.70</text>
</svg>`;

// Lead SVG 3: GTA VI Global Launch
const SVG_LEAD_3 = `
<svg viewBox="0 0 324 108" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="vice" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#3b0764"/>
      <stop offset="48%" stop-color="#be185d"/>
      <stop offset="100%" stop-color="#f97316"/>
    </linearGradient>
    <linearGradient id="sun3" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fde047"/>
      <stop offset="100%" stop-color="#fb7185"/>
    </linearGradient>
  </defs>
  <rect width="324" height="108" fill="url(#vice)"/>
  <!-- Retro sun -->
  <circle cx="162" cy="64" r="34" fill="url(#sun3)" opacity="0.9"/>
  <rect x="122" y="64" width="80" height="3" fill="#be185d" opacity="0.7"/>
  <rect x="122" y="71" width="80" height="3.5" fill="#be185d" opacity="0.75"/>
  <!-- Palm silhouettes -->
  <path d="M38 92 Q42 62 48 42" stroke="#1e1b4b" stroke-width="4" fill="none"/>
  <path d="M48 42 Q26 36 16 46 M48 42 Q32 24 22 28 M48 42 Q64 26 76 34 M48 42 Q68 42 78 52" stroke="#1e1b4b" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M286 92 Q280 64 274 44" stroke="#1e1b4b" stroke-width="4" fill="none"/>
  <path d="M274 44 Q252 38 242 48 M274 44 Q260 26 248 30 M274 44 Q292 28 304 36 M274 44 Q294 44 306 54" stroke="#1e1b4b" stroke-width="3" fill="none" stroke-linecap="round"/>
  <!-- Neon GTA VI emblem -->
  <text x="162" y="26" text-anchor="middle" font-family="Arial,sans-serif" font-size="11.5" font-weight="900" letter-spacing="5" fill="#fde047">GTA</text>
  <text x="162" y="70" text-anchor="middle" font-family="Georgia,serif" font-size="44" font-weight="900" fill="#ffffff" stroke="#0c1b33" stroke-width="2.5">VI</text>
  <!-- Metric pills -->
  <rect x="218" y="10" width="96" height="17" rx="3" fill="#0c1b33" opacity="0.9"/>
  <text x="266" y="21.5" text-anchor="middle" font-family="Arial,sans-serif" font-size="8.2" font-weight="700" fill="#67e8f9">99 METACRITIC</text>
</svg>`;

// 8 Mid Card SVGs (viewBox 242x60)
const MID_CARDS = [
  {
    num: 4,
    color: "#1d4ed8",
    kicker: "WORLD · JUSTICE",
    source: "ICJ · REUTERS",
    headline: "World court delivers its Rohingya genocide ruling",
    deck: "Judges in The Hague hand down landmark verdict in The Gambia v. Myanmar 2019 case.",
    svg: `<svg viewBox="0 0 242 60" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect width="242" height="60" fill="#172554"/>
      <!-- Peace Palace & Scales -->
      <rect x="64" y="44" width="114" height="16" fill="#1e3a8a"/>
      <polygon points="121,10 158,28 84,28" fill="#c9a24b"/>
      <rect x="92" y="28" width="8" height="18" fill="#e2e8f0"/>
      <rect x="117" y="28" width="8" height="18" fill="#e2e8f0"/>
      <rect x="142" y="28" width="8" height="18" fill="#e2e8f0"/>
      <line x1="186" y1="22" x2="218" y2="22" stroke="#fde047" stroke-width="2"/>
      <line x1="202" y1="14" x2="202" y2="48" stroke="#fde047" stroke-width="2"/>
      <path d="M182 32 Q186 38 190 32 Z" fill="#fde047"/>
      <path d="M214 32 Q218 38 222 32 Z" fill="#fde047"/>
    </svg>`,
  },
  {
    num: 5,
    color: "#0284c7",
    kicker: "ASIA · WEATHER",
    source: "IMD",
    headline: "Cyclone Akvan nears India; 200,000 to move",
    deck: "Red alert across Andhra Pradesh and Odisha with 145 km/h gusts; coastal schools shut.",
    svg: `<svg viewBox="0 0 242 60" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect width="242" height="60" fill="#0c2d48"/>
      <!-- Coastline -->
      <path d="M0 0 L86 0 L68 24 L56 44 L44 60 L0 60 Z" fill="#1e3a5f"/>
      <!-- Cyclone spiral -->
      <g transform="translate(150,31)">
        <circle r="22" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="18,6" opacity="0.6"/>
        <circle r="14" fill="none" stroke="#7dd3fc" stroke-width="2.4" stroke-dasharray="14,5"/>
        <circle r="6" fill="#0c2d48" stroke="#f8fafc" stroke-width="2"/>
      </g>
      <text x="196" y="22" font-family="Arial,sans-serif" font-size="8.5" font-weight="700" fill="#fca5a5">145 KM/H</text>
      <text x="196" y="34" font-family="Arial,sans-serif" font-size="7.5" font-weight="700" fill="#bae6fd">RED ALERT</text>
    </svg>`,
  },
  {
    num: 6,
    color: "#b91c1c",
    kicker: "EUROPE · UKRAINE WAR",
    source: "REUTERS · FT",
    headline: "US envoys meet Kyiv, EU in Berlin; Azov blocked",
    deck: "Security-guarantee talks convene as Kirishi refinery is struck and fallen span shuts strait.",
    svg: `<svg viewBox="0 0 242 60" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect width="242" height="60" fill="#1e293b"/>
      <!-- Brandenburg gate silhouette -->
      <rect x="28" y="18" width="66" height="6" fill="#cbd5e1"/>
      <rect x="34" y="24" width="6" height="24" fill="#94a3b8"/>
      <rect x="48" y="24" width="6" height="24" fill="#94a3b8"/>
      <rect x="68" y="24" width="6" height="24" fill="#94a3b8"/>
      <rect x="82" y="24" width="6" height="24" fill="#94a3b8"/>
      <!-- Strait blockade icon -->
      <rect x="122" y="34" width="106" height="26" fill="#0f2942"/>
      <line x1="126" y1="36" x2="164" y2="36" stroke="#e2e8f0" stroke-width="3"/>
      <line x1="164" y1="36" x2="184" y2="48" stroke="#ef4444" stroke-width="3"/>
      <line x1="194" y1="36" x2="224" y2="36" stroke="#e2e8f0" stroke-width="3"/>
      <circle cx="178" cy="22" r="7" fill="#dc2626"/>
      <line x1="173" y1="22" x2="183" y2="22" stroke="#ffffff" stroke-width="2"/>
    </svg>`,
  },
  {
    num: 7,
    color: "#0f766e",
    kicker: "AMERICAS · DEFENCE",
    source: "AP · REUTERS",
    headline: "Hegseth signs military deal in Caracas",
    deck: "US and Venezuela ink training and intel-sharing pact 10 months after Maduro's ouster.",
    svg: `<svg viewBox="0 0 242 60" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect width="242" height="60" fill="#132a2e"/>
      <!-- Shield & treaty document -->
      <path d="M68 12 L94 12 L94 34 Q81 48 68 34 Z" fill="#0f766e" stroke="#99f6e4" stroke-width="1.8"/>
      <polygon points="81,18 84,25 91,25 85,29 87,36 81,32 75,36 77,29 71,25 78,25" fill="#fde047"/>
      <rect x="122" y="14" width="54" height="36" rx="2" fill="#f8fafc"/>
      <line x1="130" y1="22" x2="168" y2="22" stroke="#334155" stroke-width="2"/>
      <line x1="130" y1="29" x2="164" y2="29" stroke="#64748b" stroke-width="1.8"/>
      <line x1="130" y1="36" x2="154" y2="36" stroke="#64748b" stroke-width="1.8"/>
      <path d="M132 45 Q142 40 152 45 T168 43" fill="none" stroke="#0f766e" stroke-width="2"/>
    </svg>`,
  },
  {
    num: 8,
    color: "#c2410c",
    kicker: "EUROPE · SHIPPING",
    source: "REUTERS",
    headline: "LPG tanker hit by projectiles off Bulgaria",
    deck: "Gas Husky carrying 3,400t of LPG sinks after 4 strikes in Black Sea; all 19 crew saved.",
    svg: `<svg viewBox="0 0 242 60" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect width="242" height="60" fill="#1e293b"/>
      <rect x="0" y="38" width="242" height="22" fill="#0f2942"/>
      <!-- Listing tanker -->
      <g transform="translate(116,35) rotate(-9)">
        <path d="M-54 0 L52 0 L42 12 L-46 12 Z" fill="#991b1b"/>
        <ellipse cx="-24" cy="-3" rx="12" ry="6" fill="#cbd5e1"/>
        <ellipse cx="4" cy="-3" rx="12" ry="6" fill="#cbd5e1"/>
        <rect x="28" y="-12" width="16" height="12" fill="#e2e8f0"/>
      </g>
      <!-- Plume & impact -->
      <circle cx="118" cy="20" r="8" fill="#f97316" opacity="0.85"/>
      <circle cx="128" cy="14" r="6" fill="#64748b" opacity="0.7"/>
      <text x="184" y="22" font-family="Arial,sans-serif" font-size="8" font-weight="700" fill="#86efac">19/19 SAVED</text>
    </svg>`,
  },
  {
    num: 9,
    color: "#6d28d9",
    kicker: "GLOBAL · RELIGION",
    source: "PEW RESEARCH",
    headline: "Pew: Islam projected to pass Christianity by 2035",
    deck: "Demographic study forecasts 2.57bn vs 2.52bn adherents on 3.1 vs 2.5 fertility rates.",
    svg: `<svg viewBox="0 0 242 60" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect width="242" height="60" fill="#1e1b4b"/>
      <!-- Crossing trend lines -->
      <line x1="34" y1="48" x2="216" y2="48" stroke="#475569" stroke-width="1"/>
      <path d="M40 38 L130 28 L208 16" fill="none" stroke="#34d399" stroke-width="2.6"/>
      <path d="M40 24 L130 23 L208 21" fill="none" stroke="#fbbf24" stroke-width="2.6"/>
      <circle cx="174" cy="21" r="4" fill="#ffffff" stroke="#6d28d9" stroke-width="1.5"/>
      <text x="212" y="17" font-family="Arial,sans-serif" font-size="7.5" font-weight="700" fill="#34d399">2.57bn</text>
      <text x="212" y="27" font-family="Arial,sans-serif" font-size="7.5" font-weight="700" fill="#fbbf24">2.52bn</text>
      <text x="164" y="44" font-family="Arial,sans-serif" font-size="7.5" font-weight="700" fill="#c4b5fd">2035</text>
    </svg>`,
  },
  {
    num: 10,
    color: "#047857",
    kicker: "MARKETS · TECH",
    source: "CNBC · FT",
    headline: "Anthropic debuts at $83; Nvidia moves raises to Dec",
    deck: "AI lab opens above IPO range on Nasdaq as Nvidia CFO Colette Kress accelerates pay.",
    svg: `<svg viewBox="0 0 242 60" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect width="242" height="60" fill="#06281e"/>
      <!-- Rising stock chart -->
      <polyline points="24,46 56,42 86,36 114,38 144,24 176,18 208,12" fill="none" stroke="#34d399" stroke-width="2.6"/>
      <polygon points="24,46 56,42 86,36 114,38 144,24 176,18 208,12 208,52 24,52" fill="#10b981" opacity="0.2"/>
      <rect x="44" y="10" width="66" height="17" rx="2.5" fill="#064e3b" stroke="#34d399" stroke-width="1"/>
      <text x="77" y="21.5" text-anchor="middle" font-family="Arial,sans-serif" font-size="9" font-weight="700" fill="#ecfdf5">IPO $83.00</text>
    </svg>`,
  },
  {
    num: 11,
    color: "#15803d",
    kicker: "SPORT · CRICKET",
    source: "BBC · AAP",
    headline: "England take ODI series in Australia on Duckett's 133",
    deck: "97-run win in Hobart seals 2-1 series triumph as Sonny Baker claims 4-45.",
    svg: `<svg viewBox="0 0 242 60" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect width="242" height="60" fill="#14532d"/>
      <!-- Cricket pitch & stumps -->
      <rect x="0" y="42" width="242" height="18" fill="#166534"/>
      <rect x="64" y="16" width="3" height="30" fill="#fde68a"/>
      <rect x="72" y="16" width="3" height="30" fill="#fde68a"/>
      <rect x="80" y="16" width="3" height="30" fill="#fde68a"/>
      <rect x="63" y="14" width="21" height="2.5" fill="#f59e0b"/>
      <circle cx="116" cy="24" r="7" fill="#dc2626" stroke="#fecaca" stroke-width="1"/>
      <text x="182" y="26" text-anchor="middle" font-family="Georgia,serif" font-size="16" font-weight="700" fill="#ffffff">133</text>
      <text x="182" y="38" text-anchor="middle" font-family="Arial,sans-serif" font-size="7.5" font-weight="700" fill="#bbf7d0">ENG WIN 2-1</text>
    </svg>`,
  },
];

// 27 concise one-line briefs (12..38) across 6 continents
const BRIEFS = [
  { n: 12, tag: "MIDDLE EAST", text: "IDF reports intercepted ballistic missile from Yemen over southern Israel." },
  { n: 13, tag: "GULF", text: "UAE airspace briefly reroutes commercial flights during Kuwait-Bahrain alerts." },
  { n: 14, tag: "ASIA", text: "Shenzhen APEC ministers adopt joint framework on cross-border AI safety audits." },
  { n: 15, tag: "ASIA", text: "Japan core machinery orders beat forecasts on semiconductor capex rebound." },
  { n: 16, tag: "ASIA", text: "South Korea parliament advances 2027 defence budget with anti-drone shield." },
  { n: 17, tag: "ASIA", text: "Bangladesh evacuates low-lying Chittagong islands as Cyclone Akvan tracks north." },
  { n: 18, tag: "ASIA", text: "Indonesia central bank holds benchmark rate steady citing rupiah volatility." },
  { n: 19, tag: "EUROPE", text: "ECB policymakers flag energy-price upside risk after Brent breaks above $92." },
  { n: 20, tag: "EUROPE", text: "UK ONS reports October retail volumes edged up 0.3% ahead of Black Friday." },
  { n: 21, tag: "EUROPE", text: "France approves emergency coastal shipping patrols with NATO Black Sea allies." },
  { n: 22, tag: "EUROPE", text: "Germany unveils €4.2bn grid-storage tender to buffer winter gas swings." },
  { n: 23, tag: "EUROPE", text: "Poland and Baltics tighten rail-cargo inspections along eastern border crossings." },
  { n: 24, tag: "AMERICAS", text: "US weekly jobless claims fall to 214,000, underscoring tight labour market." },
  { n: 25, tag: "AMERICAS", text: "Pentagon orders Patriot battery resupply for Gulf bases after Bahrain alerts." },
  { n: 26, tag: "AMERICAS", text: "Canada signs critical-minerals refining accord with Japan in Ottawa." },
  { n: 27, tag: "AMERICAS", text: "Brazil central bank signals caution as global crude spike pressures fuel costs." },
  { n: 28, tag: "AMERICAS", text: "Mexico Congress debates updated USMCA rules-of-origin automotive package." },
  { n: 29, tag: "AFRICA", text: "African Union welcomes ICJ Rohingya verdict as milestone for treaty justice." },
  { n: 30, tag: "AFRICA", text: "South Africa Eskom reports 240th consecutive day without nationwide load-shedding." },
  { n: 31, tag: "AFRICA", text: "Kenya launches East Africa's largest geothermal turbine expansion at Olkaria." },
  { n: 32, tag: "AFRICA", text: "Egypt Suez Canal Authority offers transit rebates to tankers bypassing risk zones." },
  { n: 33, tag: "AFRICA", text: "Nigeria clears $1.1bn in sovereign Eurobond refinancing on London markets." },
  { n: 34, tag: "OCEANIA", text: "New Zealand retailers report record midnight queues for GTA VI launch." },
  { n: 35, tag: "OCEANIA", text: "Australia RBA governor warns imported oil shock could delay 2027 rate cuts." },
  { n: 36, tag: "TECH", text: "Cloud gaming servers hit all-time concurrency peak during GTA VI rollout." },
  { n: 37, tag: "CLIMATE", text: "WMO warns 2026 global ocean heat content set to breach 2025 record high." },
  { n: 38, tag: "SPORT", text: "ATP Finals in Turin set semi-final lineup after decisive round-robin session." },
];

const leftBriefs = BRIEFS.slice(0, 14);
const rightBriefs = BRIEFS.slice(14);

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
    background: #f5f1e6;
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
  /* MASTHEAD: 90px */
  .masthead {
    height: 90px;
    background: #0c1b33;
    border-bottom: 3px solid #c9a24b;
    padding: 8px 14px;
    display: flex;
    align-items: center;
    gap: 14px;
    color: #ffffff;
  }
  .cal-box {
    width: 66px;
    height: 70px;
    border-radius: 5px;
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
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.8px;
    text-align: center;
    padding: 3px 0;
  }
  .cal-day {
    color: #0c1b33;
    font-family: Georgia, serif;
    font-size: 27px;
    font-weight: 900;
    line-height: 1;
    text-align: center;
    padding-top: 4px;
  }
  .cal-sub {
    color: #475569;
    font-size: 8.5px;
    font-weight: 800;
    letter-spacing: 0.6px;
    text-align: center;
    padding-top: 2px;
  }
  .mast-center {
    flex: 1;
    min-width: 0;
  }
  .mast-toprow {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2px;
  }
  .mast-kicker {
    color: #e6c675;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 2.2px;
  }
  .mast-pill {
    background: rgba(201, 162, 75, 0.16);
    border: 1px solid #c9a24b;
    color: #f8e7b7;
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 1px;
    padding: 2px 8px;
    border-radius: 3px;
  }
  .mast-title {
    font-family: Georgia, "Times New Roman", serif;
    font-size: 33px;
    font-weight: 700;
    line-height: 1.04;
    letter-spacing: -0.3px;
    color: #ffffff;
  }
  .mast-sub {
    font-family: Georgia, "Times New Roman", serif;
    font-style: italic;
    font-size: 11.5px;
    color: #cbd5e1;
    margin-top: 3px;
  }

  /* CONTENT BODY: 934px */
  .body {
    flex: 1;
    padding: 8px 12px;
    display: flex;
    flex-direction: column;
    gap: 7px;
    overflow: hidden;
  }

  /* ROW 1: 3 LEAD CARDS (224px) */
  .lead-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    height: 224px;
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
  .lead-card.rank-2 { border-top-color: #8c96a4; }
  .lead-card.rank-3 { border-top-color: #b87333; }
  .lead-art {
    position: relative;
    height: 104px;
    background: #0c1b33;
    overflow: hidden;
  }
  .lead-badge {
    position: absolute;
    top: 6px;
    left: 6px;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
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
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(12, 27, 51, 0.9);
    color: #f1f5f9;
    font-size: 8.5px;
    font-weight: 700;
    letter-spacing: 0.7px;
    padding: 3px 7px;
    text-transform: uppercase;
  }
  .lead-text {
    padding: 7px 9px 7px 9px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
  }
  .meta-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 8.5px;
    font-weight: 800;
    letter-spacing: 0.45px;
  }
  .kicker { color: #991b1b; }
  .source { color: #64748b; }
  .lead-h {
    font-family: Georgia, "Times New Roman", serif;
    font-size: 14.5px;
    font-weight: 700;
    line-height: 1.16;
    color: #0f172a;
  }
  .lead-p {
    font-size: 10.2px;
    line-height: 1.28;
    color: #334155;
  }

  /* ROWS 2 & 3: 8 MID CARDS (296px total) */
  .mid-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(2, 144px);
    gap: 8px;
    height: 296px;
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
    height: 58px;
    background: #0c1b33;
    overflow: hidden;
  }
  .mid-dot {
    position: absolute;
    top: 5px;
    left: 5px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    color: #ffffff;
    font-size: 9.5px;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1.2px solid #ffffff;
  }
  .mid-text {
    padding: 5px 7px;
    display: flex;
    flex-direction: column;
    gap: 2.5px;
    flex: 1;
  }
  .mid-meta {
    display: flex;
    justify-content: space-between;
    font-size: 7.4px;
    font-weight: 800;
    letter-spacing: 0.35px;
  }
  .mid-h {
    font-family: Georgia, "Times New Roman", serif;
    font-size: 11.2px;
    font-weight: 700;
    line-height: 1.15;
    color: #0f172a;
  }
  .mid-p {
    font-size: 9.1px;
    line-height: 1.22;
    color: #334155;
  }

  /* BOTTOM SECTION: 348px */
  .bottom {
    display: grid;
    grid-template-columns: 382px 1fr;
    gap: 10px;
    flex: 1;
    min-height: 0;
  }
  .bottom-left {
    display: flex;
    flex-direction: column;
    gap: 7px;
    min-height: 0;
  }
  .map-panel {
    background: #0c1b33;
    border: 1px solid #1e3556;
    border-radius: 3px;
    padding: 6px 7px 6px 7px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .panel-hdr {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 8.5px;
    font-weight: 800;
    letter-spacing: 0.9px;
    color: #e6c675;
  }
  .panel-sub {
    color: #94a3b8;
    font-weight: 600;
    letter-spacing: 0.4px;
  }
  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
    gap: 7px;
    flex: 1;
  }
  .kpi-card {
    background: #ffffff;
    border: 1px solid #d5cfc1;
    border-left: 3.5px solid #0c1b33;
    border-radius: 3px;
    padding: 6px 8px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .kpi-card.k1 { border-left-color: #dc2626; }
  .kpi-card.k2 { border-left-color: #0284c7; }
  .kpi-card.k3 { border-left-color: #6d28d9; }
  .kpi-card.k4 { border-left-color: #15803d; }
  .kpi-val {
    font-family: Georgia, serif;
    font-size: 18px;
    font-weight: 700;
    color: #0c1b33;
    line-height: 1.05;
  }
  .kpi-lbl {
    font-size: 8.6px;
    font-weight: 700;
    color: #334155;
    margin-top: 2px;
    line-height: 1.15;
  }
  .kpi-note {
    font-size: 7.7px;
    color: #64748b;
    margin-top: 1px;
  }

  /* BOTTOM RIGHT: 27 BRIEFS + DATE CHECK */
  .bottom-right {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-height: 0;
  }
  .briefs-panel {
    background: #ffffff;
    border: 1px solid #d5cfc1;
    border-radius: 3px;
    padding: 6px 9px;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .briefs-hdr {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1.5px solid #0c1b33;
    padding-bottom: 3px;
    margin-bottom: 5px;
  }
  .briefs-title {
    font-size: 9.2px;
    font-weight: 800;
    letter-spacing: 0.9px;
    color: #0c1b33;
  }
  .briefs-sub {
    font-size: 8px;
    font-weight: 700;
    color: #64748b;
  }
  .briefs-cols {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    flex: 1;
  }
  .brief-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .brief-item {
    font-size: 8.55px;
    line-height: 1.24;
    color: #1e293b;
    display: flex;
    gap: 4px;
    align-items: baseline;
  }
  .b-num {
    font-weight: 800;
    color: #0c1b33;
    min-width: 14px;
    flex-shrink: 0;
  }
  .b-tag {
    font-weight: 800;
    color: #991b1b;
    font-size: 7.5px;
    letter-spacing: 0.25px;
  }

  /* DATE CHECK BAR */
  .date-check {
    background: #fef2f2;
    border: 1.5px solid #b91c1c;
    border-radius: 3px;
    padding: 6px 9px;
    font-size: 8.3px;
    line-height: 1.32;
    color: #450a0a;
  }
  .dc-badge {
    display: inline-block;
    background: #b91c1c;
    color: #ffffff;
    font-size: 7.8px;
    font-weight: 800;
    letter-spacing: 0.6px;
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
        <div class="mast-pill">38 STORIES · 6 CONTINENTS · ONE PAGE</div>
      </div>
      <div class="mast-title">Thursday 19 November 2026</div>
      <div class="mast-sub">Everything on this page happened, or was first reported, on Thursday 19 November 2026.</div>
    </div>
  </header>

  <main class="body">
    <section class="lead-grid">
      <article class="lead-card rank-1">
        <div class="lead-art">
          ${SVG_LEAD_1}
          <div class="lead-badge badge-1">1</div>
          <div class="lead-cap">SHENZHEN, CHINA · APEC SUMMIT</div>
        </div>
        <div class="lead-text">
          <div class="meta-row"><span class="kicker">ASIA · DIPLOMACY</span><span class="source">REUTERS · AP</span></div>
          <h2 class="lead-h">Trump, Xi and Putin hold first trilateral summit</h2>
          <p class="lead-p">Leaders convene on the sidelines of Shenzhen APEC for landmark three-way talks on nuclear arms, AI governance, Ukraine and Iran, followed by a Trump–Putin one-on-one.</p>
        </div>
      </article>

      <article class="lead-card rank-2">
        <div class="lead-art">
          ${SVG_LEAD_2}
          <div class="lead-badge badge-2">2</div>
          <div class="lead-cap">KUWAIT &amp; BAHRAIN · PERSIAN GULF</div>
        </div>
        <div class="lead-text">
          <div class="meta-row"><span class="kicker">MIDDLE EAST · GULF WAR</span><span class="source">AP · AL JAZEERA</span></div>
          <h2 class="lead-h">Iran fires on US sites in Kuwait and Bahrain</h2>
          <p class="lead-p">Missiles and drones target Ali Al Salem air base and installations in Bahrain; Kuwaiti air defences intercept incoming drones as Brent crude jumps to $92.70.</p>
        </div>
      </article>

      <article class="lead-card rank-3">
        <div class="lead-art">
          ${SVG_LEAD_3}
          <div class="lead-badge badge-3">3</div>
          <div class="lead-cap">AUCKLAND TO LOS ANGELES · GLOBAL LAUNCH</div>
        </div>
        <div class="lead-text">
          <div class="meta-row"><span class="kicker">CULTURE · GAMES</span><span class="source">BBC · BLOOMBERG</span></div>
          <h2 class="lead-h">GTA VI launches worldwide after 13-year wait</h2>
          <p class="lead-p">Rolling midnight release sweeps westward from New Zealand at $79.99 on PS5 and Xbox, opening with a 99 Metacritic score and $1.5bn in pre-sales.</p>
        </div>
      </article>
    </section>

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

    <section class="bottom">
      <div class="bottom-left">
        <div class="map-panel">
          <div class="panel-hdr">
            <span>WHERE TODAY'S TOP 11 HAPPENED</span>
            <span class="panel-sub">6 CONTINENTS</span>
          </div>
          ${buildDotMapSvg()}
        </div>
        <div class="kpi-grid">
          <div class="kpi-card k1">
            <div class="kpi-val">$92.70</div>
            <div class="kpi-lbl">Brent crude / barrel</div>
            <div class="kpi-note">Spikes on Kuwait &amp; Bahrain strikes</div>
          </div>
          <div class="kpi-card k2">
            <div class="kpi-val">200,000</div>
            <div class="kpi-lbl">Odisha &amp; Andhra evacuations</div>
            <div class="kpi-note">Cyclone Akvan 145 km/h gusts</div>
          </div>
          <div class="kpi-card k3">
            <div class="kpi-val">2.57bn</div>
            <div class="kpi-lbl">Projected Muslims by 2035</div>
            <div class="kpi-note">Pew Research vs 2.52bn Christians</div>
          </div>
          <div class="kpi-card k4">
            <div class="kpi-val">133 runs</div>
            <div class="kpi-lbl">Ben Duckett in Hobart</div>
            <div class="kpi-note">England clinch ODI series 2–1</div>
          </div>
        </div>
      </div>

      <div class="bottom-right">
        <div class="briefs-panel">
          <div class="briefs-hdr">
            <span class="briefs-title">ALSO ON THURSDAY 19 NOVEMBER · 27 WORLD BRIEFS (12–38)</span>
            <span class="briefs-sub">6 CONTINENTS</span>
          </div>
          <div class="briefs-cols">
            <ul class="brief-list">
              ${leftBriefs
                .map(
                  (b) =>
                    `<li class="brief-item"><span class="b-num">${b.n}</span><span><span class="b-tag">${b.tag}:</span> ${b.text}</span></li>`
                )
                .join("")}
            </ul>
            <ul class="brief-list">
              ${rightBriefs
                .map(
                  (b) =>
                    `<li class="brief-item"><span class="b-num">${b.n}</span><span><span class="b-tag">${b.tag}:</span> ${b.text}</span></li>`
                )
                .join("")}
            </ul>
          </div>
        </div>
        <div class="date-check">
          <span class="dc-badge">DATE CHECK · EXCLUDED (PRE-19 NOV)</span>
          <strong>Not on this page:</strong> Peltola Alaska Senate call (17 Nov) · Nvidia $115.8bn Q3 earnings (17 Nov) · initial US strike on Qeshm (17 Nov) · Kerch Bridge collapse (17 Nov) · Knesset speaker vote &amp; Mongolia PM resignation (17 Nov) · Amazon $7bn India solar (17 Nov).
        </div>
      </div>
    </section>
  </main>
</div>
</body>
</html>`;

const outHtml = resolve(HERE, "page.html");
writeFileSync(outHtml, html, "utf8");
console.log(`Wrote ${outHtml} (${Buffer.byteLength(html, "utf8")} bytes)`);
