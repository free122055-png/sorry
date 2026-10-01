import React, { useState, useEffect, useRef } from "react";
import { 
  MapPin, 
  Search, 
  Send, 
  X, 
  Navigation, 
  Clock, 
  Zap, 
  StopCircle, 
  CheckCircle2, 
  ArrowLeft,
  Loader2,
  MoreVertical,
  Maximize2,
  Users,
  ShieldCheck,
  AlertTriangle,
  History,
  ChevronRight,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  getDocs, 
  serverTimestamp, 
  orderBy, 
  limit,
  deleteDoc,
  getDoc
} from "firebase/firestore";
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from "react-leaflet";
import L from "leaflet";
import { startLocationTracking, stopLocationTracking, calculateDistance, UserLocationData } from "../services/locationService";

// Fix Leaflet marker icon issues
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const UserMarkerIcon = (photoUrl: string) => L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="
    width: 44px; 
    height: 44px; 
    border-radius: 50%; 
    border: 3px solid #004b23; 
    overflow: hidden; 
    background: #fff;
    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
  ">
    <img src="${photoUrl || 'https://ui-avatars.com/api/?name=User&background=004b23&color=fff'}" style="width: 100%; height: 100%; object-fit: cover;" />
  </div>
  <div style="
    width: 0; 
    height: 0; 
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 10px solid #004b23;
    margin-left: 14px;
    margin-top: -2px;
  "></div>`,
  iconSize: [44, 52],
  iconAnchor: [22, 52],
});

interface AppUser {
  id: string;
  displayName: string;
  photoURL?: string;
  status?: string;
}

interface SharingSession {
  id: string;
  viewerId: string;
  viewerName: string;
  sharerId: string;
  sharerName: string;
  status: 'pending' | 'active' | 'rejected' | 'stopped';
  sharingStartedAt?: any;
  createdAt: any;
}

import { useLanguage } from "../context/LanguageContext";

