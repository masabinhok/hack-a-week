import { IsString, IsOptional, IsIn, IsObject } from 'class-validator';

export class SaveServiceDto {
  @IsString()
  serviceId: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateSavedServiceDto {
  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsIn(['saved', 'in-progress', 'completed'])
  status?: string;

  @IsOptional()
  @IsObject()
  progress?: object;
}

export class ContributionDto {
  @IsOptional()
  @IsString()
  serviceId?: string;

  @IsOptional()
  @IsString()
  officeId?: string;

  @IsIn(['feedback', 'correction', 'suggestion'])
  type: string;

  @IsString()
  content: string;
}
