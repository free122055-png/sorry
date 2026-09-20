// Pixel Background Album - 100+ High Quality Social Media, Poster & Quote Backgrounds
// Faithfully matches user's uploaded poster frame styles with 100+ distinct themes

export interface BackgroundAlbumItem {
  id: string;
  name: string;
  nameBn: string;
  category: "poster" | "islamic" | "quotes" | "notice" | "aesthetic";
  categoryBn: string;
  themeColor: string;
  accentColor: string;
  textColor: string;
  defaultCaption: string;
  svg: string;
}

let svgUidCounter = 0;
function getSvgUid(): string {
  return "bg_" + (++svgUidCounter);
}

// Helper to generate Modern Curve & Notch Poster Frames (User's uploaded exact style)
function createPosterFrameSvg(
  primary: string,
  secondary: string,
  tertiary: string,
  bgCenter = "#ffffff",
  variant: "stripes" | "halftone" | "tech" | "modern" = "stripes"
): string {
  const uid = getSvgUid();
  const bgGradId = `bgGrad_${uid}`;
  const waveGrad1Id = `waveGrad1_${uid}`;
  const waveGrad2Id = `waveGrad2_${uid}`;
  const shadowId = `shadow_${uid}`;

  const halftoneDots = variant === "halftone" ? `
    <g fill="${secondary}" opacity="0.4">
      ${Array.from({ length: 6 }).map((_, r) => 
        Array.from({ length: 6 }).map((_, c) => 
          `<circle cx="${780 + c * 32}" cy="${60 + r * 32}" r="${(6 - Math.max(r, c) * 0.7) > 0 ? (6 - Math.max(r, c) * 0.7) : 1.5}"/>`
        ).join("")
      ).join("")}
    </g>
  ` : "";

  const cornerElements = variant === "stripes" ? `
    <!-- Top-left diagonal stripes & notch -->
    <path d="M 0,0 L 150,0 L 50,150 L 0,220 Z" fill="${primary}"/>
    <g transform="translate(60, 40) rotate(-45)">
      <rect x="0" y="0" width="60" height="8" rx="4" fill="${secondary}"/>
      <rect x="0" y="16" width="48" height="8" rx="4" fill="${secondary}"/>
      <rect x="0" y="32" width="36" height="8" rx="4" fill="${secondary}"/>
    </g>
    <!-- Bottom-right diagonal stripes & notch -->
    <path d="M 1000,1030 L 1000,1250 L 850,1250 L 950,1100 Z" fill="${primary}"/>
    <g transform="translate(890, 1150) rotate(-45)">
      <rect x="0" y="0" width="60" height="8" rx="4" fill="${secondary}"/>
      <rect x="0" y="16" width="48" height="8" rx="4" fill="${secondary}"/>
      <rect x="0" y="32" width="36" height="8" rx="4" fill="${secondary}"/>
    </g>
  ` : variant === "halftone" ? `
    <!-- Top-left fluid organic corner tab -->
    <path d="M 0,0 L 220,0 C 180,30 160,80 140,110 C 100,160 50,170 0,170 Z" fill="${primary}"/>
    <path d="M 0,0 L 170,0 C 140,25 120,60 100,85 C 70,120 40,130 0,130 Z" fill="${secondary}" opacity="0.85"/>
    <circle cx="80" cy="80" r="14" fill="#ffffff" opacity="0.9"/>
  ` : variant === "tech" ? `
    <!-- High-tech angled brackets -->
    <path d="M 0,0 L 180,0 L 130,50 L 50,50 L 50,130 L 0,180 Z" fill="${primary}"/>
    <path d="M 1000,0 L 820,0 L 870,50 L 950,50 L 950,130 L 1000,180 Z" fill="${primary}"/>
    <line x1="60" y1="60" x2="160" y2="60" stroke="${secondary}" stroke-width="4" stroke-linecap="round"/>
    <line x1="840" y1="60" x2="940" y2="60" stroke="${secondary}" stroke-width="4" stroke-linecap="round"/>
  ` : `
    <!-- Modern Clean Ribbon Header -->
    <path d="M 0,0 L 250,0 L 210,70 L 0,70 Z" fill="${primary}"/>
    <path d="M 1000,0 L 750,0 L 790,70 L 1000,70 Z" fill="${primary}"/>
    <rect x="225" y="15" width="550" height="4" rx="2" fill="${secondary}" opacity="0.5"/>
  `;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1250" width="100%" height="100%">
      <defs>
        <linearGradient id="${bgGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${bgCenter}"/>
          <stop offset="60%" stop-color="${bgCenter}"/>
          <stop offset="100%" stop-color="${secondary}" stop-opacity="0.12"/>
        </linearGradient>
        <linearGradient id="${waveGrad1Id}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${secondary}"/>
          <stop offset="100%" stop-color="${primary}"/>
        </linearGradient>
        <linearGradient id="${waveGrad2Id}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${primary}"/>
          <stop offset="100%" stop-color="${tertiary}"/>
        </linearGradient>
        <filter id="${shadowId}" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.15"/>
        </filter>
      </defs>

      <!-- Main Center Canvas Area -->
      <rect width="1000" height="1250" fill="url(#${bgGradId})"/>

      <!-- Side Rails / Borders -->
      <rect x="0" y="180" width="45" height="780" rx="4" fill="${primary}" opacity="0.95"/>
      <rect x="955" y="180" width="45" height="780" rx="4" fill="${primary}" opacity="0.95"/>
      <rect x="12" y="240" width="6" height="660" rx="3" fill="${secondary}" opacity="0.7"/>
      <rect x="982" y="240" width="6" height="660" rx="3" fill="${secondary}" opacity="0.7"/>

      ${halftoneDots}
      ${cornerElements}

      <!-- Bottom Fluid Overlapping Waves (User's Exact Style) -->
      <!-- Wave 1 (Back wave, translucent) -->
      <path d="M 0,1050 C 200,980 400,1080 650,1030 C 850,990 950,1040 1000,1020 L 1000,1250 L 0,1250 Z" fill="${secondary}" opacity="0.35"/>

      <!-- Wave 2 (Middle wave) -->
      <path d="M 0,1110 C 250,1040 500,1140 750,1080 C 880,1050 960,1070 1000,1060 L 1000,1250 L 0,1250 Z" fill="url(#${waveGrad1Id})" opacity="0.75"/>

      <!-- Wave Crest Highlight Stroke -->
      <path d="M 0,1145 C 300,1075 550,1165 800,1115 C 920,1090 970,1105 1000,1100" fill="none" stroke="#ffffff" stroke-width="4" opacity="0.8"/>

      <!-- Wave 3 (Front dynamic wave) -->
      <path d="M 0,1150 C 280,1080 520,1170 800,1120 C 900,1100 970,1110 1000,1100 L 1000,1250 L 0,1250 Z" fill="url(#${waveGrad2Id})"/>

      <!-- Delicate Inner Border Guide -->
      <rect x="58" y="70" width="884" height="990" rx="12" fill="none" stroke="${primary}" stroke-width="1.5" stroke-opacity="0.15" stroke-dasharray="6,4"/>
    </svg>
  `.trim();
}

// Helper to generate Islamic & Quranic Frames (মাদরাসা, আয়াত, হাদিস ও জুমার ফ্রেম)
function createIslamicFrameSvg(
  goldColor = "#d4af37",
  baseColor = "#0f3a2b",
  bgPaper = "#fffdf7",
  type: "arch" | "lantern" | "geometric" | "ornate" = "arch"
): string {
  const uid = getSvgUid();
  const islamicBgId = `islamicBg_${uid}`;

  const centerMotif = type === "lantern" ? `
    <!-- Hanging Lanterns (ফানুস) -->
    <g stroke="${goldColor}" stroke-width="2" fill="none">
      <line x1="200" y1="0" x2="200" y2="120"/>
      <path d="M 185,120 L 215,120 L 225,160 L 175,160 Z" fill="${goldColor}" fill-opacity="0.2"/>
      <circle cx="200" cy="140" r="10" fill="${goldColor}"/>
      <line x1="800" y1="0" x2="800" y2="120"/>
      <path d="M 785,120 L 815,120 L 825,160 L 775,160 Z" fill="${goldColor}" fill-opacity="0.2"/>
      <circle cx="800" cy="140" r="10" fill="${goldColor}"/>
      <!-- Center Crescent Moon -->
      <path d="M 520,70 A 30,30 0 1,0 520,120 A 24,24 0 1,1 520,70 Z" fill="${goldColor}"/>
    </g>
  ` : type === "arch" ? `
    <!-- Traditional Mihrab Arch (মিহরাব নকশা) -->
    <path d="M 100,300 L 100,180 Q 100,80 500,60 Q 900,80 900,180 L 900,300" fill="none" stroke="${goldColor}" stroke-width="4"/>
    <path d="M 120,300 L 120,190 Q 120,100 500,80 Q 880,100 880,190 L 880,300" fill="none" stroke="${goldColor}" stroke-width="1.5" stroke-opacity="0.6"/>
    <!-- Dome Apex Pin -->
    <polygon points="500,45 506,58 494,58" fill="${goldColor}"/>
    <circle cx="500" cy="40" r="5" fill="${goldColor}"/>
  ` : `
    <!-- Top Bismillah / Quran Ornament Space -->
    <g transform="translate(500, 75)" fill="${goldColor}">
      <path d="M -150,0 C -80,-25 80,-25 150,0 C 80,15 -80,15 -150,0 Z" opacity="0.3"/>
      <circle cx="0" cy="0" r="8"/>
      <circle cx="-60" cy="0" r="4"/>
      <circle cx="60" cy="0" r="4"/>
    </g>
  `;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1250" width="100%" height="100%">
      <defs>
        <linearGradient id="${islamicBgId}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${bgPaper}"/>
          <stop offset="75%" stop-color="${bgPaper}"/>
          <stop offset="100%" stop-color="${baseColor}" stop-opacity="0.08"/>
        </linearGradient>
      </defs>

      <rect width="1000" height="1250" fill="url(#${islamicBgId})"/>

      <!-- Outer Islamic Multi-Border -->
      <rect x="35" y="35" width="930" height="1180" rx="16" fill="none" stroke="${baseColor}" stroke-width="12"/>
      <rect x="52" y="52" width="896" height="1146" rx="10" fill="none" stroke="${goldColor}" stroke-width="3"/>
      <rect x="62" y="62" width="876" height="1126" rx="8" fill="none" stroke="${goldColor}" stroke-width="1" stroke-dasharray="8,5" opacity="0.7"/>

      <!-- 4 Corner Arabesque Stars -->
      ${[
        [65, 65],
        [935, 65],
        [65, 1185],
        [935, 1185]
      ].map(([x, y]) => `
        <g transform="translate(${x}, ${y})">
          <rect x="-16" y="-16" width="32" height="32" fill="${baseColor}" stroke="${goldColor}" stroke-width="2"/>
          <rect x="-16" y="-16" width="32" height="32" fill="none" stroke="${goldColor}" stroke-width="2" transform="rotate(45)"/>
          <circle cx="0" cy="0" r="4" fill="${goldColor}"/>
        </g>
      `).join("")}

      ${centerMotif}

      <!-- Bottom Mosque Dome Skyline Motif -->
      <g transform="translate(0, 1120)" fill="${baseColor}" opacity="0.25">
        <path d="M 200,80 Q 250,20 300,80 Z"/>
        <path d="M 400,80 Q 500,-10 600,80 Z"/>
        <path d="M 700,80 Q 750,20 800,80 Z"/>
        <rect x="180" y="80" width="640" height="40"/>
      </g>
    </svg>
  `.trim();
}

// Helper to generate Quote & Poetry Frames (উক্তি, কবিতা ও বাণীর জন্য ফ্রেম)
function createQuoteFrameSvg(
  borderColor = "#1e293b",
  accentColor = "#6366f1",
  bgColor = "#fafaf9",
  style: "minimal" | "quotes" | "editorial" | "card" = "quotes"
): string {
  const quoteMarks = style === "quotes" ? `
    <!-- Top Left Giant Stylized Quotation Mark -->
    <text x="120" y="240" font-family="Georgia, serif" font-size="160" fill="${accentColor}" opacity="0.2" font-weight="bold">“</text>
    <text x="820" y="1050" font-family="Georgia, serif" font-size="160" fill="${accentColor}" opacity="0.2" font-weight="bold">”</text>
  ` : "";

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1250" width="100%" height="100%">
      <rect width="1000" height="1250" fill="${bgColor}"/>

      ${style === "card" ? `
        <!-- Floating Card Shadow & Shape -->
        <rect x="60" y="70" width="880" height="1110" rx="32" fill="#ffffff" stroke="${accentColor}" stroke-width="2" opacity="0.95"/>
        <line x1="140" y1="180" x2="260" y2="180" stroke="${accentColor}" stroke-width="6" stroke-linecap="round"/>
      ` : `
        <!-- Editorial Minimal Frame -->
        <rect x="70" y="70" width="860" height="1110" rx="8" fill="none" stroke="${borderColor}" stroke-width="3"/>
        <rect x="85" y="85" width="830" height="1080" rx="4" fill="none" stroke="${accentColor}" stroke-width="1" opacity="0.4"/>
        
        <!-- Corner Brackets -->
        <path d="M 50,110 L 50,50 L 110,50" fill="none" stroke="${accentColor}" stroke-width="5"/>
        <path d="M 950,110 L 950,50 L 890,50" fill="none" stroke="${accentColor}" stroke-width="5"/>
        <path d="M 50,1140 L 50,1200 L 110,1200" fill="none" stroke="${accentColor}" stroke-width="5"/>
        <path d="M 950,1140 L 950,1200 L 890,1200" fill="none" stroke="${accentColor}" stroke-width="5"/>
      `}

      ${quoteMarks}

      <!-- Bottom Author / Caption Line -->
      <line x1="380" y1="1120" x2="620" y2="1120" stroke="${borderColor}" stroke-width="2" stroke-linecap="round" opacity="0.4"/>
      <circle cx="500" cy="1120" r="5" fill="${accentColor}"/>
    </svg>
  `.trim();
}

// Helper to generate Notice & Announcement Frames (জরুরি বিজ্ঞপ্তি, বিশেষ অফার ও ঘোষণা ফ্রেম)
function createNoticeFrameSvg(
  headerColor = "#dc2626",
  bodyBorderColor = "#1e3a8a",
  badgeText = "বিজ্ঞপ্তি",
  isUrgent = false
): string {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1250" width="100%" height="100%">
      <rect width="1000" height="1250" fill="#ffffff"/>

      <!-- Top Header Banner Bar -->
      <path d="M 0,0 L 1000,0 L 1000,160 L 850,160 L 820,130 L 180,130 L 150,160 L 0,160 Z" fill="${headerColor}"/>
      
      <!-- Caution Striping on Top if Urgent -->
      ${isUrgent ? `
        <g opacity="0.25">
          ${Array.from({ length: 16 }).map((_, i) => `
            <polygon points="${i * 70},0 ${i * 70 + 35},0 ${i * 70 - 15},40 ${i * 70 - 50},40" fill="#000000"/>
          `).join("")}
        </g>
      ` : ""}

      <!-- Header Label Badge -->
      <g transform="translate(500, 130)">
        <rect x="-180" y="-35" width="360" height="70" rx="35" fill="#ffffff" stroke="${headerColor}" stroke-width="5"/>
        <text x="0" y="10" font-family="'Hind Siliguri', 'Noto Sans Bengali', sans-serif" font-size="34" font-weight="900" fill="${headerColor}" text-anchor="middle">${badgeText}</text>
      </g>

      <!-- Main Body Border -->
      <rect x="50" y="190" width="900" height="980" rx="16" fill="none" stroke="${bodyBorderColor}" stroke-width="6"/>
      <rect x="62" y="202" width="876" height="956" rx="10" fill="none" stroke="${headerColor}" stroke-width="2" stroke-dasharray="10,6" opacity="0.6"/>

      <!-- Corner Reinforcements -->
      <rect x="44" y="184" width="30" height="30" fill="${headerColor}"/>
      <rect x="926" y="184" width="30" height="30" fill="${headerColor}"/>
      <rect x="44" y="1156" width="30" height="30" fill="${headerColor}"/>
      <rect x="926" y="1156" width="30" height="30" fill="${headerColor}"/>

      <!-- Bottom Stamp / Sign Section Placeholder -->
      <line x1="120" y1="1120" x2="380" y2="1120" stroke="#94a3b8" stroke-width="2"/>
      <line x1="620" y1="1120" x2="880" y2="1120" stroke="#94a3b8" stroke-width="2"/>
    </svg>
  `.trim();
}

// Helper to generate Aesthetic Gradients & Neon Glow (নিয়ন ও অ্যাস্থেটিক ফ্রেম)
function createAestheticSvg(
  grad1: string,
  grad2: string,
  grad3: string,
  darkTheme = false
): string {
  const uid = getSvgUid();
  const neonGradId = `neonGrad_${uid}`;
  const meshGlowId = `meshGlow_${uid}`;
  const meshGlow2Id = `meshGlow2_${uid}`;
  const bg = darkTheme ? "#0a0a0f" : "#fafafa";
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1250" width="100%" height="100%">
      <defs>
        <linearGradient id="${neonGradId}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${grad1}"/>
          <stop offset="50%" stop-color="${grad2}"/>
          <stop offset="100%" stop-color="${grad3}"/>
        </linearGradient>
        <radialGradient id="${meshGlowId}" cx="80%" cy="20%" r="60%">
          <stop offset="0%" stop-color="${grad1}" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="${bg}" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="${meshGlow2Id}" cx="20%" cy="85%" r="55%">
          <stop offset="0%" stop-color="${grad2}" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="${bg}" stop-opacity="0"/>
        </radialGradient>
      </defs>

      <rect width="1000" height="1250" fill="${bg}"/>
      <rect width="1000" height="1250" fill="url(#${meshGlowId})"/>
      <rect width="1000" height="1250" fill="url(#${meshGlow2Id})"/>

      <!-- Glowing Neon Border Frame -->
      <rect x="60" y="60" width="880" height="1130" rx="28" fill="none" stroke="url(#${neonGradId})" stroke-width="6"/>
      <rect x="74" y="74" width="852" height="1102" rx="20" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="${darkTheme ? '0.2' : '0.6'}"/>

      <!-- Modern Cyber/Geometric Accents -->
      <circle cx="100" cy="100" r="8" fill="${grad1}"/>
      <circle cx="900" cy="100" r="8" fill="${grad2}"/>
      <circle cx="100" cy="1150" r="8" fill="${grad3}"/>
      <circle cx="900" cy="1150" r="8" fill="${grad1}"/>
    </svg>
  `.trim();
}

// -------------------------------------------------------------
// 108+ Complete Background Album Items (Exceeds 100+ requirement)
// -------------------------------------------------------------

export const BACKGROUND_ALBUM_ITEMS: BackgroundAlbumItem[] = [
  // ========================================================
  // CATEGORY 1: MODERN POSTER FRAMES (28 Items - Exact User Style)
  // ========================================================
  {
    id: "poster-sage-green",
    name: "Sage Forest Green",
    nameBn: "সেজ ফরেস্ট গ্রিন ফ্রেম",
    category: "poster",
    categoryBn: "পোস্টার ফ্রেম",
    themeColor: "#274736",
    accentColor: "#589073",
    textColor: "#1f3d2b",
    defaultCaption: "এখানে আপনার শিরোনাম বা বক্তব্য লিখুন...",
    svg: createPosterFrameSvg("#1f3d2b", "#589073", "#2d553d", "#ffffff", "stripes")
  },
  {
    id: "poster-turquoise-cyan",
    name: "Turquoise Cyan Wave",
    nameBn: "টার্কিশ সায়ান ওয়েভ ফ্রেম",
    category: "poster",
    categoryBn: "পোস্টার ফ্রেম",
    themeColor: "#00838f",
    accentColor: "#00b4d8",
    textColor: "#005662",
    defaultCaption: "আজকের বিশেষ ভাবনা ও অনুপ্রেরণা...",
    svg: createPosterFrameSvg("#00838f", "#00b4d8", "#006064", "#ffffff", "halftone")
  },
  {
    id: "poster-crimson-red",
    name: "Crimson Ruby Wave",
    nameBn: "ক্রিমসন রুবি রেড ফ্রেম",
    category: "poster",
    categoryBn: "পোস্টার ফ্রেম",
    themeColor: "#9e0026",
    accentColor: "#ff4d6d",
    textColor: "#800f2f",
    defaultCaption: "গুরুত্বপূর্ণ বার্তা ও শিরোনাম...",
    svg: createPosterFrameSvg("#9e0026", "#ff4d6d", "#ba181b", "#ffffff", "stripes")
  },
  {
    id: "poster-royal-blue",
    name: "Royal Cobalt Wave",
    nameBn: "রয়েল ব্লু টেক ফ্রেম",
    category: "poster",
    categoryBn: "পোস্টার ফ্রেম",
    themeColor: "#03045e",
    accentColor: "#0096c7",
    textColor: "#023e8a",
    defaultCaption: "ডিজিটাল পোস্টার ও সুন্দর ক্যাপশন...",
    svg: createPosterFrameSvg("#03045e", "#0096c7", "#0077b6", "#ffffff", "halftone")
  },
  {
    id: "poster-golden-amber",
    name: "Golden Sun Amber",
    nameBn: "গোল্ডেন সান অ্যাম্বার ফ্রেম",
    category: "poster",
    categoryBn: "পোস্টার ফ্রেম",
    themeColor: "#b45309",
    accentColor: "#f59e0b",
    textColor: "#78350f",
    defaultCaption: "উজ্জ্বল দিনের অনুপ্রেরণামূলক বার্তা...",
    svg: createPosterFrameSvg("#b45309", "#f59e0b", "#d97706", "#ffffff", "stripes")
  },
  {
    id: "poster-olive-khaki",
    name: "Olive Khaki Gold",
    nameBn: "অলিভ খাকি গোল্ড ফ্রেম",
    category: "poster",
    categoryBn: "পোস্টার ফ্রেম",
    themeColor: "#4d5b24",
    accentColor: "#84a93c",
    textColor: "#333d16",
    defaultCaption: "প্রকৃতির সৌন্দর্য ও মূল্যবান কথা...",
    svg: createPosterFrameSvg("#4d5b24", "#84a93c", "#657e2a", "#ffffff", "tech")
  },
  {
    id: "poster-citrus-tangerine",
    name: "Citrus Lime & Orange",
    nameBn: "সিট্রাস লাইম ও অরেঞ্জ ফ্রেম",
    category: "poster",
    categoryBn: "পোস্টার ফ্রেম",
    themeColor: "#ea580c",
    accentColor: "#84cc16",
    textColor: "#9a3412",
    defaultCaption: "আকর্ষণীয় অফার ও প্রাণবন্ত শিরোনাম...",
    svg: createPosterFrameSvg("#ea580c", "#84cc16", "#c2410c", "#ffffff", "modern")
  },
  {
    id: "poster-indigo-magenta",
    name: "Indigo Blue & Magenta",
    nameBn: "ইন্ডিগো ও ভায়োলেট ফ্রেম",
    category: "poster",
    categoryBn: "পোস্টার ফ্রেম",
    themeColor: "#4338ca",
    accentColor: "#c026d3",
    textColor: "#312e81",
    defaultCaption: "আধুনিক ডিজাইন ও প্রিমিয়াম লেখা...",
    svg: createPosterFrameSvg("#4338ca", "#c026d3", "#6366f1", "#ffffff", "stripes")
  },
  {
    id: "poster-leaf-rose",
    name: "Leaf Green & Rose Pink",
    nameBn: "লিফ গ্রিন ও রোজ পিংক ফ্রেম",
    category: "poster",
    categoryBn: "পোস্টার ফ্রেম",
    themeColor: "#15803d",
    accentColor: "#e11d48",
    textColor: "#14532d",
    defaultCaption: "সুন্দর মুহূর্ত ও চমৎকার অনুভূতির কথা...",
    svg: createPosterFrameSvg("#15803d", "#e11d48", "#16a34a", "#ffffff", "halftone")
  },
  {
    id: "poster-deep-purple",
    name: "Deep Velvet Purple",
    nameBn: "ডিপ রয়েল পার্পল ফ্রেম",
    category: "poster",
    categoryBn: "পোস্টার ফ্রেম",
    themeColor: "#581c87",
    accentColor: "#a855f7",
    textColor: "#3b0764",
    defaultCaption: "অভিজাত ক্যাপশন ও ক্লাসিক বার্তা...",
    svg: createPosterFrameSvg("#581c87", "#a855f7", "#7e22ce", "#ffffff", "stripes")
  },
  {
    id: "poster-ocean-azure",
    name: "Ocean Sky Azure",
    nameBn: "ওশান স্কাই অ্যাজিউর ফ্রেম",
    category: "poster",
    categoryBn: "পোস্টার ফ্রেম",
    themeColor: "#0284c7",
    accentColor: "#38bdf8",
    textColor: "#0369a1",
    defaultCaption: "শান্ত মনে জীবনের সুন্দর উপলব্ধি...",
    svg: createPosterFrameSvg("#0284c7", "#38bdf8", "#0369a1", "#ffffff", "halftone")
  },
  {
    id: "poster-hot-pink",
    name: "Hot Pink Magenta",
    nameBn: "হট পিংক ম্যাজেন্টা ফ্রেম",
    category: "poster",
    categoryBn: "পোস্টার ফ্রেম",
    themeColor: "#be185d",
    accentColor: "#ec4899",
    textColor: "#831843",
    defaultCaption: "আনন্দ ও উৎসবের সেরা বার্তা...",
    svg: createPosterFrameSvg("#be185d", "#ec4899", "#db2777", "#ffffff", "modern")
  },
  {
    id: "poster-emerald-gold",
    name: "Emerald & Rich Gold",
    nameBn: "এমারেল্ড গ্রিন ও গোল্ড ফ্রেম",
    category: "poster",
    categoryBn: "পোস্টার ফ্রেম",
    themeColor: "#065f46",
    accentColor: "#d97706",
    textColor: "#064e3b",
    defaultCaption: "পরম করুণাময়ের অশেষ কৃপা...",
    svg: createPosterFrameSvg("#065f46", "#d97706", "#047857", "#ffffff", "stripes")
  },
  {
    id: "poster-charcoal-silver",
    name: "Charcoal & Platinum Silver",
    nameBn: "চারকোল ও সিলভার টেক ফ্রেম",
    category: "poster",
    categoryBn: "পোস্টার ফ্রেম",
    themeColor: "#1e293b",
    accentColor: "#94a3b8",
    textColor: "#0f172a",
    defaultCaption: "অফিসিয়াল বিজ্ঞপ্তি ও কর্পোরেট ক্যাপশন...",
    svg: createPosterFrameSvg("#1e293b", "#94a3b8", "#334155", "#ffffff", "tech")
  },
  {
    id: "poster-cyber-yellow",
    name: "Cyber Black & Yellow",
    nameBn: "সাইবার ব্ল্যাক ও ইয়েলো ফ্রেম",
    category: "poster",
    categoryBn: "পোস্টার ফ্রেম",
    themeColor: "#18181b",
    accentColor: "#eab308",
    textColor: "#18181b",
    defaultCaption: "বিশেষ ঘোষণা ও হাইলাইটেড নোটিশ...",
    svg: createPosterFrameSvg("#18181b", "#eab308", "#27272a", "#ffffff", "tech")
  },
  {
    id: "poster-sunset-coral",
    name: "Sunset Coral & Peach",
    nameBn: "সানসেট কোরাল ও পিচ ফ্রেম",
    category: "poster",
    categoryBn: "পোস্টার ফ্রেম",
    themeColor: "#c2410c",
    accentColor: "#fb923c",
    textColor: "#7c2d12",
    defaultCaption: "জীবন চলার পথের সুন্দর স্মৃতি...",
    svg: createPosterFrameSvg("#c2410c", "#fb923c", "#f97316", "#ffffff", "modern")
  },
  {
    id: "poster-bordeaux-wine",
    name: "Bordeaux Deep Wine",
    nameBn: "বোরদোক্স ডিপ ওয়াইন ফ্রেম",
    category: "poster",
    categoryBn: "পোস্টার ফ্রেম",
    themeColor: "#701a75",
    accentColor: "#d946ef",
    textColor: "#4a044e",
    defaultCaption: "গভীর ভাবনার মূল্যবান কথামালা...",
    svg: createPosterFrameSvg("#701a75", "#d946ef", "#86198f", "#ffffff", "stripes")
  },
  {
    id: "poster-mint-fresh",
    name: "Fresh Mint & Pine",
    nameBn: "ফ্রেশ মিন্ট ও পাইন ফ্রেম",
    category: "poster",
    categoryBn: "পোস্টার ফ্রেম",
    themeColor: "#115e59",
    accentColor: "#2dd4bf",
    textColor: "#134e4a",
    defaultCaption: "সুস্থ শরীর ও সতেজ মনের ভাবনা...",
    svg: createPosterFrameSvg("#115e59", "#2dd4bf", "#0d9488", "#ffffff", "halftone")
  },
  {
    id: "poster-navy-bronze",
    name: "Midnight Navy & Bronze",
    nameBn: "মিডনাইট নেভি ও ব্রোঞ্জ ফ্রেম",
    category: "poster",
    categoryBn: "পোস্টার ফ্রেম",
    themeColor: "#0f172a",
    accentColor: "#d97706",
    textColor: "#020617",
    defaultCaption: "প্রফেশনাল পোস্টার ও স্পষ্ট বার্তা...",
    svg: createPosterFrameSvg("#0f172a", "#d97706", "#1e293b", "#ffffff", "tech")
  },
  {
    id: "poster-lavender-mist",
    name: "Lavender Mist & Violet",
    nameBn: "ল্যাভেন্ডার মিস্ট ও ভায়োলেট ফ্রেম",
    category: "poster",
    categoryBn: "পোস্টার ফ্রেম",
    themeColor: "#6b21a8",
    accentColor: "#c084fc",
    textColor: "#581c87",
    defaultCaption: "শান্ত ও সৌম্য অনুভূতির কবিতা...",
    svg: createPosterFrameSvg("#6b21a8", "#c084fc", "#7e22ce", "#ffffff", "modern")
  },
  {
    id: "poster-teal-coral",
    name: "Teal Green & Warm Coral",
    nameBn: "টিল গ্রিন ও ওয়ার্ম কোরাল ফ্রেম",
    category: "poster",
    categoryBn: "পোস্টার ফ্রেম",
    themeColor: "#0f766e",
    accentColor: "#f43f5e",
    textColor: "#115e59",
    defaultCaption: "স্পেশাল শুভেচ্ছা ও শুভকামনা...",
    svg: createPosterFrameSvg("#0f766e", "#f43f5e", "#14b8a6", "#ffffff", "stripes")
  },
  {
    id: "poster-electric-lime",
    name: "Electric Lime & Carbon",
    nameBn: "ইলেকট্রিক লাইম ও কার্বন ফ্রেম",
    category: "poster",
    categoryBn: "পোস্টার ফ্রেম",
    themeColor: "#27272a",
    accentColor: "#a3e635",
    textColor: "#18181b",
    defaultCaption: "স্পোর্টস ও ফিটনেস সংক্রান্ত পোস্ট...",
    svg: createPosterFrameSvg("#27272a", "#a3e635", "#3f3f46", "#ffffff", "tech")
  },
  {
    id: "poster-crimson-gold",
    name: "Crimson Red & Royal Gold",
    nameBn: "ক্রিমসন রেড ও রয়্যাল গোল্ড",
    category: "poster",
    categoryBn: "পোস্টার ফ্রেম",
    themeColor: "#b91c1c",
    accentColor: "#eab308",
    textColor: "#7f1d1d",
    defaultCaption: "বিজয় ও উৎসবের আনন্দঘন বার্তা...",
    svg: createPosterFrameSvg("#b91c1c", "#eab308", "#dc2626", "#ffffff", "stripes")
  },
  {
    id: "poster-sapphire-cyan",
    name: "Sapphire Blue & Cyan Glow",
    nameBn: "স্যাফায়ার ব্লু ও সায়ান গ্লো",
    category: "poster",
    categoryBn: "পোস্টার ফ্রেম",
    themeColor: "#1d4ed8",
    accentColor: "#06b6d4",
    textColor: "#1e3a8a",
    defaultCaption: "জ্ঞান ও সফলতার সোনালী পথ...",
    svg: createPosterFrameSvg("#1d4ed8", "#06b6d4", "#2563eb", "#ffffff", "halftone")
  },
  {
    id: "poster-ruby-rose",
    name: "Ruby Red & Soft Rose",
    nameBn: "রুবি রেড ও সফট রোজ ফ্রেম",
    category: "poster",
    categoryBn: "পোস্টার ফ্রেম",
    themeColor: "#be123c",
    accentColor: "#fb7185",
    textColor: "#881337",
    defaultCaption: "ভালোবাসা ও কৃতজ্ঞতার বাণী...",
    svg: createPosterFrameSvg("#be123c", "#fb7185", "#e11d48", "#ffffff", "modern")
  },
  {
    id: "poster-chocolate-gold",
    name: "Dark Chocolate & Warm Gold",
    nameBn: "চকলেট ব্রাউন ও গোল্ড ফ্রেম",
    category: "poster",
    categoryBn: "পোস্টার ফ্রেম",
    themeColor: "#451a03",
    accentColor: "#f59e0b",
    textColor: "#291205",
    defaultCaption: "অভিজ্ঞতা ও প্রজ্ঞার কথা...",
    svg: createPosterFrameSvg("#451a03", "#f59e0b", "#78350f", "#ffffff", "stripes")
  },
  {
    id: "poster-cyberpunk-cyan-pink",
    name: "Cyber Neon Cyan & Pink",
    nameBn: "সাইবার নিয়ন সায়ান ও পিংক",
    category: "poster",
    categoryBn: "পোস্টার ফ্রেম",
    themeColor: "#0e7490",
    accentColor: "#f43f5e",
    textColor: "#164e63",
    defaultCaption: "ফিউচারিস্টিক টেক পোস্ট ও ক্যাপশন...",
    svg: createPosterFrameSvg("#0e7490", "#f43f5e", "#06b6d4", "#ffffff", "tech")
  },
  {
    id: "poster-forest-mint",
    name: "Deep Forest & Fresh Mint",
    nameBn: "ডিপ ফরেস্ট ও সতেজ মিন্ট",
    category: "poster",
    categoryBn: "পোস্টার ফ্রেম",
    themeColor: "#14532d",
    accentColor: "#4ade80",
    textColor: "#052e16",
    defaultCaption: "সবুজ প্রকৃতি ও শান্তির বার্তা...",
    svg: createPosterFrameSvg("#14532d", "#4ade80", "#166534", "#ffffff", "halftone")
  },

  // ========================================================
  // CATEGORY 2: ISLAMIC & HADITH FRAMES (20 Items)
  // ========================================================
  {
    id: "islamic-emerald-arch",
    name: "Emerald Mihrab Arch",
    nameBn: "পান্না সবুজ মিহরাব ফ্রেম",
    category: "islamic",
    categoryBn: "ইসলামিক ও হাদিস",
    themeColor: "#065f46",
    accentColor: "#d4af37",
    textColor: "#064e3b",
    defaultCaption: "“নিশ্চয়ই কষ্টের সাথেই রয়েছে স্বস্তি।”\n— সূরা আল-ইনশিরাহ",
    svg: createIslamicFrameSvg("#d4af37", "#065f46", "#fffdf7", "arch")
  },
  {
    id: "islamic-royal-lantern",
    name: "Royal Navy & Golden Lanterns",
    nameBn: "রয়েল নেভি ও ফানুস ফ্রেম",
    category: "islamic",
    categoryBn: "ইসলামিক ও হাদিস",
    themeColor: "#0f172a",
    accentColor: "#eab308",
    textColor: "#020617",
    defaultCaption: "“তোমরা ধৈর্য ও সালাতের মাধ্যমে সাহায্য চাও।”\n— আল-কুরআন",
    svg: createIslamicFrameSvg("#eab308", "#0f172a", "#fefdfa", "lantern")
  },
  {
    id: "islamic-maroon-geometric",
    name: "Ottoman Maroon & Gold",
    nameBn: "অটোমান মেরুন ও গোল্ড ফ্রেম",
    category: "islamic",
    categoryBn: "ইসলামিক ও হাদিস",
    themeColor: "#7f1d1d",
    accentColor: "#f59e0b",
    textColor: "#450a0a",
    defaultCaption: "“সর্বোত্তম মানুষ সেই, যার চরিত্র সবচেয়ে সুন্দর।”\n— সহীহ বুখারী",
    svg: createIslamicFrameSvg("#f59e0b", "#7f1d1d", "#fffbf7", "geometric")
  },
  {
    id: "islamic-pure-white-gold",
    name: "Pure White & Golden Arch",
    nameBn: "সাদা ও সোনালী মিহরাব ফ্রেম",
    category: "islamic",
    categoryBn: "ইসলামিক ও হাদিস",
    themeColor: "#b45309",
    accentColor: "#d97706",
    textColor: "#1e293b",
    defaultCaption: "“যে আল্লাহর ওপর ভরসা করে, তিনিই তার জন্য যথেষ্ট।”\n— সূরা আত-তালাক",
    svg: createIslamicFrameSvg("#d97706", "#b45309", "#ffffff", "arch")
  },
  {
    id: "islamic-sapphire-arabesque",
    name: "Sapphire Blue Arabesque",
    nameBn: "নীল নীলকান্তমণি ও সোনা ফ্রেম",
    category: "islamic",
    categoryBn: "ইসলামিক ও হাদিস",
    themeColor: "#1e3a8a",
    accentColor: "#fbbf24",
    textColor: "#172554",
    defaultCaption: "জুম্মা মোবারক! আজকের দিনটি সবার জন্য কল্যাণময় হোক।",
    svg: createIslamicFrameSvg("#fbbf24", "#1e3a8a", "#f8fafc", "ornate")
  },
  {
    id: "islamic-parchment-vintage",
    name: "Antique Parchment Quranic",
    nameBn: "ভিন্টেজ পার্চমেন্ট ইসলামিক ফ্রেম",
    category: "islamic",
    categoryBn: "ইসলামিক ও হাদিস",
    themeColor: "#78350f",
    accentColor: "#b45309",
    textColor: "#451a03",
    defaultCaption: "“হে আমার রব, আমাকে ক্ষমা করো এবং রহম করো।”",
    svg: createIslamicFrameSvg("#b45309", "#78350f", "#fef3c7", "arch")
  },
  {
    id: "islamic-dark-obsidian-gold",
    name: "Dark Obsidian & Gold Lantern",
    nameBn: "ডার্ক অবসিডিয়ান ও গোল্ড ফানুস",
    category: "islamic",
    categoryBn: "ইসলামিক ও হাদিস",
    themeColor: "#18181b",
    accentColor: "#facc15",
    textColor: "#09090b",
    defaultCaption: "“হে আল্লাহ, আমাদের দুনিয়া ও আখিরাতে কল্যাণ দান করুন।”",
    svg: createIslamicFrameSvg("#facc15", "#18181b", "#ffffff", "lantern")
  },
  {
    id: "islamic-teal-crescent",
    name: "Teal Mosque Crescent",
    nameBn: "টিল গ্রিন চাঁদ ও তারা ফ্রেম",
    category: "islamic",
    categoryBn: "ইসলামিক ও হাদিস",
    themeColor: "#134e4a",
    accentColor: "#2dd4bf",
    textColor: "#042f2e",
    defaultCaption: "রমজান মোবারক! প্রতিটি রোজা যেন কবুল হয়।",
    svg: createIslamicFrameSvg("#2dd4bf", "#134e4a", "#f0fdfa", "arch")
  },
  {
    id: "islamic-olive-hadith",
    name: "Olive Gold Hadith Border",
    nameBn: "অলিভ গোল্ড হাদিস ফ্রেম",
    category: "islamic",
    categoryBn: "ইসলামিক ও হাদিস",
    themeColor: "#365314",
    accentColor: "#a3e635",
    textColor: "#1a2e05",
    defaultCaption: "“প্রতিটি ভালো কাজই একটি সদকা।”\n— সহীহ মুসলিম",
    svg: createIslamicFrameSvg("#a3e635", "#365314", "#f7fee7", "ornate")
  },
  {
    id: "islamic-sand-gold-arch",
    name: "Desert Sand & Royal Gold",
    nameBn: "মরু বালুকা ও রয়্যাল গোল্ড ফ্রেম",
    category: "islamic",
    categoryBn: "ইসলামিক ও হাদিস",
    themeColor: "#92400e",
    accentColor: "#d97706",
    textColor: "#78350f",
    defaultCaption: "“আল্লাহ ছাড়া আর কোনো মাবুদ নেই।”\n— লা ইলাহা ইল্লাল্লাহ",
    svg: createIslamicFrameSvg("#d97706", "#92400e", "#fffbeb", "arch")
  },
  {
    id: "islamic-indigo-dome",
    name: "Indigo Night Sky Arch",
    nameBn: "ইন্ডিগো রজনী আকাশ ও মিহরাব",
    category: "islamic",
    categoryBn: "ইসলামিক ও হাদিস",
    themeColor: "#312e81",
    accentColor: "#818cf8",
    textColor: "#1e1b4b",
    defaultCaption: "তাহাজ্জুদের নীরব প্রার্থনায় প্রভুর সান্নিধ্য...",
    svg: createIslamicFrameSvg("#818cf8", "#312e81", "#f5f3ff", "arch")
  },
  {
    id: "islamic-crimson-mihrab",
    name: "Deep Crimson Mihrab",
    nameBn: "ডিপ ক্রিমসন মিহরাব ফ্রেম",
    category: "islamic",
    categoryBn: "ইসলামিক ও হাদিস",
    themeColor: "#881337",
    accentColor: "#f43f5e",
    textColor: "#4c0519",
    defaultCaption: "“মাতা-পিতার পদতলে সন্তানের জান্নাত।”\n— আল হাদিস",
    svg: createIslamicFrameSvg("#f43f5e", "#881337", "#fff1f2", "arch")
  },
  {
    id: "islamic-sage-dua",
    name: "Sage Green Daily Dua",
    nameBn: "সেজ গ্রিন দোয়া ফ্রেম",
    category: "islamic",
    categoryBn: "ইসলামিক ও হাদিস",
    themeColor: "#166534",
    accentColor: "#86efac",
    textColor: "#14532d",
    defaultCaption: "“রাব্বানা আতিনা ফিদ্দুনিয়া হাসানাহ, ওয়াফিল আখিরাতি হাসানাহ।”",
    svg: createIslamicFrameSvg("#86efac", "#166534", "#f0fdf4", "lantern")
  },
  {
    id: "islamic-amber-madrasah",
    name: "Warm Amber Madrasah Frame",
    nameBn: "মাদরাসা নোটিশ ও হাদিস ফ্রেম",
    category: "islamic",
    categoryBn: "ইসলামিক ও হাদিস",
    themeColor: "#78350f",
    accentColor: "#f59e0b",
    textColor: "#451a03",
    defaultCaption: "দ্বীনি ইলম অর্জন করা প্রত্যেক মুসলমানের ওপর ফরজ।",
    svg: createIslamicFrameSvg("#f59e0b", "#78350f", "#fefce8", "geometric")
  },
  {
    id: "islamic-sky-peace",
    name: "Sky Blue Salam & Peace",
    nameBn: "আসমানী নীল সালাম ফ্রেম",
    category: "islamic",
    categoryBn: "ইসলামিক ও হাদিস",
    themeColor: "#0369a1",
    accentColor: "#38bdf8",
    textColor: "#075985",
    defaultCaption: "“তোমরা পরস্পরের মাঝে সালামের বিস্তার ঘটাও।”",
    svg: createIslamicFrameSvg("#38bdf8", "#0369a1", "#f0f9ff", "arch")
  },
  {
    id: "islamic-rose-bismillah",
    name: "Rose Gold Bismillah Ornament",
    nameBn: "রোজ গোল্ড বিসমিল্লাহ ফ্রেম",
    category: "islamic",
    categoryBn: "ইসলামিক ও হাদিস",
    themeColor: "#9f1239",
    accentColor: "#fb7185",
    textColor: "#881337",
    defaultCaption: "বিসমিল্লাহির রাহমানির রাহিম",
    svg: createIslamicFrameSvg("#fb7185", "#9f1239", "#fff1f2", "ornate")
  },
  {
    id: "islamic-forest-gold-classic",
    name: "Forest Green & Pure Gold",
    nameBn: "ক্লাসিক ফরেস্ট গ্রিন ও গোল্ড",
    category: "islamic",
    categoryBn: "ইসলামিক ও হাদিস",
    themeColor: "#14532d",
    accentColor: "#eab308",
    textColor: "#052e16",
    defaultCaption: "“নিশ্চয়ই সালাত মানুষকে অশ্লীল ও মন্দ কাজ থেকে বিরত রাখে।”",
    svg: createIslamicFrameSvg("#eab308", "#14532d", "#f7fee7", "arch")
  },
  {
    id: "islamic-bronze-kaba",
    name: "Antique Bronze & Cream",
    nameBn: "অ্যান্টিক ব্রোঞ্জ ও ক্রিম ফ্রেম",
    category: "islamic",
    categoryBn: "ইসলামিক ও হাদিস",
    themeColor: "#57534e",
    accentColor: "#d97706",
    textColor: "#292524",
    defaultCaption: "লাব্বাইক আল্লাহুম্মা লাব্বাইক...",
    svg: createIslamicFrameSvg("#d97706", "#57534e", "#fafaf9", "geometric")
  },
  {
    id: "islamic-purple-lailatulqadr",
    name: "Violet Night of Decree",
    nameBn: "ভায়োলেট কদর রজনী ফ্রেম",
    category: "islamic",
    categoryBn: "ইসলামিক ও হাদিস",
    themeColor: "#581c87",
    accentColor: "#c084fc",
    textColor: "#3b0764",
    defaultCaption: "লাইলাতুল কদর হাজার মাসের চেয়েও উত্তম।",
    svg: createIslamicFrameSvg("#c084fc", "#581c87", "#faf5ff", "lantern")
  },
  {
    id: "islamic-ivory-elegant",
    name: "Ivory & Filigree Gold",
    nameBn: "আইভরি এলিগেন্ট গোল্ড ফ্রেম",
    category: "islamic",
    categoryBn: "ইসলামিক ও হাদিস",
    themeColor: "#b45309",
    accentColor: "#d4af37",
    textColor: "#451a03",
    defaultCaption: "“হে আমাদের প্রতিপালক, আমাদের জ্ঞান বাড়িয়ে দিন।”",
    svg: createIslamicFrameSvg("#d4af37", "#b45309", "#ffffff", "ornate")
  },

  // ========================================================
  // CATEGORY 3: QUOTES & POETRY FRAMES (20 Items)
  // ========================================================
  {
    id: "quote-slate-quotes",
    name: "Slate Modern Quotes",
    nameBn: "স্লেট কোটেশন মার্ক ফ্রেম",
    category: "quotes",
    categoryBn: "উক্তি ও বাণী",
    themeColor: "#1e293b",
    accentColor: "#6366f1",
    textColor: "#0f172a",
    defaultCaption: "“যেখানে পরিশ্রম নেই, সেখানে সাফল্য কল্পনা মাত্র।”",
    svg: createQuoteFrameSvg("#1e293b", "#6366f1", "#f8fafc", "quotes")
  },
  {
    id: "quote-minimal-editorial",
    name: "Minimal Editorial Magazine",
    nameBn: "ম্যাগাজিন এডিটোরিয়াল ফ্রেম",
    category: "quotes",
    categoryBn: "উক্তি ও বাণী",
    themeColor: "#09090b",
    accentColor: "#e11d48",
    textColor: "#18181b",
    defaultCaption: "“জীবনকে ভালোবাসুন, প্রতিটি মুহূর্ত উপভোগ করুন।”",
    svg: createQuoteFrameSvg("#09090b", "#e11d48", "#fafafa", "editorial")
  },
  {
    id: "quote-warm-card",
    name: "Warm Floating Card",
    nameBn: "ফ্লোটিং কার্ড কোট ফ্রেম",
    category: "quotes",
    categoryBn: "উক্তি ও বাণী",
    themeColor: "#475569",
    accentColor: "#3b82f6",
    textColor: "#1e293b",
    defaultCaption: "“নিজের প্রতি বিশ্বাস রাখো, তবেই স্বপ্ন সত্যি হবে।”",
    svg: createQuoteFrameSvg("#475569", "#3b82f6", "#f1f5f9", "card")
  },
  {
    id: "quote-warm-parchment",
    name: "Warm Kraft & Coffee",
    nameBn: "কফি ও ক্রাফট পেপার ফ্রেম",
    category: "quotes",
    categoryBn: "উক্তি ও বাণী",
    themeColor: "#78350f",
    accentColor: "#d97706",
    textColor: "#451a03",
    defaultCaption: "“নীরবতার মাঝে অনেক গভীর কথা লুকিয়ে থাকে।”",
    svg: createQuoteFrameSvg("#78350f", "#d97706", "#fffbeb", "quotes")
  },
  {
    id: "quote-rose-pastel",
    name: "Rose Pastel Poetry",
    nameBn: "রোজ প্যাস্টেল কবিতার ফ্রেম",
    category: "quotes",
    categoryBn: "উক্তি ও বাণী",
    themeColor: "#9f1239",
    accentColor: "#f43f5e",
    textColor: "#881337",
    defaultCaption: "“তুমি সুন্দর তাই চেয়ে থাকি প্রিয়, সে কি মোর অপরাধ?”",
    svg: createQuoteFrameSvg("#9f1239", "#f43f5e", "#fff1f2", "quotes")
  },
  {
    id: "quote-emerald-classic",
    name: "Classic Emerald Border",
    nameBn: "ক্লাসিক এমারেল্ড উক্তি ফ্রেম",
    category: "quotes",
    categoryBn: "উক্তি ও বাণী",
    themeColor: "#166534",
    accentColor: "#22c55e",
    textColor: "#14532d",
    defaultCaption: "“সততাই সর্বোৎকৃষ্ট পন্থা।”",
    svg: createQuoteFrameSvg("#166534", "#22c55e", "#f0fdf4", "editorial")
  },
  {
    id: "quote-amber-sunshine",
    name: "Amber Sunshine Quotes",
    nameBn: "অ্যাম্বার রোদ ও বাণীর ফ্রেম",
    category: "quotes",
    categoryBn: "উক্তি ও বাণী",
    themeColor: "#b45309",
    accentColor: "#eab308",
    textColor: "#78350f",
    defaultCaption: "“প্রতিটি নতুন সকাল একটি নতুন সুযোগ।”",
    svg: createQuoteFrameSvg("#b45309", "#eab308", "#fefce8", "quotes")
  },
  {
    id: "quote-lavender-dream",
    name: "Lavender Calm Dream",
    nameBn: "ল্যাভেন্ডার ড্রিম কোট ফ্রেম",
    category: "quotes",
    categoryBn: "উক্তি ও বাণী",
    themeColor: "#6b21a8",
    accentColor: "#a855f7",
    textColor: "#581c87",
    defaultCaption: "“মন শান্ত থাকলে পুরো পৃথিবী সুন্দর দেখায়।”",
    svg: createQuoteFrameSvg("#6b21a8", "#a855f7", "#faf5ff", "card")
  },
  {
    id: "quote-teal-wisdom",
    name: "Ocean Teal Wisdom",
    nameBn: "ওশান টিল উইজডম ফ্রেম",
    category: "quotes",
    categoryBn: "উক্তি ও বাণী",
    themeColor: "#0f766e",
    accentColor: "#14b8a6",
    textColor: "#115e59",
    defaultCaption: "“জ্ঞানই আলো, অজ্ঞতাই অন্ধকার।”",
    svg: createQuoteFrameSvg("#0f766e", "#14b8a6", "#f0fdfa", "quotes")
  },
  {
    id: "quote-crimson-passion",
    name: "Crimson Bold Quotes",
    nameBn: "বোল্ড ক্রিমসন বাণী ফ্রেম",
    category: "quotes",
    categoryBn: "উক্তি ও বাণী",
    themeColor: "#991b1b",
    accentColor: "#ef4444",
    textColor: "#7f1d1d",
    defaultCaption: "“সাহসের সাথে পরিস্থিতির মোকাবিলা করো।”",
    svg: createQuoteFrameSvg("#991b1b", "#ef4444", "#fef2f2", "editorial")
  },
  {
    id: "quote-monochrome-chic",
    name: "Black & White Minimal",
    nameBn: "ব্ল্যাক অ্যান্ড হোয়াইট মিনিমাল",
    category: "quotes",
    categoryBn: "উক্তি ও বাণী",
    themeColor: "#000000",
    accentColor: "#52525b",
    textColor: "#09090b",
    defaultCaption: "“সরলতাই সবচেয়ে বড় সৌন্দর্য।”",
    svg: createQuoteFrameSvg("#000000", "#52525b", "#ffffff", "quotes")
  },
  {
    id: "quote-peach-sorbet",
    name: "Peach Soft Poetry",
    nameBn: "পিচ সফট কবিতার ফ্রেম",
    category: "quotes",
    categoryBn: "উক্তি ও বাণী",
    themeColor: "#c2410c",
    accentColor: "#f97316",
    textColor: "#9a3412",
    defaultCaption: "“মেঘ দেখে কেউ করিসনে ভয়, আড়ালে তার সূর্য হাসে।”",
    svg: createQuoteFrameSvg("#c2410c", "#f97316", "#fff7ed", "card")
  },
  {
    id: "quote-olive-zen",
    name: "Olive Green Zen Quotes",
    nameBn: "অলিভ জেন পিস ফ্রেম",
    category: "quotes",
    categoryBn: "উক্তি ও বাণী",
    themeColor: "#3f6212",
    accentColor: "#84cc16",
    textColor: "#365314",
    defaultCaption: "“ধৈর্যশীল মানুষের সঙ্গ সবসময় শান্তি এনে দেয়।”",
    svg: createQuoteFrameSvg("#3f6212", "#84cc16", "#f7fee7", "quotes")
  },
  {
    id: "quote-midnight-gold-dark",
    name: "Dark Luxury Gold Quotes",
    nameBn: "ডার্ক লাক্সারি গোল্ড ফ্রেম",
    category: "quotes",
    categoryBn: "উক্তি ও বাণী",
    themeColor: "#d97706",
    accentColor: "#fbbf24",
    textColor: "#ffffff",
    defaultCaption: "“অন্ধকারেই তারারা সবচেয়ে বেশি উজ্জ্বল হয়ে জ্বলে।”",
    svg: createQuoteFrameSvg("#3f3f46", "#fbbf24", "#18181b", "quotes")
  },
  {
    id: "quote-cyan-breeze",
    name: "Cyan Summer Breeze",
    nameBn: "সায়ান সামার ব্রিজ ফ্রেম",
    category: "quotes",
    categoryBn: "উক্তি ও বাণী",
    themeColor: "#0284c7",
    accentColor: "#06b6d4",
    textColor: "#0369a1",
    defaultCaption: "“আজকের দিনটি নতুন সম্ভাবনায় পূর্ণ।”",
    svg: createQuoteFrameSvg("#0284c7", "#06b6d4", "#f0f9ff", "card")
  },
  {
    id: "quote-vintage-typewriter",
    name: "Typewriter Vintage Frame",
    nameBn: "টাইপরাইটার ভিন্টেজ ফ্রেম",
    category: "quotes",
    categoryBn: "উক্তি ও বাণী",
    themeColor: "#44403c",
    accentColor: "#78716c",
    textColor: "#292524",
    defaultCaption: "“প্রতিটি গল্পের একটি সুন্দর সমাপ্তি থাকে।”",
    svg: createQuoteFrameSvg("#44403c", "#78716c", "#fafaf9", "editorial")
  },
  {
    id: "quote-berry-sweet",
    name: "Sweet Berry Pink Quotes",
    nameBn: "বেরি পিংক কোটেশন ফ্রেম",
    category: "quotes",
    categoryBn: "উক্তি ও বাণী",
    themeColor: "#be185d",
    accentColor: "#f472b6",
    textColor: "#9d174d",
    defaultCaption: "“হাসি মুখের মতো সুন্দর অলঙ্কার আর কিছু নেই।”",
    svg: createQuoteFrameSvg("#be185d", "#f472b6", "#fdf2f8", "quotes")
  },
  {
    id: "quote-navy-formal",
    name: "Formal Navy Editorial",
    nameBn: "নেভি ফর্মাল এডিটোরিয়াল",
    category: "quotes",
    categoryBn: "উক্তি ও বাণী",
    themeColor: "#1e3a8a",
    accentColor: "#3b82f6",
    textColor: "#172554",
    defaultCaption: "“বড় অর্জনের জন্য কঠিন পথ পাড়ি দিতে হয়।”",
    svg: createQuoteFrameSvg("#1e3a8a", "#3b82f6", "#f8fafc", "editorial")
  },
  {
    id: "quote-sunset-glow",
    name: "Sunset Gradient Glow",
    nameBn: "সানসেট গ্রেডিয়েন্ট গ্লো ফ্রেম",
    category: "quotes",
    categoryBn: "উক্তি ও বাণী",
    themeColor: "#c2410c",
    accentColor: "#ec4899",
    textColor: "#7c2d12",
    defaultCaption: "“কখনো আশা হারিও না, কালকের দিনটি আরও সুন্দর হবে।”",
    svg: createQuoteFrameSvg("#c2410c", "#ec4899", "#fff7ed", "card")
  },
  {
    id: "quote-golden-hour",
    name: "Golden Hour Clean Border",
    nameBn: "গোল্ডেন আওয়ার ক্লিন ফ্রেম",
    category: "quotes",
    categoryBn: "উক্তি ও বাণী",
    themeColor: "#d97706",
    accentColor: "#f59e0b",
    textColor: "#78350f",
    defaultCaption: "“মন থেকে চাইলে সব সম্ভব।”",
    svg: createQuoteFrameSvg("#d97706", "#f59e0b", "#fffbeb", "quotes")
  },

  // ========================================================
  // CATEGORY 4: NOTICE & ANNOUNCEMENT FRAMES (20 Items)
  // ========================================================
  {
    id: "notice-urgent-red",
    name: "Urgent Warning Red",
    nameBn: "জরুরি বিজ্ঞপ্তি (লাল নোটিশ)",
    category: "notice",
    categoryBn: "বিজ্ঞপ্তি ও অফার",
    themeColor: "#dc2626",
    accentColor: "#991b1b",
    textColor: "#1e293b",
    defaultCaption: "সকল সম্মানিত সদস্যদের অবগতির জন্য জানানো যাচ্ছে যে...",
    svg: createNoticeFrameSvg("#dc2626", "#1e3a8a", "জরুরি বিজ্ঞপ্তি", true)
  },
  {
    id: "notice-special-announcement",
    name: "Special Announcement Blue",
    nameBn: "বিশেষ ঘোষণা (নীল ব্যানার)",
    category: "notice",
    categoryBn: "বিজ্ঞপ্তি ও অফার",
    themeColor: "#1d4ed8",
    accentColor: "#2563eb",
    textColor: "#0f172a",
    defaultCaption: "এতদ্বারা সংশ্লিষ্ট সকলের অবগতির জন্য জানানো যাইতেছে যে...",
    svg: createNoticeFrameSvg("#1d4ed8", "#1e293b", "বিশেষ ঘোষণা", false)
  },
  {
    id: "notice-madrasah-green",
    name: "Madrasah Notice Green",
    nameBn: "মাদরাসা নোটিশ (সবুজ ফ্রেম)",
    category: "notice",
    categoryBn: "বিজ্ঞপ্তি ও অফার",
    themeColor: "#15803d",
    accentColor: "#166534",
    textColor: "#14532d",
    defaultCaption: "আগামীকাল মাদরাসার ক্লাস যথারীতি সময়সূচি অনুযায়ী চলবে।",
    svg: createNoticeFrameSvg("#15803d", "#065f46", "মাদরাসা নোটিশ", false)
  },
  {
    id: "notice-mega-offer",
    name: "Mega Sale Discount Offer",
    nameBn: "ধামাকা অফার (ডিসকাউন্ট ব্যানার)",
    category: "notice",
    categoryBn: "বিজ্ঞপ্তি ও অফার",
    themeColor: "#ea580c",
    accentColor: "#c2410c",
    textColor: "#18181b",
    defaultCaption: "সীমিত সময়ের জন্য সকল পণ্যে পাবেন বিশেষ ছাড়!",
    svg: createNoticeFrameSvg("#ea580c", "#7c2d12", "ধামাকা অফার", false)
  },
  {
    id: "notice-grand-opening",
    name: "Grand Opening Ribbon",
    nameBn: "শুভ উদ্বোধন (রয়েল গোল্ড)",
    category: "notice",
    categoryBn: "বিজ্ঞপ্তি ও অফার",
    themeColor: "#b45309",
    accentColor: "#d97706",
    textColor: "#451a03",
    defaultCaption: "আমাদের নতুন শোরুমের শুভ উদ্বোধনে আপনি সপরিবারে আমন্ত্রিত।",
    svg: createNoticeFrameSvg("#b45309", "#92400e", "শুভ উদ্বোধন", false)
  },
  {
    id: "notice-eid-greetings",
    name: "Eid Mubarak Festive Banner",
    nameBn: "ঈদের শুভেচ্ছা (উৎসব ফ্রেম)",
    category: "notice",
    categoryBn: "বিজ্ঞপ্তি ও অফার",
    themeColor: "#047857",
    accentColor: "#059669",
    textColor: "#064e3b",
    defaultCaption: "আপনাকে ও আপনার পরিবারের সবাইকে জানাই পবিত্র ঈদের শুভেচ্ছা!",
    svg: createNoticeFrameSvg("#047857", "#065f46", "ঈদ মোবারক", false)
  },
  {
    id: "notice-office-formal",
    name: "Official Organization Notice",
    nameBn: "অফিসিয়াল নোটিশ (নেভি ফ্রেম)",
    category: "notice",
    categoryBn: "বিজ্ঞপ্তি ও অফার",
    themeColor: "#0f172a",
    accentColor: "#334155",
    textColor: "#020617",
    defaultCaption: "অফিস আদেশ অনুযায়ী নিম্নলিখিত সিদ্ধান্ত গৃহীত হয়েছে...",
    svg: createNoticeFrameSvg("#0f172a", "#1e293b", "অফিস আদেশ", false)
  },
  {
    id: "notice-school-admission",
    name: "School Admission Open",
    nameBn: "ভর্তি চলছে (শিক্ষা প্রতিষ্ঠান)",
    category: "notice",
    categoryBn: "বিজ্ঞপ্তি ও অফার",
    themeColor: "#0284c7",
    accentColor: "#0369a1",
    textColor: "#0c4a6e",
    defaultCaption: "নতুন শিক্ষাবর্ষে ছাত্র-ছাত্রী ভর্তি চলছে! আসন সংখ্যা সীমিত।",
    svg: createNoticeFrameSvg("#0284c7", "#075985", "ভর্তি চলছে", false)
  },
  {
    id: "notice-breaking-news",
    name: "Breaking News Alert",
    nameBn: "ব্রেকিং নিউজ (রেড অ্যালার্ট)",
    category: "notice",
    categoryBn: "বিজ্ঞপ্তি ও অফার",
    themeColor: "#b91c1c",
    accentColor: "#991b1b",
    textColor: "#000000",
    defaultCaption: "এই মুহূর্তের তাজা খবর ও সরাসরি গুরুত্বপূর্ণ আপডেট...",
    svg: createNoticeFrameSvg("#b91c1c", "#18181b", "ব্রেকিং নিউজ", true)
  },
  {
    id: "notice-congratulations",
    name: "Congratulations & Greetings",
    nameBn: "অভিনন্দন ও শুভেচ্ছা ফ্রেম",
    category: "notice",
    categoryBn: "বিজ্ঞপ্তি ও অফার",
    themeColor: "#7c3aed",
    accentColor: "#6d28d9",
    textColor: "#4c1d95",
    defaultCaption: "আপনার অভাবনীয় সাফল্যে জানাই আন্তরিক অভিনন্দন!",
    svg: createNoticeFrameSvg("#7c3aed", "#5b21b6", "অভিনন্দন", false)
  },
  {
    id: "notice-blood-donation",
    name: "Blood Donation Appeal",
    nameBn: "রক্তদান আহ্বান নোটিশ",
    category: "notice",
    categoryBn: "বিজ্ঞপ্তি ও অফার",
    themeColor: "#be123c",
    accentColor: "#9f1239",
    textColor: "#4c0519",
    defaultCaption: "জরুরি ভিত্তিতে এ-পজিটিভ (A+) রক্তের প্রয়োজন!",
    svg: createNoticeFrameSvg("#be123c", "#881337", "জরুরি রক্তদান", true)
  },
  {
    id: "notice-jumma-mubarak",
    name: "Jumma Mubarak Card",
    nameBn: "জুম্মা মোবারক ব্যানার",
    category: "notice",
    categoryBn: "বিজ্ঞপ্তি ও অফার",
    themeColor: "#065f46",
    accentColor: "#047857",
    textColor: "#022c22",
    defaultCaption: "পবিত্র জুমার দিনে সকলের মঙ্গল ও ক্ষমা প্রার্থনা করছি।",
    svg: createNoticeFrameSvg("#065f46", "#047857", "জুম্মা মোবারক", false)
  },
  {
    id: "notice-flash-sale",
    name: "Flash Sale 50% Off",
    nameBn: "ফ্ল্যাশ সেল (বিশেষ ছাড়)",
    category: "notice",
    categoryBn: "বিজ্ঞপ্তি ও অফার",
    themeColor: "#e11d48",
    accentColor: "#be123c",
    textColor: "#18181b",
    defaultCaption: "আজকের ফ্ল্যাশ সেল! সীমিত সময়ের আকর্ষণীয় ডিসকাউন্ট।",
    svg: createNoticeFrameSvg("#e11d48", "#881337", "ফ্ল্যাশ সেল", true)
  },
  {
    id: "notice-lost-found",
    name: "Lost & Found Important",
    nameBn: "হারিয়ে যাওয়ার বিজ্ঞপ্তি",
    category: "notice",
    categoryBn: "বিজ্ঞপ্তি ও অফার",
    themeColor: "#475569",
    accentColor: "#334155",
    textColor: "#0f172a",
    defaultCaption: "জরুরি কিছু কাগজপত্র হারিয়ে গিয়েছে, সন্ধানদাতাকে পুরস্কৃত করা হবে।",
    svg: createNoticeFrameSvg("#475569", "#1e293b", "হারানো বিজ্ঞপ্তি", false)
  },
  {
    id: "notice-job-circular",
    name: "Job Recruitment Circular",
    nameBn: "নিয়োগ বিজ্ঞপ্তি ফ্রেম",
    category: "notice",
    categoryBn: "বিজ্ঞপ্তি ও অফার",
    themeColor: "#1e3a8a",
    accentColor: "#172554",
    textColor: "#020617",
    defaultCaption: "যোগ্য ও উদ্যমী প্রার্থীদের নিকট হতে দরখাস্ত আহ্বান করা হচ্ছে।",
    svg: createNoticeFrameSvg("#1e3a8a", "#1e40af", "নিয়োগ বিজ্ঞপ্তি", false)
  },
  {
    id: "notice-exhibition-fair",
    name: "Trade Fair & Exhibition",
    nameBn: "মেলা ও প্রদর্শনী বিজ্ঞপ্তি",
    category: "notice",
    categoryBn: "বিজ্ঞপ্তি ও অফার",
    themeColor: "#d97706",
    accentColor: "#b45309",
    textColor: "#451a03",
    defaultCaption: "মাসব্যাপী পণ্য মেলা ও হস্তশিল্প প্রদর্শনীতে স্বাগতম!",
    svg: createNoticeFrameSvg("#d97706", "#78350f", "মেলা ও প্রদর্শনী", false)
  },
  {
    id: "notice-ramadan-timing",
    name: "Ramadan Calendar & Time",
    nameBn: "মাহে রমজান সময়সূচি নোটিশ",
    category: "notice",
    categoryBn: "বিজ্ঞপ্তি ও অফার",
    themeColor: "#0f766e",
    accentColor: "#115e59",
    textColor: "#042f2e",
    defaultCaption: "সাহরি ও ইফতারের সঠিক সময়সূচি...",
    svg: createNoticeFrameSvg("#0f766e", "#134e4a", "মাহে রমজান", false)
  },
  {
    id: "notice-health-advice",
    name: "Public Health Awareness",
    nameBn: "স্বাস্থ্য সচেতনতা বার্তা",
    category: "notice",
    categoryBn: "বিজ্ঞপ্তি ও অফার",
    themeColor: "#0284c7",
    accentColor: "#0369a1",
    textColor: "#082f49",
    defaultCaption: "সুস্থ থাকতে পরিচ্ছন্নতা বজায় রাখুন এবং পুষ্টিকর খাবার গ্রহণ করুন।",
    svg: createNoticeFrameSvg("#0284c7", "#075985", "স্বাস্থ্য পরামর্শ", false)
  },
  {
    id: "notice-annual-sports",
    name: "Annual Sports Tournament",
    nameBn: "বার্ষিক ক্রীড়া প্রতিযোগিতা",
    category: "notice",
    categoryBn: "বিজ্ঞপ্তি ও অফার",
    themeColor: "#ea580c",
    accentColor: "#c2410c",
    textColor: "#7c2d12",
    defaultCaption: "জমকালো ফুটবল ও ক্রিকেট টুর্নামেন্টের সময়সূচি...",
    svg: createNoticeFrameSvg("#ea580c", "#9a3412", "ক্রীড়া প্রতিযোগিতা", false)
  },
  {
    id: "notice-general-caution",
    name: "General Public Caution",
    nameBn: "সতর্কবার্তা ও সাধারণ নোটিশ",
    category: "notice",
    categoryBn: "বিজ্ঞপ্তি ও অফার",
    themeColor: "#ca8a04",
    accentColor: "#a16207",
    textColor: "#713f12",
    defaultCaption: "প্রতারক চক্র থেকে সাবধান থাকুন এবং কোনো ওটিপি শেয়ার করবেন না।",
    svg: createNoticeFrameSvg("#ca8a04", "#854d0e", "সতর্কবার্তা", true)
  },

  // ========================================================
  // CATEGORY 5: AESTHETIC GRADIENTS & NEON GLOW (20 Items)
  // ========================================================
  {
    id: "aesthetic-aurora-cyan-purple",
    name: "Aurora Borealis Neon",
    nameBn: "অরোরা সায়ান ও পার্পল নিয়ন",
    category: "aesthetic",
    categoryBn: "অ্যাস্থেটিক ও নিয়ন",
    themeColor: "#06b6d4",
    accentColor: "#a855f7",
    textColor: "#0f172a",
    defaultCaption: "স্বপ্নের মতো রঙিন মুহূর্তগুলো...",
    svg: createAestheticSvg("#06b6d4", "#a855f7", "#ec4899", false)
  },
  {
    id: "aesthetic-dark-neon-glow",
    name: "Midnight Cyber Neon (Dark)",
    nameBn: "মিডনাইট সাইবার নিয়ন (ডার্ক)",
    category: "aesthetic",
    categoryBn: "অ্যাস্থেটিক ও নিয়ন",
    themeColor: "#3b82f6",
    accentColor: "#ec4899",
    textColor: "#ffffff",
    defaultCaption: "রাতের আঁধারে জ্বলজ্বলে আলো...",
    svg: createAestheticSvg("#3b82f6", "#8b5cf6", "#ec4899", true)
  },
  {
    id: "aesthetic-peach-sunset",
    name: "Peach Sunset Soft Mesh",
    nameBn: "পিচ সানসেট সফট মেশ",
    category: "aesthetic",
    categoryBn: "অ্যাস্থেটিক ও নিয়ন",
    themeColor: "#f97316",
    accentColor: "#f43f5e",
    textColor: "#431407",
    defaultCaption: "বিকেলের মিষ্টি আলোয় ভাবনার ডালপালা...",
    svg: createAestheticSvg("#f97316", "#fb7185", "#f43f5e", false)
  },
  {
    id: "aesthetic-ocean-breeze",
    name: "Deep Ocean Wave Aura",
    nameBn: "ডিপ ওশান ওয়েভ অরা",
    category: "aesthetic",
    categoryBn: "অ্যাস্থেটিক ও নিয়ন",
    themeColor: "#0284c7",
    accentColor: "#14b8a6",
    textColor: "#0c4a6e",
    defaultCaption: "সমুদ্রের বিশালতার মতো উদার মন...",
    svg: createAestheticSvg("#0284c7", "#06b6d4", "#14b8a6", false)
  },
  {
    id: "aesthetic-dark-emerald-neon",
    name: "Matrix Emerald Neon (Dark)",
    nameBn: "ম্যাট্রিক্স এমারেল্ড নিয়ন (ডার্ক)",
    category: "aesthetic",
    categoryBn: "অ্যাস্থেটিক ও নিয়ন",
    themeColor: "#10b981",
    accentColor: "#06b6d4",
    textColor: "#ffffff",
    defaultCaption: "ডিজিটাল দুনিয়ায় উজ্জ্বল ভবিষ্যৎ...",
    svg: createAestheticSvg("#10b981", "#06b6d4", "#3b82f6", true)
  },
  {
    id: "aesthetic-holographic-prism",
    name: "Holographic Liquid Prism",
    nameBn: "হলোগ্রাফিক প্রিজম ফ্রেম",
    category: "aesthetic",
    categoryBn: "অ্যাস্থেটিক ও নিয়ন",
    themeColor: "#ec4899",
    accentColor: "#8b5cf6",
    textColor: "#1e1b4b",
    defaultCaption: "সৃজনশীলতার প্রতিটি রঙের ছোঁয়া...",
    svg: createAestheticSvg("#ec4899", "#a855f7", "#3b82f6", false)
  },
  {
    id: "aesthetic-golden-luxury-dark",
    name: "Obsidian Gold Glow (Dark)",
    nameBn: "অবসিডিয়ান গোল্ড গ্লো (ডার্ক)",
    category: "aesthetic",
    categoryBn: "অ্যাস্থেটিক ও নিয়ন",
    themeColor: "#f59e0b",
    accentColor: "#fbbf24",
    textColor: "#ffffff",
    defaultCaption: "আভিজাত্য ও সম্মানের সোনালী প্রতীক...",
    svg: createAestheticSvg("#f59e0b", "#eab308", "#d97706", true)
  },
  {
    id: "aesthetic-cotton-candy",
    name: "Cotton Candy Pastel",
    nameBn: "কটন ক্যান্ডি প্যাস্টেল ফ্রেম",
    category: "aesthetic",
    categoryBn: "অ্যাস্থেটিক ও নিয়ন",
    themeColor: "#38bdf8",
    accentColor: "#f472b6",
    textColor: "#1e293b",
    defaultCaption: "মিষ্টি মধুর স্মৃতি আর অফুরন্ত আনন্দ...",
    svg: createAestheticSvg("#38bdf8", "#c084fc", "#f472b6", false)
  },
  {
    id: "aesthetic-sunset-dusk-dark",
    name: "Dusk Crimson Velvet (Dark)",
    nameBn: "ডাস্ক ক্রিমসন ভেলভেট (ডার্ক)",
    category: "aesthetic",
    categoryBn: "অ্যাস্থেটিক ও নিয়ন",
    themeColor: "#f43f5e",
    accentColor: "#9333ea",
    textColor: "#ffffff",
    defaultCaption: "দিনের শেষ আলো যখন রাতে রূপ নেয়...",
    svg: createAestheticSvg("#f43f5e", "#9333ea", "#3b82f6", true)
  },
  {
    id: "aesthetic-lemon-lime",
    name: "Fresh Lemon Lime Zing",
    nameBn: "ফ্রেশ লেমন লাইম জিং",
    category: "aesthetic",
    categoryBn: "অ্যাস্থেটিক ও নিয়ন",
    themeColor: "#84cc16",
    accentColor: "#eab308",
    textColor: "#1a2e05",
    defaultCaption: "নতুন উদ্যম ও নতুন উদ্দীপনায় শুরু হোক...",
    svg: createAestheticSvg("#84cc16", "#22c55e", "#eab308", false)
  },
  {
    id: "aesthetic-lavender-haze",
    name: "Lavender Calm Haze",
    nameBn: "ল্যাভেন্ডার শান্ত কুয়াশা",
    category: "aesthetic",
    categoryBn: "অ্যাস্থেটিক ও নিয়ন",
    themeColor: "#a855f7",
    accentColor: "#c084fc",
    textColor: "#3b0764",
    defaultCaption: "মনের প্রশান্তিই পরম সম্পদ...",
    svg: createAestheticSvg("#a855f7", "#c084fc", "#e879f9", false)
  },
  {
    id: "aesthetic-cyberpunk-yellow-dark",
    name: "Cyberpunk Hazard Yellow (Dark)",
    nameBn: "সাইবারপাংক হ্যাজার্ড ইয়েলো (ডার্ক)",
    category: "aesthetic",
    categoryBn: "অ্যাস্থেটিক ও নিয়ন",
    themeColor: "#eab308",
    accentColor: "#f97316",
    textColor: "#ffffff",
    defaultCaption: "সাবধান! নতুন প্রযুক্তির আগমন...",
    svg: createAestheticSvg("#eab308", "#f97316", "#ef4444", true)
  },
  {
    id: "aesthetic-rose-quartz",
    name: "Rose Quartz & Serenity",
    nameBn: "রোজ কোয়ার্টজ ও প্রশান্তি",
    category: "aesthetic",
    categoryBn: "অ্যাস্থেটিক ও নিয়ন",
    themeColor: "#fb7185",
    accentColor: "#60a5fa",
    textColor: "#4c0519",
    defaultCaption: "স্নিগ্ধতা ও শ্রদ্ধাবোধে ভরে উঠুক জীবন...",
    svg: createAestheticSvg("#fb7185", "#c084fc", "#60a5fa", false)
  },
  {
    id: "aesthetic-sapphire-glow-dark",
    name: "Sapphire Deep Glow (Dark)",
    nameBn: "স্যাফায়ার ডিপ গ্লো (ডার্ক)",
    category: "aesthetic",
    categoryBn: "অ্যাস্থেটিক ও নিয়ন",
    themeColor: "#3b82f6",
    accentColor: "#06b6d4",
    textColor: "#ffffff",
    defaultCaption: "জ্ঞান ও গবেষণার এক অনন্য ভুবন...",
    svg: createAestheticSvg("#3b82f6", "#06b6d4", "#22c55e", true)
  },
  {
    id: "aesthetic-warm-terracotta",
    name: "Warm Terracotta Earth",
    nameBn: "টেরাকোটা আর্দি ফ্রেম",
    category: "aesthetic",
    categoryBn: "অ্যাস্থেটিক ও নিয়ন",
    themeColor: "#ea580c",
    accentColor: "#d97706",
    textColor: "#431407",
    defaultCaption: "মাটির গন্ধ ও ঐতিহ্যের ছোঁয়া...",
    svg: createAestheticSvg("#ea580c", "#d97706", "#ca8a04", false)
  },
  {
    id: "aesthetic-tropical-vibes",
    name: "Tropical Summer Vibes",
    nameBn: "ট্রপিক্যাল সামার ভাইবস",
    category: "aesthetic",
    categoryBn: "অ্যাস্থেটিক ও নিয়ন",
    themeColor: "#06b6d4",
    accentColor: "#eab308",
    textColor: "#083344",
    defaultCaption: "ছুটির দিন আর রোমাঞ্চকর ভ্রমণ...",
    svg: createAestheticSvg("#06b6d4", "#10b981", "#eab308", false)
  },
  {
    id: "aesthetic-amethyst-dark",
    name: "Amethyst Crystal Glow (Dark)",
    nameBn: "অ্যামিথিস্ট ক্রিস্টাল গ্লো (ডার্ক)",
    category: "aesthetic",
    categoryBn: "অ্যাস্থেটিক ও নিয়ন",
    themeColor: "#8b5cf6",
    accentColor: "#ec4899",
    textColor: "#ffffff",
    defaultCaption: "প্রতিভার স্ফুরণ ঘটে পরিশ্রমের মাধ্যমে...",
    svg: createAestheticSvg("#8b5cf6", "#ec4899", "#f43f5e", true)
  },
  {
    id: "aesthetic-mint-sorbet",
    name: "Mint Sorbet Refresh",
    nameBn: "মিন্ট শরবত রিফ্রেশ ফ্রেম",
    category: "aesthetic",
    categoryBn: "অ্যাস্থেটিক ও নিয়ন",
    themeColor: "#14b8a6",
    accentColor: "#38bdf8",
    textColor: "#042f2e",
    defaultCaption: "এক ফালি স্নিগ্ধ বাতাস...",
    svg: createAestheticSvg("#14b8a6", "#2dd4bf", "#38bdf8", false)
  },
  {
    id: "aesthetic-ruby-glow-dark",
    name: "Ruby Fire Glow (Dark)",
    nameBn: "রুবি ফায়ার গ্লো (ডার্ক)",
    category: "aesthetic",
    categoryBn: "অ্যাস্থেটিক ও নিয়ন",
    themeColor: "#ef4444",
    accentColor: "#f97316",
    textColor: "#ffffff",
    defaultCaption: "উৎসাহ ও উদ্দীপনার অগ্নিশিখা...",
    svg: createAestheticSvg("#ef4444", "#f97316", "#eab308", true)
  },
  {
    id: "aesthetic-minimal-studio",
    name: "Clean Studio Spotlight",
    nameBn: "ক্লিন স্টুডিও স্পটলাইট",
    category: "aesthetic",
    categoryBn: "অ্যাস্থেটিক ও নিয়ন",
    themeColor: "#64748b",
    accentColor: "#94a3b8",
    textColor: "#0f172a",
    defaultCaption: "স্পষ্ট ও পরিপাটি উপস্থাপনা...",
    svg: createAestheticSvg("#64748b", "#94a3b8", "#cbd5e1", false)
  }
];
