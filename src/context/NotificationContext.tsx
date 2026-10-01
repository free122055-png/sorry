import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { db } from "../lib/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, writeBatch } from "firebase/firestore";
import { useAuth } from "./AuthContext";
import { WhatsAppChatBanner, ChatToast } from "../components/WhatsAppChatBanner";
import { playChatNotificationSound, vibrateDevice } from "../lib/sound";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  body?: string;
  imageUrl?: string;
  read: boolean;
  createdAt: any;
  type?: 'order' | 'offer' | 'system' | 'payment' | 'push' | 'chat';
  link?: string;
  userId?: string;
  data?: any;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string, link?: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChatToast, setActiveChatToast] = useState<ChatToast | null>(null);
  const knownIdsRef = useRef<Set<string>>(new Set());
  const isInitialLoadRef = useRef<boolean>(true);

  // Local storage helper for broadcast notifications read status
  const getReadKey = () => `read_notifs_${user?.uid || 'guest'}`;

  const getLocalReadIds = (): string[] => {
    try {
      const stored = localStorage.getItem(getReadKey());
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveLocalReadId = (id: string) => {
    try {
      const current = getLocalReadIds();
      if (!current.includes(id)) {
        current.push(id);
        localStorage.setItem(getReadKey(), JSON.stringify(current));
      }
    } catch {
      // ignore
    }
  };

  const saveAllLocalReadIds = (ids: string[]) => {
    try {
      const current = new Set([...getLocalReadIds(), ...ids]);
      localStorage.setItem(getReadKey(), JSON.stringify(Array.from(current)));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    let unSubAll: (() => void) | null = null;
    let unSubUser: (() => void) | null = null;

    let allDocs: NotificationItem[] = [];
    let userDocs: NotificationItem[] = [];

    const mergeAndSet = () => {
      const localReadIds = getLocalReadIds();
      const combinedMap = new Map<string, NotificationItem>();

      [...allDocs, ...userDocs].forEach((item) => {
        const isReadLocally = localReadIds.includes(item.id);
        const derivedMessage = item.message || item.body || "";
        const derivedType = item.type || (item.data?.productId ? 'offer' : 'system');
        const derivedLink = item.link || (item.data?.productId ? `/product/${item.data.productId}` : undefined);

        combinedMap.set(item.id, {
          ...item,
          message: derivedMessage,
          body: derivedMessage,
          type: derivedType,
          link: derivedLink,
          read: Boolean(item.read || isReadLocally)
        });
      });

      const list = Array.from(combinedMap.values()).sort((a, b) => {
        const getTime = (val: any) => {
          if (!val) return 0;
          if (typeof val.toMillis === 'function') return val.toMillis();
          if (val.seconds) return val.seconds * 1000;
          return new Date(val).getTime() || 0;
        };
        return getTime(b.createdAt) - getTime(a.createdAt);
      });

      setNotifications(list);
      setLoading(false);
    };

    // 1. Broadcast / Software-wide notifications (userId === "ALL")
    try {
      const qAll = query(collection(db, "notifications"), where("userId", "==", "ALL"));
      unSubAll = onSnapshot(qAll, (snap) => {
        allDocs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as NotificationItem[];
        mergeAndSet();
      }, (err) => {
        console.warn("Broadcast notifications fetch issue:", err);
        setLoading(false);
      });
    } catch (e) {
      console.warn("qAll error:", e);
    }

    // 2. User-specific notifications (userId === user.uid)
    if (user?.uid) {
      try {
        const qUser = query(collection(db, "notifications"), where("userId", "==", user.uid));
        unSubUser = onSnapshot(qUser, (snap) => {
          const incomingDocs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as NotificationItem[];
          
          if (!isInitialLoadRef.current) {
            // Check for newly arrived chat messages
            for (const item of incomingDocs) {
              if (!knownIdsRef.current.has(item.id) && !item.read) {
                const isChat = item.type === 'chat' || item.data?.type === 'chat';
                if (isChat) {
                  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
                  const targetRoomId = item.data?.roomId;

                  // Play WhatsApp chime and vibrate
                  playChatNotificationSound();
                  vibrateDevice([200, 100, 200]);

                  // Trigger system notification if permitted
                  if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
                    try {
                      new Notification(item.title, {
                        body: item.message || item.body || "",
                        icon: "/app_icon.png",
                        badge: "/app_icon.png"
                      });
                    } catch (e) {}
                  }

                  // If not actively viewing that chat room, show WhatsApp dropdown banner
                  if (!targetRoomId || !currentPath.includes(targetRoomId)) {
                    setActiveChatToast({
                      id: item.id,
                      senderName: item.title,
                      senderPhoto: item.data?.senderPhoto,
                      message: item.message || item.body || "",
                      roomId: targetRoomId,
                      url: item.data?.url || (targetRoomId ? `/chat/${targetRoomId}` : '/chat')
                    });
                  }
                }
              }
            }
          }

          // Register known IDs
          incomingDocs.forEach(d => knownIdsRef.current.add(d.id));
          isInitialLoadRef.current = false;

          userDocs = incomingDocs;
          mergeAndSet();
        }, (err) => {
          console.warn("User notifications fetch issue:", err);
          setLoading(false);
        });
      } catch (e) {
        console.warn("qUser error:", e);
      }
    } else {
      userDocs = [];
      mergeAndSet();
    }

    return () => {
      if (unSubAll) unSubAll();
      if (unSubUser) unSubUser();
    };
  }, [user?.uid]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    saveLocalReadId(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

    const targetNotif = notifications.find(n => n.id === id);
    if (targetNotif && targetNotif.userId === user?.uid) {
      try {
        await updateDoc(doc(db, "notifications", id), { read: true });
      } catch (e) {
        console.warn("Failed to update Firestore notification doc:", e);
      }
    }
  };

  const markAllAsRead = async () => {
    const allIds = notifications.map(n => n.id);
    saveAllLocalReadIds(allIds);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    if (user?.uid) {
      try {
        const batch = writeBatch(db);
        notifications.forEach(notif => {
          if (!notif.read && notif.userId === user.uid) {
            batch.update(doc(db, "notifications", notif.id), { read: true });
          }
        });
        await batch.commit();
      } catch (e) {
        console.warn("Failed to mark all as read in Firestore:", e);
      }
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, loading, markAsRead, markAllAsRead }}>
      {children}
      <WhatsAppChatBanner toast={activeChatToast} onClose={() => setActiveChatToast(null)} />
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotificationContext must be used within a NotificationProvider");
  }
  return context;
};
