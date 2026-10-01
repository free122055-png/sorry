import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface ChatToast {
  id: string;
  senderName: string;
  senderPhoto?: string;
  message: string;
  roomId?: string;
  url?: string;
}

interface WhatsAppChatBannerProps {
  toast: ChatToast | null;
  onClose: () => void;
}

export const WhatsAppChatBanner: React.FC<WhatsAppChatBannerProps> = ({ toast, onClose }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 6000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const handleClick = () => {
    const targetUrl = toast.url || (toast.roomId ? `/chat/${toast.roomId}` : "/chat");
    onClose();
    navigate(targetUrl);
  };

  return (
    <AnimatePresence>
      <div className="fixed top-3 left-0 right-0 z-[9999] px-3 pointer-events-none flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          onClick={handleClick}
          className="pointer-events-auto w-full max-w-md bg-[#075e54] text-white rounded-2xl p-3 shadow-2xl border border-emerald-400/30 flex items-center gap-3 cursor-pointer active:scale-98 transition-all backdrop-blur-md"
        >
          {/* Avatar or WhatsApp Icon */}
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/30 bg-emerald-800 flex items-center justify-center">
              {toast.senderPhoto ? (
                <img src={toast.senderPhoto} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="font-black text-sm text-white">{toast.senderName.slice(0, 1)}</span>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#25D366] border-2 border-[#075e54] flex items-center justify-center">
              <MessageCircle className="w-3 h-3 text-white fill-white" />
            </div>
          </div>

          {/* Message Content */}
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black truncate text-white">{toast.senderName}</h4>
              <span className="text-[10px] text-emerald-200/80 font-bold uppercase tracking-wider">এখনই</span>
            </div>
            <p className="text-xs text-emerald-50 truncate mt-0.5 font-medium leading-tight">
              {toast.message}
            </p>
          </div>

          {/* Dismiss button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1.5 hover:bg-white/10 rounded-full text-emerald-200 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
