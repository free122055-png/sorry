import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Header } from "./components/Header";
import { BottomNav } from "./components/BottomNav";
import { CartProvider } from "./context/CartContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AuthModal } from "./components/AuthModal";
import { NotificationInitializer } from "./components/NotificationInitializer";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DeepLinkHandler } from "./components/DeepLinkHandler";
import { SplashScreen } from "./components/SplashScreen";
import { EmailPromptModal } from "./components/EmailPromptModal";
import { FloatingOrderBubble } from "./components/FloatingOrderBubble";

import { NotificationProvider } from "./context/NotificationContext";
import { QuranProvider } from "./context/QuranContext";
import { LanguageProvider } from "./context/LanguageContext";

// Primary navigation & core feature pages imported directly for 0ms instant transitions
import { Home } from "./pages/Home";
import { Categories } from "./pages/Categories";
import { Cart } from "./pages/Cart";
import { Account } from "./pages/Account";
import { Login } from "./pages/Login";
import { ProductListing } from "./pages/ProductListing";
import { ProductDetails } from "./pages/ProductDetails";
import { Checkout } from "./pages/Checkout";
import { IslamicTilawat } from "./pages/IslamicTilawat";
import { Reminders } from "./pages/Reminders";
import { Orders } from "./pages/Orders";
import { Wishlist } from "./pages/Wishlist";
import { PixelEditingTools } from "./pages/PixelEditingTools";
import { CaptionGhorPage } from "./pages/CaptionGhorPage";
import { GovServices } from "./pages/GovServices";
import { GovCategoryDetails } from "./pages/GovCategoryDetails";
import { MatrimonialPage } from "./pages/MatrimonialPage";
import { TelecomPage } from "./pages/TelecomPage";

// Robust dynamic import wrapper with automatic retry and reload recovery on dev server restart
function safeLazy<T extends React.ComponentType<any>>(
  importFn: () => Promise<any>,
  exportName?: string
) {
  return lazy(async () => {
    try {
      const module = await importFn();
      if (exportName && module[exportName]) {
        return { default: module[exportName] };
      }
      if (module.default) {
        return { default: module.default };
      }
      return module;
    } catch (error) {
      console.warn("Dynamic import chunk update detected, reloading page for fresh bundle...", error);
      const lastReload = sessionStorage.getItem("vite_chunk_reload_time");
      const now = Date.now();
      // Only reload if we haven't reloaded in the last 3 seconds to avoid infinite loops
      if (!lastReload || now - parseInt(lastReload, 10) > 3000) {
        sessionStorage.setItem("vite_chunk_reload_time", now.toString());
        window.location.reload();
      }
      return new Promise(() => {}); // Hold until reload
    }
  });
}

// Lazy loading secondary & admin pages with safeLazy wrapper
const Register = safeLazy(() => import("./pages/Register"), "Register");
const OrderDetails = safeLazy(() => import("./pages/OrderDetails"), "OrderDetails");
const Notifications = safeLazy(() => import("./pages/Notifications"), "Notifications");
const Addresses = safeLazy(() => import("./pages/Addresses"), "Addresses");
const Admin = safeLazy(() => import("./pages/Admin"), "Admin");
const SuperAdmin = safeLazy(() => import("./pages/SuperAdmin"), "SuperAdmin");
const AdminHome = safeLazy(() => import("./pages/AdminHome"), "AdminHome");
const AdminProductListing = safeLazy(() => import("./pages/AdminProductListing"), "AdminProductListing");
const FoodBuyFlow = safeLazy(() => import("./pages/FoodBuyFlow"), "FoodBuyFlow");
const BannerOfferPage = safeLazy(() => import("./pages/BannerOfferPage"), "BannerOfferPage");
const Legal = safeLazy(() => import("./pages/Legal"), "Legal");
const HelpCenter = safeLazy(() => import("./pages/HelpCenter"), "HelpCenter");
const Contact = safeLazy(() => import("./pages/Contact"), "Contact");
const AccountSettings = safeLazy(() => import("./pages/AccountSettings"), "AccountSettings");
const DownloadCert = safeLazy(() => import("./pages/DownloadCert"));
const LiveLocationSharing = safeLazy(() => import("./components/LiveLocationSharing"), "LiveLocationSharing");
const GovAdmin = safeLazy(() => import("./components/admin/GovAdmin"), "GovAdmin");
const StandaloneAdmin = safeLazy(() => import("./pages/StandaloneAdmin"), "StandaloneAdmin");

