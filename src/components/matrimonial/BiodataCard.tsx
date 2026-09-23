import React from "react";
import { 
  MapPin, 
  Briefcase, 
  Lock, 
  Bookmark, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight,
  Eye,
  UserCheck
} from "lucide-react";
import { Biodata } from "../../types/matrimonial";
import { GroomAvatarSVG, BrideAvatarSVG } from "./MatrimonialAvatars";

interface BiodataCardProps {
  biodata: Biodata;
  onViewDetails: (biodata: Biodata) => void;
  onRequestContact: (biodata: Biodata) => void;
  isBookmarked: boolean;
  onToggleBookmark: (biodataId: string) => void;
}

export const BiodataCard: React.FC<BiodataCardProps> = ({
  biodata,
  onViewDetails,
  onRequestContact,
  isBookmarked,
  onToggleBookmark
}) => {
  const isGroom = biodata.gender === "groom";

  // Display Name: Show first name or Ahmad/Mahi style + Age
  const displayName = biodata.fullName ? biodata.fullName.split(" ")[0] : (isGroom ? "আহমদ" : "নুসরাত");

  return (
    <div 
      onClick={() => onViewDetails(biodata)}
      className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/90 shadow-2xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer group"
    >
      {/* 1. TOP PATTERN BANNER WITH AVATAR */}
      <div className={`relative p-2 sm:p-3 pb-3 sm:pb-4 flex flex-col items-center justify-between min-h-[190px] sm:min-h-[240px] ${
        isGroom 
          ? 'bg-gradient-to-b from-[#062c38] via-[#093a4a] to-[#04222c]' 
          : 'bg-gradient-to-b from-[#2e092e] via-[#420f42] to-[#210521]'
      }`}>
        
        {/* Diamond Geometric Overlay */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <svg className="w-full h-full text-white" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id={`cardPattern-${biodata.id}`} width="12" height="12" patternUnits="userSpaceOnUse">
              <path d="M 12 0 L 0 12 M 0 0 L 12 12" fill="none" stroke="currentColor" strokeWidth="0.6" />
            </pattern>
            <rect width="100%" height="100%" fill={`url(#cardPattern-${biodata.id})`} />
          </svg>
        </div>

        {/* Top Badges Row */}
        <div className="w-full flex items-center justify-between gap-1 relative z-10 mb-1.5">
          {/* Candidate Badge */}
          <span className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-[11px] font-black uppercase tracking-tight flex items-center gap-0.5 sm:gap-1 shadow-2xs truncate ${
            isGroom 
              ? 'bg-[#08485c] text-teal-200 border border-teal-500/30' 
              : 'bg-[#501352] text-pink-200 border border-pink-500/30'
          }`}>
            <span>{isGroom ? "👨‍💼 পাত্রের বায়োডাটা" : "🧕 পাত্রীর বায়োডাটা"}</span>
          </span>

          {/* Shariah Purdah Shield Badge */}
          <span className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 bg-[#053d26]/90 text-emerald-300 border border-emerald-500/40 rounded-full text-[8px] sm:text-[11px] font-bold flex items-center gap-0.5 sm:gap-1 shadow-2xs shrink-0">
            <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400 shrink-0" />
            <span>পর্দা সুরক্ষিত ✓</span>
          </span>
        </div>

        {/* Center Vector Avatar */}
        <div className="relative z-10 my-0.5">
          {isGroom ? (
            <GroomAvatarSVG className="w-20 h-20 sm:w-28 sm:h-28" photoUrl={biodata.photoUrl} isBlurred={biodata.photoBlurred} />
          ) : (
            <BrideAvatarSVG className="w-20 h-20 sm:w-28 sm:h-28" photoUrl={biodata.photoUrl} isBlurred={biodata.photoBlurred} />
          )}
        </div>

        {/* Overlay Dark Box at Bottom of Image */}
        <div className="w-full bg-black/60 backdrop-blur-md rounded-xl sm:rounded-2xl p-1.5 sm:p-2 text-center text-white border border-white/10 relative z-10 mt-1 shadow-inner">
          <p className="text-[9px] sm:text-xs font-black tracking-wide text-white flex items-center justify-center gap-0.5">
            <span>{isGroom ? "পাত্রের ছবি ব্যক্তিগত" : "পাত্রীর ছবি ব্যক্তিগত"}</span>
          </p>
          <p className="text-[7.5px] sm:text-[10px] text-gray-300/90 mt-0.5 flex items-center justify-center gap-0.5 font-medium leading-tight">
            <Lock className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-amber-300 shrink-0" />
            <span>বায়োডাটা মালিকের অনুমতি সাপেক্ষে দৃশ্যমান</span>
          </p>
        </div>
      </div>

      {/* 2. CARD CONTENT (DETAILS) */}
      <div className="p-2.5 sm:p-4 space-y-2 flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          {/* Name, Age & Verified Badge */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="text-xs sm:text-base font-black text-gray-900 tracking-tight">
              {displayName}, {biodata.age}
            </h3>

            {biodata.isVerified && (
              <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-md text-[8px] sm:text-[10px] font-black flex items-center gap-0.5">
                <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-600" />
                <span>Verified</span>
              </span>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-600 font-medium">
            <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
            <span className="truncate">{biodata.presentDistrict || biodata.permanentDistrict || "বাংলাদেশ"}</span>
          </div>

          {/* Occupation */}
          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-700 font-bold">
            <Briefcase className="w-3 h-3 text-teal-600 shrink-0" />
            <span className="truncate">{biodata.occupation || "শিক্ষার্থী"}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-1.5 pt-1">
          {/* Full Width Lock Request Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRequestContact(biodata);
            }}
            className="w-full py-1.5 px-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-[9px] sm:text-xs font-bold border border-slate-200/80 transition flex items-center justify-center gap-1 active:scale-98"
          >
            <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-500 shrink-0" />
            <span className="truncate">নম্বর ও ছবি দেখতে অনুরোধ পাঠান</span>
          </button>

          {/* Profile View & Bookmark Row */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(biodata);
              }}
              className="flex-1 py-1.5 sm:py-2 px-2 bg-emerald-100/80 hover:bg-emerald-200/90 active:scale-98 text-emerald-950 rounded-xl text-[10px] sm:text-xs font-black transition flex items-center justify-center text-center"
            >
              <span>প্রোফাইল দেখুন</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(biodata.id);
              }}
              className={`w-7 h-7 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center transition active:scale-95 shrink-0 ${
                isBookmarked 
                  ? 'bg-rose-50 border-rose-200 text-rose-600' 
                  : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'
              }`}
              title={isBookmarked ? "বুকমার্ক থেকে সরান" : "বুকমার্ক করুন"}
            >
              <Bookmark className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isBookmarked ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
