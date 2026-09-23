import React, { useState } from "react";
import { 
  X, 
  ArrowLeft,
  User, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  Users, 
  BookOpen, 
  Sparkles, 
  ShieldCheck, 
  Send, 
  CheckCircle2, 
  Lock,
  Bookmark,
  Share2,
  Calendar,
  Ruler,
  Building,
  Droplet,
  Palette,
  Heart,
  Cigarette,
  Wine,
  Utensils,
  Activity
} from "lucide-react";
import { Biodata } from "../../types/matrimonial";
import { GroomAvatarSVG, BrideAvatarSVG } from "./MatrimonialAvatars";

interface BiodataDetailsModalProps {
  biodata: Biodata | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestContact: (biodata: Biodata) => void;
  approvedContactPhone?: string | null;
}

type MainTab = "biodata" | "family" | "education";

export const BiodataDetailsModal: React.FC<BiodataDetailsModalProps> = ({
  biodata,
  isOpen,
  onClose,
  onRequestContact,
  approvedContactPhone
}) => {
  const [activeTab, setActiveTab] = useState<MainTab>("biodata");
  const [isBookmarked, setIsBookmarked] = useState(false);

  if (!isOpen || !biodata) return null;

  const isGroom = biodata.gender === "groom";
  const displayName = biodata.fullName ? biodata.fullName.split(" ")[0] : (isGroom ? "আহমদ" : "মাহিন");

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `বায়োডাটা - ${biodata.biodataCode}`,
        text: `${biodata.biodataCode} (${biodata.maritalStatus}, ${biodata.age} বছর, ${biodata.presentDistrict})`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("বায়োডাটা লিঙ্ক কপি করা হয়েছে!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[9999] flex items-center justify-center p-0 sm:p-4 overflow-y-auto">
      
      <div className="bg-white w-full max-w-2xl rounded-none sm:rounded-3xl shadow-2xl flex flex-col h-full sm:h-auto sm:max-h-[92vh] overflow-hidden animate-fadeIn">
        
        {/* 1. TOP NAVBAR HEADER */}
        <div className="bg-white border-b border-gray-100 px-4 py-3.5 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-base font-black text-gray-900">
              প্রোফাইল বিস্তারিত
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
                isBookmarked ? 'bg-rose-50 text-rose-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-rose-500' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* SCROLLABLE BODY CONTENT */}
        <div className="flex-1 overflow-y-auto space-y-4 pb-24">
          
          {/* 2. COVER BANNER & AVATAR HEADER */}
          <div className="relative">
            {/* Green Wave Gradient Header */}
            <div className={`h-36 sm:h-40 w-full relative overflow-hidden ${
              isGroom 
                ? 'bg-gradient-to-br from-[#063b28] via-[#0b5c40] to-[#04281c]' 
                : 'bg-gradient-to-br from-[#3b0638] via-[#5c0b57] to-[#280426]'
            }`}>
              {/* Pattern */}
              <div className="absolute inset-0 opacity-15">
                <svg className="w-full h-full text-white" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <pattern id="modalCoverPattern" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 10 M 0 0 L 10 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#modalCoverPattern)" />
                </svg>
              </div>

              {/* Verified Pill Badge at Top Left */}
              {biodata.isVerified && (
                <div className="absolute top-3 left-4 bg-emerald-950/80 backdrop-blur-md text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified</span>
                </div>
              )}
            </div>

            {/* Overlapping Avatar Circle */}
            <div className="flex flex-col items-center -mt-16 sm:-mt-20 relative z-10 px-4">
              {isGroom ? (
                <GroomAvatarSVG className="w-28 h-28 sm:w-32 sm:h-32" photoUrl={biodata.photoUrl} isBlurred={biodata.photoBlurred} />
              ) : (
                <BrideAvatarSVG className="w-28 h-28 sm:w-32 sm:h-32" photoUrl={biodata.photoUrl} isBlurred={biodata.photoBlurred} />
              )}

              {/* Name & Age Title */}
              <div className="text-center mt-2 space-y-0.5">
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center justify-center gap-1.5">
                  <span>{displayName}, {biodata.age}</span>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 font-bold">
                  {biodata.age} বছর • {biodata.presentDistrict || biodata.permanentDistrict || "বাংলাদেশ"}
                </p>
              </div>
            </div>
          </div>

          {/* 3. PROTECTED PRIVACY NOTICE CARD */}
          <div className="px-4">
            <div className="bg-[#f0fdf4] border border-emerald-200/90 rounded-2xl p-3.5 text-emerald-900 flex items-start gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300/80 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-black text-emerald-950">
                  ব্যক্তিগত তথ্য সুরক্ষিত
                </h4>
                <p className="text-[11px] sm:text-xs text-emerald-800 leading-relaxed font-medium">
                  ছবি, পূর্ণ নাম এবং ফোন নম্বর গোপন রাখা হয়েছে। পরিবারের সাথে যোগাযোগের অনুরোধ পাঠালে অনুমোদনের পর দেখতে পাবেন।
                </p>
              </div>
            </div>
          </div>

          {/* 4. MAIN TABS BAR */}
          <div className="px-4">
            <div className="bg-gray-100/90 p-1 rounded-2xl flex items-center gap-1 border border-gray-200/80">
              <button
                onClick={() => setActiveTab("biodata")}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition ${
                  activeTab === "biodata" ? "bg-[#053d26] text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                বায়োডাটা
              </button>
              <button
                onClick={() => setActiveTab("family")}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition ${
                  activeTab === "family" ? "bg-[#053d26] text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                পরিবার
              </button>
              <button
                onClick={() => setActiveTab("education")}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition ${
                  activeTab === "education" ? "bg-[#053d26] text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                শিক্ষা ও পেশা
              </button>
            </div>
          </div>

          {/* 5. TAB CONTENTS */}
          <div className="px-4 space-y-5">
            
            {/* TAB: BIODATA (ব্যক্তিগত তথ্য) */}
            {activeTab === "biodata" && (
              <div className="space-y-4">
                
                {/* SECTION 1: ব্যক্তিগত তথ্য */}
                <div className="space-y-2.5">
                  <h3 className="text-xs sm:text-sm font-black text-gray-900 flex items-center gap-1.5 uppercase tracking-wide">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>ব্যক্তিগত তথ্য</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-2.5">
                    <DetailBox icon={<Calendar className="w-4 h-4 text-emerald-700" />} label="বয়স" value={`${biodata.age} বছর`} />
                    <DetailBox icon={<Ruler className="w-4 h-4 text-emerald-700" />} label="উচ্চতা" value={biodata.height || "৫ ফুট ২ ইঞ্চি"} />
                    <DetailBox icon={<User className="w-4 h-4 text-emerald-700" />} label="বৈবাহিক অবস্থা" value={biodata.maritalStatus || "অবিবাহিত"} />
                    <DetailBox icon={<MapPin className="w-4 h-4 text-emerald-700" />} label="জেলা" value={biodata.permanentDistrict || biodata.presentDistrict || "রাজশাহী"} />
                    <DetailBox icon={<Building className="w-4 h-4 text-emerald-700" />} label="বর্তমান ঠিকানা" value={biodata.presentAddress || `${biodata.presentDistrict}`} />
                    <DetailBox icon={<Droplet className="w-4 h-4 text-rose-600" />} label="রক্তের গ্রুপ" value={biodata.bloodGroup || "AB+"} />
                    <DetailBox icon={<Palette className="w-4 h-4 text-amber-600" />} label="গায়ের রং" value={biodata.complexion || "উজ্জ্বল ফর্সা"} />
                    <DetailBox icon={<BookOpen className="w-4 h-4 text-emerald-700" />} label="ধর্ম" value="ইসলাম" />
                  </div>
                </div>

                {/* SECTION 2: ব্যক্তিগত তথ্য (আরও) */}
                <div className="space-y-2.5 pt-2">
                  <h3 className="text-xs sm:text-sm font-black text-gray-900 flex items-center gap-1.5 uppercase tracking-wide">
                    <User className="w-4 h-4 text-emerald-600" />
                    <span>ব্যক্তিগত তথ্য (আরও)</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-2.5">
                    <DetailBox icon={<Cigarette className="w-4 h-4 text-gray-500" />} label="ধুমপান অভ্যাস" value="না" />
                    <DetailBox icon={<Wine className="w-4 h-4 text-gray-500" />} label="মদপান অভ্যাস" value="না" />
                    <DetailBox icon={<Utensils className="w-4 h-4 text-emerald-700" />} label="খাবার অভ্যাস" value="যেকোনো (হালাল)" />
                    <DetailBox icon={<Activity className="w-4 h-4 text-teal-600" />} label="ব্যায়াম অভ্যাস" value="নিয়মিত" />
                  </div>
                </div>

                {/* SECTION 3: দ্বীনি বৈশিষ্ট্য */}
                <div className="space-y-2.5 pt-2">
                  <h3 className="text-xs sm:text-sm font-black text-gray-900 flex items-center gap-1.5 uppercase tracking-wide">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    <span>দ্বীনি বৈশিষ্ট্য ও আমল</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <DetailBox icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />} label="সালাত নিয়মিত পালন" value={biodata.salahRegularity || "৫ ওয়াক্ত নিয়মিত"} />
                    <DetailBox icon={<ShieldCheck className="w-4 h-4 text-emerald-600" />} label="পর্দা / দাড়ি" value={biodata.hijabOrBeard || (isGroom ? "সুন্নতি দাড়ি" : "শারীয়াহ সম্মত পর্দা/নিকাব")} />
                    <DetailBox icon={<BookOpen className="w-4 h-4 text-emerald-600" />} label="কুরআন তিলাওয়াত" value={biodata.quranRecitation || "সহিহভাবে প্রতিদিন তিলাওয়াত"} />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: FAMILY (পরিবার) */}
            {activeTab === "family" && (
              <div className="space-y-3">
                <h3 className="text-xs sm:text-sm font-black text-gray-900 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>পারিবারিক বিবরণ</span>
                </h3>

                <div className="grid grid-cols-2 gap-2.5">
                  <DetailBox icon={<User className="w-4 h-4 text-gray-600" />} label="পিতার পেশা" value={biodata.fatherOccupation || "ব্যবসায়ী"} />
                  <DetailBox icon={<User className="w-4 h-4 text-gray-600" />} label="মাতার পেশা" value={biodata.motherOccupation || "গৃহিণী"} />
                  <DetailBox icon={<Users className="w-4 h-4 text-gray-600" />} label="ভাইয়ের সংখ্যা" value={`${biodata.brothersCount || 1} জন`} />
                  <DetailBox icon={<Users className="w-4 h-4 text-gray-600" />} label="বোনের সংখ্যা" value={`${biodata.sistersCount || 1} জন`} />
                </div>

                {biodata.familyDetails && (
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3.5 text-xs text-gray-800 space-y-1">
                    <span className="font-black text-gray-900">পরিবারের বিস্তারিত:</span>
                    <p className="leading-relaxed text-gray-700">{biodata.familyDetails}</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB: EDUCATION & OCCUPATION (শিক্ষা ও পেশা) */}
            {activeTab === "education" && (
              <div className="space-y-3">
                <h3 className="text-xs sm:text-sm font-black text-gray-900 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-emerald-600" />
                  <span>শিক্ষা ও পেশাগত তথ্য</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <DetailBox icon={<GraduationCap className="w-4 h-4 text-emerald-700" />} label="শিক্ষা মাধ্যম" value={biodata.educationMethod || "সাধারণ শিক্ষা"} />
                  <DetailBox icon={<GraduationCap className="w-4 h-4 text-emerald-700" />} label="সর্বোচ্চ ডিগ্রী" value={biodata.highestDegree || "স্নাতক / ডিগ্রি"} />
                  <DetailBox icon={<Building className="w-4 h-4 text-teal-700" />} label="প্রতিষ্ঠানের নাম" value={biodata.institute || "জাতীয় বিশ্ববিদ্যালয়"} />
                  <DetailBox icon={<Briefcase className="w-4 h-4 text-emerald-700" />} label="পেশা" value={biodata.occupation || "শিক্ষার্থী ও ডিজাইনার"} />
                </div>
              </div>
            )}

          </div>
        </div>

        {/* 6. BOTTOM STICKY CONTACT CTA */}
        <div className="bg-white border-t border-gray-200 p-3 sm:p-4 fixed sm:sticky bottom-0 inset-x-0 z-30 shadow-lg flex flex-col items-center gap-1">
          {approvedContactPhone ? (
            <div className="w-full bg-emerald-600 text-white rounded-2xl p-3 text-center space-y-0.5">
              <p className="text-xs font-bold text-emerald-100">অভিভাবকের অনুমোদিত ফোন নম্বর:</p>
              <p className="text-lg font-black tracking-widest font-mono">{approvedContactPhone}</p>
            </div>
          ) : (
            <button
              onClick={() => onRequestContact(biodata)}
              className="w-full py-3.5 px-4 bg-[#053d26] hover:bg-[#032517] active:scale-98 text-white rounded-2xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <Send className="w-4 h-4 text-emerald-300 stroke-[2.5]" />
              <span>পরিবারের সাথে যোগাযোগের অনুরোধ</span>
            </button>
          )}
          <p className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-1 font-medium">
            <Lock className="w-3 h-3 text-emerald-700 shrink-0" />
            <span>অনুমোদনের পর অনুমোদিত তথ্য দেখতে পাবেন</span>
          </p>
        </div>

      </div>
    </div>
  );
};

// Helper Item Box Component matching exact card style in Screenshots 3 & 4
const DetailBox: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => {
  return (
    <div className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 flex items-start gap-2.5">
      <div className="w-7 h-7 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
        {icon}
      </div>
      <div className="min-w-0">
        <span className="text-[10px] sm:text-[11px] text-gray-500 font-bold block truncate">{label}</span>
        <span className="text-xs sm:text-sm font-black text-gray-900 block truncate">{value}</span>
      </div>
    </div>
  );
};
