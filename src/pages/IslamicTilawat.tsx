import React, { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  BookOpen, Search, Download, Play, Pause, Heart, Info, Clock, 
  MapPin, ChevronLeft, ChevronRight, Music, CheckCircle2, 
  Settings, Volume2, Moon, Sparkles, FolderDown, ArrowLeft, Trash2, 
  Globe, Wifi, WifiOff, X, RotateCcw, Sliders, ListMusic, CloudRain,
  Flame, Waves, Trees, Wind, Compass, VolumeX, Eye, Share2, MoreVertical,
  ChevronDown, Book, Radio, Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useQuran } from "../context/QuranContext";
import { Reciter, Surah, SURAHS, formatDuration, getEstimatedSurahDuration, SURAH_TRANSLATIONS } from "../data/quranData";
import { ambientSound } from "../lib/ambientSound";
import { VideoTilawatSection } from "../components/tilawat/VideoTilawatSection";

export const IslamicTilawat: React.FC = () => {
  const navigate = useNavigate();
  const [mediaMode, setMediaMode] = useState<"audio" | "video">("audio");
  const {
    reciters,
    surahs,
    currentReciter,
    currentSurah,
    isPlaying,
    currentTime,
    duration,
    volume,
    playbackSpeed,
    repeatMode,
    isShuffle,
    isOnline,
    favorites,
    downloads,
    playbackProgress,
    playSurah,
    togglePlay,
    seek,
    nextSurah,
    previousSurah,
    setVolume,
    setPlaybackSpeed,
    setRepeatMode,
    toggleShuffle,
    toggleFavorite,
    isFavorite,
    downloadSurah,
    downloadAllSurahs,
    deleteDownload,
    isDownloaded
  } = useQuran();

  // Navigation tab states: "player" | "reciters" | "surahs" | "nature" | "qibla" | "favorites"
  const [activeTab, setActiveTab] = useState<"player" | "reciters" | "surahs" | "nature" | "qibla" | "favorites">("player");
  
  // Reciter list category: "all" | "saudi" | "egypt" | "popular"
  const [reciterFilter, setReciterFilter] = useState<"all" | "saudi" | "egypt" | "popular">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals & Panels
  const [showReciterDrawer, setShowReciterDrawer] = useState(false);
  const [showSurahDrawer, setShowSurahDrawer] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showTranslationModal, setShowTranslationModal] = useState(false);
  const [showAmbientPicker, setShowAmbientPicker] = useState(false);
  
  // Ambient Nature Sound state
  const [activeAmbientSound, setActiveAmbientSound] = useState<string | null>(null);
  const [ambientVolume, setAmbientVolume] = useState<number>(0.4);

  // Sleep timer state
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  const [sleepTimeRemaining, setSleepTimeRemaining] = useState<number | null>(null);

  // Qibla Compass state
  const [compassHeading, setCompassHeading] = useState<number>(0);

  // Auto-track sleep timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (sleepTimer !== null) {
      setSleepTimeRemaining(sleepTimer * 60);
      interval = setInterval(() => {
        setSleepTimeRemaining(prev => {
          if (prev === null || prev <= 1) {
            if (isPlaying) {
              togglePlay();
            }
            ambientSound.stop();
            setActiveAmbientSound(null);
            setSleepTimer(null);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setSleepTimeRemaining(null);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sleepTimer]);

  // Handle ambient sound toggle
  const handleToggleAmbient = (soundId: string) => {
    if (activeAmbientSound === soundId) {
      ambientSound.stop();
      setActiveAmbientSound(null);
    } else {
      ambientSound.setVolume(ambientVolume);
      ambientSound.play(soundId);
      setActiveAmbientSound(soundId);
    }
  };

  const handleAmbientVolumeChange = (vol: number) => {
    setAmbientVolume(vol);
    ambientSound.setVolume(vol);
  };

  // Filtered reciters list
  const filteredReciters = useMemo(() => {
    let list = reciters;
    if (reciterFilter === "saudi") {
      list = list.filter(r => r.country.includes("Saudi") || r.country.includes("সৌদি") || r.tags?.includes("Saudi Arabia"));
    } else if (reciterFilter === "egypt") {
      list = list.filter(r => r.country.includes("Egypt") || r.country.includes("মিশর") || r.tags?.includes("Egypt"));
    } else if (reciterFilter === "popular") {
      list = list.filter(r => ["mishari_alafasy", "abdul_basit", "saad_al_ghamdi", "maher_al_muaiqly", "yasser_al_dosari", "ali_jaber"].includes(r.id));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(r => 
        r.name.toLowerCase().includes(q) || 
        r.arabicName.toLowerCase().includes(q) || 
        r.country.toLowerCase().includes(q)
      );
    }
    return list;
  }, [reciters, reciterFilter, searchQuery]);

  // Filtered surahs list
  const filteredSurahs = useMemo(() => {
    if (!searchQuery.trim()) return surahs;
    const q = searchQuery.toLowerCase();
    return surahs.filter(s => 
      s.name.toLowerCase().includes(q) ||
      s.englishName.toLowerCase().includes(q) ||
      s.arabicName.includes(q) ||
      s.number.toString() === q
    );
  }, [surahs, searchQuery]);

  // Nature sound presets
  const natureSounds = [
    { id: "rain", label: "বৃষ্টি", desc: "মন শান্ত করা ঝিরিঝিরি বৃষ্টি", icon: CloudRain, color: "text-blue-400" },
    { id: "waves", label: "সমুদ্রের ঢেউ", desc: "শান্ত সমুদ্রের হালকা গর্জন", icon: Waves, color: "text-cyan-400" },
    { id: "birds", label: "পাখির ডাক", desc: "ভোরের নির্মল অরণ্য", icon: Trees, color: "text-emerald-400" },
    { id: "wind", label: "বাতাস", desc: "মরুভূমির মৃদু শান্ত বাতাস", icon: Wind, color: "text-amber-200" },
    { id: "fire", label: "অগ্নিকুণ্ড", desc: "উষ্ণ আগুনের মৃদু স্ফুলিঙ্গ", icon: Flame, color: "text-orange-400" },
  ];

  // Active track details
  const activeReciter = currentReciter || reciters[0];
  const activeSurah = currentSurah || surahs[0];
  const isCurrentDownloaded = isDownloaded(activeReciter?.id || "", activeSurah?.number || 1);
  const currentProgress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Translation verses if available
  const activeTranslations = SURAH_TRANSLATIONS[activeSurah?.number || 1] || null;

  if (mediaMode === "video") {
    return (
      <VideoTilawatSection 
        onBack={() => navigate("/")} 
        onSwitchToAudio={() => setMediaMode("audio")} 
      />
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#030d17] text-white flex flex-col justify-between selection:bg-[#2094f3] select-none relative overflow-hidden font-sans">
      
      {/* BACKGROUND ATMOSPHERE: Deep Navy with subtle stars and soft glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-[#0c2847]/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-[#020912] via-[#030d17]/80 to-transparent" />
        {/* Subtle geometric star pattern */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      {/* 1. TOP HEADER (BRAND & QUICK ACTIONS) */}
      <header className="relative z-20 px-3 sm:px-4 pt-3 pb-2 flex items-center justify-between border-b border-white/5 bg-[#030d17]/80 backdrop-blur-md">
        {/* Left: Prominent Back button & App title */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/")}
            title="হোম পেজে ফিরে যান (Exit / Back)"
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all cursor-pointer border border-white/15 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1976d2] to-[#0d47a1] flex items-center justify-center shadow-lg shadow-blue-900/30 border border-blue-400/30">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-white tracking-wide flex items-center gap-1.5 leading-tight">
              কুরআন অডিও
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/20">
                PRO
              </span>
            </h1>
            <p className="text-[10px] sm:text-[11px] text-gray-400 font-medium">মধুর কণ্ঠে পবিত্র তেলাওয়াত</p>
          </div>
        </div>

        {/* Center: Audio / Video Mode Switcher */}
        <div className="hidden sm:flex items-center bg-black/50 p-1 rounded-xl border border-white/10 shadow-inner">
          <button
            onClick={() => setMediaMode("audio")}
            className="px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer bg-blue-600 text-white shadow-sm"
          >
            অডিও
          </button>
          <button
            onClick={() => setMediaMode("video")}
            className="px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 text-gray-300 hover:text-white"
          >
            <Play className="w-3.5 h-3.5 fill-current text-emerald-400" />
            <span>ভিডিও তেলাওয়াত</span>
          </button>
        </div>

        {/* Right: Quick actions (Video Switcher on Mobile, Sleep timer, Settings) */}
        <div className="flex items-center gap-1.5">
          {/* Mobile Video Tilawat Switch Button */}
          <button
            onClick={() => setMediaMode("video")}
            title="ভিডিও তেলাওয়াত সেকশনে যান"
            className="sm:hidden px-2.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold flex items-center gap-1 active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current text-emerald-400" />
            <span>ভিডিও</span>
          </button>
          {/* Ambient sound toggle button */}
          <button
            onClick={() => setShowAmbientPicker(true)}
            title="প্রকৃতির শব্দ (Ambient Sound)"
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              activeAmbientSound 
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse" 
                : "bg-white/5 text-gray-300 hover:bg-white/10"
            }`}
          >
            <CloudRain className="w-4 h-4" />
          </button>

          {/* Sleep timer button */}
          <button
            onClick={() => {
              const presets = [null, 15, 30, 45, 60];
              const nextIdx = (presets.indexOf(sleepTimer) + 1) % presets.length;
              setSleepTimer(presets[nextIdx]);
            }}
            title="স্লিপ টাইমার"
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              sleepTimer !== null 
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" 
                : "bg-white/5 text-gray-300 hover:bg-white/10"
            }`}
          >
            <Moon className="w-4 h-4" />
          </button>

          {/* Settings modal */}
          <button
            onClick={() => setShowSettingsModal(true)}
            title="প্লেব্যাক সেটিংস"
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 flex items-center justify-center transition-all"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Active sleep timer indicator toast */}
      {sleepTimer !== null && sleepTimeRemaining !== null && (
        <div className="relative z-15 bg-amber-500/15 border-b border-amber-500/20 px-4 py-1 flex items-center justify-between text-[11px] text-amber-300">
          <span className="flex items-center gap-1.5">
            <Moon className="w-3.5 h-3.5 animate-pulse" />
            স্লিপ টাইমার সক্রিয়: {Math.ceil(sleepTimeRemaining / 60)} মিনিট পর স্বয়ংক্রিয়ভাবে বন্ধ হবে
          </span>
          <button onClick={() => setSleepTimer(null)} className="underline text-amber-200 hover:text-white">
            বাতিল
          </button>
        </div>
      )}

      {/* Active ambient sound banner */}
      {activeAmbientSound && (
        <div className="relative z-15 bg-emerald-950/40 border-b border-emerald-500/20 px-4 py-1.5 flex items-center justify-between text-[11px] text-emerald-300">
          <span className="flex items-center gap-1.5">
            <CloudRain className="w-3.5 h-3.5 animate-bounce" />
            প্রকৃতির শব্দ চলছে: {natureSounds.find(s => s.id === activeAmbientSound)?.label}
          </span>
          <div className="flex items-center gap-3">
            <input 
              type="range" 
              min="0.1" 
              max="1" 
              step="0.05"
              value={ambientVolume}
              onChange={(e) => handleAmbientVolumeChange(parseFloat(e.target.value))}
              className="w-16 accent-emerald-400 h-1 rounded-full cursor-pointer"
            />
            <button onClick={() => handleToggleAmbient(activeAmbientSound)} className="text-gray-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. MAIN PLAYER SCREEN - EXACT VISUAL MATCH TO CLIENT SCREENSHOT */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center px-5 py-4 max-w-lg mx-auto w-full">
        
        {/* SURAH TITLE & ARABIC CALLIGRAPHY (Matching Top Section of Reference) */}
        <div className="text-center w-full mb-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-2">
            <span className="text-xs font-semibold text-blue-400">সূরা #{activeSurah.number}</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span className="text-xs text-gray-300">{activeSurah.versesCount} আয়াত</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
            {activeSurah.name}
          </h2>
          <p className="text-lg sm:text-xl font-arabic text-amber-200/90 mt-0.5 tracking-wider">
            {activeSurah.arabicName}
          </p>
        </div>

        {/* CIRCULAR QARI PHOTO WITH BLUE GLOW RING & VERIFIED BADGE */}
        <div className="relative my-2 sm:my-3 group flex items-center justify-center">
          {/* Animated Glow Ring */}
          <div className={`absolute -inset-2.5 rounded-full bg-gradient-to-tr from-[#1565c0] via-[#42a5f5] to-[#1976d2] opacity-40 blur-md transition-all duration-700 ${
            isPlaying ? "scale-105 opacity-60 animate-pulse" : "opacity-25"
          }`} />

          {/* Outer Border Frame */}
          <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full p-1 bg-gradient-to-tr from-[#1976d2] via-[#64b5f6] to-[#0d47a1] shadow-2xl shadow-blue-950/80">
            <div className="w-full h-full rounded-full overflow-hidden bg-[#071321] relative border-2 border-[#030d17]">
              <img
                src={activeReciter.imageUrl}
                alt={activeReciter.name}
                referrerPolicy="no-referrer"
                className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
                  isPlaying ? "scale-105" : "scale-100"
                }`}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Verified Green Checkmark Badge at bottom-right of avatar */}
            <div className="absolute bottom-2 right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#00c853] text-white flex items-center justify-center border-2 border-[#030d17] shadow-lg">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>

            {/* Playing equalizer animation pill when audio is actively playing */}
            {isPlaying && (
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-blue-600/90 backdrop-blur-xs border border-blue-300/30 text-[10px] font-bold text-white flex items-center gap-1 shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>চলছে</span>
              </div>
            )}
          </div>
        </div>

        {/* RECITER NAME & COUNTRY (Clickable pill to open Reciter Selection) */}
        <div className="text-center mt-2 mb-4">
          <button
            onClick={() => setShowReciterDrawer(true)}
            className="group inline-flex flex-col items-center hover:opacity-90 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                {activeReciter.name.split("(")[0].trim()}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-white transition-transform group-hover:translate-y-0.5" />
            </div>
            <span className="text-xs text-blue-400 font-medium mt-0.5">
              {activeReciter.country} • ক্বারী পরিবর্তন করুন
            </span>
          </button>
        </div>

        {/* PROGRESS BAR & TIMESTAMPS */}
        <div className="w-full px-2 space-y-1.5 mb-2">
          {/* Seek slider */}
          <div className="relative flex items-center group">
            <input
              type="range"
              min="0"
              max={duration || getEstimatedSurahDuration(activeSurah.number)}
              step="0.5"
              value={currentTime}
              onChange={(e) => seek(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#2196f3] focus:outline-hidden group-hover:h-2 transition-all"
              style={{
                background: `linear-gradient(to right, #2196f3 ${currentProgress}%, rgba(255,255,255,0.12) ${currentProgress}%)`
              }}
            />
          </div>

          {/* Time display: current time vs total duration */}
          <div className="flex items-center justify-between text-xs font-mono text-gray-400">
            <span>{formatDuration(Math.floor(currentTime))}</span>
            <span>{formatDuration(Math.floor(duration || getEstimatedSurahDuration(activeSurah.number)))}</span>
          </div>
        </div>

        {/* 3. MAIN AUDIO CONTROLS (Shuffle - Prev - Play/Pause - Next - Repeat) */}
        <div className="flex items-center justify-between w-full px-4 py-2">
          {/* Shuffle Button */}
          <button
            onClick={toggleShuffle}
            title={isShuffle ? "শাফল চালু" : "শাফল বন্ধ"}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              isShuffle ? "text-blue-400 bg-blue-500/10" : "text-gray-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-5 h-5" />
          </button>

          {/* Previous Surah Button */}
          <button
            onClick={previousSurah}
            title="পূর্ববর্তী সূরা"
            className="w-12 h-12 rounded-full text-white/90 hover:text-white hover:bg-white/5 active:scale-95 flex items-center justify-center transition-all cursor-pointer"
          >
            <ChevronLeft className="w-8 h-8 stroke-[2]" />
          </button>

          {/* Big Circular Glowing Play / Pause Button */}
          <button
            onClick={togglePlay}
            title={isPlaying ? "বিরতি দিন" : "প্লে করুন"}
            className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-tr from-[#1976d2] via-[#2196f3] to-[#42a5f5] text-white flex items-center justify-center shadow-xl shadow-blue-600/40 active:scale-95 hover:scale-105 transition-all border-2 border-blue-300/40 cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 fill-current" />
            ) : (
              <Play className="w-8 h-8 fill-current ml-1" />
            )}
          </button>

          {/* Next Surah Button */}
          <button
            onClick={nextSurah}
            title="পরবর্তী সূরা"
            className="w-12 h-12 rounded-full text-white/90 hover:text-white hover:bg-white/5 active:scale-95 flex items-center justify-center transition-all cursor-pointer"
          >
            <ChevronRight className="w-8 h-8 stroke-[2]" />
          </button>

          {/* Repeat Mode Button */}
          <button
            onClick={() => {
              const modes: ("off" | "surah" | "all")[] = ["off", "surah", "all"];
              const nextMode = modes[(modes.indexOf(repeatMode) + 1) % modes.length];
              setRepeatMode(nextMode);
            }}
            title={
              repeatMode === "surah" 
                ? "একই সূরা বারবার চলবে" 
                : repeatMode === "all" 
                ? "সব সূরা ক্রমান্বয়ে চলবে" 
                : "রিপিট বন্ধ"
            }
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              repeatMode !== "off" ? "text-blue-400 bg-blue-500/10" : "text-gray-400 hover:text-white"
            }`}
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* 4. SECONDARY ACTION ROW (Favorite, Download Offline, Verses/Translation, Speed) */}
        <div className="flex items-center justify-around w-full max-w-sm pt-2 border-t border-white/5 mt-2">
          {/* Favorite toggle */}
          <button
            onClick={() => toggleFavorite(activeReciter.id, activeSurah.number)}
            className="flex flex-col items-center gap-1 text-gray-300 hover:text-white active:scale-95 transition-all"
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
              isFavorite(activeReciter.id, activeSurah.number)
                ? "bg-rose-500/20 text-rose-400"
                : "bg-white/5"
            }`}>
              <Heart className={`w-4 h-4 ${isFavorite(activeReciter.id, activeSurah.number) ? "fill-current" : ""}`} />
            </div>
            <span className="text-[10px] font-medium">পছন্দ</span>
          </button>

          {/* Download for offline listening */}
          <button
            onClick={() => downloadSurah(activeReciter, activeSurah)}
            className="flex flex-col items-center gap-1 text-gray-300 hover:text-white active:scale-95 transition-all"
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
              isCurrentDownloaded 
                ? "bg-emerald-500/20 text-emerald-400" 
                : "bg-white/5"
            }`}>
              {isCurrentDownloaded ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </div>
            <span className="text-[10px] font-medium">
              {isCurrentDownloaded ? "ডাউনলোড করা" : "ডাউনলোড"}
            </span>
          </button>

          {/* Translation/Meaning Modal Trigger */}
          <button
            onClick={() => setShowTranslationModal(true)}
            className="flex flex-col items-center gap-1 text-gray-300 hover:text-white active:scale-95 transition-all"
          >
            <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center">
              <Book className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-medium">অর্থ/তাফসির</span>
          </button>

          {/* Speed Preset Button */}
          <button
            onClick={() => {
              const speeds = [1, 1.25, 1.5, 0.75];
              const nextSpd = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
              setPlaybackSpeed(nextSpd);
            }}
            className="flex flex-col items-center gap-1 text-gray-300 hover:text-white active:scale-95 transition-all"
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
              playbackSpeed !== 1 ? "bg-blue-500/20 text-blue-300" : "bg-white/5"
            }`}>
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-medium">{playbackSpeed}x গতি</span>
          </button>
        </div>

      </main>

      {/* 5. BOTTOM NAVIGATION BAR - EXACT MATCH TO CLIENT SCREENSHOT */}
      {/* Contains: প্লেয়ার (Player), ক্বারীগণ (Reciters), সূরা তালিকা (Surahs), প্রকৃতি (Nature), কিবলা (Qibla) */}
      <footer className="relative z-20 w-full bg-[#020912]/95 border-t border-white/10 backdrop-blur-lg pb-[env(safe-area-inset-bottom,4px)]">
        <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-1">
          {/* Tab 1: Player (Active Home) */}
          <button
            onClick={() => {
              setMediaMode("audio");
              setActiveTab("player");
            }}
            className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
              activeTab === "player" && mediaMode === "audio" ? "text-blue-400" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <Radio className="w-5 h-5" />
            <span className="text-[11px] font-medium">প্লেয়ার</span>
            {activeTab === "player" && mediaMode === "audio" && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 -mt-0.5" />
            )}
          </button>

          {/* Tab: Video Tilawat (Direct Access) */}
          <button
            onClick={() => setMediaMode("video")}
            className="flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl transition-all cursor-pointer text-gray-400 hover:text-emerald-400 group"
          >
            <div className="relative">
              <Play className="w-5 h-5 fill-current text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="absolute -top-0.5 -right-1 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <span className="text-[11px] font-semibold text-emerald-300">ভিডিও</span>
          </button>

          {/* Tab 2: Reciters List */}
          <button
            onClick={() => {
              setActiveTab("reciters");
              setShowReciterDrawer(true);
            }}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all cursor-pointer ${
              activeTab === "reciters" ? "text-blue-400" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <Music className="w-5 h-5" />
            <span className="text-[11px] font-medium">ক্বারীগণ</span>
            {activeTab === "reciters" && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 -mt-0.5" />
            )}
          </button>

          {/* Tab 3: Surahs List */}
          <button
            onClick={() => {
              setActiveTab("surahs");
              setShowSurahDrawer(true);
            }}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all cursor-pointer ${
              activeTab === "surahs" ? "text-blue-400" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <ListMusic className="w-5 h-5" />
            <span className="text-[11px] font-medium">সূরা তালিকা</span>
            {activeTab === "surahs" && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 -mt-0.5" />
            )}
          </button>

          {/* Tab 4: Nature Sounds */}
          <button
            onClick={() => setShowAmbientPicker(true)}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all cursor-pointer ${
              activeAmbientSound ? "text-emerald-400" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <Trees className="w-5 h-5" />
            <span className="text-[11px] font-medium">প্রকৃতি</span>
            {activeAmbientSound && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 -mt-0.5" />
            )}
          </button>

          {/* Tab 5: Favorites / Downloaded */}
          <button
            onClick={() => {
              setActiveTab("favorites");
              setShowSurahDrawer(true);
            }}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all cursor-pointer ${
              activeTab === "favorites" ? "text-blue-400" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <FolderDown className="w-5 h-5" />
            <span className="text-[11px] font-medium">ডাউনলোড</span>
            {activeTab === "favorites" && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 -mt-0.5" />
            )}
          </button>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* 6. MODALS & SLIDE-OUT DRAWERS (RECITER DRAWER, SURAH DRAWER, SETTINGS) */}
      {/* ========================================================================= */}

      {/* A. RECITERS SELECTION DRAWER */}
      <AnimatePresence>
        {showReciterDrawer && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              className="w-full max-w-lg bg-[#071321] border-t border-white/10 rounded-t-3xl max-h-[85vh] flex flex-col overflow-hidden text-white"
            >
              {/* Drawer Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">ক্বারী নির্বাচন করুন</h3>
                  <p className="text-xs text-gray-400">আপনার পছন্দের ক্বারীর মিষ্টি কণ্ঠে তেলাওয়াত শুনুন</p>
                </div>
                <button
                  onClick={() => setShowReciterDrawer(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search input inside Reciter Drawer */}
              <div className="p-3 border-b border-white/5">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ক্বারীর নাম লিখে খুঁজুন..."
                    className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-gray-400 focus:outline-hidden focus:border-blue-500"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1 no-scrollbar">
                  {[
                    { id: "all", label: "সকল ক্বারী" },
                    { id: "popular", label: "জনপ্রিয়" },
                    { id: "saudi", label: "সৌদি আরব" },
                    { id: "egypt", label: "মিশর" },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setReciterFilter(tab.id as any)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                        reciterFilter === tab.id
                          ? "bg-blue-600 text-white shadow-md shadow-blue-900/30"
                          : "bg-white/5 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reciters List View */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-white/5">
                {filteredReciters.map(rec => {
                  const isSelected = activeReciter.id === rec.id;
                  return (
                    <button
                      key={rec.id}
                      onClick={() => {
                        playSurah(rec, activeSurah, isPlaying);
                        setShowReciterDrawer(false);
                      }}
                      className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-all ${
                        isSelected 
                          ? "bg-blue-600/15 border border-blue-500/40" 
                          : "hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500/30 bg-black/40 flex-shrink-0">
                          <img
                            src={rec.imageUrl}
                            alt={rec.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white flex items-center gap-1.5">
                            {rec.name.split("(")[0].trim()}
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-blue-400" />
                            )}
                          </div>
                          <div className="text-xs text-gray-400">{rec.country}</div>
                        </div>
                      </div>

                      <span className="text-xs font-arabic text-blue-300/80 pr-2">
                        {rec.arabicName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* B. SURAHS SELECTION DRAWER */}
      <AnimatePresence>
        {showSurahDrawer && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              className="w-full max-w-lg bg-[#071321] border-t border-white/10 rounded-t-3xl max-h-[85vh] flex flex-col overflow-hidden text-white"
            >
              {/* Drawer Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">পবিত্র কুরআনুল কারীম</h3>
                  <p className="text-xs text-gray-400">১১৪টি সূরার তালিকা থেকে নির্বাচন করুন</p>
                </div>
                <button
                  onClick={() => setShowSurahDrawer(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search */}
              <div className="p-3 border-b border-white/5">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="সূরা নাম বা নম্বর লিখুন (উদাঃ ফাতিহা, 1)..."
                    className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-gray-400 focus:outline-hidden focus:border-blue-500"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Surahs List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-white/5">
                {filteredSurahs.map(s => {
                  const isSelected = activeSurah.number === s.number;
                  const isSurahDownloaded = isDownloaded(activeReciter.id, s.number);
                  const isSurahFav = isFavorite(activeReciter.id, s.number);

                  return (
                    <div
                      key={s.number}
                      className={`p-2.5 rounded-2xl flex items-center justify-between transition-all ${
                        isSelected 
                          ? "bg-blue-600/20 border border-blue-500/40" 
                          : "hover:bg-white/5"
                      }`}
                    >
                      {/* Left info & play trigger */}
                      <button
                        onClick={() => {
                          playSurah(activeReciter, s, true);
                          setShowSurahDrawer(false);
                        }}
                        className="flex items-center gap-3 flex-1 text-left cursor-pointer"
                      >
                        {/* Number badge */}
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold ${
                          isSelected ? "bg-blue-600 text-white" : "bg-white/5 text-gray-400"
                        }`}>
                          {s.number}
                        </div>

                        <div>
                          <div className="text-sm font-bold text-white flex items-center gap-2">
                            {s.name}
                            {isSelected && (
                              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                            )}
                          </div>
                          <div className="text-xs text-gray-400 font-mono">
                            {s.englishName} • {s.versesCount} আয়াত
                          </div>
                        </div>
                      </button>

                      {/* Right: Arabic & quick download/favorite actions */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-arabic text-amber-200/90 mr-2">
                          {s.arabicName}
                        </span>

                        <button
                          onClick={() => downloadSurah(activeReciter, s)}
                          title={isSurahDownloaded ? "ডাউনলোড সম্পন্ন" : "ডাউনলোড করুন"}
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                            isSurahDownloaded ? "text-emerald-400" : "text-gray-500 hover:text-white"
                          }`}
                        >
                          {isSurahDownloaded ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          onClick={() => toggleFavorite(activeReciter.id, s.number)}
                          title="পছন্দ"
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                            isSurahFav ? "text-rose-400" : "text-gray-500 hover:text-white"
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${isSurahFav ? "fill-current" : ""}`} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* C. NATURE SOUNDS (AMBIENT SOUND) PICKER MODAL */}
      <AnimatePresence>
        {showAmbientPicker && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="w-full max-w-lg bg-[#071321] border-t border-white/10 rounded-t-3xl p-5 text-white space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <CloudRain className="w-5 h-5 text-emerald-400" />
                    প্রকৃতির প্রশান্তিদায়ক ব্যাকগ্রাউন্ড সাউন্ড
                  </h3>
                  <p className="text-xs text-gray-400">কুরআন তেলাওয়াতের সাথে প্রাকৃতিক আবহ মিশিয়ে শুনুন</p>
                </div>
                <button
                  onClick={() => setShowAmbientPicker(false)}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Volume Controller for Ambient */}
              <div className="space-y-1.5 bg-white/5 p-3 rounded-2xl">
                <div className="flex items-center justify-between text-xs text-gray-300 font-medium">
                  <span>প্রকৃতির শব্দের মাত্রা (Volume)</span>
                  <span>{Math.round(ambientVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={ambientVolume}
                  onChange={(e) => handleAmbientVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-emerald-400 h-1.5 rounded-full cursor-pointer"
                />
              </div>

              {/* Nature Sounds Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {natureSounds.map(snd => {
                  const Icon = snd.icon;
                  const isActive = activeAmbientSound === snd.id;

                  return (
                    <button
                      key={snd.id}
                      onClick={() => handleToggleAmbient(snd.id)}
                      className={`p-3 rounded-2xl flex items-center justify-between border transition-all text-left ${
                        isActive
                          ? "bg-emerald-500/20 border-emerald-400/50 shadow-lg shadow-emerald-950/40"
                          : "bg-white/5 border-white/5 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isActive ? "bg-emerald-500 text-white" : "bg-white/5 " + snd.color
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">{snd.label}</div>
                          <div className="text-[11px] text-gray-400">{snd.desc}</div>
                        </div>
                      </div>

                      {isActive && (
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping mr-2" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Stop sound button */}
              {activeAmbientSound && (
                <button
                  onClick={() => {
                    ambientSound.stop();
                    setActiveAmbientSound(null);
                  }}
                  className="w-full py-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold hover:bg-rose-500/25 transition-colors"
                >
                  প্রকৃতির সাউন্ড বন্ধ করুন
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* D. PLAYBACK SETTINGS MODAL */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="w-full max-w-lg bg-[#071321] border-t border-white/10 rounded-t-3xl p-5 text-white space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-blue-400" />
                  প্লেব্যাক সেটিংস
                </h3>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Volume Slider */}
              <div className="space-y-1.5 bg-white/5 p-3 rounded-2xl">
                <div className="flex items-center justify-between text-xs text-gray-300 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-blue-400" />
                    তেলাওয়াতের ভলিউম
                  </span>
                  <span>{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full accent-blue-500 h-1.5 rounded-full cursor-pointer"
                />
              </div>

              {/* Playback Speed */}
              <div className="space-y-1.5 bg-white/5 p-3 rounded-2xl">
                <span className="text-xs text-gray-300 font-medium block">প্লেব্যাক গতি</span>
                <div className="grid grid-cols-4 gap-2">
                  {[0.75, 1, 1.25, 1.5].map(spd => (
                    <button
                      key={spd}
                      onClick={() => setPlaybackSpeed(spd)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${
                        playbackSpeed === spd
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-white/5 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Sleep Timer Presets */}
              <div className="space-y-1.5 bg-white/5 p-3 rounded-2xl">
                <div className="flex items-center justify-between text-xs text-gray-300 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Moon className="w-4 h-4 text-amber-300" />
                    স্লিপ টাইমার
                  </span>
                  {sleepTimer !== null && (
                    <span className="text-amber-300 text-[11px] font-mono">
                      {sleepTimeRemaining ? Math.ceil(sleepTimeRemaining / 60) : sleepTimer} মিনিট বাকি
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { label: "বন্ধ", val: null },
                    { label: "১৫ মিঃ", val: 15 },
                    { label: "৩০ মিঃ", val: 30 },
                    { label: "৪৫ মিঃ", val: 45 },
                    { label: "৬০ মিঃ", val: 60 }
                  ].map(t => (
                    <button
                      key={t.label}
                      onClick={() => setSleepTimer(t.val)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${
                        sleepTimer === t.val
                          ? "bg-amber-500 text-black shadow-md font-black"
                          : "bg-white/5 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-1 text-center">
                <button
                  onClick={() => {
                    setVolume(0.8);
                    setPlaybackSpeed(1);
                    setSleepTimer(null);
                    setShowSettingsModal(false);
                  }}
                  className="text-xs text-blue-400 hover:underline"
                >
                  ডিফল্ট সেটিংস পুনঃস্থাপন করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* E. SURAH TRANSLATION / TAFSIR MODAL */}
      <AnimatePresence>
        {showTranslationModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="w-full max-w-lg bg-[#071321] border-t border-white/10 rounded-t-3xl max-h-[85vh] flex flex-col overflow-hidden text-white"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Book className="w-5 h-5 text-blue-400" />
                    {activeSurah.name} - বাংলা অনুবাদ
                  </h3>
                  <p className="text-xs text-gray-400">অর্থ ও মর্মার্থ অনুধাবন করুন</p>
                </div>
                <button
                  onClick={() => setShowTranslationModal(false)}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeTranslations ? (
                  activeTranslations.map((v, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-xs px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-mono">
                          আয়াত {i + 1}
                        </span>
                      </div>
                      <p className="text-lg font-arabic text-amber-200 text-right leading-loose">
                        {v.arabic}
                      </p>
                      <p className="text-sm text-gray-300 leading-relaxed pt-1 border-t border-white/5">
                        {v.bangla}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-400 space-y-2">
                    <BookOpen className="w-10 h-10 mx-auto opacity-30" />
                    <p className="text-sm">এই সূরার বিস্তারিত আয়াতভিত্তিক অনুবাদ প্রস্তুত হচ্ছে।</p>
                    <p className="text-xs text-gray-500">সূরা #{activeSurah.number} ({activeSurah.englishName})</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default IslamicTilawat;
