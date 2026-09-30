import React, { useState, useEffect } from "react";
import { 
  Plus, Save, Trash2, Edit2, X, Upload, Video as VideoIcon,
  CheckCircle2, AlertCircle, Loader2, Image as ImageIcon, Link as LinkIcon, Tv
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../../lib/firebase";
import { 
  collection, addDoc, setDoc, deleteDoc, doc, updateDoc, query, orderBy, onSnapshot
} from "firebase/firestore";
import { saveVideoToDB, getVideoFromDB } from "../../lib/videoStorage";
import { uploadChunkedVideoToFirestore } from "../../lib/videoChunkService";
import { getYouTubeVideoId } from "../DynamicBannerSlider";

export interface SignboardVideoItem {
  id: string;
  type: "image" | "youtube" | "video";
  videoUrl?: string;
  image?: string;
  headline?: string;
  badgeText?: string;
  order: number;
  createdAt: number;
}

const LOCAL_STORAGE_SIGNBOARD_KEY = "almayadin_signboard_cache_v1";

const YoutubeIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export const DisplaySignboardManagement: React.FC = () => {
  const [items, setItems] = useState<SignboardVideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ text: string; isError?: boolean } | null>(null);

  // Form states
  const [mediaType, setMediaType] = useState<"youtube" | "video" | "image">("video");
  const [videoUrl, setVideoUrl] = useState("");
  const [image, setImage] = useState("");
  const [headline, setHeadline] = useState("");
  const [badgeText, setBadgeText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "signboard_videos"), orderBy("order", "asc"));
    const unsub = onSnapshot(q, async (snapshot) => {
      const data = await Promise.all(snapshot.docs.map(async (docSnap) => {
        const item = docSnap.data();
        let resolvedVideoUrl = item.videoUrl || "";

        if (resolvedVideoUrl.startsWith("local_idb:")) {
          const videoId = resolvedVideoUrl.replace("local_idb:", "");
          const stored = await getVideoFromDB(videoId);
          if (stored) {
            resolvedVideoUrl = stored;
          }
        }

        return {
          id: docSnap.id,
          type: item.type || "video",
          videoUrl: resolvedVideoUrl,
          image: item.image || "",
          headline: item.headline || "",
          badgeText: item.badgeText || "",
          order: item.order || 0,
          createdAt: item.createdAt || Date.now()
        } as SignboardVideoItem;
      }));

      setItems(data);
      if (data.length > 0) {
        try {
          localStorage.setItem(LOCAL_STORAGE_SIGNBOARD_KEY, JSON.stringify(data));
        } catch (e) {}
      }
      setLoading(false);
    }, (error) => {
      console.warn("Signboard listener notice:", error.message);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const showToast = (text: string, isError = false) => {
    setToast({ text, isError });
    setTimeout(() => setToast(null), 3000);
  };

  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 80 * 1024 * 1024) {
      showToast("ভিডিও ফাইলটি বেশ বড় (৮০MB এর কম ভিডিও দিন)", true);
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setVideoUrl(result);
          showToast("গ্যালারি থেকে সাইনবোর্ড ভিডিও সিলেক্ট হয়েছে!");
        }
        setIsUploading(false);
      };
      reader.onerror = () => {
        showToast("ভিডিও প্রসেস করতে ব্যর্থ হয়েছে", true);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      showToast("ভিডিও লোড করতে সমস্যা হয়েছে", true);
      setIsUploading(false);
    }
  };

  const [uploadProgressText, setUploadProgressText] = useState("");

  const handleSave = async () => {
    if (mediaType === "youtube" && !videoUrl.trim()) {
      return showToast("দয়া করে ইউটিউব ভিডিও লিংক দিন", true);
    }
    if (mediaType === "video" && !videoUrl.trim()) {
      return showToast("দয়া করে গ্যালারি থেকে ভিডিও ফাইল সিলেক্ট অথবা লিংক দিন", true);
    }

    setSaveLoading(true);
    setUploadProgressText("প্রসেসিং শুরু হচ্ছে...");

    try {
      let finalVideoUrl = videoUrl.trim();
      let docId = editingId || `sb_vid_${Date.now()}`;
      let hasChunks = false;
      let totalChunksCount = 0;

      // Handle heavy gallery video files via Chunked Firestore Upload for 100% Play Store Global Reach
      if (mediaType === "video" && finalVideoUrl.startsWith("data:video")) {
        await saveVideoToDB(docId, finalVideoUrl);

        try {
          totalChunksCount = await uploadChunkedVideoToFirestore(
            docId, 
            finalVideoUrl, 
            (percent, statusText) => setUploadProgressText(`${percent}% - ${statusText}`)
          );
          hasChunks = true;
          finalVideoUrl = `chunked:${docId}`;
        } catch (err: any) {
          console.warn("Chunk upload notice:", err);
          finalVideoUrl = `local_idb:${docId}`;
        }

        try {
          const cached = JSON.parse(localStorage.getItem(LOCAL_STORAGE_SIGNBOARD_KEY) || "[]");
          const updated = [
            {
              id: docId,
              type: "video",
              videoUrl: videoUrl,
              headline: headline.trim(),
              badgeText: badgeText.trim(),
              order: 0
            },
            ...cached.filter((b: any) => b.id !== docId)
          ];
          localStorage.setItem(LOCAL_STORAGE_SIGNBOARD_KEY, JSON.stringify(updated));
        } catch (e) {}
      }

      const payload = {
        type: mediaType,
        videoUrl: (mediaType === "youtube" || mediaType === "video") ? finalVideoUrl : "",
        hasChunks,
        totalChunks: totalChunksCount,
        videoId: docId,
        image: mediaType === "image" ? image : "",
        headline: headline.trim(),
        badgeText: badgeText.trim(),
        updatedAt: Date.now()
      };

      if (editingId) {
        await updateDoc(doc(db, "signboard_videos", editingId), payload);
        showToast("প্লে-স্টোর অ্যাপ কাস্টমারদের জন্য সাইনবোর্ড ভিডিও সেভ করা হয়েছে!");
      } else {
        await setDoc(doc(db, "signboard_videos", docId), {
          ...payload,
          order: items.length,
          createdAt: Date.now()
        });
        showToast("নতুন ডিসপ্লে সাইনবোর্ড ভিডিও প্লে-স্টোরের সকল অ্যাপে লাইভ করা হয়েছে!");
      }
      resetForm();
    } catch (error: any) {
      console.error("Save error:", error);
      showToast("সেভ করতে সমস্যা হয়েছে: " + (error?.message || "চেষ্টা করুন"), true);
    } finally {
      setSaveLoading(false);
      setUploadProgressText("");
    }
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const confirmAndDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "signboard_videos", id));
      setItems(prev => prev.filter(item => item.id !== id));

      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_SIGNBOARD_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const updated = parsed.filter((i: any) => i.id !== id);
            localStorage.setItem(LOCAL_STORAGE_SIGNBOARD_KEY, JSON.stringify(updated));
          }
        }
      } catch (e) {}

      showToast("সাইনবোর্ড ভিডিও সফলভাবে ডিলিট করা হয়েছে");
    } catch (error: any) {
      showToast("ডিলিট করতে সমস্যা হয়েছে: " + (error?.message || "চেষ্টা করুন"), true);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
  };


  const resetForm = () => {
    setMediaType("video");
    setVideoUrl("");
    setImage("");
    setHeadline("");
    setBadgeText("");
    setEditingId(null);
    setIsAdding(false);
  };

  const startEdit = (item: SignboardVideoItem) => {
    setMediaType(item.type || "video");
    setVideoUrl(item.videoUrl || "");
    setImage(item.image || "");
    setHeadline(item.headline || "");
    setBadgeText(item.badgeText || "");
    setEditingId(item.id);
    setIsAdding(true);
  };

  const ytPreviewId = mediaType === "youtube" ? getYouTubeVideoId(videoUrl) : "";

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 pb-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-gray-900 italic uppercase flex items-center gap-2">
            <Tv className="w-7 h-7 text-emerald-700" />
            <span>ডিসপ্লে সাইনবোর্ড ভিডিও ম্যানেজার</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">সচল</span>
          </h2>
          <p className="text-sm text-gray-500 font-medium mt-1">
            হোম পেজের একদম উপরের প্রধান সাইনবোর্ডের ভিডিও সরাসরি গ্যালারি থেকে আপলোড ও ম্যানেজ করুন।
          </p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-[#004b23] hover:bg-[#00381a] text-white px-5 py-3 rounded-2xl text-sm font-black flex items-center gap-2 shadow-lg shadow-emerald-900/10 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>নতুন সাইনবোর্ড ভিডিও যোগ করুন</span>
          </button>
        )}
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 border ${
              toast.isError ? "bg-rose-50 border-rose-200 text-rose-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"
            }`}
          >
            {toast.isError ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            <span className="font-bold text-sm">{toast.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[70] flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-xl rounded-[32px] overflow-hidden shadow-2xl border border-gray-100 my-8"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
                <h3 className="text-lg font-black text-gray-900 italic">
                  {editingId ? "সাইনবোর্ড ভিডিও এডিট করুন" : "নতুন সাইনবোর্ড ভিডিও যোগ করুন"}
                </h3>
                <button onClick={resetForm} className="p-2 hover:bg-gray-200 rounded-full transition-all">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                {/* Media Type Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-700 uppercase tracking-wider block">
                    ভিডিও সোর্স নির্বাচন করুন:
                  </label>
                  <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setMediaType("video")}
                      className={`py-3 rounded-xl text-xs font-black flex flex-col items-center gap-1 transition-all ${
                        mediaType === "video"
                          ? "bg-purple-600 text-white shadow-md"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <VideoIcon className="w-5 h-5" />
                      <span>গ্যালারি / MP4</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMediaType("youtube")}
                      className={`py-3 rounded-xl text-xs font-black flex flex-col items-center gap-1 transition-all ${
                        mediaType === "youtube"
                          ? "bg-rose-600 text-white shadow-md"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <YoutubeIcon className="w-5 h-5 text-current" />
                      <span>ইউটিউব লিংক</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMediaType("image")}
                      className={`py-3 rounded-xl text-xs font-black flex flex-col items-center gap-1 transition-all ${
                        mediaType === "image"
                          ? "bg-[#004b23] text-white shadow-md"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <ImageIcon className="w-5 h-5" />
                      <span>ছবি সাইনবোর্ড</span>
                    </button>
                  </div>
                </div>

                {/* Direct Video File Dropzone */}
                {mediaType === "video" && (
                  <div className="space-y-4">
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] font-bold text-amber-900 leading-snug">
                      💡 <strong>প্লে-কনসোল কাস্টমার প্যানেল প্লেব্যাক টিপস:</strong> সকল অ্যাপ ব্যবহারকারীর মোবাইলে ভিডিও সচল রাখতে <strong>ইউটিউব ভিডিও লিংক</strong> অথবা পাবলিক <strong>MP4 ভিডিও লিংক</strong> দিন।
                    </div>

                    <label className="text-xs font-black text-gray-700 uppercase tracking-wider block">
                      ফোন/গ্যালারি থেকে ভিডিও ফাইল আপলোড করুন:
                    </label>

                    <label className="w-full aspect-[21/9] border-2 border-dashed border-purple-300 rounded-[28px] flex flex-col items-center justify-center bg-purple-50/50 hover:bg-purple-100/70 transition-all cursor-pointer relative overflow-hidden group">
                      <input 
                        type="file" 
                        accept="video/*" 
                        onChange={handleVideoFileUpload} 
                        className="hidden" 
                      />
                      {videoUrl && videoUrl.startsWith("data:video") ? (
                        <div className="relative w-full h-full bg-black">
                          <video src={videoUrl} controls className="w-full h-full object-cover" />
                          <div className="absolute top-2 right-2 bg-purple-900/80 text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-md">
                            ✓ গ্যালারি থেকে সাইনবোর্ড ভিডিও নির্বাচিত
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-4 text-center">
                          <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 shadow-sm flex items-center justify-center mb-2">
                            {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
                          </div>
                          <span className="text-xs font-black text-purple-900 uppercase tracking-wider">
                            {isUploading ? "ভিডিও প্রসেস হচ্ছে..." : "📱 গ্যালারি থেকে সরাসরি ভিডিও ফাইল সিলেক্ট করুন"}
                          </span>
                          <span className="text-[10px] font-semibold text-purple-600/80 mt-1">
                            MP4, WebM বা যেকোনো ভিডিও ফরম্যাট
                          </span>
                        </div>
                      )}
                    </label>

                    <div className="flex items-center gap-2 my-1">
                      <div className="h-[1px] bg-gray-200 flex-1"></div>
                      <span className="text-[10px] font-black text-gray-400 uppercase">অথবা ভিডিও ইউআরএল লিংক দিন</span>
                      <div className="h-[1px] bg-gray-200 flex-1"></div>
                    </div>

                    <div className="relative">
                      <VideoIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="url"
                        placeholder="https://example.com/video.mp4"
                        value={videoUrl.startsWith("data:video") ? "" : videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-semibold focus:ring-2 focus:ring-purple-500/20"
                      />
                    </div>

                    {videoUrl.startsWith("http") && (
                      <div className="relative aspect-video rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-black">
                        <video src={videoUrl} controls className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                )}

                {/* YouTube Link */}
                {mediaType === "youtube" && (
                  <div className="space-y-3">
                    <label className="text-xs font-black text-gray-700 uppercase tracking-wider block">
                      ইউটিউব ভিডিও লিংক:
                    </label>
                    <div className="relative">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=... অথবা https://youtu.be/..."
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-semibold focus:ring-2 focus:ring-rose-500/20"
                      />
                    </div>
                    {ytPreviewId ? (
                      <div className="relative aspect-video rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-black">
                        <iframe
                          src={`https://www.youtube.com/embed/${ytPreviewId}?autoplay=0&controls=1`}
                          title="Preview"
                          className="w-full h-full border-0"
                        />
                      </div>
                    ) : videoUrl.trim() ? (
                      <p className="text-xs text-rose-500 font-bold">সঠিক ইউটিউব লিংক দিন</p>
                    ) : null}
                  </div>
                )}

                {/* Optional Announcement Details */}
                <div className="space-y-4 pt-2 border-t border-gray-100">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      সাইনবোর্ড শিরোনাম (ঐচ্ছিক Header Title):
                    </label>
                    <input
                      type="text"
                      placeholder="যেমন: Al Mayadin Bazar • অনলাইন শপ"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      ব্যাজ বা সাব-টাইটেল (ঐচ্ছিক Badge):
                    </label>
                    <input
                      type="text"
                      placeholder="যেমন: ⚡ ৩০ মিনিটে ডেলিভারি"
                      value={badgeText}
                      onChange={(e) => setBadgeText(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm font-medium"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleSave}
                  disabled={saveLoading || isUploading}
                  className="w-full bg-[#004b23] hover:bg-[#00381a] text-white py-4 rounded-2xl text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/10 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {saveLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  <span>{uploadProgressText || (editingId ? "আপডেট করুন" : "সংরক্ষণ করুন")}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List Display */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
          <span className="text-sm font-bold text-gray-400">অপেক্ষা করুন...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[40px] border border-gray-100 shadow-sm px-10 text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
            <Tv className="w-10 h-10 text-emerald-600" />
          </div>
          <h3 className="text-lg font-black text-gray-900 italic uppercase">কোনো সাইনবোর্ড ভিডিও সেট করা নেই</h3>
          <p className="text-sm text-gray-400 font-medium mt-1">হোম পেজের ডিসপ্লে সাইনবোর্ডে ভিডিও যোগ করতে উপরের বাটনে ক্লিক করুন</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item) => {
            const isYT = item.type === "youtube" || (item.videoUrl && (item.videoUrl.includes("youtube") || item.videoUrl.includes("youtu.be")));
            const ytId = isYT ? getYouTubeVideoId(item.videoUrl || "") : "";

            return (
              <motion.div 
                layout
                key={item.id}
                className="bg-white p-3 rounded-[32px] border border-gray-100 shadow-sm flex flex-col group overflow-hidden"
              >
                <div className="w-full aspect-[21/9] rounded-[24px] overflow-hidden relative bg-black flex items-center justify-center">
                  {isYT && ytId ? (
                    <img 
                      src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} 
                      alt="YouTube Thumbnail" 
                      className="w-full h-full object-cover" 
                    />
                  ) : item.type === "video" && item.videoUrl ? (
                    <video src={item.videoUrl} className="w-full h-full object-cover" />
                  ) : (
                    <img src={item.image} alt="Signboard" className="w-full h-full object-cover" />
                  )}

                  {/* Badge */}
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-black/70 backdrop-blur-xs text-white border border-white/20 flex items-center gap-1.5">
                    {isYT ? <YoutubeIcon className="w-3.5 h-3.5 text-rose-500" /> : <VideoIcon className="w-3.5 h-3.5 text-purple-400" />}
                    <span>{isYT ? "ইউটিউব সাইনবোর্ড" : "গ্যালারি সাইনবোর্ড ভিডিও"}</span>
                  </div>
                </div>

                {/* Title & Action Buttons */}
                <div className="p-3 bg-gray-50/80 rounded-b-[24px] flex items-center justify-between gap-2 mt-2 border-t border-gray-100">
                  <div className="flex-1 overflow-hidden">
                    <h4 className="font-bold text-xs text-gray-900 truncate">
                      {item.headline || "ডিসপ্লে সাইনবোর্ড ভিডিও"}
                    </h4>
                    {item.badgeText && <p className="text-[11px] text-gray-500 truncate">{item.badgeText}</p>}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button 
                      type="button"
                      onClick={() => startEdit(item)}
                      className="px-3 py-2 bg-white hover:bg-emerald-50 text-emerald-800 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-2xs border border-emerald-200 active:scale-95 transition-all cursor-pointer"
                      title="এডিট করুন"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>এডিট</span>
                    </button>

                    <button 
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-2xs border border-rose-200 active:scale-95 transition-all cursor-pointer"
                      title="ডিলিট করুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ডিলিট</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingId && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[32px] p-6 w-full max-w-sm shadow-2xl border border-rose-100 text-center space-y-4"
            >
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Trash2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-gray-900">সাইনবোর্ড ভিডিও ডিলিট</h3>
                <p className="text-xs text-gray-500 font-medium">
                  আপনি কি নিশ্চিত এই ডিসপ্লে সাইনবোর্ডটি ডিলিট করতে চান?
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingId(null)}
                  className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold text-xs transition-all cursor-pointer"
                >
                  বাতিল
                </button>

                <button
                  type="button"
                  onClick={() => confirmAndDelete(deletingId)}
                  className="flex-1 py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>হ্যাঁ, ডিলিট করুন</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
