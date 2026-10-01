import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

interface BrandVariant {
  top: string;
  main: string;
  sub: string;
}

const VARIANTS: BrandVariant[] = [
  { top: "সেরা", main: "Al Mayadin Bazar", sub: "সুপারশপ" },
  { top: "সেরা", main: "আল মায়াদীন বাজার", sub: "সুপারশপ" },
  { top: "সেরা", main: "Al-Mayadin Bazar", sub: "অনলাইন শপ" },
  { top: "সেরা", main: "Al Mayadin Bazar", sub: "গ্রোসারি" },
];

export const AnimatedBrandLogo: React.FC<{ isCompact?: boolean }> = ({ isCompact = false }) => {
  const [variantIndex, setVariantIndex] = useState(0);
  const currentVariant = VARIANTS[variantIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      setVariantIndex((prev) => (prev + 1) % VARIANTS.length);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  return (
    <Link 
      to="/" 
      className={`flex flex-col items-center group transition-all duration-300 select-none ${
        isCompact ? "scale-90" : ""
      }`}
      title="Al Mayadin Bazar"
    >
      {/* Top Tag: সেরা + Shopping Bag Icon */}
      <div className="flex items-center gap-1 mb-[-2px]">
        <span className="text-[10px] sm:text-[11px] font-black tracking-[0.22em] text-white/95 uppercase transition-all duration-300">
          {currentVariant.top}
        </span>
        <div className="bg-[#ffb703] p-0.5 rounded-[4px] shadow-xs flex items-center justify-center">
          <svg 
            width="12" 
            height="12" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="#000" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
            <path d="M3 6h18"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
        </div>
      </div>

      {/* Main Brand Name (Steady, clean, professional full name without typewriter cutoff) */}
      <div className="flex items-center justify-center min-h-[28px] sm:min-h-[32px]">
        <span 
          className={`${
            isCompact ? "text-[17px]" : "text-[19px] sm:text-[22px]"
          } font-black tracking-tight leading-tight text-white transition-all duration-500 drop-shadow-xs whitespace-nowrap`}
        >
          {currentVariant.main}
        </span>
      </div>

      {/* Subtitle */}
      <div className="min-h-[14px] flex items-center justify-center">
        <span className="text-[10px] sm:text-[11px] font-black text-[#ffb703] tracking-[0.45em] uppercase leading-none transition-all duration-300">
          {currentVariant.sub}
        </span>
      </div>
    </Link>
  );
};
export default AnimatedBrandLogo;
