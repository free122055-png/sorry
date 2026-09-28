import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";

export interface PromoCodeItem {
  id: string;
  code: string;
  categoryId: string; // "all" or specific category ID (e.g., "cat2", "cat3")
  categoryName: string;
  discountType: "percentage" | "fixed";
  discountValue: number; // e.g. 10 for 10% or 100 for 100 BDT
  minOrderAmount?: number;
  status: "active" | "inactive";
  createdAt?: number | any;
  updatedAt?: number | any;
}

export const DEFAULT_PROMO_CODES: PromoCodeItem[] = [
  {
    id: "default-mayadin",
    code: "MAYADIN",
    categoryId: "all",
    categoryName: "সকল ক্যাটাগরি",
    discountType: "percentage",
    discountValue: 10,
    minOrderAmount: 0,
    status: "active"
  },
  {
    id: "default-save10",
    code: "SAVE10",
    categoryId: "all",
    categoryName: "সকল ক্যাটাগরি",
    discountType: "percentage",
    discountValue: 10,
    minOrderAmount: 0,
    status: "active"
  },
  {
    id: "default-welcome",
    code: "WELCOME",
    categoryId: "all",
    categoryName: "সকল ক্যাটাগরি",
    discountType: "percentage",
    discountValue: 10,
    minOrderAmount: 0,
    status: "active"
  }
];

const LOCAL_STORAGE_KEY = "admin_promo_codes";

/**
 * Fetch all promo codes from Firestore with offline localStorage cache fallback.
 * Works seamlessly in Web, Android Capacitor/Play Store releases, and offline states.
 */
export async function getActivePromoCodes(): Promise<PromoCodeItem[]> {
  let list: PromoCodeItem[] = [];

  try {
    const snap = await getDocs(collection(db, "promo_codes"));
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        code: (data.code || "").trim().toUpperCase(),
        categoryId: data.categoryId || "all",
        categoryName: data.categoryName || "সকল ক্যাটাগরি",
        discountType: data.discountType === "fixed" ? "fixed" : "percentage",
        discountValue: Number(data.discountValue) || 0,
        minOrderAmount: Number(data.minOrderAmount) || 0,
        status: data.status === "inactive" ? "inactive" : "active",
        createdAt: data.createdAt ? (typeof data.createdAt === 'object' && data.createdAt.seconds ? data.createdAt.seconds * 1000 : data.createdAt) : Date.now(),
        updatedAt: data.updatedAt ? (typeof data.updatedAt === 'object' && data.updatedAt.seconds ? data.updatedAt.seconds * 1000 : data.updatedAt) : Date.now()
      });
    });

    if (list.length > 0 && typeof window !== "undefined") {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
      } catch (e) {
        // quota ignore
      }
    }
  } catch (err) {
    console.warn("Could not fetch promo codes from Firestore, loading local cache:", err);
  }

  // If Firestore didn't return any (e.g. offline on device), try local cache
  if (list.length === 0 && typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed;
        }
      }
    } catch (e) {
      // ignore
    }
  }

  // Merge default codes if not already present
  for (const def of DEFAULT_PROMO_CODES) {
    if (!list.some(p => p.code === def.code)) {
      list.push(def);
    }
  }

  return list;
}

export interface PromoValidationResult {
  isValid: boolean;
  error?: string;
  promo?: PromoCodeItem;
  discountAmount: number;
  discountText: string;
}

export interface PromoValidationOptions {
  subtotal: number;
  items?: Array<{
    id?: string;
    productId?: string;
    categoryId?: string;
    category?: string;
    categoryName?: string;
    name?: string;
    nameBn?: string;
    price?: number;
    pricePerUnit?: number;
    quantity?: number;
  }>;
  categoryId?: string;
  categoryName?: string;
  product?: any;
}

/**
 * Validates a promo code against product items, minimum amount, and categories.
 */
