import { IsEnum, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';

// Base pagination DTO
export class PaginationDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;
}

// OfficeType enum values aligned with Prisma schema
export enum OfficeType {
  // District Level - Core Services
  DISTRICT_ADMINISTRATION_OFFICE = 'DISTRICT_ADMINISTRATION_OFFICE',
  LAND_REVENUE_OFFICE = 'LAND_REVENUE_OFFICE',
  DISTRICT_EDUCATION_OFFICE = 'DISTRICT_EDUCATION_OFFICE',
  // Transport Services
  TRANSPORT_MANAGEMENT_OFFICE = 'TRANSPORT_MANAGEMENT_OFFICE',
  DRIVING_LICENSE_OFFICE = 'DRIVING_LICENSE_OFFICE',
  // Local Government
  MUNICIPALITY_OFFICE = 'MUNICIPALITY_OFFICE',
  RURAL_MUNICIPALITY_OFFICE = 'RURAL_MUNICIPALITY_OFFICE',
  // Ward Level
  WARD_OFFICE = 'WARD_OFFICE',
  // Travel & Immigration
  PASSPORT_OFFICE = 'PASSPORT_OFFICE',
  IMMIGRATION_OFFICE = 'IMMIGRATION_OFFICE',
  // Business Registration
  OFFICE_OF_COMPANY_REGISTRAR = 'OFFICE_OF_COMPANY_REGISTRAR',
  COTTAGE_SMALL_INDUSTRY_OFFICE = 'COTTAGE_SMALL_INDUSTRY_OFFICE',
  INLAND_REVENUE_OFFICE = 'INLAND_REVENUE_OFFICE',
  // Social Services
  LABOUR_OFFICE = 'LABOUR_OFFICE',
}

export class FindOfficesByLocationDto extends PaginationDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  provinceId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  districtId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  municipalityId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  wardId?: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  locationCode?: string; // P-DD-MMM-WWWW format
}

export class FindOfficesForServiceDto extends PaginationDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  provinceId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  districtId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  municipalityId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  wardId?: number;
}

export class FindOfficesByTypeDto extends PaginationDto {
  @IsEnum(OfficeType)
  @Transform(({ value }) => value?.toUpperCase())
  officeType: OfficeType;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  provinceId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  districtId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  municipalityId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  wardId?: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  locationCode?: string;
}

export class SearchOfficesDto extends PaginationDto {
  @IsString()
  @Transform(({ value }) => value?.trim())
  q: string;

  @IsOptional()
  @IsEnum(OfficeType)
  @Transform(({ value }) => value?.toUpperCase())
  type?: OfficeType;
}
