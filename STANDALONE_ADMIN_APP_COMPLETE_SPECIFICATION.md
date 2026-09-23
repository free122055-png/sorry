# Al Mayadin Bazar - Standalone Admin App Complete Specification & Integration Blueprint

এই ডকুমেন্টটি নতুন Google AI Studio প্রজেক্টে একটি সম্পূর্ণ আলাদা **Standalone Admin App** তৈরি করার জন্য প্রয়োজনীয় ফায়ারবেস কনফিগারেশন, ডাটাবেস স্কিমা, এপিআই ইন্টিগ্রেশন এবং ব্যাকএন্ড আর্কিটেকচারের চূড়ান্ত নির্দেশিকা।

> ⚠️ **গুরুত্বপূর্ণ নিরাপত্তা নির্দেশিকা**: বর্তমান User App এবং অ্যাপের ভেতরের বর্তমান Admin Panel আগের মতোই ১০০% সচল ও অক্ষত রয়েছে। কোনো কোড বা ডাটাবেস পরিবর্তন বা ডিলেট করা হয়নি।

---

## ১. ফায়ারবেস প্রজেক্ট ও ডাটাবেস কনফিগারেশন (Firebase Connection Info)

নতুন প্রজেক্ট খোলার পর একই ফায়ারস্টোর ডাটাবেসে কানেক্ট করার জন্য `firebase-applet-config.json` ফাইল তৈরি করে নিচের অবজেক্টটি ব্যবহার করতে হবে:

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

**SDK Initialization Code (`src/lib/firebase.ts`):**
```typescript
import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, { experimentalForceLongPolling: true }, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
```

---

## ২. ফায়ারস্টোর কালেকশন ও ডকুমেন্টের তালিকা (Firestore Collections)

এডমিন প্যানেল এবং ইউজার অ্যাপের মধ্যে ডাটা আদান-প্রদানের জন্য ব্যবহৃত ফায়ারস্টোর কালেকশনসমূহ:

1. **`users`** (Collection) - ইউজার ও এডমিন প্রোফাইল
2. **`products`** (Collection) - মূল ই-কমার্স প্রোডাক্ট ক্যাটালগ
3. **`orders`** (Collection) - সাধারণ কাস্টমার অর্ডার
4. **`food_orders`** (Collection) - গ্রোসারি ও ফুড ডাইরেক্ট বাই অর্ডার
5. **`categories`** (Collection) - প্রোডাক্ট ক্যাটাগরি
6. **`subcategories`** (Collection) - সাব-ক্যাটাগরি রিলেশন
7. **`food_subcategories`** (Collection) - গ্রোসারি ফুড ক্যাটালগ ফিল্টার
8. **`main_banners`** (Collection) - অ্যাপ হোমপেজ মূল স্লাইডার
9. **`category_icons`** (Collection) - কাস্টম ক্যাটাগরি আইকন
10. **`configs`** (Collection - Specific Docs):
    - `configs/integration_steadfast` (স্টিডফাস্ট কুরিয়ার API)
    - `configs/integration_sms` (SAS Bulk SMS Gateway API)
    - `configs/integration_onesignal` (OneSignal Push Notification)
11. **`settings`** (Collection - Specific Docs):
    - `settings/category_visibility` (ক্যাটাগরি হাইড/শো ফিল্টার)
    - `settings/floating_bubble` (ফ্লোটিং অফার/সাপোর্ট বাবল)
12. **`app_settings`** (Collection - Specific Docs):
    - `app_settings/delivery_config` (ডেলিভারি চার্জ সেটিং)
    - `app_settings/category_banners` (পেজ প্রমোশন ব্যানার)
13. **`notifications`** (Collection) - পুশ নোটিফিকেশন ব্রডকাস্ট রেকর্ড
14. **`sms_history`** (Collection) - পাঠানো এসএমএস হিস্ট্রি
15. **`caption_categories`** & **`captions`** (Collections) - ক্যাপশন ঘর পোস্ট
16. **`video_tilawat`** & **`reciters`** (Collections) - তিলওয়াত ও ক্বারী প্রোফাইল
17. **`templates`** & **`pixel_custom_fonts`** (Collections) - পিক্সেল টুলস ব্যানার ও ফন্ট
18. **`stores`** (Collection) - মাল্টি-ভেন্ডর ফুড স্টোর

---

## ৩. কালেকশন স্কিমা ও ফিল্ডের বিস্তারিত কাজ (Detailed Field Specification)

