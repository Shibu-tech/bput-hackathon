export type UserRole = 'student' | 'warden' | 'technician' | 'guard' | 'mess' | 'kiosk' | 'admin';

export type Language = 'en' | 'hi' | 'te' | 'ta' | 'mr';

export type PassType = 'day' | 'late_night' | 'weekend_leave' | 'emergency';
export type PassStatus = 'pending' | 'approved' | 'rejected' | 'checked_out' | 'completed' | 'overdue';

export interface GatePass {
  id: string;
  passCode: string;
  qrCode?: string;
  qrImage?: string;
  qrToken?: string;
  qrIssuedAt?: string;
  qrExpiresAt?: string;
  issueCount?: number;
  studentName: string;
  rollNumber: string;
  roomNumber: string;
  hostelBlock: string;
  passType: PassType;
  purpose: string;
  destination: string;
  outTime: string;
  expectedInTime: string;
  actualOutTime?: string;
  actualInTime?: string;
  status: PassStatus;
  parentConsentVerified: boolean;
  parentPhone: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export type ComplaintCategory = 'electrical' | 'plumbing' | 'wifi' | 'carpentry' | 'cleaning' | 'ac';
export type ComplaintPriority = 'low' | 'medium' | 'high' | 'critical';
export type ComplaintStatus = 'open' | 'assigned' | 'in_progress' | 'resolved' | 'rejected';

export interface Complaint {
  id: string;
  ticketNumber: string;
  category: ComplaintCategory;
  title: string;
  description: string;
  studentName: string;
  rollNumber: string;
  roomNumber: string;
  hostelBlock: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  createdAt: string;
  assignedTo?: string;
  assignedTrade?: string;
  assignedBy?: string;
  assignedAt?: string;
  wardenNotes?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
  rejectionReason?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  photoUrl?: string;
  masterTicketId?: string; // If grouped into deduplicated issue
  upvotes: number;
  aiSummary?: string;
}

export interface DeduplicatedTicket {
  id: string;
  masterCode: string;
  category: ComplaintCategory;
  title: string;
  hostelBlock: string;
  affectedCount: number;
  reportedRooms: string[];
  complaintIds: string[];
  assignedTechnician?: string;
  status: ComplaintStatus;
  detectedAt: string;
  rootCauseCandidate: string;
}

export interface MessMenuItem {
  id: string;
  name: string;
  nameRegional?: string;
  type: 'veg' | 'non-veg' | 'jain';
  calories: number;
  isSpecial?: boolean;
}

export interface DailyMessMenu {
  day: string;
  breakfast: MessMenuItem[];
  lunch: MessMenuItem[];
  snacks: MessMenuItem[];
  dinner: MessMenuItem[];
}

export interface CafeteriaItem {
  id: string;
  name: string;
  price: number;
  category: 'beverages' | 'snacks' | 'quick_bites' | 'meals';
  veg: boolean;
  prepTimeMinutes: number;
  available: boolean;
  tag?: string;
}

export interface CafeteriaOrder {
  id: string;
  orderNumber: string;
  studentName: string;
  roomNumber: string;
  hostelBlock: string;
  items: { item: CafeteriaItem; quantity: number }[];
  totalAmount: number;
  status: 'received' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  placedAt: string;
  createdAt?: number;
  deliveryOtp: string;
  rating?: number;
  review?: string;
  reviewedAt?: string;
}

export interface RoomBed {
  id: string;
  bedLabel: 'A' | 'B';
  isOccupied: boolean;
  occupant?: {
    name: string;
    rollNumber: string;
    branch: string;
    year: string;
    habits: string[];
  };
}

export interface HostelRoom {
  id: string;
  roomNumber: string;
  block: string;
  floor: number;
  type: 'double' | 'single' | 'triple';
  gender: 'boys' | 'girls';
  beds: RoomBed[];
  amenities: string[];
}

export interface RollCallRecord {
  rollNumber: string;
  name: string;
  room: string;
  block: string;
  status: 'inside' | 'on_gate_pass' | 'mess_checked_in' | 'overdue' | 'unaccounted';
  lastSeenTime: string;
  contactNumber: string;
}

export interface BroadcastNotification {
  id: string;
  title: string;
  content: string;
  target: 'all' | 'block' | 'branch' | 'batch';
  targetValue: string;
  sender: string;
  sentAt: string;
  priority: 'normal' | 'urgent' | 'emergency';
  readCount: number;
  totalRecipients: number;
}

export interface EmergencyAlert {
  id: string;
  type: 'fire_drill' | 'severe_weather' | 'campus_lockdown' | 'medical_evacuation';
  title: string;
  message: string;
  musterPoint: string;
  triggeredAt: string;
  triggeredBy: string;
  active: boolean;
  checkedInStudentsCount: number;
}

export interface StaffRegistrationRequest {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  roleLabel: string;
  designation: string;
  employeeId: string;
  offerLetterName?: string;
  offerLetterUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string | number;
  verifiedAt?: string | number;
  verificationNotes?: string;
  verifiedBy?: string;
}

