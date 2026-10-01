import React, { useState, useRef } from "react";
import { 
  Plus, ChevronDown, Menu, ExternalLink, 
  Grid, Film, UserCheck, Bot, Sparkles, 
  Share2, Edit3, Heart, Eye, Bookmark, Layers, LayoutGrid, 
  Trash2, Camera, Upload, CheckCircle2, ShieldCheck, 
  Crown, MapPin, Globe, QrCode, Copy, Check, Users, MessageSquare
} from "lucide-react";
import { InstagramPost, InstagramReel, InstagramHighlight } from "../../types/instagram";
import { uploadImageFile } from "../../lib/uploadService";

interface InstagramProfileProps {
  displayName?: string;
  username?: string;
  bio?: string;
  website?: string;
  photoURL?: string;
  coverPhotoURL?: string;
  category?: string;
  badgeTitle?: string;
  location?: string;
  followersCount?: number;
  followingCount?: number;
  posts?: InstagramPost[];
  reels?: InstagramReel[];
  highlights?: InstagramHighlight[];
  onOpenCreate: () => void;
  onOpenAiAgentModal: () => void;
  onEditProfile: () => void;
  onQuickUploadAvatar?: (newPhotoUrl: string) => void;
  onDeletePost?: (postId: string) => void;
  onDeleteReel?: (reelId: string) => void;
}

