// ============================================
// FILE: lib/error-logger.ts
// DESCRIPTION: Centralized error logging for production monitoring
// ============================================

import { ApiError } from './api';

interface ErrorContext {
  url?: string;
  userId?: string;
  timestamp: string;
  userAgent?: string;
  [key: string]: any;
}

/**
 * Log errors to console and external service
 * In production, integrate with Sentry, LogRocket, or similar
 */
export function logError(
  error: Error | ApiError,
  context?: Partial<ErrorContext>
): void {
  const errorData = {
    message: error.message,
    name: error.name,
    stack: error.stack,
    ...(error instanceof ApiError && {
      errorCode: error.errorCode,
      statusCode: error.statusCode,
      messageNepali: error.messageNepali,
      details: error.details,
    }),
    context: {
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      ...context,
    },
  };

  // Log to console
  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', errorData);
  } else {
    console.error('Error:', error.message, errorData.context);
  }

  // In production, send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to Sentry, LogRocket, etc.
    // Sentry.captureException(error, { extra: errorData });
    
    // Or send to your own logging endpoint
    if (typeof window !== 'undefined') {
      fetch('/api/log-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData),
      }).catch(() => {
        // Silently fail if logging fails
      });
    }
  }
}

/**
 * Create a safe async wrapper that logs errors
 */
export function withErrorLogging<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: string
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(
        error instanceof Error ? error : new Error(String(error)),
        { functionName: context || fn.name }
      );
      throw error;
    }
  }) as T;
}
