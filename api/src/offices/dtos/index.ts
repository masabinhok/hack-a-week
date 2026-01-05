import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
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

export class FindOfficesByCategoryDto extends PaginationDto {
  @IsString()
  @Transform(({ value }) => value?.trim())
  categoryId: string;

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
  @IsString()
  @Transform(({ value }) => value?.trim())
  categoryId?: string;
}