### A. `users` Collection Document Schema
- `id` (string): ইউজারের ইউনিক আইডি / Phone / Auth UID
- `phoneNumber` (string): মোবাইল নম্বর (যেমন: `017xxxxxxxx`)
- `displayName` (string): ইউজারের নাম
- `email` (string): ইমেইল আইডি
- `role` (string): `'admin'` অথবা `'customer'` (Role-based access control)
- `status` (string): `'active'` অথবা `'blocked'` (ইউজার ব্লক স্ট্যাটাস)
- `password` / `userPassword` (string): ইউজার এনক্রিপ্টেড/হ্যাশড পাসওয়ার্ড
- `createdAt` (number): একাউন্ট খোলার সময় (Unix timestamp ms)
- `lastLoginAt` (number): সর্বশেষ লগইন সময়

### B. `products` Collection Document Schema
- `id` (string): প্রোডাক্ট আইডি
- `name` (string): পণ্যের নাম (English)
- `nameBn` (string): পণ্যের নাম (বাংলা)
- `customProductCode` (string): ইউনিক প্রোডাক্ট কোড (যেমন: `SKU-309`)
- `categoryId` (string): সংশ্লিষ্ট ক্যাটাগরি আইডি
- `category` (string): ক্যাটাগরির নাম
- `basePrice` / `regularPrice` (number): পণ্যের আসল মূল্য (টাকা)
- `discountPercent` (number): ছাড়ের শতাংশ (যেমন: `15`)
- `salePrice` (number): ছাড়ের পর বিক্রয় মূল্য
- `stockStatus` (string): `'in_stock'` অথবা `'out_of_stock'`
- `stockQuantity` (number): স্টকে থাকা পণ্যের পরিমাণ
- `sizes` (array of strings): সাইজ/ভ্যারিয়েন্ট (যেমন: `["M", "L", "XL", "1 KG"]`)
- `images` (array of strings): ছবির ইউআরএল লিঙ্ক
- `image` (string): প্রধান কভার ছবি
- `description` (string): পণ্যের বিস্তারিত বিবরণ
- `isBestSelling` (boolean): বেস্ট সেলিং ট্যাগ
- `isFeatured` (boolean): ফিচার্ড ট্যাগ
- `status` (string): `'active'` বা `'inactive'`
- `createdAt` (number): পণ্য তৈরির সময়

### C. `food_orders` & `orders` Collection Document Schema
- `id` (string): অর্ডার আইডি (যেমন: `ORD-178934`)
- `orderNumber` (string): ট্র্যাকিং নম্বর
- `userId` (string): ক্রেতার মোবাইল নম্বর / আইডি
- `customerName` (string): কাস্টমারের নাম
- `customerPhone` (string): কাস্টমারের মোবাইল নম্বর
- `deliveryAddress` (string): ডেলিভারি ঠিকানা
- `items` (array of objects): অর্ডারের প্রোডাক্টসমূহ `[{ id, name, price, quantity, size, image }]`
- `subtotal` (number): মোট পণ্যের দাম
- `deliveryFee` (number): ডেলিভারি চার্জ
- `total` / `totalAmount` (number): সর্বমোট পরিশোধযোগ্য টাকা
- `paymentMethod` (string): `'cod'` (Cash on Delivery), `'bkash'`, `'nagad'`
- `status` (string): `'pending'` -> `'processing'` -> `'shipped'` -> `'delivered'` -> `'cancelled'`
- `courierBooking` (object): কুরিয়ারের তথ্য `{ consignment_id, tracking_code, status }`
- `createdAt` (number): অর্ডার করার তারিখ ও সময়

### D. `configs/integration_steadfast` Document Schema
- `apiKey` (string): স্টিডফাস্ট কুরিয়ারের দেওয়া এপিআই কী
- `secretKey` (string): স্টিডফাস্ট কুরিয়ারের সিক্রেট কী
- `enabled` (boolean): কুরিয়ার অটোমেশন সক্রিয় কিনা (`true/false`)

### E. `configs/integration_sms` Document Schema
- `apiKey` (string): SAS Bulk SMS Gateway API Key
- `senderId` (string): বাল্ক এসএমএস সেন্ডার আইডি
- `gatewayUrl` (string): এসএমএস গেটওয়ে এপিআই এন্ডপয়েন্ট
- `masterOtpEnabled` (boolean): ওটিপি সিস্টেম চালু আছে কিনা

