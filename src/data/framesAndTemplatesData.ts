import { TemplateItem, TemplateElement } from "../components/admin/TemplateManagement";

export interface LibraryCategory {
  id: string;
  name: string;
  nameBn: string;
  icon: string;
  type?: "frame" | "template" | "both";
}

export const MASTER_CATEGORIES: LibraryCategory[] = [
  { id: "all", name: "All Designs", nameBn: "সকল ডিজাইন", icon: "✨" },
  { id: "frames", name: "Frames", nameBn: "ছবি ফ্রেম", icon: "🖼️" },
  { id: "templates", name: "Templates", nameBn: "টেমপ্লেট", icon: "🎨" },
  { id: "birthday", name: "Birthday", nameBn: "জন্মদিন", icon: "🎂" },
  { id: "wedding", name: "Wedding", nameBn: "বিয়ে ও শুভ পরিণয়", icon: "💍" },
  { id: "eid", name: "Eid & Ramadan", nameBn: "ঈদ ও রমজান", icon: "🌙" },
  { id: "islamic", name: "Islamic", nameBn: "ইসলামিক ও হাদিস", icon: "🕌" },
  { id: "business", name: "Business & Promo", nameBn: "ব্যবসা ও অফার", icon: "💼" },
  { id: "facebook", name: "Facebook", nameBn: "ফেসবুক কভার ও পোস্ট", icon: "📘" },
  { id: "instagram", name: "Instagram & Story", nameBn: "ইনস্টা ও স্টোরি", icon: "📸" },
  { id: "youtube", name: "YouTube", nameBn: "ইউটিউব ব্যানার ও থাম্ব", icon: "▶️" },
  { id: "poster", name: "Poster & Banner", nameBn: "পোস্টার ও ব্যানার", icon: "📜" },
  { id: "advertisement", name: "Advertisement", nameBn: "বিজ্ঞাপন ও সেল", icon: "📢" },
  { id: "love", name: "Love & Couple", nameBn: "ভালোবাসা ও যুগল", icon: "❤️" },
  { id: "family", name: "Family & Kids", nameBn: "পারিবারিক ও শিশু", icon: "👨‍👩‍👧" },
  { id: "festival", name: "Festival & National", nameBn: "উৎসব ও জাতীয় দিবস", icon: "🎉" },
  { id: "presets", name: "Canvas Sizes", nameBn: "ক্যানভাস সাইজ", icon: "📐" }
];

export const FRAME_CATEGORIES: LibraryCategory[] = [
  { id: "all_frames", name: "All Frames", nameBn: "সব ফ্রেম", icon: "🖼️", type: "frame" },
  { id: "wedding", name: "Wedding Frame", nameBn: "বিয়ে ও এনগেজমেন্ট", icon: "💍", type: "frame" },
  { id: "birthday", name: "Birthday Frame", nameBn: "জন্মদিনের ফ্রেম", icon: "🎂", type: "frame" },
  { id: "islamic", name: "Islamic Frame", nameBn: "ইসলামিক ফ্রেম", icon: "🕌", type: "frame" },
  { id: "eid", name: "Eid Frame", nameBn: "ঈদের ফ্রেম", icon: "🌙", type: "frame" },
  { id: "love", name: "Love & Couple", nameBn: "ভালোবাসা ও যুগল", icon: "❤️", type: "frame" },
  { id: "family", name: "Family Frame", nameBn: "পারিবারিক ফ্রেম", icon: "👨‍👩‍👧", type: "frame" },
  { id: "festival", name: "Festival Frame", nameBn: "জাতীয় ও উৎসব", icon: "🎉", type: "frame" },
  { id: "neon_3d", name: "Neon & 3D Frame", nameBn: "নিয়ন ও থ্রিডি ফ্রেম", icon: "⚡", type: "frame" },
  { id: "polaroid", name: "Polaroid & Collage", nameBn: "পোলারয়েড কোলাজ", icon: "📷", type: "frame" }
];

export const TEMPLATE_CATEGORIES: LibraryCategory[] = [
  { id: "all_templates", name: "All Templates", nameBn: "সব টেমপ্লেট", icon: "🎨", type: "template" },
  { id: "facebook", name: "Facebook Post & Cover", nameBn: "ফেসবুক পোস্ট ও কভার", icon: "📘", type: "template" },
  { id: "youtube", name: "YouTube Banner & Thumb", nameBn: "ইউটিউব ব্যানার ও থাম্বনেইল", icon: "▶️", type: "template" },
  { id: "instagram", name: "Instagram Story & Post", nameBn: "ইনস্টা স্টোরি ও পোস্ট", icon: "📸", type: "template" },
  { id: "business", name: "Business & Offer", nameBn: "ব্যবসা ও ডিসকাউন্ট", icon: "💼", type: "template" },
  { id: "birthday", name: "Birthday Wish", nameBn: "জন্মদিনের শুভেচ্ছা", icon: "🎂", type: "template" },
  { id: "islamic", name: "Islamic Quote & Hadith", nameBn: "ইসলামিক বাণী ও পোস্টার", icon: "🕌", type: "template" },
  { id: "poster", name: "Event & Seminar Poster", nameBn: "ইভেন্ট ও সেমিনার পোস্টার", icon: "📜", type: "template" },
  { id: "advertisement", name: "Product Ad", nameBn: "প্রোডাক্ট বিজ্ঞাপন", icon: "📢", type: "template" }
];

