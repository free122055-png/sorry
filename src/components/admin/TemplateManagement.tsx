import React, { useState, useEffect } from "react";
import { 
  Plus, Search, Edit3, Trash2, X, Upload, Save,
  RefreshCw, Layers, Grid, Image as ImageIcon,
  CheckCircle2, AlertCircle, FileJson, 
  Settings, Layout, Hash, Frame, Eye, Star,
  Check, Filter, Palette, Sparkles
} from "lucide-react";
import { db } from "../../lib/firebase";
import { 
  collection, onSnapshot, doc, deleteDoc, 
  setDoc, query, orderBy 
} from "firebase/firestore";
import { compressImage } from "../../lib/imageUtils";
import { 
  FRAME_CATEGORIES, 
  TEMPLATE_CATEGORIES,
  BUILTIN_FRAMES,
  BUILTIN_TEMPLATES 
} from "../../data/framesAndTemplatesData";

export interface TemplateElement {
  id: string;
  type: "text" | "image" | "shape" | "placeholder" | "draw" | "sticker" | "frame";
  content?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  fontStyle?: "normal" | "italic";
  textDecoration?: "none" | "underline" | "line-through";
  textAlign?: "left" | "center" | "right" | "justify";
  letterSpacing?: number;
  lineHeight?: number;
  color?: string;
  rotation?: number;
  opacity?: number;
  zIndex: number;
  // Stroke & Border
  strokeColor?: string;
  strokeWidth?: number;
  // Shadow
  shadowEnabled?: boolean;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowOpacity?: number;
  // Background & Highlight
  backgroundColor?: string;
  backgroundPadding?: number;
  backgroundRadius?: number;
  // Shape & Drawing
  shapeType?: "rectangle" | "circle" | "rounded-rect" | "triangle" | "star" | "arrow" | "heart" | "polygon";
  fillColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  // Layer Management
  isLocked?: boolean;
  isHidden?: boolean;
}

export interface TemplateItem {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  elements: TemplateElement[];
  width: number;
  height: number;
  bgClass?: string;
  isPremium?: boolean;
  isFeatured?: boolean;
  isEnabled?: boolean;
  searchTags?: string[];
  createdAt: number;
  updatedAt: number;
}