const DEFAULT_HIGHLIGHTS: InstagramHighlight[] = [
  { id: "h1", title: "🌟 হাইলাইটস", coverUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&auto=format&fit=crop&q=80", storiesCount: 4 },
  { id: "h2", title: "🎬 মেমোরিজ", coverUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=200&auto=format&fit=crop&q=80", storiesCount: 6 },
  { id: "h3", title: "✈️ লাইফস্টাইল", coverUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&auto=format&fit=crop&q=80", storiesCount: 3 },
  { id: "h4", title: "🛍️ স্পেশাল", coverUrl: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=200&auto=format&fit=crop&q=80", storiesCount: 8 }
];

export const InstagramProfile: React.FC<InstagramProfileProps> = ({
  displayName = "ব্যবহারকারী",
  username = "user",
  bio = "স্বাগতম আমার প্রোফাইলে ✨ নতুন কিছু তৈরি করছি প্রতিদিন!",
  website = "",
  photoURL,
  coverPhotoURL,
  category = "🎨 ডিজিটাল কনটেন্ট ক্রিয়েটর",
  badgeTitle = "👑 গোল্ড ভিআইপি মেম্বার",
  location = "ঢাকা, বাংলাদেশ",
  followersCount = 0,
  followingCount = 0,
  posts = [],
  reels = [],
  highlights = DEFAULT_HIGHLIGHTS,
  onOpenCreate,
  onOpenAiAgentModal,
  onEditProfile,
  onQuickUploadAvatar,
  onDeletePost,
  onDeleteReel
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'reels' | 'saved'>('grid');
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const avatarFileRef = useRef<HTMLInputElement>(null);

  const displayPosts = posts || [];
  const displayReels = reels || [];
  const savedPosts = displayPosts.filter(p => p.isBookmarked);

  // Calculate live stats
  const totalPostsCount = displayPosts.length;
  const totalReelsCount = displayReels.length;
  const totalLikesCount = displayPosts.reduce((acc, p) => acc + (p.likesCount || 0), 0) +
                          displayReels.reduce((acc, r) => acc + (r.likesCount || 0), 0);

  // Quick avatar upload handler directly from profile
  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const publicUrl = await uploadImageFile(file);
      if (publicUrl && onQuickUploadAvatar) {
        onQuickUploadAvatar(publicUrl);
      }
    } catch (err) {
      console.error("Direct avatar upload failed:", err);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleCopyProfileLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#090d14] text-slate-100 pb-28 max-w-lg mx-auto md:max-w-xl font-sans">
      
      {/* Hidden File Input for Avatar */}
      <input 
        ref={avatarFileRef}
        type="file" 
        accept="image/*" 
        className="hidden" 
        onChange={handleAvatarFileSelect} 
      />

      {/* 1. Header Bar with Verified Username & Controls */}
      <header className="sticky top-0 z-40 bg-[#090d14]/95 backdrop-blur-2xl px-4 py-3 flex items-center justify-between border-b border-white/10 shadow-lg">
        <div className="flex items-center gap-1.5">
          <span className="font-black text-base text-white tracking-tight">@{username}</span>
          <span className="w-4 h-4 rounded-full bg-emerald-500 text-black flex items-center justify-center text-[10px] font-black" title="ভেরিফাইড প্রোফাইল">
            ✓
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* AI Agent Quick Launcher */}
          <button 
            onClick={onOpenAiAgentModal}
            className="px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
            title="ব্যক্তিগত AI সহকারী"
          >
            <Bot className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI এজেন্ট</span>
          </button>

          {/* Share Profile Card */}
          <button 
            onClick={() => setIsShareModalOpen(true)}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-200 hover:text-white transition-all active:scale-90 cursor-pointer"
            title="প্রোফাইল শেয়ার ও QR"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Edit Profile */}
          <button 
            onClick={onEditProfile} 
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-200 hover:text-white transition-all active:scale-90 cursor-pointer"
            title="প্রোফাইল সেটিংস ও এডিট"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. Hero Cover Banner & Avatar Container */}
      <div className="relative px-3 pt-3">
        {/* Cover Header Graphic */}
        <div className="h-32 rounded-3xl overflow-hidden relative border border-white/10 shadow-xl bg-slate-900">
          {coverPhotoURL ? (
            <img src={coverPhotoURL} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-[#052b1b] via-[#094127] to-[#041d13] relative">
              <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#10b981_1.5px,transparent_1.5px)] [background-size:20px_20px]" />
              <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-emerald-500/20 blur-2xl" />
            </div>
          )}

          {/* Cover Floating Badge */}
          <div className="absolute top-2.5 right-3 flex items-center gap-1.5">
            <span className="text-[10px] font-black bg-black/60 backdrop-blur-md text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>{badgeTitle}</span>
            </span>
          </div>
        </div>

        {/* Floating User Card & Avatar Bar */}
        <div className="relative -mt-10 bg-[#121926]/95 backdrop-blur-xl border border-white/10 rounded-3xl p-4 shadow-2xl">
          <div className="flex items-start justify-between">
            {/* Avatar with Direct Gallery Upload Trigger */}
            <div className="relative -mt-12 group">
              <div className="w-22 h-22 rounded-3xl overflow-hidden ring-4 ring-[#121926] bg-[#1a2333] shadow-2xl flex items-center justify-center relative">
                {photoURL ? (
                  <img 
                    src={photoURL} 
                    alt={displayName} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-800 to-slate-900 flex items-center justify-center text-emerald-200">
                    <span className="text-2xl font-black">{displayName.charAt(0) || "U"}</span>
                  </div>
                )}

                {isUploadingPhoto && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-emerald-400 text-[9px] font-black">
                    আপলোড...
                  </div>
                )}
              </div>

              {/* Direct Gallery Camera Button */}
              <button 
                type="button"
                onClick={() => avatarFileRef.current?.click()}
                className="absolute bottom-0 right-0 w-7 h-7 bg-gradient-to-r from-emerald-500 to-teal-400 text-black rounded-xl flex items-center justify-center font-bold text-xs ring-2 ring-[#121926] shadow-lg active:scale-90 transition-transform cursor-pointer"
                title="গ্যালারি থেকে প্রোফাইল ছবি পরিবর্তন করুন"
              >
                <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>

            {/* Quick Action Pills */}
            <div className="flex items-center gap-2 pt-1">
              <button 
                onClick={onEditProfile}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black text-xs font-black rounded-2xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>প্রোফাইল সাজান</span>
              </button>
              
              <button 
                onClick={onOpenCreate}
                className="p-2 bg-white/10 hover:bg-white/15 text-white rounded-2xl transition-all active:scale-95 cursor-pointer"
                title="নতুন পোস্ট বা রিলস তৈরি করুন"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* User Name & Categorization */}
          <div className="mt-3.5 space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-white tracking-tight leading-tight">
                {displayName}
              </h1>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>

            <div className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              <span>{category}</span>
            </div>

            {/* Rich Bio */}
            <p className="text-xs text-slate-300 leading-relaxed pt-1 whitespace-pre-line font-medium">
              {bio}
            </p>

            {/* Website & Location Tags */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-slate-400">
              {location && (
                <div className="flex items-center gap-1 text-slate-400">
                  <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>{location}</span>
                </div>
              )}
              {website && (
                <a 
                  href={website.startsWith("http") ? website : `https://${website}`}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold truncate max-w-[200px]"
                >
                  <Globe className="w-3 h-3 shrink-0" />
                  <span className="truncate">{website.replace(/^https?:\/\//, '')}</span>
                  <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                </a>
              )}
            </div>
          </div>

          {/* 3. Live Stats Bar */}
          <div className="mt-4 pt-3.5 border-t border-white/5 grid grid-cols-4 gap-1 text-center bg-[#0d131e]/80 rounded-2xl p-2.5 border border-white/5">
            <div>
              <div className="text-sm font-black text-white">{totalPostsCount}</div>
              <div className="text-[10px] font-semibold text-slate-400">পোস্ট</div>
            </div>
            <div>
              <div className="text-sm font-black text-white">{totalReelsCount}</div>
              <div className="text-[10px] font-semibold text-slate-400">রিলস</div>
            </div>
            <div>
              <div className="text-sm font-black text-white">{followersCount > 0 ? followersCount : "০"}</div>
              <div className="text-[10px] font-semibold text-slate-400">ফলোয়ার্স</div>
            </div>
            <div>
              <div className="text-sm font-black text-emerald-400">{totalLikesCount > 0 ? totalLikesCount : "০"}</div>
              <div className="text-[10px] font-semibold text-slate-400">মোট লাইক</div>
            </div>
          </div>

        </div>
      </div>

      {/* 4. Story Highlights Shelf */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <span className="text-xs font-black text-slate-300 uppercase tracking-wider">
            স্টোরি হাইলাইটস
          </span>
          <button 
            onClick={onOpenCreate}
            className="text-[10px] font-bold text-emerald-400 hover:underline flex items-center gap-0.5"
          >
            <span>+ নতুন</span>
          </button>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
          {/* Add New Highlight Button */}
          <button
            onClick={onOpenCreate}
            className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-emerald-500/40 bg-emerald-500/5 group-hover:bg-emerald-500/10 flex items-center justify-center text-emerald-400 transition-all active:scale-95 shadow-xs">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-bold text-slate-400">নতুন</span>
          </button>

          {/* Existing Highlights */}
          {highlights.map((hl) => (
            <div 
              key={hl.id} 
              className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
            >
              <div className="w-14 h-14 rounded-2xl overflow-hidden p-0.5 bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-md group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-2xl overflow-hidden bg-slate-800">
                  <img src={hl.coverUrl} alt={hl.title} className="w-full h-full object-cover" />
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-300 truncate max-w-[64px] text-center">
                {hl.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Content Display Mode Tabs */}
      <div className="mt-3 border-t border-b border-white/10 bg-[#0d131e] sticky top-[53px] z-30 flex items-center">
        <button
          onClick={() => setViewMode('grid')}
          className={`flex-1 py-3 flex items-center justify-center gap-1.5 text-xs font-black transition-all cursor-pointer ${
            viewMode === 'grid' 
              ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-500/5' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>পোস্ট গ্রিড ({displayPosts.length})</span>
        </button>

        <button
          onClick={() => setViewMode('reels')}
          className={`flex-1 py-3 flex items-center justify-center gap-1.5 text-xs font-black transition-all cursor-pointer ${
            viewMode === 'reels' 
              ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-500/5' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>রিলস ও ক্লিপস ({displayReels.length})</span>
        </button>

        <button
          onClick={() => setViewMode('saved')}
          className={`flex-1 py-3 flex items-center justify-center gap-1.5 text-xs font-black transition-all cursor-pointer ${
            viewMode === 'saved' 
              ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-500/5' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>সংরক্ষিত ({savedPosts.length})</span>
        </button>
      </div>

      {/* 6. Content Grid Body */}
      <div className="p-1">
        {/* POSTS GRID */}
        {viewMode === 'grid' && (
          <div>
            {displayPosts.length === 0 ? (
              <div className="py-16 px-4 text-center space-y-3">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto shadow-inner">
                  <Grid className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-sm text-white">এখনো কোনো পোস্ট নেই</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  আপনার প্রিয় মুহূর্তের ছবি বা ভিডিও পোস্ট করে আপনার ফিড সাজিয়ে তুলুন।
                </p>
                <button
                  onClick={onOpenCreate}
                  className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs shadow-lg transition-all active:scale-95 cursor-pointer"
                >
                  + প্রথম পোস্ট করুন
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1">
                {displayPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    className="relative aspect-square bg-[#151c28] overflow-hidden group cursor-pointer rounded-lg"
                  >
                    {post.mediaType === 'video' ? (
                      <video 
                        src={post.mediaUrls[0]} 
                        className="w-full h-full object-cover" 
                        preload="metadata" 
                        muted 
                        playsInline 
                      />
                    ) : (
                      <img 
                        src={post.mediaUrls[0]} 
                        alt="" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        loading="lazy" 
                      />
                    )}

                    {/* Indicators */}
                    {post.mediaType === 'video' && (
                      <div className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-xs p-1 rounded-md text-white">
                        <Film className="w-3 h-3" />
                      </div>
                    )}
                    {post.mediaUrls.length > 1 && (
                      <div className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-xs p-1 rounded-md text-white">
                        <Layers className="w-3 h-3" />
                      </div>
                    )}

                    {/* Hover Stats Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 text-white text-xs font-bold">
                      <div className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 fill-white" />
                        <span>{post.likesCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{post.commentsCount || 0}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* REELS GRID */}
        {viewMode === 'reels' && (
          <div>
            {displayReels.length === 0 ? (
              <div className="py-16 px-4 text-center space-y-3">
                <div className="w-16 h-16 rounded-3xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mx-auto shadow-inner">
                  <Film className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-sm text-white">কোনো রিলস ভিডিও নেই</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  শর্ট ভিডিও আপলোড করে ক্রিয়েটর হিসেবে জনপ্রিয়তা অর্জন করুন।
                </p>
                <button
                  onClick={onOpenCreate}
                  className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs shadow-lg transition-all active:scale-95 cursor-pointer"
                >
                  + নতুন রিলস আপলোড
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1">
                {displayReels.map((reel) => (
                  <div
                    key={reel.id}
                    className="relative aspect-[9/16] bg-[#151c28] overflow-hidden group cursor-pointer rounded-lg"
                  >
                    <video 
                      src={reel.videoUrl} 
                      className="w-full h-full object-cover" 
                      preload="metadata" 
                      muted 
                      playsInline 
                    />
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 text-[10px] font-black text-white bg-black/60 px-1.5 py-0.5 rounded-md backdrop-blur-xs">
                      <Eye className="w-2.5 h-2.5" />
                      <span>{reel.viewsCount || reel.likesCount || 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SAVED POSTS */}
        {viewMode === 'saved' && (
          <div>
            {savedPosts.length === 0 ? (
              <div className="py-16 px-4 text-center space-y-3">
                <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto shadow-inner">
                  <Bookmark className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-sm text-white">কোনো সংরক্ষিত পোস্ট নেই</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  যেকোনো পোস্টের বুকমার্ক আইকনে চাপ দিয়ে আপনার পছন্দের পোস্ট এখানে সেভ করে রাখতে পারেন।
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1">
                {savedPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    className="relative aspect-square bg-[#151c28] overflow-hidden group cursor-pointer rounded-lg"
                  >
                    <img 
                      src={post.mediaUrls[0]} 
                      alt="" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 7. Fullscreen Post Preview Drawer */}
      {selectedPost && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex flex-col justify-end max-w-lg mx-auto md:max-w-xl animate-fadeIn">
          <div className="bg-[#121926] border-t border-white/10 rounded-t-3xl max-h-[85vh] flex flex-col overflow-hidden text-slate-100 shadow-2xl">
            {/* Header */}
            <div className="p-3.5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-800">
                  <img src={selectedPost.authorPhotoURL || photoURL} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white">{selectedPost.authorName}</h4>
                  <p className="text-[10px] text-slate-400">@{selectedPost.authorUsername}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {onDeletePost && (
                  <button
                    onClick={() => {
                      if (confirm("এই পোস্টটি মুছে ফেলতে চান?")) {
                        onDeletePost(selectedPost.id);
                        setSelectedPost(null);
                      }
                    }}
                    className="text-xs font-bold text-rose-400 hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-500/10"
                    title="পোস্ট মুছুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button 
                  onClick={() => setSelectedPost(null)}
                  className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Media */}
            <div className="bg-black aspect-square flex items-center justify-center overflow-hidden">
              {selectedPost.mediaType === 'video' ? (
                <video 
                  src={selectedPost.mediaUrls[0]} 
                  controls 
                  autoPlay 
                  className="w-full h-full object-contain" 
                />
              ) : (
                <img 
                  src={selectedPost.mediaUrls[0]} 
                  alt="" 
                  className="w-full h-full object-contain" 
                />
              )}
            </div>

            {/* Caption & Stats */}
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>❤️ {selectedPost.likesCount || 0} টি লাইক</span>
                <span>💬 {selectedPost.commentsCount || 0} টি কমেন্ট</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                <strong className="text-white mr-1.5">{selectedPost.authorUsername}</strong>
                {selectedPost.caption}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 8. Share Profile & QR Code Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-[220] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#121926] border border-emerald-500/30 rounded-3xl p-5 w-full max-w-sm text-center space-y-4 shadow-2xl relative">
            <button 
              onClick={() => setIsShareModalOpen(false)}
              className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white active:scale-90"
            >
              ✕
            </button>

            {/* Card Preview */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950 via-slate-900 to-[#0a2318] border border-emerald-500/30 text-white space-y-3 shadow-xl">
              <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-emerald-400 mx-auto shadow-2xl bg-slate-800">
                <img src={photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"} alt="" className="w-full h-full object-cover" />
              </div>

              <div>
                <h3 className="font-black text-base text-white">{displayName}</h3>
                <p className="text-xs text-emerald-400 font-bold">@{username}</p>
                <p className="text-[10px] text-slate-300 mt-1">{badgeTitle}</p>
              </div>

              <div className="bg-white p-3 rounded-xl inline-block shadow-lg">
                <QrCode className="w-24 h-24 text-black" />
              </div>
              <p className="text-[10px] text-slate-400">স্ক্যান করে সরাসরি প্রোফাইল দেখুন</p>
            </div>

            {/* Copy Link Button */}
            <button
              onClick={handleCopyProfileLink}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-black text-xs shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform cursor-pointer"
            >
              {copiedLink ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? "লিংক কপি হয়েছে!" : "প্রোফাইল লিংক কপি করুন"}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
