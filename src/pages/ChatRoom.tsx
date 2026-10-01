import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { 
  ArrowLeft, Send, Image, MoreVertical, 
  Check, CheckCheck, Loader2, User,
  Bot, Sparkles, Clock, ShieldCheck,
  Phone, Video, Info, Heart, Camera, Mic, Smile
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../lib/firebase";
import { 
  collection, query, where, onSnapshot, 
  orderBy, limit, addDoc, doc, setDoc, 
  updateDoc, serverTimestamp, increment, getDoc,
  writeBatch
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { notificationService } from "../lib/notifications";
import { playChatNotificationSound, vibrateDevice } from "../lib/sound";
import { PersonalAiAgentModal } from "../components/chat/PersonalAiAgentModal";
import { InstagramCallModal } from "../components/instagram/InstagramCallModal";
import { CallType } from "../lib/webrtcCallService";
import { format } from "date-fns";
import { bn } from "date-fns/locale";

interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: any;
  read: boolean;
  sentBy?: 'ai_agent' | 'user';
  isAutoReply?: boolean;
  isScheduled?: boolean;
  liked?: boolean;
}

interface ChatRoom {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageAt: any;
  unreadCounts: Record<string, number>;
  users: Record<string, {
    displayName: string;
    photoURL?: string;
  }>;
}

export const ChatRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user, profile } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [targetUser, setTargetUser] = useState<any>(location.state?.targetUser || null);
  const [targetPresence, setTargetPresence] = useState<{ status: string; lastActiveAt?: any }>({ status: 'offline' });
  const [roomData, setRoomData] = useState<ChatRoom | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [activeCallType, setActiveCallType] = useState<CallType | null>(null);
  const [isAiReplying, setIsAiReplying] = useState(false);
  const [likedMessageIds, setLikedMessageIds] = useState<Record<string, boolean>>({});
  const lastMessageIdRef = useRef<string | null>(null);
  const isFirstLoadRef = useRef<boolean>(true);

  // 1. Fetch Room Data and Target User Info
  useEffect(() => {
    if (!roomId || !user) return;

    const roomRef = doc(db, "chat_rooms", roomId);
    const unsubscribe = onSnapshot(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as ChatRoom;
        setRoomData({ id: snapshot.id, ...data });
        
        if (!targetUser) {
          const otherId = data.participants.find(p => p !== user.uid);
          if (otherId) {
            setTargetUser({ id: otherId, ...data.users[otherId] });
          }
        }

        if (data.unreadCounts?.[user.uid] > 0) {
          updateDoc(roomRef, {
            [`unreadCounts.${user.uid}`]: 0
          });
        }
      }
    });

    return () => unsubscribe();
  }, [roomId, user]);

  // Track target user presence (online/offline)
  useEffect(() => {
    if (!targetUser?.id) return;
    const unsub = onSnapshot(doc(db, "users", targetUser.id), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setTargetPresence({
          status: data.status || 'offline',
          lastActiveAt: data.lastActiveAt
        });
      }
    }, () => {});

    return () => unsub();
  }, [targetUser?.id]);

  // 2. Listen for Messages
  useEffect(() => {
    if (!roomId) return;

    const q = query(
      collection(db, "chat_rooms", roomId, "messages"),
      orderBy("createdAt", "asc"),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      
      if (!isFirstLoadRef.current && list.length > 0) {
        const lastMsg = list[list.length - 1];
        if (lastMsg.id !== lastMessageIdRef.current && lastMsg.senderId !== user?.uid) {
          playChatNotificationSound();
          vibrateDevice([150, 80, 150]);
        }
      }

      if (list.length > 0) {
        lastMessageIdRef.current = list[list.length - 1].id;
      }
      isFirstLoadRef.current = false;

      setMessages(list);
      setLoading(false);
      
      // Mark as read in Firestore
      if (user) {
        const unreadMessages = snapshot.docs.filter(d => !d.data().read && d.data().senderId !== user.uid);
        if (unreadMessages.length > 0) {
          const batch = writeBatch(db);
          unreadMessages.forEach(d => {
            batch.update(d.ref, { read: true });
          });
          batch.commit().catch(console.error);
        }
      }
    });

    return () => unsubscribe();
  }, [roomId, user]);

  // 3. Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isAiReplying]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || newMessage).trim();
    if (!text || !user || !roomId || !targetUser) return;

    setNewMessage("");

    const messageData = {
      senderId: user.uid,
      text: text,
      createdAt: serverTimestamp(),
      read: false,
      sentBy: "user"
    };

    try {
      const roomRef = doc(db, "chat_rooms", roomId);
      const updateData: any = {
        lastMessage: text,
        lastMessageAt: serverTimestamp(),
        [`unreadCounts.${targetUser.id}`]: increment(1),
        participants: [user.uid, targetUser.id].sort(),
        users: {
          [user.uid]: {
            displayName: profile?.displayName || user.displayName || "User",
            photoURL: profile?.photoURL || user.photoURL || ""
          },
          [targetUser.id]: {
            displayName: targetUser.displayName || "User",
            photoURL: targetUser.photoURL || ""
          }
        }
      };

      await setDoc(roomRef, updateData, { merge: true });
      await addDoc(collection(db, "chat_rooms", roomId, "messages"), messageData);

      // Push Notification
      notificationService.sendNotification(
        profile?.displayName || user.displayName || "Chat",
        text,
        [targetUser.id],
        {
          roomId: roomId,
          senderId: user.uid,
          senderName: profile?.displayName || user.displayName || "User",
          type: 'chat',
          url: `/chat/${roomId}`
        }
      ).catch(() => {});

      // Trigger Personal AI Agent Auto-Reply if recipient is offline
      if (targetPresence.status !== 'online') {
        setIsAiReplying(true);
        fetch("/api/ai-agent/auto-reply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            senderId: user.uid,
            senderName: profile?.displayName || user.displayName || "User",
            recipientId: targetUser.id,
            recipientName: targetUser.displayName || "User",
            roomId: roomId,
            message: text,
            recentMessages: messages.slice(-5).map(m => ({
              text: m.text,
              senderName: m.senderId === user.uid ? (profile?.displayName || "You") : (targetUser.displayName || "User")
            }))
          })
        })
        .catch(() => {})
        .finally(() => setIsAiReplying(false));
      }

    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const toggleDoubleTapLike = (msgId: string) => {
    setLikedMessageIds(prev => ({ ...prev, [msgId]: !prev[msgId] }));
    vibrateDevice([50]);
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, "h:mm a", { locale: language === 'bn' ? bn : undefined });
  };

  return (
    <div className="flex flex-col h-screen bg-[#0b1017] text-slate-100 max-w-lg mx-auto md:max-w-xl font-sans">
      {/* 1. Header Bar */}
      <header className="sticky top-0 z-50 bg-[#0b1017]/95 backdrop-blur-xl px-3 py-3 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2.5 min-w-0">
          <button 
            onClick={() => navigate("/chat")} 
            className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-200 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative w-9 h-9 rounded-full overflow-hidden bg-[#1e293b] flex-shrink-0">
              <img 
                src={targetUser?.photoURL || `https://ui-avatars.com/api/?name=${targetUser?.displayName || "User"}&background=1e293b&color=fff`} 
                alt="" 
                className="w-full h-full object-cover" 
              />
              <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-[#0b1017] ${
                targetPresence.status === 'online' ? 'bg-emerald-500' : 'bg-slate-500'
              }`} />
            </div>

            <div className="leading-tight min-w-0">
              <h2 className="font-bold text-sm text-white truncate">
                {targetUser?.displayName || "User"}
              </h2>
              <div className="flex items-center gap-1 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${targetPresence.status === 'online' ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                <p className="text-[11px] text-slate-400 truncate">
                  {targetPresence.status === 'online' ? 'অনলাইনে আছেন' : 'অফলাইন • AI সক্রিয়'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setActiveCallType('audio')}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="অডিও কল"
          >
            <Phone className="w-4 h-4 text-emerald-400" />
          </button>
          <button 
            onClick={() => setActiveCallType('video')}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="ভিডিও কল"
          >
            <Video className="w-4 h-4 text-emerald-400" />
          </button>
          <button 
            onClick={() => setIsAiModalOpen(true)}
            className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-emerald-400 text-xs font-semibold flex items-center gap-1 transition-colors ml-1"
            title="AI সহকারী ও মেসেজ শিডিউল"
          >
            <Bot className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold">AI</span>
          </button>
        </div>
      </header>

      {/* 2. Message History View */}
      <main ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-2 text-slate-400 p-6">
            <div className="w-14 h-14 rounded-full bg-[#131b26] flex items-center justify-center text-emerald-400 mb-2">
              <Bot className="w-7 h-7" />
            </div>
            <p className="text-sm font-bold text-white">কথোপকথন শুরু করুন</p>
            <p className="text-xs text-slate-400 max-w-xs">
              ইউজার অফলাইনে থাকলে তার AI সহকারী অটোমেটিক উত্তর প্রদান করবে।
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 max-w-xl mx-auto">
            {messages.map((msg, idx) => {
              const isMe = msg.senderId === user?.uid;
              const isAi = msg.sentBy === 'ai_agent' || msg.isAutoReply || msg.isScheduled;
              const isLiked = likedMessageIds[msg.id] || msg.liked;
              const prevMsg = idx > 0 ? messages[idx - 1] : null;

              const isHandover = prevMsg && 
                (prevMsg.sentBy === 'ai_agent' || prevMsg.isAutoReply) && 
                (!isAi || msg.sentBy === 'user') && 
                prevMsg.senderId === msg.senderId;

              return (
                <React.Fragment key={msg.id}>
                  {isHandover && (
                    <div className="flex justify-center my-3">
                      <span className="text-[10px] text-emerald-400 font-medium px-3 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        ইউজার সরাসরি যুক্ত হয়েছেন
                      </span>
                    </div>
                  )}

                  <div 
                    onDoubleClick={() => toggleDoubleTapLike(msg.id)}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="relative group max-w-[80%]">
                      <div className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                        isAi 
                          ? isMe 
                            ? 'bg-emerald-700 text-white rounded-br-xs' 
                            : 'bg-[#152722] text-emerald-200 border border-emerald-500/30 rounded-bl-xs'
                          : isMe
                            ? 'bg-emerald-600 text-white rounded-br-xs'
                            : 'bg-[#1e293b] text-slate-100 rounded-bl-xs'
                      }`}>
                        {/* AI Badge (quiet & clean) */}
                        {isAi && (
                          <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-300 mb-1 opacity-90">
                            <Bot className="w-3 h-3" />
                            <span>
                              {isMe ? 'AI সহকারী' : `${targetUser?.displayName || 'ইউজার'}-এর AI`}
                            </span>
                            {msg.isAutoReply && <span>· অটো-রিপ্লাই</span>}
                            {msg.isScheduled && <span>· শিডিউল</span>}
                          </div>
                        )}

                        <p className="whitespace-pre-wrap">{msg.text}</p>

                        <div className="flex items-center justify-end gap-1 mt-0.5 opacity-70 text-[10px]">
                          <span>{formatTime(msg.createdAt)}</span>
                          {isMe && (
                            msg.read ? <CheckCheck className="w-3.5 h-3.5 text-emerald-200" /> : <Check className="w-3.5 h-3.5" />
                          )}
                        </div>
                      </div>

                      {/* Double Tap Heart */}
                      {isLiked && (
                        <div className="absolute -bottom-1.5 -right-1 bg-[#1e293b] rounded-full p-0.5 shadow-md">
                          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                        </div>
                      )}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}

            {isAiReplying && (
              <div className="flex justify-start">
                <div className="bg-[#152722] border border-emerald-500/30 rounded-xl px-3 py-1.5 text-xs text-emerald-300 flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                  <span>AI উত্তর তৈরি করছে...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 3. Input Bar */}
      <div className="p-3 bg-[#0b1017] border-t border-white/10">
        <div className="flex items-center gap-2 max-w-xl mx-auto">
          {/* Snapshot Button */}
          <button 
            type="button" 
            onClick={() => handleSendMessage("📸 [ছবি শেয়ার করা হয়েছে]")}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-colors flex-shrink-0"
            title="ছবি তুলুন"
          >
            <Camera className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <div className="flex-1 flex items-center bg-[#131b26] rounded-full px-4 py-2 border border-white/5 focus-within:border-emerald-500/50 transition-colors">
            <input 
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="মেসেজ লিখুন..."
              className="flex-1 bg-transparent text-xs text-white placeholder:text-slate-500 outline-none"
            />

            {!newMessage.trim() ? (
              <div className="flex items-center gap-2 text-slate-400">
                <button 
                  type="button" 
                  onClick={() => setIsAiModalOpen(true)}
                  className="hover:text-emerald-400 p-1"
                  title="মেসেজ শিডিউল"
                >
                  <Bot className="w-4 h-4" />
                </button>
                <button 
                  type="button" 
                  onClick={() => handleSendMessage("❤️")}
                  className="hover:text-rose-500 p-1"
                >
                  <Heart className="w-4 h-4 text-rose-500" />
                </button>
              </div>
            ) : (
              <button 
                type="button"
                onClick={() => handleSendMessage()}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 ml-1.5"
              >
                পাঠান
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Personal AI Agent Modal */}
      <PersonalAiAgentModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        availableUsers={targetUser ? [{ id: targetUser.id, displayName: targetUser.displayName, photoURL: targetUser.photoURL }] : []}
        preselectedUserId={targetUser?.id}
      />

      {/* WebRTC Real-Time Call Modal */}
      {activeCallType && user && targetUser && (
        <InstagramCallModal
          isOpen={Boolean(activeCallType)}
          onClose={() => setActiveCallType(null)}
          callType={activeCallType}
          caller={{
            id: user.uid,
            name: profile?.displayName || user.displayName || "User",
            photo: profile?.photoURL || user.photoURL || ""
          }}
          target={{
            id: targetUser.id,
            name: targetUser.displayName || "User",
            photo: targetUser.photoURL || ""
          }}
        />
      )}
    </div>
  );
};

export default ChatRoom;
