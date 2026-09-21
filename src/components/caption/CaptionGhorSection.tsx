import React, { useState, useEffect } from "react";
import { 
  Search, SlidersHorizontal, Heart, HeartCrack, Smile, Moon, Flower2, 
  Flame, Crown, CloudRain, Users, Gift, Camera, Briefcase, Share2, 
  MessageSquare, Star, Copy, Check, ChevronRight, Bookmark, ArrowLeft, X, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../../lib/firebase";
import { collection, getDocs, doc, updateDoc, increment, onSnapshot } from "firebase/firestore";
import { SEO } from "../SEO";
import { CATEGORY_CAPTIONS_MAP, DEFAULT_CAPTION_CATEGORIES, CaptionCategory } from "../../data/captionsData";

export const CaptionGhorSection: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [categories, setCategories] = useState<CaptionCategory[]>(DEFAULT_CAPTION_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CaptionCategory | null>(null);
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("caption_favorites") || "[]");
    } catch {
      return [];
    }
  });
  const [firestoreCaptions, setFirestoreCaptions] = useState<any[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    // Real-time listener for categories
    const unsubCats = onSnapshot(collection(db, "caption_categories"), (snapshot) => {
      if (!snapshot.empty) {
        const loadedCats = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as CaptionCategory));
        const combined = [...DEFAULT_CAPTION_CATEGORIES];
        loadedCats.forEach(c => {
          if (!combined.some(dc => dc.id === c.id || dc.slug === c.slug)) {
            combined.push(c);
          }
        });
        setCategories(combined.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)));
      }
    }, (err) => {
      console.warn("Category listener notice:", err);
    });

    // Real-time listener for captions added by admin
    const unsubCaps = onSnapshot(collection(db, "captions"), (snapshot) => {
      if (!snapshot.empty) {
        const loadedCaps = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as any));
        setFirestoreCaptions(loadedCaps);
      }
    }, (err) => {
      console.warn("Caption listener notice:", err);
    });

    return () => {
      unsubCats();
      unsubCaps();
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("caption_favorites", JSON.stringify(favorites));
    } catch {}
  }, [favorites]);

  const showToastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToastMsg("ক্যাপশন কপি হয়েছে ✓");
    } catch {
      showToastMsg("কপি করতে সমস্যা হয়েছে");
    }
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      if (prev.includes(id)) {
        showToastMsg("পছন্দের তালিকা থেকে সরানো হয়েছে");
        return prev.filter(item => item !== id);
      } else {
        showToastMsg("পছন্দের তালিকায় যুক্ত হয়েছে ❤️");
        return [...prev, id];
      }
    });
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case "Heart": return <Heart className="w-5 h-5 text-white fill-white/20" />;
      case "HeartCrack": return <HeartCrack className="w-5 h-5 text-white" />;
      case "Crown": return <Crown className="w-5 h-5 text-white" />;
      case "Moon": return <Moon className="w-5 h-5 text-white" />;
      case "Flower2": return <Flower2 className="w-5 h-5 text-white" />;
      case "Flame": return <Flame className="w-5 h-5 text-white" />;
      case "CloudRain": return <CloudRain className="w-5 h-5 text-white" />;
      case "Users": return <Users className="w-5 h-5 text-white" />;
      case "Gift": return <Gift className="w-5 h-5 text-white" />;
      case "Camera": return <Camera className="w-5 h-5 text-white" />;
      case "Briefcase": return <Briefcase className="w-5 h-5 text-white" />;
      case "Share2": return <Share2 className="w-5 h-5 text-white" />;
      case "MessageSquare": return <MessageSquare className="w-5 h-5 text-white" />;
      default: return <Star className="w-5 h-5 text-white" />;
    }
  };

  // Filtered categories for main search
  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    cat.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // If a category is active, render Full Screen Category View
  if (activeCategory) {
    const rawStatic = CATEGORY_CAPTIONS_MAP[activeCategory.slug] || CATEGORY_CAPTIONS_MAP["other"] || [];
    const customForCat = firestoreCaptions.filter(c => 
      c.isActive !== false && (
        c.categoryId === activeCategory.id || 
        c.categorySlug === activeCategory.slug || 
        c.category === activeCategory.name ||
        (c.category && c.category.toLowerCase() === activeCategory.name.toLowerCase())
      )
    );
    
    const combinedTexts = [
      ...customForCat.map(c => c.text),
      ...rawStatic
    ];
    const uniqueTexts = Array.from(new Set(combinedTexts));

    const captionsList = uniqueTexts.map((text, idx) => ({
      id: `cap_${activeCategory.slug}_${idx + 1}`,
      text
    })).filter(c => c.text.toLowerCase().includes(categorySearchQuery.toLowerCase()));

    return (
      <div className="min-h-screen bg-[#f3f5f8] text-gray-900 pb-24 font-sans select-none flex flex-col">
        <SEO title={`${activeCategory.name} ক্যাপশন - ক্যাপশন ঘর`} description={`${activeCategory.name} ক্যাটাগরির সেরা সব ক্যাপশন`} />

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[9999] bg-gray-900/95 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 backdrop-blur-md border border-white/10 text-sm font-bold"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {toast}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Full Screen Header */}
        <div className={`p-5 sm:p-6 bg-gradient-to-br ${activeCategory.color} text-white sticky top-0 z-40 shadow-md`}>
          <div className="max-w-4xl mx-auto flex items-center justify-between mb-4">
            <button
              onClick={() => { setActiveCategory(null); setCategorySearchQuery(""); }}
              className="p-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white transition-colors flex items-center gap-2 text-xs font-black backdrop-blur-md"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>ফিরে যান</span>
            </button>
            <div className="bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold">
              ৫০+ ক্যাপশন উপলব্ধ
            </div>
          </div>

          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-md shadow-inner">
              {getCategoryIcon(activeCategory.icon)}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">{activeCategory.name} ক্যাপশন</h1>
              <p className="text-xs text-white/80 font-medium">এক ক্লিকে কপি করুন আপনার পছন্দের স্ট্যাটাস</p>
            </div>
          </div>

          {/* Search bar inside category */}
          <div className="max-w-4xl mx-auto mt-4 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={categorySearchQuery}
              onChange={(e) => setCategorySearchQuery(e.target.value)}
              placeholder={`${activeCategory.name} ক্যাপশন খুঁজুন...`}
              className="w-full bg-white pl-11 pr-4 py-3 rounded-2xl text-xs font-semibold text-gray-800 shadow-sm focus:outline-none placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Captions List (Full Screen) */}
        <div className="max-w-4xl mx-auto w-full px-4 py-6 flex-1 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-black text-gray-500 uppercase tracking-wider">
              {activeCategory.name} তালিকা ({captionsList.length}টি)
            </h2>
          </div>

          {captionsList.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center shadow-xs border border-gray-200">
              <p className="text-sm font-bold text-gray-600">কোনো ক্যাপশন পাওয়া যায়নি</p>
            </div>
          ) : (
            captionsList.map((item) => {
              const isFav = favorites.includes(item.id);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-gray-200/80 hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                >
                  <div className="flex-1">
                    <p className="text-sm sm:text-base font-bold text-gray-800 leading-relaxed font-sans">
                      {item.text}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    <button
                      onClick={() => handleCopy(item.text, item.id)}
                      className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#005a36] hover:bg-[#004b23] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>কপি করুন</span>
                    </button>
                    <button
                      onClick={() => toggleFavorite(item.id)}
                      className={`p-2.5 rounded-xl border transition-all ${
                        isFav 
                          ? "bg-pink-50 border-pink-200 text-pink-600 shadow-xs" 
                          : "bg-gray-50 border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                      }`}
                      title="পছন্দের তালিকায় রাখুন"
                    >
                      <Heart className={`w-4 h-4 ${isFav ? "fill-pink-600 text-pink-600" : ""}`} />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // Main View: Hero, Search, Category Grid ONLY (No bottom default feed)
  return (
    <div className="min-h-screen bg-[#f3f5f8] text-gray-900 pb-24 font-sans select-none">
      <SEO title="ক্যাপশন ঘর - সব ধরনের ক্যাপশন এক জায়গায় | Al Mayadin Bazar" description="আপনার মনের কথা, আপনার স্ট্যাটাস — এখান থেকে বেছে নিন পারফেক্ট ক্যাপশন।" />

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[9999] bg-gray-900/95 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 backdrop-blur-md border border-white/10 text-sm font-bold"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Navigation if onBack provided */}
      {onBack && (
        <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center gap-3 sticky top-0 z-40 shadow-xs">
          <button onClick={onBack} className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-base font-black text-gray-900">ক্যাপশন ঘর</h1>
        </div>
      )}

      {/* 1. Hero Banner */}
      <div className="p-4 sm:p-6">
        <div className="relative rounded-3xl overflow-hidden shadow-lg bg-gradient-to-r from-[#0d1b2a] via-[#1b263b] to-[#415a77] text-white p-6 sm:p-8 flex flex-col justify-between min-h-[170px] sm:min-h-[200px]">
          <div className="absolute inset-0 opacity-25 bg-cover bg-center mix-blend-overlay" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80')` }} />
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-pink-500/20 to-transparent rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-start justify-between">
            <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15">
              <span className="text-xl">❝</span>
              <span className="text-sm font-black tracking-wide">ক্যাপশন ঘর</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-pink-300 flex items-center gap-1.5 border border-white/10">
              <Heart className="w-3.5 h-3.5 fill-pink-300 text-pink-300" />
              <span>50+ Captions Each</span>
            </div>
          </div>

          <div className="relative z-10 mt-4">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">সব ধরনের ক্যাপশন এক জায়গায়</h2>
            <p className="text-xs sm:text-sm text-gray-200 mt-1 font-medium leading-relaxed max-w-lg opacity-90">
              যেকোনো ক্যাটাগরিতে ক্লিক করুন এবং পূর্ণাঙ্গ স্ক্রিনে ৫০+ সেরা ক্যাপশন ব্রাউজ ও কপি করুন।
            </p>
          </div>
        </div>
      </div>

      {/* 2. Search Bar */}
      <div className="px-4 mb-6">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ক্যাটাগরি খুঁজুন... (যেমন: ভালোবাসা, কষ্ট, ইসলামিক)"
            className="w-full bg-white pl-12 pr-4 py-3.5 rounded-2xl text-sm font-medium text-gray-800 shadow-xs border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#005a36]/30 transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* 3. ক্যাটাগরির সমূহ (Categories Grid - Clicking opens Full Screen View) */}
      <div className="px-4 mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-5 bg-[#005a36] rounded-full" />
            <h3 className="text-base font-black text-gray-900 tracking-tight">ক্যাটাগরির সমূহ (পূর্ণাঙ্গ স্ক্রিনে খুলতে ক্লিক করুন)</h3>
          </div>
          <span className="text-xs font-bold text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-xs">
            মোট ক্যাটাগরি: {filteredCategories.length}টি
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filteredCategories.map((cat) => {
            return (
              <motion.div
                key={cat.id}
                whileTap={{ scale: 0.96 }}
                onClick={() => setActiveCategory(cat)}
                className={`p-4 rounded-2xl bg-gradient-to-br ${cat.color || "from-blue-500 to-indigo-600"} text-white shadow-md cursor-pointer flex flex-col justify-between min-h-[110px] relative overflow-hidden group hover:shadow-xl transition-all`}
              >
                <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-xs">
                    {getCategoryIcon(cat.icon)}
                  </div>
                  <span className="text-[10px] bg-white/25 px-2.5 py-1 rounded-full font-black tracking-tight">
                    ৫০+ ক্যাপশন ↗
                  </span>
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-black tracking-tight truncate mt-3">{cat.name}</h4>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
