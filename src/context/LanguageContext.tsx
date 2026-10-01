import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "bn" | "en";

interface Translations {
  [key: string]: {
    bn: string;
    en: string;
  };
}

const translations: Translations = {
  dashboard: { bn: "ড্যাশবোর্ড", en: "Dashboard" },
  home: { bn: "হোম", en: "Home" },
  categories: { bn: "ক্যাটাগরি", en: "Categories" },
  cart: { bn: "কার্ট", en: "Cart" },
  account: { bn: "অ্যাকাউন্ট", en: "Account" },
  searchPlaceholder: { bn: "বিশেষ উপহার ও বই খুঁজুন...", en: "Search special gifts & books..." },
  mainMarkets: { bn: "আমাদের প্রধান বাজার সমূহ", en: "Main Markets" },
  otherServices: { bn: "অন্যান্য সেবা", en: "Other Services" },
  oilCorner: { bn: "অয়েল কর্নার", en: "Oil Corner" },
  clothingShop: { bn: "কাপড় ও পরিধান", en: "Clothing Shop" },
  giftShop: { bn: "উপহার বাজার", en: "Gift Shop" },
  islamicShop: { bn: "ইসলামিক বাজার", en: "Islamic Shop" },
  tilawatLibrary: { bn: "তেলাওয়াত লাইব্রেরি", en: "Tilawat Library" },
  captionHouse: { bn: "ক্যাপশন হাউজ", en: "Caption House" },
  editingTools: { bn: "এডিটিং টুলস", en: "Editing Tools" },
  marriageBiodata: { bn: "বিবাহের বায়োডাটা", en: "Marriage Biodata" },
  mbMinutesPurchase: { bn: "এমবি ও মিনিট ক্রয়", en: "MB & Minutes Purchase" },
  reminderForLovedOnes: { bn: "প্রিয়জনের রিমাইন্ডার", en: "Reminder for Loved Ones" },
  liveLocationForLovedOnes: { bn: "প্রিয়জনের লাইভ লোকেশন", en: "Live Location for Loved Ones" },
  governmentServices: { bn: "সরকারি সেবা", en: "Government Services" },
  languageLabel: { bn: "ভাষা (Language)", en: "Language" },
  bangla: { bn: "বাংলা", en: "Bangla" },
  english: { bn: "English", en: "English" },
  login: { bn: "লগইন", en: "Login" },
  signup: { bn: "নিবন্ধন", en: "Sign Up" },
  notifications: { bn: "বিজ্ঞপ্তি", en: "Notifications" },
  settings: { bn: "সেটিংস", en: "Settings" },
  profile: { bn: "প্রোফাইল", en: "Profile" },
  admin: { bn: "অ্যাডমিন প্যানেল", en: "Admin Panel" },
  logout: { bn: "লগআউট", en: "Logout" },
  cartEmpty: { bn: "আপনার কার্ট খালি", en: "Your cart is empty" },
  checkout: { bn: "চেকআউট", en: "Checkout" },
  total: { bn: "মোট", en: "Total" },
  search: { bn: "অনুসন্ধান", en: "Search" },
  menu: { bn: "মেনু", en: "Menu" },
  allRightsReserved: { bn: "সর্বস্বত্ব সংরক্ষিত", en: "All rights reserved" },
  greeting: { bn: "আসসালামু আলাইকুম", en: "Assalamu Alaikum" },
  welcome: { bn: "স্বাগতম", en: "Welcome" },
  goldMember: { bn: "গোল্ড মেম্বার", en: "Gold Member" },
  guestUser: { bn: "গেস্ট গ্রাহক", en: "Guest Customer" },
  shopping: { bn: "শপিং", en: "Shopping" },
  allCategories: { bn: "সব ক্যাটাগরি", en: "All Categories" },
  captionHouseMenu: { bn: "❝ ক্যাপশন ঘর", en: "❝ Caption House" },
  matrimonialMenu: { bn: "💍 বিবাহের বায়োডাটা", en: "💍 Marriage Biodata" },
  myAddresses: { bn: "আমার ঠিকানা", en: "My Addresses" },
  emailOffersTitle: { bn: "ইমেইল অফার ও নোটিফিকেশন", en: "Email Offers & Notifications" },
  emailOffersDesc: { bn: "আপনার ইমেইল সেভ রাখুন, স্পেশাল অফার ও আপডেট সরাসরি ইমেইলে পাবেন", en: "Save your email to receive special offers and updates directly" },
  saveEmail: { bn: "ইমেইল সংরক্ষণ করুন", en: "Save Email" },
  saving: { bn: "সেভ হচ্ছে...", en: "Saving..." },
  enterEmail: { bn: "আপনার ইমেইল এড্রেস লিখুন", en: "Enter your email address" },
  savedSuccessfully: { bn: "সফলভাবে সংরক্ষিত হয়েছে!", en: "Saved successfully!" },
  myOrders: { bn: "🛍️ আমার অর্ডারসমূহ", en: "🛍️ My Orders" },
  wishlist: { bn: "❤️ পছন্দের তালিকা", en: "❤️ Wishlist" },
  savedAddresses: { bn: "📍 সংরক্ষিত ঠিকানা", en: "📍 Saved Addresses" },
  editProfile: { bn: "👤 প্রোফাইল এডিট", en: "👤 Edit Profile" },
  accountSettings: { bn: "⚙️ অ্যাকাউন্ট ও পাসওয়ার্ড সেটিংস", en: "⚙️ Account & Password Settings" },
  privacyPolicy: { bn: "🔒 গোপনীয়তা নীতি", en: "🔒 Privacy Policy" },
  termsAndConditions: { bn: "📜 শর্তাবলী", en: "📜 Terms & Conditions" },
  security: { bn: "🛡️ নিরাপত্তা", en: "🛡️ Security" },
  honoredCustomer: { bn: "সম্মানিত গ্রাহক", en: "Valued Customer" },
  phoneNotAdded: { bn: "মোবাইল নম্বর যোগ করা হয়নি", en: "Phone number not added" },
  pleaseSignIn: { bn: "অনুগ্রহ করে সাইন ইন করুন", en: "Please Sign In" },
  loginPromptDesc: { bn: "আপনার অর্ডার, প্রোফাইল এবং ঠিকানা দেখতে লগইন করুন।", en: "Sign in to view your orders, profile, and addresses." },
  profileUpdate: { bn: "প্রোফাইল আপডেট", en: "Update Profile" },
  name: { bn: "নাম", en: "Name" },
  phoneNumber: { bn: "ফোন নম্বর", en: "Phone Number" },
  profilePhotoUrl: { bn: "প্রোফাইল ছবি URL", en: "Profile Photo URL" },
  save: { bn: "সংরক্ষণ করুন", en: "Save" },
  cancel: { bn: "বাতিল", en: "Cancel" },
  profileUpdatedSuccess: { bn: "প্রোফাইল সফলভাবে আপডেট করা হয়েছে!", en: "Profile updated successfully!" },
  myAccount: { bn: "আমার অ্যাকাউন্ট", en: "My Account" },
  accountControl: { bn: "অ্যাকাউন্ট নিয়ন্ত্রণ", en: "Account Control" },
  legalSecurity: { bn: "আইনি ও নিরাপত্তা", en: "Legal & Security" },
  deleteAccountTitle: { bn: "স্থায়ীভাবে অ্যাকাউন্ট মুছে ফেলুন", en: "Permanently Delete Account" },
  deleteAccountDesc: { bn: "আপনার প্রোফাইল ও সমস্ত ডেটা স্থায়ীভাবে ডিলিট করুন", en: "Permanently delete your profile and all data" },
  logoutBtn: { bn: "লগআউট করুন (Logout)", en: "Log Out" },
  updateInfo: { bn: "তথ্য আপডেট করুন", en: "Update Info" },
  goBack: { bn: "ফিরে যান", en: "Go Back" },
  fullNameLabel: { bn: "আপনার নাম (Full Name)", en: "Full Name" },
  phoneLabel: { bn: "মোবাইল নম্বর (Phone Number)", en: "Phone Number" },
  photoUrlLabel: { bn: "প্রোফাইল ছবির লিঙ্ক (Photo URL)", en: "Profile Photo URL" },
  photoUrlNote: { bn: "* গুগল বা অন্য কোনো সাইট থেকে ছবির লিংক এখানে দিতে পারেন।", en: "* You can provide an image link from Google or any other site." },
  govServicesTitle: { bn: "সরকারি ওয়েবসাইট", en: "Government Websites" },
  govServicesHeadline: { bn: "সরকারি ওয়েবসাইট একসাথে", en: "Government Websites Together" },
  govServicesDesc: { bn: "জমি, যানবাহন, লাইসেন্স, শিক্ষা, স্বাস্থ্য, করসহ সব সরকারি সেবা ওয়েবসাইটের লিংক এখানে পাবেন।", en: "Find links to all government services including land, vehicles, license, education, health, tax etc." },
  govSearchPlaceholder: { bn: "কোন সেবার ওয়েবসাইট খুঁজছেন?", en: "Which service website are you looking for?" },
  govCategories: { bn: "ক্যাটাগরি সমূহ", en: "Categories" },
  govPopularSites: { bn: "জনপ্রিয় সরকারি ওয়েবসাইট", en: "Popular Government Websites" },
  viewAll: { bn: "সব দেখুন", en: "View All" },
  visitWebsite: { bn: "ওয়েবসাইট ভিজিট করুন", en: "Visit Website" },
  sites: { bn: "টি সাইট", en: "Sites" },
  liveLocationTitle: { bn: "লাইভ লোকেশন শেয়ারিং", en: "Live Location Sharing" },
  shareLocation: { bn: "লোকেশন শেয়ার করুন", en: "Share Location" },
  shareLocationDesc: { bn: "আপনার প্রিয়জন বা বন্ধুর লোকেশন দেখতে রিকুয়েস্ট পাঠান", en: "Send request to see your loved one's or friend's location" },
  searchUser: { bn: "ইউজার সার্চ করুন...", en: "Search users..." },
  selectUser: { bn: "ইউজার সিলেক্ট করুন", en: "Select user" },
  sendLocationRequest: { bn: "লোকেশন রিকুয়েস্ট পাঠান", en: "Send Location Request" },
  requestSent: { bn: "লোকেশন রিকুয়েস্ট পাঠানো হয়েছে", en: "Location Request Sent" },
  waitingForPermission: { bn: "অনুমতির জন্য অপেক্ষা করা হচ্ছে...", en: "Waiting for permission..." },
  approveLocationRequest: { bn: "হ্যাঁ, অনুমতি দিন", en: "Yes, Approve" },
  rejectLocationRequest: { bn: "না, থাক", en: "No, Thanks" },
  stopSharing: { bn: "লাইভ শেয়ারিং বন্ধ করুন", en: "Stop Live Sharing" },
  gpsPermissionTitle: { bn: "জিপিএস ও লোকেশন চালু করুন", en: "Turn on GPS & Location" },
  gpsPermissionDesc: { bn: "প্লে-স্টোর অ্যাপে নিখুঁত রিয়েল-টাইম লোকেশন দেখার জন্য আপনার মোবাইলের GPS Location Permission অন থাকা আবশ্যক।", en: "GPS Location Permission must be ON for accurate real-time location in the Play Store app." },
  turnOnPermission: { bn: "📍 অনুমতি চালু ও নিশ্চিত করুন", en: "📍 Turn on & Confirm Permission" },
  downloadApp: { bn: "অফিসিয়াল অ্যাপ ডাউনলোড করুন", en: "Download Official App" },
  playStore: { bn: "গুগল প্লে-স্টোর", en: "Google Play Store" },
  liveChat: { bn: "লাইভ চ্যাট", en: "Live Chat" },
  chatList: { bn: "চ্যাট তালিকা", en: "Chat List" },
  startNewChat: { bn: "নতুন চ্যাট শুরু করুন", en: "Start New Chat" },
  typeMessage: { bn: "মেসেজ লিখুন...", en: "Type message..." },
  sendMessage: { bn: "সেন্ড করুন", en: "Send Message" },
  noMessages: { bn: "এখনো কোনো মেসেজ নেই", en: "No messages yet" },
  online: { bn: "অনলাইন", en: "Online" },
  offline: { bn: "অফলাইন", en: "Offline" }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("app_language");
    return (saved === "bn" || saved === "en") ? saved : "bn";
  });

  useEffect(() => {
    localStorage.setItem("app_language", language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState(prev => (prev === "bn" ? "en" : "bn"));
  };

  const t = (key: string): string => {
    if (translations[key]) {
      return translations[key][language] || translations[key]["bn"] || key;
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
