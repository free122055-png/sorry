import React, { useState, useRef, useEffect, useMemo } from "react";
import { 
  ArrowLeft, Cast, Download, Heart, MoreVertical, Play, Pause, 
  RotateCcw, RotateCw, SkipBack, SkipForward, Volume2, VolumeX, 
  Maximize, Minimize, Tv2, BookOpen, ChevronRight, Share2, 
  Check, Film, Loader2, RefreshCw, AlertCircle, CheckCircle2,
  Trash2, Wifi, WifiOff, HardDriveDownload
} from "lucide-react";
import { db } from "../../lib/firebase";
import { BACKEND_URL } from "../../lib/api";
import { collection, query, orderBy, onSnapshot, getDocs } from "firebase/firestore";
import {
  downloadAndSaveVideo,
  getOfflineVideoBlobUrl,
  deleteOfflineVideo,
  isVideoDownloaded,
  getDownloadedVideoIds,
  getAllOfflineVideos,
  cacheTilawatVideosList,
  getCachedTilawatVideosList,
  DownloadProgress
} from "../../services/videoOfflineService";

export interface VideoTilawatItem {
  id: string;
  surahName: string;
  surahNameBn?: string;
  reciterName: string;
  reciterNameBn?: string;
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
  isOfflineAvailable?: boolean;
  offlineSavedAt?: number;
  offlineSizeBytes?: number;
  offlineSizeFormatted?: string;
}

interface VideoTilawatSectionProps {
  onBack: () => void;
  onSwitchToAudio?: () => void;
}

