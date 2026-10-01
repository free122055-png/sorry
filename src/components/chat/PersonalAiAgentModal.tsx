import React, { useState, useEffect } from "react";
import { 
  Bot, X, Sparkles, Clock, ShieldCheck, 
  Send, Trash2, Calendar, Check, AlertCircle, 
  Loader2, User, ChevronRight, CheckCircle2,
  Sliders, History, MessageSquare, Play, Pause
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../../lib/firebase";
import { 
  doc, getDoc, setDoc, collection, query, 
  where, onSnapshot, orderBy, limit, addDoc, 
  deleteDoc, updateDoc, serverTimestamp 
} from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { format } from "date-fns";
import { bn } from "date-fns/locale";

interface PersonalAiAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableUsers: Array<{
    id: string;
    displayName: string;
    photoURL?: string;
  }>;
  preselectedUserId?: string;
}

export interface UserAiAgentConfig {
  enabled: boolean;
  agentName: string;
  statusMode: 'auto' | 'sleep' | 'always';
  persona: 'friendly' | 'professional' | 'concise';
  customInstructions: string;
  autoReplyOffline: boolean;
  allowScheduledMessages: boolean;
  sensitiveActionGuard: boolean;
  sleepScheduleStart: string;
  sleepScheduleEnd: string;
}

export interface ScheduledMessageItem {
  id: string;
  senderId: string;
  senderName: string;
  targetUserId: string;
  targetUserName: string;
  roomId: string;
  message: string;
  scheduledAt: number;
  status: 'pending' | 'sent' | 'cancelled';
  sentAt?: number;
  createdAt: number;
}

export interface AiAgentLogItem {
  id: string;
  userId: string;
  action: string;
  targetUserId?: string;
  targetUserName?: string;
  details: string;
  timestamp: number;
}

