export type TelecomCategory = 'internet' | 'minute' | 'bundle' | 'sms';
export type OperatorType = 'Grameenphone' | 'Robi' | 'Banglalink' | 'Teletalk' | 'Airtel';

export interface TelecomOffer {
  id: string;
  operator: OperatorType;
  category: TelecomCategory;
  name: string; // e.g., "1 GB", "100 মিনিট"
  amount: string; // "1 GB"
  validity: string; // "3 দিন"
  price: number; // 29
  logo?: string;
  description: string;
  loanRule: 'allowed' | 'not_allowed' | 'custom';
  loanNote?: string;
  prepaidPostpaid: 'prepaid' | 'postpaid' | 'both';
  targetSim: string; // "সব সার্কেল"
  activationNote: string;
  extraInfo?: string;
  isActive: boolean;
  createdAt: number;
}

export interface TelecomPaymentMethod {
  id: string;
  methodName: 'বিকাশ' | 'নগদ' | 'রকেট' | 'অন্যান্য';
  accountNumber: string;
  instruction: string;
  isActive: boolean;
}

export interface TelecomOrder {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  offerId: string;
  operator: OperatorType;
  category: TelecomCategory;
  offerName: string;
  price: number;
  targetNumber: string;
  paymentMethod: string;
  paymentNumber: string;
  transactionId: string;
  screenshotUrl?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  rejectReason?: string;
  createdAt: number;
}
