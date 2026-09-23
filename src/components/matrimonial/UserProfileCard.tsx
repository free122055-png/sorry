import React from "react";
import { User, ShieldCheck, Plus, Eye, Send, PhoneCall, CheckCircle2, ChevronRight, Sparkles, HeartHandshake } from "lucide-react";
import { Biodata } from "../../types/matrimonial";

interface UserProfileCardProps {
  user: { uid: string; email?: string; phoneNumber?: string; displayName?: string } | null;
  userBiodata?: Biodata | null;
  incomingCount: number;
  sentCount: number;
  bookmarkedCount: number;
  onOpenWizard: () => void;
  onOpenDashboard: () => void;
  onViewMyBiodata?: (b: Biodata) => void;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({
  user,
  userBiodata,
  incomingCount,
  sentCount,
  bookmarkedCount,
  onOpenWizard,
  onOpenDashboard,
  onViewMyBiodata
}) => {
  if (!user) {
    return (
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-[#04281a] text-white rounded-2xl p-3.5 sm:p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 border border-emerald-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-emerald-300 font-bold shrink-0 border border-white/15">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black tracking-tight text-white flex items-center gap-1.5">
              <span>ম্যাট্রিমোনিয়াল মেম্বার প্রোফাইল</span>
            </h3>
            <p className="text-[10px] sm:text-xs text-emerald-200/90 font-medium mt-0.5">
              প্রোফাইল তৈরি করতে ও রিকোয়েস্ট পাঠাতে লগইন করুন
            </p>
          </div>
        </div>
      </div>
    );
  }

  const userDisplayName = user.displayName || user.email?.split("@")[0] || user.phoneNumber || "শ্রদ্ধেয় সদস্য";
  const matrimonialId = `M-${user.uid.slice(0, 6).toUpperCase()}`;

  return (
    <div className="bg-white rounded-2xl border border-emerald-200/90 p-3 sm:p-4 shadow-xs space-y-3 relative overflow-hidden">
      {/* Decorative Top Accent Bar */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800" />

      {/* Top Main Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Left: User Details */}
        <div className="flex items-center gap-3">
          {/* Avatar Icon */}
          <div className="relative shrink-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#053d26] text-amber-300 flex items-center justify-center font-black text-sm shadow-sm border border-emerald-700/50">
              {userBiodata ? (
                userBiodata.gender === 'groom' ? "👨‍💼" : "🧕"
              ) : (
                <User className="w-5 h-5 text-amber-300" />
              )}
            </div>
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white absolute -bottom-0.5 -right-0.5 shadow-2xs" />
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-xs sm:text-sm font-black text-gray-900 tracking-tight">
                {userDisplayName}
              </h3>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded-md text-[9px] font-extrabold flex items-center gap-0.5">
                <ShieldCheck className="w-3 h-3 text-emerald-700" />
                <span>{matrimonialId}</span>
              </span>
            </div>

            {userBiodata ? (
              <p className="text-[11px] text-gray-600 font-semibold flex items-center gap-1.5">
                <span>বায়োডাটা: <strong className="text-emerald-900 font-black">{userBiodata.biodataCode}</strong></span>
                <span>•</span>
                <span>{userBiodata.gender === 'groom' ? '👨 পাত্র' : '🧕 পাত্রী'}</span>
                <span>•</span>
                <span>{userBiodata.presentDistrict}</span>
              </p>
            ) : (
              <p className="text-[11px] text-amber-700 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>আপনার এখনো কোনো বায়োডাটা যুক্ত করা নেই</span>
              </p>
            )}
          </div>
        </div>

        {/* Right: Quick Action Button */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          {userBiodata ? (
            <button
              onClick={() => onViewMyBiodata && onViewMyBiodata(userBiodata)}
              className="flex-1 sm:flex-initial py-2 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Eye className="w-3.5 h-3.5 text-emerald-800" />
              <span>আমার বায়োডাটা দেখুন</span>
            </button>
          ) : (
            <button
              onClick={onOpenWizard}
              className="flex-1 sm:flex-initial py-2 px-3.5 bg-[#053d26] hover:bg-[#032618] text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>বায়োডাটা প্রোফাইল যোগ করুন</span>
            </button>
          )}

          <button
            onClick={onOpenDashboard}
            className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition active:scale-95 cursor-pointer shrink-0"
            title="ড্যাশবোর্ড ও রিকোয়েস্ট ম্যানেজার"
          >
            <Send className="w-3.5 h-3.5 text-emerald-700" />
            <span>ড্যাশবোর্ড</span>
          </button>
        </div>
      </div>

      {/* Bottom Activity Stats Strip */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
        <button 
          onClick={onOpenDashboard}
          className="p-1.5 bg-slate-50 hover:bg-emerald-50/60 rounded-xl transition cursor-pointer"
        >
          <span className="block text-[10px] text-gray-500 font-bold">প্রেরিত অনুরোধ</span>
          <span className="text-xs font-black text-emerald-900">{sentCount} টি</span>
        </button>

        <button 
          onClick={onOpenDashboard}
          className="p-1.5 bg-slate-50 hover:bg-amber-50/60 rounded-xl transition cursor-pointer relative"
        >
          <span className="block text-[10px] text-gray-500 font-bold">আগত অনুরোধ</span>
          <span className="text-xs font-black text-amber-900">{incomingCount} টি</span>
          {incomingCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1 right-2 animate-pulse" />
          )}
        </button>

        <div className="p-1.5 bg-slate-50 rounded-xl">
          <span className="block text-[10px] text-gray-500 font-bold">বুকমার্ককৃত</span>
          <span className="text-xs font-black text-slate-800">{bookmarkedCount} টি</span>
        </div>
      </div>
    </div>
  );
};
