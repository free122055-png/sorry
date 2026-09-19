import React, { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, onSnapshot, doc, updateDoc, setDoc, getDocs } from "firebase/firestore";
import { Pencil } from "lucide-react";
import { uploadImageFile } from "../../lib/uploadService";
import { RECITERS, Reciter as LocalReciter } from "../../data/quranData";

interface Reciter {
  id: string;
  name: string;
  arabicName: string;
  country: string;
  imageUrl: string;
  description: string;
  serverUrl: string;
  isActive: boolean;
  tags?: string[];
}

export const ReciterManagement: React.FC = () => {
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [editingReciter, setEditingReciter] = useState<Reciter | null>(null);
  const [newPhotoUrl, setNewPhotoUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const seedDatabase = async () => {
      const q = collection(db, "reciters");
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        for (const reciter of RECITERS) {
          await setDoc(doc(db, "reciters", reciter.id), reciter);
        }
      }
    };
    seedDatabase();

    const q = collection(db, "reciters");
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reciterList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Reciter[];
      setReciters(reciterList);
    });
    return () => unsubscribe();
  }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      const url = await uploadImageFile(e.target.files[0]);
      setNewPhotoUrl(url);
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (editingReciter && newPhotoUrl) {
      await updateDoc(doc(db, "reciters", editingReciter.id), {
        imageUrl: newPhotoUrl
      });
      setEditingReciter(null);
      setNewPhotoUrl("");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">তেলাওয়াত কারী ম্যানেজমেন্ট</h2>
      <div className="grid gap-4">
        {reciters.map((reciter) => (
          <div key={reciter.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
            <div className="flex items-center gap-4">
              <img src={reciter.imageUrl} alt={reciter.name} className="w-12 h-12 rounded-full object-cover" />
              <span className="font-semibold">{reciter.name}</span>
            </div>
            <button 
              onClick={() => { setEditingReciter(reciter); setNewPhotoUrl(reciter.imageUrl); }}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <Pencil className="w-5 h-5 text-blue-500" />
            </button>
          </div>
        ))}
      </div>

      {editingReciter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">ফটো পরিবর্তন করুন: {editingReciter.name}</h3>
            <input type="file" onChange={handlePhotoUpload} className="mb-4" />
            {uploading && <p>আপলোড হচ্ছে...</p>}
            {newPhotoUrl && <img src={newPhotoUrl} alt="Preview" className="w-20 h-20 rounded-full mb-4" />}
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditingReciter(null)} className="px-4 py-2 bg-gray-200 rounded">বাতিল</button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-500 text-white rounded">সেভ করুন</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
