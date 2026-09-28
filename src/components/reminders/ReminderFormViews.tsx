import React from "react";
import { 
  Bell, Calendar, Clock, Loader2, Sparkles, Cake, User, ChevronRight, CheckCircle2 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CustomDropdown } from "../CustomDropdown";

interface CreatePersonalViewProps {
  formData: {
    title: string;
    description: string;
    date: string;
    time: string;
    repeat: string;
    priority: "Low" | "Medium" | "High";
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  handleCreatePersonal: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  repeatOptions: { id: string; nameBn: string }[];
  priorityOptions: { id: string; nameBn: string }[];
}

export const CreatePersonalViewComponent: React.FC<CreatePersonalViewProps> = React.memo(({
  formData,
  setFormData,
  handleCreatePersonal,
  isSubmitting,
  repeatOptions,
  priorityOptions,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-blue-600 rounded-[32px] p-6 text-white shadow-xl shadow-blue-200 relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <h2 className="text-xl font-black tracking-tight">Personal Reminder</h2>
          <p className="text-[11px] font-bold opacity-80 uppercase tracking-widest">নিজের জন্য রিমাইন্ডার</p>
        </div>
        <Bell className="absolute -bottom-4 -right-4 w-24 h-24 text-white/10 rotate-12" />
      </div>

      <form onSubmit={handleCreatePersonal} className="space-y-6">
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest ml-1">Title</label>
            <input
              required
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, title: e.target.value }))}
              placeholder="ডাক্তার দেখাতে যাব"
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-black focus:outline-none focus:border-blue-500 transition-all text-gray-900"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest ml-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, description: e.target.value }))}
              placeholder="সকাল ৮টায় ডাক্তারের অ্যাপয়েন্টমেন্ট আছে।"
              rows={3}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-blue-500 transition-all resize-none text-gray-900"
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, date: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 text-xs font-black text-gray-900"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Time</label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, time: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 text-xs font-black text-gray-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-sm space-y-2">
            <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Repeat</label>
            <CustomDropdown 
              options={repeatOptions} 
              value={formData.repeat} 
              onChange={(v) => setFormData((prev: any) => ({ ...prev, repeat: v }))} 
              className="!bg-gray-50 !border-none !rounded-xl !py-2.5 !text-[11px] !font-black" 
            />
          </div>
          <div className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-sm space-y-2">
            <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Priority</label>
            <CustomDropdown 
              options={priorityOptions} 
              value={formData.priority} 
              onChange={(v) => setFormData((prev: any) => ({ ...prev, priority: v as any }))} 
              className="!bg-gray-50 !border-none !rounded-xl !py-2.5 !text-[11px] !font-black" 
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black text-base shadow-xl shadow-blue-200 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? <Loader2 className="animate-spin mx-auto w-5 h-5" /> : "Save Reminder"}
        </button>
      </form>
    </div>
  );
});

interface SendWishViewProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  wishStep: number;
  setWishStep: (step: number) => void;
  approvedConnections: any[];
  wishTemplates: any[];
  handleSendWish: () => void;
  isSubmitting: boolean;
  setView: (view: any) => void;
}

