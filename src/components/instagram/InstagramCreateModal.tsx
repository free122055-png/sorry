import React, { useState, useRef } from "react";
import { 
  ArrowLeft, Sparkles, Image, PlusCircle, Film, Smile, 
  Camera, X, Edit3, UserPlus, MapPin, Music, Globe, 
  MessageSquare, Heart, Share2, Eye, Send, Check, Loader2,
  Lock, Users, Volume2, User, Play, AlertCircle, Upload
} from "lucide-react";
import { uploadVideo, uploadImage } from "../../lib/uploadService";

interface InstagramCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePost: (postData: any) => void;
  onCreateStory: (storyData: any) => void;
  onCreateReel: (reelData: any) => void;
  onCreateNote: (noteText: string) => void;
  currentUserPhoto?: string;
  currentUsername?: string;
}

const isVideoUrl = (url: string) => {
  if (!url) return false;
  return url.startsWith('data:video') || url.includes('.mp4') || url.includes('.webm') || url.includes('.mov') || url.includes('gtv-videos-bucket');
};

export const InstagramCreateModal: React.FC<InstagramCreateModalProps> = ({
  isOpen,
  onClose,
  onCreatePost,
  onCreateStory,
  onCreateReel,
  onCreateNote,
  currentUserPhoto,
  currentUsername = "user"
}) => {
  const [createType, setCreateType] = useState<'post' | 'story' | 'reel' | 'note'>('post');
  
  // Clean media list
  const [mediaList, setMediaList] = useState<string[]>([]);
  const [caption, setCaption] = useState("");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Metadata States
  const [taggedPeople, setTaggedPeople] = useState<string[]>([]);
  const [location, setLocation] = useState("ঢাকা, বাংলাদেশ");
  const [musicTitle, setMusicTitle] = useState("");

  // Privacy & Permission States
  const [audience, setAudience] = useState<'public' | 'followers' | 'private'>('public');
  const [allowComments, setAllowComments] = useState(true);
  const [allowLikes, setAllowLikes] = useState(true);
  const [allowShares, setAllowShares] = useState(true);

  // Sub-dialogs
  const [activeSubModal, setActiveSubModal] = useState<'none' | 'tag' | 'location' | 'music' | 'preview'>('none');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Preset Locations
  const PRESET_LOCATIONS = [
    "ঢাকা, বাংলাদেশ",
    "গুলশান ২, ঢাকা",
    "ধানমন্ডি লেক, ঢাকা",
    "চট্টগ্রাম বন্দর নগরী",
    "কক্সবাজার সমুদ্র সৈকত",
    "শ্রীমঙ্গল চা বাগান, সিলেট",
    "সাজেক ভ্যালি, রাঙ্গামাটি"
  ];

  // Preset Music Tracks
  const PRESET_MUSIC = [
    "Peaceful Waves · Acoustic Bliss",
    "Urban Pulse · Trending Beat",
    "Moner Manush · Folk Fusion",
    "Midnight Lo-Fi · Chill Vibe",
    "Rain & Tea · Relaxing Melody"
  ];

  // AI Caption Generation
  const handleGenerateAiCaption = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await fetch("/api/generate-caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: location || "nature lifestyle",
          type: createType,
          currentText: caption
        })
      });
      const data = await res.json();
      if (data.caption) {
        setCaption(data.caption);
      }
    } catch (e) {
      setCaption("প্রকৃতির স্নিগ্ধতায় কাটানো কিছু অসাধারণ মুহূর্ত ✨🌿 #pulse #lifestyle");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Handle local file uploads with 30s video limit check
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError(null);

    for (const file of Array.from(files) as File[]) {
      // 30-Second Video Validation
      if (file.type.startsWith('video/')) {
        const duration = await new Promise<number>((resolve) => {
          const tempVideo = document.createElement('video');
          tempVideo.preload = 'metadata';
          tempVideo.onloadedmetadata = () => {
            window.URL.revokeObjectURL(tempVideo.src);
            resolve(tempVideo.duration);
          };
          tempVideo.onerror = () => resolve(0);
          tempVideo.src = URL.createObjectURL(file);
        });

        if (duration > 30.5) {
          setUploadError(`⚠️ ভিডিওর দৈর্ঘ্য সর্বোচ্চ ৩০ সেকেন্ড হতে পারে! আপনার ভিডিওটি ${Math.round(duration)} সেকেন্ডের।`);
          continue;
        }
      }

      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setMediaList(prev => [...prev, uploadEvent.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveMedia = (index: number) => {
    setMediaList(prev => prev.filter((_, i) => i !== index));
  };

  // Handle final publish with asynchronous server URL conversion
  const handlePublish = async () => {
    if (isPublishing) return;
    setIsPublishing(true);

    try {
      // Process media and convert large base64 data URLs to permanent server URLs
      const processedMedia: string[] = [];

      for (const item of mediaList) {
        if (item.startsWith("data:video") || isVideoUrl(item)) {
          if (item.startsWith("data:")) {
            const uploadedUrl = await uploadVideo(item);
            processedMedia.push(uploadedUrl || item);
          } else {
            processedMedia.push(item);
          }
        } else if (item.startsWith("data:image")) {
          const uploadedUrl = await uploadImage(item);
          processedMedia.push(uploadedUrl || item);
        } else {
          processedMedia.push(item);
        }
      }

      const finalMedia = processedMedia.length > 0 ? processedMedia : mediaList;

      if (createType === 'note') {
        onCreateNote(caption.trim() || "সুন্দর একটি দিন কাটছে ☕");
      } else if (createType === 'story') {
        if (finalMedia.length === 0) {
          setUploadError("অনুগ্রহ করে স্টোরির জন্য একটি ছবি বা ভিডিও নির্বাচন করুন");
          setIsPublishing(false);
          return;
        }
        onCreateStory({
          mediaUrl: finalMedia[0],
          caption: caption.trim()
        });
      } else if (createType === 'reel') {
        if (finalMedia.length === 0) {
          setUploadError("অনুগ্রহ করে রিলস এর জন্য একটি ভিডিও নির্বাচন করুন");
          setIsPublishing(false);
          return;
        }
        onCreateReel({
          videoUrl: finalMedia[0],
          thumbnailUrl: finalMedia[0],
          caption: caption.trim() || "নতুন রিলস ভিডিও 🔥 #clips",
          musicTitle: musicTitle || "Trending Sound · Pulse"
        });
      } else {
        if (finalMedia.length === 0 && !caption.trim()) {
          setUploadError("অনুগ্রহ করে ছবি বা ক্যাপশন যোগ করুন");
          setIsPublishing(false);
          return;
        }
        onCreatePost({
          mediaUrls: finalMedia.length > 0 ? finalMedia : ["https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80"],
          caption: caption.trim() || "নতুন পোস্ট সবার সাথে শেয়ার করলাম ✨",
          musicTitle: musicTitle,
          location: location,
          taggedPeople: taggedPeople,
          audience: audience,
          allowComments: allowComments,
          allowLikes: allowLikes,
          allowShares: allowShares
        });
      }

      onClose();
    } catch (err) {
      console.error("[CreateModal] Error during publishing:", err);
      alert("পোস্ট প্রকাশ করার সময় সমস্যা হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-[#070c12]/95 backdrop-blur-xl flex flex-col justify-between overflow-y-auto max-w-lg mx-auto md:max-w-xl font-sans text-slate-100">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileUpload} 
        accept="image/*,video/*" 
        multiple 
        className="hidden" 
      />

      <div className="p-4 space-y-4 flex-1">
        {/* 1. Header */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              disabled={isPublishing}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="font-bold text-lg text-white">নতুন কিছু তৈরি করুন</h2>
              <p className="text-xs text-slate-400">আপনার ভাবনা, ছবি বা ভিডিও শেয়ার করুন</p>
            </div>
          </div>

          <button
            onClick={handleGenerateAiCaption}
            disabled={isGeneratingAi || isPublishing}
            className="px-3 py-1.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(16,185,129,0.2)] active:scale-95 disabled:opacity-50"
          >
            {isGeneratingAi ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>AI দিয়ে ক্যাপশন</span>
          </button>
        </div>

        {/* Upload Warning Banner if any */}
        {uploadError && (
          <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* 2. Creation Type 4-Tab Bar */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          {[
            { id: 'post', label: 'পোস্ট', icon: Image },
            { id: 'story', label: 'স্টোরি', icon: PlusCircle },
            { id: 'reel', label: 'রিলস', icon: Film },
            { id: 'note', label: 'স্ট্যাটাস', icon: Smile }
          ].map(tab => {
            const isActive = createType === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => setCreateType(tab.id as any)}
                className={`py-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all border ${
                  isActive 
                    ? 'bg-emerald-500/15 border-emerald-400 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                    : 'bg-[#111923] border-white/5 text-slate-400 hover:text-white hover:bg-[#15202d]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className="text-xs font-bold">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 3. Media Upload Container */}
        {createType !== 'note' && (
          <div className="bg-[#111923] border border-white/5 rounded-3xl p-3">
            {mediaList.length === 0 ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="py-8 px-4 rounded-2xl border-2 border-dashed border-slate-600 hover:border-emerald-400 bg-white/5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors group text-center"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">ছবি বা ভিডিও আপলোড করুন</h4>
                  <p className="text-xs text-slate-400 mt-0.5">গ্যালারি থেকে সিলেক্ট করুন (ভিডিও সর্বোচ্চ ৩০ সে.)</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
                {/* Uploaded Media Preview Cards */}
                {mediaList.map((url, idx) => {
                  const isVideo = isVideoUrl(url);

                  return (
                    <div 
                      key={idx} 
                      className="relative w-24 h-24 rounded-2xl overflow-hidden bg-[#1e293b] flex-shrink-0 border border-white/10 shadow-sm group"
                    >
                      {isVideo ? (
                        <video src={url} className="w-full h-full object-cover" />
                      ) : (
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      )}

                      {isVideo && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
                          <Play className="w-5 h-5 text-white fill-white" />
                        </div>
                      )}

                      <button 
                        onClick={() => handleRemoveMedia(idx)}
                        className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-rose-500 transition-colors shadow-md"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}

                {/* Add More Button Card */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-2xl bg-[#172230] border border-white/10 hover:border-emerald-400 flex flex-col items-center justify-center gap-1 flex-shrink-0 cursor-pointer transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white">
                    +
                  </div>
                  <span className="text-[10px] text-slate-300 font-medium">আরও যোগ</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. Caption Area */}
        <div className="bg-[#111923] border border-white/5 rounded-3xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-semibold text-slate-200">
              <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
              ক্যাপশন লিখুন
            </span>
            <span className="text-[11px] text-slate-500">{caption.length}/500</span>
          </div>

          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="আপনার ভাবনা বা অনুভূতির কথা লিখুন..."
            rows={3}
            maxLength={500}
            className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 outline-none resize-none leading-relaxed"
          />
        </div>

        {/* 5. Metadata Options */}
        <div className="bg-[#111923] border border-white/5 rounded-3xl p-2 divide-y divide-white/5">
          {/* Tag People */}
          <div 
            onClick={() => setActiveSubModal('tag')}
            className="p-3 flex items-center justify-between cursor-pointer hover:bg-white/5 rounded-2xl transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <UserPlus className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">কাউকে ট্যাগ করুন</p>
                <p className="text-[11px] text-slate-400">
                  {taggedPeople.length > 0 ? `${taggedPeople.length} জন ট্যাগ করা হয়েছে` : "বন্ধুদের ট্যাগ করতে ক্লিক করুন"}
                </p>
              </div>
            </div>
            <span className="text-slate-500 text-xs font-bold">›</span>
          </div>

          {/* Add Location */}
          <div 
            onClick={() => setActiveSubModal('location')}
            className="p-3 flex items-center justify-between cursor-pointer hover:bg-white/5 rounded-2xl transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <MapPin className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">লোকেশন যোগ করুন</p>
                <p className="text-[11px] text-slate-400">{location || "লোকেশন নির্বাচন করুন"}</p>
              </div>
            </div>
            <span className="text-slate-500 text-xs font-bold">›</span>
          </div>

          {/* Add Music */}
          <div 
            onClick={() => setActiveSubModal('music')}
            className="p-3 flex items-center justify-between cursor-pointer hover:bg-white/5 rounded-2xl transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center">
                <Music className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">মিউজিক যোগ করুন</p>
                <p className="text-[11px] text-slate-400">{musicTitle || "ব্যাকগ্রাউন্ড মিউজিক নির্বাচন করুন"}</p>
              </div>
            </div>
            <span className="text-slate-500 text-xs font-bold">›</span>
          </div>
        </div>
      </div>

      {/* 6. Bottom Action Footer */}
      <div className="p-4 bg-[#0b1017] border-t border-white/10 flex items-center gap-3 sticky bottom-0 z-30">
        {/* Post Live Preview Button */}
        <button 
          onClick={() => setActiveSubModal('preview')}
          disabled={isPublishing}
          className="flex-1 bg-[#111923] hover:bg-[#15202d] border border-white/10 rounded-2xl p-2.5 flex items-center justify-between text-left transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-[#1e293b] flex-shrink-0 flex items-center justify-center">
              {mediaList.length > 0 ? (
                isVideoUrl(mediaList[0]) ? (
                  <video src={mediaList[0]} className="w-full h-full object-cover" />
                ) : (
                  <img src={mediaList[0]} alt="" className="w-full h-full object-cover" />
                )
              ) : (
                <Eye className="w-4 h-4 text-emerald-400" />
              )}
            </div>
            <div className="flex items-center gap-1 text-slate-200">
              <span className="text-xs font-bold">পোস্টের প্রিভিউ</span>
            </div>
          </div>
          <span className="text-slate-500 text-xs font-bold">›</span>
        </button>

        {/* Publish Button */}
        <button 
          onClick={handlePublish}
          disabled={isPublishing}
          className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs rounded-2xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95 disabled:opacity-50"
        >
          {isPublishing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-black" />
              <span>আপলোড হচ্ছে...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4 stroke-[2.5] -rotate-12" />
              <span>প্রকাশ করুন</span>
            </>
          )}
        </button>
      </div>

      {/* SUB-MODAL: Location Picker */}
      {activeSubModal === 'location' && (
        <div className="fixed inset-0 z-[350] bg-black/80 backdrop-blur-md flex flex-col justify-end p-3">
          <div className="bg-[#111923] border border-white/10 rounded-3xl p-4 max-h-[70vh] flex flex-col space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="font-bold text-sm text-white">লোকেশন নির্বাচন করুন</h3>
              <button onClick={() => setActiveSubModal('none')} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 overflow-y-auto flex-1">
              {PRESET_LOCATIONS.map((loc, idx) => (
                <div 
                  key={idx}
                  onClick={() => {
                    setLocation(loc);
                    setActiveSubModal('none');
                  }}
                  className={`p-3 rounded-2xl flex items-center justify-between cursor-pointer transition-colors ${
                    location === loc ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 hover:bg-white/10 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold">{loc}</span>
                  </div>
                  {location === loc && <span className="text-xs font-bold text-emerald-400">✓</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-MODAL: Music Picker */}
      {activeSubModal === 'music' && (
        <div className="fixed inset-0 z-[350] bg-black/80 backdrop-blur-md flex flex-col justify-end p-3">
          <div className="bg-[#111923] border border-white/10 rounded-3xl p-4 max-h-[70vh] flex flex-col space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="font-bold text-sm text-white">মিউজিক নির্বাচন করুন</h3>
              <button onClick={() => setActiveSubModal('none')} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 overflow-y-auto flex-1">
              {PRESET_MUSIC.map((track, idx) => (
                <div 
                  key={idx}
                  onClick={() => {
                    setMusicTitle(track);
                    setActiveSubModal('none');
                  }}
                  className={`p-3 rounded-2xl flex items-center justify-between cursor-pointer transition-colors ${
                    musicTitle === track ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' : 'bg-white/5 hover:bg-white/10 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Music className="w-4 h-4 text-pink-400" />
                    <span className="text-xs font-semibold">{track}</span>
                  </div>
                  {musicTitle === track && <span className="text-xs font-bold text-pink-400">✓</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-MODAL: Post Live Preview */}
      {activeSubModal === 'preview' && (
        <div className="fixed inset-0 z-[350] bg-black/85 backdrop-blur-md flex flex-col justify-center p-4">
          <div className="bg-[#111923] border border-white/10 rounded-3xl p-4 max-w-sm mx-auto w-full space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-xs text-white">লাইভ প্রিভিউ</h3>
              </div>
              <button onClick={() => setActiveSubModal('none')} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Post Card Preview */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-[#1e293b]">
                  {currentUserPhoto ? (
                    <img src={currentUserPhoto} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-700 flex items-center justify-center text-xs text-white">U</div>
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{currentUsername}</p>
                  <p className="text-[10px] text-slate-400">{location}</p>
                </div>
              </div>

              <div className="relative aspect-video rounded-2xl overflow-hidden bg-black">
                {mediaList.length > 0 ? (
                  isVideoUrl(mediaList[0]) ? (
                    <video src={mediaList[0]} controls className="w-full h-full object-cover" />
                  ) : (
                    <img src={mediaList[0]} alt="" className="w-full h-full object-cover" />
                  )
                ) : (
                  <div className="w-full h-full bg-[#1e293b] flex items-center justify-center text-slate-500 text-xs">
                    কোন ছবি নেই
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-200 leading-relaxed">
                {caption || "ক্যাপশন এখনো দেওয়া হয়নি..."}
              </p>

              {musicTitle && (
                <div className="flex items-center gap-1.5 text-[10px] text-pink-400">
                  <Music className="w-3 h-3" />
                  <span>{musicTitle}</span>
                </div>
              )}
            </div>

            <button 
              onClick={() => setActiveSubModal('none')}
              className="w-full py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-xl"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
