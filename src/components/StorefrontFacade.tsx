import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { db } from "../lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { getVideoFromDB, saveVideoToDB } from "../lib/videoStorage";
import { downloadAndReassembleVideo } from "../lib/videoChunkService";
import { getYouTubeVideoId } from "./DynamicBannerSlider";

const LOCAL_STORAGE_SIGNBOARD_KEY = "almayadin_signboard_cache_v1";

const getCachedSignboards = () => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_SIGNBOARD_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return [];
};

export interface DisplayShowcaseItem {
  id: string;
  categoryTag: string;
  icon: string;
  name: string;
  purpose: string;
  explanation: string;
  footnote?: string;
  path: string;
  badgeBg: string;
}

const SHOWCASE_ITEMS: DisplayShowcaseItem[] = [
  {
    id: "market_clothing",
    categoryTag: "প্রধান বাজার গাইড",
    icon: "👕",
    name: "কাপড় ও পরিধান",
    purpose: "পছন্দের পোশাক ও পণ্য ব্রাউজ করুন",
    explanation: "পণ্যের বিস্তারিত দেখুন এবং প্রয়োজনীয় পণ্য ক্যাশ অন ডেলিভারিতে অর্ডার করুন।",
    footnote: "নোট: অমল কর্নার, উপহার বাজার ও ইসলামিক বাজারের মূল প্রক্রিয়াও একই।",
    path: "/category/cat3",
    badgeBg: "bg-amber-400 text-gray-950"
  },
  {
    id: "tilawat",
    categoryTag: "ইসলামিক সেবা",
    icon: "📖",
    name: "তিলাওয়াত লাইব্রেরি",
    purpose: "কুরআন ও তিলাওয়াত সম্পর্কিত কনটেন্ট সহজে পড়া ও শোনার জন্য।",
    explanation: "পছন্দের সূরা ও ক্বারী বেছে নিয়ে ১-ট্যাপে ব্যাকগ্রাউন্ডে নূরানী অডিও শুনুন।",
    path: "/islamic-tilawat",
    badgeBg: "bg-emerald-400 text-gray-950"
  },
  {
    id: "caption",
    categoryTag: "ডিজিটাল পোস্ট হাব",
    icon: "✍️",
    name: "ক্যাপশন",
    purpose: "ছবি বা পোস্টের জন্য সুন্দর ও উপযুক্ত ক্যাপশন তৈরি/খুঁজে পাওয়ার জন্য।",
    explanation: "ক্যাটাগরি অনুযায়ী ১-ক্লিকে ইসলামিক স্ট্যাটাস ও সামাজিক পোস্ট কপি করুন।",
    path: "/caption-ghor",
    badgeBg: "bg-amber-300 text-gray-950"
  },
  {
    id: "editing",
    categoryTag: "গ্রাফিক্স স্টুডিও",
    icon: "🎨",
    name: "এডিটিং টুলস",
    purpose: "ছবি ও প্রয়োজনীয় কনটেন্ট সহজে এডিট করার জন্য।",
    explanation: "গ্যালারির ফটোতে সুন্দর ফিল্টার, ইসলামিক ফ্রেম ও ক্যালিগ্রাফি যুক্ত করে সেভ করুন।",
    path: "/pixel-editing-tools",
    badgeBg: "bg-purple-300 text-gray-950"
  },
  {
    id: "matrimonial",
    categoryTag: "দ্বীনি ম্যাট্রিমনিয়াল",
    icon: "💍",
    name: "বিয়ের বায়োডাটা",
    purpose: "বিয়ের জন্য সুন্দর ও গোছানো বায়োডাটা তৈরির জন্য।",
    explanation: "সহজ ফর্মে তথ্য দিয়ে ১-ক্লিকে শরিয়াহ সম্মত পাত্র-পাত্রীর বায়োডাটা PDF পান।",
    path: "/matrimonial",
    badgeBg: "bg-rose-300 text-gray-950"
  },
  {
    id: "telecom",
    categoryTag: "টেলিকম ও ডাটা প্যাক",
    icon: "📱",
    name: "MB/মিনিট ক্রয়",
    purpose: "প্রয়োজনীয় ইন্টারনেট বা মিনিট প্যাক সহজে নির্বাচন ও ক্রয়ের জন্য।",
    explanation: "আপনার মোবাইল অপারেটর ও সেরা ডিসকাউন্ট অফার বেছে নিয়ে ইনস্ট্যান্ট রিচার্জ করুন।",
    path: "/telecom",
    badgeBg: "bg-cyan-300 text-gray-950"
  },
  {
    id: "reminder",
    categoryTag: "স্মার্ট অ্যালার্ম",
    icon: "⏰",
    name: "রিমাইন্ডার",
    purpose: "গুরুত্বপূর্ণ কাজ ও বিষয় সময়মতো মনে রাখার জন্য।",
    explanation: "সময় ও অ্যালার্ম নোট সেভ রাখুন, নির্দিষ্ট সময়ে অটো নোটিফিকেশন আসবে।",
    path: "/reminders",
    badgeBg: "bg-yellow-300 text-gray-950"
  },
  {
    id: "live_location",
    categoryTag: "জিও ট্র্যাকিং",
    icon: "📍",
    name: "লাইভ লোকেশন",
    purpose: "প্রয়োজনীয় লোকেশন সহজে দেখা ও শেয়ার করার জন্য।",
    explanation: "রিকুয়েস্ট শেয়ার করে ম্যাপে রিয়েল-টাইম গতি, অবস্থান ও দূরত্ব ট্র্যাক করুন।",
    path: "/live-location-sharing",
    badgeBg: "bg-teal-300 text-gray-950"
  },
  {
    id: "gov_services",
    categoryTag: "সরকারি তথ্য পোর্টাল",
    icon: "🏛️",
    name: "সরকারি সেবা",
    purpose: "প্রয়োজনীয় সরকারি সেবা ও তথ্য সহজে খুঁজে পাওয়ার জন্য।",
    explanation: "জাতীয় পরিচয়পত্র, ড্রাইভিং লাইসেন্স ও সরকারি পোর্টাল ১-ক্লিকে ব্যবহার করুন।",
    path: "/gov-services",
    badgeBg: "bg-[#ffcc00] text-gray-950"
  }
];

