// ============================================
// FILE: lib/error-types.ts
// DESCRIPTION: Frontend error types matching backend structure
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
  
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
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

export interface ApiError extends Error {
  errorCode: ErrorCode;
  statusCode: number;
  messageNepali?: string;
  details?: Record<string, any>;
}
