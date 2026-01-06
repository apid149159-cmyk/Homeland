
export type VendorType = 'BAND' | 'SOUND' | 'FOOD' | 'STAFF' | 'VENUE' | 'FASHION' | 'FOOD_TRUCK';

export interface VendorSpecs {
  type?: string; // e.g., 'FULL_BAND', 'ACOUSTIC'
  members?: number;
  min_watt?: number; // Required by Band
  watt?: number;     // Provided by Sound
  support?: string[]; // Types supported by Sound
  area?: number; // Area required in sqm
  power?: number;
  width?: number; // For Trucks/Booths
  depth?: number; // For Trucks/Booths
  needsFittingRoom?: boolean; // For Fashion
}

export interface Vendor {
  id: number;
  type: VendorType;
  name: string;
  name_th?: string; // Thai Name
  tags: string[];
  price: number;
  specs: VendorSpecs;
  image: string;
  description?: string;
  description_th?: string; // Thai Description
  sponsor?: string; // New Sponsor Field
}

// New Interface for Venue
export interface Venue {
  id: string;
  name: string;
  name_th?: string; // Thai Name
  type: 'INDOOR' | 'OUTDOOR';
  areaSqm: number;
  capacityMax: number;
  price: number;
  image: string;
  tags: string[];
}

export interface EventConfig {
  eventName?: string; // Added Event Name
  theme: string;
  pax: number;
  dates: string[]; // Changed to array for multiple days
  areaSqm: number; 
  selectedVenueId?: string; // Track which venue is selected
  taxEntity?: 'INDIVIDUAL' | 'CORPORATE'; // New: For Tax Logic
}

export interface Financials {
  subtotal: number;
  platformFee: number;
  vat: number;
  wht: number; // New: Withholding Tax
  grandTotal: number;
  netPayable: number; // New: Amount user actually pays (Total - WHT)
}

export interface ValidationResult {
  criticalErrors: string[];
  warnings: string[];
  staffStatus: { // New: Staff Logic
    needed: number;
    current: number;
    status: 'OK' | 'LOW';
  };
  spaceUsage: {
    totalUsed: number;
    percentUsed: number;
    status: 'OK' | 'WARNING' | 'OVERCROWDED';
  };
}

// Auth Types
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'ORGANIZER' | 'ADMIN' | 'VENDOR';
  avatar?: string;
  provider?: 'EMAIL' | 'GOOGLE' | 'FACEBOOK' | 'LINE'; // New field
}

// --- NEW: Admin Types ---
export interface BookingRecord {
    id: string;
    eventName: string;
    customerName: string;
    date: string;
    totalAmount: number;
    status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
    itemsCount: number;
}

// --- NEW: Zone & Booth Management ---
export interface Zone {
  id: string;
  name: string;
  color: string; // Hex color for UI
  capacity: number; // Max booths
}

export interface Booth {
  id: string;
  zoneId: string;
  code: string; // e.g. A01
  status: 'AVAILABLE' | 'OCCUPIED' | 'LOCKED';
  vendorId?: number; // Linked Vendor ID
  size?: string; // 2x2, 3x3
}

// --- NEW: Marketplace Types ---
export interface Ticket {
  id: string;
  eventName: string;
  originalPrice: number;
  resalePrice: number;
  date: string;
  location: string;
  zone: string;
  seatNumber: string;
  sellerName: string;
  isVerified: boolean;
  image: string;
  status: 'AVAILABLE' | 'SOLD';
}

// --- NEW: Chat System ---
export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  senderName: string; // To display easily
  senderRole: 'USER' | 'ADMIN' | 'VENDOR' | 'AI'; // Added AI
  text: string;
  timestamp: number;
  isRead: boolean;
  isFeedback?: boolean; // New: Flag for feedback messages
}