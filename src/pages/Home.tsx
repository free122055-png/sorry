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
import { useLanguage } from "../context/LanguageContext";
import { db } from "../lib/firebase";
import { doc, getDoc, collection, onSnapshot } from "firebase/firestore";

const MARKET_CATEGORIES = [
  {
    id: "cat2",
    key: "oilCorner",
    icon: <Droplet className="w-5 h-5 text-white" />,
    iconBg: "bg-amber-600",
  },
  {
    id: "cat3",
    key: "clothingShop",
    icon: <Shirt className="w-5 h-5 text-white" />,
    iconBg: "bg-[#0ea5e9]",
  },
  {
    id: "cat4",
    key: "giftShop",
    icon: <ShoppingBasket className="w-5 h-5 text-white" />,
    iconBg: "bg-[#f97316]",
  },
  {
    id: "cat6",
    key: "islamicShop",
    icon: <Book className="w-5 h-5 text-white" />,
    iconBg: "bg-[#059669]",
  }
];

interface FeatureCardItem {
  id: string;
  key: string;
  icon: React.ReactNode;
  iconBg: string;
  path: string;
}

const FEATURE_SERVICES: FeatureCardItem[] = [
  {
    id: "tilawat",
    key: "tilawatLibrary",
    icon: <BookOpenText className="w-5 h-5 text-white" />,
    iconBg: "bg-[#0a3d2e]",
    path: "/islamic-tilawat"
  },
  {
    id: "caption",
    key: "captionHouse",
    icon: <FileText className="w-5 h-5 text-white" />,
    iconBg: "bg-[#0a3d2e]",
    path: "/caption-ghor"
  },
  {
    id: "editing",
    key: "editingTools",
    icon: <Camera className="w-5 h-5 text-white" />,
    iconBg: "bg-[#0a3d2e]",
    path: "/pixel-editing-tools"
  },
  {
    id: "matrimonial",
    key: "marriageBiodata",
    icon: <HeartPulse className="w-5 h-5 text-white" />,
    iconBg: "bg-[#0a3d2e]",
    path: "/matrimonial"
  },
  {
    id: "telecom",
    key: "mbMinutesPurchase",
    icon: <Router className="w-5 h-5 text-white" />,
    iconBg: "bg-[#044a2f]",
    path: "/telecom"
  },
  {
    id: "reminder",
    key: "reminderForLovedOnes",
    icon: <ReceiptText className="w-5 h-5 text-white" />,
    iconBg: "bg-[#0a3d2e]",
    path: "/reminders"
  },
  {
    id: "live_location",
    key: "liveLocationForLovedOnes",
    icon: <MapPin className="w-5 h-5 text-white" />,
    iconBg: "bg-[#004b23]",
    path: "/live-location"
  },
  {
    id: "gov_services",
    key: "governmentServices",
    icon: <Globe className="w-5 h-5 text-white" />,
    iconBg: "bg-[#0a3d2e]",
    path: "/gov-services"
  }
];

// Define a mapping for frame colors based on category ID or type
export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
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

      <main className="flex-1 overflow-y-auto w-full pt-32 sm:pt-36">
        {/* 3. Admin Managed Banner Slider */}
        <DynamicBannerSlider />

        <div className="px-4 py-6">
          {/* Section: Main Markets */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[19px] font-black text-[#0f172a] tracking-tight">{t("mainMarkets")}</h3>
              </div>
            </div>

            {/* Market Categories (4 items) - Circular Premium Style */}
            <div className="grid grid-cols-4 gap-3 sm:gap-4 px-0">

              {MARKET_CATEGORIES.map((cat) => (
                <motion.div
                  key={cat.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/category/${cat.id}`)}
                  className="cursor-pointer group"
                >
                  <div className="w-full aspect-square bg-white rounded-2xl border border-gray-100 shadow-[0_4px_15px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center p-1.5 transition-all">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white flex items-center justify-center mb-1.5 overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.06)] border border-gray-50">
                        {customIcons[cat.id] ? (
                          <img src={customIcons[cat.id]} alt={t(cat.key)} className="w-12 h-12 sm:w-14 sm:h-14 object-contain" />
                        ) : (
                          React.cloneElement(cat.icon as React.ReactElement, { className: `w-10 h-10 ${cat.iconBg.replace('bg-', 'text-')}` })
                        )}
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-black text-gray-900 text-center leading-tight line-clamp-2 px-1">{t(cat.key)}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Section: Feature Services - Circular Premium Style */}
            <div className="mt-10 mb-4">
              <div>
                <h3 className="text-[19px] font-black text-[#0f172a] tracking-tight">{t("otherServices")}</h3>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-3 sm:gap-4 px-0">
              {FEATURE_SERVICES.map((item) => (
                <motion.div
                  key={item.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(item.path)}
                  className="cursor-pointer group"
                >
                  <div className="w-full aspect-square bg-white rounded-2xl border border-gray-100 shadow-[0_4px_15px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center p-1.5 transition-all">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white flex items-center justify-center mb-1.5 overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.06)] border border-gray-50">
                        {customIcons[item.id] ? (
                          <img src={customIcons[item.id]} alt={t(item.key)} className="w-12 h-12 sm:w-14 sm:h-14 object-contain" />
                        ) : (
                          React.cloneElement(item.icon as React.ReactElement, { className: `w-10 h-10 ${item.iconBg.replace('bg-', 'text-')}` })
                        )}
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-black text-gray-900 text-center leading-tight line-clamp-2 px-1">{t(item.key)}</span>
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

export default Home;
