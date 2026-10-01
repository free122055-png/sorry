import React, { useState } from "react";
import { X, Heart, MessageSquare, Send, Sparkles, Smile, Trash2 } from "lucide-react";
import { InstagramComment } from "../../types/instagram";
import { persistComment } from "../../lib/socialPersistence";

interface InstagramCommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  comments: InstagramComment[];
  currentUserPhoto?: string;
  currentUsername?: string;
  currentUserId?: string;
  onAddComment: (targetId: string, text: string) => void;
}

export const InstagramCommentsModal: React.FC<InstagramCommentsModalProps> = ({
  isOpen,
  onClose,
  targetId,
  comments = [],
  currentUserPhoto,
  currentUsername = "you",
  currentUserId = "current_user",
  onAddComment
}) => {
  const [newCommentText, setNewCommentText] = useState("");
  const [localComments, setLocalComments] = useState<InstagramComment[]>(comments);
  const [likedCommentIds, setLikedCommentIds] = useState<Record<string, boolean>>({});

  // Sync props comments with local state for instant responsiveness
  React.useEffect(() => {
    setLocalComments(comments);
  }, [comments]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = newCommentText.trim();
    if (!text) return;

    const tempComment: InstagramComment = {
      id: `comm_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      targetId,
      authorId: currentUserId,
      authorUsername: currentUsername,
      authorPhotoURL: currentUserPhoto,
      text,
      createdAt: Date.now(),
      likesCount: 0,
      isLiked: false
    };

    // Optimistic update
    setLocalComments(prev => [tempComment, ...prev]);
    setNewCommentText("");

    // Persist to Cloud & Local DB
    onAddComment(targetId, text);
    await persistComment(tempComment);
  };

  const handleAddEmoji = (emoji: string) => {
    setNewCommentText(prev => prev + emoji);
  };

  const toggleCommentLike = async (commentId: string) => {
    const isCurrentlyLiked = likedCommentIds[commentId];
    setLikedCommentIds(prev => ({ ...prev, [commentId]: !isCurrentlyLiked }));

    setLocalComments(prev => prev.map(c => {
      if (c.id === commentId) {
        const updated = {
          ...c,
          isLiked: !isCurrentlyLiked,
          likesCount: !isCurrentlyLiked ? (c.likesCount || 0) + 1 : Math.max(0, (c.likesCount || 0) - 1)
        };
        persistComment(updated);
        return updated;
      }
      return c;
    }));
  };

  return (
    <div className="fixed inset-0 z-[300] bg-[#0b1017] text-slate-100 flex flex-col h-[100vh] w-full max-w-lg mx-auto md:max-w-xl font-sans animate-fadeIn select-none">
      
      {/* 1. Full Screen Header */}
      <div className="px-4 py-3.5 bg-[#121926] border-b border-white/10 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-emerald-400" />
          <h3 className="font-black text-base text-white">মন্তব্য ও রিঅ্যাকশন ({localComments.length})</h3>
        </div>

        <button 
          onClick={onClose} 
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all active:scale-90 cursor-pointer"
          title="বন্ধ করুন"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* 2. Full Screen Comments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0b1017]">
        {localComments.length === 0 ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-sm text-white">কোনো মন্তব্য নেই</h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              এই পোস্টে প্রথম মন্তব্য বা রিঅ্যাকশন জানিয়ে আলোচনা শুরু করুন!
            </p>
          </div>
        ) : (
          localComments.map(c => {
            const isLiked = likedCommentIds[c.id] || c.isLiked;

            return (
              <div 
                key={c.id} 
                className="flex items-start justify-between gap-3 bg-[#131b26]/70 border border-white/5 p-3.5 rounded-2xl shadow-xs"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-800 flex-shrink-0 ring-1 ring-emerald-500/30">
                    <img 
                      src={c.authorPhotoURL || `https://ui-avatars.com/api/?name=${c.authorUsername}&background=1e293b&color=fff`} 
                      alt="" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="leading-snug min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs text-white">@{c.authorUsername}</span>
                      <span className="text-[10px] text-slate-500">এখনই</span>
                    </div>
                    <p className="text-xs text-slate-200 mt-1 leading-relaxed break-words">{c.text}</p>
                  </div>
                </div>

                <button 
                  onClick={() => toggleCommentLike(c.id)} 
                  className="px-2 py-1.5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-rose-500 flex flex-col items-center gap-0.5 flex-shrink-0 transition-colors cursor-pointer"
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500 scale-110' : 'text-slate-400'}`} />
                  <span className="text-[10px] font-bold text-slate-300">
                    {isLiked ? (c.likesCount || 0) + 1 : (c.likesCount || 0)}
                  </span>
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* 3. Quick Emoji Bar */}
      <div className="px-4 py-2.5 border-t border-white/10 bg-[#121926] flex items-center justify-around text-xl shrink-0">
        {["❤️", "🙌", "🔥", "👏", "😢", "😍", "✨", "🌸", "👍"].map(emoji => (
          <button 
            key={emoji} 
            type="button" 
            onClick={() => handleAddEmoji(emoji)} 
            className="hover:scale-125 transition-transform p-1 cursor-pointer"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* 4. Full Screen Input Bar */}
      <form onSubmit={handleSubmit} className="p-3.5 bg-[#0e141f] border-t border-white/10 flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 flex-shrink-0 ring-2 ring-emerald-500/40">
          <img 
            src={currentUserPhoto || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80"} 
            alt="You" 
            className="w-full h-full object-cover" 
          />
        </div>
        
        <input 
          type="text" 
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          placeholder="আপনার মন্তব্য লিখুন..."
          className="flex-1 bg-[#182232] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-slate-500 outline-none focus:border-emerald-500/60 font-medium"
        />

        <button 
          type="submit" 
          disabled={!newCommentText.trim()}
          className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs shadow-lg flex items-center gap-1.5 disabled:opacity-40 transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <Send className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>পোস্ট</span>
        </button>
      </form>

    </div>
  );
};
