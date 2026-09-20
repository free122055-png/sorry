import React, { useState, useEffect } from "react";
import { 
  collection, doc, getDocs, setDoc, deleteDoc, updateDoc, 
  onSnapshot, query, orderBy 
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { getApiUrl } from "../../lib/api";
import { 
  Video, Upload, Plus, Trash2, Edit3, Play, X, CheckCircle2, 
  AlertCircle, Film, Sparkles, Eye, Clock, User, BookOpen, 
  ExternalLink, Search, RefreshCw, Layers
} from "lucide-react";

export interface VideoTilawatItem {
  id: string;
  surahName: string;
  surahNameBn: string;
  reciterName: string;
  reciterNameBn: string;
  reciterAvatar: string;
  duration: string;
  durationSeconds: number;
  views: string;
  thumbnailUrl: string;
  videoUrl?: string;
  arabicTitle: string;
  description: string;
  tags: string[];
  createdAt?: number;
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

// Famous Reciters Preset List
const RECITER_PRESETS = [
  {
    bn: "মিশারি রাশিদ আল-আফাসী",
    en: "Mishari Rashid Alafasy",
    avatar: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80"
  },
  {
    bn: "আব্দুল বাসিত আব্দুস সামাদ",
    en: "Abdul Basit Abdul Samad",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Abd_El-Baset_Abd_El-Samad_%28cropped%29.jpg"
  },
  {
    bn: "মাহের আল-মুআইক্বিলী",
    en: "Maher Al-Muaiqly",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80"
  },
  {
    bn: "ইয়াসির আদ-দুসারী",
    en: "Yasser Al-Dosari",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80"
  },
  {
    bn: "সা'দ আল-গামদী",
    en: "Saad Al-Ghamdi",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80"
  },
  {
    bn: "আব্দুর রহমান আস-সুদাইস",
    en: "Abdur-Rahman As-Sudais",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80"
  },
  {
    bn: "সৌদ আশ-শুরাইম",
    en: "Saud Ash-Shuraim",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80"
  },
  {
    bn: "ইসলাম সুবহি",
    en: "Islam Sobhi",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80"
  },
  {
    bn: "রা'দ আল-কুর্দি",
    en: "Raad Al-Kurdi",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&q=80"
  },
  {
    bn: "হাজ্জা আল-বালুশী",
    en: "Hazza Al-Balushi",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80"
  }
];

export const VideoTilawatManagement: React.FC = () => {
  const [videoList, setVideoList] = useState<VideoTilawatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [previewVideo, setPreviewVideo] = useState<VideoTilawatItem | null>(null);

  // Form states
  const [sourceType, setSourceType] = useState<"upload" | "url">("upload");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  const [selectedSurahPreset, setSelectedSurahPreset] = useState<number | "custom">(1);
  const [surahName, setSurahName] = useState("Surah Al-Fatihah (Video Tilawat)");
  const [surahNameBn, setSurahNameBn] = useState("সূরা আল-ফাতিহা (ভিডিও তেলাওয়াত)");
  const [arabicTitle, setArabicTitle] = useState("سورة الفاتحة");

  const [selectedReciterPreset, setSelectedReciterPreset] = useState<string>("Mishari Rashid Alafasy");
  const [reciterName, setReciterName] = useState("Mishari Rashid Alafasy");
  const [reciterNameBn, setReciterNameBn] = useState("মিশারি রাশিদ আল-আফাসী");
  const [reciterAvatar, setReciterAvatar] = useState("https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80");

  const [thumbnailUrl, setThumbnailUrl] = useState("https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80");
  const [duration, setDuration] = useState("12:45");
  const [views, setViews] = useState("1.2M views");
  const [description, setDescription] = useState("A heart-soothing video recitation of the Holy Quran.");
  const [tagsInput, setTagsInput] = useState("Surah Al-Fatihah, Mishari Rashid, Video Tilawat, Quran HD");

  const [toast, setToast] = useState<{ text: string; isError?: boolean } | null>(null);

  const showToast = (text: string, isError = false) => {
    setToast({ text, isError });
    setTimeout(() => setToast(null), 3500);
  };

  // Real-time listener from Firestore collection "video_tilawat"
  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "video_tilawat"), orderBy("createdAt", "desc"));
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
      (error) => {
        console.error("Firestore video_tilawat fetch error:", error);
        // Fallback without ordering in case index is pending
        getDocs(collection(db, "video_tilawat"))
          .then((snap) => {
            const list: VideoTilawatItem[] = [];
            snap.forEach((docSnap) => {
              list.push({ id: docSnap.id, ...docSnap.data() } as VideoTilawatItem);
            });
            setVideoList(list);
            setLoading(false);
          })
          .catch((err) => {
            console.error(err);
            setLoading(false);
          });
      }
    );

    return () => unsubscribe();
  }, []);

  // Handle Surah change
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

  // Handle Reciter change
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

  // Parse duration string to seconds (e.g. "12:45" or "1:05:20")
  const parseDurationToSeconds = (durStr: string): number => {
    const parts = durStr.split(":").map(p => Number(p) || 0);
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 1) {
      return parts[0];
    }
    return 600;
  };

  // Format seconds to mm:ss or hh:mm:ss
  const formatSecondsToDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
    }
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Handle Video file selection and auto-calculate length
  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 550 * 1024 * 1024) {
      showToast("ভিডিও ফাইলটির সাইজ ৫০০MB এর চেয়ে বেশি হতে পারবে না।", true);
      return;
    }

    setVideoFile(file);
    // Create temporary object url to get video duration
    const tempUrl = URL.createObjectURL(file);
    const tempVideo = document.createElement("video");
    tempVideo.src = tempUrl;
    tempVideo.onloadedmetadata = () => {
      const durSecs = Math.round(tempVideo.duration);
      if (durSecs > 0) {
        setDuration(formatSecondsToDuration(durSecs));
      }
      URL.revokeObjectURL(tempUrl);
    };
    showToast(`ফাইল নির্বাচিত: ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)`);
  };

  // Thumbnail image file upload
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        const res = await fetch(getApiUrl("/api/upload/image"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64 }),
        });
        const data = await res.json();
        if (data.success && data.url) {
          setThumbnailUrl(data.url);
          showToast("থাম্বনেইল ফটো সফলভাবে আপলোড হয়েছে!");
        } else {
          setThumbnailUrl(base64);
          showToast("থাম্বনেইল প্রস্তুত হয়েছে!");
        }
      } catch (err) {
        setThumbnailUrl(base64);
        showToast("থাম্বনেইল যুক্ত হয়েছে!");
      }
    };
    reader.readAsDataURL(file);
  };

  // Reciter Avatar file upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        const res = await fetch(getApiUrl("/api/upload/image"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64 }),
        });
        const data = await res.json();
        if (data.success && data.url) {
          setReciterAvatar(data.url);
          showToast("ক্বারীর ছবি আপলোড হয়েছে!");
        } else {
          setReciterAvatar(base64);
        }
      } catch (err) {
        setReciterAvatar(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  // Reset modal form
  const handleOpenAddModal = () => {
    setEditingVideoId(null);
    setSourceType("upload");
    setVideoFile(null);
    setVideoUrlInput("");
    setSelectedSurahPreset(1);
    setSurahName("Surah Al-Fatihah (Video Tilawat)");
    setSurahNameBn("সূরা আল-ফাতিহা (ভিডিও তেলাওয়াত)");
    setArabicTitle("سورة الفاتحة");
    setSelectedReciterPreset("Mishari Rashid Alafasy");
    setReciterName("Mishari Rashid Alafasy");
    setReciterNameBn("মিশারি রাশিদ আল-আফাসী");
    setReciterAvatar("https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80");
    setThumbnailUrl("https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80");
    setDuration("12:45");
    setViews("1.2M views");
    setDescription("A heart-soothing video recitation of the Holy Quran.");
    setTagsInput("সূরা আল-ফাতিহা, মিশারি রাশিদ, ভিডিও তেলাওয়াত, Quran HD");
    setUploadProgress(0);
    setIsModalOpen(true);
  };

  // Edit an existing video
  const handleOpenEditModal = (video: VideoTilawatItem) => {
    setEditingVideoId(video.id);
    setSourceType(video.videoUrl?.startsWith("/uploads") ? "upload" : "url");
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
    setDescription(video.description);
    setTagsInput((video.tags || []).join(", "));
    setIsModalOpen(true);
  };

  // Save / Upload Video to Firestore & Server
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

    // If uploading a video file
    if (sourceType === "upload" && videoFile) {
      setIsUploadingVideo(true);
      setUploadProgress(5);

      try {
        // High-speed binary stream upload with granular progress tracking
        const uploadViaStream = (file: File): Promise<string> => {
          return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", `/api/upload/video-stream?filename=${encodeURIComponent(file.name)}`);
            
            xhr.upload.onprogress = (event) => {
              if (event.lengthComputable) {
                const percent = Math.min(98, Math.round((event.loaded / event.total) * 98));
                setUploadProgress(percent);
              }
            };

            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                try {
                  const res = JSON.parse(xhr.responseText);
                  if (res.success && res.url) {
                    setUploadProgress(100);
                    resolve(res.url);
                  } else {
                    reject(new Error(res.error || "আপলোড ব্যর্থ হয়েছে"));
                  }
                } catch (e: any) {
                  reject(new Error("রেসপন্স প্রসেসিং এরর"));
                }
              } else {
                reject(new Error(`সার্ভার এরর: ${xhr.status}`));
              }
            };

            xhr.onerror = () => reject(new Error("নেটওয়ার্ক এরর হয়েছে"));
            xhr.send(file);
          });
        };

        try {
          finalVideoUrl = await uploadViaStream(videoFile);
        } catch (streamErr) {
          console.warn("Stream upload fallback to base64:", streamErr);
          // Fallback to base64 endpoint if stream fails
          setUploadProgress(30);
          const reader = new FileReader();
          const readPromise = new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
          });
          reader.readAsDataURL(videoFile);
          const base64Data = await readPromise;
          setUploadProgress(60);

          const res = await fetch(getApiUrl("/api/upload/video"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              video: base64Data,
              filename: videoFile.name,
              fileType: videoFile.type,
            }),
          });

          setUploadProgress(90);
          const uploadRes = await res.json();
          if (uploadRes.success && uploadRes.url) {
            finalVideoUrl = uploadRes.url;
            setUploadProgress(100);
          } else {
            throw new Error(uploadRes.error || "ভিডিও আপলোড ব্যর্থ হয়েছে");
          }
        }
      } catch (err: any) {
        console.error("Video file upload error:", err);
        showToast(`ভিডিও আপলোড ব্যর্থ: ${err.message || "সার্ভার এরর"}`, true);
        setIsUploadingVideo(false);
        return;
      } finally {
        setIsUploadingVideo(false);
      }
    }

    if (!finalVideoUrl && !editingVideoId) {
      showToast("দয়া করে ভিডিও ফাইল আপলোড করুন অথবা ভিডিও লিংক দিন", true);
      return;
    }

    const durationSeconds = parseDurationToSeconds(duration);
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const videoData: Partial<VideoTilawatItem> = {
      surahName: surahName.trim(),
      surahNameBn: surahNameBn.trim(),
      arabicTitle: arabicTitle.trim() || "القرآن الكريم",
      reciterName: reciterName.trim(),
      reciterNameBn: reciterNameBn.trim(),
      reciterAvatar: reciterAvatar.trim(),
      thumbnailUrl: thumbnailUrl.trim(),
      videoUrl: finalVideoUrl || undefined,
      duration: duration.trim(),
      durationSeconds,
      views: views.trim() || "100K views",
      description: description.trim(),
      tags,
    };

    try {
      if (editingVideoId) {
        await updateDoc(doc(db, "video_tilawat", editingVideoId), {
          ...videoData,
          updatedAt: Date.now(),
        });
        showToast("ভিডিও তেলাওয়াত সফলভাবে আপডেট করা হয়েছে!");
      } else {
        const newId = `video_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        await setDoc(doc(db, "video_tilawat", newId), {
          id: newId,
          ...videoData,
          createdAt: Date.now(),
        });
        showToast("নতুন ভিডিও তেলাওয়াত সফলভাবে আপলোড ও যোগ করা হয়েছে!");
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Firestore save video error:", err);
      showToast(`সংরক্ষণ ব্যর্থ হয়েছে: ${err.message}`, true);
    }
  };

  // Delete Video from Firestore
  const handleDeleteVideo = async (id: string, title: string) => {
    if (!window.confirm(`আপনি কি নিশ্চিতভাবে "${title}" ভিডিওটি মুছে ফেলতে চান?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, "video_tilawat", id));
      showToast("ভিডিও সফলভাবে মুছে ফেলা হয়েছে");
    } catch (err: any) {
      console.error("Delete video error:", err);
      showToast("মুছে ফেলতে ব্যর্থ হয়েছে", true);
    }
  };

  // Filtered video list by search
  const filteredVideos = videoList.filter((v) => {
    const q = searchTerm.toLowerCase();
    return (
      v.surahNameBn?.toLowerCase().includes(q) ||
      v.surahName?.toLowerCase().includes(q) ||
      v.reciterNameBn?.toLowerCase().includes(q) ||
      v.reciterName?.toLowerCase().includes(q) ||
      v.arabicTitle?.includes(q)
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
                HD 1080p Video Tilawat
              </span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-200/90 mt-1">
              ১ ঘণ্টা পর্যন্ত ভিডিও তেলাওয়াত আপলোড করুন। প্লে কনসোল ও মোবাইল অ্যাপে সরাসরি প্লে হবে।
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleOpenAddModal}
          className="w-full md:w-auto px-5 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black text-sm rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-5 h-5 stroke-[3]" />
          <span>নতুন ভিডিও আপলোড করুন</span>
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
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-500">মোট সূরা</p>
            <p className="text-lg font-black text-gray-900">
              {new Set(videoList.map((v) => v.surahNameBn)).size} টি
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
            <p className="text-[11px] font-bold text-gray-500">লাইভ সিঙ্ক</p>
            <p className="text-xs font-black text-emerald-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              সরাসরি চালু
            </p>
          </div>
        </div>
      </div>

      {/* Search & Control Bar */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-3.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="সূরা বা ক্বারীর নাম দিয়ে খুঁজুন..."
            className="w-full pl-9.5 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs font-bold text-gray-500">
            দেখানো হচ্ছে: {filteredVideos.length} টি
          </span>
        </div>
      </div>

      {/* Video Grid List */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-gray-200/80 p-12 text-center">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-600">ভিডিও লোড হচ্ছে...</p>
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-gray-300 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Film className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">
              {searchTerm ? "কোন ভিডিও খুঁজে পাওয়া যায়নি" : "এখনো কোনো ভিডিও তেলাওয়াত আপলোড করা হয়নি"}
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
              {searchTerm
                ? "অন্য নাম দিয়ে চেষ্টা করুন"
                : "উপরে 'নতুন ভিডিও আপলোড করুন' বাটনে ক্লিক করে সরাসরি ১ ঘণ্টা পর্যন্ত ভিডিও ফাইল বা ইউটিউব লিংক যোগ করুন।"}
            </p>
          </div>
          {!searchTerm && (
            <button
              onClick={handleOpenAddModal}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow cursor-pointer active:scale-95 transition"
            >
              + প্রথম ভিডিও আপলোড করুন
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className="bg-white rounded-2xl border border-gray-200/90 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video bg-gray-950 overflow-hidden">
                <img
                  src={video.thumbnailUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80"}
                  alt={video.surahNameBn}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Duration Badge */}
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-white text-[11px] font-mono font-bold flex items-center gap-1 shadow">
                  <Clock className="w-3 h-3 text-emerald-400" />
                  <span>{video.duration}</span>
                </div>

                {/* Arabic Calligraphy Watermark */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 text-xs font-bold font-arabic border border-emerald-400/30">
                  {video.arabicTitle || "القرآن الكريم"}
                </div>

                {/* Play Button Overlay */}
                <button
                  onClick={() => setPreviewVideo(video)}
                  className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-emerald-500/90 hover:bg-emerald-400 text-gray-950 flex items-center justify-center shadow-xl active:scale-90 transition-all cursor-pointer opacity-90 group-hover:opacity-100"
                  title="ভিডিও প্লে প্রিভিউ দেখুন"
                >
                  <Play className="w-6 h-6 fill-current ml-0.5" />
                </button>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 leading-tight">
                        {video.surahNameBn}
                      </h3>
                      <p className="text-[11px] text-gray-500 font-medium">
                        {video.surahName}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-md shrink-0">
                      {video.views}
                    </span>
                  </div>

                  {/* Reciter Info */}
                  <div className="flex items-center gap-2.5 mt-3 pt-2.5 border-t border-gray-100">
                    <img
                      src={video.reciterAvatar || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80"}
                      alt={video.reciterNameBn}
                      className="w-8 h-8 rounded-full object-cover border border-emerald-500/30 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate">
                        {video.reciterNameBn}
                      </p>
                      <p className="text-[10px] text-emerald-700 truncate">
                        {video.reciterName}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  {video.description && (
                    <p className="text-[11px] text-gray-600 mt-2 line-clamp-2">
                      {video.description}
                    </p>
                  )}
                </div>

                {/* Footer Action Buttons */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setPreviewVideo(video)}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>প্লে করুন</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(video)}
                      className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                      title="এডিট করুন"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteVideo(video.id, video.surahNameBn)}
                      className="p-1.5 text-gray-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD / EDIT VIDEO MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-[#032517] to-[#042819] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-400/30">
                  <Film className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold">
                    {editingVideoId ? "ভিডিও তেলাওয়াত এডিট করুন" : "নতুন ভিডিও তেলাওয়াত আপলোড"}
                  </h2>
                  <p className="text-[11px] text-emerald-200">
                    সর্বোচ্চ ১ ঘণ্টা পর্যন্ত তেলাওয়াত ভিডিও সাপোর্ট করে
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveVideo} className="p-5 overflow-y-auto space-y-4 flex-1">
              {/* 1. Video Source Mode: Upload vs Direct URL */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-gray-900">
                  ভিডিও সোর্স নির্বাচন করুন <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSourceType("upload")}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                      sourceType === "upload"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    <span>ভিডিও ফাইল আপলোড (১ ঘণ্টা পর্যন্ত)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSourceType("url")}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                      sourceType === "url"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>ইউটিউব / ডাইরেক্ট ভিডিও লিংক</span>
                  </button>
                </div>
              </div>

              {/* Source Input Area */}
              {sourceType === "upload" ? (
                <div className="space-y-2">
                  <label className="border-2 border-dashed border-emerald-400/60 hover:border-emerald-500 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer bg-emerald-50/40 hover:bg-emerald-50/70 transition group">
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/ogg,video/quicktime,video/mkv"
                      onChange={handleVideoFileChange}
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <span className="text-xs sm:text-sm font-black text-emerald-900">
                      {videoFile ? videoFile.name : "ভিডিও ফাইল সিলেক্ট করুন"}
                    </span>
                    <span className="text-[11px] text-gray-500 mt-0.5">
                      {videoFile
                        ? `${(videoFile.size / (1024 * 1024)).toFixed(1)} MB`
                        : "MP4, WebM, MKV (সর্বোচ্চ ৫০০MB / ১ ঘণ্টা)"}
                    </span>
                  </label>

                  {isUploadingVideo && (
                    <div className="space-y-1.5 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                      <div className="flex justify-between text-xs font-bold text-emerald-900">
                        <span>ভিডিও আপলোড হচ্ছে...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-emerald-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-800">
                    ভিডিও লিংক (YouTube / MP4 / Google Drive / Cloud Link)
                  </label>
                  <input
                    type="url"
                    value={videoUrlInput}
                    onChange={(e) => setVideoUrlInput(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... বা https://.../video.mp4"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <p className="text-[10px] text-gray-500">
                    টিপস: ইউটিউব লিংক, ডিরেক্ট MP4 ফাইল লিংক অথবা যেকোনো ড্রাইভ লিংক দেওয়া যাবে।
                  </p>
                </div>
              )}

              {/* 2. Surah Selection (Preset or Custom) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-800">
                    পবিত্র সূরা নির্বাচন (১-১১৪)
                  </label>
                  <select
                    value={selectedSurahPreset}
                    onChange={(e) => handleSurahPresetChange(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-500"
                  >
                    {SURAH_PRESETS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.id}. {s.bn} ({s.en})
                      </option>
                    ))}
                    <option value="custom">+ কাস্টম সূরা / আয়াত</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-800">
                    আরবি ক্যালিগ্রাফি শিরোনাম
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
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-bold focus:outline-none focus:border-emerald-500"
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
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* 3. Reciter Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-800">
                    ক্বারী নির্বাচন করুন
                  </label>
                  <select
                    value={selectedReciterPreset}
                    onChange={(e) => handleReciterPresetChange(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-500"
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
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-bold focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Reciter Avatar & Thumbnail */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-800">
                    ক্বারীর ছবি (Avatar)
                  </label>
                  <div className="flex items-center gap-2">
                    <img
                      src={reciterAvatar || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80"}
                      alt="Avatar"
                      className="w-9 h-9 rounded-full object-cover border shrink-0"
                    />
                    <label className="flex-1 py-1.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl text-center cursor-pointer transition">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                      ছবি আপলোড
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-800">
                    ভিডিও থাম্বনেইল ছবি
                  </label>
                  <div className="flex items-center gap-2">
                    <img
                      src={thumbnailUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80"}
                      alt="Thumbnail"
                      className="w-12 h-9 rounded-lg object-cover border shrink-0"
                    />
                    <label className="flex-1 py-1.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl text-center cursor-pointer transition">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailUpload}
                        className="hidden"
                      />
                      থাম্বনেইল আপলোড
                    </label>
                  </div>
                </div>
              </div>

              {/* Duration & Views */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-800">
                    ভিডিওর সময়সীমা (Duration: mm:ss বা hh:mm:ss)
                  </label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="12:45 বা 1:00:00"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-800">
                    ভিউ কাউন্ট (প্রদর্শনীর জন্য)
                  </label>
                  <input
                    type="text"
                    value={views}
                    onChange={(e) => setViews(e.target.value)}
                    placeholder="1.2M views"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800">
                  বিবরণ ও ফযিলত
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="তেলাওয়াত ও সূরার তাৎপর্য সংক্ষেপে..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800">
                  ট্যাগসমূহ (কমা দিয়ে আলাদা করুন)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="সূরা আল-ফাতিহা, মিশারি রাশিদ, ভিডিও তেলাওয়াত, Quran HD"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isUploadingVideo}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-md active:scale-95 transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingVideoId ? "আপডেট করুন" : "সংরক্ষণ ও প্রকাশ করুন"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIDEO PREVIEW MODAL */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-gray-900 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl border border-emerald-500/40 text-white animate-in fade-in zoom-in-95 duration-200">
            {/* Player Top Header */}
            <div className="px-5 py-3.5 bg-gray-950 flex items-center justify-between border-b border-gray-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-sm font-bold text-emerald-300">
                  {previewVideo.surahNameBn} ({previewVideo.reciterNameBn})
                </h3>
              </div>
              <button
                onClick={() => setPreviewVideo(null)}
                className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player Box */}
            <div className="aspect-video bg-black flex items-center justify-center relative">
              {previewVideo.videoUrl?.includes("youtube.com") || previewVideo.videoUrl?.includes("youtu.be") ? (
                <iframe
                  src={
                    previewVideo.videoUrl.includes("watch?v=")
                      ? previewVideo.videoUrl.replace("watch?v=", "embed/")
                      : previewVideo.videoUrl.includes("youtu.be/")
                      ? previewVideo.videoUrl.replace("youtu.be/", "youtube.com/embed/")
                      : previewVideo.videoUrl
                  }
                  title={previewVideo.surahNameBn}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : previewVideo.videoUrl ? (
                <video
                  src={previewVideo.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                  poster={previewVideo.thumbnailUrl}
                />
              ) : (
                <div className="text-center p-8">
                  <p className="text-sm text-gray-400">কোন সরাসরি ভিডিও স্ট্রীম লিংক নেই</p>
                </div>
              )}
            </div>

            {/* Video Details */}
            <div className="p-4 bg-gray-950 flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>সময়সীমা: {previewVideo.duration}</span>
                <span>•</span>
                <span>{previewVideo.views}</span>
              </div>
              <span className="font-arabic text-emerald-400 font-bold text-sm">
                {previewVideo.arabicTitle}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
