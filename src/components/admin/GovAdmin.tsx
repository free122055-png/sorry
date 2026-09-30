import { runSeed } from "../../scripts/seedGovData";
import React, { useState, useEffect } from "react";
import { 
  Plus, Trash2, Edit3, Save, X, Globe, Map, Car, Plane, CreditCard, 
  GraduationCap, Heart, Calculator, FileText, Briefcase, Shield, MoreHorizontal,
  ExternalLink, Search, Loader2, ChevronRight
} from "lucide-react";
import { db } from "../../lib/firebase";
import { 
  collection, query, orderBy, onSnapshot, doc, setDoc, deleteDoc, updateDoc, 
  serverTimestamp, getDocs, where, limit
} from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";

interface GovCategory {
  id: string;
  name: string;
  icon: string;
  order: number;
}

interface GovWebsite {
  id: string;
  name: string;
  url: string;
  description: string;
  categoryId: string;
  isPopular: boolean;
}

const ICONS = ["land", "vehicle", "airline", "nid", "education", "health", "tax", "license", "job", "police", "other"];

const ICON_MAP: Record<string, React.ReactNode> = {
  "land": <Map className="w-5 h-5" />,
  "vehicle": <Car className="w-5 h-5" />,
  "airline": <Plane className="w-5 h-5" />,
  "nid": <CreditCard className="w-5 h-5" />,
  "education": <GraduationCap className="w-5 h-5" />,
  "health": <Heart className="w-5 h-5" />,
  "tax": <Calculator className="w-5 h-5" />,
  "license": <FileText className="w-5 h-5" />,
  "job": <Briefcase className="w-5 h-5" />,
  "police": <Shield className="w-5 h-5" />,
  "other": <MoreHorizontal className="w-5 h-5" />
};

