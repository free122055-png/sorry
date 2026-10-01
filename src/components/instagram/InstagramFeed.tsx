import React, { useState } from "react";
import { 
  Plus, Heart, Send, MoreHorizontal, MessageSquare, 
  Bookmark, Volume2, VolumeX, Music, ChevronRight, ChevronLeft,
  Share2, Sparkles, Trash2, Copy, Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { InstagramPost, InstagramStory } from "../../types/instagram";
import { InstagramStoriesTray } from "./InstagramStoriesTray";

interface InstagramFeedProps {
  posts: InstagramPost[];
  stories: InstagramStory[];
  currentUserPhoto?: string;
  currentUserId?: string;
  onOpenStory: (storyId: string) => void;
  onCreatePostOrStory: () => void;
  onOpenMessages: () => void;
  onOpenComments: (postId: string) => void;
  onSharePost: (post: InstagramPost) => void;
  onToggleLikePost: (postId: string) => void;
  onToggleBookmarkPost: (postId: string) => void;
  onDeletePost?: (postId: string) => void;
}

const isVideoUrl = (url: string) => {
  if (!url) return false;
  return url.startsWith('data:video') || url.includes('.mp4') || url.includes('.webm') || url.includes('.mov') || url.includes('gtv-videos-bucket');
};

export const InstagramFeed: React.FC<InstagramFeedProps> = ({
  posts,
  stories,
  currentUserPhoto,
  currentUserId = "current_user",
  onOpenStory,
  onCreatePostOrStory,
  onOpenMessages,
  onOpenComments,
  onSharePost,
  onToggleLikePost,
  onToggleBookmarkPost,
  onDeletePost
}) => {
  const [carouselIndexes, setCarouselIndexes] = useState<Record<string, number>>({});
  const [expandedCaptions, setExpandedCaptions] = useState<Record<string, boolean>>({});
  const [isMuted, setIsMuted] = useState(true);
  const [doubleTapHeart, setDoubleTapHeart] = useState<Record<string, boolean>>({});
  const [activeMenuPostId, setActiveMenuPostId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleNextMedia = (postId: string, max: number) => {
    setCarouselIndexes(prev => ({
      ...prev,
      [postId]: Math.min((prev[postId] || 0) + 1, max - 1)
    }));
  };

  const handlePrevMedia = (postId: string) => {
    setCarouselIndexes(prev => ({
      ...prev,
      [postId]: Math.max((prev[postId] || 0) - 1, 0)
    }));
  };

  const handleDoubleTap = (postId: string) => {
    setDoubleTapHeart(prev => ({ ...prev, [postId]: true }));
    onToggleLikePost(postId);
    setTimeout(() => {
      setDoubleTapHeart(prev => ({ ...prev, [postId]: false }));
    }, 800);
  };

  const handleCopyLink = (postId: string) => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedId(postId);
    setTimeout(() => setCopiedId(null), 2000);
    setActiveMenuPostId(null);
  };

  return (
    <div className="min-h-screen bg-[#0b1017] text-slate-100 pb-28 max-w-lg mx-auto md:max-w-xl font-sans">
      {/* 1. Top Header */}
      <header className="sticky top-0 z-40 bg-[#0b1017]/95 backdrop-blur-xl px-4 py-3 flex items-center justify-between border-b border-white/10">
        <button 
          onClick={onCreatePostOrStory}
          className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-200 hover:text-white transition-colors"
          title="নতুন পোস্ট"
        >
          <Plus className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <img 
            src="/app_icon.png" 
            alt="BINISTA" 
            className="w-8 h-8 rounded-xl object-cover ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-500/20" 
          />
          <h1 className="font-black text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-emerald-400">
            BINISTA
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={onOpenMessages}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-200 hover:text-white transition-colors relative"
            title="মেসেজ"
          >
            <Send className="w-4.5 h-4.5 -rotate-12" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500" />
          </button>
        </div>
      </header>

      {/* 2. Story Preview Cards Tray */}
      <InstagramStoriesTray
        stories={stories}
        currentUserPhoto={currentUserPhoto}
        onOpenStory={onOpenStory}
        onCreateStory={onCreatePostOrStory}
      />

      {/* 3. Bespoke Stream Cards */}
      <div className="p-3 space-y-4">
        {posts.length === 0 ? (
          <div className="py-20 px-6 text-center bg-[#121b26]/50 border border-white/5 rounded-3xl space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <Plus className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">ফিডে কোনো পোস্ট নেই</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                আপনার প্রথম ছবি, পোস্ট বা ভিডিও শেয়ার করে ফিড শুরু করুন।
              </p>
            </div>
            <button
              onClick={onCreatePostOrStory}
              className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-lg transition-all active:scale-95 inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>প্রথম পোস্ট তৈরি করুন</span>
            </button>
          </div>
        ) : (
          posts.map(post => {
          const currentIdx = carouselIndexes[post.id] || 0;
          const mediaCount = post.mediaUrls?.length || 1;
          const currentMedia = post.mediaUrls?.[currentIdx] || post.mediaUrls?.[0] || "";
          const isCaptionExpanded = expandedCaptions[post.id] || false;
          const isOwner = post.authorId === currentUserId || post.authorId === "current_user";

          return (
            <article 
              key={post.id} 
              className="bg-[#121b26] border border-white/10 rounded-3xl p-3.5 space-y-3 shadow-md relative"
            >
              {/* Author Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl overflow-hidden bg-[#1e293b] ring-1 ring-white/10">
                    <img 
                      src={post.authorPhotoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"} 
                      alt={post.authorUsername} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="leading-tight">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-white">{post.authorUsername}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    </div>
                    {post.musicTitle ? (
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                        <Music className="w-3 h-3 text-emerald-400" />
                        <span className="truncate max-w-[200px]">{post.musicTitle}</span>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 mt-0.5">{post.location || "ঢাকা, বাংলাদেশ"}</p>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <button 
                    onClick={() => setActiveMenuPostId(activeMenuPostId === post.id ? null : post.id)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>

                  {/* Options Menu Popover */}
                  {activeMenuPostId === post.id && (
                    <div className="absolute right-0 top-8 z-30 w-44 bg-[#182332] border border-white/10 rounded-2xl shadow-2xl p-1.5 space-y-1">
                      <button
                        onClick={() => handleCopyLink(post.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-200 hover:bg-white/5 rounded-xl transition-colors"
                      >
                        {copiedId === post.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                        <span>{copiedId === post.id ? "কপি হয়েছে" : "লিংক কপি করুন"}</span>
                      </button>

                      <button
                        onClick={() => {
                          onSharePost(post);
                          setActiveMenuPostId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-200 hover:bg-white/5 rounded-xl transition-colors"
                      >
                        <Share2 className="w-4 h-4 text-slate-400" />
                        <span>শেয়ার করুন</span>
                      </button>

                      {isOwner && onDeletePost && (
                        <button
                          onClick={() => {
                            setActiveMenuPostId(null);
                            if (window.confirm("আপনি কি নিশ্চিত যে এই পোস্টটি স্থায়ীভাবে মুছে ফেলতে চান?")) {
                              onDeletePost(post.id);
                            }
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors border-t border-white/5"
                        >
                          <Trash2 className="w-4 h-4 text-rose-400" />
                          <span>পোস্ট মুছুন</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Visual Media Container with Double Tap Heart */}
              <div 
                onDoubleClick={() => handleDoubleTap(post.id)}
                className="relative w-full aspect-[4/3] rounded-2xl bg-[#080d14] overflow-hidden select-none"
              >
                {isVideoUrl(currentMedia) ? (
                  <video 
                    src={currentMedia} 
                    autoPlay 
                    loop 
                    playsInline 
                    muted={isMuted} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <img 
                    src={currentMedia} 
                    alt="Post" 
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Carousel Indicator */}
                {mediaCount > 1 && (
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-semibold text-white">
                    {currentIdx + 1}/{mediaCount}
                  </div>
                )}

                {/* Carousel Navigation */}
                {mediaCount > 1 && currentIdx > 0 && (
                  <button 
                    onClick={() => handlePrevMedia(post.id)}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}
                {mediaCount > 1 && currentIdx < mediaCount - 1 && (
                  <button 
                    onClick={() => handleNextMedia(post.id, mediaCount)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}

                {/* Sound Control for Video and Music */}
                {(isVideoUrl(currentMedia) || post.musicTitle) && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMuted(!isMuted);
                    }}
                    className="absolute bottom-3 right-3 px-2.5 py-1.5 bg-black/70 backdrop-blur-md rounded-full flex items-center gap-1.5 text-white shadow-lg hover:bg-black/90 transition-all z-20"
                    title={isMuted ? "সাউন্ড অন করুন" : "সাউন্ড বন্ধ করুন"}
                  >
                    {isMuted ? (
                      <>
                        <VolumeX className="w-4 h-4 text-rose-400" />
                        <span className="text-[10px] font-bold text-slate-200">মিউট</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                        <span className="text-[10px] font-bold text-emerald-400">সাউন্ড অন</span>
                      </>
                    )}
                  </button>
                )}

                {/* Double Tap Heart */}
                <AnimatePresence>
                  {doubleTapHeart[post.id] && (
                    <motion.div 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1.2, opacity: 1 }}
                      exit={{ scale: 1.5, opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                      <Heart className="w-20 h-20 fill-rose-500 text-rose-500" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  {/* Like Button */}
                  <button 
                    onClick={() => onToggleLikePost(post.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                      post.isLiked 
                        ? 'bg-rose-500/15 text-rose-400 font-bold' 
                        : 'bg-white/5 hover:bg-white/10 text-slate-200'
                    }`}
                  >
                    <Heart className={`w-4.5 h-4.5 ${post.isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span className="text-xs font-semibold">
                      {post.likesCount ? post.likesCount.toLocaleString("bn-BD") : 0}
                    </span>
                  </button>

                  {/* Comment Button */}
                  <button 
                    onClick={() => onOpenComments(post.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 transition-colors"
                  >
                    <MessageSquare className="w-4.5 h-4.5" />
                    <span className="text-xs font-semibold">{post.commentsCount || 0}</span>
                  </button>

                  {/* Share Button */}
                  <button 
                    onClick={() => onSharePost(post)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 transition-colors"
                    title="শেয়ার করুন"
                  >
                    <Share2 className="w-4.5 h-4.5" />
                  </button>
                </div>

                {/* Bookmark Button */}
                <button 
                  onClick={() => onToggleBookmarkPost(post.id)}
                  className={`p-2 rounded-xl transition-colors ${
                    post.isBookmarked ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 hover:bg-white/10 text-slate-200'
                  }`}
                  title="সেভ করুন"
                >
                  <Bookmark className={`w-4.5 h-4.5 ${post.isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
                </button>
              </div>

              {/* Caption Section */}
              <div className="text-xs text-slate-200 leading-relaxed pt-0.5">
                <span className="font-bold text-white mr-1.5">{post.authorUsername}</span>
                {isCaptionExpanded ? (
                  <span>{post.caption}</span>
                ) : (
                  <span>
                    {post.caption?.length > 90 ? `${post.caption.slice(0, 90)}... ` : post.caption}
                    {post.caption?.length > 90 && (
                      <button 
                        onClick={() => setExpandedCaptions(prev => ({ ...prev, [post.id]: true }))}
                        className="text-emerald-400 font-semibold hover:underline"
                      >
                        আরও দেখুন
                      </button>
                    )}
                  </span>
                )}
              </div>

              {/* Timestamp and Comment Launcher */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>{new Date(post.createdAt).toLocaleDateString("bn-BD", { month: "short", day: "numeric" })}</span>
                <button 
                  onClick={() => onOpenComments(post.id)}
                  className="hover:text-emerald-400 transition-colors"
                >
                  {post.commentsCount ? `সবগুলো (${post.commentsCount}) কমেন্ট দেখুন` : "প্রথম কমেন্ট করুন"}
                </button>
              </div>
            </article>
          );
        }))}
      </div>
    </div>
  );
};
