export interface Surah {
  number: number;
  name: string;
  englishName: string;
  arabicName: string;
  versesCount: number;
}

export interface Reciter {
  id: string;
  name: string;
  arabicName: string;
  country: string;
  imageUrl: string;
  description: string;
  serverUrl: string;
  isActive: boolean;
  tags?: string[];
}

export const RECITERS: Reciter[] = [
  {
    id: "mishari_alafasy",
    name: "মিশারি রাশিদ আল-আফাসী (Mishari Rashid Alafasy)",
    arabicName: "مشاري بن راشد العفاسي",
    country: "Saudi Arabia",
    imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80",
    description: "বিশ্বখ্যাত কুয়েতি ক্বারী ও ইমাম।",
    serverUrl: "https://server8.mp3quran.net/afs/",
    isActive: true,
    tags: ["Saudi Arabia", "জনপ্রিয় ক্বারী", "তাজউইদের জন্য সেরা"]
  },
  {
    id: "abdul_basit",
    name: "আব্দুল বাসিত আব্দুস সামাদ (Abdul Basit Abdul Samad)",
    arabicName: "عبد الباسط عبد الصمد",
    country: "Egypt",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Abd_El-Baset_Abd_El-Samad_%28cropped%29.jpg",
    description: "মিশরের সোনালী যুগের বিশ্বনন্দিত ক্বারী।",
    serverUrl: "https://server7.mp3quran.net/basit/",
    isActive: true,
    tags: ["Egypt", "জনপ্রিয় ক্বারী"]
  },
  {
    id: "saad_al_ghamdi",
    name: "সা'দ আল-গামদী (Saad Al-Ghamdi)",
    arabicName: "سعد الغامدي",
    country: "Saudi Arabia",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    description: "সৌদি আরবের প্রখ্যাত সুমধুর কণ্ঠের ক্বারী।",
    serverUrl: "https://server7.mp3quran.net/s_gmd/",
    isActive: true,
    tags: ["Saudi Arabia", "জনপ্রিয় ক্বারী"]
  },
  {
    id: "maher_al_muaiqly",
    name: "মাহের আল-মুআইক্বিলী (Maher Al-Muaiqly)",
    arabicName: "ماهر المعيقلي",
    country: "Saudi Arabia",
    imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80",
    description: "মসজিদুল হারামের শ্রদ্ধেয় প্রধান ইমাম ও ক্বারী।",
    serverUrl: "https://server12.mp3quran.net/maher/",
    isActive: true,
    tags: ["Saudi Arabia", "জনপ্রিয় ক্বারী"]
  },
  {
    id: "yasser_al_dosari",
    name: "ইয়াসির আদ-দুসারী (Yasser Al-Dosari)",
    arabicName: "ياسر الدوسري",
    country: "Saudi Arabia",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
    description: "মসজিদুল হারামের বিখ্যাত আবেগপূর্ণ ক্বারী ও খতীব।",
    serverUrl: "https://server11.mp3quran.net/yasser/",
    isActive: true,
    tags: ["Saudi Arabia", "জনপ্রিয় ক্বারী"]
  },
  {
    id: "ali_jaber",
    name: "আলী জাবের (Ali Jaber)",
    arabicName: "علي جابر",
    country: "Kuwait",
    imageUrl: "https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=400&q=80",
    description: "মসজিদুল হারামের প্রাক্তন ঐতিহাসিক ইমাম।",
    serverUrl: "https://server11.mp3quran.net/a_jbr/",
    isActive: true,
    tags: ["Kuwait", "জনপ্রিয় ক্বারী"]
  },
  {
    id: "yerkinbek_shoqai",
    name: "ইয়েরকিনবেক শোকাই (Yerkinbek Shoqai)",
    arabicName: "يركينبيك شوقاي",
    country: "কাজাখস্তান",
    imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80",
    description: "কাজাখস্তানের প্রখ্যাত ক্বারী ও ধর্মীয় ব্যক্তিত্ব।",
    serverUrl: "https://server8.mp3quran.net/afs/",
    isActive: true,
    tags: ["কাজাখস্তান", "তাজউইদের জন্য সেরা"]
  },
  {
    id: "ihlas_salih",
    name: "ইখলাস সালিহ (Ihlas Salih)",
    arabicName: "إخلاص صالح",
    country: "কাজাখস্তান",
    imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&q=80",
    description: "কাজাখস্তানের সুমধুর কণ্ঠের ক্বারী।",
    serverUrl: "https://server12.mp3quran.net/maher/",
    isActive: true,
    tags: ["কাজাখস্তান"]
  },
  {
    id: "yergen_kumarov",
    name: "ইয়েরগেন কুমারোভ (Yergen Kumarov)",
    arabicName: "يرغين كوماروف",
    country: "কাজাখস্তান",
    imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80",
    description: "কাজাখস্তানের তরুণ ক্বারী।",
    serverUrl: "https://server7.mp3quran.net/s_gmd/",
    isActive: true,
    tags: ["কাজাখস্তান"]
  },
  {
    id: "shatri",
    name: "শাইখ আবু বকর আল-শাতরী (Abu Bakr Al-Shatri)",
    arabicName: "أبو بكر الشاطري",
    country: "সৌদি আরব",
    imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80",
    description: "জেদ্দার প্রখ্যাত ক্বারী।",
    serverUrl: "https://server11.mp3quran.net/shatri/",
    isActive: true,
    tags: ["সৌদি আরব"]
  },
  {
    id: "ajm",
    name: "শাইখ আহমদ আল-আজমী (Ahmad Al-Ajmy)",
    arabicName: "أحمد بن علي العجمي",
    country: "সৌদি আরব",
    imageUrl: "https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=400&q=80",
    description: "বিশ্বখ্যাত সৌদি ক্বারী।",
    serverUrl: "https://server10.mp3quran.net/ajm/",
    isActive: true,
    tags: ["সৌদি আরব"]
  },
  {
    id: "abkr",
    name: "শাইখ ইদ্রিস আবকার (Idris Abkar)",
    arabicName: "إدريس أبكر",
    country: "সৌদি আরব",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
    description: "জেদ্দার শাইখ ইউসুফ মসজিদের ইমাম।",
    serverUrl: "https://server6.mp3quran.net/abkr/",
    isActive: true,
    tags: ["সৌদি আরব"]
  },
  {
    id: "shuraim",
    name: "সাউদ আল-শুরাইম (Saud Al-Shuraim)",
    arabicName: "سعود الشريم",
    country: "সৌদি আরব",
    imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80",
    description: "মসজিদুল হারামের সাবেক ইমাম।",
    serverUrl: "https://server11.mp3quran.net/shur/",
    isActive: true,
    tags: ["সৌদি আরব"]
  },
  {
    id: "adel_ryyan",
    name: "আদেল রাইয়ান (Adel Ryyan)",
    arabicName: "عادل ريان",
    country: "সৌদি আরব",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    description: "সৌদি আরবের জনপ্রিয় ক্বারী।",
    serverUrl: "https://server10.mp3quran.net/ryyan/",
    isActive: true,
    tags: ["সৌদি আরব"]
  },
  {
    id: "sudais",
    name: "আব্দুর রহমান আল-সুদাইস (Abdulrahman Al-Sudais)",
    arabicName: "عبد الرحمن السديس",
    country: "সৌদি আরব",
    imageUrl: "https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=400&q=80",
    description: "মসজিদুল হারামের ইমাম।",
    serverUrl: "https://server11.mp3quran.net/sds/",
    isActive: true,
    tags: ["সৌদি আরব"]
  },
  {
    id: "husr",
    name: "মাহমুদ খলিল আল-হুসারী (Mahmoud Khalil Al-Husary)",
    arabicName: "محمود خليل الحصري",
    country: "মিশর",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/73/Hussary.jpg",
    description: "তাজউইদে বিশ্বের অন্যতম সেরা।",
    serverUrl: "https://server13.mp3quran.net/husr/",
    isActive: true,
    tags: ["মিশর"]
  },
  {
    id: "basit",
    name: "আব্দুল বাসিত আব্দুস সামাদ (Abdul Basit)",
    arabicName: "عبد الباسط عبد الصمد",
    country: "মিশর",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Abd_El-Baset_Abd_El-Samad_%28cropped%29.jpg",
    description: "বিশ্বের অন্যতম সেরা ক্বারী।",
    serverUrl: "https://server7.mp3quran.net/basit/",
    isActive: true,
    tags: ["মিশর"]
  },
  {
    id: "minsh",
    name: "মুহাম্মদ সিদ্দিক আল-মিনশাবী (Muhammad Siddiq Al-Minshawi)",
    arabicName: "محمد صديق المنشاوي",
    country: "মিশর",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/16/Muhammad_Siddiq_Al-Minshawi.jpg",
    description: "মিশরের মহান ক্বারী।",
    serverUrl: "https://server11.mp3quran.net/minsh/",
    isActive: true,
    tags: ["মিশর"]
  },
  {
    id: "banna",
    name: "মাহমুদ আলী আল-বান্না (Mahmoud Ali Al-Banna)",
    arabicName: "محمود علي البنا",
    country: "মিশর",
    imageUrl: "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=400&q=80",
    description: "মিশরের সোনালী যুগের ক্বারী।",
    serverUrl: "https://server8.mp3quran.net/banna/",
    isActive: true,
    tags: ["মিশর", "তাজউইদের জন্য সেরা"]
  },
  {
    id: "ahmed_kaseb",
    name: "আহমেদ কাসেব (Ahmed Kaseb)",
    arabicName: "أحمد كاسب",
    country: "মিশর",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    description: "মিশরের ক্বারী।",
    serverUrl: "https://server11.mp3quran.net/kaseb/",
    isActive: true,
    tags: ["মিশর"]
  },
  {
    id: "omar_hisham",
    name: "ওমর হিশাম আল-আরাবী (Omar Hisham Al-Arabi)",
    arabicName: "عمر هشام العربي",
    country: "মিশর",
    imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80",
    description: "মিশরের তরুণ ক্বারী।",
    serverUrl: "https://server11.mp3quran.net/omar/",
    isActive: true,
    tags: ["মিশর"]
  },
  {
    id: "alijon_fayzulloh",
    name: "আলিজোন ফায়জুল্লাহ (Alijon Fayzulloh)",
    arabicName: "عليجون فيض الله",
    country: "উজবেকিস্তান",
    imageUrl: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=400&q=80",
    description: "উজবেকিস্তানের জনপ্রিয় ক্বারী।",
    serverUrl: "https://server11.mp3quran.net/sds/",
    isActive: true,
    tags: ["উজবেকিস্তান"]
  },
  {
    id: "muhammadloiq_aminov",
    name: "মুহাম্মাদলোইক আমিনোভ (Muhammadloiq Aminov)",
    arabicName: "محمد لويق أمينوف",
    country: "উজবেকিস্তান",
    imageUrl: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&q=80",
    description: "উজবেকিস্তানের সুপরিচিত ক্বারী।",
    serverUrl: "https://server11.mp3quran.net/yasser/",
    isActive: true,
    tags: ["উজবেকিস্তান"]
  },
  {
    id: "doniyor_fayz",
    name: "দোনিয়োর ফায়জ (Doniyor Fayz)",
    arabicName: "دانيار فايز",
    country: "উজবেকিস্তান",
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
    description: "উজবেকিস্তানের প্রতিশ্রুতিশীল ক্বারী।",
    serverUrl: "https://server8.mp3quran.net/frs_a/",
    isActive: true,
    tags: ["উজবেকিস্তান"]
  },
  {
    id: "abdulbasit_qobilov",
    name: "আব্দুলবাসিত কোবাইলোভ (Abdulbasit Qobilov)",
    arabicName: "عبد الباسط قابيلوف",
    country: "উজবেকিস্তান",
    imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80",
    description: "উজবেকিস্তানের বিখ্যাত ক্বারী।",
    serverUrl: "https://server7.mp3quran.net/basit/",
    isActive: true,
    tags: ["উজবেকিস্তান"]
  },
  {
    id: "mahdi_ash_shishani",
    name: "মেহেদী আশ-শিশানী (Mahdi ash-Shishani)",
    arabicName: "مهدي الشيشاني",
    country: "রাশিয়া",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    description: "চেচনিয়ার বিখ্যাত ক্বারী।",
    serverUrl: "https://server6.mp3quran.net/abkr/",
    isActive: true,
    tags: ["রাশিয়া"]
  },
  {
    id: "arbi_ash_shishani",
    name: "আরবি আশ-শিশানী (Arbi ash-Shishani)",
    arabicName: "عربي الشيشاني",
    country: "রাশিয়া",
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80",
    description: "চেচনিয়ার অন্যতম ক্বারী।",
    serverUrl: "https://server6.mp3quran.net/wdee3/",
    isActive: true,
    tags: ["রাশিয়া"]
  },
  {
    id: "ahmad_magomedkamilov",
    name: "আহমেদ মাগোমেদকামিলোভ (Ahmad Magomedkamilov)",
    arabicName: "أحمد ماغوميدكاميولف",
    country: "রাশিয়া",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
    description: "দাগেস্তানের বিশিষ্ট তরুণ ক্বারী।",
    serverUrl: "https://server11.mp3quran.net/shatri/",
    isActive: true,
    tags: ["রাশিয়া"]
  },
  {
    id: "suwaid",
    name: "আইমান রুশদি সুওয়াইদ (Ayman Rushdi Suwaid)",
    arabicName: "أيمـن رشدي سويـد",
    country: "সিরিয়া",
    imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80",
    description: "ইলমে তাজউইদের অন্যতম শ্রেষ্ঠ শিক্ষক।",
    serverUrl: "https://server11.mp3quran.net/minsh/",
    isActive: true,
    tags: ["অন্যান্য কারী", "তাজউইদের জন্য সেরা"]
  },
  {
    id: "alzain",
    name: "আল-জাইন মোহামেদ আহমেদ (Alzain Mohamed Ahmed)",
    arabicName: "الزين محمد أحمد",
    country: "সুদান",
    imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80",
    description: "সুদানের প্রখ্যাত ক্বারী।",
    serverUrl: "https://server9.mp3quran.net/alzain/",
    isActive: true,
    tags: ["অন্যান্য কারী"]
  },
  {
    id: "abukhary",
    name: "আব্দুল্লাহ বুখারী (Abdullah Bukhari)",
    arabicName: "عبد الله البخاري",
    country: "সৌদি আরব",
    imageUrl: "https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=400&q=80",
    description: "মদীনার সুপরিচিত ক্বারী।",
    serverUrl: "https://server14.mp3quran.net/abukhary/",
    isActive: true,
    tags: ["অন্যান্য কারী"]
  },
  {
    id: "bo_khtr",
    name: "সালাহ বুখাতির (Salah Bukhatir)",
    arabicName: "صلاح بو خاطر",
    country: "সংযুক্ত আরব আমিরাত",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    description: "সংযুক্ত আরব আমিরাতের ক্বারী।",
    serverUrl: "https://server8.mp3quran.net/bo_khtr/",
    isActive: true,
    tags: ["অন্যান্য কারী"]
  },
  {
    id: "shaim",
    name: "আব্দুলআজিজ আল-শেইম (Abdulaziz Al-Sheim)",
    arabicName: "عبد العزيز الشحيم",
    country: "আলজেরিয়া",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
    description: "আলজেরিয়ার তরুণ ক্বারী।",
    serverUrl: "https://server16.mp3quran.net/shaim/",
    isActive: true,
    tags: ["অন্যান্য কারী"]
  },
  {
    id: "obaida",
    name: "ওবাইদা মুয়ফাক (Obaida Muafaq)",
    arabicName: "عبيدة موفق",
    country: "ইরাক",
    imageUrl: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&q=80",
    description: "ইরাকের আবেগপূর্ণ কণ্ঠের ক্বারী।",
    serverUrl: "https://server11.mp3quran.net/obaida/",
    isActive: true,
    tags: ["অন্যান্য কারী"]
  },
  {
    id: "m_ayoub",
    name: "মোহাম্মদ আইয়ুব আসিফ (Mohammad Ayyub Asif)",
    arabicName: "محمد أيوب عاصف",
    country: "যুক্তরাজ্য",
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
    description: "যুক্তরাজ্যের প্রখ্যাত ক্বারী।",
    serverUrl: "https://server8.mp3quran.net/m_ayoub/",
    isActive: true,
    tags: ["অন্যান্য কারী"]
  }
];

