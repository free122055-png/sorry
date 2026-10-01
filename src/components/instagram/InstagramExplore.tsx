import React, { useState } from "react";
import { Search, Bookmark, Eye, Film, Sparkles, TrendingUp, Image as ImageIcon } from "lucide-react";
import { InstagramPost, InstagramReel } from "../../types/instagram";

interface InstagramExploreProps {
  posts?: InstagramPost[];
  reels?: InstagramReel[];
  onSelectItem: (item: any) => void;
}

export const InstagramExplore: React.FC<InstagramExploreProps> = ({ 
  posts = [], 
  reels = [], 
  onSelectItem 
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "🔥 ট্রেন্ডিং" },
    { id: "photo", label: "📸 ফটোগ্রাফি" },
    { id: "clips", label: "🎬 ভিডিও ক্লিপস" },
  ];

  // Map real user items
  const exploreItems = [
    ...reels.map(r => ({
      id: r.id,
      title: r.caption || "রিলস ভিডিও",
      category: "clips",
      mediaUrl: r.thumbnailUrl || r.videoUrl,
      type: "reel" as const,
      views: r.viewsCount || "১",
      original: r
    })),
    ...posts.map(p => ({
      id: p.id,
      title: p.caption || "ছবি ও পোস্ট",
      category: "photo",
      mediaUrl: p.mediaUrls?.[0] || "",
      type: "image" as const,
      views: `${p.likesCount || 0} লাইক`,
      original: p
    }))
  ];

  const filteredItems = exploreItems.filter(item => {
    const matchesQuery = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "all" || item.category === selectedCategory;
    return matchesQuery && matchesCat;
  });

  return (
    <div className="min-h-screen bg-[#0b1017] text-slate-100 pb-28 max-w-lg mx-auto md:max-w-xl font-sans">
      {/* 1. Explore Search Header */}
      <header className="sticky top-0 z-40 bg-[#0b1017]/95 backdrop-blur-xl px-4 py-3 border-b border-white/10 space-y-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex-1 bg-[#131b26] rounded-2xl px-3.5 py-2.5 flex items-center gap-2.5 border border-white/5 focus-within:border-emerald-500/50 transition-colors">
            <Search className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="এক্সপ্লোর ও নতুন আবিষ্কার করুন..."
              className="w-full bg-transparent text-xs text-white placeholder:text-slate-500 outline-none"
            />
          </div>
          <button 
            className="w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            title="সেভ করা আইটেম"
          >
            <Bookmark className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-emerald-500 text-black font-bold shadow-sm'
                  : 'bg-[#131b26] text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </header>

      {/* 2. Content or Empty State */}
      <div className="p-3 space-y-3">
        {filteredItems.length === 0 ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 mx-auto">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-bold text-white">এক্সপ্লোরে কোনো কন্টেন্ট নেই</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              নতুন পোস্ট ও রিলস তৈরি হলে এখানে স্বয়ংক্রিয়ভাবে প্রদর্শিত হবে।
            </p>
          </div>
        ) : (
          <>
            {/* Featured Hero Card */}
            {filteredItems[0] && (
              <div 
                onClick={() => onSelectItem(filteredItems[0])}
                className="relative h-48 rounded-3xl overflow-hidden cursor-pointer group border border-white/10 shadow-lg"
              >
                {filteredItems[0].mediaUrl ? (
                  <img 
                    src={filteredItems[0].mediaUrl} 
                    alt={filteredItems[0].title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                ) : (
                  <div className="w-full h-full bg-[#131b26] flex items-center justify-center text-slate-600">
                    <ImageIcon className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-4">
                  <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold mb-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>আজকের সেরা ট্রেন্ড</span>
                  </div>
                  <h3 className="text-base font-bold text-white leading-snug">{filteredItems[0].title}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{filteredItems[0].views}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Staggered 2-Column Discovery Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {filteredItems.slice(1).map(item => (
                <div 
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  className="relative aspect-[3/4] rounded-2xl bg-[#131b26] overflow-hidden cursor-pointer group border border-white/5 shadow-sm"
                >
                  {item.mediaUrl ? (
                    <img 
                      src={item.mediaUrl} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                  ) : (
                    <div className="w-full h-full bg-[#131b26] flex items-center justify-center text-slate-600">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}

                  {item.type === 'reel' && (
                    <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-xs p-1 rounded-lg text-white">
                      <Film className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                  )}

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2.5 flex flex-col justify-end">
                    <span className="text-xs font-semibold text-white line-clamp-1">{item.title}</span>
                    <div className="flex items-center gap-1 text-[10px] text-slate-300 mt-0.5">
                      <Eye className="w-3 h-3 text-emerald-400" />
                      <span>{item.views}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
