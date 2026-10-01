import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import alMayadinHdBanner from "../assets/images/almayadin_hd_banner_1790404511624.jpg";
import { getVideoFromDB } from "../lib/videoStorage";

export interface MainBannerItem {
  id?: string;
  type?: "image" | "youtube" | "video";
  image?: string;
  videoUrl?: string;
  title?: string;
  subtitle?: string;
  order?: number;
}

const DEFAULT_BANNERS: MainBannerItem[] = [
  {
    id: "default-1",
    type: "image",
    image: "/app_icon.png",
    title: "BINISTA",
    subtitle: "আধুনিক ডিজিটাল সেবা ও রিয়েল-টাইম কমিউনিটি"
  },
  {
    id: "default-2",
    type: "image",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=85",
    title: "স্মার্ট প্রযুক্তি ও সেবা"
  },
  {
    id: "default-3",
    type: "image",
    image: "https://images.unsplash.com/photo-1470309864661-68328b2cd0a5?w=1200&q=85",
    title: "বিশ্বস্ত ডিজিটাল প্ল্যাটফর্ম"
  }
];

const LOCAL_STORAGE_KEY = "almayadin_main_banners_cache_v2";

/** Helper to extract YouTube Video ID from various link formats */
export const getYouTubeVideoId = (url: string = "") => {
  if (!url) return "";
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
  const match = url.trim().match(regExp);
  return (match && match[2] && match[2].length === 11) ? match[2] : "";
};

/** Synchronous local cache loader to ensure instant 0ms rendering when user opens the app */
const getCachedBanners = (): MainBannerItem[] => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn("Main banner cache read notice:", e);
  }
  return DEFAULT_BANNERS;
};

