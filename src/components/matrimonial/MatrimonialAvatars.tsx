import React from "react";
import { Lock, ShieldCheck, CheckCircle2 } from "lucide-react";

interface AvatarProps {
  className?: string;
  photoUrl?: string;
  isBlurred?: boolean;
}

export const GroomAvatarSVG: React.FC<AvatarProps> = ({ className = "w-28 h-28", photoUrl, isBlurred = true }) => {
  if (photoUrl && !isBlurred) {
    return (
      <div className={`relative rounded-full overflow-hidden border-2 border-cyan-400 shadow-md ${className}`}>
        <img src={photoUrl} alt="Groom" className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div className={`relative ${className} shrink-0`}>
      {/* Background Circle */}
      <div className="w-full h-full rounded-full bg-[#032b38] border-2 border-teal-500/40 p-1 flex items-center justify-center relative overflow-hidden shadow-inner">
        {/* Diamond Pattern Backdrop */}
        <svg className="absolute inset-0 w-full h-full opacity-20 text-teal-400" viewBox="0 0 100 100">
          <pattern id="groomGrid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 10 M 0 0 L 10 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
          <rect width="100" height="100" fill="url(#groomGrid)" />
        </svg>

        {/* Groom Vector Illustration */}
        <svg viewBox="0 0 120 120" className="w-full h-full relative z-10">
          {/* Islamic Cap (Topi) */}
          <ellipse cx="60" cy="38" rx="22" ry="12" fill="#ffffff" />
          <rect x="38" y="38" width="44" height="10" rx="3" fill="#e2e8f0" />
          <path d="M42 38 Q 60 22 78 38 Z" fill="#ffffff" />
          
          {/* Head & Face */}
          <path d="M40 45 C40 32 80 32 80 45 C80 65 72 75 60 75 C48 75 40 65 40 45 Z" fill="#f8fafc" />
          {/* Beard / Stubble */}
          <path d="M42 55 C42 74 78 74 78 55 C78 78 42 78 42 55 Z" fill="#1e293b" />
          {/* Eyes & Eyebrows */}
          <ellipse cx="50" cy="50" rx="2.5" ry="1.5" fill="#0f172a" />
          <ellipse cx="70" cy="50" rx="2.5" ry="1.5" fill="#0f172a" />
          <path d="M46 45 Q50 43 54 45" fill="none" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M66 45 Q70 43 74 45" fill="none" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
          
          {/* Shirt / Jubbah */}
          <path d="M25 110 C25 80 95 80 95 110 L95 120 L25 120 Z" fill="#0284c7" />
          {/* Collar */}
          <path d="M45 82 L60 95 L75 82 L60 88 Z" fill="#ffffff" />
        </svg>
      </div>

      {/* Floating Cyan Lock Badge */}
      <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-cyan-500 border-2 border-[#032b38] text-white flex items-center justify-center shadow-md z-20">
        <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
      </div>
    </div>
  );
};

export const BrideAvatarSVG: React.FC<AvatarProps> = ({ className = "w-28 h-28", photoUrl, isBlurred = true }) => {
  if (photoUrl && !isBlurred) {
    return (
      <div className={`relative rounded-full overflow-hidden border-2 border-rose-400 shadow-md ${className}`}>
        <img src={photoUrl} alt="Bride" className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div className={`relative ${className} shrink-0`}>
      {/* Background Circle */}
      <div className="w-full h-full rounded-full bg-[#2a0e2a] border-2 border-pink-500/40 p-1 flex items-center justify-center relative overflow-hidden shadow-inner">
        {/* Diamond Pattern Backdrop */}
        <svg className="absolute inset-0 w-full h-full opacity-20 text-pink-400" viewBox="0 0 100 100">
          <pattern id="brideGrid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 10 M 0 0 L 10 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
          <rect width="100" height="100" fill="url(#brideGrid)" />
        </svg>

        {/* Bride Hijab Vector Illustration */}
        <svg viewBox="0 0 120 120" className="w-full h-full relative z-10">
          {/* Outer Hijab/Khimar Cover */}
          <path d="M20 120 C20 40 100 40 100 120 Z" fill="#9f1239" />
          <path d="M30 45 C30 20 90 20 90 45 C90 85 85 110 60 110 C35 110 30 85 30 45 Z" fill="#be123c" />
          
          {/* Inner Cap / Band */}
          <path d="M42 38 Q 60 28 78 38 L 80 44 Q 60 34 40 44 Z" fill="#fb7185" />

          {/* Face Area / Niqab Trim */}
          <path d="M42 42 C42 35 78 35 78 42 C78 62 72 65 60 65 C48 65 42 62 42 42 Z" fill="#fff1f2" />

          {/* Eyes & Eyebrows */}
          <ellipse cx="50" cy="48" rx="2.5" ry="1.5" fill="#4c0519" />
          <ellipse cx="70" cy="48" rx="2.5" ry="1.5" fill="#4c0519" />
          <path d="M46 43 Q50 41 54 43" fill="none" stroke="#4c0519" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M66 43 Q70 41 74 43" fill="none" stroke="#4c0519" strokeWidth="1.5" strokeLinecap="round" />

          {/* Lower Niqab Veil */}
          <path d="M38 54 Q60 52 82 54 L85 105 Q60 115 35 105 Z" fill="#9f1239" />
        </svg>
      </div>

      {/* Floating Rose/Pink Lock Badge */}
      <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-rose-500 border-2 border-[#2a0e2a] text-white flex items-center justify-center shadow-md z-20">
        <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
      </div>
    </div>
  );
};
