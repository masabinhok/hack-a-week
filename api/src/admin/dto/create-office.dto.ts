import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsInt,
  ValidateNested,
  Min,
  IsEmail,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

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
  // officeId is now auto-generated on backend based on category abbreviation + count

  @IsString()
  categoryId: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  nameNepali?: string;

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