export const DynamicBannerSlider: React.FC = () => {
  const [activeBanner, setActiveBanner] = useState(0);
  const [videoErrors, setVideoErrors] = useState<Record<string, boolean>>({});

  // Synchronous initialization from localStorage for 100% instant load on app start
  const [banners, setBanners] = useState<MainBannerItem[]>(() => getCachedBanners());

  useEffect(() => {
    const q = query(collection(db, "main_banners"), orderBy("order", "asc"));
    const unsub = onSnapshot(q, async (snapshot) => {
      const data = await Promise.all(snapshot.docs.map(async (docSnap) => {
        const item = docSnap.data();
        let resolvedVideoUrl = item.videoUrl || "";

        if (resolvedVideoUrl.startsWith("local_idb:")) {
          const videoId = resolvedVideoUrl.replace("local_idb:", "");
          const stored = await getVideoFromDB(videoId);
          if (stored) {
            resolvedVideoUrl = stored;
          } else {
            resolvedVideoUrl = ""; // Reset invalid local IDB string so video doesn't break
          }
        }

        return {
          id: docSnap.id,
          type: item.type || (resolvedVideoUrl ? (resolvedVideoUrl.includes("youtube") || resolvedVideoUrl.includes("youtu.be") ? "youtube" : "video") : "image"),
          image: item.image,
          videoUrl: resolvedVideoUrl,
          title: item.title,
          subtitle: item.subtitle,
          order: item.order
        } as MainBannerItem;
      })).then(items => items.filter(b => b.image || (b.videoUrl && !b.videoUrl.startsWith("local_idb:"))));

      if (data.length > 0) {
        setBanners(data);
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
          console.warn("Failed to update banner cache:", e);
        }
      } else {
        setBanners(DEFAULT_BANNERS);
      }
    }, (error) => {
      console.warn("Main banner fetch notice:", error);
    });

    return () => unsub();
  }, []);

  // Auto-rotate slides (longer interval if video is playing)
  useEffect(() => {
    if (banners.length <= 1) return;
    const currentBanner = banners[activeBanner];
    const duration = currentBanner?.type === "youtube" || currentBanner?.type === "video" ? 12000 : 5000;

    const timer = setInterval(() => {
      setActiveBanner(prev => (prev + 1) % banners.length);
    }, duration);

    return () => clearInterval(timer);
  }, [banners, activeBanner]);

  return (
    <div className="px-4 mt-4">
      <div className="relative aspect-[18/9] sm:aspect-[2.2/1] min-h-[165px] sm:min-h-[210px] rounded-2xl overflow-hidden shadow-md group bg-[#021f14]">
        {banners.map((banner, idx) => {
          const isActive = activeBanner === idx;
          const isYouTube = banner.type === "youtube" || (banner.videoUrl && (banner.videoUrl.includes("youtube") || banner.videoUrl.includes("youtu.be")));
          const isDirectVideo = banner.type === "video" || (banner.videoUrl && banner.videoUrl.endsWith(".mp4"));
          const ytVideoId = isYouTube ? getYouTubeVideoId(banner.videoUrl || banner.image || "") : "";

          return (
            <motion.div
              key={banner.id || idx}
              className="absolute inset-0 w-full h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: isActive ? 1 : 0 }}
              transition={{ duration: 0.6 }}
              style={{ pointerEvents: isActive ? "auto" : "none" }}
            >
              {/* Media Element: YouTube Embed */}
              {isYouTube && ytVideoId ? (
                <div className="relative w-full h-full overflow-hidden bg-black flex items-center justify-center">
                  <iframe
                    src={`https://www.youtube.com/embed/${ytVideoId}?autoplay=1&mute=1&loop=1&playlist=${ytVideoId}&controls=0&showinfo=0&rel=0&modestbranding=1&enablejsapi=1&playsinline=1`}
                    title={banner.title || "Header Video"}
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                    className="w-full h-[140%] -translate-y-[15%] object-cover border-0 pointer-events-none scale-125 sm:scale-110"
                  />
                  {/* Subtle dark gradient for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
                </div>
              ) : isDirectVideo && banner.videoUrl && !videoErrors[banner.id || idx] ? (
                /* Media Element: Direct MP4 Video */
                <div className="relative w-full h-full overflow-hidden bg-black">
                  <video
                    src={banner.videoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    onError={() => {
                      console.warn("Video playback error on device, gracefully falling back to banner image");
                      setVideoErrors(prev => ({ ...prev, [banner.id || idx]: true }));
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
                </div>
              ) : (
                /* Media Element: Image Banner */
                <img
                  src={idx === 0 && !banner.image?.startsWith("http") ? alMayadinHdBanner : (banner.image || alMayadinHdBanner)}
                  alt={`Banner ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-right sm:object-center"
                />
              )}

              {/* Overlay Content */}
              {idx === 0 && (!banner.type || banner.type === "image") ? (
                <div className="absolute inset-0 bg-gradient-to-r from-[#021f14]/90 via-[#021f14]/50 to-transparent flex flex-col justify-between p-3.5 sm:p-5 text-white select-none pointer-events-none">
                  {/* Brand Header */}
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-emerald-700/90 border border-emerald-400/50 flex items-center justify-center shadow-sm">
                      <span className="text-[#ffcc00] font-black text-xs">🌙</span>
                    </div>
                    <div className="leading-tight">
                      <span className="font-black text-[13px] sm:text-[17px] text-white tracking-tight block">
                        Al Mayadin
                      </span>
                      <span className="text-[7px] sm:text-[9px] font-black text-emerald-300 tracking-[0.22em] uppercase block">
                        SOFTWARE
                      </span>
                    </div>
                  </div>

                  {/* Headline */}
                  <div className="max-w-[72%] sm:max-w-[65%] space-y-1 sm:space-y-1.5 my-auto">
                    <h2 className="text-[13px] sm:text-[18px] md:text-[21px] font-black text-white leading-tight drop-shadow-md">
                      {banner.title || "আধুনিক প্রযুক্তিতে ইসলামি জীবনযাত্রা ও ডিজিটাল সেবা"}
                    </h2>
                    <p className="text-[8px] sm:text-[11px] font-semibold text-emerald-200/90 hidden xs:block leading-snug">
                      {banner.subtitle || "স্মার্ট প্রযুক্তি • বিশ্বস্ত সেবা • হালাল কমার্স"}
                    </p>
                  </div>

                  {/* Bottom Tagline */}
                  <div className="text-[7.5px] sm:text-[9.5px] font-medium text-emerald-200/90 italic drop-shadow-sm flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ffcc00]" />
                    Al Mayadin — আপনার বিশ্বস্ত ডিজিটাল ইসলামিক প্ল্যাটফর্ম
                  </div>
                </div>
              ) : banner.title || banner.subtitle ? (
                <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-xs p-3 rounded-xl border border-white/10 text-white pointer-events-none">
                  {banner.title && <h3 className="font-black text-sm text-white drop-shadow-sm">{banner.title}</h3>}
                  {banner.subtitle && <p className="text-xs text-gray-200 drop-shadow-xs">{banner.subtitle}</p>}
                </div>
              ) : null}
            </motion.div>
          );
        })}

        {/* Carousel Pagination Dots */}
        {banners.length > 1 && (
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
            {banners.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveBanner(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${activeBanner === idx ? "w-6 bg-[#ffb703] shadow-sm" : "w-1.5 bg-white/60 hover:bg-white"}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
