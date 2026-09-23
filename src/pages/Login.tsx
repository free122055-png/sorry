import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  User, 
  ShieldCheck,
  Truck,
  Heart,
  ChevronLeft,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  X
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { otpService } from "../lib/otpService";
import { OtpVerificationView } from "../components/OtpVerificationView";
import { parseBangladeshiPhone, getBanglaAuthErrorMessage } from "../lib/phoneUtils";
import { ForgotPasswordModal } from "../components/ForgotPasswordModal";

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithEmail, registerWithEmail, loginWithGoogle } = useAuth();

  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get("redirect") || "/account";
  const initialViewParam = searchParams.get("view");
  
  const [view, setView] = useState<'login' | 'register' | 'otp'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState<{ message: string; errorType: string } | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(initialViewParam === 'forgot');

  // Form States
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorInfo(null);

    const phoneParsed = parseBangladeshiPhone(phoneNumber);
    if (!phoneParsed.isValid) {
      setErrorInfo({
        message: "সঠিক ১১ সংখ্যার বাংলাদেশি মোবাইল নম্বর লিখুন (যেমন: 017XXXXXXXX বা 016XXXXXXXX)।",
        errorType: "validation"
      });
      return;
    }

    if (!password) {
      setErrorInfo({
        message: "অনুগ্রহ করে আপনার অ্যাকাউন্টের পাসওয়ার্ড লিখুন।",
        errorType: "validation"
      });
      return;
    }

    setLoading(true);

    try {
      const loginPromise = loginWithEmail(phoneParsed.email, password);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("auth/network-timeout")), 10000)
      );
      await Promise.race([loginPromise, timeoutPromise]);
      navigate(redirectUrl, { replace: true });
    } catch (err: any) {
      console.warn("Login attempt notice:", err);
      const mapped = getBanglaAuthErrorMessage(err, 'login', phoneParsed.formatted);
      setErrorInfo(mapped);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setErrorInfo(null);
      await loginWithGoogle();
      navigate(redirectUrl, { replace: true });
    } catch (err: any) {
      console.warn("Google login error:", err);
      setErrorInfo({
        message: "গুগল সাইন-ইন সম্পন্ন করা যায়নি। প্লে কনসোল বা প্রোডাকশন বিল্ডে গুগল সাইন-ইন নির্বিঘ্নে কাজ করার জন্য Firebase Console > Authentication > Sign-in method > Google-এ আপনার প্রজেক্টের SHA-1 সার্টিফিকেট ফিঙ্গারপ্রিন্ট যুক্ত করা আছে কিনা তা নিশ্চিত করুন।",
        errorType: "general"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorInfo(null);

    const phoneParsed = parseBangladeshiPhone(phoneNumber);
    if (!phoneParsed.isValid) {
      setErrorInfo({
        message: "সঠিক ১১ সংখ্যার বাংলাদেশি মোবাইল নম্বর লিখুন (যেমন: 017XXXXXXXX বা 016XXXXXXXX)।",
        errorType: "validation"
      });
      return;
    }

    if (password.length < 6) {
      setErrorInfo({
        message: "পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।",
        errorType: "validation"
      });
      return;
    }

    if (password !== confirmPassword) {
      setErrorInfo({
        message: "উভয় পাসওয়ার্ড একই হতে হবে।",
        errorType: "validation"
      });
      return;
    }

    setLoading(true);

    try {
      // 1. Check if Admin has enabled OTP Verification (Direct Firestore read)
      const otpStatus = await otpService.getStatus();

      if (otpStatus.otpVerificationEnabled) {
        if (!otpStatus.masterEnabled) {
          setErrorInfo({
            message: "OTP ভেরিফিকেশন সেবাটি সাময়িকভাবে বন্ধ আছে। দয়া করে কিছুক্ষণ পর চেষ্টা করুন।",
            errorType: "general"
          });
          setLoading(false);
          return;
        }

        const sendResult = await otpService.sendOtp(phoneParsed.formatted);
        if (!sendResult.success) {
          setErrorInfo({
            message: sendResult.error || "OTP পাঠাতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।",
            errorType: "general"
          });
          setLoading(false);
          return;
        }

        setView('otp');
        setLoading(false);
        return;
      }

      // 2. If OTP is OFF: register directly with 12s timeout guard
      const regPromise = registerWithEmail({
        name: name.trim() || "সম্মানিত গ্রাহক",
        email: phoneParsed.email,
        phone: phoneParsed.formatted,
        password,
        address: "",
        photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name || "user"}`,
        isPhoneVerified: false,
        otpState: "OTP_VERIFIED"
      });
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("auth/network-timeout")), 12000)
      );
      await Promise.race([regPromise, timeoutPromise]);
      navigate(redirectUrl, { replace: true });
    } catch (err: any) {
      console.warn("Register attempt notice:", err);
      const mapped = getBanglaAuthErrorMessage(err, 'register', phoneParsed.formatted);
      setErrorInfo(mapped);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerified = async (verificationToken: string) => {
    setLoading(true);
    setErrorInfo(null);

    const phoneParsed = parseBangladeshiPhone(phoneNumber);

    try {
      await registerWithEmail({
        name: name.trim() || "সম্মানিত গ্রাহক",
        email: phoneParsed.email,
        phone: phoneParsed.formatted,
        password,
        address: "",
        photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name || "user"}`,
        isPhoneVerified: true,
        otpState: "OTP_VERIFIED",
        phoneVerifiedAt: Date.now(),
        otpVerificationToken: verificationToken
      });
      navigate(redirectUrl, { replace: true });
    } catch (err: any) {
      console.warn("OTP Verified registration notice:", err);
      const mapped = getBanglaAuthErrorMessage(err, 'register', phoneParsed.formatted);
      setErrorInfo(mapped);
      setView('register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white relative overflow-x-hidden font-['Plus_Jakarta_Sans'] flex flex-col justify-center py-8 px-5">
      <div className="relative z-10 max-w-md mx-auto w-full flex flex-col">
        {/* Back Button */}
        <div className="mb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-gray-100 hover:bg-gray-200 text-[#002A1A] rounded-full flex items-center justify-center transition-colors shadow-sm cursor-pointer"
            title="পেছনে যান"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>

        {/* Exact Logo & Header from Reference Image */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-20 h-20 bg-[#002A1A] rounded-[24px] flex items-center justify-center shadow-lg mb-4 text-white">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
              <path d="M3 6h18"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </div>
          <p className="text-[15px] font-bold text-[#002A1A] mb-3">বিশ্বস্ত কেনাকাটা, সহজ অভিজ্ঞতা</p>
          <div className="flex items-center justify-center gap-3 w-48">
            <div className="h-[1px] flex-1 bg-emerald-800/30" />
            <span className="text-emerald-700 text-sm">🌿</span>
            <div className="h-[1px] flex-1 bg-emerald-800/30" />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {view === 'login' ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col"
            >
              <div className="text-center mb-6">
                <h1 className="text-[28px] font-black text-[#002A1A] mb-1">লগইন করুন</h1>
                <p className="text-[13px] font-bold text-gray-500 leading-relaxed">
                  আপনার অ্যাকাউন্টে প্রবেশ করুন<br />
                  এবং কেনাকাটা চালিয়ে যান
                </p>
              </div>

                {successInfo && (
                  <div className="mb-6 p-4 rounded-2xl text-[13px] border bg-emerald-50 text-emerald-900 border-emerald-200 flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 mt-0.5" />
                    <p className="font-semibold leading-relaxed">{successInfo}</p>
                  </div>
                )}

                {errorInfo && (
                  <div className={`mb-6 p-4 rounded-2xl text-[13px] border flex flex-col gap-2.5 ${
                    errorInfo.errorType === 'not-found' 
                      ? 'bg-amber-50 text-amber-900 border-amber-200' 
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <p className="font-semibold leading-relaxed">{errorInfo.message}</p>
                    </div>
                    {errorInfo.errorType === 'not-found' && (
                      <button
                        type="button"
                        onClick={() => {
                          setView('register');
                          setErrorInfo(null);
                        }}
                        className="w-full bg-[#002A1A] hover:bg-[#00381A] text-white py-2.5 px-4 rounded-xl font-bold text-xs shadow transition-all active:scale-98"
                      >
                        👉 নতুন অ্যাকাউন্ট তৈরি করতে এখানে চাপুন
                      </button>
                    )}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                  {/* Phone Input */}
                  <div>
                    <label className="block text-[13px] font-bold text-gray-500 mb-2 px-1">মোবাইল নম্বর</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm">
                        <Phone className="w-5 h-5 text-[#002A1A]" />
                      </div>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className="w-full bg-white border border-gray-200 focus:border-[#003322] focus:ring-4 focus:ring-green-500/5 rounded-[18px] py-4 pl-16 pr-6 text-[15px] font-bold text-gray-900 outline-none transition-all placeholder:text-gray-300 placeholder:font-medium"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <label className="block text-[13px] font-bold text-gray-500 mb-2 px-1">পাসওয়ার্ড</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm">
                        <Lock className="w-5 h-5 text-[#002A1A]" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="আপনার পাসওয়ার্ড লিখুন"
                        className="w-full bg-white border border-gray-200 focus:border-[#003322] focus:ring-4 focus:ring-green-500/5 rounded-[18px] py-4 pl-16 pr-14 text-[15px] font-bold text-gray-900 outline-none transition-all placeholder:text-gray-300 placeholder:font-medium"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 p-1 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <div className="text-right mt-2.5">
                      <button 
                        type="button" 
                        onClick={() => setShowForgotModal(true)}
                        className="text-[13px] font-bold text-[#003322] hover:underline cursor-pointer"
                      >
                        পাসওয়ার্ড ভুলে গেছেন?
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-3 bg-[#002A1A] hover:bg-[#00381A] text-white py-4.5 rounded-[20px] font-black text-[16px] flex items-center justify-center gap-3 shadow-lg active:scale-98 transition-all disabled:opacity-70"
                  >
                    {loading ? "লগইন হচ্ছে..." : "লগইন করুন"}
                    {!loading && <ArrowRight className="w-5 h-5" />}
                  </button>
                </form>

                <div className="my-5 flex items-center gap-4 px-2">
                  <div className="h-[1px] flex-1 bg-gray-200" />
                  <span className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em]">অথবা</span>
                  <div className="h-[1px] flex-1 bg-gray-200" />
                </div>

                {/* Google Sign-In Button matching reference image */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full py-4 bg-white border-2 border-gray-200 hover:border-[#002A1A] rounded-[18px] text-gray-800 font-black text-[15px] flex items-center justify-center gap-3 shadow-sm transition-all active:scale-98 disabled:opacity-70 mb-5"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.19v3.15C3.2 21.2 7.28 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.19C.43 8.1 0 9.8 0 12s.43 3.9 1.19 5.42l4.09-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.28 0 3.2 2.8 1.19 6.58l4.09 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span>Google দিয়ে লগইন করুন</span>
                </button>

                {/* Register Link matching reference image */}
                <div className="text-center pt-1 mb-4">
                  <button
                    type="button"
                    onClick={() => setView('register')}
                    className="text-[14px] font-bold text-[#002A1A] hover:underline inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>এখনও অ্যাকাউন্ট নেই?</span>
                    <span className="font-black">রেজিষ্ট্রেশন করুন</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
            </motion.div>
          ) : view === 'register' ? (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex-1 flex flex-col"
            >
              <div className="bg-white rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-6 sm:p-8 pb-8 relative border border-gray-100">
                <button 
                  onClick={() => setView('login')}
                  className="absolute left-6 top-6 w-11 h-11 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6 text-[#002A1A]" />
                </button>

                <h2 className="text-[22px] font-black text-[#002A1A] text-center mb-6 mt-3">নতুন অ্যাকাউন্ট তৈরি করুন</h2>

                {errorInfo && (
                  <div className={`mb-6 p-4 rounded-2xl text-[13px] border flex flex-col gap-2.5 ${
                    errorInfo.errorType === 'already-exists' 
                      ? 'bg-amber-50 text-amber-900 border-amber-200' 
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <p className="font-semibold leading-relaxed">{errorInfo.message}</p>
                    </div>
                    {errorInfo.errorType === 'already-exists' && (
                      <button
                        type="button"
                        onClick={() => {
                          setView('login');
                          setErrorInfo(null);
                        }}
                        className="w-full bg-[#002A1A] hover:bg-[#00381A] text-white py-2.5 px-4 rounded-xl font-bold text-xs shadow transition-all active:scale-98"
                      >
                        👉 সরাসরি লগইন করতে এখানে চাপুন
                      </button>
                    )}
                  </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                  {/* Name Input */}
                  <div>
                    <label className="block text-[13px] font-bold text-gray-500 mb-1.5 px-1">আপনার নাম</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm">
                        <User className="w-5 h-5 text-[#002A1A]" />
                      </div>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="পূর্ণ নাম লিখুন"
                        className="w-full bg-white border border-gray-200 focus:border-[#003322] rounded-[18px] py-4 pl-16 pr-6 text-[15px] font-bold text-gray-900 outline-none transition-all placeholder:text-gray-300"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone Input */}
                  <div>
                    <label className="block text-[13px] font-bold text-gray-500 mb-1.5 px-1">মোবাইল নম্বর</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm">
                        <Phone className="w-5 h-5 text-[#002A1A]" />
                      </div>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className="w-full bg-white border border-gray-200 focus:border-[#003322] rounded-[18px] py-4 pl-16 pr-6 text-[15px] font-bold text-gray-900 outline-none transition-all placeholder:text-gray-300"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <label className="block text-[13px] font-bold text-gray-500 mb-1.5 px-1">পাসওয়ার্ড</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm">
                        <Lock className="w-5 h-5 text-[#002A1A]" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="একটি শক্তিশালী পাসওয়ার্ড দিন"
                        className="w-full bg-white border border-gray-200 focus:border-[#003322] rounded-[18px] py-4 pl-16 pr-14 text-[15px] font-bold text-gray-900 outline-none transition-all placeholder:text-gray-300"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Input */}
                  <div>
                    <label className="block text-[13px] font-bold text-gray-500 mb-1.5 px-1">পাসওয়ার্ড নিশ্চিত করুন</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm">
                        <Lock className="w-5 h-5 text-[#002A1A]" />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="আবার পাসওয়ার্ড লিখুন"
                        className="w-full bg-white border border-gray-200 focus:border-[#003322] rounded-[18px] py-4 pl-16 pr-14 text-[15px] font-bold text-gray-900 outline-none transition-all placeholder:text-gray-300"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-4 bg-[#002A1A] hover:bg-[#00381A] text-white py-4.5 rounded-[20px] font-black text-[16px] flex items-center justify-center gap-3 shadow-lg active:scale-98 transition-all disabled:opacity-70"
                  >
                    {loading ? "তৈরি হচ্ছে..." : "অ্যাকাউন্ট তৈরি করুন"}
                    {!loading && <ArrowRight className="w-5 h-5" />}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-[12px] font-bold text-gray-400 leading-relaxed px-4">
                    অ্যাকাউন্ট তৈরি করে আপনি আমাদের <br />
                    <span className="text-[#002A1A] underline underline-offset-2">Terms & Conditions</span> এবং <span className="text-[#002A1A] underline underline-offset-2">Privacy Policy</span>-তে সম্মত হচ্ছেন।
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="otp"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex-1 flex flex-col"
            >
              <div className="bg-white rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-6 sm:p-8 pb-8 relative border border-gray-100">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#F4A300] rounded-full opacity-80" />
                <div className="mt-2">
                  <OtpVerificationView
                    phoneNumber={phoneNumber}
                    onVerified={handleOtpVerified}
                    onBack={() => setView('register')}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Features - Exact from Photo */}
        <div className="mt-8 py-4">
          <div className="flex items-center justify-center gap-6 mb-3">
            <div className="h-[1px] w-16 bg-white/20" />
            <div className="flex items-center gap-2 text-white/90 text-xs font-bold">
              <span>🕌</span>
              <span>বিশ্বাসে কেনাকাটা • নিরাপদ লেনদেন</span>
            </div>
            <div className="h-[1px] w-16 bg-white/20" />
          </div>
        </div>
      </div>

      {/* Forgot Password OTP Verification & Reset Modal */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        initialPhone={phoneNumber}
        onSuccessLogin={(phone) => {
          setPhoneNumber(phone);
          setPassword("");
          setSuccessInfo("আপনার অ্যাকাউন্টের পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে। নতুন পাসওয়ার্ড দিয়ে লগইন করুন।");
          setErrorInfo(null);
          setView('login');
        }}
      />
    </div>
  );
};
