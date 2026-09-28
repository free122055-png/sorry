import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Gift, Sparkles, Heart, Star, Music } from "lucide-react";
import confetti from "canvas-confetti";

interface BirthdaySurpriseProps {
  recipientName: string;
  senderName: string;
  message: string;
  templateId: string;
  onClose: () => void;
}

const TEMPLATE_CONFIG: Record<string, { bg: string, text: string, accent: string, particles: string[] }> = {
  "birthday_celebration": {
    bg: "bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900",
    text: "text-white",
    accent: "text-yellow-400",
    particles: ["🎂", "🎉", "✨", "🎈"]
  },
  "balloons": {
    bg: "bg-gradient-to-br from-blue-500 to-purple-600",
    text: "text-white",
    accent: "text-pink-300",
    particles: ["🎈", "🎈", "🎈", "✨"]
  },
  "golden_celebration": {
    bg: "bg-gradient-to-br from-gray-900 via-black to-gray-900",
    text: "text-yellow-500",
    accent: "text-yellow-200",
    particles: ["✨", "🌟", "👑", "💫"]
  },
  "luxury_birthday": {
    bg: "bg-gradient-to-br from-rose-950 to-black",
    text: "text-rose-200",
    accent: "text-rose-500",
    particles: ["💎", "✨", "🌟", "🌹"]
  },
  "sparkle": {
    bg: "bg-gradient-to-br from-emerald-900 to-teal-950",
    text: "text-teal-100",
    accent: "text-yellow-300",
    particles: ["✨", "💫", "🌟", "✨"]
  },
  "soft_elegant": {
    bg: "bg-gradient-to-br from-pink-50 to-rose-100",
    text: "text-rose-900",
    accent: "text-rose-500",
    particles: ["🌸", "☁️", "✨", "💖"]
  },
  "gift_reveal": {
    bg: "bg-gradient-to-br from-red-600 to-rose-800",
    text: "text-white",
    accent: "text-yellow-400",
    particles: ["🎁", "🎊", "🎈", "✨"]
  },
  "friendship": {
    bg: "bg-gradient-to-br from-sky-400 to-blue-600",
    text: "text-white",
    accent: "text-yellow-300",
    particles: ["❤️", "🌟", "✨", "🤝"]
  },
  "minimal_premium": {
    bg: "bg-white",
    text: "text-gray-900",
    accent: "text-blue-600",
    particles: ["✨", "⚪", "⚫", "💫"]
  },
  "celebration_party": {
    bg: "bg-gradient-to-br from-orange-500 to-red-600",
    text: "text-white",
    accent: "text-yellow-300",
    particles: ["🎉", "🎊", "🕺", "💃"]
  }
};

export const BirthdaySurprise: React.FC<BirthdaySurpriseProps> = ({ 
  recipientName, 
  senderName, 
  message, 
  templateId, 
  onClose 
}) => {
  const [step, setStep] = useState(0);
  const config = TEMPLATE_CONFIG[templateId] || TEMPLATE_CONFIG.birthday_celebration;

  useEffect(() => {
    // Initial blast
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    // Sequence steps
    setTimeout(() => setStep(1), 1000); // Reveal Recipient
    setTimeout(() => setStep(2), 2500); // Reveal Message
    setTimeout(() => setStep(3), 4000); // Reveal Sender

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 text-center overflow-hidden ${config.bg}`}
    >
      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: window.innerHeight + 100,
              rotate: 0,
              scale: 0.5 + Math.random()
            }}
            animate={{ 
              y: -100,
              rotate: 360,
              x: (Math.random() - 0.5) * 200 + (Math.random() * window.innerWidth)
            }}
            transition={{ 
              duration: 10 + Math.random() * 10, 
              repeat: Infinity, 
              ease: "linear",
              delay: Math.random() * 10
            }}
            className="absolute text-2xl"
          >
            {config.particles[i % config.particles.length]}
          </motion.div>
        ))}
      </div>

      {/* Close Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onClose}
        className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white z-[110] border border-white/20"
      >
        <X className="w-6 h-6" />
      </motion.button>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-lg space-y-12">
        {/* Surprise Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 12 }}
          className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-[32px] border border-white/20 flex items-center justify-center mx-auto shadow-2xl"
        >
          <Gift className={`w-12 h-12 ${config.accent}`} />
        </motion.div>

        {/* Step 1: Recipient Name Reveal */}
        <AnimatePresence>
          {step >= 1 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h2 className={`text-4xl sm:text-5xl font-black ${config.text} tracking-tighter drop-shadow-lg`}>
                Happy Birthday, <br/>
                <span className={config.accent}>{recipientName}!</span>
              </h2>
              <div className="flex items-center justify-center gap-3">
                <div className={`h-[1px] w-12 ${config.text} opacity-30`} />
                <Sparkles className={`w-4 h-4 ${config.accent}`} />
                <div className={`h-[1px] w-12 ${config.text} opacity-30`} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 2: Message Box */}
        <AnimatePresence>
          {step >= 2 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-2xl p-8 rounded-[40px] border border-white/20 shadow-2xl relative"
            >
              <p className={`text-lg sm:text-xl font-bold leading-relaxed italic ${config.text}`}>
                "{message}"
              </p>
              <Heart className={`absolute -top-4 -right-4 w-10 h-10 ${config.accent} fill-current drop-shadow-lg`} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 3: Sender Name */}
        <AnimatePresence>
          {step >= 3 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2"
            >
              <p className={`text-[11px] font-black uppercase tracking-[0.3em] opacity-60 ${config.text}`}>With Love from</p>
              <h3 className={`text-2xl font-black ${config.accent}`}>{senderName}</h3>
              <div className="flex items-center justify-center gap-2 pt-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      delay: i * 0.2 
                    }}
                  >
                    <Star className={`w-5 h-5 ${config.accent} fill-current`} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Background Decor */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/20 pointer-events-none" />
    </motion.div>
  );
};
