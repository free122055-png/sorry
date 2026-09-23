import React from "react";
import { X, Sparkles, UserPlus, Send, ShieldCheck, HeartHandshake, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ProfilePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProfile: () => void;
  onProceedRequest?: () => void;
  targetBiodataCode?: string;
}

export const ProfilePromptModal: React.FC<ProfilePromptModalProps> = ({
  isOpen,
  onClose,
  onCreateProfile,
  onProceedRequest,
  targetBiodataCode
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/65 backdrop-blur-xs z-[99999] flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop click */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* Modal Card */}
        <motion.div
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative z-10 bg-white text-gray-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-100 p-5 sm:p-6 space-y-4"
        >
          {/* Header Row */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#053d26] flex items-center justify-center font-black shadow-2xs">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900 tracking-tight">
                  বায়োডাটা প্রোফাইল তৈরি করুন
                </h3>
                <p className="text-[11px] text-gray-500 font-medium">
                  রিকোয়েস্ট আদান-প্রদান সহজতর করার জন্য
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-gray-600 transition active:scale-95 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="space-y-3">
            <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-emerald-950 leading-relaxed">
                  {targetBiodataCode ? (
                    <>বায়োডাটা <span className="bg-emerald-200/80 px-1.5 py-0.5 rounded-md font-black">{targetBiodataCode}</span> এর সাথে যোগাযোগের অনুরোধ পাঠাতে নিজের একটি বায়োডাটা প্রোফাইল থাকা অত্যন্ত সহায়ক।</>
                  ) : (
                    <>বিবাহের বায়োডাটা রিকোয়েস্ট গ্রহণ ও আদান-প্রদান করতে আপনার নিজের একটি পাত্র/পাত্রীর বায়োডাটা প্রোফাইল প্রয়োজন।</>
                  )}
                </p>
              </div>
            </div>

            {/* Benefits List */}
            <div className="space-y-2 pt-1 text-xs text-gray-700 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>আপনার রিকোয়েস্ট সরাসরি পাত্র/পাত্রীর অভিভাবকের কাছে পৌঁছাবে।</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>অপর পক্ষ আপনার সাথে সহজে যোগাযোগ ও ম্যাচিং করতে পারবে।</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>সম্পূর্ণ শরিয়াহ সম্মত ও প্রাইভেসি-ফার্স্ট সুরক্ষিত ব্যবস্থা।</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                onClose();
                onCreateProfile();
              }}
              className="w-full py-3 px-4 bg-[#053d26] hover:bg-[#032718] text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-2 shadow-md active:scale-98 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-emerald-300" />
              <span>এখনই বায়োডাটা প্রোফাইল তৈরি করুন</span>
            </button>

            {onProceedRequest && (
              <button
                onClick={() => {
                  onClose();
                  onProceedRequest();
                }}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
              >
                <Send className="w-3.5 h-3.5 text-slate-600" />
                <span>প্রোফাইল ছাড়াই সরাসরি অনুরোধ পাঠান</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
