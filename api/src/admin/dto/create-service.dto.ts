import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsInt,
  IsEnum,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

// Enums matching Prisma schema
enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

enum Currency {
  NPR = 'NPR',
  USD = 'USD',
}

enum FeeType {
  GOVERNMENT = 'GOVERNMENT',
  SERVICE = 'SERVICE',
  PENALTY = 'PENALTY',
  TAX = 'TAX',
}

enum DocType {
  ORIGINAL = 'ORIGINAL',
  PHOTOCOPY = 'PHOTOCOPY',
  PHOTOGRAPH = 'PHOTOGRAPH',
  PRINTOUT = 'PRINTOUT',
  NOTARIZED = 'NOTARIZED',
  CERTIFIED_COPY = 'CERTIFIED_COPY',
}

enum WeekDay {
  SUNDAY = 'SUNDAY',
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
}

// Nested DTOs for step details
export class CreateStepDocumentDto {
  @IsString()
  docId: string;

  @IsString()
  name: string;

  @IsString()
  nameNepali: string;

  @IsEnum(DocType)
  type: DocType;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsString()
  format: string;

  @IsBoolean()
  @IsOptional()
  isMandatory?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  relatedService?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  alternativeDocuments?: string[];
}

export class CreateStepFeeDto {
  @IsString()
  feeId: string;

  @IsString()
  feeTitle: string;

  @IsString()
  @IsOptional()
  feeTitleNepali?: string;

  @IsNumber()
  @Min(0)
  feeAmount: number;

  @IsEnum(Currency)
  @IsOptional()
  currency?: Currency;

  @IsEnum(FeeType)
  feeType: FeeType;

  @IsBoolean()
  @IsOptional()
  isRefundable?: boolean;

  @IsString()
  @IsOptional()
  applicableCondition?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateStepTimeDto {
  @IsString()
  minimumTime: string;

  @IsString()
  maximumTime: string;

  @IsString()
  averageTime: string;

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsBoolean()
  @IsOptional()
  expeditedAvailable?: boolean;

  @IsBoolean()
  @IsOptional()
  workingDaysOnly?: boolean;
}

export class CreateStepAuthorityDto {
  @IsString()
  position: string;

  @IsString()
  @IsOptional()
  positionNepali?: string;

  @IsString()
  department: string;

  @IsString()
  contactNumber: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  complaintProcess?: string;

  @IsBoolean()
  isResp: boolean;
}

export class CreateWorkingHoursDto {
  @IsEnum(WeekDay)
  day: WeekDay;

  @IsString()
  openClose: string;
}

// Service Step DTO
export class CreateServiceStepDto {
  @IsInt()
  @Min(1)
  step: number;

  @IsString()
  stepTitle: string;

  @IsString()
  stepDescription: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  officeCategoryIds?: string[];

  @IsBoolean()
  @IsOptional()
  requiresAppointment?: boolean;

  @IsBoolean()
  @IsOptional()
  isOnline?: boolean;

  @IsString()
  @IsOptional()
  onlineFormUrl?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStepDocumentDto)
  @IsOptional()
  documentsRequired?: CreateStepDocumentDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStepFeeDto)
  @IsOptional()
  totalFees?: CreateStepFeeDto[];

  @ValidateNested()
  @Type(() => CreateStepTimeDto)
  @IsOptional()
  timeRequired?: CreateStepTimeDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWorkingHoursDto)
  @IsOptional()
  workingHours?: CreateWorkingHoursDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStepAuthorityDto)
  @IsOptional()
  responsibleAuthorities?: CreateStepAuthorityDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStepAuthorityDto)
  @IsOptional()
  complaintAuthorities?: CreateStepAuthorityDto[];
}

// Detailed Procedure DTO
export class CreateDetailedProcDto {
  @IsString()
  overview: string;

  @IsString()
  @IsOptional()
  overviewNepali?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  stepByStepGuide?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  importantNotes?: string[];

  @IsArray()
  @IsOptional()
  legalReferences?: any[];

  @IsArray()
  @IsOptional()
  faqs?: any[];

  @IsArray()
  @IsOptional()
  commonIssues?: any[];
}

// Service Metadata DTO
export class CreateServiceMetadataDto {
  @IsString()
  @IsOptional()
  version?: string;

  @IsString()
  @IsOptional()
  dataSource?: string;

  @IsString()
  @IsOptional()
  verifiedBy?: string;
}

// Main Service DTO
export class CreateServiceDto {
  @IsString()
  serviceId: string;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsInt()
  @IsOptional()
  level?: number;

  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @IsBoolean()
  @IsOptional()
  isOnlineEnabled?: boolean;

  @IsString()
  @IsOptional()
  onlinePortalUrl?: string;

  @IsString()
  @IsOptional()
  eligibility?: string;

  @IsString()
  @IsOptional()
  validityPeriod?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  categoryIds?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateServiceStepDto)
  @IsOptional()
  steps?: CreateServiceStepDto[];

  @ValidateNested()
  @Type(() => CreateDetailedProcDto)
  @IsOptional()
  detailedProc?: CreateDetailedProcDto;

  @ValidateNested()
  @Type(() => CreateServiceMetadataDto)
  @IsOptional()
  metadata?: CreateServiceMetadataDto;
}

export class UpdateServiceDto {
  @IsString()
  @IsOptional()
  serviceId?: string;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsInt()
  @IsOptional()
  level?: number;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @IsBoolean()
  @IsOptional()
  isOnlineEnabled?: boolean;

  @IsString()
  @IsOptional()
  onlinePortalUrl?: string;

  @IsString()
  @IsOptional()
  eligibility?: string;

  @IsString()
  @IsOptional()
  validityPeriod?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  categoryIds?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateServiceStepDto)
  @IsOptional()
  steps?: CreateServiceStepDto[];

  @ValidateNested()
  @Type(() => CreateDetailedProcDto)
  @IsOptional()
  detailedProc?: CreateDetailedProcDto;

  @ValidateNested()
  @Type(() => CreateServiceMetadataDto)
  @IsOptional()
  metadata?: CreateServiceMetadataDto;
}
