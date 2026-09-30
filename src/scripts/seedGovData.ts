import { db } from "../lib/firebase";
import { collection, getDocs, doc, setDoc, serverTimestamp, query, limit } from "firebase/firestore";

export const INITIAL_GOV_CATEGORIES = [
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
  { name: "ডাক ও কুরিয়ার", icon: "other", order: 22 },
  { name: "সরকারি ফরম", icon: "file", order: 23 },
  { name: "অন্যান্য সরকারি সেবা", icon: "other", order: 24 }
];

export const INITIAL_GOV_WEBSITES = [
  { category: "অন্যান্য সরকারি সেবা", name: "বাংলাদেশ জাতীয় তথ্য বাতায়ন", url: "https://bangladesh.gov.bd/", description: "বাংলাদেশ সরকারের জাতীয় তথ্য বাতায়ন ও পোর্টাল।", isPopular: true },
  { category: "অন্যান্য সরকারি সেবা", name: "মাইগভ", url: "https://mygov.bd/", description: "সকল সরকারি সেবার এক স্টপ প্ল্যাটফর্ম।", isPopular: true },
  { category: "অন্যান্য সরকারি সেবা", name: "সকল জাতীয় ই-সেবা", url: "https://bangladesh.gov.bd/views/all-eservices-in-bangladesh/", description: "বাংলাদেশে উপলব্ধ সকল ই-সেবার তালিকা।" },
  { category: "অন্যান্য সরকারি সেবা", name: "জাতীয় পোর্টাল সার্ভিস ডিরেক্টরি", url: "https://bangladesh.gov.bd/pages/np-services", description: "সরকারি পোর্টালের সার্ভিস ডিরেক্টরি।" },
  { category: "সরকারি ফরম", name: "সরকারি ফরম", url: "https://forms.gov.bd/", description: "সকল দরকারি সরকারি ফরম ডাউনলোডের পোর্টাল।" },
  { category: "সরকারি অভিযোগ ও সেবা", name: "সরকারি অভিযোগ প্রতিকার ব্যবস্থা (GRS)", url: "https://grs.gov.bd/", description: "সরকারি সেবার বিরুদ্ধে অভিযোগ ও প্রতিকারের ব্যবস্থা।" },
  { category: "জাতীয় পরিচয়পত্র ও ভোটার সেবা", name: "জাতীয় পরিচয়পত্র (NID)", url: "https://services.nidw.gov.bd/nid-pub/", description: "জাতীয় পরিচয়পত্র ও ভোটার তালিকা সংক্রান্ত সেবা।", isPopular: true },
  { category: "জন্ম ও মৃত্যু নিবন্ধন", name: "জন্ম ও মৃত্যু নিবন্ধন", url: "https://bdris.gov.bd/", description: "জন্ম ও মৃত্যু নিবন্ধনের অনলাইন আবেদন ও যাচাই।", isPopular: true },
  { category: "পাসপোর্ট ও ইমিগ্রেশন", name: "বাংলাদেশ ই-পাসপোর্ট", url: "https://epassport.gov.bd/", description: "অনলাইন ই-পাসপোর্ট আবেদন ও স্ট্যাটাস চেক।", isPopular: true },
  { category: "পাসপোর্ট ও ইমিগ্রেশন", name: "ইমিগ্রেশন ও পাসপোর্ট অধিদপ্তর", url: "https://dip.gov.bd/", description: "পাসপোর্ট অধিদপ্তর সংক্রান্ত নির্দেশিকা।" },
  { category: "ভূমি ও জমি সেবা", name: "ভূমি মন্ত্রণালয়", url: "https://minland.gov.bd/", description: "ভূমি মন্ত্রণালয়ের অফিসিয়াল ওয়েবসাইট।" },
  { category: "ভূমি ও জমি সেবা", name: "ভূমি সেবা", url: "https://land.gov.bd/", description: "ডিজিটাল ভূমি সেবা পোর্টাল।" },
  { category: "ভূমি ও জমি সেবা", name: "ভূমি উন্নয়ন কর", url: "https://ldtax.gov.bd/", description: "অনলাইনে ভূমি উন্নয়ন কর পরিশোধের পোর্টাল।", isPopular: true },
  { category: "ভূমি ও জমি সেবা", name: "ই-নামজারি", url: "https://mutation.land.gov.bd/", description: "অনলাইন নামজারি বা মিউটেশন আবেদন।", isPopular: true },
  { category: "ভূমি ও জমি সেবা", name: "ভূমি রেকর্ড ও জরিপ অধিদপ্তর", url: "https://dlrs.gov.bd/", description: "খতিয়ান ও ম্যাপ সংক্রান্ত তথ্য।" },
  { category: "ভূমি ও জমি সেবা", name: "ভূমি সেটেলমেন্ট", url: "https://settlement.gov.bd/", description: "ভূমি সেটেলমেন্ট সংক্রান্ত কার্যক্রম।" },
  { category: "যানবাহন ও ড্রাইভিং", name: "বাংলাদেশ সড়ক পরিবহন কর্তৃপক্ষ (BRTA)", url: "https://brta.gov.bd/", description: "যানবাহন রেজিস্ট্রেশন ও ড্রাইভিং লাইসেন্স তথ্য।" },
  { category: "যানবাহন ও ড্রাইভিং", name: "BRTA Service Portal", url: "https://bsp.brta.gov.bd/", description: "বিআরটিএ অনলাইন সেবা পোর্টাল।", isPopular: true },
  { category: "বিমান ও এয়ারলাইন্স", name: "বেসামরিক বিমান চলাচল কর্তৃপক্ষ (CAAB)", url: "https://caab.gov.bd/", description: "বাংলাদেশের বিমান চলাচল নিয়ন্ত্রণকারী সংস্থা।" },
  { category: "বিমান ও এয়ারলাইন্স", name: "বিমান বাংলাদেশ এয়ারলাইন্স", url: "https://www.biman-airlines.com/", description: "জাতীয় পতাকাবাহী বিমান সংস্থা।" },
  { category: "রেল ও ট্রেন", name: "বাংলাদেশ রেলওয়ে", url: "https://railway.gov.bd/", description: "রেলপথ মন্ত্রণালয় ও ট্রেন চলাচল তথ্য।" },
  { category: "রেল ও ট্রেন", name: "বাংলাদেশ রেলওয়ে ই-টিকেট", url: "https://eticket.railway.gov.bd/", description: "অনলাইনে ট্রেনের টিকিট কাটার অফিশিয়াল সাইট।", isPopular: true },
  { category: "অন্যান্য সরকারি সেবা", name: "নৌপরিবহন অধিদপ্তর", url: "https://dos.gov.bd/", description: "নৌপরিবহন সংক্রান্ত সেবা।" },
  { category: "কর ও রাজস্ব", name: "জাতীয় রাজস্ব বোর্ড (NBR)", url: "https://nbr.gov.bd/", description: "কর, ভ্যাট ও শুল্ক সংক্রান্ত মূল সাইট।" },
  { category: "কর ও রাজস্ব", name: "NBR e-Services", url: "https://nbr.gov.bd/all-eservices/eng", description: "এনবিআর ই-সেবাসমূহ।" },
  { category: "কর ও রাজস্ব", name: "e-Tax", url: "https://etaxnbr.gov.bd/", description: "অনলাইন ট্যাক্স রিটার্ন দাখিল।" },
  { category: "কর ও রাজস্ব", name: "e-TIN", url: "https://secure.incometax.gov.bd/TINHome", description: "অনলাইন টিআইএন সার্টিফিকেট নিবন্ধন।", isPopular: true },
  { category: "কর ও রাজস্ব", name: "বাংলাদেশ কাস্টমস", url: "https://customs.gov.bd/", description: "কাস্টমস ও ইমপোর্ট-এক্সপোর্ট সংক্রান্ত তথ্য।" },
  { category: "ব্যবসা ও বাণিজ্য", name: "e-GP", url: "https://eprocure.gov.bd/", description: "ইলেকট্রনিক গভর্নমেন্ট প্রকিউরমেন্ট (টেন্ডার পোর্টাল)।", isPopular: true },
  { category: "সরকারি পেমেন্ট ও চালান", name: "iBAS++", url: "https://ibas.finance.gov.bd/", description: "ইন্টিগ্রেটেড বাজেট অ্যান্ড অ্যাকাউন্টিং সিস্টেম।" },
  { category: "সরকারি পেমেন্ট ও চালান", name: "A-Challan", url: "https://ibas.finance.gov.bd/acs/", description: "অনলাইন চালান ভেরিফিকেশন ও পেমেন্ট।" },
  { category: "সরকারি পেমেন্ট ও চালান", name: "জাতীয় সঞ্চয় অধিদপ্তর", url: "https://nsd.finance.gov.bd/", description: "সঞ্চয়পত্র ও বন্ড সংক্রান্ত তথ্য।" },
  { category: "সরকারি পেমেন্ট ও চালান", name: "সর্বজনীন পেনশন", url: "https://upension.gov.bd/", description: "সর্বজনীন পেনশন স্কিম নিবন্ধন পোর্টাল।" },
  { category: "শিক্ষা ও ভর্তি", name: "শিক্ষা মন্ত্রণালয়", url: "https://moedu.gov.bd/", description: "শিক্ষা মন্ত্রণালয় সংক্রান্ত নির্দেশিকা।" },
  { category: "শিক্ষা ও ভর্তি", name: "মাধ্যমিক ও উচ্চ শিক্ষা অধিদপ্তর", url: "https://dshe.gov.bd/", description: "মাধ্যমিক ও উচ্চশিক্ষা সংক্রান্ত তথ্য।" },
  { category: "শিক্ষা ও ভর্তি", name: "প্রাথমিক শিক্ষা অধিদপ্তর", url: "https://dpe.gov.bd/", description: "প্রাথমিক শিক্ষা সম্পর্কিত কার্যক্রম।" },
  { category: "শিক্ষা ও ভর্তি", name: "বাংলাদেশ শিক্ষাতথ্য ও পরিসংখ্যান ব্যুরো (BANBEIS)", url: "https://banbeis.gov.bd/", description: "শিক্ষাগত পরিসংখ্যান ও তথ্য।" },
  { category: "শিক্ষা ও ভর্তি", name: "শিক্ষা বোর্ড", url: "https://educationboard.gov.bd/", description: "মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড।" },
  { category: "পরীক্ষার ফলাফল", name: "শিক্ষা বোর্ডের ফলাফল", url: "https://educationboardresults.gov.bd/", description: "পাবলিক পরীক্ষার ফলাফল দেখার অফিসিয়াল সাইট।", isPopular: true },
  { category: "শিক্ষা ও ভর্তি", name: "স্বাস্থ্য শিক্ষা অধিদপ্তর", url: "https://dgme.gov.bd/", description: "চিকিৎসা শিক্ষা সংক্রান্ত তথ্য।" },
  { category: "স্বাস্থ্য ও চিকিৎসা", name: "স্বাস্থ্য অধিদপ্তর", url: "https://dghs.gov.bd/", description: "স্বাস্থ্য সেবা ও হাসপাতাল সংক্রান্ত তথ্য।" },
  { category: "স্বাস্থ্য ও চিকিৎসা", name: "স্বাস্থ্য সেবা বিভাগ", url: "https://hsd.gov.bd/", description: "স্বাস্থ্য সেবা বিভাগ মন্ত্রণালয়।" },
  { category: "স্বাস্থ্য ও চিকিৎসা", name: "স্বাস্থ্য মন্ত্রণালয়", url: "https://health.gov.bd/", description: "স্বাস্থ্য ও পরিবার কল্যাণ মন্ত্রণালয়।" },
  { category: "চাকরি ও নিয়োগ", name: "বাংলাদেশ সরকারি কর্ম কমিশন (BPSC)", url: "https://bpsc.gov.bd/", description: "বিসিএস ও সরকারি গেজেটেড চাকরির নিয়োগ পোর্টাল।", isPopular: true },
  { category: "পুলিশ ও নিরাপত্তা", name: "বাংলাদেশ পুলিশ", url: "https://police.gov.bd/", description: "বাংলাদেশ পুলিশ হেডকোয়ার্টার্স।" },
  { category: "পুলিশ ও নিরাপত্তা", name: "Police Clearance", url: "https://pcc.police.gov.bd/", description: "অনলাইন পুলিশ ক্লিয়ারেন্স সার্টিফিকেট আবেদন।" },
  { category: "ফায়ার সার্ভিস", name: "ফায়ার সার্ভিস ও সিভিল ডিফেন্স", url: "https://fireservice.gov.bd/", description: "আগুন ও জরুরি উদ্ধার সেবা।" },
  { category: "আইন ও বিচার", name: "জাতীয় আইনগত সহায়তা সংস্থা", url: "https://nlaso.gov.bd/", description: "বিনামূল্যে আইনি সহায়তা।" },
  { category: "আইন ও বিচার", name: "বাংলাদেশ সুপ্রিম কোর্ট", url: "https://supremecourt.gov.bd/", description: "সুপ্রিম কোর্টের রায় ও নোটিশ।" },
  { category: "আইন ও বিচার", name: "বাংলাদেশ কোড", url: "https://bdcode.gov.bd/", description: "বাংলাদেশের সকল আইনের সংকলন।" }
];

