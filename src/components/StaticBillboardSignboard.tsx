import React from "react";
import billboardImage from "../assets/images/billboard_mockup_1790404511624.jpg"; // Fallback or we can use an absolute cinematic URL

export const StaticBillboardSignboard: React.FC = () => {
  return (
    <div className="px-4 mt-3">
      {/* Cinematic Billboard Signboard Stand Mockup matching the exact reference image */}
      <div className="relative w-full rounded-[20px] overflow-hidden shadow-2xl border-[3px] border-[#1b2e23] bg-black group select-none">
        <img
          src="https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1200&q=85"
          alt="Outdoor Billboard Signboard"
          className="w-full aspect-[16/9] sm:aspect-[2.2/1] object-cover object-center brightness-90 group-hover:scale-105 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        
        {/* Cinematic Light Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
        
        {/* Bottom Tagline on Signboard */}
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white z-10">
          <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-[10px] sm:text-xs font-black tracking-wide text-amber-300">
            🌟 আল মায়াদিন বাজার — বিশ্বস্ত ডিজিটাল সুপার শপ
          </div>
        </div>
      </div>
    </div>
  );
};
