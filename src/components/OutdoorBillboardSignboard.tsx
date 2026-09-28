import React from "react";
import billboardRefImage from "../assets/images/billboard_ref_1790404511624.jpg";

export const OutdoorBillboardSignboard: React.FC = () => {
  return (
    <div className="px-4 mt-3">
      {/* Exact Outdoor Billboard matching the user provided reference photo */}
      <div className="relative w-full rounded-[24px] overflow-hidden shadow-2xl border-[4px] border-[#0c2317] bg-[#021f14] group select-none">
        <img
          src="https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1200&q=85"
          alt="Outdoor Billboard"
          className="w-full aspect-[16/9] sm:aspect-[2.1/1] object-cover object-center group-hover:scale-105 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        
        {/* Billboard Structure Overlay matching reference colors */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 pointer-events-none" />

        {/* Top Header Banner matching the exact reference text style */}
        <div className="absolute top-0 left-0 right-0 bg-[#073822]/90 backdrop-blur-md px-4 py-2 border-b border-white/15 flex items-center justify-between text-white z-10 shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-black text-[#ffcc00]">🌿 ALL MAYADIN BAZAR</span>
            <span className="text-[10px] font-bold text-emerald-200 hidden xs:inline">YOUR TRUSTED SUPER SHOP</span>
          </div>
          <div className="bg-[#ffcc00] text-black px-2.5 py-0.5 rounded-full text-[9px] sm:text-[11px] font-black tracking-tight">
            স্মার্ট কেনাকাটা এখন আরও সহজ !
          </div>
        </div>

        {/* 5 Steps Grid matching the reference image layout precisely */}
        <div className="absolute inset-x-0 bottom-0 top-12 p-2 sm:p-3 grid grid-cols-5 gap-1.5 sm:gap-2 z-10 items-center bg-[#072d1c]/85 backdrop-blur-sm">
          
          {/* Step 1 */}
          <div className="bg-white rounded-xl p-1.5 sm:p-2 text-center shadow-lg border border-emerald-900 flex flex-col justify-between h-full">
            <div className="flex items-center justify-center gap-1 bg-[#073822] text-white rounded-lg py-0.5 text-[8px] sm:text-[10px] font-black">
              <span className="w-3.5 h-3.5 rounded-full bg-[#ffcc00] text-black flex items-center justify-center text-[8px]">1</span>
              <span>অ্যাপ ডাউনলোড</span>
            </div>
            <div className="my-auto py-1">
              <div className="w-8 sm:w-12 h-10 sm:h-14 bg-gray-900 rounded-lg mx-auto border border-gray-700 p-0.5 shadow">
                <div className="text-[6px] text-emerald-400 font-bold text-center">Mayadin</div>
                <div className="mt-1 bg-emerald-600 text-white text-[5px] py-0.5 rounded">Install</div>
              </div>
            </div>
            <p className="text-[7px] sm:text-[9px] font-black text-gray-800 leading-tight">প্লে স্টোর বা অ্যাপ স্টোর থেকে আমাদের অ্যাপটি ডাউনলোড করুন</p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-xl p-1.5 sm:p-2 text-center shadow-lg border border-emerald-900 flex flex-col justify-between h-full">
            <div className="flex items-center justify-center gap-1 bg-[#073822] text-white rounded-lg py-0.5 text-[8px] sm:text-[10px] font-black">
              <span className="w-3.5 h-3.5 rounded-full bg-[#ffcc00] text-black flex items-center justify-center text-[8px]">2</span>
              <span>লগইন করুন</span>
            </div>
            <div className="my-auto py-1">
              <div className="w-8 sm:w-12 h-10 sm:h-14 bg-gray-100 rounded-lg mx-auto border border-gray-300 p-0.5 shadow flex flex-col justify-center gap-0.5">
                <div className="bg-gray-200 h-2 rounded text-[5px] text-gray-500">নম্বর</div>
                <div className="bg-[#073822] text-white text-[5px] py-0.5 rounded font-bold">লগইন</div>
              </div>
            </div>
            <p className="text-[7px] sm:text-[9px] font-black text-gray-800 leading-tight">আপনার মোবাইল নম্বর দিয়ে রেজিস্ট্রেশন করুন বা লগইন করুন</p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-xl p-1.5 sm:p-2 text-center shadow-lg border border-emerald-900 flex flex-col justify-between h-full">
            <div className="flex items-center justify-center gap-1 bg-[#073822] text-white rounded-lg py-0.5 text-[8px] sm:text-[10px] font-black">
              <span className="w-3.5 h-3.5 rounded-full bg-[#ffcc00] text-black flex items-center justify-center text-[8px]">3</span>
              <span>পণ্য খুঁজুন</span>
            </div>
            <div className="my-auto py-1">
              <div className="w-8 sm:w-12 h-10 sm:h-14 bg-emerald-50 rounded-lg mx-auto border border-emerald-200 p-0.5 shadow flex flex-col justify-center">
                <div className="text-[6px] text-emerald-800 font-bold">সার্চ করুন</div>
                <div className="text-[8px]">🛒👕</div>
              </div>
            </div>
            <p className="text-[7px] sm:text-[9px] font-black text-gray-800 leading-tight">আপনার পছন্দের পণ্য ক্যাটাগরি থেকে খুঁজে নিন</p>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-xl p-1.5 sm:p-2 text-center shadow-lg border border-emerald-900 flex flex-col justify-between h-full">
            <div className="flex items-center justify-center gap-1 bg-[#073822] text-white rounded-lg py-0.5 text-[8px] sm:text-[10px] font-black">
              <span className="w-3.5 h-3.5 rounded-full bg-[#ffcc00] text-black flex items-center justify-center text-[8px]">4</span>
              <span>পেমেন্ট করুন</span>
            </div>
            <div className="my-auto py-1">
              <div className="w-8 sm:w-12 h-10 sm:h-14 bg-gray-50 rounded-lg mx-auto border border-gray-200 p-0.5 shadow flex flex-col justify-center text-[6px] font-bold text-emerald-700">
                <div> বিকাশ</div>
                <div> নগদ</div>
                <div> COD</div>
              </div>
            </div>
            <p className="text-[7px] sm:text-[9px] font-black text-gray-800 leading-tight">বিকাশ, নগদ বা ক্যাশ অন ডেলিভারিতে পেমেন্ট করুন</p>
          </div>

          {/* Step 5 */}
          <div className="bg-white rounded-xl p-1.5 sm:p-2 text-center shadow-lg border border-emerald-900 flex flex-col justify-between h-full">
            <div className="flex items-center justify-center gap-1 bg-[#073822] text-white rounded-lg py-0.5 text-[8px] sm:text-[10px] font-black">
              <span className="w-3.5 h-3.5 rounded-full bg-[#ffcc00] text-black flex items-center justify-center text-[8px]">5</span>
              <span>দ্রুত ডেলিভারি</span>
            </div>
            <div className="my-auto py-1">
              <div className="w-8 sm:w-12 h-10 sm:h-14 bg-emerald-100 rounded-lg mx-auto border border-emerald-300 p-0.5 shadow flex flex-col justify-center items-center">
                <span className="text-base">🛵📦</span>
              </div>
            </div>
            <p className="text-[7px] sm:text-[9px] font-black text-gray-800 leading-tight">আপনার অর্ডার দ্রুত পৌঁছে যাবে আপনার ঠিকানায়</p>
          </div>

        </div>

        {/* Bottom Footer Ribbon matching the reference image */}
        <div className="absolute bottom-0 left-0 right-0 bg-[#042416] py-1 px-3 flex items-center justify-around text-[7px] sm:text-[9px] font-bold text-white z-20 border-t border-emerald-900">
          <span className="flex items-center gap-1">🛡️ বিশ্বস্তযোগ্য পণ্য</span>
          <span className="flex items-center gap-1">⚡ দ্রুত ডেলিভারি</span>
          <span className="flex items-center gap-1">🎯 সেরা দামে সেরা পণ্য</span>
          <span className="flex items-center gap-1">🎧 ২৪/৭ কাস্টমার সাপোর্ট</span>
        </div>

      </div>
    </div>
  );
};