const LoadingFallback = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
    <div className="relative w-12 h-12 flex items-center justify-center mb-3">
      <div className="absolute inset-0 border-3 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin"></div>
      <div className="w-5 h-5 rounded-full bg-[#004b23] flex items-center justify-center text-[#ffcc00] font-black text-[10px]">
        🌙
      </div>
    </div>
    <span className="text-xs font-black text-gray-700 tracking-wide">AL MAYADIN BAZAR</span>
    <span className="text-[10px] font-semibold text-emerald-600 mt-0.5 animate-pulse">অনুগ্ৰহ করে অপেক্ষা করুন...</span>
  </div>
);

function EmailPromptHandler() {
  const { user, profile, updateUserEmail, skipEmailPrompt } = useAuth();
  const [showModal, setShowModal] = React.useState(false);

  React.useEffect(() => {
    if (user && profile) {
      const email = profile.email || "";
      const isPlaceholder = !email || email.includes("@allmayadin.com") || !email.includes("@");
      let dismissed = false;
      try {
        dismissed = 
          Boolean(profile.emailSkipped) ||
          localStorage.getItem("email_prompt_dismissed") === "true" ||
          sessionStorage.getItem("email_prompt_dismissed") === "true";
      } catch {}

      if (isPlaceholder && !dismissed) {
        setShowModal(true);
      } else {
        setShowModal(false);
      }
    } else {
      setShowModal(false);
    }
  }, [user, profile]);

  const handleSuccess = async (newEmail: string) => {
    setShowModal(false);
    try {
      localStorage.setItem("email_prompt_dismissed", "true");
      sessionStorage.setItem("email_prompt_dismissed", "true");
    } catch {}

    try {
      await updateUserEmail(newEmail);
    } catch (err) {
      console.warn("Background updateUserEmail notice:", err);
    }
  };

  const handleClose = async () => {
    setShowModal(false);
    try {
      localStorage.setItem("email_prompt_dismissed", "true");
      sessionStorage.setItem("email_prompt_dismissed", "true");
    } catch {}
    try {
      if (skipEmailPrompt) {
        await skipEmailPrompt();
      }
    } catch (err) {
      console.warn("Background skip notice:", err);
    }
  };

  return (
    <EmailPromptModal
      isOpen={showModal}
      currentUser={{ uid: user?.uid, phoneNumber: profile?.phoneNumber || user?.phoneNumber || "", email: profile?.email || "" }}
      onSuccess={handleSuccess}
      onClose={handleClose}
      onSkip={handleClose}
    />
  );
}

