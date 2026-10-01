import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { InstagramCallModal } from "../instagram/InstagramCallModal";
import { CallType } from "../../lib/webrtcCallService";

export const GlobalCallListener: React.FC = () => {
  const { user } = useAuth();
  const [incomingCall, setIncomingCall] = useState<{
    callId: string;
    callerId: string;
    callerName: string;
    callerPhoto?: string;
    callType: CallType;
  } | null>(null);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "calls"),
      where("targetUserId", "==", user.uid),
      where("status", "==", "ring")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        const data = docSnap.data();
        setIncomingCall({
          callId: docSnap.id,
          callerId: data.callerId,
          callerName: data.callerName || "Caller",
          callerPhoto: data.callerPhoto || "",
          callType: data.callType || "audio"
        });
      } else {
        setIncomingCall(null);
      }
    }, () => {});

    return () => unsubscribe();
  }, [user]);

  if (!incomingCall || !user) return null;

  return (
    <InstagramCallModal
      isOpen={Boolean(incomingCall)}
      onClose={() => setIncomingCall(null)}
      callId={incomingCall.callId}
      isIncoming={true}
      callType={incomingCall.callType}
      caller={{
        id: incomingCall.callerId,
        name: incomingCall.callerName,
        photo: incomingCall.callerPhoto
      }}
      target={{
        id: user.uid,
        name: user.displayName || "You",
        photo: user.photoURL || ""
      }}
    />
  );
};
