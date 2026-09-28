import React, { useState, useEffect } from 'react';
import { db, storage } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Loader2, Upload, Save, RefreshCw } from 'lucide-react';

const SECTIONS = [
  { id: 'cat2', name: 'অয়েল কর্নার' },
  { id: 'cat3', name: 'কাপড় ও পরিধান' },
  { id: 'cat4', name: 'উপহার বাজার' },
  { id: 'cat6', name: 'ইসলামিক বাজার' },
  { id: 'tilawat', name: 'তেলাওয়াত' },
  { id: 'caption', name: 'ক্যাপশন' },
  { id: 'editing', name: 'এডিটিং' },
  { id: 'matrimonial', name: 'বায়োডাটা' },
  { id: 'telecom', name: 'প্যাক ক্রয়' },
  { id: 'reminder', name: 'রিমাইন্ডার' },
];

export const IconManagement: React.FC = () => {
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    fetchMappings();
  }, []);

  const fetchMappings = async () => {
    setLoading(true);
    const mappings: Record<string, string> = {};
    for (const section of SECTIONS) {
      const docSnap = await getDoc(doc(db, 'configs_icons', section.id));
      if (docSnap.exists()) {
        mappings[section.id] = docSnap.data().url;
      }
    }
    setMappings(mappings);
    setLoading(false);
  };

  const handleUpload = async (sectionId: string, file: File) => {
    setUploading(sectionId);
    try {
      console.log('Starting Base64 conversion for:', sectionId);
      
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      const base64Url = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });

      console.log('Base64 conversion complete');
      
      await setDoc(doc(db, 'configs_icons', sectionId), { url: base64Url });
      console.log('Firestore document updated successfully');
      
      setMappings(prev => ({ ...prev, [sectionId]: base64Url }));
      alert('Icon updated successfully!');
    } catch (error) {
      console.error('Base64 Conversion/Upload Error:', error);
      alert(`Failed to upload icon: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setUploading(null);
    }
  };

  const handleReset = async (sectionId: string) => {
    try {
      await setDoc(doc(db, 'configs_icons', sectionId), { url: '' });
      setMappings(prev => ({ ...prev, [sectionId]: '' }));
      alert('Icon reset successfully!');
    } catch (error) {
      console.error('Reset Error:', error);
      alert('Failed to reset icon.');
    }
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold">Section Icon Management</h2>
      <div className="grid gap-4">
        {SECTIONS.map(section => (
          <div key={section.id} className="bg-white p-4 rounded-lg border shadow-sm flex items-center justify-between">
            <span className="font-semibold">{section.name}</span>
            <div className="flex items-center gap-2">
              {mappings[section.id] && (
                <img src={mappings[section.id]} alt={section.name} className="w-10 h-10 object-cover rounded" />
              )}
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleUpload(section.id, e.target.files[0])}
                className="hidden"
                id={`upload-${section.id}`}
              />
              <label htmlFor={`upload-${section.id}`} className="cursor-pointer bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                {uploading === section.id ? <Loader2 className="animate-spin w-4 h-4" /> : <Upload className="w-4 h-4" />}
              </label>
              <button onClick={() => handleReset(section.id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
