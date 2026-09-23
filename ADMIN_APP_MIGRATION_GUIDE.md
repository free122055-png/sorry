# Al Mayadin Bazar - Standalone Admin App Migration Guide

এই গাইডটিতে বর্তমান **User App** থেকে সম্পূর্ণ **Admin Panel**-কে একটি স্বতন্ত্র (Standalone) **Admin App**-এ রূপান্তর করার সম্পূর্ণ স্ট্রাকচার, কোড ফাইল লিস্ট, ফায়ারবেস কানেকশন এবং ডাটাবেস কালেকশনের বিবরণ প্রস্তুত করে দেওয়া হয়েছে।

---

## ১. Firebase Connection Details (ফায়ারবেস কনফিগারেশন)

নতুন Admin App তৈরির সময় রেজিস্টার ও কানেক্ট করার জন্য নিচের ঠিক একই ফায়ারবেস ক্রেডেনশিয়াল ব্যবহার করতে হবে, যাতে উভয় অ্যাপ একই ডাটাবেস শেয়ার করে:

```json
{
  "projectId": "gen-lang-client-0777100836",
  "appId": "1:812848601619:web:437b098a70a186eda23de6",
  "apiKey": "AIzaSyAvAsDpGMaPHD3yZVwu5NM5exjmEJWxK7w",
  "authDomain": "gen-lang-client-0777100836.firebaseapp.com",
  "firestoreDatabaseId": "ai-studio-almayadinbazar-ba908b47-5867-409c-b05f-1cab5d17076c",
  "storageBucket": "gen-lang-client-0777100836.firebasestorage.app",
  "messagingSenderId": "812848601619",
  "oAuthClientId": "812848601619-a3pe3u178qqmfn402ofdrabpg2687q4v.apps.googleusercontent.com"
}
```

---

## ২. Firestore Database Collections & Documents (ডাটাবেস তালিকা)

এডমিন প্যানেল যেসব ফায়ারস্টোর কালেকশন ও ডকুমেন্ট নিয়ন্ত্রণ করে:

| কালেকশন/ডকুমেন্ট নাম | টাইপ | বিবরণ ও কাজ |
|---|---|---|
| `users` | Collection | গ্রাহক ও এডমিন একাউন্ট তালিকা, ভূমিকা (role: admin/customer), ব্লক/আনব্লক, পাসওয়ার্ড আপডেট |
| `products` | Collection | সকল পণ্যের স্টক, মূল্য, ডিসকাউন্ট, ক্যাটাগরি, ছবি ও বিবরণ নিয়ন্ত্রণ |
| `orders` & `food_orders` | Collection | সকল কাস্টমার অর্ডার ট্র্যাকিং, স্ট্যাটাস পরিবর্তন (Pending, Delivered, Cancelled) |
| `categories` | Collection | প্রধান প্রোডাক্ট ক্যাটাগরি ম্যানেজমেন্ট |
| `subcategories` | Collection | সাব-ক্যাটাগরি রিলেশনশিপ |
| `food_subcategories` | Collection | ফুড ও গ্রোসারির সাব-ক্যাটাগরি ক্রমানুসার |
| `main_banners` | Collection | হোমপেজ স্লাইডার ও ব্যানার প্রমোশন নিয়ন্ত্রণ |
| `category_icons` | Collection | ক্যাটাগরি কাস্টম আইকন ও এসভিজি |
| `configs/integration_steadfast` | Document | স্টিডফাস্ট কুরিয়ার API Key ও Secret কনফিগারেশন |
| `configs/integration_sms` | Document | SAS Bulk SMS Gateway API Key, Sender ID ও মাদার OTP সেটিং |
| `configs/integration_onesignal` | Document | OneSignal Push Notification App ID, REST API Key ও ImgBB Key |
| `settings/category_visibility` | Document | অ্যাপে ক্যাটাগরি হাইড বা শো করার ডাইনামিক ফিল্টার |
| `settings/floating_bubble` | Document | অ্যাপের ফ্লোটিং সাপোর্ট ও অফার বাবল নিয়ন্ত্রণ |
| `app_settings/delivery_config` | Document | ঢাকা ও ঢাকার বাইরের ডেলিভারি চার্জ নির্ধারণ |
| `app_settings/category_banners` | Document | পেজ-ভিত্তিক প্রমোশনাল ব্যানার ব্যানার |
| `sms_history` | Collection | গ্রাহকদের পাঠানো এসএমএস লগ ও ট্র্যাকিং |
| `notifications` | Collection | এডমিন থেকে পুশ নোটিফিকেশন ব্রডকাস্ট হিস্ট্রি |
| `templates` | Collection | পিক্সেল এডিটর ব্যানার টেমপ্লেট |
| `pixel_custom_fonts` | Collection | বাংলা কাস্টম ফন্ট আপলোড ও ম্যানেজমেন্ট |
| `caption_categories` & `captions` | Collection | ক্যাপশন ঘর সোশ্যাল মিডিয়া পোস্ট কন্টেন্ট |
| `video_tilawat` & `reciters` | Collection | ইসলামিক তিলওয়াত ও ক্বারী প্রোফাইল |
| `user_bubbles` | Collection | কাস্টমার ভিত্তিক ডাইনামিক বাবল অফার |