export function validatePromoCode(
  inputCode: string,
  promoList: PromoCodeItem[],
  options: PromoValidationOptions
): PromoValidationResult {
  const code = (inputCode || "").trim().toUpperCase();

  if (!code) {
    return {
      isValid: false,
      error: "অনুগ্রহ করে একটি প্রমো কোড লিখুন।",
      discountAmount: 0,
      discountText: ""
    };
  }

  const found = promoList.find(
    (p) => p.code.trim().toUpperCase() === code && p.status === "active"
  );

  if (!found) {
    return {
      isValid: false,
      error: "অবৈধ বা মেয়াদোত্তীর্ণ প্রমো কোড!",
      discountAmount: 0,
      discountText: ""
    };
  }

  // 1. Check Minimum Order Amount
  const subtotal = options.subtotal || 0;
  if (found.minOrderAmount && found.minOrderAmount > 0 && subtotal < found.minOrderAmount) {
    return {
      isValid: false,
      error: `এই প্রমো কোডটি ব্যবহারের জন্য সর্বনিম্ন অর্ডার মূল্য ৳${found.minOrderAmount} হতে হবে!`,
      discountAmount: 0,
      discountText: ""
    };
  }

  // 2. Check Category Matching
  const isUniversal = !found.categoryId || found.categoryId === "all";

  if (!isUniversal) {
    let isCategoryMatch = false;
    const targetCatId = (found.categoryId || "").toLowerCase();
    const targetCatName = (found.categoryName || "").toLowerCase();

    // Check direct category ID passed in options
    const passedCatId = (options.categoryId || "").toLowerCase();
    if (passedCatId && (passedCatId === targetCatId || targetCatId.includes(passedCatId) || passedCatId.includes(targetCatId))) {
      isCategoryMatch = true;
    }

    // Check product in options
    if (!isCategoryMatch && options.product) {
      const prodCatId = String(options.product.categoryId || options.product.category || "").toLowerCase();
      const prodCatName = String(options.product.categoryName || "").toLowerCase();
      const prodName = String(options.product.nameBn || options.product.name || "").toLowerCase();

      if (prodCatId === targetCatId || (targetCatName && (prodCatName.includes(targetCatName) || targetCatName.includes(prodCatName)))) {
        isCategoryMatch = true;
      }
      if (!isCategoryMatch && checkCategoryKeywords(targetCatId, targetCatName, prodCatId, prodName)) {
        isCategoryMatch = true;
      }
    }

    // Check items list
    if (!isCategoryMatch && options.items && options.items.length > 0) {
      for (const itm of options.items) {
        const itmCatId = String(itm.categoryId || itm.category || itm.categoryName || "").toLowerCase();
        const itmName = String(itm.nameBn || itm.name || "").toLowerCase();

        if (itmCatId === targetCatId) {
          isCategoryMatch = true;
          break;
        }
        if (targetCatName && itmCatId.includes(targetCatName)) {
          isCategoryMatch = true;
          break;
        }
        if (checkCategoryKeywords(targetCatId, targetCatName, itmCatId, itmName)) {
          isCategoryMatch = true;
          break;
        }
      }
    }

    // Check options.categoryName string
    if (!isCategoryMatch && options.categoryName) {
      const optCat = options.categoryName.toLowerCase();
      if (optCat.includes(targetCatName) || targetCatName.includes(optCat)) {
        isCategoryMatch = true;
      }
      if (!isCategoryMatch && checkCategoryKeywords(targetCatId, targetCatName, optCat, optCat)) {
        isCategoryMatch = true;
      }
    }

    if (!isCategoryMatch) {
      return {
        isValid: false,
        error: `এই প্রমো কোডটি শুধুমাত্র "${found.categoryName || 'নির্দিষ্ট'}" ক্যাটাগরির জন্য প্রযোজ্য!`,
        discountAmount: 0,
        discountText: ""
      };
    }
  }

  // 3. Calculate Discount
  let calcDiscount = 0;
  if (found.discountType === "percentage") {
    calcDiscount = Math.round((subtotal * Number(found.discountValue)) / 100);
  } else {
    calcDiscount = Number(found.discountValue);
  }

  if (calcDiscount > subtotal) {
    calcDiscount = subtotal;
  }
  if (calcDiscount < 0) {
    calcDiscount = 0;
  }

  const discountText =
    found.discountType === "percentage"
      ? `${found.discountValue}% (৳${calcDiscount}) ছাড়`
      : `৳${calcDiscount} ছাড়`;

  return {
    isValid: true,
    promo: found,
    discountAmount: calcDiscount,
    discountText
  };
}

