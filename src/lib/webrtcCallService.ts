import { db } from "./firebase";
import { 
  collection, doc, setDoc, getDoc, updateDoc, 
  onSnapshot, addDoc, query, where, serverTimestamp, deleteDoc 
} from "firebase/firestore";

export type CallType = 'audio' | 'video';
export type CallState = 'idle' | 'calling' | 'ring' | 'connecting' | 'connected' | 'ended' | 'rejected' | 'missed' | 'busy' | 'failed';

export interface CallSession {
  id: string;
  callerId: string;
  callerName: string;
  callerPhoto?: string;
  targetUserId: string;
  targetUserName?: string;
  targetUserPhoto?: string;
  callType: CallType;
  status: CallState;
  createdAt: number;
}

const STUN_SERVERS = {
  iceServers: [
    { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] }
  ]
};

export class WebRTCCallManager {
  private pc: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private callId: string | null = null;
  private unsubCall: (() => void) | null = null;
  private unsubCandidates: (() => void) | null = null;

  public onStateChange?: (state: CallState) => void;
  public onRemoteStream?: (stream: MediaStream) => void;
  public onDurationUpdate?: (duration: number) => void;

  private durationTimer: any = null;
  private durationSeconds = 0;

  constructor() {}

  async initLocalStream(callType: CallType): Promise<MediaStream> {
    try {
      const constraints: MediaStreamConstraints = {
        audio: { echoCancellation: true, noiseSuppression: true },
        video: callType === 'video' ? { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' } : false
      };
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      return this.localStream;
    } catch (err) {
      console.error("[WebRTC] Media access error:", err);
      throw new Error("মাইক্রোফোন বা ক্যামেরার অনুমতি পাওয়া যায়নি।");
    }
  }

  async startCall(caller: { id: string; name: string; photo?: string }, target: { id: string; name?: string; photo?: string }, callType: CallType): Promise<string> {
    this.callId = [caller.id, target.id, Date.now()].sort().join("_");
    await this.initLocalStream(callType);

    this.pc = new RTCPeerConnection(STUN_SERVERS);
    this.setupPeerConnection();

    // Add local tracks to peer connection
    this.localStream?.getTracks().forEach(track => {
      if (this.pc && this.localStream) {
        this.pc.addTrack(track, this.localStream);
      }
    });

    // Create Offer
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);

    // Save call session & offer to Firestore
    const callRef = doc(db, "calls", this.callId);
    await setDoc(callRef, {
      id: this.callId,
      callerId: caller.id,
      callerName: caller.name,
      callerPhoto: caller.photo || "",
      targetUserId: target.id,
      targetUserName: target.name || "User",
      targetUserPhoto: target.photo || "",
      callType,
      status: 'ring',
      offer: { type: offer.type, sdp: offer.sdp },
      createdAt: serverTimestamp()
    });

    this.listenToSignaling(this.callId, false);
    if (this.onStateChange) this.onStateChange('calling');
    return this.callId;
  }

  async answerCall(callId: string, callType: CallType): Promise<void> {
    this.callId = callId;
    await this.initLocalStream(callType);

    this.pc = new RTCPeerConnection(STUN_SERVERS);
    this.setupPeerConnection();

    this.localStream?.getTracks().forEach(track => {
      if (this.pc && this.localStream) {
        this.pc.addTrack(track, this.localStream);
      }
    });

    const callRef = doc(db, "calls", callId);
    const snap = await getDoc(callRef);
    if (!snap.exists()) throw new Error("কল পাওয়া যায়নি।");

    const data = snap.data();
    await this.pc.setRemoteDescription(new RTCSessionDescription(data.offer));

    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);

    await updateDoc(callRef, {
      answer: { type: answer.type, sdp: answer.sdp },
      status: 'connecting'
    });

    this.listenToSignaling(callId, true);
    if (this.onStateChange) this.onStateChange('connecting');
  }

  private setupPeerConnection() {
    if (!this.pc) return;

    this.remoteStream = new MediaStream();
    if (this.onRemoteStream) this.onRemoteStream(this.remoteStream);

    this.pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach(track => {
        this.remoteStream?.addTrack(track);
      });
    };

    this.pc.onicecandidate = async (event) => {
      if (event.candidate && this.callId) {
        const candidateRef = collection(db, "calls", this.callId, "candidates");
        await addDoc(candidateRef, event.candidate.toJSON());
      }
    };

    this.pc.onconnectionstatechange = () => {
      if (this.pc) {
        if (this.pc.connectionState === 'connected') {
          if (this.onStateChange) this.onStateChange('connected');
          this.startDurationTimer();
        } else if (this.pc.connectionState === 'disconnected' || this.pc.connectionState === 'failed') {
          this.endCall();
        }
      }
    };
  }

  private listenToSignaling(callId: string, isCallee: boolean) {
    const callRef = doc(db, "calls", callId);
    
    this.unsubCall = onSnapshot(callRef, async (snap) => {
      if (!snap.exists()) {
        this.endCall();
        return;
      }
      const data = snap.data();
      if (data.status === 'ended' || data.status === 'rejected') {
        this.endCall();
      } else if (isCallee && data.answer && this.pc && !this.pc.currentRemoteDescription) {
        await this.pc.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
    });

    // ICE candidates
    const candidatesRef = collection(db, "calls", callId, "candidates");
    this.unsubCandidates = onSnapshot(candidatesRef, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const candidateData = change.doc.data();
          if (this.pc && this.pc.remoteDescription) {
            try {
              await this.pc.addIceCandidate(new RTCIceCandidate(candidateData));
            } catch (e) {
              console.warn("Error adding ICE candidate:", e);
            }
          }
        }
      });
    });
  }

  private startDurationTimer() {
    if (this.durationTimer) return;
    this.durationSeconds = 0;
    this.durationTimer = setInterval(() => {
      this.durationSeconds++;
      if (this.onDurationUpdate) this.onDurationUpdate(this.durationSeconds);
    }, 1000);
  }

  toggleMicrophone(mute: boolean) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !mute;
      });
    }
  }

  toggleCamera(off: boolean) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = !off;
      });
    }
  }

  async endCall() {
    if (this.durationTimer) clearInterval(this.durationTimer);
    this.durationTimer = null;

    if (this.unsubCall) this.unsubCall();
    if (this.unsubCandidates) this.unsubCandidates();

    if (this.callId) {
      try {
        await updateDoc(doc(db, "calls", this.callId), { status: 'ended' });
      } catch {}
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }

    if (this.onStateChange) this.onStateChange('ended');
  }

  async rejectCall(callId: string) {
    try {
      await updateDoc(doc(db, "calls", callId), { status: 'rejected' });
    } catch {}
    if (this.onStateChange) this.onStateChange('rejected');
  }
}

export const webRtcCallManager = new WebRTCCallManager();