export const VideoTilawatSection: React.FC<VideoTilawatSectionProps> = ({ 
  onBack,
  onSwitchToAudio
}) => {
  // Helper to ensure HTTPS and valid full URL for Android WebView, PWA and Play Console
  const normalizeVideoUrl = (rawUrl?: string): string => {
    if (!rawUrl) return "";
    let url = rawUrl.trim();
    if (url.startsWith("http://")) {
      url = url.replace("http://", "https://");
    }
    if (url.startsWith("/uploads/")) {
      const isCapacitor = 
        typeof window !== "undefined" && 
        (window.location.protocol === "capacitor:" || 
         window.location.protocol === "file:" || 
         (window as any).Capacitor !== undefined);

      if (isCapacitor) {
        return `${BACKEND_URL}${url}`;
      }
      if (typeof window !== "undefined" && window.location.origin && !window.location.origin.startsWith("file://") && !window.location.origin.startsWith("capacitor://")) {
        return `${window.location.origin}${url}`;
      }
      return `${BACKEND_URL}${url}`;
    }
    return url;
  };

  const getYouTubeEmbedUrl = (rawUrl?: string): string | null => {
    if (!rawUrl) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = rawUrl.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&playsinline=1`
      : null;
  };

  // Real Firestore Videos state with instant offline cache fallback
  const [videos, setVideos] = useState<VideoTilawatItem[]>(() => {
    return getCachedTilawatVideosList();
  });
  const [loading, setLoading] = useState<boolean>(() => {
    const cached = getCachedTilawatVideosList();
    return cached.length === 0;
  });
  const [currentVideo, setCurrentVideo] = useState<VideoTilawatItem | null>(() => {
    const cached = getCachedTilawatVideosList();
    return cached.length > 0 ? cached[0] : null;
  });

  // Offline Download & Playback states
  const [downloadedIds, setDownloadedIds] = useState<string[]>(() => getDownloadedVideoIds());
  const [downloadProgressMap, setDownloadProgressMap] = useState<Record<string, DownloadProgress>>({});
  const [localBlobUrl, setLocalBlobUrl] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [activeTab, setActiveTab] = useState<"all" | "downloaded" | "favorites">("all");

  // Video playback states
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [realDuration, setRealDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [hasPlaybackError, setHasPlaybackError] = useState<boolean>(false);

  // LocalStorage-backed user favorites
  const [favorites, setFavorites] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("almayadin_video_tilawat_favs");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Monitor network online / offline events
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check of offline items from IndexedDB
    getAllOfflineVideos().then((offlineItems) => {
      if (offlineItems && offlineItems.length > 0) {
        setVideos((prev) => {
          if (prev.length === 0) {
            setCurrentVideo(offlineItems[0]);
            setLoading(false);
            return offlineItems;
          }
          return prev;
        });
      }
    });

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // 1. Fetch live uploaded videos from Firestore (cache updated list for 100% offline access)
  useEffect(() => {
    const q = query(collection(db, "video_tilawat"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: VideoTilawatItem[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as VideoTilawatItem);
        });
        // Filter out drafts - only show published videos to users
        const publishedList = list.filter((v: any) => v.publishedStatus !== "draft");
        setVideos(publishedList);
        cacheTilawatVideosList(publishedList);
        setLoading(false);
        if (publishedList.length > 0) {
          setCurrentVideo((prev) => {
            if (!prev) return publishedList[0];
            const match = publishedList.find((v) => v.id === prev.id);
            return match || publishedList[0];
          });
        } else {
          setCurrentVideo(null);
        }
      },
      (err) => {
        console.warn("Firestore index order fallback, trying unordered:", err);
        getDocs(collection(db, "video_tilawat"))
          .then((snap) => {
            const list: VideoTilawatItem[] = [];
            snap.forEach((doc) => {
              list.push({ id: doc.id, ...doc.data() } as VideoTilawatItem);
            });
            list.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
            const publishedList = list.filter((v: any) => v.publishedStatus !== "draft");
            if (publishedList.length > 0) {
              setVideos(publishedList);
              cacheTilawatVideosList(publishedList);
              setCurrentVideo((prev) => prev || publishedList[0]);
            }
            setLoading(false);
          })
          .catch(async (e) => {
            console.error("Firestore fetch error, falling back to offline IndexedDB:", e);
            const offlineItems = await getAllOfflineVideos();
            if (offlineItems.length > 0) {
              setVideos(offlineItems);
              setCurrentVideo((prev) => prev || offlineItems[0]);
            }
            setLoading(false);
          });
      }
    );

    return () => unsubscribe();
  }, []);

  // 2. Resolve offline blob playback when currentVideo changes or download completes
  useEffect(() => {
    let isMounted = true;
    let activeUrl: string | null = null;

    async function resolveSource() {
      if (!currentVideo) {
        setLocalBlobUrl(null);
        return;
      }

      if (isVideoDownloaded(currentVideo.id)) {
        try {
          const blobUrl = await getOfflineVideoBlobUrl(currentVideo.id);
          if (isMounted && blobUrl) {
            activeUrl = blobUrl;
            setLocalBlobUrl(blobUrl);
            return;
          }
        } catch (e) {
          console.warn("Could not load offline blob, falling back to network url:", e);
        }
      }

      if (isMounted) {
        setLocalBlobUrl(null);
      }
    }

    resolveSource();

    return () => {
      isMounted = false;
      if (activeUrl) {
        URL.revokeObjectURL(activeUrl);
      }
    };
  }, [currentVideo?.id, downloadedIds]);

  // 2. Hide controls automatically after 3.5 seconds of playing
  const resetControlsTimeout = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3500);
    }
  };

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFs = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
      setIsFullscreen(isFs);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  // 3. Select and play a video
  const selectVideo = (video: VideoTilawatItem) => {
    setCurrentVideo(video);
    setCurrentTime(0);
    setRealDuration(video.durationSeconds || 0);
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      const p = videoRef.current.play();
      if (p !== undefined) {
        p.catch((e) => console.warn("Select play prevented:", e));
      }
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 4. Playback controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        const p = videoRef.current.play();
        if (p !== undefined) {
          p.then(() => setIsPlaying(true)).catch((err) => {
            console.warn("Play error, trying muted play for WebView compliance:", err);
            if (videoRef.current) {
              videoRef.current.muted = true;
              setIsMuted(true);
              videoRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
            }
          });
        }
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      setIsPlaying((prev) => !prev);
    }
    resetControlsTimeout();
  };

  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
    resetControlsTimeout();
  };

  const handleSkip = (seconds: number) => {
    const totalSec = realDuration || currentVideo?.durationSeconds || 3600;
    const target = Math.max(0, Math.min(totalSec, currentTime + seconds));
    handleSeek(target);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    } else {
      setIsMuted((prev) => !prev);
    }
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem("almayadin_video_tilawat_favs", JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save favorites:", e);
      }
      return updated;
    });
  };

  // Filter videos based on active tab (All, Downloaded, Favorites)
  const filteredVideos = useMemo(() => {
    if (activeTab === "downloaded") {
      return videos.filter((v) => downloadedIds.includes(v.id));
    }
    if (activeTab === "favorites") {
      return videos.filter((v) => !!favorites[v.id]);
    }
    return videos;
  }, [videos, activeTab, downloadedIds, favorites]);

  const handleNextVideo = () => {
    const list = filteredVideos.length > 0 ? filteredVideos : videos;
    if (!currentVideo || list.length === 0) return;
    const currentIndex = list.findIndex((v) => v.id === currentVideo.id);
    const nextIndex = (currentIndex + 1) % list.length;
    selectVideo(list[nextIndex]);
  };

  const handlePrevVideo = () => {
    const list = filteredVideos.length > 0 ? filteredVideos : videos;
    if (!currentVideo || list.length === 0) return;
    const currentIndex = list.findIndex((v) => v.id === currentVideo.id);
    const prevIndex = (currentIndex - 1 + list.length) % list.length;
    selectVideo(list[prevIndex]);
  };

  const handleDownloadVideo = async (item: VideoTilawatItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const resolvedUrl = normalizeVideoUrl(item.videoUrl);
    if (!resolvedUrl) {
      alert("ভিডিওর লিংক খুঁজে পাওয়া যায়নি।");
      return;
    }

    setDownloadProgressMap((prev) => ({
      ...prev,
      [item.id]: {
        videoId: item.id,
        progress: 1,
        downloadedMB: "0 MB",
        totalMB: "শুরু হচ্ছে...",
        status: "downloading",
      },
    }));

    const success = await downloadAndSaveVideo(item, resolvedUrl, (prog) => {
      setDownloadProgressMap((prev) => ({
        ...prev,
        [item.id]: prog,
      }));
    });

    if (success) {
      const updated = getDownloadedVideoIds();
      setDownloadedIds(updated);
      if (currentVideo?.id === item.id) {
        const blobUrl = await getOfflineVideoBlobUrl(item.id);
        if (blobUrl) setLocalBlobUrl(blobUrl);
      }
    }
  };

  const handleDeleteOfflineVideo = async (item: VideoTilawatItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const confirmDelete = window.confirm(`"${item.surahName}" অফলাইন স্টোরেজ থেকে মুছে ফেলতে চান?`);
    if (!confirmDelete) return;

    await deleteOfflineVideo(item.id);
    const updated = getDownloadedVideoIds();
    setDownloadedIds(updated);
    if (currentVideo?.id === item.id) {
      setLocalBlobUrl(null);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
    if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
    }
    onBack();
  };

  const toggleFullscreen = () => {
    const container = playerContainerRef.current;
    const video = videoRef.current;
    if (!container) return;

    const isFs = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
    if (!isFs) {
      if (container.requestFullscreen) {
        container.requestFullscreen().catch(() => {
          if (video && (video as any).webkitEnterFullscreen) {
            (video as any).webkitEnterFullscreen();
          }
        });
      } else if ((container as any).webkitRequestFullscreen) {
        (container as any).webkitRequestFullscreen();
      } else if (video && (video as any).webkitEnterFullscreen) {
        (video as any).webkitEnterFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
    }
  };

  // Video element events
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current && !isNaN(videoRef.current.duration) && videoRef.current.duration > 0) {
      setRealDuration(videoRef.current.duration);
    }
  };

  // Format seconds smoothly supporting up to 1-hour or longer videos (HH:MM:SS or MM:SS)
  const formatSeconds = (sec: number) => {
    if (isNaN(sec) || sec < 0) return "00:00";
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const effectiveDuration = realDuration || currentVideo?.durationSeconds || 0;
  const progressPercent = effectiveDuration > 0 ? (currentTime / effectiveDuration) * 100 : 0;
  const isCurrentFavorite = currentVideo ? !!favorites[currentVideo.id] : false;

  return (
    <div className="min-h-screen w-full bg-[#020d17] text-white flex flex-col font-sans select-none relative overflow-x-hidden pb-28">
      
      {/* 1. TOP HEADER (Back button, Title, Switch to Audio, Cast, Download, Favorite) */}
      <header className="sticky top-0 z-30 px-4 py-3 flex items-center justify-between bg-[#020d17]/90 backdrop-blur-md border-b border-white/5">
        {/* Left: Prominent Back Button & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            title="ফিরে যান (Back)"
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 active:scale-95 text-white transition-all cursor-pointer border border-white/10"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-wide">
                Video Tilawat
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ভিডিও
              </span>
            </div>
            <p className="text-[11px] text-gray-400">কুরআনুল কারীম ভিডিও তেলাওয়াত</p>
          </div>
        </div>

        {/* Right Action Icons: Audio Switcher, Download, Favorite */}
        <div className="flex items-center gap-2">
          {onSwitchToAudio && (
            <button
              onClick={onSwitchToAudio}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-600/20 border border-blue-400/30 text-blue-300 hover:bg-blue-600/30 transition-all cursor-pointer"
            >
              অডিও মোড
            </button>
          )}

          <button 
            title="টিভি বা ডিভাইসে কাস্ট করুন"
            className="w-9 h-9 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
          >
            <Cast className="w-4 h-4" />
          </button>

          {currentVideo && (
            downloadedIds.includes(currentVideo.id) ? (
              <button
                onClick={(e) => handleDeleteOfflineVideo(currentVideo, e)}
                title="অফলাইনে সংরক্ষিত (ক্লিক করে মুছুন)"
                className="px-2.5 py-1.5 rounded-full flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold transition-all cursor-pointer hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/40 group"
              >
                <CheckCircle2 className="w-3.5 h-3.5 group-hover:hidden" />
                <Trash2 className="w-3.5 h-3.5 hidden group-hover:inline" />
                <span className="text-[11px] group-hover:hidden">অফলাইন</span>
                <span className="text-[11px] hidden group-hover:inline">মুছুন</span>
              </button>
            ) : downloadProgressMap[currentVideo.id]?.status === "downloading" ? (
              <div
                title="ডাউনলোড হচ্ছে..."
                className="px-2.5 py-1.5 rounded-full flex items-center gap-1.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold"
              >
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                <span className="text-[11px]">{downloadProgressMap[currentVideo.id].progress}%</span>
              </div>
            ) : (
              <button
                onClick={(e) => handleDownloadVideo(currentVideo, e)}
                title="অফলাইনে সেভ করুন (ইন্টারনেট ছাড়া দেখতে)"
                className="w-9 h-9 rounded-full flex items-center justify-center bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
              </button>
            )
          )}

          {currentVideo && (
            <button 
              onClick={() => toggleFavorite(currentVideo.id)}
              title="পছন্দের তালিকা"
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                isCurrentFavorite ? "bg-rose-500/20 text-rose-400" : "bg-white/5 text-gray-300 hover:text-white"
              }`}
            >
              <Heart className={`w-4 h-4 ${isCurrentFavorite ? "fill-current" : ""}`} />
            </button>
          )}
        </div>
      </header>

      {/* Offline Alert Banner */}
      {!isOnline && (
        <div className="mx-4 mt-3 p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <div>
              <p className="font-bold">আপনি বর্তমানে অফলাইনে আছেন</p>
              <p className="text-[11px] text-amber-300/80">ডাউনলোড করা ভিডিওগুলো কোনো ইন্টারনেট ছাড়াই চলবে।</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab("downloaded")}
            className="px-3 py-1.5 bg-amber-400 text-black font-bold rounded-xl text-[11px] whitespace-nowrap cursor-pointer hover:bg-amber-300 transition active:scale-95"
          >
            অফলাইন ভিডিও ({downloadedIds.length})
          </button>
        </div>
      )}

      {/* 2. LOADING STATE */}
      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4 my-24">
          <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
          <p className="text-sm text-gray-400 font-medium">ভিডিও তেলাওয়াত লোড হচ্ছে...</p>
        </div>
      )}

      {/* 3. EMPTY STATE - WHEN NO VIDEOS HAVE BEEN UPLOADED YET */}
      {!loading && videos.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto my-12 space-y-5">
          <div className="w-20 h-20 rounded-3xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-950/50">
            <Film className="w-10 h-10 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">
              কোনো ভিডিও তেলাওয়াত পাওয়া যায়নি
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              ডেমো ভিডিওগুলো রিমুভ করা হয়েছে। এডমিন প্যানেলের "ভিডিও তেলাওয়াত" সেকশন থেকে যেকোনো ১ ঘণ্টার পূর্ণাঙ্গ ভিডিও ফাইল অথবা ভিডিও লিংক আপলোড করুন, এরপর তা স্বয়ংক্রিয়ভাবে এখানে দেখা যাবে এবং প্লে হবে।
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full pt-2">
            {onSwitchToAudio && (
              <button
                onClick={onSwitchToAudio}
                className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-bold shadow-lg shadow-emerald-950/40 active:scale-95 transition-all cursor-pointer"
              >
                অডিও তেলাওয়াত শুনুন
              </button>
            )}
            <button
              onClick={onBack}
              className="w-full py-3 px-5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-sm font-semibold active:scale-95 transition-all cursor-pointer"
            >
              ফিরে যান
            </button>
          </div>
        </div>
      )}

      {/* 4. MAIN VIDEO PLAYER & DETAILS (RENDERED ONLY WHEN VIDEOS EXIST) */}
      {!loading && currentVideo && (
        <>
          {/* VIDEO PLAYER CONTAINER */}
          <div className="w-full max-w-4xl mx-auto px-0 sm:px-4 pt-0 sm:pt-3">
            <div 
              ref={playerContainerRef}
              style={{
                transform: "translate3d(0, 0, 0)",
                WebkitTransform: "translate3d(0, 0, 0)",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
              className="relative w-full aspect-video sm:rounded-2xl overflow-hidden bg-black shadow-2xl border-y sm:border border-cyan-500/20 group"
              onMouseMove={resetControlsTimeout}
              onClick={resetControlsTimeout}
            >
              {/* Actual Video Playback - Direct File or YouTube */}
              {(() => {
                const normUrl = normalizeVideoUrl(currentVideo.videoUrl);
                const ytUrl = getYouTubeEmbedUrl(normUrl);
                const defaultPoster = "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=1200&q=80";
                const posterUrl = currentVideo.thumbnailUrl || defaultPoster;

                if (ytUrl) {
                  return (
                    <iframe
                      src={ytUrl}
                      title={currentVideo.surahName}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  );
                }

                const effectiveSrc = localBlobUrl || normUrl;

                if (effectiveSrc) {
                  return (
                    <>
                      <video
                        ref={videoRef}
                        key={currentVideo.id + (localBlobUrl ? "-offline" : "-online")}
                        src={effectiveSrc}
                        poster={posterUrl}
                        playsInline
                        webkit-playsinline="true"
                        x5-playsinline="true"
                        controlsList="nodownload"
                        preload="auto"
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onWaiting={() => setIsBuffering(true)}
                        onPlaying={() => {
                          setIsBuffering(false);
                          setHasPlaybackError(false);
                        }}
                        onCanPlay={() => {
                          setIsBuffering(false);
                          if (isPlaying && videoRef.current && videoRef.current.paused) {
                            videoRef.current.play().catch(() => {});
                          }
                        }}
                        onError={() => {
                          setIsBuffering(false);
                          setHasPlaybackError(true);
                        }}
                        onPlay={() => {
                          setIsPlaying(true);
                          setHasPlaybackError(false);
                        }}
                        onPause={() => setIsPlaying(false)}
                        onEnded={handleVideoEnded}
                        onClick={togglePlay}
                        style={{
                          transform: "translateZ(0)",
                          WebkitTransform: "translateZ(0)",
                          willChange: "transform",
                          backgroundColor: "#000000",
                        }}
                        className="w-full h-full object-cover sm:object-contain bg-black cursor-pointer"
                      />

                      {/* Offline Mode Playing Badge */}
                      {localBlobUrl && (
                        <div className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-full bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1.5 shadow-lg border border-emerald-400/40 pointer-events-none">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                          <span>অফলাইন মেমোরি থেকে চলছে</span>
                        </div>
                      )}

                      {/* Buffering Spinner */}
                      {isBuffering && isPlaying && !hasPlaybackError && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 pointer-events-none z-20">
                          <div className="w-12 h-12 rounded-full border-3 border-amber-400 border-t-transparent animate-spin" />
                          <p className="text-xs text-amber-200 font-bold mt-2">বাফারিং হচ্ছে...</p>
                        </div>
                      )}

                      {/* Playback Error Overlay with Retry / Offline switcher */}
                      {hasPlaybackError && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 z-20 p-4 text-center">
                          <AlertCircle className="w-10 h-10 text-rose-500 mb-2" />
                          <p className="text-sm font-bold text-white mb-1">
                            {!isOnline && !localBlobUrl ? "আপনি বর্তমানে অফলাইনে আছেন" : "ভিডিও প্লে করতে সমস্যা হচ্ছে"}
                          </p>
                          <p className="text-xs text-gray-300 mb-3 max-w-xs">
                            {!isOnline && !localBlobUrl
                              ? "এই ভিডিওটি আগে অফলাইনে ডাউনলোড করা হয়নি। অফলাইনে দেখতে আপনার সেভ করা ভিডিওগুলো নির্বাচন করুন।"
                              : "দয়া করে ইন্টারনেট কানেকশন চেক করুন বা পুনরায় চেষ্টা করুন"}
                          </p>
                          <div className="flex items-center gap-2">
                            {downloadedIds.length > 0 && !localBlobUrl && (
                              <button
                                onClick={() => {
                                  setHasPlaybackError(false);
                                  setActiveTab("downloaded");
                                  const downloadedVideos = videos.filter((v) => downloadedIds.includes(v.id));
                                  if (downloadedVideos.length > 0) {
                                    selectVideo(downloadedVideos[0]);
                                  }
                                }}
                                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow cursor-pointer transition active:scale-95 flex items-center gap-1.5"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>ডাউনলোড করা ভিডিও চালান</span>
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setHasPlaybackError(false);
                                if (videoRef.current) {
                                  videoRef.current.load();
                                  videoRef.current.play().catch(() => {});
                                }
                              }}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow cursor-pointer transition active:scale-95"
                            >
                              পুনরায় চেষ্টা করুন (Retry)
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  );
                }

                return (
                  <div className="absolute inset-0 cursor-pointer" onClick={togglePlay}>
                    <img
                      src={posterUrl}
                      alt={currentVideo.surahName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover opacity-85"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/60 pointer-events-none" />
                    <div className="absolute inset-0 bg-cyan-950/20 pointer-events-none" />
                  </div>
                );
              })()}

              {/* Top Overlay: Calligraphy & HD 1080p Badge */}
              <div className={`absolute top-3 left-4 right-4 flex items-start justify-between pointer-events-none z-10 transition-opacity duration-300 ${
                showControls || !isPlaying ? "opacity-100" : "opacity-0"
              }`}>
                {/* Left: Arabic Calligraphy & Subtitle */}
                <div className="text-left">
                  <div className="text-amber-200/90 font-arabic text-xl sm:text-2xl font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {currentVideo.arabicTitle || "القرآن الكريم"}
                  </div>
                  <div className="text-[11px] text-amber-100/80 font-medium tracking-wide drop-shadow-sm">
                    {currentVideo.surahNameBn || currentVideo.surahName}
                  </div>
                </div>

                {/* Right: HD 1080p Badge */}
                <div className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-md border border-amber-400/40 text-[10px] font-bold text-amber-300 tracking-wider flex items-center gap-1 shadow-md">
                  <span>HD</span>
                  <span className="text-white/80">1080p</span>
                </div>
              </div>

              {/* Center Play / Pause Floating Button (Visible when paused or hovered) */}
              {(!isPlaying || showControls) && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlay();
                    }}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/60 backdrop-blur-md border-2 border-white/20 text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer pointer-events-auto hover:bg-cyan-600/60 hover:border-cyan-400"
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8 fill-current" />
                    ) : (
                      <Play className="w-8 h-8 fill-current ml-1" />
                    )}
                  </button>
                </div>
              )}

              {/* Video Bottom Custom Controls Bar */}
              <div className={`absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black via-black/80 to-transparent z-20 space-y-2 transition-opacity duration-300 ${
                showControls || !isPlaying ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
              }`}>
                
                {/* Progress Bar & Timestamps */}
                <div className="space-y-1">
                  <div className="relative flex items-center group/track">
                    <input
                      type="range"
                      min="0"
                      max={effectiveDuration || 100}
                      step="1"
                      value={currentTime}
                      onChange={(e) => handleSeek(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-[#00e676] focus:outline-hidden hover:h-2 transition-all"
                      style={{
                        background: `linear-gradient(to right, #00e676 ${progressPercent}%, rgba(255,255,255,0.2) ${progressPercent}%)`
                      }}
                    />
                  </div>

                  {/* Time Numbers */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-gray-300 font-semibold px-0.5">
                    <span>{formatSeconds(currentTime)}</span>
                    <span>{formatSeconds(effectiveDuration) || currentVideo.duration}</span>
                  </div>
                </div>

                {/* Bottom Row of Controls */}
                <div className="flex items-center justify-between pt-1">
                  {/* Left Group */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        if (videoRef.current && (document as any).pictureInPictureEnabled) {
                          if (document.pictureInPictureElement) {
                            document.exitPictureInPicture().catch(() => {});
                          } else {
                            videoRef.current.requestPictureInPicture().catch(() => {});
                          }
                        }
                      }}
                      title="পিকচার-ইন-পিকচার"
                      className="text-gray-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <Tv2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleSkip(-10)}
                      title="১০ সেকেন্ড পেছনে"
                      className="flex items-center text-gray-300 hover:text-white active:scale-95 transition-all text-[11px] font-bold cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4 mr-0.5" />
                      <span>10</span>
                    </button>
                  </div>

                  {/* Center Playback Controls (Prev, Big Play/Pause, Next) */}
                  <div className="flex items-center gap-3 sm:gap-5">
                    <button
                      onClick={handlePrevVideo}
                      title="পূর্ববর্তী ভিডিও"
                      className="text-white/80 hover:text-white active:scale-90 transition-all cursor-pointer"
                    >
                      <SkipBack className="w-5 h-5 fill-current" />
                    </button>

                    <button
                      onClick={togglePlay}
                      title={isPlaying ? "বিরতি" : "প্লে"}
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-[#00b0ff] to-[#00e676] text-black flex items-center justify-center shadow-lg shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-all border border-cyan-200 cursor-pointer"
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 fill-current text-black" />
                      ) : (
                        <Play className="w-5 h-5 fill-current text-black ml-0.5" />
                      )}
                    </button>

                    <button
                      onClick={handleNextVideo}
                      title="পরবর্তী ভিডিও"
                      className="text-white/80 hover:text-white active:scale-90 transition-all cursor-pointer"
                    >
                      <SkipForward className="w-5 h-5 fill-current" />
                    </button>
                  </div>

                  {/* Right Group */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleSkip(10)}
                      title="১০ সেকেন্ড সামনে"
                      className="flex items-center text-gray-300 hover:text-white active:scale-95 transition-all text-[11px] font-bold cursor-pointer"
                    >
                      <span>10</span>
                      <RotateCw className="w-4 h-4 ml-0.5" />
                    </button>

                    <button
                      onClick={toggleMute}
                      title={isMuted ? "সাউন্ড চালু করুন" : "মিউট করুন"}
                      className="text-gray-300 hover:text-white transition-colors cursor-pointer"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={toggleFullscreen}
                      title={isFullscreen ? "ছোট স্ক্রিন" : "ফুলস্ক্রিন"}
                      className="text-gray-300 hover:text-white transition-colors cursor-pointer"
                    >
                      {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* 3. RECITER / VIDEO DETAILS CARD */}
          <div className="w-full max-w-4xl mx-auto px-4 mt-4 space-y-3">
            
            {/* Reciter Channel Info & Add to Favorites Button */}
            <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#071321] border border-white/5">
              <div className="flex items-center gap-3">
                {/* Circular Avatar with checkmark */}
                <div className="relative">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-cyan-500/40 bg-black/40">
                    <img
                      src={currentVideo.reciterAvatar || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80"}
                      alt={currentVideo.reciterName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center border border-[#071321]">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                </div>

                {/* Title & Metadata */}
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-white leading-tight">
                    {currentVideo.surahName}
                  </h2>
                  <div className="flex items-center gap-1 text-xs text-cyan-300 font-medium mt-0.5">
                    <span>{currentVideo.reciterNameBn || currentVideo.reciterName}</span>
                    <span className="w-3.5 h-3.5 rounded-full bg-blue-500 text-white inline-flex items-center justify-center text-[8px] font-bold">✓</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Play className="w-3 h-3 fill-current text-cyan-400" /> Video
                    </span>
                    <span>•</span>
                    <span>{formatSeconds(effectiveDuration) || currentVideo.duration}</span>
                    <span>•</span>
                    <span>{currentVideo.views || "100K views"}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Offline Download / Delete Button */}
                {downloadedIds.includes(currentVideo.id) ? (
                  <button
                    onClick={(e) => handleDeleteOfflineVideo(currentVideo, e)}
                    title="অফলাইন মেমোরিতে সেভ আছে (মুছতে ক্লিক করুন)"
                    className="px-3 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap border shadow-sm cursor-pointer bg-emerald-500/15 text-emerald-300 border-emerald-400/40 hover:bg-rose-500/15 hover:text-rose-300 hover:border-rose-400/40 group"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 group-hover:hidden text-emerald-400" />
                    <Trash2 className="w-3.5 h-3.5 hidden group-hover:inline text-rose-400" />
                    <span className="group-hover:hidden">অফলাইনে সংরক্ষিত</span>
                    <span className="hidden group-hover:inline">অফলাইন মুছুন</span>
                  </button>
                ) : downloadProgressMap[currentVideo.id]?.status === "downloading" ? (
                  <div className="px-3 py-2 rounded-full text-xs font-semibold flex items-center gap-2 bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                    <span>ডাউনলোড {downloadProgressMap[currentVideo.id].progress}%</span>
                  </div>
                ) : (
                  <button
                    onClick={(e) => handleDownloadVideo(currentVideo, e)}
                    className="px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap border shadow-sm cursor-pointer bg-cyan-500/10 text-cyan-300 border-cyan-400/30 hover:bg-cyan-500/20 active:scale-95"
                  >
                    <HardDriveDownload className="w-3.5 h-3.5" />
                    <span>অফলাইনে সেভ করুন</span>
                  </button>
                )}

                {/* Golden "Add to Favorites" Button */}
                <button
                  onClick={() => toggleFavorite(currentVideo.id)}
                  className={`px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap border shadow-sm cursor-pointer ${
                    isCurrentFavorite
                      ? "bg-amber-500/20 text-amber-300 border-amber-400/50 shadow-amber-900/20"
                      : "bg-amber-500/10 text-amber-300 border-amber-400/30 hover:bg-amber-500/20"
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isCurrentFavorite ? "fill-current text-amber-400" : ""}`} />
                  <span>{isCurrentFavorite ? "ফেভারিট যুক্ত" : "Add to Favorites"}</span>
                </button>
              </div>
            </div>

            {/* Tag Chips */}
            {currentVideo.tags && currentVideo.tags.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {currentVideo.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-gray-300 border border-white/10 hover:border-cyan-500/40 hover:text-white cursor-pointer transition-all whitespace-nowrap"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Description Banner with Open Book Icon */}
            {currentVideo.description && (
              <div className="p-3.5 rounded-2xl bg-[#06182c]/80 border border-cyan-500/20 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center flex-shrink-0 text-amber-300">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {currentVideo.description}
                  </p>
                </div>
              </div>
            )}

            {/* 4. RELATED VIDEOS & OFFLINE TABS */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <Play className="w-4 h-4 fill-current text-cyan-400" />
                  ভিডিও তালিকা (Video Tilawat)
                </h3>
                <span className="text-xs text-emerald-400 font-semibold">
                  মোট {filteredVideos.length}টি ভিডিও
                </span>
              </div>

              {/* Tabs: All, Offline Downloaded, Favorites */}
              <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === "all"
                      ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/30"
                      : "bg-white/5 text-gray-400 hover:text-white"
                  }`}
                >
                  সকল ভিডিও ({videos.length})
                </button>

                <button
                  onClick={() => setActiveTab("downloaded")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === "downloaded"
                      ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/30"
                      : "bg-white/5 text-gray-400 hover:text-white"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>অফলাইন সেভ করা ({downloadedIds.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab("favorites")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === "favorites"
                      ? "bg-rose-500 text-white shadow-md shadow-rose-500/30"
                      : "bg-white/5 text-gray-400 hover:text-white"
                  }`}
                >
                  <Heart className="w-3.5 h-3.5 fill-current" />
                  <span>পছন্দের তালিকা</span>
                </button>
              </div>

              {/* Empty state for downloaded tab */}
              {activeTab === "downloaded" && filteredVideos.length === 0 && (
                <div className="py-10 px-4 text-center rounded-2xl bg-[#071321] border border-white/5 my-2">
                  <HardDriveDownload className="w-12 h-12 text-cyan-400/60 mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-white mb-1">কোনো অফলাইন ভিডিও পাওয়া যায়নি</h4>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
                    ইন্টারনেট চালু থাকা অবস্থায় যেকোনো ভিডিওর নিচে "অফলাইনে সেভ করুন" বাটনে চাপ দিয়ে ফোনে ডাউনলোড করে রাখুন। এরপর ইন্টারনেট ছাড়াই সরাসরি দেখতে পারবেন।
                  </p>
                  <button
                    onClick={() => setActiveTab("all")}
                    className="px-4 py-2 bg-cyan-500 text-black text-xs font-bold rounded-xl shadow cursor-pointer active:scale-95"
                  >
                    সকল ভিডিও দেখুন
                  </button>
                </div>
              )}

              {/* Video Cards Grid */}
              {filteredVideos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {filteredVideos.map((item) => {
                    const isItemActive = item.id === currentVideo?.id;
                    const isItemDownloaded = downloadedIds.includes(item.id);
                    const isDownloading = downloadProgressMap[item.id]?.status === "downloading";

                    return (
                      <div
                        key={item.id}
                        onClick={() => selectVideo(item)}
                        className={`group rounded-xl overflow-hidden bg-[#071321] border cursor-pointer transition-all hover:-translate-y-0.5 ${
                          isItemActive 
                            ? "border-cyan-400 shadow-lg shadow-cyan-900/30 ring-1 ring-cyan-400/50" 
                            : "border-white/5 hover:border-white/20"
                        }`}
                      >
                        {/* Thumbnail with duration badge and play icon */}
                        <div className="relative aspect-video w-full overflow-hidden bg-black/40">
                          <img
                            src={item.thumbnailUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80"}
                            alt={item.surahName}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
                          
                          {/* Offline Downloaded Badge on Thumbnail */}
                          {isItemDownloaded && (
                            <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-emerald-600/90 backdrop-blur-xs text-[9px] font-bold text-white flex items-center gap-1 shadow">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>অফলাইন</span>
                            </div>
                          )}

                          {/* Play icon overlay */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-xs text-white flex items-center justify-center group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-black transition-all">
                              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                            </div>
                          </div>

                          {/* Duration badge at bottom right */}
                          <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-xs text-[10px] font-mono font-semibold text-white">
                            {item.duration || formatSeconds(item.durationSeconds)}
                          </div>
                        </div>

                        {/* Info block */}
                        <div className="p-2.5 space-y-1">
                          <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-cyan-300 transition-colors">
                            {item.surahName}
                          </h4>
                          <p className="text-[11px] text-gray-400 line-clamp-1">
                            {item.reciterNameBn || item.reciterName}
                          </p>
                          <div className="flex items-center justify-between pt-1">
                            <div className="text-[10px] text-gray-500 flex items-center gap-1 font-mono">
                              <span>👁</span>
                              <span>{item.views || "100K"}</span>
                            </div>

                            {isItemDownloaded ? (
                              <button
                                onClick={(e) => handleDeleteOfflineVideo(item, e)}
                                title="অফলাইন থেকে মুছুন"
                                className="text-[10px] text-emerald-400 hover:text-rose-400 font-bold flex items-center gap-0.5 transition-colors cursor-pointer"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>সেভড</span>
                              </button>
                            ) : isDownloading ? (
                              <span className="text-[10px] text-cyan-400 font-bold flex items-center gap-0.5">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>{downloadProgressMap[item.id]?.progress}%</span>
                              </span>
                            ) : (
                              <button
                                onClick={(e) => handleDownloadVideo(item, e)}
                                title="অফলাইনে সেভ করুন"
                                className="w-6 h-6 rounded-md bg-white/5 hover:bg-cyan-500/20 text-gray-400 hover:text-cyan-300 flex items-center justify-center transition cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* 5. FLOATING MINI-PLAYER (WHEN PLAYING OR SCROLLED) */}
          <div className="fixed bottom-14 left-0 right-0 z-30 px-3 max-w-lg mx-auto pointer-events-auto">
            <div className="p-2 rounded-2xl bg-[#061524]/95 backdrop-blur-xl border border-cyan-500/30 shadow-2xl shadow-cyan-950/60 flex items-center justify-between gap-3">
              
              {/* Left: Thumbnail & Surah Info */}
              <div 
                className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-black flex-shrink-0 border border-cyan-400/30">
                  <img
                    src={currentVideo.reciterAvatar || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80"}
                    alt={currentVideo.reciterName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate">
                    {currentVideo.surahName}
                  </div>
                  <div className="text-[10px] text-gray-400 truncate">
                    {currentVideo.reciterNameBn || currentVideo.reciterName}
                  </div>
                  {/* Mini progress line */}
                  <div className="w-full h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                    <div 
                      className="h-full bg-cyan-400 rounded-full" 
                      style={{ width: `${progressPercent}%` }} 
                    />
                  </div>
                </div>
              </div>

              {/* Middle: Duration counter */}
              <div className="text-[10px] font-mono text-gray-400 flex-shrink-0">
                {formatSeconds(currentTime)} / {formatSeconds(effectiveDuration) || currentVideo.duration}
              </div>

              {/* Right: Controls (Prev, Play/Pause, Next) */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={handlePrevVideo}
                  title="পূর্ববর্তী"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:text-white cursor-pointer"
                >
                  <SkipBack className="w-4 h-4 fill-current" />
                </button>
                <button
                  onClick={togglePlay}
                  title={isPlaying ? "বিরতি" : "প্লে"}
                  className="w-9 h-9 rounded-full bg-cyan-500 text-black flex items-center justify-center hover:scale-105 active:scale-95 shadow-md shadow-cyan-500/40 transition-all cursor-pointer"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>
                <button
                  onClick={handleNextVideo}
                  title="পরবর্তী"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:text-white cursor-pointer"
                >
                  <SkipForward className="w-4 h-4 fill-current" />
                </button>
              </div>

            </div>
          </div>
        </>
      )}

    </div>
  );
};
