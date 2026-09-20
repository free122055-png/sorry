import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, ShoppingBag, ChevronRight,
  Sparkles, Gift, BookOpen, Music,
  Shirt, Moon, Layers
} from "lucide-react";
import { motion } from "motion/react";
import { SEO } from "../components/SEO";
import { StorefrontFacade } from "../components/StorefrontFacade";

const BANNERS = [
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
  "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&q=80",
  "https://images.unsplash.com/photo-1470309864661-68328b2cd0a5?w=800&q=80"
];

const MARKET_CATEGORIES = [
  {
    id: "cat2",
    name: "রূপসজ্জা বাজার",
    count: "850+",
    icon: <Sparkles className="w-5 h-5 text-white" />,
    iconBg: "bg-pink-500",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&q=80"
  },
  {
    id: "cat3",
    name: "কাপড় ও পরিধান",
    count: "3200+",
    icon: <Shirt className="w-5 h-5 text-white" />,
    iconBg: "bg-[#0ea5e9]",
    image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=300&q=80"
  },
  {
    id: "cat4",
    name: "উপহার বাজার",
    count: "650+",
    icon: <Gift className="w-5 h-5 text-white" />,
    iconBg: "bg-[#f97316]",
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=300&q=80"
  },
  {
    id: "cat6",
    name: "ইসলামিক বাজার",
    count: "780+",
    icon: <Moon className="w-5 h-5 text-white" />,
    iconBg: "bg-[#059669]",
    image: "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=300&q=80"
  }
];

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [activeBanner, setActiveBanner] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setActiveBanner(prev => (prev + 1) % BANNERS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#f1f3f4] text-black flex flex-col font-sans select-none pb-20">
      <SEO 
        title="All Mayadin Fashion - Premium Shopping & Design" 
        description="Shop premium fashion, groceries and create professional designs with All Mayadin Fashion." 
      />

      <main className="flex-1 overflow-y-auto w-full">
        {/* 1. Storefront Facade */}
        <StorefrontFacade />

        {/* 2. Banner Slider */}
        <div className="px-4 mt-4">
          <div className="relative aspect-[21/9] rounded-2xl overflow-hidden shadow-sm group">
            {BANNERS.map((banner, idx) => (
              <motion.img
                key={idx}
                src={banner}
                alt={`Banner ${idx + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: activeBanner === idx ? 1 : 0 }}
                transition={{ duration: 0.8 }}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            
            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {BANNERS.map((_, idx) => (
                <div 
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${activeBanner === idx ? "w-6 bg-[#ffb703]" : "w-1.5 bg-white/50"}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="px-4 py-6">
          {/* Section: Main Markets */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-6">
              <div className="relative">
                <h3 className="text-[19px] font-black text-[#0f172a] tracking-tight">আমাদের প্রধান বাজার সমূহ</h3>
                <div className="absolute -bottom-2 left-0 w-10 h-1 bg-[#10b981] rounded-full" />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {MARKET_CATEGORIES.map((cat) => (
                <motion.div
                  key={cat.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/category/${cat.id}`)}
                  className="bg-white rounded-[16px] p-1.5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col gap-2 relative group"
                >
                  <div className="aspect-[4/5] rounded-[12px] overflow-hidden relative">
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-7 h-7 ${cat.iconBg} rounded-full flex items-center justify-center shadow-md border-2 border-white z-10`}>
                      {React.cloneElement(cat.icon as React.ReactElement, { className: "w-3.5 h-3.5 text-white" })}
                    </div>
                  </div>
                  <div className="px-0.5 pt-1.5 pb-0.5 text-center">
                    <h4 className="text-[9px] font-black text-gray-900 leading-tight mb-0.5 line-clamp-2 h-5 flex items-center justify-center">{cat.name}</h4>
                    <p className="text-[7px] font-bold text-gray-400">{cat.count} পণ্য</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Featured: Islamic Library (Compact & Slim for Mobile) */}
          <motion.div 
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/islamic-tilawat')}
            className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-[#0a3d2e] to-[#052b1b] py-2.5 px-3.5 sm:py-3.5 sm:px-5 text-white shadow-md mb-2 sm:mb-2.5 group cursor-pointer"
          >
            <div className="relative z-10 flex items-center justify-between gap-2.5">
              <div className="flex-1 min-w-0">
                <div className="bg-[#ffcc00] text-black text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tight inline-block mb-1">
                  নতুন সংযোজন
                </div>
                <h2 className="text-[13px] sm:text-[15px] font-bold mb-0.5 truncate leading-tight">
                  ইসলামিক তেলাওয়াত লাইব্রেরি
                </h2>
                <p className="text-[10px] sm:text-[11px] text-white/80 truncate leading-normal">
                  বিশ্বের সেরা ক্বারিদের কন্ঠে ১১৪ সূরার অডিও ও ডাউনলোড
                </p>
              </div>
              
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
                <ChevronRight className="w-3.5 h-3.5 text-[#0a3d2e] stroke-[1.5]" />
              </div>
            </div>
            
            {/* Background elements */}
            <div className="absolute top-1/2 -translate-y-1/2 -right-2 opacity-[0.08] pointer-events-none">
              <BookOpen className="w-16 h-16 sm:w-20 sm:h-20 stroke-[1]" />
            </div>
          </motion.div>

          {/* Creative Studio Banner (Compact & Slim for Mobile) */}
          <motion.div 
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/pixel-editing-tools')}
            className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] py-2.5 px-3.5 sm:py-3.5 sm:px-5 text-white shadow-md group cursor-pointer"
          >
            <div className="relative z-10 flex items-center justify-between gap-2.5">
              <div className="flex-1 min-w-0">
                <div className="bg-[#00f28e] text-black text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tight inline-block mb-1">
                  ক্রিয়েটিভ টুলস
                </div>
                <h2 className="text-[13px] sm:text-[15px] font-bold mb-0.5 truncate leading-tight">
                  Pixel Editing Tools
                </h2>
                <p className="text-[10px] sm:text-[11px] text-white/70 truncate leading-normal">
                  আপনার ছবিকে দিন প্রফেশনাল লুক, ফিল্টার ও এডিটিং ফ্রিতে
                </p>
              </div>
              
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center backdrop-blur-md shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
                <ChevronRight className="w-3.5 h-3.5 text-white stroke-[1.5]" />
              </div>
            </div>
            
            {/* Background elements */}
            <div className="absolute top-1/2 -translate-y-1/2 -right-2 opacity-[0.08] pointer-events-none">
              <Layers className="w-16 h-16 sm:w-20 sm:h-20 stroke-[1]" />
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};


const NavButton: React.FC<{ icon: React.ReactNode; active?: boolean }> = ({ icon, active }) => (
  <button className={`p-2 transition-all active:scale-90 relative ${active ? "text-blue-500" : "text-white/40 hover:text-white/60"}`}>
    {React.cloneElement(icon as React.ReactElement, { className: "w-8 h-8" })}
    {active && (
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6]" />
    )}
  </button>
);
