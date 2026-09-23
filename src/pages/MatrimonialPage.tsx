import React, { useState, useEffect } from "react";
import { 
  Heart, 
  Search, 
  Filter, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  MapPin, 
  ShieldCheck, 
  User, 
  Bookmark, 
  PhoneCall, 
  RefreshCw,
  SlidersHorizontal,
  X,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  Send
} from "lucide-react";
import { db } from "../lib/firebase";
import { collection, query, where, getDocs, onSnapshot, addDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { Biodata, BiodataFilters, BD_DISTRICTS } from "../types/matrimonial";
import { BiodataCard } from "../components/matrimonial/BiodataCard";
import { BiodataDetailsModal } from "../components/matrimonial/BiodataDetailsModal";
import { BiodataCreationWizard } from "../components/matrimonial/BiodataCreationWizard";
import { UserBiodataDashboard } from "../components/matrimonial/UserBiodataDashboard";
import { CustomSelectModal } from "../components/CustomSelectModal";
import { ProfilePromptModal } from "../components/matrimonial/ProfilePromptModal";
import { UserProfileCard } from "../components/matrimonial/UserProfileCard";
import { useNavigate } from "react-router-dom";

export const MatrimonialPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [biodatas, setBiodatas] = useState<Biodata[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [filters, setFilters] = useState<BiodataFilters>({
    searchTerm: "",
    gender: "all",
    district: "",
    quickFilter: "all"
  });

  // Modal States
  const [selectedBiodata, setSelectedBiodata] = useState<Biodata | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [isDistrictModalOpen, setIsDistrictModalOpen] = useState(false);
  const [isProfilePromptOpen, setIsProfilePromptOpen] = useState(false);
  const [pendingContactBiodata, setPendingContactBiodata] = useState<Biodata | null>(null);

  // Bookmarks saved in localStorage
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("bookmarked_biodatas") || "[]");
    } catch {
      return [];
    }
  });

  // Approved Phone Number for selected biodata
  const [approvedPhone, setApprovedPhone] = useState<string | null>(null);

  // Request Counts for User Profile Card
  const [sentCount, setSentCount] = useState(0);
  const [incomingCount, setIncomingCount] = useState(0);

  useEffect(() => {
    if (!user?.uid) return;

    const qSent = query(collection(db, "biodata_requests"), where("userId", "==", user.uid));
    const unsubSent = onSnapshot(qSent, (snap) => setSentCount(snap.size), (err) => console.warn(err));

    const qIncoming = query(collection(db, "biodata_requests"), where("candidateUserId", "==", user.uid));
    const unsubIncoming = onSnapshot(qIncoming, (snap) => setIncomingCount(snap.size), (err) => console.warn(err));

    return () => {
      unsubSent();
      unsubIncoming();
    };
  }, [user?.uid]);

  // Realtime Load Biodatas
  useEffect(() => {
    setLoading(true);
    const q = collection(db, "biodatas");

    const unsub = onSnapshot(q, (snap) => {
      const list: Biodata[] = [];
      snap.forEach(doc => {
        const data = doc.data() as Biodata;
        if (data.status === "active" || data.status === "pending") {
          list.push({ id: doc.id, ...data });
        }
      });

      // Default seed items if empty to populate cards
      if (list.length === 0) {
        list.push(
          {
            id: "seed-1",
            biodataCode: "MB-1001",
            userId: "mock-1",
            gender: "groom",
            status: "active",
            isVerified: true,
            isFeatured: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            fullName: "মুহাম্মাদ আবদুল্লাহ",
            maritalStatus: "অবিবাহিত",
            age: 25,
            height: "৫ ফুট ৭ ইঞ্চি",
            weight: "৬৮ কেজি",
            complexion: "উজ্জ্বল ফর্সা",
            bloodGroup: "B+",
            presentDistrict: "সিলেট",
            presentUpazila: "জিন্দাবাজার",
            permanentDistrict: "সিলেট",
            educationMethod: "সাধারণ শিক্ষা",
            highestDegree: "বিএসসি ইন সিএসই",
            institute: "শাহজালাল বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়",
            occupation: "প্রভাষক ও গবেষক",
            monthlyIncome: "৬০,০০০ - ৮০,০০০ টাকা",
            fatherOccupation: "ব্যবসায়ী",
            motherOccupation: "গৃহিণী",
            brothersCount: 1,
            sistersCount: 1,
            familyDetails: "দ্বীনি ও মার্জিত মধ্যবিত্ত পরিবার।",
            familyStatus: "দ্বীনি মধ্যবিত্ত",
            salahRegularity: "৫ ওয়াক্ত জামাতে",
            hijabOrBeard: "সুন্নতি দাড়ি ও টাখনুর উপরে কাপড়",
            quranRecitation: "সহিহভাবে প্রতিদিন তিলাওয়াত করি",
            mahramNonMahramCompliance: "কঠোরভাবে মেনে চলি",
            aboutSelf: "আমি সুন্নাহসম্মত জীবনযাপনে অভ্যস্ত। প্রফেশনাল লাইফের পাশাপাশি দ্বীনি জ্ঞানার্জনে মনোযোগী।",
            expectedAgeRange: "১৮ - ২২ বছর",
            expectedHeight: "৫ ফুট ২ ইঞ্চি - ৫ ফুট ৫ ইঞ্চি",
            expectedEducation: "এইচএসসি / স্নাতক / আলেমা",
            expectedReligiousQualities: "নিয়মিত সালাত আদায়কারী, পর্দা মেইনটেইন করেন এমন চরিত্রবান পাত্রী।",
            guardianName: "হাজী আব্দুর রহমান",
            guardianRelation: "বাবা",
            guardianPhone: "01711000000",
            photoBlurred: true
          },
          {
            id: "seed-2",
            biodataCode: "MB-1002",
            userId: "mock-2",
            gender: "bride",
            status: "active",
            isVerified: true,
            isFeatured: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            fullName: "ফাতিমা আক্তার",
            maritalStatus: "অবিবাহিত",
            age: 23,
            height: "৫ ফুট ২ ইঞ্চি",
            weight: "৫০ কেজি",
            complexion: "ফর্সা",
            bloodGroup: "A+",
            presentDistrict: "চট্টগ্রাম",
            presentUpazila: "পাঁচলাইশ",
            permanentDistrict: "চট্টগ্রাম",
            educationMethod: "কওমি ও সাধারণ শিক্ষা",
            highestDegree: "স্নাতক (ডিগ্রি) ও আলেমা",
            institute: "চট্টগ্রাম সরকারি কলেজ",
            occupation: "শিক্ষার্থী ও ফ্রিল্যান্স ডিজাইনার",
            monthlyIncome: "১৫,০০০ - ২৫,০০০ টাকা",
            fatherOccupation: "শিক্ষক",
            motherOccupation: "গৃহিণী",
            brothersCount: 2,
            sistersCount: 0,
            familyDetails: "দ্বীনদার পরহেজগার পরিবার।",
            familyStatus: "দ্বীনি পরিবার",
            salahRegularity: "৫ ওয়াক্ত নিয়মিত সালাত",
            hijabOrBeard: "নিকাব সহ শারীয়াহ সম্মত পর্দা",
            quranRecitation: "হাফেজা ও প্রতিদিন তিলাওয়াত",
            mahramNonMahramCompliance: "কঠোর পর্দা মানা হয়",
            aboutSelf: "আমি ঘরোয়া ও দ্বীনি পরিবেশে বেড়ে উঠেছি। সুন্নাহ অনুযায়ী পরিবার গঠনে ইচ্ছুক।",
            expectedAgeRange: "২৫ - ৩০ বছর",
            expectedHeight: "৫ ফুট ৬ ইঞ্চি - ৫ ফুট ১০ ইঞ্চি",
            expectedEducation: "স্নাতক / স্নাতকোত্তর",
            expectedReligiousQualities: "পরহেজগার, হালাল উপার্জনকারী ও পরিবারের প্রতি যত্নশীল পাত্র।",
            guardianName: "মাওলানা মোহাম্মদ উল্লাহ",
            guardianRelation: "বাবা",
            guardianPhone: "01819000000",
            photoBlurred: true
          },
          {
            id: "seed-3",
            biodataCode: "MB-1003",
            userId: "mock-3",
            gender: "groom",
            status: "active",
            isVerified: true,
            isFeatured: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            fullName: "মাহিন আহমদ",
            maritalStatus: "অবিবাহিত",
            age: 27,
            height: "৫ ফুট ৮ ইঞ্চি",
            weight: "৭২ কেজি",
            complexion: "উজ্জ্বল শ্যামলা",
            bloodGroup: "O+",
            presentDistrict: "রাজশাহী",
            presentUpazila: "কাজীহাটা",
            permanentDistrict: "রাজশাহী",
            educationMethod: "সাধারণ শিক্ষা",
            highestDegree: "এমবিএ",
            institute: "রাজশাহী বিশ্ববিদ্যালয়",
            occupation: "ব্যাংকার (ইসলামিক ব্যাংকিং)",
            monthlyIncome: "৫০,০০০ - ৭০,০০০ টাকা",
            fatherOccupation: "সরকারি কর্মকর্তা",
            motherOccupation: "গৃহিণী",
            brothersCount: 1,
            sistersCount: 1,
            familyDetails: "সম্মানিত ও শিক্ষানুরাগী পরিবার।",
            familyStatus: "মধ্যবিত্ত",
            salahRegularity: "৫ ওয়াক্ত নিয়মিত",
            hijabOrBeard: "সুন্নতি দাড়ি রয়েছে",
            quranRecitation: "নিয়মিত তিলাওয়াত করি",
            mahramNonMahramCompliance: "মেনে চলার চেষ্টা করি",
            aboutSelf: "আমি একজন সামাজিক ও ধার্মিক মানুষ। পারিবারিক মূল্যবোধ মেনে চলি।",
            expectedAgeRange: "১৯ - ২৩ বছর",
            expectedHeight: "৫ ফুট ১ ইঞ্চি - ৫ ফুট ৫ ইঞ্চি",
            expectedEducation: "স্নাতক অধ্যয়নরত বা সমাপ্ত",
            expectedReligiousQualities: "নম্র, মার্জিত ও দ্বীনদার পাত্রী।",
            guardianName: "রেজাউল করিম",
            guardianRelation: "বাবা",
            guardianPhone: "01712000000",
            photoBlurred: true
          },
          {
            id: "seed-4",
            biodataCode: "MB-1004",
            userId: "mock-4",
            gender: "bride",
            status: "active",
            isVerified: true,
            isFeatured: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            fullName: "সুমাইয়া সুলতানা",
            maritalStatus: "অবিবাহিত",
            age: 22,
            height: "৫ ফুট ৩ ইঞ্চি",
            weight: "৫২ কেজি",
            complexion: "উজ্জ্বল ফর্সা",
            bloodGroup: "B+",
            presentDistrict: "ঢাকা",
            presentUpazila: "উত্তরা",
            permanentDistrict: "গাজীপুর",
            educationMethod: "সাধারণ শিক্ষা",
            highestDegree: "বিবিএ অধ্যয়নরত",
            institute: "নর্থ সাউথ বিশ্ববিদ্যালয়",
            occupation: "শিক্ষার্থী",
            monthlyIncome: "নেই",
            fatherOccupation: "ব্যবসায়ী",
            motherOccupation: "শিক্ষিকা",
            brothersCount: 0,
            sistersCount: 2,
            familyDetails: "উচ্চ শিক্ষিত ও মার্জিত মুসলিম পরিবার।",
            familyStatus: "উচ্চ মধ্যবিত্ত",
            salahRegularity: "৫ ওয়াক্ত আদায় করা হয়",
            hijabOrBeard: "নিকাব সহ হিজাব",
            quranRecitation: "নিয়মিত কুরআন তিলাওয়াত করি",
            mahramNonMahramCompliance: "পর্দা মেনে চলি",
            aboutSelf: "পড়াশোনার পাশাপাশি দ্বীনি চর্চা পছন্দ করি।",
            expectedAgeRange: "২৫ - ২৯ বছর",
            expectedHeight: "৫ ফুট ৭ ইঞ্চি +",
            expectedEducation: "স্নাতকোত্তর / প্রকৌশলী / চিকিৎসক",
            expectedReligiousQualities: "সৎ, কর্মঠ ও চরিত্রবান পাত্র।",
            guardianName: "কাজী শফিকুল ইসলাম",
            guardianRelation: "বাবা",
            guardianPhone: "01911000000",
            photoBlurred: true
          }
        );
      }

      setBiodatas(list);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // Toggle Bookmark
  const handleToggleBookmark = (id: string) => {
    let updated: string[];
    if (bookmarkedIds.includes(id)) {
      updated = bookmarkedIds.filter(item => item !== id);
    } else {
      updated = [...bookmarkedIds, id];
    }
    setBookmarkedIds(updated);
    localStorage.setItem("bookmarked_biodatas", JSON.stringify(updated));
  };

  // Open Details Modal
  const handleOpenDetails = async (b: Biodata) => {
    setSelectedBiodata(b);
    setApprovedPhone(null);

    // Check if user has approved contact request
    if (user) {
      try {
        const q = query(
          collection(db, "biodata_requests"),
          where("biodataId", "==", b.id),
          where("userId", "==", user.uid),
          where("status", "==", "approved")
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          setApprovedPhone(b.guardianPhone || "01711000000");
        }
      } catch (e) {
        console.warn(e);
      }
    }

    setIsDetailsOpen(true);
  };

  const executeRequestContact = async (b: Biodata) => {
    if (!user) {
      alert("যোগাযোগের অনুরোধ পাঠাতে প্রথমে অ্যাপে লগইন করুন।");
      return;
    }

    try {
      const newReq = {
        biodataId: b.id,
        biodataCode: b.biodataCode,
        userId: user.uid,
        userName: profile?.displayName || user.displayName || "সম্মানিত গ্রাহক",
        userPhone: profile?.phoneNumber || user.phoneNumber || "",
        userEmail: profile?.email || user.email || "",
        status: "pending",
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await addDoc(collection(db, "biodata_requests"), newReq);
      alert(`বায়োডাটা ${b.biodataCode}-এর জন্য যোগাযোগের অনুরোধ সফলভাবে পাঠানো হয়েছে! এডমিন ভেরিফাই করে অনুমোদন দিলে ফোন নম্বর পাবেন।`);
    } catch (err: any) {
      alert("অনুরোধ পাঠাতে সমস্যা হয়েছে: " + err.message);
    }
  };

  const handleRequestContact = async (b: Biodata) => {
    if (!user) {
      alert("যোগাযোগের অনুরোধ পাঠাতে প্রথমে অ্যাপে লগইন করুন।");
      return;
    }

    // Check if user has created their own biodata profile
    const userHasBiodata = biodatas.some(item => item.userId === user.uid);
    if (!userHasBiodata) {
      setPendingContactBiodata(b);
      setIsProfilePromptOpen(true);
      return;
    }

    await executeRequestContact(b);
  };

  // Filtering Logic
  const filteredBiodatas = biodatas.filter((b) => {
    // Gender Filter
    if (filters.gender !== "all" && b.gender !== filters.gender) return false;

    // District Filter
    if (filters.district && b.presentDistrict !== filters.district && b.permanentDistrict !== filters.district) return false;

    // Quick Filter Chips
    if (filters.quickFilter === "verified" && !b.isVerified) return false;

    // Search Term Filter
    if (filters.searchTerm.trim()) {
      const term = filters.searchTerm.toLowerCase();
      const matchCode = b.biodataCode.toLowerCase().includes(term);
      const matchDistrict = b.presentDistrict?.toLowerCase().includes(term);
      const matchOccupation = b.occupation?.toLowerCase().includes(term);
      const matchEdu = b.highestDegree?.toLowerCase().includes(term);
      if (!matchCode && !matchDistrict && !matchOccupation && !matchEdu) return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-28 pt-2 px-3 sm:px-6 max-w-7xl mx-auto space-y-4 animate-fadeIn">
      
      {/* 1. TOP HEADER BAR matching Screenshots 1 & 2 */}
      <div className="bg-white rounded-2xl border border-gray-200/90 p-3 sm:p-4 shadow-xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition active:scale-95"
            title="ফিরে যান"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div>
            <h1 className="text-sm sm:text-base font-black text-gray-900 tracking-tight flex items-center gap-1.5">
              <span>বিয়ের বায়োডাটা ও পাত্র-পাত্রী</span>
            </h1>
            <p className="text-[10px] sm:text-xs text-gray-500 font-medium">
              প্রাইভেসি-ফার্স্ট সুরক্ষিত ম্যাট্রিমোনিয়াল প্ল্যাটফর্ম
            </p>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowDashboard(!showDashboard)}
            className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/90 rounded-xl text-xs font-black flex items-center gap-1.5 transition active:scale-98 shadow-2xs"
          >
            <Send className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline">ড্যাশবোর্ড</span>
          </button>

          <button
            onClick={() => setIsWizardOpen(true)}
            className="py-2 px-3.5 bg-[#053d26] hover:bg-[#032819] text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm active:scale-98 transition"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>যোগ করুন</span>
          </button>
        </div>
      </div>

      {/* 2. DEDICATED USER MATRIMONIAL MEMBER PROFILE CARD */}
      <UserProfileCard
        user={user}
        userBiodata={biodatas.find(b => b.userId === user?.uid) || null}
        incomingCount={incomingCount}
        sentCount={sentCount}
        bookmarkedCount={bookmarkedIds.length}
        onOpenWizard={() => setIsWizardOpen(true)}
        onOpenDashboard={() => setShowDashboard(true)}
        onViewMyBiodata={(b) => handleOpenDetails(b)}
      />

      {/* User Dashboard Section Toggle */}
      {showDashboard && (
        <UserBiodataDashboard
          currentUser={user}
          onOpenWizard={() => setIsWizardOpen(true)}
          onViewDetails={handleOpenDetails}
        />
      )}

      {/* 2. SEARCH & FILTER CARD matching Screenshots 1 & 2 */}
      <div className="bg-white rounded-3xl p-3.5 sm:p-5 border border-gray-200/90 shadow-xs space-y-3">
        
        {/* Search Input Bar */}
        <div className="relative w-full flex items-center">
          <input
            type="text"
            value={filters.searchTerm}
            onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
            placeholder="জীবনসঙ্গী খুঁজুন... (নাম, জেলা, পেশা)"
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-11 py-3 text-xs sm:text-sm font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5" />
          
          <button 
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-gray-600 absolute right-2 flex items-center justify-center transition"
            title="ফিল্টার"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Filter Chips Row 1 */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          <button
            onClick={() => setFilters({ ...filters, quickFilter: "all" })}
            className={`px-3.5 py-1.5 rounded-full text-xs font-black whitespace-nowrap transition ${
              filters.quickFilter === "all"
                ? "bg-[#053d26] text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            সবাই
          </button>

          <button
            onClick={() => setFilters({ ...filters, quickFilter: "verified" })}
            className={`px-3.5 py-1.5 rounded-full text-xs font-black whitespace-nowrap transition flex items-center gap-1 ${
              filters.quickFilter === "verified"
                ? "bg-[#053d26] text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Verified</span>
          </button>

          <button
            onClick={() => setFilters({ ...filters, quickFilter: "all" })}
            className="px-3.5 py-1.5 rounded-full text-xs font-black bg-slate-100 text-slate-700 hover:bg-slate-200 whitespace-nowrap transition flex items-center gap-1"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>অনলাইন</span>
          </button>

          {/* District Pop-up Modal Trigger Button */}
          <button
            type="button"
            onClick={() => setIsDistrictModalOpen(true)}
            className="px-3.5 py-1.5 rounded-full text-xs font-black bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-800 transition flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 shadow-2xs"
          >
            <span>{filters.district || "সকল জেলা"}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
          </button>
        </div>

        {/* Gender Chips Row 2 */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
          <button
            onClick={() => setFilters({ ...filters, gender: "all" })}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition text-center ${
              filters.gender === "all" ? "bg-slate-800 text-white shadow-xs" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            সবাই
          </button>

          <button
            onClick={() => setFilters({ ...filters, gender: "groom" })}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
              filters.gender === "groom" ? "bg-[#063b28] text-white shadow-xs" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <span>👨 পাত্র</span>
          </button>

          <button
            onClick={() => setFilters({ ...filters, gender: "bride" })}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
              filters.gender === "bride" ? "bg-[#4a0846] text-white shadow-xs" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <span>🧕 পাত্রী</span>
          </button>
        </div>

      </div>

      {/* 3. SECTION TITLE matching Screenshots 1 & 2 */}
      <div className="flex items-center justify-between px-1 pt-1">
        <div>
          <h2 className="text-sm sm:text-base font-black text-gray-900 tracking-tight flex items-center gap-1.5">
            <span>আপনার জন্য নির্বাচিত</span>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded-md text-xs font-extrabold">
              {filteredBiodatas.length} টি
            </span>
          </h2>
          <p className="text-[11px] sm:text-xs text-gray-500 font-medium">
            প্রাইভেসি সুরক্ষিত ইসলামিক পাত্র ও পাত্রীর বায়োডাটা
          </p>
        </div>

        <button 
          onClick={() => setFilters({ searchTerm: "", gender: "all", district: "", quickFilter: "all" })}
          className="text-xs font-black text-emerald-800 hover:text-emerald-950 flex items-center gap-0.5"
        >
          <span>সব দেখুন</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4. BIODATAS GRID */}
      {loading ? (
        <div className="py-12 text-center space-y-3">
          <RefreshCw className="w-7 h-7 text-emerald-700 animate-spin mx-auto" />
          <p className="text-xs font-bold text-gray-600">বায়োডাটা লোড হচ্ছে...</p>
        </div>
      ) : filteredBiodatas.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-gray-200 space-y-3">
          <ShieldCheck className="w-10 h-10 text-gray-400 mx-auto" />
          <h3 className="text-sm font-black text-gray-800">কোনো বায়োডাটা পাওয়া যায়নি</h3>
          <p className="text-xs text-gray-500 font-medium">আপনার ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।</p>
          <button
            onClick={() => setFilters({ searchTerm: "", gender: "all", district: "", quickFilter: "all" })}
            className="py-2.5 px-4 bg-emerald-800 text-white rounded-xl text-xs font-bold"
          >
            ফিল্টার রিসেট করুন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {filteredBiodatas.map((biodata) => (
            <BiodataCard
              key={biodata.id}
              biodata={biodata}
              onViewDetails={handleOpenDetails}
              onRequestContact={handleRequestContact}
              isBookmarked={bookmarkedIds.includes(biodata.id)}
              onToggleBookmark={handleToggleBookmark}
            />
          ))}
        </div>
      )}

      {/* MODALS */}
      <BiodataDetailsModal
        biodata={selectedBiodata}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onRequestContact={handleRequestContact}
        approvedContactPhone={approvedPhone}
      />

      <BiodataCreationWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        currentUser={user}
        onSuccess={() => {
          setIsWizardOpen(false);
          alert("আপনার বায়োডাটা সফলভাবে জমা নেওয়া হয়েছে! এডমিন ভেরিফাই করার পর প্রকাশ করা হবে।");
        }}
      />

      {/* DISTRICT FILTER POPUP MODAL */}
      <CustomSelectModal
        isOpen={isDistrictModalOpen}
        onClose={() => setIsDistrictModalOpen(false)}
        title="জেলা নির্বাচন করুন"
        options={["সকল জেলা", ...BD_DISTRICTS]}
        selectedValue={filters.district || "সকল জেলা"}
        onSelect={(val) => {
          setFilters({ ...filters, district: val === "সকল জেলা" ? "" : val });
        }}
      />

      {/* PROFILE CREATION PROMPT MODAL */}
      <ProfilePromptModal
        isOpen={isProfilePromptOpen}
        onClose={() => {
          setIsProfilePromptOpen(false);
          setPendingContactBiodata(null);
        }}
        onCreateProfile={() => {
          setIsProfilePromptOpen(false);
          setIsWizardOpen(true);
        }}
        onProceedRequest={pendingContactBiodata ? () => {
          const target = pendingContactBiodata;
          setPendingContactBiodata(null);
          setIsProfilePromptOpen(false);
          executeRequestContact(target);
        } : undefined}
        targetBiodataCode={pendingContactBiodata?.biodataCode}
      />

    </div>
  );
};
