import React, { useState, useRef, useEffect } from "react";
import { 
  Plus, ChevronDown, Heart, MessageSquare, 
  Repeat2, Send, Bookmark, MoreVertical, 
  Volume2, VolumeX, Music, ChevronUp, Film
} from "lucide-react";
import { InstagramReel } from "../../types/instagram";

interface InstagramReelsProps {
  reels: InstagramReel[];
  onOpenComments: (reelId: string) => void;
  onShareReel: (reel: InstagramReel) => void;
  onToggleLikeReel: (reelId: string) => void;
  onToggleBookmarkReel: (reelId: string) => void;
  onToggleFollow: (authorId: string) => void;
  onCreateReel: () => void;
}

export const InstagramReels: React.FC<InstagramReelsProps> = ({
  reels = [],
  onOpenComments,
  onShareReel,
  onToggleLikeReel,
  onToggleBookmarkReel,
  onToggleFollow,
  onCreateReel
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentReel = reels[currentIndex] || reels[0];

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [currentIndex, currentReel?.videoUrl]);

  const handleNextReel = () => {
    if (currentIndex < reels.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrevReel = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (!reels || reels.length === 0) {
    return (
      <div className="relative min-h-[calc(100vh-80px)] w-full bg-[#0b1017] text-white flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto font-sans pb-28">
        <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 shadow-xl">
          <Film className="w-10 h-10" />
        </div>
        <h2 className="text-lg font-bold text-white mb-1">কোনো রিলস ভিডিও নেই</h2>
        <p className="text-xs text-slate-400 max-w-xs mb-6 leading-relaxed">
          আপনার প্রথম ভিডিও ক্লিপস আপলোড করুন এবং বন্ধুদের সাথে শেয়ার করুন।
        </p>
        <button
          onClick={onCreateReel}
          className="px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-lg transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>নতুন রিলস তৈরি করুন</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-70px)] w-full bg-black text-white overflow-hidden max-w-lg mx-auto md:max-w-xl select-none font-sans pb-20">
      {/* 1. Reels Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-30 px-4 pt-3.5 pb-6 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between">
        <button 
          onClick={onCreateReel} 
          className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white active:scale-90 transition-transform cursor-pointer"
          title="নতুন রিলস"
        >
          <Plus className="w-5 h-5" />
        </button>

        <h2 className="text-base font-bold text-white tracking-wide">ক্লিপস</h2>

        <div className="w-9" />
      </div>

      {/* 2. Main Video Viewport */}
      <div 
        onClick={togglePlay}
        className="w-full h-full relative flex items-center justify-center bg-black cursor-pointer"
      >
        <video
          ref={videoRef}
          src={currentReel?.videoUrl}
          poster={currentReel?.thumbnailUrl}
          className="w-full h-full object-cover"
          loop
          autoPlay
          playsInline
          muted={isMuted}
        />

        {/* Play/Pause Visual Feedback */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-md">
              <div className="w-0 h-0 border-y-8 border-y-transparent border-l-12 border-l-white ml-1" />
            </div>
          </div>
        )}

        {/* Up / Down navigation arrows */}
        <div className="absolute top-20 right-3 flex flex-col gap-2 z-20">
          {currentIndex > 0 && (
            <button 
              onClick={(e) => { e.stopPropagation(); handlePrevReel(); }}
              className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          )}
          {currentIndex < reels.length - 1 && (
            <button 
              onClick={(e) => { e.stopPropagation(); handleNextReel(); }}
              className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Floating Action Bar on Right */}
      <div className="absolute right-3 bottom-28 z-30 flex flex-col items-center gap-3.5">
        {/* Like */}
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleLikeReel(currentReel.id); }}
          className="flex flex-col items-center gap-1 group active:scale-125 transition-transform cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10">
            <Heart className={`w-5 h-5 ${currentReel.isLiked ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
          </div>
          <span className="text-[10px] font-semibold text-white drop-shadow">
            {currentReel.likesCount ? (currentReel.likesCount > 1000 ? `${Math.floor(currentReel.likesCount/1000)}k` : currentReel.likesCount) : "1"}
          </span>
        </button>

        {/* Comment */}
        <button 
          onClick={(e) => { e.stopPropagation(); onOpenComments(currentReel.id); }}
          className="flex flex-col items-center gap-1 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <span className="text-[10px] font-semibold text-white drop-shadow">{currentReel.commentsCount || "0"}</span>
        </button>

        {/* Share */}
        <button 
          onClick={(e) => { e.stopPropagation(); onShareReel(currentReel); }}
          className="flex flex-col items-center gap-1 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10">
            <Send className="w-4.5 h-4.5 text-white -rotate-12" />
          </div>
          <span className="text-[10px] font-semibold text-white drop-shadow">শেয়ার</span>
        </button>

        {/* Bookmark */}
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleBookmarkReel(currentReel.id); }}
          className="flex flex-col items-center gap-1 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10">
            <Bookmark className={`w-5 h-5 ${currentReel.isBookmarked ? 'fill-emerald-400 text-emerald-400' : 'text-white'}`} />
          </div>
          <span className="text-[10px] font-semibold text-white drop-shadow">সেভ</span>
        </button>

        {/* Sound toggle button */}
        <button 
          onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
          className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white border border-white/10 cursor-pointer"
          title={isMuted ? "সাউন্ড অন করুন" : "মিউট করুন"}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />}
        </button>
      </div>

      {/* 4. Bottom Info Overlay */}
      <div className="absolute left-0 right-16 bottom-24 z-30 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent space-y-1.5 pointer-events-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-800 ring-1 ring-white/20">
            <img 
              src={currentReel?.authorPhotoURL || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80"} 
              alt={currentReel?.authorUsername} 
              className="w-full h-full object-cover" 
            />
          </div>
          <span className="font-semibold text-xs text-white drop-shadow truncate max-w-[130px]">
            {currentReel?.authorUsername}
          </span>
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleFollow(currentReel.authorId); }}
            className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
              currentReel?.isFollowing 
                ? 'bg-white/20 text-white' 
                : 'bg-emerald-500 text-black font-bold'
            }`}
          >
            {currentReel?.isFollowing ? 'ফলোয়িং' : 'ফলো'}
          </button>
        </div>

        <p className="text-xs text-slate-200 drop-shadow leading-relaxed line-clamp-2">
          {currentReel?.caption}
        </p>

        {currentReel?.musicTitle && (
          <div className="flex items-center gap-1 text-xs text-emerald-400 drop-shadow pt-0.5">
            <Music className="w-3 h-3 flex-shrink-0" />
            <span className="truncate text-[10px]">
              {currentReel.musicTitle}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