### F. `configs/integration_onesignal` Document Schema
- `appId` (string): OneSignal App ID
- `restApiKey` (string): OneSignal REST API Key
- `imgbbApiKey` (string): ইমেজ হোস্ট করার জন্য ImgBB API Key

### G. `app_settings/delivery_config` Document Schema
- `insideDhaka` (number): ঢাকা সিটির ভেতর ডেলিভারি ফি (যেমন: `৬০`)
- `outsideDhaka` (number): ঢাকার বাইরে ডেলিভারি ফি (যেমন: `১২০`)
- `freeDeliveryThreshold` (number): কত টাকার উপরে ফ্রি ডেলিভারি (যেমন: `১৫০০`)

---

## ৪. বর্তমান Admin Panel-এর সম্পূর্ণ ২১টি ফাংশনালিটির তালিকা

১. **Dashboard & Analytics**: মোট বিক্রি, পেন্ডিং অর্ডার, মোট কাস্টমার ও স্টক স্ট্যাটাস সম্বলিত সংক্ষিপ্ত সারসংক্ষেপ।
2. **Order Management**: সকল অর্ডারের রিয়েল-টাইম লিস্ট, অর্ডারের তথ্য পরিবর্তন, স্ট্যাটাস আপডেট ও কাস্টমার ইনভয়েস ডাউনলোড।
3. **Courier Delivery Automation**: স্টিডফাস্ট কুরিয়ার এপিআই কানেক্ট করে এক ক্লিকে পার্সেল এন্ট্রি (Consignment) এবং লাইভ কুরিয়ার ট্র্যাকিং।
4. **Product Management**: কাস্টম প্রোডাক্ট কোড, প্রাইজ, ডিসকাউন্ট, মাল্টিপল ইমেজ ও স্টক ইন/আউট কন্ট্রোলসহ ক্যাটাগরি অনুযায়ী প্রোডাক্ট আপলোড ও এডিট।
5. **Category & Subcategory Control**: নতুন ক্যাটাগরি/সাব-ক্যাটাগরি যোগ করা, আইকন ও এসভিজি ম্যানেজমেন্ট।
6. **Category Visibility Management**: ইউজার অ্যাপে নির্দিষ্ট ক্যাটাগরি সাময়িকভাবে হাইড বা শো করার ডাইনামিক ফিল্টার।
7. **User Management**: সমস্ত গ্রাহকদের তালিকা দেখা, ফোন নম্বর ও নাম এডিট, পাসওয়ার্ড পরিবর্তন, কাস্টমারকে এডমিন বানানো এবং একাউন্ট ব্লক/আনব্লক করা।
8. **Main Banner Management**: অ্যাপের হোম স্ক্রিনের মূল স্লাইডার ব্যানার যোগ ও ডিলিট করা।
9. **Category & Offer Banners**: নির্দিষ্ট ক্যাটাগরি বা বিশেষ অফারের জন্য ব্যানার লিঙ্ক ও ক্লিক একশন সেট করা।
10. **OneSignal Push Notification Manager**: সমস্ত ইউজারকে অথবা নির্দিষ্ট কোনো কাস্টমারকে ছবি ও টাইটেলসহ পুশ নোটিফিকেশন ব্রডকাস্ট করা।
11. **SMS Gateway Config & History**: বাল্ক এসএমএস গেটওয়ে কনফিগার করা এবং কাস্টমারদের পাঠানো ওটিপি/মেসেজের হিস্ট্রি ট্র্যাকিং।
12. **Integration Center**: কুরিয়ার, নোটিফিকেশন ও এসএমএস গেটওয়ের কানেকশন স্ট্যাটাস এক জায়গা থেকে মনিটর করা।
13. **Delivery Fee Management**: ঢাকা এবং ঢাকার বাইরের ডেলিভারি চার্জ লাইভ আপডেট করা।
14. **Floating Bubble Admin Settings**: অ্যাপের ভাসমান অফার বা কাস্টমার সাপোর্ট বাবল বার্তা ও লিংক পরিবর্তন করা।
15. **Islamic Tilawat Management**: আল কুরআন তিলওয়াতের ভিডিও/অডিও লিঙ্ক যোগ ও ডিলিট করা।
16. **Reciter Management**: ক্বারী সাহেবের নাম, ছবি ও প্রোফাইল যুক্ত করা।
17. **Caption Ghor Management**: ফেসবুক/সোশ্যাল মিডিয়া ক্যাপশন ও স্ট্যাটাসের ক্যাটাগরি এবং টেক্সট ম্যানেজ করা।
18. **Pixel Design Template Management**: পিক্সেল এডিটিং টুলসের ফ্রেম ও ব্যানার টেমপ্লেট নিয়ন্ত্রণ।
19. **Font Management**: কাস্টম বাংলা ফন্ট আপলোড ও নিয়ন্ত্রণ।
20. **Email Automation Settings**: সার্ভিস ট্রানজেকশনাল ইমেইল টেমপ্লেট সেটআপ।
21. **Super Admin Multi-store Control**: রেস্তোরাঁ ও ফুড স্টোর ভেন্ডর কন্ট্রোল।

