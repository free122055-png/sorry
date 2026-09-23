import React, { useState, useEffect } from "react";
import { 
  Heart, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Edit3, 
  Eye, 
  PhoneCall, 
  ShieldCheck, 
  Sparkles, 
  RefreshCw, 
  UserCheck, 
  UserX, 
  Phone, 
  Check, 
  Clock,
  Filter,
  Save,
  X
} from "lucide-react";
import { db } from "../../lib/firebase";
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  getDoc 
} from "firebase/firestore";
import { Biodata, BiodataRequest } from "../../types/matrimonial";

export const BiodataManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"biodatas" | "requests">("biodatas");
  const [biodatas, setBiodatas] = useState<Biodata[]>([]);
  const [requests, setRequests] = useState<BiodataRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Editing Modal State
  const [editingBiodata, setEditingBiodata] = useState<Biodata | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    setLoading(true);

    // 1. Listen to all biodatas
    const unsubBiodatas = onSnapshot(collection(db, "biodatas"), (snap) => {
      const list: Biodata[] = [];
      snap.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() } as Biodata);
      });
      setBiodatas(list);
    }, (err) => console.warn(err));

    // 2. Listen to all contact requests
    const unsubRequests = onSnapshot(collection(db, "biodata_requests"), (snap) => {
      const list: BiodataRequest[] = [];
      snap.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() } as BiodataRequest);
      });
      setRequests(list);
      setLoading(false);
    }, (err) => {
      console.warn(err);
      setLoading(false);
    });

    return () => {
      unsubBiodatas();
      unsubRequests();
    };
  }, []);

  // Action Handlers
  const handleToggleVerified = async (id: string, current: boolean) => {
    try {
      await updateDoc(doc(db, "biodatas", id), {
        isVerified: !current,
        updatedAt: Date.now()
      });
    } catch (err) {
      alert("Verified status update error.");
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const next = currentStatus === "active" ? "inactive" : "active";
      await updateDoc(doc(db, "biodatas", id), {
        status: next,
        updatedAt: Date.now()
      });
    } catch (err) {
      alert("Status update error.");
    }
  };

  const handleDeleteBiodata = async (id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিত যে এই বায়োডাটাটি স্থায়ীভাবে মুছে ফেলতে চান?")) return;
    try {
      await deleteDoc(doc(db, "biodatas", id));
    } catch (err) {
      alert("Delete error.");
    }
  };

  // Contact Request Approval
  const handleApproveRequest = async (req: BiodataRequest) => {
    try {
      // Find candidate biodata to get guardian phone number
      const bioSnap = await getDoc(doc(db, "biodatas", req.biodataId));
      const bioData = bioSnap.data();

      await updateDoc(doc(db, "biodata_requests", req.id), {
        status: "approved",
        candidateGuardianName: bioData?.guardianName || "অভিভাবক",
        candidateGuardianPhone: bioData?.guardianPhone || "01711000000",
        candidateGuardianRelation: bioData?.guardianRelation || "অভিভাবক",
        updatedAt: Date.now()
      });

      alert("অনুরোধ অনুমোদন করা হয়েছে! ইউজার ড্যাশবোর্ডে ফোন নম্বর দেখতে পাবেন।");
    } catch (err) {
      alert("Approve error.");
    }
  };

  const handleRejectRequest = async (reqId: string) => {
    try {
      await updateDoc(doc(db, "biodata_requests", reqId), {
        status: "rejected",
        updatedAt: Date.now()
      });
    } catch (err) {
      alert("Reject error.");
    }
  };

  // Save Edit
  const handleSaveEdit = async () => {
    if (!editingBiodata) return;
    setSavingEdit(true);
    try {
      await updateDoc(doc(db, "biodatas", editingBiodata.id), {
        ...editingBiodata,
        updatedAt: Date.now()
      });
      alert("বায়োডাটা সফলভাবে আপডেট করা হয়েছে!");
      setEditingBiodata(null);
    } catch (err) {
      alert("Save edit error.");
    } finally {
      setSavingEdit(false);
    }
  };

  // Filtered Biodatas List
  const filteredBiodatas = biodatas.filter((b) => {
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchCode = b.biodataCode?.toLowerCase().includes(term);
      const matchName = b.fullName?.toLowerCase().includes(term);
      const matchPhone = b.guardianPhone?.toLowerCase().includes(term);
      if (!matchCode && !matchName && !matchPhone) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white rounded-3xl p-6 shadow-md border border-emerald-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-400 fill-rose-400" />
            <h2 className="text-xl font-black">বিবাহের বায়োডাটা ম্যানেজমেন্ট (Matrimonial Manager)</h2>
          </div>
          <p className="text-xs text-emerald-200 mt-1">
            বায়োডাটা ভেরিফিকেশন, স্ট্যাটাস পরিবর্তন, এডিটিং ও যোগাযোগের অনুরোধ অনুমোদন করুন
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl border border-white/20">
          <button
            onClick={() => setActiveTab("biodatas")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === "biodatas" ? "bg-white text-emerald-950 shadow-xs" : "text-white hover:bg-white/10"
            }`}
          >
            সকল বায়োডাটা ({biodatas.length})
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === "requests" ? "bg-white text-emerald-950 shadow-xs" : "text-white hover:bg-white/10"
            }`}
          >
            যোগাযোগের অনুরোধ ({requests.length})
          </button>
        </div>
      </div>

      {activeTab === "biodatas" ? (
        <div className="bg-white rounded-3xl border border-emerald-100/90 p-5 shadow-2xs space-y-4">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="বায়োডাটা কোড, প্রার্থীর নাম বা মোবাইল নম্বর দিয়ে খুঁজুন..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
              />
              <Search className="w-4 h-4 text-emerald-700 absolute left-3.5 top-3" />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-40 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-bold text-gray-900"
              >
                <option value="all">সকল স্ট্যাটাস (All)</option>
                <option value="active">একটিভ (Active)</option>
                <option value="pending">অপেক্ষমাণ (Pending)</option>
                <option value="inactive">বন্ধ (Inactive)</option>
              </select>
            </div>
          </div>

          {/* Table View */}
          {loading ? (
            <div className="py-12 text-center text-xs font-bold text-gray-500 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-700" />
              <span>লোডিং...</span>
            </div>
          ) : filteredBiodatas.length === 0 ? (
            <div className="py-12 text-center text-xs font-bold text-gray-500">
              কোনো বায়োডাটা পাওয়া যায়নি।
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-gray-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-gray-700 border-b border-gray-200 font-black">
                    <th className="p-3">কোড</th>
                    <th className="p-3">পাত্র/পাত্রী</th>
                    <th className="p-3">নাম ও বয়স</th>
                    <th className="p-3">জেলা</th>
                    <th className="p-3">পেশা</th>
                    <th className="p-3">অভিভাবকের নম্বর</th>
                    <th className="p-3">Verified</th>
                    <th className="p-3">স্ট্যাটাস</th>
                    <th className="p-3 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-semibold text-gray-800">
                  {filteredBiodatas.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-black text-emerald-900">{b.biodataCode}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          b.gender === 'groom' ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                        }`}>
                          {b.gender === 'groom' ? '👨 পাত্র' : '🧕 পাত্রী'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="font-bold">{b.fullName || 'নাম গোপন'}</div>
                        <div className="text-[10px] text-gray-500">{b.maritalStatus} • {b.age} বছর</div>
                      </td>
                      <td className="p-3">{b.presentDistrict}</td>
                      <td className="p-3">{b.occupation}</td>
                      <td className="p-3 font-mono">{b.guardianPhone || 'N/A'}</td>
                      
                      <td className="p-3">
                        <button
                          onClick={() => handleToggleVerified(b.id, b.isVerified)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black transition-all flex items-center gap-1 ${
                            b.isVerified ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          <CheckCircle2 className={`w-3 h-3 ${b.isVerified ? 'text-amber-600' : 'text-gray-400'}`} />
                          <span>{b.isVerified ? 'Verified' : 'Unverified'}</span>
                        </button>
                      </td>

                      <td className="p-3">
                        <button
                          onClick={() => handleToggleStatus(b.id, b.status)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            b.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {b.status === 'active' ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditingBiodata(b)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-gray-800 rounded-lg"
                            title="এডিট করুন"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBiodata(b.id)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      ) : (
        /* Contact Requests Manager Table */
        <div className="bg-white rounded-3xl border border-emerald-100/90 p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-emerald-700" />
            ইউজারদের প্রেরিত যোগাযোগের অনুরোধ তালিকা
          </h3>

          {requests.length === 0 ? (
            <div className="py-12 text-center text-xs font-bold text-gray-500">
              কোনো নতুন যোগাযোগের অনুরোধ নেই।
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-gray-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-gray-700 border-b border-gray-200 font-black">
                    <th className="p-3">আবেদনকারী ইউজার</th>
                    <th className="p-3">ইউজার মোবাইল</th>
                    <th className="p-3">টার্গেট বায়োডাটা</th>
                    <th className="p-3">স্ট্যাটাস</th>
                    <th className="p-3 text-right">অ্যাকশন (অনুমোদন)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-semibold text-gray-800">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-bold text-gray-900">{req.userName}</td>
                      <td className="p-3 font-mono">{req.userPhone || 'N/A'}</td>
                      <td className="p-3 font-black text-emerald-800">{req.biodataCode}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          req.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                          req.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {req.status === 'approved' ? 'Approved' : req.status === 'rejected' ? 'Rejected' : 'Pending'}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        {req.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApproveRequest(req)}
                              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve (অনুমোদন)</span>
                            </button>

                            <button
                              onClick={() => handleRejectRequest(req.id)}
                              className="px-2.5 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl text-xs font-black"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-400 font-bold">সম্পন্ন হয়েছে</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Edit Biodata Modal */}
      {editingBiodata && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-gray-900">বায়োডাটা এডিট: {editingBiodata.biodataCode}</h3>
              <button onClick={() => setEditingBiodata(null)} className="p-1 text-gray-500 hover:text-gray-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-800 block mb-1">প্রার্থীর নাম</label>
                <input
                  type="text"
                  value={editingBiodata.fullName || ""}
                  onChange={(e) => setEditingBiodata({ ...editingBiodata, fullName: e.target.value })}
                  className="w-full bg-gray-50 border rounded-xl p-2.5 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-800 block mb-1">বয়স</label>
                  <input
                    type="number"
                    value={editingBiodata.age}
                    onChange={(e) => setEditingBiodata({ ...editingBiodata, age: Number(e.target.value) })}
                    className="w-full bg-gray-50 border rounded-xl p-2.5 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">উচ্চতা</label>
                  <input
                    type="text"
                    value={editingBiodata.height}
                    onChange={(e) => setEditingBiodata({ ...editingBiodata, height: e.target.value })}
                    className="w-full bg-gray-50 border rounded-xl p-2.5 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">পেশা</label>
                  <input
                    type="text"
                    value={editingBiodata.occupation}
                    onChange={(e) => setEditingBiodata({ ...editingBiodata, occupation: e.target.value })}
                    className="w-full bg-gray-50 border rounded-xl p-2.5 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">অভিভাবকের মোবাইল</label>
                  <input
                    type="text"
                    value={editingBiodata.guardianPhone}
                    onChange={(e) => setEditingBiodata({ ...editingBiodata, guardianPhone: e.target.value })}
                    className="w-full bg-gray-50 border rounded-xl p-2.5 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-800 block mb-1">নিজের সম্পর্কে</label>
                <textarea
                  rows={3}
                  value={editingBiodata.aboutSelf}
                  onChange={(e) => setEditingBiodata({ ...editingBiodata, aboutSelf: e.target.value })}
                  className="w-full bg-gray-50 border rounded-xl p-2.5 font-semibold"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setEditingBiodata(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs"
              >
                বাতিল
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="px-5 py-2 bg-emerald-800 text-white font-black rounded-xl text-xs flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingEdit ? "সেভ হচ্ছে..." : "পরিবর্তন সেভ করুন"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
