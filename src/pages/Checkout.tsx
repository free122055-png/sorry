import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, MapPin, CreditCard, Banknote, ChevronRight, CheckCircle2, User, Phone, Building2, Tag, X, AlertCircle } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useVoiceGuidance } from "../context/VoiceGuidanceContext";
import { db } from "../lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { getActivePromoCodes, validatePromoCode, PromoCodeItem } from "../lib/promoService";

const paymentMethods = [
  { id: "cod", name: "Cash on Delivery (ক্যাশ অন ডেলিভারি)", icon: Banknote, description: "পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন" },
  { id: "bkash", name: "bKash (বিকাশ)", icon: CreditCard, description: "বিকাশ ওয়ালেট অথবা মার্চেন্ট পেমেন্ট" },
  { id: "nagad", name: "Nagad (নগদ)", icon: CreditCard, description: "নগদ অ্যাকাউন্ট পেমেন্ট" },
];

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isFood = location.pathname.startsWith("/food/");
  const { items, subtotal, clearCart } = useCart();
  const { user, profile, requireAuth } = useAuth();
  const { speak } = useVoiceGuidance();
  
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState("");

  // Promo Code State
  const passedPromo = (location.state as any)?.appliedPromo;
  const passedDiscount = Number((location.state as any)?.discount) || 0;
  const passedCode = (location.state as any)?.promoCode || "";

  const [appliedPromo, setAppliedPromo] = useState<PromoCodeItem | null>(passedPromo || null);
  const [promoCodeInput, setPromoCodeInput] = useState(passedCode || "");
  const [discountAmount, setDiscountAmount] = useState(passedDiscount);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  // Initialize from sessionStorage if state was empty
  useEffect(() => {
    if (!appliedPromo && discountAmount === 0 && typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("active_applied_promo");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.discount) {
            setAppliedPromo(parsed.promo);
            setDiscountAmount(parsed.discount);
            setPromoCodeInput(parsed.code || "");
            setPromoSuccess(`প্রমো কোড "${parsed.code}" সক্রিয় রয়েছে।`);
          }
        }
      } catch (e) {}
    }
  }, [appliedPromo, discountAmount]);

  const handleApplyPromo = async () => {
    setPromoError("");
    setPromoSuccess("");
    const code = promoCodeInput.trim().toUpperCase();

    if (!code) {
      setPromoError("অনুগ্রহ করে একটি প্রমো কোড লিখুন।");
      return;
    }

    setIsApplyingPromo(true);

    try {
      const promoList = await getActivePromoCodes();
      const validation = validatePromoCode(code, promoList, {
        subtotal,
        items
      });

      if (!validation.isValid) {
        setAppliedPromo(null);
        setDiscountAmount(0);
        setPromoError(validation.error || "অবৈধ বা মেয়াদোত্তীর্ণ প্রমো কোড।");
        return;
      }

      setAppliedPromo(validation.promo || null);
      setDiscountAmount(validation.discountAmount);
      setPromoSuccess(`🎉 '${validation.promo?.code}' প্রমো কোড প্রয়োগ করা হয়েছে! (${validation.discountText})`);

      try {
        sessionStorage.setItem("active_applied_promo", JSON.stringify({
          promo: validation.promo,
          discount: validation.discountAmount,
          code: validation.promo?.code
        }));
      } catch (e) {}
    } catch (err) {
      console.error("Promo apply error:", err);
      setPromoError("প্রমো কোড যাচাই করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setDiscountAmount(0);
    setPromoCodeInput("");
    setPromoError("");
    setPromoSuccess("");
    try {
      sessionStorage.removeItem("active_applied_promo");
    } catch (e) {}
  };

  // Announce success when order is placed
  useEffect(() => {
    if (isSuccess) {
      speak("অভিনন্দন! আপনার অর্ডার সফলভাবে গ্রহণ করা হয়েছে।", { key: "order-success", priority: "high", force: true, mood: "SUCCESS" });
    }
  }, [isSuccess, speak]);

  // Address fields
  const [district, setDistrict] = useState("");
  const [area, setArea] = useState("");
  const [fullAddress, setFullAddress] = useState(profile?.address || "");

  const handlePlaceOrder = async () => {
    if (!user) {
      requireAuth(() => {
        handlePlaceOrder();
      }, "অর্ডার সম্পন্ন করতে অনুগ্রহ করে আগে লগইন করুন।");
      return;
    }

    if (!district || !area || !fullAddress) {
      alert("অনুগ্রহ করে জেলা, এলাকা এবং পূর্ণ ঠিকানা প্রদান করুন।");
      return;
    }

    setIsSubmitting(true);
    try {
      const deliveryCharge = 60;
      const total = Math.max(0, subtotal + deliveryCharge - discountAmount);
      const orderNumber = `AMB-${Date.now().toString().slice(-6)}`;
      
      const orderData: any = {
        orderNumber,
        orderId: orderNumber,
        userId: user.uid,
        customerName: profile?.displayName || user.displayName || "Customer",
        customerPhone: profile?.phoneNumber || "",
        items,
        subtotal,
        deliveryCharge,
        discount: discountAmount,
        appliedPromoCode: appliedPromo?.code || (discountAmount > 0 ? promoCodeInput : null),
        total,
        grandTotal: total,
        status: 'pending',
        codAmount: paymentMethod === 'cod' ? total : 0,
        shippingAddress: {
          id: 'temp',
          userId: user.uid,
          name: profile?.displayName || user.displayName || "Customer",
          phone: profile?.phoneNumber || "",
          district,
          area,
          fullAddress,
          isDefault: false
        },
        paymentMethod: paymentMethod as any,
        paymentStatus: 'pending',
        internalStatus: 'placed',
        deliveryInfo: {
          provider: 'none',
          status: 'not_created'
        },
        statusHistory: [
          { status: 'pending', updatedAt: Date.now(), note: 'অর্ডার প্লেস করা হয়েছে' }
        ],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const docRef = await addDoc(collection(db, "food_orders"), orderData);
      try {
        localStorage.setItem("last_placed_order_id", docRef.id);
        sessionStorage.removeItem("active_applied_promo");
      } catch (e) {}
      setOrderId(orderNumber);
      setIsSuccess(true);
      clearCart();
    } catch (error) {
      console.error("Order error:", error);
      alert("অর্ডার সম্পন্ন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={`flex flex-col items-center justify-center py-20 px-4 text-center space-y-6 ${isFood ? "-mx-4 -mt-4 bg-[#fcfdfc] min-h-screen" : ""}`}>
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-[#004b23]" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-800">অর্ডার সফলভাবে সম্পন্ন হয়েছে!</h2>
          <p className="text-gray-500 max-w-xs mx-auto">আপনার অর্ডারটি গ্রহণ করা হয়েছে এবং প্রক্রিয়াকরণ চলছে। অর্ডার আইডি: #{orderId}</p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button 
            onClick={() => navigate(isFood ? "/food/orders" : "/orders")}
            className="bg-[#004b23] text-white font-bold py-4 px-12 rounded-2xl shadow-lg shadow-[#004b23]/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            অর্ডার ট্র্যাক করুন <ChevronRight className="w-5 h-5" />
          </button>
          <button 
            onClick={() => navigate(isFood ? "/category/cat1" : "/")}
            className="text-[#004b23] font-bold py-2 px-12"
          >
            কেনাকাটা চালিয়ে যান
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 pb-24 ${isFood ? "-mx-4 -mt-4 bg-[#fcfdfc] min-h-screen" : ""}`}>
      {/* Header */}
      <div className={isFood ? "bg-[#004b23] px-5 pt-10 pb-6 rounded-b-[40px] shadow-lg sticky top-0 z-50 mb-6 flex items-center gap-3" : "flex items-center justify-between"}>
        <button onClick={() => navigate(-1)} className={isFood ? "w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/20" : "p-2 bg-white rounded-xl shadow-sm border border-gray-100"}>
          <ArrowLeft className={`w-5 h-5 ${isFood ? "text-white" : "text-gray-600"}`} />
        </button>
        <h1 className={`text-xl font-bold ${isFood ? "text-white" : "text-gray-800"}`}>চেকআউট (Checkout)</h1>
        {!isFood && <div className="w-10"></div>}
      </div>

      <div className={isFood ? "px-4 space-y-6" : "space-y-6"}>
        {/* Shipping Address */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#004b23]" /> ডেলিভারি ঠিকানা
          </h3>
          <div className="bg-white p-6 rounded-3xl border-2 border-[#004b23] shadow-sm space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">জেলা (District)</label>
                <input 
                  type="text" 
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="উদা: Dhaka"
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#004b23]/20"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">এলাকা (Area)</label>
                <input 
                  type="text" 
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="উদা: Mirpur"
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#004b23]/20"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">পূর্ণ ঠিকানা (Full Address)</label>
              <textarea 
                value={fullAddress}
                onChange={(e) => setFullAddress(e.target.value)}
                placeholder="হাউজ, রোড, ব্লক ইত্যাদি"
                rows={2}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#004b23]/20 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#004b23]" /> পেমেন্ট পদ্ধতি
          </h3>
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-3xl border-2 transition-all text-left ${
                  paymentMethod === method.id 
                    ? 'border-[#004b23] bg-[#004b23]/5' 
                    : 'border-gray-100 bg-white'
                }`}
              >
                <div className={`p-2 rounded-xl ${paymentMethod === method.id ? 'bg-[#004b23] text-white' : 'bg-gray-100 text-gray-400'}`}>
                  <method.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className={`font-bold text-sm ${paymentMethod === method.id ? 'text-[#004b23]' : 'text-gray-800'}`}>{method.name}</p>
                  <p className="text-[10px] text-gray-500">{method.description}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === method.id ? 'border-[#004b23]' : 'border-gray-300'
                }`}>
                  {paymentMethod === method.id && <div className="w-2.5 h-2.5 bg-[#004b23] rounded-full" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Promo Code Input */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-5 h-5 text-[#004b23]" />
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">প্রমো কোড (Promo Code)</h3>
          </div>
          
          {!appliedPromo ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                  placeholder="কোড লিখুন (যেমন: SAVE10)"
                  className="flex-1 px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#004b23]/20 uppercase font-bold"
                />
                <button 
                  onClick={handleApplyPromo}
                  disabled={isApplyingPromo || !promoCodeInput.trim()}
                  className="bg-[#004b23] text-white px-6 py-3 rounded-2xl text-sm font-bold active:scale-95 transition-transform disabled:opacity-50"
                >
                  {isApplyingPromo ? "..." : "প্রয়োগ"}
                </button>
              </div>
              {promoError && <p className="text-red-500 text-[10px] font-bold ml-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {promoError}</p>}
            </div>
          ) : (
            <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-green-800">প্রমো কোড: {appliedPromo.code}</p>
                  <p className="text-[10px] text-green-600">৳{discountAmount} ছাড় প্রযোজ্য হয়েছে</p>
                </div>
              </div>
              <button 
                onClick={handleRemovePromo}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          {promoSuccess && !promoError && <p className="text-green-600 text-[10px] font-bold ml-1">{promoSuccess}</p>}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">পণ্যের মোট মূল্য</span>
            <span className="font-bold text-gray-800">৳{subtotal}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">ডেলিভারি চার্জ</span>
            <span className="font-bold text-gray-800">৳60</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-sm text-green-600 font-bold">
              <span>ছাড় (Discount)</span>
              <span>- ৳{discountAmount}</span>
            </div>
          )}
          <div className="border-t pt-3 flex justify-between items-center">
            <span className="text-lg font-bold text-gray-800">সর্বমোট প্রদেয়</span>
            <span className="text-2xl font-black text-[#004b23]">৳{Math.max(0, subtotal + 60 - discountAmount)}</span>
          </div>
        </div>

        {/* Confirm Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 md:static md:border-none md:bg-transparent md:p-0">
          <button 
            onClick={handlePlaceOrder}
            disabled={isSubmitting}
            className="w-full bg-[#004b23] hover:bg-[#00381a] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#004b23]/20 flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? "অর্ডার প্রসেস হচ্ছে..." : "অর্ডার নিশ্চিত করুন (Confirm Order)"} <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