// Rich Built-in Frames Collection
export const BUILTIN_FRAMES: TemplateItem[] = [
  // 1. Gold Luxury Wedding Frame
  {
    id: "frame_gold_luxury_wedding",
    name: "Royal Gold Luxury Wedding Frame (রাজকীয় সোনালী ফ্রেম)",
    category: "wedding",
    thumbnail: "https://images.unsplash.com/photo-1519741497674-611481863552?w=500&q=80",
    width: 1080,
    height: 1080,
    bgClass: "bg-stone-900",
    searchTags: ["wedding", "gold", "luxury", "couple", "marriage", "বিয়ে", "সোনালী", "frames"],
    createdAt: Date.now() - 100000,
    updatedAt: Date.now(),
    elements: [
      {
        id: "bg_rect",
        type: "shape",
        shapeType: "rectangle",
        fillColor: "#1a1612",
        x: 0,
        y: 0,
        width: 1080,
        height: 1080,
        zIndex: 1
      },
      {
        id: "gold_border_outer",
        type: "shape",
        shapeType: "rounded-rect",
        fillColor: "transparent",
        borderColor: "#d4af37",
        borderWidth: 6,
        x: 40,
        y: 40,
        width: 1000,
        height: 1000,
        zIndex: 2,
        borderRadius: 24
      },
      {
        id: "gold_border_inner",
        type: "shape",
        shapeType: "rounded-rect",
        fillColor: "transparent",
        borderColor: "#f59e0b",
        borderWidth: 2,
        x: 60,
        y: 60,
        width: 960,
        height: 960,
        zIndex: 3,
        borderRadius: 18
      },
      {
        id: "photo_slot_wedding",
        type: "placeholder",
        content: "",
        x: 100,
        y: 120,
        width: 880,
        height: 740,
        shapeType: "rounded-rect",
        borderRadius: 20,
        borderColor: "#d4af37",
        borderWidth: 4,
        zIndex: 4
      },
      {
        id: "txt_wedding_title",
        type: "text",
        content: "শুভ বিবাহ / Happy Wedding",
        x: 100,
        y: 890,
        width: 880,
        height: 60,
        fontSize: 38,
        fontFamily: "'Hind Siliguri', sans-serif",
        fontWeight: "bold",
        color: "#d4af37",
        zIndex: 5
      },
      {
        id: "txt_wedding_names",
        type: "text",
        content: "বর ও কনের নাম এখানে লিখুন",
        x: 100,
        y: 960,
        width: 880,
        height: 50,
        fontSize: 24,
        fontFamily: "'Hind Siliguri', sans-serif",
        color: "#e2e8f0",
        zIndex: 6
      }
    ]
  },

  // 2. Islamic Spiritual Crescent Frame
  {
    id: "frame_islamic_spiritual",
    name: "Islamic Crescent Prayer Frame (ইসলামিক তাকদীর ফ্রেম)",
    category: "islamic",
    thumbnail: "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=500&q=80",
    width: 1080,
    height: 1080,
    bgClass: "bg-emerald-950",
    searchTags: ["islamic", "eid", "dua", "allah", "quran", "হাদিস", "ইসলামিক", "frames"],
    createdAt: Date.now() - 95000,
    updatedAt: Date.now(),
    elements: [
      {
        id: "bg_rect",
        type: "shape",
        shapeType: "rectangle",
        fillColor: "#064e3b",
        x: 0,
        y: 0,
        width: 1080,
        height: 1080,
        zIndex: 1
      },
      {
        id: "islamic_border",
        type: "shape",
        shapeType: "rounded-rect",
        fillColor: "transparent",
        borderColor: "#34d399",
        borderWidth: 5,
        borderRadius: 30,
        x: 45,
        y: 45,
        width: 990,
        height: 990,
        zIndex: 2
      },
      {
        id: "photo_slot_islamic",
        type: "placeholder",
        content: "",
        x: 140,
        y: 120,
        width: 800,
        height: 680,
        shapeType: "circle",
        borderColor: "#fbbf24",
        borderWidth: 6,
        zIndex: 3
      },
      {
        id: "txt_islamic_quote",
        type: "text",
        content: "তাকদীরের ফায়সালায় সন্তুষ্ট থাকুন,\nআল্লাহ যা করেন বান্দার কল্যাণের জন্যই করেন।",
        x: 80,
        y: 840,
        width: 920,
        height: 120,
        fontSize: 32,
        fontFamily: "'Hind Siliguri', sans-serif",
        fontWeight: "bold",
        color: "#fef08a",
        zIndex: 4
      },
      {
        id: "txt_sub",
        type: "text",
        content: "- আল-কোরআন / হাদিস শরীফ",
        x: 80,
        y: 980,
        width: 920,
        height: 40,
        fontSize: 20,
        fontFamily: "'Hind Siliguri', sans-serif",
        color: "#a7f3d0",
        zIndex: 5
      }
    ]
  },

  // 3. Birthday Celebration Frame
  {
    id: "frame_birthday_fun",
    name: "Colorful Birthday Party Frame (শুভ জন্মদিন ফ্রেম)",
    category: "birthday",
    thumbnail: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=500&q=80",
    width: 1080,
    height: 1080,
    bgClass: "bg-gradient-to-tr from-pink-600 to-purple-800",
    searchTags: ["birthday", "party", "cake", "celebration", "জন্মদিন", "উপহার", "frames"],
    createdAt: Date.now() - 90000,
    updatedAt: Date.now(),
    elements: [
      {
        id: "bg_rect",
        type: "shape",
        shapeType: "rectangle",
        fillColor: "#831843",
        x: 0,
        y: 0,
        width: 1080,
        height: 1080,
        zIndex: 1
      },
      {
        id: "photo_slot_birthday",
        type: "placeholder",
        content: "",
        x: 100,
        y: 140,
        width: 880,
        height: 720,
        shapeType: "rounded-rect",
        borderRadius: 36,
        borderColor: "#f472b6",
        borderWidth: 6,
        zIndex: 2
      },
      {
        id: "txt_bday_title",
        type: "text",
        content: "🎂 শুভ জন্মদিন / HAPPY BIRTHDAY 🎉",
        x: 80,
        y: 50,
        width: 920,
        height: 70,
        fontSize: 40,
        fontFamily: "'Hind Siliguri', sans-serif",
        fontWeight: "bold",
        color: "#fde047",
        zIndex: 3
      },
      {
        id: "txt_bday_wish",
        type: "text",
        content: "তোমার জীবনের প্রতিটি দিন ভরে উঠুক আনন্দ ও সফলতায়!",
        x: 80,
        y: 910,
        width: 920,
        height: 60,
        fontSize: 26,
        fontFamily: "'Hind Siliguri', sans-serif",
        color: "#ffffff",
        zIndex: 4
      }
    ]
  },

  // 4. Eid Mubarak Royal Frame
  {
    id: "frame_eid_mubarak",
    name: "Eid Mubarak Golden Festive Frame (ঈদ মোবারক ফ্রেম)",
    category: "eid",
    thumbnail: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=500&q=80",
    width: 1080,
    height: 1080,
    bgClass: "bg-indigo-950",
    searchTags: ["eid", "mubarak", "ramadan", "festive", "ঈদ", "মোবারক", "frames"],
    createdAt: Date.now() - 85000,
    updatedAt: Date.now(),
    elements: [
      {
        id: "bg_eid",
        type: "shape",
        shapeType: "rectangle",
        fillColor: "#1e1b4b",
        x: 0,
        y: 0,
        width: 1080,
        height: 1080,
        zIndex: 1
      },
      {
        id: "photo_slot_eid",
        type: "placeholder",
        content: "",
        x: 120,
        y: 120,
        width: 840,
        height: 720,
        shapeType: "rounded-rect",
        borderRadius: 28,
        borderColor: "#f59e0b",
        borderWidth: 6,
        zIndex: 2
      },
      {
        id: "txt_eid_title",
        type: "text",
        content: "🌙 ঈদ মোবারক (EID MUBARAK)",
        x: 80,
        y: 880,
        width: 920,
        height: 70,
        fontSize: 44,
        fontFamily: "'Hind Siliguri', sans-serif",
        fontWeight: "bold",
        color: "#fbbf24",
        zIndex: 3
      },
      {
        id: "txt_eid_wish",
        type: "text",
        content: "পবিত্র ঈদের অনাবিল আনন্দ ছড়িয়ে পড়ুক সবার মাঝে",
        x: 80,
        y: 960,
        width: 920,
        height: 50,
        fontSize: 24,
        fontFamily: "'Hind Siliguri', sans-serif",
        color: "#e0e7ff",
        zIndex: 4
      }
    ]
  },

  // 5. Romantic Love Floral Frame
  {
    id: "frame_romantic_love",
    name: "Romantic Heart Floral Frame (রোমান্টিক কাপল ফ্রেম)",
    category: "love",
    thumbnail: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=500&q=80",
    width: 1080,
    height: 1080,
    bgClass: "bg-rose-950",
    searchTags: ["love", "couple", "romantic", "heart", "রোমান্টিক", "ভালোবাসা", "frames"],
    createdAt: Date.now() - 80000,
    updatedAt: Date.now(),
    elements: [
      {
        id: "bg_love",
        type: "shape",
        shapeType: "rectangle",
        fillColor: "#4c0519",
        x: 0,
        y: 0,
        width: 1080,
        height: 1080,
        zIndex: 1
      },
      {
        id: "photo_slot_love",
        type: "placeholder",
        content: "",
        x: 100,
        y: 100,
        width: 880,
        height: 760,
        shapeType: "rounded-rect",
        borderRadius: 32,
        borderColor: "#fb7185",
        borderWidth: 6,
        zIndex: 2
      },
      {
        id: "txt_love_title",
        type: "text",
        content: "❤️ YOU & ME FOREVER ❤️",
        x: 80,
        y: 900,
        width: 920,
        height: 60,
        fontSize: 36,
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: "bold",
        color: "#ffe4e6",
        zIndex: 3
      },
      {
        id: "txt_love_bn",
        type: "text",
        content: "ভালোবাসার প্রতিটি মুহূর্ত হোক স্মৃতিময়",
        x: 80,
        y: 970,
        width: 920,
        height: 40,
        fontSize: 22,
        fontFamily: "'Hind Siliguri', sans-serif",
        color: "#fecdd3",
        zIndex: 4
      }
    ]
  },

  // 6. Neon Cyberpunk Glow Frame
  {
    id: "frame_neon_cyberpunk",
    name: "Cyber Neon Glow Frame (নিয়ন গ্লো ফ্রেম)",
    category: "neon_3d",
    thumbnail: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=500&q=80",
    width: 1080,
    height: 1080,
    bgClass: "bg-black",
    searchTags: ["neon", "cyberpunk", "glow", "blue", "নিয়ন", "গ্লো", "frames"],
    createdAt: Date.now() - 75000,
    updatedAt: Date.now(),
    elements: [
      {
        id: "bg_neon",
        type: "shape",
        shapeType: "rectangle",
        fillColor: "#050505",
        x: 0,
        y: 0,
        width: 1080,
        height: 1080,
        zIndex: 1
      },
      {
        id: "neon_border_outer",
        type: "shape",
        shapeType: "rounded-rect",
        fillColor: "transparent",
        borderColor: "#06b6d4",
        borderWidth: 8,
        borderRadius: 24,
        x: 50,
        y: 50,
        width: 980,
        height: 980,
        zIndex: 2
      },
      {
        id: "photo_slot_neon",
        type: "placeholder",
        content: "",
        x: 100,
        y: 100,
        width: 880,
        height: 800,
        shapeType: "rounded-rect",
        borderRadius: 16,
        borderColor: "#a855f7",
        borderWidth: 4,
        zIndex: 3
      },
      {
        id: "txt_neon_name",
        type: "text",
        content: "⚡ NEON VIBES ⚡",
        x: 100,
        y: 940,
        width: 880,
        height: 50,
        fontSize: 36,
        fontFamily: "'Orbitron', sans-serif",
        fontWeight: "bold",
        color: "#22d3ee",
        zIndex: 4
      }
    ]
  },

  // 7. National Festival Victory Day Frame
  {
    id: "frame_national_victory",
    name: "Victory Day Bangladesh Frame (মহান বিজয় দিবস)",
    category: "festival",
    thumbnail: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=500&q=80",
    width: 1080,
    height: 1080,
    bgClass: "bg-emerald-950",
    searchTags: ["bangladesh", "victory", "independence", "জাতীয়", "বিজয় দিবস", "frames"],
    createdAt: Date.now() - 70000,
    updatedAt: Date.now(),
    elements: [
      {
        id: "bg_bd",
        type: "shape",
        shapeType: "rectangle",
        fillColor: "#064e3b",
        x: 0,
        y: 0,
        width: 1080,
        height: 1080,
        zIndex: 1
      },
      {
        id: "red_sun_circle",
        type: "shape",
        shapeType: "circle",
        fillColor: "#dc2626",
        x: 290,
        y: 190,
        width: 500,
        height: 500,
        zIndex: 2
      },
      {
        id: "photo_slot_bd",
        type: "placeholder",
        content: "",
        x: 140,
        y: 120,
        width: 800,
        height: 680,
        shapeType: "rounded-rect",
        borderRadius: 24,
        borderColor: "#f59e0b",
        borderWidth: 5,
        zIndex: 3
      },
      {
        id: "txt_bd_title",
        type: "text",
        content: "মহান বিজয় দিবস / শুভ স্বাধীনতা দিবস",
        x: 80,
        y: 860,
        width: 920,
        height: 60,
        fontSize: 38,
        fontFamily: "'Hind Siliguri', sans-serif",
        fontWeight: "bold",
        color: "#fef08a",
        zIndex: 4
      },
      {
        id: "txt_bd_wish",
        type: "text",
        content: "বিনম্র শ্রদ্ধায় স্মরণ করি সকল বীর মুক্তিযোদ্ধাদের",
        x: 80,
        y: 940,
        width: 920,
        height: 50,
        fontSize: 22,
        fontFamily: "'Hind Siliguri', sans-serif",
        color: "#d1fae5",
        zIndex: 5
      }
    ]
  },

  // 8. Polaroid Collage Frame
  {
    id: "frame_polaroid_duo",
    name: "Classic Polaroid Duo Frame (পোলারয়েড ডুও ফ্রেম)",
    category: "polaroid",
    thumbnail: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=500&q=80",
    width: 1080,
    height: 1080,
    bgClass: "bg-slate-900",
    searchTags: ["polaroid", "collage", "photo", "পোলারয়েড", "কোলাজ", "frames"],
    createdAt: Date.now() - 65000,
    updatedAt: Date.now(),
    elements: [
      {
        id: "bg_polaroid",
        type: "shape",
        shapeType: "rectangle",
        fillColor: "#0f172a",
        x: 0,
        y: 0,
        width: 1080,
        height: 1080,
        zIndex: 1
      },
      {
        id: "polaroid_slot_1",
        type: "placeholder",
        content: "",
        x: 100,
        y: 120,
        width: 400,
        height: 520,
        shapeType: "rounded-rect",
        borderRadius: 16,
        borderColor: "#ffffff",
        borderWidth: 10,
        zIndex: 2
      },
      {
        id: "polaroid_slot_2",
        type: "placeholder",
        content: "",
        x: 580,
        y: 120,
        width: 400,
        height: 520,
        shapeType: "rounded-rect",
        borderRadius: 16,
        borderColor: "#ffffff",
        borderWidth: 10,
        zIndex: 3
      },
      {
        id: "txt_polaroid_note",
        type: "text",
        content: "Sweet Memories • মধুর স্মৃতিগুলো",
        x: 100,
        y: 720,
        width: 880,
        height: 60,
        fontSize: 34,
        fontFamily: "'Hind Siliguri', sans-serif",
        fontWeight: "bold",
        color: "#f8fafc",
        zIndex: 4
      }
    ]
  }
];

