import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { playPremiumVoice, stopPremiumVoice } from "../lib/premiumVoiceService";

export type VoiceMood = "FASHION" | "PRODUCT" | "ADDRESS" | "ORDER" | "SUCCESS" | "ERROR" | "WELCOME" | "INFO";

export interface VoiceGuidanceContextType {
  isVoiceEnabled: boolean;
  isSpeaking: boolean;
  currentMessage: string;
  toggleVoice: () => void;
  setVoiceEnabled: (enabled: boolean) => void;
  speak: (text: string, options?: { key?: string; force?: boolean; priority?: "high" | "normal"; mood?: VoiceMood }) => void;
  stop: () => void;
}

const VoiceGuidanceContext = createContext<VoiceGuidanceContextType | undefined>(undefined);

// Context routes mapping to natural Bengali instructions
const getRouteGuidance = (pathname: string, search: string): { message: string; key: string; mood: VoiceMood } | null => {
  const query = new URLSearchParams(search);
  
  if (query.get("search")) {
    return {
      message: "পণ্য সার্চ ফলাফল দেখাচ্ছে। পছন্দের পণ্য নির্বাচন করতে চাপ দিন।",
      key: `search-${query.get("search")}`,
      mood: "PRODUCT"
    };
  }

  // Home
  if (pathname === "/") {
    return {
      message: "আল মায়াদিন ফ্যাশনে আপনাকে স্বাগতম। আপনার পছন্দের বাজার বা পণ্য বেছে নিন।",
      key: "home",
      mood: "WELCOME"
    };
  }

  // Categories overview
  if (pathname === "/categories") {
    return {
      message: "সকল পণ্যের ক্যাটাগরি তালিকা। আপনার প্রয়োজনীয় ক্যাটাগরি বাছাই করুন।",
      key: "categories",
      mood: "INFO"
    };
  }

  // Specific Category listing
  if (pathname.startsWith("/category/")) {
    const catId = pathname.replace("/category/", "").split("/")[0];
    if (catId === "cat3") {
      return {
        message: "আপনি এখন Fashion সেকশনে আছেন। আপনার পছন্দের পণ্য নির্বাচন করুন।",
        key: "category-cat3",
        mood: "FASHION"
      };
    }
    if (catId === "cat2") {
      return {
        message: "আপনি এখন অয়েল কর্নারে আছেন। খাঁটি তেলের সংগ্রহ দেখুন।",
        key: "category-cat2",
        mood: "PRODUCT"
      };
    }
    if (catId === "cat4") {
      return {
        message: "আপনি এখন উপহার বাজারে আছেন। উপহারের সামগ্রী নির্বাচন করুন।",
        key: "category-cat4",
        mood: "PRODUCT"
      };
    }
    if (catId === "cat6") {
      return {
        message: "আপনি এখন ইসলামিক বাজারে আছেন। ইসলামিক পণ্য সামগ্রী বেছে নিন।",
        key: "category-cat6",
        mood: "PRODUCT"
      };
    }
    return {
      message: "পণ্য তালিকা দেখছেন। বিস্তারিত দেখতে যেকোনো পণ্যে চাপ দিন।",
      key: `category-${catId}`,
      mood: "PRODUCT"
    };
  }

  // Product Details
  if (pathname.startsWith("/product/") || pathname.startsWith("/p/") || pathname.startsWith("/food/product/")) {
    return {
      message: "আপনি এখন পণ্যের বিস্তারিত দেখছেন। অর্ডার করতে নিচের Order বাটনে চাপ দিন।",
      key: `product-details-${pathname}`,
      mood: "PRODUCT"
    };
  }

  // Cart
  if (pathname === "/cart" || pathname === "/food/cart") {
    return {
      message: "আপনার শপিং কার্ট। পণ্য অর্ডার করতে চেকআউট বাটনে চাপ দিন।",
      key: "cart",
      mood: "INFO"
    };
  }

  // Checkout
  if (pathname === "/checkout" || pathname === "/food/checkout") {
    return {
      message: "আপনার অর্ডার সম্পন্ন করতে প্রয়োজনীয় তথ্যগুলো প্রদান করুন।",
      key: "checkout",
      mood: "ORDER"
    };
  }

  // Food Dedicated Buy Flow
  if (pathname === "/food/buy") {
    return {
      message: "অর্ডার প্রক্রিয়া শুরু হয়েছে। ধাপগুলো অনুসরণ করে তথ্য দিন।",
      key: "food-buy",
      mood: "ORDER"
    };
  }

  // Orders
  if (pathname === "/orders" || pathname === "/food/orders") {
    return {
      message: "এখানে আপনার সকল অর্ডারের তালিকা দেখতে পাবেন।",
      key: "orders",
      mood: "INFO"
    };
  }

  // Order Details & Tracking
  if (pathname.startsWith("/order/") || pathname.startsWith("/food/order/") || pathname.startsWith("/food/tracking")) {
    return {
      message: "আপনার অর্ডারের বিবরণ ও লাইভ ট্র্যাকিং স্ট্যাটাস।",
      key: "order-details",
      mood: "INFO"
    };
  }

  // Wishlist
  if (pathname === "/wishlist") {
    return {
      message: "আপনার পছন্দের সংরক্ষিত পণ্য তালিকা।",
      key: "wishlist",
      mood: "PRODUCT"
    };
  }

  // Notifications
  if (pathname === "/notifications") {
    return {
      message: "আপনার সকল নোটিফিকেশন ও গুরুত্বপূর্ণ বার্তা।",
      key: "notifications",
      mood: "INFO"
    };
  }

  // Addresses
  if (pathname === "/addresses") {
    return {
      message: "আপনার সংরক্ষিত ডেলিভারি ঠিকানা সমূহ।",
      key: "addresses",
      mood: "ADDRESS"
    };
  }

  // Account / Profile
  if (pathname === "/account") {
    return {
      message: "এটি আপনার প্রোফাইল। আপনার অর্ডার এবং অ্যাকাউন্ট সেটিংস দেখুন।",
      key: "account",
      mood: "WELCOME"
    };
  }

  // Settings
  if (pathname === "/account-settings" || pathname === "/account/settings" || pathname === "/settings") {
    return {
      message: "অ্যাপ সেটিংস। আপনার প্রোফাইল, নিরাপত্তা ও ভয়েস গাইডেন্স নিয়ন্ত্রণ করুন।",
      key: "account-settings",
      mood: "INFO"
    };
  }

  // Login
  if (pathname === "/login") {
    return {
      message: "আপনার অ্যাকাউন্টে লগইন করতে মোবাইল নম্বর বা তথ্য দিন।",
      key: "login",
      mood: "WELCOME"
    };
  }

  // Register
  if (pathname === "/register") {
    return {
      message: "নতুন অ্যাকাউন্ট তৈরি করতে আপনার তথ্য দিন।",
      key: "register",
      mood: "WELCOME"
    };
  }

  // Islamic Tilawat
  if (pathname === "/islamic-tilawat" || pathname === "/tilawat") {
    return {
      message: "পবিত্র কুরআন তেলাওয়াত লাইব্রেরিতে স্বাগতম। ১১৪ সূরার অডিও শুনতে পারেন।",
      key: "islamic-tilawat",
      mood: "WELCOME"
    };
  }

  // Caption Ghor
  if (pathname === "/caption-ghor") {
    return {
      message: "ক্যাপশন ঘরে আপনাকে স্বাগতম। সুন্দর স্ট্যাটাস ও ক্যাপশন বেছে নিন।",
      key: "caption-ghor",
      mood: "WELCOME"
    };
  }

  // Pixel Editing Tools
  if (pathname === "/pixel-editing-tools" || pathname === "/pixel-tools" || pathname === "/pixel") {
    return {
      message: "এডিটিং টুলসে স্বাগতম। আপনার ছবি বা ডিজাইন সাজিয়ে নিন।",
      key: "pixel-editing",
      mood: "WELCOME"
    };
  }

  // Matrimonial
  if (pathname === "/matrimonial" || pathname === "/biodata" || pathname === "/marriage") {
    return {
      message: "বিবাহের বায়োডাটা সেকশনে স্বাগতম। দ্বীনি পাত্র ও পাত্রীর সন্ধান করুন।",
      key: "matrimonial",
      mood: "WELCOME"
    };
  }

  // Telecom
  if (pathname === "/telecom" || pathname === "/telecom-service") {
    return {
      message: "টেলিকম অফার এবং সাশ্রয়ী ইন্টারনেট প্যাক দেখুন।",
      key: "telecom",
      mood: "PRODUCT"
    };
  }

  // Reminders
  if (pathname === "/reminders") {
    return {
      message: "রিমাইন্ডার সেকশন। গুরুত্বপূর্ণ কাজ সময়মতো মনে করিয়ে দেবে।",
      key: "reminders",
      mood: "INFO"
    };
  }

  // Help & Support
  if (pathname === "/help" || pathname === "/help-center" || pathname === "/faq") {
    return {
      message: "সহায়তা কেন্দ্র। প্রয়োজনীয় প্রশ্ন ও উত্তর খুঁজে নিন।",
      key: "help-center",
      mood: "INFO"
    };
  }

  // Contact
  if (pathname === "/contact" || pathname === "/contact-us") {
    return {
      message: "যোগাযোগ কেন্দ্র। যেকোনো প্রয়োজনে আমাদের সাথে যোগাযোগ করুন।",
      key: "contact",
      mood: "INFO"
    };
  }

  return null;
};