export const SURAHS: Surah[] = [
  { number: 1, name: "সূরা আল-ফাতিহা", englishName: "Al-Fatihah", arabicName: "الفاتحة", versesCount: 7 },
  { number: 2, name: "সূরা আল-বাকারা", englishName: "Al-Baqarah", arabicName: "البقرة", versesCount: 286 },
  { number: 3, name: "সূরা আলে ইমরান", englishName: "Ali 'Imran", arabicName: "آل عمران", versesCount: 200 },
  { number: 4, name: "সূরা আন-নিসা", englishName: "An-Nisa", arabicName: "النساء", versesCount: 176 },
  { number: 5, name: "সূরা আল-মা'ইদাহ", englishName: "Al-Ma'idah", arabicName: "المائدة", versesCount: 120 },
  { number: 6, name: "সূরা আল-আনআম", englishName: "Al-An'am", arabicName: "الأنعام", versesCount: 165 },
  { number: 7, name: "সূরা আল-আরাফ", englishName: "Al-A'raf", arabicName: "الأعراف", versesCount: 206 },
  { number: 8, name: "সূরা আল-আনফাল", englishName: "Al-Anfal", arabicName: "الأنفال", versesCount: 75 },
  { number: 9, name: "সূরা আত-তাওবাহ", englishName: "At-Tawbah", arabicName: "التوبة", versesCount: 129 },
  { number: 10, name: "সূরা ইউনুস", englishName: "Yunus", arabicName: "يونس", versesCount: 109 },
  { number: 11, name: "সূরা হুদ", englishName: "Hud", arabicName: "هود", versesCount: 123 },
  { number: 12, name: "সূরা ইউসুফ", englishName: "Yusuf", arabicName: "يوسف", versesCount: 111 },
  { number: 13, name: "সূরা আর-রাদ", englishName: "Ar-Ra'd", arabicName: "الرعد", versesCount: 43 },
  { number: 14, name: "সূরা ইব্রাহিম", englishName: "Ibrahim", arabicName: "إبراهيم", versesCount: 52 },
  { number: 15, name: "সূরা আল-হিজর", englishName: "Al-Hijr", arabicName: "الحجر", versesCount: 99 },
  { number: 16, name: "সূরা আন-নাহল", englishName: "An-Nahl", arabicName: "النحل", versesCount: 128 },
  { number: 17, name: "সূরা আল-ইসরা", englishName: "Al-Isra", arabicName: "الإسراء", versesCount: 111 },
  { number: 18, name: "সূরা আল-কাহফ", englishName: "Al-Kahf", arabicName: "الكهف", versesCount: 110 },
  { number: 19, name: "সূরা মারিয়াম", englishName: "Maryam", arabicName: "مريم", versesCount: 98 },
  { number: 20, name: "সূরা ত্বহা", englishName: "Ta-Ha", arabicName: "طه", versesCount: 135 },
  { number: 21, name: "সূরা আল-আম্বিয়া", englishName: "Al-Anbiya", arabicName: "الأنبياء", versesCount: 112 },
  { number: 22, name: "সূরা আল-হাজ্জ", englishName: "Al-Hajj", arabicName: "الحج", versesCount: 78 },
  { number: 23, name: "সূরা আল-মুমিনুন", englishName: "Al-Mu'minun", arabicName: "المؤمنون", versesCount: 118 },
  { number: 24, name: "সূরা আন-নূর", englishName: "An-Nur", arabicName: "النور", versesCount: 64 },
  { number: 25, name: "সূরা আল-ফুরকান", englishName: "Al-Furqan", arabicName: "الفرقان", versesCount: 77 },
  { number: 26, name: "সূরা আশ-শুয়ারা", englishName: "Ash-Shu'ara", arabicName: "الشعراء", versesCount: 227 },
  { number: 27, name: "সূরা আন-নামল", englishName: "An-Nahl", arabicName: "النمل", versesCount: 93 },
  { number: 28, name: "সূরা আল-কাসাস", englishName: "Al-Qasas", arabicName: "القصص", versesCount: 88 },
  { number: 29, name: "সূরা আল-আনকাবুত", englishName: "Al-'Ankabut", arabicName: "العنكبوت", versesCount: 69 },
  { number: 30, name: "সূরা আর-রুম", englishName: "Ar-Rum", arabicName: "الروم", versesCount: 60 },
  { number: 31, name: "সূরা লোকমান", englishName: "Luqman", arabicName: "لقمان", versesCount: 34 },
  { number: 32, name: "সূরা আস-সাজদাহ", englishName: "As-Sajdah", arabicName: "السجدة", versesCount: 30 },
  { number: 33, name: "সূরা আল-হাহযাব", englishName: "Al-Ahzab", arabicName: "الأحزاب", versesCount: 73 },
  { number: 34, name: "সূরা সাবা", englishName: "Saba", arabicName: "سبأ", versesCount: 54 },
  { number: 35, name: "সূরা ফাতির", englishName: "Fatir", arabicName: "فاطر", versesCount: 45 },
  { number: 36, name: "সূরা ইয়াসিন", englishName: "Ya-Sin", arabicName: "يس", versesCount: 83 },
  { number: 37, name: "সূরা আস-সাফফাত", englishName: "As-Saffat", arabicName: "الصافات", versesCount: 182 },
  { number: 38, name: "সূরা সোয়াদ", englishName: "Sad", arabicName: "ص", versesCount: 88 },
  { number: 39, name: "সূরা আয-যুমার", englishName: "Az-Zumar", arabicName: "الزمر", versesCount: 75 },
  { number: 40, name: "সূরা গাফির", englishName: "Ghafir", arabicName: "غافر", versesCount: 85 },
  { number: 41, name: "সূরা ফুসসিলাত", englishName: "Fussilat", arabicName: "فصلت", versesCount: 54 },
  { number: 42, name: "সূরা আশ-শূরা", englishName: "Ash-Shura", arabicName: "الشورى", versesCount: 53 },
  { number: 43, name: "সূরা আয-যুখরুফ", englishName: "Az-Zukhruf", arabicName: "الزخرف", versesCount: 89 },
  { number: 44, name: "সূরা আদ-দুখান", englishName: "Ad-Dukhan", arabicName: "الدخان", versesCount: 59 },
  { number: 45, name: "সূরা আল-জাসিয়াহ", englishName: "Al-Jathiyah", arabicName: "الجاثية", versesCount: 37 },
  { number: 46, name: "সূরা আল-আহকাফ", englishName: "Al-Ahqaf", arabicName: "الأحقاف", versesCount: 35 },
  { number: 47, name: "সূরা মুহাম্মদ", englishName: "Muhammad", arabicName: "محمد", versesCount: 38 },
  { number: 48, name: "সূরা আল-ফাতহ", englishName: "Al-Fath", arabicName: "الفتح", versesCount: 29 },
  { number: 49, name: "সূরা আল-হুজুরাত", englishName: "Al-Hujurat", arabicName: "الحجرات", versesCount: 18 },
  { number: 50, name: "সূরা ক্বাফ", englishName: "Qaf", arabicName: "ق", versesCount: 45 },
  { number: 51, name: "সূরা আয-যারিয়াত", englishName: "Adh-Dhariyat", arabicName: "الذاريات", versesCount: 60 },
  { number: 52, name: "সূরা আত-তূর", englishName: "At-Tur", arabicName: "الطور", versesCount: 49 },
  { number: 53, name: "সূরা আন-নাজম", englishName: "An-Najm", arabicName: "النجم", versesCount: 62 },
  { number: 54, name: "সূরা আল-ক্বামার", englishName: "Al-Qamar", arabicName: "القمر", versesCount: 55 },
  { number: 55, name: "সূরা আর-রহমান", englishName: "Ar-Rahman", arabicName: "الرحمن", versesCount: 78 },
  { number: 56, name: "সূরা আল-ওয়াকিয়াহ", englishName: "Al-Waqi'ah", arabicName: "الواقعة", versesCount: 96 },
  { number: 57, name: "সূরা আল-হাদীদ", englishName: "Al-Hadid", arabicName: "الحديد", versesCount: 29 },
  { number: 58, name: "সূরা আল-মুজাদালাহ", englishName: "Al-Mujadilah", arabicName: "المجادلة", versesCount: 22 },
  { number: 59, name: "সূরা আল-হাশর", englishName: "Al-Hashr", arabicName: "الحشر", versesCount: 24 },
  { number: 60, name: "সূরা আল-মุมতাহানাহ", englishName: "Al-Mumtahanah", arabicName: "الممتحنة", versesCount: 13 },
  { number: 61, name: "সূরা আস-সাফ", englishName: "As-Saff", arabicName: "الصف", versesCount: 14 },
  { number: 62, name: "সূরা আল-জুমুআহ", englishName: "Al-Jumu'ah", arabicName: "الجمعة", versesCount: 11 },
  { number: 63, name: "সূরা আল-মুনাফিকুন", englishName: "Al-Munafiqun", arabicName: "المنافقون", versesCount: 11 },
  { number: 64, name: "সূরা আত-তাগাবুন", englishName: "At-Taghabun", arabicName: "التغابن", versesCount: 18 },
  { number: 65, name: "সূরা আত-ত্বলাক", englishName: "At-Talaq", arabicName: "الطلاق", versesCount: 12 },
  { number: 66, name: "সূরা আত-তাহরীম", englishName: "At-Tahrim", arabicName: "التحريم", versesCount: 12 },
  { number: 67, name: "সূরা আল-মূলক", englishName: "Al-Mulk", arabicName: "الملك", versesCount: 30 },
  { number: 68, name: "সূরা আল-ক্বলম", englishName: "Al-Qalam", arabicName: "القلم", versesCount: 52 },
  { number: 69, name: "সূরা আল-হাক্কাহ", englishName: "Al-Haqqah", arabicName: "الحاقة", versesCount: 52 },
  { number: 70, name: "সূরা আল-ماআরিজ", englishName: "Al-Ma'arij", arabicName: "المعارج", versesCount: 44 },
  { number: 71, name: "সূরা নূহ", englishName: "Nuh", arabicName: "نوح", versesCount: 28 },
  { number: 72, name: "সূরা আল-জ্বিন", englishName: "Al-Jinn", arabicName: "الجن", versesCount: 28 },
  { number: 73, name: "সূরা আল-মুযযামমিল", englishName: "Al-Muzzammil", arabicName: "المزمل", versesCount: 20 },
  { number: 74, name: "সূরা আল-মুদ্দাসসির", englishName: "Al-Muddaththir", arabicName: "المدثر", versesCount: 56 },
  { number: 75, name: "সূরা আল-ক্বিয়ামাহ", englishName: "Al-Qiyamah", arabicName: "القيامة", versesCount: 40 },
  { number: 76, name: "সূরা আল-ইনসান", englishName: "Al-Insan", arabicName: "الإنسان", versesCount: 31 },
  { number: 77, name: "সূরা আল-মুরসালাত", englishName: "Al-Mursalat", arabicName: "المرسلات", versesCount: 50 },
  { number: 78, name: "সূরা আন-নাবা", englishName: "An-Naba", arabicName: "النبأ", versesCount: 40 },
  { number: 79, name: "সূরা আন-নাযিয়াত", englishName: "An-Nazi'at", arabicName: "النازعات", versesCount: 46 },
  { number: 80, name: "সূরা আবাসা", englishName: "'Abasa", arabicName: "عبس", versesCount: 42 },
  { number: 81, name: "সূরা আত-তাকভীর", englishName: "At-Takwir", arabicName: "التكوير", versesCount: 29 },
  { number: 82, name: "সূরা আল-ইনফিতার", englishName: "Al-Infitar", arabicName: "الانفطار", versesCount: 19 },
  { number: 83, name: "সূরা আল-মুতাফফিফীন", englishName: "Al-Mutaffifin", arabicName: "المطففين", versesCount: 36 },
  { number: 84, name: "সূরা আল-ইনশিক্বাক্ব", englishName: "Al-Inshiqaq", arabicName: "الانشقاق", versesCount: 25 },
  { number: 85, name: "সূরা আল-বুরুজ", englishName: "Al-Buruj", arabicName: "البروج", versesCount: 22 },
  { number: 86, name: "সূরা আত-ত্বারিক্ব", englishName: "At-Tariq", arabicName: "الطارق", versesCount: 17 },
  { number: 87, name: "সূরা আল-আলা", englishName: "Al-A'la", arabicName: "الأعلى", versesCount: 19 },
  { number: 88, name: "সূরা আল-গাশিয়াহ", englishName: "Al-Ghashiyah", arabicName: "الغاشية", versesCount: 26 },
  { number: 89, name: "সূরা আল-ফজর", englishName: "Al-Fajr", arabicName: "الفجر", versesCount: 30 },
  { number: 90, name: "সূরা আল-বালাদ", englishName: "Al-Balad", arabicName: "البلد", versesCount: 20 },
  { number: 91, name: "সূরা আশ-শামস", englishName: "Ash-Shams", arabicName: "الشمس", versesCount: 15 },
  { number: 92, name: "সূরা আল-লাইল", englishName: "Al-Lail", arabicName: "الليل", versesCount: 21 },
  { number: 93, name: "সূরা আদ-দুহা", englishName: "Ad-Duha", arabicName: "الضحى", versesCount: 11 },
  { number: 94, name: "সূরা আশ-শারহ", englishName: "Ash-Sharh", arabicName: "الشرح", versesCount: 8 },
  { number: 95, name: "সূরা আত-তীন", englishName: "At-Tin", arabicName: "التين", versesCount: 8 },
  { number: 96, name: "সূরা আল-আলাক্ব", englishName: "Al-'Alaq", arabicName: "العلق", versesCount: 19 },
  { number: 97, name: "সূরা আল-ক্বদর", englishName: "Al-Qadr", arabicName: "القدر", versesCount: 5 },
  { number: 98, name: "সূরা আল-বাইয়্যিনাহ", englishName: "Al-Bayyinah", arabicName: "البينة", versesCount: 8 },
  { number: 99, name: "সূরা আয-যালযালাহ", englishName: "Az-Zalzalah", arabicName: "الزلزلة", versesCount: 8 },
  { number: 100, name: "সূরা আল-আদিয়াত", englishName: "Al-'Adiyat", arabicName: "العاديات", versesCount: 11 },
  { number: 101, name: "সূরা আল-ক্বারিআহ", englishName: "Al-Qari'ah", arabicName: "القارعة", versesCount: 11 },
  { number: 102, name: "সূরা আত-তাকাসুর", englishName: "At-Takathur", arabicName: "التكاثر", versesCount: 8 },
  { number: 103, name: "সূরা আল-আসর", englishName: "Al-'Asr", arabicName: "العصر", versesCount: 3 },
  { number: 104, name: "সূরা আল-হুমাযাহ", englishName: "Al-Humazah", arabicName: "الهمزة", versesCount: 9 },
  { number: 105, name: "সূরা আল-ফীল", englishName: "Al-Fil", arabicName: "الفيل", versesCount: 5 },
  { number: 106, name: "সূরা কুরাইশ", englishName: "Quraysh", arabicName: "قريش", versesCount: 4 },
  { number: 107, name: "সূরা আল-মাউন", englishName: "Al-Ma'un", arabicName: "الماعون", versesCount: 7 },
  { number: 108, name: "সূরা আল-কাওসার", englishName: "Al-Kawthar", arabicName: "الكوثر", versesCount: 3 },
  { number: 109, name: "সূরা আল-কাফিরুন", englishName: "Al-Kafirun", arabicName: "الكافرون", versesCount: 6 },
  { number: 110, name: "সূরা আন-নসর", englishName: "An-Nasr", arabicName: "النصر", versesCount: 3 },
  { number: 111, name: "সূরা আল-মাসাদ", englishName: "Al-Masad", arabicName: "المسد", versesCount: 5 },
  { number: 112, name: "সূরা আল-ইখলাস", englishName: "Al-Ikhlas", arabicName: "الإخلاص", versesCount: 4 },
  { number: 113, name: "সূরা আল-ফালাক্ব", englishName: "Al-Falaq", arabicName: "الفلق", versesCount: 5 },
  { number: 114, name: "সূরা আন-নাস", englishName: "An-Nas", arabicName: "الناس", versesCount: 6 }
];

