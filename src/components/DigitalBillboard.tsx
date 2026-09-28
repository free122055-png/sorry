import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, Play, ShieldCheck, Zap } from "lucide-react";

interface BillboardItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  path: string;
  image: string;
  badge: string;
  themeColor: string;
}

const BILLBOARD_ITEMS: BillboardItem[] = [
  {
    id: "cat2",
    title: "অয়েল কর্নার",
    subtitle: "খাঁটি তেল ও গ্রোসারি",
    description: "১০০% খাঁটি সরিষা, তিল ও নারকেল তেল সরাসরি হোম ডেলিভারি।",
    ctaText: "অর্ডার করুন",
    path: "/category/cat2",
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&q=80",
    badge: "🔥 স্পেশাল অফার",
    themeColor: "from-amber-600 to-yellow-600"
  },
  {
    id: "cat3",
    title: "কাপড় ও পরিধান",
    subtitle: "প্রিমিয়াম ফ্যাশন কালেকশন",
    description: "আধুনিক ও রুচিসম্মত পোশাকের বিশাল সমাহার আপনার জন্য।",
    ctaText: "কালেকশন দেখুন",
    path: "/category/cat3",
    image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&q=80",
    badge: "✨ নতুন কালেকশন",
    themeColor: "from-sky-600 to-blue-700"
  },
  {
    id: "cat4",
    title: "উপহার বাজার",
    subtitle: "প্রিয়জনের জন্য সেরা উপহার",
    description: "বিশেষ মুহূর্তকে আরও রঙিন করতে আকর্ষণীয় সব উপহার সামগ্রী।",
    ctaText: "উপহার বেছে নিন",
    path: "/category/cat4",
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80",
    badge: "🎁 গিফট আইটেম",
    themeColor: "from-orange-600 to-amber-600"
  },
  {
    id: "cat6",
    title: "ইসলামিক বাজার",
    subtitle: "দ্বীনি বই ও সুন্নতি পণ্য",
    description: "পবিত্র কুরআন, জায়নামাজ, আতর এবং ইসলামিক সামগ্রী।",
    ctaText: "সংগ্রহ দেখুন",
    path: "/category/cat6",
    image: "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&q=80",
    badge: "🌙 ইসলামিক কালেকশন",
    themeColor: "from-emerald-700 to-teal-800"
  },
  {
    id: "tilawat",
    title: "তেলাওয়াত লাইব্রেরি",
    subtitle: "১১৪ সূরার পবিত্র অডিও",
    description: "বিশ্বের প্রখ্যাত কারীগণের কন্ঠে পবিত্র কুরআন তেলাওয়াত শুনুন।",
    ctaText: "তেলাওয়াত শুনুন",
    path: "/islamic-tilawat",
    image: "https://images.unsplash.com/photo-1584286595398-a19ffc54ffef?w=800&q=80",
    badge: "📖 অডিও লাইব্রেরি",
    themeColor: "from-[#0a3d2e] to-emerald-900"
  },
  {
    id: "caption",
    title: "ক্যাপশন ঘর",
    subtitle: "স্ট্যাটাস ও প্রফেশনাল ক্যাপশন",
    description: "সোশ্যাল মিডিয়ার জন্য সেরা সব ইসলামিক ও আকর্ষণীয় ক্যাপশন।",
    ctaText: "ক্যাপশন কপি করুন",
    path: "/caption-ghor",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80",
    badge: "✍️ ট্রেন্ডিং ক্যাপশন",
    themeColor: "from-pink-600 to-rose-700"
  },
  {
    id: "editing",
    title: "এডিটিং টুলস",
    subtitle: "পিক্সেল পারফেক্ট ডিজাইন",
    description: "খুব সহজেই আপনার ছবি ও ব্যানার এডিট করে নিন প্রফেশনাল টুলস দিয়ে।",
    ctaText: "এডিট শুরু করুন",
    path: "/pixel-editing-tools",
    image: "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800&q=80",
    badge: "🎨 পিক্সেল টুলস",
    themeColor: "from-slate-800 to-zinc-900"
  },
  {
    id: "matrimonial",
    title: "বিবাহের বায়োডাটা",
    subtitle: "দ্বীনি পাত্র-পাত্রীর সন্ধান",
    description: "শরিয়াহ সম্মত উপায়ে সহজ ও নিরাপদ উপায়ে বায়োডাটা তৈরি ও সন্ধান করুন।",
    ctaText: "বায়োডাটা দেখুন",
    path: "/matrimonial",
    image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
    badge: "💍 দ্বীনি মাধ্যম",
    themeColor: "from-rose-700 to-pink-900"
  },
  {
    id: "telecom",
    title: "এমবি ইন্টারনেট প্যাক",
    subtitle: "সাশ্রয়ী মূল্যে ইন্টারনেট অফার",
    description: "সকল অপারেটরের আকর্ষণীয় ডাটা প্যাক ও মিনিট বান্ডেল অফার।",
    ctaText: "অফার দেখুন",
    path: "/telecom",
    image: "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=800&q=80",
    badge: "📶 সেরা অফার",
    themeColor: "from-[#044a2f] to-emerald-800"
  },
  {
    id: "reminders",
    title: "রিমাইন্ডার ও উইশ",
    subtitle: "স্মার্ট লাইফস্টাইল রিমাইন্ডার",
    description: "প্রিয়জনকে বার্থডে উইশ, এনিভার্সারি ও ব্যক্তিগত রিমাইন্ডার সেট করুন।",
    ctaText: "রিমাইন্ডার সেট করুন",
    path: "/reminders",
    image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&q=80",
    badge: "⏰ স্মার্ট নোটিফিকেশন",
    themeColor: "from-blue-600 to-indigo-800"
  }
];

