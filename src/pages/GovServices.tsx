import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Search, ChevronRight, LayoutGrid, Globe, ExternalLink,
  Map, Car, Plane, CreditCard, GraduationCap, Heart, Calculator, FileText, Briefcase, Shield, MoreHorizontal
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../lib/firebase";
import { collection, query, orderBy, onSnapshot, where, getDocs, limit } from "firebase/firestore";

import { runSeed, INITIAL_GOV_CATEGORIES, INITIAL_GOV_WEBSITES } from "../scripts/seedGovData";
import { openExternalUrl } from "../lib/openUrl";

interface GovCategory {
  id: string;
  name: string;
  icon: string;
  websiteCount?: number;
}

interface GovWebsite {
  id: string;
  name: string;
  url: string;
  description: string;
  categoryId: string;
  isPopular?: boolean;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  "land": <Map className="w-6 h-6" />,
  "vehicle": <Car className="w-6 h-6" />,
  "airline": <Plane className="w-6 h-6" />,
  "nid": <CreditCard className="w-6 h-6" />,
  "education": <GraduationCap className="w-6 h-6" />,
  "health": <Heart className="w-6 h-6" />,
  "tax": <Calculator className="w-6 h-6" />,
  "license": <FileText className="w-6 h-6" />,
  "job": <Briefcase className="w-6 h-6" />,
  "police": <Shield className="w-6 h-6" />,
  "other": <MoreHorizontal className="w-6 h-6" />
};

