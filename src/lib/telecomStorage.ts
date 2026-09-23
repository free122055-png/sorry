import { TelecomOffer, TelecomPaymentMethod, TelecomOrder } from '../types/telecom';

const OFFERS_KEY = 'ai_mayadin_telecom_offers_v1';
const METHODS_KEY = 'ai_mayadin_telecom_methods_v1';
const ORDERS_KEY = 'ai_mayadin_telecom_orders_v1';

const INITIAL_OFFERS: TelecomOffer[] = [
  {
    id: 'off_1',
    operator: 'Grameenphone',
    category: 'internet',
    name: '1 GB ইন্টারনেট প্যাক',
    amount: '1 GB',
    validity: '৩ দিন',
    price: 29,
    logo: 'https://www.grameenphone.com/sites/default/files/gp-logo-social.png',
    description: '১ জিবি ইন্টারনেট, মেয়াদ ৩ দিন। সকল প্রিপেইড গ্রাহকদের জন্য প্রযোজ্য। দ্রুতগতির ফোরজি ইন্টারনেট উপভোগ করুন।',
    loanRule: 'allowed',
    loanNote: 'অফারে কোনো লোন বা আউটস্ট্যান্ডিং থাকলেও এই অফারটি নেওয়া যাবে।',
    prepaidPostpaid: 'prepaid',
    targetSim: 'প্রিপেইড সিম',
    activationNote: 'বিকাশ/নগদ পেমেন্ট করার পর ট্রানজাকশন আইডি দিয়ে অর্ডার কনফার্ম করুন। ১০-১৫ মিনিটের মধ্যে অফারটি আপনার নম্বরে চলে যাবে।',
    extraInfo: 'ব্যালেন্স জানতে ডায়াল করুন *১২১*১#',
    isActive: true,
    createdAt: Date.now() - 86400000 * 5
  },
  {
    id: 'off_2',
    operator: 'Robi',
    category: 'internet',
    name: '2 GB ইন্টারনেট প্যাক',
    amount: '2 GB',
    validity: '৭ দিন',
    price: 49,
    logo: 'https://images.seeklogo.com/logo-png/38/2/robi-axiata-logo-png_seeklogo-389334.png',
    description: '২ জিবি ইন্টারনেট, মেয়াদ ৭ দিন। রবি প্রিপেইড গ্রাহকদের জন্য সেরা অফার।',
    loanRule: 'allowed',
    loanNote: 'লোন থাকলেও এই অফার নেওয়া যাবে।',
    prepaidPostpaid: 'prepaid',
    targetSim: 'সব সার্কেল',
    activationNote: 'পেমেন্ট সফল হওয়ার পর সঠিক ট্রানজাকশন আইডি প্রদান করুন।',
    extraInfo: 'ইন্টারনেট ব্যালেন্স জানতে *৩# ডায়াল করুন।',
    isActive: true,
    createdAt: Date.now() - 86400000 * 4
  },
  {
    id: 'off_3',
    operator: 'Banglalink',
    category: 'internet',
    name: '1.5 GB ইন্টারনেট প্যাক',
    amount: '1.5 GB',
    validity: '৭ দিন',
    price: 45,
    logo: 'https://images.seeklogo.com/logo-png/38/2/banglalink-logo-png_seeklogo-389332.png',
    description: '১.৫ জিবি ইন্টারনেট, মেয়াদ ৭ দিন। বাংলালিংক গ্রাহকদের জন্য দারুন ইন্টারনেট প্যাক।',
    loanRule: 'not_allowed',
    loanNote: 'সিম এ কোনো ধরনের ঋণ বা লোন থাকলে এই অফারটি প্রযোজ্য হবে না।',
    prepaidPostpaid: 'prepaid',
    targetSim: 'প্রিপেইড সিম',
    activationNote: 'অর্ডার করার সময় সঠিক বাংলালিংক নম্বর দিন।',
    extraInfo: 'ব্যালেন্স চেক করতে *১২১২*১# ডায়াল করুন।',
    isActive: true,
    createdAt: Date.now() - 86400000 * 3
  },
  {
    id: 'off_4',
    operator: 'Teletalk',
    category: 'internet',
    name: '3 GB ইন্টারনেট প্যাক',
    amount: '3 GB',
    validity: '৭ দিন',
    price: 69,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Teletalk_Logo.svg',
    description: '৩ জিবি ইন্টারনেট, মেয়াদ ৭ দিন। সাশ্রয়ী মূল্যে টেলিটক ইন্টারনেট।',
    loanRule: 'allowed',
    loanNote: 'লোন থাকলেও সমস্যা নেই।',
    prepaidPostpaid: 'both',
    targetSim: 'সকল সিম',
    activationNote: 'সফল পেমেন্টের পর অ্যাডমিন যাচাই করে অফার সক্রিয় করবেন।',
    extraInfo: 'এমবি চেক করতে *১৫২# ডায়াল করুন।',
    isActive: true,
    createdAt: Date.now() - 86400000 * 2
  },
  {
    id: 'off_5',
    operator: 'Grameenphone',
    category: 'internet',
    name: '5 GB ইন্টারনেট প্যাক',
    amount: '5 GB',
    validity: '১৫ দিন',
    price: 115,
    logo: 'https://www.grameenphone.com/sites/default/files/gp-logo-social.png',
    description: '৫ জিবি ইন্টারনেট, মেয়াদ ১৫ দিন। জিপির জনপ্রিয় সাশ্রয়ী ইন্টারনেট প্যাক।',
    loanRule: 'allowed',
    loanNote: 'লোন থাকলে অফার নিতে কোনো বাধা নেই।',
    prepaidPostpaid: 'prepaid',
    targetSim: 'প্রিপেইড সিম',
    activationNote: 'পেমেন্ট সম্পন্ন করার পর TrxID প্রদান করুন।',
    extraInfo: 'মেয়াদ শেষে অব্যবহৃত এমবি যোগ হবে না।',
    isActive: true,
    createdAt: Date.now() - 86400000 * 1
  },
  {
    id: 'off_6',
    operator: 'Robi',
    category: 'internet',
    name: '10 GB ইন্টারনেট প্যাক',
    amount: '10 GB',
    validity: '৩০ দিন',
    price: 199,
    logo: 'https://images.seeklogo.com/logo-png/38/2/robi-axiata-logo-png_seeklogo-389334.png',
    description: '১০ জিবি মেগাবাইট, মেয়াদ ৩০ দিন। এক মাসের পুরো শান্তিতে ইন্টারনেট ব্যবহার করুন।',
    loanRule: 'allowed',
    loanNote: 'লোন থাকলেও প্রযোজ্য।',
    prepaidPostpaid: 'prepaid',
    targetSim: 'সব সার্কেল',
    activationNote: 'সঠিক নম্বর ও পেমেন্ট নিশ্চিত করুন।',
    extraInfo: 'সার্বক্ষণিক ফোরজি স্পিড।',
    isActive: true,
    createdAt: Date.now()
  },
  {
    id: 'off_7',
    operator: 'Banglalink',
    category: 'internet',
    name: '12 GB ইন্টারনেট প্যাক',
    amount: '12 GB',
    validity: '৩০ দিন',
    price: 249,
    logo: 'https://images.seeklogo.com/logo-png/38/2/banglalink-logo-png_seeklogo-389332.png',
    description: '১২ জিবি ইন্টারনেট প্যাক, ৩০ দিন মেয়াদ। বাংলালিংক গ্রাহকদের দীর্ঘমেয়াদী প্যাক।',
    loanRule: 'not_allowed',
    loanNote: 'লোন থাকা অবস্থায় এই অফার প্রযোজ্য নয়।',
    prepaidPostpaid: 'prepaid',
    targetSim: 'প্রিপেইড',
    activationNote: 'অ্যাডমিন কর্তৃক অনুমোদিত হওয়ার পর অফার যুক্ত হবে।',
    extraInfo: 'যেকোনো প্রয়োজনে হেল্পলাইনে যোগাযোগ করুন।',
    isActive: true,
    createdAt: Date.now()
  },
  {
    id: 'off_min_1',
    operator: 'Grameenphone',
    category: 'minute',
    name: '100 মিনিট টকটাইম',
    amount: '100 মিনিট',
    validity: '৭ দিন',
    price: 72,
    logo: 'https://www.grameenphone.com/sites/default/files/gp-logo-social.png',
    description: 'যে কোনো লোকাল নম্বরে ১০০ মিনিট টকটাইম, মেয়াদ ৭ দিন।',
    loanRule: 'allowed',
    loanNote: 'লোন থাকলেও চলবে।',
    prepaidPostpaid: 'prepaid',
    targetSim: 'সব প্রিপেইড',
    activationNote: 'সঠিক নম্বর দিন।',
    extraInfo: 'মিনিট চেক করতে *১২১*১*২# ডায়াল করুন।',
    isActive: true,
    createdAt: Date.now()
  },
  {
    id: 'off_bun_1',
    operator: 'Robi',
    category: 'bundle',
    name: '1 GB + 50 মিনিট বান্ডেল',
    amount: '1 GB + 50 মিনিট',
    validity: '৭ দিন',
    price: 85,
    logo: 'https://images.seeklogo.com/logo-png/38/2/robi-axiata-logo-png_seeklogo-389334.png',
    description: '১ জিবি ইন্টারনেট ও ৫০ মিনিট টকটাইম বান্ডেল প্যাক, মেয়াদ ৭ দিন।',
    loanRule: 'allowed',
    loanNote: 'লোন থাকলেও নেওয়া যাবে।',
    prepaidPostpaid: 'prepaid',
    targetSim: 'সব সার্কেল',
    activationNote: 'পেমেন্ট ভেরিফাই করে দ্রুত একটিভ করা হবে।',
    extraInfo: 'বান্ডেল ব্যালেন্স চেক করতে *২২২*৮# ডায়াল করুন।',
    isActive: true,
    createdAt: Date.now()
  },
  {
    id: 'off_sms_1',
    operator: 'Banglalink',
    category: 'sms',
    name: '200 SMS প্যাক',
    amount: '200 SMS',
    validity: '১০ দিন',
    price: 25,
    logo: 'https://images.seeklogo.com/logo-png/38/2/banglalink-logo-png_seeklogo-389332.png',
    description: 'যেকোনো নম্বরে ২০০ এস এম এস, মেয়াদ ১০ দিন।',
    loanRule: 'allowed',
    loanNote: 'লোন থাকলেও সমস্যা নেই।',
    prepaidPostpaid: 'prepaid',
    targetSim: 'প্রিপেইড',
    activationNote: 'এসএমএস প্যাক অর্ডারের পর প্রদান করা হবে।',
    extraInfo: 'এসএমএস ব্যালেন্স জানতে *১২৪*৪# ডায়াল করুন।',
    isActive: true,
    createdAt: Date.now()
  }
];

