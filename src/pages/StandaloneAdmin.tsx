import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  LayoutDashboard, 
  Package, 
  PackagePlus, 
  ShoppingBag, 
  Layers, 
  Truck, 
  Image as ImageIcon, 
  Users, 
  Bell, 
  Heart, 
  Settings, 
  Radio, 
  Video, 
  Layout, 
  Type, 
  Sparkles, 
  ExternalLink, 
  RefreshCw, 
  ShieldCheck, 
  Menu, 
  X, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  PhoneCall, 
  Power, 
  Download, 
  Copy,
  Tag,
  Percent,
  Plus,
  Wifi
} from "lucide-react";
import { db } from "../lib/firebase";
import { collection, query, onSnapshot, getDocs, limit, addDoc } from "firebase/firestore";
import { compressImage } from "../lib/imageUtils";

// Import existing modular admin components
import { ProductManagement } from "../components/admin/ProductManagement";
import { BannerManagement } from "../components/admin/BannerManagement";
import { DeliveryManagement as DeliverySettings } from "../components/admin/DeliveryManagement";
import { OrderManagement } from "../components/admin/OrderManagement";
import { CourierDeliveryManagement } from "../components/admin/CourierDeliveryManagement";
import { FoodSubcategoryManagement } from "../components/admin/FoodSubcategoryManagement";
import { CategoryIconManagement } from "../components/admin/CategoryIconManagement";
import { CategoryVisibilityManagement } from "../components/admin/CategoryVisibilityManagement";
import { MainBannerManagement } from "../components/admin/MainBannerManagement";
import { ReciterManagement } from "../components/admin/ReciterManagement";
import { VideoTilawatManagement } from "../components/admin/VideoTilawatManagement";
import { TemplateManagement } from "../components/admin/TemplateManagement";
import { FontManagement } from "../components/admin/FontManagement";
import { CaptionManagement } from "../components/admin/CaptionManagement";
import { IntegrationCenter } from "../components/admin/IntegrationCenter";
import { UserManagement } from "../components/admin/UserManagement";
import { OneSignalConfig } from "../components/admin/OneSignalConfig";
import { EmailAutomationSection } from "../components/admin/EmailAutomationSection";
import { FloatingBubbleAdminSettings } from "../components/admin/FloatingBubbleAdminSettings";
import { BiodataManagement } from "../components/admin/BiodataManagement";
import { TelecomManagement } from "../components/admin/TelecomManagement";
import { PromoCodeManagement } from "../components/admin/PromoCodeManagement";
import { useFirestoreCategories } from "../hooks/useCategories";
import { CustomDropdown } from "../components/CustomDropdown";

