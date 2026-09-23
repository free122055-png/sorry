export type GenderType = 'groom' | 'bride'; // 👨 পাত্র / 🧕 পাত্রী
export type BiodataStatus = 'pending' | 'active' | 'inactive' | 'rejected';
export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface Biodata {
  id: string;
  biodataCode: string; // e.g., "MB-1002"
  userId: string;
  userEmail?: string;
  userPhone?: string;
  gender: GenderType;
  status: BiodataStatus;
  isVerified: boolean;
  isFeatured: boolean;
  createdAt: number;
  updatedAt: number;

  // 1. ব্যক্তিগত তথ্য (Personal Info)
  fullName: string; // Protected/Hidden from public
  maritalStatus: string; // "অবিবাহিত", "ডিভোর্সড", "বিপত্নীক", "বিধবা"
  age: number;
  dateOfBirth?: string;
  height: string; // e.g., "৫ ফুট ৬ ইঞ্চি"
  weight: string; // e.g., "৬৫ কেজি"
  complexion: string; // e.g., "উজ্জ্বল ফর্সা", "শ্যামলা"
  bloodGroup: string; // e.g., "A+", "B+", "O+", "AB+"

  // 2. ঠিকানা (Address)
  presentDistrict: string;
  presentUpazila?: string;
  presentAddress?: string; // Protected
  permanentDistrict: string;
  permanentUpazila?: string;
  permanentAddress?: string; // Protected

  // 3. শিক্ষা ও যোগ্যতা (Education)
  educationMethod: string; // "সাধারণ শিক্ষা", "কওমী মাদ্রাসা", "আলিয়া মাদ্রাসা"
  highestDegree: string;
  institute: string;
  passingYear?: string;
  hifzOrIslamicEducation?: string;

  // 4. পেশা ও আয় (Occupation)
  occupation: string;
  workplace?: string;
  monthlyIncome?: string;

  // 5. পারিবারিক তথ্য (Family)
  fatherName?: string;
  fatherOccupation: string;
  motherName?: string;
  motherOccupation: string;
  brothersCount: number;
  sistersCount: number;
  familyDetails: string;
  familyStatus: string; // "উচ্চ বিত্ত", "মধ্যবিত্ত", "দ্বীনি পরিবার"

  // 6. দ্বীনি বৈশিষ্ট্য (Religious Practices)
  salahRegularity: string; // "৫ ওয়াক্ত জামাতে", "৫ ওয়াক্ত নিয়মিত"
  hijabOrBeard: string; // "সুন্নতি দাড়ি", "শারীয়াহ সম্মত পর্দা/নিকাব"
  quranRecitation: string;
  mazhabAqeedah?: string;
  mahramNonMahramCompliance: string;

  // 7. জীবনধারা ও ব্যক্তিত্ব (Lifestyle)
  aboutSelf: string;
  hobbies?: string;
  futurePlans?: string;

  // 8. জীবনসঙ্গীর প্রত্যাশা (Expectations)
  expectedAgeRange: string;
  expectedHeight: string;
  expectedEducation: string;
  expectedOccupation?: string;
  expectedDistrict?: string;
  expectedReligiousQualities: string;

  // 9. যোগাযোগ ও ছবি (Contact & Privacy)
  guardianName: string; // Protected
  guardianRelation: string; // e.g., "বাবা", "বড় ভাই"
  guardianPhone: string; // Protected
  photoUrl?: string;
  photoBlurred: boolean; // True for Islamic privacy
}

export interface BiodataRequest {
  id: string;
  biodataId: string;
  biodataCode: string;
  userId: string;
  userName: string;
  userPhone: string;
  userEmail?: string;
  relationWithCandidate?: string;
  reasonForContact?: string;
  status: RequestStatus;
  adminNote?: string;
  createdAt: number;
  updatedAt: number;
  
  // Populated candidate info for approved display
  candidateGuardianName?: string;
  candidateGuardianPhone?: string;
  candidateGuardianRelation?: string;
  candidatePresentDistrict?: string;
}

export interface BiodataFilters {
  searchTerm: string;
  gender: 'all' | 'groom' | 'bride';
  district: string;
  quickFilter: 'all' | 'new' | 'verified' | 'featured';
}

export const BD_DISTRICTS = [
  "ঢাকা", "চট্টগ্রাম", "সিলেট", "রাজশাহী", "খুলনা", "বরিশাল", "রংপুর", "ময়মনসিংহ",
  "কুমিল্লা", "গাজীপুর", "নারায়ণগঞ্জ", "বগুড়া", "কক্সবাজার", "ফেনী", "নোয়াখালী", "চাঁদপুর",
  "ব্রাহ্মণবাড়িয়া", "টাঙ্গাইল", "ফরিদপুর", "যশোর", "কুষ্টিয়া", "দিনাজপুর", "পাবনা", "নাটোর",
  "সাতক্ষীরা", "পটুয়াখালী", "ভোলা", "ঝালকাঠি", "পিরোজপুর", "লক্ষ্মীপুর", "কিশোরগঞ্জ", "মানিকগঞ্জ",
  "মুন্সিগঞ্জ", "নরসিংদী", "রাজবাড়ী", "শরীয়তপুর", "গোপালগঞ্জ", "মাদারীপুর", "শেরপুর", "জামালপুর",
  "নেত্রকোণা", "হবিগঞ্জ", "মৌলভীবাজার", "সুনামগঞ্জ", "বাগেরহাট", "চুয়াডাঙ্গা", "ঝিনাইদহ", "মাগুরা",
  "মেহেরপুর", "নড়াইল", "সিরাজগঞ্জ", "জয়পুরহাট", "নওগাঁ", "চাঁপাইনবাবগঞ্জ", "গাইবান্ধা", "কুড়িগ্রাম",
  "লালমনিরহাট", "নীলফামারী", "পঞ্চগড়", "ঠাকুরগাঁও", "বান্ধরবান", "খাগড়াছড়ি", "রাঙ্গামাটি", "বরগুনা"
];
