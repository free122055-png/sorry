import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, ShoppingBag, ChevronRight,
  Sparkles, Gift, BookOpen, Music,
  Shirt, Moon, Layers, Heart, Wifi, Bell, ShieldAlert, Droplet, Package, Headphones, PenTool, Palette, Users, Smartphone, Clock, Book,
  Utensils, Brush, BookOpenText, FileText, Router, CalendarCheck, Coffee, ShoppingBasket, BookCopy, Camera, HeartPulse, ReceiptText, MapPin, Globe
} from "lucide-react";
import { motion } from "motion/react";
import { SEO } from "../components/SEO";
import { StorefrontFacade } from "../components/StorefrontFacade";
import { DynamicBannerSlider } from "../components/DynamicBannerSlider";
import { AnimatedSearchInput } from "../components/AnimatedSearchInput";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { doc, getDoc, collection, onSnapshot } from "firebase/firestore";

const MARKET_CATEGORIES = [
  {
    id: "cat2",
    name: "অয়েল কর্নার",
    icon: <Droplet className="w-5 h-5 text-white" />,
    iconBg: "bg-amber-600",
  },
  {
    id: "cat3",
    name: "কাপড় ও পরিধান",
    icon: <Shirt className="w-5 h-5 text-white" />,
    iconBg: "bg-[#0ea5e9]",
  },
  {
    id: "cat4",
    name: "উপহার বাজার",
    icon: <ShoppingBasket className="w-5 h-5 text-white" />,
    iconBg: "bg-[#f97316]",
  },
  {
    id: "cat6",
    name: "ইসলামিক বাজার",
    icon: <Book className="w-5 h-5 text-white" />,
    iconBg: "bg-[#059669]",
  }
];

interface FeatureCardItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  iconBg: string;
  path: string;
}

const FEATURE_SERVICES: FeatureCardItem[] = [
  {
    id: "tilawat",
    name: "তেলাওয়াত",
    icon: <BookOpenText className="w-5 h-5 text-white" />,
    iconBg: "bg-[#0a3d2e]",
    path: "/islamic-tilawat"
  },
  {
    id: "caption",
    name: "ক্যাপশন",
    icon: <FileText className="w-5 h-5 text-white" />,
    iconBg: "bg-[#0a3d2e]",
    path: "/caption-ghor"
  },
  {
    id: "editing",
    name: "এডিটিং",
    icon: <Camera className="w-5 h-5 text-white" />,
    iconBg: "bg-[#0a3d2e]",
    path: "/pixel-editing-tools"
  },
  {
    id: "matrimonial",
    name: "বায়োডাটা",
    icon: <HeartPulse className="w-5 h-5 text-white" />,
    iconBg: "bg-[#0a3d2e]",
    path: "/matrimonial"
  },
  {
    id: "telecom",
    name: "প্যাক ক্রয়",
    icon: <Router className="w-5 h-5 text-white" />,
    iconBg: "bg-[#044a2f]",
    path: "/telecom"
  },
  {
    id: "reminder",
    name: "রিমাইন্ডার",
    icon: <ReceiptText className="w-5 h-5 text-white" />,
    iconBg: "bg-[#0a3d2e]",
    path: "/reminders"
  },
  {
    id: "live_location",
    name: "লাইভ লোকেশন",
    icon: <MapPin className="w-5 h-5 text-white" />,
    iconBg: "bg-[#004b23]",
    path: "/live-location"
  },
  {
    id: "gov_services",
    name: "সরকারি সেবা",
    icon: <Globe className="w-5 h-5 text-white" />,
    iconBg: "bg-[#0a3d2e]",
    path: "/gov-services"
  }
];