// Form Input Focus Guidance Mapping
const getInputGuidance = (el: HTMLElement): { message: string; key: string; mood: VoiceMood } | null => {
  const tagName = el.tagName.toLowerCase();
  if (tagName !== "input" && tagName !== "textarea" && tagName !== "select") return null;

  const inputEl = el as HTMLInputElement;
  const type = (inputEl.type || "").toLowerCase();
  const name = (inputEl.name || "").toLowerCase();
  const id = (inputEl.id || "").toLowerCase();
  const placeholder = (inputEl.placeholder || "").toLowerCase();
  const ariaLabel = (inputEl.getAttribute("aria-label") || "").toLowerCase();
  const combined = `${name} ${id} ${placeholder} ${ariaLabel}`;

  if (["checkbox", "radio", "hidden", "submit", "button", "file"].includes(type)) {
    return null;
  }

  // Name Field
  if (
    combined.includes("customername") ||
    combined.includes("fullname") ||
    combined.includes("username") ||
    combined.includes("name") ||
    combined.includes("নাম")
  ) {
    return {
      message: "এখন আপনার নাম দিন।",
      key: "input-name",
      mood: "ADDRESS"
    };
  }

  // Phone / Mobile Field
  if (
    type === "tel" ||
    combined.includes("phone") ||
    combined.includes("mobile") ||
    combined.includes("ফোন") ||
    combined.includes("মোবাইল") ||
    combined.includes("নম্বর") ||
    combined.includes("০১") ||
    combined.includes("01")
  ) {
    return {
      message: "এখন আপনার মোবাইল নম্বর দিন।",
      key: "input-phone",
      mood: "ADDRESS"
    };
  }

  // Address Field
  if (
    tagName === "textarea" ||
    combined.includes("address") ||
    combined.includes("area") ||
    combined.includes("district") ||
    combined.includes("division") ||
    combined.includes("ঠিকানা") ||
    combined.includes("জেলা") ||
    combined.includes("এলাকা") ||
    combined.includes("রোড")
  ) {
    return {
      message: "এখন আপনার সম্পূর্ণ ডেলিভারি ঠিকানা দিন।",
      key: "input-address",
      mood: "ADDRESS"
    };
  }

  // Search Field
  if (type === "search" || combined.includes("search") || combined.includes("সার্চ") || combined.includes("খুঁজুন")) {
    return {
      message: "পণ্য বা সেবা খুঁজতে নাম লিখুন।",
      key: "input-search",
      mood: "INFO"
    };
  }

  // Password / PIN Field
  if (type === "password" || combined.includes("password") || combined.includes("পাসওয়ার্ড") || combined.includes("পিন")) {
    return {
      message: "আপনার গোপন পাসওয়ার্ড দিন।",
      key: "input-password",
      mood: "ADDRESS"
    };
  }

  // Email Field
  if (type === "email" || combined.includes("email") || combined.includes("ইমেইল")) {
    return {
      message: "আপনার ইমেইল ঠিকানা দিন।",
      key: "input-email",
      mood: "ADDRESS"
    };
  }

  return null;
};

