import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import alMayadinHdBanner from "../assets/images/almayadin_hd_banner_1790404511624.jpg";

const DEFAULT_BANNERS = [
  alMayadinHdBanner,
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=85",
  "https://images.unsplash.com/photo-1470309864661-68328b2cd0a5?w=1200&q=85"
];

export const DynamicBannerSlider: React.FC = () => {
  const [activeBanner, setActiveBanner] = useState(0);
  const [banners, setBanners] = useState<string[]>(DEFAULT_BANNERS);

  useEffect(() => {
    const q = query(collection(db, "main_banners"), orderBy("order", "asc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data().image).filter(Boolean);
      if (data.length > 0) {
        setBanners(data);
      } else {
        setBanners(DEFAULT_BANNERS);
      }
    }, (error) => {
      console.warn("Main banner fetch notice:", error);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => {
      setActiveBanner(prev => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <div className="px-4 mt-4">
      <div className="relative aspect-[18/9] sm:aspect-[2.2/1] min-h-[165px] sm:min-h-[210px] rounded-2xl overflow-hidden shadow-md group bg-[#021f14]">
        {banners.map((banner, idx) => (
          <motion.div
            key={idx}
            className="absolute inset-0 w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: activeBanner === idx ? 1 : 0 }}
            transition={{ duration: 0.7 }}
            style={{ pointerEvents: activeBanner === idx ? "auto" : "none" }}
          >
            {/* Background Image */}
            <img
              src={idx === 0 ? alMayadinHdBanner : banner}
              alt={`Banner ${idx + 1}`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-right sm:object-center"
            />

            {/* For Al Mayadin Hero Banner (Slide 1): Razor-sharp Vector Typography & Badges Overlay */}
            {idx === 0 ? (
              <div className="absolute inset-0 bg-gradient-to-r from-[#021f14]/90 via-[#021f14]/50 to-transparent flex flex-col justify-between p-3.5 sm:p-5 text-white select-none">
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

                {/* Headline & Badges */}
                <div className="max-w-[72%] sm:max-w-[65%] space-y-1 sm:space-y-1.5 my-auto">
                  <h2 className="text-[13px] sm:text-[18px] md:text-[21px] font-black text-white leading-tight drop-shadow-md">
                    আধুনিক প্রযুক্তিতে ইসলামি জীবনযাত্রা ও ডিজিটাল সেবা
                  </h2>
                  <p className="text-[8px] sm:text-[11px] font-semibold text-emerald-200/90 hidden xs:block leading-snug">
                    স্মার্ট প্রযুক্তি • বিশ্বস্ত সেবা • হালাল কমার্স
                  </p>
                </div>

                {/* Bottom Tagline */}
                <div className="text-[7.5px] sm:text-[9.5px] font-medium text-emerald-200/90 italic drop-shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ffcc00]" />
                  Al Mayadin — আপনার বিশ্বস্ত ডিজিটাল ইসলামিক প্ল্যাটফর্ম
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
            )}
          </motion.div>
        ))}
        
        {/* Dots */}
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
      </div>
    </div>
  );
};
