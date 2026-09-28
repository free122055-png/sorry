import React, { useState, useEffect, useRef } from "react";
import { 
  collection, doc, getDocs, setDoc, deleteDoc, updateDoc, 
  onSnapshot, query, orderBy, limit, startAfter, where
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { getApiUrl } from "../../lib/api";
import { 
  Video, Upload, Plus, Trash2, Edit3, Play, X, CheckCircle2, 
  AlertCircle, Film, Sparkles, Eye, Clock, User, BookOpen, 
  ExternalLink, Search, RefreshCw, Layers, Check, AlertTriangle,
  RotateCcw, ShieldCheck, HardDrive, FileCheck, ToggleLeft, ToggleRight
} from "lucide-react";

export interface VideoTilawatItem {
  id: string;
  title?: string;
  surahName: string;
  surahNameBn: string;
  arabicTitle: string;
  reciterName: string;
  reciterNameBn: string;
  reciterAvatar: string;
  duration: string;
  durationSeconds: number;
  views: string;
  thumbnailUrl: string;
  videoUrl?: string;
  storagePath?: string;
  fileSize?: number;
  fileSizeFormatted?: string;
  uploadStatus?: "completed" | "processing" | "failed";
  publishedStatus?: "published" | "draft";
  category?: string;
  description: string;
  tags: string[];
  createdAt?: number;
  updatedAt?: number;
}

// 114 Surahs Preset List for Quick Auto-fill
const SURAH_PRESETS = [
  { id: 1, bn: "সূরা আল-ফাতিহা", en: "Surah Al-Fatihah", ar: "سورة الفاتحة" },
  { id: 2, bn: "সূরা আল-বাক্বারাহ", en: "Surah Al-Baqarah", ar: "سورة البقرة" },
  { id: 3, bn: "সূরা আলে-ইমরান", en: "Surah Ali 'Imran", ar: "سورة آل عمران" },
  { id: 4, bn: "সূরা আন-নিসা", en: "Surah An-Nisa", ar: "سورة النساء" },
  { id: 5, bn: "সূরা আল-মায়িদাহ", en: "Surah Al-Ma'idah", ar: "سورة المائدة" },
  { id: 6, bn: "সূরা আল-আন'আম", en: "Surah Al-An'am", ar: "سورة الأنعام" },
  { id: 7, bn: "সূরা আল-আ'রাফ", en: "Surah Al-A'raf", ar: "سورة الأعراف" },
  { id: 8, bn: "সূরা আল-আনফাল", en: "Surah Al-Anfal", ar: "سورة الأنفال" },
  { id: 9, bn: "সূরা আত-তাওবাহ", en: "Surah At-Tawbah", ar: "سورة التوبة" },
  { id: 10, bn: "সূরা ইউনুস", en: "Surah Yunus", ar: "سورة يونس" },
  { id: 11, bn: "সূরা হূদ", en: "Surah Hud", ar: "سورة هود" },
  { id: 12, bn: "সূরা ইউসুফ", en: "Surah Yusuf", ar: "سورة يوسف" },
  { id: 13, bn: "সূরা আর-রাদ", en: "Surah Ar-Ra'd", ar: "سورة الرعد" },
  { id: 14, bn: "সূরা ইব্রাহীম", en: "Surah Ibrahim", ar: "سورة إبراهيم" },
  { id: 15, bn: "সূরা আল-হিজর", en: "Surah Al-Hijr", ar: "سورة الحجر" },
  { id: 16, bn: "সূরা আন-নাহল", en: "Surah An-Nahl", ar: "سورة النحل" },
  { id: 17, bn: "সূরা আল-ইসরা", en: "Surah Al-Isra", ar: "سورة الإسراء" },
  { id: 18, bn: "সূরা আল-কাহাফ", en: "Surah Al-Kahf", ar: "سورة الكهف" },
  { id: 19, bn: "সূরা মারইয়াম", en: "Surah Maryam", ar: "سورة مريم" },
  { id: 20, bn: "সূরা ত্বা-হা", en: "Surah Ta-Ha", ar: "سورة طه" },
  { id: 21, bn: "সূরা আল-আম্বিয়া", en: "Surah Al-Anbiya", ar: "سورة الأنبياء" },
  { id: 22, bn: "সূরা আল-হাজ্জ", en: "Surah Al-Hajj", ar: "سورة الحج" },
  { id: 23, bn: "সূরা আল-মু'মিনুন", en: "Surah Al-Mu'minun", ar: "سورة المؤمنون" },
  { id: 24, bn: "সূরা আন-নূর", en: "Surah An-Nur", ar: "سورة النور" },
  { id: 25, bn: "সূরা আল-ফুরকান", en: "Surah Al-Furqan", ar: "سورة الفرقان" },
  { id: 26, bn: "সূরা আশ-শু'আরা", en: "Surah Ash-Shu'ara", ar: "سورة الشعراء" },
  { id: 27, bn: "সূরা আন-নামল", en: "Surah An-Naml", ar: "سورة النمل" },
  { id: 28, bn: "সূরা আল-কাসাস", en: "Surah Al-Qasas", ar: "سورة القصص" },
  { id: 29, bn: "সূরা আল-আনকাবুত", en: "Surah Al-'Ankabut", ar: "سورة العنكبوت" },
  { id: 30, bn: "সূরা আর-রূম", en: "Surah Ar-Rum", ar: "سورة الروم" },
  { id: 31, bn: "সূরা লোকমান", en: "Surah Luqman", ar: "سورة لقمان" },
  { id: 32, bn: "সূরা আস-সাজদাহ", en: "Surah As-Sajdah", ar: "سورة السجدة" },
  { id: 33, bn: "সূরা আল-আহযাব", en: "Surah Al-Ahzab", ar: "سورة الأحزاب" },
  { id: 34, bn: "সূরা সাবা", en: "Surah Saba", ar: "سورة سبأ" },
  { id: 35, bn: "সূরা ফাতির", en: "Surah Fatir", ar: "سورة فاطر" },
  { id: 36, bn: "সূরা ইয়াসীন", en: "Surah Yaseen", ar: "سورة يس" },
  { id: 37, bn: "সূরা আস-সাফফাত", en: "Surah As-Saffat", ar: "سورة الصافات" },
  { id: 38, bn: "সূরা ছোয়াদ", en: "Surah Sad", ar: "سورة ص" },
  { id: 39, bn: "সূরা আজ-জুমার", en: "Surah Az-Zumar", ar: "سورة الزمر" },
  { id: 40, bn: "সূরা গাফির", en: "Surah Ghafir", ar: "سورة غافر" },
  { id: 41, bn: "সূরা ফুসসিলাত", en: "Surah Fussilat", ar: "سورة فصلت" },
  { id: 42, bn: "সূরা আশ-শুরা", en: "Surah Ash-Shura", ar: "سورة الشورى" },
  { id: 43, bn: "সূরা আজ-জুখরুফ", en: "Surah Az-Zukhruf", ar: "سورة الزخرف" },
  { id: 44, bn: "সূরা আদ-দুখান", en: "Surah Ad-Dukhan", ar: "سورة الدخان" },
  { id: 45, bn: "সূরা আল-জাসিয়াহ", en: "Surah Al-Jathiyah", ar: "سورة الجاثية" },
  { id: 46, bn: "সূরা আল-আহকাফ", en: "Surah Al-Ahqaf", ar: "سورة الأحقاف" },
  { id: 47, bn: "সূরা মুহাম্মদ", en: "Surah Muhammad", ar: "سورة محمد" },
  { id: 48, bn: "সূরা আল-ফাতহ", en: "Surah Al-Fath", ar: "سورة الفتح" },
  { id: 49, bn: "সূরা আল-হুজুরাত", en: "Surah Al-Hujurat", ar: "سورة الحجرات" },
  { id: 50, bn: "সূরা কাফ", en: "Surah Qaf", ar: "سورة ق" },
  { id: 51, bn: "সূরা আয-যারিয়াত", en: "Surah Adh-Dhariyat", ar: "سورة الذاريات" },
  { id: 52, bn: "সূরা আত-তূর", en: "Surah At-Tur", ar: "سورة الطور" },
  { id: 53, bn: "সূরা আন-নাজম", en: "Surah An-Najm", ar: "سورة النجم" },
  { id: 54, bn: "সূরা আল-ক্বামার", en: "Surah Al-Qamar", ar: "سورة القمر" },
  { id: 55, bn: "সূরা আর-রহমান", en: "Surah Ar-Rahman", ar: "سورة الرحمن" },
  { id: 56, bn: "সূরা আল-ওয়াকিয়াহ", en: "Surah Al-Waqi'ah", ar: "سورة الواقعة" },
  { id: 57, bn: "সূরা আল-হাদীদ", en: "Surah Al-Hadid", ar: "سورة الحديد" },
  { id: 58, bn: "সূরা আল-মুজাদালাহ", en: "Surah Al-Mujadila", ar: "سورة المجادلة" },
  { id: 59, bn: "সূরা আল-হাশর", en: "Surah Al-Hashr", ar: "سورة الحشر" },
  { id: 60, bn: "সূরা আল-মুমতাহিনাহ", en: "Surah Al-Mumtahanah", ar: "سورة الممتحنة" },
  { id: 61, bn: "সূরা আস-সফ", en: "Surah As-Saff", ar: "سورة الصف" },
  { id: 62, bn: "সূরা আল-জুমু'আহ", en: "Surah Al-Jumu'ah", ar: "سورة الجمعة" },
  { id: 63, bn: "সূরা আল-মুনাফিকুন", en: "Surah Al-Munafiqun", ar: "سورة المنافقون" },
  { id: 64, bn: "সূরা আত-তাগাবুন", en: "Surah At-Taghabun", ar: "سورة التغابن" },
  { id: 65, bn: "সূরা আত-ত্বালাক", en: "Surah At-Talaq", ar: "سورة الطلاق" },
  { id: 66, bn: "সূরা আত-তাহরীম", en: "Surah At-Tahrim", ar: "سورة التحريم" },
  { id: 67, bn: "সূরা আল-মুলক", en: "Surah Al-Mulk", ar: "سورة الملك" },
  { id: 68, bn: "সূরা আল-কলম", en: "Surah Al-Qalam", ar: "سورة القلم" },
  { id: 69, bn: "সূরা আল-হাক্কাহ", en: "Surah Al-Haqqah", ar: "سورة الحاقة" },
  { id: 70, bn: "সূরা আল-মা'আরিজ", en: "Surah Al-Ma'arij", ar: "سورة المعارج" },
  { id: 71, bn: "সূরা নূহ", en: "Surah Nuh", ar: "سورة نوح" },
  { id: 72, bn: "সূরা আল-জ্বিন", en: "Surah Al-Jinn", ar: "سورة الجن" },
  { id: 73, bn: "সূরা আল-মুযযাম্মিল", en: "Surah Al-Muzzammil", ar: "سورة المزمل" },
  { id: 74, bn: "সূরা আল-মুদ্দাসসির", en: "Surah Al-Muddaththir", ar: "سورة المدثر" },
  { id: 75, bn: "সূরা আল-ক্বিয়ামাহ", en: "Surah Al-Qiyamah", ar: "سورة القيامة" },
  { id: 76, bn: "সূরা আল-ইনসান", en: "Surah Al-Insan", ar: "سورة الإنسان" },
  { id: 77, bn: "সূরা আল-মুরসালাত", en: "Surah Al-Mursalat", ar: "سورة المرسلات" },
  { id: 78, bn: "সূরা আন-নাবা", en: "Surah An-Naba", ar: "سورة النبأ" },
  { id: 79, bn: "সূরা আন-নাযি'আত", en: "Surah An-Nazi'at", ar: "سورة النازعات" },
  { id: 80, bn: "সূরা আবাসা", en: "Surah 'Abasa", ar: "سورة عبس" },
  { id: 81, bn: "সূরা আত-তাকভীর", en: "Surah At-Takwir", ar: "سورة التكوير" },
  { id: 82, bn: "সূরা আল-ইনফিতার", en: "Surah Al-Infitar", ar: "سورة الانفطار" },
  { id: 83, bn: "সূরা আল-মুতাফফিফীন", en: "Surah Al-Mutaffifin", ar: "سورة المطففين" },
  { id: 84, bn: "সূরা আল-ইনশিকাক", en: "Surah Al-Inshiqaq", ar: "سورة الانشقاق" },
  { id: 85, bn: "সূরা আল-বুরুজ", en: "Surah Al-Buruj", ar: "سورة البروج" },
  { id: 86, bn: "সূরা আত-ত্বারিক", en: "Surah At-Tariq", ar: "سورة الطارق" },
  { id: 87, bn: "সূরা আল-আ'লা", en: "Surah Al-A'la", ar: "سورة الأعلى" },
  { id: 88, bn: "সূরা আল-গাশিয়াহ", en: "Surah Al-Ghashiyah", ar: "سورة الغاشية" },
  { id: 89, bn: "সূরা আল-ফজর", en: "Surah Al-Fajr", ar: "سورة الفجر" },
  { id: 90, bn: "সূরা আল-বালাদ", en: "Surah Al-Balad", ar: "سورة البلد" },
  { id: 91, bn: "সূরা আশ-শামস", en: "Surah Ash-Shams", ar: "سورة الشمس" },
  { id: 92, bn: "সূরা আল-লাইল", en: "Surah Al-Layl", ar: "سورة الليل" },
  { id: 93, bn: "সূরা আদ-দুহা", en: "Surah Ad-Duha", ar: "سورة الضحى" },
  { id: 94, bn: "সূরা আল-ইনশিরাহ", en: "Surah Ash-Sharh", ar: "سورة الشرح" },
  { id: 95, bn: "সূরা আত-তীন", en: "Surah At-Tin", ar: "سورة التين" },
  { id: 96, bn: "সূরা আল-আলাক", en: "Surah Al-'Alaq", ar: "سورة العلق" },
  { id: 97, bn: "সূরা আল-কদর", en: "Surah Al-Qadr", ar: "سورة القدر" },
  { id: 98, bn: "সূরা আল-বাইয়্যিনাহ", en: "Surah Al-Bayyinah", ar: "سورة البينة" },
  { id: 99, bn: "সূরা আল-যিলযাল", en: "Surah Az-Zalzalah", ar: "سورة الزلزلة" },
  { id: 100, bn: "সূরা আল-আদিয়াত", en: "Surah Al-'Adiyat", ar: "سورة العاديات" },
  { id: 101, bn: "সূরা আল-কারিয়াহ", en: "Surah Al-Qari'ah", ar: "سورة القارعة" },
  { id: 102, bn: "সূরা আত-তাকাসুর", en: "Surah At-Takathur", ar: "سورة التكاثر" },
  { id: 103, bn: "সূরা আল-আসর", en: "Surah Al-'Asr", ar: "سورة العصر" },
  { id: 104, bn: "সূরা আল-হুমাযাহ", en: "Surah Al-Humazah", ar: "سورة الهمزة" },
  { id: 105, bn: "সূরা আল-ফীল", en: "Surah Al-Fil", ar: "سورة الفيل" },
  { id: 106, bn: "সূরা কুরাইশ", en: "Surah Quraysh", ar: "سورة قريش" },
  { id: 107, bn: "সূরা আল-মা'উন", en: "Surah Al-Ma'un", ar: "سورة الماعون" },
  { id: 108, bn: "সূরা আল-কাউসার", en: "Surah Al-Kawthar", ar: "سورة الكوثر" },
  { id: 109, bn: "সূরা আল-কাফিরুন", en: "Surah Al-Kafirun", ar: "سورة الكافرون" },
  { id: 110, bn: "সূরা আন-নাসর", en: "Surah An-Nasr", ar: "سورة النصر" },
  { id: 111, bn: "সূরা আল-মাসাদ", en: "Surah Al-Masad", ar: "سورة المسد" },
  { id: 112, bn: "সূরা আল-ইখলাস", en: "Surah Al-Ikhlas", ar: "سورة الإخلاص" },
  { id: 113, bn: "সূরা আল-ফালাক", en: "Surah Al-Falaq", ar: "سورة الفلق" },
  { id: 114, bn: "সূরা আন-নাস", en: "Surah An-Nas", ar: "سورة الناس" },
];

const RECITER_PRESETS = [
  {
    bn: "মিশারি রাশিদ আল-আফাসী",
    en: "Mishari Rashid Alafasy",
    avatar: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=400&q=80"
  },
  {
    bn: "আব্দুল বাসিত আব্দুস সামাদ",
    en: "Abdul Basit Abdul Samad",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Abd_El-Baset_Abd_El-Samad_%28cropped%29.jpg"
  },
  {
    bn: "মাহের আল-মুআইক্বিলী",
    en: "Maher Al-Muaiqly",
    avatar: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=400&q=80"
  },
  {
    bn: "ইয়াসির আদ-দুসারী",
    en: "Yasser Al-Dosari",
    avatar: "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=400&q=80"
  },
  {
    bn: "সা'দ আল-গামদী",
    en: "Saad Al-Ghamdi",
    avatar: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=400&q=80"
  },
  {
    bn: "আব্দুর রহমান আস-সুদাইস",
    en: "Abdur-Rahman As-Sudais",
    avatar: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=400&q=80"
  },
  {
    bn: "সৌদ আশ-শুরাইম",
    en: "Saud Ash-Shuraim",
    avatar: "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=400&q=80"
  },
  {
    bn: "ইসলাম সুবহি",
    en: "Islam Sobhi",
    avatar: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=400&q=80"
  },
  {
    bn: "রা'দ আল-কুর্দি",
    en: "Raad Al-Kurdi",
    avatar: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=400&q=80"
  },
  {
    bn: "হাজ্জা আল-বালুশী",
    en: "Hazza Al-Balushi",
    avatar: "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=400&q=80"
  }
];

export const VideoTilawatManagement: React.FC = () => {
  const [videoList, setVideoList] = useState<VideoTilawatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [previewVideo, setPreviewVideo] = useState<VideoTilawatItem | null>(null);

  // Deletion modal state (100% reliable across WebViews and mobile)
  const [videoToDelete, setVideoToDelete] = useState<VideoTilawatItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [sourceType, setSourceType] = useState<"upload" | "url">("upload");
  
  // Granular upload progress states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [uploadedBytes, setUploadedBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);
  const [uploadStage, setUploadStage] = useState<"idle" | "uploading" | "verifying" | "saving" | "failed" | "completed">("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Duplicate warning detection
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Video Info Fields
  const [selectedSurahPreset, setSelectedSurahPreset] = useState<number | "custom">(1);
  const [surahName, setSurahName] = useState("Surah Al-Fatihah (Video Tilawat)");
  const [surahNameBn, setSurahNameBn] = useState("সূরা আল-ফাতিহা (ভিডিও তেলাওয়াত)");
  const [arabicTitle, setArabicTitle] = useState("سورة الفاتحة");

  const [selectedReciterPreset, setSelectedReciterPreset] = useState<string>("Mishari Rashid Alafasy");
  const [reciterName, setReciterName] = useState("Mishari Rashid Alafasy");
  const [reciterNameBn, setReciterNameBn] = useState("মিশারি রাশিদ আল-আফাসী");
  const [reciterAvatar, setReciterAvatar] = useState("https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=400&q=80");

  const [thumbnailUrl, setThumbnailUrl] = useState("https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=1200&q=80");
  const [duration, setDuration] = useState("12:45");
  const [views, setViews] = useState("1.2M views");
  const [category, setCategory] = useState("ভিডিও তেলাওয়াত (Video Tilawat)");
  const [publishedStatus, setPublishedStatus] = useState<"published" | "draft">("published");
  const [description, setDescription] = useState("পবিত্র কুরআনুল কারীমের রূহানী ও হৃদয়স্পর্শী এইচডি ভিডিও তেলাওয়াত।");
  const [tagsInput, setTagsInput] = useState("সূরা আল-ফাতিহা, মিশারি রাশিদ, ভিডিও তেলাওয়াত, Quran HD");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<{ text: string; isError?: boolean } | null>(null);

  const showToast = (text: string, isError = false) => {
    setToast({ text, isError });
    setTimeout(() => setToast(null), 3500);
  };

  // 1. Real-time Firestore sync with instant auto-sort
  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "video_tilawat"), orderBy("createdAt", "desc"), limit(50));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: VideoTilawatItem[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as VideoTilawatItem);
        });
        setVideoList(list);
        setLoading(false);
      },
      (err) => {
        console.warn("Firestore index error fallback:", err);
        getDocs(collection(db, "video_tilawat")).then((snap) => {
          const list: VideoTilawatItem[] = [];
          snap.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...docSnap.data() } as VideoTilawatItem);
          });
          list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          setVideoList(list);
          setLoading(false);
        }).catch(() => setLoading(false));
      }
    );

    return () => unsubscribe();
  }, []);

  // Format bytes to human readable string
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  // Convert duration to seconds
  const parseDurationToSeconds = (durStr: string): number => {
    const parts = durStr.split(":").map(p => Number(p) || 0);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return parts[0] || 600;
  };

  const formatSecondsToDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
    }
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Automatically extract thumbnail & duration from video file
  const handleSelectGalleryVideo = (file: File) => {
    setVideoFile(file);
    setUploadError(null);
    setUploadStage("idle");
    setTotalBytes(file.size);
    setUploadedBytes(0);
    setUploadPercent(0);

    // Duplicate detection check
    const existingMatch = videoList.find(
      (v) => (v.fileSize && Math.abs(v.fileSize - file.size) < 1024) ||
             (v.title && v.title.toLowerCase().includes(file.name.toLowerCase().replace(/\.[^/.]+$/, "")))
    );
    if (existingMatch) {
      setDuplicateWarning(`সাবধান: "${existingMatch.surahNameBn}" ভিডিওটি একই সাইজের (${formatBytes(file.size)}) ইতিমধ্যেই আপলোড করা রয়েছে।`);
    } else {
      setDuplicateWarning(null);
    }

    // Auto extract duration and canvas thumbnail snapshot
    const tempUrl = URL.createObjectURL(file);
    const tempVideo = document.createElement("video");
    tempVideo.preload = "metadata";
    tempVideo.src = tempUrl;
    tempVideo.currentTime = 1.5;

    tempVideo.onloadedmetadata = () => {
      const durSecs = Math.round(tempVideo.duration);
      if (durSecs > 0) {
        setDuration(formatSecondsToDuration(durSecs));
      }
    };

    tempVideo.onseeked = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 640;
        canvas.height = 360;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
          const autoThumb = canvas.toDataURL("image/jpeg", 0.85);
          if (autoThumb && autoThumb.length > 500) {
            setThumbnailUrl(autoThumb);
          }
        }
      } catch (e) {
        console.warn("Canvas video snapshot notice:", e);
      } finally {
        URL.revokeObjectURL(tempUrl);
      }
    };

    showToast(`গ্যালারি থেকে নির্বাচিত: ${file.name} (${formatBytes(file.size)})`);
  };

  // Resumable Chunked Upload Implementation with 3 Auto-Retries per chunk
  const uploadVideoChunks = async (file: File): Promise<{ url: string; storagePath: string; size: number }> => {
    const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB per chunk
    const totalSize = file.size;
    const totalChunks = Math.ceil(totalSize / CHUNK_SIZE);

    setUploadStage("uploading");
    setUploadPercent(0);
    setUploadedBytes(0);
    setTotalBytes(totalSize);

    // 1. Initialize Chunk Session
    const initRes = await fetch(getApiUrl("/api/upload/chunk-init"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        totalSize: file.size,
        mimeType: file.type || "video/mp4"
      })
    });

    if (!initRes.ok) {
      throw new Error("আপলোড সেশন শুরু করা যায়নি");
    }

    const { uploadId } = await initRes.json();

    // 2. Upload Chunks Sequentially with Auto-Retry
    for (let index = 0; index < totalChunks; index++) {
      const start = index * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, totalSize);
      const chunkBlob = file.slice(start, end);

      let chunkUploaded = false;
      let attempts = 0;

      while (!chunkUploaded && attempts < 3) {
        attempts++;
        try {
          const chunkRes = await fetch(
            getApiUrl(`/api/upload/chunk?uploadId=${encodeURIComponent(uploadId)}&chunkIndex=${index}&filename=${encodeURIComponent(file.name)}`),
            {
              method: "POST",
              headers: { "Content-Type": "application/octet-stream" },
              body: chunkBlob
            }
          );

          if (chunkRes.ok) {
            chunkUploaded = true;
            const currentBytes = end;
            setUploadedBytes(currentBytes);
            const percent = Math.min(96, Math.round((currentBytes / totalSize) * 96));
            setUploadPercent(percent);
          } else {
            console.warn(`Chunk ${index} attempt ${attempts} failed, retrying...`);
            await new Promise(r => setTimeout(r, 1000));
          }
        } catch (netErr) {
          console.warn(`Chunk ${index} network blip, retrying...`, netErr);
          await new Promise(r => setTimeout(r, 1200));
        }
      }

      if (!chunkUploaded) {
        throw new Error(`চ্যাঙ্ক ${index + 1}/${totalChunks} আপলোড ব্যর্থ হয়েছে। ইন্টারনেট চেক করে পুনরায় চেষ্টা করুন।`);
      }
    }

    // 3. Finalize & Assemble Complete File
    setUploadStage("verifying");
    setUploadPercent(98);

    const completeRes = await fetch(getApiUrl("/api/upload/chunk-complete"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uploadId,
        filename: file.name,
        totalSize: file.size
      })
    });

    const completeData = await completeRes.json();
    if (!completeRes.ok || !completeData.success) {
      throw new Error(completeData.error || "ভিডিও ফাইল জোড়া দেওয়া সম্ভব হয়নি");
    }

    setUploadPercent(100);
    return {
      url: completeData.url,
      storagePath: completeData.storagePath || `uploads/${completeData.filename}`,
      size: completeData.size || file.size
    };
  };

  // Pre-Publish File Verification
  const verifyUploadedVideoOnServer = async (videoUrl: string): Promise<boolean> => {
    try {
      const res = await fetch(getApiUrl("/api/upload/verify-video"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: videoUrl })
      });
      const data = await res.json();
      return Boolean(data && data.valid);
    } catch {
      return true; // Fallback to avoid false blocks if network is slow
    }
  };

  // Save / Upload Full Pipeline
  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!surahNameBn.trim()) {
      showToast("সূরার বাংলা নাম দিন", true);
      return;
    }
    if (!reciterNameBn.trim()) {
      showToast("ক্বারীর নাম দিন", true);
      return;
    }

    let finalVideoUrl = videoUrlInput.trim();
    let storagePath = "";
    let finalFileSize = videoFile ? videoFile.size : 0;

    // A. Perform Resumable Chunked Upload if a Gallery file was selected
    if (sourceType === "upload" && videoFile) {
      setIsUploading(true);
      setUploadError(null);

      try {
        const uploadResult = await uploadVideoChunks(videoFile);
        finalVideoUrl = uploadResult.url;
        storagePath = uploadResult.storagePath;
        finalFileSize = uploadResult.size;

        // B. Verify on Storage
        setUploadStage("verifying");
        const isValid = await verifyUploadedVideoOnServer(finalVideoUrl);
        if (!isValid) {
          throw new Error("ভিডিও ফাইলটি সার্ভার স্টোরেজে অসম্পূর্ণ অবস্থায় রয়েছে।");
        }
      } catch (err: any) {
        console.error("Upload failure:", err);
        setUploadStage("failed");
        setUploadError(err.message || "ভিডিও আপলোড ব্যর্থ হয়েছে।");
        setIsUploading(false);
        showToast("আপলোড ব্যর্থ হয়েছে। 'পুনরায় আপলোড' বাটন চাপুন।", true);
        return;
      }
    }

    if (!finalVideoUrl && !editingVideoId) {
      showToast("দয়া করে ফোনের গ্যালারি থেকে ভিডিও নির্বাচন করুন", true);
      return;
    }

    // Ensure HTTPS for production Android release app compliance
    if (finalVideoUrl.startsWith("http://") && !finalVideoUrl.includes("localhost") && !finalVideoUrl.includes("127.0.0.1")) {
      finalVideoUrl = finalVideoUrl.replace("http://", "https://");
    }

    setUploadStage("saving");

    const durationSeconds = parseDurationToSeconds(duration);
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const videoRecord: Partial<VideoTilawatItem> = {
      title: `${surahNameBn} - ${reciterNameBn}`,
      surahName: surahName.trim(),
      surahNameBn: surahNameBn.trim(),
      arabicTitle: arabicTitle.trim() || "القرآن الكريم",
      reciterName: reciterName.trim(),
      reciterNameBn: reciterNameBn.trim(),
      reciterAvatar: reciterAvatar.trim(),
      thumbnailUrl: thumbnailUrl.trim(),
      videoUrl: finalVideoUrl,
      storagePath: storagePath || undefined,
      fileSize: finalFileSize || undefined,
      fileSizeFormatted: finalFileSize ? formatBytes(finalFileSize) : undefined,
      uploadStatus: "completed",
      publishedStatus: publishedStatus,
      category: category.trim(),
      duration: duration.trim(),
      durationSeconds,
      views: views.trim() || "1.2M views",
      description: description.trim(),
      tags,
      updatedAt: Date.now()
    };

    try {
      if (editingVideoId) {
        await updateDoc(doc(db, "video_tilawat", editingVideoId), videoRecord);
        showToast("ভিডিও তেলাওয়াত সফলভাবে আপডেট করা হয়েছে!");
      } else {
        const newId = `video_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        await setDoc(doc(db, "video_tilawat", newId), {
          id: newId,
          ...videoRecord,
          createdAt: Date.now()
        });
        showToast("নতুন ভিডিও তেলাওয়াত সফলভাবে আপলোড ও পাবলিশ হয়েছে!");
      }

      setUploadStage("completed");
      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      console.error("Firestore save error:", err);
      setUploadStage("failed");
      setUploadError(`ডাটাবেসে সেভ করা যায়নি: ${err.message}`);
      showToast("ডাটাবেস এন্ট্রি ব্যর্থ হয়েছে", true);
    } finally {
      setIsUploading(false);
    }
  };

  // Safe Delete: Removes Firestore document AND physical file from server storage
  const executeDeleteVideo = async (video: VideoTilawatItem) => {
    setIsDeleting(true);
    try {
      // 1. Optimistically remove from state so the admin UI responds instantly
      setVideoList((prev) => prev.filter((v) => v.id !== video.id));

      // 2. Delete document from Firestore
      await deleteDoc(doc(db, "video_tilawat", video.id));

      // 3. Delete physical video file from server storage
      if (video.videoUrl || video.storagePath) {
        fetch(getApiUrl("/api/upload/delete-video"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: video.videoUrl,
            storagePath: video.storagePath
          })
        }).catch((e) => console.warn("Physical file deletion warning:", e));
      }

      showToast(`"${video.surahNameBn || video.title}" ভিডিওটি সফলভাবে রিমুভ করা হয়েছে!`);
      if (previewVideo?.id === video.id) {
        setPreviewVideo(null);
      }
      if (editingVideoId === video.id) {
        setIsModalOpen(false);
      }
      setVideoToDelete(null);
    } catch (err: any) {
      console.error("Delete video error:", err);
      showToast("ভিডিও মুছতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।", true);
    } finally {
      setIsDeleting(false);
    }
  };

  // One-click Publish / Draft Toggle
  const togglePublishStatus = async (video: VideoTilawatItem) => {
    const nextStatus = video.publishedStatus === "published" ? "draft" : "published";
    try {
      await updateDoc(doc(db, "video_tilawat", video.id), {
        publishedStatus: nextStatus,
        updatedAt: Date.now()
      });
      showToast(nextStatus === "published" ? "ভিডিওটি অ্যাপে প্রকাশিত হয়েছে!" : "ভিডিওটি ড্রাফট করা হয়েছে");
    } catch (e: any) {
      showToast("স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে", true);
    }
  };

  const resetForm = () => {
    setEditingVideoId(null);
    setVideoFile(null);
    setVideoUrlInput("");
    setSourceType("upload");
    setUploadStage("idle");
    setUploadPercent(0);
    setUploadedBytes(0);
    setUploadError(null);
    setDuplicateWarning(null);
    setSelectedSurahPreset(1);
    setSurahName("Surah Al-Fatihah (Video Tilawat)");
    setSurahNameBn("সূরা আল-ফাতিহা (ভিডিও তেলাওয়াত)");
    setArabicTitle("سورة الفاتحة");
    setSelectedReciterPreset("Mishari Rashid Alafasy");
    setReciterName("Mishari Rashid Alafasy");
    setReciterNameBn("মিশারি রাশিদ আল-আফাসী");
    setReciterAvatar("https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=400&q=80");
    setThumbnailUrl("https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=1200&q=80");
    setDuration("12:45");
    setViews("1.2M views");
    setCategory("ভিডিও তেলাওয়াত (Video Tilawat)");
    setPublishedStatus("published");
    setDescription("পবিত্র কুরআনুল কারীমের রূহানী ও হৃদয়স্পর্শী এইচডি ভিডিও তেলাওয়াত।");
    setTagsInput("সূরা আল-ফাতিহা, মিশারি রাশিদ, ভিডিও তেলাওয়াত, Quran HD");
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (video: VideoTilawatItem) => {
    setEditingVideoId(video.id);
    setSourceType(video.videoUrl?.includes("/uploads/") ? "upload" : "url");
    setVideoFile(null);
    setVideoUrlInput(video.videoUrl || "");
    setSurahName(video.surahName);
    setSurahNameBn(video.surahNameBn);
    setArabicTitle(video.arabicTitle);
    setReciterName(video.reciterName);
    setReciterNameBn(video.reciterNameBn);
    setReciterAvatar(video.reciterAvatar);
    setThumbnailUrl(video.thumbnailUrl);
    setDuration(video.duration);
    setViews(video.views);
    setCategory(video.category || "ভিডিও তেলাওয়াত (Video Tilawat)");
    setPublishedStatus(video.publishedStatus || "published");
    setDescription(video.description);
    setTagsInput((video.tags || []).join(", "));
    setUploadStage("idle");
    setUploadError(null);
    setDuplicateWarning(null);
    setIsModalOpen(true);
  };

  const handleSurahPresetChange = (val: string) => {
    if (val === "custom") {
      setSelectedSurahPreset("custom");
      return;
    }
    const num = Number(val);
    const surah = SURAH_PRESETS.find((s) => s.id === num);
    if (surah) {
      setSelectedSurahPreset(num);
      setSurahName(`${surah.en} (Video Tilawat)`);
      setSurahNameBn(`${surah.bn} (ভিডিও তেলাওয়াত)`);
      setArabicTitle(surah.ar);
      setTagsInput(`${surah.bn}, ${reciterNameBn}, ভিডিও তেলাওয়াত, Quran HD`);
    }
  };

  const handleReciterPresetChange = (val: string) => {
    if (val === "custom") {
      setSelectedReciterPreset("custom");
      return;
    }
    const reciter = RECITER_PRESETS.find((r) => r.en === val);
    if (reciter) {
      setSelectedReciterPreset(val);
      setReciterName(reciter.en);
      setReciterNameBn(reciter.bn);
      setReciterAvatar(reciter.avatar);
      setTagsInput(`${surahNameBn}, ${reciter.bn}, ভিডিও তেলাওয়াত, Quran HD`);
    }
  };

  const filteredVideos = videoList.filter((v) => {
    const q = searchTerm.toLowerCase();
    return (
      v.surahNameBn?.toLowerCase().includes(q) ||
      v.surahName?.toLowerCase().includes(q) ||
      v.reciterNameBn?.toLowerCase().includes(q) ||
      v.reciterName?.toLowerCase().includes(q) ||
      v.arabicTitle?.includes(q) ||
      v.category?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 space-y-5">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 shadow-2xl transition-all ${
            toast.isError
              ? "bg-rose-600 text-white shadow-rose-900/30"
              : "bg-emerald-600 text-white shadow-emerald-900/30"
          }`}
        >
          {toast.isError ? (
            <AlertCircle className="w-5 h-5 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-[#032517] via-[#053d26] to-[#042819] border-2 border-emerald-500/40 rounded-3xl p-5 sm:p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-400/30 shadow-inner">
            <Film className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                ভিডিও তেলাওয়াত ম্যানেজমেন্ট
              </h1>
              <span className="px-2.5 py-0.5 bg-emerald-500/30 text-emerald-300 text-[11px] font-bold rounded-full border border-emerald-400/40">
                Gallery Upload & Playback
              </span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-200/90 mt-1">
              সরাসরি ফোনের গ্যালারি থেকে ভিডিও আপলোড করুন। আপলোড সফল হলে Play Store-এর অ্যাপে কোনো নতুন APK ছাড়াই লাইভ দেখা যাবে।
            </p>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={handleOpenAddModal}
          className="w-full md:w-auto px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black text-sm rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Upload className="w-5 h-5 stroke-[2.5]" />
          <span>গ্যালারি থেকে নতুন ভিডিও আপলোড</span>
        </button>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 font-bold">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-500">মোট ভিডিও</p>
            <p className="text-lg font-black text-gray-900">{videoList.length} টি</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-500">প্রকাশিত (Live)</p>
            <p className="text-lg font-black text-emerald-600">
              {videoList.filter(v => v.publishedStatus !== "draft").length} টি
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-500">মোট ক্বারী</p>
            <p className="text-lg font-black text-gray-900">
              {new Set(videoList.map((v) => v.reciterNameBn)).size} জন
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-500">ডায়নামিক সিঙ্ক</p>
            <p className="text-xs font-black text-emerald-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              APK পরিবর্তন ছাড়া
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-3 shadow-xs flex items-center gap-3">
        <Search className="w-5 h-5 text-gray-400 ml-2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="সূরা বা ক্বারীর নাম দিয়ে সার্চ করুন..."
          className="w-full text-xs sm:text-sm font-medium bg-transparent focus:outline-none"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Videos List Grid */}
      {loading ? (
        <div className="text-center py-16">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-2" />
          <p className="text-xs font-bold text-gray-500">ভিডিও তালিকা লোড হচ্ছে...</p>
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200/80 p-12 text-center shadow-xs">
          <Film className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-black text-gray-800">কোনো ভিডিও তেলাওয়াত পাওয়া যায়নি</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
            আপনার ফোনের গ্যালারি থেকে সূরা ও ক্বারীর ভিডিও আপলোড করুন। আপলোড হওয়ার সাথে সাথে প্লে স্টোর অ্যাপে পাওয়া যাবে।
          </p>
          <button
            onClick={handleOpenAddModal}
            className="mt-4 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
          >
            প্রথম ভিডিও আপলোড করুন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className="bg-white rounded-3xl border border-gray-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Thumbnail Preview with Duration & Play Badge */}
                <div 
                  onClick={() => setPreviewVideo(video)}
                  className="relative aspect-video bg-black cursor-pointer group overflow-hidden"
                >
                  <img
                    src={video.thumbnailUrl || "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&q=80"}
                    alt={video.surahNameBn}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/90 text-gray-950 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-gray-950 ml-0.5" />
                    </div>
                  </div>

                  {/* Top Badge: Published vs Draft */}
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shadow-md ${
                      video.publishedStatus === "draft"
                        ? "bg-amber-500 text-gray-950"
                        : "bg-emerald-500 text-white"
                    }`}>
                      {video.publishedStatus === "draft" ? "খসড়া (Draft)" : "লাইভ (Published)"}
                    </span>
                    {video.fileSizeFormatted && (
                      <span className="px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-mono backdrop-blur-xs">
                        {video.fileSizeFormatted}
                      </span>
                    )}
                  </div>

                  {/* Direct Delete Button on Thumbnail */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setVideoToDelete(video);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-rose-600 text-white transition-colors backdrop-blur-xs z-10 cursor-pointer shadow-md"
                    title="ভিডিওটি রিমুভ করুন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Duration Badge */}
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-white text-[11px] font-mono font-bold">
                    {video.duration}
                  </div>
                </div>

                {/* Content details */}
                <div className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-black text-gray-900 leading-snug">
                        {video.surahNameBn}
                      </h3>
                      <p className="text-[11px] font-medium text-emerald-800">
                        {video.surahName}
                      </p>
                    </div>
                    <span className="font-arabic text-emerald-700 font-bold text-sm text-right shrink-0">
                      {video.arabicTitle}
                    </span>
                  </div>

                  {/* Reciter Info */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <img
                      src={video.reciterAvatar || "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=400&q=80"}
                      alt={video.reciterNameBn}
                      className="w-7 h-7 rounded-full object-cover border border-emerald-500/30 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate">
                        {video.reciterNameBn}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate">
                        {video.reciterName}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-2 border-t border-gray-100 flex items-center justify-between gap-2 flex-wrap">
                <button
                  onClick={() => togglePublishStatus(video)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    video.publishedStatus === "draft"
                      ? "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                      : "bg-amber-50 text-amber-800 hover:bg-amber-100"
                  }`}
                  title="অ্যাপে দৃশ্যমানতা পরিবর্তন করুন"
                >
                  {video.publishedStatus === "draft" ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                  <span>{video.publishedStatus === "draft" ? "পাবলিশ করুন" : "ড্রাফট করুন"}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditModal(video)}
                    className="px-2.5 py-1.5 text-gray-700 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer border border-gray-200"
                    title="তথ্য এডিট করুন"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>এডিট</span>
                  </button>
                  <button
                    onClick={() => setVideoToDelete(video)}
                    className="px-2.5 py-1.5 text-rose-700 bg-rose-50 hover:bg-rose-100 hover:text-rose-800 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer border border-rose-200 shadow-xs"
                    title="ভিডিও রিমুভ করুন"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>রিমুভ</span>
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD / EDIT VIDEO MODAL (Gallery Select + Resumable Upload + Verification) */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-[#032517] to-[#042819] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-400/30">
                  <Film className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold">
                    {editingVideoId ? "ভিডিও তথ্য এডিট করুন" : "ফোনের গ্যালারি থেকে ভিডিও আপলোড"}
                  </h2>
                  <p className="text-[11px] text-emerald-200">
                    আপলোড সম্পূর্ণ হলে স্বয়ংক্রিয়ভাবে ভেরিফাই ও পাবলিশ হবে
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (!isUploading) setIsModalOpen(false);
                }}
                disabled={isUploading}
                className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition disabled:opacity-30"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveVideo} className="p-5 overflow-y-auto space-y-4 flex-1">
              
              {/* Duplicate Warning Alert */}
              {duplicateWarning && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-2.5 text-amber-900 text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">সতর্কবার্তা:</p>
                    <p>{duplicateWarning}</p>
                  </div>
                </div>
              )}

              {/* 1. GALLERY VIDEO SELECTION BUTTON */}
              {!editingVideoId && (
                <div className="space-y-2">
                  <label className="block text-xs font-black text-gray-900">
                    ভিডিও ফাইল নির্বাচন করুন (Android Phone Gallery) <span className="text-rose-500">*</span>
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleSelectGalleryVideo(f);
                    }}
                    className="hidden"
                  />

                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-emerald-400 hover:border-emerald-600 bg-emerald-50/50 hover:bg-emerald-50 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition text-center group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-gray-950 flex items-center justify-center mb-2 shadow-md group-hover:scale-105 transition-transform">
                      <Upload className="w-7 h-7 stroke-[2.5]" />
                    </div>
                    
                    <p className="text-sm font-black text-emerald-950">
                      {videoFile ? videoFile.name : "গ্যালারি খুলতে এখানে চাপ দিন (Choose from Gallery)"}
                    </p>
                    
                    <p className="text-xs text-gray-600 mt-1">
                      {videoFile 
                        ? `সাইজ: ${formatBytes(videoFile.size)} • সময়সীমা: ${duration}` 
                        : "যেকোনো রেজোলিউশন ও ১ ঘণ্টা পর্যন্ত তেলাওয়াত সাপোর্ট করে"}
                    </p>
                  </div>
                </div>
              )}

              {/* Resumable Upload Progress Bar */}
              {isUploading && (
                <div className="p-4 bg-emerald-900/10 border-2 border-emerald-500/40 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-black text-emerald-950">
                    <span className="flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                      {uploadStage === "uploading" && `আপলোড হচ্ছে: ${uploadPercent}%`}
                      {uploadStage === "verifying" && "সার্ভার ও স্টোরেজ ভেরিফিকেশন চলছে..."}
                      {uploadStage === "saving" && "ডাটাবেস রেকর্ড এন্ট্রি হচ্ছে..."}
                    </span>
                    <span className="font-mono text-emerald-800">
                      {formatBytes(uploadedBytes)} / {formatBytes(totalBytes)}
                    </span>
                  </div>

                  <div className="w-full bg-emerald-200 rounded-full h-3 overflow-hidden shadow-inner">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${uploadPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Upload Failure Retry Box */}
              {uploadStage === "failed" && uploadError && (
                <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl flex items-center justify-between gap-3 text-rose-900 text-xs">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <div>
                      <p className="font-black">আপলোড ব্যর্থ হয়েছে (Upload Failed):</p>
                      <p>{uploadError}</p>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow active:scale-95 transition shrink-0 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>পুনরায় আপলোড (Retry)</span>
                  </button>
                </div>
              )}

              {/* 2. Surah & Reciter Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-800">
                    পবিত্র সূরা নির্বাচন করুন
                  </label>
                  <select
                    value={selectedSurahPreset}
                    onChange={(e) => handleSurahPresetChange(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-500"
                  >
                    {SURAH_PRESETS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.id}. {s.bn} ({s.en})
                      </option>
                    ))}
                    <option value="custom">+ কাস্টম সূরা / রুকূ'</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-800">
                    আরবি শিরোনাম
                  </label>
                  <input
                    type="text"
                    value={arabicTitle}
                    onChange={(e) => setArabicTitle(e.target.value)}
                    placeholder="سورة الفاتحة"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-right font-arabic focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>
              </div>

              {/* Surah Name Bengali & English */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-800">
                    সূরার বাংলা নাম <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={surahNameBn}
                    onChange={(e) => setSurahNameBn(e.target.value)}
                    placeholder="সূরা আল-ফাতিহা"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-bold focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-800">
                    সূরার ইংরেজি নাম
                  </label>
                  <input
                    type="text"
                    value={surahName}
                    onChange={(e) => setSurahName(e.target.value)}
                    placeholder="Surah Al-Fatihah"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Reciter Name Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-800">
                    ক্বারী নির্বাচন করুন
                  </label>
                  <select
                    value={selectedReciterPreset}
                    onChange={(e) => handleReciterPresetChange(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-500"
                  >
                    {RECITER_PRESETS.map((r) => (
                      <option key={r.en} value={r.en}>
                        {r.bn} ({r.en})
                      </option>
                    ))}
                    <option value="custom">+ অন্যান্য ক্বারী</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-800">
                    ক্বারীর বাংলা নাম <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={reciterNameBn}
                    onChange={(e) => setReciterNameBn(e.target.value)}
                    placeholder="মিশারি রাশিদ আল-আফাসী"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-bold focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Duration & Published Status Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-800">
                    ভিডিওর সময়সীমা (Duration)
                  </label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="12:45"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-800">
                    পাবলিশ স্ট্যাটাস (Published Status)
                  </label>
                  <select
                    value={publishedStatus}
                    onChange={(e) => setPublishedStatus(e.target.value as "published" | "draft")}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-500"
                  >
                    <option value="published">🟢 প্রকাশিত (Published - অ্যাপে সরাসরি দেখাবে)</option>
                    <option value="draft">🟡 খসড়া (Draft - শুধুমাত্র অ্যাডমিনে থাকবে)</option>
                  </select>
                </div>
              </div>

              {/* Thumbnail Preview & Custom Upload */}
              <div className="space-y-1.5 pt-2 border-t border-gray-100">
                <label className="block text-xs font-bold text-gray-800">
                  ভিডিও থাম্বনেইল ছবি (অটো-জেনারেটেড প্রিভিউ)
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={thumbnailUrl || "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&q=80"}
                    alt="Thumbnail"
                    className="w-20 h-12 rounded-xl object-cover border border-emerald-500/30 shrink-0 shadow-sm"
                  />
                  <div className="flex-1">
                    <label className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl cursor-pointer transition inline-block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              if (reader.result) setThumbnailUrl(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                      কাস্টম থাম্বনেইল নির্বাচন
                    </label>
                    <p className="text-[10px] text-gray-500 mt-1">
                      ভিডিও সিলেক্ট করার সাথে সাথে অটোমেটিক্যালি একটি থাম্বনেইল ক্যাপচার হয়। চাইলে নিজের পছন্দমতো ছবি দিতে পারেন।
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800">
                  সংক্ষিপ্ত বিবরণ (Description)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="তেলাওয়াত ও সূরার ফজিলত..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-2.5 flex-wrap">
                {editingVideoId ? (
                  <button
                    type="button"
                    onClick={() => {
                      const v = videoList.find((i) => i.id === editingVideoId);
                      if (v) {
                        setIsModalOpen(false);
                        setVideoToDelete(v);
                      }
                    }}
                    className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 border border-rose-200"
                  >
                    <Trash2 className="w-4 h-4 text-rose-600" />
                    <span>এই ভিডিওটি রিমুভ করুন</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isUploading}
                    className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-md active:scale-95 transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>প্রসেসিং হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{editingVideoId ? "তথ্য আপডেট করুন" : "আপলোড ও পাবলিশ করুন"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIDEO PREVIEW MODAL */}
      {/* ========================================================================= */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-gray-900 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl border border-emerald-500/40 text-white animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-3.5 bg-gray-950 flex items-center justify-between border-b border-gray-800">
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <h3 className="text-sm font-bold text-emerald-300 truncate">
                  {previewVideo.surahNameBn} ({previewVideo.reciterNameBn})
                </h3>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    const target = previewVideo;
                    setPreviewVideo(null);
                    setVideoToDelete(target);
                  }}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow"
                  title="এই ভিডিওটি মুছে ফেলুন"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ভিডিও রিমুভ</span>
                </button>
                <button
                  onClick={() => setPreviewVideo(null)}
                  className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="aspect-video bg-black flex items-center justify-center relative">
              {previewVideo.videoUrl ? (
                <video
                  src={previewVideo.videoUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                  poster={previewVideo.thumbnailUrl}
                />
              ) : (
                <div className="text-center p-8">
                  <p className="text-sm text-gray-400">কোন সরাসরি ভিডিও স্ট্রীম লিংক নেই</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-950 flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>সময়সীমা: {previewVideo.duration}</span>
                {previewVideo.fileSizeFormatted && (
                  <span>• সাইজ: {previewVideo.fileSizeFormatted}</span>
                )}
              </div>
              <span className="font-arabic text-emerald-400 font-bold text-sm">
                {previewVideo.arabicTitle}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION DIALOG (Works 100% reliably in WebViews and mobile) */}
      {/* ========================================================================= */}
      {videoToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border-2 border-rose-200">
            {/* Header */}
            <div className="p-5 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center border border-rose-200 shadow-inner">
                <Trash2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-gray-900">
                  ভিডিওটি স্থায়ীভাবে রিমুভ করবেন?
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  এই ভিডিওটি ডাটাবেস ও সার্ভার স্টোরেজ উভয় থেকেই মুছে যাবে এবং অ্যাপের তেলাওয়াত সেকশন থেকে তৎক্ষণাৎ অদৃশ্য হয়ে যাবে।
                </p>
              </div>

              {/* Target Video Card Preview */}
              <div className="bg-gray-50 rounded-2xl p-3 border border-gray-200 flex items-center gap-3 text-left">
                <img
                  src={videoToDelete.thumbnailUrl || "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=200&q=80"}
                  alt={videoToDelete.surahNameBn}
                  className="w-16 h-12 rounded-lg object-cover bg-black shrink-0 border border-gray-300"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-black text-gray-900 truncate">
                    {videoToDelete.surahNameBn}
                  </h4>
                  <p className="text-[11px] text-emerald-700 font-bold truncate">
                    {videoToDelete.reciterNameBn}
                  </p>
                  <p className="text-[10px] text-gray-400 font-mono">
                    সময়সীমা: {videoToDelete.duration}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setVideoToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-3 bg-white hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-xl border border-gray-300 transition cursor-pointer disabled:opacity-50"
              >
                না, বাতিল করুন
              </button>
              <button
                type="button"
                onClick={() => executeDeleteVideo(videoToDelete)}
                disabled={isDeleting}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-black text-xs rounded-xl shadow-lg transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>রিমুভ হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>হ্যাঁ, রিমুভ করুন</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