---

## ৫. Admin Login, Security & Role System

১. **Role-Based Access Control (RBAC)**:
   - ফায়ারবেস Auth ও Firestore `users` কালেকশনে প্রতিটি ইউজারের প্রোফাইলে `role` ফিল্ড রয়েছে।
   - শুধুমাত্র `role === 'admin'` হলে এডমিন প্যানেল এক্সেস করার অনুমতি পায়।

২. **Protected Route (কোড লজিক)**:
   ```tsx
   export const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly }) => {
     const { user, profile, loading } = useAuth();
     if (loading) return <LoadingSpinner />;
     if (!user) return <Navigate to="/login" replace />;
     if (adminOnly && profile?.role !== "admin") {
       return <Navigate to="/" replace />;
     }
     return <>{children}</>;
   };
   ```

---

## ৬. ব্যবহৃত External APIs & Firebase Integrations

১. **SAS Bulk SMS Gateway**:
   - URL: `https://api.sms.net.bd/sendsms`
   - ব্যবহার: মোবাইল ওটিপি ভেরিফিকেশন এবং অর্ডার কনফার্মেশন এসএমএস পাঠাতে।

২. **Steadfast Courier API**:
   - URL: `https://portal.steadfast.com.bd/api/v1/create_order`
   - ব্যবহার: অর্ডারের কুরিয়ার ট্র্যাকিং ও অটোমেটিক পার্সেল ক্রিয়েট করতে।

৩. **OneSignal Push Notification API**:
   - URL: `https://onesignal.com/api/v1/notifications`
   - ব্যবহার: এডমিন প্যানেল থেকে কাস্টমারের মোবাইলে পুশ নোটিফিকেশন পাঠাতে।

৪. **ImgBB Image Upload API**:
   - URL: `https://api.imgbb.com/1/upload`
   - ব্যবহার: পণ্য ও ব্যানারের ছবি হাই-স্পিড সিডিএন-এ হোস্ট করতে।

---

## ৭. নতুন Standalone Admin App তৈরির জন্য ধাপসমূহ (Step-by-Step Guide)

যখন আপনি নতুন প্রজেক্ট খুলে আলাদা Admin App তৈরি করবেন, তখন নিচের ধাপগুলো অনুসরণ করুন:

1. **নতুন প্রজেক্ট খুলুন**: Google AI Studio-তে গিয়ে নতুন একটি Vite + React + TypeScript প্রজেক্ট তৈরি করুন।
2. **ফায়ারবেস কনফিগারেশন বসান**: প্রজেক্টে `firebase-applet-config.json` ফাইলটি তৈরি করে ১ নং সেকশনের JSON কোডটি পেস্ট করুন।
3. **প্রয়োজনীয় প্যাকেজ**: `lucide-react`, `motion`, `firebase`, `react-router-dom` ইনস্টল করুন।
4. **মডিউল কপি ও পেস্ট**: এই ডকুমেন্টের ৩ নং সেকশনের স্কিমা অনুযায়ী `OrderManagement`, `ProductManagement`, `UserManagement`, `IntegrationCenter` ইত্যাদি কম্পোনেন্টসমূহ তৈরি করুন।
5. **লগইন স্ক্রিন**: এডমিন ইমেইল/ফোন ও পাসওয়ার্ড দিয়ে লগইন করার পর `users` কালেকশন থেকে `role == 'admin'` চেক করে ড্যাশবোর্ডে প্রবেশ করান।

---

> ✅ **সর্বশেষ অবস্থা**: আপনার বর্তমান User App এবং অ্যাপের ভেতরের এডমিন প্যানেল সম্পূর্ণ সুরক্ষিত, সচল এবং ১% ও পরিবর্তিত হয়নি। ভবিষ্যতে আলাদা Admin App তৈরির সময় এই ডকুমেন্টেশনটি হুবহু ব্যবহার করতে পারবেন।
