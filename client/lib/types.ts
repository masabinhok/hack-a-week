// ============================================
// FILE: lib/types.ts
// DESCRIPTION: Comprehensive TypeScript types for Setu platform
// ============================================

// ==================== Location Types ====================

export interface Province {
  id: number;
  name: string;
  nameNepali?: string;
  slug: string;
}

export interface District {
  id: number;
  provinceId: number;
  name: string;
  nameNepali?: string;
  slug: string;
}

export interface Municipality {
  id: number;
  districtId: number;
  name: string;
  nameNepali?: string;
  slug: string;
  type: MunicipalityType;
  wardCount: number;
}

export type MunicipalityType =
  | "METROPOLITAN"
  | "SUB_METROPOLITAN"
  | "MUNICIPALITY"
  | "RURAL_MUNICIPALITY";

export interface Ward {
  id: number;
  municipalityId: number;
  wardNumber: number;
}

export interface Location {
  provinceId?: number;
  districtId?: number;
  municipalityId?: number;
  wardId?: number;
  province?: Province;
  district?: District;
  municipality?: Municipality;
  ward?: Ward;
}

export interface FullLocation {
  province: Province;
  district: District;
  municipality: Municipality;
  ward: Ward;
}

// ==================== Category Types ====================

export interface Category {
  id: string;
  categoryId: string;
  name: string;
  nameNepali?: string;
  slug: string;
  description?: string;
  descriptionNepali?: string;
  icon?: string;
  color?: string;
  sortOrder: number;
  isActive: boolean;
  serviceCount?: number;
  services?: Service[];
}

// ==================== Service Types ====================

// Priority aligned with backend Prisma enum
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

/**
 * Category reference in service response (simplified)
 */
export interface ServiceCategoryRef {
  name: string;
  slug: string;
}

export interface Service {
  id: string;
  serviceId: string;
  parentId?: string | null;
  level?: number;
  name: string;
  nameNepali?: string;
  slug: string;
  description?: string;
  descriptionNepali?: string;
  priority: Priority;
  isOnlineEnabled: boolean;
  eligibility?: string;
  validityPeriod?: string;
  onlinePortalUrl?: string;
  isActive?: boolean;
  sortOrder?: number;
  isLeaf?: boolean;
  hasSteps?: boolean;
  childrenCount?: number;
  stepsCount?: number;
  parent?: Service;
  children?: Service[];
  categories?: ServiceCategoryRef[];
  steps?: ServiceStep[];
  detailedProcedure?: DetailedProcedure;
  metadata?: ServiceMetadata;
  _count?: {
    children?: number;
    steps?: number;
  };
}

export interface ServiceMetadata {
  id: string;
  serviceId: string;
  lastUpdated: string;
  version?: string;
  dataSource?: string;
  verifiedBy?: string;
}

export interface ServiceWithGuide extends Service {
  steps: ServiceStep[];
  detailedProcedure?: DetailedProcedure;
  breadcrumb?: ServiceBreadcrumb[];
}

export interface ServiceBreadcrumb {
  id: string;
  name: string;
  nameNepali?: string;
  slug: string;
  level: number;
}

// ==================== Service Step Types ====================

export interface ServiceStep {
  id: string;
  stepId: string;
  serviceId: string;
  step: number;
  stepTitle: string;
  stepTitleNepali?: string;
  stepDescription?: string;
  stepDescriptionNepali?: string;
  officeTypes: OfficeType[]; // Changed from officeType to officeTypes array
  requiresAppointment: boolean;
  isOnline?: boolean; // NEW: If true, this step is completed online
  onlineFormUrl?: string; // NEW: URL to online form/portal for this step
  isActive: boolean;
  documentsRequired: StepDocument[];
  totalFees: StepFee[];
  timeRequired?: StepTime;
  workingHours: StepWorkingHours[];
  responsibleAuthorities: StepAuthority[];
  constraints?: ServiceStepConstraint[]; // Optional constraints for this step
}

export interface ServiceStepConstraint {
  id: string;
  serviceStepId: string;
  specificOfficeIds: string[]; // Specific office IDs if applicable
  provinceIds: number[]; // Province restrictions
  districtIds: number[]; // District restrictions
  municipalityIds: number[]; // Municipality restrictions
  reason?: string; // Human-readable explanation
  isException: boolean; // true = adds exceptions, false = restricts
  createdAt: Date;
  updatedAt: Date;
}

// OfficeType aligned with backend Prisma enum
export type OfficeType =
  // District Level - Core Services (77 offices each)
  | "DISTRICT_ADMINISTRATION_OFFICE" // DAO - Citizenship, recommendations, certificates
  | "LAND_REVENUE_OFFICE" // Malpot - Land registration, ownership transfer
  | "DISTRICT_EDUCATION_OFFICE" // SEE/SLC verification, certificate attestation
  // Transport Services
  | "TRANSPORT_MANAGEMENT_OFFICE" // Vehicle registration, blue book, license
  | "DRIVING_LICENSE_OFFICE" // License tests and renewals
  // Local Government - Daily services (753 offices)
  | "MUNICIPALITY_OFFICE" // Nagarpalika - Local services, business tax
  | "RURAL_MUNICIPALITY_OFFICE" // Gaupalika - Rural local services
  // Ward Level - Highest volume (6,743 offices)
  | "WARD_OFFICE" // Birth/death registration, business registration, recommendations
  // Travel & Immigration
  | "PASSPORT_OFFICE" // Passport applications and renewals
  | "IMMIGRATION_OFFICE" // Visa, travel documents
  // Business Registration - Federal Level
  | "OFFICE_OF_COMPANY_REGISTRAR" // OCR - Company registration (e-OCR/CAMIS)
  | "COTTAGE_SMALL_INDUSTRY_OFFICE" // DCSI - Cottage/small industry registration
  | "INLAND_REVENUE_OFFICE" // IRD - PAN/VAT registration, tax filing
  // Social Services
  | "LABOUR_OFFICE" // Foreign employment, work permits, labor disputes
  // Special Services
  | "NATIONAL_ID_CENTER"; // National ID Card enrollment and biometric registration

