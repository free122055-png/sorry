import React from "react";
import { Link } from "react-router-dom";

export const AnimatedBrandLogo: React.FC<{ isCompact?: boolean }> = ({ isCompact = false }) => {
  return (
    <Link 
      to="/" 
      className={`flex items-center gap-2.5 group transition-all duration-300 select-none ${
        isCompact ? "scale-90" : ""
      }`}
      title="BINISTA"
    >
      <img 
        src="/app_icon.png" 
        alt="BINISTA" 
        className={`${isCompact ? "w-8 h-8" : "w-10 h-10"} rounded-2xl object-cover ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform`} 
      />
      <div className="flex flex-col">
        <span className={`${isCompact ? "text-lg" : "text-xl sm:text-2xl"} font-black tracking-tight text-white leading-none`}>
          BINISTA
        </span>
        <span className="text-[9px] sm:text-[10px] font-bold text-emerald-400 tracking-[0.25em] uppercase mt-1">
          Live Chat & Community
        </span>
      </div>
    </Link>
  );
};
export default AnimatedBrandLogo;
