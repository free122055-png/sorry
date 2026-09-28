import React, { useState, useEffect } from "react";
import { 
  Users, Plus, Search, ChevronLeft, 
  Copy, Check, Trash2, ShieldAlert,
  Loader2, UserPlus, Clock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { useVoiceGuidance } from "../context/VoiceGuidanceContext";
import { db } from "../lib/firebase";
import { 
  collection, query, where, onSnapshot, 
  doc, setDoc, updateDoc, deleteDoc, 
  getDocs, limit, serverTimestamp, getDoc
} from "firebase/firestore";

interface Connection {
  id: string;
  userA: string;
  userB: string;
  status: 'pending' | 'approved' | 'blocked';
  createdAt: any;
  userA_info?: { displayName: string; photoURL: string; reminderCode: string };
  userB_info?: { displayName: string; photoURL: string; reminderCode: string };
}

export const Connections: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { user, profile } = useAuth();
  const { speak } = useVoiceGuidance();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCode, setSearchCode] = useState("");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<'connected' | 'pending'>('connected');

  useEffect(() => {
    if (!user) return;

    // Query for connections where user is either userA or userB
    const q1 = query(collection(db, "connections"), where("userA", "==", user.uid));
    const q2 = query(collection(db, "connections"), where("userB", "==", user.uid));

    const unsub1 = onSnapshot(q1, async (snapshot) => {
      const data = await Promise.all(snapshot.docs.map(async d => {
        const conn = { id: d.id, ...d.data() } as Connection;
        const otherUserId = conn.userB;
        const otherUserDoc = await getDoc(doc(db, "users", otherUserId));
        if (otherUserDoc.exists()) {
          conn.userB_info = otherUserDoc.data() as any;
        }
        return conn;
      }));
      updateConnections(data, 'userA');
    });

    const unsub2 = onSnapshot(q2, async (snapshot) => {
      const data = await Promise.all(snapshot.docs.map(async d => {
        const conn = { id: d.id, ...d.data() } as Connection;
        const otherUserId = conn.userA;
        const otherUserDoc = await getDoc(doc(db, "users", otherUserId));
        if (otherUserDoc.exists()) {
          conn.userA_info = otherUserDoc.data() as any;
        }
        return conn;
      }));
      updateConnections(data, 'userB');
    });

    const allConns: Map<string, Connection> = new Map();
    const updateConnections = (newData: Connection[], role: 'userA' | 'userB') => {
      newData.forEach(c => allConns.set(c.id, c));
      const sorted = Array.from(allConns.values()).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setConnections(sorted);
      setLoading(false);
    };

    return () => {
      unsub1();
      unsub2();
    };
  }, [user]);

  const handleCopyCode = () => {
    if (profile?.reminderCode) {
      navigator.clipboard.writeText(profile.reminderCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddConnection = async () => {
    if (!searchCode || searchCode.length < 4) return;
    
    const formattedCode = searchCode.toUpperCase().trim();
    if (formattedCode === profile?.reminderCode) {
      setError("আপনি নিজের কোড ব্যবহার করতে পারবেন না।");
      return;
    }

    setSearching(true);
    setError("");

    try {
      const q = query(
        collection(db, "users"),
        where("reminderCode", "==", formattedCode),
        limit(1)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setError("সঠিক কানেকশন কোড প্রদান করুন।");
      } else {
        const targetUser = snapshot.docs[0];
        const targetUserId = targetUser.id;

        // Check if connection already exists
        const existingQ1 = query(collection(db, "connections"), where("userA", "==", user!.uid), where("userB", "==", targetUserId));
        const existingQ2 = query(collection(db, "connections"), where("userB", "==", user!.uid), where("userA", "==", targetUserId));
        
        const [snap1, snap2] = await Promise.all([getDocs(existingQ1), getDocs(existingQ2)]);

        if (!snap1.empty || !snap2.empty) {
          setError("এই ইউজারের সাথে আপনি ইতোমধ্যে কানেক্টেড আছেন।");
          return;
        }

        const connectionId = [user!.uid, targetUserId].sort().join("_");
        await setDoc(doc(db, "connections", connectionId), {
          userA: user!.uid,
          userB: targetUserId,
          status: 'pending',
          createdAt: serverTimestamp()
        });

        setSearchCode("");
        setTab('pending');
        speak("কানেকশন রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে। বন্ধু রিকোয়েস্টটি একসেপ্ট করলে আপনারা যুক্ত হয়ে যাবেন।", { mood: "SUCCESS" });
        alert("কানেকশন রিকোয়েস্ট পাঠানো হয়েছে।");
      }
    } catch (err) {
      setError("যাচাই করতে সমস্যা হয়েছে।");
    } finally {
      setSearching(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await updateDoc(doc(db, "connections", id), {
        status: 'approved'
      });
      speak("অভিনন্দন! আপনাদের কানেকশনটি এখন সফলভাবে যুক্ত হয়েছে।", { mood: "SUCCESS" });
    } catch (err) {
      alert("অ্যাপ্রুভ করতে সমস্যা হয়েছে।");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("আপনি কি এই কানেকশনটি মুছে ফেলতে চান?")) {
      try {
        await deleteDoc(doc(db, "connections", id));
      } catch (err) {
        alert("মুছতে সমস্যা হয়েছে।");
      }
    }
  };

  const connectedUsers = connections.filter(c => c.status === 'approved');
  const pendingRequests = connections.filter(c => c.status === 'pending');

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white px-4 py-4 sticky top-0 z-40 flex items-center justify-between border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-900 border border-gray-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
          <div>
            <h1 className="text-lg font-black text-gray-900 leading-tight">Connections</h1>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Friends List</p>
          </div>
        </div>
      </div>

      <main className="p-5 space-y-6">
        {/* My Connection Code Card */}
        <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between relative z-10">
            <div className="space-y-1">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">My Connection Code</span>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-blue-600 tracking-tighter">{profile?.reminderCode || "---"}</h2>
                <button
                  onClick={handleCopyCode}
                  className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black active:scale-90 transition-all flex items-center gap-2"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
              <Users className="w-7 h-7 text-blue-600" />
            </div>
          </div>
          <p className="text-[10px] text-gray-400 font-bold mt-4 leading-relaxed opacity-80">
            এই কোডটি শেয়ার করে বন্ধুদের সাথে কানেক্ট হোন।
          </p>
        </div>

        {/* Add Friend Input */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-3">
          <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest">নতুন বন্ধু যুক্ত করুন</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                placeholder="Connection Code (e.g. RM1234)"
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 text-xs font-black focus:outline-none focus:border-blue-500 transition-all uppercase"
              />
            </div>
            <button
              onClick={handleAddConnection}
              disabled={searching || !searchCode}
              className="bg-gray-900 text-white px-5 rounded-xl text-xs font-black shadow-lg shadow-gray-900/10 disabled:opacity-50 active:scale-95 transition-all flex items-center gap-2"
            >
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              যুক্ত করুন
            </button>
          </div>
          {error && <p className="text-red-500 text-[10px] font-black flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> {error}</p>}
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200/50">
          <button 
            onClick={() => setTab('connected')}
            className={`flex-1 py-3 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-2 ${tab === 'connected' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
          >
            Connected Friends
            <span className={`px-2 py-0.5 rounded-full text-[9px] ${tab === 'connected' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>{connectedUsers.length}</span>
          </button>
          <button 
            onClick={() => setTab('pending')}
            className={`flex-1 py-3 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-2 ${tab === 'pending' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
          >
            Pending Requests
            <span className={`px-2 py-0.5 rounded-full text-[9px] ${tab === 'pending' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'}`}>{pendingRequests.length}</span>
          </button>
        </div>

        {/* List */}
        <div className="space-y-4">
          {loading ? (
            <div className="py-20 text-center space-y-4">
              <Loader2 className="w-10 h-10 text-gray-200 animate-spin mx-auto" />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading...</p>
            </div>
          ) : tab === 'connected' ? (
            connectedUsers.length === 0 ? (
              <div className="py-20 text-center space-y-4 bg-white rounded-[32px] border border-gray-100 border-dashed">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto border border-gray-100">
                  <Users className="w-8 h-8 text-gray-200" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-gray-900">এখনো কোনো বন্ধু নেই</h4>
                  <p className="text-[10px] font-bold text-gray-400 px-10">কোড শেয়ার করে বন্ধু যুক্ত করুন।</p>
                </div>
              </div>
            ) : (
              <div className="grid gap-4">
                {connectedUsers.map((conn) => {
                  const friend = conn.userA === user!.uid ? conn.userB_info : conn.userA_info;
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      key={conn.id}
                      className="bg-white rounded-[28px] p-4 border border-gray-100 shadow-sm flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 overflow-hidden border border-blue-100">
                          {friend?.photoURL ? (
                            <img src={friend.photoURL} alt={friend.displayName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-blue-600 font-black text-lg">
                              {friend?.displayName?.charAt(0) || "U"}
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-gray-900">{friend?.displayName || "Unknown User"}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-emerald-600">Connected</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full" />
                            <span className="text-[10px] font-bold text-gray-400">{friend?.reminderCode}</span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDelete(conn.id)}
                        className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )
          ) : (
            pendingRequests.length === 0 ? (
              <div className="py-20 text-center space-y-4 bg-white rounded-[32px] border border-gray-100 border-dashed">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto border border-gray-100">
                  <Clock className="w-8 h-8 text-gray-200" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-gray-900">কোনো রিকোয়েস্ট নেই</h4>
                </div>
              </div>
            ) : (
              <div className="grid gap-4">
                {pendingRequests.map((conn) => {
                  const isIncoming = conn.userB === user!.uid;
                  const otherUser = isIncoming ? conn.userA_info : conn.userB_info;
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      key={conn.id}
                      className="bg-white rounded-[28px] p-4 border border-gray-100 shadow-sm flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 overflow-hidden border border-amber-100">
                          {otherUser?.photoURL ? (
                            <img src={otherUser.photoURL} alt={otherUser.displayName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-amber-600 font-black text-lg">
                              {otherUser?.displayName?.charAt(0) || "U"}
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-gray-900">{otherUser?.displayName || "Unknown User"}</h4>
                          <span className="text-[10px] font-bold text-amber-600">{isIncoming ? "Incoming Request" : "Sent Request"}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {isIncoming && (
                          <button 
                            onClick={() => handleApprove(conn.id)}
                            className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-[10px] font-black shadow-lg shadow-emerald-200 active:scale-95 transition-all"
                          >
                            Approve
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(conn.id)}
                          className="bg-red-50 text-red-500 px-4 py-2 rounded-xl text-[10px] font-black active:scale-95 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
};
