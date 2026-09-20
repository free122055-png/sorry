import React, { useState, useRef, useEffect } from "react";
import { 
  ArrowLeft, Cast, Download, Heart, MoreVertical, Play, Pause, 
  RotateCcw, RotateCw, SkipBack, SkipForward, Volume2, VolumeX, 
  Maximize, Minimize, Tv2, BookOpen, ChevronRight, Share2, 
  Check, Film, Loader2, RefreshCw
} from "lucide-react";
import { db } from "../../lib/firebase";
import { collection, query, orderBy, onSnapshot, getDocs } from "firebase/firestore";

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
}

interface VideoTilawatSectionProps {
  onBack: () => void;
  onSwitchToAudio?: () => void;
}

export const VideoTilawatSection: React.FC<VideoTilawatSectionProps> = ({ 
  onBack,
  onSwitchToAudio
}) => {
  // Real Firestore Videos state (Demo data removed completely)
  const [videos, setVideos] = useState<VideoTilawatItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentVideo, setCurrentVideo] = useState<VideoTilawatItem | null>(null);

  // Video playback states
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [realDuration, setRealDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);

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

  // 1. Fetch live uploaded videos from Firestore
  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "video_tilawat"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: VideoTilawatItem[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as VideoTilawatItem);
        });
        setVideos(list);
        setLoading(false);
        if (list.length > 0) {
          setCurrentVideo((prev) => {
            if (!prev) return list[0];
            const match = list.find((v) => v.id === prev.id);
            return match || list[0];
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
            // Client-side sort by createdAt descending
            list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            setVideos(list);
            setLoading(false);
            if (list.length > 0) {
              setCurrentVideo((prev) => prev || list[0]);
            } else {
              setCurrentVideo(null);
            }
          })
          .catch((e) => {
            console.error("Firestore fetch error:", e);
            setLoading(false);
          });
      }
    );

    return () => unsubscribe();
  }, []);

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
      videoRef.current.play().catch(() => {});
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 4. Playback controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
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

  const handleNextVideo = () => {
    if (!currentVideo || videos.length === 0) return;
    const currentIndex = videos.findIndex((v) => v.id === currentVideo.id);
    const nextIndex = (currentIndex + 1) % videos.length;
    selectVideo(videos[nextIndex]);
  };

  const handlePrevVideo = () => {
    if (!currentVideo || videos.length === 0) return;
    const currentIndex = videos.findIndex((v) => v.id === currentVideo.id);
    const prevIndex = (currentIndex - 1 + videos.length) % videos.length;
    selectVideo(videos[prevIndex]);
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

          {currentVideo?.videoUrl && (
            <a
              href={currentVideo.videoUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              title="ভিডিও ডাউনলোড করুন"
              className="w-9 h-9 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </a>
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
              {/* Actual HTML5 Video Element for real playback */}
              {currentVideo.videoUrl ? (
                <video
                  ref={videoRef}
                  src={currentVideo.videoUrl}
                  poster={currentVideo.thumbnailUrl}
                  playsInline
                  webkit-playsinline="true"
                  x5-playsinline="true"
                  controlsList="nodownload"
                  preload="metadata"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onPlay={() => setIsPlaying(true)}
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
              ) : (
                <div className="absolute inset-0 cursor-pointer" onClick={togglePlay}>
                  <img
                    src={currentVideo.thumbnailUrl}
                    alt={currentVideo.surahName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/60 pointer-events-none" />
                  <div className="absolute inset-0 bg-cyan-950/20 pointer-events-none" />
                </div>
              )}

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

            {/* 4. RELATED VIDEOS SECTION (RENDERED FROM FIRESTORE) */}
            {videos.length > 1 && (
              <div className="pt-2">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <Play className="w-4 h-4 fill-current text-cyan-400" />
                    Related Videos (সম্পর্কিত ভিডিও)
                  </h3>
                  <span className="text-xs text-emerald-400 font-semibold">
                    মোট {videos.length}টি ভিডিও
                  </span>
                </div>

                {/* Video Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {videos.map((item) => {
                    const isItemActive = item.id === currentVideo.id;
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
                          <div className="text-[10px] text-gray-500 flex items-center gap-1 font-mono">
                            <span>👁</span>
                            <span>{item.views || "100K"}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

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
