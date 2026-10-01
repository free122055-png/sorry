import React, { useState, useEffect } from "react";
import { X, Heart, Send, MoreVertical, Pause, Play } from "lucide-react";
import { InstagramStory } from "../../types/instagram";

interface InstagramStoryViewerProps {
  stories: InstagramStory[];
  initialStoryId: string;
  onClose: () => void;
  onReplyStory?: (story: InstagramStory, message: string) => void;
}

export const InstagramStoryViewer: React.FC<InstagramStoryViewerProps> = ({
  stories,
  initialStoryId,
  onClose,
  onReplyStory
}) => {
  const initialIndex = stories.findIndex(s => s.id === initialStoryId);
  const [currentIndex, setCurrentIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [replyText, setReplyText] = useState("");

  const currentStory = stories[currentIndex];

  useEffect(() => {
    if (!currentStory || isPaused) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          if (currentIndex < stories.length - 1) {
            setCurrentIndex(c => c + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + 2; // 50 steps = 5 seconds
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentIndex, isPaused, stories.length, onClose, currentStory]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(c => c + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(c => c - 1);
      setProgress(0);
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !currentStory) return;
    onReplyStory?.(currentStory, replyText.trim());
    setReplyText("");
    alert("স্টোরিতে মেসেজ পাঠানো হয়েছে!");
  };

  if (!currentStory) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black text-white flex flex-col justify-between max-w-lg mx-auto md:max-w-xl select-none">
      {/* 1. Progress Bars at top */}
      <div className="absolute top-2 left-2 right-2 z-40 flex items-center gap-1.5">
        {stories.map((s, idx) => (
          <div key={s.id} className="flex-1 h-0.75 bg-white/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-100"
              style={{
                width: idx < currentIndex ? '100%' : (idx === currentIndex ? `${progress}%` : '0%')
              }}
            />
          </div>
        ))}
      </div>

      {/* 2. Top Header with Author info & Close button */}
      <div className="absolute top-5 left-3 right-3 z-40 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-white">
            <img src={currentStory.authorPhotoURL} alt={currentStory.authorUsername} className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-xs text-white drop-shadow-md">
            {currentStory.authorUsername}
          </span>
          <span className="text-[10px] text-gray-300 drop-shadow-md">২ঘণ্টা</span>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setIsPaused(!isPaused)} className="text-white hover:text-gray-300">
            {isPaused ? <Play className="w-4 h-4 fill-white" /> : <Pause className="w-4 h-4 fill-white" />}
          </button>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* 3. Media Viewport with tap left/right */}
      <div 
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        className="relative flex-1 w-full flex items-center justify-center bg-black overflow-hidden"
      >
        <img 
          src={currentStory.mediaUrl} 
          alt="Story" 
          className="w-full h-full object-cover"
        />

        {/* Caption overlay */}
        {currentStory.caption && (
          <div className="absolute bottom-20 left-4 right-4 bg-black/50 backdrop-blur-md p-3 rounded-2xl text-center">
            <p className="text-sm font-bold text-white drop-shadow-md leading-relaxed">
              {currentStory.caption}
            </p>
          </div>
        )}

        {/* Tap areas for next/prev */}
        <div onClick={handlePrev} className="absolute left-0 top-0 bottom-0 w-1/3 z-20 cursor-pointer" />
        <div onClick={handleNext} className="absolute right-0 top-0 bottom-0 w-2/3 z-20 cursor-pointer" />
      </div>

      {/* 4. Bottom Quick Reply Bar & Like */}
      <div className="relative z-40 p-3 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center gap-3">
        <form onSubmit={handleSendReply} className="flex-1 flex items-center bg-white/15 border border-white/30 rounded-full px-4 py-2">
          <input 
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={`${currentStory.authorUsername}-কে মেসেজ পাঠান...`}
            className="w-full bg-transparent text-xs text-white placeholder:text-gray-400 outline-none"
          />
          {replyText.trim() && (
            <button type="submit" className="text-xs font-black text-emerald-400 hover:text-emerald-300 ml-2">
              পাঠান
            </button>
          )}
        </form>

        <button 
          onClick={() => setIsLiked(!isLiked)} 
          className="p-1 active:scale-125 transition-transform"
        >
          <Heart className={`w-7 h-7 stroke-[2] ${isLiked ? 'fill-[#fe2c55] text-[#fe2c55]' : 'text-white'}`} />
        </button>
      </div>
    </div>
  );
};
