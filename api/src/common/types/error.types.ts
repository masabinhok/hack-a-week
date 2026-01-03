// ============================================
// FILE: src/common/types/error.types.ts
// DESCRIPTION: Shared error types for bilingual error handling
// ============================================

export enum ErrorCode {
  // General errors
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  
  // Resource-specific errors
  SERVICE_NOT_FOUND = 'SERVICE_NOT_FOUND',
  CATEGORY_NOT_FOUND = 'CATEGORY_NOT_FOUND',
  OFFICE_NOT_FOUND = 'OFFICE_NOT_FOUND',
  LOCATION_NOT_FOUND = 'LOCATION_NOT_FOUND',
  
  // Database errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  DATABASE_CONNECTION_ERROR = 'DATABASE_CONNECTION_ERROR',
  
  // External service errors
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  
  // File errors
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
}

export interface BilingualMessage {
  en: string;
  ne: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
  messageNepali?: string;
  errorCode: ErrorCode;
  statusCode: number;
  timestamp: string;
  path?: string;
  details?: Record<string, any>;
}

export interface ValidationErrorDetail {
  field: string;
  message: BilingualMessage;
  constraint?: string;
}