export const TemplateManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"all" | "frames" | "templates">("all");
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [toastMessage, setToastMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TemplateItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form States
  const [name, setName] = useState("");
  const [itemType, setItemType] = useState<"frame" | "template">("template");
  const [category, setCategory] = useState("fb_post");
  const [width, setWidth] = useState(1080);
  const [height, setHeight] = useState(1080);
  const [thumbnail, setThumbnail] = useState("");
  const [elementsJson, setElementsJson] = useState("[]");
  const [isPremium, setIsPremium] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [tags, setTags] = useState("");

  const showToast = (text: string, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const q = query(collection(db, "templates"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TemplateItem));
      setTemplates(list);
      setLoading(false);
    }, (err) => {
      console.warn("Firestore templates notice:", err);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenAdd = (type: "frame" | "template" = "template") => {
    setEditingTemplate(null);
    setItemType(type);
    setName("");
    const defaultCat = type === "frame" ? "wedding" : "fb_post";
    setCategory(defaultCat);
    setWidth(1080);
    setHeight(1080);
    setThumbnail("");
    
    // Generate convenient default elements starter
    if (type === "frame") {
      setElementsJson(JSON.stringify([
        {
          id: "frame_bg",
          type: "shape",
          shapeType: "rectangle",
          fillColor: "#0f172a",
          x: 0,
          y: 0,
          width: 1080,
          height: 1080,
          zIndex: 1
        },
        {
          id: "photo_slot_1",
          type: "placeholder",
          content: "",
          x: 80,
          y: 80,
          width: 920,
          height: 800,
          shapeType: "rounded-rect",
          borderRadius: 24,
          borderColor: "#38bdf8",
          borderWidth: 4,
          zIndex: 2
        },
        {
          id: "txt_frame_title",
          type: "text",
          content: "YOUR FRAME TITLE (আপনার শিরোনাম)",
          x: 80,
          y: 920,
          width: 920,
          height: 60,
          fontSize: 36,
          fontFamily: "'Hind Siliguri', sans-serif",
          fontWeight: "bold",
          color: "#ffffff",
          zIndex: 3
        }
      ], null, 2));
    } else {
      setElementsJson(JSON.stringify([
        {
          id: "tpl_bg",
          type: "shape",
          shapeType: "rectangle",
          fillColor: "#1e1b4b",
          x: 0,
          y: 0,
          width: 1080,
          height: 1080,
          zIndex: 1
        },
        {
          id: "tpl_photo",
          type: "placeholder",
          content: "",
          x: 520,
          y: 120,
          width: 500,
          height: 600,
          shapeType: "rounded-rect",
          borderRadius: 24,
          borderColor: "#fbbf24",
          borderWidth: 4,
          zIndex: 2
        },
        {
          id: "tpl_heading",
          type: "text",
          content: "SPECIAL OFFER 50% OFF",
          x: 60,
          y: 140,
          width: 440,
          height: 90,
          fontSize: 48,
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: "bold",
          color: "#fbbf24",
          zIndex: 3
        },
        {
          id: "tpl_name",
          type: "text",
          content: "YOUR NAME / আপনার নাম",
          x: 60,
          y: 300,
          width: 440,
          height: 50,
          fontSize: 28,
          fontFamily: "'Hind Siliguri', sans-serif",
          color: "#ffffff",
          zIndex: 4
        }
      ], null, 2));
    }

    setIsPremium(false);
    setIsFeatured(false);
    setTags("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (template: TemplateItem) => {
    setEditingTemplate(template);
    const isFrame = template.category?.includes("frame") || FRAME_CATEGORIES.some(f => f.id === template.category);
    setItemType(isFrame ? "frame" : "template");
    setName(template.name);
    setCategory(template.category);
    setWidth(template.width);
    setHeight(template.height);
    setThumbnail(template.thumbnail);
    setElementsJson(JSON.stringify(template.elements || [], null, 2));
    setIsPremium(!!template.isPremium);
    setIsFeatured(!!template.isFeatured);
    setTags(template.searchTags?.join(", ") || "");
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const base64 = await compressImage(file);
      setThumbnail(base64);
      showToast("থাম্বনেইল আপলোড সফল হয়েছে!");
    } catch (err) {
      showToast("আপলোড ব্যর্থ হয়েছে", true);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return showToast("নাম দিন", true);
    if (!thumbnail) return showToast("থাম্বনেইল ইমেজ দিন", true);

    let elements: TemplateElement[] = [];
    try {
      elements = JSON.parse(elementsJson);
    } catch (err) {
      return showToast("Elements JSON সঠিক নয়", true);
    }

    setIsSaving(true);
    try {
      const id = editingTemplate?.id || `${itemType}_${Date.now()}`;
      const templateData: TemplateItem = {
        id,
        name: name.trim(),
        category,
        width: Number(width),
        height: Number(height),
        thumbnail,
        elements,
        isPremium,
        isFeatured,
        isEnabled: true,
        searchTags: tags.split(",").map(t => t.trim()).filter(Boolean),
        updatedAt: Date.now(),
        createdAt: editingTemplate?.createdAt || Date.now()
      };

      await setDoc(doc(db, "templates", id), templateData, { merge: true });
      showToast(editingTemplate ? "আপডেট সফল হয়েছে!" : "নতুন ফ্রেম/টেমপ্লেট যোগ হয়েছে!");
      setIsModalOpen(false);
    } catch (err: any) {
      showToast("সংরক্ষণ ব্যর্থ: " + err.message, true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই আইটেমটি মুছে ফেলতে চান?")) return;
    try {
      await deleteDoc(doc(db, "templates", id));
      showToast("আইটেম মুছে ফেলা হয়েছে");
    } catch (err: any) {
      showToast("মুছে ফেলতে ব্যর্থ", true);
    }
  };

  // Combine Firestore + Built-in items
  const allCombined = [
    ...templates,
    ...BUILTIN_FRAMES.filter(bf => !templates.some(t => t.id === bf.id)),
    ...BUILTIN_TEMPLATES.filter(bt => !templates.some(t => t.id === bt.id))
  ];

  const filteredItems = allCombined.filter(item => {
    const isFrame = item.category?.includes("frame") || FRAME_CATEGORIES.some(f => f.id === item.category);
    if (activeTab === "frames" && !isFrame) return false;
    if (activeTab === "templates" && isFrame) return false;

    const matchesSearch = !searchTerm.trim() || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.searchTags?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCat = categoryFilter === "all" || item.category === categoryFilter;

    return matchesSearch && matchesCat;
  });

  const availableCategories = activeTab === "frames" 
    ? FRAME_CATEGORIES 
    : activeTab === "templates" 
    ? TEMPLATE_CATEGORIES 
    : [...FRAME_CATEGORIES, ...TEMPLATE_CATEGORIES];

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-[100] p-4 rounded-2xl text-white font-bold flex items-center gap-2 shadow-2xl animate-in fade-in slide-in-from-right ${toastMessage.isError ? "bg-rose-600" : "bg-emerald-600"}`}>
          {toastMessage.isError ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Layout className="w-7 h-7 text-indigo-600" />
            Frame & Template Management
          </h2>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Manage customizable photo frames, layered templates, categories, and placeholders
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenAdd("frame")}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all text-xs"
          >
            <Frame className="w-4 h-4" />
            <span>+ নতুন ফ্রেম যোগ করুন</span>
          </button>
          <button
            onClick={() => handleOpenAdd("template")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all text-xs"
          >
            <Layout className="w-4 h-4" />
            <span>+ নতুন টেমপ্লেট যোগ করুন</span>
          </button>
        </div>
      </div>

      {/* Top Filter Tabs: All | Frames | Templates */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
        <button
          onClick={() => { setActiveTab("all"); setCategoryFilter("all"); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "all" ? "bg-gray-900 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          সকল আইটেম ({allCombined.length})
        </button>
        <button
          onClick={() => { setActiveTab("frames"); setCategoryFilter("all"); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === "frames" ? "bg-purple-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Frame className="w-3.5 h-3.5" />
          <span>ফ্রেম লাইব্রেরি ({allCombined.filter(i => i.category?.includes("frame") || FRAME_CATEGORIES.some(f => f.id === i.category)).length})</span>
        </button>
        <button
          onClick={() => { setActiveTab("templates"); setCategoryFilter("all"); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === "templates" ? "bg-indigo-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Layout className="w-3.5 h-3.5" />
          <span>টেমপ্লেট লাইব্রেরি ({allCombined.filter(i => !i.category?.includes("frame") && !FRAME_CATEGORIES.some(f => f.id === i.category)).length})</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ফ্রেম বা টেমপ্লেট খুঁজুন..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:outline-none"
        >
          <option value="all">সব ক্যাটাগরি</option>
          {availableCategories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="text-sm font-bold text-gray-500">লোড হচ্ছে...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-12 text-center">
          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-800">কোনো আইটেম পাওয়া যায়নি</h3>
          <p className="text-sm text-gray-500">নতুন ফ্রেম বা টেমপ্লেট যোগ করতে উপরে থাকা বাটনে ক্লিক করুন</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map(item => {
            const isBuiltin = item.id.startsWith("frame_") || item.id.startsWith("tpl_");
            const isFrame = item.category?.includes("frame") || FRAME_CATEGORIES.some(f => f.id === item.category);

            return (
              <div key={item.id} className="group bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div className="aspect-[4/3] relative bg-gray-100 overflow-hidden">
                  <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover" />
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={() => handleOpenEdit(item)} className="p-2.5 bg-white text-indigo-600 rounded-xl hover:scale-110 transition-transform shadow-lg">
                      <Edit3 className="w-5 h-5" />
                    </button>
                    {!isBuiltin && (
                      <button onClick={() => handleDelete(item.id)} className="p-2.5 bg-white text-rose-600 rounded-xl hover:scale-110 transition-transform shadow-lg">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black text-white ${isFrame ? "bg-purple-600" : "bg-indigo-600"}`}>
                      {isFrame ? "FRAME" : "TEMPLATE"}
                    </span>
                    {isBuiltin && (
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-black/60 text-white backdrop-blur-sm">
                        BUILT-IN
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-[9px] font-mono text-white">
                    {item.width}×{item.height}
                  </div>
                </div>

                <div className="p-3">
                  <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                  <div className="flex items-center justify-between text-[11px] text-gray-500 mt-1">
                    <span className="capitalize">{item.category?.replace(/_/g, " ")}</span>
                    <span>{item.elements?.length || 0} Layers</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                {editingTemplate ? <Edit3 className="w-5 h-5 text-indigo-600" /> : <Plus className="w-5 h-5 text-indigo-600" />}
                <span>{editingTemplate ? "এডিট করুন" : `নতুন ${itemType === "frame" ? "ফ্রেম" : "টেমপ্লেট"} যোগ করুন`}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Type Switcher */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setItemType("frame");
                    if (!editingTemplate) setCategory("wedding");
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 border transition-all ${
                    itemType === "frame" ? "bg-purple-600 text-white border-purple-600" : "bg-gray-50 text-gray-600 border-gray-200"
                  }`}
                >
                  <Frame className="w-4 h-4" />
                  <span>Photo Frame (ছবি ফ্রেম)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setItemType("template");
                    if (!editingTemplate) setCategory("fb_post");
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 border transition-all ${
                    itemType === "template" ? "bg-indigo-600 text-white border-indigo-600" : "bg-gray-50 text-gray-600 border-gray-200"
                  }`}
                >
                  <Layout className="w-4 h-4" />
                  <span>Design Template (ডিজাইন টেমপ্লেট)</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">নাম (Title)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: Eid Mubarak Golden Frame / 50% Off Sale Banner"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ক্যাটাগরি (Category)</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none"
                  >
                    {(itemType === "frame" ? FRAME_CATEGORIES : TEMPLATE_CATEGORIES).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">প্রস্থ (Width px)</label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">উচ্চতা (Height px)</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none"
                  />
                </div>
              </div>

              {/* Thumbnail Upload */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">থাম্বনেইল প্রিভিউ (Thumbnail)</label>
                <div className="flex items-center gap-4">
                  {thumbnail ? (
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border border-gray-200 relative">
                      <img src={thumbnail} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setThumbnail("")}
                        className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white hover:bg-black"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-300 hover:border-indigo-500 flex flex-col items-center justify-center cursor-pointer text-gray-400 hover:text-indigo-600 transition-colors">
                      <Upload className="w-5 h-5" />
                      <span className="text-[9px] font-bold mt-1">Upload</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  )}
                  <input
                    type="text"
                    value={thumbnail}
                    onChange={(e) => setThumbnail(e.target.value)}
                    placeholder="অথবা Image URL পেস্ট করুন"
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none"
                  />
                </div>
              </div>

              {/* Layer Elements JSON */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <FileJson className="w-4 h-4 text-indigo-600" />
                    <span>Editable Elements JSON (লেয়ার কনফিগ)</span>
                  </label>
                  <span className="text-[10px] text-gray-400">text, placeholder, shape, image ইত্যাদি</span>
                </div>
                <textarea
                  value={elementsJson}
                  onChange={(e) => setElementsJson(e.target.value)}
                  rows={6}
                  className="w-full p-3 font-mono text-xs bg-gray-900 text-green-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 border border-gray-700"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">সার্চ ট্যাগ (Search Tags - কমা দিয়ে লিখুন)</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="birthday, eid, wedding, sale, neon, frame, love"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-[2] py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
