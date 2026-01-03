import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateUserLocationsDto {
  // Permanent Address
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  permanentProvinceId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  permanentDistrictId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  permanentMunicipalityId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  permanentWardId?: number;

  // Convenient Address
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  convenientProvinceId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  convenientDistrictId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  convenientMunicipalityId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  convenientWardId?: number;
}
