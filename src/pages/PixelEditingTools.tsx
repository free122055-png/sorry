import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { 
  Plus, Save, Share2, Undo2, Redo2, Grid, Layers, 
  ChevronRight, Sparkles, Paintbrush, FunctionSquare, Sticker, Type,
  Crown, Image as ImageIcon, X, Upload, RefreshCw, ZoomOut,
  Quote, MoreVertical, Pencil, Trash2, Search, CircleDashed, Hexagon, Copy, Wand2,
  Calendar, Shapes, PenTool, Image as GalleryIcon, Download, Info, LogOut,
  Maximize2, Smartphone, Mail, Phone, MapPin, CheckCircle2, AlertCircle,
  Lock, Unlock, Eye, EyeOff, GripVertical, RotateCcw, RotateCw, Monitor, Move,
  Expand, Maximize, Scissors, Type as FontIcon, AlignLeft, AlignCenter, AlignRight,
  Sun, Contrast as ContrastIcon, Palette, Droplets, Layers as LayersIcon,
  FolderOpen, ArrowLeft, Sliders, Check, FolderHeart
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useSearchParams, useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import { TemplateLibraryModal } from "../components/TemplateLibraryModal";
import { PixelBackgroundAlbumModal } from "../components/pixel/PixelBackgroundAlbumModal";
import { BackgroundAlbumItem } from "../data/pixelBackgroundAlbum";
import { TemplateItem, TemplateElement } from "../components/admin/TemplateManagement";
import { compressImage } from "../lib/imageUtils";
import { db } from "../lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { 
  BUILTIN_FRAMES, 
  BUILTIN_TEMPLATES, 
  FRAME_CATEGORIES, 
  TEMPLATE_CATEGORIES, 
  MASTER_CATEGORIES,
  CANVAS_PRESETS,
  CANVAS_SIZE_CATEGORIES,
  CanvasSizePreset
} from "../data/framesAndTemplatesData";
import { PixelInlineColorBar, PixelColorWheelModal } from "../components/pixelEditor/PixelColorTools";
import { FontPickerModal } from "../components/pixelEditor/FontPickerModal";
import { TextPropertiesModal, TextToolType } from "../components/pixelEditor/TextPropertiesModal";
import { StickerShapeModal } from "../components/pixelEditor/StickerShapeModal";
import { LayerManagerDrawer } from "../components/pixelEditor/LayerManagerDrawer";
import { ImageCropModal } from "../components/pixelEditor/ImageCropModal";
import { CustomSizeModal } from "../components/pixelEditor/CustomSizeModal";
import { COLOR_PALETTE, STICKER_LIBRARY } from "../data/pixelEditorData";

type BottomTab = "project" | "text" | "object" | "background";

// Helper Dropdown Components
const Globe: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
);

const DropdownMenu: React.FC<{ children: React.ReactNode; onClose: () => void; right?: boolean }> = ({ children, onClose, right }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95, y: -10 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95, y: -10 }}
    className={`absolute top-full mt-2 w-52 bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-[70] ${right ? "right-0" : "left-0"}`}
  >
    <div className="py-1">
      {children}
    </div>
  </motion.div>
);

const DropdownItem: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void }> = ({ icon, label, onClick }) => (
  <button onClick={(e) => { e.stopPropagation(); onClick(); }} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-all active:bg-white/10">
    <div className="text-white/60">{icon}</div>
    <span className="text-xs font-medium text-white/90 capitalize">{label}</span>
  </button>
);