export const LiveLocationSharing: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  
  const [viewMode, setViewMode] = useState<'selection' | 'requesting' | 'approving' | 'map'>('selection');
  const [searchQuery, setSearchTerm] = useState("");
  const [users, setUsers] = useState<AppUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [activeSession, setActiveSession] = useState<SharingSession | null>(null);
  const [incomingRequest, setIncomingSession] = useState<SharingSession | null>(null);
  
  const [myLocation, setMyLoc] = useState<UserLocationData | null>(null);
  const [targetLocation, setTargetLoc] = useState<UserLocationData | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleStatusChange = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  // 1. Fetch Users in Real-time
  useEffect(() => {
    if (!user) return;
    
    // Using onSnapshot so new user accounts appear automatically without refresh
    const q = query(collection(db, "users"), limit(50), orderBy("displayName", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() } as AppUser))
        .filter(u => u.id !== user.uid);
      setUsers(list);
    }, (err) => {
      console.error("Error fetching users for location sharing:", err);
    });

    return () => unsubscribe();
  }, [user]);

  // 2. Listen for Incoming Requests (Where I am the sharer)
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "location_sharings"),
      where("sharerId", "==", user.uid),
      where("status", "==", "pending")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data() as SharingSession;
        setIncomingSession({ id: snapshot.docs[0].id, ...data });
        setViewMode('approving');
      } else {
        setIncomingSession(null);
        if (viewMode === 'approving') setViewMode('selection');
      }
    });

    return () => unsubscribe();
  }, [user]);

  // 3. Listen for My Active Outgoing Sessions (Where I am the viewer)
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "location_sharings"),
      where("viewerId", "==", user.uid),
      where("status", "in", ["pending", "active"])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const sess = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as SharingSession;
        setActiveSession(sess);
        if (sess.status === 'pending') setViewMode('requesting');
        else if (sess.status === 'active') setViewMode('map');
      } else {
        setActiveSession(null);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // 4. Listen for My Active Incoming Sessions (Where I am the sharer and approved)
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "location_sharings"),
      where("sharerId", "==", user.uid),
      where("status", "==", "active")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const sess = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as SharingSession;
        setActiveSession(sess);
        setViewMode('map');
        // Start tracking my location if I'm the sharer
        startLocationTracking(user.uid, (loc) => setMyLoc(loc));
      } else {
        // If no active incoming, stop tracking if I was sharing
        if (activeSession?.sharerId === user.uid) {
          stopLocationTracking();
        }
      }
    });

    return () => unsubscribe();
  }, [user]);

  // 5. Listen for Target Location (if I'm viewing)
  useEffect(() => {
    if (activeSession?.status === 'active' && activeSession.viewerId === user?.uid) {
      const targetId = activeSession.sharerId;
      const unsubscribe = onSnapshot(doc(db, "user_locations", targetId), (doc) => {
        if (doc.exists()) {
          setTargetLoc(doc.data() as UserLocationData);
        }
      });
      // Also track my location to show distance
      startLocationTracking(user.uid, (loc) => setMyLoc(loc));
      return () => unsubscribe();
    }
  }, [activeSession, user]);

  const handleSendRequest = async () => {
    if (!user || !selectedUser) return;
    setLoading(true);
    const sessionId = user.uid + "_" + selectedUser.id;
    const session: Partial<SharingSession> = {
      viewerId: user.uid,
      viewerName: profile?.displayName || user.displayName || "User A",
      sharerId: selectedUser.id,
      sharerName: selectedUser.displayName,
      status: 'pending',
      createdAt: serverTimestamp(),
    };

    try {
      await setDoc(doc(db, "location_sharings", sessionId), session);
      setViewMode('requesting');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!incomingRequest) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, "location_sharings", incomingRequest.id), {
        status: 'active',
        sharingStartedAt: serverTimestamp(),
      });
      setViewMode('map');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!incomingRequest) return;
    await updateDoc(doc(db, "location_sharings", incomingRequest.id), {
      status: 'rejected',
    });
    // Optional: Delete after a while
    setTimeout(() => deleteDoc(doc(db, "location_sharings", incomingRequest.id)), 1000);
    setViewMode('selection');
  };

  const handleStopSharing = async () => {
    if (!activeSession) return;
    await updateDoc(doc(db, "location_sharings", activeSession.id), {
      status: 'stopped',
    });
    stopLocationTracking();
    setTimeout(() => deleteDoc(doc(db, "location_sharings", activeSession.id)), 1000);
    setViewMode('selection');
    setMyLoc(null);
    setTargetLoc(null);
  };

  const cancelRequest = async () => {
    if (!activeSession) return;
    await deleteDoc(doc(db, "location_sharings", activeSession.id));
    setViewMode('selection');
  };

  const [cameraMode, setCameraMode] = useState<'both' | 'target' | 'me'>('both');
  const [gpsErrorModal, setGpsErrorModal] = useState(false);
  const [showDisclosure, setShowDisclosure] = useState(false);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // GPS Permission Inspector - Passive check
  useEffect(() => {
    const checkGpsStatus = async () => {
      if (permissionState === 'granted') return;

      if (Capacitor.isNativePlatform()) {
        try {
          const status = await Geolocation.checkPermissions();
          const state = status.location as any;
          setPermissionState(state);
          
          if (state === 'granted') {
            setGpsErrorModal(false);
            setShowDisclosure(false);
          } else if (state === 'prompt') {
            setShowDisclosure(true);
            setGpsErrorModal(false);
          } else {
            setGpsErrorModal(true);
            setShowDisclosure(false);
          }
        } catch (e) {
          setShowDisclosure(true);
          setPermissionState('prompt');
        }
      } else {
        const nav = navigator as any;
        if (nav.permissions && nav.permissions.query) {
          try {
            const status = await nav.permissions.query({ name: 'geolocation' });
            setPermissionState(status.state);
            
            if (status.state === 'granted') {
              setGpsErrorModal(false);
              setShowDisclosure(false);
            } else if (status.state === 'prompt') {
              setShowDisclosure(true);
              setGpsErrorModal(false);
            } else {
              setGpsErrorModal(true);
              setShowDisclosure(false);
            }
            
            status.onchange = () => {
              setPermissionState(status.state);
              if (status.state === 'granted') {
                setGpsErrorModal(false);
                setShowDisclosure(false);
              }
            };
          } catch (e) {
            setShowDisclosure(true);
          }
        } else {
          setShowDisclosure(true);
        }
      }
    };

    checkGpsStatus();
    const interval = setInterval(checkGpsStatus, 5000);
    return () => clearInterval(interval);
  }, [user, permissionState]);

  const [permissionErrorType, setPermissionErrorType] = useState<'none' | 'denied' | 'unavailable' | 'unknown'>('none');

  const requestGpsPermission = async () => {
    if (loading) return;
    setLoading(true);
    setPermissionErrorType('none');

    // Force clear previous error states to show "Checking..." UI
    if (permissionState === 'denied') {
      setPermissionState('prompt');
    }

    if (Capacitor.isNativePlatform()) {
      try {
        const req = await Geolocation.requestPermissions();
        if (req.location === 'granted') {
          setGpsErrorModal(false);
          setPermissionState('granted');
          if (user && (activeSession?.status === 'active' || viewMode === 'approving')) {
             await startLocationTracking(user.uid, (loc) => setMyLoc(loc));
          }
        } else {
           setPermissionErrorType('denied');
           setPermissionState('denied');
        }
      } catch (e) {
        console.warn("Capacitor permission request failure:", e);
        setPermissionErrorType('unknown');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Web Fallback - This is the most reliable way to trigger the actual prompt
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsErrorModal(false);
        setPermissionState('granted');
        setLoading(false);
        setPermissionErrorType('none');
        setMyLoc({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
          userId: user?.uid || ""
        });
        if (user && activeSession?.status === 'active') {
           startLocationTracking(user.uid, (loc) => setMyLoc(loc));
        }
      },
      (err) => {
        setLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setPermissionErrorType('denied');
          setPermissionState('denied');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setPermissionErrorType('unavailable');
        } else {
          setPermissionErrorType('unknown');
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const clearBrowserPermissionGuide = () => {
    alert("আপনার ব্রাউজারের ওপরে ডানদিকের থ্রি-ডট (⋮) মেনুতে যান > Settings > Site Settings > Location এ গিয়ে এই সাইটটি 'Allow' করে দিন। এরপর অ্যাপটি রিফ্রেশ করুন।");
  };

  // Live Elapsed Timer for Active Session
  useEffect(() => {
    if (viewMode !== 'map' || !activeSession) {
      setElapsedSeconds(0);
      return;
    }
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [viewMode, activeSession]);

  const formatTimer = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return hrs > 0 ? `${pad(hrs)}:${pad(mins)}:${pad(secs)}` : `${pad(mins)}:${pad(secs)}`;
  };

  const distanceKm = (myLocation && targetLocation) 
    ? calculateDistance(myLocation.latitude, myLocation.longitude, targetLocation.latitude, targetLocation.longitude) 
    : 0;

  const filteredUsers = users.filter(u => 
    u.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-sans pb-10 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#004b23] text-white px-4 py-4 flex items-center gap-3 shadow-lg">
        <button onClick={() => navigate(-1)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-black tracking-tight">{t("liveLocationTitle")}</h1>
        <div className="ml-auto flex items-center gap-2">
          {!isOnline && <span className="bg-rose-500 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">OFFLINE</span>}
          <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center">
             <MapPin className="w-4 h-4 text-emerald-100" />
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col p-4">
        
        {/* 1. SELECTION MODE */}
        {viewMode === 'selection' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col gap-6"
          >
            <div className="text-center space-y-2 mt-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <Navigation className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black">{t("shareLocation")}</h2>
              <p className="text-sm text-gray-500">{t("shareLocationDesc")}</p>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text"
                placeholder={t("searchUser")}
                value={searchQuery}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#004b23] focus:border-transparent shadow-xs"
              />
            </div>

            {/* User List */}
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[400px] no-scrollbar">
              <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 px-2">{t("selectUser")}</p>
              {filteredUsers.length === 0 ? (
                <div className="py-10 text-center text-gray-400 italic text-sm">কোনো ইউজার পাওয়া যায়নি</div>
              ) : (
                filteredUsers.map(u => (
                  <div 
                    key={u.id}
                    onClick={() => setSelectedUser(u)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                      selectedUser?.id === u.id 
                        ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500' 
                        : 'bg-white border-gray-100 hover:border-emerald-200 shadow-xs'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                      <img src={u.photoURL || `https://ui-avatars.com/api/?name=${u.displayName}&background=random`} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm truncate">{u.displayName}</h4>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${u.status === 'online' ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                        <span className="text-[10px] text-gray-500 capitalize">{u.status || 'offline'}</span>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      selectedUser?.id === u.id ? 'bg-emerald-600 border-emerald-600' : 'border-gray-200'
                    }`}>
                      {selectedUser?.id === u.id && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* CTA */}
            <button
              onClick={handleSendRequest}
              disabled={!selectedUser || loading}
              className="w-full py-4 bg-[#004b23] text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>{t("sendLocationRequest")}</span>
            </button>
          </motion.div>
        )}

        {/* 2. REQUESTING MODE (WAITING) */}
        {viewMode === 'requesting' && activeSession && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center space-y-8"
          >
            <div className="relative">
               <div className="w-32 h-32 bg-emerald-50 rounded-full flex items-center justify-center animate-pulse">
                  <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center">
                     <MapPin className="w-12 h-12 text-[#004b23]" />
                  </div>
               </div>
               <div className="absolute top-0 right-0 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center animate-bounce">
                  <Clock className="w-5 h-5 text-amber-500" />
               </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black">{t("requestSent")}</h2>
              <p className="text-gray-500 max-w-xs mx-auto">
                <span className="font-bold text-[#004b23]">{activeSession.sharerName}</span> রিকুয়েস্ট এক্সেপ্ট করলে আপনি তার লাইভ লোকেশন ম্যাপে দেখতে পারবেন।
              </p>
            </div>

            <div className="p-4 bg-white border border-gray-100 rounded-2xl flex items-center gap-3 w-full max-w-sm">
               <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-[#004b23] animate-spin" />
               </div>
               <div className="text-left">
                  <p className="text-xs text-gray-400 font-bold uppercase">Status</p>
                  <p className="font-bold">{t("waitingForPermission")}</p>
               </div>
            </div>

            <button 
              onClick={cancelRequest}
              className="px-8 py-3 text-rose-600 font-black text-sm border-2 border-rose-100 rounded-2xl hover:bg-rose-50 transition-colors"
            >
              {t("cancel")}
            </button>
          </motion.div>
        )}

        {/* 3. APPROVING MODE (INCOMING) */}
        {viewMode === 'approving' && incomingRequest && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex flex-col justify-end"
          >
            <div className="bg-white rounded-t-[40px] p-8 space-y-6">
               <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4" />
               
               <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-20 h-20 rounded-full border-4 border-emerald-50 overflow-hidden shadow-xl">
                     <img src={`https://ui-avatars.com/api/?name=${incomingRequest.viewerName}&background=004b23&color=fff`} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="space-y-1">
                     <h3 className="text-xl font-black text-[#004b23]">{incomingRequest.viewerName}</h3>
                     <p className="text-gray-500">আপনার লাইভ লোকেশন দেখতে চাচ্ছে</p>
                  </div>
               </div>

               <div className="bg-emerald-50 rounded-2xl p-4 flex gap-3">
                  <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                  <p className="text-xs text-emerald-800 leading-relaxed">
                     অনুমতি দিলে সে আপনার রিয়েল-টাইম মুভমেন্ট, স্পিড এবং বর্তমান অবস্থান ম্যাপে দেখতে পাবে। আপনি যেকোনো সময় শেয়ারিং বন্ধ করতে পারবেন।
                  </p>
               </div>

               <div className="grid grid-cols-2 gap-4 pt-4">
                  <button 
                    onClick={handleReject}
                    className="py-4 bg-gray-100 text-gray-600 rounded-2xl font-black"
                  >
                    {t("rejectLocationRequest")}
                  </button>
                  <button 
                    onClick={handleApprove}
                    className="py-4 bg-[#004b23] text-white rounded-2xl font-black shadow-lg shadow-emerald-900/20 active:scale-95"
                  >
                    {t("approveLocationRequest")}
                  </button>
               </div>
            </div>
          </motion.div>
        )}

        {/* 4. MAP MODE */}
        {viewMode === 'map' && activeSession && (
          <div className="fixed inset-0 z-40 bg-white flex flex-col">
            {/* Overlay Header */}
            <div className="absolute top-0 left-0 right-0 z-50 p-4 pointer-events-none">
              <div className="bg-[#004b23]/90 backdrop-blur-md text-white rounded-2xl p-3 flex items-center justify-between shadow-2xl pointer-events-auto">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-2 border-emerald-400/50 overflow-hidden">
                       <img src={`https://ui-avatars.com/api/?name=${activeSession.viewerId === user?.uid ? activeSession.sharerName : activeSession.viewerName}`} alt="" />
                    </div>
                    <div>
                       <h4 className="font-black text-sm">
                          {activeSession.viewerId === user?.uid ? activeSession.sharerName : activeSession.viewerName}
                       </h4>
                       <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                          <span className="text-[10px] text-emerald-100 font-bold uppercase tracking-tight">Live Tracking</span>
                       </div>
                    </div>
                 </div>
                 <button onClick={handleStopSharing} className="p-2 bg-rose-500/20 text-rose-100 rounded-xl hover:bg-rose-500/40 transition-colors">
                    <StopCircle className="w-5 h-5" />
                 </button>
              </div>
            </div>

            {/* Full Screen Map */}
            <div className="flex-1 relative">
              {isOnline ? (
                <MapContainer 
                  center={[myLocation?.latitude || 23.8103, myLocation?.longitude || 90.4125]} 
                  zoom={15} 
                  zoomControl={false}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                  />
                  
                  {/* Current User Marker (A) */}
                  {myLocation && (
                    <>
                      <Marker position={[myLocation.latitude, myLocation.longitude]} icon={UserMarkerIcon(profile?.photoURL || '')}>
                        <Popup>{t("home")}: {myLocation.addressName || "আমার অবস্থান"}</Popup>
                      </Marker>
                      <Circle center={[myLocation.latitude, myLocation.longitude]} radius={myLocation.accuracy || 30} pathOptions={{ color: '#004b23', fillColor: '#004b23', fillOpacity: 0.15 }} />
                    </>
                  )}

                  {/* Target User Marker (B) */}
                  {targetLocation && (
                    <>
                      <Marker position={[targetLocation.latitude, targetLocation.longitude]} icon={UserMarkerIcon('')}>
                        <Popup>{activeSession.sharerName}: {targetLocation.addressName || "টার্গেট অবস্থান"}</Popup>
                      </Marker>
                      <Circle center={[targetLocation.latitude, targetLocation.longitude]} radius={targetLocation.accuracy || 30} pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.2 }} />
                    </>
                  )}

                  <MapUpdater myLocation={myLocation} targetLocation={targetLocation} cameraMode={cameraMode} />
                </MapContainer>
              ) : (
                <div className="absolute inset-0 bg-slate-100 flex flex-col items-center justify-center p-8 text-center space-y-4">
                  <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm">
                    <AlertTriangle className="w-10 h-10 text-amber-500" />
                  </div>
                  <h3 className="text-xl font-black">ম্যাপ লোড করা যাচ্ছে না</h3>
                  <p className="text-gray-500">আপনার ইন্টারনেট কানেকশন চেক করুন। অফলাইনে লাইভ লোকেশন আপডেট পাওয়া সম্ভব নয়।</p>
                </div>
              )}

              {/* Map Camera Controls */}
              <div className="absolute bottom-44 right-4 z-50 flex flex-col gap-2">
                 <button 
                  onClick={() => setCameraMode('both')}
                  className={`px-3 py-2 rounded-2xl shadow-xl flex items-center gap-1.5 font-bold text-xs transition-all active:scale-95 ${
                    cameraMode === 'both' ? 'bg-[#004b23] text-white' : 'bg-white text-gray-800'
                  }`}
                  title="দুজনকে একসাথে ম্যাপে দেখুন"
                 >
                    <Maximize2 className="w-4 h-4" />
                    <span>উভয়কে দেখুন</span>
                 </button>

                 <button 
                  onClick={() => setCameraMode('target')}
                  className={`px-3 py-2 rounded-2xl shadow-xl flex items-center gap-1.5 font-bold text-xs transition-all active:scale-95 ${
                    cameraMode === 'target' ? 'bg-blue-600 text-white' : 'bg-white text-blue-700'
                  }`}
                  title="টার্গেটের মুভমেন্ট অনুসরণ করুন"
                 >
                    <Navigation className="w-4 h-4 animate-bounce" />
                    <span>টার্গেট লক 🎯</span>
                 </button>

                 <button 
                  onClick={() => setCameraMode('me')}
                  className={`px-3 py-2 rounded-2xl shadow-xl flex items-center gap-1.5 font-bold text-xs transition-all active:scale-95 ${
                    cameraMode === 'me' ? 'bg-emerald-700 text-white' : 'bg-white text-emerald-800'
                  }`}
                  title="আমার অবস্থান"
                 >
                    <MapPin className="w-4 h-4" />
                    <span>আমার কাছে</span>
                 </button>
              </div>
            </div>

            {/* Bottom Stats Card */}
            <div className="bg-white px-5 pt-5 pb-8 rounded-t-[36px] shadow-[0_-15px_40px_rgba(0,0,0,0.12)] -mt-10 z-50">
               <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
               
               {/* Location Area Badge */}
               <div className="mb-3 px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
                 <div className="flex items-center gap-2 truncate pr-2">
                   <MapPin className="w-4 h-4 text-emerald-700 shrink-0 animate-pulse" />
                   <span className="text-xs font-bold text-slate-800 truncate">
                     {targetLocation?.addressName || myLocation?.addressName || "লাইভ লোকেশন লোকেশন শেয়ার হচ্ছে..."}
                   </span>
                 </div>
                 <span className="text-[10px] font-black bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full shrink-0">
                   {targetLocation?.movementStatus || "লাইভ"}
                 </span>
               </div>

               <div className="grid grid-cols-3 gap-3">
                  <div className="bg-emerald-50/80 border border-emerald-100 rounded-2xl p-3 text-center space-y-0.5">
                     <p className="text-[9.5px] text-emerald-700 font-bold uppercase tracking-wider">Distance</p>
                     <p className="text-lg font-black text-[#004b23]">
                       {distanceKm < 1 ? `${Math.round(distanceKm * 1000)}m` : `${distanceKm.toFixed(2)}km`}
                     </p>
                  </div>

                  <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-3 text-center space-y-0.5">
                     <p className="text-[9.5px] text-blue-700 font-bold uppercase tracking-wider">Speed</p>
                     <p className="text-lg font-black text-blue-900">
                        {Math.round((targetLocation?.speed || 0) * 3.6)} <span className="text-[10px]">km/h</span>
                     </p>
                  </div>

                  <div className="bg-amber-50/80 border border-amber-100 rounded-2xl p-3 text-center space-y-0.5">
                     <p className="text-[9.5px] text-amber-700 font-bold uppercase tracking-wider">Duration</p>
                     <p className="text-lg font-black text-amber-900">{formatTimer(elapsedSeconds)}</p>
                  </div>
               </div>

               <button 
                onClick={handleStopSharing}
                className="w-full mt-4 py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-xs shadow-lg shadow-rose-900/15 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
               >
                  <StopCircle className="w-4 h-4" />
                  <span>{t("stopSharing")}</span>
               </button>
            </div>
          </div>
        )}

        {/* Prominent Disclosure Modal (Google Play Requirement) */}
        {showDisclosure && (
          <div className="fixed inset-0 z-[130] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-[40px] p-8 w-full max-w-md text-center space-y-6 shadow-2xl border border-emerald-100">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-700 rounded-3xl flex items-center justify-center mx-auto shadow-sm animate-bounce">
                <MapPin className="w-10 h-10" />
              </div>
              
              <div className="space-y-3">
                <h3 className="text-2xl font-black text-gray-900 leading-tight">
                  লোকেশন ডিসক্লোজার <br/> (Location Disclosure)
                </h3>
                <div className="h-1 w-12 bg-emerald-500 rounded-full mx-auto" />
              </div>

              <div className="bg-emerald-50/50 rounded-3xl p-5 text-left space-y-4 border border-emerald-100">
                <p className="text-[13px] text-gray-700 font-medium leading-relaxed">
                  এই অ্যাপটি আপনার <strong>রিয়েল-টাইম লোকেশন (Real-time Location)</strong> ডেটা সংগ্রহ করে যাতে আপনি যার সাথে লোকেশন শেয়ার করতে চান সে আপনাকে ম্যাপে লাইভ দেখতে পারে।
                </p>
                <div className="space-y-2">
                  <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> কিভাবে ব্যবহার করা হয়:
                  </p>
                  <ul className="text-[12px] text-gray-600 space-y-1.5 list-disc pl-4">
                    <li>আপনার বর্তমান অবস্থান (Latitude/Longitude) ট্র্যাক করা হয়।</li>
                    <li>এই তথ্যটি আপনার অনুমোদিত প্রিয়জন (Viewer) এর সাথে শেয়ার করা হয়।</li>
                    <li>আপনার গতি (Speed) এবং সঠিক অবস্থান ম্যাপে দেখানোর জন্য এটি প্রয়োজন।</li>
                  </ul>
                </div>
              </div>

              <p className="text-[10px] text-gray-400 italic">
                আপনি বাটনটি চাপলে গুগল সিস্টেম থেকে পারমিশন চাওয়া হবে। অনুগ্রহ করে 'Allow' ক্লিক করুন।
              </p>

              <button
                onClick={() => {
                  setShowDisclosure(false);
                  requestGpsPermission();
                }}
                className="w-full py-4.5 bg-[#004b23] hover:bg-[#00381a] text-white rounded-2xl font-black text-base shadow-xl shadow-emerald-900/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-3"
              >
                <span>আমি বুঝতে পেরেছি ও রাজি</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* GPS Location Permission Enforcement Modal (When Denied) */}
        {gpsErrorModal && !showDisclosure && (
          <div className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center space-y-4 shadow-2xl border border-rose-100">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-gray-900">
                {permissionState === 'denied' || permissionErrorType === 'denied' 
                  ? "লোকেশন পারমিশন ব্লক করা!" 
                  : t("gpsPermissionTitle")}
              </h3>
              
              <div className="space-y-3 text-left">
                <p className="text-xs text-gray-600 font-medium leading-relaxed text-center">
                   {permissionState === 'denied' || permissionErrorType === 'denied'
                     ? "আপনি লোকেশন পারমিশন ব্লক করে রেখেছেন। এটি ঠিক না করলে লাইভ লোকেশন দেখা সম্ভব নয়।"
                     : t("gpsPermissionDesc")}
                </p>

                {(permissionErrorType === 'denied' || permissionState === 'denied') && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl space-y-2 animate-fadeIn">
                    <p className="text-[11px] font-black text-rose-700 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" /> কিভাবে আনব্লক করবেন:
                    </p>
                    <p className="text-[10px] text-rose-600 font-bold leading-tight">
                      ১. ব্রাউজারের ওপরে থ্রি-ডট (⋮) মেনুতে যান।<br/>
                      ২. <strong>Settings &gt; Site Settings</strong> এ যান।<br/>
                      ৩. <strong>Location</strong> এ গিয়ে এই সাইটটি 'Allow' করুন।
                    </p>
                    <button 
                      onClick={clearBrowserPermissionGuide}
                      className="text-[10px] text-blue-600 font-black underline"
                    >
                      আরও সাহায্য প্রয়োজন?
                    </button>
                  </div>
                )}

                {permissionErrorType === 'unavailable' && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
                    <p className="text-[11px] font-black text-amber-700 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" /> মোবাইলের জিপিএস অফ!
                    </p>
                    <p className="text-[10px] text-amber-600 font-bold">
                      ফোনের ওপর থেকে নোটিফিকেশন বার নামিয়ে <strong>GPS/Location</strong> আইকনটি অন করুন এবং পুনরায় চেষ্টা করুন।
                    </p>
                  </div>
                )}

                {permissionState === 'prompt' && permissionErrorType === 'none' && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 rounded-2xl text-[11px] font-bold space-y-1">
                    <p>১. আপনার ফোনের <strong>GPS/Location</strong> অন করুন।</p>
                    <p>২. নিচের বাটনে ট্যাপ করে <strong>'Allow'</strong> দিন।</p>
                  </div>
                )}
              </div>

              <button
                onClick={requestGpsPermission}
                disabled={loading}
                className="w-full py-4 bg-[#004b23] hover:bg-[#00381a] text-white rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapPin className="w-4 h-4" />}
                <span>
                  {loading 
                    ? "চেক করা হচ্ছে (Checking...)" 
                    : (permissionState === 'denied' || permissionErrorType === 'denied' 
                        ? "আবার চেষ্টা করুন (Retry)" 
                        : "পারমিশন দিন ও নিশ্চিত করুন")}
                </span>
              </button>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setLoading(true);
                    setTimeout(() => {
                       window.location.reload();
                    }, 500);
                  }}
                  className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs active:scale-95 transition-all"
                >
                  অ্যাপ রিলোড করুন (Reload App)
                </button>
                
                <p className="text-[9px] text-gray-400 uppercase font-bold tracking-tighter">
                  যদি আপনি অলরেডি 'Allow' দিয়ে থাকেন কিন্তু স্ক্রিন না সরে, তবে 'Reload' দিন।
                </p>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};


// Internal component to handle map centering and bounds
const MapUpdater: React.FC<{ 
  myLocation: UserLocationData | null; 
  targetLocation: UserLocationData | null;
  cameraMode: 'both' | 'target' | 'me';
}> = ({ myLocation, targetLocation, cameraMode }) => {
  const map = useMap();

  useEffect(() => {
    if (cameraMode === 'target' && targetLocation) {
      map.setView([targetLocation.latitude, targetLocation.longitude], 17, { animate: true });
    } else if (cameraMode === 'me' && myLocation) {
      map.setView([myLocation.latitude, myLocation.longitude], 17, { animate: true });
    } else if (myLocation && targetLocation) {
      const bounds = L.latLngBounds(
        [myLocation.latitude, myLocation.longitude],
        [targetLocation.latitude, targetLocation.longitude]
      );
      map.fitBounds(bounds, { padding: [80, 80], maxZoom: 17 });
    } else if (myLocation) {
      map.setView([myLocation.latitude, myLocation.longitude], 16, { animate: true });
    }
  }, [myLocation, targetLocation, cameraMode, map]);

  return null;
};

export default LiveLocationSharing;
