import React, { useState } from "react";
import { Volume2, VolumeX, Mic, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useVoiceGuidance } from "../context/VoiceGuidanceContext";
import { useLocation } from "react-router-dom";

export const VoiceGuidanceIndicator: React.FC = () => {
  const { isVoiceEnabled, isSpeaking, currentMessage, toggleVoice, stop } = useVoiceGuidance();
  const [showTooltip, setShowTooltip] = useState(false);
  const location = useLocation();

  // Hide on certain fullscreen interactive editor screens if preferred
  const isPixelEditor = location.pathname.startsWith("/pixel-editing-tools");
  if (isPixelEditor) return null;

  return (
    <div className="fixed bottom-24 left-4 z-40 select-none">
      {/* Floating Speaking Subtitle / Guidance Pill */}
      <AnimatePresence>
        {isSpeaking && currentMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="mb-2 max-w-[260px] sm:max-w-xs bg-gray-900/95 text-white backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border border-white/10 flex items-start gap-2.5"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-3 h-3 animate-spin" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-bold leading-snug text-emerald-200">
                {currentMessage}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Toggle Button */}
      <div className="relative flex items-center gap-2">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            if (isSpeaking) {
              stop();
            } else {
              toggleVoice();
            }
          }}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className={`h-10 px-3 rounded-full flex items-center gap-2 shadow-lg transition-all duration-300 border cursor-pointer backdrop-blur-md ${
            isVoiceEnabled
              ? isSpeaking
                ? "bg-[#004b23] text-white border-emerald-400/40 shadow-emerald-900/30 ring-2 ring-emerald-400/30"
                : "bg-white/95 text-gray-800 border-gray-200/80 hover:bg-emerald-50"
              : "bg-gray-100/95 text-gray-400 border-gray-200"
          }`}
          aria-label={isVoiceEnabled ? "ভয়েস গাইডেন্স চালু (Voice Guidance ON)" : "ভয়েস গাইডেন্স বন্ধ (Voice Guidance OFF)"}
        >
          {isVoiceEnabled ? (
            <>
              {isSpeaking ? (
                /* Animated Sound Wave Bars */
                <div className="flex items-center gap-0.5 h-4">
                  <span className="w-1 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s] h-3.5" />
                  <span className="w-1 bg-emerald-300 rounded-full animate-bounce [animation-delay:-0.15s] h-4" />
                  <span className="w-1 bg-emerald-200 rounded-full animate-bounce h-2.5" />
                </div>
              ) : (
                <Volume2 className="w-4 h-4 text-[#004b23]" />
              )}
              <span className={`text-[10px] font-black ${isSpeaking ? "text-emerald-100" : "text-gray-700"}`}>
                {isSpeaking ? "বলছে..." : "ভয়েস"}
              </span>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 text-gray-400" />
              <span className="text-[10px] font-bold text-gray-400">বন্ধ</span>
            </>
          )}
        </motion.button>

        {/* Hover / Context Tooltip */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              className="hidden sm:block absolute left-full ml-2 bg-black/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap shadow-md"
            >
              {isVoiceEnabled ? "ক্লিক করে ভয়েস বন্ধ বা থামান" : "ক্লিক করে বাংলা ভয়েস গাইডেন্স চালু করুন"}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