const CERT_TEXT = `-----BEGIN CERTIFICATE-----
MIIDrDCCApSgAwIBAgIUbgYcPFUN2XsLeghtCPsqIYtBzaswDQYJKoZIhvcNAQEL
BQAwZzEXMBUGA1UEAwwOQWxNYXlhZGluQmF6YXIxCzAJBgNVBAsMAklUMRIwEAYD
VQQKDAlBbE1heWFkaW4xDjAMBgNVBAcMBURoYWthMQ4wDAYDVQQIDAVEaGFrYTEL
MAkGA1UEBhMCQkQwIBcNMjYwOTA1MDExOTAzWhgPMjA1NDAxMjEwMTE5MDNaMGcx
FzAVBgNVBAMMDkFsTWF5YWRpbkJhemFyMQswCQYDVQQLDAJJVDESMBAGA1UECgwJ
QWxNYXlhZGluMQ4wDAYDVQQHDAVEaGFrYTEOMAwGA1UECAwFRGhha2ExCzAJBgNV
BAYTAkJEMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAviP68ivjAo6v
Unlbn3mQ+TALPmrpIXU+fgieWShnnY87pvmTYPLQoR0JTSL+fG9HQ4gm2knzCMXO
+d3hTfVdKtbd0kFy6o5xMemhIyav97OM0N1zvAHVhjlSKur6I2+zQFoagE+n0uU7
KrY6bYOxIMFugWW/G2Hf7PAO9V91LwODU/hW5yzEz5Ff1YhX1olOQVWdHdFQMBop
3jTdibo8r1oYzmrH/ZU8EgAtNJQ5PSNVUXp55BHQTz7Zs73T7mtCRtxd5+wUhALj
/6MeXbWQbSf+4RfamabJwh4Dhya1l4pfNhunchvvyTktpGcASdv9wvwLsTbY3QtL
EowJ4tzE0wIDAQABo04wTDAJBgNVHRMEAjAAMAsGA1UdDwQEAwIFoDATBgNVHSUE
DDAKBggrBgEFBQcDAzAdBgNVHQ4EFgQUR3TGcUW3FpVJrprtIRzP+bow3TkwDQYJ
KoZIhvcNAQELBQADggEBAHFAsHyB0XkYk6fOT4mmqp8ZwvtBlUJOnyGbKH7hLm+O
LChwZ/51lGpvv5XHvBqtbE9PCDX9eon6BDXrC0qHRte/F25MjmrcL6oSfAfXiskf
y0yoJ5bfrBqZPdcEljdgBVtM6ubKTuzBzFS794EZ/VeTDOcWWiWeduXuMnJjNLOF
3w5cEKghRo7PUeAatg+fT7TyAgujs0lvYB8W1esvs0dwEWxWh/CEcIv5z0McCXmG
OVKwXvSuAXa961yvmxhloAvVNj3PHewurSsi+j//+6+EtA9G5LJmj+1BBhxglwOk
55HxX8zghz4QKZeBFB07kjohqwXoqPOkqwPoBTpCOEo=
-----END CERTIFICATE-----`;

