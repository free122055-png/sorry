import { VoiceMood } from "../context/VoiceGuidanceContext";

/**
 * Premium Voice Service for Al MAYADIN FASHION
 * Handles high-fidelity human-like speech synthesis with multi-stage fallback.
 */

// Map moods to SSML-like parameters for natural human rhythm
const MOOD_CONFIG: Record<string, { rate: number; pitch: number; volume: string }> = {
  WELCOME: { rate: 0.95, pitch: 1.05, volume: "+2dB" }, // Warm & Inviting
  FASHION: { rate: 1.0, pitch: 1.0, volume: "+0dB" },   // Confident & Attractive
  PRODUCT: { rate: 0.98, pitch: 1.0, volume: "+0dB" },  // Calm & Informative
  ADDRESS: { rate: 0.85, pitch: 1.0, volume: "+0dB" },  // Slow & Clear
  ORDER: { rate: 0.95, pitch: 1.0, volume: "+0dB" },    // Helpful & Professional
  SUCCESS: { rate: 1.05, pitch: 1.1, volume: "+3dB" },  // Joyful & Warm
  ERROR: { rate: 0.9, pitch: 0.95, volume: "+0dB" },    // Calm & Supportive
  INFO: { rate: 0.95, pitch: 1.0, volume: "+0dB" }      // Standard
};

let isServerBlocked = false;
let lastServerCheck = 0;
const BLOCK_DURATION = 1000 * 60 * 5; // 5 minutes

let currentAudio: HTMLAudioElement | null = null;
let currentEstimatedTimeout: any = null;
let currentGenerationId = 0;

/**
 * Stage 1: Premium TTS implementation using high-quality Neural voices.
 */
export async function getPremiumAudioUrl(text: string, mood: VoiceMood = "INFO"): Promise<string | null> {
  if (typeof navigator !== "undefined" && !navigator.onLine) return null;
  // ... existing circuit breaker logic ...

  // Circuit Breaker: If server was recently blocked, don't try again for a while
  const now = Date.now();
  if (isServerBlocked && now - lastServerCheck < BLOCK_DURATION) {
    return null;
  }

  try {
    const config = MOOD_CONFIG[mood] || MOOD_CONFIG.INFO;
    
    const response = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        mood,
        rate: config.rate,
        pitch: config.pitch,
        volume: config.volume
      })
    });

    if (!response.ok) {
      // Trigger circuit breaker on server rejection (like 403 or 503)
      isServerBlocked = true;
      lastServerCheck = now;
      console.warn(`[PremiumVoice] Server rejected request: ${response.status}. Circuit breaker enabled.`);
      return null;
    }
    
    // Success - reset circuit breaker
    isServerBlocked = false;
    const data = await response.json();
    return data.audioUrl || null;
  } catch (err) {
    console.warn("[PremiumVoice] Server fetch exception:", err);
    return null;
  }
}

/**
 * Stage 2: Android Native Bridge Fallback
 */
function speakViaNativeBridge(text: string): boolean {
  if (typeof window !== "undefined" && (window as any).AndroidNativeVoiceBridge) {
    try {
      (window as any).AndroidNativeVoiceBridge.speak(text);
      return true;
    } catch (e) {
      console.warn("[PremiumVoice] Native bridge failed:", e);
    }
  }
  return false;
}

/**
 * Stage 3: Web Speech API Fallback
 */
function speakViaWebSpeech(text: string, onEnd?: () => void): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    if (onEnd) onEnd();
    return;
  }

  try {
    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = synth.getVoices();
    const bnVoice = voices.find(v => v.lang === "bn-BD") || voices.find(v => v.lang.toLowerCase().startsWith("bn"));
    
    if (bnVoice) utterance.voice = bnVoice;
    utterance.lang = "bn-BD";
    utterance.rate = 0.95;
    
    utterance.onend = () => { if (onEnd) onEnd(); };
    utterance.onerror = () => { if (onEnd) onEnd(); };
    
    synth.speak(utterance);
  } catch (err) {
    console.warn("[PremiumVoice] WebSpeech exception:", err);
    if (onEnd) onEnd();
  }
}

/**
 * Orchestrator: Play voice with Human-like quality first, fallback automatically if needed.
 */
export async function playPremiumVoice(
  text: string, 
  mood: VoiceMood = "INFO",
  onEnd?: () => void
): Promise<boolean> {
  // Increment generation ID to invalidate previous async attempts
  const generationId = ++currentGenerationId;
  
  // Always stop previous audio first
  stopPremiumVoice();

  // 1. Try Premium Server-Side Voice (Stage 1)
  const url = await getPremiumAudioUrl(text, mood);
  
  // If a new generation started while we were fetching the URL, abort this one
  if (generationId !== currentGenerationId) return false;

  if (url) {
    return new Promise((resolve) => {
      const audio = new Audio(url);
      currentAudio = audio;
      
      const handleFallback = () => {
        if (generationId !== currentGenerationId) return;
        if (currentAudio !== audio) return; // Already stopped or replaced
        
        console.warn("[PremiumVoice] Server audio failed, trying fallbacks...");
        const nativeSuccess = speakViaNativeBridge(text);
        if (!nativeSuccess) {
          speakViaWebSpeech(text, onEnd);
        } else if (onEnd) {
          const estimatedMs = Math.min(Math.max(text.length * 110, 1800), 8000);
          currentEstimatedTimeout = setTimeout(() => {
            if (generationId === currentGenerationId) onEnd();
          }, estimatedMs);
        }
        resolve(true);
      };

      audio.onended = () => {
        if (generationId !== currentGenerationId) return;
        if (currentAudio === audio) currentAudio = null;
        if (onEnd) onEnd();
        resolve(true);
      };

      audio.onerror = handleFallback;
      
      audio.play().catch((err) => {
        console.warn("[PremiumVoice] Audio play blocked/failed:", err);
        handleFallback();
      });

      const safetyTimeout = setTimeout(() => {
        if (generationId === currentGenerationId && currentAudio === audio && audio.readyState < 3) {
          audio.pause();
          audio.src = "";
          handleFallback();
        }
      }, 6000);
      
      // Clean up safety timeout on end
      const originalOnEnded = audio.onended;
      audio.onended = (ev) => {
        clearTimeout(safetyTimeout);
        if (originalOnEnded) (originalOnEnded as any)(ev);
      };
    });
  }

  // 2. Fallback to Native Bridge (Stage 2)
  const nativeSuccess = speakViaNativeBridge(text);
  if (nativeSuccess) {
    if (onEnd) {
      const estimatedMs = Math.min(Math.max(text.length * 110, 1800), 8000);
      currentEstimatedTimeout = setTimeout(() => {
        if (generationId === currentGenerationId) onEnd();
      }, estimatedMs);
    }
    return true;
  }

  // 3. Fallback to Web Speech API (Stage 3)
  if (generationId === currentGenerationId) {
    speakViaWebSpeech(text, onEnd);
  }
  return true;
}

/**
 * Stops any ongoing premium voice or fallback audio.
 */
export function stopPremiumVoice() {
  currentGenerationId++; // Invalidate any pending async work
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.src = "";
      currentAudio = null;
    } catch (e) {}
  }

  if (currentEstimatedTimeout) {
    clearTimeout(currentEstimatedTimeout);
    currentEstimatedTimeout = null;
  }

  // Stop Web Speech
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }

  // Stop Native Bridge
  if (typeof window !== "undefined" && (window as any).AndroidNativeVoiceBridge) {
    try {
      (window as any).AndroidNativeVoiceBridge.stop();
    } catch (e) {}
  }
}