// Rich Built-in Templates Collection
export const BUILTIN_TEMPLATES: TemplateItem[] = [
  // 1. YouTube Banner Safe Area Template (ভিডিওর মতো হুবহু গাইডলাইন সহ)
  {
    id: "tpl_youtube_banner_safe",
    name: "YouTube Channel Banner Safe Area Guide (ইউটিউব ব্যানার)",
    category: "youtube",
    thumbnail: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=500&q=80",
    width: 2560,
    height: 1440,
    bgClass: "bg-zinc-900",
    searchTags: ["youtube", "banner", "safe area", "channel art", "ইউটিউব", "ব্যানার", "templates"],
    createdAt: Date.now() - 60000,
    updatedAt: Date.now(),
    elements: [
      {
        id: "yt_bg",
        type: "shape",
        shapeType: "rectangle",
        fillColor: "#18181b",
        x: 0,
        y: 0,
        width: 2560,
        height: 1440,
        zIndex: 1
      },
      {
        id: "yt_safe_area_box",
        type: "shape",
        shapeType: "rectangle",
        fillColor: "#27272a",
        borderColor: "#ef4444",
        borderWidth: 4,
        x: 507,
        y: 508,
        width: 1546,
        height: 423,
        zIndex: 2
      },
      {
        id: "yt_logo_photo",
        type: "placeholder",
        content: "",
        x: 580,
        y: 560,
        width: 320,
        height: 320,
        shapeType: "circle",
        borderColor: "#ef4444",
        borderWidth: 6,
        zIndex: 3
      },
      {
        id: "yt_channel_name",
        type: "text",
        content: "YOUR CHANNEL NAME",
        x: 950,
        y: 600,
        width: 1050,
        height: 90,
        fontSize: 70,
        fontFamily: "'Bebas Neue', sans-serif",
        fontWeight: "bold",
        color: "#ffffff",
        zIndex: 4
      },
      {
        id: "yt_sub_text",
        type: "text",
        content: "Tech • Gaming • Tutorials • Subscribe Now!",
        x: 950,
        y: 720,
        width: 1050,
        height: 50,
        fontSize: 32,
        fontFamily: "'Hind Siliguri', sans-serif",
        color: "#a1a1aa",
        zIndex: 5
      },
      {
        id: "yt_guide_label",
        type: "text",
        content: "📺 Desktop / Mobile Safe Area (1546×423 px)",
        x: 507,
        y: 440,
        width: 1546,
        height: 50,
        fontSize: 28,
        fontFamily: "'Hind Siliguri', sans-serif",
        color: "#f87171",
        zIndex: 6
      }
    ]
  },

  // 2. Facebook Post Big Sale 50% Off Template
  {
    id: "tpl_facebook_big_sale",
    name: "Mega Sale 50% Discount Post (স্পেশাল অফার পোস্ট)",
    category: "facebook",
    thumbnail: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=500&q=80",
    width: 1080,
    height: 1080,
    bgClass: "bg-indigo-950",
    searchTags: ["facebook", "sale", "discount", "offer", "বিজ্ঞাপন", "ডিসকাউন্ট", "অফার", "templates"],
    createdAt: Date.now() - 55000,
    updatedAt: Date.now(),
    elements: [
      {
        id: "bg_sale",
        type: "shape",
        shapeType: "rectangle",
        fillColor: "#0f172a",
        x: 0,
        y: 0,
        width: 1080,
        height: 1080,
        zIndex: 1
      },
      {
        id: "photo_product_slot",
        type: "placeholder",
        content: "",
        x: 540,
        y: 120,
        width: 480,
        height: 600,
        shapeType: "rounded-rect",
        borderRadius: 24,
        borderColor: "#f59e0b",
        borderWidth: 4,
        zIndex: 2
      },
      {
        id: "txt_badge_sale",
        type: "text",
        content: "🔥 MEGA OFFER",
        x: 60,
        y: 100,
        width: 440,
        height: 50,
        fontSize: 30,
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: "bold",
        color: "#ef4444",
        zIndex: 3
      },
      {
        id: "txt_sale_main",
        type: "text",
        content: "UP TO 50% OFF\nসব পণ্যে বিশেষ ছাড়!",
        x: 60,
        y: 170,
        width: 450,
        height: 180,
        fontSize: 48,
        fontFamily: "'Hind Siliguri', sans-serif",
        fontWeight: "bold",
        color: "#fbbf24",
        zIndex: 4
      },
      {
        id: "txt_sale_details",
        type: "text",
        content: "সীমিত সময়ের জন্য অফারটি প্রযোজ্য। আজই অর্ডার করুন এবং বুঝে নিন ফ্রি হোম ডেলিভারি।",
        x: 60,
        y: 380,
        width: 450,
        height: 120,
        fontSize: 22,
        fontFamily: "'Hind Siliguri', sans-serif",
        color: "#cbd5e1",
        zIndex: 5
      },
      {
        id: "txt_contact",
        type: "text",
        content: "📞 যোগাযোগ: 01700-000000 | 🌐 www.yourshop.com",
        x: 60,
        y: 920,
        width: 960,
        height: 50,
        fontSize: 28,
        fontFamily: "'Hind Siliguri', sans-serif",
        fontWeight: "bold",
        color: "#38bdf8",
        zIndex: 6
      }
    ]
  },

  // 3. YouTube Clickbait Thumbnail
  {
    id: "tpl_youtube_clickbait_thumb",
    name: "Viral YouTube Video Thumbnail (ইউটিউব থাম্বনেইল)",
    category: "youtube",
    thumbnail: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=500&q=80",
    width: 1280,
    height: 720,
    bgClass: "bg-slate-950",
    searchTags: ["youtube", "thumbnail", "viral", "video", "ভিডিও", "থাম্বনেইল", "templates"],
    createdAt: Date.now() - 50000,
    updatedAt: Date.now(),
    elements: [
      {
        id: "thumb_bg",
        type: "shape",
        shapeType: "rectangle",
        fillColor: "#09090b",
        x: 0,
        y: 0,
        width: 1280,
        height: 720,
        zIndex: 1
      },
      {
        id: "thumb_photo_slot",
        type: "placeholder",
        content: "",
        x: 680,
        y: 60,
        width: 550,
        height: 600,
        shapeType: "rounded-rect",
        borderRadius: 24,
        borderColor: "#eab308",
        borderWidth: 6,
        zIndex: 2
      },
      {
        id: "thumb_headline",
        type: "text",
        content: "মাত্র ৫ মিনিটে\nশিখে নিন দারুণ ট্রিক!",
        x: 50,
        y: 80,
        width: 600,
        height: 220,
        fontSize: 60,
        fontFamily: "'Hind Siliguri', sans-serif",
        fontWeight: "bold",
        color: "#fbbf24",
        zIndex: 3
      },
      {
        id: "thumb_sub",
        type: "text",
        content: "১০০% কার্যকর ও সহজ উপায়",
        x: 50,
        y: 340,
        width: 600,
        height: 60,
        fontSize: 34,
        fontFamily: "'Hind Siliguri', sans-serif",
        color: "#38bdf8",
        zIndex: 4
      },
      {
        id: "thumb_badge",
        type: "shape",
        shapeType: "rounded-rect",
        fillColor: "#ef4444",
        borderRadius: 16,
        x: 50,
        y: 500,
        width: 280,
        height: 80,
        zIndex: 5
      },
      {
        id: "thumb_badge_txt",
        type: "text",
        content: "NEW 2026 🔥",
        x: 50,
        y: 515,
        width: 280,
        height: 50,
        fontSize: 32,
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: "bold",
        color: "#ffffff",
        zIndex: 6
      }
    ]
  },

  // 4. Instagram Story 9:16 Motivation & Quote
  {
    id: "tpl_instagram_quote_story",
    name: "Aesthetic Instagram Story (স্টোরি ও স্ট্যাটাস)",
    category: "instagram",
    thumbnail: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&q=80",
    width: 1080,
    height: 1920,
    bgClass: "bg-zinc-950",
    searchTags: ["instagram", "story", "quote", "reels", "স্টোরি", "ইনস্টাগ্রাম", "templates"],
    createdAt: Date.now() - 45000,
    updatedAt: Date.now(),
    elements: [
      {
        id: "story_bg",
        type: "shape",
        shapeType: "rectangle",
        fillColor: "#18181b",
        x: 0,
        y: 0,
        width: 1080,
        height: 1920,
        zIndex: 1
      },
      {
        id: "story_photo_slot",
        type: "placeholder",
        content: "",
        x: 90,
        y: 180,
        width: 900,
        height: 1000,
        shapeType: "rounded-rect",
        borderRadius: 36,
        borderColor: "#a855f7",
        borderWidth: 6,
        zIndex: 2
      },
      {
        id: "story_quote",
        type: "text",
        content: "“নিজের ওপর বিশ্বাস রাখুন,\nসাফল্য একদিন আপনার পদচুম্বন করবে।”",
        x: 80,
        y: 1250,
        width: 920,
        height: 180,
        fontSize: 44,
        fontFamily: "'Hind Siliguri', sans-serif",
        fontWeight: "bold",
        color: "#f8fafc",
        zIndex: 3
      },
      {
        id: "story_author",
        type: "text",
        content: "- অনুপ্রেরণামূলক উক্তি",
        x: 80,
        y: 1470,
        width: 920,
        height: 60,
        fontSize: 28,
        fontFamily: "'Hind Siliguri', sans-serif",
        color: "#c084fc",
        zIndex: 4
      }
    ]
  },

  // 5. Facebook Group Cover Banner
  {
    id: "tpl_facebook_group_cover",
    name: "Facebook Group Cover Banner (ফেসবুক গ্রুপ কভার)",
    category: "facebook",
    thumbnail: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&q=80",
    width: 1640,
    height: 856,
    bgClass: "bg-blue-950",
    searchTags: ["facebook", "group", "cover", "community", "গ্রুপ কভার", "ফেসবুক", "templates"],
    createdAt: Date.now() - 40000,
    updatedAt: Date.now(),
    elements: [
      {
        id: "fb_cov_bg",
        type: "shape",
        shapeType: "rectangle",
        fillColor: "#172554",
        x: 0,
        y: 0,
        width: 1640,
        height: 856,
        zIndex: 1
      },
      {
        id: "fb_cov_photo",
        type: "placeholder",
        content: "",
        x: 1000,
        y: 100,
        width: 550,
        height: 656,
        shapeType: "rounded-rect",
        borderRadius: 28,
        borderColor: "#60a5fa",
        borderWidth: 6,
        zIndex: 2
      },
      {
        id: "fb_cov_title",
        type: "text",
        content: "WELCOME TO OUR OFFICIAL GROUP",
        x: 80,
        y: 160,
        width: 880,
        height: 90,
        fontSize: 52,
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: "bold",
        color: "#ffffff",
        zIndex: 3
      },
      {
        id: "fb_cov_name",
        type: "text",
        content: "আপনার ফেসবুক গ্রুপের নাম এখানে লিখুন",
        x: 80,
        y: 280,
        width: 880,
        height: 80,
        fontSize: 42,
        fontFamily: "'Hind Siliguri', sans-serif",
        fontWeight: "bold",
        color: "#fbbf24",
        zIndex: 4
      },
      {
        id: "fb_cov_rules",
        type: "text",
        content: "✓ দৈনন্দিন আপডেট ✓ বন্ধুত্বপূর্ণ পরিবেশ ✓ সবার জন্য উন্মুক্ত",
        x: 80,
        y: 420,
        width: 880,
        height: 60,
        fontSize: 26,
        fontFamily: "'Hind Siliguri', sans-serif",
        color: "#93c5fd",
        zIndex: 5
      }
    ]
  },

  // 6. Food Restaurant Special Offer
  {
    id: "tpl_restaurant_burger_offer",
    name: "Delicious Food & Burger Offer (খাবারের বিজ্ঞাপন ব্যানার)",
    category: "business",
    thumbnail: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80",
    width: 1080,
    height: 1080,
    bgClass: "bg-amber-950",
    searchTags: ["food", "burger", "restaurant", "offer", "খাবার", "রেস্তোরাঁ", "বিজ্ঞাপন", "templates"],
    createdAt: Date.now() - 35000,
    updatedAt: Date.now(),
    elements: [
      {
        id: "food_bg",
        type: "shape",
        shapeType: "rectangle",
        fillColor: "#451a03",
        x: 0,
        y: 0,
        width: 1080,
        height: 1080,
        zIndex: 1
      },
      {
        id: "food_photo_slot",
        type: "placeholder",
        content: "",
        x: 100,
        y: 180,
        width: 880,
        height: 600,
        shapeType: "rounded-rect",
        borderRadius: 30,
        borderColor: "#f59e0b",
        borderWidth: 6,
        zIndex: 2
      },
      {
        id: "food_title",
        type: "text",
        content: "SPECIAL BURGER COMBO 🍔",
        x: 80,
        y: 60,
        width: 920,
        height: 80,
        fontSize: 48,
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: "bold",
        color: "#fbbf24",
        zIndex: 3
      },
      {
        id: "food_order_now",
        type: "text",
        content: "🛵 ফ্রি হোম ডেলিভারি পেতে কল করুন: 01900-112233",
        x: 50,
        y: 890,
        width: 980,
        height: 60,
        fontSize: 32,
        fontFamily: "'Hind Siliguri', sans-serif",
        fontWeight: "bold",
        color: "#fef3c7",
        zIndex: 4
      }
    ]
  }
];

