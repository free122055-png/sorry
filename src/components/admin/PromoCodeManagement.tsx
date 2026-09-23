import React, { useState, useEffect } from "react";
import { 
  Tag, Plus, Trash2, Edit2, CheckCircle2, AlertCircle, Percent, 
  Sparkles, Layers, ShieldCheck, ToggleLeft, ToggleRight, X
} from "lucide-react";
import { db } from "../../lib/firebase";
import { 
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy, onSnapshot 
} from "firebase/firestore";
import { useFirestoreCategories } from "../../hooks/useCategories";
import { CustomDropdown } from "../CustomDropdown";

export interface PromoCodeItem {
  id: string;
  code: string;
  categoryId: string; // "all" or specific category id
  categoryName: string;
  discountType: "percentage" | "fixed";
  discountValue: number; // e.g. 10 for 10% or 100 for 100 BDT
  minOrderAmount?: number;
  status: "active" | "inactive";
  createdAt: number;
}

export const PromoCodeManagement: React.FC = () => {
  const { categories } = useFirestoreCategories();
  const [promoCodes, setPromoCodes] = useState<PromoCodeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  // Form states
  const [code, setCode] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");

  const [toast, setToast] = useState<{ text: string; isError?: boolean } | null>(null);

  const showToast = (text: string, isError = false) => {
    setToast({ text, isError });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const q = query(collection(db, "promo_codes"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: PromoCodeItem[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as PromoCodeItem);
      });
      setPromoCodes(items);
      setLoading(false);
    }, (err) => {
      console.warn("Promo codes fetch error, falling back to local storage:", err);
      // Fallback
      const local = localStorage.getItem("admin_promo_codes");
      if (local) {
        try { setPromoCodes(JSON.parse(local)); } catch(e) {}
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !discountValue) {
      showToast("দয়া করে প্রমো কোড এবং ডিসকাউন্ট পরিমাণ লিখুন।", true);
      return;
    }

    const targetCat = categories.find(c => c.id === categoryId);
    const catName = categoryId === "all" 
      ? "সকল ক্যাটাগরি" 
      : (categoryId === "cat2" ? "অয়েল কর্নার" : (targetCat?.nameBn || targetCat?.nameEn || "নির্দিষ্ট ক্যাটাগরি"));

    const promoData = {
      code: code.trim().toUpperCase(),
      categoryId,
      categoryName: catName,
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
      status,
      createdAt: currentId ? undefined : Date.now(),
      updatedAt: serverTimestamp()
    };

    try {
      if (currentId) {
        await updateDoc(doc(db, "promo_codes", currentId), promoData);
        showToast("প্রমো কোড সফলভাবে আপডেট করা হয়েছে!");
      } else {
        await addDoc(collection(db, "promo_codes"), {
          ...promoData,
          createdAt: serverTimestamp()
        });
        showToast("নতুন প্রমো কোড সফলভাবে যোগ করা হয়েছে!");
      }

      // Reset form
      setCode("");
      setCategoryId("all");
      setDiscountType("percentage");
      setDiscountValue("");
      setMinOrderAmount("");
      setStatus("active");
      setIsEditing(false);
      setCurrentId(null);
    } catch (err: any) {
      console.warn("Firestore promo save error, using local storage:", err);
      // Local fallback
      const newItem: PromoCodeItem = {
        id: currentId || `promo_${Date.now()}`,
        code: code.trim().toUpperCase(),
        categoryId,
        categoryName: catName,
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
        status,
        createdAt: Date.now()
      };
      let updated = [...promoCodes];
      if (currentId) {
        updated = updated.map(p => p.id === currentId ? newItem : p);
      } else {
        updated.unshift(newItem);
      }
      setPromoCodes(updated);
      localStorage.setItem("admin_promo_codes", JSON.stringify(updated));
      showToast("প্রমো কোড সেভ করা হয়েছে!");

      setCode("");
      setCategoryId("all");
      setDiscountType("percentage");
      setDiscountValue("");
      setMinOrderAmount("");
      setStatus("active");
      setIsEditing(false);
      setCurrentId(null);
    }
  };

  const handleEdit = (item: PromoCodeItem) => {
    setCurrentId(item.id);
    setCode(item.code);
    setCategoryId(item.categoryId);
    setDiscountType(item.discountType);
    setDiscountValue(String(item.discountValue));
    setMinOrderAmount(item.minOrderAmount ? String(item.minOrderAmount) : "");
    setStatus(item.status);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিত এই প্রমো কোডটি ডিলিট করতে চান?")) return;
    try {
      await deleteDoc(doc(db, "promo_codes", id));
      showToast("প্রমো কোড সফলভাবে মুছে ফেলা হয়েছে।");
    } catch (err) {
      const updated = promoCodes.filter(p => p.id !== id);
      setPromoCodes(updated);
      localStorage.setItem("admin_promo_codes", JSON.stringify(updated));
      showToast("প্রমো কোড মুছে ফেলা হয়েছে।");
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl shadow-xl text-white font-bold text-sm flex items-center gap-2 animate-bounce ${toast.isError ? 'bg-red-600' : 'bg-emerald-600'}`}>
          {toast.isError ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-3 h-3 rounded-full bg-[#002A1A]"></span>
            <span className="text-xs font-black uppercase tracking-wider text-[#002A1A]">ডিসকাউন্ট ও অফার</span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">প্রমো কোড ম্যানেজমেন্ট</h2>
          <p className="text-xs font-medium text-gray-500 mt-0.5">প্রতিটি ক্যাটাগরি বা পণ্যের জন্য ডিসকাউন্ট প্রমো কোড তৈরি ও নিয়ন্ত্রণ করুন</p>
        </div>
        <button
          onClick={() => {
            setIsEditing(true);
            setCurrentId(null);
            setCode("");
            setCategoryId("all");
            setDiscountType("percentage");
            setDiscountValue("");
            setMinOrderAmount("");
            setStatus("active");
          }}
          className="bg-[#002A1A] hover:bg-[#003b25] text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-sm flex items-center gap-2 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>নতুন প্রমো কোড তৈরি করুন</span>
        </button>
      </div>

      {/* Add / Edit Form Modal */}
      {isEditing && (
        <div className="bg-white rounded-3xl p-6 border-2 border-[#002A1A]/20 shadow-xl relative animate-fadeIn">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-[#002A1A]" />
              <h3 className="text-lg font-black text-gray-900">
                {currentId ? "প্রমো কোড এডিট করুন" : "নতুন প্রমো কোড যোগ করুন"}
              </h3>
            </div>
            <button 
              onClick={() => setIsEditing(false)}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">প্রমো কোড (যেমন: OIL20, EID50)</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="কোড লিখুন..."
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:border-[#002A1A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">ক্যাটাগরি নির্বাচন</label>
              <CustomDropdown
                options={[
                  { id: "all", nameBn: "🌐 সকল ক্যাটাগরি (সার্বজনীন)" },
                  ...categories.map((cat) => ({
                    id: cat.id,
                    nameBn: `📦 ${cat.id === "cat2" ? "অয়েল কর্নার" : (cat.nameBn || cat.nameEn)}`
                  }))
                ]}
                value={categoryId}
                onChange={(val) => setCategoryId(val)}
                placeholder="ক্যাটাগরি নির্বাচন করুন"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">ডিসকাউন্টের ধরণ</label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-gray-100 rounded-2xl border border-gray-200">
                <button
                  type="button"
                  onClick={() => setDiscountType("percentage")}
                  className={`py-2 px-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    discountType === "percentage"
                      ? "bg-[#002A1A] text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Percent className="w-3.5 h-3.5" />
                  <span>শতকরা (%) ছাড়</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountType("fixed")}
                  className={`py-2 px-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    discountType === "fixed"
                      ? "bg-[#002A1A] text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span>৳ নির্দিষ্ট টাকা</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {discountType === "percentage" ? "ছাড়ের শতকরা হার (যেমন: ১০ জন্য ১০%)" : "ছাড়ের পরিমাণ (যেমন: ১০০ টাকা)"}
              </label>
              <input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === "percentage" ? "১০" : "১০০"}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:border-[#002A1A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">সর্বনিম্ন অর্ডার মূল্য (টাকা) [ঐচ্ছিক]</label>
              <input
                type="number"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value)}
                placeholder="যেমন: ৫০০"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:border-[#002A1A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">স্ট্যাটাস</label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-gray-100 rounded-2xl border border-gray-200">
                <button
                  type="button"
                  onClick={() => setStatus("active")}
                  className={`py-2 px-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    status === "active"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-300"></span>
                  <span>সক্রিয় (Active)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("inactive")}
                  className={`py-2 px-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    status === "inactive"
                      ? "bg-gray-700 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                  <span>নিষ্ক্রিয়</span>
                </button>
              </div>
            </div>

            <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-2xl font-bold text-sm transition-all"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="bg-[#002A1A] hover:bg-[#003b25] text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>সংরক্ষণ করুন</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Promo Codes List */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-lg font-black text-gray-900 mb-4">সকল প্রমো কোডের তালিকা ({promoCodes.length})</h3>

        {loading ? (
          <div className="text-center py-12 text-gray-400 font-bold">লোড হচ্ছে...</div>
        ) : promoCodes.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
            <Tag className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 font-bold text-sm">কোনো প্রমো কোড যোগ করা হয়নি।</p>
            <p className="text-xs text-gray-400 mt-1">উপরের বাটনে ক্লিক করে নতুন প্রমো কোড তৈরি করুন।</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {promoCodes.map((promo) => (
              <div key={promo.id} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-[#002A1A]/10 text-[#002A1A] text-xs font-black px-3 py-1 rounded-xl tracking-wider">
                      {promo.code}
                    </span>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${promo.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {promo.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                    </span>
                  </div>

                  <div className="space-y-1.5 mb-4">
                    <p className="text-xs text-gray-500 font-bold flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-gray-400" />
                      <span>ক্যাটাগরি: <strong className="text-gray-800">{promo.categoryName}</strong></span>
                    </p>
                    <p className="text-sm font-black text-[#002A1A] flex items-center gap-1.5">
                      <Percent className="w-4 h-4 text-emerald-600" />
                      <span>ছাড়: {promo.discountValue}{promo.discountType === 'percentage' ? '% (শতকরা)' : ' টাকা'}</span>
                    </p>
                    {promo.minOrderAmount ? (
                      <p className="text-xs text-gray-500 font-medium">
                        সর্বনিম্ন অর্ডার: <strong className="text-gray-800">৳{promo.minOrderAmount}</strong>
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleEdit(promo)}
                    className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-600 transition-colors"
                    title="এডিট করুন"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(promo.id)}
                    className="p-2 bg-red-50 hover:bg-red-100 rounded-xl text-red-600 transition-colors"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
