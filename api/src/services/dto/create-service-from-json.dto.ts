import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsEnum,
  IsArray,
  ValidateNested,
  IsNumber,
  IsUrl,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Priority, OfficeType, DocType, Currency, FeeType, WeekDay, LocationType } from 'src/generated/prisma/client';

// ========== Category DTOs (ordered by dependency) ==========
export class CategoryWhereDto {
  @IsString()
  slug: string;
}

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  color?: string;
}

export class CategoryConnectOrCreateDto {
  @ValidateNested()
  @Type(() => CategoryWhereDto)
  where: CategoryWhereDto;

  @ValidateNested()
  @Type(() => CreateCategoryDto)
  create: CreateCategoryDto;
}

export class CategoryRelationDto {
  @ValidateNested()
  @Type(() => CategoryConnectOrCreateDto)
  connectOrCreate: CategoryConnectOrCreateDto;
}

export class ServiceCategoryCreateDto {
  @ValidateNested()
  @Type(() => CategoryRelationDto)
  category: CategoryRelationDto;
}

export class ServiceCategoriesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceCategoryCreateDto)
  create: ServiceCategoryCreateDto[];
}

// ========== Document DTOs ==========
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
  isMandatory: boolean;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  relatedService?: string | null;

  @IsArray()
  @IsString({ each: true })
  alternativeDocuments: string[];
}

export class StepDocumentsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStepDocumentDto)
  create: CreateStepDocumentDto[];
}

// ========== Fee DTOs ==========
export class CreateStepFeeDto {
  @IsString()
  feeId: string;

  @IsString()
  feeTitle: string;

  @IsOptional()
  @IsString()
  feeTitleNepali?: string;

  @IsNumber()
  @Min(0)
  feeAmount: number;

  @IsEnum(Currency)
  currency: Currency;

  @IsEnum(FeeType)
  feeType: FeeType;

  @IsBoolean()
  isRefundable: boolean;

  @IsOptional()
  @IsString()
  applicableCondition?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class StepFeesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStepFeeDto)
  create: CreateStepFeeDto[];
}

// ========== Time Required DTOs ==========
export class CreateTimeRequiredDto {
  @IsString()
  minimumTime: string;

  @IsString()
  maximumTime: string;

  @IsString()
  averageTime: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsBoolean()
  expeditedAvailable: boolean;

  @IsBoolean()
  workingDaysOnly: boolean;
}

export class TimeRequiredDto {
  @ValidateNested()
  @Type(() => CreateTimeRequiredDto)
  create: CreateTimeRequiredDto;
}

// ========== Working Hours DTOs ==========
export class CreateWorkingHoursDto {
  @IsEnum(WeekDay)
  day: WeekDay;

  @IsString()
  openClose: string;
}

export class WorkingHoursDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWorkingHoursDto)
  create: CreateWorkingHoursDto[];
}

// ========== Authority DTOs ==========
export class CreateAuthorityDto {
  @IsString()
  position: string;

  @IsOptional()
  @IsString()
  positionNepali?: string;

  @IsString()
  department: string;

  @IsString()
  contactNumber: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  complaintProcess?: string;

  @IsBoolean()
  isResp: boolean;
}

export class AuthoritiesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAuthorityDto)
  create: CreateAuthorityDto[];
}

// ========== Service Step DTOs ==========
export class CreateServiceStepDto {
  @IsInt()
  @Min(1)
  step: number;

  @IsString()
  stepTitle: string;

  @IsString()
  stepDescription: string;

  @IsArray()
  @IsEnum(OfficeType, { each: true })
  officeTypes: OfficeType[];

  @IsOptional()
  @IsEnum(LocationType)
  locationType?: LocationType;

  @IsBoolean()
  requiresAppointment: boolean;

  @IsOptional()
  @IsBoolean()
  isOnline?: boolean;

  @IsOptional()
  @IsUrl()
  onlineFormUrl?: string;


  @ValidateNested()
  @Type(() => StepDocumentsDto)
  documentsRequired: StepDocumentsDto;

  @ValidateNested()
  @Type(() => StepFeesDto)
  totalFees: StepFeesDto;

  @ValidateNested()
  @Type(() => TimeRequiredDto)
  timeRequired: TimeRequiredDto;

  @ValidateNested()
  @Type(() => WorkingHoursDto)
  workingHours: WorkingHoursDto;

  @ValidateNested()
  @Type(() => AuthoritiesDto)
  responsibleAuthorities: AuthoritiesDto;

  @ValidateNested()
  @Type(() => AuthoritiesDto)
  complaintAuthorities: AuthoritiesDto;
}

export class ServiceStepsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateServiceStepDto)
  create: CreateServiceStepDto[];
}

// ========== Detailed Procedure DTOs ==========
export class LegalReferenceDto {
  @IsString()
  lawName: string;

  @IsString()
  section: string;

  @IsOptional()
  @IsString()
  url?: string;
}

export class FaqDto {
  @IsString()
  question: string;

  @IsString()
  answer: string;
}

export class CommonIssueDto {
  @IsString()
  issue: string;

  @IsString()
  solution: string;
}

export class CreateDetailedProcDto {
  @IsString()
  overview: string;

  @IsOptional()
  @IsString()
  overviewNepali?: string;

  @IsArray()
  @IsString({ each: true })
  stepByStepGuide: string[];

  @IsArray()
  @IsString({ each: true })
  importantNotes: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LegalReferenceDto)
  legalReferences: LegalReferenceDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FaqDto)
  faqs: FaqDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CommonIssueDto)
  commonIssues: CommonIssueDto[];
}

export class DetailedProcDto {
  @ValidateNested()
  @Type(() => CreateDetailedProcDto)
  create: CreateDetailedProcDto;
}

// ========== Metadata DTOs ==========
export class CreateMetadataDto {
  @IsString()
  lastUpdated: string;

  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  @IsString()
  dataSource?: string;

  @IsOptional()
  @IsString()
  verifiedBy?: string;
}

export class MetadataDto {
  @ValidateNested()
  @Type(() => CreateMetadataDto)
  create: CreateMetadataDto;
}

// ========== Main Service DTO ==========
export class CreateServiceFromJsonDto {
  @IsString()
  serviceId: string;

  @IsOptional()
  @IsString()
  parentId?: string | null;

  @IsInt()
  @Min(0)
  level: number;

  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsBoolean()
  isOnlineEnabled: boolean;

  @IsOptional()
  @IsUrl()
  onlinePortalUrl?: string | null;

  @IsOptional()
  @IsString()
  eligibility?: string;

  @IsOptional()
  @IsString()
  validityPeriod?: string;

  @ValidateNested()
  @Type(() => ServiceCategoriesDto)
  categories: ServiceCategoriesDto;

  @ValidateNested()
  @Type(() => ServiceStepsDto)
  serviceSteps: ServiceStepsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => DetailedProcDto)
  detailedProc?: DetailedProcDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => MetadataDto)
  metadata?: MetadataDto;
}