// Define a mapping for frame colors based on category ID or type
const getFrameColor = (iconBg: string) => {
  if (iconBg.includes("amber") || iconBg.includes("orange")) return "border-emerald-600";
  if (iconBg.includes("sky") || iconBg.includes("blue")) return "border-emerald-600";
  if (iconBg.includes("pink")) return "border-emerald-600";
  if (iconBg.includes("slate")) return "border-emerald-600";
  if (iconBg.includes("rose")) return "border-emerald-600";
  if (iconBg.includes("emerald") || iconBg.includes("#004b23") || iconBg.includes("#0a3d2e") || iconBg.includes("#044a2f")) return "border-emerald-600";
  return "border-emerald-600";
};

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [customIcons, setCustomIcons] = useState<Record<string, string>>({});

  useEffect(() => {
    // 1. Load cached custom icons from localStorage for 0ms instant display
    const cached = localStorage.getItem('custom_icons');
    if (cached) {
      try {
        setCustomIcons(JSON.parse(cached));
      } catch (e) {}
    }

    // 2. Real-time listener on configs_icons collection
    const unsub = onSnapshot(collection(db, 'configs_icons'), (snapshot) => {
      const icons: Record<string, string> = {};
      snapshot.docs.forEach(docSnap => {
        const data = docSnap.data();
        if (data.url) {
          icons[docSnap.id] = data.url;
        }
      });
      setCustomIcons(icons);
      try {
        localStorage.setItem('custom_icons', JSON.stringify(icons));
      } catch (e) {}
    }, (error) => {
      console.warn("Custom icons real-time listener notice:", error);
    });

    return () => unsub();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (val === "122055") {
      localStorage.setItem("admin_secret_unlocked", "true");
      navigate("/admin");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm === "122055") {
      localStorage.setItem("admin_secret_unlocked", "true");
      navigate("/admin");
      return;
    }
    if (searchTerm.trim()) {
      navigate(`/categories?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f3f4] text-black flex flex-col font-sans select-none pb-20">
      <SEO 
        title="All Mayadin Fashion - Premium Shopping & Design" 
        description="Shop premium fashion, groceries and create professional designs with All Mayadin Fashion." 
      />

      <main className="flex-1 overflow-y-auto w-full pt-20">
        {/* 1. Storefront Facade */}
        <StorefrontFacade />

        {/* 2. Overlapping Search Bar exactly matching the screenshot layout */}
        <div className="relative px-6 sm:px-10 -mt-6 sm:-mt-8 mb-6 z-30 max-w-xl mx-auto">
          <AnimatedSearchInput
            value={searchTerm}
            onChange={handleSearchChange}
            onSubmit={handleSearchSubmit}
            category="general"
            onClear={() => setSearchTerm("")}
            showClearButton={false}
            inputClassName="rounded-full pl-11 pr-4 py-4 text-sm font-black shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:border-gray-300 focus:ring-2 focus:ring-gray-100"
          />
        </div>

        {/* 3. Admin Managed Banner Slider */}
        <DynamicBannerSlider />

        <div className="px-4 py-6">
          {/* Section: Main Markets */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[19px] font-black text-[#0f172a] tracking-tight">আমাদের প্রধান বাজার সমূহ</h3>
              </div>
            </div>

            {/* Market Categories (4 items) - Circular Premium Style */}
            <div className="grid grid-cols-4 gap-x-2 sm:gap-x-3 gap-y-5 px-0 justify-items-center">

              {MARKET_CATEGORIES.map((cat) => (
                <motion.div
                  key={cat.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/category/${cat.id}`)}
                  className="flex flex-col items-center gap-1.5 cursor-pointer group"
                >
                  <div className={`w-[78px] h-[82px] sm:w-[90px] sm:h-[92px] rounded-2xl bg-white border ${getFrameColor(cat.iconBg)} flex flex-col items-center justify-center p-1.5 transition-all shadow-xs`}>
                      <div className={`w-[44px] h-[44px] rounded-full ${cat.iconBg} flex items-center justify-center mb-1 overflow-hidden shadow-xs`}>
                        {customIcons[cat.id] ? (
                          <img src={customIcons[cat.id]} alt={cat.name} className="w-full h-full object-cover" />
                        ) : (
                          React.cloneElement(cat.icon as React.ReactElement, { className: "w-6 h-6 text-white" })
                        )}
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-bold text-gray-800 text-center leading-tight truncate w-full">{cat.name}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Section: Feature Services - Circular Premium Style */}
            <div className="mt-8 mb-4">
              <div>
                <h3 className="text-[19px] font-black text-[#0f172a] tracking-tight">অন্যান্য সেবা</h3>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-x-2 sm:gap-x-3 gap-y-5 px-0 justify-items-center">
              {FEATURE_SERVICES.map((item) => (
                <motion.div
                  key={item.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(item.path)}
                  className="flex flex-col items-center gap-1.5 cursor-pointer group"
                >
                  <div className={`w-[78px] h-[82px] sm:w-[90px] sm:h-[92px] rounded-2xl bg-white border ${getFrameColor(item.iconBg)} flex flex-col items-center justify-center p-1.5 transition-all shadow-xs`}>
                      <div className={`w-[44px] h-[44px] rounded-full ${item.iconBg} flex items-center justify-center mb-1 overflow-hidden shadow-xs`}>
                        {customIcons[item.id] ? (
                          <img src={customIcons[item.id]} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          React.cloneElement(item.icon as React.ReactElement, { className: "w-6 h-6 text-white" })
                        )}
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-bold text-gray-800 text-center leading-tight truncate w-full">{item.name}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
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