export const GovAdmin: React.FC = () => {
  const [categories, setCategories] = useState<GovCategory[]>([]);
  const [websites, setWebsites] = useState<GovWebsite[]>([]);
  const [activeTab, setActiveTab] = useState<'categories' | 'websites'>('categories');
  const [loading, setLoading] = useState(false);

  // Form States
  const [catName, setCatName] = useState("");
  const [catIcon, setCatIcon] = useState("other");
  const [editingCatId, setEditingCatId] = useState<string | null>(null);

  const [webName, setWebName] = useState("");
  const [webUrl, setWebUrl] = useState("");
  const [webDesc, setWebDesc] = useState("");
  const [webCatId, setWebCatId] = useState("");
  const [webIsPopular, setWebIsPopular] = useState(false);
  const [editingWebId, setEditingWebId] = useState<string | null>(null);

  useEffect(() => {
    // Check if empty and seed automatically
    const checkAndSeed = async () => {
      const q = query(collection(db, "gov_categories"), limit(1));
      const snap = await getDocs(q);
      if (snap.empty) {
        await runSeed();
      }
    };
    checkAndSeed();

    const qCat = query(collection(db, "gov_categories"), orderBy("order", "asc"));
    const unsubscribeCat = onSnapshot(qCat, (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GovCategory)));
    });

    const qWeb = query(collection(db, "gov_websites"), orderBy("name", "asc"));
    const unsubscribeWeb = onSnapshot(qWeb, (snapshot) => {
      setWebsites(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GovWebsite)));
    });

    return () => {
      unsubscribeCat();
      unsubscribeWeb();
    };
  }, []);

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName) return;
    setLoading(true);

    try {
      if (editingCatId) {
        await updateDoc(doc(db, "gov_categories", editingCatId), {
          name: catName,
          icon: catIcon,
        });
      } else {
        const id = doc(collection(db, "gov_categories")).id;
        await setDoc(doc(db, "gov_categories", id), {
          name: catName,
          icon: catIcon,
          order: categories.length,
          createdAt: serverTimestamp(),
        });
      }
      resetCatForm();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webName || !webUrl || !webCatId) return;
    setLoading(true);

    try {
      if (editingWebId) {
        await updateDoc(doc(db, "gov_websites", editingWebId), {
          name: webName,
          url: webUrl,
          description: webDesc,
          categoryId: webCatId,
          isPopular: webIsPopular,
        });
      } else {
        const id = doc(collection(db, "gov_websites")).id;
        await setDoc(doc(db, "gov_websites", id), {
          name: webName,
          url: webUrl,
          description: webDesc,
          categoryId: webCatId,
          isPopular: webIsPopular,
          createdAt: serverTimestamp(),
        });
      }
      resetWebForm();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const seedInitialData = async () => {
    if (!window.confirm("আপনি কি ৫টি ক্যাটাগরি ও ৫০টি সরকারি ওয়েবসাইট প্রাথমিক ডাটা হিসেবে যোগ করতে চান?")) return;
    setLoading(true);
    try {
      const initialCats = [
        { name: "জাতীয় পরিচয়পত্র ও ভোটার সেবা", icon: "nid", order: 1 },
        { name: "জন্ম ও মৃত্যু নিবন্ধন", icon: "other", order: 2 },
        { name: "পাসপোর্ট ও ইমিগ্রেশন", icon: "nid", order: 3 },
        { name: "ভূমি ও জমি সেবা", icon: "land", order: 4 },
        { name: "যানবাহন ও ড্রাইভিং", icon: "vehicle", order: 5 },
        { name: "রেল ও ট্রেন", icon: "vehicle", order: 6 },
        { name: "বিমান ও এয়ারলাইন্স", icon: "airline", order: 7 },
        { name: "কর ও রাজস্ব", icon: "tax", order: 8 },
        { name: "সরকারি পেমেন্ট ও চালান", icon: "tax", order: 9 },
        { name: "শিক্ষা ও ভর্তি", icon: "education", order: 10 },
        { name: "পরীক্ষার ফলাফল", icon: "education", order: 11 },
        { name: "স্বাস্থ্য ও চিকিৎসা", icon: "health", order: 12 },
        { name: "চাকরি ও নিয়োগ", icon: "job", order: 13 },
        { name: "পুলিশ ও নিরাপত্তা", icon: "police", order: 14 },
        { name: "ফায়ার সার্ভিস", icon: "police", order: 15 },
        { name: "আইন ও বিচার", icon: "other", order: 16 },
        { name: "সরকারি অভিযোগ ও সেবা", icon: "other", order: 17 },
        { name: "ব্যবসা ও বাণিজ্য", icon: "other", order: 18 },
        { name: "বিদ্যুৎ ও ইউটিলিটি", icon: "other", order: 19 },
        { name: "কৃষি ও মৎস্য", icon: "other", order: 20 },
        { name: "প্রবাসী ও বৈদেশিক কর্মসংস্থান", icon: "other", order: 21 },
        { name: "ডাক ও কوریয়ার", icon: "other", order: 22 },
        { name: "সরকারি ফরম", icon: "file", order: 23 },
        { name: "অন্যান্য সরকারি সেবা", icon: "other", order: 24 }
      ];

      const websitesList = [
        // অন্যান্য সরকারি সেবা / জাতীয়
        { category: "অন্যান্য সরকারি সেবা", name: "বাংলাদেশ জাতীয় তথ্য বাতায়ন", url: "https://bangladesh.gov.bd/", description: "বাংলাদেশ সরকারের জাতীয় তথ্য বাতায়ন ও পোর্টাল।", isPopular: true },
        { category: "অন্যান্য সরকারি সেবা", name: "মাইগভ", url: "https://www.mygov.bd/", description: "সকল সরকারি সেবার এক স্টপ প্ল্যাটফর্ম।", isPopular: true },
        { category: "অন্যান্য সরকারি সেবা", name: "সকল জাতীয় ই-সেবা", url: "https://bangladesh.gov.bd/views/all-eservices-in-bangladesh/", description: "বাংলাদেশে উপলব্ধ সকল ই-সেবার তালিকা।" },
        { category: "অন্যান্য সরকারি সেবা", name: "জাতীয় পোর্টাল সার্ভিস ডিরেক্টরি", url: "https://bangladesh.gov.bd/pages/np-services", description: "সরকারি পোর্টালের সার্ভিস ডিরেক্টরি।" },
        { category: "সরকারি ফরম", name: "সরকারি ফরম", url: "https://forms.gov.bd/", description: "সকল দরকারি সরকারি ফরম ডাউনলোডের পোর্টাল।" },
        { category: "সরকারি অভিযোগ ও সেবা", name: "সরকারি অভিযোগ প্রতিকার ব্যবস্থা (GRS)", url: "https://grs.gov.bd/", description: "সরকারি সেবার বিরুদ্ধে অভিযোগ ও প্রতিকারের ব্যবস্থা।" },

        // জাতীয় পরিচয়পত্র
        { category: "জাতীয় পরিচয়পত্র ও ভোটার সেবা", name: "জাতীয় পরিচয়পত্র (NID)", url: "https://services.nidw.gov.bd/nid-pub/", description: "জাতীয় পরিচয়পত্র ও ভোটার তালিকা সংক্রান্ত সেবা।", isPopular: true },

        // জন্ম ও মৃত্যু নিবন্ধন
        { category: "জন্ম ও মৃত্যু নিবন্ধন", name: "জন্ম ও মৃত্যু নিবন্ধন", url: "https://bdris.gov.bd/", description: "জন্ম ও মৃত্যু নিবন্ধনের অনলাইন আবেদন ও যাচাই।", isPopular: true },

        // পাসপোর্ট ও ইমিগ্রেশন
        { category: "পাসপোর্ট ও ইমিগ্রেশন", name: "বাংলাদেশ ই-পাসপোর্ট", url: "https://www.epassport.gov.bd/", description: "অনলাইন ই-পাসপোর্ট আবেদন ও স্ট্যাটাস চেক।", isPopular: true },
        { category: "পাসপোর্ট ও ইমিগ্রেশন", name: "ইমিগ্রেশন ও পাসপোর্ট অধিদপ্তর", url: "https://dip.gov.bd/", description: "পাসপোর্ট অধিদপ্তর সংক্রান্ত নির্দেশিকা।" },

        // ভূমি ও জমি
        { category: "ভূমি ও জমি সেবা", name: "ভূমি মন্ত্রণালয়", url: "https://minland.gov.bd/", description: "ভূমি মন্ত্রণালয়ের অফিসিয়াল ওয়েবসাইট।" },
        { category: "ভূমি ও জমি সেবা", name: "ভূমি সেবা", url: "https://land.gov.bd/", description: "ডিজিটাল ভূমি সেবা পোর্টাল।" },
        { category: "ভূমি ও জমি সেবা", name: "ভূমি উন্নয়ন কর", url: "https://ldtax.gov.bd/", description: "অনলাইনে ভূমি উন্নয়ন কর পরিশোধের পোর্টাল।", isPopular: true },
        { category: "ভূমি ও জমি সেবা", name: "ই-নামজারি", url: "https://mutation.land.gov.bd/", description: "অনলাইন নামজারি বা মিউটেশন আবেদন।", isPopular: true },
        { category: "ভূমি ও জমি সেবা", name: "ভূমি রেকর্ড ও জরিপ অধিদপ্তর", url: "https://dlrs.gov.bd/", description: "খতিয়ান ও ম্যাপ সংক্রান্ত তথ্য।" },
        { category: "ভূমি ও জমি সেবা", name: "ভূমি সেটেলমেন্ট", url: "https://settlement.gov.bd/", description: "ভূমি সেটেলমেন্ট সংক্রান্ত কার্যক্রম।" },

        // যানবাহন ও ড্রাইভিং
        { category: "যানবাহন ও ড্রাইভিং", name: "বাংলাদেশ সড়ক পরিবহন কর্তৃপক্ষ (BRTA)", url: "https://brta.gov.bd/", description: "যানবাহন রেজিস্ট্রেশন ও ড্রাইভিং লাইসেন্স তথ্য।" },
        { category: "যানবাহন ও ড্রাইভিং", name: "BRTA Service Portal", url: "https://bsp.brta.gov.bd/", description: "বিআরটিএ অনলাইন সেবা পোর্টাল।", isPopular: true },

        // বিমান ও এয়ারলাইন্স
        { category: "বিমান ও এয়ারলাইন্স", name: "বেসামরিক বিমান চলাচল কর্তৃপক্ষ (CAAB)", url: "https://caab.gov.bd/", description: "বাংলাদেশের বিমান চলাচল নিয়ন্ত্রণকারী সংস্থা।" },
        { category: "বিমান ও এয়ারলাইন্স", name: "বিমান বাংলাদেশ এয়ারলাইন্স", url: "https://www.biman-airlines.com/", description: "জাতীয় পতাকাবাহী বিমান সংস্থা।" },

        // রেল ও ট্রেন
        { category: "রেল ও ট্রেন", name: "বাংলাদেশ রেলওয়ে", url: "https://railway.gov.bd/", description: "রেলপথ মন্ত্রণালয় ও ট্রেন চলাচল তথ্য।" },
        { category: "রেল ও ট্রেন", name: "বাংলাদেশ রেলওয়ে ই-টিকেট", url: "https://eticket.railway.gov.bd/", description: "অনলাইনে ট্রেনের টিকিট কাটার অফিশিয়াল সাইট।", isPopular: true },

        // নৌপরিবহন
        { category: "অন্যান্য সরকারি সেবা", name: "নৌপরিবহন অধিদপ্তর", url: "https://dos.gov.bd/", description: "নৌপরিবহন সংক্রান্ত সেবা।" },

        // কর ও রাজস্ব
        { category: "কর ও রাজস্ব", name: "জাতীয় রাজস্ব বোর্ড (NBR)", url: "https://nbr.gov.bd/", description: "কর, ভ্যাট ও শুল্ক সংক্রান্ত মূল সাইট।" },
        { category: "কর ও রাজস্ব", name: "NBR e-Services", url: "https://nbr.gov.bd/all-eservices/eng", description: "এনবিআর ই-সেবাসমূহ।" },
        { category: "কর ও রাজস্ব", name: "e-Tax", url: "https://etaxnbr.gov.bd/", description: "অনলাইন ট্যাক্স রিটার্ন দাখিল।" },
        { category: "কর ও রাজস্ব", name: "e-TIN", url: "https://secure.incometax.gov.bd/TINHome", description: "অনলাইন টিআইএন সার্টিফিকেট নিবন্ধন।", isPopular: true },
        { category: "কর ও রাজস্ব", name: "বাংলাদেশ কাস্টমস", url: "https://customs.gov.bd/", description: "কাস্টমস ও ইমপোর্ট-এক্সপোর্ট সংক্রান্ত তথ্য।" },

        // সরকারি ক্রয়
        { category: "ব্যবসা ও বাণিজ্য", name: "e-GP", url: "https://www.eprocure.gov.bd/", description: "ইলেকট্রনিক গভর্নমেন্ট প্রকিউরমেন্ট (টেন্ডার পোর্টাল)।", isPopular: true },

        // অর্থ ও সরকারি পেমেন্ট
        { category: "সরকারি পেমেন্ট ও চালান", name: "iBAS++", url: "https://ibas.finance.gov.bd/", description: "ইন্টিগ্রেটেড বাজেট অ্যান্ড অ্যাকাউন্টিং সিস্টেম।" },
        { category: "সরকারি পেমেন্ট ও চালান", name: "A-Challan", url: "https://ibas.finance.gov.bd/acs/", description: "অনলাইন চালান ভেরিফিকেশন ও পেমেন্ট।" },
        { category: "সরকারি পেমেন্ট ও চালান", name: "জাতীয় সঞ্চয় অধিদপ্তর", url: "https://nsd.finance.gov.bd/", description: "সঞ্চয়পত্র ও বন্ড সংক্রান্ত তথ্য।" },
        { category: "সরকারি পেমেন্ট ও চালান", name: "সর্বজনীন পেনশন", url: "https://www.upension.gov.bd/", description: "সর্বজনীন পেনশন স্কিম নিবন্ধন পোর্টাল।" },

        // শিক্ষা
        { category: "শিক্ষা ও ভর্তি", name: "শিক্ষা মন্ত্রণালয়", url: "https://moedu.gov.bd/", description: "শিক্ষা মন্ত্রণালয় সংক্রান্ত নির্দেশিকা।" },
        { category: "শিক্ষা ও ভর্তি", name: "মাধ্যমিক ও উচ্চ শিক্ষা অধিদপ্তর", url: "https://dshe.gov.bd/", description: "মাধ্যমিক ও উচ্চশিক্ষা সংক্রান্ত তথ্য।" },
        { category: "শিক্ষা ও ভর্তি", name: "প্রাথমিক শিক্ষা অধিদপ্তর", url: "https://dpe.gov.bd/", description: "প্রাথমিক শিক্ষা সম্পর্কিত কার্যক্রম।" },
        { category: "শিক্ষা ও ভর্তি", name: "বাংলাদেশ শিক্ষাতথ্য ও পরিসংখ্যান ব্যুরো (BANBEIS)", url: "https://banbeis.gov.bd/", description: "শিক্ষাগত পরিসংখ্যান ও তথ্য।" },
        { category: "শিক্ষা ও ভর্তি", name: "শিক্ষা বোর্ড", url: "https://educationboard.gov.bd/", description: "মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড।" },
        { category: "পরীক্ষার ফলাফল", name: "শিক্ষা বোর্ডের ফলাফল", url: "https://educationboardresults.gov.bd/", description: "পাবলিক পরীক্ষার ফলাফল দেখার অফিসিয়াল সাইট।", isPopular: true },
        { category: "শিক্ষা ও ভর্তি", name: "স্বাস্থ্য শিক্ষা অধিদপ্তর", url: "https://dgme.gov.bd/", description: "চিকিৎসা শিক্ষা সংক্রান্ত তথ্য।" },

        // স্বাস্থ্য ও চিকিৎসা
        { category: "স্বাস্থ্য ও চিকিৎসা", name: "স্বাস্থ্য অধিদপ্তর", url: "https://dghs.gov.bd/", description: "স্বাস্থ্য সেবা ও হাসপাতাল সংক্রান্ত তথ্য।" },
        { category: "স্বাস্থ্য ও চিকিৎসা", name: "স্বাস্থ্য সেবা বিভাগ", url: "https://hsd.gov.bd/", description: "স্বাস্থ্য সেবা বিভাগ মন্ত্রণালয়।" },
        { category: "স্বাস্থ্য ও চিকিৎসা", name: "স্বাস্থ্য মন্ত্রণালয়", url: "https://www.health.gov.bd/", description: "স্বাস্থ্য ও পরিবার কল্যাণ মন্ত্রণালয়।" },

        // চাকরি ও নিয়োগ
        { category: "চাকরি ও নিয়োগ", name: "বাংলাদেশ সরকারি কর্ম কমিশন (BPSC)", url: "https://bpsc.gov.bd/", description: "বিসিএস ও সরকারি গেজেটেড চাকরির নিয়োগ পোর্টাল।", isPopular: true },

        // পুলিশ ও নিরাপত্তা
        { category: "পুলিশ ও নিরাপত্তা", name: "বাংলাদেশ পুলিশ", url: "https://www.police.gov.bd/", description: "বাংলাদেশ পুলিশ হেডকোয়ার্টার্স।" },
        { category: "পুলিশ ও নিরাপত্তা", name: "Police Clearance", url: "https://pcc.police.gov.bd/", description: "অনলাইন পুলিশ ক্লিয়ারেন্স সার্টিফিকেট আবেদন।" },

        // ফায়ার সার্ভিস
        { category: "ফায়ার সার্ভিস", name: "ফায়ার সার্ভিস ও সিভিল ডিফেন্স", url: "https://fireservice.gov.bd/", description: "আগুন ও জরুরি উদ্ধার সেবা।" },

        // আইন ও বিচার
        { category: "আইন ও বিচার", name: "জাতীয় আইনগত সহায়তা সংস্থা", url: "https://nlaso.gov.bd/", description: "বিনামূল্যে আইনি সহায়তা।" },
        { category: "আইন ও বিচার", name: "বাংলাদেশ সুপ্রিম কোর্ট", url: "https://www.supremecourt.gov.bd/", description: "সুপ্রিম কোর্টের রায় ও নোটিশ।" },
        { category: "আইন ও বিচার", name: "বাংলাদেশ কোড", url: "https://bdcode.gov.bd/", description: "বাংলাদেশের সকল আইনের সংকলন।" }
      ];

      // First create categories
      const categoryIdMap: Record<string, string> = {};

      for (const cat of initialCats) {
        const id = doc(collection(db, "gov_categories")).id;
        categoryIdMap[cat.name] = id;
        await setDoc(doc(db, "gov_categories", id), {
          name: cat.name,
          icon: cat.icon,
          order: cat.order,
          createdAt: serverTimestamp()
        });
      }

      // Then create websites and map to respective category ID
      for (const web of websitesList) {
        const catId = categoryIdMap[web.category] || categoryIdMap["অন্যান্য সরকারি সেবা"];
        const webId = doc(collection(db, "gov_websites")).id;
        await setDoc(doc(db, "gov_websites", webId), {
          categoryId: catId,
          name: web.name,
          url: web.url,
          description: web.description,
          isPopular: web.isPopular || false,
          createdAt: serverTimestamp()
        });
      }

      alert("সকল ক্যাটাগরি ও ৫০টি অফিশিয়াল ওয়েবসাইট সফলভাবে সিড (Seed) করা হয়েছে!");
    } catch (err) {
      console.error(err);
      alert("ডাটা সিড করতে সমস্যা হয়েছে। কনসোল দেখুন।");
    } finally {
      setLoading(false);
    }
  };

  const resetCatForm = () => {
    setCatName("");
    setCatIcon("other");
    setEditingCatId(null);
  };

  const resetWebForm = () => {
    setWebName("");
    setWebUrl("");
    setWebDesc("");
    setWebCatId("");
    setWebIsPopular(false);
    setEditingWebId(null);
  };

  const deleteItem = async (type: 'cat' | 'web', id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিত?")) return;
    try {
      await deleteDoc(doc(db, type === 'cat' ? "gov_categories" : "gov_websites", id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto p-4">
      <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
         <Globe className="w-8 h-8 text-emerald-600" />
         <div>
            <h2 className="text-2xl font-black text-gray-900">সরকারি সেবা ম্যানেজমেন্ট</h2>
            <p className="text-sm text-gray-500 font-medium">ক্যাটাগরি ও ওয়েবসাইট ডিরেক্টরি কন্ট্রোল প্যানেল</p>
         </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
         <div className="flex bg-gray-100 p-1 rounded-2xl w-fit">
            <button 
              onClick={() => setActiveTab('categories')}
              className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === 'categories' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
               ক্যাটাগরি সমূহ
            </button>
            <button 
              onClick={() => setActiveTab('websites')}
              className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === 'websites' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
               ওয়েবসাইট সমূহ
            </button>
         </div>

         {categories.length === 0 && (
           <button 
             onClick={seedInitialData}
             disabled={loading}
             className="px-4 py-2.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-amber-100 transition-all"
           >
              <Plus className="w-4 h-4" />
              প্রাথমিক ডাটা যোগ করুন
           </button>
         )}
      </div>

      {activeTab === 'categories' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {/* Form */}
           <div className="md:col-span-1 space-y-6">
              <div className="bg-white border border-emerald-100 rounded-[32px] p-6 shadow-sm">
                 <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                    {editingCatId ? <Edit3 className="w-5 h-5 text-emerald-600" /> : <Plus className="w-5 h-5 text-emerald-600" />}
                    {editingCatId ? "ক্যাটাগরি এডিট" : "নতুন ক্যাটাগরি"}
                 </h3>
                 <form onSubmit={handleSaveCategory} className="space-y-4">
                    <div>
                       <label className="text-[11px] font-black uppercase text-gray-400 block mb-1">ক্যাটাগরি নাম</label>
                       <input 
                         type="text" 
                         value={catName}
                         onChange={(e) => setCatName(e.target.value)}
                         placeholder="যেমন: জমি ও ভূমি"
                         className="w-full bg-gray-50 border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20"
                       />
                    </div>
                    <div>
                       <label className="text-[11px] font-black uppercase text-gray-400 block mb-2">আইকন সিলেক্ট করুন</label>
                       <div className="grid grid-cols-4 gap-2">
                          {ICONS.map(icon => (
                             <button
                               key={icon}
                               type="button"
                               onClick={() => setCatIcon(icon)}
                               className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${catIcon === icon ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                             >
                                {ICON_MAP[icon]}
                             </button>
                          ))}
                       </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                       <button 
                         type="submit" 
                         disabled={loading}
                         className="flex-1 py-3 bg-[#004b23] text-white rounded-xl font-black text-sm flex items-center justify-center gap-2"
                       >
                          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          {editingCatId ? "আপডেট" : "সেভ করুন"}
                       </button>
                       {editingCatId && (
                         <button onClick={resetCatForm} className="p-3 bg-gray-100 text-gray-600 rounded-xl">
                            <X className="w-5 h-5" />
                         </button>
                       )}
                    </div>
                 </form>
              </div>
           </div>

           {/* List */}
           <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 {categories.map(cat => (
                    <div key={cat.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 group">
                       <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          {ICON_MAP[cat.icon]}
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="font-black text-sm truncate">{cat.name}</p>
                       </div>
                       <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => {
                              setEditingCatId(cat.id);
                              setCatName(cat.name);
                              setCatIcon(cat.icon);
                            }}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                          >
                             <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteItem('cat', cat.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg">
                             <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {/* Web Form */}
           <div className="md:col-span-1 space-y-6">
              <div className="bg-white border border-emerald-100 rounded-[32px] p-6 shadow-sm">
                 <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                    {editingWebId ? <Edit3 className="w-5 h-5 text-emerald-600" /> : <Plus className="w-5 h-5 text-emerald-600" />}
                    {editingWebId ? "ওয়েবসাইট এডিট" : "নতুন ওয়েবসাইট"}
                 </h3>
                 <form onSubmit={handleSaveWebsite} className="space-y-4">
                    <div>
                       <label className="text-[11px] font-black uppercase text-gray-400 block mb-1">ক্যাটাগরি</label>
                       <select 
                         value={webCatId}
                         onChange={(e) => setWebCatId(e.target.value)}
                         className="w-full bg-gray-50 border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 appearance-none"
                       >
                          <option value="">সিলেক্ট করুন</option>
                          {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                       </select>
                    </div>
                    <div>
                       <label className="text-[11px] font-black uppercase text-gray-400 block mb-1">ওয়েবসাইট নাম</label>
                       <input 
                         type="text" 
                         value={webName}
                         onChange={(e) => setWebName(e.target.value)}
                         placeholder="যেমন: বাংলাদেশ পাসপোর্ট"
                         className="w-full bg-gray-50 border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20"
                       />
                    </div>
                    <div>
                       <label className="text-[11px] font-black uppercase text-gray-400 block mb-1">URL (লিংক)</label>
                       <input 
                         type="text" 
                         value={webUrl}
                         onChange={(e) => setWebUrl(e.target.value)}
                         placeholder="https://passport.gov.bd"
                         className="w-full bg-gray-50 border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20"
                       />
                    </div>
                    <div>
                       <label className="text-[11px] font-black uppercase text-gray-400 block mb-1">ছোট বিবরণ (ঐচ্ছিক)</label>
                       <textarea 
                         value={webDesc}
                         onChange={(e) => setWebDesc(e.target.value)}
                         rows={2}
                         placeholder="সেবা সম্পর্কে তথ্য..."
                         className="w-full bg-gray-50 border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 resize-none"
                       />
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-xl">
                       <input 
                         type="checkbox" 
                         checked={webIsPopular}
                         onChange={(e) => setWebIsPopular(e.target.checked)}
                         className="w-5 h-5 rounded-lg accent-emerald-600"
                       />
                       <span className="text-sm font-bold text-gray-700">জনপ্রিয় তালিকায় দেখান</span>
                    </label>

                    <div className="flex gap-2 pt-2">
                       <button 
                         type="submit" 
                         disabled={loading}
                         className="flex-1 py-3 bg-[#004b23] text-white rounded-xl font-black text-sm flex items-center justify-center gap-2"
                       >
                          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          {editingWebId ? "আপডেট" : "সেভ করুন"}
                       </button>
                       {editingWebId && (
                         <button onClick={resetWebForm} className="p-3 bg-gray-100 text-gray-600 rounded-xl">
                            <X className="w-5 h-5" />
                         </button>
                       )}
                    </div>
                 </form>
              </div>
           </div>

           {/* Web List */}
           <div className="md:col-span-2 space-y-3">
              {websites.map(site => (
                <div key={site.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 group shadow-xs">
                   <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center">
                      <Globe className="w-5 h-5" />
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                         <h4 className="font-black text-sm text-gray-900 truncate">{site.name}</h4>
                         {site.isPopular && <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Popular</span>}
                      </div>
                      <p className="text-[11px] text-gray-400 font-bold truncate">{site.url}</p>
                   </div>
                   <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setEditingWebId(site.id);
                          setWebName(site.name);
                          setWebUrl(site.url);
                          setWebDesc(site.description);
                          setWebCatId(site.categoryId);
                          setWebIsPopular(site.isPopular);
                        }}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                      >
                         <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteItem('web', site.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg">
                         <Trash2 className="w-4 h-4" />
                      </button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};
