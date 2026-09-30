import React, { useState, useEffect } from "react";
import { 
  Plus, Save, Trash2, Edit2, X, Upload, Loader2, Image as ImageIcon, MapPin, Globe, CheckCircle2, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../../lib/firebase";
import { 
  collection, doc, setDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp, getDoc
} from "firebase/firestore";
import { compressImage } from "../../lib/imageUtils";

export interface ServiceCategoryIconItem {
  id: string;
  name: string;
  type: 'service' | 'market';
  defaultBadge?: string;
  currentUrl?: string;
}

const DEFAULT_ITEMS: ServiceCategoryIconItem[] = [
  { id: "live_location", name: "লাইভ লোকেশন", type: "service", defaultBadge: "📍 রিয়েল-টাইম জিও লোকেশন" },
  { id: "gov_services", name: "সরকারি সেবা", type: "service", defaultBadge: "🏛️ সরকারি পোর্টাল ও ট্র্যাকিং" },
  { id: "tilawat", name: "তেলাওয়াত", type: "service" },
  { id: "caption", name: "ক্যাপশন", type: "service" },
  { id: "editing", name: "এডিটিং", type: "service" },
  { id: "matrimonial", name: "বায়োডাটা", type: "service" },
  { id: "telecom", name: "প্যাক ক্রয়", type: "service" },
  { id: "reminder", name: "রিমাইন্ডার", type: "service" },
  { id: "cat2", name: "অয়েল কর্নার", type: "market" },
  { id: "cat3", name: "কাপড় ও পরিধান", type: "market" },
  { id: "cat4", name: "উপহার বাজার", type: "market" },
  { id: "cat6", name: "ইসলামিক বাজার", type: "market" }
];

export const CategoryIconManagement: React.FC = () => {
  const [customIcons, setCustomIcons] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<ServiceCategoryIconItem | null>(null);
  const [image, setImage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "configs_icons"), (snapshot) => {
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
      setLoading(false);
    }, (error) => {
      console.warn("Category icons listener notice:", error);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const base64 = await compressImage(file);
      setImage(base64);
      showToast("গ্যালারি থেকে ফটো প্রস্তুত হয়েছে!");
    } catch (err) {
      alert("ছবি প্রসেস করতে ব্যর্থ হয়েছে");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!editingItem || !image) {
      alert("দয়া করে গ্যালারি থেকে আইকন ফটো সিলেক্ট করুন।");
      return;
    }
    setSaveLoading(true);
    try {
      // 1. Save in configs_icons collection for instant frontend sync
      await setDoc(doc(db, "configs_icons", editingItem.id), {
        url: image,
        name: editingItem.name,
        updatedAt: serverTimestamp()
      });

      // 2. Also save in categories collection for backwards compatibility
      await setDoc(doc(db, "categories", editingItem.id), {
        title: editingItem.name,
        image: image,
        type: editingItem.type,
        updatedAt: serverTimestamp()
      }, { merge: true });

      // 3. Update localStorage for 0ms instant frontend display
      const newIcons = { ...customIcons, [editingItem.id]: image };
      setCustomIcons(newIcons);
      localStorage.setItem('custom_icons', JSON.stringify(newIcons));

      showToast(`"${editingItem.name}" এর আইকন সফলভাবে সেভ হয়েছে!`);
      setEditingItem(null);
      setImage("");
    } catch (error) {
      console.error(error);
      alert("সেভ করতে সমস্যা হয়েছে।");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleResetToDefault = async (id: string, name: string) => {
    if (!window.confirm(`আপনি কি "${name}" এর কাস্টম গ্যালারি আইকন মুছে ডিফল্ট সিস্টেম আইকনে ফেরত আনতে চান?`)) return;
    try {
      await deleteDoc(doc(db, "configs_icons", id));
      await deleteDoc(doc(db, "categories", id));

      const newIcons = { ...customIcons };
      delete newIcons[id];
      setCustomIcons(newIcons);
      localStorage.setItem('custom_icons', JSON.stringify(newIcons));

      showToast(`"${name}" এর আইকন ডিফল্ট করা হয়েছে`);
    } catch (err) {
      alert("রিসেট করতে সমস্যা হয়েছে");
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 pb-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-gray-900 italic uppercase flex items-center gap-2">
            <ImageIcon className="w-7 h-7 text-emerald-700" />
            <span>সেবা ও ক্যাটাগরি আইকন ম্যানেজার</span>
          </h2>
          <p className="text-sm text-gray-500 font-medium mt-1">
            "লাইভ লোকেশন", "সরকারি সেবা" সহ সকল সেবার আইকন সরাসরি আপনার মোবাইল গ্যালারি থেকে পরিবর্তন করুন।
          </p>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-xl flex items-center gap-2 border border-emerald-500"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section: Priority Services (Live Location & Gov Services Highlighted) */}
      <div className="mb-8">
        <h3 className="text-xs font-black text-emerald-800 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>বিশেষ হাইলাইটেড সেবাসমূহ (লাইভ লোকেশন ও সরকারি সেবা)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {DEFAULT_ITEMS.filter(item => item.id === "live_location" || item.id === "gov_services").map((item) => {
            const currentImg = customIcons[item.id];

            return (
              <div 
                key={item.id} 
                className="bg-gradient-to-r from-emerald-50 to-teal-50/60 p-5 rounded-[28px] border-2 border-emerald-200/80 shadow-sm flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-16 h-16 rounded-2xl bg-white border-2 border-emerald-500 p-1 shadow-md shrink-0 flex items-center justify-center overflow-hidden">
                    {currentImg ? (
                      <img src={currentImg} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                    ) : item.id === "live_location" ? (
                      <div className="w-full h-full bg-[#004b23] text-white rounded-xl flex items-center justify-center">
                        <MapPin className="w-8 h-8" />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-[#0a3d2e] text-white rounded-xl flex items-center justify-center">
                        <Globe className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-black text-base text-gray-900 truncate">{item.name}</h4>
                    <p className="text-xs font-semibold text-emerald-800 truncate mt-0.5">{item.defaultBadge}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900">
                      {currentImg ? "✓ গ্যালারি কাস্টম আইকন সচল" : "ডিফল্ট সিস্টেম আইকন"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <button 
                    onClick={() => {
                      setEditingItem(item);
                      setImage(currentImg || "");
                    }}
                    className="px-4 py-2.5 bg-[#004b23] hover:bg-[#00381a] text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>গ্যালারি পরিবর্তন</span>
                  </button>

                  {currentImg && (
                    <button 
                      onClick={() => handleResetToDefault(item.id, item.name)}
                      className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>রিসেট</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section: Other Feature Services & Market Categories */}
      <div>
        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">
          অন্যান্য সকল সেবা ও বাজার আইকন
        </h3>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            <span className="text-xs font-bold text-gray-400">আইকন লোড হচ্ছে...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {DEFAULT_ITEMS.filter(item => item.id !== "live_location" && item.id !== "gov_services").map((item) => {
              const currentImg = customIcons[item.id];

              return (
                <div key={item.id} className="bg-white p-4 rounded-[28px] border border-gray-100 shadow-sm flex flex-col items-center text-center group">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200 p-1 mb-3 flex items-center justify-center overflow-hidden shadow-xs">
                    {currentImg ? (
                      <img src={currentImg} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    )}
                  </div>

                  <h4 className="text-xs font-black text-gray-900 truncate w-full mb-1">{item.name}</h4>
                  <span className="text-[10px] text-gray-400 font-semibold mb-3">
                    {currentImg ? "কাস্টম আইকন" : "ডিফল্ট আইকন"}
                  </span>

                  <div className="flex items-center gap-1.5 w-full">
                    <button 
                      onClick={() => {
                        setEditingItem(item);
                        setImage(currentImg || "");
                      }}
                      className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer border border-emerald-200"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>পরিবর্তন</span>
                    </button>

                    {currentImg && (
                      <button 
                        onClick={() => handleResetToDefault(item.id, item.name)}
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all active:scale-95 cursor-pointer border border-rose-200"
                        title="রিসেট করুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[80] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[32px] p-6 w-full max-w-md shadow-2xl border border-gray-100 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-lg font-black text-gray-900">
                    "{editingItem.name}" এর গ্যালারি আইকন
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">সরাসরি ফোন/ডিভাইসের গ্যালারি থেকে আইকন বেছে নিন</p>
                </div>
                <button onClick={() => setEditingItem(null)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Upload Dropzone */}
              <label className="w-full aspect-square max-w-[180px] mx-auto border-2 border-dashed border-emerald-300 rounded-[28px] flex flex-col items-center justify-center bg-emerald-50/50 hover:bg-emerald-100/70 transition-all cursor-pointer relative overflow-hidden group shadow-inner">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                {image ? (
                  <div className="relative w-full h-full flex items-center justify-center p-2">
                    <img src={image} alt="Preview" className="w-full h-full object-contain rounded-2xl" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                      <Upload className="w-8 h-8 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 shadow-xs flex items-center justify-center mb-2">
                      {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
                    </div>
                    <span className="text-xs font-black text-emerald-900 uppercase">📱 গ্যালারি থেকে ফটো নিন</span>
                    <span className="text-[10px] text-emerald-600 mt-1">PNG, JPG, WebP</span>
                  </div>
                )}
              </label>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="flex-1 py-3.5 bg-gray-100 text-gray-700 rounded-2xl font-bold text-xs hover:bg-gray-200 transition-all"
                >
                  বাতিল
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saveLoading || isUploading || !image}
                  className="flex-1 py-3.5 bg-[#004b23] hover:bg-[#00381a] text-white rounded-2xl font-black text-xs shadow-lg active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {saveLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>সেভ করুন</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
