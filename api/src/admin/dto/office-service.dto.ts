import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsObject,
} from 'class-validator';

export enum OfficeServiceStatus {
  CLAIMED = 'CLAIMED',
  PENDING = 'PENDING',
  REVOKED = 'REVOKED',
}

export class ClaimServiceDto {
  @IsString()
  serviceId: string;

  @IsOptional()
  @IsString()
  customDescription?: string;

  @IsOptional()
  @IsObject()
  customFees?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  customRequirements?: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateOfficeServiceDto {
  @IsOptional()
  @IsString()
  customDescription?: string;

  @IsOptional()
  @IsObject()
  customFees?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  customRequirements?: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}

export class OfficeServiceQueryDto {
  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsEnum(OfficeServiceStatus)
  status?: OfficeServiceStatus;
}
