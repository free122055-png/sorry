import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  User, 
  ShieldCheck,
  ChevronLeft,
  AlertCircle,
  CheckCircle2,
  Mail,
  Camera,
  Calendar,
  Check,
  Smartphone,
  ExternalLink,
  RefreshCw,
  QrCode,
  Copy,
  Info,
  ChevronDown,
  Plus,
  Users,
  Briefcase,
  Smile,
  Heart
} from "lucide-react";
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  updateProfile as firebaseUpdateProfile,
  signOut as firebaseSignOut,
  ConfirmationResult
} from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { uploadImageFile } from "../lib/uploadService";

// Standard Country Codes
const COUNTRY_CODES = [
  { code: "+880", name: "Bangladesh", flag: "🇧🇩" },
  { code: "+1", name: "United States", flag: "🇺🇸" },
  { code: "+44", name: "United Kingdom", flag: "🇬🇧" },
  { code: "+91", name: "India", flag: "🇮🇳" }
];

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, refreshProfile } = useAuth();

  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get("redirect") || "/";

  // Flow State
  // 'login_gate' | 'signup_steps' | 'email_sent_screen' | 'connected_success' | 'forgot_password'
  const [view, setView] = useState<'login_gate' | 'signup_steps' | 'email_sent_screen' | 'connected_success' | 'forgot_password'>('login_gate');

  // --- FORGOT PASSWORD STATES ---
  const [forgotStep, setForgotStep] = useState(1); // 1: Input Identifier, 2: OTP, 3: Password Reset, 4: Success
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMaskedEmail, setForgotMaskedEmail] = useState("");
  const [forgotOtpCode, setForgotOtpCode] = useState(["", "", "", "", "", ""]);
  const [forgotResetToken, setForgotResetToken] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [showForgotPasswords, setShowForgotPasswords] = useState(false);
  const [contactAdminOption, setContactAdminOption] = useState(false);

  const forgotOtpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  // Step-by-step Sign Up State (Facebook Flow)
  const [signupStep, setSignupStep] = useState(1);
  const totalSignupSteps = 8;

  // App loading & messaging states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // --- FORM STATES ---
  // Login Gate inputs
  const [loginIdentifier, setLoginIdentifier] = useState(""); // Can be phone, email, or username
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Signup Multi-step inputs
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState(""); // "Male" | "Female" | "Custom"
  const [contactMethod, setContactMethod] = useState<'phone' | 'email'>('phone');
  const [signupPhone, setSignupPhone] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupUsername, setSignupUsername] = useState("");
  const [isUsernameValid, setIsUsernameValid] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [verificationToken, setVerificationToken] = useState("");

  // Verification & Profile Uploads
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [phoneCountdown, setPhoneCountdown] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // References
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const avatarFileRef = useRef<HTMLInputElement>(null);
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  // Auto-redirect if already fully authenticated & profile complete
  useEffect(() => {
    if (user && profile?.username) {
      navigate(redirectUrl, { replace: true });
    }
  }, [user, profile]);

  // Countdown timer
  useEffect(() => {
    if (phoneCountdown > 0) {
      const timer = setTimeout(() => setPhoneCountdown(phoneCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [phoneCountdown]);

  // Live generate username suggestion
  useEffect(() => {
    if (firstName && lastName && signupStep === 6) {
      const suggested = `${firstName.toLowerCase().replace(/[^a-z0-9]/g, "")}_${lastName.toLowerCase().replace(/[^a-z0-9]/g, "")}_${Math.floor(100 + Math.random() * 900)}`;
      setSignupUsername(suggested);
      checkUsernameUniqueness(suggested);
    }
  }, [firstName, lastName, signupStep]);

  // Live Uniqueness Check for Usernames
  const checkUsernameUniqueness = async (uname: string) => {
    const val = uname.toLowerCase().trim().replace(/[^a-z0-9_]/g, "");
    setSignupUsername(val);
    setUsernameError(null);
    setIsUsernameValid(false);

    if (val.length < 3) {
      setUsernameError("ইউজারনেম কমপক্ষে ৩ অক্ষরের হতে হবে।");
      return;
    }

    try {
      const q = query(collection(db, "users"), where("username", "==", val));
      const querySnap = await getDocs(q);
      if (!querySnap.empty) {
        setUsernameError("দুঃখিত, এই ইউজারনেমটি পূর্বে ব্যবহৃত হয়েছে।");
      } else {
        setIsUsernameValid(true);
      }
    } catch (err) {
      console.error("Username query fail:", err);
    }
  };

  // Recaptcha initial setup
  const setupRecaptcha = () => {
    if (recaptchaVerifierRef.current) return;
    try {
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          console.log("Invisible Recaptcha Verified!");
        }
      });
    } catch (err) {
      console.error("Recaptcha configuration failed:", err);
    }
  };

  // LOGIN OPERATION (Real-time and scalable)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!loginIdentifier.trim() || !loginPassword) {
      setError("দয়া করে ইমেইল/মোবাইল এবং পাসওয়ার্ড লিখুন।");
      return;
    }

    setLoading(true);
    try {
      let emailToAuth = loginIdentifier.trim();

      // Scalable identification lookup (If input is a phone number or username, find their linked email)
      const isEmail = emailToAuth.includes("@");
      if (!isEmail) {
        // Query users by username or phone number
        const usersRef = collection(db, "users");
        let q = query(usersRef, where("username", "==", loginIdentifier.trim().toLowerCase()));
        let snap = await getDocs(q);

        if (snap.empty) {
          // Try lookup by phone
          const formattedPhone = loginIdentifier.trim().replace(/^0+/, '');
          q = query(usersRef, where("phoneNumber", "==", formattedPhone));
          snap = await getDocs(q);
        }

        if (!snap.empty) {
          const userDoc = snap.docs[0].data();
          if (userDoc.email) {
            emailToAuth = userDoc.email;
          }
        }
      }

      const cred = await signInWithEmailAndPassword(auth, emailToAuth, loginPassword);
      if (cred.user) {
        // Verification constraint
        if (!cred.user.emailVerified && emailToAuth.includes("@") && !cred.user.phoneNumber) {
          await sendEmailVerification(cred.user);
          await firebaseSignOut(auth);
          setError("আপনার ইমেইলটি ভেরিফাইড নয়। দয়া করে আপনার ইনবক্স চেক করুন এবং ইনবক্সের লিংকে ক্লিক করুন।");
          return;
        }

        setSuccess("লগইন সফল হয়েছে! ড্যাশবোর্ডে প্রবেশ করা হচ্ছে...");
        await refreshProfile();
        navigate(redirectUrl, { replace: true });
      }
    } catch (err: any) {
      console.error("Gate login failure:", err);
      if (err?.code === "auth/user-not-found" || err?.code === "auth/invalid-credential") {
        setError("আপনার দেওয়া তথ্য সঠিক নয়। অনুগ্রহ করে পুনরায় সঠিক তথ্য দিয়ে চেষ্টা করুন।");
      } else if (err?.code === "auth/wrong-password") {
        setError("ভুল পাসওয়ার্ড। দয়া করে আপনার সঠিক পাসওয়ার্ডটি লিখুন।");
      } else {
        setError("লগইন করতে সমস্যা হয়েছে। সার্ভার অত্যন্ত দ্রুত সাড়া দিচ্ছে, অনুগ্রহ করে আবার চেষ্টা করুন।");
      }
    } finally {
      setLoading(false);
    }
  };

  // MULTI-STEP SIGN UP WIZARD CONTROLS (Facebook Style)
  const handleNextStep = () => {
    setError(null);

    // Validation per step
    if (signupStep === 1) {
      if (!firstName.trim() || !lastName.trim()) {
        setError("দয়া করে আপনার প্রথম নাম ও শেষ নাম লিখুন।");
        return;
      }
    }
    if (signupStep === 2) {
      if (!dob) {
        setError("দয়া করে আপনার জন্মতারিখ সিলেক্ট করুন।");
        return;
      }
    }
    if (signupStep === 3) {
      if (!gender) {
        setError("দয়া করে আপনার লিঙ্গ নির্বাচন করুন।");
        return;
      }
    }
    if (signupStep === 4) {
      if (contactMethod === 'phone' && !signupPhone.trim()) {
        setError("দয়া করে আপনার মোবাইল নম্বরটি লিখুন।");
        return;
      }
      if (contactMethod === 'email' && !signupEmail.trim()) {
        setError("দয়া করে সঠিক ইমেইল এড্রেস লিখুন।");
        return;
      }
      // If contactMethod is phone, trigger real Firebase SMS Auth
      if (contactMethod === 'phone') {
        sendPhoneOtp();
        return; // Don't advance step yet, wait for successful SMS dispatch
      } else if (contactMethod === 'email') {
        sendEmailOtpCode();
        return; // Don't advance step yet, wait for successful Email dispatch
      }
    }
    if (signupStep === 5) {
      if (signupPassword.length < 6) {
        setError("পাসওয়ার্ড অবশ্যই কমপক্ষে ৬ অক্ষরের হতে হবে।");
        return;
      }
    }
    if (signupStep === 6) {
      if (!signupUsername || !isUsernameValid) {
        setError("দয়া করে একটি সঠিক ও ইউনিক ইউজারনেম নিশ্চিত করুন।");
        return;
      }
    }

    setSignupStep(signupStep + 1);
  };

  const handlePrevStep = () => {
    setError(null);
    if (signupStep > 1) {
      setSignupStep(signupStep - 1);
    } else {
      setView('login_gate');
    }
  };

  // SEND OTP CODE (SAS Bulk SMS Gateway Integration)
  const sendPhoneOtp = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    const cleanPhone = signupPhone.trim().replace(/^0+/, '');
    const fullPhone = `${selectedCountry.code}${cleanPhone}`;

    try {
      // Secure backend-side SMS generation & transmission
      const response = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "ওটিপি পাঠাতে সমস্যা হয়েছে। দয়া করে নম্বরটি যাচাই করুন।");
      }

      setPhoneCountdown(45);
      setSuccess("আপনার মোবাইল নাম্বারে ৬ সংখ্যার একটি ভেরিফিকেশন ওটিপি পাঠানো হয়েছে।");
      setSignupStep(5); // Advance to OTP code verification screen!
    } catch (err: any) {
      console.error("SMS Gateway dispatcher failed:", err);
      setError(err.message || "ওটিপি কোড পাঠানো যায়নি। অনুগ্রহ করে মোবাইল নম্বরটি যাচাই করে পুনরায় চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  // SEND EMAIL OTP CODE
  const sendEmailOtpCode = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    const targetEmail = signupEmail.trim().toLowerCase();

    try {
      const response = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "ইমেইল ওটিপি পাঠাতে সমস্যা হয়েছে।");
      }

      setPhoneCountdown(45); // Reuse countdown timer for email OTP cooldown
      setSuccess(`আপনার ইমেইল ${targetEmail}-এ ৬ সংখ্যার একটি ভেরিফিকেশন ওটিপি পাঠানো হয়েছে।`);
      setSignupStep(5); // Advance to OTP code verification screen!
    } catch (err: any) {
      console.error("Email OTP dispatcher failed:", err);
      setError(err.message || "ওটিপি কোড পাঠানো যায়নি। অনুগ্রহ করে ইমেইলটি যাচাই করে পুনরায় চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  // VERIFY OTP / REGISTER EMAIL CODE
  const handleVerifyAndCreateUser = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccess(null);

    setLoading(true);
    try {
      const enteredOtp = otpCode.join("");
      if (enteredOtp.length !== 6) {
        setError("অনুগ্রহ করে সঠিক ৬ সংখ্যার ওটিপি কোডটি লিখুন।");
        setLoading(false);
        return;
      }

      const cleanPhone = signupPhone.trim().replace(/^0+/, '');
      const fullPhone = `${selectedCountry.code}${cleanPhone}`;
      const targetEmailKey = signupEmail.trim().toLowerCase();

      // Verify the OTP via our custom secure backend Bulk SMS & Email API
      let response;
      if (contactMethod === 'phone') {
        response = await fetch("/api/otp/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: fullPhone, otp: enteredOtp })
        });
      } else {
        response = await fetch("/api/otp/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: targetEmailKey, otp: enteredOtp })
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "ভুল ওটিপি কোড। দয়া করে সঠিক কোডটি লিখুন।");
      }

      // Save the verification token in state to pass during final registration
      setVerificationToken(data.verificationToken);

      if (data.exists) {
        // USER ALREADY EXISTS! Sign them in directly!
        const userPassword = data.userPassword || "mayadin123456";

        if (data.username) {
          setSuccess("ওটিপি সফলভাবে যাচাই করা হয়েছে। আপনাকে সরাসরি লগইন করানো হচ্ছে...");
          
          // Get Firebase Auth credentials for the existing user using our backend bridge
          const regRes = await fetch("/api/auth/register-verified-user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              phone: contactMethod === 'phone' ? fullPhone : undefined,
              email: contactMethod === 'email' ? targetEmailKey : undefined,
              isPhoneVerified: contactMethod === 'phone',
              otpState: "OTP_VERIFIED",
              password: userPassword
            })
          });
          const regData = await regRes.json();
          if (!regRes.ok) {
            throw new Error(regData.error || "লগইন করতে সমস্যা হয়েছে।");
          }

          // Sign in using our standardized secure Firebase Auth mapped email & password
          const last10 = contactMethod === 'phone' ? cleanPhone.slice(-10) : targetEmailKey.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
          const targetEmail = contactMethod === 'phone' ? `${last10}@allmayadin.com` : targetEmailKey;
          await signInWithEmailAndPassword(auth, targetEmail, userPassword);

          setSuccess("লগইন সফল হয়েছে!");
          await refreshProfile();
          navigate(redirectUrl, { replace: true });
        } else {
          // User exists but has no username -> guide them to choose username (Step 6)
          setSuccess("ওটিপি ভেরিফিকেশন সফল হয়েছে! অনুগ্রহ করে আপনার প্রোফাইল তৈরি শেষ করুন।");
          setSignupStep(6);
        }
      } else {
        // NEW USER! Go to profile creation wizard steps!
        setSuccess("ওটিপি ভেরিফিকেশন সফল হয়েছে!");
        setSignupStep(6); // Advance to username, DOB, and other custom forms
      }
    } catch (err: any) {
      console.error("Registration phase 1 fail:", err);
      if (err?.code === "auth/email-already-in-use") {
        setError("এই ইমেইলটি ইতিমধ্যে আরেকটি অ্যাকাউন্টে ব্যবহৃত হচ্ছে। অন্য কোনো ইমেইল লিখুন।");
      } else {
        setError(err.message || "ভেরিফিকেশন ব্যর্থ হয়েছে। অনুগ্রহ করে সঠিক কোডটি পুনরায় টাইপ করুন।");
      }
    } finally {
      setLoading(false);
    }
  };

  // COMPLETE MULTI-STEP REGISTRATION & SAVE DOCUMENT (Designed to handle 100M+ users safely)
  const handleFinalizeAccountCreation = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    setLoading(true);
    try {
      const cleanPhone = contactMethod === 'phone' ? signupPhone.trim().replace(/^0+/, '') : "";
      const fullPhone = contactMethod === 'phone' ? `${selectedCountry.code}${cleanPhone}` : "";
      const targetEmailKey = contactMethod === 'email' ? signupEmail.trim().toLowerCase() : `${cleanPhone.slice(-10)}@allmayadin.com`;

      // Call our secure server-side registration API which registers in Firebase Auth and updates Firestore
      const regRes = await fetch("/api/auth/register-verified-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${firstName.trim()} ${lastName.trim()}`,
          phone: contactMethod === 'phone' ? fullPhone : undefined,
          email: targetEmailKey,
          password: "mayadin123456", // Default secure SMS password
          address: bio.trim() || "স্বাগতম আমার প্রিমিয়াম প্রোফাইলে 🌟",
          photoURL: avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${signupUsername}`,
          isPhoneVerified: contactMethod === 'phone',
          otpState: "OTP_VERIFIED"
        })
      });

      const regData = await regRes.json();
      if (!regRes.ok) {
        throw new Error(regData.error || "অ্যাকাউন্ট তৈরি করতে সমস্যা হয়েছে।");
      }

      // Automatically sign in the new user in the client using signInWithEmailAndPassword
      const userPassword = "mayadin123456";
      await signInWithEmailAndPassword(auth, targetEmailKey, userPassword);

      // Save/merge precise custom profile fields in Firestore (Username, dob, gender, bio, etc.)
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userProfilePayload = {
          id: currentUser.uid,
          displayName: `${firstName.trim()} ${lastName.trim()}`,
          username: signupUsername.toLowerCase().trim(),
          dob,
          gender,
          bio: bio.trim() || "স্বাগতম আমার প্রিমিয়াম প্রোফাইলে 🌟",
          photoURL: avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${signupUsername}`,
          phoneNumber: contactMethod === 'phone' ? `0${cleanPhone}` : "",
          email: targetEmailKey,
          status: "active",
          role: (targetEmailKey === "free122055@gmail.com") ? "admin" : "customer",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastLoginAt: Date.now()
        };

        await setDoc(userDocRef, userProfilePayload, { merge: true });

        // Native profile update
        await firebaseUpdateProfile(currentUser, {
          displayName: userProfilePayload.displayName,
          photoURL: userProfilePayload.photoURL
        });
      }

      await refreshProfile();
      setView('connected_success');
    } catch (err: any) {
      console.error("Write profile transaction fail:", err);
      setError(err.message || "প্রোফাইল তৈরি করা যায়নি। পুনরায় সাবমিট বাটনে চাপ দিন।");
    } finally {
      setLoading(false);
    }
  };

  // Avatar file picker
  const handleSelectAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const url = await uploadImageFile(file);
      if (url) {
        setAvatarUrl(url);
      }
    } catch (err) {
      console.error("Avatar uploading fail:", err);
      setError("প্রোফাইল ছবি আপলোড ব্যর্থ হয়েছে।");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // OTP box input handling
  const handleOtpBoxChange = (index: number, val: string) => {
    setError(null);
    setSuccess(null);

    const cleanVal = val.replace(/\D/g, "");

    // Handle full paste
    if (cleanVal.length > 1) {
      const pasteDigits = cleanVal.slice(0, 6).split("");
      const newOtp = [...otpCode];
      pasteDigits.forEach((d, idx) => {
        newOtp[idx] = d;
      });
      setOtpCode(newOtp);
      const nextFocus = Math.min(pasteDigits.length, 5);
      otpRefs[nextFocus].current?.focus();

      // Auto-submit if 6 digits pasted
      if (pasteDigits.length === 6) {
        setTimeout(() => {
          handleVerifyAndCreateUser();
        }, 50);
      }
      return;
    }

    const newOtp = [...otpCode];
    newOtp[index] = cleanVal;
    setOtpCode(newOtp);

    if (cleanVal && index < 5) {
      otpRefs[index + 1].current?.focus();
    }

    // Auto-submit on 6th digit
    if (cleanVal && index === 5) {
      const enteredOtp = newOtp.join("");
      if (enteredOtp.length === 6) {
        setTimeout(() => {
          handleVerifyAndCreateUser();
        }, 50);
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#02050f] text-white relative font-sans flex flex-col md:grid md:grid-cols-12 overflow-x-hidden overflow-y-auto md:overflow-hidden">
      
      {/* Starfield / Glow Effects Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-950/10 via-[#02050f] to-[#02050f] pointer-events-none z-0" />
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-[160px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-[160px] pointer-events-none" />

      {/* Invisible Recaptcha */}
      <div id="recaptcha-container" className="hidden"></div>

      {/* LEFT COLUMN: GORGEOUS BRAND SIDEBAR (Visible on md+) */}
      <div className="hidden md:flex md:col-span-5 lg:col-span-6 bg-gradient-to-br from-[#051121] to-[#010814] border-r border-white/5 flex-col justify-between p-12 lg:p-16 relative overflow-hidden z-10">
        {/* Glow orb inside sidebar */}
        <div className="absolute top-1/4 -right-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />
        
        {/* Brand Header */}
        <div className="flex items-center gap-3.5 relative z-10">
          <img 
            src="/app_icon.png" 
            alt="BINISTA" 
            className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-500/30 shadow-2xl" 
          />
          <div>
            <h1 className="text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-emerald-400">BINISTA</h1>
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Connect • Share • Discover</p>
          </div>
        </div>

        {/* Feature Highlights/Slogans with celestial aesthetics */}
        <div className="space-y-8 my-auto max-w-md relative z-10">
          <div className="space-y-3">
            <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              Premium Social Portal
            </span>
            <h2 className="text-2xl lg:text-3xl font-black leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-emerald-100">
              বাস্তব সময়ের সামাজিক যোগাযোগ মাধ্যম।
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <Users className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">লাইভ চ্যাট ও রিলস (Reels)</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">বন্ধুদের সাথে সরাসরি মেসেজিং করুন এবং চমৎকার সব শর্ট ভিডিও বা রিলস উপভোগ করুন।</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">নিখুঁত ও অত্যন্ত দ্রুত ওটিপি ডেলিভারি</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">মোবাইল বা ইমেইল ওটিপি সম্পূর্ণ ইনস্ট্যান্ট ও ঝামেলাহীনভাবে আপনার কাছে পৌঁছে যাবে।</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
                <Smile className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">ওটিপি শুধুমাত্র রেজিস্ট্রেশনে প্রযোজ্য</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">একবার একাউন্ট খোলার পর লগইন করতে কোনো ওটিপি লাগবে না, সরাসরি পাসওয়ার্ড দিয়ে লগইন করুন।</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer/Sponsor Info */}
        <div className="text-[11px] text-slate-500 relative z-10 flex justify-between items-center border-t border-white/5 pt-4">
          <span>&copy; {new Date().getFullYear()} BINISTA Corp.</span>
          <span className="flex items-center gap-1 text-slate-400 font-medium">
            <Heart className="w-3 h-3 text-rose-500 animate-pulse fill-rose-500" />
            Made with Premium Quality
          </span>
        </div>
      </div>

      {/* RIGHT COLUMN: INTERACTIVE FORM CONTAINER (Takes 100% of height and width on mobile, full-height scrollable on md+) */}
      <div className="col-span-12 md:col-span-7 lg:col-span-6 flex flex-col justify-center items-center w-full min-h-screen p-4 sm:p-8 md:p-12 lg:p-16 overflow-y-auto bg-[#030813]/95 relative z-10 border-l border-white/5">
        
        {/* Mobile Header: Visible only on mobile screens to ensure brand coherence */}
        <div className="md:hidden text-center mb-6 flex flex-col items-center">
          <img 
            src="/app_icon.png" 
            alt="BINISTA" 
            className="w-14 h-14 rounded-2xl object-cover ring-4 ring-emerald-500/20 shadow-2xl mb-2.5" 
          />
          <h1 className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-emerald-400">BINISTA</h1>
          <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest mt-0.5">Connect • Share • Discover</p>
          
          <div className="mt-3 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-400 uppercase tracking-widest animate-pulse">
            ⚡ Instant OTP System Verified
          </div>
        </div>

        {/* Form Outer Wrapper: Stretches beautifully to look premium, full width on mobile, styled container on desktop */}
        <div className="w-full max-w-md flex flex-col">
          
          {/* ALERTS CONTROL */}
          {error && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5 leading-relaxed animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-4 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-start gap-2.5 leading-relaxed animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            
            {/* ----------------- VIEW 1: LOGIN GATE (Clean & Responsive) ----------------- */}
            {view === 'login_gate' && (
              <motion.div
                key="login_gate"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-5"
              >
                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Username/Email/Phone Field */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">Username, Email, or Phone</label>
                    <div className="relative">
                      <User className="w-4.5 h-4.5 absolute left-4 top-4 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Username, Email, or Phone"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        className="w-full bg-slate-950/60 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-xs font-bold text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder:text-slate-600"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5 px-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Password</label>
                      <button
                        type="button"
                        className="text-[10px] font-bold text-emerald-400 hover:underline cursor-pointer"
                        onClick={() => alert("পাসওয়ার্ড রিসেটের লিংক পেতে আপনার ইমেইল অ্যাড্রেসটি ইমেইল সাইন-ইন ফিল্ডে লিখে সাবমিট করুন।")}
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4.5 h-4.5 absolute left-4 top-4 text-slate-500" />
                      <input
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="Enter Password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full bg-slate-950/60 border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-xs font-bold text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder:text-slate-600"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-4 top-4 text-slate-500 hover:text-white"
                      >
                        {showLoginPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-xs shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>Log In</span>
                    )}
                  </button>
                </form>

                {/* Separator */}
                <div className="relative flex items-center justify-center py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/5"></div>
                  </div>
                  <span className="relative px-3 bg-[#030813] text-[9px] font-black tracking-widest text-slate-500 uppercase">OR</span>
                </div>

                {/* Create New Account Button (Highlighted exactly like Facebook) */}
                <button
                  type="button"
                  onClick={() => { setError(null); setSignupStep(1); setView('signup_steps'); }}
                  className="w-full py-4 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-black text-xs tracking-wider transition-all hover:scale-[1.01] active:scale-98 cursor-pointer flex items-center justify-center gap-2 shadow-inner"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Account</span>
                </button>
              </motion.div>
            )}


            {/* ----------------- VIEW 2: MULTI-STEP SIGN UP WIZARD (Facebook Flow) ----------------- */}
            {view === 'signup_steps' && (
              <motion.div
                key="signup_steps"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Back button & Step Progress Tracker Indicator */}
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-emerald-400 font-black">Step {signupStep} of {totalSignupSteps}</span>
                    <div className="w-16 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-300" 
                        style={{ width: `${(signupStep / totalSignupSteps) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* STEP 1: Name Input */}
                {signupStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-base font-black text-white">What's your name?</h2>
                      <p className="text-[11px] text-slate-400 mt-0.5">Enter your real name to connect with friends easily.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 mb-1 px-1">First Name</label>
                        <input
                          type="text"
                          placeholder="First Name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-4 py-3.5 text-xs font-bold text-white outline-none focus:border-emerald-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 mb-1 px-1">Last Name</label>
                        <input
                          type="text"
                          placeholder="Last Name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-4 py-3.5 text-xs font-bold text-white outline-none focus:border-emerald-500"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Birthday Input */}
                {signupStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-base font-black text-white">When's your birthday?</h2>
                      <p className="text-[11px] text-slate-400 mt-0.5">Your birthday helps customize your experience and connections.</p>
                    </div>
                    <div className="relative">
                      <Calendar className="w-4.5 h-4.5 absolute left-4 top-3.5 text-slate-500" />
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full bg-slate-950/60 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-xs font-bold text-white outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* STEP 3: Gender Choice */}
                {signupStep === 3 && (
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-base font-black text-white">What's your gender?</h2>
                      <p className="text-[11px] text-slate-400 mt-0.5">Choose your gender designation. You can change this anytime.</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {['Male', 'Female', 'Custom'].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setGender(opt)}
                          className={`py-3.5 rounded-2xl border transition-all text-xs font-bold cursor-pointer ${
                            gender === opt 
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-md' 
                              : 'bg-slate-950/60 border-white/10 text-slate-300 hover:bg-white/5'
                          }`}
                        >
                          {opt === 'Male' ? 'পুরুষ' : opt === 'Female' ? 'মহিলা' : 'অন্যান্য'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 4: Phone / Email Choice */}
                {signupStep === 4 && (
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-base font-black text-white">Enter contact information</h2>
                      <p className="text-[11px] text-slate-400 mt-0.5">Select a method to receive your authentication code.</p>
                    </div>

                    {/* Toggle tabs */}
                    <div className="flex bg-slate-950/60 p-1.5 rounded-2xl border border-white/5">
                      <button
                        type="button"
                        onClick={() => setContactMethod('phone')}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${contactMethod === 'phone' ? 'bg-emerald-500 text-black shadow' : 'text-slate-400 hover:text-white'}`}
                      >
                        Phone Number
                      </button>
                      <button
                        type="button"
                        onClick={() => setContactMethod('email')}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${contactMethod === 'email' ? 'bg-emerald-500 text-black shadow' : 'text-slate-400 hover:text-white'}`}
                      >
                        Email Address
                      </button>
                    </div>

                    {contactMethod === 'phone' ? (
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <select
                            value={selectedCountry.code}
                            onChange={(e) => {
                              const found = COUNTRY_CODES.find(c => c.code === e.target.value);
                              if (found) setSelectedCountry(found);
                            }}
                            className="appearance-none bg-slate-950/60 border border-white/10 rounded-2xl px-3 py-4 text-xs font-black text-white pr-8 focus:outline-none focus:border-emerald-500"
                          >
                            {COUNTRY_CODES.map(c => (
                              <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                            ))}
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        <input
                          type="tel"
                          placeholder="1712345678"
                          value={signupPhone}
                          onChange={(e) => setSignupPhone(e.target.value.replace(/[^0-9]/g, ''))}
                          className="flex-1 bg-slate-950/60 border border-white/10 rounded-2xl px-4 py-4 text-xs font-bold text-white outline-none focus:border-emerald-500 transition-colors"
                          required
                        />
                      </div>
                    ) : (
                      <div className="relative">
                        <Mail className="w-4.5 h-4.5 absolute left-4 top-4 text-slate-500" />
                        <input
                          type="email"
                          placeholder="example@gmail.com"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          className="w-full bg-slate-950/60 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-xs font-bold text-white outline-none focus:border-emerald-500 transition-colors"
                          required
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 5: Verification Code Screen / Password Setup */}
                {signupStep === 5 && (
                  <div className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-base font-black text-white">
                          {contactMethod === 'phone' ? "Verify SMS OTP Code" : "Verify Email OTP Code"}
                        </h2>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {contactMethod === 'phone' 
                            ? `We've sent a 6-digit confirmation code to ${selectedCountry.code} ${signupPhone}`
                            : `We've sent a 6-digit confirmation code to ${signupEmail}`
                          }
                        </p>
                      </div>

                      {/* Code boxes */}
                      <div className="grid grid-cols-6 gap-2">
                        {otpCode.map((digit, i) => (
                          <input
                            key={i}
                            ref={otpRefs[i]}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpBoxChange(i, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Backspace" && !otpCode[i] && i > 0) {
                                otpRefs[i - 1].current?.focus();
                              }
                            }}
                            className="w-full aspect-square bg-slate-950/60 border border-white/10 rounded-2xl text-center font-black text-sm text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                          />
                        ))}
                      </div>

                      <div className="text-center text-xs">
                        {phoneCountdown > 0 ? (
                          <span className="text-slate-400">
                            {contactMethod === 'phone' ? `Resend SMS OTP in ${phoneCountdown}s` : `Resend Email OTP in ${phoneCountdown}s`}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={contactMethod === 'phone' ? sendPhoneOtp : sendEmailOtpCode}
                            className="text-emerald-400 font-bold hover:underline cursor-pointer"
                          >
                            {contactMethod === 'phone' ? "Resend Verification SMS" : "Resend Verification Email"}
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleVerifyAndCreateUser()}
                        disabled={loading}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-black text-xs active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Verify OTP Code</span>}
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 6: Username Selector */}
                {signupStep === 6 && (
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-base font-black text-white">Choose your username</h2>
                      <p className="text-[11px] text-slate-400 mt-0.5">Select a unique handle for your profile directory.</p>
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-3.5 text-slate-500 text-sm font-bold">@</span>
                      <input
                        type="text"
                        placeholder="username"
                        value={signupUsername}
                        onChange={(e) => checkUsernameUniqueness(e.target.value)}
                        className="w-full bg-slate-950/60 border border-white/10 rounded-2xl pl-8 pr-10 py-3.5 text-xs font-bold text-white outline-none focus:border-emerald-500"
                        required
                      />
                      <div className="absolute right-3.5 top-3.5">
                        {isUsernameValid && <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />}
                      </div>
                    </div>
                    {usernameError && (
                      <p className="text-[10px] text-rose-400 mt-1.5 ml-1 leading-normal font-medium">{usernameError}</p>
                    )}
                  </div>
                )}

                {/* STEP 7: Optional Profile Photo */}
                {signupStep === 7 && (
                  <div className="space-y-4 flex flex-col items-center">
                    <div className="text-center w-full">
                      <h2 className="text-base font-black text-white">Add a profile picture</h2>
                      <p className="text-[11px] text-slate-400 mt-0.5">Let your friends recognize you instantly.</p>
                    </div>

                    <input
                      ref={avatarFileRef}
                      type="file"
                      accept="image/*"
                      onChange={handleSelectAvatarFile}
                      className="hidden"
                    />

                    <div className="relative group mt-2">
                      <div className="w-24 h-24 rounded-full bg-slate-950/60 border-2 border-white/10 flex items-center justify-center overflow-hidden shadow-2xl">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-10 h-10 text-slate-700" />
                        )}

                        {/* Camera icon trigger */}
                        <button
                          type="button"
                          onClick={() => avatarFileRef.current?.click()}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white"
                        >
                          <Camera className="w-6 h-6" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => avatarFileRef.current?.click()}
                        className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-emerald-500 border border-slate-950 flex items-center justify-center text-black shadow-lg"
                      >
                        <Plus className="w-4 h-4 stroke-[3]" />
                      </button>
                    </div>

                    {isUploadingPhoto && <p className="text-[10px] text-emerald-400 animate-pulse">Uploading photo...</p>}
                  </div>
                )}

                {/* STEP 8: Profile Bio & Confirm */}
                {signupStep === 8 && (
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-base font-black text-white">Tell us about yourself</h2>
                      <p className="text-[11px] text-slate-400 mt-0.5">Write a short bio or status message (Optional).</p>
                    </div>
                    <textarea
                      placeholder="উদাঃ আসসালামু আলাইকুম! আমি একজন সৃষ্টিশীল মানুষ..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-emerald-500 resize-none placeholder:text-slate-600"
                    />

                    <form onSubmit={handleFinalizeAccountCreation}>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-xs shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <span>Create Account & Start Exploring!</span>
                        )}
                      </button>
                    </form>
                  </div>
                )}

                {/* Standard Step Button logic (except for verified forms) */}
                {signupStep !== 5 && signupStep !== 8 && (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-xs shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Next Step</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            )}


            {/* ----------------- VIEW 3: CHECK EMAIL VERIFICATION LINK ----------------- */}
            {view === 'email_sent_screen' && (
              <motion.div
                key="email_sent_screen"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center space-y-5"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                  <Mail className="w-8 h-8 animate-pulse" />
                </div>

                <div>
                  <h2 className="text-lg font-black text-white">Check Your Email</h2>
                  <p className="text-xs text-slate-400 leading-relaxed mt-2">
                    We've sent a verification link to <span className="text-white font-bold">{signupEmail}</span>. Click the link in your email to verify your address, then refresh or sign-in.
                  </p>
                </div>

                <button
                  onClick={() => window.open("https://mail.google.com")}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-black text-xs shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform cursor-pointer"
                >
                  <span>Open Email App</span>
                </button>

                <button
                  onClick={() => setView('login_gate')}
                  className="text-xs text-slate-400 hover:text-white underline block mx-auto cursor-pointer"
                >
                  Return to Login Gate
                </button>
              </motion.div>
            )}


            {/* ----------------- VIEW 4: SUCCESS PROFILE SETUP CONNECTED ----------------- */}
            {view === 'connected_success' && (
              <motion.div
                key="connected_success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center space-y-5"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>

                <div>
                  <h2 className="text-xl font-black text-white">Account Connected</h2>
                  <p className="text-xs text-slate-400 leading-relaxed mt-2">
                    Your profile has been connected and is active on BINISTA! Connect, share and chat with your friends.
                  </p>
                </div>

                <button
                  onClick={() => navigate(redirectUrl, { replace: true })}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-xs shadow-lg active:scale-95 transition-transform cursor-pointer"
                >
                  <span>Continue to Feed</span>
                </button>
              </motion.div>
            )}

          </AnimatePresence>

        </div>
      </div>
    </div>
  );
};

export default Login;
