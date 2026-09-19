import { collection, onSnapshot, setDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useState, useEffect } from "react";

export interface CategoryItem {
  id: string;
  nameBn: string;
  nameEn?: string;
  order?: number;
}

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: "cat2", nameBn: "রূপসজ্জা বাজার", nameEn: "Beauty & Grooming", order: 2 },
  { id: "cat3", nameBn: "কাপড় ও পরিধান", nameEn: "Clothing & Apparel", order: 3 },
  { id: "cat4", nameBn: "উপহার বাজার", nameEn: "Gifts & Hampers", order: 4 },
  { id: "cat6", nameBn: "ইসলামিক বাজার", nameEn: "Islamic Market", order: 6 }
];

const ALLOWED_CATEGORY_IDS = ["cat2", "cat3", "cat4", "cat6"];

export function useFirestoreCategories() {
  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "categories"), async (snapshot) => {
      if (snapshot.empty) {
        console.log("Seeding default categories in Firestore...");
        try {
          for (const cat of DEFAULT_CATEGORIES) {
            await setDoc(doc(db, "categories", cat.id), {
              id: cat.id,
              nameBn: cat.nameBn,
              nameEn: cat.nameEn || "",
              order: cat.order || 0
            });
          }
        } catch (err) {
          console.error("Error seeding default categories:", err);
        }
      } else {
        const fetched: CategoryItem[] = [];
        
        for (const d of snapshot.docs) {
          if (ALLOWED_CATEGORY_IDS.includes(d.id)) {
            const data = d.data();
            fetched.push({
              id: d.id,
              nameBn: data.nameBn || data.name || "Unknown",
              nameEn: data.nameEn || "",
              order: typeof data.order === "number" ? data.order : 99
            });
          } else {
            // Delete unwanted categories from Firestore permanently
            try {
              await deleteDoc(doc(db, "categories", d.id));
              console.log(`Deleted unwanted category ${d.id} from Firestore`);
            } catch (err) {
              console.warn(`Failed to auto-delete unwanted category ${d.id}:`, err);
            }
          }
        }
        
        fetched.sort((a, b) => (a.order || 0) - (b.order || 0));
        setCategories(fetched);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error listening to categories:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { categories, loading };
}