function AppLayout() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isTilawat = location.pathname === "/islamic-tilawat" || location.pathname === "/tilawat";
  const isPixelEditor = location.pathname === "/pixel-editing-tools" || 
                        location.pathname === "/pixel-tools" || 
                        location.pathname === "/pixel";
  const isStandaloneAdmin = location.pathname.startsWith("/standalone-admin") || 
                            location.pathname.startsWith("/admin-portal");
  const isLogin = location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className={`w-full min-h-screen overflow-x-hidden overflow-y-auto ${
      isTilawat || isPixelEditor || isStandaloneAdmin || isLogin ? "bg-[#002A1A] pb-0" : "bg-[#f8f9fa] pb-24 md:pb-0"
    }`}>
      <SplashScreen />
      <EmailPromptHandler />
      {!isPixelEditor && !isStandaloneAdmin && !isLogin && <Header />}
      <main className={isTilawat || isPixelEditor || isStandaloneAdmin || isLogin ? "w-full min-h-screen" : "max-w-7xl mx-auto w-full"}>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/category/:categoryId" element={<ProductListing />} />
            
            {/* Food Market Dedicated "Buy" 8-Step Flow */}
            <Route path="/food/buy" element={<FoodBuyFlow />} />
            <Route path="/food/tracking/:orderId" element={<FoodBuyFlow />} />
            <Route path="/food/tracking" element={<FoodBuyFlow />} />

            {/* Food Market E-commerce Routes */}
            <Route path="/food/product/:productId" element={<ProductDetails />} />
            <Route path="/food/cart" element={<Cart />} />
            <Route path="/food/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/food/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/food/order/:orderId" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
            
            <Route path="/product/:productId" element={<ProductDetails />} />
            <Route path="/p/:productId" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/account" element={<Account />} />
            <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/order/:orderId" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
            <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/addresses" element={<ProtectedRoute><Addresses /></ProtectedRoute>} />
            
            <Route path="/legal" element={<Legal />} />
            <Route path="/privacy" element={<Legal />} />
            <Route path="/terms" element={<Legal />} />
            <Route path="/refund" element={<Legal />} />
            <Route path="/shipping" element={<Legal />} />
            <Route path="/delivery" element={<Legal />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/help-center" element={<HelpCenter />} />
            <Route path="/faq" element={<HelpCenter />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/contact-us" element={<Contact />} />
            <Route path="/account-settings" element={<AccountSettings />} />
            <Route path="/account/settings" element={<AccountSettings />} />
            <Route path="/settings" element={<AccountSettings />} />
            <Route path="/cert" element={<DownloadCert />} />
            <Route path="/download-cert" element={<DownloadCert />} />
            
            <Route path="/pixel-editing-tools" element={<PixelEditingTools />} />
            <Route path="/pixel-tools" element={<PixelEditingTools />} />
            <Route path="/pixel" element={<PixelEditingTools />} />
            
            <Route path="/matrimonial" element={<MatrimonialPage />} />
            <Route path="/biodata" element={<MatrimonialPage />} />
            <Route path="/marriage" element={<MatrimonialPage />} />

            <Route path="/telecom" element={<TelecomPage />} />
            <Route path="/telecom-service" element={<TelecomPage />} />
            <Route path="/reminders" element={<Reminders />} />
            
            <Route path="/security" element={<Legal />} />
            
            <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
            <Route path="/super-admin" element={<ProtectedRoute adminOnly><SuperAdmin /></ProtectedRoute>} />
            <Route path="/admin/home" element={<ProtectedRoute adminOnly><AdminHome /></ProtectedRoute>} />
            <Route path="/admin/category/:categoryId" element={<ProtectedRoute adminOnly><AdminProductListing /></ProtectedRoute>} />
            <Route path="/standalone-admin" element={<StandaloneAdmin />} />
            <Route path="/admin-portal" element={<StandaloneAdmin />} />
            
            <Route path="/search" element={<Categories />} />
            <Route path="/islamic-tilawat" element={<IslamicTilawat />} />
            <Route path="/tilawat" element={<IslamicTilawat />} />
            <Route path="/gov-services" element={<GovServices />} />
            <Route path="/gov-services/category/:categoryId" element={<GovCategoryDetails />} />
            <Route path="/live-location" element={<ProtectedRoute><LiveLocationSharing /></ProtectedRoute>} />
            <Route path="/caption-ghor" element={<CaptionGhorPage />} />
            <Route path="/banner-offer/:bannerId" element={<BannerOfferPage />} />
            <Route path="/offer/:bannerId" element={<BannerOfferPage />} />
          </Routes>
        </Suspense>
      </main>
      {!isPixelEditor && !isStandaloneAdmin && !isLogin && <BottomNav />}
      {!isPixelEditor && !isStandaloneAdmin && !isLogin && <FloatingOrderBubble />}
      <DeepLinkHandler />
      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <NotificationProvider>
            <NotificationInitializer />
            <CartProvider>
              <QuranProvider>
                <AppLayout />
              </QuranProvider>
            </CartProvider>
          </NotificationProvider>
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}
