import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsInt,
  IsEnum,
  ValidateNested,
  Min,
  IsEmail,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

// Enum matching Prisma schema
export enum OfficeType {
  DISTRICT_ADMINISTRATION_OFFICE = 'DISTRICT_ADMINISTRATION_OFFICE',
  LAND_REVENUE_OFFICE = 'LAND_REVENUE_OFFICE',
  DISTRICT_EDUCATION_OFFICE = 'DISTRICT_EDUCATION_OFFICE',
  TRANSPORT_MANAGEMENT_OFFICE = 'TRANSPORT_MANAGEMENT_OFFICE',
  DRIVING_LICENSE_OFFICE = 'DRIVING_LICENSE_OFFICE',
  MUNICIPALITY_OFFICE = 'MUNICIPALITY_OFFICE',
  RURAL_MUNICIPALITY_OFFICE = 'RURAL_MUNICIPALITY_OFFICE',
  WARD_OFFICE = 'WARD_OFFICE',
  PASSPORT_OFFICE = 'PASSPORT_OFFICE',
  IMMIGRATION_OFFICE = 'IMMIGRATION_OFFICE',
  OFFICE_OF_COMPANY_REGISTRAR = 'OFFICE_OF_COMPANY_REGISTRAR',
  COTTAGE_SMALL_INDUSTRY_OFFICE = 'COTTAGE_SMALL_INDUSTRY_OFFICE',
  INLAND_REVENUE_OFFICE = 'INLAND_REVENUE_OFFICE',
  LABOUR_OFFICE = 'LABOUR_OFFICE',
}

// Location assignment DTOs
export class LocationAssignmentDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  wardId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  municipalityId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  districtId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  provinceId?: number;
}

// Create Office DTO
export class CreateOfficeDto {
  @IsString()
  officeId: string;

  @IsString()
  categoryId: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  nameNepali?: string;

  @IsEnum(OfficeType)
  type: OfficeType;

  @IsString()
  address: string;

  @IsString()
  @IsOptional()
  addressNepali?: string;

  @IsString()
  @IsOptional()
  contact?: string;

  @IsString()
  @IsOptional()
  alternateContact?: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required for sending admin credentials' })
  email: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  mapUrl?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photoUrls?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  facilities?: string[];

  @IsString()
  @IsOptional()
  nearestLandmark?: string;

  @IsString()
  @IsOptional()
  publicTransport?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  // Location assignments
  @ValidateNested()
  @Type(() => LocationAssignmentDto)
  @IsOptional()
  location?: LocationAssignmentDto;
}

// Update Office DTO - all fields optional
export class UpdateOfficeDto extends PartialType(CreateOfficeDto) {}

// Query params for listing offices
export class AdminOfficeQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number;

  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum(OfficeType)
  @IsOptional()
  type?: OfficeType;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isActive?: boolean;

  // Location filters
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  provinceId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  districtId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  municipalityId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  wardId?: number;
}
