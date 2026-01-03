// ============================================
// FILE: src/common/exceptions/app.exception.ts
// DESCRIPTION: Custom exception classes with bilingual support
// ============================================

import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode, BilingualMessage, ErrorResponse } from '../types/error.types';
import { getErrorMessage, createCustomMessage } from '../constants/error-messages';

export class AppException extends HttpException {
  public readonly errorCode: ErrorCode;
  public readonly messageNepali: string;
  public readonly details?: Record<string, any>;

  constructor(
    errorCode: ErrorCode,
    statusCode: HttpStatus,
    customMessage?: BilingualMessage,
    details?: Record<string, any>
  ) {
    const message = customMessage || getErrorMessage(errorCode);
    
    const response: Omit<ErrorResponse, 'timestamp' | 'path'> = {
      success: false,
      message: message.en,
      messageNepali: message.ne,
      errorCode,
      statusCode,
      details,
    };

    super(response, statusCode);
    
    this.errorCode = errorCode;
    this.messageNepali = message.ne;
    this.details = details;
  }
}

// ==================== Specific Exception Classes ====================

export class ServiceNotFoundException extends AppException {
  constructor(serviceIdentifier?: string) {
    const customMessage = serviceIdentifier
      ? createCustomMessage(
          ErrorCode.SERVICE_NOT_FOUND,
          `Service "${serviceIdentifier}" not found.`,
          `सेवा "${serviceIdentifier}" फेला परेन।`
        )
      : undefined;

    super(
      ErrorCode.SERVICE_NOT_FOUND,
      HttpStatus.NOT_FOUND,
      customMessage,
      serviceIdentifier ? { serviceIdentifier } : undefined
    );
  }
}

export class CategoryNotFoundException extends AppException {
  constructor(categoryIdentifier?: string) {
    const customMessage = categoryIdentifier
      ? createCustomMessage(
          ErrorCode.CATEGORY_NOT_FOUND,
          `Category "${categoryIdentifier}" not found.`,
          `श्रेणी "${categoryIdentifier}" फेला परेन।`
        )
      : undefined;

    super(
      ErrorCode.CATEGORY_NOT_FOUND,
      HttpStatus.NOT_FOUND,
      customMessage,
      categoryIdentifier ? { categoryIdentifier } : undefined
    );
  }
}

export class OfficeNotFoundException extends AppException {
  constructor(officeIdentifier?: string) {
    const customMessage = officeIdentifier
      ? createCustomMessage(
          ErrorCode.OFFICE_NOT_FOUND,
          `Office "${officeIdentifier}" not found.`,
          `कार्यालय "${officeIdentifier}" फेला परेन।`
        )
      : undefined;

    super(
      ErrorCode.OFFICE_NOT_FOUND,
      HttpStatus.NOT_FOUND,
      customMessage,
      officeIdentifier ? { officeIdentifier } : undefined
    );
  }
}

export class LocationNotFoundException extends AppException {
  constructor(locationType?: string, locationId?: string) {
    const identifier = locationType && locationId ? `${locationType} ${locationId}` : undefined;
    const customMessage = identifier
      ? createCustomMessage(
          ErrorCode.LOCATION_NOT_FOUND,
          `Location "${identifier}" not found.`,
          `स्थान "${identifier}" फेला परेन।`
        )
      : undefined;

    super(
      ErrorCode.LOCATION_NOT_FOUND,
      HttpStatus.NOT_FOUND,
      customMessage,
      identifier ? { locationType, locationId } : undefined
    );
  }
}

export class ValidationException extends AppException {
  constructor(validationErrors?: Record<string, any>) {
    super(
      ErrorCode.VALIDATION_ERROR,
      HttpStatus.BAD_REQUEST,
      undefined,
      validationErrors
    );
  }
}

export class DatabaseException extends AppException {
  constructor(operation?: string) {
    const customMessage = operation
      ? createCustomMessage(
          ErrorCode.DATABASE_ERROR,
          `Database error during ${operation}.`,
          `${operation} को क्रममा डाटाबेस त्रुटि भयो।`
        )
      : undefined;

    super(
      ErrorCode.DATABASE_ERROR,
      HttpStatus.INTERNAL_SERVER_ERROR,
      customMessage,
      operation ? { operation } : undefined
    );
  }
}