const ToolItem: React.FC<{ icon: React.ReactNode; label: string; onClick?: () => void; active?: boolean }> = ({ icon, label, onClick, active }) => (
  <button onClick={onClick} className="flex flex-col items-center gap-2 shrink-0 min-w-[60px] group active:scale-95 transition-all">
    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-colors ${
      active ? 'bg-blue-600 border-blue-400 text-white' : 'bg-white/5 border-white/5 group-hover:bg-white/10'
    }`}>
       {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6 text-white" }) : icon}
    </div>
    <span className={`text-[9px] font-bold uppercase tracking-tighter transition-colors ${active ? 'text-blue-400' : 'text-white/60 group-hover:text-white'}`}>{label}</span>
  </button>
);

const NavButton: React.FC<{ icon: React.ReactNode; active?: boolean; onClick: () => void }> = ({ icon, active, onClick }) => (
  <button onClick={onClick} className={`p-2 transition-all active:scale-90 relative ${active ? "text-blue-500" : "text-white/40 hover:text-white/60"}`}>
    {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { className: "w-8 h-8" }) : icon}
    {active && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6]" />}
  </button>
);

export const PixelEditingTools: React.FC = () => {
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem | null>(null);
  const [searchParams] = useSearchParams();

  const PRESETS = [
    { id: "jakir", name: "টেক জাকির", width: 1080, height: 1080, bgClass: "bg-white", text: "টেক জাকির" },
    { id: "fb-id", name: "ফেসবুক আইডি কভার সাইজ", width: 820, height: 312, bgClass: "bg-gradient-to-r from-red-800 to-orange-400", text: "ফেসবুক আইডি কভার সাইজ" },
    { id: "fb-group", name: "ফেসবুক গ্রুপ কভার সাইজ", width: 1640, height: 856, bgClass: "bg-gradient-to-r from-blue-900 to-blue-600", text: "ফেসবুক গ্রুপ কভার সাইজ" },
    { id: "id-card", name: "আইডি কার্ড সাইজ", width: 1011, height: 638, bgClass: "bg-gradient-to-b from-red-600 to-indigo-900", text: "আইডি কার্ড সাইজ" },
    { id: "id-card-land", name: "আইডি কার্ড সাইজ ল্যান্ডস্কেপ", width: 1011, height: 638, bgClass: "bg-gradient-to-r from-blue-900 to-purple-900", text: "আইডি কার্ড সাইজ ল্যান্ডস্কেপ" }
  ];

  const [layers, setLayers] = useState<TemplateElement[]>([]);
  const layersRef = useRef<TemplateElement[]>([]);
  useEffect(() => {
    layersRef.current = layers;
  }, [layers]);
  const lastTapTimeRef = useRef<{ id: string; time: number }>({ id: '', time: 0 });
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingText, setEditingText] = useState<{ id: string, text: string } | null>(null);
  const [history, setHistory] = useState<TemplateElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(false);
  const [showLayerManager, setShowLayerManager] = useState(false);
  const [activeTab, setActiveTab] = useState<BottomTab>("project");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<"png" | "jpeg">("png");
  const [exportQuality, setExportQuality] = useState<number>(4);
  const [savedSuccessInfo, setSavedSuccessInfo] = useState<{
    url: string;
    filename: string;
    resolution: string;
    format: string;
  } | null>(null);

  // Subtool Modals
  const [isFontPickerOpen, setIsFontPickerOpen] = useState(false);
  const [activeTextTool, setActiveTextTool] = useState<TextToolType | null>(null);
  const [activeStickerShapeModal, setActiveStickerShapeModal] = useState<'stickers' | 'shapes' | 'quotes' | 'date' | 'image-size' | 'bg-color' | null>(null);

  // Effects & Filters State
  const [canvasFilters, setCanvasFilters] = useState({
    brightness: 100,
    contrast: 100,
    hue: 0,
    saturate: 100,
    vignette: false,
    noise: false,
    stripes: false,
    rotation: 0
  });

  const canvasRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const [canvasBackground, setCanvasBackground] = useState<string>("bg-white");
  const [canvasBackgroundImage, setCanvasBackgroundImage] = useState<string | null>(() => {
    return localStorage.getItem("pixellab_draft_bg_img") || null;
  });
  const [pendingCropImage, setPendingCropImage] = useState<{ src: string; mode: 'background' | 'layer' } | null>(null);
  const [uploadMode, setUploadMode] = useState<'background' | 'layer'>('background');
  
  // Color Bar Tool States (Exact PixelLab Inline Bottom UI)
  const [isBgColorBarActive, setIsBgColorBarActive] = useState(false);
  const [prevBgColor, setPrevBgColor] = useState<string>("bg-white");
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [isTextColorBarActive, setIsTextColorBarActive] = useState(false);
  const [prevTextColor, setPrevTextColor] = useState<string>("#000000");

  // Design Size & Canvas Selector States
  const [selectedSizeCategory, setSelectedSizeCategory] = useState<string>("all");
  const [isCustomSizeModalOpen, setIsCustomSizeModalOpen] = useState(false);
  const [customWidth, setCustomWidth] = useState<number>(1080);
  const [customHeight, setCustomHeight] = useState<number>(1080);
  const [customName, setCustomName] = useState<string>("কাস্টম সাইজ");
  const [libraryModalInitialTab, setLibraryModalInitialTab] = useState<"frames" | "templates" | "presets" | "favorites" | "recent">("frames");
  const [placeholderTargetId, setPlaceholderTargetId] = useState<string | null>(null);
  const [firestoreTemplates, setFirestoreTemplates] = useState<TemplateItem[]>([]);
  const [bottomCardPreview, setBottomCardPreview] = useState<TemplateItem | null>(null);
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);

  // Background Album Selection Handler
  const handleSelectBackgroundAlbumItem = (item: BackgroundAlbumItem, addSampleText: boolean, customCaption?: string) => {
    // 1. Set background image as SVG
    setCanvasBackgroundImage(item.svg);
    setCanvasBackground("bg-white");
    try {
      localStorage.setItem("pixellab_draft_bg_img", item.svg);
    } catch {}

    // 2. Automatically add/replace editable caption layer if user enabled it
    if (addSampleText) {
      const canvasW = selectedTemplate?.width || 1000;
      const canvasH = selectedTemplate?.height || 1000;
      
      const newCaptionLayer: TemplateElement = {
        id: `caption-${Date.now()}`,
        type: "text",
        content: customCaption?.trim() || item.defaultCaption || "এখানে আপনার লেখা লিখুন",
        x: Math.round(canvasW * 0.12),
        y: Math.round(canvasH * 0.32),
        width: Math.round(canvasW * 0.76),
        height: 180,
        color: item.textColor || "#1e293b",
        fontSize: Math.max(28, Math.round(canvasW * 0.038)),
        fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif",
        fontWeight: "bold",
        textAlign: "center",
        zIndex: (layers.length > 0 ? Math.max(...layers.map(l => l.zIndex || 0)) : 0) + 1,
        rotation: 0,
        opacity: 1
      };

      const updatedLayers = [...layers, newCaptionLayer];
      setLayers(updatedLayers);
      setActiveLayerId(newCaptionLayer.id);
      saveToHistory(updatedLayers);
    }

    // Switch to Text tab for immediate editing and captions
    setActiveTab("text");
  };

  // Apply Canvas Size directly
  const handleApplyCanvasSize = (w: number, h: number, name: string, bgClass?: string) => {
    const newTemplate: TemplateItem = {
      id: `size-${w}x${h}-${Date.now()}`,
      name: name || `${w} × ${h}`,
      width: w,
      height: h,
      category: "presets",
      thumbnail: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      bgClass: bgClass || "bg-white",
      elements: []
    };

    setSelectedTemplate(newTemplate);
    if (bgClass) {
      setCanvasBackground(bgClass);
    }

    // If no layers, create starter editable Bengali text layer centered
    if (layers.length === 0) {
      const defaultTextLayer: TemplateElement = {
        id: "default-title-text",
        type: "text",
        content: "আমার ডিজাইন",
        x: Math.round(w / 2 - Math.min(w * 0.4, 300) / 2),
        y: Math.round(h / 2 - 40),
        width: Math.min(w * 0.8, 400),
        height: 80,
        zIndex: 1,
        fontSize: Math.max(32, Math.min(72, Math.round(w / 18))),
        fontFamily: "'Hind Siliguri', sans-serif",
        color: bgClass && bgClass.includes("bg-white") ? "#000000" : "#ffffff",
        rotation: 0,
        opacity: 1,
        fontWeight: "bold",
        textAlign: "center"
      };
      setLayers([defaultTextLayer]);
      setHistory([[defaultTextLayer]]);
      setHistoryIndex(0);
      setActiveLayerId(defaultTextLayer.id);
    } else {
      // Reposition or keep layers within bounds
      saveToHistory(layers);
    }
  };

  // Real-time Firestore template listener for dynamic sync
  useEffect(() => {
    try {
      const q = query(collection(db, "templates"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TemplateItem));
        setFirestoreTemplates(list);
      }, (err) => {
        console.warn("Real-time template sync notice:", err);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn("Firestore listener setup notice:", e);
    }
  }, []);

  const handleTriggerImageUpload = (mode: 'background' | 'layer') => {
    setPlaceholderTargetId(null);
    setUploadMode(mode);
    setDropdownOpen(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleTriggerPlaceholderUpload = (layerId: string) => {
    setPlaceholderTargetId(layerId);
    setUploadMode('layer');
    setDropdownOpen(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleCropComplete = (croppedBase64: string, cropW: number, cropH: number) => {
    if (!pendingCropImage) return;

    if (placeholderTargetId) {
      // Photo inserted into existing placeholder layer
      updateLayer(placeholderTargetId, {
        content: croppedBase64
      });
      setPlaceholderTargetId(null);
    } else if (pendingCropImage.mode === 'background') {
      setCanvasBackgroundImage(croppedBase64);
      // Auto adjust canvas template dimensions based on cropped image aspect ratio
      const baseW = 1080;
      const calcH = Math.round((baseW * cropH) / cropW);

      setSelectedTemplate(prev => ({
        id: prev?.id || 'custom-image-bg',
        name: prev?.name || 'Custom Image Canvas',
        width: baseW,
        height: calcH,
        category: prev?.category || 'presets',
        thumbnail: '',
        createdAt: prev?.createdAt || Date.now(),
        updatedAt: Date.now(),
        elements: layers
      }));

      try {
        localStorage.setItem("pixellab_draft_bg_img", croppedBase64);
      } catch (e) {
        console.warn(e);
      }
    } else {
      // Layer mode
      const w = selectedTemplate?.width || 1000;
      const h = selectedTemplate?.height || 1000;
      const targetW = Math.min(450, Math.round(w * 0.5));
      const targetH = Math.round((targetW * cropH) / cropW);

      const newLayer: TemplateElement = {
        id: `image-${Date.now()}`,
        type: "image",
        content: croppedBase64,
        x: Math.max(0, (w - targetW) / 2),
        y: Math.max(0, (h - targetH) / 2),
        width: targetW,
        height: targetH,
        zIndex: layers.length + 1,
        rotation: 0,
        opacity: 1
      };
      const newLayers = [...layers, newLayer];
      setLayers(newLayers);
      saveToHistory(newLayers);
      setActiveLayerId(newLayer.id);
      setActiveTab("object");
    }

    setPendingCropImage(null);
  };

  // Save history state
  const saveToHistory = (newLayers: TemplateElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newLayers)));
    if (newHistory.length > 30) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    // Save draft locally
    try {
      localStorage.setItem("pixellab_draft_layers", JSON.stringify(newLayers));
      localStorage.setItem("pixellab_draft_bg", canvasBackground);
    } catch (e) {
      console.warn("Storage draft save error", e);
    }
  };

  const updateLayer = (id: string, updates: Partial<TemplateElement>, skipHistory = false) => {
    setLayers(prevLayers => {
      const newLayers = prevLayers.map(l => l.id === id ? { ...l, ...updates } : l);
      layersRef.current = newLayers;
      if (!skipHistory) {
        saveToHistory(newLayers);
      }
      return newLayers;
    });
  };

  const handleSelectTemplate = (template: TemplateItem) => {
    setSelectedTemplate(template);
    setCanvasBackground(template.bgClass || "bg-white");
    const initialLayers: TemplateElement[] = template.elements && template.elements.length > 0 
      ? template.elements 
      : [
        {
          id: "default-text",
          type: "text",
          content: "আমার ডিজাইন",
          x: (template.width || 1000) / 2 - 200,
          y: (template.height || 1000) / 2 - 50,
          width: 400,
          height: 100,
          zIndex: 1,
          fontSize: 60,
          fontFamily: "'Hind Siliguri', sans-serif",
          color: "#000000",
          rotation: 0,
          opacity: 1,
          fontWeight: "bold",
          textAlign: "center"
        }
      ];
    setLayers(initialLayers);
    setHistory([initialLayers]);
    setHistoryIndex(0);
    setIsLibraryOpen(false);
    setActiveLayerId(initialLayers[0]?.id || null);
  };

  // URL Query Loading & Initial Draft
  useEffect(() => {
    const w = searchParams.get("w");
    const h = searchParams.get("h");
    const name = searchParams.get("name");

    if (w && h) {
      const template: TemplateItem = {
        id: "url-preset",
        name: name || "Custom Size",
        width: parseInt(w, 10),
        height: parseInt(h, 10),
        category: "presets",
        thumbnail: "",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        elements: [
          {
            id: "default-text",
            type: "text",
            content: "আমার টেক্সট",
            x: parseInt(w, 10) / 2 - 200,
            y: parseInt(h, 10) / 2 - 50,
            width: 400,
            height: 100,
            zIndex: 1,
            fontSize: 54,
            fontFamily: "'Hind Siliguri', sans-serif",
            color: "#000000",
            rotation: 0,
            opacity: 1,
            fontWeight: "bold",
            textAlign: "center"
          }
        ]
      };
      setSelectedTemplate(template);
      setLayers(template.elements || []);
      setHistory([template.elements || []]);
      setHistoryIndex(0);
      setActiveLayerId("default-text");
    } else if (!selectedTemplate) {
      const defaultPreset = PRESETS[0];
      handleSelectTemplate({
        id: defaultPreset.id,
        name: defaultPreset.name,
        width: defaultPreset.width,
        height: defaultPreset.height,
        thumbnail: "",
        category: "presets",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        elements: []
      });
    }
  }, [searchParams]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setLayers(JSON.parse(JSON.stringify(history[prevIndex])));
      setHistoryIndex(prevIndex);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setLayers(JSON.parse(JSON.stringify(history[nextIndex])));
      setHistoryIndex(nextIndex);
    }
  };

  // Export Work - Save directly to mobile device in Ultra HD
  const handleSaveWork = async (overrideQuality?: number, overrideFormat?: "png" | "jpeg") => {
    if (!exportRef.current || !selectedTemplate) return;
    setIsSaving(true);
    setActiveLayerId(null);

    const qualityScale = overrideQuality || exportQuality || 4; // Default to 4x Ultra HD
    const format = overrideFormat || exportFormat;
    const targetWidth = selectedTemplate.width;
    const targetHeight = selectedTemplate.height;

    try {
      // Ensure all web fonts are loaded
      if (document.fonts) {
        await document.fonts.ready;
      }
      // Small pause to flush state changes
      await new Promise(r => setTimeout(r, 200));

      const isTransparent = canvasBackground === "bg-transparent";
      
      const canvas = await html2canvas(exportRef.current, {
        useCORS: true,
        allowTaint: true,
        scale: qualityScale,
        width: targetWidth,
        height: targetHeight,
        windowWidth: targetWidth,
        windowHeight: targetHeight,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        backgroundColor: isTransparent ? null : (
          canvasBackground === "bg-white" ? "#ffffff" : 
          canvasBackground === "bg-black" ? "#000000" : 
          canvasBackground.startsWith("#") ? canvasBackground : null
        ),
        logging: false,
        imageTimeout: 20000,
        onclone: (_clonedDoc, clonedElement) => {
          // Guarantee that the cloned element has zero transform scaling applied,
          // rendering perfectly at true native design coordinates and maximum pixel density!
          clonedElement.style.transform = 'none';
          clonedElement.style.transformOrigin = '0 0';
          clonedElement.style.position = 'relative';
          clonedElement.style.left = '0px';
          clonedElement.style.top = '0px';
          clonedElement.style.width = `${targetWidth}px`;
          clonedElement.style.height = `${targetHeight}px`;
          clonedElement.style.margin = '0px';
          clonedElement.style.padding = '0px';

          if (clonedElement.parentElement) {
            clonedElement.parentElement.style.transform = 'none';
            clonedElement.parentElement.style.transformOrigin = '0 0';
            clonedElement.parentElement.style.filter = 'none';
            clonedElement.parentElement.style.width = `${targetWidth}px`;
            clonedElement.parentElement.style.height = `${targetHeight}px`;
            clonedElement.parentElement.style.position = 'relative';
            clonedElement.parentElement.style.overflow = 'visible';
          }
        }
      });

      // Apply any canvas visual filters if configured
      let finalCanvas = canvas;
      if (
        canvasFilters.brightness !== 100 || 
        canvasFilters.contrast !== 100 || 
        canvasFilters.hue !== 0 || 
        canvasFilters.saturate !== 100
      ) {
        const filteredCanvas = document.createElement("canvas");
        filteredCanvas.width = canvas.width;
        filteredCanvas.height = canvas.height;
        const ctx = filteredCanvas.getContext("2d");
        if (ctx) {
          ctx.filter = `brightness(${canvasFilters.brightness}%) contrast(${canvasFilters.contrast}%) hue-rotate(${canvasFilters.hue}deg) saturate(${canvasFilters.saturate}%)`;
          ctx.drawImage(canvas, 0, 0);
          finalCanvas = filteredCanvas;
        }
      }
      
      const mime = format === "png" ? "image/png" : "image/jpeg";
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `PixelLab_UltraHD_${finalCanvas.width}x${finalCanvas.height}_${timestamp}.${format === 'png' ? 'png' : 'jpg'}`;

      // Use Data URL for 100% robust mobile download support in WebView & PWA
      const dataUrl = finalCanvas.toDataURL(mime, 1.0);
      
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = filename;
      link.setAttribute("download", filename);
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      
      // Set saved success info with preview and direct re-download capability
      setSavedSuccessInfo({
        url: dataUrl,
        filename: filename,
        resolution: `${finalCanvas.width} × ${finalCanvas.height} px`,
        format: format.toUpperCase()
      });

      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
      }, 1000);

      setIsShareModalOpen(false);
    } catch (err) {
      console.error("Export failed:", err);
      alert("ছবি সেভ করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
    } finally {
      setIsSaving(false);
    }
  };

  // Add New Text Layer
  const addTextLayer = (customContent = "নতুন টেক্সট") => {
    const width = selectedTemplate?.width || 1000;
    const height = selectedTemplate?.height || 1000;
    const newLayer: TemplateElement = {
      id: `text-${Date.now()}`,
      type: "text",
      content: customContent,
      x: width / 2 - 200,
      y: height / 2 - 50,
      width: 400,
      height: 100,
      zIndex: layers.length + 1,
      rotation: 0,
      opacity: 1,
      fontSize: 50,
      fontFamily: "'Hind Siliguri', sans-serif",
      fontWeight: "bold",
      color: "#000000",
      textAlign: "center"
    };
    const newLayers = [...layers, newLayer];
    setLayers(newLayers);
    saveToHistory(newLayers);
    setActiveLayerId(newLayer.id);
    setActiveTab("text");
    setDropdownOpen(null);
  };

  // Duplicate Layer
  const duplicateLayer = (layerId: string) => {
    const target = layers.find(l => l.id === layerId);
    if (!target) return;
    const clone: TemplateElement = {
      ...JSON.parse(JSON.stringify(target)),
      id: `${target.type}-${Date.now()}`,
      x: target.x + 30,
      y: target.y + 30,
      zIndex: layers.length + 1
    };
    const newLayers = [...layers, clone];
    setLayers(newLayers);
    saveToHistory(newLayers);
    setActiveLayerId(clone.id);
  };

  // Layer Stacking (To Front / To Back)
  const bringToFront = (layerId: string) => {
    const maxZ = Math.max(...layers.map(l => l.zIndex || 1), 1);
    updateLayer(layerId, { zIndex: maxZ + 1 });
  };

  const sendToBack = (layerId: string) => {
    const minZ = Math.min(...layers.map(l => l.zIndex || 1), 1);
    const newLayers = layers.map(l => l.id === layerId ? { ...l, zIndex: Math.max(0, minZ - 1) } : l);
    setLayers(newLayers);
    saveToHistory(newLayers);
  };

  const moveLayerOrder = (layerId: string, direction: 'up' | 'down') => {
    const sorted = [...layers].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
    const index = sorted.findIndex(l => l.id === layerId);
    if (index === -1) return;

    if (direction === 'up' && index < sorted.length - 1) {
      const currentZ = sorted[index].zIndex;
      sorted[index].zIndex = sorted[index + 1].zIndex;
      sorted[index + 1].zIndex = currentZ;
    } else if (direction === 'down' && index > 0) {
      const currentZ = sorted[index].zIndex;
      sorted[index].zIndex = sorted[index - 1].zIndex;
      sorted[index - 1].zIndex = currentZ;
    }
    setLayers([...sorted]);
    saveToHistory([...sorted]);
  };

  const deleteLayer = (layerId: string) => {
    const newLayers = layers.filter(l => l.id !== layerId);
    setLayers(newLayers);
    saveToHistory(newLayers);
    setActiveLayerId(null);
  };

  const activeLayer = useMemo(() => layers.find(l => l.id === activeLayerId) || null, [layers, activeLayerId]);

  const visibleSortedLayers = useMemo(() => {
    return layers
      .filter(l => !l.isHidden)
      .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
  }, [layers]);

  const [canvasScale, setCanvasScale] = useState(1);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasContainerRef.current) return;
    const updateSize = () => {
      if (canvasContainerRef.current && selectedTemplate) {
        const rect = canvasContainerRef.current.getBoundingClientRect();
        const padding = 24;
        const availW = Math.max(50, rect.width - padding);
        const availH = Math.max(50, rect.height - padding);
        const scaleW = availW / selectedTemplate.width;
        const scaleH = availH / selectedTemplate.height;
        setCanvasScale(Math.min(scaleW, scaleH));
      }
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(canvasContainerRef.current);
    window.addEventListener('resize', updateSize);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, [selectedTemplate?.width, selectedTemplate?.height]);

  const getCanvasBgInlineStyle = () => {
    if (canvasBackground === "bg-transparent") {
      return {
        backgroundColor: "transparent",
        backgroundImage: `linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)`,
        backgroundSize: '24px 24px',
        backgroundPosition: '0 0, 0 12px, 12px -12px, -12px 0px'
      };
    }
    if (canvasBackground.startsWith("linear-gradient") || canvasBackground.startsWith("radial-gradient")) {
      return { background: canvasBackground };
    }
    if (canvasBackground.startsWith("#") || canvasBackground.startsWith("rgb") || canvasBackground.startsWith("hsl")) {
      return { backgroundColor: canvasBackground };
    }
    if (canvasBackground === "bg-white") return { backgroundColor: "#ffffff" };
    if (canvasBackground === "bg-black") return { backgroundColor: "#000000" };
    return {};
  };

  // Open Text Editor Dialog helper
  const openTextEditor = (layer: TemplateElement) => {
    if (layer.type === "text") {
      setActiveLayerId(layer.id);
      setActiveTab("text");
      setEditingText({ id: layer.id, text: layer.content || "" });
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const val = textareaRef.current.value;
          textareaRef.current.setSelectionRange(val.length, val.length);
        }
      }, 50);
    }
  };

  // Real-time Gesture & Pointer Handlers for Smooth PixelLab-like Interactions
  const handleLayerPointerDown = (e: React.PointerEvent, layer: TemplateElement) => {
    if (layer.isLocked) return;
    if (e.pointerType === 'touch' && !e.isPrimary) return;

    e.stopPropagation();
    setActiveLayerId(layer.id);
    if (layer.type === "text") {
      setActiveTab("text");
    } else {
      setActiveTab("object");
    }

    // Double tap / double click detection (50ms to 500ms window)
    const now = Date.now();
    const timeDiff = now - lastTapTimeRef.current.time;
    if (layer.type === "text" && lastTapTimeRef.current.id === layer.id && timeDiff > 40 && timeDiff < 500) {
      lastTapTimeRef.current = { id: '', time: 0 };
      openTextEditor(layer);
      return;
    }
    lastTapTimeRef.current = { id: layer.id, time: now };

    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const initialX = layer.x;
    const initialY = layer.y;
    let hasMoved = false;
    let rafId: number | null = null;
    let currentX = initialX;
    let currentY = initialY;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const scale = (canvasScale * zoom) || 1;
      const deltaX = (moveEvent.clientX - startClientX) / scale;
      const deltaY = (moveEvent.clientY - startClientY) / scale;

      if (Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1) {
        hasMoved = true;
      }

      currentX = Math.round(initialX + deltaX);
      currentY = Math.round(initialY + deltaY);

      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          updateLayer(layer.id, { x: currentX, y: currentY }, true);
          rafId = null;
        });
      }
    };

    const onPointerUp = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      if (hasMoved) {
        updateLayer(layer.id, { x: currentX, y: currentY }, false);
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  };

  // Two-Finger Pinch to Scale & Rotate Gesture on Selected Layer
  const handleLayerTouchStart = (e: React.TouchEvent, layer: TemplateElement) => {
    if (layer.isLocked) return;

    if (e.touches.length === 2) {
      e.stopPropagation();
      setActiveLayerId(layer.id);
      if (layer.type === "text") {
        setActiveTab("text");
      }

      const t0 = e.touches[0];
      const t1 = e.touches[1];
      const initialDist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
      const initialAngle = Math.atan2(t1.clientY - t0.clientY, t1.clientX - t0.clientX) * (180 / Math.PI);

      const startWidth = layer.width;
      const startHeight = layer.height;
      const startFontSize = layer.fontSize || 50;
      const startRotation = layer.rotation || 0;
      let hasChanged = false;

      const onTouchMove = (moveEvent: TouchEvent) => {
        if (moveEvent.touches.length === 2) {
          moveEvent.preventDefault();
          hasChanged = true;
          const mt0 = moveEvent.touches[0];
          const mt1 = moveEvent.touches[1];

          const currDist = Math.hypot(mt1.clientX - mt0.clientX, mt1.clientY - mt0.clientY);
          const currAngle = Math.atan2(mt1.clientY - mt0.clientY, mt1.clientX - mt0.clientX) * (180 / Math.PI);

          const ratio = currDist / (initialDist || 1);
          const angleDiff = currAngle - initialAngle;

          const newWidth = Math.max(40, Math.round(startWidth * ratio));
          const newHeight = Math.max(20, Math.round(startHeight * ratio));
          const newFontSize = layer.type === 'text' 
            ? Math.max(12, Math.min(400, Math.round(startFontSize * ratio)))
            : undefined;
          let newRotation = Math.round((startRotation + angleDiff) % 360);
          if (newRotation < 0) newRotation += 360;

          updateLayer(layer.id, {
            width: newWidth,
            height: newHeight,
            fontSize: newFontSize,
            rotation: newRotation
          }, true);
        }
      };

      const onTouchEnd = () => {
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend', onTouchEnd);
        window.removeEventListener('touchcancel', onTouchEnd);
        if (hasChanged) {
          saveToHistory(layersRef.current);
        }
      };

      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend', onTouchEnd);
      window.addEventListener('touchcancel', onTouchEnd);
    }
  };

  // Resize Corner Handle (Supports both Pointer and Touch, Smooth 60/120fps)
  const handleResizePointerDown = (
    e: React.PointerEvent | React.MouseEvent | React.TouchEvent, 
    layer: TemplateElement
  ) => {
    e.stopPropagation();
    const isTouch = 'touches' in e;
    const startX = isTouch ? e.touches[0].clientX : (e as React.PointerEvent).clientX;
    const startY = isTouch ? e.touches[0].clientY : (e as React.PointerEvent).clientY;
    const startWidth = layer.width;
    const startHeight = layer.height;
    const startFontSize = layer.fontSize || 50;
    let hasResized = false;

    let rafId: number | null = null;
    let curW = startWidth;
    let curH = startHeight;
    let curFont = startFontSize;

    const onMove = (clientX: number, clientY: number) => {
      hasResized = true;
      const scale = (canvasScale * zoom) || 1;
      const dx = (clientX - startX) / scale;
      const dy = (clientY - startY) / scale;

      // Natural thumb diagonal projection: moving down/right expands, moving up/left shrinks
      const diff = (dx + dy) / 1.414;
      const newW = Math.max(30, Math.round(startWidth + diff));
      const ratio = newW / (startWidth || 1);
      
      // Proportional aspect ratio for images/shapes/placeholders
      const newH = layer.type === 'text' 
        ? Math.max(20, Math.round(startHeight * ratio))
        : Math.max(20, Math.round(startHeight * (newW / startWidth)));
      const newFont = Math.max(12, Math.min(400, Math.round(startFontSize * ratio)));

      curW = newW;
      curH = newH;
      curFont = newFont;

      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          updateLayer(layer.id, {
            width: curW,
            height: curH,
            fontSize: layer.type === 'text' ? curFont : undefined
          }, true);
          rafId = null;
        });
      }
    };

    const handlePointerMove = (ev: PointerEvent) => {
      ev.preventDefault();
      onMove(ev.clientX, ev.clientY);
    };

    const handleTouchMove = (ev: TouchEvent) => {
      if (ev.touches.length > 0) {
        ev.preventDefault();
        onMove(ev.touches[0].clientX, ev.touches[0].clientY);
      }
    };

    const handleEnd = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
      if (hasResized) {
        updateLayer(layer.id, {
          width: curW,
          height: curH,
          fontSize: layer.type === 'text' ? curFont : undefined
        }, false);
      }
    };

    if (isTouch) {
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
    } else {
      window.addEventListener('pointermove', handlePointerMove, { passive: false });
      window.addEventListener('pointerup', handleEnd);
    }
  };

  // Rotation Handle (Supports both Drag Rotation and Tap for 45° step)
  const handleRotatePointerDown = (
    e: React.PointerEvent | React.MouseEvent | React.TouchEvent, 
    layer: TemplateElement
  ) => {
    e.stopPropagation();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.PointerEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.PointerEvent).clientY;
    
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    const scale = (canvasScale * zoom) || 1;
    const centerX = canvasRect.left + (layer.x + layer.width / 2) * scale;
    const centerY = canvasRect.top + (layer.y + layer.height / 2) * scale;
    const startAngle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
    const initialRotation = layer.rotation || 0;
    let didDrag = false;

    const onMove = (currX: number, currY: number) => {
      didDrag = true;
      const currentAngle = Math.atan2(currY - centerY, currX - centerX) * (180 / Math.PI);
      const diff = currentAngle - startAngle;
      let newRot = Math.round((initialRotation + diff) % 360);
      if (newRot < 0) newRot += 360;
      updateLayer(layer.id, { rotation: newRot }, true);
    };

    const handlePointerMove = (ev: PointerEvent) => onMove(ev.clientX, ev.clientY);
    const handleTouchMove = (ev: TouchEvent) => {
      if (ev.touches.length > 0) onMove(ev.touches[0].clientX, ev.touches[0].clientY);
    };

    const handleEnd = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
      if (didDrag) {
        saveToHistory(layersRef.current);
      } else {
        const nextRot = ((layer.rotation || 0) + 45) % 360;
        updateLayer(layer.id, { rotation: nextRot }, false);
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleEnd);
  };

  return (
    <div className="fixed inset-0 w-full h-full max-h-screen bg-black flex flex-col font-sans select-none overflow-hidden text-white touch-none">
      {/* 1. Top Bar */}
      <div className="bg-black px-4 pt-3 pb-2 flex items-center justify-between z-50 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="p-2 text-white/60 hover:text-white transition-colors flex items-center justify-center rounded-xl hover:bg-white/5"
            title="ফিরে যান"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="h-6 w-[1px] bg-white/10 mx-1" />
          
          {/* Add Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setDropdownOpen(dropdownOpen === "add" ? null : "add")}
              className="p-2 text-white hover:text-blue-400 transition-colors"
            >
              <Plus className="w-6 h-6" />
            </button>
            <AnimatePresence>
              {dropdownOpen === "add" && (
                <DropdownMenu onClose={() => setDropdownOpen(null)}>
                  <DropdownItem 
                    icon={<FolderHeart className="w-4 h-4 text-amber-400" />} 
                    label="album (ব্যাকগ্রাউন্ড অ্যালবাম - ১০৮+)" 
                    onClick={() => {
                      setIsAlbumModalOpen(true);
                      setDropdownOpen(null);
                    }} 
                  />
                  <DropdownItem icon={<Type className="w-4 h-4 text-white" />} label="text (টেক্সট)" onClick={() => addTextLayer()} />
                  <DropdownItem icon={<Calendar className="w-4 h-4 text-white" />} label="current date (তারিখ)" onClick={() => {
                    setActiveStickerShapeModal('date');
                    setDropdownOpen(null);
                  }} />
                  <DropdownItem icon={<Sticker className="w-4 h-4 text-white" />} label="sticker (স্টিকার)" onClick={() => {
                    setActiveStickerShapeModal('stickers');
                    setDropdownOpen(null);
                  }} />
                  <DropdownItem icon={<Shapes className="w-4 h-4 text-white" />} label="shapes (শেপ)" onClick={() => {
                    setActiveStickerShapeModal('shapes');
                    setDropdownOpen(null);
                  }} />
                  <DropdownItem icon={<GalleryIcon className="w-4 h-4 text-white" />} label="from gallery (গ্যালারি থেকে ছবি)" onClick={() => {
                    handleTriggerImageUpload('layer');
                  }} />
                  <DropdownItem icon={<PenTool className="w-4 h-4 text-white" />} label="draw (অঙ্কন)" onClick={() => {
                    addTextLayer("✏️ Drawing");
                    setDropdownOpen(null);
                  }} />
                </DropdownMenu>
              )}
            </AnimatePresence>

            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (evt) => {
                  const result = evt.target?.result as string;
                  if (result) {
                    setPendingCropImage({
                      src: result,
                      mode: uploadMode
                    });
                  }
                };
                reader.readAsDataURL(file);
                e.target.value = '';
              }} 
            />
          </div>

          {/* Save Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setDropdownOpen(dropdownOpen === "save" ? null : "save")}
              className="p-2 text-white hover:text-blue-400 transition-colors"
              title="Save options"
            >
              <Save className="w-6 h-6" />
            </button>
            <AnimatePresence>
              {dropdownOpen === "save" && (
                <DropdownMenu onClose={() => setDropdownOpen(null)}>
                  <DropdownItem 
                    icon={<Smartphone className="w-4 h-4 text-emerald-400" />} 
                    label="সরাসরি মোবাইলে সেভ করুন (Ultra HD)" 
                    onClick={() => {
                      setIsShareModalOpen(true);
                      setDropdownOpen(null);
                    }} 
                  />
                  <DropdownItem 
                    icon={<Save className="w-4 h-4 text-blue-400" />} 
                    label="save as project" 
                    onClick={() => {
                      const projectData = {
                        id: `project-${Date.now()}`,
                        name: selectedTemplate?.name || "Pixel Project",
                        width: selectedTemplate?.width || 1000,
                        height: selectedTemplate?.height || 1000,
                        bgClass: canvasBackground,
                        elements: layers,
                        savedAt: Date.now()
                      };
                      localStorage.setItem("pixellab_saved_project", JSON.stringify(projectData));
                      setDropdownOpen(null);
                      alert("প্রজেক্ট সফলভাবে সেভ করা হয়েছে!");
                    }} 
                  />
                </DropdownMenu>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={() => setIsAlbumModalOpen(true)}
            title="Background Album (১০৮+ ব্যাকগ্রাউন্ড অ্যালবাম)"
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600/30 to-indigo-600/30 border border-blue-500/40 text-blue-300 hover:text-white hover:border-blue-400 transition-all text-xs font-semibold shadow-sm"
          >
            <FolderHeart className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">অ্যালবাম (১০৮+)</span>
          </button>
          <button 
            onClick={() => setActiveStickerShapeModal('quotes')}
            title="Quotes & Ukti"
            className="p-2 text-white hover:text-blue-400 transition-colors"
          >
            <Quote className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* 2. Secondary Toolbar */}
      <div className="bg-black px-4 py-2 flex items-center justify-between border-b border-white/5 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              if (activeLayer && activeLayer.type === "text") {
                setEditingText({ id: activeLayer.id, text: activeLayer.content || "" });
              }
            }}
            disabled={!activeLayer}
            className={`p-2 rounded-lg transition-colors ${activeLayer ? "bg-white/10 text-white" : "text-white/20 cursor-not-allowed"}`}
          >
            <Pencil className="w-6 h-6" />
          </button>
          <button 
            onClick={() => {
              if (activeLayerId) {
                deleteLayer(activeLayerId);
              }
            }}
            disabled={!activeLayerId}
            className={`p-2 rounded-lg transition-colors ${activeLayerId ? "bg-white/10 text-white hover:bg-red-500/20 hover:text-red-400" : "text-white/20 cursor-not-allowed"}`}
          >
            <Trash2 className="w-6 h-6" />
          </button>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={handleUndo} disabled={historyIndex <= 0} className={`p-2 transition-colors ${historyIndex > 0 ? "text-white" : "text-white/20"}`}>
            <Undo2 className="w-6 h-6" />
          </button>
          <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className={`p-2 transition-colors ${historyIndex < history.length - 1 ? "text-white" : "text-white/20"}`}>
            <Redo2 className="w-6 h-6" />
          </button>
          <button onClick={() => setShowLayerManager(!showLayerManager)} className={`p-2 transition-colors ${showLayerManager ? "text-blue-500" : "text-white"}`}>
            <Layers className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* 3. Main Canvas */}
      <main 
        ref={canvasContainerRef}
        className="flex-1 min-h-0 flex items-center justify-center p-3 sm:p-4 overflow-hidden relative bg-[#0c0e15] touch-none select-none overscroll-none" 
        onClick={() => setActiveLayerId(null)}
      >
        <div 
          ref={canvasRef}
          style={{ 
            width: selectedTemplate ? selectedTemplate.width : 1000,
            height: selectedTemplate ? selectedTemplate.height : 1000,
            transform: `scale(${canvasScale * zoom}) rotate(${canvasFilters.rotation}deg)`,
            filter: `brightness(${canvasFilters.brightness}%) contrast(${canvasFilters.contrast}%) hue-rotate(${canvasFilters.hue}deg) saturate(${canvasFilters.saturate}%)`,
            transformOrigin: 'center center',
            ...getCanvasBgInlineStyle()
          }}
          className="shadow-2xl relative border border-black/10 flex items-center justify-center overflow-hidden shrink-0"
        >
          {/* Export Element Container */}
          <div 
            ref={exportRef}
            className="absolute inset-0"
            style={{ 
              width: selectedTemplate?.width || 1000, 
              height: selectedTemplate?.height || 1000,
              ...getCanvasBgInlineStyle()
            }}
          >
            {canvasBackgroundImage && (
              canvasBackgroundImage.startsWith('<svg') ? (
                <div 
                  className="absolute inset-0 w-full h-full pointer-events-none [&>svg]:w-full [&>svg]:h-full"
                  dangerouslySetInnerHTML={{ __html: canvasBackgroundImage }}
                />
              ) : (
                <img 
                  src={canvasBackgroundImage} 
                  alt="Canvas Background" 
                  crossOrigin="anonymous"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none" 
                />
              )
            )}
            {showGrid && !isSaving && (
              <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 pointer-events-none opacity-25">
                {Array.from({ length: 144 }).map((_, i) => (
                  <div key={i} className="border border-blue-500/40" />
                ))}
              </div>
            )}

            {/* Vignette Overlay */}
            {canvasFilters.vignette && (
              <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_120px_rgba(0,0,0,0.8)]" />
            )}

            {visibleSortedLayers.map((layer) => {
              const isSelected = activeLayerId === layer.id && !isSaving;
              return (
                <div
                  key={layer.id}
                  onPointerDown={(e) => handleLayerPointerDown(e, layer)}
                  onTouchStart={(e) => handleLayerTouchStart(e, layer)}
                  onTouchEnd={() => {
                    if (layer.type === "text" && !layer.isLocked) {
                      const now = Date.now();
                      const diff = now - lastTapTimeRef.current.time;
                      if (lastTapTimeRef.current.id === layer.id && diff > 40 && diff < 500) {
                        lastTapTimeRef.current = { id: '', time: 0 };
                        openTextEditor(layer);
                      }
                    }
                  }}
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setActiveLayerId(layer.id);
                    if (layer.type === "text") {
                      setActiveTab("text");
                      if (e.detail === 2) {
                        openTextEditor(layer);
                      }
                    }
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    openTextEditor(layer);
                  }}
                  className={`absolute select-none will-change-transform ${layer.isLocked ? 'cursor-default' : 'cursor-move'} ${
                    isSelected ? 'outline outline-1 outline-white/90 shadow-md' : ''
                  }`}
                  style={{
                    position: 'absolute',
                    left: `${layer.x}px`,
                    top: `${layer.y}px`,
                    width: `${layer.width}px`,
                    height: `${layer.height}px`,
                    zIndex: layer.zIndex,
                    transform: `rotate(${layer.rotation || 0}deg)`,
                    transformOrigin: 'center center',
                    opacity: layer.opacity !== undefined ? layer.opacity : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: layer.textAlign === 'left' ? 'flex-start' : layer.textAlign === 'right' ? 'flex-end' : 'center',
                    backgroundColor: layer.backgroundColor || undefined,
                    padding: layer.backgroundPadding ? `${layer.backgroundPadding}px` : undefined,
                    borderRadius: layer.backgroundRadius ? `${layer.backgroundRadius}px` : undefined,
                    touchAction: 'none'
                  }}
                >
                  {layer.type === "text" ? (
                    <div 
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        openTextEditor(layer);
                      }}
                      className="w-full h-full flex items-center justify-center text-center select-none"
                      style={{ 
                        fontSize: `${layer.fontSize || 50}px`,
                        color: layer.color || "#000000",
                        fontFamily: layer.fontFamily || "'Hind Siliguri', sans-serif",
                        fontWeight: layer.fontWeight || 'bold',
                        fontStyle: layer.fontStyle || 'normal',
                        textDecoration: layer.textDecoration || 'none',
                        textAlign: layer.textAlign || 'center',
                        letterSpacing: layer.letterSpacing ? `${layer.letterSpacing}px` : 'normal',
                        lineHeight: layer.lineHeight || 1.2,
                        WebkitTextStroke: layer.strokeWidth ? `${layer.strokeWidth}px ${layer.strokeColor || '#000000'}` : undefined,
                        textShadow: layer.shadowEnabled ? `${layer.shadowOffsetX || 0}px ${layer.shadowOffsetY || 4}px ${layer.shadowBlur || 10}px ${layer.shadowColor || '#000000'}` : undefined,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        width: '100%'
                      }}
                    >
                      {layer.content}
                    </div>
                  ) : layer.type === "placeholder" ? (
                    layer.content ? (
                      <div 
                        className="w-full h-full overflow-hidden relative"
                        style={{
                          borderRadius: layer.shapeType === 'circle' ? '50%' : (layer.borderRadius ? `${layer.borderRadius}px` : '16px'),
                          borderWidth: layer.borderWidth ? `${layer.borderWidth}px` : undefined,
                          borderColor: layer.borderColor || undefined
                        }}
                      >
                        <img src={layer.content} className="w-full h-full object-cover pointer-events-none" alt="" />
                      </div>
                    ) : (
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTriggerPlaceholderUpload(layer.id);
                        }}
                        className="w-full h-full border-2 border-dashed border-blue-400 bg-blue-950/40 hover:bg-blue-900/50 flex flex-col items-center justify-center gap-1.5 p-2 cursor-pointer transition-all shadow-inner group"
                        style={{
                          borderRadius: layer.shapeType === 'circle' ? '50%' : (layer.borderRadius ? `${layer.borderRadius}px` : '16px'),
                          borderColor: layer.borderColor || '#38bdf8',
                          borderWidth: layer.borderWidth ? `${layer.borderWidth}px` : 2
                        }}
                      >
                        <div className="w-9 h-9 rounded-full bg-blue-500/20 group-hover:scale-110 flex items-center justify-center transition-transform">
                          <GalleryIcon className="w-5 h-5 text-blue-400" />
                        </div>
                        <span className="text-[11px] font-black text-white text-center leading-tight">
                          📷 ছবি যোগ করুন<br />
                          <span className="text-[9px] text-blue-300 font-semibold">Tap to Add Photo</span>
                        </span>
                      </div>
                    )
                  ) : layer.type === "shape" ? (
                    <div 
                      style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: layer.fillColor || '#3b82f6',
                        borderWidth: layer.borderWidth ? `${layer.borderWidth}px` : undefined,
                        borderColor: layer.borderColor || undefined,
                        borderRadius: layer.shapeType === 'circle' ? '50%' : layer.shapeType === 'rounded-rect' ? '24px' : undefined
                      }}
                    />
                  ) : layer.type === "sticker" ? (
                    <div className="w-full h-full flex items-center justify-center text-center font-bold" style={{ color: layer.color }}>
                      {layer.content}
                    </div>
                  ) : (
                    <img src={layer.content} className="w-full h-full object-contain pointer-events-none" alt="" />
                  )}

                  {/* Placeholder Quick Actions on Selection */}
                  {isSelected && layer.type === "placeholder" && (
                    <div className="absolute -top-11 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow-2xl z-50 whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTriggerPlaceholderUpload(layer.id);
                        }}
                        className="px-2.5 py-1 text-[10px] font-black text-white bg-blue-600 hover:bg-blue-500 rounded-full flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>{layer.content ? "ছবি পরিবর্তন" : "ছবি যোগ করুন"}</span>
                      </button>
                      {layer.content && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPendingCropImage({ src: layer.content!, mode: 'layer' });
                            setPlaceholderTargetId(layer.id);
                          }}
                          className="px-2.5 py-1 text-[10px] font-black text-white bg-indigo-600 hover:bg-indigo-500 rounded-full flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                        >
                          <Scissors className="w-3 h-3" />
                          <span>Crop</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Bounding Box Selection Handles */}
                  {isSelected && (
                    <>
                      {/* Corner Anchors */}
                      <div className="absolute -top-2 -left-2 w-4 h-4 bg-white rounded-full border border-neutral-700 shadow-md pointer-events-none" />
                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-white rounded-full border border-neutral-700 shadow-md pointer-events-none" />
                      <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-white rounded-full border border-neutral-700 shadow-md pointer-events-none" />

                      {/* Edge Handles */}
                      <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-2.5 h-6 bg-white rounded-full border border-neutral-700 shadow pointer-events-none" />
                      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-2.5 bg-white rounded-full border border-neutral-700 shadow pointer-events-none" />
                      
                      {/* Resize Handle - Large round white circle like PixelLab */}
                      <div 
                        className="absolute -bottom-3.5 -right-3.5 w-8 h-8 bg-white rounded-full border-2 border-neutral-800 shadow-2xl cursor-se-resize flex items-center justify-center touch-none z-40 active:scale-110 transition-transform"
                        onPointerDown={(e) => handleResizePointerDown(e, layer)}
                        onTouchStart={(e) => handleResizePointerDown(e, layer)}
                        title="Resize"
                      >
                        <div className="w-2.5 h-2.5 bg-blue-600 rounded-full pointer-events-none" />
                      </div>
                      
                      {/* Rotate Handle */}
                      <button 
                        onPointerDown={(e) => handleRotatePointerDown(e, layer)}
                        onTouchStart={(e) => handleRotatePointerDown(e, layer)}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateLayer(layer.id, { rotation: ((layer.rotation || 0) + 45) % 360 });
                        }}
                        className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full border-2 border-neutral-800 shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform touch-none z-40"
                        title="Rotate / ঘূর্ণন"
                      >
                         <RotateCcw className="w-4 h-4 text-neutral-800 pointer-events-none" />
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Layer Manager Drawer */}
        <LayerManagerDrawer
          isOpen={showLayerManager}
          onClose={() => setShowLayerManager(false)}
          layers={layers}
          activeLayerId={activeLayerId}
          onSelectLayer={(id) => setActiveLayerId(id)}
          onUpdateLayer={(id, updates) => updateLayer(id, updates)}
          onDeleteLayer={(id) => deleteLayer(id)}
          onDuplicateLayer={(id) => duplicateLayer(id)}
          onMoveLayer={(id, dir) => moveLayerOrder(id, dir)}
        />
      </main>

      {/* 4. Bottom Tools Section */}
      <div className="bg-[#050505] border-t border-white/10 shrink-0 select-none">
        {/* Active Tab Toolbar */}
        {activeTab === "project" ? (() => {
          const isCurrentSize = (w: number, h: number) => {
            return selectedTemplate?.width === w && selectedTemplate?.height === h;
          };

          return (
            <div className="flex items-center min-h-[92px] max-h-[92px] px-3 py-1.5 w-full shrink-0 select-none overflow-hidden">
              {/* 1. FIXED / STICKY Custom Size Button on the Left (কখনো স্ক্রল হবে না - পুরোপুরি এক জায়গায় স্থগিত থাকবে) */}
              <div className="flex-shrink-0 pr-3 border-r border-white/10 z-10">
                <div
                  onClick={() => setIsCustomSizeModalOpen(true)}
                  className="w-24 sm:w-28 h-20 relative rounded-2xl overflow-hidden border-2 border-dashed border-amber-500/60 bg-gradient-to-tr from-amber-950/50 via-orange-950/30 to-slate-900 text-white flex flex-col items-center justify-center gap-1 shadow-lg active:scale-95 hover:border-amber-400 transition-all cursor-pointer p-2 text-center select-none"
                >
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <Plus className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <span className="text-[9.5px] font-black text-amber-200 leading-tight">
                    কাস্টম সাইজ<br />
                    <span className="text-[7.5px] font-mono font-normal text-amber-400/80">Custom W × H</span>
                  </span>
                </div>
              </div>

              {/* 2. Horizontally Scrollable Preset Cards on the Right (মসৃণভাবে স্ক্রল হবে) */}
              <div className="flex-1 flex items-center gap-2.5 overflow-x-auto no-scrollbar pl-3 py-1 scroll-smooth">
                {/* Quick Album Card (১০৮+ ব্যাকগ্রাউন্ড অ্যালবাম) */}
                <div
                  onClick={() => setIsAlbumModalOpen(true)}
                  className="flex-shrink-0 w-22 sm:w-24 h-20 relative rounded-2xl overflow-hidden border border-amber-500/30 bg-gradient-to-tr from-amber-950/40 via-slate-900 to-indigo-950 text-white flex flex-col items-center justify-center gap-1 shadow-md active:scale-95 hover:border-amber-400 transition-all cursor-pointer p-1.5 text-center select-none"
                >
                  <FolderHeart className="w-5 h-5 text-amber-400" />
                  <span className="text-[9px] font-bold text-amber-200 leading-tight">
                    অ্যালবাম<br />
                    <span className="text-[7px] text-amber-300/70 font-mono">১০৮+ ব্যাকগ্রাউন্ড</span>
                  </span>
                </div>

                {/* All Size Preset Cards */}
                {CANVAS_PRESETS.map((preset) => {
                  const active = isCurrentSize(preset.width, preset.height);
                  
                  // Miniature Aspect Ratio Shape Wireframe calculation
                  const isPortrait = preset.height > preset.width;
                  const isUltraWide = preset.width / preset.height >= 2;
                  const isSquare = preset.width === preset.height;
                  
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleApplyCanvasSize(preset.width, preset.height, preset.name, preset.bgClass)}
                      className={`flex-shrink-0 w-24 sm:w-28 h-20 relative rounded-2xl overflow-hidden border-2 transition-all flex flex-col justify-between p-2 shadow-lg group active:scale-95 cursor-pointer select-none ${
                        active
                          ? "border-blue-500 bg-gradient-to-b from-blue-950/80 via-slate-900 to-[#101426] shadow-[0_0_15px_rgba(59,130,246,0.6)] ring-1 ring-blue-400"
                          : "border-white/15 bg-[#12121a] hover:border-blue-400/80 hover:bg-[#181824]"
                      }`}
                    >
                      {/* Top: Ratio Miniature Wireframe & Category Icon */}
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-1">
                          {/* Proportional Miniature Box */}
                          <div className={`border rounded-[3px] flex items-center justify-center transition-colors ${
                            active ? "border-blue-400 bg-blue-500/20" : "border-white/40 bg-white/5"
                          } ${
                            isSquare 
                              ? "w-3.5 h-3.5" 
                              : isPortrait 
                              ? "w-2.5 h-4" 
                              : isUltraWide 
                              ? "w-5 h-2" 
                              : "w-4 h-2.5"
                          }`} />
                          <span className="text-[7.5px] font-mono text-gray-400 font-bold">{preset.aspectRatio}</span>
                        </div>
                        
                        {active && (
                          <span className="w-3.5 h-3.5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[8px] font-black shadow-sm">
                            ✓
                          </span>
                        )}
                      </div>

                      {/* Middle: Exact Dimensions */}
                      <div className="text-center my-0.5">
                        <span className={`text-[9px] font-mono font-black tracking-tight ${active ? "text-blue-300" : "text-white/90 group-hover:text-white"}`}>
                          {preset.width} × {preset.height}
                        </span>
                      </div>

                      {/* Bottom: Size Name */}
                      <div className="w-full">
                        <span className={`text-[8.5px] font-bold block truncate leading-tight ${active ? "text-blue-200 font-black" : "text-gray-300 group-hover:text-blue-300"}`}>
                          {preset.name}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })() : (
          <div className="px-4 py-3 overflow-x-auto no-scrollbar flex items-center gap-4 min-h-[90px] max-h-[90px] shrink-0">

          {/* TAB 2: TEXT */}
          {activeTab === "text" && (
            isTextColorBarActive && activeLayer ? (
              <div className="w-full px-2 py-1">
                <PixelInlineColorBar
                  currentColor={activeLayer.color || "#000000"}
                  customColors={customColors}
                  onAddCustomColor={(col) => setCustomColors(prev => [col, ...prev.filter(c => c !== col)])}
                  onColorChange={(color) => {
                    updateLayer(activeLayer.id, { color });
                  }}
                  onConfirm={() => {
                    setIsTextColorBarActive(false);
                    saveToHistory(layers);
                  }}
                  onCancel={() => {
                    updateLayer(activeLayer.id, { color: prevTextColor });
                    setIsTextColorBarActive(false);
                  }}
                />
              </div>
            ) : (
              <>
                <ToolItem icon={<Palette />} label="Styles" onClick={() => setActiveTextTool('3d')} />
                <ToolItem 
                  icon={<Pencil />} 
                  label="Edit" 
                  onClick={() => {
                    if (activeLayer && activeLayer.type === "text") {
                      setEditingText({ id: activeLayer.id, text: activeLayer.content || "" });
                    } else {
                      addTextLayer();
                    }
                  }} 
                />
                <ToolItem icon={<Trash2 />} label="Delete" onClick={() => activeLayerId && deleteLayer(activeLayerId)} />
                <ToolItem icon={<Copy />} label="Copy" onClick={() => activeLayerId && duplicateLayer(activeLayerId)} />
                <ToolItem icon={<LayersIcon />} label="To Front" onClick={() => activeLayerId && bringToFront(activeLayerId)} />
                <ToolItem icon={<LayersIcon className="rotate-180" />} label="To Back" onClick={() => activeLayerId && sendToBack(activeLayerId)} />
                <ToolItem icon={<Move />} label="Position" onClick={() => setActiveTextTool('position')} />
                <ToolItem icon={<Maximize />} label="Relative" onClick={() => setActiveTextTool('relative')} />
                <ToolItem icon={<Maximize2 />} label="Size" onClick={() => setActiveTextTool('size')} />
                <ToolItem 
                  icon={<Palette />} 
                  label="Color" 
                  active={isTextColorBarActive}
                  onClick={() => {
                    if (!activeLayer || activeLayer.type !== "text") {
                      addTextLayer();
                    }
                    setPrevTextColor(activeLayer?.color || "#000000");
                    setIsTextColorBarActive(true);
                  }} 
                />
                <ToolItem icon={<Eye />} label="Opacity" onClick={() => setActiveTextTool('opacity')} />
                <ToolItem icon={<RotateCcw />} label="Rotate" onClick={() => setActiveTextTool('rotate')} />
                <ToolItem 
                  icon={<FontIcon />} 
                  label="Font" 
                  active={isFontPickerOpen}
                  onClick={() => {
                    if (!activeLayer || activeLayer.type !== "text") {
                      addTextLayer();
                    }
                    setIsFontPickerOpen(true);
                  }} 
                />
                <ToolItem icon={<Sparkles />} label="Style" onClick={() => setActiveTextTool('style')} />
                <ToolItem icon={<AlignCenter />} label="Align" onClick={() => setActiveTextTool('align')} />
                <ToolItem icon={<Sliders />} label="Spacing" onClick={() => setActiveTextTool('spacing')} />
                <ToolItem icon={<Droplets />} label="Stroke" onClick={() => setActiveTextTool('stroke')} />
                <ToolItem icon={<Sun />} label="Shadow" onClick={() => setActiveTextTool('shadow')} />
                <ToolItem icon={<Grid />} label="Background" onClick={() => setActiveTextTool('background')} />
              </>
            )
          )}

          {/* TAB 3: OBJECT */}
          {activeTab === "object" && (
            activeLayer && (activeLayer.type === "image" || activeLayer.type === "placeholder" || activeLayer.type === "shape" || activeLayer.type === "sticker") ? (
              <>
                {/* Image / Object Selected Tools */}
                {(activeLayer.type === "image" || activeLayer.type === "placeholder") && activeLayer.content && (
                  <ToolItem 
                    icon={<Scissors className="text-blue-400" />} 
                    label="Crop" 
                    onClick={() => {
                      if (activeLayer.content) {
                        setPendingCropImage({ src: activeLayer.content, mode: 'layer' });
                        setPlaceholderTargetId(activeLayer.id);
                      }
                    }} 
                  />
                )}
                <ToolItem icon={<Trash2 />} label="Delete" onClick={() => activeLayerId && deleteLayer(activeLayerId)} />
                <ToolItem icon={<Copy />} label="Copy" onClick={() => activeLayerId && duplicateLayer(activeLayerId)} />
                <ToolItem icon={<LayersIcon />} label="To Front" onClick={() => activeLayerId && bringToFront(activeLayerId)} />
                <ToolItem icon={<LayersIcon className="rotate-180" />} label="To Back" onClick={() => activeLayerId && sendToBack(activeLayerId)} />
                <ToolItem icon={<Move />} label="Position" onClick={() => setActiveTextTool('position')} />
                <ToolItem icon={<Maximize />} label="Relative" onClick={() => setActiveTextTool('relative')} />
                <ToolItem icon={<Eye />} label="Opacity" onClick={() => setActiveTextTool('opacity')} />
                <ToolItem icon={<Droplets />} label="Stroke" onClick={() => setActiveTextTool('stroke')} />
                <ToolItem icon={<RotateCcw />} label="Rotate" onClick={() => setActiveTextTool('rotate')} />
                <ToolItem icon={<Sun />} label="Shadow" onClick={() => setActiveTextTool('shadow')} />
                <ToolItem 
                  icon={<GalleryIcon className="text-blue-400" />} 
                  label="Import" 
                  onClick={() => handleTriggerImageUpload('layer')} 
                />
              </>
            ) : (
              <>
                {/* Default Object Tab Tools */}
                <ToolItem icon={<Sticker />} label="Stickers" onClick={() => setActiveStickerShapeModal('stickers')} />
                <ToolItem 
                  icon={<GalleryIcon className="text-blue-400" />} 
                  label="Import" 
                  onClick={() => handleTriggerImageUpload('layer')} 
                />
                <ToolItem icon={<PenTool />} label="Draw" onClick={() => addTextLayer("✏️ Draw")} />
                <ToolItem icon={<Shapes />} label="Shapes" onClick={() => setActiveStickerShapeModal('shapes')} />
              </>
            )
          )}

          {/* TAB 4: BACKGROUND */}
          {activeTab === "background" && (
            isBgColorBarActive ? (
              <div className="w-full px-2 py-1">
                <PixelInlineColorBar
                  currentColor={canvasBackground}
                  customColors={customColors}
                  onAddCustomColor={(col) => setCustomColors(prev => [col, ...prev.filter(c => c !== col)])}
                  onColorChange={(color) => {
                    setCanvasBackground(color);
                    setCanvasBackgroundImage(null);
                  }}
                  onConfirm={() => {
                    setIsBgColorBarActive(false);
                    saveToHistory(layers);
                  }}
                  onCancel={() => {
                    setCanvasBackground(prevBgColor);
                    setIsBgColorBarActive(false);
                  }}
                />
              </div>
            ) : (
              <>
                <ToolItem 
                  icon={<FolderHeart className="text-amber-400" />} 
                  label="Album (১০৮+)" 
                  active={isAlbumModalOpen}
                  onClick={() => setIsAlbumModalOpen(true)} 
                />
                <ToolItem 
                  icon={<Palette />} 
                  label="Color" 
                  active={isBgColorBarActive}
                  onClick={() => {
                    setPrevBgColor(canvasBackground);
                    setIsBgColorBarActive(true);
                  }} 
                />
                <ToolItem 
                  icon={<Grid />} 
                  label="Transparent" 
                  onClick={() => {
                    setCanvasBackground("bg-transparent");
                    setCanvasBackgroundImage(null);
                    try {
                      localStorage.removeItem("pixellab_draft_bg_img");
                    } catch {}
                  }} 
                />
                <ToolItem icon={<Maximize />} label="Image Size" onClick={() => setIsCustomSizeModalOpen(true)} />
                <ToolItem 
                  icon={<Scissors />} 
                  label="Crop" 
                  onClick={() => {
                    if (canvasBackgroundImage) {
                      setPendingCropImage({
                        src: canvasBackgroundImage,
                        mode: 'background'
                      });
                    } else {
                      handleTriggerImageUpload('background');
                    }
                  }} 
                />
                <ToolItem icon={<GalleryIcon />} label="Image" onClick={() => handleTriggerImageUpload('background')} />
                <ToolItem icon={<Upload />} label="From Gallery" onClick={() => handleTriggerImageUpload('background')} />
              </>
            )
          )}
        </div>
      )}

        {/* Main Tab Navigation */}
        <div className="bg-black px-8 py-3 flex items-center justify-between border-t border-white/5 shrink-0">
          <NavButton icon={<CircleDashed />} active={activeTab === "project"} onClick={() => { setActiveTab("project"); setIsBgColorBarActive(false); setIsTextColorBarActive(false); }} />
          <NavButton icon={<Type />} active={activeTab === "text"} onClick={() => { setActiveTab("text"); setIsBgColorBarActive(false); setIsTextColorBarActive(false); }} />
          <NavButton icon={<Hexagon />} active={activeTab === "object"} onClick={() => { setActiveTab("object"); setIsBgColorBarActive(false); setIsTextColorBarActive(false); }} />
          <NavButton icon={<Copy />} active={activeTab === "background"} onClick={() => { setActiveTab("background"); setIsBgColorBarActive(false); setIsTextColorBarActive(false); }} />
        </div>
      </div>

      {/* Modals & Dialogs */}

      {/* Font Picker Modal */}
      <FontPickerModal
        isOpen={isFontPickerOpen}
        onClose={() => setIsFontPickerOpen(false)}
        selectedFont={activeLayer?.fontFamily}
        onSelectFont={(fontFamily) => {
          if (activeLayerId) {
            updateLayer(activeLayerId, { fontFamily });
          }
        }}
        sampleText={activeLayer?.content || "আমার সোনার বাংলা"}
      />

      {/* Text Properties Modal */}
      <TextPropertiesModal
        tool={activeTextTool}
        onClose={() => setActiveTextTool(null)}
        activeLayer={activeLayer || null}
        onUpdateLayer={(updates) => {
          if (activeLayerId) {
            updateLayer(activeLayerId, updates);
          }
        }}
        canvasWidth={selectedTemplate?.width || 1000}
        canvasHeight={selectedTemplate?.height || 1000}
      />

      {/* Sticker / Shape / Quotes / Date / Size Modal */}
      <StickerShapeModal
        type={activeStickerShapeModal}
        onClose={() => setActiveStickerShapeModal(null)}
        currentWidth={selectedTemplate?.width || 1000}
        currentHeight={selectedTemplate?.height || 1000}
        currentBgColor={canvasBackground}
        onAddSticker={(st) => {
          const width = selectedTemplate?.width || 1000;
          const height = selectedTemplate?.height || 1000;
          const newLayer: TemplateElement = {
            id: `sticker-${Date.now()}`,
            type: "sticker",
            content: `${st.icon} ${st.content}`,
            color: st.color,
            x: width / 2 - 120,
            y: height / 2 - 40,
            width: 240,
            height: 80,
            zIndex: layers.length + 1,
            rotation: 0,
            opacity: 1
          };
          const newLayers = [...layers, newLayer];
          setLayers(newLayers);
          saveToHistory(newLayers);
          setActiveLayerId(newLayer.id);
        }}
        onAddShape={(shapeType, color) => {
          const width = selectedTemplate?.width || 1000;
          const height = selectedTemplate?.height || 1000;
          const newLayer: TemplateElement = {
            id: `shape-${Date.now()}`,
            type: "shape",
            shapeType,
            fillColor: color,
            x: width / 2 - 100,
            y: height / 2 - 100,
            width: 200,
            height: 200,
            zIndex: layers.length + 1,
            rotation: 0,
            opacity: 1
          };
          const newLayers = [...layers, newLayer];
          setLayers(newLayers);
          saveToHistory(newLayers);
          setActiveLayerId(newLayer.id);
        }}
        onAddQuote={(quoteText) => {
          addTextLayer(quoteText);
        }}
        onAddDate={(dateText) => {
          addTextLayer(dateText);
        }}
        onApplyImageSize={(w, h, name) => {
          if (selectedTemplate) {
            setSelectedTemplate({
              ...selectedTemplate,
              width: w,
              height: h,
              name
            });
          }
        }}
        onApplyBgColor={(color) => {
          setCanvasBackground(color);
        }}
      />

      {/* Share & Export Modal */}
      <AnimatePresence>
        {isShareModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setIsShareModalOpen(false)}
               className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
             />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
               className="bg-[#0a0a2e] w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative border border-white/10"
             >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#161926]">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-bold text-base text-white">সরাসরি মোবাইলে সেভ করুন</h3>
                  </div>
                  <button 
                    onClick={() => setIsShareModalOpen(false)}
                    disabled={isSaving}
                    className="p-1.5 text-white/50 hover:text-white rounded-lg hover:bg-white/5 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-6 space-y-5">
                  {/* Image format selection */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-blue-400 mb-2">Image format</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => setExportFormat("png")}
                        className={`p-3 rounded-xl border flex flex-col items-start gap-1 transition-all ${
                          exportFormat === "png" 
                            ? "bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10" 
                            : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-bold text-sm">PNG</span>
                          {exportFormat === "png" && <Check className="w-4 h-4 text-blue-400" />}
                        </div>
                        <span className="text-[11px] text-white/50">স্বচ্ছ ব্যাকগ্রাউন্ড ও ক্রিস্টাল কোয়ালিটি</span>
                      </button>

                      <button 
                        onClick={() => setExportFormat("jpeg")}
                        className={`p-3 rounded-xl border flex flex-col items-start gap-1 transition-all ${
                          exportFormat === "jpeg" 
                            ? "bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10" 
                            : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-bold text-sm">JPG</span>
                          {exportFormat === "jpeg" && <Check className="w-4 h-4 text-blue-400" />}
                        </div>
                        <span className="text-[11px] text-white/50">সলিড ব্যাকগ্রাউন্ড ও কম ফাইল সাইজ</span>
                      </button>
                    </div>
                  </div>

                  {/* Quality / Resolution selector */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-blue-400">Dimensions (Quality)</label>
                      <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                        {exportQuality === 4 ? "🌟 সর্বোচ্চ Ultra HD" : exportQuality === 3 ? "Very High" : exportQuality === 2 ? "High (FHD)" : "Standard"}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { q: 4, label: "Ultra", desc: "4K UHD" },
                        { q: 3, label: "Very High", desc: "3K HD" },
                        { q: 2, label: "High", desc: "1080p" },
                        { q: 1, label: "Default", desc: "1x" },
                      ].map((item) => (
                        <button 
                          key={item.q}
                          onClick={() => setExportQuality(item.q)}
                          className={`py-2 px-1 rounded-xl border flex flex-col items-center transition-all ${
                            exportQuality === item.q 
                              ? "bg-emerald-600/20 border-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/10" 
                              : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                          }`}
                        >
                          <span className="text-xs">{item.label}</span>
                          <span className="text-[9px] text-white/50">{item.desc}</span>
                        </button>
                      ))}
                    </div>

                    {/* Calculated Output Specs */}
                    <div className="mt-3 p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between text-xs">
                      <span className="text-white/60">আউটপুট রেজোলিউশন:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {(selectedTemplate?.width || 1000) * exportQuality} × {(selectedTemplate?.height || 1000) * exportQuality} px
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 space-y-2.5">
                    <button 
                      onClick={() => handleSaveWork(exportQuality, exportFormat)}
                      disabled={isSaving}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 px-4 rounded-xl text-sm font-bold tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 active:scale-[0.98] disabled:opacity-50"
                    >
                      <Download className="w-5 h-5" />
                      সরাসরি মোবাইলে সেভ করুন (Ultra HD)
                    </button>
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                      <p className="text-[11px] text-emerald-300 flex items-center justify-center gap-1.5 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ছবি সরাসরি আপনার ফোনের মেমোরিতে (Downloads / Gallery) সেভ হবে
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        কোনো গুগল ড্রাইভ বা ক্লাউডে আপলোড হবে না, সরাসরি আপনার ডিভাইসে ডাউনলোড হবে।
                      </p>
                    </div>
                  </div>
                </div>
             </motion.div>
          </div>
        )}

        {/* Saved to Mobile Confirmation Dialog */}
        <AnimatePresence>
          {savedSuccessInfo && (
            <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSavedSuccessInfo(null)}
                className="absolute inset-0 bg-black/85 backdrop-blur-md" 
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                animate={{ scale: 1, opacity: 1, y: 0 }} 
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-[#101322] border border-emerald-500/40 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl relative z-10 text-center p-6"
              >
                <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">সরাসরি মোবাইলে সেভ হয়েছে!</h3>
                <p className="text-xs text-gray-300 mb-4 leading-relaxed">
                  ছবিটি আপনার মোবাইলের <span className="text-emerald-400 font-semibold">Gallery</span> বা <span className="text-emerald-400 font-semibold">Downloads</span> ফোল্ডারে সংরক্ষিত হয়েছে।
                </p>

                {/* Preview Thumbnail */}
                <div className="relative rounded-xl overflow-hidden border border-white/15 mb-4 max-h-48 bg-black/40 flex items-center justify-center p-1">
                  <img 
                    src={savedSuccessInfo.url} 
                    alt="Saved" 
                    className="max-h-44 object-contain rounded-lg"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-sm text-[10px] text-emerald-400 px-2 py-0.5 rounded-md font-mono border border-emerald-500/30">
                    {savedSuccessInfo.resolution}
                  </div>
                </div>

                <div className="space-y-2">
                  <a
                    href={savedSuccessInfo.url}
                    download={savedSuccessInfo.filename}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg shadow-emerald-600/20"
                  >
                    <Download className="w-4 h-4" />
                    পুনরায় ডাউনলোড করুন
                  </a>
                  <button
                    onClick={() => setSavedSuccessInfo(null)}
                    className="w-full bg-white/10 hover:bg-white/15 text-white/80 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all"
                  >
                    ঠিক আছে (সম্পন্ন)
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Rendering Ultra HD Progress Overlay */}
        {isSaving && (
          <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-6 bg-black/90 backdrop-blur-md">
            <div className="bg-[#101322] border border-emerald-500/30 rounded-3xl p-8 max-w-sm w-full text-center flex flex-col items-center shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center mb-4">
                <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">সর্বোচ্চ আল্ট্রা এইচডি তে সেভ হচ্ছে...</h3>
              <p className="text-xs text-emerald-300/80 mb-4 font-mono">
                {(selectedTemplate?.width || 1000) * exportQuality} × {(selectedTemplate?.height || 1000) * exportQuality} px
              </p>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden mb-3">
                <div className="bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500 h-full w-full animate-pulse" />
              </div>
              <span className="text-[11px] text-gray-400">সর্বোচ্চ ক্রিস্টাল ক্লিয়ার কোয়ালিটিতে রেন্ডার হচ্ছে, দয়া করে অপেক্ষা করুন</span>
            </div>
          </div>
        )}

        {/* Edit Text Dialog */}
        {editingText && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { saveToHistory(layersRef.current); setEditingText(null); }} className="absolute inset-0 bg-black/40" />
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="bg-[#0a0a0a] w-full max-w-lg rounded-[32px] p-6 relative border border-white/10 shadow-2xl z-10">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-blue-500">Edit Text (টেক্সট লিখুন)</h3>
                  <button onClick={() => { saveToHistory(layersRef.current); setEditingText(null); }} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
               </div>
               <textarea 
                 ref={textareaRef}
                 value={editingText.text}
                 onChange={(e) => {
                   setEditingText({ ...editingText, text: e.target.value });
                   updateLayer(editingText.id, { content: e.target.value }, true);
                 }}
                 onKeyDown={(e) => {
                   if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                     e.preventDefault();
                     saveToHistory(layersRef.current);
                     setEditingText(null);
                   }
                 }}
                 className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                 placeholder="এখানে আপনার টেক্সট লিখুন..."
                 autoFocus
               />
               <button 
                 onClick={() => {
                   saveToHistory(layersRef.current);
                   setEditingText(null);
                 }} 
                 className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest transition-colors shadow-lg shadow-blue-600/30"
               >
                 Done (সম্পন্ন)
               </button>
            </motion.div>
          </div>
        )}
        {/* Image Crop Modal */}
        {pendingCropImage && (
          <ImageCropModal
            imageSrc={pendingCropImage.src}
            mode={pendingCropImage.mode}
            onCropComplete={handleCropComplete}
            onClose={() => setPendingCropImage(null)}
          />
        )}

        {/* Large Interactive Preview Dialog for Bottom Card Selection */}
        {bottomCardPreview && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-[#0e0e16] border border-white/15 rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#14141f]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                    ✨
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white line-clamp-1">{bottomCardPreview.name}</h3>
                    <p className="text-[10px] font-mono text-gray-400">
                      {bottomCardPreview.width} × {bottomCardPreview.height} px • <span className="capitalize">{bottomCardPreview.category}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setBottomCardPreview(null)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Big High-Res Visual Preview */}
              <div className="p-4 flex-1 overflow-y-auto flex flex-col items-center justify-center bg-[#08080d]">
                <div className="w-full aspect-square max-h-[340px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative bg-[#12121a] flex items-center justify-center">
                  {bottomCardPreview.thumbnail ? (
                    <img 
                      src={bottomCardPreview.thumbnail} 
                      alt={bottomCardPreview.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full p-6 flex flex-col items-center justify-center text-center bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900">
                      <Sparkles className="w-12 h-12 text-blue-400 mb-3" />
                      <h4 className="text-sm font-black text-white">{bottomCardPreview.name}</h4>
                    </div>
                  )}

                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-sm text-[10px] font-mono font-bold text-white border border-white/10 shadow-lg">
                    {bottomCardPreview.width} × {bottomCardPreview.height}
                  </div>
                </div>

                {/* Editable Features Included */}
                <div className="w-full mt-4 bg-white/5 border border-white/5 rounded-2xl p-3 flex items-center justify-around text-center">
                  <div>
                    <span className="text-[11px] font-black text-blue-400 flex items-center justify-center gap-1">
                      📷 {bottomCardPreview.elements?.filter(e => e.type === "placeholder" || e.type === "image").length || 0}
                    </span>
                    <span className="text-[9px] font-bold text-gray-400">Photo Slots</span>
                  </div>
                  <div className="w-px h-6 bg-white/10" />
                  <div>
                    <span className="text-[11px] font-black text-purple-400 flex items-center justify-center gap-1">
                      ✍️ {bottomCardPreview.elements?.filter(e => e.type === "text").length || 0}
                    </span>
                    <span className="text-[9px] font-bold text-gray-400">Text Layers</span>
                  </div>
                  <div className="w-px h-6 bg-white/10" />
                  <div>
                    <span className="text-[11px] font-black text-emerald-400 flex items-center justify-center gap-1">
                      🎨 100%
                    </span>
                    <span className="text-[9px] font-bold text-gray-400">Editable</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 border-t border-white/10 bg-[#14141f] flex items-center gap-3">
                <button
                  onClick={() => setBottomCardPreview(null)}
                  className="flex-1 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-xs transition-all active:scale-95"
                >
                  বাতিল
                </button>
                <button
                  onClick={() => {
                    const tpl = bottomCardPreview;
                    setBottomCardPreview(null);
                    handleSelectTemplate(tpl);
                  }}
                  className="flex-[2] py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-blue-500/25 active:scale-95 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Use Template (ব্যবহার করুন)</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Canvas Size Modal */}
      <CustomSizeModal
        isOpen={isCustomSizeModalOpen}
        onClose={() => setIsCustomSizeModalOpen(false)}
        onApply={(w, h, name, bgClass) => {
          handleApplyCanvasSize(w, h, name, bgClass);
          setIsCustomSizeModalOpen(false);
        }}
        initialWidth={selectedTemplate?.width || 1080}
        initialHeight={selectedTemplate?.height || 1080}
        initialName={selectedTemplate?.name || "কাস্টম সাইজ"}
        initialBgClass={canvasBackground}
      />

      <TemplateLibraryModal 
        isOpen={isLibraryOpen} 
        onClose={() => setIsLibraryOpen(false)} 
        onSelect={handleSelectTemplate} 
        initialTab={libraryModalInitialTab}
      />

      <PixelBackgroundAlbumModal
        isOpen={isAlbumModalOpen}
        onClose={() => setIsAlbumModalOpen(false)}
        onSelectBackground={handleSelectBackgroundAlbumItem}
        currentBgSvg={canvasBackgroundImage}
      />
    </div>
  );
};
