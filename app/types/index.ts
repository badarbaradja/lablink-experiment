// ==========================================
// 1. API RESPONSE WRAPPER
// ==========================================
export interface ApiResponse<T> {
  data: T;
  message?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

// ==========================================
// 2. AUTH & USER
// ==========================================
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: 'ADMIN' | 'ASSISTANT' | 'MEMBER';
  isPasswordChanged: boolean;
}

// ==========================================
// 3. MEMBER
// ==========================================
export interface Member {
  id: string;
  username: string; // NIM
  fullName: string;
  role: string;
  expertDivision: string;
  department: string;
  email: string;
  phoneNumber: string;
  socialMediaLink: string;
  isActive: boolean;
  isPasswordChanged: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMemberRequest {
  nim: string;
  fullName: string;
  expertDivision: string;
  department: string;
}

export interface UpdateMemberRequest {
  fullName?: string;
  expertDivision?: string;
  department?: string;
  email?: string;
  phoneNumber?: string;
  socialMediaLink?: string;
}

// ==========================================
// 4. DASHBOARD & STATISTICS
// ==========================================
export interface MonthlyStat {
  name: string; // Misal: "Jan", "Feb"
  projects: number;
  events: number;
}

export interface Statistics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalEvents: number;
  ongoingEvents: number;
  completedEvents: number;
  totalMembers: number;
  activeMembers: number;
  totalArchives: number;
  totalLetters: number;
}

export interface UpcomingItem {
  type: 'PROJECT' | 'EVENT';
  id: string;
  code: string;
  name: string;
  deadline: string; // Tanggal deadline/event
  daysRemaining: number;
}

// Tipe data untuk Activity Log (Dipakai di Dashboard & Halaman Log)
export interface ActivityLog {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | string;
  targetType: 'MEMBER' | 'PROJECT' | 'EVENT' | 'LETTER' | 'ARCHIVE' | string;
  targetName: string;
  userName: string;
  timestamp: string;
  details?: string;
  timeAgo?: string; // Helper field dari Backend/Frontend
}

export interface DashboardSummary {
  statistics: Statistics;
  upcomingDeadlines: UpcomingItem[];
  recentActivities: ActivityLog[]; // Menggunakan interface ActivityLog standar
  monthlyStats: MonthlyStat[];
}

// ==========================================
// 5. PERIOD (PERIODE KEPENGURUSAN)
// ==========================================
export interface Period {
  id: string;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isArchived: boolean;
  createdAt?: string;
}

// ==========================================
// 6. PROJECT
// ==========================================
export interface MemberSummary {
  id: string;
  username: string;
  fullName: string;
  expertDivision: string;
}

export interface Project {
  id: string;
  projectCode: string;
  name: string;
  division: string;
  activityType: string;
  status: 'PLANNED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED' | string;
  startDate?: string; // Bisa null jika belum mulai
  endDate?: string;   // Bisa null (Deadline)
  description?: string;
  progressPercent: number;
  leader: MemberSummary;
  teamMembers: MemberSummary[];
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  approvedAt?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  name: string;
  division: string;
  activityType: string;
  status: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  progressPercent: number;
  leaderId: string;
  teamMemberIds: string[];
}

export interface UpdateProjectRequest {
  name?: string;
  division?: string;
  activityType?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  progressPercent?: number;
  leaderId?: string;
  teamMemberIds?: string[];
}

// ==========================================
// 7. EVENT (KEGIATAN)
// ==========================================
export interface CommitteeMember {
  memberId: string;
  username: string;
  fullName: string;
  role: string;
}

