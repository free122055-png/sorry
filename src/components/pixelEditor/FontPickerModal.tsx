import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Search, Type, Upload, Clock, Plus, Trash2, Sparkles, Cloud } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FONTS_LIST, FontItem } from '../../data/pixelEditorData';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { loadCustomFont, CustomCloudFont } from '../../lib/fontLoader';

interface FontPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFont?: string;
  onSelectFont: (fontFamily: string) => void;
  sampleText?: string;
}

export const FontPickerModal: React.FC<FontPickerModalProps> = ({
  isOpen,
  onClose,
  selectedFont,
  onSelectFont,
  sampleText = 'এখানে লিখুন'
}) => {
  const [activeMainTab, setActiveMainTab] = useState<'fonts' | 'my_fonts' | 'recent'>('fonts');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'bangla' | 'english' | 'signature' | 'arabic'>('all');
  const [search, setSearch] = useState('');
  const [tempSelectedFont, setTempSelectedFont] = useState<string>(selectedFont || "'Hind Siliguri', sans-serif");
  const [cloudFonts, setCloudFonts] = useState<CustomCloudFont[]>([]);
  
  // Custom fonts loaded by user locally
  const [customFonts, setCustomFonts] = useState<FontItem[]>(() => {
    try {
      const saved = localStorage.getItem('pixellab_custom_fonts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Recent fonts
  const [recentFonts, setRecentFonts] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pixellab_recent_fonts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real-time Firestore sync for admin added fonts
  useEffect(() => {
    const q = query(collection(db, "pixel_custom_fonts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fonts: CustomCloudFont[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as CustomCloudFont;
        if (data.isActive !== false) {
          fonts.push({ ...data, id: docSnap.id });
          loadCustomFont(data);
        }
      });
      setCloudFonts(fonts);
    }, (err) => {
      console.warn("Could not fetch cloud fonts:", err);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedFont) {
      setTempSelectedFont(selectedFont);
    }
  }, [selectedFont, isOpen]);

  if (!isOpen) return null;

  // Handle custom font file upload (.ttf / .otf / .woff)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fontName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");
      const fontId = `custom-${Date.now()}-${i}`;
      const familyName = `Custom_${fontName}`;

      try {
        const buffer = await file.arrayBuffer();
        const fontFace = new FontFace(familyName, buffer);
        await fontFace.load();
        document.fonts.add(fontFace);

        const newFontItem: FontItem = {
          id: fontId,
          name: file.name.replace(/\.[^/.]+$/, ""),
          family: `"${familyName}", sans-serif`,
          category: 'bangla',
          previewText: sampleText || 'কাস্টম ফন্ট প্রিভিউ',
          isCustom: true
        };

        setCustomFonts(prev => {
          const updated = [newFontItem, ...prev.filter(f => f.name !== newFontItem.name)];
          try {
            localStorage.setItem('pixellab_custom_fonts', JSON.stringify(updated));
          } catch (err) {
            console.warn('Could not persist custom fonts metadata', err);
          }
          return updated;
        });
        setTempSelectedFont(newFontItem.family);
      } catch (err) {
        console.error('Failed to load custom font:', err);
      }
    }
  };

  const handleApply = (fontFamilyToApply?: string) => {
    const font = fontFamilyToApply || tempSelectedFont;
    onSelectFont(font);
    
    // Save to recents
    setRecentFonts(prev => {
      const updated = [font, ...prev.filter(f => f !== font)].slice(0, 20);
      try {
        localStorage.setItem('pixellab_recent_fonts', JSON.stringify(updated));
      } catch (e) {
        console.warn('Recent fonts store error', e);
      }
      return updated;
    });

    onClose();
  };

  // Combine cloud (admin), custom local, and standard fonts
  const allAvailableFonts = [...cloudFonts, ...customFonts, ...FONTS_LIST];

  // Filter fonts
  const filteredFonts = allAvailableFonts.filter(font => {
    const matchesCategory = categoryFilter === 'all' || font.category === categoryFilter;
    const matchesSearch = font.name.toLowerCase().includes(search.toLowerCase()) || 
                          (font.previewText && font.previewText.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Grouping for the fonts tab
  const categoryHeaders: { id: typeof categoryFilter; label: string; bg: string }[] = [
    { id: 'bangla', label: 'Bangla Font (বাংলা ফন্টসমূহ)', bg: 'bg-[#1e293b]' },
    { id: 'english', label: 'English Font (ইংরেজি ফন্টসমূহ)', bg: 'bg-[#1e293b]' },
    { id: 'signature', label: 'Signature Font (স্বাক্ষর ও স্ক্রিপ্ট)', bg: 'bg-[#1e293b]' },
    { id: 'arabic', label: 'Arabic Font (আরবি ও ইসলামিক ফন্ট)', bg: 'bg-[#1e293b]' }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={onClose} 
          className="absolute inset-0 bg-black/85 backdrop-blur-sm" 
        />
        
        <motion.div 
          initial={{ y: '100%' }} 
          animate={{ y: 0 }} 
          exit={{ y: '100%' }} 
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-[#181a20] w-full max-w-xl rounded-t-[24px] sm:rounded-[24px] h-[90vh] sm:h-[85vh] flex flex-col relative border border-white/15 shadow-2xl z-10 overflow-hidden text-white"
        >
          {/* Top Live Preview Box */}
          <div className="p-3 bg-[#111317] border-b border-white/10 flex flex-col items-center justify-center min-h-[105px] shrink-0 relative">
            <div className="absolute top-2 left-3 text-[10px] uppercase font-bold tracking-wider text-cyan-400/80">
              Font Preview
            </div>
            
            {/* Box container mimicking PixelLab preview with crop corners */}
            <div className="relative px-6 py-3 border border-dashed border-cyan-400/60 rounded bg-white/5 max-w-full flex items-center justify-center text-center">
              {/* Corner handles */}
              <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-cyan-400 rounded-full border border-black shadow" />
              <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-cyan-400 rounded-full border border-black shadow" />
              <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-cyan-400 rounded-full border border-black shadow" />
              <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-cyan-400 rounded-full border border-black shadow" />

              <span 
                style={{ fontFamily: tempSelectedFont }}
                className="text-lg sm:text-2xl font-normal text-white truncate max-w-[340px] sm:max-w-md tracking-normal select-none"
              >
                {sampleText || 'এখানে লিখুন'}
              </span>
            </div>
          </div>

          {/* 3 Main Tabs: FONTS / MY FONTS / RECENT */}
          <div className="grid grid-cols-3 bg-[#0d0e12] border-b border-white/10 shrink-0">
            <button
              onClick={() => setActiveMainTab('fonts')}
              className={`py-2.5 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center justify-center gap-1.5 ${
                activeMainTab === 'fonts'
                  ? 'border-cyan-400 text-cyan-400 bg-white/5'
                  : 'border-transparent text-white/50 hover:text-white/80'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              FONTS
            </button>
            <button
              onClick={() => setActiveMainTab('my_fonts')}
              className={`py-2.5 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center justify-center gap-1.5 ${
                activeMainTab === 'my_fonts'
                  ? 'border-cyan-400 text-cyan-400 bg-white/5'
                  : 'border-transparent text-white/50 hover:text-white/80'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              MY FONTS ({cloudFonts.length + customFonts.length})
            </button>
            <button
              onClick={() => setActiveMainTab('recent')}
              className={`py-2.5 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center justify-center gap-1.5 ${
                activeMainTab === 'recent'
                  ? 'border-cyan-400 text-cyan-400 bg-white/5'
                  : 'border-transparent text-white/50 hover:text-white/80'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              RECENT ({recentFonts.length})
            </button>
          </div>

          {/* Search & Category Pills for FONTS tab */}
          {activeMainTab === 'fonts' && (
            <div className="p-2.5 bg-[#14161d] space-y-2 shrink-0 border-b border-white/5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ফন্ট খুঁজুন (Search all fonts)..."
                  className="w-full bg-black/40 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Category Pills */}
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                {[
                  { id: 'all', label: 'All Fonts' },
                  { id: 'bangla', label: '🇧🇩 বাংলা' },
                  { id: 'english', label: '🔤 English' },
                  { id: 'signature', label: '✍️ Signature' },
                  { id: 'arabic', label: '🕌 Arabic' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryFilter(cat.id as any)}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold whitespace-nowrap transition-all ${
                      categoryFilter === cat.id
                        ? 'bg-cyan-500 text-black shadow'
                        : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 1: FONTS LIST */}
          {activeMainTab === 'fonts' && (
            <div className="flex-1 overflow-y-auto p-2 space-y-3 no-scrollbar">
              {categoryFilter === 'all' && !search ? (
                // Grouped by authentic PixelLab Category Headers
                categoryHeaders.map((header) => {
                  const groupFonts = allAvailableFonts.filter(f => f.category === header.id);
                  if (groupFonts.length === 0) return null;

                  return (
                    <div key={header.id} className="space-y-1">
                      <div className={`${header.bg} text-cyan-300 font-bold text-xs px-3 py-1.5 rounded-md flex items-center justify-between tracking-wide shadow`}>
                        <span>{header.label}</span>
                        <span className="text-[10px] opacity-70">({groupFonts.length})</span>
                      </div>

                      <div className="divide-y divide-white/5">
                        {groupFonts.map((font) => {
                          const isSelected = tempSelectedFont === font.family;
                          return (
                            <button
                              key={font.id}
                              onClick={() => setTempSelectedFont(font.family)}
                              onDoubleClick={() => handleApply(font.family)}
                              className={`w-full text-left p-2.5 rounded-lg transition-all flex items-center justify-between gap-3 group ${
                                isSelected 
                                  ? 'bg-cyan-950/40 border border-cyan-500/50' 
                                  : 'hover:bg-white/5 border border-transparent'
                              }`}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="text-[11px] font-medium text-white/60 group-hover:text-white/80 truncate mb-0.5">
                                  {font.name}
                                </div>
                                <div 
                                  style={{ fontFamily: font.family }} 
                                  className="text-base sm:text-lg text-white font-normal truncate tracking-normal"
                                >
                                  {sampleText || font.previewText}
                                </div>
                              </div>
                              {isSelected && (
                                <div className="w-5 h-5 rounded-full bg-cyan-400 flex items-center justify-center shrink-0 shadow">
                                  <Check className="w-3.5 h-3.5 text-black font-black" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              ) : (
                // Filtered List
                <div className="divide-y divide-white/5">
                  {filteredFonts.map((font) => {
                    const isSelected = tempSelectedFont === font.family;
                    return (
                      <button
                        key={font.id}
                        onClick={() => setTempSelectedFont(font.family)}
                        onDoubleClick={() => handleApply(font.family)}
                        className={`w-full text-left p-2.5 rounded-lg transition-all flex items-center justify-between gap-3 group ${
                          isSelected 
                            ? 'bg-cyan-950/40 border border-cyan-500/50' 
                            : 'hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-medium text-white/60 group-hover:text-white/80 truncate mb-0.5">
                            {font.name}
                          </div>
                          <div 
                            style={{ fontFamily: font.family }} 
                            className="text-base sm:text-lg text-white font-normal truncate tracking-normal"
                          >
                            {sampleText || font.previewText}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-cyan-400 flex items-center justify-center shrink-0 shadow">
                            <Check className="w-3.5 h-3.5 text-black font-black" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {filteredFonts.length === 0 && (
                <div className="text-center py-12 text-white/40 text-xs">
                  কোনো ফন্ট পাওয়া যায়নি
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MY FONTS (Cloud Admin Fonts & Local Custom TTF / OTF Upload) */}
          {activeMainTab === 'my_fonts' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              {/* Cloud Admin Fonts Section */}
              {cloudFonts.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-amber-300 font-bold px-1">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      এডমিন ও ক্লাউড ফন্টসমূহ ({cloudFonts.length})
                    </span>
                    <span className="text-[10px] text-white/50 bg-white/10 px-2 py-0.5 rounded-full">
                      অটো-সিঙ্কড
                    </span>
                  </div>

                  <div className="divide-y divide-white/5 bg-gradient-to-br from-amber-950/20 to-black/30 rounded-xl border border-amber-500/20 p-2">
                    {cloudFonts.map((font) => {
                      const isSelected = tempSelectedFont === font.family;
                      return (
                        <button
                          key={font.id}
                          onClick={() => setTempSelectedFont(font.family)}
                          onDoubleClick={() => handleApply(font.family)}
                          className={`w-full text-left p-2.5 rounded-lg transition-all flex items-center justify-between gap-3 group ${
                            isSelected 
                              ? 'bg-amber-950/50 border border-amber-400/60' 
                              : 'hover:bg-white/5 border border-transparent'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-[11px] font-bold text-amber-300 group-hover:text-amber-200 truncate">
                                {font.name}
                              </span>
                              <span className="text-[9px] px-1.5 py-0.2 bg-amber-400/20 text-amber-300 rounded font-mono">
                                Cloud
                              </span>
                            </div>
                            <div 
                              style={{ fontFamily: font.family }} 
                              className="text-base sm:text-lg text-white font-normal truncate tracking-normal"
                            >
                              {sampleText || font.previewText}
                            </div>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center shrink-0">
                              <Check className="w-3.5 h-3.5 text-black font-black" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Local TTF/OTF Font Upload Card */}
              <div className="bg-[#111317] border border-white/10 rounded-xl p-4 text-center space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".ttf,.otf,.woff,.woff2"
                  multiple
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">কাস্টম ফন্ট ফাইল যোগ করুন</h4>
                  <p className="text-xs text-white/50 mt-1">
                    আপনার মেমোরি বা ডাউনলোড ফোল্ডার থেকে .TTF অথবা .OTF ফন্ট ফাইল নির্বাচন করুন
                  </p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 mx-auto shadow-lg cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  + Add Local Font (.TTF / .OTF)
                </button>
              </div>

              {customFonts.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-white/60 font-bold px-1">
                    <span>লোকাল ফাইল থেকে যুক্ত ফন্টসমূহ ({customFonts.length})</span>
                    <button
                      onClick={() => {
                        setCustomFonts([]);
                        localStorage.removeItem('pixellab_custom_fonts');
                      }}
                      className="text-red-400 hover:text-red-300 flex items-center gap-1 text-[11px] cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      সব মুছুন
                    </button>
                  </div>

                  <div className="divide-y divide-white/5 bg-black/20 rounded-xl border border-white/5 p-2">
                    {customFonts.map((font) => {
                      const isSelected = tempSelectedFont === font.family;
                      return (
                        <button
                          key={font.id}
                          onClick={() => setTempSelectedFont(font.family)}
                          onDoubleClick={() => handleApply(font.family)}
                          className={`w-full text-left p-2.5 rounded-lg transition-all flex items-center justify-between gap-3 group ${
                            isSelected 
                              ? 'bg-cyan-950/40 border border-cyan-500/50' 
                              : 'hover:bg-white/5 border border-transparent'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] font-medium text-cyan-300 group-hover:text-cyan-200 truncate mb-0.5">
                              {font.name}
                            </div>
                            <div 
                              style={{ fontFamily: font.family }} 
                              className="text-base sm:text-lg text-white font-normal truncate tracking-normal"
                            >
                              {sampleText || font.previewText}
                            </div>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-cyan-400 flex items-center justify-center shrink-0">
                              <Check className="w-3.5 h-3.5 text-black font-black" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {cloudFonts.length === 0 && customFonts.length === 0 && (
                <div className="text-center py-6 text-white/40 text-xs">
                  এখনো কোনো কাস্টম ফন্ট যোগ করা হয়নি। এডমিন প্যানেল থেকে ফন্ট যোগ করা যাবে অথবা উপরে লোকাল ফাইল আপলোড করুন।
                </div>
              )}
            </div>
          )}

          {/* TAB 3: RECENT FONTS */}
          {activeMainTab === 'recent' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
              {recentFonts.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-white/60 font-bold px-1 mb-2">
                    <span>সম্প্রতি ব্যবহৃত ফন্টসমূহ</span>
                    <button
                      onClick={() => {
                        setRecentFonts([]);
                        localStorage.removeItem('pixellab_recent_fonts');
                      }}
                      className="text-red-400 hover:text-red-300 text-[11px]"
                    >
                      হিস্ট্রি মুছুন
                    </button>
                  </div>

                  <div className="divide-y divide-white/5">
                    {recentFonts.map((fontFamily, idx) => {
                      const matched = allAvailableFonts.find(f => f.family === fontFamily);
                      const displayName = matched ? matched.name : fontFamily.replace(/['"]/g, '');
                      const isSelected = tempSelectedFont === fontFamily;

                      return (
                        <button
                          key={idx}
                          onClick={() => setTempSelectedFont(fontFamily)}
                          onDoubleClick={() => handleApply(fontFamily)}
                          className={`w-full text-left p-2.5 rounded-lg transition-all flex items-center justify-between gap-3 group ${
                            isSelected 
                              ? 'bg-cyan-950/40 border border-cyan-500/50' 
                              : 'hover:bg-white/5 border border-transparent'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] font-medium text-white/60 group-hover:text-white/80 truncate mb-0.5">
                              {displayName}
                            </div>
                            <div 
                              style={{ fontFamily: fontFamily }} 
                              className="text-base sm:text-lg text-white font-normal truncate tracking-normal"
                            >
                              {sampleText || 'বাংলা ও English টেক্সট'}
                            </div>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-cyan-400 flex items-center justify-center shrink-0">
                              <Check className="w-3.5 h-3.5 text-black font-black" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-white/40 text-xs">
                  কোনো রিসেন্ট ফন্ট হিস্ট্রি পাওয়া যায়নি
                </div>
              )}
            </div>
          )}

          {/* Bottom Action Bar: CANCEL / OK (matching PixelLab modal) */}
          <div className="p-3 border-t border-white/10 bg-[#101216] flex items-center justify-between shrink-0">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg text-cyan-400 hover:text-cyan-300 hover:bg-white/5 text-xs font-black uppercase tracking-wider transition-colors"
            >
              CANCEL
            </button>
            <button
              onClick={() => handleApply()}
              className="px-8 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-black uppercase tracking-wider transition-all shadow-lg"
            >
              OK
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

