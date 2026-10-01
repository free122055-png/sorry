import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface SplashScreenProps {
  onComplete?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const isNativeOrStandalone = typeof window !== "undefined" && (
    Boolean((window as any).Capacitor?.isNativePlatform?.()) ||
    (window as any).Capacitor?.getPlatform?.() === 'android' ||
    (window as any).Capacitor?.getPlatform?.() === 'ios' ||
    window.matchMedia('(display-mode: standalone)').matches ||
    Boolean((window.navigator as any).standalone) ||
    /wv|Android.*Version\/[\d.]+/i.test(navigator.userAgent)
  );

  const alreadyShown = typeof window !== "undefined" && Boolean(sessionStorage.getItem("binista_splash_shown"));

  const [isVisible, setIsVisible] = useState(() => {
    if (isNativeOrStandalone || alreadyShown) {
      return false;
    }
    return true;
  });

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && (window as any).Capacitor?.Plugins?.SplashScreen) {
        (window as any).Capacitor.Plugins.SplashScreen.hide().catch(() => {});
      }
    } catch {}

    if (isNativeOrStandalone || alreadyShown) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("binista_splash_shown", "true");
      }
      if (onComplete) {
        onComplete();
      }
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(false);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("binista_splash_shown", "true");
      }
      if (onComplete) {
        onComplete();
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [onComplete, isNativeOrStandalone, alreadyShown]);

  if (!isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          id="official-splash-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-[#0b1017] text-white select-none pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center justify-center p-6"
          >
            <div className="w-32 h-32 sm:w-38 sm:h-38 rounded-3xl overflow-hidden shadow-2xl bg-black/40 flex items-center justify-center border border-white/10 ring-4 ring-emerald-500/30">
              <img
                src="/app_icon.png"
                alt="BINISTA"
                className="w-full h-full object-cover"
                loading="eager"
                decoding="sync"
              />
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="mt-5 text-center"
            >
              <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-emerald-400 uppercase font-sans">
                BINISTA
              </h1>
              <p className="text-[11px] font-bold text-emerald-400 tracking-[0.3em] uppercase mt-1">
                LIVE CHAT & SOCIAL COMMUNITY
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