export interface Event {
  id: string;
  eventCode: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'PLANNED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED' | string;
  eventType: string; // WORKSHOP, SEMINAR, TRAINING, etc.
  location: string;  // <--- ADDED: Lokasi kegiatan
  pic: MemberSummary; // Person In Charge
  picName?: string;  // Optional helper jika API meratakan object
  committee: CommitteeMember[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventRequest {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  eventType: string;
  location: string;
  picId: string;
  schedules?: EventScheduleRequest[];
}

export interface EventScheduleRequest {
  activityDate: string;
  title: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
}

export interface EventSchedule {
  id: string;
  eventId: string;
  eventCode: string;
  eventName: string;
  activityDate: string;
  title: string; // Activity Title (e.g. "Sesi 1")
  description: string;
  startTime: string;
  endTime: string;
  location: string;
}

export interface UpdateEventRequest {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  eventType?: string;
  location?: string;
  status?: string;
  picId?: string;
  committee?: { memberId: string; role: string }[];
}

// ==========================================
// 8. ARCHIVE (ARSIP)
// ==========================================
export interface ArchiveSource {
  id: string;
  code: string;
  name: string;
  leader: string;
}

export interface Archive {
  id: string;
  archiveCode: string;
  title: string;
  description: string;
  archiveType: string; // DOCUMENT, SOFTWARE, MEDIA
  department: string;
  sourceType: 'PROJECT' | 'EVENT' | 'OTHER';
  source: ArchiveSource;
  publishLocation: string; // Link GDrive / Physical Location
  referenceNumber: string;
  publishDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateArchiveRequest {
  title: string;
  description?: string;
  archiveType: string;
  sourceType: string;
  projectId?: string;
  eventId?: string;
  publishLocation?: string;
  referenceNumber?: string;
  publishDate?: string;
}

export interface UpdateArchiveRequest {
  title?: string;
  description?: string;
  publishLocation?: string;
  referenceNumber?: string;
  publishDate?: string;
}

// ==========================================
// 9. LETTER (PERSURATAN)
// ==========================================
export interface LetterEventSummary {
  id: string;
  eventCode: string;
  name: string;
}

export interface Letter {
  id: string;
  letterNumber: string | null;  // null until approved
  letterType: string; // INVITATION, PERMISSION, BORROWING
  category: string;   // INTERNAL, EXTERNAL
  subject: string;
  recipient: string;
  content: string;
  attachment: string;
  
  // Requester info (auto-filled)
  requesterName: string;
  requesterNim: string;
  
  // Borrowing specifics
  borrowDate?: string;
  borrowReturnDate?: string;
  
  // Dates
  issueDate: string | null;  // Set on approval
  
  // Status
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  
  // Approval info
  approvedBy?: string;
  rejectionReason?: string;
  
  event?: LetterEventSummary;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLetterRequest {
  letterType: string;
  category: string;
  subject: string;
  recipient: string;
  content?: string;
  attachment?: string;
  eventId?: string;
  borrowDate?: string;
  borrowReturnDate?: string;
}

export interface IncomingLetter {
  id: string;
  senderName: string;
  senderInstitution: string;
  subject: string;
  receivedDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateIncomingLetterRequest {
  senderName?: string;
  senderInstitution?: string;
  subject?: string;
  receivedDate?: string;
  notes?: string;
}

// ==========================================
// 10. FINANCE (KEUANGAN)
// ==========================================

export interface FinanceCategory {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE' | 'BOTH';
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface FinanceTransaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  categoryId: string;
  categoryName: string;
  amount: number;
  transactionDate: string;
  description?: string;
  receiptUrl?: string; // from backend receiptUrl
  eventId?: string;
  eventName?: string;
  projectId?: string;
  projectName?: string;
  periodId: string; // Period Architecture
  createdBy: string;
  createdAt: string;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  incomeByCategory: { categoryName: string; total: number }[];
  expenseByCategory: { categoryName: string; total: number }[];
}

export interface CreateTransactionRequest {
  type: 'INCOME' | 'EXPENSE';
  categoryId: string;
  amount: number;
  transactionDate: string;
  description?: string;
  eventId?: string;
  projectId?: string;
}

// Uang Kas
export interface DuesPayment {
  id: string;
  memberId: string;
  memberName: string;
  memberNim: string;
  periodId: string;
  paymentMonth: number;
  paymentYear: number;
  amount: number;
  paidAt: string;
  paymentProofUrl?: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verifiedBy?: string;
  createdAt: string;
}

// Pengadaan Barang
export interface ProcurementRequest {
  id: string;
  requesterName: string;
  itemName: string;
  description: string;
  reason: string;
  estimatedPrice: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  purchaseLink?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PURCHASED';
  rejectionReason?: string;
  createdAt: string;
}