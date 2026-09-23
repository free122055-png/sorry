# Al Mayadin Bazar - Admin App Developer Integration Handbook

এই ফাইলটি আপনার এডমিন অ্যাপের ডেভেলপারকে কপি করে দেওয়ার জন্য তৈরি করা হয়েছে। এতে সমস্ত ইন্টিগ্রেশন এপিআই, ক্রেডেনশিয়াল, ফায়ারবেস কনফিগারেশন এবং কোনটি কীভাবে কাজ করে তার বিস্তারিত বিবরণ দেওয়া হলো।

---

## 1. Firebase Backend Connection Credentials (ফায়ারবেস কানেকশন)

এডমিন অ্যাপে মূল কাস্টমার অ্যাপের একই ফায়ারস্টোর ডাটাবেসে কানেক্ট করতে `firebase-applet-config.json` ফাইল তৈরি করে নিচের ক্রেডেনশিয়ালগুলো বসাতে হবে:

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

> **কীভাবে কাজ করে**: `initializeFirestore` করার সময় অবশ্যই `experimentalForceLongPolling: true` অপশনটি দিয়ে চালু করতে হবে। এটি ওয়েবসকেট ব্লক বা স্যান্ডবক্স নেটওয়ার্কের কানেকশন ডিলে বাইপাস করে ০ মিলিসেকেন্ডে ফায়ারস্টোর কানেক্ট করে।

---

## 2. OneSignal Push Notification System (পুশ নোটিফিকেশন)

- **OneSignal App ID**: `d28392ee-2a0f-4f62-ba65-03fb3e0915ab`
- **REST API Key**: Firestore-এর `configs/integration_onesignal` ডকুমেন্টে সংরক্ষিত অথবা প্রজেক্ট এনভায়রনমেন্টে।
- **API Endpoint**: `POST https://onesignal.com/api/v1/notifications`

### কীভাবে কাজ করে:
১. **সকল ইউজারকে ব্রডকাস্ট**:
```json
{
  "app_id": "d28392ee-2a0f-4f62-ba65-03fb3e0915ab",
  "included_segments": ["All"],
  "headings": { "en": "টাইটেল" },
  "contents": { "en": "নোটিফিকেশন মেসেজ" },
  "big_picture": "https://... (ছবি)",
  "url": "https://... (টার্গেট লিংক)"
}
```
২. **নির্দিষ্ট ইউজারকে প্রাইভেট নোটিফিকেশন**:
`include_subscription_ids: [userSubscriptionId]` পাঠালে শুধুমাত্র নির্দিষ্ট গ্রাহকের মোবাইলে স্ক্রিন নোটিফিকেশন যাবে।

---

## 3. ImgBB High-Speed Image Hosting (ছবি আপলোড এপিআই)

- **API Key**: `52ecf9eb44f32d2a88d210ca3399c054`
- **API Endpoint**: `POST https://api.imgbb.com/1/upload`

### কীভাবে কাজ করে:
এডমিন যখন মোবাইল গ্যালারি বা ফাইল থেকে প্রোডাক্ট পিকচার, ব্যানার বা নোটিফিকেশনের ফটো সিলেক্ট করেন, কোডটি সরাসরি HTML5 `FormData`-তে ফাইল নিয়ে ImgBB API-তে পাঠায়। ২ সেকেন্ডে ImgBB থেকে প্রাপ্ত ডাইরেক্ট HTTPS ইমেজ লিংকটি প্রোডাক্টের `images` বা নোটিফিকেশনের `big_picture`-এ বসে যায়।

---

## 4. Steadfast Courier API Integration (কুরিয়ার বুকিং)

- **API Endpoint**: `POST https://portal.steadfast.com.bd/api/v1/create_order`
- **Firestore Config Path**: `configs/integration_steadfast` (যেখানে `apiKey` ও `secretKey` থাকে)

### কীভাবে কাজ করে:
অর্ডার পেজ থেকে যখন এডমিন "ক্রিয়েট পার্সেল" বাটনে চাপেন, কোডটি কাস্টমারের নাম, ফোন নম্বর, ডেলিভারি এড্রেস ও মোট সিওডি (COD) এমাউন্ট পাঠিয়ে স্টিডফাস্ট কুরিয়ারে সার্ভিস রিকোয়েস্ট পাঠায়। স্টিডফাস্ট থেকে প্রাপ্ত `consignment_id` এবং `tracking_code` ফায়ারস্টোরের `food_orders` বা `orders` ডকুমেন্টে রিয়েল-টাইমে সেভ হয়ে যায়।

---

## 5. SAS Bulk SMS Gateway Integration (এসএমএস ও ওটিপি সার্ভিস)

- **API Endpoint**: `POST/GET https://api.sms.net.bd/sendsms`
- **Firestore Config Path**: `configs/integration_sms` (যেখানে `apiKey` ও `senderId` থাকে)

### কীভাবে কাজ করে:
১. **৬ সংখ্যার মোবাইল ওটিপি**: সাইন আপ বা পাসওয়ার্ড রিসেট করার সময় সিস্টেমে র্যান্ডম ৬ সংখ্যার ওটিপি তৈরি হয়ে SAS SMS Gateway দিয়ে গ্রাহকের মোবাইলে এসএমএস হিসেবে চলে যায় (মেয়াদ ৫ মিনিট, ট্রাই লিমিট ৫ বার)।
২. **অর্ডার কনফার্মেশন ও বাল্ক নোটিফিকেশন**: কাস্টমার অর্ডার নিশ্চিত করলে বা এডমিন বাল্ক এসএমএস পাঠালে এই গেটওয়ে দিয়ে সাথে সাথে বার্তা প্রেরিত হয়।

---

## 6. Firestore Realtime Sync Rules (ডাটা সিঙ্ক্রোনাইজেশন)

নতুন এডমিন অ্যাপ ফায়ারস্টোরের যে কালেকশনেই পরিবর্তন করবে (`products`, `orders`, `users`, `main_banners`, `settings`), মূল কাস্টমার অ্যাপে `onSnapshot` রিয়েল-টাইম লিসেনার চালু থাকায় পৃষ্ঠা রিফ্রেশ ছাড়াই সাথে সাথে পরিবর্তন কাস্টমারদের স্ক্রিনে আপডেট হয়ে যাবে।
