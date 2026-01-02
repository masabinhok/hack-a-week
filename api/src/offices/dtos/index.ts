import { IsEnum, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';

// OfficeType enum values based on schema
export enum OfficeType {
  WARD = 'WARD',
  MUNICIPALITY = 'MUNICIPALITY',
  DISTRICT = 'DISTRICT',
  PROVINCE = 'PROVINCE',
  FEDERAL = 'FEDERAL',
  DEPARTMENT = 'DEPARTMENT',
  MINISTRY = 'MINISTRY',
  COURT = 'COURT',
  POLICE = 'POLICE',
  BANK = 'BANK',
  PASSPORT = 'PASSPORT',
  IMMIGRATION = 'IMMIGRATION',
  LAND_REVENUE = 'LAND_REVENUE',
  OTHER = 'OTHER',
}

export class FindOfficesByLocationDto {
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

export class FindOfficesByTypeDto {
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

export class SearchOfficesDto {
  @IsString()
  @Transform(({ value }) => value?.trim())
  q: string;

  @IsOptional()
  @IsEnum(OfficeType)
  @Transform(({ value }) => value?.toUpperCase())
  type?: OfficeType;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;
}
