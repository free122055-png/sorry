import React, { useState, useEffect } from "react";
import { 
  Plus, Save, Trash2, Edit2, X, Upload, Loader2, Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../../lib/firebase";
import { 
  collection, getDocs, doc, setDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp 
} from "firebase/firestore";
import { compressImage } from "../../lib/imageUtils";

interface Category {
  id: string;
  title: string;
  image: string;
  type: 'market' | 'service';
  order: number;
}

export const CategoryIconManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<'market' | 'service'>('market');
  const [image, setImage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "categories"), orderBy("order", "asc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      setCategories(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const base64 = await compressImage(file);
      setImage(base64);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!newTitle || !image) {
      alert("দয়া করে ক্যাটাগরির নাম এবং ফটো দিন।");
      return;
    }
    setSaveLoading(true);
    try {
      // If editingId is "new", generate a new ID, otherwise use the existing ID
      const id = editingId === "new" ? Date.now().toString() : editingId;
      if (id) {
        await setDoc(doc(db, "categories", id), {
          title: newTitle,
          image,
          type: newType,
          order: editingId === "new" ? categories.length : categories.find(c => c.id === editingId)?.order || 0,
          updatedAt: serverTimestamp()
        });
        alert("সফলভাবে সেভ হয়েছে!");
      }
      setEditingId(null);
      setNewTitle("");
      setImage("");
    } catch (error) {
      console.error(error);
      alert("সেভ করতে সমস্যা হয়েছে।");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("আপনি কি নিশ্চিত এটি ডিলিট করতে চান?")) {
      await deleteDoc(doc(db, "categories", id));
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black text-gray-900 italic">ক্যাটাগরি ম্যানেজমেন্ট</h2>
        <button onClick={() => {setEditingId("new"); setNewTitle(""); setImage("");}} className="bg-[#5842dc] text-white px-4 py-2 rounded-xl text-sm font-black flex items-center gap-2">
          <Plus className="w-4 h-4" /> নতুন যোগ করুন
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white p-4 rounded-[32px] border border-gray-100 shadow-sm flex flex-col items-center">
            <img src={cat.image} className="w-20 h-20 object-cover rounded-full mb-2" alt={cat.title} />
            <h3 className="text-sm font-black text-gray-900 mb-2">{cat.title}</h3>
            <div className="flex gap-2">
              <button onClick={() => {setEditingId(cat.id); setNewTitle(cat.title); setImage(cat.image); setNewType(cat.type);}} className="p-2 bg-gray-100 rounded-full"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(cat.id)} className="p-2 bg-rose-100 text-rose-600 rounded-full"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>

      {editingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-3xl w-full max-w-sm space-y-4">
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="ক্যাটাগরি নাম" className="w-full p-3 border rounded-xl" />
            <select value={newType} onChange={e => setNewType(e.target.value as any)} className="w-full p-3 border rounded-xl">
              <option value="market">বাজার সমূহ</option>
              <option value="service">অন্যান্য সেবা</option>
            </select>
            <label className="block w-full h-32 border-2 border-dashed flex items-center justify-center cursor-pointer">
              <input type="file" onChange={handleImageUpload} className="hidden" />
              {image ? <img src={image} className="h-full" /> : <span>ফটো আপলোড</span>}
            </label>
            <button onClick={handleSave} disabled={saveLoading} className="w-full bg-green-600 text-white p-3 rounded-xl">{saveLoading ? "সেভ হচ্ছে..." : "সেভ করুন"}</button>
          </div>
        </div>
      )}
    </div>
  );
};
