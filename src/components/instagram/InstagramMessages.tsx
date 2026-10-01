import React, { useState } from "react";
import { 
  Search, Bot, Edit3, Plus, Camera, Send, 
  ChevronDown, X, MessageCircle
} from "lucide-react";
import { InstagramNote } from "../../types/instagram";

export interface ChatThreadItem {
  id: string;
  targetUserId: string;
  displayName: string;
  username: string;
  photoURL?: string;
  lastMessage: string;
  lastMessageAt: any;
  unreadCount: number;
  isOnline?: boolean;
}

interface InstagramMessagesProps {
  threads: ChatThreadItem[];
  notes: InstagramNote[];
  currentUsername: string;
  currentUserPhoto?: string;
  onSelectThread: (thread: ChatThreadItem) => void;
  onOpenAiAgentModal: () => void;
  onOpenCreateNote: () => void;
  onStartNewChat: () => void;
}

export const InstagramMessages: React.FC<InstagramMessagesProps> = ({
  threads,
  notes,
  currentUsername,
  currentUserPhoto,
  onSelectThread,
  onOpenAiAgentModal,
  onOpenCreateNote,
  onStartNewChat
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'primary' | 'requests'>('all');
  const [searchQuery, setSearchQuery] = useState("");

  const filteredThreads = threads.filter(t => 
    t.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0b1017] text-slate-100 pb-28 max-w-lg mx-auto md:max-w-xl font-sans">
      {/* 1. Header Bar */}
      <header className="sticky top-0 z-40 bg-[#0b1017]/95 backdrop-blur-xl px-4 py-3.5 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2">
          <img 
            src="/app_icon.png" 
            alt="BINISTA" 
            className="w-8 h-8 rounded-xl object-cover ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-500/20" 
          />
          <div className="flex items-center gap-1.5 cursor-pointer">
            <span className="font-bold text-base text-white">BINISTA</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={onOpenAiAgentModal}
            className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="AI সহকারী সেটিংস"
          >
            <Bot className="w-4 h-4 text-emerald-400" />
            <span className="text-xs">AI সহকারী</span>
          </button>

          <button 
            onClick={onStartNewChat}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white transition-colors"
            title="নতুন চ্যাট"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. Fast Search Bar */}
      <div className="px-4 pt-3 pb-1">
        <div className="bg-[#131b26] rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 border border-white/5 focus-within:border-emerald-500/50 transition-colors">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="নাম বা ইউজারনেম দিয়ে খুঁজুন..."
            className="w-full bg-transparent text-xs text-white placeholder:text-slate-500 outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Status Notes Tray */}
      <div className="px-4 py-3 flex items-start gap-4 overflow-x-auto no-scrollbar border-b border-white/5">
        {/* Your Note */}
        <div 
          onClick={onOpenCreateNote}
          className="flex flex-col items-center cursor-pointer flex-shrink-0 group"
        >
          <div className="relative mb-1">
            <div className="bg-[#16202e] text-slate-200 text-[10px] font-medium px-2 py-1 rounded-xl border border-white/10 shadow-sm max-w-[85px] text-center truncate">
              {notes.find(n => n.userId === "current_user")?.text || "স্ট্যাটাস দিন"}
            </div>
            <div className="w-1.5 h-1.5 bg-[#16202e] rounded-full mx-auto -mt-0.5 border-r border-b border-white/10" />
          </div>

          <div className="relative w-14 h-14 rounded-full p-0.5 ring-2 ring-emerald-500/30">
            <div className="w-full h-full rounded-full overflow-hidden bg-[#1e293b]">
              <img 
                src={currentUserPhoto || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80"} 
                alt="You" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-emerald-500 text-black rounded-full flex items-center justify-center font-black text-xs shadow-md">
              <Plus className="w-3 h-3 stroke-[3]" />
            </div>
          </div>
          <span className="text-[11px] text-slate-300 font-medium mt-1">আপনার স্ট্যাটাস</span>
        </div>

        {/* Friends' Notes */}
        {notes.filter(n => n.userId !== "current_user").map(note => (
          <div key={note.id} className="flex flex-col items-center cursor-pointer flex-shrink-0 group">
            <div className="relative mb-1">
              <div className="bg-[#16202e] text-slate-200 text-[10px] font-medium px-2 py-1 rounded-xl border border-white/10 shadow-sm max-w-[85px] text-center truncate">
                {note.text}
              </div>
              <div className="w-1.5 h-1.5 bg-[#16202e] rounded-full mx-auto -mt-0.5 border-r border-b border-white/10" />
            </div>

            <div className="w-14 h-14 rounded-full p-0.5 ring-2 ring-emerald-400/40">
              <div className="w-full h-full rounded-full overflow-hidden bg-[#1e293b]">
                <img 
                  src={note.userPhotoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"} 
                  alt={note.userName} 
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>
            <span className="text-[11px] text-slate-300 font-medium mt-1 truncate max-w-[70px]">
              {note.userName}
            </span>
          </div>
        ))}
      </div>

      {/* 4. Filter Tabs */}
      <div className="px-4 py-2.5 flex items-center gap-2">
        {[
          { id: 'all', label: 'সকল চ্যাট' },
          { id: 'primary', label: 'মুখ্য' },
          { id: 'requests', label: 'মেসেজ রিকোয়েস্ট' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeFilter === tab.id 
                ? 'bg-emerald-500 text-black font-bold' 
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 5. Clean Conversation Threads */}
      <div className="px-2 divide-y divide-white/5">
        {filteredThreads.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs italic">
            কোনো মেসেজ পাওয়া যায়নি
          </div>
        ) : (
          filteredThreads.map(thread => (
            <div
              key={thread.id}
              onClick={() => onSelectThread(thread)}
              className="px-3 py-3 rounded-xl hover:bg-white/5 flex items-center justify-between gap-3 cursor-pointer transition-colors active:bg-white/10"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Avatar with Online Dot */}
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[#1e293b] flex-shrink-0">
                  <img 
                    src={thread.photoURL || `https://ui-avatars.com/api/?name=${thread.displayName}&background=1e293b&color=fff`} 
                    alt={thread.displayName} 
                    className="w-full h-full object-cover" 
                  />
                  {thread.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[#0b1017]" />
                  )}
                </div>

                {/* Name & Preview */}
                <div className="min-w-0 leading-tight">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-white truncate">
                      {thread.displayName}
                    </h4>
                  </div>
                  <p className={`text-xs truncate mt-1 ${
                    thread.unreadCount > 0 ? 'text-emerald-400 font-semibold' : 'text-slate-400'
                  }`}>
                    {thread.lastMessage || "মেসেজ পাঠিয়েছেন"}
                  </p>
                </div>
              </div>

              {/* Unread Pill or Camera */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {thread.unreadCount > 0 ? (
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-black text-[10px] font-bold flex items-center justify-center">
                    {thread.unreadCount}
                  </span>
                ) : (
                  <Camera className="w-4 h-4 text-slate-500" />
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating New Chat Button */}
      <button 
        onClick={onStartNewChat}
        className="fixed bottom-20 right-4 w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center shadow-lg active:scale-95 transition-all z-40"
        title="নতুন চ্যাট শুরু করুন"
      >
        <Send className="w-5 h-5 -rotate-12 stroke-[2.2]" />
      </button>
    </div>
  );
};
