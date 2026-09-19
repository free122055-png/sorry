import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { Reciter, Surah, RECITERS, SURAHS, getSurahAudioUrl, getEstimatedSurahDuration } from "../data/quranData";
import { db } from "../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

interface QuranContextType {
  reciters: Reciter[];
  surahs: Surah[];
  currentReciter: Reciter | null;
  currentSurah: Surah | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackSpeed: number;
  repeatMode: "off" | "surah" | "all";
  isShuffle: boolean;
  isPlayerMinimized: boolean;
  isOnline: boolean;
  
  favorites: string[]; // List of "reciterId_surahNumber"
  downloads: Record<string, { status: "downloading" | "completed" | "failed"; progress: number; size?: string }>;
  playbackProgress: Record<string, number>; // "reciterId_surahNumber" -> seconds
  
  playSurah: (reciter: Reciter, surah: Surah, autoPlay?: boolean) => Promise<void>;
  togglePlay: () => void;
  seek: (seconds: number) => void;
  nextSurah: () => void;
  previousSurah: () => void;
  setVolume: (v: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  setRepeatMode: (mode: "off" | "surah" | "all") => void;
  toggleShuffle: () => void;
  setPlayerMinimized: (min: boolean) => void;
  
  toggleFavorite: (reciterId: string, surahNumber: number) => void;
  isFavorite: (reciterId: string, surahNumber: number) => boolean;
  
  downloadSurah: (reciter: Reciter, surah: Surah) => Promise<void>;
  downloadAllSurahs: (reciter: Reciter) => Promise<void>;
  deleteDownload: (reciterId: string, surahNumber: number) => Promise<void>;
  isDownloaded: (reciterId: string, surahNumber: number) => boolean;
  
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const QuranContext = createContext<QuranContextType | undefined>(undefined);

const CACHE_NAME = "quran-audio-cache";

export const QuranProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [recitersList, setRecitersList] = useState<Reciter[]>(RECITERS);
  const [currentReciter, setCurrentReciter] = useState<Reciter | null>(() => RECITERS[0] || null);
  const [currentSurah, setCurrentSurah] = useState<Surah | null>(() => SURAHS[0] || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, _setVolume] = useState(() => {
    try {
      const v = localStorage.getItem("quran_volume");
      return v ? parseFloat(v) : 0.8;
    } catch {
      return 0.8;
    }
  });
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [repeatMode, setRepeatMode] = useState<"off" | "surah" | "all">("off");
  const [isShuffle, setIsShuffle] = useState(false);
  const [isPlayerMinimized, setPlayerMinimized] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [searchQuery, setSearchQuery] = useState("");

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const f = localStorage.getItem("quran_favorites");
      return f ? JSON.parse(f) : [];
    } catch {
      return [];
    }
  });

  const [downloads, setDownloads] = useState<Record<string, { status: "downloading" | "completed" | "failed"; progress: number; size?: string }>>(() => {
    try {
      const d = localStorage.getItem("quran_downloads");
      return d ? JSON.parse(d) : {};
    } catch {
      return {};
    }
  });

  const [playbackProgress, setPlaybackProgress] = useState<Record<string, number>>(() => {
    try {
      const p = localStorage.getItem("quran_playback_progress");
      return p ? JSON.parse(p) : {};
    } catch {
      return {};
    }
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeObjectUrlRef = useRef<string | null>(null);
  const progressSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state to stable refs to completely bypass stale closure loops and prevent useEffect cycle resets
  const currentReciterRef = useRef<Reciter | null>(null);
  const currentSurahRef = useRef<Surah | null>(null);
  const repeatModeRef = useRef<"off" | "surah" | "all">("off");
  const isShuffleRef = useRef(false);
  const volumeRef = useRef(volume);
  const playbackSpeedRef = useRef(playbackSpeed);
  const isPlayingRef = useRef(isPlaying);
  const downloadsRef = useRef(downloads);

  useEffect(() => { currentReciterRef.current = currentReciter; }, [currentReciter]);
  useEffect(() => { currentSurahRef.current = currentSurah; }, [currentSurah]);
  useEffect(() => { repeatModeRef.current = repeatMode; }, [repeatMode]);
  useEffect(() => { isShuffleRef.current = isShuffle; }, [isShuffle]);
  useEffect(() => { volumeRef.current = volume; if (audioRef.current) audioRef.current.volume = volume; }, [volume]);
  useEffect(() => { 
    playbackSpeedRef.current = playbackSpeed; 
    if (audioRef.current) {
      audioRef.current.defaultPlaybackRate = playbackSpeed;
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { downloadsRef.current = downloads; }, [downloads]);

  // Sync state to local storage
  useEffect(() => {
    try {
      localStorage.setItem("quran_favorites", JSON.stringify(favorites));
    } catch (e) {
      console.warn("Storage error saving favorites", e);
    }
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem("quran_downloads", JSON.stringify(downloads));
    } catch (e) {
      console.warn("Storage error saving downloads", e);
    }
  }, [downloads]);

  useEffect(() => {
    try {
      localStorage.setItem("quran_playback_progress", JSON.stringify(playbackProgress));
    } catch (e) {
      console.warn("Storage error saving playbackProgress", e);
    }
  }, [playbackProgress]);

  // Sync Cache storage files directly with our State registry to ensure consistency
  const syncCacheRegistry = async () => {
    try {
      const cache = await caches.open(CACHE_NAME);
      const keys = await cache.keys();
      const foundKeys: Record<string, boolean> = {};

      for (const k of keys) {
        const urlStr = k.url;
        // Find matching reciter
        const reciter = RECITERS.find(r => urlStr.startsWith(r.serverUrl));
        if (reciter) {
          const filePart = urlStr.substring(reciter.serverUrl.length);
          const numStr = filePart.replace(".mp3", "");
          const surahNumber = parseInt(numStr, 10);
          if (!isNaN(surahNumber) && surahNumber >= 1 && surahNumber <= 114) {
            const key = `${reciter.id}_${surahNumber}`;
            foundKeys[key] = true;
          }
        }
      }

      setDownloads(prev => {
        const updated = { ...prev };
        let changed = false;

        // Auto-detect newly completed downloads inside cache
        Object.keys(foundKeys).forEach(k => {
          if (!updated[k] || updated[k].status !== "completed") {
            updated[k] = { status: "completed", progress: 100, size: "সংরক্ষিত" };
            changed = true;
          }
        });

        // Clean registry if user deleted cached files directly or on sync discrepancy
        Object.keys(updated).forEach(k => {
          if (updated[k].status === "completed" && !foundKeys[k]) {
            delete updated[k];
            changed = true;
          }
        });

        return changed ? updated : prev;
      });
    } catch (err) {
      console.warn("Cache registry sync error:", err);
    }
  };

  // Online / Offline Status tracking
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    syncCacheRegistry();

    // Real-time synchronization with Firestore reciters collection (photo updates from Admin)
    let unsubscribeFirestore: (() => void) | null = null;
    try {
      const recitersRef = collection(db, "reciters");
      unsubscribeFirestore = onSnapshot(recitersRef, (snapshot) => {
        if (!snapshot.empty) {
          const overrides: Record<string, any> = {};
          snapshot.docs.forEach(doc => {
            overrides[doc.id] = doc.data();
          });
          
          setRecitersList(prev => {
            return prev.map(r => {
              if (overrides[r.id] && overrides[r.id].imageUrl) {
                return {
                  ...r,
                  imageUrl: overrides[r.id].imageUrl,
                  name: overrides[r.id].name || r.name,
                  country: overrides[r.id].country || r.country
                };
              }
              return r;
            });
          });

          // Also update currentReciter if its image was changed
          setCurrentReciter(curr => {
            if (curr && overrides[curr.id] && overrides[curr.id].imageUrl) {
              return {
                ...curr,
                imageUrl: overrides[curr.id].imageUrl
              };
            }
            return curr;
          });
        }
      }, (err) => {
        console.warn("Firestore reciters listener error (using local default data):", err);
      });
    } catch (fsErr) {
      console.warn("Firestore init notice:", fsErr);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }, []);

  // Safe release of memory URLs
  const cleanActiveObjectURL = () => {
    if (activeObjectUrlRef.current) {
      try {
        URL.revokeObjectURL(activeObjectUrlRef.current);
      } catch (e) {
        console.warn("Revoke object URL error:", e);
      }
      activeObjectUrlRef.current = null;
    }
  };

  // Core PlayNext helper
  const playNextSurahInternal = () => {
    const rec = currentReciterRef.current;
    const sur = currentSurahRef.current;
    const isShuf = isShuffleRef.current;
    const repMode = repeatModeRef.current;

    if (!rec || !sur) return;

    let nextNumber = sur.number + 1;
    if (isShuf) {
      nextNumber = Math.floor(Math.random() * 114) + 1;
    } else {
      if (nextNumber > 114) {
        if (repMode === "all") {
          nextNumber = 1;
        } else {
          return; // Stop playback at Surah 114
        }
      }
    }

    const nextS = SURAHS.find(s => s.number === nextNumber);
    if (nextS) {
      playSurahInternal(rec, nextS, true);
    }
  };

  // Core PlayPrevious helper
  const playPreviousSurahInternal = () => {
    const rec = currentReciterRef.current;
    const sur = currentSurahRef.current;
    if (!rec || !sur) return;

    let prevNumber = sur.number - 1;
    if (prevNumber < 1) {
      prevNumber = 114;
    }

    const prevS = SURAHS.find(s => s.number === prevNumber);
    if (prevS) {
      playSurahInternal(rec, prevS, true);
    }
  };

  // Single mount Audio object lifecycle
  useEffect(() => {
    const audio = new Audio();
    audio.volume = volumeRef.current;
    audio.defaultPlaybackRate = playbackSpeedRef.current;
    audio.playbackRate = playbackSpeedRef.current;
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      
      const rec = currentReciterRef.current;
      const sur = currentSurahRef.current;
      if (rec && sur) {
        const progressKey = `${rec.id}_${sur.number}`;
        if (!progressSaveTimerRef.current) {
          progressSaveTimerRef.current = setTimeout(() => {
            setPlaybackProgress(prev => ({
              ...prev,
              [progressKey]: audio.currentTime
            }));
            progressSaveTimerRef.current = null;
          }, 3000);
        }
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      const repMode = repeatModeRef.current;
      if (repMode === "surah") {
        audio.currentTime = 0;
        audio.play()
          .then(() => setIsPlaying(true))
          .catch(err => {
            console.warn("Playback repeat failed:", err);
            setIsPlaying(false);
          });
      } else {
        playNextSurahInternal();
      }
    };

    const handleError = (e: Event) => {
      const audioEl = audioRef.current;
      if (audioEl && audioEl.error) {
        if (audioEl.error.code === 1) {
          console.log("Audio loading aborted (this is normal when switching tracks).");
          return;
        }
        console.error("Audio error code:", audioEl.error.code, "message:", audioEl.error.message);
      } else {
        console.error("Audio playback error event:", e);
      }
      setIsPlaying(false);
      cleanActiveObjectURL();
      
      alert("অডিও প্লেব্যাক ত্রুটি: ফাইলটি লোড করা সম্ভব হয়নি। অনুগ্রহ করে ইন্টারনেট সংযোগ পরীক্ষা করুন অথবা অন্য সূরা/ক্বারী চেষ্টা করুন।");
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    // Initializing lock screen background MediaSession action handlers once on mount
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.setActionHandler('play', () => {
          if (audioRef.current && currentSurahRef.current) {
            audioRef.current.play()
              .then(() => setIsPlaying(true))
              .catch(err => console.warn("MediaSession play error:", err));
          }
        });
        navigator.mediaSession.setActionHandler('pause', () => {
          if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
          }
        });
        navigator.mediaSession.setActionHandler('previoustrack', () => {
          playPreviousSurahInternal();
        });
        navigator.mediaSession.setActionHandler('nexttrack', () => {
          playNextSurahInternal();
        });
      } catch (err) {
        console.warn("MediaSession handlers mounting error:", err);
      }
    }

    return () => {
      audio.pause();
      cleanActiveObjectURL();
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      if (progressSaveTimerRef.current) {
        clearTimeout(progressSaveTimerRef.current);
      }
    };
  }, []);

  // Syncing metadata with Mobile notification drawer (MediaSession API) when track changes
  useEffect(() => {
    if ('mediaSession' in navigator && currentReciter && currentSurah) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: currentSurah.name,
          artist: currentReciter.name,
          album: "পবিত্র কুরআন তেলাওয়াত",
          artwork: [
            { src: currentReciter.imageUrl, sizes: '512x512', type: 'image/jpeg' }
          ]
        });
      } catch (err) {
        console.warn("MediaSession metadata update error:", err);
      }
    }
  }, [currentReciter, currentSurah]);

  // Syncing MediaSession playback state
  useEffect(() => {
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
      } catch (err) {
        console.warn("MediaSession state update error:", err);
      }
    }
  }, [isPlaying]);

  // Set up volume
  const setVolume = (v: number) => {
    _setVolume(v);
    if (audioRef.current) {
      audioRef.current.volume = v;
    }
    try {
      localStorage.setItem("quran_volume", v.toString());
    } catch {}
  };

  // Check if a Surah is downloaded
  const isDownloaded = (reciterId: string, surahNumber: number) => {
    const key = `${reciterId}_${surahNumber}`;
    return downloads[key]?.status === "completed";
  };

  // Core Playback Engine Implementation
  const playSurahInternal = async (reciter: Reciter, surah: Surah, autoPlay: boolean = true) => {
    if (!audioRef.current) return;

    try {
      audioRef.current.pause();
      cleanActiveObjectURL();

      const progressKey = `${reciter.id}_${surah.number}`;
      const savedPosition = playbackProgress[progressKey] || 0;

      const audioUrl = getSurahAudioUrl(reciter.serverUrl, surah.number);
      let audioSource = audioUrl;
      let isLocal = false;

      // Try reading from cache
      try {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(audioUrl);
        if (cachedResponse) {
          const blob = await cachedResponse.blob();
          const localUrl = URL.createObjectURL(blob);
          activeObjectUrlRef.current = localUrl;
          audioSource = localUrl;
          isLocal = true;
          console.log(`Playing offline downloaded Surah: ${surah.name}`);
        }
      } catch (cacheErr) {
        console.warn("Failed to retrieve from Cache Storage:", cacheErr);
      }

      if (!isLocal && !navigator.onLine) {
        alert("এই সূরাটি অফলাইনে শোনার জন্য ডাউনলোড করা নেই। অনুগ্রহ করে ইন্টারনেট সংযোগ চালু করুন।");
        setIsPlaying(false);
        return;
      }

      if (!isLocal) {
        // Route through our high-performance server-side proxy to completely bypass CORS, referer blocks and SSL handshake issues
        audioSource = `/api/audio-proxy?url=${encodeURIComponent(audioUrl)}`;
      }

      setCurrentReciter(reciter);
      setCurrentSurah(surah);
      setPlayerMinimized(false);

      // Bind source
      audioRef.current.src = audioSource;
      audioRef.current.load();
      
      // Enforce play speed
      audioRef.current.defaultPlaybackRate = playbackSpeedRef.current;
      audioRef.current.playbackRate = playbackSpeedRef.current;

      // Restore position if any
      const estDuration = getEstimatedSurahDuration(surah.number);
      if (savedPosition > 0 && savedPosition < estDuration - 5) {
        audioRef.current.currentTime = savedPosition;
        setCurrentTime(savedPosition);
      } else {
        audioRef.current.currentTime = 0;
        setCurrentTime(0);
      }

      if (autoPlay) {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (playErr) {
          console.warn("Playback autoplay prevented:", playErr);
          setIsPlaying(false);
        }
      } else {
        setIsPlaying(false);
      }
    } catch (err: any) {
      console.error("Critical playSurah error:", err);
      setIsPlaying(false);
      alert(`তেলাওয়াত প্লেব্যাক শুরু করতে সমস্যা হয়েছে: ${err.message || err}`);
    }
  };

  const playSurah = (reciter: Reciter, surah: Surah, autoPlay: boolean = true) => {
    return playSurahInternal(reciter, surah, autoPlay);
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    const rec = currentReciterRef.current;
    const sur = currentSurahRef.current;
    if (!audio || !sur || !rec) return;
    
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      if (!audio.src || audio.src === "" || audio.src.endsWith("/")) {
        playSurahInternal(rec, sur, true);
        return;
      }

      const isOfflineMode = !navigator.onLine;
      if (isOfflineMode) {
        const isDownloadedFile = isDownloaded(rec?.id || "", sur.number);
        if (!isDownloadedFile) {
          alert("অফলাইনে এই সূরা শুনতে হলে প্রথমে এটি ডাউনলোড করুন।");
          return;
        }
      }

      audio.play()
        .then(() => setIsPlaying(true))
        .catch(err => {
          console.warn("Playback failed with direct resume, attempting fresh load:", err);
          playSurahInternal(rec, sur, true);
        });
    }
  };

  const seek = (seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, Math.min(duration, seconds));
    setCurrentTime(audioRef.current.currentTime);
  };

  const nextSurah = () => {
    playNextSurahInternal();
  };

  const previousSurah = () => {
    playPreviousSurahInternal();
  };

  const toggleShuffle = () => {
    setIsShuffle(!isShuffle);
  };

  // Favorites logic
  const toggleFavorite = (reciterId: string, surahNumber: number) => {
    const key = `${reciterId}_${surahNumber}`;
    setFavorites(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const isFavorite = (reciterId: string, surahNumber: number) => {
    const key = `${reciterId}_${surahNumber}`;
    return favorites.includes(key);
  };

  // Helper: Format file size in readable MB
  const formatMB = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Downloader Implementation
  const downloadSurah = async (reciter: Reciter, surah: Surah) => {
    const key = `${reciter.id}_${surah.number}`;
    
    // Prevent duplicate downloads
    if (downloads[key]?.status === "downloading" || downloads[key]?.status === "completed") {
      return;
    }

    setDownloads(prev => ({
      ...prev,
      [key]: { status: "downloading", progress: 0 }
    }));

    try {
      // 1. Check storage space estimate
      if (navigator.storage && navigator.storage.estimate) {
        const est = await navigator.storage.estimate();
        const avail = (est.quota || 0) - (est.usage || 0);
        if (avail < 50 * 1024 * 1024) { // Needs at least 50MB safety
          throw new Error("INSUFFICIENT_STORAGE");
        }
      }

      const audioUrl = getSurahAudioUrl(reciter.serverUrl, surah.number);
      // Route download request through our proxy to ensure 100% CORS capability
      const proxyUrl = `/api/audio-proxy?url=${encodeURIComponent(audioUrl)}`;
      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error(`FETCH_FAILED_STATUS_${res.status}`);

      const len = res.headers.get("content-length");
      const totalBytes = len ? parseInt(len, 10) : 0;

      let blob: Blob;
      
      // Read stream chunk-by-chunk for showing perfect progress indicators
      if (res.body && typeof res.body.getReader === "function") {
        const reader = res.body.getReader();
        let receivedBytes = 0;
        const chunks: Uint8Array[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            chunks.push(value);
            receivedBytes += value.length;
            if (totalBytes > 0) {
              const pct = Math.round((receivedBytes / totalBytes) * 100);
              setDownloads(prev => ({
                ...prev,
                [key]: { status: "downloading", progress: pct }
              }));
            }
          }
        }
        blob = new Blob(chunks, { type: "audio/mp3" });
      } else {
        // Fallback for older WebView versions without stream reader support
        blob = await res.blob();
      }
      
      // Verify download integrity
      if (totalBytes > 0 && blob.size < totalBytes * 0.9) {
        throw new Error("CORRUPTED_FILE");
      }

      const cache = await caches.open(CACHE_NAME);
      const mockResponse = new Response(blob, {
        headers: {
          "Content-Type": "audio/mp3",
          "Content-Length": blob.size.toString()
        }
      });
      
      // Store in Cache Storage with exact valid URL key
      await cache.put(audioUrl, mockResponse);

      setDownloads(prev => ({
        ...prev,
        [key]: { status: "completed", progress: 100, size: formatMB(blob.size) }
      }));
    } catch (err: any) {
      console.error("Download failed for surah", surah.number, err);
      setDownloads(prev => ({
        ...prev,
        [key]: { status: "failed", progress: 0 }
      }));
      if (err.message === "INSUFFICIENT_STORAGE") {
        alert("পর্যাপ্ত স্টোরেজ স্পেস নেই! অনুগ্রহ করে কিছু ফাইল ডিলিট করে চেষ্টা করুন।");
      } else {
        alert(`${surah.name} ডাউনলোড ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।`);
      }
    }
  };

  // Download All 114 Surahs queue for a reciter
  const downloadAllSurahs = async (reciter: Reciter) => {
    const consent = window.confirm(
      `“${reciter.name}” এর সম্পূর্ণ কোরআনের ১১৪টি সূরা ডাউনলোড করতে প্রায় ৫০০-৮০০ মেগাবাইট ডিভাইস স্টোরেজ লাগতে পারে। আপনি কি চালিয়ে যেতে চান?`
    );
    if (!consent) return;

    // Estimate storage first
    if (navigator.storage && navigator.storage.estimate) {
      const est = await navigator.storage.estimate();
      const avail = (est.quota || 0) - (est.usage || 0);
      if (avail < 800 * 1024 * 1024) { // Check for 800MB safety
        alert("আপনার ডিভাইসে পর্যাপ্ত স্টোরেজ স্পেস নেই (কমপক্ষে ৮০০ মেগাবাইট প্রয়োজন)!");
        return;
      }
    }

    // Run queue of downloads
    for (const surah of SURAHS) {
      const key = `${reciter.id}_${surah.number}`;
      if (downloads[key]?.status === "completed" || downloads[key]?.status === "downloading") {
        continue;
      }
      await downloadSurah(reciter, surah);
    }
  };

  // Delete downloaded Surah to save space
  const deleteDownload = async (reciterId: string, surahNumber: number) => {
    const key = `${reciterId}_${surahNumber}`;
    const reciter = RECITERS.find(r => r.id === reciterId);
    if (!reciter) return;
    
    const audioUrl = getSurahAudioUrl(reciter.serverUrl, surahNumber);
    try {
      const cache = await caches.open(CACHE_NAME);
      const deleted = await cache.delete(audioUrl);
      if (deleted) {
        setDownloads(prev => {
          const updated = { ...prev };
          delete updated[key];
          return updated;
        });
      }
    } catch (err) {
      console.error("Failed to delete cache key:", audioUrl, err);
    }
  };

  return (
    <QuranContext.Provider
      value={{
        reciters: recitersList,
        surahs: SURAHS,
        currentReciter,
        currentSurah,
        isPlaying,
        currentTime,
        duration,
        volume,
        playbackSpeed,
        repeatMode,
        isShuffle,
        isPlayerMinimized,
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
        setPlayerMinimized,
        toggleFavorite,
        isFavorite,
        downloadSurah,
        downloadAllSurahs,
        deleteDownload,
        isDownloaded,
        searchQuery,
        setSearchQuery
      }}
    >
      {children}
    </QuranContext.Provider>
  );
};

export const useQuran = () => {
  const context = useContext(QuranContext);
  if (context === undefined) {
    throw new Error("useQuran must be used within a QuranProvider");
  }
  return context;
};
