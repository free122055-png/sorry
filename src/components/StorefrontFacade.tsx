import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { 
  ShoppingBag, CheckCircle2, BookOpen, Camera, Bell, 
  Heart, FileText, Wifi, Play, Pause, ChevronRight,
  Sparkles, Sliders, Check, Volume2, ShieldCheck, ArrowRight,
  Flame, Clock, Star, Copy, Send, BatteryCharging, Zap
} from "lucide-react";

interface DemoScenario {
  id: string;
  path: string;
}

const SCENARIOS: DemoScenario[] = [
  { id: "order", path: "/category/cat2" },
  { id: "tilawat", path: "/islamic-tilawat" },
  { id: "editing", path: "/pixel-editing-tools" },
  { id: "reminder", path: "/reminders" },
  { id: "matrimonial", path: "/matrimonial" },
  { id: "caption", path: "/caption-ghor" },
  { id: "telecom", path: "/telecom" }
];

export const StorefrontFacade: React.FC = () => {
  const navigate = useNavigate();
  const [activeIdx, setActiveIdx] = useState(0);
  const [subStep, setSubStep] = useState(0);

  // Auto-advance scenes every 6 seconds
  useEffect(() => {
    const sceneTimer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % SCENARIOS.length);
      setSubStep(0);
    }, 6000);
    return () => clearInterval(sceneTimer);
  }, []);

  // Micro-interaction steps inside each scene (0 -> 1 -> 2 -> 3)
  useEffect(() => {
    const stepTimer = setInterval(() => {
      setSubStep((prev) => (prev + 1) % 4);
    }, 1450);
    return () => clearInterval(stepTimer);
  }, [activeIdx]);

  const currentScenario = SCENARIOS[activeIdx];

  return (
    <div className="relative w-full overflow-hidden bg-[#01140c] select-none py-0 px-0">
      
      {/* 100% FULL-SCREEN SINGLE DEMO VIEWPORT (No side text blocks, no split layout, exact 3:1 frame) */}
      <div 
        onClick={() => navigate(currentScenario.path)}
        className="relative w-full aspect-[3000/1005] sm:aspect-[3/1] max-h-[145px] sm:max-h-[175px] rounded-none overflow-hidden shadow-[0_0_40px_rgba(255,204,0,0.3),0_10px_30px_rgba(0,0,0,0.7)] border-t-[3px] border-b-0 border-[#ffcc00] bg-black cursor-pointer group select-none"
      >
        
        {/* Dynamic Scene Transition with Vibrant Distinct Environments */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScenario.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
            className="w-full h-full relative overflow-hidden flex flex-col justify-between p-2 sm:p-3"
          >

            {/* ========================================================================= */}
            {/* 1. SCENARIO: ORDER & SHOPPING (আধুনিক সুপারমার্কেট ও গ্রোসারি এনভায়রনমেন্ট) */}
            {/* ========================================================================= */}
            {currentScenario.id === "order" && (
              <div className="w-full h-full flex flex-col justify-between relative">
                {/* Shopping Environment Background: Emerald supermarket store aura with warm golden lighting */}
                <div className="absolute -inset-4 bg-gradient-to-r from-emerald-950 via-[#03331b] to-emerald-900 pointer-events-none" />
                <div className="absolute top-0 right-1/4 w-72 h-32 bg-emerald-500/25 blur-3xl pointer-events-none rounded-full" />
                <div className="absolute bottom-0 left-10 w-60 h-24 bg-amber-500/20 blur-2xl pointer-events-none rounded-full" />
                
                {/* Store Top Bar */}
                <div className="relative z-10 flex items-center justify-between pb-1 border-b border-emerald-500/30 text-[9px] sm:text-[11px] font-bold">
                  <div className="flex items-center gap-1.5 text-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-black text-white">Al Mayadin Bazar • অনলাইন শপ</span>
                    <span className="text-[8px] sm:text-[9.5px] bg-emerald-800/60 text-emerald-200 px-1.5 py-0.2 rounded border border-emerald-400/40">
                      ⚡ ৩০ মিনিটে ডেলিভারি
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[8px] sm:text-[10px] font-black transition-all shadow-md ${
                      subStep >= 1 ? "bg-[#ffcc00] text-gray-950 scale-105" : "bg-emerald-900/80 text-emerald-200 border border-emerald-400/30"
                    }`}>
                      🛒 কার্ট {subStep >= 1 ? "(১টি পণ্য • ৳২৫০)" : "(০)"}
                    </span>
                  </div>
                </div>

                {/* Shopping Feed with High-Visibility Cards */}
                <div className="relative z-10 flex items-center gap-2 sm:gap-3 py-1 flex-1 overflow-hidden">
                  {/* Active Selected Card */}
                  <div className={`flex-1 h-full rounded-xl p-1.5 sm:p-2 flex items-center justify-between transition-all duration-300 ${
                    subStep >= 1 
                      ? "bg-gradient-to-r from-emerald-800/90 to-teal-850/90 border-2 border-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.4)]" 
                      : "bg-emerald-900/60 border border-emerald-400/40"
                  }`}>
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-lg bg-amber-400/20 border border-amber-300/40 flex items-center justify-center shrink-0 shadow-inner">
                        <ShoppingBag className="w-6 h-6 sm:w-7 sm:h-7 text-amber-300 drop-shadow" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[7.5px] sm:text-[9px] bg-amber-400/20 text-amber-300 font-bold px-1.5 py-0.2 rounded">সেরা অফার</span>
                        <h4 className="text-[11px] sm:text-[14px] font-black text-white truncate">খাঁটি সরিষার তেল (১ লিটার)</h4>
                        <p className="text-[9.5px] sm:text-[12px] font-black text-amber-300">৳২৫০ <span className="line-through text-gray-400 text-[8px] sm:text-[9.5px]">৳২৮০</span></p>
                      </div>
                    </div>

                    <div className="shrink-0 pl-1">
                      <span className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg text-[9px] sm:text-[11px] font-black shadow transition-all ${
                        subStep >= 1 ? "bg-amber-400 text-gray-950 scale-105" : "bg-emerald-500 text-gray-950"
                      }`}>
                        {subStep === 0 ? "অর্ডার করুন" : subStep === 1 ? "✓ কার্টে যুক্ত" : "কনফার্মড"}
                      </span>
                    </div>
                  </div>

                  {/* Second Item on the shelf */}
                  <div className="w-1/3 sm:w-2/5 h-full rounded-xl bg-emerald-900/40 border border-emerald-400/20 p-1.5 sm:p-2 items-center gap-2 opacity-70 hidden sm:flex">
                    <div className="w-11 h-11 rounded-lg bg-orange-500/20 border border-orange-400/30 flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-5 h-5 text-orange-300" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-black text-white truncate">সুন্দরবনের মধু ৫০০ গ্রাম</p>
                      <p className="text-[10px] text-amber-300 font-bold">৳৪২০</p>
                    </div>
                  </div>
                </div>

                {/* Instant Checkout Sheet Pop-up */}
                {subStep >= 2 && (
                  <motion.div 
                    initial={{ y: 25, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="absolute inset-x-2 bottom-1 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-xl p-2 sm:p-2.5 shadow-2xl flex items-center justify-between border-2 border-emerald-200 z-30"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-white shrink-0 fill-emerald-900" />
                      <div>
                        <p className="text-[10.5px] sm:text-[12.5px] font-black text-white leading-tight">✓ অর্ডার সফলভাবে গৃহীত হয়েছে! (#ORD-9841)</p>
                        <p className="text-[8px] sm:text-[10px] text-emerald-100">ক্যাশ অন ডেলিভারি • লাইভ ট্র্যাকিং চালু</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-white text-emerald-950 text-[9px] sm:text-[10.5px] font-black shrink-0 shadow">
                      অর্ডার দেখুন →
                    </span>
                  </motion.div>
                )}

                {/* Animated Finger Touch Cursor */}
                <motion.div
                  animate={
                    subStep === 0 
                      ? { x: ["60%", "80%", "75%"], y: ["45%", "45%", "45%"], scale: [1, 0.85, 1] }
                      : subStep === 1
                      ? { x: "85%", y: "45%", scale: [1, 0.8, 1] }
                      : { x: "90%", y: "75%", scale: [1, 0.85, 1] }
                  }
                  transition={{ duration: 0.6 }}
                  className="absolute pointer-events-none z-40"
                >
                  <span className="text-xl sm:text-2xl filter drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">👆</span>
                </motion.div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 2. SCENARIO: TILAWAT (শান্ত, মার্জিত ও আধ্যাত্মিক ইসলামিক এনভায়রনমেন্ট) */}
            {/* ========================================================================= */}
            {currentScenario.id === "tilawat" && (
              <div className="w-full h-full flex flex-col justify-between relative">
                {/* Spiritual Islamic Background: Deep Midnight Teal & Royal Cyan with Noor Aura */}
                <div className="absolute -inset-4 bg-gradient-to-r from-[#031d28] via-[#053244] to-[#042131] pointer-events-none" />
                <div className="absolute -top-10 left-1/3 w-80 h-36 bg-cyan-400/25 blur-3xl pointer-events-none rounded-full" />
                <div className="absolute bottom-0 right-10 w-64 h-28 bg-teal-400/20 blur-2xl pointer-events-none rounded-full" />
                
                {/* Mosque Dome / Arabesque Geometry Glow Accent */}
                <div 
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage: "radial-gradient(#38bdf8 1.5px, transparent 1.5px)",
                    backgroundSize: "20px 20px"
                  }}
                />

                {/* Top Islamic Bar */}
                <div className="relative z-10 flex items-center justify-between pb-1 border-b border-cyan-500/30 text-[9px] sm:text-[11px] font-bold">
                  <div className="flex items-center gap-1.5 text-cyan-200">
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-black text-white">পবিত্র কুরআনুল কারীম • অডিও ও ভিডিও তিলাওয়াত</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-200 text-[8px] sm:text-[9.5px] font-mono border border-cyan-400/40 shadow-sm">
                    ✨ নূরানী তেলাওয়াত • HD
                  </span>
                </div>

                {/* Dynamic Player & Waveform Display */}
                <div className="relative z-10 flex items-center gap-2.5 sm:gap-4 py-1 flex-1">
                  <div className="flex-1 flex items-center gap-2.5 sm:gap-3 bg-cyan-950/70 border border-cyan-400/40 rounded-xl p-2 shadow-lg backdrop-blur-sm">
                    <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-gradient-to-tr from-cyan-600 to-teal-400 text-gray-950 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.6)]">
                      <Volume2 className="w-6 h-6 animate-pulse" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[11px] sm:text-[14px] font-black text-white truncate">সূরা আল-ফাতিহা (سورة الفاتحة)</h4>
                        <span className="text-[8px] sm:text-[10px] text-cyan-300 font-mono">০৩:৪৫ / ০৬:০৮</span>
                      </div>
                      <p className="text-[9px] sm:text-[11.5px] text-cyan-200">ক্বারী মিশারি রাশিদ আল-আফাসী</p>

                      {/* Luminous Animated Soundwave */}
                      <div className="flex items-end gap-1 h-3.5 sm:h-4 mt-1">
                        {[40, 80, 100, 65, 90, 45, 95, 75, 55, 85, 95, 70, 40].map((h, i) => (
                          <motion.span
                            key={i}
                            animate={{ height: [`${h * 0.35}%`, `${h}%`, `${h * 0.4}%`] }}
                            transition={{ repeat: Infinity, duration: 0.5 + (i % 5) * 0.1 }}
                            className="w-1 bg-gradient-to-t from-cyan-400 to-teal-200 rounded-full shadow-[0_0_8px_#38bdf8]"
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <button className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-cyan-400 to-teal-300 text-gray-950 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.7)]">
                      <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-gray-950 ml-0.5" />
                    </button>
                  </div>
                </div>

                <motion.div
                  animate={{ x: ["70%", "85%", "78%"], y: ["40%", "45%", "40%"], scale: [1, 0.85, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute pointer-events-none z-40"
                >
                  <span className="text-xl sm:text-2xl filter drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">👆</span>
                </motion.div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 3. SCENARIO: EDITING TOOLS (ক্রিয়েটিভ স্টুডিও ও আর্ট এডিটিং এনভায়রনমেন্ট) */}
            {/* ========================================================================= */}
            {currentScenario.id === "editing" && (
              <div className="w-full h-full flex flex-col justify-between relative">
                {/* Studio Neon Environment: Deep Violet, Electric Purple & Magenta */}
                <div className="absolute -inset-4 bg-gradient-to-r from-[#200a3e] via-[#351061] to-[#1c0836] pointer-events-none" />
                <div className="absolute top-0 right-1/4 w-72 h-32 bg-purple-500/30 blur-3xl pointer-events-none rounded-full" />
                <div className="absolute bottom-0 left-10 w-60 h-24 bg-pink-500/25 blur-2xl pointer-events-none rounded-full" />

                <div className="relative z-10 flex items-center justify-between pb-1 border-b border-purple-500/40 text-[9px] sm:text-[11px] font-bold">
                  <div className="flex items-center gap-1.5 text-purple-200">
                    <Camera className="w-3.5 h-3.5 text-purple-400" />
                    <span className="font-black text-white">পিক্সেল গ্রাফিক্স স্টুডিও • ফটো ফিল্টার ও ফ্রেম</span>
                  </div>
                  <span className="text-[8px] sm:text-[9.5px] bg-purple-600/30 text-purple-200 px-2 py-0.5 rounded border border-purple-400/40">
                    🎨 ক্রিয়েটিভ মোড • ৪K
                  </span>
                </div>

                <div className="relative z-10 flex items-center gap-2 sm:gap-3 py-1 flex-1">
                  {/* Photo Canvas with Studio Glow */}
                  <div className="w-16 h-14 sm:w-20 sm:h-16 rounded-xl bg-gradient-to-tr from-purple-700 via-pink-600 to-indigo-600 flex items-center justify-center relative overflow-hidden border-2 border-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.5)] shrink-0">
                    <Sparkles className="w-7 h-7 text-yellow-300 animate-spin" style={{ animationDuration: "8s" }} />
                    <span className="absolute bottom-0.5 text-[7px] font-black text-white bg-black/50 px-1 rounded">Al Mayadin</span>
                  </div>

                  <div className="flex-1 space-y-1 sm:space-y-1.5 bg-purple-950/60 p-2 rounded-xl border border-purple-400/30">
                    <div className="flex items-center justify-between text-[8.5px] sm:text-[10.5px] text-purple-200 font-bold">
                      <span>উজ্জ্বলতা ও কালার টিউন:</span>
                      <span className="text-yellow-300 font-mono">+ ৪৫% ফিল্টার</span>
                    </div>
                    <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden p-0.5">
                      <motion.div 
                        animate={{ width: ["25%", "80%", "95%"] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-400 h-full rounded-full shadow-[0_0_10px_#f43f5e]"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-0.5 text-[8px] sm:text-[10px]">
                      <span className="px-2 py-0.5 rounded-md bg-purple-600 text-white font-black">ফিল্টার</span>
                      <span className="px-2 py-0.5 rounded-md bg-white/15 text-purple-200">ফ্রেম</span>
                      <span className="px-2 py-0.5 rounded-md bg-white/15 text-purple-200">টেক্সট</span>
                    </div>
                  </div>

                  <div className="shrink-0 pl-1">
                    <button className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[9.5px] sm:text-[11.5px] font-black shadow-[0_0_15px_rgba(217,70,239,0.6)] flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>সেভ</span>
                    </button>
                  </div>
                </div>

                <motion.div
                  animate={{ x: ["40%", "65%", "55%"], y: ["45%", "45%", "45%"], scale: [1, 0.85, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="absolute pointer-events-none z-40"
                >
                  <span className="text-xl sm:text-2xl filter drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">👆</span>
                </motion.div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 4. SCENARIO: REMINDER (ক্লিন স্মার্ট নোটিফিকেশন ও অ্যালার্ট এনভায়রনমেন্ট) */}
            {/* ========================================================================= */}
            {currentScenario.id === "reminder" && (
              <div className="w-full h-full flex flex-col justify-between relative">
                {/* Modern Alert Blue & Cyber Indigo Background */}
                <div className="absolute -inset-4 bg-gradient-to-r from-[#071d49] via-[#0c2f6d] to-[#082154] pointer-events-none" />
                <div className="absolute top-0 right-1/4 w-72 h-32 bg-blue-500/25 blur-3xl pointer-events-none rounded-full" />
                <div className="absolute bottom-0 left-10 w-60 h-24 bg-cyan-500/20 blur-2xl pointer-events-none rounded-full" />

                <div className="relative z-10 flex items-center justify-between pb-1 border-b border-blue-400/40 text-[9px] sm:text-[11px] font-bold">
                  <div className="flex items-center gap-1.5 text-blue-200">
                    <Bell className="w-3.5 h-3.5 text-blue-400 animate-bounce" />
                    <span className="font-black text-white">স্মার্ট রিমাইন্ডার • দৈনিক ইবাদত ও অ্যালার্ট</span>
                  </div>
                  <span className="text-[8px] sm:text-[9.5px] bg-blue-500/25 text-blue-200 px-2 py-0.5 rounded border border-blue-400/40">
                    🔔 নোটিফিকেশন অন
                  </span>
                </div>

                <div className="relative z-10 flex items-center gap-2 sm:gap-3 py-1 flex-1">
                  <div className="flex-1 bg-blue-950/70 border border-blue-400/40 rounded-xl p-2 flex items-center justify-between shadow-lg">
                    <div>
                      <h4 className="text-[11px] sm:text-[13px] font-black text-white">ফজর নামাজের অ্যালার্ট</h4>
                      <p className="text-[9px] sm:text-[11px] text-blue-200 font-mono">সময়: ০৫:১৫ AM • প্রতিদিন অ্যালার্ট</p>
                    </div>
                    <div className="w-9 h-5 bg-blue-500 rounded-full flex items-center justify-end px-0.5 shadow-inner">
                      <span className="w-4 h-4 rounded-full bg-white shadow-md" />
                    </div>
                  </div>

                  <div className="flex-1 bg-blue-950/50 border border-blue-400/20 rounded-xl p-2 items-center justify-between opacity-80 hidden sm:flex">
                    <div>
                      <p className="text-[12px] font-black text-white">কুরআন তিলাওয়াত</p>
                      <p className="text-[10px] text-blue-300 font-mono">০৭:০০ PM</p>
                    </div>
                    <div className="w-9 h-5 bg-blue-500 rounded-full flex items-center justify-end px-0.5">
                      <span className="w-4 h-4 rounded-full bg-white shadow-md" />
                    </div>
                  </div>
                </div>

                {/* Instant Dynamic Push Notification Drop */}
                {subStep >= 2 && (
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="absolute inset-x-2 top-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-xl p-2 shadow-2xl flex items-center justify-between border-2 border-blue-200 z-30"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">⏰</span>
                      <div>
                        <p className="text-[10px] sm:text-[12px] font-black leading-tight">ফজর নামাজের সময় হয়েছে!</p>
                        <p className="text-[8px] sm:text-[9.5px] text-blue-100">আজকের নামাজের প্রস্তুতি গ্রহণ করুন</p>
                      </div>
                    </div>
                    <span className="text-[8px] sm:text-[9.5px] bg-white text-blue-950 px-2 py-0.5 rounded font-black shadow">
                      বন্ধ করুন
                    </span>
                  </motion.div>
                )}

                <motion.div
                  animate={{ x: ["55%", "65%", "60%"], y: ["45%", "45%", "45%"], scale: [1, 0.85, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute pointer-events-none z-40"
                >
                  <span className="text-xl sm:text-2xl filter drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">👆</span>
                </motion.div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 5. SCENARIO: MATRIMONIAL (আভিজাত্যপূর্ণ ইসলামিক প্রোফাইল এনভায়রনমেন্ট) */}
            {/* ========================================================================= */}
            {currentScenario.id === "matrimonial" && (
              <div className="w-full h-full flex flex-col justify-between relative">
                {/* Royal Rose / Ruby Maroon Environment with Gold Accents */}
                <div className="absolute -inset-4 bg-gradient-to-r from-[#380b18] via-[#541225] to-[#2e0914] pointer-events-none" />
                <div className="absolute top-0 right-1/4 w-72 h-32 bg-rose-500/25 blur-3xl pointer-events-none rounded-full" />
                <div className="absolute bottom-0 left-10 w-60 h-24 bg-amber-500/20 blur-2xl pointer-events-none rounded-full" />

                <div className="relative z-10 flex items-center justify-between pb-1 border-b border-rose-400/40 text-[9px] sm:text-[11px] font-bold">
                  <div className="flex items-center gap-1.5 text-rose-200">
                    <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
                    <span className="font-black text-white">ইসলামিক পাত্র-পাত্রীর বায়োডাটা • ১০০% শরিয়াহ সম্মত</span>
                  </div>
                  <span className="text-[8px] sm:text-[9.5px] bg-rose-500/30 text-rose-200 px-2 py-0.5 rounded border border-rose-400/40">
                    👑 ভেরিফাইড প্রোফাইল
                  </span>
                </div>

                <div className="relative z-10 flex items-center gap-2 sm:gap-3 py-1 flex-1">
                  <div className="flex-1 bg-rose-950/70 border-2 border-rose-400/40 rounded-xl p-2 flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-rose-500 to-amber-400 text-white flex items-center justify-center font-black text-xs shadow-md">
                        #১০৪
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <h4 className="text-[11px] sm:text-[13px] font-black text-white">বায়োডাটা #BM-104 (পাত্র)</h4>
                          <span className="text-[7.5px] bg-amber-400 text-gray-950 px-1 rounded font-bold">ভেরিফাইড</span>
                        </div>
                        <p className="text-[9px] sm:text-[11px] text-rose-200">বয়স ২৬ • সফটওয়্যার ইঞ্জিনিয়ার • ঢাকা</p>
                      </div>
                    </div>

                    <button className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white text-[9.5px] sm:text-[11.5px] font-black shadow-[0_0_15px_rgba(244,63,94,0.6)] shrink-0">
                      বায়োডাটা দেখুন →
                    </button>
                  </div>
                </div>

                <motion.div
                  animate={{ x: ["60%", "78%", "72%"], y: ["45%", "45%", "45%"], scale: [1, 0.85, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute pointer-events-none z-40"
                >
                  <span className="text-xl sm:text-2xl filter drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">👆</span>
                </motion.div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 6. SCENARIO: CAPTION GHOR (ট্রেন্ডিং সোশাল ও কন্টেন্ট এনভায়রনমেন্ট) */}
            {/* ========================================================================= */}
            {currentScenario.id === "caption" && (
              <div className="w-full h-full flex flex-col justify-between relative">
                {/* Social Sunset Magenta & Coral Environment */}
                <div className="absolute -inset-4 bg-gradient-to-r from-[#3d082c] via-[#5c0d43] to-[#360727] pointer-events-none" />
                <div className="absolute top-0 right-1/4 w-72 h-32 bg-pink-500/25 blur-3xl pointer-events-none rounded-full" />
                <div className="absolute bottom-0 left-10 w-60 h-24 bg-fuchsia-500/20 blur-2xl pointer-events-none rounded-full" />

                <div className="relative z-10 flex items-center justify-between pb-1 border-b border-pink-400/40 text-[9px] sm:text-[11px] font-bold">
                  <div className="flex items-center gap-1.5 text-pink-200">
                    <FileText className="w-3.5 h-3.5 text-pink-400" />
                    <span className="font-black text-white">ক্যাপশন ঘর • ট্রেন্ডিং ইসলামিক ও মোটিভেশনাল স্ট্যাটাস</span>
                  </div>
                  <span className="text-[8px] sm:text-[9.5px] bg-pink-500/30 text-pink-200 px-2 py-0.5 rounded border border-pink-400/40">
                    📋 ওয়ান-ট্যাপ কপি
                  </span>
                </div>

                <div className="relative z-10 flex items-center gap-2 sm:gap-3 py-1 flex-1">
                  <div className="flex-1 bg-pink-950/70 border border-pink-400/40 rounded-xl p-2 flex items-center justify-between shadow-lg">
                    <p className="text-[10px] sm:text-[13px] font-medium text-white italic truncate max-w-[70%]">
                      "ধৈর্য ধরো, নিশ্চয়ই কষ্টের পরেই রয়েছে অপার স্বস্তি..."
                    </p>
                    <button className={`px-3 py-1.5 rounded-xl text-[9.5px] sm:text-[11.5px] font-black transition-all shadow-md ${
                      subStep >= 2 ? "bg-emerald-400 text-gray-950 scale-105" : "bg-gradient-to-r from-pink-500 to-rose-500 text-white"
                    }`}>
                      {subStep >= 2 ? "✓ কপি হয়েছে!" : "কপি করুন"}
                    </button>
                  </div>
                </div>

                <motion.div
                  animate={{ x: ["60%", "78%", "72%"], y: ["45%", "45%", "45%"], scale: [1, 0.85, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute pointer-events-none z-40"
                >
                  <span className="text-xl sm:text-2xl filter drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">👆</span>
                </motion.div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 7. SCENARIO: TELECOM (হাই-স্পিড অপটিক ফাইবার ও টেলিকম এনভায়রনমেন্ট) */}
            {/* ========================================================================= */}
            {currentScenario.id === "telecom" && (
              <div className="w-full h-full flex flex-col justify-between relative">
                {/* Modern High-Speed Orange & Cyber Teal Telecom Environment */}
                <div className="absolute -inset-4 bg-gradient-to-r from-[#3a1505] via-[#592309] to-[#301204] pointer-events-none" />
                <div className="absolute top-0 right-1/4 w-72 h-32 bg-orange-500/30 blur-3xl pointer-events-none rounded-full" />
                <div className="absolute bottom-0 left-10 w-60 h-24 bg-yellow-500/25 blur-2xl pointer-events-none rounded-full" />

                <div className="relative z-10 flex items-center justify-between pb-1 border-b border-orange-400/40 text-[9px] sm:text-[11px] font-bold">
                  <div className="flex items-center gap-1.5 text-orange-200">
                    <Wifi className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
                    <span className="font-black text-white">টেলিকম রিচার্জ • সুপারফাস্ট ইন্টারনেট ও মিনিট প্যাক</span>
                  </div>
                  <span className="text-[8px] sm:text-[9.5px] bg-orange-500/30 text-orange-200 px-2 py-0.5 rounded border border-orange-400/40 font-mono">
                    ⚡ 5G ফাস্ট রিচার্জ
                  </span>
                </div>

                <div className="relative z-10 flex items-center gap-2 sm:gap-3 py-1 flex-1">
                  <div className="flex-1 bg-orange-950/70 border border-orange-400/40 rounded-xl p-2 flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 text-gray-950 flex items-center justify-center font-black text-[12px] shadow-md">
                        GP
                      </div>
                      <div>
                        <h4 className="text-[11px] sm:text-[13px] font-black text-white">40GB + 800 Min (৩০ দিন)</h4>
                        <p className="text-[9px] sm:text-[11px] text-amber-300 font-bold">৳৪৯৮ <span className="line-through text-gray-400 text-[8px] sm:text-[9.5px]">৳৫৫০</span></p>
                      </div>
                    </div>

                    <button className={`px-3 py-1.5 rounded-xl text-[9.5px] sm:text-[11.5px] font-black transition-all shadow-md ${
                      subStep >= 2 ? "bg-emerald-400 text-gray-950 scale-105" : "bg-gradient-to-r from-amber-400 to-orange-500 text-gray-950"
                    }`}>
                      {subStep >= 2 ? "✓ রিচার্জ সফল!" : "কিনুন"}
                    </button>
                  </div>
                </div>

                <motion.div
                  animate={{ x: ["60%", "78%", "72%"], y: ["45%", "45%", "45%"], scale: [1, 0.85, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute pointer-events-none z-40"
                >
                  <span className="text-xl sm:text-2xl filter drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">👆</span>
                </motion.div>
              </div>
            )}

            {/* Seamless Bottom Indicator across the frame */}
            <div className="relative z-10 w-full flex items-center justify-center gap-1.5 pt-0.5">
              {SCENARIOS.map((_, i) => (
                <span
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    activeIdx === i ? "w-6 bg-[#ffcc00] shadow-[0_0_8px_#ffcc00]" : "w-1.5 bg-white/30"
                  }`}
                />
              ))}
            </div>

          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
};