export interface CanvasSizePreset {
  id: string;
  name: string;
  nameBn: string;
  width: number;
  height: number;
  category: "social" | "print" | "cards" | "banner" | "mobile";
  aspectRatio: string;
  bgClass: string;
  text: string;
  icon: string;
  description?: string;
}

export const CANVAS_SIZE_CATEGORIES = [
  { id: "all", name: "All Sizes", nameBn: "সকল সাইজ", icon: "🌟" },
  { id: "social", name: "Social Media", nameBn: "সোশ্যাল মিডিয়া", icon: "📘" },
  { id: "print", name: "Print & Paper", nameBn: "প্রিন্ট ও পেপার (A4, A3, A5)", icon: "📜" },
  { id: "cards", name: "Cards & ID", nameBn: "কার্ড ও আইডি সাইজ", icon: "💳" },
  { id: "banner", name: "Poster & Banner", nameBn: "পোস্টার ও ব্যানার", icon: "📢" },
  { id: "mobile", name: "Mobile & Story", nameBn: "মোবাইল ও স্টোরি", icon: "📱" }
];

// Comprehensive Design & Canvas Sizes Collection matching video & user specifications
export const CANVAS_PRESETS: CanvasSizePreset[] = [
  // --- SOCIAL MEDIA ---
  { 
    id: "fb-post", 
    name: "Facebook Post", 
    nameBn: "ফেসবুক পোস্ট (১:১)", 
    width: 1080, 
    height: 1080, 
    category: "social",
    aspectRatio: "1:1", 
    bgClass: "bg-white", 
    text: "Facebook Post",
    icon: "📘",
    description: "1080 × 1080 px • স্কয়ার পোস্ট"
  },
  { 
    id: "fb-cover", 
    name: "Facebook Cover", 
    nameBn: "ফেসবুক কভার সাইজ", 
    width: 1640, 
    height: 856, 
    category: "social",
    aspectRatio: "1.91:1", 
    bgClass: "bg-gradient-to-r from-blue-900 to-blue-600", 
    text: "Facebook Cover",
    icon: "📘",
    description: "1640 × 856 px • গ্রুপ ও পেজ কভার"
  },
  { 
    id: "fb-id-cover", 
    name: "Facebook ID Cover", 
    nameBn: "ফেসবুক আইডি কভার সাইজ", 
    width: 820, 
    height: 312, 
    category: "social",
    aspectRatio: "2.63:1", 
    bgClass: "bg-gradient-to-r from-red-800 to-orange-400", 
    text: "Facebook ID Cover",
    icon: "📘",
    description: "820 × 312 px • ব্যক্তিগত প্রোফাইল কভার"
  },
  { 
    id: "fb-profile", 
    name: "Facebook Profile", 
    nameBn: "ফেসবুক প্রোফাইল পিকচার", 
    width: 1080, 
    height: 1080, 
    category: "social",
    aspectRatio: "1:1", 
    bgClass: "bg-white", 
    text: "FB Profile",
    icon: "📘",
    description: "1080 × 1080 px • প্রোফাইল স্কয়ার"
  },
  { 
    id: "insta-post", 
    name: "Instagram Post", 
    nameBn: "ইনস্টাগ্রাম স্কয়ার পোস্ট", 
    width: 1080, 
    height: 1080, 
    category: "social",
    aspectRatio: "1:1", 
    bgClass: "bg-white", 
    text: "Instagram Post",
    icon: "📸",
    description: "1080 × 1080 px • 1:1 অনুপাত"
  },
  { 
    id: "insta-portrait", 
    name: "Instagram Portrait", 
    nameBn: "ইনস্টাগ্রাম পোর্ট্রেট (4:5)", 
    width: 1080, 
    height: 1350, 
    category: "social",
    aspectRatio: "4:5", 
    bgClass: "bg-white", 
    text: "Instagram 4:5",
    icon: "📸",
    description: "1080 × 1350 px • ফিড পোর্ট্রেট"
  },
  { 
    id: "insta-story", 
    name: "Instagram Story", 
    nameBn: "ইনস্টাগ্রাম স্টোরি (9:16)", 
    width: 1080, 
    height: 1920, 
    category: "mobile",
    aspectRatio: "9:16", 
    bgClass: "bg-gradient-to-b from-purple-700 to-pink-600", 
    text: "Instagram Story",
    icon: "📸",
    description: "1080 × 1920 px • ফুল স্ক্রিন স্টোরি"
  },
  { 
    id: "yt-thumb", 
    name: "YouTube Thumbnail", 
    nameBn: "ইউটিউব থাম্বনেইল (16:9)", 
    width: 1280, 
    height: 720, 
    category: "social",
    aspectRatio: "16:9", 
    bgClass: "bg-gradient-to-r from-red-600 to-zinc-900", 
    text: "YouTube Thumbnail",
    icon: "▶️",
    description: "1280 × 720 px • হাই ডেফিনিশন 16:9"
  },
  { 
    id: "yt-channel-art", 
    name: "YouTube Channel Banner", 
    nameBn: "ইউটিউব ব্যানার আর্ট সাইজ", 
    width: 2560, 
    height: 1440, 
    category: "social",
    aspectRatio: "16:9", 
    bgClass: "bg-zinc-900", 
    text: "YouTube Banner",
    icon: "▶️",
    description: "2560 × 1440 px • চ্যানেল হেডার আর্ট"
  },
  { 
    id: "tiktok-video", 
    name: "TikTok Video", 
    nameBn: "টিকটক ভিডিও সাইজ (9:16)", 
    width: 1080, 
    height: 1920, 
    category: "mobile",
    aspectRatio: "9:16", 
    bgClass: "bg-black", 
    text: "TikTok 9:16",
    icon: "🎵",
    description: "1080 × 1920 px • টিকটক ও রিলস"
  },
  { 
    id: "whatsapp-status", 
    name: "WhatsApp Status", 
    nameBn: "হোয়াটসঅ্যাপ স্ট্যাটাস (9:16)", 
    width: 1080, 
    height: 1920, 
    category: "mobile",
    aspectRatio: "9:16", 
    bgClass: "bg-emerald-900", 
    text: "WhatsApp Status",
    icon: "💬",
    description: "1080 × 1920 px • ফুল স্ক্রিন স্ট্যাটাস"
  },
  { 
    id: "mobile-wallpaper", 
    name: "Mobile Wallpaper", 
    nameBn: "মোবাইল ওয়ালপেপার (9:16)", 
    width: 1080, 
    height: 1920, 
    category: "mobile",
    aspectRatio: "9:16", 
    bgClass: "bg-gradient-to-b from-indigo-900 to-purple-900", 
    text: "Wallpaper 9:16",
    icon: "📱",
    description: "1080 × 1920 px • HD স্ক্রিন ওয়ালপেপার"
  },

  // --- PRINT & PAPER ---
  { 
    id: "a4-portrait", 
    name: "A4 Paper Portrait", 
    nameBn: "A4 সাইজ পোর্ট্রেট (প্রিন্ট)", 
    width: 2480, 
    height: 3508, 
    category: "print",
    aspectRatio: "1:1.414", 
    bgClass: "bg-white", 
    text: "A4 Portrait",
    icon: "📄",
    description: "2480 × 3508 px (300 DPI Standard)"
  },
  { 
    id: "a4-landscape", 
    name: "A4 Paper Landscape", 
    nameBn: "A4 সাইজ ল্যান্ডস্কেপ", 
    width: 3508, 
    height: 2480, 
    category: "print",
    aspectRatio: "1.414:1", 
    bgClass: "bg-white", 
    text: "A4 Landscape",
    icon: "📄",
    description: "3508 × 2480 px (300 DPI)"
  },
  { 
    id: "a3-paper", 
    name: "A3 Paper Large", 
    nameBn: "A3 সাইজ (বড় পেপার)", 
    width: 3508, 
    height: 4960, 
    category: "print",
    aspectRatio: "1:1.414", 
    bgClass: "bg-white", 
    text: "A3 Size",
    icon: "📄",
    description: "3508 × 4960 px • বড় প্রিন্ট শীট"
  },
  { 
    id: "a5-paper", 
    name: "A5 Paper Booklet", 
    nameBn: "A5 সাইজ (বুকলেট/নোট)", 
    width: 1748, 
    height: 2480, 
    category: "print",
    aspectRatio: "1:1.414", 
    bgClass: "bg-white", 
    text: "A5 Size",
    icon: "📄",
    description: "1748 × 2480 px • মাঝারি নোট পেপার"
  },
  { 
    id: "flyer-doc", 
    name: "Flyer & Leaflet", 
    nameBn: "ফ্লায়ার ও লিফলেট সাইজ", 
    width: 1275, 
    height: 1650, 
    category: "print",
    aspectRatio: "1:1.29", 
    bgClass: "bg-white", 
    text: "Flyer / Leaflet",
    icon: "📑",
    description: "1275 × 1650 px • লিফলেট ও প্রচারপত্র"
  },

  // --- CARDS & IDENTITY ---
  { 
    id: "business-card", 
    name: "Business Card", 
    nameBn: "ভিজিটিং কার্ড সাইজ", 
    width: 1050, 
    height: 600, 
    category: "cards",
    aspectRatio: "3.5:2", 
    bgClass: "bg-gradient-to-r from-slate-900 to-indigo-950", 
    text: "Business Card",
    icon: "💼",
    description: "1050 × 600 px • 3.5 × 2 ইঞ্চি স্ট্যান্ডার্ড"
  },
  { 
    id: "id-card-portrait", 
    name: "ID Card Portrait", 
    nameBn: "আইডি কার্ড সাইজ (পোর্ট্রেট)", 
    width: 638, 
    height: 1011, 
    category: "cards",
    aspectRatio: "1:1.58", 
    bgClass: "bg-gradient-to-b from-blue-900 to-slate-900", 
    text: "ID Card Portrait",
    icon: "🪪",
    description: "638 × 1011 px • খাড়া আইডি কার্ড"
  },
  { 
    id: "id-card-landscape", 
    name: "ID Card Landscape", 
    nameBn: "আইডি কার্ড সাইজ (ল্যান্ডস্কেপ)", 
    width: 1011, 
    height: 638, 
    category: "cards",
    aspectRatio: "1.58:1", 
    bgClass: "bg-gradient-to-r from-blue-900 to-purple-900", 
    text: "ID Card Landscape",
    icon: "🪪",
    description: "1011 × 638 px • আড়াআড়ি আইডি কার্ড"
  },

  // --- POSTERS & BANNERS ---
  { 
    id: "poster-portrait", 
    name: "Standard Poster", 
    nameBn: "পোস্টার সাইজ (পোর্ট্রেট)", 
    width: 1800, 
    height: 2400, 
    category: "banner",
    aspectRatio: "3:4", 
    bgClass: "bg-white", 
    text: "Poster 3:4",
    icon: "📜",
    description: "1800 × 2400 px • ইভেন্ট ও নোটিশ পোস্টার"
  },
  { 
    id: "banner-web", 
    name: "Web Banner Landscape", 
    nameBn: "ওয়েব ব্যানার (ল্যান্ডস্কেপ)", 
    width: 1920, 
    height: 600, 
    category: "banner",
    aspectRatio: "3.2:1", 
    bgClass: "bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900", 
    text: "Web Banner",
    icon: "📢",
    description: "1920 × 600 px • ওয়েবসাইট হেডার ব্যানার"
  },
  { 
    id: "banner-leaderboard", 
    name: "Leaderboard Ad", 
    nameBn: "লিডারবোর্ড বিজ্ঞাপন সাইজ", 
    width: 1456, 
    height: 180, 
    category: "banner",
    aspectRatio: "8:1", 
    bgClass: "bg-slate-900", 
    text: "Leaderboard Ad",
    icon: "📢",
    description: "1456 × 180 px • অনলাইন ব্যানার বিজ্ঞাপন"
  },

  // --- OTHER PLATFORMS ---
  { 
    id: "twitter-header", 
    name: "Twitter / X Header", 
    nameBn: "টুইটার / X হেডার ব্যানার", 
    width: 1500, 
    height: 500, 
    category: "social",
    aspectRatio: "3:1", 
    bgClass: "bg-black", 
    text: "X / Twitter 3:1",
    icon: "🐦",
    description: "1500 × 500 px • 3:1 অনুপাত"
  },
  { 
    id: "linkedin-banner", 
    name: "LinkedIn Cover", 
    nameBn: "লিঙ্কডইন কভার ব্যানার", 
    width: 1584, 
    height: 396, 
    category: "social",
    aspectRatio: "4:1", 
    bgClass: "bg-blue-950", 
    text: "LinkedIn 4:1",
    icon: "💼",
    description: "1584 × 396 px • প্রফেশনাল হেডার"
  },
  { 
    id: "pinterest-pin", 
    name: "Pinterest Pin", 
    nameBn: "পিন্টারেস্ট পিন (2:3)", 
    width: 1000, 
    height: 1500, 
    category: "social",
    aspectRatio: "2:3", 
    bgClass: "bg-white", 
    text: "Pinterest 2:3",
    icon: "📌",
    description: "1000 × 1500 px • 2:3 অনুপাত"
  }
];
