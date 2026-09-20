import React, { useState, useEffect } from "react";
import { 
  X, Search, Sparkles, Layout, ChevronRight, 
  Crown, Image as ImageIcon, Filter, RefreshCw,
  Heart, Clock, Check, Eye, Frame, Layers, ArrowRight,
  Maximize2, Share2, Palette
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../../lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { TemplateItem, TemplateElement } from "../admin/TemplateManagement";
import { 
  FRAME_CATEGORIES, 
  TEMPLATE_CATEGORIES, 
  BUILTIN_FRAMES, 
  BUILTIN_TEMPLATES,
  CANVAS_PRESETS
} from "../../data/framesAndTemplatesData";

interface FrameTemplateLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: TemplateItem) => void;
  initialTab?: "frames" | "templates" | "presets" | "favorites" | "recent";
}

export const FrameTemplateLibraryModal: React.FC<FrameTemplateLibraryModalProps> = ({ 
  isOpen, 
  onClose, 
  onSelect,
  initialTab = "frames"
}) => {
  const [activeTab, setActiveTab] = useState<"frames" | "templates" | "presets" | "favorites" | "recent">(initialTab);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [firestoreTemplates, setFirestoreTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewItem, setPreviewItem] = useState<TemplateItem | null>(null);
  
  // Local persistence for favorites and recents
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("pixellab_favorites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [recents, setRecents] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("pixellab_recents");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Fetch Firestore templates & frames
  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    const q = query(collection(db, "templates"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TemplateItem));
      setFirestoreTemplates(list);
      setLoading(false);
    }, (err) => {
      console.warn("Firestore templates fetch notice (using builtin fallback):", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isOpen]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  // Combine Firestore + Built-in data
  const allFrames: TemplateItem[] = [
    ...BUILTIN_FRAMES,
    ...firestoreTemplates.filter(t => t.category?.includes("frame") || FRAME_CATEGORIES.some(fc => fc.id === t.category))
  ];

  const allTemplates: TemplateItem[] = [
    ...BUILTIN_TEMPLATES,
    ...firestoreTemplates.filter(t => !t.category?.includes("frame") && !FRAME_CATEGORIES.some(fc => fc.id === t.category))
  ];

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      try {
        localStorage.setItem("pixellab_favorites", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleApply = (item: TemplateItem) => {
    // Add to recents
    setRecents(prev => {
      const filtered = prev.filter(r => r !== item.id);
      const next = [item.id, ...filtered].slice(0, 20);
      try {
        localStorage.setItem("pixellab_recents", JSON.stringify(next));
      } catch {}
      return next;
    });

    setPreviewItem(null);
    onSelect(item);
    onClose();
  };

  // Determine active item list
  let currentItems: TemplateItem[] = [];
  if (activeTab === "frames") {
    currentItems = allFrames;
  } else if (activeTab === "templates") {
    currentItems = allTemplates;
  } else if (activeTab === "favorites") {
    const all = [...allFrames, ...allTemplates];
    currentItems = all.filter(item => favorites.includes(item.id));
  } else if (activeTab === "recent") {
    const all = [...allFrames, ...allTemplates];
    currentItems = recents
      .map(id => all.find(item => item.id === id))
      .filter((item): item is TemplateItem => !!item);
  }

  // Filter items by category & search
  const filteredItems = currentItems.filter(item => {
    const matchesSearch = !searchTerm.trim() || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.searchTags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = activeCategory === "all" || 
      item.category === activeCategory || 
      (activeCategory === "all_frames" && activeTab === "frames") ||
      (activeCategory === "all_templates" && activeTab === "templates");

    return matchesSearch && matchesCategory;
  });

  const currentCategories = activeTab === "frames" ? FRAME_CATEGORIES : TEMPLATE_CATEGORIES;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-5xl h-[94vh] sm:h-[88vh] bg-[#0d0d12] border border-white/10 sm:rounded-[36px] flex flex-col overflow-hidden shadow-2xl text-white select-none"
          >
            {/* 1. Header with Tab Toggles */}
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#12121a]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Layout className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                    Frame & Template Library
                  </h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    {filteredItems.length} Premium Designs Available
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-all active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2. Top Tabs: Frames | Templates | Presets | Favorites | Recent */}
            <div className="px-5 py-2.5 bg-[#0a0a0f] border-b border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
              <button
                onClick={() => { setActiveTab("frames"); setActiveCategory("all"); }}
                className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 whitespace-nowrap ${
                  activeTab === "frames"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
                }`}
              >
                <Frame className="w-4 h-4" />
                <span>🖼️ Frames (ফ্রেম)</span>
              </button>

              <button
                onClick={() => { setActiveTab("templates"); setActiveCategory("all"); }}
                className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 whitespace-nowrap ${
                  activeTab === "templates"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
                }`}
              >
                <Layout className="w-4 h-4" />
                <span>🎨 Templates (টেমপ্লেট)</span>
              </button>

              <button
                onClick={() => { setActiveTab("presets"); setActiveCategory("all"); }}
                className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 whitespace-nowrap ${
                  activeTab === "presets"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
                }`}
              >
                <Maximize2 className="w-4 h-4" />
                <span>⭐ Canvas Presets</span>
              </button>

              <button
                onClick={() => { setActiveTab("favorites"); setActiveCategory("all"); }}
                className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 whitespace-nowrap ${
                  activeTab === "favorites"
                    ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
                    : "bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
                }`}
              >
                <Heart className="w-4 h-4 fill-current" />
                <span>Favorites ({favorites.length})</span>
              </button>

              <button
                onClick={() => { setActiveTab("recent"); setActiveCategory("all"); }}
                className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 whitespace-nowrap ${
                  activeTab === "recent"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                    : "bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Recent ({recents.length})</span>
              </button>
            </div>

            {/* 3. Search & Category Filters (for Frames & Templates) */}
            {activeTab !== "presets" && (
              <div className="px-5 py-3 bg-[#111118] border-b border-white/5 flex flex-col gap-3 shrink-0">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search Birthday, Eid, Wedding, Facebook, Business, Islamic, Neon..."
                    className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs font-medium text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
                  <button
                    onClick={() => setActiveCategory("all")}
                    className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                      activeCategory === "all"
                        ? "bg-white text-black font-black"
                        : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    All (সব)
                  </button>
                  {currentCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                        activeCategory === cat.id
                          ? "bg-blue-600 text-white font-black shadow-md shadow-blue-600/30"
                          : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Main Gallery Grid */}
            <div className="flex-1 overflow-y-auto p-5 scroll-smooth bg-[#08080c]">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-3">
                  <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                  <p className="text-xs font-bold text-gray-400">লোডিং হচ্ছে...</p>
                </div>
              ) : activeTab === "presets" ? (
                /* Presets Grid */
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {CANVAS_PRESETS.map((preset) => (
                    <motion.div
                      key={preset.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        handleApply({
                          id: preset.id,
                          name: preset.name,
                          width: preset.width,
                          height: preset.height,
                          thumbnail: "",
                          category: "presets",
                          createdAt: Date.now(),
                          updatedAt: Date.now(),
                          elements: []
                        });
                      }}
                      className={`relative aspect-video rounded-2xl p-4 flex flex-col justify-between overflow-hidden cursor-pointer border border-white/10 hover:border-blue-500 shadow-lg ${preset.bgClass}`}
                    >
                      <div className="flex justify-between items-start">
                        <span className={`text-xs font-black uppercase ${preset.bgClass === 'bg-white' ? 'text-black' : 'text-white'}`}>
                          {preset.text}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 text-white/90">
                          {preset.width}×{preset.height}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-bold text-white/80">
                        <span>ক্যানভাস সাইজ</span>
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <ImageIcon className="w-7 h-7 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-200">কোনো ফ্রেম বা টেমপ্লেট পাওয়া যায়নি</h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">অন্য ক্যাটাগরি বা সার্চ কিওয়ার্ড ব্যবহার করুন</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredItems.map((item) => {
                    const isFav = favorites.includes(item.id);
                    const photoCount = item.elements?.filter(e => e.type === "placeholder" || e.type === "image").length || 0;
                    const textCount = item.elements?.filter(e => e.type === "text").length || 0;

                    return (
                      <motion.div
                        key={item.id}
                        whileHover={{ y: -3 }}
                        onClick={() => setPreviewItem(item)}
                        className="group bg-[#13131c] rounded-2xl border border-white/5 hover:border-blue-500/50 overflow-hidden shadow-lg transition-all cursor-pointer flex flex-col relative"
                      >
                        {/* Thumbnail / Visual Box */}
                        <div className="aspect-[4/3] relative bg-[#181824] overflow-hidden flex items-center justify-center">
                          {item.thumbnail ? (
                            <img 
                              src={item.thumbnail} 
                              alt={item.name} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                            />
                          ) : (
                            <div className="w-full h-full p-4 flex flex-col items-center justify-center text-center bg-gradient-to-tr from-slate-900 to-indigo-950">
                              <Layout className="w-8 h-8 text-blue-400 mb-2 opacity-60" />
                              <span className="text-[11px] font-bold text-white/80 line-clamp-2">{item.name}</span>
                            </div>
                          )}

                          {/* Dimensions Badge */}
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[9px] font-mono font-bold text-white/90 border border-white/10">
                            {item.width}×{item.height}
                          </div>

                          {/* Favorite Heart Button */}
                          <button
                            onClick={(e) => toggleFavorite(item.id, e)}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all border border-white/10"
                          >
                            <Heart className={`w-3.5 h-3.5 ${isFav ? "fill-rose-500 text-rose-500" : "text-white"}`} />
                          </button>

                          {/* Quick Layer Badges on Hover */}
                          <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1.5 opacity-90">
                            {photoCount > 0 && (
                              <span className="px-1.5 py-0.5 rounded bg-blue-600/90 text-[9px] font-black text-white">
                                📷 {photoCount} Photo
                              </span>
                            )}
                            {textCount > 0 && (
                              <span className="px-1.5 py-0.5 rounded bg-purple-600/90 text-[9px] font-black text-white">
                                ✍️ {textCount} Text
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Title & Action */}
                        <div className="p-3 flex flex-col justify-between flex-1 bg-[#13131c]">
                          <h3 className="text-xs font-bold text-white line-clamp-1 group-hover:text-blue-400 transition-colors">
                            {item.name}
                          </h3>
                          <div className="mt-2 flex items-center justify-between text-[10px] text-gray-400">
                            <span className="capitalize">{item.category?.replace(/_/g, " ")}</span>
                            <span className="text-blue-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                              Preview <ChevronRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 5. Interactive Full Preview Dialog */}
            <AnimatePresence>
              {previewItem && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                  <motion.div
                    initial={{ scale: 0.92, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.92, opacity: 0 }}
                    className="bg-[#14141e] border border-white/15 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl flex flex-col"
                  >
                    {/* Preview Header */}
                    <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#191926]">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-blue-400" />
                        <h3 className="text-sm font-black text-white">Template / Frame Preview</h3>
                      </div>
                      <button
                        onClick={() => setPreviewItem(null)}
                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Preview Visual Body */}
                    <div className="p-5 flex flex-col items-center">
                      <div className="w-full aspect-[4/3] max-h-[300px] bg-black/50 rounded-2xl overflow-hidden border border-white/10 relative flex items-center justify-center shadow-inner">
                        {previewItem.thumbnail ? (
                          <img 
                            src={previewItem.thumbnail} 
                            alt={previewItem.name} 
                            className="w-full h-full object-contain" 
                          />
                        ) : (
                          <div className="text-center p-4">
                            <Layout className="w-12 h-12 text-blue-400 mx-auto mb-2 opacity-50" />
                            <p className="text-xs font-bold text-white/70">{previewItem.name}</p>
                          </div>
                        )}
                        <span className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-sm text-[10px] font-mono text-white font-bold border border-white/10">
                          {previewItem.width} × {previewItem.height} px
                        </span>
                      </div>

                      {/* Details & Layer Highlights */}
                      <div className="w-full mt-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-black text-white">{previewItem.name}</h4>
                          <button
                            onClick={() => toggleFavorite(previewItem.id)}
                            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-rose-400"
                          >
                            <Heart className={`w-4 h-4 ${favorites.includes(previewItem.id) ? "fill-rose-500 text-rose-500" : ""}`} />
                            <span>{favorites.includes(previewItem.id) ? "Favorited" : "Favorite"}</span>
                          </button>
                        </div>

                        {/* Editable Layers Summary */}
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex flex-wrap gap-2 text-[11px] text-gray-300">
                          <span className="font-bold text-white flex items-center gap-1">
                            <Layers className="w-3.5 h-3.5 text-blue-400" />
                            {previewItem.elements?.length || 0} Editable Layers:
                          </span>
                          {previewItem.elements?.map((el, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-medium text-white/90">
                              {el.type === "placeholder" ? "📷 Photo Slot" : el.type === "text" ? `📝 "${el.content?.slice(0, 15)}..."` : `🎨 ${el.shapeType || el.type}`}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="w-full mt-5 flex gap-3">
                        <button
                          onClick={() => setPreviewItem(null)}
                          className="flex-1 py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold transition-all"
                        >
                          বাতিল (Cancel)
                        </button>
                        <button
                          onClick={() => handleApply(previewItem)}
                          className="flex-[2] py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 active:scale-95 transition-all"
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Use in Editor (এডিটরে ব্যবহার করুন)</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