const INITIAL_METHODS: TelecomPaymentMethod[] = [
  {
    id: 'm_1',
    methodName: 'বিকাশ',
    accountNumber: '01712345678 (Personal / Merchant)',
    instruction: 'বিকাশ অ্যাপ থেকে "Send Money" বা "Payment" সম্পন্ন করে TrxID টি নিচের বক্সে দিন। ক্যাশ আউট চার্জ প্রযোজ্য হতে পারে।',
    isActive: true
  },
  {
    id: 'm_2',
    methodName: 'নগদ',
    accountNumber: '01812345678 (Personal)',
    instruction: 'নগদ অ্যাপের মাধ্যমে সেন টাকা করে ট্রানজাকশন আইডি (TrxID) প্রদান করুন।',
    isActive: true
  },
  {
    id: 'm_3',
    methodName: 'রকেট',
    accountNumber: '01912345678-9 (Merchant)',
    instruction: 'রকেট একাউন্টে টাকা পাঠিয়ে সঠিক TrxID লিখুন।',
    isActive: true
  }
];

export const getTelecomOffers = (): TelecomOffer[] => {
  try {
    const stored = localStorage.getItem(OFFERS_KEY);
    if (!stored) {
      localStorage.setItem(OFFERS_KEY, JSON.stringify(INITIAL_OFFERS));
      return INITIAL_OFFERS;
    }
    return JSON.parse(stored);
  } catch {
    return INITIAL_OFFERS;
  }
};

export const saveTelecomOffers = (offers: TelecomOffer[]) => {
  localStorage.setItem(OFFERS_KEY, JSON.stringify(offers));
};

export const getTelecomPaymentMethods = (): TelecomPaymentMethod[] => {
  try {
    const stored = localStorage.getItem(METHODS_KEY);
    if (!stored) {
      localStorage.setItem(METHODS_KEY, JSON.stringify(INITIAL_METHODS));
      return INITIAL_METHODS;
    }
    return JSON.parse(stored);
  } catch {
    return INITIAL_METHODS;
  }
};

export const saveTelecomPaymentMethods = (methods: TelecomPaymentMethod[]) => {
  localStorage.setItem(METHODS_KEY, JSON.stringify(methods));
};

export const getTelecomOrders = (): TelecomOrder[] => {
  try {
    const stored = localStorage.getItem(ORDERS_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

export const saveTelecomOrders = (orders: TelecomOrder[]) => {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
};
