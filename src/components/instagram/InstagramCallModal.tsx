import React, { useState, useEffect, useRef } from "react";
import { 
  Phone, Video, PhoneOff, Mic, MicOff, Camera, 
  CameraOff, Volume2, VolumeX, RotateCw, Sparkles, User, Loader2
} from "lucide-react";
import { webRtcCallManager, CallType, CallState } from "../../lib/webrtcCallService";
import { playChatNotificationSound, vibrateDevice } from "../../lib/sound";

interface InstagramCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  callId?: string;
  isIncoming?: boolean;
  callType: CallType;
  caller: { id: string; name: string; photo?: string };
  target: { id: string; name: string; photo?: string };
}

export const InstagramCallModal: React.FC<InstagramCallModalProps> = ({
  isOpen,
  onClose,
  callId: initialCallId,
  isIncoming = false,
  callType,
  caller,
  target
}) => {
  const [callState, setCallState] = useState<CallState>(isIncoming ? 'ring' : 'calling');
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [activeCallId, setActiveCallId] = useState<string | null>(initialCallId || null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const ringtoneInterval = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) return;

    webRtcCallManager.onStateChange = (state) => {
      setCallState(state);
      if (state === 'ended' || state === 'rejected') {
        if (ringtoneInterval.current) clearInterval(ringtoneInterval.current);
        setTimeout(() => onClose(), 1500);
      }
    };

    webRtcCallManager.onRemoteStream = (stream) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    };

    webRtcCallManager.onDurationUpdate = (sec) => {
      setDuration(sec);
    };

    // If outgoing, start the call
    if (!isIncoming && !activeCallId) {
      webRtcCallManager.startCall(
        { id: caller.id, name: caller.name, photo: caller.photo },
        { id: target.id, name: target.name, photo: target.photo },
        callType
      ).then((id) => {
        setActiveCallId(id);
      }).catch((err) => {
        console.error("Failed to start call:", err);
        setCallState('failed');
      });
    }

    // Play ringing vibration for incoming
    if (isIncoming) {
      ringtoneInterval.current = setInterval(() => {
        playChatNotificationSound();
        vibrateDevice([300, 200, 300]);
      }, 3000);
    }

    return () => {
      if (ringtoneInterval.current) clearInterval(ringtoneInterval.current);
    };
  }, [isOpen]);

  // Connect local video stream to ref when available
  useEffect(() => {
    if (callState === 'connected' && callType === 'video') {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      }).catch(() => {});
    }
  }, [callState]);

  if (!isOpen) return null;

  const handleAcceptIncoming = async () => {
    if (ringtoneInterval.current) clearInterval(ringtoneInterval.current);
    if (!activeCallId && initialCallId) setActiveCallId(initialCallId);
    try {
      setCallState('connecting');
      await webRtcCallManager.answerCall(initialCallId || activeCallId || "", callType);
    } catch (err) {
      console.error("Error answering call:", err);
      setCallState('failed');
    }
  };

  const handleRejectIncoming = async () => {
    if (ringtoneInterval.current) clearInterval(ringtoneInterval.current);
    if (initialCallId || activeCallId) {
      await webRtcCallManager.rejectCall(initialCallId || activeCallId || "");
    }
    onClose();
  };

  const handleEndCall = async () => {
    if (ringtoneInterval.current) clearInterval(ringtoneInterval.current);
    await webRtcCallManager.endCall();
    onClose();
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const displayUser = isIncoming ? caller : target;

  return (
    <div className="fixed inset-0 z-[500] bg-[#070b12] text-white flex flex-col justify-between max-w-lg mx-auto md:max-w-xl font-sans select-none overflow-hidden animate-fadeIn">
      
      {/* Video Streams Container if Video Call */}
      {callType === 'video' && callState === 'connected' ? (
        <div className="absolute inset-0 z-0 bg-black">
          {/* Remote Fullscreen Video */}
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover" 
          />
          {/* Local Picture-in-Picture Video */}
          <div className="absolute top-6 right-6 w-28 h-40 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-2xl bg-slate-900 z-10">
            <video 
              ref={localVideoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover" 
            />
          </div>
        </div>
      ) : null}

      {/* Top Header info */}
      <div className="relative z-20 pt-10 px-6 text-center space-y-2 bg-gradient-to-b from-black/80 to-transparent pb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-bold text-emerald-300 border border-white/10">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          <span>{callType === 'video' ? 'ভিডিও কল (WebRTC HD)' : 'অডিও কল (HD Voice)'}</span>
        </div>

        <h2 className="text-xl font-black text-white">{displayUser.name}</h2>
        
        <p className="text-xs text-slate-300 font-medium">
          {callState === 'ring' && (isIncoming ? 'ইনকামিং কল আসছে...' : 'রিং হচ্ছে...')}
          {callState === 'calling' && 'কল করা হচ্ছে...'}
          {callState === 'connecting' && 'সংযোগ স্থাপন হচ্ছে...'}
          {callState === 'connected' && formatDuration(duration)}
          {callState === 'ended' && 'কল শেষ হয়েছে'}
          {callState === 'rejected' && 'কলটি বাতিল বা প্রত্যাখ্যাত হয়েছে'}
          {callState === 'failed' && 'সংযোগ স্থাপন ব্যর্থ হয়েছে'}
        </p>
      </div>

      {/* Center Avatar for Audio or Calling state */}
      {callType === 'audio' || callState !== 'connected' ? (
        <div className="relative z-20 flex-1 flex flex-col items-center justify-center p-6 space-y-6">
          <div className="relative">
            <div className={`w-32 h-32 rounded-full overflow-hidden ring-4 ring-emerald-500/60 shadow-[0_0_50px_rgba(16,185,129,0.3)] bg-slate-800 ${callState === 'ring' ? 'animate-bounce' : ''}`}>
              {displayUser.photo ? (
                <img src={displayUser.photo} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <User className="w-16 h-16" />
                </div>
              )}
            </div>
            {callState === 'connecting' && (
              <div className="absolute inset-0 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin" />
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1" />
      )}

      {/* Bottom Action Controls */}
      <div className="relative z-20 p-6 pb-10 bg-gradient-to-t from-black/90 via-black/60 to-transparent space-y-6">
        
        {/* Mid Controls during connected state */}
        {callState === 'connected' && (
          <div className="flex items-center justify-center gap-4">
            {/* Mute */}
            <button 
              onClick={() => {
                const next = !isMuted;
                setIsMuted(next);
                webRtcCallManager.toggleMicrophone(next);
              }}
              className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
                isMuted ? 'bg-rose-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title="মাইক মিউট"
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Camera On/Off if video */}
            {callType === 'video' && (
              <button 
                onClick={() => {
                  const next = !isCameraOff;
                  setIsCameraOff(next);
                  webRtcCallManager.toggleCamera(next);
                }}
                className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
                  isCameraOff ? 'bg-rose-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
                title="ক্যামেরা অন/অফ"
              >
                {isCameraOff ? <CameraOff className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
              </button>
            )}

            {/* Speaker */}
            <button 
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
                isSpeakerOn ? 'bg-emerald-500 text-black' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title="স্পিকার"
            >
              {isSpeakerOn ? <Volume2 className="w-5 h-5 font-bold" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>
        )}

        {/* Incoming Call Accept / Reject buttons */}
        {isIncoming && callState === 'ring' ? (
          <div className="flex items-center justify-around px-8">
            <button 
              onClick={handleRejectIncoming}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform">
                <PhoneOff className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold text-rose-400">কেটে দিন</span>
            </button>

            <button 
              onClick={handleAcceptIncoming}
              className="flex flex-col items-center gap-2 group cursor-pointer animate-pulse"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center shadow-lg active:scale-90 transition-transform">
                <Phone className="w-7 h-7 stroke-[2.5]" />
              </div>
              <span className="text-xs font-bold text-emerald-400">রিসিভ করুন</span>
            </button>
          </div>
        ) : (
          /* End Call Button */
          <div className="flex justify-center">
            <button 
              onClick={handleEndCall}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-2xl active:scale-90 transition-transform">
                <PhoneOff className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold text-rose-400">কল শেষ করুন</span>
            </button>
          </div>
        )}

      </div>

    </div>
  );
};