export const StandaloneAdmin: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [activeMenu, setActiveMenu] = useState<string>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Standalone Access Security
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return localStorage.getItem("standalone_admin_unlocked") === "true";
  });

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === "7788") {
      localStorage.setItem("standalone_admin_unlocked", "true");
      setIsUnlocked(true);
      setPinError("");
    } else {
      setPinError("ভুল অ্যাডমিন পিন কোড! পুনরায় চেষ্টা করুন।");
    }
  };

  const handleLock = () => {
    localStorage.removeItem("standalone_admin_unlocked");
    setIsUnlocked(false);
    setPinInput("");
  };

  // Live Stats Counter
  const [stats, setStats] = useState({
    productsCount: 0,
    ordersCount: 0,
    biodatasCount: 0,
    usersCount: 0
  });

  const [selectedUserForNotification, setSelectedUserForNotification] = useState<any>(null);

  const handleSendNotificationToUser = (user: any) => {
    setSelectedUserForNotification(user);
    setActiveMenu("onesignal");
  };

  const { categories } = useFirestoreCategories();

  // Add product form states
  const [productName, setProductName] = useState("");
  const [customProductCode, setCustomProductCode] = useState(() => String(Math.floor(100 + Math.random() * 900)));
  const [selectedCategory, setSelectedCategory] = useState("");
  const [regularPrice, setRegularPrice] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [productSizes, setProductSizes] = useState<string[]>([]);
  const [customSizeInput, setCustomSizeInput] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [isFeatured, setIsFeatured] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  // Fetch real-time count for overview stats
  useEffect(() => {
    const unsubProducts = onSnapshot(collection(db, "products"), (snap) => {
      setStats(prev => ({ ...prev, productsCount: snap.size }));
    }, (err) => console.warn(err));

    const unsubOrders = onSnapshot(collection(db, "orders"), (snap) => {
      setStats(prev => ({ ...prev, ordersCount: snap.size }));
    }, (err) => console.warn(err));

    const unsubBiodatas = onSnapshot(collection(db, "biodatas"), (snap) => {
      setStats(prev => ({ ...prev, biodatasCount: snap.size }));
    }, (err) => console.warn(err));

    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      setStats(prev => ({ ...prev, usersCount: snap.size }));
    }, (err) => console.warn(err));

    return () => {
      unsubProducts();
      unsubOrders();
      unsubBiodatas();
      unsubUsers();
    };
  }, []);

  const showToast = (text: string, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddSize = (sizeToAdd: string) => {
    const trimmed = sizeToAdd.trim();
    if (trimmed && !productSizes.includes(trimmed)) {
      setProductSizes(prev => [...prev, trimmed]);
    }
  };

  const handleRemoveSize = (sizeToRemove: string) => {
    setProductSizes(prev => prev.filter(s => s !== sizeToRemove));
  };

  const handleTogglePresetSizes = (presets: string[]) => {
    setProductSizes(prev => {
      const allPresent = presets.every(p => prev.includes(p));
      if (allPresent) {
        return prev.filter(p => !presets.includes(p));
      } else {
        const next = [...prev];
        presets.forEach(p => {
          if (!next.includes(p)) next.push(p);
        });
        return next;
      }
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 5) {
      showToast("সর্বোচ্চ ৫টি ছবি আপলোড করা যাবে", true);
      return;
    }

    setIsUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const compressedBase64 = await compressImage(file);
        uploadedUrls.push(compressedBase64);
      }
      setImages(prev => [...prev, ...uploadedUrls]);
      showToast(`${files.length}টি ছবি সফলভাবে প্রসেস হয়েছে`);
    } catch (err) {
      showToast("ছবি আপলোড করতে ব্যর্থ হয়েছে", true);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) {
      showToast("পণ্য এর নাম আবশ্যক", true);
      return;
    }
    if (!selectedCategory) {
      showToast("ক্যাটাগরি নির্বাচন করুন", true);
      return;
    }
    if (!regularPrice || isNaN(Number(regularPrice))) {
      showToast("সঠিক মূল্য প্রদান করুন", true);
      return;
    }

    setLoading(true);
    try {
      const regPrice = Number(regularPrice);
      const discPct = discountPercent ? Number(discountPercent) : 0;
      const calcDiscountPrice = discPct > 0 ? Math.round(regPrice - (regPrice * discPct) / 100) : regPrice;

      const newProd = {
        name: productName,
        code: customProductCode || String(Math.floor(100 + Math.random() * 900)),
        categoryId: selectedCategory,
        price: regPrice,
        discountPrice: calcDiscountPrice,
        discountPercent: discPct,
        stock: stockQuantity ? Number(stockQuantity) : 0,
        sizes: productSizes,
        description,
        status,
        isFeatured,
        images,
        imageUrl: images[0] || "",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await addDoc(collection(db, "products"), newProd);
      showToast("পণ্য সফলভাবে যুক্ত হয়েছে!");

      // Reset form
      setProductName("");
      setCustomProductCode(String(Math.floor(100 + Math.random() * 900)));
      setSelectedCategory("");
      setRegularPrice("");
      setDiscountPercent("");
      setStockQuantity("");
      setProductSizes([]);
      setCustomSizeInput("");
      setDescription("");
      setStatus("active");
      setIsFeatured(false);
      setImages([]);
      setActiveMenu("all-products");
    } catch (err) {
      console.error(err);
      showToast("পণ্য যুক্ত করতে সমস্যা হয়েছে", true);
    } finally {
      setLoading(false);
    }
  };

  // Nav item helper component
  const NavButton = ({ id, icon: Icon, label, badge }: { id: string; icon: any; label: string; badge?: number }) => {
    const isActive = activeMenu === id;
    return (
      <button
        onClick={() => {
          setActiveMenu(id);
          setIsSidebarOpen(false);
        }}
        className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-black transition flex items-center justify-between cursor-pointer ${
          isActive 
            ? "bg-[#053d26] text-amber-300 shadow-sm" 
            : "text-slate-300 hover:bg-slate-800 hover:text-white"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Icon className={`w-4 h-4 ${isActive ? "text-amber-300" : "text-slate-400"}`} />
          <span>{label}</span>
        </div>
        {badge !== undefined && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-gray-950">
            {badge}
          </span>
        )}
      </button>
    );
  };

  const userIsAdmin = profile?.role === 'admin';
  const hasAccess = isUnlocked || userIsAdmin;

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
          {/* Top subtle glow */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-amber-500 to-emerald-600" />

          {/* Icon */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-850 border border-slate-700/80 text-amber-300 flex items-center justify-center shadow-md">
            <ShieldCheck className="w-9 h-9" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-lg font-black text-white tracking-tight">Al Mayadin Standalone Admin</h2>
            <p className="text-xs text-slate-400 font-bold">সুরক্ষিত অ্যাডমিন লকস্ক্রিন</p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4 pt-2">
            <div className="space-y-1.5 text-left">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">অ্যাডমিন সিকিউরিটি পিন কোড</label>
              <input
                type="password"
                maxLength={6}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError("");
                }}
                placeholder="••••"
                className="w-full text-center bg-slate-950 border border-slate-800 rounded-2xl py-3.5 px-4 text-lg font-black tracking-widest text-amber-300 focus:outline-none focus:border-emerald-600 placeholder:text-slate-700"
                required
              />
            </div>

            {pinError && (
              <p className="text-[11px] text-rose-400 font-bold flex items-center gap-1 justify-center bg-rose-950/40 py-2 px-3 rounded-xl border border-rose-900/30">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{pinError}</span>
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-emerald-800 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black transition shadow-lg active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>আনলক করুন</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick instructions */}
          <div className="pt-4 border-t border-slate-850 text-[11px] text-slate-400 leading-relaxed space-y-1.5">
            <p className="font-semibold text-amber-300/90">
              💡 টেস্টিং পিন কোড: <strong className="font-black underline text-white">7788</strong>
            </p>
            <p>
              মোবাইল ও অন্যান্য ডিভাইসে সহজে লগইন ও রিয়েল-টাইম টেস্টিং নিশ্চিত করতে এই সরাসরি বাইপাস পিন কোড গেটওয়েটি যুক্ত করা হয়েছে।
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-[999999] px-4 py-3 rounded-2xl shadow-2xl text-xs font-black flex items-center gap-2 transition border ${
          toastMessage.isError ? "bg-rose-950 border-rose-700 text-rose-200" : "bg-emerald-950 border-emerald-700 text-emerald-200"
        }`}>
          {toastMessage.isError ? <AlertCircle className="w-4 h-4 text-rose-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* TOP STANDALONE ADMIN HEADER BAR */}
      <header className="bg-slate-950 border-b border-slate-800 p-3 sm:p-4 sticky top-0 z-40 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#053d26] to-emerald-700 text-amber-300 flex items-center justify-center font-black shadow-md border border-emerald-600/40">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-2">
                <span>Al Mayadin Admin Software</span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold">
                  Standalone Portal
                </span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Firebase Firestore Real-time Management Environment
              </p>
            </div>
          </div>
        </div>

        {/* Right Status & Direct User Software Link */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/80 border border-emerald-700/60 rounded-full text-[11px] font-bold text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Firebase Live</span>
          </div>

          <button
            onClick={handleLock}
            className="px-3 py-2 bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            title="অ্যাডমিন প্যানেল লক করুন"
          >
            <Power className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">লক করুন</span>
          </button>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>User App</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">

        {/* STANDALONE SIDEBAR NAVIGATION */}
        <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-950 border-r border-slate-800 p-4 space-y-4 flex flex-col transform transition-transform duration-200 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}>
          {/* Drawer Close Mobile Button */}
          <div className="flex items-center justify-between lg:hidden pb-2 border-b border-slate-800">
            <span className="text-xs font-black text-slate-300">অ্যাডমিন মেনু</span>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Items Scroll Container */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-none">
            
            {/* 1. Overview */}
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider px-2">ড্যাশবোর্ড</span>
              <NavButton id="dashboard" icon={LayoutDashboard} label="ওভারভিউ ড্যাশবোর্ড" />
            </div>

            {/* 2. E-Commerce */}
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider px-2">ই-কমার্স শপ</span>
              <NavButton id="all-products" icon={Package} label="পণ্য তালিকা ও স্টক" badge={stats.productsCount} />
              <NavButton id="add-product" icon={PackagePlus} label="নতুন পণ্য যোগ করুন" />
              <NavButton id="orders" icon={ShoppingBag} label="অর্ডার তালিকা" badge={stats.ordersCount} />
              <NavButton id="category-icons" icon={Layers} label="ক্যাটাগরি আইকন ও লিস্ট" />
              <NavButton id="category-visibility" icon={Layers} label="ক্যাটাগরি হাইড/শো" />
              <NavButton id="food-subcategories" icon={Layers} label="ফুড বাজার সাব-ক্যাটাগরি" />
              <NavButton id="main-banners" icon={ImageIcon} label="মেইন স্লাইডার ব্যানার" />
              <NavButton id="banner-management" icon={ImageIcon} label="অফার ব্যানার সেটিং" />
              <NavButton id="delivery-settings" icon={Truck} label="ডেলিভারি চার্জ সেটিং" />
              <NavButton id="delivery-management" icon={Truck} label="কুরিয়ার ইন্টিগ্রেশন" />
              <NavButton id="promo-codes" icon={Tag} label="প্রমো কোড ম্যানেজমেন্ট" />
            </div>

            {/* 3. Telecom Service */}
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider px-2">টেলিকম সার্ভিস</span>
              <NavButton id="telecom-management" icon={Wifi} label="টেলিকম অফার ও অর্ডার" />
            </div>

            {/* 4. Matrimonial */}
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider px-2">ইসলামিক ম্যাট্রিমনিয়াল</span>
              <NavButton id="matrimonial-management" icon={Heart} label="বায়োডাটা ও রিকোয়েস্ট" badge={stats.biodatasCount} />
            </div>

            {/* 4. Users & Marketing */}
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider px-2">ব্যবহারকারী ও মার্কেটিং</span>
              <NavButton id="user-management" icon={Users} label="ইউজার তালিকা" badge={stats.usersCount} />
              <NavButton id="onesignal" icon={Bell} label="পুশ নোটিফিকেশন (OneSignal)" />
              <NavButton id="email-automation" icon={Bell} label="অটো ইমেইল অটোমেশন" />
            </div>

            {/* 5. Islamic Content */}
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider px-2">ইসলামিক কন্টেন্ট</span>
              <NavButton id="reciter-management" icon={Radio} label="ক্বারী ম্যানেজমেন্ট" />
              <NavButton id="video-tilawat-management" icon={Video} label="ভিডিও তিলাওয়াত" />
            </div>

            {/* 6. Pixel Tools & Settings */}
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider px-2">টুলস ও সিস্টেম</span>
              <NavButton id="template-management" icon={Layout} label="পিক্সেল টেমপ্লেট" />
              <NavButton id="font-management" icon={Type} label="কাস্টম ফন্ট" />
              <NavButton id="caption-management" icon={Sparkles} label="ক্যাপশন ঘর ডাটা" />
              <NavButton id="floating-bubble" icon={Settings} label="ভাসমান অর্ডার বাবল সেটিং" />
              <NavButton id="integration-center" icon={Settings} label="ইন্টিগ্রেশন সেন্টার (bKash/SMS)" />
              <NavButton id="signing-keystore" icon={ShieldCheck} label="আসল Sign Key/Keystore" />
            </div>

          </div>
        </aside>

        {/* MAIN CONTENT WORKSPACE */}
        <main className="flex-1 overflow-y-auto bg-slate-900 p-4 sm:p-6 lg:p-8">

          {/* 1. OVERVIEW DASHBOARD */}
          {activeMenu === "dashboard" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white">ড্যাশবোর্ড ওভারভিউ</h2>
                <p className="text-xs text-slate-400 mt-1">
                  রিয়েল-টাইম লাইভ ফায়ারবেস স্টেটাস ও প্রধান ম্যানেজমেন্ট অপশন
                </p>
              </div>

              {/* Stats Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div 
                  onClick={() => setActiveMenu("all-products")}
                  className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl p-4 cursor-pointer transition active:scale-98 space-y-1"
                >
                  <div className="flex items-center justify-between text-emerald-400">
                    <Package className="w-5 h-5" />
                    <span className="text-[10px] font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">পণ্য</span>
                  </div>
                  <span className="block text-2xl font-black text-white">{stats.productsCount}</span>
                  <span className="text-[11px] text-slate-400 font-medium">মোট যুক্ত পণ্য</span>
                </div>

                <div 
                  onClick={() => setActiveMenu("orders")}
                  className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl p-4 cursor-pointer transition active:scale-98 space-y-1"
                >
                  <div className="flex items-center justify-between text-amber-400">
                    <ShoppingBag className="w-5 h-5" />
                    <span className="text-[10px] font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">অর্ডার</span>
                  </div>
                  <span className="block text-2xl font-black text-white">{stats.ordersCount}</span>
                  <span className="text-[11px] text-slate-400 font-medium">মোট গ্রাহক অর্ডার</span>
                </div>

                <div 
                  onClick={() => setActiveMenu("matrimonial-management")}
                  className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl p-4 cursor-pointer transition active:scale-98 space-y-1"
                >
                  <div className="flex items-center justify-between text-rose-400">
                    <Heart className="w-5 h-5" />
                    <span className="text-[10px] font-bold bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">বায়োডাটা</span>
                  </div>
                  <span className="block text-2xl font-black text-white">{stats.biodatasCount}</span>
                  <span className="text-[11px] text-slate-400 font-medium">মোট পাত্র-পাত্রী</span>
                </div>

                <div 
                  onClick={() => setActiveMenu("user-management")}
                  className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl p-4 cursor-pointer transition active:scale-98 space-y-1"
                >
                  <div className="flex items-center justify-between text-sky-400">
                    <Users className="w-5 h-5" />
                    <span className="text-[10px] font-bold bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">ইউজার</span>
                  </div>
                  <span className="block text-2xl font-black text-white">{stats.usersCount}</span>
                  <span className="text-[11px] text-slate-400 font-medium">নিবন্ধিত ব্যবহারকারী</span>
                </div>
              </div>

              {/* Quick Jump Shortcuts */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>দ্রুত কাজ সম্পন্ন করুন</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => setActiveMenu("add-product")}
                    className="p-3 bg-slate-700/60 hover:bg-slate-700 rounded-xl text-left transition flex items-center gap-3 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                      <PackagePlus className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-black text-white">নতুন পণ্য যুক্ত করুন</span>
                      <span className="text-[10px] text-slate-400">ছবি, ক্যাটাগরি ও প্রাইস সহ</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveMenu("orders")}
                    className="p-3 bg-slate-700/60 hover:bg-slate-700 rounded-xl text-left transition flex items-center gap-3 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-black text-white">অর্ডার প্রসেস করুন</span>
                      <span className="text-[10px] text-slate-400">স্ট্যাটাস ও কুরিয়ার আপডেট</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveMenu("onesignal")}
                    className="p-3 bg-slate-700/60 hover:bg-slate-700 rounded-xl text-left transition flex items-center gap-3 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-black text-white">পুশ নোটিফিকেশন পাঠান</span>
                      <span className="text-[10px] text-slate-400">সকল গ্রাহকদের নোটিফাই করুন</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. ADD PRODUCT FORM */}
          {activeMenu === "add-product" && (
            <div className="max-w-3xl space-y-6">
              <div>
                <h2 className="text-xl font-black text-white">নতুন পণ্য যুক্ত করুন</h2>
                <p className="text-xs text-slate-400 mt-1">পণ্যের তথ্য প্রদান করে আপনার ক্যাটালগে যুক্ত করুন</p>
              </div>

              <form onSubmit={handleCreateProduct} className="bg-slate-800 border border-slate-700 rounded-2xl p-5 sm:p-6 space-y-4">
                
                {/* Product Name & Code */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-black text-slate-300">পণ্যের নাম *</label>
                    <input
                      type="text"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="যেমন: প্রিমিয়াম বাসমতি চাল"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-300">পণ্য কোড (Code)</label>
                    <input
                      type="text"
                      value={customProductCode}
                      onChange={(e) => setCustomProductCode(e.target.value)}
                      placeholder="যেমন: 502"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-amber-300 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Category & Price */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-300">ক্যাটাগরি *</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                      required
                    >
                      <option value="">ক্যাটাগরি বাছুন</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-300">নিয়মিত মূল্য (৳) *</label>
                    <input
                      type="number"
                      value={regularPrice}
                      onChange={(e) => setRegularPrice(e.target.value)}
                      placeholder="যেমন: ১০০০"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-300">ছাড় (%)</label>
                    <input
                      type="number"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(e.target.value)}
                      placeholder="যেমন: ১০"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-amber-300 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Image Upload Row */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-300">পণ্যের ছবি (সর্বোচ্চ ৫টি)</label>
                  
                  <div className="flex flex-wrap gap-3 items-center">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-700 group">
                        <img src={img} alt="Product" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-400 transition"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}

                    {images.length < 5 && (
                      <label className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-700 hover:border-emerald-500 bg-slate-900/60 flex flex-col items-center justify-center text-slate-400 cursor-pointer transition">
                        <ImageIcon className="w-5 h-5" />
                        <span className="text-[9px] font-bold mt-1">ছবি যোগ</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={isUploading}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-[#053d26] hover:bg-[#032819] text-amber-300 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-98"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin text-amber-300" /> : <PackagePlus className="w-4 h-4" />}
                    <span>পণ্য যোগ করুন</span>
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* 3. MODULAR SUB-COMPONENTS */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 sm:p-6 text-slate-100">
            {activeMenu === "all-products" && <ProductManagement />}
            {activeMenu === "orders" && <OrderManagement />}
            {activeMenu === "category-icons" && <CategoryIconManagement />}
            {activeMenu === "category-visibility" && <CategoryVisibilityManagement />}
            {activeMenu === "food-subcategories" && <FoodSubcategoryManagement />}
            {activeMenu === "main-banners" && <MainBannerManagement />}
            {activeMenu === "banner-management" && <BannerManagement />}
            {activeMenu === "delivery-settings" && <DeliverySettings />}
            {activeMenu === "delivery-management" && <CourierDeliveryManagement />}
            {activeMenu === "matrimonial-management" && <BiodataManagement />}
            {activeMenu === "telecom-management" && <TelecomManagement />}
            {activeMenu === "promo-codes" && <PromoCodeManagement />}
            {activeMenu === "user-management" && (
              <UserManagement onSendNotification={handleSendNotificationToUser} />
            )}
            {activeMenu === "onesignal" && (
              <OneSignalConfig selectedUser={selectedUserForNotification} />
            )}
            {activeMenu === "email-automation" && <EmailAutomationSection />}
            {activeMenu === "reciter-management" && <ReciterManagement />}
            {activeMenu === "video-tilawat-management" && <VideoTilawatManagement />}
            {activeMenu === "template-management" && <TemplateManagement />}
            {activeMenu === "font-management" && <FontManagement />}
            {activeMenu === "caption-management" && <CaptionManagement />}
            {activeMenu === "floating-bubble" && <FloatingBubbleAdminSettings />}
            {activeMenu === "integration-center" && <IntegrationCenter />}
            {activeMenu === "signing-keystore" && (
              <div className="space-y-4">
                <h3 className="text-base font-black text-white">আসল Upload Certificate ও Keystore ফাইল</h3>
                <div className="flex gap-2">
                  <button onClick={() => navigator.clipboard.writeText(CERT_TEXT)} className="py-2 px-4 bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2">
                    <Copy className="w-4 h-4" />
                    <span>সার্টিফিকেট কপি করুন</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </main>
      </div>

    </div>
  );
};