---

## ৩. Admin App Directory Structure (ফাইল ও ফোল্ডার স্ট্রাকচার)

স্বতন্ত্র এডমিন অ্যাপের প্রজেক্ট স্ট্রাকচার হবে নিম্নরূপ:

```text
admin-app/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── firebase-applet-config.json
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── types.ts
│   ├── lib/
│   │   ├── firebase.ts          (Firestore setup with experimentalForceLongPolling)
│   │   ├── smsService.ts        (Bulk SMS API driver)
│   │   ├── notifications.ts     (OneSignal Push Notification driver)
│   │   └── steadfastApi.ts      (Steadfast Courier API wrapper)
│   ├── pages/
│   │   ├── AdminHome.tsx        (এডমিন মূল ড্যাশবোর্ড ও নেভিগেশন)
│   │   ├── AdminProductListing.tsx
│   │   └── SuperAdmin.tsx       (স্টোর ও মাল্টি-ভেন্ডর সেটিংস)
│   └── components/
│       └── admin/
│           ├── OrderManagement.tsx              (অর্ডার প্রসেসিং ও ইনভয়েস)
│           ├── CourierDeliveryManagement.tsx    (স্টিডফাস্ট কুরিয়ার বুকিং)
│           ├── ProductManagement.tsx            (পণ্য যোগ, এডিট ও স্টক)
│           ├── UserManagement.tsx               (কাস্টমার ও এডমিন তালিকা)
│           ├── MainBannerManagement.tsx         (হোম স্লাইডার ব্যানার)
│           ├── BannerManagement.tsx             (অফার ব্যানার)
│           ├── CategoryVisibilityManagement.tsx (ক্যাটাগরি শো/হাইড)
│           ├── CategoryIconManagement.tsx       (ক্যাটাগরি আইকন)
│           ├── FoodSubcategoryManagement.tsx    (ফুড সাবক্যাটাগরি)
│           ├── IntegrationCenter.tsx            (এপিআই হাব)
│           ├── SteadfastConfig.tsx              (কুরিয়ার এপিআই সেটিংস)
│           ├── SmsConfig.tsx                    (এসএমএস গেটওয়ে সেটিংস)
│           ├── OneSignalConfig.tsx              (পুশ নোটিফিকেশন সেটিংস)
│           ├── DeliveryManagement.tsx           (ডেলিভারি চার্জ সেটিং)
│           ├── FloatingBubbleAdminSettings.tsx  (ফ্লোটিং অফার বাবল)
│           ├── VideoTilawatManagement.tsx       (ইসলামিক তিলওয়াত)
│           ├── ReciterManagement.tsx            (ক্বারী প্রোফাইল)
│           ├── CaptionManagement.tsx            (ক্যাপশন ঘর)
│           ├── TemplateManagement.tsx           (পিক্সেল টেমপ্লেট)
│           └── FontManagement.tsx               (কাস্টম ফন্ট আপলোড)
```

---

## ৪. নিরাপত্তা ও রোল-বেসড এক্সেস (Security & Auth)

১. এডমিন অ্যাপে লগইন করার সময় `users` কালেকশনে উক্ত ব্যবহারকারীর `role == 'admin'` কিনা তা যাচাই করতে হবে।
২. ফায়ারস্টোর রুলস (`firestore.rules`) থেকে এডমিনদের জন্য সকল রাইট (Write) পারমিশন নিশ্চিত করা আছে।

---

> **নোট**: বর্তমান ইউজার অ্যাপের ভেতরের এডমিন প্যানেল পুরোপুরি অক্ষত এবং সচল রয়েছে।
