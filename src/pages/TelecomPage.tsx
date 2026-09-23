import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Wifi, PhoneCall, Gift, MessageSquare, ChevronRight, ArrowLeft, 
  ShieldCheck, Clock, Tag, CheckCircle2, FileText, Smartphone, History, Send
} from "lucide-react";
import { motion } from "motion/react";
import { TelecomOffer, TelecomCategory, TelecomPaymentMethod, TelecomOrder } from "../types/telecom";
import { getTelecomOffers, getTelecomPaymentMethods, getTelecomOrders, saveTelecomOrders } from "../lib/telecomStorage";
import { useAuth } from "../context/AuthContext";
import { SEO } from "../components/SEO";
import { db } from "../lib/firebase";
import { collection, query, orderBy, onSnapshot, addDoc } from "firebase/firestore";

const renderOperatorBadge = (operator: string) => {
  switch (operator) {
    case 'Grameenphone':
      return <div className="w-full h-full bg-[#00843D] text-white font-black text-xs flex items-center justify-center rounded-xl shadow-xs">GP</div>;
    case 'Robi':
      return <div className="w-full h-full bg-[#ED1C24] text-white font-black text-[10px] flex items-center justify-center rounded-xl shadow-xs">ROBI</div>;
    case 'Banglalink':
      return <div className="w-full h-full bg-[#FF6600] text-white font-black text-xs flex items-center justify-center rounded-xl shadow-xs">BL</div>;
    case 'Teletalk':
      return <div className="w-full h-full bg-[#0085C7] text-white font-black text-xs flex items-center justify-center rounded-xl shadow-xs">TT</div>;
    case 'Airtel':
      return <div className="w-full h-full bg-[#EE1C25] text-white font-black text-[10px] flex items-center justify-center rounded-xl shadow-xs">AIR</div>;
    default:
      return <div className="w-full h-full bg-[#002A1A] text-white font-black text-xs flex items-center justify-center rounded-xl shadow-xs">{operator.slice(0, 2)}</div>;
  }
};