export const VoiceGuidanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isVoiceEnabled, setIsVoiceEnabledState] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem("voice_guidance_enabled");
      return stored !== "false";
    } catch {
      return true;
    }
  });

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const isAudioUnlockedRef = useRef(false);
  const queuedVoiceRef = useRef<{ text: string; key: string } | null>(null);
  const lastSpeakTimeRef = useRef(0);

  // Anti-annoyance tracker: Prevents repeating the exact same voice in rapid succession
  const lastSpokenRef = useRef<{ key: string; time: number }>({ key: "", time: 0 });
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const setVoiceEnabled = useCallback((enabled: boolean) => {
    setIsVoiceEnabledState(enabled);
    try {
      localStorage.setItem("voice_guidance_enabled", enabled ? "true" : "false");
    } catch {}
    if (!enabled && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentMessage("");
    }
  }, []);

  const toggleVoice = useCallback(() => {
    setIsVoiceEnabledState(prev => {
      const next = !prev;
      try {
        localStorage.setItem("voice_guidance_enabled", next ? "true" : "false");
      } catch {}
      if (!next && typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setCurrentMessage("");
      }
      return next;
    });
  }, []);

  const stop = useCallback(() => {
    stopPremiumVoice();
    setIsSpeaking(false);
    setCurrentMessage("");
  }, []);

  // Primary speech executor with Native Android Bridge, Premium Neural TTS, and Web Speech architecture
  const speak = useCallback((text: string, options?: { key?: string; force?: boolean; priority?: "high" | "normal"; mood?: VoiceMood }) => {
    if (!text || !text.trim()) return;
    if (!isVoiceEnabled && !options?.force) return;

    const now = Date.now();
    // Prevent rapid fire triggers (e.g. from React Dev mode or overlapping effects)
    if (now - lastSpeakTimeRef.current < 500 && !options?.force) {
      return;
    }
    lastSpeakTimeRef.current = now;

    // Immediately stop any ongoing speech before starting a new one
    stop();

    const key = options?.key || text;
    const mood = options?.mood || "INFO";

    // Anti-annoyance: Check repetition within 20 seconds unless forced or high priority
    if (!options?.force && options?.priority !== "high") {
      if (lastSpokenRef.current.key === key && now - lastSpokenRef.current.time < 20000) {
        return;
      }
    }

    setIsSpeaking(true);
    setCurrentMessage(text);
    lastSpokenRef.current = { key, time: Date.now() };

    // Use orchestrated multi-stage playback from library
    playPremiumVoice(text, mood, () => {
      setIsSpeaking(false);
    }).catch(err => {
      console.error("[VoiceContext] Speak execution failed:", err);
      setIsSpeaking(false);
    });
  }, [isVoiceEnabled]);

  // Unlock Audio on First User Gesture (Essential for Android WebView & Mobile Browsers)
  useEffect(() => {
    const handleFirstGesture = () => {
      isAudioUnlockedRef.current = true;
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.resume();
      }
      // If there was a queued greeting from the initial page load, speak it now
      if (queuedVoiceRef.current && isVoiceEnabled) {
        const item = queuedVoiceRef.current;
        queuedVoiceRef.current = null;
        speak(item.text, { key: item.key });
      }
      window.removeEventListener("touchstart", handleFirstGesture);
      window.removeEventListener("click", handleFirstGesture);
    };

    window.addEventListener("touchstart", handleFirstGesture, { passive: true });
    window.addEventListener("click", handleFirstGesture, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleFirstGesture);
      window.removeEventListener("click", handleFirstGesture);
    };
  }, [isVoiceEnabled, speak]);

  // Trigger guidance when user navigates to a new Screen / Section / Page
  useEffect(() => {
    const guidance = getRouteGuidance(location.pathname, location.search);
    if (guidance) {
      // Small timeout to allow screen transition to settle
      const timer = setTimeout(() => {
        // Force stop previous guidance on route change
        stop();
        speak(guidance.message, { key: guidance.key, mood: guidance.mood });
      }, 400);
      return () => clearTimeout(timer);
    } else {
      // If no guidance for this route, stop any ongoing audio from the previous route
      stop();
    }
  }, [location.pathname, location.search, speak, stop]);

  // Global Input Field Focus Listener
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const inputGuidance = getInputGuidance(target);
      if (inputGuidance) {
        speak(inputGuidance.message, { key: inputGuidance.key, mood: inputGuidance.mood });
      }
    };

    document.addEventListener("focusin", handleFocusIn);
    return () => {
      document.removeEventListener("focusin", handleFocusIn);
    };
  }, [speak]);

  return (
    <VoiceGuidanceContext.Provider
      value={{
        isVoiceEnabled,
        isSpeaking,
        currentMessage,
        toggleVoice,
        setVoiceEnabled,
        speak,
        stop
      }}
    >
      {children}
    </VoiceGuidanceContext.Provider>
  );
};

export const useVoiceGuidance = (): VoiceGuidanceContextType => {
  const context = useContext(VoiceGuidanceContext);
  if (!context) {
    return {
      isVoiceEnabled: false,
      isSpeaking: false,
      currentMessage: "",
      toggleVoice: () => {},
      setVoiceEnabled: () => {},
      speak: () => {},
      stop: () => {},
    };
  }
  return context;
};
