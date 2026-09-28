import React, { useState, useEffect } from "react";
import { Bell, Plus, ListTodo, ChevronRight, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";

interface Reminder {
  id: string;
  title: string;
  date: string;
  time: string;
  type: string;
  wishType?: string;
  scheduledAt: number;
}

export const ReminderSection: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "reminders_v2"),
      where("recipientId", "==", user.uid),
      where("status", "==", "active"),
      orderBy("scheduledAt", "asc"),
      limit(2)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reminder));
      setReminders(data);
      setLoading(false);
    }, (error) => {
      console.warn("Reminder fetch error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleReminderClick = (id?: string) => {
    if (!user) {
      navigate("/login?redirect=/reminders");
    } else {
      navigate(id ? `/reminders?id=${id}` : "/reminders");
    }
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate("/login?redirect=/reminders?view=create-personal");
    } else {
      navigate("/reminders?view=create-personal");
    }
  };

  return (
    <div className="mt-6 px-4">
      <div 
        onClick={() => handleReminderClick()}
        className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden cursor-pointer active:scale-[0.98] transition-all"
      >
        <div className="p-5 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-[16px] font-black text-gray-900 leading-tight">আপনার রিমাইন্ডার</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Upcoming Reminders</p>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleAddClick}
            className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center shadow-lg shadow-gray-200"
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="py-4 flex justify-center">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !user ? (
            <div className="py-4 text-center space-y-3">
              <p className="text-[11px] font-bold text-gray-400">রিমাইন্ডার দেখতে লগইন করুন</p>
              <button className="text-blue-600 text-[11px] font-black uppercase">Login Now</button>
            </div>
          ) : reminders.length === 0 ? (
            <div className="py-6 text-center space-y-2">
              <Calendar className="w-8 h-8 text-gray-100 mx-auto" />
              <p className="text-[11px] font-bold text-gray-400">কোনো রিমাইন্ডার সেট করা নেই</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reminders.map((rem) => (
                <div 
                  key={rem.id}
                  className="flex items-center justify-between p-3.5 bg-gray-50/50 rounded-[20px] border border-gray-100 group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${rem.type === 'wish' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'}`}>
                      <ListTodo className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-[13px] font-black text-gray-900 line-clamp-1">{rem.title || rem.wishType || "Reminder"}</h4>
                      <p className="text-[9px] font-bold text-gray-400 mt-0.5">{rem.date} • {rem.time}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                </div>
              ))}
              <div className="pt-1 text-center">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">View All Reminders</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
