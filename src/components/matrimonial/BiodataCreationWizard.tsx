import React, { useState, useRef } from "react";
import { 
  X, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  User, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  Users, 
  BookOpen, 
  Sparkles, 
  HeartHandshake, 
  PhoneCall, 
  Upload, 
  ShieldCheck,
  RefreshCw,
  Calendar,
  Ruler,
  Droplet,
  Heart,
  Send,
  Building,
  Scale,
  ChevronDown,
  Image as ImageIcon,
  Trash2,
  Lock,
  Camera,
  Eye,
  EyeOff
} from "lucide-react";
import { Biodata, BD_DISTRICTS } from "../../types/matrimonial";
import { db } from "../../lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { compressImage } from "../../lib/imageUtils";
import { CustomSelectModal } from "../CustomSelectModal";

interface BiodataCreationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: { uid: string; email?: string; phoneNumber?: string; displayName?: string } | null;
  onSuccess: () => void;
}

export const BiodataCreationWizard: React.FC<BiodataCreationWizardProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSuccess
}) => {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Custom Select Modal State
  const [selectModalConfig, setSelectModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    options: string[];
    fieldKey: string;
    selectedValue: string;
  }>({
    isOpen: false,
    title: "",
    options: [],
    fieldKey: "",
    selectedValue: ""
  });

  const openSelectModal = (title: string, options: string[], fieldKey: string, selectedValue: string) => {
    setSelectModalConfig({
      isOpen: true,
      title,
      options,
      fieldKey,
      selectedValue
    });
  };

  // Form State initialized
  const [formData, setFormData] = useState({
    // Step 1
    gender: "groom" as "groom" | "bride",
    fullName: currentUser?.displayName || "",
    maritalStatus: "অবিবাহিত",
    age: 24,
    height: "৫ ফুট ৬ ইঞ্চি",
    weight: "৬৫ কেজি",
    complexion: "উজ্জ্বল ফর্সা",
    bloodGroup: "B+",

    // Step 2
    presentDistrict: "ঢাকা",
    presentUpazila: "",
    presentAddress: "",
    permanentDistrict: "ঢাকা",
    permanentUpazila: "",
    permanentAddress: "",

    // Step 3
    educationMethod: "সাধারণ শিক্ষা",
    highestDegree: "বিএসসি / স্নাতক",
    institute: "",
    passingYear: "২০২২",
    hifzOrIslamicEducation: "কোরআন সহিহভাবে তিলাওয়াত পারি",

    // Step 4
    occupation: "ব্যবসায়ী",
    workplace: "",
    monthlyIncome: "৩০,০০০ - ৫০,০০০ টাকা",

    // Step 5
    fatherName: "",
    fatherOccupation: "ব্যবসায়ী",
    motherName: "",
    motherOccupation: "গৃহিণী",
    brothersCount: 1,
    sistersCount: 1,
    familyDetails: "",
    familyStatus: "দ্বীনি মধ্যবিত্ত",

    // Step 6
    salahRegularity: "৫ ওয়াক্ত জামাতে",
    hijabOrBeard: "সুন্নতি দাড়ি ও টাখনুর উপরে কাপড়",
    quranRecitation: "প্রতিদিন তিলাওয়াত করি",
    mazhabAqeedah: "আহলে সুন্নাত ওয়াল জামাআত",
    mahramNonMahramCompliance: "কঠোরভাবে মেনে চলি",

    // Step 7
    aboutSelf: "আমি একজন ধার্মিক, সৎ ও কর্মঠ মানুষ। নিয়মিত সালাত আদায় করি এবং সুন্দর সুন্নাহসম্মত জীবনযাপনে চেষ্টা করি।",
    hobbies: "বই পড়া, ইসলামি জ্ঞান অর্জন ও ভ্রমণ",
    futurePlans: "সুন্নাহ সম্মত উপায়ে পরিবার গঠন এবং দ্বীনি পরিবার গড়ে তোলা।",

    // Step 8
    expectedAgeRange: "১৮ - ২৪ বছর",
    expectedHeight: "৫ ফুট ২ ইঞ্চি - ৫ ফুট ৬ ইঞ্চি",
    expectedEducation: "ন্যূনতম এইচএসসি / আলেম/আলেমা",
    expectedOccupation: "দ্বীনি অনুশাসন মানেন এমন",
    expectedDistrict: "যেকোনো জেলা",
    expectedReligiousQualities: "নিয়মিত সালাত আদায়কারী, চরিত্রবান এবং পর্দায় অভ্যস্ত দ্বীনি মনোভাবাপন্ন জীবনসঙ্গী।",

    // Step 9
    guardianName: "",
    guardianRelation: "বাবা",
    guardianPhone: currentUser?.phoneNumber || "",
    photoUrl: "",
    photoBlurred: true,
  });

  if (!isOpen) return null;

  const updateForm = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errorMsg) setErrorMsg("");
  };

  // Step Validation logic: User cannot go to next step without filling required fields
  const validateStep = (currentStep: number): string | null => {
    if (currentStep === 1) {
      if (!formData.fullName || formData.fullName.trim().length === 0) {
        return "ধাপ ১: দয়া করে আপনার পূর্ণ নাম লিখুন।";
      }
      if (!formData.age || formData.age < 18) {
        return "ধাপ ১: বয়স কমপক্ষে ১৮ বছর হতে হবে।";
      }
      if (!formData.height) {
        return "ধাপ ১: উচ্চতা নির্বাচন করুন।";
      }
      if (!formData.complexion) {
        return "ধাপ ১: গায়ের রং নির্বাচন করুন।";
      }
      if (!formData.maritalStatus) {
        return "ধাপ ১: বৈবাহিক অবস্থা নির্বাচন করুন।";
      }
    }

    if (currentStep === 2) {
      if (!formData.presentDistrict) {
        return "ধাপ ২: বর্তমান জেলা নির্বাচন করুন।";
      }
      if (!formData.presentUpazila || formData.presentUpazila.trim().length === 0) {
        return "ধাপ ২: বর্তমান উপজেলা/এলাকা পূরণ করুন।";
      }
      if (!formData.permanentDistrict) {
        return "ধাপ ২: স্থায়ী জেলা নির্বাচন করুন।";
      }
      if (!formData.permanentUpazila || formData.permanentUpazila.trim().length === 0) {
        return "ধাপ ২: স্থায়ী উপজেলা/এলাকা পূরণ করুন।";
      }
    }

    if (currentStep === 3) {
      if (!formData.educationMethod) {
        return "ধাপ ৩: শিক্ষা মাধ্যম নির্বাচন করুন।";
      }
      if (!formData.highestDegree || formData.highestDegree.trim().length === 0) {
        return "ধাপ ৩: সর্বোচ্চ একাডেমিক যোগ্যতা লিখুন।";
      }
    }

    if (currentStep === 4) {
      if (!formData.occupation || formData.occupation.trim().length === 0) {
        return "ধাপ ৪: বর্তমান পেশা লিখুন।";
      }
    }

    if (currentStep === 5) {
      if (!formData.fatherOccupation || formData.fatherOccupation.trim().length === 0) {
        return "ধাপ ৫: পিতার পেশা লিখুন।";
      }
      if (!formData.motherOccupation || formData.motherOccupation.trim().length === 0) {
        return "ধাপ ৫: মাতার পেশা লিখুন।";
      }
    }

    if (currentStep === 6) {
      if (!formData.salahRegularity || formData.salahRegularity.trim().length === 0) {
        return "ধাপ ৬: সালাতের তথ্য সঠিকভাবে পূরণ করুন।";
      }
    }

    if (currentStep === 7) {
      if (!formData.aboutSelf || formData.aboutSelf.trim().length < 5) {
        return "ধাপ ৭: নিজের সম্পর্কে সংক্ষেপে লিখুন।";
      }
    }

    if (currentStep === 8) {
      if (!formData.expectedReligiousQualities || formData.expectedReligiousQualities.trim().length < 5) {
        return "ধাপ ৮: জীবনসঙ্গীর প্রত্যাশা পূরণ করুন।";
      }
    }

    if (currentStep === 9) {
      if (!formData.guardianRelation) {
        return "ধাপ ৯: অভিভাবকের সাথে সম্পর্ক নির্বাচন করুন।";
      }
      if (!formData.guardianPhone || formData.guardianPhone.trim().length < 10) {
        return "ধাপ ৯: অভিভাবকের সঠিক ১০ বা ১১ ডিজিটের মোবাইল নম্বর লিখুন।";
      }
    }

    return null;
  };

  const handleNextStep = () => {
    const error = validateStep(step);
    if (error) {
      setErrorMsg(error);
      return;
    }
    setErrorMsg("");
    setStep(prev => Math.min(10, prev + 1));
  };

  const handleJumpToStep = (targetStep: number) => {
    if (targetStep < step) {
      setErrorMsg("");
      setStep(targetStep);
      return;
    }
    for (let s = 1; s < targetStep; s++) {
      const err = validateStep(s);
      if (err) {
        setErrorMsg(err);
        setStep(s);
        return;
      }
    }
    setErrorMsg("");
    setStep(targetStep);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const url = await compressImage(file);
      updateForm("photoUrl", url);
    } catch (err) {
      alert("ছবি প্রসেস করা ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmitBiodata = async () => {
    if (!currentUser) {
      alert("বায়োডাটা তৈরি করতে আগে লগইন করুন।");
      return;
    }

    if (!formData.guardianPhone || formData.guardianPhone.length < 10) {
      setErrorMsg("ধাপ ৯-এ অভিভাবকের সঠিক মোবাইল নম্বর লিখুন।");
      setStep(9);
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const generatedCode = `MB-${Math.floor(1000 + Math.random() * 9000)}`;

      const newBiodata: Partial<Biodata> = {
        ...formData,
        biodataCode: generatedCode,
        userId: currentUser.uid,
        status: "pending",
        isVerified: false,
        isFeatured: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await addDoc(collection(db, "biodatas"), newBiodata);
      onSuccess();
    } catch (err: any) {
      setErrorMsg("বায়োডাটা সেভ করতে সমস্যা হয়েছে: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const stepTitles = [
    { title: "ব্যক্তিগত তথ্য", subtitle: "নাম, লিঙ্গ, বয়স ও শারীরিক বিবরণ" },
    { title: "ঠিকানা", subtitle: "বর্তমান ও স্থায়ী ঠিকানার বিবরণ" },
    { title: "শিক্ষা ও একাডেমিক", subtitle: "শিক্ষা প্রতিষ্ঠান ও সর্বোচ্চ ডিগ্রি" },
    { title: "পেশা ও আয়", subtitle: "পেশা, কাজের ধরন ও আনুমানিক আয়" },
    { title: "পারিবারিক তথ্য", subtitle: "পিতামাতা, ভাই-বোন ও ব্যাকগ্রাউন্ড" },
    { title: "দ্বীনি তথ্য", subtitle: "সালাত, পর্দা, আমল ও আকীদাহ" },
    { title: "জীবনধারা", subtitle: "নিজের সম্পর্কে, অভ্যাস ও ভবিষ্যৎ পরিকল্পনা" },
    { title: "জীবনসঙ্গীর প্রত্যাশা", subtitle: "বয়স, শিক্ষা, জেলা ও ধর্মীয় গুণাবলী" },
    { title: "অভিভাবক ও ছবি", subtitle: "অভিভাবকের নম্বর ও প্রটেক্টেড ছবি" },
    { title: "যাচাই ও প্রকাশ", subtitle: "সকল তথ্য মিলিয়ে নিয়ে জমা দিন" }
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-[9999] flex items-center justify-center p-0 sm:p-4 overflow-y-auto">
      
      <div className="bg-white w-full max-w-2xl rounded-none sm:rounded-3xl shadow-2xl flex flex-col h-full sm:h-auto sm:max-h-[92vh] overflow-hidden animate-fadeIn relative">
        
        {/* TOP HEADER BAR */}
        <div className="bg-[#053d26] text-white p-4 sm:p-5 flex items-center justify-between sticky top-0 z-20 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-800/80 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300 block">
                ধাপ {step} / ১০ - {stepTitles[step - 1].title}
              </span>
              <h2 className="text-sm sm:text-base font-black text-white">
                {stepTitles[step - 1].subtitle}
              </h2>
            </div>
          </div>

          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PROGRESS DOTS BAR */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between gap-1 overflow-x-auto scrollbar-none">
          {Array.from({ length: 10 }).map((_, idx) => {
            const stepNum = idx + 1;
            const isDone = stepNum < step;
            const isCurrent = stepNum === step;
            return (
              <div 
                key={stepNum} 
                onClick={() => handleJumpToStep(stepNum)}
                className={`h-2 flex-1 rounded-full cursor-pointer transition-all ${
                  isCurrent ? 'bg-[#053d26] scale-y-125' : isDone ? 'bg-emerald-500' : 'bg-slate-200'
                }`}
                title={`ধাপ ${stepNum}`}
              />
            );
          })}
        </div>

        {/* STEP FORM BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 pb-28">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 text-rose-800 rounded-2xl border border-rose-200 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {/* STEP 1: 1. ব্যক্তিগত তথ্য */}
          {step === 1 && (
            <div className="space-y-4 text-xs">
              
              {/* Radio Box Selection */}
              <div className="space-y-2">
                <label className="font-black text-gray-900 text-xs sm:text-sm block">
                  আমি হিসেবে নিবন্ধন করতে চাই
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => updateForm("gender", "groom")}
                    className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex items-center justify-between ${
                      formData.gender === "groom" 
                        ? "bg-emerald-50 border-[#053d26] shadow-xs" 
                        : "bg-slate-50 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl font-bold">
                        👨
                      </div>
                      <div>
                        <h4 className="font-black text-gray-900 text-xs sm:text-sm">পাত্রের বায়োডাটা (Groom)</h4>
                        <p className="text-[10px] text-gray-500 font-medium">ইসলামিক পাত্র প্রোফাইল</p>
                      </div>
                    </div>
                    {formData.gender === "groom" && (
                      <CheckCircle2 className="w-5 h-5 text-[#053d26] fill-emerald-100" />
                    )}
                  </div>

                  <div
                    onClick={() => updateForm("gender", "bride")}
                    className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex items-center justify-between ${
                      formData.gender === "bride" 
                        ? "bg-purple-50 border-purple-700 shadow-xs" 
                        : "bg-slate-50 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center text-xl font-bold">
                        🧕
                      </div>
                      <div>
                        <h4 className="font-black text-gray-900 text-xs sm:text-sm">পাত্রীর বায়োডাটা (Bride)</h4>
                        <p className="text-[10px] text-gray-500 font-medium">পর্দাশীন পাত্রী প্রোফাইল</p>
                      </div>
                    </div>
                    {formData.gender === "bride" && (
                      <CheckCircle2 className="w-5 h-5 text-purple-700 fill-purple-100" />
                    )}
                  </div>
                </div>
              </div>

              {/* Input Fields */}
              <div className="space-y-3 pt-2">
                
                {/* Full Name */}
                <div>
                  <label className="font-bold text-gray-800 block mb-1">পূর্ণ নাম *</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => updateForm("fullName", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/30 text-xs sm:text-sm"
                      placeholder="যেমন: মাহিন আহমদ"
                    />
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Age */}
                  <div>
                    <label className="font-bold text-gray-800 block mb-1">বয়স *</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.age}
                        onChange={(e) => updateForm("age", Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 font-semibold text-gray-900 text-xs sm:text-sm"
                      />
                      <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    </div>
                  </div>

                  {/* Height Popup Selector */}
                  <div>
                    <label className="font-bold text-gray-800 block mb-1">উচ্চতা *</label>
                    <button
                      type="button"
                      onClick={() => openSelectModal(
                        "উচ্চতা নির্বাচন করুন",
                        [
                          "৫ ফুট ০ ইঞ্চি", "৫ ফুট ১ ইঞ্চি", "৫ ফুট ২ ইঞ্চি", "৫ ফুট ৩ ইঞ্চি",
                          "৫ ফুট ৪ ইঞ্চি", "৫ ফুট ৫ ইঞ্চি", "৫ ফুট ৬ ইঞ্চি", "৫ ফুট ৭ ইঞ্চি",
                          "৫ ফুট ৮ ইঞ্চি", "৫ ফুট ৯ ইঞ্চি", "৫ ফুট ১০ ইঞ্চি", "৫ ফুট ১১ ইঞ্চি", "৬ ফুট ০ ইঞ্চি"
                        ],
                        "height",
                        formData.height
                      )}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 font-bold text-gray-900 text-left flex items-center justify-between text-xs sm:text-sm relative"
                    >
                      <Ruler className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <span className="truncate pl-3">{formData.height || "উচ্চতা বেছে নিন"}</span>
                      <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Weight */}
                  <div>
                    <label className="font-bold text-gray-800 block mb-1">ওজন</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.weight}
                        onChange={(e) => updateForm("weight", e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 font-semibold text-gray-900 text-xs sm:text-sm"
                        placeholder="যেমন: ৫৫ কেজি"
                      />
                      <Scale className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    </div>
                  </div>

                  {/* Blood Group Popup Selector */}
                  <div>
                    <label className="font-bold text-gray-800 block mb-1">রক্তের গ্রুপ</label>
                    <button
                      type="button"
                      onClick={() => openSelectModal(
                        "রক্তের গ্রুপ নির্বাচন করুন",
                        ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
                        "bloodGroup",
                        formData.bloodGroup
                      )}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 font-bold text-gray-900 text-left flex items-center justify-between text-xs sm:text-sm relative"
                    >
                      <Droplet className="w-4 h-4 text-rose-500 absolute left-3 top-3" />
                      <span className="truncate pl-3">{formData.bloodGroup || "গ্রুপ বেছে নিন"}</span>
                      <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                    </button>
                  </div>
                </div>

                {/* Complexion & Marital Status Popup Selectors */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Complexion */}
                  <div>
                    <label className="font-bold text-gray-800 block mb-1">গায়ের রং *</label>
                    <button
                      type="button"
                      onClick={() => openSelectModal(
                        "গায়ের রং নির্বাচন করুন",
                        ["উজ্জ্বল ফর্সা", "ফর্সা", "শ্যামলা", "উজ্জ্বল শ্যামলা", "কালো"],
                        "complexion",
                        formData.complexion
                      )}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-gray-900 text-left flex items-center justify-between text-xs sm:text-sm"
                    >
                      <span className="truncate">{formData.complexion || "গায়ের রং বেছে নিন"}</span>
                      <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                    </button>
                  </div>

                  {/* Marital Status */}
                  <div>
                    <label className="font-bold text-gray-800 block mb-1">বৈবাহিক অবস্থা *</label>
                    <button
                      type="button"
                      onClick={() => openSelectModal(
                        "বৈবাহিক অবস্থা নির্বাচন করুন",
                        ["অবিবাহিত", "ডিভোর্সড", "বিপত্নীক", "বিধবা"],
                        "maritalStatus",
                        formData.maritalStatus
                      )}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-gray-900 text-left flex items-center justify-between text-xs sm:text-sm"
                    >
                      <span className="truncate">{formData.maritalStatus || "অবস্থা বেছে নিন"}</span>
                      <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* STEP 2: ঠিকানা */}
          {step === 2 && (
            <div className="space-y-3 text-xs">
              <h3 className="font-black text-gray-900 text-sm">বর্তমান ঠিকানা</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">বর্তমান জেলা *</label>
                  <button
                    type="button"
                    onClick={() => openSelectModal("বর্তমান জেলা নির্বাচন করুন", BD_DISTRICTS, "presentDistrict", formData.presentDistrict)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-gray-900 text-left flex items-center justify-between text-xs"
                  >
                    <span className="truncate">{formData.presentDistrict}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                  </button>
                </div>
                <div>
                  <label className="font-bold block mb-1">উপজেলা / এলাকা</label>
                  <input
                    type="text"
                    value={formData.presentUpazila}
                    onChange={(e) => updateForm("presentUpazila", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                    placeholder="যেমন: কাজীহাটা"
                  />
                </div>
              </div>

              <h3 className="font-black text-gray-900 text-sm pt-2">স্থায়ী ঠিকানা</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">স্থায়ী জেলা *</label>
                  <button
                    type="button"
                    onClick={() => openSelectModal("স্থায়ী জেলা নির্বাচন করুন", BD_DISTRICTS, "permanentDistrict", formData.permanentDistrict)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-gray-900 text-left flex items-center justify-between text-xs"
                  >
                    <span className="truncate">{formData.permanentDistrict}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                  </button>
                </div>
                <div>
                  <label className="font-bold block mb-1">উপজেলা / এলাকা</label>
                  <input
                    type="text"
                    value={formData.permanentUpazila}
                    onChange={(e) => updateForm("permanentUpazila", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                    placeholder="যেমন: সদর"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 to 8 */}
          {step >= 3 && step <= 8 && (
            <div className="space-y-3 text-xs">
              <p className="font-bold text-gray-700">ধাপ {step}-এর প্রয়োজনীয় তথ্যাবলী বিস্তারিত প্রদান করুন:</p>
              {step === 3 && (
                <div className="space-y-2">
                  <label className="font-bold block">শিক্ষা মাধ্যম *</label>
                  <button
                    type="button"
                    onClick={() => openSelectModal("শিক্ষা মাধ্যম নির্বাচন করুন", ["সাধারণ শিক্ষা", "কওমি ও মাদ্রাসা শিক্ষা", "আলিয়া মাদ্রাসা", "ইংরেজি মাধ্যম"], "educationMethod", formData.educationMethod)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-gray-900 text-left flex items-center justify-between text-xs"
                  >
                    <span className="truncate">{formData.educationMethod}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                  </button>

                  <label className="font-bold block pt-2">সর্বোচ্চ একাডেমিক যোগ্যতা *</label>
                  <input
                    type="text"
                    value={formData.highestDegree}
                    onChange={(e) => updateForm("highestDegree", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  />
                  <label className="font-bold block">শিক্ষা প্রতিষ্ঠানের নাম</label>
                  <input
                    type="text"
                    value={formData.institute}
                    onChange={(e) => updateForm("institute", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  />
                </div>
              )}

              {step === 4 && (
                <div className="space-y-2">
                  <label className="font-bold block">বর্তমান পেশা *</label>
                  <input
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => updateForm("occupation", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  />
                </div>
              )}

              {step === 5 && (
                <div className="space-y-2">
                  <label className="font-bold block">পিতার পেশা</label>
                  <input
                    type="text"
                    value={formData.fatherOccupation}
                    onChange={(e) => updateForm("fatherOccupation", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  />
                  <label className="font-bold block">মাতার পেশা</label>
                  <input
                    type="text"
                    value={formData.motherOccupation}
                    onChange={(e) => updateForm("motherOccupation", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  />
                </div>
              )}

              {step === 6 && (
                <div className="space-y-2">
                  <label className="font-bold block">সালাত নিয়মিত পড়েন?</label>
                  <input
                    type="text"
                    value={formData.salahRegularity}
                    onChange={(e) => updateForm("salahRegularity", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  />
                  <label className="font-bold block">পর্দা / সুন্নতি দাড়ি পালন</label>
                  <input
                    type="text"
                    value={formData.hijabOrBeard}
                    onChange={(e) => updateForm("hijabOrBeard", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  />
                </div>
              )}

              {step === 7 && (
                <div className="space-y-2">
                  <label className="font-bold block">নিজের সম্পর্কে কিছু বলুন</label>
                  <textarea
                    rows={4}
                    value={formData.aboutSelf}
                    onChange={(e) => updateForm("aboutSelf", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  />
                </div>
              )}

              {step === 8 && (
                <div className="space-y-2">
                  <label className="font-bold block">জীবনসঙ্গীর কাছে কেমন প্রত্যাশা?</label>
                  <textarea
                    rows={4}
                    value={formData.expectedReligiousQualities}
                    onChange={(e) => updateForm("expectedReligiousQualities", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  />
                </div>
              )}
            </div>
          )}

          {/* STEP 9: Guardian Phone & Photo */}
          {step === 9 && (
            <div className="space-y-3 text-xs">
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-amber-900 font-medium">
                🔒 অভিভাবকের নম্বর গোপন থাকবে। শুধুমাত্র আপনি অনুমতি দিলে যোগাযোগের জন্য দেখানো হবে।
              </div>

              <div>
                <label className="font-bold block mb-1">অভিভাবকের সাথে সম্পর্ক *</label>
                <button
                  type="button"
                  onClick={() => openSelectModal("অভিভাবকের সাথে সম্পর্ক নির্বাচন করুন", ["বাবা", "মা", "ভাই", "চাচ্চু", "অন্যান্য"], "guardianRelation", formData.guardianRelation)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-gray-900 text-left flex items-center justify-between text-xs"
                >
                  <span className="truncate">{formData.guardianRelation}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                </button>
              </div>

              <div>
                <label className="font-bold block mb-1">অভিভাবকের মোবাইল নম্বর *</label>
                <input
                  type="text"
                  value={formData.guardianPhone}
                  onChange={(e) => updateForm("guardianPhone", e.target.value)}
                  placeholder="017xxxxxxxx"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                />
              </div>

              <div className="pt-2">
                <label className="font-bold text-gray-900 block mb-1.5 text-xs">
                  ছবি আপলোড করুন (গ্যালারি থেকে সিলেক্ট করুন)
                </label>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />

                {/* Photo Dropzone / Gallery Picker Card */}
                {formData.photoUrl ? (
                  <div className="bg-slate-50 border-2 border-emerald-500/40 rounded-2xl p-3.5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-300 bg-black shrink-0">
                        <img
                          src={formData.photoUrl}
                          alt="Uploaded"
                          className={`w-full h-full object-cover transition-all ${
                            formData.photoBlurred ? "blur-md scale-110" : ""
                          }`}
                        />
                        {formData.photoBlurred && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                            <Lock className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-black text-gray-900 text-xs truncate">ছবি আপলোড সম্পন্ন!</p>
                        <p className="text-[10px] text-gray-500 font-medium">
                          {formData.photoBlurred ? "🔒 ছবি প্রটেক্টেড (ব্লার করা)" : "👁️ ছবি স্পষ্ট দেখা যাবে"}
                        </p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-lg text-[11px] font-bold transition cursor-pointer"
                          >
                            পরিবর্তন
                          </button>
                          <button
                            type="button"
                            onClick={() => updateForm("photoBlurred", !formData.photoBlurred)}
                            className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-gray-800 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            {formData.photoBlurred ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            <span>{formData.photoBlurred ? "আনব্লার" : "ব্লার"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => updateForm("photoUrl", "")}
                            className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="ছবি মুছুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-emerald-600/40 hover:border-emerald-700 bg-emerald-50/40 hover:bg-emerald-50 rounded-2xl p-4 text-center cursor-pointer transition-all space-y-2 group active:scale-98"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-xs">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-emerald-950 text-xs sm:text-sm">
                        📱 গ্যালারি থেকে ছবি আপলোড করতে চাপ দিন
                      </h4>
                      <p className="text-[10px] text-gray-600 font-medium mt-0.5">
                        আপনার ফোনের গ্যালারি অথবা ক্যামেরা থেকে ছবি সিলেক্ট করুন
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#053d26] text-white rounded-xl text-[11px] font-black shadow-xs">
                      <ImageIcon className="w-3.5 h-3.5 text-emerald-300" />
                      <span>গ্যালারি ব্রাউজ করুন</span>
                    </div>
                  </div>
                )}

                {uploadingPhoto && (
                  <div className="flex items-center justify-center gap-2 text-emerald-800 font-bold text-xs mt-2 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                    <span>গ্যালারির ছবি প্রসেস করা হচ্ছে...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 10: Confirmation */}
          {step === 10 && (
            <div className="space-y-4 text-xs text-center py-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-base font-black text-gray-900">সকল তথ্য প্রদান সম্পন্ন হয়েছে!</h3>
              <p className="text-gray-600">নিচের বোতামে চাপ দিয়ে আপনার ইসলামিক বায়োডাটা জমা দিন। এডমিন ভেরিফাই করে অনুমোদন দেবেন।</p>
            </div>
          )}

        </div>

        {/* STICKY FOOTER NAVIGATION */}
        <div className="bg-white border-t border-slate-200 p-3 sm:p-4 sticky bottom-0 inset-x-0 z-30 flex items-center justify-between gap-3">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className={`py-2.5 px-4 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              step === 1 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-100 text-slate-800 hover:bg-slate-200 active:scale-95'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>পূর্ববর্তী</span>
          </button>

          {step < 10 ? (
            <button
              onClick={handleNextStep}
              className="py-2.5 px-5 bg-[#053d26] hover:bg-[#032517] text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
            >
              <span>পরবর্তী</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmitBiodata}
              disabled={submitting}
              className="py-2.5 px-6 bg-amber-500 hover:bg-amber-600 text-gray-950 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
            >
              {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>বায়োডাটা জমা দিন</span>
            </button>
          )}
        </div>

      </div>

      {/* REUSABLE CUSTOM SELECT POPUP MODAL */}
      <CustomSelectModal
        isOpen={selectModalConfig.isOpen}
        onClose={() => setSelectModalConfig(prev => ({ ...prev, isOpen: false }))}
        title={selectModalConfig.title}
        options={selectModalConfig.options}
        selectedValue={selectModalConfig.selectedValue}
        onSelect={(val) => updateForm(selectModalConfig.fieldKey, val)}
      />

    </div>
  );
};
