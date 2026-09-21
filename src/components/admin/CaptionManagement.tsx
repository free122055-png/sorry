import React, { useState, useEffect } from "react";
import { 
  Plus, Edit2, Trash2, CheckCircle2, AlertCircle, Search, 
  FolderPlus, FileText, Star, Eye, EyeOff, Save, X, Sparkles, ChevronDown, Check
} from "lucide-react";
import { db } from "../../lib/firebase";
import { 
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc 
} from "firebase/firestore";
import { DEFAULT_CAPTION_CATEGORIES, CaptionCategory } from "../../data/captionsData";

interface CaptionItem {
  id: string;
  text: string;
  category: string;
  categoryId: string;
  categorySlug?: string;
  isPopular?: boolean;
  isActive?: boolean;
  createdAt: number;
  copyCount?: number;
}

export const CaptionManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"captions" | "categories">("captions");
  const [categories, setCategories] = useState<CaptionCategory[]>(DEFAULT_CAPTION_CATEGORIES);
  const [captions, setCaptions] = useState<CaptionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Caption Form State
  const [editingCaptionId, setEditingCaptionId] = useState<string | null>(null);
  const [captionText, setCaptionText] = useState("");
  const [selectedCatId, setSelectedCatId] = useState("");
  const [isPopular, setIsPopular] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Category Form State
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catColor, setCatColor] = useState("from-blue-500 to-indigo-600");
  const [catIcon, setCatIcon] = useState("Star");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const catSnap = await getDocs(collection(db, "caption_categories"));
      const loadedCats = catSnap.docs.map(d => ({ id: d.id, ...d.data() } as CaptionCategory));
      
      // Combine DEFAULT_CAPTION_CATEGORIES with custom Firestore categories
      const combinedCats = [...DEFAULT_CAPTION_CATEGORIES];
      loadedCats.forEach(c => {
        if (!combinedCats.some(dc => dc.id === c.id || dc.slug === c.slug)) {
          combinedCats.push(c);
        }
      });
      setCategories(combinedCats);

      const capSnap = await getDocs(collection(db, "captions"));
      const loadedCaps = capSnap.docs.map(d => ({ id: d.id, ...d.data() } as CaptionItem));
      setCaptions(loadedCaps);
    } catch (err) {
      console.error("Error fetching caption data:", err);
      setCategories(DEFAULT_CAPTION_CATEGORIES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveCaption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captionText.trim() || !selectedCatId) {
      showToast("ক্যাপশন টেক্সট এবং ক্যাটাগরি আবশ্যক!");
      return;
    }

    const catObj = categories.find(c => c.id === selectedCatId);
    const catName = catObj ? catObj.name : "অন্যান্য";
    const catSlug = catObj ? catObj.slug : "other";

    try {
      if (editingCaptionId) {
        await updateDoc(doc(db, "captions", editingCaptionId), {
          text: captionText.trim(),
          category: catName,
          categoryId: selectedCatId,
          categorySlug: catSlug,
          isPopular,
          isActive
        });
        showToast("ক্যাপশন সফলভাবে আপডেট হয়েছে!");
      } else {
        await addDoc(collection(db, "captions"), {
          text: captionText.trim(),
          category: catName,
          categoryId: selectedCatId,
          categorySlug: catSlug,
          isPopular,
          isActive,
          createdAt: Date.now(),
          copyCount: 0
        });
        showToast("নতুন ক্যাপশন সফলভাবে যোগ করা হয়েছে!");
      }

      setCaptionText("");
      setEditingCaptionId(null);
      setIsPopular(false);
      fetchData();
    } catch (err) {
      console.error(err);
      showToast("সংরক্ষণ করতে সমস্যা হয়েছে।");
    }
  };

  const handleEditCaption = (item: CaptionItem) => {
    setEditingCaptionId(item.id);
    setCaptionText(item.text);
    setSelectedCatId(item.categoryId || categories[0]?.id || "");
    setIsPopular(Boolean(item.isPopular));
    setIsActive(item.isActive !== false);
  };

  const handleDeleteCaption = async (id: string) => {
    if (!window.confirm("আপনি কি এই ক্যাপশনটি ডিলিট করতে চান?")) return;
    try {
      await deleteDoc(doc(db, "captions", id));
      showToast("ক্যাপশন ডিলিট করা হয়েছে।");
      fetchData();
    } catch (err) {
      console.error(err);
      showToast("ডিলিট করতে সমস্যা হয়েছে।");
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      showToast("ক্যাটাগরির নাম আবশ্যক!");
      return;
    }

    const slug = catSlug.trim() || catName.toLowerCase().replace(/\s+/g, '-');

    try {
      if (editingCatId) {
        await updateDoc(doc(db, "caption_categories", editingCatId), {
          name: catName.trim(),
          slug,
          color: catColor,
          icon: catIcon
        });
        showToast("ক্যাটাগরি সফলভাবে আপডেট হয়েছে!");
      } else {
        await addDoc(collection(db, "caption_categories"), {
          name: catName.trim(),
          slug,
          color: catColor,
          icon: catIcon,
          isActive: true,
          sortOrder: categories.length + 1
        });
        showToast("নতুন ক্যাটাগরি সফলভাবে তৈরি হয়েছে!");
      }

      setCatName("");
      setCatSlug("");
      setEditingCatId(null);
      fetchData();
    } catch (err) {
      console.error(err);
      showToast("ক্যাটাগরি সংরক্ষণ করতে সমস্যা হয়েছে।");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm("আপনি কি এই ক্যাটাগরি ডিলিট করতে চান?")) return;
    try {
      await deleteDoc(doc(db, "caption_categories", id));
      showToast("ক্যাটাগরি ডিলিট করা হয়েছে।");
      fetchData();
    } catch (err) {
      console.error(err);
      showToast("ডিলিট করতে সমস্যা হয়েছে।");
    }
  };

  const filteredCaptions = captions.filter(c => c.text.toLowerCase().includes(searchQuery.toLowerCase()) || c.category.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 font-sans">
      {toastMessage && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-lg font-black text-gray-900">ক্যাপশন ঘর ম্যানেজমেন্ট</h2>
          <p className="text-xs text-gray-500 mt-0.5">ক্যাপশন এবং ক্যাটাগরি যুক্ত, এডিট বা ডিলিট করুন।</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("captions")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "captions" ? "bg-white text-[#005a36] shadow-xs" : "text-gray-600"}`}
          >
            📜 ক্যাপশন তালিকা ({captions.length})
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "categories" ? "bg-white text-[#005a36] shadow-xs" : "text-gray-600"}`}
          >
            🏷️ ক্যাটাগরি ({categories.length})
          </button>
        </div>
      </div>

      {activeTab === "captions" ? (
        <div className="space-y-6">
          {/* Add / Edit Caption Form */}
          <form onSubmit={handleSaveCaption} className="bg-gray-50 rounded-2xl p-5 border border-gray-200/60">
            <h3 className="text-sm font-black text-gray-800 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#005a36]" />
              <span>{editingCaptionId ? "ক্যাপশন এডিট করুন" : "নতুন ক্যাপশন যোগ করুন"}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">ক্যাপশন টেক্সট</label>
                <textarea
                  value={captionText}
                  onChange={(e) => setCaptionText(e.target.value)}
                  placeholder="এখানে ক্যাপশন লিখুন..."
                  rows={2}
                  className="w-full bg-white px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#005a36]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">ক্যাটাগরি</label>
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="w-full bg-white px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-left flex items-center justify-between text-gray-800 hover:border-[#005a36] transition-all"
                >
                  <span>{selectedCatId ? (categories.find(c => c.id === selectedCatId)?.name || "ক্যাটাগরি নির্বাচন করুন") : "ক্যাটাগরি নির্বাচন করুন"}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                <div className="flex items-center gap-4 mt-3">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPopular}
                      onChange={(e) => setIsPopular(e.target.checked)}
                      className="rounded text-[#005a36] focus:ring-[#005a36]"
                    />
                    <span>🔥 জনপ্রিয় (Popular)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Category Selection Popup Modal */}
            {isCategoryModalOpen && (
              <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                    <h3 className="text-base font-black text-gray-900">ক্যাটাগরি নির্বাচন করুন</h3>
                    <button
                      type="button"
                      onClick={() => setIsCategoryModalOpen(false)}
                      className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                    {categories.map(cat => {
                      const isSelected = selectedCatId === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setSelectedCatId(cat.id);
                            setIsCategoryModalOpen(false);
                          }}
                          className={`w-full p-3.5 rounded-2xl flex items-center justify-between transition-all border ${
                            isSelected 
                              ? "bg-[#005a36]/10 border-[#005a36] text-[#005a36] font-black" 
                              : "bg-gray-50/70 border-gray-200/80 hover:bg-gray-100 text-gray-800 font-bold"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${cat.color}`} />
                            <span className="text-xs">{cat.name}</span>
                          </div>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected ? "border-[#005a36] bg-[#005a36] text-white" : "border-gray-300 bg-white"
                          }`}>
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              {editingCaptionId && (
                <button
                  type="button"
                  onClick={() => { setEditingCaptionId(null); setCaptionText(""); }}
                  className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-300 transition-colors"
                >
                  বাতিল
                </button>
              )}
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#005a36] hover:bg-[#004b23] text-white text-xs font-black shadow-sm transition-all flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{editingCaptionId ? "আপডেট করুন" : "ক্যাপশন সেভ করুন"}</span>
              </button>
            </div>
          </form>

          {/* Search & List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ক্যাপশন বা ক্যাটাগরি সার্চ করুন..."
                  className="w-full bg-gray-50 pl-9 pr-4 py-2 rounded-xl text-xs font-medium border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#005a36]/30"
                />
              </div>
              <span className="text-xs font-bold text-gray-500">মোট ক্যাপশন: {filteredCaptions.length}টি</span>
            </div>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredCaptions.map(item => (
                <div key={item.id} className="bg-gray-50/70 p-4 rounded-2xl border border-gray-200 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#005a36]/10 text-[#005a36]">
                        {item.category}
                      </span>
                      {item.isPopular && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-700">
                          🔥 জনপ্রিয়
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-gray-800">{item.text}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleEditCaption(item)}
                      className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                      title="এডিট"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCaption(item.id)}
                      className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      title="ডিলিট"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Add / Edit Category Form */}
          <form onSubmit={handleSaveCategory} className="bg-gray-50 rounded-2xl p-5 border border-gray-200/60">
            <h3 className="text-sm font-black text-gray-800 mb-3 flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-[#005a36]" />
              <span>{editingCatId ? "ক্যাটাগরি এডিট করুন" : "নতুন ক্যাটাগরি তৈরি করুন"}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">ক্যাটাগরির নাম</label>
                <input
                  type="text"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="যেমন: ভালোবাসা"
                  className="w-full bg-white px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#005a36]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">স্লাগ (Slug)</label>
                <input
                  type="text"
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                  placeholder="যেমন: love"
                  className="w-full bg-white px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#005a36]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">ব্যাকগ্রাউন্ড গ্রেডিয়েন্ট</label>
                <select
                  value={catColor}
                  onChange={(e) => setCatColor(e.target.value)}
                  className="w-full bg-white px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#005a36]/30"
                >
                  <option value="from-red-500 to-pink-500">লাল / পিংক (Love)</option>
                  <option value="from-gray-700 to-slate-800">কালো / স্লেট (Sad)</option>
                  <option value="from-purple-600 to-indigo-600">পার্পল (Attitude)</option>
                  <option value="from-emerald-600 to-teal-700">সবুজ (Islamic)</option>
                  <option value="from-pink-500 to-rose-400">রোমান্টিক</option>
                  <option value="from-orange-500 to-amber-600">কমলা (Abhiman)</option>
                  <option value="from-blue-600 to-indigo-700">নীল (Stylish)</option>
                  <option value="from-indigo-600 to-purple-700">ইন্ডিগো</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              {editingCatId && (
                <button
                  type="button"
                  onClick={() => { setEditingCatId(null); setCatName(""); setCatSlug(""); }}
                  className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-300 transition-colors"
                >
                  বাতিল
                </button>
              )}
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#005a36] hover:bg-[#004b23] text-white text-xs font-black shadow-sm transition-all flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{editingCatId ? "ক্যাটাগরি আপডেট করুন" : "ক্যাটাগরি সেভ করুন"}</span>
              </button>
            </div>
          </form>

          {/* Categories Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {categories.map(cat => (
              <div key={cat.id} className={`p-4 rounded-2xl bg-gradient-to-br ${cat.color} text-white shadow-sm flex flex-col justify-between min-h-[100px]`}>
                <div className="flex items-start justify-between">
                  <span className="text-xs font-black">{cat.name}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setEditingCatId(cat.id); setCatName(cat.name); setCatSlug(cat.slug); setCatColor(cat.color); }}
                      className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                      title="এডিট"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-1.5 rounded-lg bg-white/20 hover:bg-red-500/80 text-white transition-colors"
                      title="ডিলিট"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <span className="text-[10px] text-white/80">Slug: {cat.slug}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