export const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  }
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

export const getSurahAudioUrl = (reciterServerUrl: string, surahNumber: number): string => {
  const padded = surahNumber.toString().padStart(3, "0");
  return `${reciterServerUrl}${padded}.mp3`;
};

export const getEstimatedSurahDuration = (surahNumber: number): number => {
  const baseDurations: Record<number, number> = {
    1: 45,    // Al-Fatihah
    2: 7200,  // Al-Baqarah ~ 2 hours
    3: 4500,  // Ali 'Imran ~ 1.25 hours
    36: 900,  // Ya-Sin ~ 15 mins
    55: 600,  // Ar-Rahman ~ 10 mins
    56: 480,  // Al-Waqi'ah ~ 8 mins
    67: 360,  // Al-Mulk ~ 6 mins
    112: 15,  // Al-Ikhlas
    113: 20,  // Al-Falaq
    114: 25   // An-Nas
  };
  return baseDurations[surahNumber] || (60 + surahNumber * 10);
};

export const SURAH_TRANSLATIONS: Record<number, { arabic: string; bangla: string }[]> = {
  1: [
    { arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", bangla: "পরম করুণাময়, অতি দয়ালু আল্লাহর নামে শুরু করছি।" },
    { arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", bangla: "সব প্রশংসা বিশ্বজগতের প্রতিপালক আল্লাহর।" },
    { arabic: "الرَّحْمَٰنِ الرَّحِيمِ", bangla: "তিনি পরম দয়াময়, অতি দয়ালু।" },
    { arabic: "مَالِكِ يَوْمِ الدِّينِ", bangla: "তিনি বিচার দিবসের মালিক।" },
    { arabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", bangla: "আমরা কেবল আপনারই ইবাদত করি এবং কেবল আপনারই সাহায্য চাই।" },
    { arabic: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ", bangla: "আমাদের সরল পথ দেখান।" },
    { arabic: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ", bangla: "তাদের পথ, যাদের আপনি পুরস্কৃত করেছেন; তাদের পথ নয় যারা ক্রোধগ্রস্ত এবং যারা পথভ্রষ্ট।" }
  ],
  55: [
    { arabic: "الرَّحْمَنُ", bangla: "পরম দয়াময় আল্লাহ।" },
    { arabic: "عَلَّمَ الْقُرْآنَ", bangla: "তিনিই শিক্ষা দিয়েছেন কুরআন।" },
    { arabic: "خَلَقَ الإِنسَانَ", bangla: "তিনিই সৃষ্টি করেছেন মানুষ।" },
    { arabic: "عَلَّمَهُ الْبَيَانَ", bangla: "তিনিই তাকে শিখিয়েছেন ভাষা ও ভাব প্রকাশ করতে।" },
    { arabic: "الشَّمْسُ وَالْقَمَرُ بِحُسْبَانٍ", bangla: "সূর্য ও চন্দ্র নির্ধারিত হিসাব অনুযায়ী আবর্তন করে।" },
    { arabic: "وَالنَّجْمُ وَالشَّجَرُ يَسْجُدَانِ", bangla: "তৃণলতা ও বৃক্ষরাজি তাঁকে সেজদা করে।" },
    { arabic: "فَبِأَيِّ آلَاء رَبِّكُمَا تُكَذِّبَانِ", bangla: "অতএব, তোমরা উভয়ে (মানব ও জ্বিন) তোমাদের প্রতিপালকের কোন অনুগ্রহ অস্বীকার করবে?" }
  ],
  67: [
    { arabic: "تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", bangla: "পরম বরকতময় তিনি, যাঁর হাতে রাজত্ব এবং তিনি সর্ববিষয়ে সর্বশক্তিমান।" },
    { arabic: "الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلاً وَهُوَ الْعَزِيزُ الْغَفُورُ", bangla: "যিনি সৃষ্টি করেছেন মৃত্যু ও জীবন, যাতে তোমাদের পরীক্ষা করেন যে কে কাজে সবচেয়ে উত্তম। তিনি পরাক্রমশালী, ক্ষমাশীল।" }
  ],
  112: [
    { arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ", bangla: "বলুন, তিনিই আল্লাহ, একক ও অদ্বিতীয়।" },
    { arabic: "اللَّهُ الصَّمَدُ", bangla: "আল্লাহ কারো মুখাপেক্ষী নন, সকলেই তাঁর মুখাপেক্ষী।" },
    { arabic: "لَمْ يَلِدْ وَلَمْ يُولَدْ", bangla: "তিনি কাউকে জন্ম দেননি এবং তাঁকেও জন্ম দেওয়া হয়নি।" },
    { arabic: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ", bangla: "এবং তাঁর সমকক্ষ আর কেউ নেই।" }
  ]
};