export const GovServices: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Pre-populate initial categories for instant rendering with zero white screen delay
  const [categories, setCategories] = useState<GovCategory[]>(() => {
    return INITIAL_GOV_CATEGORIES.map((cat, idx) => ({
      id: `static-cat-${idx}`,
      name: cat.name,
      icon: cat.icon,
      websiteCount: INITIAL_GOV_WEBSITES.filter(w => w.category === cat.name).length
    }));
  });

  const [popularWebsites, setPopularWebsites] = useState<GovWebsite[]>(() => {
    return INITIAL_GOV_WEBSITES.filter(w => w.isPopular).slice(0, 6).map((w, idx) => ({
      id: `static-pop-${idx}`,
      name: w.name,
      url: w.url,
      description: w.description,
      categoryId: w.category,
      isPopular: true
    }));
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Background seed if Firestore is empty
    runSeed();

    // Fetch all websites once to count by category in memory (FAST single query instead of 24 queries!)
    let websiteCountsMap: Record<string, number> = {};
    const qAllWeb = query(collection(db, "gov_websites"));
    const unsubscribeWebs = onSnapshot(qAllWeb, (webSnap) => {
      const counts: Record<string, number> = {};
      const popList: GovWebsite[] = [];

      webSnap.docs.forEach(doc => {
        const data = doc.data() as GovWebsite;
        counts[data.categoryId] = (counts[data.categoryId] || 0) + 1;
        if (data.isPopular && popList.length < 6) {
          popList.push({ id: doc.id, ...data });
        }
      });

      websiteCountsMap = counts;
      if (popList.length > 0) {
        setPopularWebsites(popList);
      }
    });

    // Listen for categories from Firestore
    const qCat = query(collection(db, "gov_categories"), orderBy("order", "asc"));
    const unsubscribeCat = onSnapshot(qCat, (snapshot) => {
      if (snapshot.docs.length > 0) {
        const catList = snapshot.docs.map(doc => {
          const data = doc.data();
          const count = websiteCountsMap[doc.id] || INITIAL_GOV_WEBSITES.filter(w => w.category === data.name).length;
          return {
            id: doc.id,
            name: data.name,
            icon: data.icon,
            websiteCount: count
          } as GovCategory;
        });
        setCategories(catList);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeCat();
      unsubscribeWebs();
    };
  }, []);

  const handleVisit = (url: string) => {
    openExternalUrl(url);
  };

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 font-sans text-[#0f172a]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-xl font-black tracking-tight text-[#0f172a]">সরকারি ওয়েবসাইট</h1>
        <div className="ml-auto flex items-center gap-2">
           <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
              <Globe className="w-4 h-4 text-emerald-600" />
           </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Banner Section */}
        <div className="relative rounded-[32px] overflow-hidden bg-gradient-to-br from-emerald-50 to-blue-50 border border-emerald-100 p-6 flex flex-col gap-3">
           <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none">
              <Globe className="w-full h-full text-emerald-600" />
           </div>
           <p className="text-[11px] font-black uppercase tracking-widest text-emerald-600/70">এক জায়গায় সব সরকারি সেবা</p>
           <h2 className="text-2xl font-black leading-tight text-[#004b23]">সরকারি ওয়েবসাইট<br/>একসাথে</h2>
           <p className="text-xs text-gray-500 leading-relaxed max-w-[80%]">
              জমি, যানবাহন, লাইসেন্স, শিক্ষা, স্বাস্থ্য, করসহ সব সরকারি সেবা ওয়েবসাইটের লিংক এখানে পাবেন।
           </p>
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors w-5 h-5" />
          <input 
            type="text"
            placeholder="কোন সেবার ওয়েবসাইট খুঁজছেন?"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-xs"
          />
        </div>

        {/* Categories Section */}
        <div className="space-y-4">
           <div className="flex items-center justify-between px-1">
              <h3 className="text-lg font-black text-[#0f172a]">ক্যাটাগরি সমূহ</h3>
              <button className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                 সব দেখুন <ChevronRight className="w-4 h-4" />
              </button>
           </div>

           <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-white border border-gray-100 rounded-3xl animate-pulse" />
                ))
              ) : (
                filteredCategories.map((cat) => (
                  <motion.div
                    key={cat.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/gov-services/category/${cat.id}`)}
                    className="bg-white border border-gray-100 rounded-[32px] p-4 flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                       {ICON_MAP[cat.icon] || <Globe className="w-6 h-6" />}
                    </div>
                    <div className="text-center">
                       <p className="text-[13px] font-black leading-tight text-gray-800">{cat.name}</p>
                       <p className="text-[10px] text-gray-400 font-medium mt-0.5">{cat.websiteCount || 0} টি সাইট</p>
                    </div>
                  </motion.div>
                ))
              )}
           </div>
        </div>

        {/* Popular Websites List */}
        <div className="space-y-4">
           <div className="flex items-center justify-between px-1">
              <h3 className="text-lg font-black text-[#0f172a]">জনপ্রিয় সরকারি ওয়েবসাইট</h3>
              <button className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                 সব দেখুন <ChevronRight className="w-4 h-4" />
              </button>
           </div>

           <div className="space-y-2">
              {popularWebsites.map((site) => (
                <motion.div
                  key={site.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleVisit(site.url)}
                  className="bg-white border border-gray-50 rounded-2xl p-4 flex items-center gap-4 shadow-xs hover:shadow-sm transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                     <Globe className="w-6 h-6 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                     <h4 className="text-sm font-black text-[#0f172a] truncate">{site.name}</h4>
                     <p className="text-[11px] text-gray-400 truncate mt-0.5 font-medium">{site.url.replace(/^https?:\/\//, '')}</p>
                  </div>
                  <div className="p-2 text-gray-300">
                     <ChevronRight className="w-5 h-5" />
                  </div>
                </motion.div>
              ))}
           </div>
        </div>
      </main>

      {/* Bottom Nav Mock (Match Reference) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-[60]">
         <div className="flex flex-col items-center gap-1 opacity-40">
            <LayoutGrid className="w-6 h-6" />
            <span className="text-[10px] font-bold">হোম</span>
         </div>
         <div className="flex flex-col items-center gap-1 text-emerald-600">
            <Globe className="w-6 h-6" />
            <span className="text-[10px] font-bold">সরকারি সেবা</span>
         </div>
         <div className="flex flex-col items-center gap-1 opacity-40">
            <Heart className="w-6 h-6" />
            <span className="text-[10px] font-bold">পছন্দের লিংক</span>
         </div>
         <div className="flex flex-col items-center gap-1 opacity-40">
            <Briefcase className="w-6 h-6" />
            <span className="text-[10px] font-bold">প্রোফাইল</span>
         </div>
      </div>
    </div>
  );
};