export interface StepDocument {
  id: number;
  docId: string;
  name: string;
  nameNepali?: string;
  type: DocumentType;
  quantity: number;
  format?: string;
  isMandatory: boolean;
  notes?: string;
  notesNepali?: string;
}

// DocumentType aligned with backend Prisma DocType enum
export type DocumentType =
  | "ORIGINAL"
  | "PHOTOCOPY"
  | "PHOTOGRAPH"
  | "PRINTOUT"
  | "NOTARIZED"
  | "CERTIFIED_COPY";

export interface StepFee {
  id: number;
  feeId: string;
  feeTitle: string;
  feeTitleNepali?: string;
  feeAmount: number;
  currency: string;
  feeType: FeeType;
  isRefundable: boolean;
  notes?: string;
  notesNepali?: string;
}

// FeeType aligned with backend Prisma enum
export type FeeType =
  | "GOVERNMENT"
  | "SERVICE"
  | "PENALTY"
  | "TAX";

export interface StepTime {
  minimumTime: string;
  maximumTime: string;
  averageTime: string;
  remarks?: string;
  remarksNepali?: string;
  expeditedAvailable?: boolean;
}

// Backend returns openClose as a combined string like "10:00 AM - 5:00 PM"
export interface StepWorkingHours {
  day: DayOfWeek;
  openClose: string;
}

export type DayOfWeek =
  | "SUNDAY"
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY";

export interface StepAuthority {
  id: number;
  position: string;
  positionNepali?: string;
  department: string;
  departmentNepali?: string;
  contactNumber?: string;
  email?: string;
}

// ==================== Detailed Procedure Types ====================

export interface DetailedProcedure {
  id: string;
  procId: string;
  serviceId: string;
  overview: string;
  overviewNepali?: string;
  stepByStepGuide: string[];
  stepByStepGuideNepali?: string[];
  importantNotes: string[];
  importantNotesNepali?: string[];
  legalReferences: LegalReference[];
  faqs: FAQ[];
  commonIssues: CommonIssue[];
}

export interface LegalReference {
  id: number;
  lawName: string;
  lawNameNepali?: string;
  section?: string;
  url?: string;
}

export interface FAQ {
  id: number;
  question: string;
  questionNepali?: string;
  answer: string;
  answerNepali?: string;
}

export interface CommonIssue {
  id: number;
  issue: string;
  issueNepali?: string;
  solution: string;
  solutionNepali?: string;
}

// ==================== Office Types ====================

export interface Office {
  id: string;
  officeId: string;
  name: string;
  nameNepali?: string;
  slug?: string;
  type: OfficeType;
  categoryId?: string;
  category?: OfficeCategory;
  address: string;
  addressNepali?: string;
  contact?: string;
  email?: string;
  website?: string;
  facilities: string[];
  nearestLandmark?: string;
  publicTransport?: string;
  latitude?: number;
  longitude?: number;
  isActive: boolean;
  jurisdiction?: OfficeJurisdiction;
  workingHours?: OfficeWorkingHours[];
}

export interface OfficeCategory {
  id: string;
  name: string;
  nameNepali?: string;
  slug: string;
  description?: string;
}

export interface OfficeJurisdiction {
  level: JurisdictionLevel;
  wardId?: number;
  municipalityId?: number;
  districtId?: number;
  provinceId?: number;
  ward?: Ward;
  municipality?: Municipality;
  district?: District;
  province?: Province;
}

export type JurisdictionLevel =
  | "WARD"
  | "MUNICIPALITY"
  | "DISTRICT"
  | "PROVINCE"
  | "FEDERAL";

export interface OfficeWorkingHours {
  id: number;
  day: DayOfWeek;
  openTime: string;
  closeTime: string;
  isHoliday: boolean;
  breakStart?: string;
  breakEnd?: string;
}

export interface OfficeForService {
  stepNumber: number;
  officeTypes: OfficeType[]; // Changed from officeType to officeTypes array
  isOnline?: boolean; // NEW: If true, this step is completed online
  onlineFormUrl?: string; // NEW: URL to online form/portal for this step
  offices: Office[];
}

// ==================== API Response Types ====================

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  timestamp?: string;
  path?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  success: false;
  statusCode: number;
  message: string;
  error?: string;
  timestamp?: string;
  path?: string;
}

// ==================== Search Types ====================

export interface SearchResult {
  services: Service[];
  categories: Category[];
  offices: Office[];
}

export interface SearchFilters {
  query?: string;
  category?: string;
  priority?: Priority;
  isOnlineEnabled?: boolean;
  officeType?: OfficeType;
  districtId?: number;
  municipalityId?: number;
}

// ==================== UI Types ====================

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface NavigationItem {
  label: string;
  labelNepali?: string;
  href: string;
  icon?: string;
  children?: NavigationItem[];
}

export interface StatItem {
  label: string;
  value: string | number;
  icon?: string;
  description?: string;
}

export interface HowItWorksStep {
  title: string;
  titleNepali?: string;
  description: string;
  descriptionNepali?: string;
  icon: string;
}

// ==================== Form Types ====================

export interface LocationSelectorValue {
  provinceId?: number;
  districtId?: number;
  municipalityId?: number;
  wardId?: number;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// ==================== Language Types ====================

export type Language = "en" | "ne";

export interface LocalizedString {
  en: string;
  ne?: string;
}

// ==================== Utility Types ====================

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