export const PersonalAiAgentModal: React.FC<PersonalAiAgentModalProps> = ({
  isOpen,
  onClose,
  availableUsers,
  preselectedUserId
}) => {
  const { user, profile } = useAuth();

  const [activeTab, setActiveTab] = useState<'settings' | 'schedule' | 'logs'>('settings');

  // Config State
  const [config, setConfig] = useState<UserAiAgentConfig>({
    enabled: true,
    agentName: "আমার AI অ্যাসিস্ট্যান্ট",
    statusMode: 'auto',
    persona: 'friendly',
    customInstructions: "আমি রাত ১১টা থেকে সকাল ৭টা পর্যন্ত ঘুমাচ্ছি। কেউ মেসেজ দিলে বলো আমি বিশ্রামে আছি, সকালে উত্তর দেব।",
    autoReplyOffline: true,
    allowScheduledMessages: true,
    sensitiveActionGuard: true,
    sleepScheduleStart: "23:00",
    sleepScheduleEnd: "07:00"
  });

  const [savingConfig, setSavingConfig] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Scheduling State
  const [targetUserId, setTargetUserId] = useState(preselectedUserId || "");
  const [scheduleMessageText, setScheduleMessageText] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [aiCommandInput, setAiCommandInput] = useState("");
  const [parsingCommand, setParsingCommand] = useState(false);
  const [schedulingLoading, setSchedulingLoading] = useState(false);

  // Queues and Logs
  const [scheduledList, setScheduledList] = useState<ScheduledMessageItem[]>([]);
  const [logsList, setLogsList] = useState<AiAgentLogItem[]>([]);

  // 1. Fetch AI Agent Settings
  useEffect(() => {
    if (!user || !isOpen) return;

    const fetchConfig = async () => {
      try {
        const docRef = doc(db, "user_ai_agents", user.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setConfig({ ...config, ...snap.data() as UserAiAgentConfig });
        } else {
          // Set default user name in agent name
          const defaultName = profile?.displayName ? `${profile.displayName}-এর AI এজেন্ট` : "আমার AI অ্যাসিস্ট্যান্ট";
          setConfig(prev => ({ ...prev, agentName: defaultName }));
        }
      } catch (e) {
        console.warn("Config fetch notice:", e);
      }
    };

    fetchConfig();
  }, [user, isOpen]);

  // Set default schedule date & time
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      now.setMinutes(now.getMinutes() + 30);
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");
      setScheduleDate(`${yyyy}-${mm}-${dd}`);

      const hh = String(now.getHours()).padStart(2, "0");
      const min = String(now.getMinutes()).padStart(2, "0");
      setScheduleTime(`${hh}:${min}`);

      if (preselectedUserId) {
        setTargetUserId(preselectedUserId);
      }
    }
  }, [isOpen, preselectedUserId]);

  // 2. Fetch Scheduled Messages
  useEffect(() => {
    if (!user || !isOpen) return;

    const q = query(
      collection(db, "scheduled_messages"),
      where("senderId", "==", user.uid),
      orderBy("scheduledAt", "desc"),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ScheduledMessageItem));
      setScheduledList(list);
    }, (err) => {
      console.warn("Scheduled messages fetch notice:", err);
    });

    return () => unsubscribe();
  }, [user, isOpen]);

  // 3. Fetch Activity Logs
  useEffect(() => {
    if (!user || !isOpen) return;

    const q = query(
      collection(db, "ai_agent_logs"),
      where("userId", "==", user.uid),
      orderBy("timestamp", "desc"),
      limit(30)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AiAgentLogItem));
      setLogsList(list);
    }, (err) => {
      console.warn("AI logs fetch notice:", err);
    });

    return () => unsubscribe();
  }, [user, isOpen]);

  // Save Settings
  const handleSaveConfig = async () => {
    if (!user) return;
    setSavingConfig(true);
    try {
      await setDoc(doc(db, "user_ai_agents", user.uid), {
        ...config,
        userId: user.uid,
        updatedAt: Date.now()
      }, { merge: true });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error("Failed to save AI config:", e);
      alert("সেটিংস সেভ করতে সমস্যা হয়েছে।");
    } finally {
      setSavingConfig(false);
    }
  };

  // Natural Language Command Parser
  const handleParseAiCommand = async () => {
    if (!aiCommandInput.trim()) return;
    setParsingCommand(true);
    try {
      const res = await fetch("/api/ai-agent/parse-command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command: aiCommandInput.trim(),
          availableUsers: availableUsers.map(u => ({ id: u.id, displayName: u.displayName }))
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.data) {
          const parsed = data.data;
          if (parsed.targetUserId) {
            setTargetUserId(parsed.targetUserId);
          }
          if (parsed.messageText) {
            setScheduleMessageText(parsed.messageText);
          }
          if (parsed.scheduledAtTimestamp) {
            const dt = new Date(parsed.scheduledAtTimestamp);
            const yyyy = dt.getFullYear();
            const mm = String(dt.getMonth() + 1).padStart(2, "0");
            const dd = String(dt.getDate()).padStart(2, "0");
            setScheduleDate(`${yyyy}-${mm}-${dd}`);

            const hh = String(dt.getHours()).padStart(2, "0");
            const min = String(dt.getMinutes()).padStart(2, "0");
            setScheduleTime(`${hh}:${min}`);
          }
          alert(`AI ডিটেকশন সফল: "${parsed.explanation}"`);
        }
      } else {
        alert("কমান্ডটি বুঝতে সমস্যা হয়েছে। ম্যানুয়ালি তথ্য পূরণ করুন।");
      }
    } catch (err) {
      console.warn("Parse error:", err);
      alert("AI কমান্ড পার্স করা যায়নি।");
    } finally {
      setParsingCommand(false);
    }
  };

  // Schedule Message Submission
  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !targetUserId || !scheduleMessageText.trim() || !scheduleDate || !scheduleTime) {
      alert("দয়া করে সকল তথ্য পূরণ করুন।");
      return;
    }

    const scheduledDateObj = new Date(`${scheduleDate}T${scheduleTime}`);
    const scheduledTimestamp = scheduledDateObj.getTime();

    if (isNaN(scheduledTimestamp) || scheduledTimestamp <= Date.now() + 30000) {
      alert("শিডিউল সময়টি অবশ্যই বর্তমান সময়ের চেয়ে কমপক্ষে ১ মিনিট পরের হতে হবে।");
      return;
    }

    setSchedulingLoading(true);
    try {
      const targetUserObj = availableUsers.find(u => u.id === targetUserId);
      const targetName = targetUserObj?.displayName || "User";
      const roomId = [user.uid, targetUserId].sort().join("_");

      await addDoc(collection(db, "scheduled_messages"), {
        senderId: user.uid,
        senderName: profile?.displayName || user.displayName || "User",
        targetUserId: targetUserId,
        targetUserName: targetName,
        roomId: roomId,
        message: scheduleMessageText.trim(),
        scheduledAt: scheduledTimestamp,
        status: "pending",
        createdAt: Date.now()
      });

      // Log action
      await addDoc(collection(db, "ai_agent_logs"), {
        userId: user.uid,
        action: "scheduled_message_created",
        targetUserId: targetUserId,
        targetUserName: targetName,
        details: `নতুন শিডিউল সেট করা হয়েছে: "${scheduleMessageText.trim()}" (তারিখ: ${scheduleDate} ${scheduleTime})`,
        timestamp: Date.now()
      });

      setScheduleMessageText("");
      setAiCommandInput("");
      alert(`মেসেজটি সফলভাবে শিডিউল করা হয়েছে! ${targetName}-কে নির্ধারিত সময়ে আপনার AI এজেন্ট পাঠিয়ে দেবে।`);
    } catch (err) {
      console.error("Error creating schedule:", err);
      alert("শিডিউল তৈরি করতে সমস্যা হয়েছে।");
    } finally {
      setSchedulingLoading(false);
    }
  };

  // Cancel Scheduled Message
  const handleCancelSchedule = async (scheduleId: string) => {
    if (!confirm("আপনি কি নিশ্চিত এই শিডিউল মেসেজটি বাতিল করতে চান?")) return;
    try {
      await updateDoc(doc(db, "scheduled_messages", scheduleId), {
        status: "cancelled",
        cancelledAt: Date.now()
      });
    } catch (e) {
      console.error("Cancel error:", e);
      alert("বাতিল করা সম্ভব হয়নি।");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-emerald-100"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#075e54] via-[#0b7a6e] to-[#128c7e] text-white p-4 sm:p-5 flex items-center justify-between shadow-md flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md flex items-center justify-center shadow-inner">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">{config.agentName}</h2>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                  config.enabled ? 'bg-emerald-400 text-emerald-950' : 'bg-red-400 text-red-950'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                  {config.enabled ? 'সক্রিয়' : 'বন্ধ'}
                </span>
              </div>
              <p className="text-[11px] text-emerald-100/90 font-medium mt-0.5">
                আপনার ব্যক্তিগত AI এজেন্ট • ঘুম বা অফলাইনে আপনার হয়ে চ্যাট সামলায়
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-100 bg-gray-50/80 px-4 pt-2 gap-2 flex-shrink-0">
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 px-3 text-xs font-black transition-all flex items-center gap-1.5 border-b-2 ${
              activeTab === 'settings' 
                ? 'border-[#075e54] text-[#075e54]' 
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>AI সেটিংস ও রুলস</span>
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`pb-3 px-3 text-xs font-black transition-all flex items-center gap-1.5 border-b-2 ${
              activeTab === 'schedule' 
                ? 'border-[#075e54] text-[#075e54]' 
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>শিডিউল মেসেজ</span>
            {scheduledList.filter(s => s.status === 'pending').length > 0 && (
              <span className="bg-[#25D366] text-white text-[10px] px-1.5 py-0.2 rounded-full font-black ml-1">
                {scheduledList.filter(s => s.status === 'pending').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`pb-3 px-3 text-xs font-black transition-all flex items-center gap-1.5 border-b-2 ${
              activeTab === 'logs' 
                ? 'border-[#075e54] text-[#075e54]' 
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>অ্যাক্টিভিটি হিস্ট্রি ({logsList.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: SETTINGS & RULES */}
          {activeTab === 'settings' && (
            <div className="space-y-5">
              {/* Master Activation Toggle */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 p-4 rounded-2xl flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-black text-emerald-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    পার্সোনাল AI এজেন্ট চালু রাখুন
                  </h4>
                  <p className="text-xs text-emerald-800/80">
                    বন্ধ করলে AI কোনো মেসেজের রিপ্লাই বা শিডিউল মেসেজ পাঠাবে না
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
                  className={`w-14 h-8 rounded-full transition-colors relative p-1 flex items-center ${
                    config.enabled ? 'bg-[#25D366]' : 'bg-gray-300'
                  }`}
                >
                  <motion.div 
                    layout
                    className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                      config.enabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Agent Display Name */}
              <div>
                <label className="block text-xs font-black uppercase text-gray-500 mb-1.5">
                  আপনার AI এজেন্টের নাম (Name)
                </label>
                <input 
                  type="text"
                  value={config.agentName}
                  onChange={(e) => setConfig(prev => ({ ...prev, agentName: e.target.value }))}
                  placeholder="যেমন: রাহাতের AI এজেন্ট"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-bold focus:ring-2 focus:ring-[#075e54] focus:bg-white transition-all"
                />
              </div>

              {/* Mode Selection */}
              <div>
                <label className="block text-xs font-black uppercase text-gray-500 mb-1.5">
                  কখন AI এজেন্ট সক্রিয় থাকবে (Status Mode)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'auto', title: 'অটো মোড', desc: 'আমি অফলাইনে গেলে সক্রিয় হবে' },
                    { id: 'sleep', title: 'ঘুমানোর সময়', desc: 'নির্ধারিত রাতে স্বয়ংক্রিয় সক্রিয়' },
                    { id: 'always', title: 'সবসময় চালু', desc: 'প্রতিটি মেসেজেই AI সহায়ক' }
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setConfig(prev => ({ ...prev, statusMode: item.id as any }))}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        config.statusMode === item.id 
                          ? 'border-[#075e54] bg-emerald-50 text-emerald-950 font-bold ring-1 ring-[#075e54]' 
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <p className="text-xs font-black">{item.title}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Instructions / Persona Rules */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-black uppercase text-gray-500">
                    AI এজেন্টের জন্য আপনার নির্দেশাবলি ও রুলস (Instructions)
                  </label>
                  <span className="text-[10px] text-emerald-700 font-bold">বাংলা বা ইংরেজিতে লিখুন</span>
                </div>
                <textarea 
                  rows={4}
                  value={config.customInstructions}
                  onChange={(e) => setConfig(prev => ({ ...prev, customInstructions: e.target.value }))}
                  placeholder="যেমন: আমি রাত ১১টা থেকে সকাল ৭টা পর্যন্ত ঘুমাচ্ছি। কেউ মেসেজ দিলে বলো আমি বিশ্রামে আছি। জরুরি হলে কল করতে বলো। দামাদামি করবে না।"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3.5 text-xs font-medium focus:ring-2 focus:ring-[#075e54] focus:bg-white transition-all leading-relaxed"
                />
                
                {/* Quick Chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[10px] text-gray-400 font-bold self-center mr-1">কুইক টেমপ্লেট:</span>
                  {[
                    "😴 রাতে ঘুমাচ্ছি, সকালে কথা হবে।",
                    "💼 অফিসে ব্যস্ত আছি, একটু পর রিপ্লাই দেব।",
                    "🛍️ পণ্যের অর্ডার কনফার্ম করতে নাম-ঠিকানা দিন।"
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setConfig(prev => ({ ...prev, customInstructions: prev.customInstructions ? `${prev.customInstructions}\n${chip}` : chip }))}
                      className="px-2.5 py-1 bg-gray-100 hover:bg-emerald-100 text-gray-700 text-[10px] font-bold rounded-lg transition-colors border border-gray-200"
                    >
                      + {chip.slice(0, 18)}...
                    </button>
                  ))}
                </div>
              </div>

              {/* Fine-Grained Permissions & Guardrails */}
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">
                  নিরাপত্তা ও অনুমতির সীমাবদ্ধতা (Permissions & Guardrails)
                </h4>

                {/* Auto Reply Permission */}
                <label className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-100">
                  <div className="pr-3">
                    <p className="text-xs font-black text-gray-800">অফলাইনে স্বয়ংক্রিয় রিপ্লাই (Auto-Reply)</p>
                    <p className="text-[10px] text-gray-500">কেউ মেসেজ পাঠালে আপনার হয়ে উপযুক্ত জবাব দেবে</p>
                  </div>
                  <input 
                    type="checkbox"
                    checked={config.autoReplyOffline}
                    onChange={(e) => setConfig(prev => ({ ...prev, autoReplyOffline: e.target.checked }))}
                    className="w-5 h-5 text-[#075e54] rounded-md focus:ring-0 cursor-pointer accent-[#075e54]"
                  />
                </label>

                {/* Scheduled Messages Permission */}
                <label className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-100">
                  <div className="pr-3">
                    <p className="text-xs font-black text-gray-800">শিডিউল মেসেজ পাঠানোর অনুমতি</p>
                    <p className="text-[10px] text-gray-500">নির্দিষ্ট সময়ে স্বয়ংক্রিয়ভাবে মেসেজ ডেলিভারি করবে</p>
                  </div>
                  <input 
                    type="checkbox"
                    checked={config.allowScheduledMessages}
                    onChange={(e) => setConfig(prev => ({ ...prev, allowScheduledMessages: e.target.checked }))}
                    className="w-5 h-5 text-[#075e54] rounded-md focus:ring-0 cursor-pointer accent-[#075e54]"
                  />
                </label>

                {/* Sensitive Action Guardrail */}
                <label className="flex items-center justify-between p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 cursor-pointer">
                  <div className="pr-3">
                    <p className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      সংবেদনশীল কাজে কঠোর সতর্কতা (Strict Safety Guardrail)
                    </p>
                    <p className="text-[10px] text-amber-800/80">
                      টাকা-পয়সা, চুক্তি বা কোনো সংবেদনশীল বিষয়ে আপনার অনুমতি ছাড়া AI কোনো কথা দেবে না
                    </p>
                  </div>
                  <input 
                    type="checkbox"
                    checked={config.sensitiveActionGuard}
                    onChange={(e) => setConfig(prev => ({ ...prev, sensitiveActionGuard: e.target.checked }))}
                    className="w-5 h-5 text-amber-600 rounded-md focus:ring-0 cursor-pointer accent-amber-600"
                  />
                </label>
              </div>

              {/* Save Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  disabled={savingConfig}
                  className="w-full py-3.5 bg-[#075e54] hover:bg-[#064e46] text-white font-black text-sm rounded-2xl shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {savingConfig ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>সংরক্ষণ করা হচ্ছে...</span>
                    </>
                  ) : saveSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>সফলভাবে সংরক্ষিত হয়েছে!</span>
                    </>
                  ) : (
                    <span>AI এজেন্ট সেটিংস সংরক্ষণ করুন</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SCHEDULE MESSAGE */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              
              {/* Natural AI Voice/Text Command Prompt */}
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200 p-4 rounded-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-black text-emerald-950 uppercase">
                    AI কে সরাসরি আদেশ দিন (Smart Voice / Text Command)
                  </h4>
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={aiCommandInput}
                    onChange={(e) => setAiCommandInput(e.target.value)}
                    placeholder="যেমন: 'আজ রাত ১২টায় হাসানকে বলো শুভ জন্মদিন ভাই!'"
                    className="flex-1 bg-white border border-emerald-200 rounded-xl px-3.5 py-2 text-xs font-bold focus:ring-2 focus:ring-[#075e54] focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleParseAiCommand}
                    disabled={parsingCommand || !aiCommandInput.trim()}
                    className="px-4 py-2 bg-[#075e54] text-white text-xs font-black rounded-xl hover:bg-[#064e46] transition-all disabled:opacity-50 flex items-center gap-1.5 flex-shrink-0"
                  >
                    {parsingCommand ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5" />}
                    <span>অটো ডিটেক্ট</span>
                  </button>
                </div>
                <p className="text-[10px] text-emerald-800">
                  AI আপনার লেখা থেকে নাম, মেসেজ ও সময় নিজে থেকেই বের করে নিচে বসিয়ে দেবে।
                </p>
              </div>

              {/* Manual / Verified Schedule Form */}
              <form onSubmit={handleCreateSchedule} className="space-y-4 bg-gray-50/70 p-4 rounded-2xl border border-gray-100">
                <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider">
                  শিডিউল মেসেজ কনফিগারেশন
                </h4>

                {/* Recipient User Select */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    কার কাছে মেসেজ যাবে (Recipient User)
                  </label>
                  <select
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:ring-2 focus:ring-[#075e54] focus:outline-hidden"
                  >
                    <option value="">-- ইউজার সিলেক্ট করুন --</option>
                    {availableUsers.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.displayName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message Text */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    মেসেজ টেক্সট (Message)
                  </label>
                  <textarea 
                    rows={3}
                    value={scheduleMessageText}
                    onChange={(e) => setScheduleMessageText(e.target.value)}
                    placeholder="মেসেজটি লিখুন..."
                    className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs font-medium focus:ring-2 focus:ring-[#075e54] focus:outline-hidden"
                  />
                </div>

                {/* Date & Time Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">
                      তারিখ (Date)
                    </label>
                    <input 
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-bold focus:ring-2 focus:ring-[#075e54]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">
                      সময় (Time)
                    </label>
                    <input 
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-bold focus:ring-2 focus:ring-[#075e54]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={schedulingLoading}
                  className="w-full py-3 bg-[#25D366] hover:bg-[#1ebd5e] text-white font-black text-xs rounded-xl shadow-md active:scale-98 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {schedulingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>AI এজেন্টকে শিডিউল করতে বলুন</span>
                </button>
              </form>

              {/* Pending Queue List */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">
                  অপেক্ষারত শিডিউল তালিকা ({scheduledList.filter(s => s.status === 'pending').length})
                </h4>

                {scheduledList.filter(s => s.status === 'pending').length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-4 text-center">কোনো অপেক্ষারত শিডিউল মেসেজ নেই</p>
                ) : (
                  scheduledList
                    .filter(s => s.status === 'pending')
                    .map(item => (
                      <div 
                        key={item.id}
                        className="bg-white border border-emerald-100 rounded-2xl p-3.5 shadow-xs flex items-center justify-between gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-emerald-950 truncate">
                              প্রাপক: {item.targetUserName}
                            </span>
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[9px] font-black rounded-full uppercase">
                              অপেক্ষারত
                            </span>
                          </div>
                          <p className="text-xs text-gray-700 truncate mt-1 font-medium">"{item.message}"</p>
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-1 font-bold">
                            <Clock className="w-3 h-3 text-emerald-600" />
                            <span>
                              {format(new Date(item.scheduledAt), "dd MMMM, yyyy - hh:mm a", { locale: bn })}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCancelSchedule(item.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors flex-shrink-0"
                          title="বাতিল করুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ACTIVITY LOGS / AUDIT */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500 font-bold">
                  আপনার অনুপস্থিতিতে AI এজেন্ট কী কী করেছে তার রেকর্ড:
                </p>
              </div>

              {logsList.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-xs italic">
                  এখনো পর্যন্ত কোনো স্বয়ংক্রিয় কার্যক্রমের হিস্ট্রি নেই
                </div>
              ) : (
                <div className="space-y-2.5">
                  {logsList.map(log => {
                    const isReply = log.action === 'auto_reply';
                    return (
                      <div 
                        key={log.id}
                        className="bg-white border border-gray-100 rounded-2xl p-3.5 shadow-xs flex items-start gap-3"
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isReply ? 'bg-emerald-100 text-emerald-800' : 'bg-cyan-100 text-cyan-800'
                        }`}>
                          {isReply ? <Bot className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-gray-800">
                              {isReply ? 'অটো-রিপ্লাই সম্পন্ন' : 'শিডিউল মেসেজ ডেলিভার্ড'}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold">
                              {format(new Date(log.timestamp), "d MMM, hh:mm a", { locale: bn })}
                            </span>
                          </div>
                          {log.targetUserName && (
                            <p className="text-[11px] font-bold text-emerald-700 mt-0.5">
                              কাকে: {log.targetUserName}
                            </p>
                          )}
                          <p className="text-xs text-gray-600 mt-1 leading-relaxed whitespace-pre-wrap bg-gray-50 p-2 rounded-xl">
                            {log.details}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
export default PersonalAiAgentModal;
