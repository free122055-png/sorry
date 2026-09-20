export interface FontItem {
  id: string;
  name: string;
  family: string;
  category: 'bangla' | 'english' | 'signature' | 'arabic';
  previewText?: string;
  isCustom?: boolean;
}

export const FONTS_LIST: FontItem[] = [];

export const PRESET_QUOTES = [
  { id: 'q1', category: 'অনুপ্রেরণা', text: 'কখনও হাল ছাড়বেন না, প্রতিটি দিনই নতুন এক সুযোগ।' },
  { id: 'q2', category: 'অনুপ্রেরণা', text: 'কঠোর পরিশ্রম কখনো বৃথা যায় না।' },
  { id: 'q3', category: 'সাফল্য', text: 'স্বপ্নের পেছনে ছুটুন, সাফল্য নিজেই আপনার দরজায় কড়া নাড়বে।' },
  { id: 'q4', category: 'ইসলামিক', text: 'ধৈর্য ধরুন, নিশ্চয়ই আল্লাহ ধৈর্যশীলদের সাথে আছেন।' },
  { id: 'q5', category: 'জীবন', text: 'আজকের ছোট ছোট চেষ্টা আগামীকালের বড় অর্জন।' },
  { id: 'q6', category: 'ব্যবসা', text: 'মানের সাথে কোনো আপস নয়, সততাই আমাদের মূল শক্তি।' },
  { id: 'q7', category: 'English', text: 'Dream big, work hard, stay focused and make it happen.' },
  { id: 'q8', category: 'English', text: 'Creativity is intelligence having fun.' },
  { id: 'q9', category: 'English', text: 'Quality is not an act, it is a habit.' },
  { id: 'q10', category: 'English', text: 'Believe you can and you are halfway there.' }
];

export const STICKER_LIBRARY = [
  { id: 'st1', label: '🔥 HOT SALE', icon: '🔥', content: 'HOT SALE', color: '#ef4444' },
  { id: 'st2', label: '⚡ FLASH SALE', icon: '⚡', content: 'FLASH SALE', color: '#f59e0b' },
  { id: 'st3', label: '🎉 SPECIAL OFFER', icon: '🎉', content: 'SPECIAL OFFER', color: '#8b5cf6' },
  { id: 'st4', label: '⭐ 50% OFF', icon: '⭐', content: '50% OFF', color: '#ec4899' },
  { id: 'st5', label: '✅ VERIFIED', icon: '✅', content: '100% ORIGINAL', color: '#10b981' },
  { id: 'st6', label: '🚀 NEW ARRIVAL', icon: '🚀', content: 'NEW ARRIVAL', color: '#3b82f6' },
  { id: 'st7', label: '🎁 GIFT OFFER', icon: '🎁', content: 'MEGA DISCOUNT', color: '#6366f1' },
  { id: 'st8', label: '🌟 BEST SELLER', icon: '🌟', content: 'BEST SELLER', color: '#eab308' },
  { id: 'st9', label: '🇧🇩 বাংলা স্টিকার', icon: '🇧🇩', content: 'ধামাকা অফার', color: '#059669' },
  { id: 'st10', label: '🛒 SHOP NOW', icon: '🛒', content: 'অর্ডার করতে ইনবক্স করুন', color: '#dc2626' }
];

export const SHAPE_OPTIONS = [
  { id: 'rectangle', name: 'আয়তক্ষেত্র (Rectangle)', type: 'rectangle' as const },
  { id: 'rounded-rect', name: 'রাউন্ডেড (Rounded Rect)', type: 'rounded-rect' as const },
  { id: 'circle', name: 'বৃত্ত (Circle)', type: 'circle' as const },
  { id: 'triangle', name: 'ত্রিভুজ (Triangle)', type: 'triangle' as const },
  { id: 'star', name: 'স্টার (Star)', type: 'star' as const },
  { id: 'arrow', name: 'তীর (Arrow)', type: 'arrow' as const }
];

export const COLOR_PALETTE = [
  '#000000', '#ffffff', '#ef4444', '#f97316', '#f59e0b', '#eab308', 
  '#84cc16', '#22c55e', '#10b981', '#06b6d4', '#0ea5e9', '#3b82f6', 
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e',
  '#1e293b', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1'
];