export const SendWishViewComponent: React.FC<SendWishViewProps> = React.memo(({
  formData,
  setFormData,
  wishStep,
  setWishStep,
  approvedConnections,
  wishTemplates,
  handleSendWish,
  isSubmitting,
  setView,
}) => {
  return (
    <div className="space-y-8 pb-32">
      <div className="bg-rose-600 rounded-[32px] p-6 text-white shadow-xl shadow-rose-200 relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <h2 className="text-xl font-black tracking-tight">{formData.wishType}</h2>
          <p className="text-[11px] font-bold opacity-80 uppercase tracking-widest">Step {wishStep} of 4</p>
        </div>
        <Cake className="absolute -bottom-4 -right-4 w-24 h-24 text-white/10 rotate-12" />
      </div>

      <AnimatePresence mode="wait">
        {wishStep === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="px-2 flex items-center justify-between">
              <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Select Friend</h3>
              <span className="text-[10px] font-bold text-gray-400">{approvedConnections.length} Connected</span>
            </div>
            {approvedConnections.length === 0 ? (
              <div className="bg-white p-10 rounded-[32px] text-center border border-gray-100 border-dashed">
                <User className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-[11px] font-bold text-gray-500 mb-4">বন্ধু যুক্ত করা নেই</p>
                <button onClick={() => setView('connections')} className="text-blue-600 text-[10px] font-black uppercase cursor-pointer">Add Friend Now</button>
              </div>
            ) : (
              <div className="grid gap-3">
                {approvedConnections.map(friend => (
                  <button
                    key={friend.id}
                    type="button"
                    onClick={() => {
                      setFormData((prev: any) => ({...prev, recipientId: friend.id, recipientName: friend.displayName}));
                      setWishStep(2);
                    }}
                    className={`bg-white p-4 rounded-[28px] border-2 transition-all flex items-center justify-between group cursor-pointer ${formData.recipientId === friend.id ? 'border-rose-500' : 'border-gray-100'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 overflow-hidden border border-gray-100">
                        {friend.photoURL ? <img src={friend.photoURL} alt={friend.displayName} className="w-full h-full object-cover" /> : <User className="w-full h-full p-3 text-gray-300" />}
                      </div>
                      <div className="text-left">
                        <h4 className="text-sm font-black text-gray-900">{friend.displayName}</h4>
                        <p className="text-[10px] font-bold text-gray-400">{friend.reminderCode}</p>
                      </div>
                    </div>
                    {formData.recipientId === friend.id ? <CheckCircle2 className="w-5 h-5 text-rose-500" /> : <ChevronRight className="w-4 h-4 text-gray-300" />}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {wishStep === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="px-2 flex items-center justify-between">
              <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Choose a Design</h3>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {wishTemplates.map(temp => (
                <button
                  key={temp.id}
                  type="button"
                  onClick={() => {
                    setFormData((prev: any) => ({...prev, templateId: temp.id}));
                    setWishStep(3);
                  }}
                  className={`bg-white rounded-[28px] overflow-hidden border-2 transition-all relative group cursor-pointer ${formData.templateId === temp.id ? 'border-rose-500' : 'border-gray-100'}`}
                >
                  <img src={temp.preview} className="w-full aspect-square object-cover" alt={temp.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4 text-white">
                    <span className="text-[10px] font-black">{temp.emoji} {temp.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {wishStep === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Recipient Name</label>
                <input
                  type="text"
                  value={formData.recipientName}
                  onChange={(e) => setFormData((prev: any) => ({...prev, recipientName: e.target.value}))}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-black text-gray-900 focus:outline-none focus:border-rose-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Your Name</label>
                <input
                  type="text"
                  value={formData.signature}
                  onChange={(e) => setFormData((prev: any) => ({...prev, signature: e.target.value}))}
                  placeholder="আপনার নাম"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-black text-gray-900 focus:outline-none focus:border-rose-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Message</label>
                <textarea
                  value={formData.customMessage}
                  onChange={(e) => setFormData((prev: any) => ({...prev, customMessage: e.target.value}))}
                  placeholder="শুভ জন্মদিন! তোমার জীবনের প্রতিটি দিন আনন্দে ভরে উঠুক।"
                  rows={4}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold resize-none text-gray-900 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
            <button 
              type="button" 
              onClick={() => setWishStep(4)} 
              className="w-full py-5 bg-rose-600 text-white rounded-[24px] font-black cursor-pointer shadow-lg active:scale-95 transition-all"
            >
              Next: Schedule & Send
            </button>
          </motion.div>
        )}

        {wishStep === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3 p-4 bg-rose-50 rounded-2xl border border-rose-100">
                <Clock className="w-5 h-5 text-rose-600" />
                <div>
                  <h4 className="text-xs font-black text-rose-600">Schedule Wish</h4>
                  <p className="text-[9px] font-bold text-rose-500 opacity-70">কখন পাঠাতে চান?</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Date</label>
                  <input 
                    type="date" 
                    value={formData.date} 
                    onChange={(e) => setFormData((prev: any) => ({...prev, date: e.target.value}))} 
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 text-xs font-black text-gray-900" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Time</label>
                  <input 
                    type="time" 
                    value={formData.time} 
                    onChange={(e) => setFormData((prev: any) => ({...prev, time: e.target.value}))} 
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 text-xs font-black text-gray-900" 
                  />
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <button 
                type="button"
                onClick={handleSendWish} 
                disabled={isSubmitting} 
                className="w-full py-5 bg-rose-600 text-white rounded-[24px] font-black shadow-xl shadow-rose-200 cursor-pointer active:scale-95 transition-all"
              >
                {isSubmitting ? <Loader2 className="animate-spin mx-auto w-5 h-5" /> : "Send Wish Now"}
              </button>
              <button 
                type="button"
                onClick={() => setWishStep(3)} 
                className="w-full py-4 text-rose-600 text-[11px] font-black uppercase cursor-pointer"
              >
                Back to Message
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
