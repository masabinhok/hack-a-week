import {
  IsString,
  IsOptional,
  IsEnum,
  MinLength,
  MaxLength,
} from 'class-validator';

export enum ServiceRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export class CreateServiceRequestDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  serviceName: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  serviceDescription?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  justification?: string;

  @IsOptional()
  @IsString()
  officeId?: string;
}

export class ReviewServiceRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reviewNotes?: string;
}

export class RejectServiceRequestDto {
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  rejectionReason: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reviewNotes?: string;
}

export class ServiceRequestQueryDto {
  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsEnum(ServiceRequestStatus)
  status?: ServiceRequestStatus;

  @IsOptional()
  @IsString()
  officeId?: string;
}