export const TelecomPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeCategory, setActiveCategory] = useState<TelecomCategory>('internet');
  const [activeTab, setActiveTab] = useState<'offers' | 'history'>('offers');
  
  const [offers, setOffers] = useState<TelecomOffer[]>(getTelecomOffers());
  const [paymentMethods] = useState<TelecomPaymentMethod[]>(getTelecomPaymentMethods());
  const [orders, setOrders] = useState<TelecomOrder[]>(getTelecomOrders());

  // Flow State (Full Page Steps, NO Popups/Modals)
  const [selectedOffer, setSelectedOffer] = useState<TelecomOffer | null>(null);
  const [step, setStep] = useState<'list' | 'details' | 'number' | 'summary' | 'payment' | 'success'>('list');
  
  // Form State
  const [targetNumber, setTargetNumber] = useState('');
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<TelecomPaymentMethod | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [submittedOrder, setSubmittedOrder] = useState<TelecomOrder | null>(null);

  // Real-time sync with Firestore for offers and orders
  useEffect(() => {
    const qOffers = query(collection(db, "telecom_offers"), orderBy("createdAt", "desc"));
    const unsubOffers = onSnapshot(qOffers, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TelecomOffer[];
      if (data.length > 0) {
        setOffers(data);
      }
    }, (error) => {
      console.warn("Telecom offers fetch notice:", error);
    });

    const qOrders = query(collection(db, "telecom_orders"), orderBy("createdAt", "desc"));
    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TelecomOrder[];
      if (data.length > 0) {
        setOrders(data);
      }
    }, (error) => {
      console.warn("Telecom orders fetch notice:", error);
    });

    return () => {
      unsubOffers();
      unsubOrders();
    };
  }, []);

  const filteredOffers = offers.filter(o => o.isActive && o.category === activeCategory);
  const userOrders = orders.filter(o => user && o.userId === user.id);

  const handleBuyClick = (offer: TelecomOffer) => {
    setSelectedOffer(offer);
    setHasReadTerms(false);
    setStep('details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedToNumber = () => {
    if (!hasReadTerms) {
      alert("দয়া করে অফারের শর্তাবলী পড়ার পর বক্সে টিক দিন।");
      return;
    }
    setStep('number');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedToSummary = () => {
    if (!targetNumber || targetNumber.length < 11) {
      alert("সঠিক ১১ ডিজিটের মোবাইল নম্বর লিখুন।");
      return;
    }
    setStep('summary');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedToPayment = () => {
    const activeMethods = paymentMethods.filter(m => m.isActive);
    if (activeMethods.length > 0 && !selectedMethod) {
      setSelectedMethod(activeMethods[0]);
    }
    setStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOffer || !selectedMethod) return;
    if (!transactionId.trim()) {
      alert("দয়া করে আপনার পেমেন্টের TrxID (Transaction ID) লিখুন।");
      return;
    }

    const newOrder: TelecomOrder = {
      id: 'TEL-' + Math.floor(100000 + Math.random() * 900000),
      userId: user ? user.id : 'guest_' + Date.now(),
      userName: user ? (user.name || user.displayName || 'গ্রাহক') : 'অতিথি গ্রাহক',
      userPhone: user?.phone || targetNumber,
      offerId: selectedOffer.id,
      operator: selectedOffer.operator,
      category: selectedOffer.category,
      offerName: selectedOffer.name,
      price: selectedOffer.price,
      targetNumber,
      paymentMethod: selectedMethod.methodName,
      paymentNumber: selectedMethod.accountNumber,
      transactionId: transactionId.trim(),
      screenshotUrl: screenshotUrl.trim() || undefined,
      status: 'Pending',
      createdAt: Date.now()
    };

    try {
      await addDoc(collection(db, "telecom_orders"), newOrder);
    } catch (err) {
      console.warn("Firestore order sync fallback:", err);
    }

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    saveTelecomOrders(updatedOrders);
    setSubmittedOrder(newOrder);
    setStep('success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetFlow = () => {
    setSelectedOffer(null);
    setTargetNumber('');
    setHasReadTerms(false);
    setSelectedMethod(null);
    setTransactionId('');
    setScreenshotUrl('');
    setSubmittedOrder(null);
    setStep('list');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f1f3f4] text-black pb-24 font-sans select-none">
      <SEO title="টেলিকম সার্ভিস - ইন্টারনেট ও মিনিট প্যাক" description="সকল অপারেটরের ইন্টারনেট, মিনিট, বান্ডেল এবং SMS অফার এখন এক জায়গায়।" />

      {/* Top Header */}
      <header className="bg-[#002A1A] text-white px-4 py-3.5 sticky top-0 z-40 shadow-md">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                if (step === 'list') navigate('/');
                else if (step === 'details') setStep('list');
                else if (step === 'number') setStep('details');
                else if (step === 'summary') setStep('number');
                else if (step === 'payment') setStep('summary');
                else resetFlow();
              }} 
              className="p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-[17px] font-black tracking-tight">
                {step === 'list' && (activeTab === 'offers' ? 'টেলিকম সার্ভিস' : 'অর্ডার হিস্ট্রি')}
                {step === 'details' && 'অফারের বিস্তারিত বিবরণ'}
                {step === 'number' && 'নম্বর প্রদান করুন'}
                {step === 'summary' && 'অর্ডার সামারি'}
                {step === 'payment' && 'ম্যানুয়াল পেমেন্ট'}
                {step === 'success' && 'অর্ডার সফল'}
              </h1>
              <p className="text-[10px] text-emerald-200">
                {step === 'list' ? 'সকল অপারেটরের সাশ্রয়ী অফার' : 'ধাপভিত্তিক পূর্ণাঙ্গ স্ক্রিন'}
              </p>
            </div>
          </div>
          {step === 'list' && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setActiveTab(activeTab === 'offers' ? 'history' : 'offers')}
                className="bg-white/15 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-white/20 active:scale-95 transition-all"
              >
                <History className="w-4 h-4 text-[#ffb703]" />
                <span>{activeTab === 'offers' ? 'আমার অর্ডারসমূহ' : 'অফার লিস্ট'}</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4">
        {/* ================= STEP 1: OFFER LIST / HISTORY ================= */}
        {step === 'list' && activeTab === 'offers' && (
          <>
            <div className="bg-gradient-to-r from-[#002A1A] to-[#044a2f] rounded-2xl p-4 text-white shadow-md mb-4 flex items-center justify-between">
              <div className="space-y-1">
                <span className="bg-[#ffb703] text-black text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">ম্যানুয়াল টেলিকম</span>
                <h2 className="text-[16px] font-black leading-tight">ইন্টারনেট ও মিনিট প্যাক কিনুন</h2>
                <p className="text-[11px] text-emerald-100">বিকাশ/নগদে পেমেন্ট করে সহজেই অর্ডার করুন।</p>
              </div>
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/20">
                <Wifi className="w-6 h-6 text-[#ffb703]" />
              </div>
            </div>

            {/* Category Selector */}
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-1.5 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
                <button
                  onClick={() => setActiveCategory('internet')}
                  className={`py-2.5 px-1 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${
                    activeCategory === 'internet' 
                      ? 'bg-[#002A1A] text-white shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Wifi className="w-4 h-4" />
                  <span>ইন্টারনেট</span>
                </button>
                <button
                  onClick={() => setActiveCategory('minute')}
                  className={`py-2.5 px-1 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${
                    activeCategory === 'minute' 
                      ? 'bg-[#002A1A] text-white shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>মিনিট</span>
                </button>
                <button
                  onClick={() => setActiveCategory('bundle')}
                  className={`py-2.5 px-1 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${
                    activeCategory === 'bundle' 
                      ? 'bg-[#002A1A] text-white shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Gift className="w-4 h-4" />
                  <span>বান্ডেল</span>
                </button>
                <button
                  onClick={() => setActiveCategory('sms')}
                  className={`py-2.5 px-1 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${
                    activeCategory === 'sms' 
                      ? 'bg-[#002A1A] text-white shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>SMS প্যাক</span>
                </button>
              </div>

              {/* Offer List */}
              <div className="space-y-3">
                {filteredOffers.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm my-8">
                    <p className="text-gray-500 font-bold text-sm">এই ক্যাটাগরিতে বর্তমানে কোনো অফার নেই।</p>
                  </div>
                ) : (
                  filteredOffers.map((offer) => (
                    <motion.div
                      key={offer.id}
                      whileTap={{ scale: 0.99 }}
                      className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center p-1 flex-shrink-0 shadow-xs overflow-hidden">
                          {renderOperatorBadge(offer.operator)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wide">
                              {offer.operator}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold">• {offer.targetSim}</span>
                          </div>
                          <h3 className="text-[15px] font-black text-gray-900 truncate">{offer.name}</h3>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500 font-bold">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-emerald-600" /> মেয়াদ: {offer.validity}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <span className="text-[16px] font-black text-[#002A1A]">৳ {offer.price}</span>
                        <button
                          onClick={() => handleBuyClick(offer)}
                          className="bg-[#002A1A] hover:bg-[#00381A] text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                        >
                          <span>কিনুন</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {/* History Tab */}
        {step === 'list' && activeTab === 'history' && (
          <div className="space-y-3">
            <h2 className="text-[15px] font-black text-gray-900 mb-2">আপনার টেলিকম অর্ডার হিস্ট্রি</h2>
            {userOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
                <p className="text-gray-500 font-bold text-sm">আপনার কোনো টেলিকম অর্ডার নেই।</p>
              </div>
            ) : (
              userOrders.map((ord) => (
                <div key={ord.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-2.5">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="text-xs font-black text-gray-600">{ord.id}</span>
                    <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                      ord.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                      ord.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {ord.status === 'Approved' ? '🟢 সফল (Approved)' : ord.status === 'Rejected' ? '🔴 বাতিল (Rejected)' : '🟡 অপেক্ষমান (Pending)'}
                    </span>
                  </div>
                  <div className="flex justify-between items-start text-xs">
                    <div>
                      <p className="font-black text-gray-900 text-sm">{ord.offerName}</p>
                      <p className="text-gray-500 font-medium mt-0.5">নম্বর: <span className="font-bold text-gray-800">{ord.targetNumber}</span> ({ord.operator})</p>
                      <p className="text-gray-500 font-medium">পেমেন্ট: {ord.paymentMethod} (TrxID: {ord.transactionId})</p>
                      {ord.rejectReason && (
                        <p className="text-red-600 font-bold mt-1">কারণ: {ord.rejectReason}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-base font-black text-[#002A1A]">৳ {ord.price}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{new Date(ord.createdAt).toLocaleDateString('bn-BD')}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ================= STEP 2: FULL PAGE OFFER DETAILS ================= */}
        {step === 'details' && selectedOffer && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 pb-12">
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4">
              {/* Operator & Price Header */}
              <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-xs p-1 flex items-center justify-center border border-emerald-100 overflow-hidden">
                    {renderOperatorBadge(selectedOffer.operator)}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded uppercase">{selectedOffer.operator}</span>
                    <h4 className="text-base font-black text-gray-900 mt-1">{selectedOffer.name}</h4>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-[#002A1A]">৳ {selectedOffer.price}</span>
                  <p className="text-xs text-gray-500 font-bold">মেয়াদ: {selectedOffer.validity}</p>
                </div>
              </div>

              {/* Offer Details Description */}
              <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="flex items-start gap-2.5">
                  <FileText className="w-5 h-5 text-[#002A1A] flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-black text-gray-700">অফার সম্পর্কে বিস্তারিত</h5>
                    <p className="text-sm font-medium text-gray-800 mt-0.5 leading-relaxed">{selectedOffer.description}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 pt-2 border-t border-gray-200/60">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-black text-gray-700">লোন ও শর্তাবলী (Eligibility)</h5>
                    <p className="text-sm font-bold text-gray-900 mt-0.5">{selectedOffer.loanNote || (selectedOffer.loanRule === 'allowed' ? 'লোন থাকলেও এই অফার নেওয়া যাবে।' : 'লোন থাকলে এই অফার প্রযোজ্য নয়।')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 pt-2 border-t border-gray-200/60">
                  <Tag className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-black text-gray-700">সিম ও পেমেন্ট ধরণ</h5>
                    <p className="text-xs font-semibold text-gray-700 mt-0.5">প্রযোজ্য সিম: {selectedOffer.targetSim} ({selectedOffer.prepaidPostpaid === 'prepaid' ? 'শুধুমাত্র প্রিপেইড' : selectedOffer.prepaidPostpaid === 'postpaid' ? 'পোস্টপেইড' : 'সকল সিম'})</p>
                  </div>
                </div>

                {selectedOffer.activationNote && (
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs font-semibold text-amber-900 mt-2">
                    💡 <strong>বিশেষ নির্দেশনা:</strong> {selectedOffer.activationNote}
                  </div>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer select-none bg-emerald-50/40 p-4 rounded-2xl border border-emerald-200/70">
                  <input 
                    type="checkbox" 
                    checked={hasReadTerms}
                    onChange={(e) => setHasReadTerms(e.target.checked)}
                    className="w-5 h-5 mt-0.5 accent-[#002A1A] rounded cursor-pointer"
                  />
                  <span className="text-xs font-black text-gray-900 leading-snug">
                    আমি উপরের সমস্ত শর্তাবলী, লোন সম্পর্কিত নিয়ম এবং নির্দেশাবলী মনোযোগ সহকারে পড়েছি এবং একমত পোষণ করছি।
                  </span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep('list')}
                className="w-1/3 py-4 rounded-2xl border border-gray-200 font-bold text-gray-700 text-sm bg-white hover:bg-gray-50 shadow-sm"
              >
                বাতিল
              </button>
              <button
                onClick={handleProceedToNumber}
                disabled={!hasReadTerms}
                className="w-2/3 py-4 rounded-2xl bg-[#002A1A] text-white font-black text-sm shadow-md hover:bg-[#00381A] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span>এখনই কিনুন</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ================= STEP 3: FULL PAGE MOBILE NUMBER INPUT ================= */}
        {step === 'number' && selectedOffer && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 pb-12">
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-800">{selectedOffer.operator}</span>
                  <h4 className="text-sm font-black text-gray-900">{selectedOffer.name}</h4>
                </div>
                <span className="text-base font-black text-[#002A1A]">৳ {selectedOffer.price}</span>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-700 mb-2">কোন নম্বরে অফারটি নিতে চান?</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <Smartphone className="w-5 h-5 text-[#002A1A]" />
                  </div>
                  <input 
                    type="tel" 
                    value={targetNumber}
                    onChange={(e) => setTargetNumber(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    maxLength={11}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-[#002A1A] text-lg font-black tracking-wider outline-none bg-gray-50"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-gray-500 font-bold mt-2 px-1">⚠️ নম্বরটি সঠিক কিনা পুনরায় যাচাই করুন। ভুল নম্বরে অফার গেলে কর্তৃপক্ষ দায়ী নয়।</p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep('details')} className="w-1/3 py-4 rounded-2xl border border-gray-200 font-bold text-gray-700 bg-white shadow-sm">
                পেছনে
              </button>
              <button 
                onClick={handleProceedToSummary}
                disabled={targetNumber.length < 11}
                className="w-2/3 py-4 rounded-2xl bg-[#002A1A] text-white font-black shadow-md hover:bg-[#00381A] disabled:opacity-50"
              >
                পরবর্তী ধাপ
              </button>
            </div>
          </motion.div>
        )}

        {/* ================= STEP 4: FULL PAGE ORDER SUMMARY ================= */}
        {step === 'summary' && selectedOffer && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 pb-12">
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4">
              <h3 className="text-base font-black text-gray-900 border-b border-gray-100 pb-3">অর্ডার বিবরণী যাচাই করুন</h3>
              
              <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100 space-y-3">
                <div className="flex justify-between text-xs border-b border-emerald-100/60 pb-2">
                  <span className="text-gray-500 font-bold">অপারেটর:</span>
                  <span className="font-black text-[#002A1A]">{selectedOffer.operator}</span>
                </div>
                <div className="flex justify-between text-xs border-b border-emerald-100/60 pb-2">
                  <span className="text-gray-500 font-bold">অফারের নাম:</span>
                  <span className="font-black text-gray-900">{selectedOffer.name}</span>
                </div>
                <div className="flex justify-between text-xs border-b border-emerald-100/60 pb-2">
                  <span className="text-gray-500 font-bold">মেয়াদ:</span>
                  <span className="font-black text-gray-900">{selectedOffer.validity}</span>
                </div>
                <div className="flex justify-between text-xs border-b border-emerald-100/60 pb-2">
                  <span className="text-gray-500 font-bold">মোবাইল নম্বর:</span>
                  <span className="font-black text-emerald-800 text-sm">{targetNumber}</span>
                </div>
                <div className="flex justify-between text-sm pt-1">
                  <span className="font-bold text-gray-700">মোট মূল্য:</span>
                  <span className="text-lg font-black text-[#002A1A]">৳ {selectedOffer.price}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep('number')} className="w-1/3 py-4 rounded-2xl border border-gray-200 font-bold text-gray-700 bg-white shadow-sm">
                পেছনে
              </button>
              <button 
                onClick={handleProceedToPayment}
                className="w-2/3 py-4 rounded-2xl bg-[#002A1A] text-white font-black shadow-md hover:bg-[#00381A]"
              >
                পেমেন্ট পদ্ধতি নির্বাচন করুন
              </button>
            </div>
          </motion.div>
        )}

        {/* ================= STEP 5: FULL PAGE MANUAL PAYMENT ================= */}
        {step === 'payment' && selectedOffer && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 pb-12">
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4">
              <form onSubmit={handleSubmitOrder} id="payment-form" className="space-y-4">
                {/* Method selector */}
                <div>
                  <label className="block text-xs font-black text-gray-700 mb-2">পেমেন্ট মাধ্যম নির্বাচন করুন:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {paymentMethods.filter(m => m.isActive).map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedMethod(m)}
                        className={`py-3 px-2 rounded-2xl border-2 text-xs font-black transition-all ${
                          selectedMethod?.id === m.id
                            ? 'border-[#002A1A] bg-emerald-50/70 text-[#002A1A] shadow-xs'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {m.methodName}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedMethod && (
                  <div className="bg-[#002A1A] text-white p-4 rounded-2xl shadow-md space-y-2">
                    <p className="text-xs text-emerald-200 font-bold">পেমেন্ট করার নম্বর ({selectedMethod.methodName}):</p>
                    <div className="bg-white/10 px-3.5 py-2.5 rounded-xl border border-white/20 flex items-center justify-between">
                      <span className="text-base font-black tracking-wider text-[#ffb703]">{selectedMethod.accountNumber}</span>
                    </div>
                    <p className="text-[11px] text-emerald-100 leading-relaxed pt-1">{selectedMethod.instruction}</p>
                    <div className="pt-2 border-t border-white/10 flex justify-between text-xs font-bold">
                      <span>প্রদেয় পরিমাণ:</span>
                      <span className="text-[#ffb703] font-black text-sm">৳ {selectedOffer.price}</span>
                    </div>
                  </div>
                )}

                {/* TrxID Input */}
                <div>
                  <label className="block text-xs font-black text-gray-700 mb-1.5">ট্রানজাকশন আইডি (TrxID) *</label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="যেমন: 9N7A6BC8D"
                    className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-200 focus:border-[#002A1A] font-bold text-sm outline-none uppercase bg-gray-50"
                    required
                  />
                  <p className="text-[10px] text-gray-400 font-bold mt-1">পেমেন্ট সফল করার পর যে ট্রানজাকশন আইডি পেয়েছেন তা এখানে লিখুন।</p>
                </div>

                {/* Screenshot (Optional) */}
                <div>
                  <label className="block text-xs font-black text-gray-700 mb-1.5">পেমেন্ট স্ক্রিনশট লিংক (ঐচ্ছিক)</label>
                  <input
                    type="url"
                    value={screenshotUrl}
                    onChange={(e) => setScreenshotUrl(e.target.value)}
                    placeholder="https://i.ibb.co/... (যদি থাকে)"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-medium outline-none bg-gray-50"
                  />
                </div>
              </form>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setStep('summary')} className="w-1/3 py-4 rounded-2xl border border-gray-200 font-bold text-gray-700 bg-white shadow-sm">
                পেছনে
              </button>
              <button 
                type="submit"
                form="payment-form"
                className="w-2/3 py-4 rounded-2xl bg-[#002A1A] hover:bg-[#00381A] text-white font-black shadow-lg flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>অর্ডার জমা দিন</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* ================= STEP 6: FULL PAGE SUCCESS ================= */}
        {step === 'success' && submittedOrder && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4 pb-12 pt-4 text-center">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-[#002A1A]">অর্ডার সফলভাবে জমা হয়েছে!</h3>
              <p className="text-xs font-bold text-gray-600 leading-relaxed">
                আপনার অর্ডারটি সফলভাবে জমা হয়েছে। পেমেন্ট যাচাই করার পর Admin আপনার অর্ডার Approve করবেন।
              </p>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-left space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-gray-500 font-bold">অর্ডার আইডি:</span><span className="font-black text-gray-900">{submittedOrder.id}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 font-bold">অফার:</span><span className="font-black text-gray-900">{submittedOrder.offerName}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 font-bold">মোবাইল নম্বর:</span><span className="font-black text-emerald-800">{submittedOrder.targetNumber}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 font-bold">TrxID:</span><span className="font-black text-gray-900">{submittedOrder.transactionId}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 font-bold">স্ট্যাটাস:</span><span className="font-black text-amber-600">🟡 Pending (অপেক্ষমান)</span></div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  resetFlow();
                  setActiveTab('history');
                }}
                className="w-full py-4 bg-[#002A1A] hover:bg-[#00381A] text-white font-black rounded-2xl shadow-md"
              >
                অর্ডার হিস্ট্রি দেখুন
              </button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};
