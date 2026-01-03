// ============================================
// FILE: src/common/filters/http-exception.filter.ts
// DESCRIPTION: Global exception filter with bilingual error handling
// ============================================

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorCode, ErrorResponse } from '../types/error.types';
import { AppException } from '../exceptions/app.exception';
import { getErrorMessage } from '../constants/error-messages';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse = this.buildErrorResponse(exception, request);
    
    // Log error with appropriate level
    if (errorResponse.statusCode >= 500) {
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : exception
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} - ${errorResponse.message}`
      );
    }

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private buildErrorResponse(exception: unknown, request: Request): ErrorResponse {
    const timestamp = new Date().toISOString();
    const path = request.url;

    // Handle AppException (our custom exceptions)
    if (exception instanceof AppException) {
      const response = exception.getResponse() as Omit<ErrorResponse, 'timestamp' | 'path'>;
      return {
        ...response,
        timestamp,
        path,
      };
    }

    // Handle standard NestJS HttpException
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      // Handle validation errors from class-validator
      if (typeof exceptionResponse === 'object' && 'message' in exceptionResponse) {
        const messages = Array.isArray(exceptionResponse.message)
          ? exceptionResponse.message
          : [exceptionResponse.message];

        return {
          success: false,
          message: messages[0] || 'Validation failed',
          messageNepali: 'प्रमाणीकरण असफल भयो। कृपया आफ्नो इनपुट जाँच गर्नुहोस्।',
          errorCode: ErrorCode.VALIDATION_ERROR,
          statusCode: status,
          timestamp,
          path,
          details: {
            validationErrors: messages,
          },
        };
      }

      // Map HTTP status to error code
      const errorCode = this.mapStatusToErrorCode(status);
      const errorMessage = getErrorMessage(errorCode);

      return {
        success: false,
        message: typeof exceptionResponse === 'string' ? exceptionResponse : errorMessage.en,
        messageNepali: errorMessage.ne,
        errorCode,
        statusCode: status,
        timestamp,
        path,
      };
    }

    // Handle Prisma errors
    if (this.isPrismaError(exception)) {
      return this.handlePrismaError(exception as any, timestamp, path);
    }

    // Handle unknown errors
    this.logger.error('Unhandled exception:', exception);
    const errorMessage = getErrorMessage(ErrorCode.INTERNAL_SERVER_ERROR);
    
    return {
      success: false,
      message: errorMessage.en,
      messageNepali: errorMessage.ne,
      errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp,
      path,
    };
  }

  private mapStatusToErrorCode(status: HttpStatus): ErrorCode {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return ErrorCode.BAD_REQUEST;
      case HttpStatus.UNAUTHORIZED:
        return ErrorCode.UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return ErrorCode.FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return ErrorCode.NOT_FOUND;
      case HttpStatus.CONFLICT:
        return ErrorCode.CONFLICT;
      default:
        return ErrorCode.INTERNAL_SERVER_ERROR;
    }
  }

  private isPrismaError(exception: unknown): boolean {
    return (
      typeof exception === 'object' &&
      exception !== null &&
      'code' in exception &&
      typeof (exception as any).code === 'string' &&
      (exception as any).code.startsWith('P')
    );
  }

  private handlePrismaError(
    exception: any,
    timestamp: string,
    path: string
  ): ErrorResponse {
    const code = exception.code;
    const errorMessage = getErrorMessage(ErrorCode.DATABASE_ERROR);

    // Handle specific Prisma error codes
    switch (code) {
      case 'P2002': // Unique constraint violation
        return {
          success: false,
          message: 'A record with this information already exists.',
          messageNepali: 'यो जानकारी भएको रेकर्ड पहिले नै अवस्थित छ।',
          errorCode: ErrorCode.CONFLICT,
          statusCode: HttpStatus.CONFLICT,
          timestamp,
          path,
          details: {
            fields: exception.meta?.target,
          },
        };

      case 'P2025': // Record not found
        return {
          success: false,
          message: 'The requested record was not found.',
          messageNepali: 'अनुरोध गरिएको रेकर्ड फेला परेन।',
          errorCode: ErrorCode.NOT_FOUND,
          statusCode: HttpStatus.NOT_FOUND,
          timestamp,
          path,
        };

      case 'P2003': // Foreign key constraint violation
        return {
          success: false,
          message: 'Cannot perform this operation due to related records.',
          messageNepali: 'सम्बन्धित रेकर्डहरूका कारण यो कार्य गर्न सकिँदैन।',
          errorCode: ErrorCode.CONFLICT,
          statusCode: HttpStatus.CONFLICT,
          timestamp,
          path,
        };

      default:
        return {
          success: false,
          message: errorMessage.en,
          messageNepali: errorMessage.ne,
          errorCode: ErrorCode.DATABASE_ERROR,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          timestamp,
          path,
        };
    }
  }
}
