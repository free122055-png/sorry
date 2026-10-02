import React, { useState, useRef } from "react";
import { 
  Plus, ChevronDown, Menu, ExternalLink, 
  Grid, Film, UserCheck, Bot, Sparkles, 
  Share2, Edit3, Heart, Eye, Bookmark, Layers, LayoutGrid, 
  Trash2, Camera, Upload, CheckCircle2, ShieldCheck, 
  Crown, MapPin, Globe, QrCode, Copy, Check, Users, MessageSquare,
  Home, User, UserPlus, Video, Bell, UserGroup, Radio, Settings,
  Shield, HelpCircle, LogOut, Search, MessageCircle, Volume2,
  VolumeX, Moon, Sun, Lock, Key, AlertCircle, RefreshCw, Send
} from "lucide-react";
import { InstagramPost, InstagramReel, InstagramHighlight } from "../../types/instagram";
import { uploadImageFile } from "../../lib/uploadService";
import { InstagramTab } from "./InstagramBottomNav";

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
  allUsers?: any[];
  onOpenCreate: () => void;
  onOpenAiAgentModal: () => void;
  onEditProfile: () => void;
  onQuickUploadAvatar?: (newPhotoUrl: string) => void;
  onDeletePost?: (postId: string) => void;
  onDeleteReel?: (reelId: string) => void;
  onNavigateTab?: (tab: InstagramTab) => void;
  onOpenDirectChat?: (userId: string, userName?: string) => void;
  onLogout?: () => void;
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
  allUsers = [],
  onOpenCreate,
  onOpenAiAgentModal,
  onEditProfile,
  onQuickUploadAvatar,
  onDeletePost,
  onDeleteReel,
  onNavigateTab,
  onOpenDirectChat,
  onLogout
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'reels' | 'saved'>('grid');
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Top Drawer Menu State
  const [isTopMenuOpen, setIsTopMenuOpen] = useState(false);

  // Sub-Modals for 100% Active Menu Items
  const [activeMenuModal, setActiveMenuModal] = useState<
    'friends' | 'notifications' | 'groups' | 'online_friends' | 'settings' | 'privacy' | 'help' | 'logout' | null
  >(null);

  // Friends & Followers tab
  const [friendsSearch, setFriendsSearch] = useState("");
  const [followingState, setFollowingState] = useState<Record<string, boolean>>({
    "u1": true,
    "u2": true,
    "u3": false,
    "u4": true,
    "u5": false
  });

  // Settings states
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoPlayVideos, setAutoPlayVideos] = useState(true);
  const [dataSaver, setDataSaver] = useState(false);
  const [isPrivateAccount, setIsPrivateAccount] = useState(false);
  const [hideOnlineStatus, setHideOnlineStatus] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [clearedCache, setClearedCache] = useState(false);

  // Groups state
  const [joinedGroups, setJoinedGroups] = useState<Record<string, boolean>>({
    "g1": true,
    "g2": true,
    "g3": false,
    "g4": true
  });

  // Notifications state
  const [notifications, setNotifications] = useState([
    { id: "n1", title: "নতুন লাইক ❤️", desc: "rajibul_islam আপনার পোস্টে লাইক দিয়েছেন", time: "৫ মিনিট আগে", unread: true },
    { id: "n2", title: "নতুন কমেন্ট 💬", desc: "shafiqul_hasan কমেন্ট করেছেন: মাশাল্লাহ অসাধারণ!", time: "১৫ মিনিট আগে", unread: true },
    { id: "n3", title: "নতুন অনুসরণ 👥", desc: "nurul_amin আপনাকে অনুসরণ করা শুরু করেছেন", time: "১ ঘণ্টা আগে", unread: false },
    { id: "n4", title: "কমিউনিটি নোটিশ 📢", desc: "BINISTA ৩.০ আপডেটে যুক্ত হয়েছে লাইভ ভয়েস কলিং!", time: "২ ঘণ্টা আগে", unread: false }
  ]);

  const avatarFileRef = useRef<HTMLInputElement>(null);

  const displayPosts = posts || [];
  const displayReels = reels || [];
  const savedPosts = displayPosts.filter(p => p.isBookmarked);

  // Calculate live stats
  const totalPostsCount = displayPosts.length;
  const totalReelsCount = displayReels.length;
  const totalLikesCount = displayPosts.reduce((acc, p) => acc + (p.likesCount || 0), 0) +
                          displayReels.reduce((acc, r) => acc + (r.likesCount || 0), 0);

  // Avatar upload
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

  // Online Friends Mock / Active Data
  const sampleOnlineFriends = [
    { id: "u1", name: "রাজিবুল ইসলাম", username: "rajibul_islam", photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", status: "সক্রিয় এখন" },
    { id: "u2", name: "শফিকুল হাসান", username: "shafiqul_hasan", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", status: "সক্রিয় এখন" },
    { id: "u3", name: "নুরুল আমিন", username: "nurul_amin", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", status: "৫ মিনিট আগে" },
    { id: "u4", name: "তানভীর আহমেদ", username: "tanvir_ahmed", photo: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150", status: "সক্রিয় এখন" }
  ];

  // Community Groups Data
  const communityGroups = [
    { id: "g1", name: "🌙 ইসলামিক দাওয়াহ ও তিলাওয়াত", members: "১,৪৫০ জন সদস্য", desc: "প্রতিদিনের কুরআনিক আলোচনা ও তিলাওয়াত শেয়ারিং" },
    { id: "g2", name: "💻 টেক ও ক্রিয়েটর হাব", members: "৯৮০ জন সদস্য", desc: "ডিজিটাল স্কিলস, কোডিং এবং কন্টেন্ট ক্রিয়েশন" },
    { id: "g3", name: "🎨 গ্রাফিক্স ও ফটো এডিটিং আসর", members: "৭২০ জন সদস্য", desc: "পিক্সেল এডিটিং টুলস ও ডিজাইন শেয়ারিং" },
    { id: "g4", name: "💬 ফ্রেন্ডস আড্ডা জোন", members: "২,১০০ জন সদস্য", desc: "বিনোদনের রিয়েল-টাইম আড্ডা ও ফ্রেন্ড কমিউনিটি" }
  ];

  const handleMenuItemClick = (key: string) => {
    setIsTopMenuOpen(false);

    switch (key) {
      case 'home':
        if (onNavigateTab) onNavigateTab('feed');
        break;
      case 'profile':
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      case 'friends':
        setActiveMenuModal('friends');
        break;
      case 'reels':
        if (onNavigateTab) onNavigateTab('reels');
        break;
      case 'notifications':
        setActiveMenuModal('notifications');
        break;
      case 'saved':
        setViewMode('saved');
        window.scrollTo({ top: 350, behavior: 'smooth' });
        break;
      case 'groups':
        setActiveMenuModal('groups');
        break;
      case 'online':
        setActiveMenuModal('online_friends');
        break;
      case 'settings':
        setActiveMenuModal('settings');
        break;
      case 'privacy':
        setActiveMenuModal('privacy');
        break;
      case 'help':
        setActiveMenuModal('help');
        break;
      case 'logout':
        setActiveMenuModal('logout');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-[#090d14] text-slate-100 pb-28 max-w-lg mx-auto md:max-w-xl font-sans relative">
      
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

          {/* 🌟 100% Functional Profile Menu Toggle Button */}
          <button 
            onClick={() => setIsTopMenuOpen(true)}
            className="w-8 h-8 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400 hover:text-emerald-300 transition-all active:scale-90 cursor-pointer shadow-md shadow-emerald-500/20"
            title="মেনু"
          >
            <Menu className="w-4.5 h-4.5" />
          </button>
        </div>
      </header>

      {/* 2. Slide-Over Profile Top Menu Drawer */}
      {isTopMenuOpen && (
        <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex justify-end animate-fadeIn">
          <div 
            className="w-[85%] max-w-xs bg-[#0e141f] border-l border-white/10 h-full flex flex-col justify-between p-4 shadow-2xl overflow-y-auto animate-slideInRight"
          >
            <div className="space-y-4">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <img 
                    src="/app_icon.png" 
                    alt="BINISTA" 
                    className="w-8 h-8 rounded-xl object-cover ring-2 ring-emerald-500/40" 
                  />
                  <div>
                    <h3 className="font-black text-sm text-white leading-none">BINISTA মেনু</h3>
                    <p className="text-[10px] text-emerald-400 font-bold mt-0.5">@{username}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsTopMenuOpen(false)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white active:scale-90"
                >
                  ✕
                </button>
              </div>

              {/* 12 Menu Items List */}
              <div className="space-y-1">
                {/* 1. হোম */}
                <button
                  onClick={() => handleMenuItemClick('home')}
                  className="w-full px-3 py-2.5 rounded-xl flex items-center gap-3 text-slate-200 hover:bg-white/5 active:bg-emerald-500/10 hover:text-emerald-400 transition-colors text-left font-bold text-xs cursor-pointer group"
                >
                  <span className="text-base">🏠</span>
                  <span className="flex-1">হোম</span>
                  <span className="text-[10px] text-slate-500 group-hover:text-emerald-400">ফিড</span>
                </button>

                {/* 2. আমার প্রোফাইল */}
                <button
                  onClick={() => handleMenuItemClick('profile')}
                  className="w-full px-3 py-2.5 rounded-xl flex items-center gap-3 text-slate-200 hover:bg-white/5 active:bg-emerald-500/10 hover:text-emerald-400 transition-colors text-left font-bold text-xs cursor-pointer group"
                >
                  <span className="text-base">👤</span>
                  <span className="flex-1">আমার প্রোফাইল</span>
                  <span className="text-[10px] text-slate-500 group-hover:text-emerald-400">এডিট</span>
                </button>

                {/* 3. বন্ধু / অনুসরণ */}
                <button
                  onClick={() => handleMenuItemClick('friends')}
                  className="w-full px-3 py-2.5 rounded-xl flex items-center gap-3 text-slate-200 hover:bg-white/5 active:bg-emerald-500/10 hover:text-emerald-400 transition-colors text-left font-bold text-xs cursor-pointer group"
                >
                  <span className="text-base">👥</span>
                  <span className="flex-1">বন্ধু / অনুসরণ</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                    {followersCount + 5}
                  </span>
                </button>

                {/* 4. রিলস / ক্লিপস */}
                <button
                  onClick={() => handleMenuItemClick('reels')}
                  className="w-full px-3 py-2.5 rounded-xl flex items-center gap-3 text-slate-200 hover:bg-white/5 active:bg-emerald-500/10 hover:text-emerald-400 transition-colors text-left font-bold text-xs cursor-pointer group"
                >
                  <span className="text-base">🎬</span>
                  <span className="flex-1">রিলস / ক্লিপস</span>
                  <span className="text-[10px] text-purple-400 font-bold">ভিডিও</span>
                </button>

                {/* 5. নোটিফিকেশন */}
                <button
                  onClick={() => handleMenuItemClick('notifications')}
                  className="w-full px-3 py-2.5 rounded-xl flex items-center gap-3 text-slate-200 hover:bg-white/5 active:bg-emerald-500/10 hover:text-emerald-400 transition-colors text-left font-bold text-xs cursor-pointer group"
                >
                  <span className="text-base">🔔</span>
                  <span className="flex-1">নোটিফিকেশন</span>
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                </button>

                {/* 6. সংরক্ষিত */}
                <button
                  onClick={() => handleMenuItemClick('saved')}
                  className="w-full px-3 py-2.5 rounded-xl flex items-center gap-3 text-slate-200 hover:bg-white/5 active:bg-emerald-500/10 hover:text-emerald-400 transition-colors text-left font-bold text-xs cursor-pointer group"
                >
                  <span className="text-base">🔖</span>
                  <span className="flex-1">সংরক্ষিত</span>
                  <span className="text-[10px] text-slate-500">{savedPosts.length} টি</span>
                </button>

                {/* 7. গ্রুপ */}
                <button
                  onClick={() => handleMenuItemClick('groups')}
                  className="w-full px-3 py-2.5 rounded-xl flex items-center gap-3 text-slate-200 hover:bg-white/5 active:bg-emerald-500/10 hover:text-emerald-400 transition-colors text-left font-bold text-xs cursor-pointer group"
                >
                  <span className="text-base">👨‍👩‍👧‍👦</span>
                  <span className="flex-1">গ্রুপ</span>
                  <span className="text-[10px] text-emerald-400 font-bold">৪টি গ্রুপ</span>
                </button>

                {/* 8. অনলাইন বন্ধু */}
                <button
                  onClick={() => handleMenuItemClick('online')}
                  className="w-full px-3 py-2.5 rounded-xl flex items-center gap-3 text-slate-200 hover:bg-white/5 active:bg-emerald-500/10 hover:text-emerald-400 transition-colors text-left font-bold text-xs cursor-pointer group"
                >
                  <span className="text-base">🟢</span>
                  <span className="flex-1">অনলাইন বন্ধু</span>
                  <span className="text-[10px] text-emerald-400 font-black">৪ জন অনলাইন</span>
                </button>

                {/* 9. সেটিংস */}
                <button
                  onClick={() => handleMenuItemClick('settings')}
                  className="w-full px-3 py-2.5 rounded-xl flex items-center gap-3 text-slate-200 hover:bg-white/5 active:bg-emerald-500/10 hover:text-emerald-400 transition-colors text-left font-bold text-xs cursor-pointer group"
                >
                  <span className="text-base">⚙️</span>
                  <span className="flex-1">সেটিংস</span>
                  <span className="text-[10px] text-slate-500">কনফিগ</span>
                </button>

                {/* 10. প্রাইভেসি ও নিরাপত্তা */}
                <button
                  onClick={() => handleMenuItemClick('privacy')}
                  className="w-full px-3 py-2.5 rounded-xl flex items-center gap-3 text-slate-200 hover:bg-white/5 active:bg-emerald-500/10 hover:text-emerald-400 transition-colors text-left font-bold text-xs cursor-pointer group"
                >
                  <span className="text-base">🛡️</span>
                  <span className="flex-1">প্রাইভেসি ও নিরাপত্তা</span>
                  <span className="text-[10px] text-emerald-400">নিরাপদ 🔒</span>
                </button>

                {/* 11. সহায়তা */}
                <button
                  onClick={() => handleMenuItemClick('help')}
                  className="w-full px-3 py-2.5 rounded-xl flex items-center gap-3 text-slate-200 hover:bg-white/5 active:bg-emerald-500/10 hover:text-emerald-400 transition-colors text-left font-bold text-xs cursor-pointer group"
                >
                  <span className="text-base">❓</span>
                  <span className="flex-1">সহায়তা</span>
                  <span className="text-[10px] text-slate-500">২৪/৭ সাপোর্ট</span>
                </button>
              </div>
            </div>

            {/* 12. লগআউট */}
            <div className="pt-4 border-t border-white/10">
              <button
                onClick={() => handleMenuItemClick('logout')}
                className="w-full py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:text-rose-300 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <span className="text-base">🚪</span>
                <span>লগআউট</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-MODAL 1: 👥 বন্ধু / অনুসরণ (Friends & Followers) */}
      {activeMenuModal === 'friends' && (
        <div className="fixed inset-0 z-[350] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#121926] border border-emerald-500/30 rounded-3xl p-5 w-full max-w-sm text-slate-100 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-lg">👥</span>
                <h3 className="font-black text-sm text-white">বন্ধু ও অনুসরণ তালিকা</h3>
              </div>
              <button 
                onClick={() => setActiveMenuModal(null)}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white"
              >
                ✕
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input 
                type="text" 
                placeholder="বন্ধু বা ইউজার সার্চ করুন..."
                value={friendsSearch}
                onChange={(e) => setFriendsSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {sampleOnlineFriends
                .filter(f => f.name.toLowerCase().includes(friendsSearch.toLowerCase()) || f.username.toLowerCase().includes(friendsSearch.toLowerCase()))
                .map(friend => {
                  const isFollowing = followingState[friend.id];
                  return (
                    <div key={friend.id} className="p-2.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <img src={friend.photo} alt={friend.name} className="w-9 h-9 rounded-full object-cover ring-1 ring-emerald-500/40" />
                        <div>
                          <h4 className="font-bold text-xs text-white">{friend.name}</h4>
                          <p className="text-[10px] text-slate-400">@{friend.username}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setFollowingState(prev => ({ ...prev, [friend.id]: !prev[friend.id] }))}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                          isFollowing 
                            ? "bg-white/10 text-slate-300 hover:bg-rose-500/20 hover:text-rose-300" 
                            : "bg-emerald-500 text-black hover:bg-emerald-400"
                        }`}
                      >
                        {isFollowing ? "অনুসরণ করছেন" : "অনুসরণ করুন"}
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-MODAL 2: 🔔 নোটিফিকেশন (Notifications) */}
      {activeMenuModal === 'notifications' && (
        <div className="fixed inset-0 z-[350] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#121926] border border-emerald-500/30 rounded-3xl p-5 w-full max-w-sm text-slate-100 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔔</span>
                <h3 className="font-black text-sm text-white">নোটিফিকেশন সেন্টার</h3>
              </div>
              <button 
                onClick={() => setActiveMenuModal(null)}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-400">সর্বশেষ আপডেট ও কার্যক্রম</span>
              <button 
                onClick={() => setNotifications(prev => prev.map(n => ({ ...n, unread: false })))}
                className="text-emerald-400 font-bold hover:underline cursor-pointer"
              >
                সব পড়া হয়েছে চিহ্নিত করুন
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {notifications.map(n => (
                <div key={n.id} className={`p-3 rounded-2xl border transition-all ${n.unread ? "bg-emerald-950/30 border-emerald-500/30" : "bg-white/5 border-white/5"}`}>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-white">{n.title}</h4>
                    <span className="text-[9px] text-slate-400">{n.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1">{n.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-MODAL 3: 👨‍👩‍👧‍👦 গ্রুপ (Groups & Communities) */}
      {activeMenuModal === 'groups' && (
        <div className="fixed inset-0 z-[350] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#121926] border border-emerald-500/30 rounded-3xl p-5 w-full max-w-sm text-slate-100 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-lg">👨‍👩‍👧‍👦</span>
                <h3 className="font-black text-sm text-white">কমিউনিটি গ্রুপ</h3>
              </div>
              <button 
                onClick={() => setActiveMenuModal(null)}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white"
              >
                ✕
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1">
              {communityGroups.map(group => {
                const isJoined = joinedGroups[group.id];
                return (
                  <div key={group.id} className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-xs text-white">{group.name}</h4>
                        <p className="text-[10px] text-emerald-400 font-bold">{group.members}</p>
                      </div>
                      <button
                        onClick={() => setJoinedGroups(prev => ({ ...prev, [group.id]: !prev[group.id] }))}
                        className={`px-3 py-1 rounded-full text-[10px] font-black transition-all cursor-pointer ${
                          isJoined 
                            ? "bg-white/10 text-slate-300 hover:bg-rose-500/20" 
                            : "bg-emerald-500 text-black hover:bg-emerald-400"
                        }`}
                      >
                        {isJoined ? "যুক্ত আছেন ✓" : "+ যোগ দিন"}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400">{group.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-MODAL 4: 🟢 অনলাইন বন্ধু (Online Friends) */}
      {activeMenuModal === 'online_friends' && (
        <div className="fixed inset-0 z-[350] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#121926] border border-emerald-500/30 rounded-3xl p-5 w-full max-w-sm text-slate-100 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <h3 className="font-black text-sm text-white">সক্রিয় অনলাইন বন্ধু</h3>
              </div>
              <button 
                onClick={() => setActiveMenuModal(null)}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white"
              >
                ✕
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1">
              {sampleOnlineFriends.map(friend => (
                <div key={friend.id} className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <img src={friend.photo} alt={friend.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500" />
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[#121926]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-white">{friend.name}</h4>
                      <p className="text-[10px] text-emerald-400 font-bold">{friend.status}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setActiveMenuModal(null);
                      if (onOpenDirectChat) {
                        onOpenDirectChat(friend.id, friend.name);
                      } else if (onNavigateTab) {
                        onNavigateTab('messages');
                      }
                    }}
                    className="p-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 active:scale-95 transition-all cursor-pointer"
                    title="মেসেজ পাঠান"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-MODAL 5: ⚙️ সেটিংস (Settings) */}
      {activeMenuModal === 'settings' && (
        <div className="fixed inset-0 z-[350] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#121926] border border-emerald-500/30 rounded-3xl p-5 w-full max-w-sm text-slate-100 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚙️</span>
                <h3 className="font-black text-sm text-white">অ্যাপ ও অ্যাকাউন্ট সেটিংস</h3>
              </div>
              <button 
                onClick={() => setActiveMenuModal(null)}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Sound */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5">
                <div className="flex items-center gap-2.5">
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  <span>নোটিফিকেশন সাউন্ড</span>
                </div>
                <button 
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${soundEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${soundEnabled ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              {/* Auto Play */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5">
                <div className="flex items-center gap-2.5">
                  <Film className="w-4 h-4 text-purple-400" />
                  <span>রিলস ও ভিডিও অটো-প্লে</span>
                </div>
                <button 
                  onClick={() => setAutoPlayVideos(!autoPlayVideos)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${autoPlayVideos ? 'bg-emerald-500' : 'bg-slate-700'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${autoPlayVideos ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              {/* Clear Cache */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5">
                <div className="flex items-center gap-2.5">
                  <RefreshCw className="w-4 h-4 text-amber-400" />
                  <span>ক্যাশ মেমোরি ক্লিয়ার</span>
                </div>
                <button 
                  onClick={() => {
                    setClearedCache(true);
                    setTimeout(() => setClearedCache(false), 2000);
                  }}
                  className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-bold hover:bg-amber-500/30 cursor-pointer"
                >
                  {clearedCache ? "ক্লিয়ার হয়েছে ✓" : "ক্লিয়ার"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-MODAL 6: 🛡️ প্রাইভেসি ও নিরাপত্তা (Privacy & Security) */}
      {activeMenuModal === 'privacy' && (
        <div className="fixed inset-0 z-[350] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#121926] border border-emerald-500/30 rounded-3xl p-5 w-full max-w-sm text-slate-100 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-lg">🛡️</span>
                <h3 className="font-black text-sm text-white">প্রাইভেসি ও নিরাপত্তা</h3>
              </div>
              <button 
                onClick={() => setActiveMenuModal(null)}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Private Account */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5">
                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <div>
                    <p className="font-bold">ব্যক্তিগত অ্যাকাউন্ট</p>
                    <p className="text-[10px] text-slate-400">শুধু ফলোয়াররা আপনার পোস্ট দেখতে পাবেন</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsPrivateAccount(!isPrivateAccount)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${isPrivateAccount ? 'bg-emerald-500' : 'bg-slate-700'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${isPrivateAccount ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              {/* Hide Online */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5">
                <div className="flex items-center gap-2.5">
                  <Eye className="w-4 h-4 text-teal-400" />
                  <div>
                    <p className="font-bold">অনলাইন স্ট্যাটাস লুকান</p>
                    <p className="text-[10px] text-slate-400">অন্যরা দেখতে পাবে না আপনি কখন সক্রিয় আছেন</p>
                  </div>
                </div>
                <button 
                  onClick={() => setHideOnlineStatus(!hideOnlineStatus)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${hideOnlineStatus ? 'bg-emerald-500' : 'bg-slate-700'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${hideOnlineStatus ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              {/* 2FA */}
              <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-emerald-300">টু-ফ্যাক্টর অথেনটিকেশন</span>
                </div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-black">সক্রিয়</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-MODAL 7: ❓ সহায়তা (Help & Support) */}
      {activeMenuModal === 'help' && (
        <div className="fixed inset-0 z-[350] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#121926] border border-emerald-500/30 rounded-3xl p-5 w-full max-w-sm text-slate-100 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-lg">❓</span>
                <h3 className="font-black text-sm text-white">সহায়তা কেন্দ্র ও FAQ</h3>
              </div>
              <button 
                onClick={() => setActiveMenuModal(null)}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-white/5 space-y-1">
                <p className="font-bold text-white">📸 কীভাবে পোস্ট বা স্টোরি আপলোড করবেন?</p>
                <p className="text-[11px] text-slate-400">হোম স্ক্রিনের উপরে '+' বাটনে চাপ দিয়ে ছবি বা ভিডিও নির্বাচন করুন।</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 space-y-1">
                <p className="font-bold text-white">📞 লাইভ অডিও ও ভিডিও কল কীভাবে করবেন?</p>
                <p className="text-[11px] text-slate-400">চ্যাট বক্সে ঢুকে উপরের অডিও বা ভিডিও কল আইকনে চাপ দিন।</p>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-center space-y-1">
                <p className="font-black text-emerald-400">২৪/৭ কাস্টমার সাপোর্ট</p>
                <p className="text-[10px] text-slate-300">ইমেইল: support@binista.app</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-MODAL 8: 🚪 লগআউট (Logout Confirmation) */}
      {activeMenuModal === 'logout' && (
        <div className="fixed inset-0 z-[350] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#121926] border border-rose-500/40 rounded-3xl p-5 w-full max-w-sm text-slate-100 text-center space-y-4 shadow-2xl relative">
            <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto text-2xl">
              🚪
            </div>
            <div>
              <h3 className="font-black text-base text-white">লগআউট করতে চান?</h3>
              <p className="text-xs text-slate-400 mt-1">আপনি কি নিশ্চিত যে আপনার অ্যাকাউন্ট থেকে লগআউট হতে চান?</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setActiveMenuModal(null)}
                className="py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs active:scale-95 cursor-pointer"
              >
                বাতিল করুন
              </button>
              <button
                onClick={() => {
                  setActiveMenuModal(null);
                  if (onLogout) onLogout();
                }}
                className="py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs active:scale-95 cursor-pointer shadow-lg shadow-rose-500/20"
              >
                হ্যাঁ, লগআউট
              </button>
            </div>
          </div>
        </div>
      )}

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

        {/* Floating Avatar & Stats Summary Row */}
        <div className="flex items-end justify-between px-3 -mt-12 relative z-10">
          <div className="relative group">
            <div className="w-24 h-24 rounded-3xl overflow-hidden ring-4 ring-[#090d14] bg-slate-800 shadow-2xl border border-white/10 relative">
              {photoURL ? (
                <img src={photoURL} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white font-black text-2xl">
                  {displayName.charAt(0) || "U"}
                </div>
              )}

              {/* Quick Camera Overlay Trigger */}
              <button 
                onClick={() => avatarFileRef.current?.click()}
                disabled={isUploadingPhoto}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer text-white"
                title="প্রোফাইল ছবি পরিবর্তন"
              >
                {isUploadingPhoto ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-6 h-6" />
                )}
              </button>
            </div>

            {/* Quick Upload Badge */}
            <button
              onClick={() => avatarFileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 text-black border-2 border-[#090d14] flex items-center justify-center shadow-lg active:scale-90 transition-transform cursor-pointer"
              title="নতুন ছবি দিন"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
            </button>
          </div>

          {/* Social Stats Counters */}
          <div className="flex items-center gap-4 bg-slate-900/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl shadow-xl">
            <div className="text-center">
              <span className="block font-black text-sm text-white leading-tight">{totalPostsCount}</span>
              <span className="text-[10px] text-slate-400 font-semibold">পোস্ট</span>
            </div>
            <div className="w-[1px] h-6 bg-white/10" />
            <div className="text-center cursor-pointer" onClick={() => setActiveMenuModal('friends')}>
              <span className="block font-black text-sm text-emerald-400 leading-tight">{followersCount}</span>
              <span className="text-[10px] text-slate-400 font-semibold">অনুসারী</span>
            </div>
            <div className="w-[1px] h-6 bg-white/10" />
            <div className="text-center cursor-pointer" onClick={() => setActiveMenuModal('friends')}>
              <span className="block font-black text-sm text-white leading-tight">{followingCount}</span>
              <span className="text-[10px] text-slate-400 font-semibold">অনুসরণ</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bio & Metadata Details */}
      <div className="px-4 mt-3 space-y-2">
        <div>
          <h2 className="font-black text-lg text-white leading-tight">{displayName}</h2>
          <p className="text-xs font-bold text-emerald-400">{category}</p>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-normal whitespace-pre-line">
          {bio}
        </p>

        {/* Location & Website */}
        <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400 font-medium">
          {location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              {location}
            </span>
          )}
          {website && (
            <a 
              href={website.startsWith('http') ? website : `https://${website}`} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-1 text-emerald-400 font-bold hover:underline"
            >
              <Globe className="w-3.5 h-3.5" />
              {website.replace(/^https?:\/\//, '')}
            </a>
          )}
        </div>

        {/* 4. Action Buttons (Edit Profile & Share) */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={onEditProfile}
            className="py-2 px-4 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 border border-white/10 text-white font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-300" />
            <span>প্রোফাইল এডিট</span>
          </button>
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="py-2 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-black font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>শেয়ার ও QR</span>
          </button>
        </div>
      </div>

      {/* 5. Story Highlights Carousel */}
      <div className="mt-5 px-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">স্টোরি হাইলাইটস</span>
        </div>
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {highlights.map((hl) => (
            <div key={hl.id} className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer group">
              <div className="w-14 h-14 rounded-2xl p-0.5 ring-2 ring-emerald-500/40 group-hover:ring-emerald-400 transition-all bg-slate-900 overflow-hidden shadow-md">
                <img src={hl.coverUrl} alt={hl.title} className="w-full h-full object-cover rounded-xl" />
              </div>
              <span className="text-[10px] font-bold text-slate-300 truncate max-w-[60px]">{hl.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Tabs Navigation (Grid, Reels, Saved) */}
      <div className="mt-4 border-t border-white/10 flex items-center justify-around bg-[#0c121c]/60">
        <button
          onClick={() => setViewMode('grid')}
          className={`flex-1 py-3 flex items-center justify-center gap-1.5 font-bold text-xs transition-colors border-b-2 cursor-pointer ${
            viewMode === 'grid' 
              ? 'text-emerald-400 border-emerald-400 bg-emerald-500/5' 
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>পোস্ট ({totalPostsCount})</span>
        </button>
        <button
          onClick={() => setViewMode('reels')}
          className={`flex-1 py-3 flex items-center justify-center gap-1.5 font-bold text-xs transition-colors border-b-2 cursor-pointer ${
            viewMode === 'reels' 
              ? 'text-emerald-400 border-emerald-400 bg-emerald-500/5' 
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>রিলস ({totalReelsCount})</span>
        </button>
        <button
          onClick={() => setViewMode('saved')}
          className={`flex-1 py-3 flex items-center justify-center gap-1.5 font-bold text-xs transition-colors border-b-2 cursor-pointer ${
            viewMode === 'saved' 
              ? 'text-emerald-400 border-emerald-400 bg-emerald-500/5' 
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>সংরক্ষিত ({savedPosts.length})</span>
        </button>
      </div>

      {/* Media Grid Stream */}
      <div className="p-1">
        {/* GRID POSTS */}
        {viewMode === 'grid' && (
          <div>
            {displayPosts.length === 0 ? (
              <div className="py-16 px-4 text-center space-y-3">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto shadow-inner">
                  <Grid className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-sm text-white">কোনো পোস্ট নেই</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  আপনার ছবি ও ভিডিও সবার সাথে শেয়ার করতে নতুন পোস্ট তৈরি করুন।
                </p>
                <button
                  onClick={onOpenCreate}
                  className="px-5 py-2.5 rounded-full bg-emerald-500 text-black font-black text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform cursor-pointer"
                >
                  + প্রথম পোস্ট তৈরি করুন
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
                    <img 
                      src={post.mediaUrls[0]} 
                      alt="" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                    {post.mediaType === 'video' && (
                      <div className="absolute top-1.5 right-1.5 text-white bg-black/60 p-1 rounded-md">
                        <Film className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* REELS */}
        {viewMode === 'reels' && (
          <div>
            {displayReels.length === 0 ? (
              <div className="py-16 px-4 text-center space-y-3">
                <div className="w-16 h-16 rounded-3xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mx-auto shadow-inner">
                  <Film className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-sm text-white">কোনো রিলস নেই</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  শর্ট ভিডিও ও আকর্ষণীয় ক্লিপস তৈরি করে আপনার ফলোয়ার বাড়ান।
                </p>
                <button
                  onClick={onOpenCreate}
                  className="px-5 py-2.5 rounded-full bg-purple-500 text-white font-black text-xs shadow-lg shadow-purple-500/20 active:scale-95 transition-transform cursor-pointer"
                >
                  + রিলস তৈরি করুন
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
                      muted 
                      playsInline 
                    />
                    <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 text-[10px] text-white font-bold bg-black/60 px-1.5 py-0.5 rounded-md">
                      <Heart className="w-2.5 h-2.5 text-rose-500 fill-rose-500" />
                      <span>{reel.likesCount || 0}</span>
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

export default InstagramProfile;
