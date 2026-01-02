const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export interface Service {
  id: string;
  serviceId: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  eligibility: string;
  validityPeriod?: string;
  createdAt: string;
  updatedAt: string;
  subServices?: SubService[];
}

export interface SubService {
  id: string;
  serviceId: string;
  name: string;
  slug: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  isOnlineEnabled: boolean;
  onlinePortalUrl?: string;
  createdAt: string;
  updatedAt: string;
  serviceSteps?: ServiceStep[];
  detailedProc?: DetailedProc;
  offices?: SubServiceOnOffice[];
}

export interface ServiceStep {
  id: string;
  subServiceId: string;
  step: number;
  stepTitle: string;
  stepDescription: string;
  officeType: string;
  requiresAppointment: boolean;
  documentsRequired: StepDocument[];
  totalFees: StepFee[];
  timeRequired?: StepTimeRequired;
  workingHours: WorkingHours[];
  responsibleAuthorities: StepAuthority[];
  complaintAuthorities: StepAuthority[];
}

export interface StepDocument {
  id: number;
  serviceStepId: string;
  docId: string;
  name: string;
  nameNepali: string;
  type: string;
  quantity: number;
  format: string;
  isMandatory: boolean;
  notes?: string;
  relatedService?: string;
  alternativeDocuments: string[];
}

export interface StepFee {
  id: number;
  serviceStepId: string;
  feeId: string;
  feeTitle: string;
  feeTitleNepali?: string;
  feeAmount: number;
  currency: string;
  feeType: string;
  isRefundable: boolean;
  applicableCondition?: string;
  notes?: string;
}

export interface StepTimeRequired {
  id: number;
  serviceStepId: string;
  minimumTime: string;
  maximumTime: string;
  averageTime: string;
  remarks?: string;
  expeditedAvailable: boolean;
  workingDaysOnly: boolean;
}

export interface WorkingHours {
  id: number;
  serviceStepId: string;
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
  complaintProcess?: string;
  isResp: boolean;
}

export interface DetailedProc {
  id: string;
  subServiceId: string;
  overview: string;
  overviewNepali?: string;
  stepByStepGuide: string[];
  importantNotes: string[];
  legalReferences: Array<{ lawName: string; section: string; url: string }>;
  faqs: Array<{ question: string; answer: string }>;
  commonIssues: Array<{ issue: string; solution: string }>;
}

export interface SubServiceOnOffice {
  id: string;
  subServiceId: string;
  officeId: string;
  locationBased: boolean;
  fetchFromAPI: boolean;
  apiEndpoint?: string;
  remarks?: string;
}

export interface Province {
  id: number;
  name: string;
  nameNep?: string;
  slug: string;
}

export interface District {
  id: number;
  provinceId: number;
  name: string;
  nameNep?: string;
  slug: string;
}

export interface Municipality {
  id: number;
  districtId: number;
  name: string;
  nameNep?: string;
  slug: string;
  type: string;
}

export interface Ward {
  id: number;
  municipalityId: number;
  wardNumber: number;
}

export async function getAllServices(): Promise<Service[]> {
  const res = await fetch(`${API_BASE_URL}/services`, {
    next: { revalidate: 3600 }
  });
  if (!res.ok) throw new Error('Failed to fetch services');
  const json = await res.json();
  return json.data || json;
}

export async function getServiceBySlug(slug: string): Promise<Service> {
  const res = await fetch(`${API_BASE_URL}/services/${slug}`, {
    next: { revalidate: 3600 }
  });
  if (!res.ok) throw new Error('Failed to fetch service');
  const json = await res.json();
  return json.data || json;
}

export async function getSubServiceBySlug(slug: string): Promise<SubService> {
  const res = await fetch(`${API_BASE_URL}/sub-services/${slug}`, {
    next: { revalidate: 3600 }
  });
  if (!res.ok) throw new Error('Failed to fetch sub-service');
  const json = await res.json();
  return json.data || json;
}

export async function getAllProvinces(): Promise<Province[]> {
  const res = await fetch(`${API_BASE_URL}/locations/provinces`, {
    next: { revalidate: 86400 }
  });
  if (!res.ok) throw new Error('Failed to fetch provinces');
  const json = await res.json();
  return json.data || json;
}

export async function getDistrictsByProvince(provinceId: number): Promise<District[]> {
  const res = await fetch(`${API_BASE_URL}/locations/provinces/${provinceId}/districts`, {
    next: { revalidate: 86400 }
  });
  if (!res.ok) throw new Error('Failed to fetch districts');
  const json = await res.json();
  return json.data || json;
}

export async function getMunicipalitiesByDistrict(districtId: number): Promise<Municipality[]> {
  const res = await fetch(`${API_BASE_URL}/locations/districts/${districtId}/municipalities`, {
    next: { revalidate: 86400 }
  });
  if (!res.ok) throw new Error('Failed to fetch municipalities');
  const json = await res.json();
  return json.data || json;
}

export async function getWardsByMunicipality(municipalityId: number): Promise<Ward[]> {
  const res = await fetch(`${API_BASE_URL}/locations/municipalities/${municipalityId}/wards`, {
    next: { revalidate: 86400 }
  });
  if (!res.ok) throw new Error('Failed to fetch wards');
  const json = await res.json();
  return json.data || json;
}