export const runSeed = async () => {
    try {
        const catSnapshot = await getDocs(collection(db, "gov_categories"));
        
        // If data is already seeded, run migration update for any outdated URLs in Firestore
        if (catSnapshot.size > 0) {
            const webSnapshot = await getDocs(collection(db, "gov_websites"));
            webSnapshot.docs.forEach(async (docSnap) => {
                const data = docSnap.data();
                if (data.url && (data.url.includes("nidw.gov.bd") && !data.url.includes("services.nidw.gov.bd"))) {
                    await setDoc(doc(db, "gov_websites", docSnap.id), {
                        ...data,
                        url: "https://services.nidw.gov.bd/nid-pub/"
                    }, { merge: true });
                }
            });
            console.log("Data already seeded, migration check complete.");
            return;
        }

        const categoryIdMap: Record<string, string> = {};
        for (const cat of INITIAL_GOV_CATEGORIES) {
            const id = doc(collection(db, "gov_categories")).id;
            categoryIdMap[cat.name] = id;
            await setDoc(doc(db, "gov_categories", id), {
                name: cat.name,
                icon: cat.icon,
                order: cat.order,
                createdAt: serverTimestamp()
            });
        }

        for (const web of INITIAL_GOV_WEBSITES) {
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
        console.log("Data seeded successfully!");
    } catch (error) {
        console.error("Error seeding data:", error);
    }
};
