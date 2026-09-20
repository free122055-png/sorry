import React, { useState, useEffect, useRef } from "react";
import { 
  Type, Upload, Plus, Trash2, CheckCircle2, AlertCircle, 
  Eye, RefreshCw, Globe, Sparkles, Filter, Search, 
  Check, X, FileUp, DownloadCloud, Layers, Zap
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../../lib/firebase";
import { 
  collection, onSnapshot, doc, deleteDoc, 
  setDoc, query, orderBy 
} from "firebase/firestore";
import { FONTS_LIST, FontItem } from "../../data/pixelEditorData";
import { loadCustomFont, CustomCloudFont } from "../../lib/fontLoader";

export const FontManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"list" | "upload" | "webfont">("list");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [firestoreFonts, setFirestoreFonts] = useState<CustomCloudFont[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Upload Form State
  const [fontName, setFontName] = useState("");
  const [fontCategory, setFontCategory] = useState<FontItem["category"]>("bangla");
  const [fontFamilyName, setFontFamilyName] = useState("");
  const [previewSample, setPreviewSample] = useState("আমার সোনার বাংলা আমি তোমায় ভালোবাসি");
  const [fontFile, setFontFile] = useState<File | null>(null);
  const [fontDataUrl, setFontDataUrl] = useState<string>("");
  const [fileFormat, setFileFormat] = useState<string>("");
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Web / Google Font Form State
  const [webFontName, setWebFontName] = useState("");
  const [webFontFamily, setWebFontFamily] = useState("");
  const [webFontCssUrl, setWebFontCssUrl] = useState("");
  const [webFontCategory, setWebFontCategory] = useState<FontItem["category"]>("bangla");
  const [webFontPreview, setWebFontPreview] = useState("সবুজ শ্যামল বাংলাদেশ");

  // Live Test typing
  const [testText, setTestText] = useState("আমার সোনার বাংলা আমি তোমায় ভালোবাসি");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch custom fonts from Firestore
  useEffect(() => {
    const q = query(collection(db, "pixel_custom_fonts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fonts: CustomCloudFont[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as CustomCloudFont;
        fonts.push({ ...data, id: docSnap.id });
        // Dynamically register font in document.fonts
        loadCustomFont(data);
      });
      setFirestoreFonts(fonts);
      setLoading(false);
    }, (err) => {
      console.error("Firestore custom fonts fetch error:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Update default sample text when category changes
  useEffect(() => {
    if (fontCategory === "bangla") {
      setPreviewSample("আমার সোনার বাংলা আমি তোমায় ভালোবাসি");
    } else if (fontCategory === "english") {
      setPreviewSample("The quick brown fox jumps over the lazy dog");
    } else if (fontCategory === "arabic") {
      setPreviewSample("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ");
    } else if (fontCategory === "signature") {
      setPreviewSample("Creative Signature Typography");
    } else if (fontCategory === "jakir_mod") {
      setPreviewSample("আলিনুর প্রত্যয় প্রিমিয়াম টাইপোগ্রাফি");
    }
  }, [fontCategory]);

  useEffect(() => {
    if (webFontCategory === "bangla") {
      setWebFontPreview("আমার সোনার বাংলা আমি তোমায় ভালোবাসি");
    } else if (webFontCategory === "english") {
      setWebFontPreview("Typography Master Headline");
    } else if (webFontCategory === "arabic") {
      setWebFontPreview("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ");
    }
  }, [webFontCategory]);

  // Handle local font file upload (.ttf, .otf, .woff, .woff2)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    if (!["ttf", "otf", "woff", "woff2"].includes(extension)) {
      showToast("দয়া করে শুধুমাত্র .ttf, .otf, .woff বা .woff2 ফরম্যাটের ফন্ট ফাইল আপলোড করুন!", "error");
      return;
    }

    setIsProcessingFile(true);
    setFontFile(file);
    setFileFormat(extension.toUpperCase());

    // Clean name from file name
    const rawName = file.name.replace(/\.[^/.]+$/, "");
    const cleanDisplayName = rawName.replace(/[_-]/g, " ");
    if (!fontName) {
      setFontName(cleanDisplayName);
    }

    const safeFamilyName = `Custom_${rawName.replace(/[^a-zA-Z0-9]/g, "_")}`;
    setFontFamilyName(`"${safeFamilyName}", sans-serif`);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = event.target?.result as string;
        setFontDataUrl(base64Data);

        // Try live loading immediately to preview
        try {
          const fontFace = new FontFace(safeFamilyName, `url(${base64Data})`);
          await fontFace.load();
          document.fonts.add(fontFace);
          showToast(`"${cleanDisplayName}" ফন্ট সফলভাবে লোড হয়েছে! প্রিভিউ দেখুন।`, "success");
        } catch (err) {
          console.warn("Could not preview font immediately:", err);
        }
        setIsProcessingFile(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Error reading font file:", err);
      showToast("ফন্ট ফাইল রিড করতে সমস্যা হয়েছে!", "error");
      setIsProcessingFile(false);
    }
  };

  // Save uploaded font to Firestore
  const handleSaveUploadedFont = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fontName.trim()) {
      showToast("ফন্টের নাম লিখুন!", "error");
      return;
    }
    if (!fontDataUrl) {
      showToast("দয়া করে একটি ফন্ট ফাইল (.ttf / .otf / .woff) সিলেক্ট করুন!", "error");
      return;
    }

    setIsSaving(true);
    try {
      const fontId = `custom-font-${Date.now()}`;
      const newFont: CustomCloudFont = {
        id: fontId,
        name: fontName.trim(),
        family: fontFamilyName || `"${fontName.trim().replace(/\s+/g, '_')}", sans-serif`,
        category: fontCategory,
        previewText: previewSample.trim() || "আমার সোনার বাংলা",
        fontDataUrl: fontDataUrl,
        format: fileFormat || "TTF",
        fileSize: fontFile ? `${(fontFile.size / 1024).toFixed(1)} KB` : "150 KB",
        isActive: true,
        isCustom: true,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, "pixel_custom_fonts", fontId), newFont);
      await loadCustomFont(newFont);

      showToast(`🎉 "${fontName}" ফন্ট সফলভাবে ক্লাউডে সেভ হয়েছে! সকল ইউজার এখন এটি পাবে।`, "success");

      // Reset form
      setFontName("");
      setFontFamilyName("");
      setFontFile(null);
      setFontDataUrl("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setActiveTab("list");
    } catch (error: any) {
      console.error("Error saving font to Firestore:", error);
      showToast("ফন্ট সেভ করতে সমস্যা হয়েছে: " + (error?.message || "Error"), "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Save Google Font / Web Font to Firestore
  const handleSaveWebFont = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webFontName.trim()) {
      showToast("ফন্টের নাম লিখুন!", "error");
      return;
    }
    if (!webFontFamily.trim()) {
      showToast("CSS Font Family নাম লিখুন!", "error");
      return;
    }

    setIsSaving(true);
    try {
      const fontId = `web-font-${Date.now()}`;
      const newFont: CustomCloudFont = {
        id: fontId,
        name: webFontName.trim(),
        family: webFontFamily.trim(),
        cssUrl: webFontCssUrl.trim() || undefined,
        category: webFontCategory,
        previewText: webFontPreview.trim() || "আমার সোনার বাংলা",
        format: "Web / Google Font",
        fileSize: "CDN Cloud",
        isActive: true,
        isCustom: true,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, "pixel_custom_fonts", fontId), newFont);
      await loadCustomFont(newFont);

      showToast(`🎉 ওয়েব ফন্ট "${webFontName}" সফলভাবে সেভ হয়েছে!`, "success");

      setWebFontName("");
      setWebFontFamily("");
      setWebFontCssUrl("");
      setActiveTab("list");
    } catch (error: any) {
      console.error("Error saving web font:", error);
      showToast("ওয়েব ফন্ট সেভ করতে সমস্যা হয়েছে: " + (error?.message || "Error"), "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete font from Firestore
  const handleDeleteFont = async (id: string, name: string) => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে "${name}" ফন্টটি ডিলিট করতে চান?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, "pixel_custom_fonts", id));
      showToast(`"${name}" ফন্টটি ডিলিট করা হয়েছে।`, "success");
    } catch (error: any) {
      console.error("Error deleting font:", error);
      showToast("ফন্ট ডিলিট করতে সমস্যা হয়েছে!", "error");
    }
  };

  // Toggle font active status
  const handleToggleActive = async (font: CustomCloudFont) => {
    try {
      const updatedStatus = !(font.isActive ?? true);
      await setDoc(doc(db, "pixel_custom_fonts", font.id), {
        isActive: updatedStatus
      }, { merge: true });
      showToast(`ফন্ট স্ট্যাটাস আপডেট হয়েছে (${updatedStatus ? "Active" : "Inactive"})`);
    } catch (err) {
      console.error("Error updating font status:", err);
    }
  };

  // Combine built-in fonts and custom firestore fonts for the browser view
  const allFontsList: CustomCloudFont[] = [
    ...firestoreFonts,
    ...FONTS_LIST.map(f => ({ ...f, isActive: true, isCustom: false }))
  ];

  const filteredFonts = allFontsList.filter(f => {
    const matchesCat = categoryFilter === "all" || f.category === categoryFilter || (categoryFilter === "custom" && f.isCustom);
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          f.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const customCount = firestoreFonts.length;
  const banglaCount = allFontsList.filter(f => f.category === "bangla").length;
  const englishCount = allFontsList.filter(f => f.category === "english").length;
  const arabicCount = allFontsList.filter(f => f.category === "arabic").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border font-bold text-sm ${
              toast.type === "error" 
                ? "bg-red-950/90 text-red-200 border-red-800" 
                : "bg-emerald-950/90 text-emerald-200 border-emerald-800"
            }`}
          >
            {toast.type === "error" ? <AlertCircle className="w-5 h-5 text-red-400" /> : <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="relative rounded-3xl p-6 md:p-8 bg-gradient-to-br from-[#121829] via-[#0f1422] to-[#0a0d18] border border-blue-500/20 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-bold shadow-lg shadow-blue-600/20">
                <Type className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black text-white tracking-wide flex items-center gap-2">
                  <span>ফন্ট ম্যানেজমেন্ট সেন্টার</span>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 font-bold uppercase tracking-wider">
                    Cloud Typography
                  </span>
                </h1>
                <p className="text-xs md:text-sm text-gray-400">
                  পিক্সেল ল্যাব ও এডিটরে সরাসরি নতুন বাংলা, ইংরেজি ও আরবি ফন্ট ফাইল (.ttf / .otf / .woff) আপলোড বা ওয়েব ফন্ট যুক্ত করুন।
                </p>
              </div>
            </div>
          </div>

          {/* Action Tabs */}
          <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10 shrink-0">
            <button
              onClick={() => setActiveTab("list")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "list" 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" 
                  : "text-gray-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>সকল ফন্ট ({allFontsList.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("upload")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "upload" 
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30" 
                  : "text-gray-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <FileUp className="w-4 h-4" />
              <span>ফন্ট ফাইল আপলোড</span>
            </button>
            <button
              onClick={() => setActiveTab("webfont")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "webfont" 
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30" 
                  : "text-gray-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>ওয়েব / গুগল ফন্ট</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400">মোট ফন্ট</span>
            <span className="text-lg font-black text-white">{allFontsList.length} টি</span>
          </div>
          <div className="bg-emerald-500/10 rounded-2xl p-3 border border-emerald-500/20 flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-300">এডমিন ক্লাউড ফন্ট</span>
            <span className="text-lg font-black text-emerald-400">{customCount} টি</span>
          </div>
          <div className="bg-blue-500/10 rounded-2xl p-3 border border-blue-500/20 flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-300">বাংলা ফন্ট</span>
            <span className="text-lg font-black text-blue-400">{banglaCount} টি</span>
          </div>
          <div className="bg-amber-500/10 rounded-2xl p-3 border border-amber-500/20 flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-300">আরবি ও ইংরেজি</span>
            <span className="text-lg font-black text-amber-400">{arabicCount + englishCount} টি</span>
          </div>
        </div>
      </div>

      {/* Tab 1: Upload Font File */}
      {activeTab === "upload" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0e121d] border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl"
        >
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <FileUp className="w-5 h-5 text-emerald-400" />
                <span>নতুন ফন্ট ফাইল আপলোড করুন (.ttf / .otf / .woff)</span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                কম্পিউটার বা মোবাইল থেকে ফন্ট ফাইল সিলেক্ট করলে এটি সরাসরি ক্লাউডে সংরক্ষিত হবে এবং এডিটরে চলে আসবে।
              </p>
            </div>
            <button
              onClick={() => setActiveTab("list")}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSaveUploadedFont} className="space-y-6">
            {/* File Dropzone */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-emerald-500/40 hover:border-emerald-400 bg-emerald-950/20 hover:bg-emerald-950/30 rounded-3xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 group"
            >
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".ttf,.otf,.woff,.woff2,font/ttf,font/otf,font/woff,font/woff2" 
                className="hidden" 
                onChange={handleFileChange}
              />
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/20">
                <Upload className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-sm md:text-base font-bold text-white">
                  {fontFile ? `নির্বাচিত ফাইল: ${fontFile.name}` : "ফন্ট ফাইল বেছে নিতে এখানে ক্লিক করুন বা ড্র্যাগ করুন"}
                </h3>
                <p className="text-xs text-emerald-300/80 mt-1">
                  সাপোর্টেড ফরম্যাট: .ttf, .otf, .woff, .woff2 (সর্বোচ্চ সাইজ ২-৫ MB)
                </p>
              </div>
              {fontFile && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
                  <Check className="w-3.5 h-3.5" />
                  <span>ফরম্যাট: {fileFormat} • সাইজ: {(fontFile.size / 1024).toFixed(1)} KB</span>
                </div>
              )}
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Font Name */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-300">
                  ফন্টের নাম (Display Name) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fontName}
                  onChange={(e) => setFontName(e.target.value)}
                  placeholder="যেমন: Li Alinur Prottoyo, Shurjo Bold, Shonar Bangla"
                  className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-300">ফন্ট ক্যাটাগরি</label>
                <select
                  value={fontCategory}
                  onChange={(e) => setFontCategory(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#141926] border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value="bangla">বাংলা ফন্ট (Bangla)</option>
                  <option value="english">ইংরেজি ফন্ট (English)</option>
                  <option value="arabic">ইসলামিক ও আরবি ফন্ট (Arabic)</option>
                  <option value="signature">সিগনেচার ও ক্যালিগ্রাফি (Signature)</option>
                  <option value="jakir_mod">মড ও ফিচার্ড ফন্ট (Featured)</option>
                  <option value="shapes">সিম্বল ও শেপ ফন্ট (Shapes)</option>
                </select>
              </div>

              {/* Font Family (CSS) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-300">
                  CSS Font Family Name (স্বয়ংক্রিয়ভাবে তৈরি হবে)
                </label>
                <input
                  type="text"
                  value={fontFamilyName}
                  onChange={(e) => setFontFamilyName(e.target.value)}
                  placeholder="যেমন: 'Custom_FontName', sans-serif"
                  className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Preview Text */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-300">নমুনা প্রিভিউ টেক্সট</label>
                <input
                  type="text"
                  value={previewSample}
                  onChange={(e) => setPreviewSample(e.target.value)}
                  placeholder="আমার সোনার বাংলা আমি তোমায় ভালোবাসি"
                  className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Live Interactive Preview Box */}
            <div className="p-6 rounded-3xl bg-black/40 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span>লাইভ ফন্ট রেন্ডার প্রিভিউ:</span>
                </span>
                <span className="text-[11px] text-emerald-400 font-mono">
                  {fontFamilyName || "Default Sans-serif"}
                </span>
              </div>
              <div 
                style={{ fontFamily: fontFamilyName || "sans-serif" }}
                className="p-6 rounded-2xl bg-white/5 border border-white/5 text-center text-2xl md:text-3xl text-white font-medium break-words leading-relaxed"
              >
                {previewSample || "আমার সোনার বাংলা আমি তোমায় ভালোবাসি"}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab("list")}
                className="px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-sm transition-all"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={isSaving || isProcessingFile || !fontDataUrl}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-emerald-600/30 flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>সেভ হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>ফন্ট ক্লাউডে যুক্ত করুন</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Tab 2: Web / Google Font Link */}
      {activeTab === "webfont" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0e121d] border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl"
        >
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-400" />
                <span>ওয়েব / গুগল ফন্ট যুক্ত করুন (Google Fonts / CDN)</span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Google Fonts বা যেকোনো ওয়েব ফন্টের নাম ও CSS লিঙ্ক দিলে তা অ্যাপে সরাসরি ইন্টিগ্রেট হয়ে যাবে।
              </p>
            </div>
            <button
              onClick={() => setActiveTab("list")}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSaveWebFont} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Web Font Name */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-300">
                  ফন্টের নাম (Display Name) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={webFontName}
                  onChange={(e) => setWebFontName(e.target.value)}
                  placeholder="যেমন: Anek Bangla, Amiri, Noto Sans Bengali"
                  className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Web Font Family */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-300">
                  CSS Font Family <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={webFontFamily}
                  onChange={(e) => setWebFontFamily(e.target.value)}
                  placeholder="যেমন: 'Anek Bangla', sans-serif"
                  className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Web Font CSS URL */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-gray-300">
                  Google Fonts CSS Stylesheet URL (ঐচ্ছিক)
                </label>
                <input
                  type="url"
                  value={webFontCssUrl}
                  onChange={(e) => setWebFontCssUrl(e.target.value)}
                  placeholder="https://fonts.googleapis.com/css2?family=Anek+Bangla:wght@400;700&display=swap"
                  className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-300">ফন্ট ক্যাটাগরি</label>
                <select
                  value={webFontCategory}
                  onChange={(e) => setWebFontCategory(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#141926] border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500"
                >
                  <option value="bangla">বাংলা ফন্ট (Bangla)</option>
                  <option value="english">ইংরেজি ফন্ট (English)</option>
                  <option value="arabic">ইসলামিক ও আরবি ফন্ট (Arabic)</option>
                  <option value="signature">সিগনেচার ও ক্যালিগ্রাফি (Signature)</option>
                  <option value="jakir_mod">মড ও ফিচার্ড ফন্ট (Featured)</option>
                </select>
              </div>

              {/* Preview text */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-300">নমুনা টেক্সট</label>
                <input
                  type="text"
                  value={webFontPreview}
                  onChange={(e) => setWebFontPreview(e.target.value)}
                  placeholder="আমার সোনার বাংলা আমি তোমায় ভালোবাসি"
                  className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Live Preview Box */}
            <div className="p-6 rounded-3xl bg-black/40 border border-white/10 space-y-3">
              <span className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-purple-400" />
                <span>লাইভ প্রিভিউ:</span>
              </span>
              <div 
                style={{ fontFamily: webFontFamily || "sans-serif" }}
                className="p-6 rounded-2xl bg-white/5 border border-white/5 text-center text-2xl md:text-3xl text-white font-medium break-words leading-relaxed"
              >
                {webFontPreview || "আমার সোনার বাংলা আমি তোমায় ভালোবাসি"}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab("list")}
                className="px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-sm"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={isSaving || !webFontName.trim()}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-purple-600/30 flex items-center gap-2 active:scale-95 transition-all"
              >
                {isSaving ? "সেভ হচ্ছে..." : "ওয়েব ফন্ট যুক্ত করুন"}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Tab 0: Fonts Directory List & Interactive Testing */}
      {activeTab === "list" && (
        <div className="space-y-6">
          {/* Filter Bar & Search */}
          <div className="bg-[#0e121d] border border-white/10 rounded-3xl p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ফন্টের নাম দিয়ে খুঁজুন..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
              {[
                { id: "all", label: "সকল ফন্ট" },
                { id: "custom", label: "🌟 এডমিন ক্লাউড" },
                { id: "bangla", label: "বাংলা" },
                { id: "english", label: "ইংরেজি" },
                { id: "arabic", label: "আরবি" },
                { id: "jakir_mod", label: "ফিচার্ড" },
                { id: "signature", label: "সিগনেচার" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    categoryFilter === cat.id
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Quick Add Buttons */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <button
                onClick={() => setActiveTab("upload")}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>ফন্ট আপলোড</span>
              </button>
              <button
                onClick={() => setActiveTab("webfont")}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/20 active:scale-95 transition-all"
              >
                <Globe className="w-4 h-4" />
                <span>ওয়েব ফন্ট</span>
              </button>
            </div>
          </div>

          {/* Interactive Live Sample Box */}
          <div className="bg-[#0b0f19] border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3">
            <span className="text-xs font-bold text-blue-400 whitespace-nowrap flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>লাইভ টেস্ট লেখা লিখুন:</span>
            </span>
            <input
              type="text"
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="যেকোনো টেক্সট লিখুন সকল ফন্টে এক সাথে দেখতে..."
              className="flex-1 w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Grid of Fonts */}
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
              <p className="text-sm text-gray-400">ফন্ট তালিকা লোড হচ্ছে...</p>
            </div>
          ) : filteredFonts.length === 0 ? (
            <div className="bg-[#0e121d] border border-white/10 rounded-3xl p-12 text-center space-y-3">
              <Type className="w-12 h-12 text-gray-500 mx-auto" />
              <h3 className="text-base font-bold text-white">কোনো ফন্ট পাওয়া যায়নি</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                আপনার খোঁজার সাথে কোনো ফন্ট মেলেনি। নতুন ফন্ট আপলোড করতে উপরের বাটনে চাপুন।
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFonts.map((font) => (
                <div
                  key={font.id}
                  className={`rounded-3xl p-5 border flex flex-col justify-between transition-all hover:border-blue-500/40 group ${
                    font.isCustom 
                      ? "bg-gradient-to-br from-[#101b2b] via-[#0d1424] to-[#080d1a] border-emerald-500/30 shadow-lg shadow-emerald-950/20" 
                      : "bg-[#0e121d] border-white/10"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-black text-white group-hover:text-blue-400 transition-colors">
                            {font.name}
                          </h3>
                          {font.isCustom && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-black uppercase">
                              Cloud Admin
                            </span>
                          )}
                        </div>
                        <span className="text-[10.5px] font-mono text-gray-400 block truncate max-w-[200px]">
                          {font.family}
                        </span>
                      </div>

                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${
                        font.category === "bangla" ? "bg-blue-500/20 text-blue-300" :
                        font.category === "english" ? "bg-amber-500/20 text-amber-300" :
                        font.category === "arabic" ? "bg-emerald-500/20 text-emerald-300" :
                        "bg-purple-500/20 text-purple-300"
                      }`}>
                        {font.category}
                      </span>
                    </div>

                    {/* Font Preview Area */}
                    <div 
                      style={{ fontFamily: font.family }}
                      className="p-4 rounded-2xl bg-black/40 border border-white/5 min-h-[90px] flex items-center justify-center text-center text-xl md:text-2xl text-white font-medium break-words leading-relaxed overflow-hidden"
                    >
                      {testText || font.previewText || "আমার সোনার বাংলা"}
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-4 mt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 font-mono">
                      {font.format || (font.isCustom ? "Custom TTF" : "Built-in System")}
                    </span>

                    {font.isCustom ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(font)}
                          className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all ${
                            font.isActive !== false
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
                              : "bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30"
                          }`}
                        >
                          {font.isActive !== false ? "Active" : "Inactive"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteFont(font.id, font.name)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                          title="ফন্ট ডিলিট করুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10.5px] text-gray-500 italic">Built-in Core</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
