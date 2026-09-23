import React, { useState, useEffect } from "react";
import { 
  User, 
  PhoneCall, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Edit, 
  Power, 
  PlusCircle, 
  RefreshCw, 
  Phone,
  ShieldCheck,
  Bookmark
} from "lucide-react";
import { db } from "../../lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc, onSnapshot } from "firebase/firestore";
import { Biodata, BiodataRequest } from "../../types/matrimonial";

interface UserBiodataDashboardProps {
  currentUser: { uid: string; email?: string; phoneNumber?: string; displayName?: string } | null;
  onOpenWizard: () => void;
  onViewDetails: (biodata: Biodata) => void;
}

export const UserBiodataDashboard: React.FC<UserBiodataDashboardProps> = ({
  currentUser,
  onOpenWizard,
  onViewDetails
}) => {
  const [activeTab, setActiveTab] = useState<"my-biodatas" | "sent-requests" | "incoming-requests">("my-biodatas");
  const [myBiodatas, setMyBiodatas] = useState<Biodata[]>([]);
  const [myRequests, setMyRequests] = useState<BiodataRequest[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<BiodataRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // 1. Fetch user's own biodatas
    const qBiodatas = query(
      collection(db, "biodatas"),
      where("userId", "==", currentUser.uid)
    );

    const unsubBiodatas = onSnapshot(qBiodatas, (snap) => {
      const list: Biodata[] = [];
      snap.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() } as Biodata);
      });
      setMyBiodatas(list);
    }, (err) => console.warn(err));

    // 2. Fetch user's sent contact requests
    const qRequests = query(
      collection(db, "biodata_requests"),
      where("userId", "==", currentUser.uid)
    );

    const unsubRequests = onSnapshot(qRequests, (snap) => {
      const list: BiodataRequest[] = [];
      snap.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() } as BiodataRequest);
      });
      setMyRequests(list);
      setLoading(false);
    }, (err) => {
      console.warn(err);
      setLoading(false);
    });

    // 3. Fetch incoming contact requests received for user's biodata
    const qIncoming = query(
      collection(db, "biodata_requests"),
      where("candidateUserId", "==", currentUser.uid)
    );

    const unsubIncoming = onSnapshot(qIncoming, (snap) => {
      const list: BiodataRequest[] = [];
      snap.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() } as BiodataRequest);
      });
      setIncomingRequests(list);
    }, (err) => console.warn(err));

    return () => {
      unsubBiodatas();
      unsubRequests();
      unsubIncoming();
    };
  }, [currentUser?.uid]);

  const toggleStatus = async (biodataId: string, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === "active" ? "inactive" : "active";
      await updateDoc(doc(db, "biodatas", biodataId), {
        status: nextStatus,
        updatedAt: Date.now()
      });
    } catch (err) {
      alert("স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।");
    }
  };

  const handleUpdateRequestStatus = async (requestId: string, newStatus: "approved" | "rejected") => {
    try {
      await updateDoc(doc(db, "biodata_requests", requestId), {
        status: newStatus,
        updatedAt: Date.now()
      });
      alert(newStatus === "approved" ? "অনুরোধটি অনুমোদন করা হয়েছে।" : "অনুরোধটি বাতিল করা হয়েছে।");
    } catch (err) {
      alert("অনুরোধের স্ট্যাটাস আপডেট করা সম্ভব হয়নি।");
    }
  };

  if (!currentUser) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-emerald-100 shadow-sm text-center space-y-4">
        <User className="w-12 h-12 text-emerald-600 mx-auto" />
        <h3 className="text-base font-black text-gray-900">আপনার বায়োডাটা ও রিকোয়েস্ট দেখতে লগইন করুন</h3>
        <p className="text-xs text-gray-500">লগইন করার পর এখান থেকে আপনার বায়োডাটা এডিট বা বন্ধ করতে পারবেন এবং প্রেরিত রিকোয়েস্ট চেক করতে পারবেন।</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-emerald-100/90 shadow-sm overflow-hidden">
      
      {/* Header Bar */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-900 to-teal-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-black flex items-center gap-2">
            <User className="w-5 h-5 text-amber-300" />
            ইউজার ড্যাশবোর্ড (My Biodata Dashboard)
          </h2>
          <p className="text-xs text-emerald-200 mt-0.5">আপনার সকল বায়োডাটা ও যোগাযোগের অনুরোধ ট্র্যাক করুন</p>
        </div>

        <button
          onClick={onOpenWizard}
          className="py-2.5 px-4 bg-gradient-to-r from-amber-400 to-amber-500 text-gray-950 rounded-2xl text-xs font-black flex items-center gap-1.5 shadow-sm active:scale-98"
        >
          <PlusCircle className="w-4 h-4 stroke-[2.5]" />
          <span>নতুন বায়োডাটা তৈরি করুন</span>
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-1 border-b border-gray-200 bg-gray-50/80 px-2 sm:px-4 pt-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("my-biodatas")}
          className={`py-2.5 px-3 sm:px-4 text-[11px] sm:text-xs font-black border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === "my-biodatas"
              ? "border-emerald-700 text-emerald-900 bg-white rounded-t-xl"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <User className="w-3.5 h-3.5 text-emerald-700" />
          <span>আমার বায়োডাটা ({myBiodatas.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("sent-requests")}
          className={`py-2.5 px-3 sm:px-4 text-[11px] sm:text-xs font-black border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === "sent-requests"
              ? "border-emerald-700 text-emerald-900 bg-white rounded-t-xl"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <PhoneCall className="w-3.5 h-3.5 text-teal-700" />
          <span>প্রেরিত অনুরোধ ({myRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("incoming-requests")}
          className={`py-2.5 px-3 sm:px-4 text-[11px] sm:text-xs font-black border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === "incoming-requests"
              ? "border-emerald-700 text-emerald-900 bg-white rounded-t-xl"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
          <span>আগত অনুরোধ ({incomingRequests.length})</span>
          {incomingRequests.some(r => r.status === "pending") && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-4 sm:p-6">
        {loading ? (
          <div className="py-8 text-center text-xs text-gray-500 font-bold flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-700" />
            <span>ডাটা লোড হচ্ছে...</span>
          </div>
        ) : activeTab === "my-biodatas" ? (
          <div>
            {myBiodatas.length === 0 ? (
              <div className="py-8 text-center space-y-3 bg-slate-50/80 rounded-2xl border border-dashed border-slate-200">
                <p className="text-xs font-bold text-gray-600">আপনি এখনো কোনো বায়োডাটা তৈরি করেননি।</p>
                <button
                  onClick={onOpenWizard}
                  className="py-2.5 px-4 bg-emerald-800 text-white rounded-xl text-xs font-black cursor-pointer"
                >
                  প্রথম বায়োডাটা তৈরি করুন
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myBiodatas.map((b) => (
                  <div key={b.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-gray-900">{b.biodataCode}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          b.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {b.status === 'active' ? 'একটিভ' : 'অপেক্ষমাণ/বন্ধ'}
                        </span>
                        {b.isVerified && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-black">Verified</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 font-medium mt-1">
                        {b.gender === 'groom' ? '👨 পাত্র' : '🧕 পাত্রী'} • {b.maritalStatus} • {b.age} বছর • {b.presentDistrict}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onViewDetails(b)}
                        className="p-2 bg-white hover:bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>দেখুন</span>
                      </button>

                      <button
                        onClick={() => toggleStatus(b.id, b.status)}
                        className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 text-white cursor-pointer ${
                          b.status === 'active' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-700 hover:bg-emerald-800'
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>{b.status === 'active' ? 'বন্ধ করুন' : 'চালু করুন'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === "sent-requests" ? (
          <div>
            {myRequests.length === 0 ? (
              <div className="py-8 text-center text-xs font-bold text-gray-500 bg-slate-50/80 rounded-2xl border border-dashed border-slate-200">
                আপনি এখনো কারো যোগাযোগের অনুরোধ পাঠাননি।
              </div>
            ) : (
              <div className="space-y-3">
                {myRequests.map((req) => (
                  <div key={req.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-gray-900">
                        বায়োডাটা কোড: <span className="text-emerald-800">{req.biodataCode}</span>
                      </span>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1 ${
                        req.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        req.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {req.status === 'approved' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {req.status === 'rejected' && <XCircle className="w-3 h-3 text-rose-600" />}
                        {req.status === 'pending' && <Clock className="w-3 h-3 text-amber-600" />}
                        {req.status === 'approved' ? 'অনুমোদিত (Approved)' : req.status === 'rejected' ? 'বাতিল' : 'অপেক্ষমাণ (Pending)'}
                      </span>
                    </div>

                    {req.status === 'approved' && req.candidateGuardianPhone && (
                      <div className="p-3 bg-emerald-100/90 rounded-xl border border-emerald-300 text-xs text-emerald-950 font-bold space-y-1">
                        <p className="flex items-center gap-1.5 text-emerald-900">
                          <Phone className="w-3.5 h-3.5 text-emerald-700" />
                          অভিভাবকের মোবাইল: <span className="font-mono text-sm text-emerald-950">{req.candidateGuardianPhone}</span> ({req.candidateGuardianRelation || 'অভিভাবক'})
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* INCOMING REQUESTS PANEL */
          <div>
            {incomingRequests.length === 0 ? (
              <div className="py-8 text-center text-xs font-bold text-gray-500 bg-slate-50/80 rounded-2xl border border-dashed border-slate-200">
                আপনার বায়োডাটাতে এখনো কোনো নতুন অনুরোধ আসেনি।
              </div>
            ) : (
              <div className="space-y-3">
                {incomingRequests.map((req) => (
                  <div key={req.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <p className="text-xs font-black text-gray-900">
                          অনুরোধকারী: <span className="text-emerald-900">{req.userName || "ব্যবহারকারী"}</span>
                        </p>
                        <p className="text-[10px] text-gray-500 font-medium">
                          বায়োডাটা কোড: <span className="font-bold">{req.biodataCode}</span>
                        </p>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1 ${
                        req.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        req.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {req.status === 'approved' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {req.status === 'rejected' && <XCircle className="w-3 h-3 text-rose-600" />}
                        {req.status === 'pending' && <Clock className="w-3 h-3 text-amber-600" />}
                        {req.status === 'approved' ? 'অনুমোদিত' : req.status === 'rejected' ? 'বাতিলকৃত' : 'অপেক্ষমাণ'}
                      </span>
                    </div>

                    {/* Action buttons if pending */}
                    {req.status === 'pending' && (
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                        <button
                          onClick={() => handleUpdateRequestStatus(req.id, "approved")}
                          className="flex-1 py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-98"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>অনুমোদন দিন</span>
                        </button>

                        <button
                          onClick={() => handleUpdateRequestStatus(req.id, "rejected")}
                          className="py-2 px-3 bg-slate-200 hover:bg-slate-300 text-gray-800 rounded-xl text-xs font-bold transition cursor-pointer active:scale-98"
                        >
                          <span>বাতিল করুন</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