export const StorefrontFacade: React.FC = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [signboards, setSignboards] = useState<any[]>(() => getCachedSignboards());
  const [signboardVideoError, setSignboardVideoError] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Listen to Admin uploaded signboard videos
  useEffect(() => {
    const q = query(collection(db, "signboard_videos"), orderBy("order", "asc"));
    const unsub = onSnapshot(q, async (snapshot) => {
      const data = await Promise.all(snapshot.docs.map(async (docSnap) => {
        const item = docSnap.data();
        let resolvedVideoUrl = item.videoUrl || "";
        const vId = item.videoId || docSnap.id;

        if (vId) {
          const storedLocal = await getVideoFromDB(vId);
          if (storedLocal) {
            resolvedVideoUrl = storedLocal;
          }
        }

        if ((item.hasChunks || resolvedVideoUrl.startsWith("chunked:")) && (!resolvedVideoUrl || resolvedVideoUrl.startsWith("chunked:") || resolvedVideoUrl.startsWith("local_idb:"))) {
          const downloadedBlobUrl = await downloadAndReassembleVideo(vId);
          if (downloadedBlobUrl) {
            resolvedVideoUrl = downloadedBlobUrl;
            await saveVideoToDB(vId, downloadedBlobUrl);
          } else {
            resolvedVideoUrl = "";
          }
        } else if (resolvedVideoUrl.startsWith("local_idb:")) {
          resolvedVideoUrl = "";
        }

        return {
          id: docSnap.id,
          type: item.type || "video",
          videoUrl: resolvedVideoUrl,
          image: item.image || "",
          headline: item.headline || "",
          badgeText: item.badgeText || ""
        };
      })).then(items => items.filter(b => (b.videoUrl && !b.videoUrl.startsWith("local_idb:") && !b.videoUrl.startsWith("chunked:")) || b.image));

      if (data.length > 0) {
        setSignboards(data);
        try {
          localStorage.setItem(LOCAL_STORAGE_SIGNBOARD_KEY, JSON.stringify(data));
        } catch (e) {}
      } else {
        setSignboards([]);
      }
    }, () => {});

    return () => unsub();
  }, []);

  // Auto-advance through single showcase sections every 5.2 seconds
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SHOWCASE_ITEMS.length);
    }, 5200);
    return () => clearInterval(timer);
  }, [isPaused]);

  const activeSignboard = (signboards.length > 0 && !signboardVideoError) ? signboards[0] : null;
  const currentItem = SHOWCASE_ITEMS[currentIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + SHOWCASE_ITEMS.length) % SHOWCASE_ITEMS.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % SHOWCASE_ITEMS.length);
  };

  return (
    <div className="relative w-full overflow-hidden bg-[#01140c] select-none py-1 px-2 sm:px-3">
      
      {/* 
        SLIM DIGITAL INFORMATION DISPLAY PANEL
        Compact height, sleek layout, visually distinct Obsidian Blue + Gold Accent
      */}
      <div 
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative w-full min-h-[96px] sm:min-h-[105px] max-h-[115px] rounded-xl overflow-hidden shadow-[0_6px_25px_rgba(0,0,0,0.8),0_0_15px_rgba(255,204,0,0.18)] border-[1.5px] border-[#ffcc00]/80 bg-gradient-to-r from-[#090e1a] via-[#0f172a] to-[#080c18] text-white select-none transition-all flex flex-col justify-between"
      >
        {activeSignboard ? (
          /* Render Admin Uploaded Display Signboard Video */
          <div className="relative w-full h-full min-h-[96px] bg-black overflow-hidden flex items-center justify-center">
            {activeSignboard.type === "youtube" ? (
              (() => {
                const ytId = getYouTubeVideoId(activeSignboard.videoUrl || "");
                return ytId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&showinfo=0&rel=0&modestbranding=1&enablejsapi=1&playsinline=1`}
                    title="Signboard Video"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                    className="w-full h-[140%] -translate-y-[15%] object-cover border-0 pointer-events-none scale-125"
                  />
                ) : null;
              })()
            ) : activeSignboard.videoUrl ? (
              <video
                src={activeSignboard.videoUrl}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                onError={() => {
                  console.warn("Signboard video failed on device, falling back");
                  setSignboardVideoError(true);
                }}
                className="w-full h-full object-cover"
              />
            ) : (
              <img src={activeSignboard.image} alt="Signboard" className="w-full h-full object-cover" />
            )}

            {/* Headline Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 flex flex-col justify-between p-2 pointer-events-none">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-white bg-emerald-900/80 px-2 py-0.5 rounded border border-emerald-400/40">
                  {activeSignboard.headline || "Al Mayadin Bazar • অনলাইন শপ"}
                </span>
                {activeSignboard.badgeText && (
                  <span className="text-[8px] font-black bg-[#ffcc00] text-gray-950 px-2 py-0.5 rounded shadow">
                    {activeSignboard.badgeText}
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
        
        /* SLIM DIGITAL INFORMATION DISPLAY (HORIZONTAL SLIM BAR LAYOUT) */
        <div className="w-full h-full p-2 sm:p-2.5 flex flex-col justify-between relative overflow-hidden">
          
          {/* Top Compact Control Line */}
          <div className="relative z-10 flex items-center justify-between pb-1 border-b border-gray-800/60 leading-none">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffcc00] animate-ping" />
              <span className="font-black text-[8.5px] sm:text-[10px] text-amber-300 tracking-wider uppercase">
                DIGITAL INFORMATION DISPLAY
              </span>
            </div>

            {/* Counter Badge & Navigation Arrows */}
            <div className="flex items-center gap-1.5">
              <span className="text-[8px] sm:text-[9.5px] font-mono font-black text-amber-200 bg-amber-950/70 px-1.5 py-0.2 rounded border border-amber-500/20">
                {currentIndex + 1}/{SHOWCASE_ITEMS.length}
              </span>

              <div className="flex items-center gap-0.5">
                <button 
                  onClick={handlePrev}
                  className="p-0.5 rounded bg-gray-800/80 hover:bg-amber-400 hover:text-gray-950 text-gray-300 transition-all cursor-pointer"
                  title="পূর্ববর্তী"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <button 
                  onClick={handleNext}
                  className="p-0.5 rounded bg-gray-800/80 hover:bg-amber-400 hover:text-gray-950 text-gray-300 transition-all cursor-pointer"
                  title="পরবর্তী"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* MAIN SINGLE SECTION CONTENT (SLIM COMPACT INLINE LAYOUT) */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentItem.id}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              onClick={() => navigate(currentItem.path)}
              className="relative z-10 my-0.5 flex-1 flex items-center justify-between gap-2 cursor-pointer group"
            >
              {/* Left: Compact Icon Badge */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-b from-gray-800 to-gray-900 border border-amber-400/40 flex items-center justify-center shrink-0 shadow-md group-hover:border-amber-300 transition-all">
                <span className="text-xl sm:text-2xl filter drop-shadow">{currentItem.icon}</span>
              </div>

              {/* Middle: Content Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-[7.5px] sm:text-[8.5px] font-black px-1.5 py-0.2 rounded shadow-2xs uppercase tracking-wider ${currentItem.badgeBg}`}>
                    {currentItem.categoryTag}
                  </span>
                  <h3 className="text-xs sm:text-sm font-black text-white group-hover:text-amber-300 transition-colors truncate">
                    {currentItem.name}
                  </h3>
                </div>

                <p className="text-[9.5px] sm:text-[11px] font-bold text-amber-200 truncate mt-0.5 leading-tight">
                  {currentItem.purpose}
                </p>

                <p className="text-[8px] sm:text-[9.5px] font-medium text-gray-300 truncate mt-0.5">
                  💡 {currentItem.explanation}
                </p>
              </div>

              {/* Right: Compact Enter Button Badge */}
              <div className="shrink-0 flex items-center">
                <span className="px-2 py-1 rounded-lg bg-amber-400/20 hover:bg-amber-400 text-amber-300 hover:text-gray-950 font-black text-[8px] sm:text-[9.5px] border border-amber-400/40 transition-all flex items-center gap-1 shadow-sm">
                  <span>প্রবেশ</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Bottom Micro Dots Progress */}
          <div className="relative z-10 w-full flex items-center justify-center gap-1 pt-0.5">
            {SHOWCASE_ITEMS.map((item, idx) => (
              <span
                key={item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                  currentIndex === idx 
                    ? "w-4 bg-[#ffcc00] shadow-[0_0_6px_#ffcc00]" 
                    : "w-1 bg-gray-700 hover:bg-gray-500"
                }`}
              />
            ))}
          </div>

        </div>
        )}
      </div>
    </div>
  );
};

export default StorefrontFacade;
