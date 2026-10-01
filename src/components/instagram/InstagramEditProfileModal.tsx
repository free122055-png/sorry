import React, { useState, useRef } from "react";
import { 
  X, Camera, Image, Sparkles, Check, 
  Upload, Globe, MapPin, Tag, Shield, 
  Crown, Star, User, Loader2, ArrowLeft,
  Smile, RefreshCw
} from "lucide-react";
import { uploadImageFile, uploadImage } from "../../lib/uploadService";

interface InstagramEditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialName: string;
  initialUsername: string;
  initialBio: string;
  initialWebsite: string;
  initialPhoto: string;
  initialCoverPhoto?: string;
  initialCategory?: string;
  initialBadgeTitle?: string;
  initialLocation?: string;
  onSave: (data: {
    displayName: string;
    username: string;
    bio: string;
    website: string;
    photoURL: string;
    coverPhotoURL?: string;
    category?: string;
    badgeTitle?: string;
    location?: string;
  }) => void;
}

const PRESET_AVATARS = [
  { id: "gold", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80", label: "গোল্ড ভিআইপি" },
  { id: "neon", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80", label: "ক্রিয়েটর প্রো" },
  { id: "cyber", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80", label: "মডার্ন আর্ট" },
  { id: "classy", url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80", label: "ক্লাসিক লুক" },
  { id: "elegance", url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&auto=format&fit=crop&q=80", label: "এলিগ্যান্ট" },
  { id: "business", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80", label: "উদ্যোক্তা" }
];

const PRESET_COVERS = [
  { id: "mesh-1", gradient: "from-emerald-900 via-teal-950 to-slate-900", label: "এমেরাল্ড লাক্সারি" },
  { id: "mesh-2", gradient: "from-purple-900 via-indigo-950 to-slate-900", label: "রয়্যাল পার্পল" },
  { id: "mesh-3", gradient: "from-amber-900 via-slate-900 to-black", label: "গোল্ডেন সানসেট" },
  { id: "mesh-4", gradient: "from-rose-900 via-slate-900 to-slate-950", label: "রোজ গোল্ড" },
  { id: "mesh-5", gradient: "from-blue-900 via-cyan-950 to-slate-950", label: "সাইবার ব্লু" }
];

const CATEGORIES = [
  "🎨 ডিজিটাল কনটেন্ট ক্রিয়েটর",
  "🛍️ অনলাইন উদ্যোক্তা ও মার্চেন্ট",
  "🎥 ভিডিও মেকার ও ভ্লগার",
  "📸 প্রফেশনাল ফটোগ্রাফার",
  "💻 সফটওয়্যার ইঞ্জিনিয়ার / ডিজাইনার",
  "🎓 শিক্ষক ও প্রশিক্ষক",
  "🌟 সোশ্যাল ইনফ্লুয়েন্সার",
  "👤 সাধারণ ব্যবহারকারী"
];

const BADGE_OPTIONS = [
  "👑 গোল্ড ভিআইপি মেম্বার",
  "🌟 ভেরিফাইড ক্রিয়েটর",
  "💎 ডায়মন্ড পার্টনার",
  "🛍️ অথেনটিক মার্চেন্ট",
  "⚡ প্রিমিয়াম মেম্বার"
];

export const InstagramEditProfileModal: React.FC<InstagramEditProfileModalProps> = ({
  isOpen,
  onClose,
  initialName,
  initialUsername,
  initialBio,
  initialWebsite,
  initialPhoto,
  initialCoverPhoto = "",
  initialCategory = "🎨 ডিজিটাল কনটেন্ট ক্রিয়েটর",
  initialBadgeTitle = "👑 গোল্ড ভিআইপি মেম্বার",
  initialLocation = "বাংলাদেশ",
  onSave
}) => {
  const [name, setName] = useState(initialName);
  const [username, setUsername] = useState(initialUsername);
  const [bio, setBio] = useState(initialBio);
  const [website, setWebsite] = useState(initialWebsite);
  const [photoURL, setPhotoURL] = useState(initialPhoto);
  const [coverPhotoURL, setCoverPhotoURL] = useState(initialCoverPhoto);
  const [category, setCategory] = useState(initialCategory);
  const [badgeTitle, setBadgeTitle] = useState(initialBadgeTitle);
  const [location, setLocation] = useState(initialLocation);

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'avatar' | 'badge'>('info');

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle direct file upload from user device / gallery
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const publicUrl = await uploadImageFile(file);
      if (publicUrl) {
        setPhotoURL(publicUrl);
      }
    } catch (err) {
      console.error("Avatar upload failed:", err);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    try {
      const publicUrl = await uploadImageFile(file);
      if (publicUrl) {
        setCoverPhotoURL(publicUrl);
      }
    } catch (err) {
      console.error("Cover upload failed:", err);
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      displayName: name.trim() || "সম্মানিত ব্যবহারকারী",
      username: username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_") || "user",
      bio: bio.trim(),
      website: website.trim(),
      photoURL: photoURL.trim(),
      coverPhotoURL: coverPhotoURL.trim(),
      category: category.trim(),
      badgeTitle: badgeTitle.trim(),
      location: location.trim()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[250] bg-black/85 backdrop-blur-md flex flex-col justify-end sm:justify-center items-center max-w-lg mx-auto md:max-w-xl font-sans p-0 sm:p-4 animate-fadeIn">
      {/* Hidden File Inputs */}
      <input 
        ref={avatarInputRef}
        type="file" 
        accept="image/*" 
        className="hidden" 
        onChange={handleAvatarFileChange} 
      />
      <input 
        ref={coverInputRef}
        type="file" 
        accept="image/*" 
        className="hidden" 
        onChange={handleCoverFileChange} 
      />

      <div className="bg-[#111827] border-t sm:border border-emerald-500/20 rounded-t-3xl sm:rounded-3xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.9)]">
        
        {/* Header Bar */}
        <div className="p-4 bg-[#131d2a] border-b border-white/10 flex items-center justify-between shrink-0">
          <button 
            type="button"
            onClick={onClose} 
            className="text-xs font-semibold text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
          >
            বাতিল
          </button>
          
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="font-black text-sm text-white tracking-wide">প্রিমিয়াম প্রোফাইল সাজান</h3>
          </div>

          <button 
            type="button"
            onClick={handleSubmit} 
            className="px-4 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>সংরক্ষণ</span>
          </button>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex items-center justify-around bg-[#0c121d] px-2 py-1.5 border-b border-white/5 shrink-0 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === 'info' 
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📝 মৌলিক তথ্য
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('avatar')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === 'avatar' 
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📸 ছবি ও কভার
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('badge')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === 'badge' 
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            👑 ব্যাজ ও স্ট্যাটাস
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 flex-1 overflow-y-auto space-y-5">
          
          {/* TAB 1: BASIC INFO */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              {/* Profile Preview Mini Card */}
              <div className="p-3 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/20 rounded-2xl flex items-center gap-3.5 shadow-inner">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-emerald-400/60 bg-slate-800 shadow-md">
                    {photoURL ? (
                      <img src={photoURL} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500">
                        <User className="w-7 h-7" />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-emerald-500 text-black flex items-center justify-center shadow-lg active:scale-90"
                    title="গ্যালারি থেকে ছবি দিন"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-black text-sm text-white truncate">{name || "আপনার নাম"}</h4>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold border border-emerald-500/30">
                      ✓
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">@{username || "username"}</p>
                  <p className="text-[10px] text-emerald-400 font-semibold truncate mt-0.5">{category}</p>
                </div>
              </div>

              {/* Display Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span>পূর্ণ নাম (Display Name)</span>
                </label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="যেমন: আল-আমিন হোসেন"
                  className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 transition-all font-semibold" 
                  required
                />
              </div>

              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ইউজারনেম (Username - ইউনিক হ্যান্ডেল)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs text-emerald-400 font-black">@</span>
                  <input 
                    type="text" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    placeholder="alamin_creator"
                    className="w-full bg-[#1e293b] border border-white/10 rounded-xl pl-8 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 transition-all font-mono" 
                    required
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Smile className="w-3.5 h-3.5 text-emerald-400" />
                    <span>প্রোফাইল বায়ো (Bio)</span>
                  </label>
                  <span className="text-[10px] text-slate-400">{bio.length}/150</span>
                </div>
                <textarea 
                  rows={3}
                  maxLength={150}
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)} 
                  placeholder="আপনার ব্যক্তিত্ব, লক্ষ্য বা কাজের বিবরণ লিখুন... ✨"
                  className="w-full bg-[#1e293b] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 transition-all resize-none leading-relaxed" 
                />
              </div>

              {/* Website / Social Link */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ওয়েবসাইট বা সোশ্যাল লিংক</span>
                </label>
                <input 
                  type="url" 
                  value={website} 
                  onChange={(e) => setWebsite(e.target.value)} 
                  placeholder="https://facebook.com/yourhandle"
                  className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 transition-all" 
                />
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>লোকেশন / শহর</span>
                </label>
                <input 
                  type="text" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)} 
                  placeholder="ঢাকা, বাংলাদেশ"
                  className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 transition-all" 
                />
              </div>
            </div>
          )}

          {/* TAB 2: PHOTO & COVER */}
          {activeTab === 'avatar' && (
            <div className="space-y-5">
              {/* 1. Main Avatar Upload Zone */}
              <div className="bg-[#182333] border border-emerald-500/20 rounded-2xl p-4 text-center space-y-3">
                <span className="text-xs font-black text-emerald-400 uppercase tracking-wider block">
                  প্রোফাইল ছবি (Avatar)
                </span>

                <div className="relative inline-block">
                  <div className="w-24 h-24 rounded-3xl overflow-hidden ring-4 ring-emerald-400/80 bg-slate-900 shadow-2xl mx-auto flex items-center justify-center">
                    {photoURL ? (
                      <img src={photoURL} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-12 h-12 text-slate-600" />
                    )}
                  </div>
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-black/70 rounded-3xl flex flex-col items-center justify-center text-emerald-400 text-[10px] font-bold">
                      <Loader2 className="w-6 h-6 animate-spin mb-1" />
                      <span>আপলোড হচ্ছে...</span>
                    </div>
                  )}
                </div>

                {/* Direct Upload Button from Gallery */}
                <div>
                  <button
                    type="button"
                    disabled={isUploadingAvatar}
                    onClick={() => avatarInputRef.current?.click()}
                    className="px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-xs shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-2 mx-auto disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4 stroke-[2.5]" />
                    <span>গ্যালারি থেকে ছবি আপলোড করুন</span>
                  </button>
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    JPG, PNG বা WEBP (স্বয়ংক্রিয়ভাবে হাই-কোয়ালিটি প্রসেস হবে)
                  </p>
                </div>
              </div>

              {/* 2. Preset Premium Avatars */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>অথবা ইনস্ট্যান্ট ভিআইপি অ্যাভাটার বেছে নিন:</span>
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {PRESET_AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setPhotoURL(av.url)}
                      className={`p-2 rounded-2xl border transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                        photoURL === av.url 
                          ? 'bg-emerald-500/20 border-emerald-400 ring-2 ring-emerald-400/50' 
                          : 'bg-[#182333]/70 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800">
                        <img src={av.url} alt={av.label} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-300">{av.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Cover Header Photo */}
              <div className="bg-[#182333] border border-white/10 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Image className="w-3.5 h-3.5 text-emerald-400" />
                    <span>প্রোফাইল কভার ব্যানার (Cover Banner)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    className="text-[10px] font-bold text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Upload className="w-3 h-3" />
                    <span>কভার আপলোড</span>
                  </button>
                </div>

                <div className="h-24 rounded-xl overflow-hidden relative border border-white/10 bg-slate-900 flex items-center justify-center">
                  {coverPhotoURL ? (
                    <img src={coverPhotoURL} alt="Cover Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 flex items-center justify-center text-slate-400 text-xs font-semibold">
                      <span>ডিফল্ট লাক্সারি ব্যানার সক্রিয়</span>
                    </div>
                  )}
                  {isUploadingCover && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-emerald-400 text-xs font-bold">
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      <span>কভার আপলোড হচ্ছে...</span>
                    </div>
                  )}
                </div>

                {/* Preset Gradient Themes for Cover */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400">অথবা লাক্সারি গ্রাডিয়েন্ট থিম:</span>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COVERS.map((cov) => (
                      <button
                        key={cov.id}
                        type="button"
                        onClick={() => setCoverPhotoURL("")}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-semibold text-slate-300 hover:text-white"
                      >
                        {cov.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: BADGES & CATEGORIES */}
          {activeTab === 'badge' && (
            <div className="space-y-4">
              {/* Category Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-emerald-400" />
                  <span>পেশা / ক্যাটাগরি (Profession Tag)</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                        category === cat 
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' 
                          : 'bg-[#1e293b] border-white/5 text-slate-300 hover:bg-[#253347]'
                      }`}
                    >
                      <span>{cat}</span>
                      {category === cat && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* VIP / Verified Badge */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>প্রোফাইল স্ট্যাটাস ব্যাজ (VIP / Verified Status)</span>
                </label>
                <div className="space-y-2">
                  {BADGE_OPTIONS.map((badge) => (
                    <button
                      key={badge}
                      type="button"
                      onClick={() => setBadgeTitle(badge)}
                      className={`w-full p-3 rounded-xl border text-left text-xs font-black transition-all flex items-center justify-between cursor-pointer ${
                        badgeTitle === badge 
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-1 ring-amber-400/40' 
                          : 'bg-[#1e293b] border-white/5 text-slate-300 hover:bg-[#253347]'
                      }`}
                    >
                      <span>{badge}</span>
                      {badgeTitle === badge && <Check className="w-4 h-4 text-amber-400" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

        </form>

        {/* Footer Quick Action */}
        <div className="p-3.5 bg-[#0c121d] border-t border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>১০০% সুরক্ষিত ক্লাউড প্রোফাইল</span>
          </span>
          <button 
            type="button"
            onClick={handleSubmit} 
            className="px-6 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            পরিবর্তন সংরক্ষণ করুন
          </button>
        </div>

      </div>
    </div>
  );
};