/**
 * Keyword-based helper to intelligently match Bengali/English category names and products.
 */
function checkCategoryKeywords(targetCatId: string, targetCatName: string, itemCat: string, itemName: string): boolean {
  // Food Market / খাদ্য বাজার (cat1)
  if (targetCatId === "cat1" || targetCatName.includes("খাদ্য") || targetCatName.includes("food")) {
    if (
      itemCat.includes("cat1") ||
      itemCat.includes("food") ||
      itemCat.includes("খাদ্য") ||
      itemCat.includes("চাল") ||
      itemCat.includes("ডাল") ||
      itemCat.includes("তেল") ||
      itemCat.includes("মসলা") ||
      itemCat.includes("মধু") ||
      itemName.includes("চাল") ||
      itemName.includes("ডাল") ||
      itemName.includes("তেল")
    ) {
      return true;
    }
  }

  // Oil Corner / অয়েল কর্নার (cat2)
  if (targetCatId === "cat2" || targetCatName.includes("অয়েল") || targetCatName.includes("oil")) {
    if (
      itemCat.includes("cat2") ||
      itemCat.includes("oil") ||
      itemCat.includes("অয়েল") ||
      itemName.includes("তেল") ||
      itemName.includes("oil") ||
      itemName.includes("অয়েল") ||
      itemName.includes("সরিষা") ||
      itemName.includes("ঘি")
    ) {
      return true;
    }
  }

  // Fashion / কাপড় ও পরিধান (cat3)
  if (targetCatId === "cat3" || targetCatName.includes("কাপড়") || targetCatName.includes("পরিধান") || targetCatName.includes("fashion") || targetCatName.includes("পোশাক")) {
    if (
      itemCat.includes("cat3") ||
      itemCat.includes("fashion") ||
      itemCat.includes("কাপড়") ||
      itemCat.includes("পরিধান") ||
      itemName.includes("fashion") ||
      itemName.includes("পাঞ্জাবি") ||
      itemName.includes("বোরকা") ||
      itemName.includes("জুব্বা") ||
      itemName.includes("শাড়ি") ||
      itemName.includes("হিজাব") ||
      itemName.includes("পোশাক") ||
      itemName.includes("শার্ট") ||
      itemName.includes("টিশার্ট")
    ) {
      return true;
    }
  }

  // Gift Corner / উপহার (cat4)
  if (targetCatId === "cat4" || targetCatName.includes("উপহার") || targetCatName.includes("gift")) {
    if (
      itemCat.includes("cat4") ||
      itemCat.includes("gift") ||
      itemCat.includes("উপহার") ||
      itemName.includes("উপহার") ||
      itemName.includes("gift") ||
      itemName.includes("বক্স")
    ) {
      return true;
    }
  }

  // Islamic / ইসলামিক (cat6)
  if (targetCatId === "cat6" || targetCatName.includes("ইসলামিক") || targetCatName.includes("islamic")) {
    if (
      itemCat.includes("cat6") ||
      itemCat.includes("islamic") ||
      itemCat.includes("ইসলামিক") ||
      itemName.includes("কুরআন") ||
      itemName.includes("তসবিহ") ||
      itemName.includes("জায়নামাজ") ||
      itemName.includes("আতর")
    ) {
      return true;
    }
  }

  return false;
}
