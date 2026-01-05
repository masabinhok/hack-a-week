// ============================================
// Admin API Client
// ============================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | undefined>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;
    
    let url = `${this.baseUrl}${endpoint}`;
    
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    const response = await fetch(url, {
      ...fetchOptions,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async login(username: string, password: string) {
    return this.request('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async logout() {
    return this.request('/admin/logout', { method: 'POST' });
  }

  async getProfile() {
    return this.request<{ data: User }>('/admin/profile');
  }

  async refreshToken() {
    return this.request('/admin/refresh', { method: 'POST' });
  }

  // Services CRUD
  async getServices(params?: {
    page?: number;
    limit?: number;
    search?: string;
    parentId?: string | null;
  }) {
    return this.request<ServicesResponse>('/admin/services', { params: params as any });
  }

  async getService(id: string) {
    return this.request<ServiceDetail>(`/admin/services/${id}`);
  }

  async createService(data: CreateServiceData) {
    return this.request<{ message: string; data: ServiceDetail }>('/admin/services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateService(id: string, data: Partial<CreateServiceData>) {
    return this.request<{ message: string; data: ServiceDetail }>(`/admin/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteService(id: string) {
    return this.request<{ message: string }>(`/admin/services/${id}`, {
      method: 'DELETE',
    });
  }

  async getServiceStats() {
    return this.request<ServiceStats>('/admin/services/stats');
  }

  async getCategories() {
    return this.request<Category[]>('/admin/services/categories');
  }

  // Offices CRUD
  async getOffices(params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    categoryId?: string;
    isActive?: boolean;
    provinceId?: number;
    districtId?: number;
    municipalityId?: number;
    wardId?: number;
  }) {
    return this.request<OfficesResponse>('/admin/offices', { params: params as any });
  }

  async getOffice(id: string) {
    return this.request<OfficeDetail>(`/admin/offices/${id}`);
  }

  async createOffice(data: CreateOfficeData) {
    return this.request<CreateOfficeResponse>('/admin/offices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOffice(id: string, data: Partial<CreateOfficeData>) {
    return this.request<{ message: string; data: OfficeDetail }>(`/admin/offices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteOffice(id: string) {
    return this.request<{ message: string }>(`/admin/offices/${id}`, {
      method: 'DELETE',
    });
  }

  async resetOfficeAdminPassword(officeId: string) {
    return this.request<ResetPasswordResponse>(`/admin/offices/${officeId}/reset-password`, {
      method: 'POST',
    });
  }

  async getOfficeStats() {
    return this.request<OfficeStats>('/admin/offices/stats');
  }

  async getOfficeCategories() {
    return this.request<OfficeCategory[]>('/admin/offices/categories');
  }
}

export const api = new ApiClient(API_BASE_URL);

// Types
export interface User {
  id: string;
  username: string;
  role: 'ADMIN' | 'OFFICE_ADMIN' | 'USER';
  isActive: boolean;
  // Office admin's managed office (only for OFFICE_ADMIN role)
  managedOffice?: {
    id: string;
    officeId: string;
    name: string;
    nameNepali?: string;
    type: string;
    address: string;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface ServiceStats {
  totalServices: number;
  rootServices: number;
  leafServices: number;
  totalSteps: number;
}

export interface Service {
  id: string;
  serviceId: string;
  parentId?: string | null;
  level: number;
  name: string;
  slug: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  isOnlineEnabled: boolean;
  onlinePortalUrl?: string;
  eligibility?: string;
  validityPeriod?: string;
  childrenCount: number;
  stepsCount: number;
  parent?: { id: string; name: string; slug: string } | null;
  categories: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface ServiceDetail extends Service {
  children: Service[];
  serviceSteps: ServiceStep[];
  detailedProc?: DetailedProc;
  metadata?: ServiceMetadata;
}

export interface ServiceStep {
  id: string;
  serviceId: string;
  step: number;
  stepTitle: string;
  stepDescription: string;
  officeTypes: string[];
  requiresAppointment: boolean;
  isOnline: boolean;
  onlineFormUrl?: string;
  documentsRequired: StepDocument[];
  totalFees: StepFee[];
  timeRequired?: StepTime;
  workingHours: WorkingHours[];
  responsibleAuthorities: StepAuthority[];
  complaintAuthorities: StepAuthority[];
}

export interface StepDocument {
  id: number;
  docId: string;
  name: string;
  nameNepali: string;
  type: string;
  quantity: number;
  format: string;
  isMandatory: boolean;
  notes?: string;
}

export interface StepFee {
  id: number;
  feeId: string;
  feeTitle: string;
  feeTitleNepali?: string;
  feeAmount: number;
  currency: string;
  feeType: string;
  isRefundable: boolean;
  notes?: string;
}

export interface StepTime {
  minimumTime: string;
  maximumTime: string;
  averageTime: string;
  remarks?: string;
  expeditedAvailable: boolean;
}

export interface WorkingHours {
  day: string;
  openClose: string;
}

export interface StepAuthority {
  id: number;
  position: string;
  positionNepali?: string;
  department: string;
  contactNumber: string;
  email?: string;
}

export interface DetailedProc {
  id: string;
  overview: string;
  overviewNepali?: string;
  stepByStepGuide: string[];
  importantNotes: string[];
  legalReferences: any[];
  faqs: any[];
  commonIssues: any[];
}

export interface ServiceMetadata {
  id: string;
  version?: string;
  dataSource?: string;
  verifiedBy?: string;
  lastUpdated: string;
}

export interface ServicesResponse {
  data: Service[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Office Types
export interface Office {
  id: string;
  officeId: string;
  categoryId: string;
  name: string;
  nameNepali?: string;
  type: string;
  address: string;
  addressNepali?: string;
  contact?: string;
  alternateContact?: string;
  email?: string;
  website?: string;
  mapUrl?: string;
  photoUrls: string[];
  facilities: string[];
  nearestLandmark?: string;
  publicTransport?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: OfficeCategory;
  location?: OfficeLocation;
}

export interface OfficeCategory {
  id: string;
  name: string;
  description?: string;
}

export interface OfficeLocation {
  wardId?: number;
  wardNumber?: number;
  municipalityId?: number;
  municipalityName?: string;
  districtId?: number;
  districtName?: string;
  provinceId?: number;
  provinceName?: string;
  level: 'ward' | 'municipality' | 'district' | 'province';
}

export interface OfficeDetail extends Office {
  ratings?: {
    averageRating: number;
    totalReviews: number;
  };
}

export interface OfficesResponse {
  data: Office[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface OfficeStats {
  totalOffices: number;
  activeOffices: number;
  inactiveOffices: number;
  byType: { type: string; count: number }[];
  byCategory: { categoryId: string; categoryName: string; count: number }[];
}

export interface CreateOfficeData {
  officeId: string;
  categoryId: string;
  name: string;
  nameNepali?: string;
  type: string;
  address: string;
  addressNepali?: string;
  contact?: string;
  alternateContact?: string;
  email: string; // Required - admin credentials will be sent to this email
  website?: string;
  mapUrl?: string;
  photoUrls?: string[];
  facilities?: string[];
  nearestLandmark?: string;
  publicTransport?: string;
  isActive?: boolean;
  location?: {
    wardId?: number;
    municipalityId?: number;
    districtId?: number;
    provinceId?: number;
  };
}

export interface CreateServiceData {
  serviceId: string;
  parentId?: string | null;
  level?: number;
  name: string;
  slug: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  isOnlineEnabled?: boolean;
  onlinePortalUrl?: string;
  eligibility?: string;
  validityPeriod?: string;
  categoryIds?: string[];
  steps?: CreateStepData[];
  detailedProc?: CreateDetailedProcData;
  metadata?: CreateMetadataData;
}

export interface CreateStepData {
  step: number;
  stepTitle: string;
  stepDescription: string;
  officeTypes?: string[];
  requiresAppointment?: boolean;
  isOnline?: boolean;
  onlineFormUrl?: string;
  documentsRequired?: CreateDocumentData[];
  totalFees?: CreateFeeData[];
  timeRequired?: CreateTimeData;
  workingHours?: CreateWorkingHoursData[];
  responsibleAuthorities?: CreateAuthorityData[];
  complaintAuthorities?: CreateAuthorityData[];
}

export interface CreateDocumentData {
  docId: string;
  name: string;
  nameNepali: string;
  type: string;
  quantity: number;
  format: string;
  isMandatory?: boolean;
  notes?: string;
}

export interface CreateFeeData {
  feeId: string;
  feeTitle: string;
  feeTitleNepali?: string;
  feeAmount: number;
  currency?: string;
  feeType: string;
  isRefundable?: boolean;
  notes?: string;
}

export interface CreateTimeData {
  minimumTime: string;
  maximumTime: string;
  averageTime: string;
  remarks?: string;
  expeditedAvailable?: boolean;
}

export interface CreateWorkingHoursData {
  day: string;
  openClose: string;
}

export interface CreateAuthorityData {
  position: string;
  positionNepali?: string;
  department: string;
  contactNumber: string;
  email?: string;
  isResp: boolean;
}

export interface CreateDetailedProcData {
  overview?: string;
  overviewNepali?: string;
  stepByStepGuide?: string[];
  importantNotes?: string[];
  legalReferences?: any[];
  faqs?: any[];
  commonIssues?: any[];
}

export interface CreateMetadataData {
  version?: string;
  dataSource?: string;
  verifiedBy?: string;
}

// Constants
export const OFFICE_TYPES = [
  { value: 'DISTRICT_ADMINISTRATION_OFFICE', label: 'District Administration Office (DAO)' },
  { value: 'LAND_REVENUE_OFFICE', label: 'Land Revenue Office' },
  { value: 'DISTRICT_EDUCATION_OFFICE', label: 'District Education Office' },
  { value: 'TRANSPORT_MANAGEMENT_OFFICE', label: 'Transport Management Office' },
  { value: 'DRIVING_LICENSE_OFFICE', label: 'Driving License Office' },
  { value: 'MUNICIPALITY_OFFICE', label: 'Municipality Office' },
  { value: 'RURAL_MUNICIPALITY_OFFICE', label: 'Rural Municipality Office' },
  { value: 'WARD_OFFICE', label: 'Ward Office' },
  { value: 'PASSPORT_OFFICE', label: 'Passport Office' },
  { value: 'IMMIGRATION_OFFICE', label: 'Immigration Office' },
  { value: 'OFFICE_OF_COMPANY_REGISTRAR', label: 'Office of Company Registrar' },
  { value: 'COTTAGE_SMALL_INDUSTRY_OFFICE', label: 'Cottage & Small Industry Office' },
  { value: 'INLAND_REVENUE_OFFICE', label: 'Inland Revenue Office (IRD)' },
  { value: 'LABOUR_OFFICE', label: 'Labour Office' },
];

export const DOC_TYPES = [
  { value: 'ORIGINAL', label: 'Original' },
  { value: 'PHOTOCOPY', label: 'Photocopy' },
  { value: 'PHOTOGRAPH', label: 'Photograph' },
  { value: 'PRINTOUT', label: 'Printout' },
  { value: 'NOTARIZED', label: 'Notarized' },
  { value: 'CERTIFIED_COPY', label: 'Certified Copy' },
];

export const FEE_TYPES = [
  { value: 'GOVERNMENT', label: 'Government Fee' },
  { value: 'SERVICE', label: 'Service Charge' },
  { value: 'PENALTY', label: 'Penalty' },
  { value: 'TAX', label: 'Tax' },
];

export const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low', color: 'bg-gray-100 text-gray-700' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-blue-100 text-blue-700' },
  { value: 'HIGH', label: 'High', color: 'bg-orange-100 text-orange-700' },
  { value: 'URGENT', label: 'Urgent', color: 'bg-red-100 text-red-700' },
];

export const WEEKDAYS = [
  { value: 'SUNDAY', label: 'Sunday' },
  { value: 'MONDAY', label: 'Monday' },
  { value: 'TUESDAY', label: 'Tuesday' },
  { value: 'WEDNESDAY', label: 'Wednesday' },
  { value: 'THURSDAY', label: 'Thursday' },
  { value: 'FRIDAY', label: 'Friday' },
  { value: 'SATURDAY', label: 'Saturday' },
];

// Office Admin Credentials Response Types
export interface OfficeAdminCredentials {
  username: string;
  password: string;
}

export interface CreateOfficeResponse {
  message: string;
  data: OfficeDetail;
  officeAdminCredentials: OfficeAdminCredentials;
  emailSent?: boolean;
  createdBy?: string;
}

export interface ResetPasswordResponse {
  message: string;
  credentials: OfficeAdminCredentials;
  emailSent?: boolean;
  resetBy?: string;
}
