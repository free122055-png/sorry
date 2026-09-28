import React, { useState, useEffect } from "react";
import { 
  Bell, Plus, Calendar, Clock, Repeat, Music, 
  Trash2, Send, User, ChevronLeft, Search, 
  CheckCircle2, AlertCircle, X, Loader2, Copy, Check,
  ShieldAlert, ShieldCheck, Heart, Gift, Moon, Sparkles,
  Users, PartyPopper, Cake, Star, MessageCircle, ChevronRight, Share2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { notificationService } from "../lib/notifications";
import { db } from "../lib/firebase";
import { 
  collection, addDoc, query, where, orderBy, 
  onSnapshot, doc, deleteDoc, getDocs, limit, serverTimestamp, updateDoc, getDoc
} from "firebase/firestore";
import { CustomDropdown } from "../components/CustomDropdown";
import { Connections } from "../components/Connections";
import { BirthdaySurprise } from "../components/BirthdaySurprise";
import { CreatePersonalViewComponent, SendWishViewComponent } from "../components/reminders/ReminderFormViews";

// --- Types & Constants ---
interface Reminder {
  id: string;
  creatorId: string;
  creatorName: string;
  recipientId: string;
  title: string;
  description: string;
  date: string;
  time: string;
  scheduledAt: number;
  repeat: string;
  priority: 'Low' | 'Medium' | 'High';
  type: 'personal' | 'wish';
  wishType?: string;
  templateId?: string;
  customMessage?: string;
  senderName?: string;
  recipientName?: string;
  signature?: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: any;
}

const WISH_TEMPLATES = [
  { id: 'birthday_celebration', name: 'Birthday Celebration', emoji: '🎂', preview: 'https://images.unsplash.com/photo-1530103862676-fa8c91abe178?w=200&q=80' },
  { id: 'balloons', name: 'Balloons', emoji: '🎈', preview: 'https://images.unsplash.com/photo-1525268771113-32d9e9020a97?w=200&q=80' },
  { id: 'golden_celebration', name: 'Golden Celebration', emoji: '✨', preview: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=200&q=80' },
  { id: 'luxury_birthday', name: 'Luxury Birthday', emoji: '👑', preview: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=200&q=80' },
  { id: 'sparkle', name: 'Sparkle', emoji: '💫', preview: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=200&q=80' },
  { id: 'soft_elegant', name: 'Soft Elegant', emoji: '🌸', preview: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=200&q=80' },
  { id: 'gift_reveal', name: 'Gift Reveal', emoji: '🎁', preview: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=200&q=80' },
  { id: 'friendship', name: 'Friendship', emoji: '🤝', preview: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=200&q=80' },
  { id: 'minimal_premium', name: 'Minimal Premium', emoji: '⚪', preview: 'https://images.unsplash.com/photo-1477233534935-f5e6fe7c1159?w=200&q=80' },
  { id: 'celebration_party', name: 'Celebration Party', emoji: '🎉', preview: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=200&q=80' },
];

const CATEGORIES = [
  { id: 'birthday', name: 'Birthday', icon: <Cake className="w-5 h-5" />, color: 'bg-rose-100 text-rose-600', wishType: 'Birthday Wish' },
  { id: 'anniversary', name: 'Anniversary', icon: <Heart className="w-5 h-5" />, color: 'bg-pink-100 text-pink-600', wishType: 'Anniversary Reminder' },
  { id: 'congrats', name: 'Congratulations', icon: <PartyPopper className="w-5 h-5" />, color: 'bg-amber-100 text-amber-600', wishType: 'Congratulations' },
  { id: 'dua', name: 'Dua / Good Wish', icon: <Moon className="w-5 h-5" />, color: 'bg-emerald-100 text-emerald-600', wishType: 'Dua / Good Wish' },
  { id: 'event', name: 'Important Event', icon: <Calendar className="w-5 h-5" />, color: 'bg-blue-100 text-blue-600', wishType: 'Important Event' },
  { id: 'custom', name: 'Custom Reminder', icon: <Bell className="w-5 h-5" />, color: 'bg-indigo-100 text-indigo-600', wishType: 'Custom Reminder' },
];

const REPEAT_OPTIONS = [
  { id: 'No Repeat', nameBn: 'একবার (No Repeat)' },
  { id: 'Daily', nameBn: 'প্রতিদিন (Daily)' },
  { id: 'Weekly', nameBn: 'প্রতি সপ্তাহে (Weekly)' },
  { id: 'Monthly', nameBn: 'প্রতি মাসে (Monthly)' },
];

const PRIORITY_OPTIONS = [
  { id: 'Low', nameBn: 'Low' },
  { id: 'Medium', nameBn: 'Medium' },
  { id: 'High', nameBn: 'High' },
];

export const Reminders: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuth();
  
  const [view, setView] = useState<'home' | 'connections' | 'create-personal' | 'send-wish'>('home');
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [sentReminders, setSentReminders] = useState<Reminder[]>([]);
  const [receivedReminders, setReceivedReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSurprise, setActiveSurprise] = useState<Reminder | null>(null);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);

  // Form State (Shared)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    time: "08:00",
    repeat: "No Repeat",
    priority: "Medium" as 'Low' | 'Medium' | 'High',
    enableNotification: true,
    recipientId: "",
    recipientName: "",
    templateId: "birthday_celebration",
    customMessage: "",
    signature: "",
    type: 'personal' as 'personal' | 'wish',
    wishType: 'Birthday'
  });

  const [wishStep, setWishStep] = useState(1);
  const [approvedConnections, setApprovedConnections] = useState<{id: string, displayName: string, photoURL: string, reminderCode: string}[]>([]);

  // Fetch Logic
  useEffect(() => {
    if (!user) {
      navigate("/login?redirect=/reminders");
      return;
    }

    // 1. Fetch Approved Connections
    const qConn = query(collection(db, "connections"), where("status", "==", "approved"));
    const unsubConn = onSnapshot(qConn, async (snap) => {
      const conns = snap.docs.map(d => d.data());
      const friendIds = conns.map(c => c.userA === user.uid ? c.userB : c.userA).filter(id => id !== undefined);
      
      const friends = await Promise.all(friendIds.map(async id => {
        const d = await getDoc(doc(db, "users", id));
        return d.exists() ? { id: d.id, ...d.data() } as any : null;
      }));
      setApprovedConnections(friends.filter(Boolean));
    });

    // 2. Fetch Reminders (Received and Personal)
    const qReceived = query(
      collection(db, "reminders_v2"),
      where("recipientId", "==", user.uid),
      orderBy("scheduledAt", "asc")
    );
    const unsubReceived = onSnapshot(qReceived, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reminder));
      setReceivedReminders(data);
    });

    // 3. Fetch Sent Reminders
    const qSent = query(
      collection(db, "reminders_v2"),
      where("creatorId", "==", user.uid),
      where("type", "==", "wish"),
      orderBy("scheduledAt", "desc")
    );
    const unsubSent = onSnapshot(qSent, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reminder));
      setSentReminders(data);
    });

    setLoading(false);
    
    // Voice Guidance on Entry
    // Voice guidance removed

    return () => { unsubConn(); unsubReceived(); unsubSent(); };
  }, [user, navigate]);

  // Voice Guidance on View Change
  useEffect(() => {
  }, [view]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const surpriseId = params.get('surprise');
    const reminderId = params.get('id');
    const viewParam = params.get('view');

    if (viewParam === 'create-personal') {
      setView(prev => prev === 'create-personal' ? prev : 'create-personal');
    } else if (viewParam === 'send-wish') {
      setView(prev => prev === 'send-wish' ? prev : 'send-wish');
    } else if (viewParam === 'connections') {
      setView(prev => prev === 'connections' ? prev : 'connections');
    }

    if (surpriseId) {
      const fetchSurprise = async () => {
        const d = await getDoc(doc(db, "reminders_v2", surpriseId));
        if (d.exists()) {
          const reminder = { id: d.id, ...d.data() } as Reminder;
          if (reminder.recipientId === user?.uid) {
            setActiveSurprise(reminder);
          }
        }
      };
      fetchSurprise();
    }

    if (reminderId) {
      const fetchReminder = async () => {
        const d = await getDoc(doc(db, "reminders_v2", reminderId));
        if (d.exists()) {
          const reminder = { id: d.id, ...d.data() } as Reminder;
          if (reminder.recipientId === user?.uid || reminder.creatorId === user?.uid) {
            setSelectedReminder(reminder);
          }
        }
      };
      fetchReminder();
    }
  }, [location.search, user?.uid]);

  const handleCreatePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.time) return;

    setIsSubmitting(true);
    try {
      const scheduledAt = new Date(`${formData.date}T${formData.time}`).getTime();
      const newReminder = {
        creatorId: user!.uid,
        creatorName: profile?.displayName || "User",
        recipientId: user!.uid,
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        scheduledAt,
        repeat: formData.repeat,
        priority: formData.priority,
        type: 'personal',
        status: 'active',
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, "reminders_v2"), newReminder);

      // Trigger notification if scheduled for now or near future
      if (formData.enableNotification && scheduledAt <= Date.now() + 60000) {
        notificationService.sendNotification(
          `🔔 রিমাইন্ডার: ${newReminder.title}`,
          newReminder.description || "আপনার রিমাইন্ডারের সময় হয়েছে।",
          [user!.uid],
          { type: "personal_reminder", reminderId: "new" }
        );
      }

      setView('home');
      resetForm();
    } catch (err) {
      alert("Error creating reminder");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendWish = async () => {
    if (!formData.recipientId || !formData.date || !formData.time) return;

    setIsSubmitting(true);
    try {
      const scheduledAt = new Date(`${formData.date}T${formData.time}`).getTime();
      const newWish = {
        ...formData,
        creatorId: user!.uid,
        creatorName: profile?.displayName || "User",
        senderName: formData.signature || profile?.displayName || "Friend",
        scheduledAt,
        status: 'active',
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, "reminders_v2"), newWish);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        try {
          const utterance = new SpeechSynthesisUtterance("আপনার উইশটি সফলভাবে শিডিউল করা হয়েছে।");
          utterance.lang = "bn-BD";
          window.speechSynthesis.speak(utterance);
        } catch {}
      }
      
      // If scheduled for now, send notification immediately
      if (scheduledAt <= Date.now() + 60000) {
        notificationService.sendNotification(
          "🎂 আপনার জন্য একটি Birthday Surprise এসেছে!",
          `${newWish.senderName} আপনাকে একটি উইশ পাঠিয়েছেন।`,
          [formData.recipientId],
          { surprise: docRef.id }
        );
      }

      setView('home');
      resetForm();
      alert("উইশ সফলভাবে শিডিউল করা হয়েছে!");
    } catch (err) {
      alert("Error sending wish");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      date: new Date().toISOString().split('T')[0],
      time: "08:00",
      repeat: "No Repeat",
      priority: "Medium",
      enableNotification: true,
      recipientId: "",
      recipientName: "",
      templateId: "birthday_celebration",
      customMessage: "",
      signature: "",
      type: 'personal',
      wishType: 'Birthday'
    });
    setWishStep(1);
  };

  const handleDeleteReminder = async (id: string) => {
    if (window.confirm("মুছে ফেলতে চান?")) {
      await deleteDoc(doc(db, "reminders_v2", id));
    }
  };

  // --- Views ---

  const HomeView = () => (
    <div className="space-y-8">
      {/* Shared Reminders Grid */}
      <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <h4 className="text-sm font-black text-gray-900">Shared Reminders</h4>
          <p className="text-[10px] font-bold text-gray-400">বন্ধুদের পাঠানো উইশ সমূহ</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
          <Gift className="w-6 h-6 text-emerald-600" />
        </div>
      </div>

      {/* Category Icons Grid */}
      <div className="grid grid-cols-3 gap-3">
        {CATEGORIES.filter(c => c.id !== 'custom').map(cat => (
          <motion.button
            key={cat.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setFormData({...formData, type: 'wish', wishType: cat.wishType});
              setView('send-wish');
            }}
            className="bg-white rounded-[24px] p-4 border border-gray-100 shadow-sm flex flex-col items-center text-center gap-2"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.color}`}>
              {cat.icon}
            </div>
            <h5 className="text-[9px] font-black text-gray-900 leading-tight">{cat.name}</h5>
          </motion.button>
        ))}
      </div>

      {/* Connection Entry */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => setView('connections')}
        className="w-full bg-indigo-600 rounded-[28px] p-5 flex items-center justify-between text-white shadow-xl shadow-indigo-200"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h4 className="text-sm font-black tracking-tight">Friends & Connections</h4>
            <p className="text-[10px] font-bold opacity-80">কোড দিয়ে বন্ধু যুক্ত করুন</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 opacity-60" />
      </motion.button>
    </div>
  );

  if (activeSurprise) {
    return (
      <BirthdaySurprise
        templateId={activeSurprise.templateId || "birthday_celebration"}
        recipientName={activeSurprise.recipientName || profile?.displayName || "Friend"}
        senderName={activeSurprise.senderName || "Your Friend"}
        message={activeSurprise.customMessage || "Wishing you a very Happy Birthday!"}
        onClose={() => setActiveSurprise(null)}
      />
    );
  }

  if (view === 'connections') return <Connections onBack={() => setView('home')} />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-xl px-4 py-4 sticky top-0 z-40 flex items-center justify-between border-b border-gray-100/50 shadow-sm">
        <div className="flex items-center gap-3">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              if (view === 'home') navigate("/");
              else setView('home');
            }}
            className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-900 border border-gray-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
          <div>
            <h1 className="text-lg font-black text-gray-900 leading-tight">রিমাইন্ডার</h1>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
              {view === 'home' ? 'Personal & Shared' : view.replace('-', ' ')}
            </p>
          </div>
        </div>
        {view === 'home' && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setView('create-personal')}
            className="bg-gray-900 text-white p-3 rounded-2xl shadow-xl shadow-gray-900/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        )}
      </div>

      <main className="p-5">
        {view === 'home' && <HomeView />}
        {view === 'create-personal' && (
          <CreatePersonalViewComponent
            formData={formData}
            setFormData={setFormData}
            handleCreatePersonal={handleCreatePersonal}
            isSubmitting={isSubmitting}
            repeatOptions={REPEAT_OPTIONS}
            priorityOptions={PRIORITY_OPTIONS}
          />
        )}
        {view === 'send-wish' && (
          <SendWishViewComponent
            formData={formData}
            setFormData={setFormData}
            wishStep={wishStep}
            setWishStep={setWishStep}
            approvedConnections={approvedConnections}
            wishTemplates={WISH_TEMPLATES}
            handleSendWish={handleSendWish}
            isSubmitting={isSubmitting}
            setView={setView}
          />
        )}
      </main>

      {/* Reminder Detail Modal */}
      <AnimatePresence>
        {selectedReminder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSelectedReminder(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[40px] overflow-hidden shadow-2xl"
            >
              <div className={`p-8 text-center ${selectedReminder.type === 'wish' ? 'bg-rose-600' : 'bg-blue-600'} text-white`}>
                <div className="w-20 h-20 bg-white/20 rounded-[28px] flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                  {selectedReminder.type === 'wish' ? <Gift className="w-10 h-10" /> : <Bell className="w-10 h-10" />}
                </div>
                <h2 className="text-2xl font-black tracking-tight">{selectedReminder.title || selectedReminder.wishType}</h2>
                <p className="text-[11px] font-bold opacity-80 uppercase tracking-widest mt-1">Reminder Details</p>
              </div>

              <div className="p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100">
                    <Calendar className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Scheduled For</p>
                    <h4 className="text-base font-black text-gray-900">{selectedReminder.date} at {selectedReminder.time}</h4>
                  </div>
                </div>

                {selectedReminder.description && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Notes</p>
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <p className="text-sm font-bold text-gray-600 leading-relaxed">{selectedReminder.description}</p>
                    </div>
                  </div>
                )}

                {selectedReminder.type === 'wish' && (
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      <p className="text-[11px] font-bold text-gray-500">Sent by: <span className="font-black text-rose-600">{selectedReminder.senderName}</span></p>
                    </div>
                    {selectedReminder.customMessage && (
                      <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 italic">
                        <p className="text-sm font-bold text-rose-900">"{selectedReminder.customMessage}"</p>
                      </div>
                    )}
                  </div>
                )}

                <button 
                  onClick={() => setSelectedReminder(null)}
                  className="w-full py-4.5 bg-gray-900 text-white rounded-2xl font-black text-sm active:scale-95 transition-all shadow-xl shadow-gray-200"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
