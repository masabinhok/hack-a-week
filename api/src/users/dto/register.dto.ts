import {
  IsString,
  IsOptional,
  IsEmail,
  Matches,
  MinLength,
  MaxLength,
  IsInt,
  Min,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @Matches(/^(\+977)?9[78]\d{8}$/, {
    message:
      'Phone number must be a valid Nepali mobile number (e.g., 9801234567 or +9779801234567)',
  })
  phoneNumber: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName?: string;
}

export class SendOtpDto {
  @IsString()
  @Matches(/^(\+977)?9[78]\d{8}$/, {
    message:
      'Phone number must be a valid Nepali mobile number (e.g., 9801234567 or +9779801234567)',
  })
  phoneNumber: string;
}

export class VerifyOtpDto {
  @IsString()
  @Matches(/^(\+977)?9[78]\d{8}$/, {
    message: 'Phone number must be a valid Nepali mobile number',
  })
  phoneNumber: string;

  @IsString()
  @MinLength(6)
  @MaxLength(6)
  otp: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  nationalId?: string;

  // Permanent address
  @IsOptional()
  @IsInt()
  @Min(1)
  permanentProvinceId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  permanentDistrictId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  permanentMunicipalityId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  permanentWardId?: number;

  // Convenient address
  @IsOptional()
  @IsInt()
  @Min(1)
  convenientProvinceId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  convenientDistrictId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  convenientMunicipalityId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  convenientWardId?: number;
}
