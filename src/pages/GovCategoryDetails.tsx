import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Globe, ExternalLink, ChevronRight, Info } from "lucide-react";
import { motion } from "motion/react";
import { db } from "../lib/firebase";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";

import { INITIAL_GOV_CATEGORIES, INITIAL_GOV_WEBSITES } from "../scripts/seedGovData";
import { openExternalUrl } from "../lib/openUrl";

import { useLanguage } from "../context/LanguageContext";

interface GovWebsite {
  id: string;
  name: string;
  nameEn?: string;
  url: string;
  description: string;
  descriptionEn?: string;
  categoryId: string;
}

export const GovCategoryDetails: React.FC = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [websites, setWebsites] = useState<GovWebsite[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [categoryNameEn, setCategoryNameEn] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!categoryId) return;

    // Check if static category ID (e.g. static-cat-0)
    if (categoryId.startsWith("static-cat-")) {
      const idx = parseInt(categoryId.replace("static-cat-", ""), 10);
      const cat = INITIAL_GOV_CATEGORIES[idx];
      if (cat) {
        setCategoryName(cat.name);
        const sites = INITIAL_GOV_WEBSITES.filter(w => w.category === cat.name).map((s, i) => ({
          id: `static-site-${i}`,
          name: s.name,
          url: s.url,
          description: s.description,
          categoryId: categoryId
        }));
        setWebsites(sites);
        setLoading(false);
        return;
      }
    }

    // Get category info from Firestore
    const fetchCategory = async () => {
      const docRef = doc(db, "gov_categories", categoryId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCategoryName(data.name);
        setCategoryNameEn(data.nameEn || "");
      }
    };
    fetchCategory();

    // Listen for websites in this category
    const q = query(collection(db, "gov_websites"), where("categoryId", "==", categoryId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GovWebsite));
      if (list.length > 0) {
        setWebsites(list);
      } else {
        // Fallback search by category name in initial data
        const sites = INITIAL_GOV_WEBSITES.filter(w => w.category === categoryName).map((s, i) => ({
          id: `fallback-site-${i}`,
          name: s.name,
          url: s.url,
          description: s.description,
          categoryId: categoryId
        }));
        setWebsites(sites);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [categoryId, categoryName]);

  const handleVisit = (url: string) => {
    openExternalUrl(url);
  };

  const filteredWebsites = websites.filter(site => 
    (language === "en" && site.nameEn ? site.nameEn : site.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
    site.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-10 font-sans text-[#0f172a]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-black tracking-tight text-[#0f172a] truncate">
            {language === "en" && categoryNameEn ? categoryNameEn : (categoryName || t("govCategories"))}
          </h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t("govServicesTitle")}</p>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text"
            placeholder={t("govSearchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500/20 shadow-xs transition-all"
          />
        </div>

        {/* Websites List */}
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-white border border-gray-100 rounded-2xl animate-pulse" />
            ))
          ) : filteredWebsites.length === 0 ? (
            <div className="py-20 text-center space-y-4">
               <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                  <Globe className="w-8 h-8 text-gray-200" />
               </div>
               <p className="text-gray-400 font-bold text-sm italic">{t("cartEmpty")}</p>
            </div>
          ) : (
            filteredWebsites.map((site) => (
              <motion.div
                key={site.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-100 rounded-3xl p-5 space-y-4 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      <Globe className="w-6 h-6" />
                   </div>
                   <div className="flex-1 min-w-0">
                      <h4 className="text-[15px] font-black text-[#0f172a]">
                        {language === "en" && site.nameEn ? site.nameEn : site.name}
                      </h4>
                      <p className="text-[11px] text-gray-400 font-bold truncate mt-0.5">{site.url.replace(/^https?:\/\//, '')}</p>
                   </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 flex gap-3">
                   <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                   <p className="text-[12px] text-gray-600 leading-relaxed">
                      {language === "en" && site.descriptionEn ? site.descriptionEn : (site.description || "Official government portal for this service.")}
                   </p>
                </div>

                <button
                   onClick={() => handleVisit(site.url)}
                  className="w-full py-3.5 bg-[#004b23] text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/10 active:scale-95 transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>{t("visitWebsite")}</span>
                </button>
              </motion.div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};