export const DigitalBillboard: React.FC = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % BILLBOARD_ITEMS.length);
    }, 5000); // 5 seconds per ad loop
    return () => clearInterval(timer);
  }, []);

  const currentAd = BILLBOARD_ITEMS[currentIndex];

  return (
    <div className="px-4 mt-3">
      {/* Real Digital LED Billboard Container with Premium Frame, Shadow & Glass Reflection */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[2.3/1] rounded-[24px] overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.18)] border-[4px] border-[#1e293b] bg-slate-950 group select-none cursor-pointer">
        
        {/* Glass Screen Reflection Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none z-30" />
        
        {/* LED Billboard Header / Status Bar */}
        <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between z-30 pointer-events-none">
          <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[9px] font-black text-white tracking-widest uppercase">LIVE DIGITAL BILLBOARD</span>
          </div>
          <div className="bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 text-[9px] font-bold text-amber-300 flex items-center gap-1">
            <Zap className="w-3 h-3 text-[#ffcc00]" /> {currentIndex + 1} / {BILLBOARD_ITEMS.length}
          </div>
        </div>

        {/* Video-Style Animated Content Carousel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentAd.id}
            initial={{ opacity: 0, scale: 1.05, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            onClick={() => navigate(currentAd.path)}
            className="absolute inset-0 w-full h-full relative"
          >
            {/* Background Visual with Smooth Zoom Animation */}
            <motion.img
              initial={{ scale: 1 }}
              animate={{ scale: 1.08 }}
              transition={{ duration: 5, ease: "linear" }}
              src={currentAd.image}
              alt={currentAd.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />

            {/* Cinematic Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r ${currentAd.themeColor} opacity-85 mix-blend-multiply`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

            {/* Content Container */}
            <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-6 text-white z-20">
              
              {/* Top Badge */}
              <div className="mt-6 sm:mt-5">
                <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1 rounded-full text-[10px] sm:text-xs font-black tracking-wide shadow-md text-amber-300">
                  {currentAd.badge}
                </span>
              </div>

              {/* Middle Animated Text & Info */}
              <div className="space-y-1 sm:space-y-1.5 max-w-[85%] sm:max-w-[70%]">
                <motion.h2 
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight leading-tight drop-shadow-lg text-white"
                >
                  {currentAd.title}
                </motion.h2>

                <motion.p 
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-xs sm:text-sm font-bold text-emerald-200 drop-shadow"
                >
                  {currentAd.subtitle}
                </motion.p>

                <motion.p 
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="text-[10px] sm:text-xs text-gray-200 line-clamp-2 font-medium opacity-90"
                >
                  {currentAd.description}
                </motion.p>
              </div>

              {/* Bottom CTA Action Bar */}
              <div className="flex items-center justify-between pt-1">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(currentAd.path);
                  }}
                  className="bg-white hover:bg-emerald-50 text-gray-900 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm shadow-lg flex items-center gap-2 group/btn cursor-pointer"
                >
                  <span>{currentAd.ctaText}</span>
                  <ArrowRight className="w-4 h-4 text-emerald-600 group-hover/btn:translate-x-1 transition-transform" />
                </motion.button>

                <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold text-gray-300 italic">
                  <Play className="w-3 h-3 text-emerald-400 fill-emerald-400 animate-pulse" />
                  <span>Real Billboard Ad Loop</span>
                </div>
              </div>

            </div>
          </motion.div>
        </AnimatePresence>

        {/* Billboard Indicator Dots */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-40">
          {BILLBOARD_ITEMS.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${currentIndex === idx ? "w-6 bg-[#ffb703] shadow-md" : "w-1.5 bg-white/50 hover:bg-white"}`}
            />
          ))}
        </div>

      </div>
    </div>
  );
};
