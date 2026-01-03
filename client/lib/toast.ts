// ============================================
// FILE: lib/toast.ts
// DESCRIPTION: Toast notification utilities with bilingual support
// ============================================

import { toast as sonnerToast } from 'sonner';
import { ErrorResponse, ErrorCode } from './error-types';
import { ApiError } from './api';

export interface ToastOptions {
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  closeButton?: boolean;
}

/**
 * Show success toast
 */
export function showSuccess(message: string, messageNepali?: string, options?: ToastOptions) {
  const displayMessage = messageNepali 
    ? `${message}\n${messageNepali}` 
    : message;
  
  sonnerToast.success(displayMessage, {
    duration: options?.duration || 4000,
    action: options?.action,
    closeButton: options?.closeButton,
  });
}

/**
 * Show error toast
 */
export function showError(message: string, messageNepali?: string, options?: ToastOptions) {
  const displayMessage = messageNepali 
    ? `${message}\n${messageNepali}` 
    : message;
  
  sonnerToast.error(displayMessage, {
    duration: options?.duration || 6000,
    action: options?.action,
    closeButton: options?.closeButton !== false,
  });
}

/**
 * Show warning toast
 */
export function showWarning(message: string, messageNepali?: string, options?: ToastOptions) {
  const displayMessage = messageNepali 
    ? `${message}\n${messageNepali}` 
    : message;
  
  sonnerToast.warning(displayMessage, {
    duration: options?.duration || 5000,
    action: options?.action,
    closeButton: options?.closeButton,
  });
}

/**
 * Show info toast
 */
export function showInfo(message: string, messageNepali?: string, options?: ToastOptions) {
  const displayMessage = messageNepali 
    ? `${message}\n${messageNepali}` 
    : message;
  
  sonnerToast.info(displayMessage, {
    duration: options?.duration || 4000,
    action: options?.action,
    closeButton: options?.closeButton,
  });
}

/**
 * Show loading toast (returns ID for later dismissal)
 */
export function showLoading(message: string, messageNepali?: string) {
  const displayMessage = messageNepali 
    ? `${message}\n${messageNepali}` 
    : message;
  
  return sonnerToast.loading(displayMessage);
}

/**
 * Dismiss a specific toast by ID
 */
export function dismissToast(toastId: string | number) {
  sonnerToast.dismiss(toastId);
}

/**
 * Handle API error response and show appropriate toast
 */
export function handleApiError(error: unknown, fallbackMessage?: string) {
  console.error('API Error:', error);

  // Handle ApiError from our API client
  if (error instanceof ApiError) {
    showError(error.message, error.messageNepali, {
      closeButton: true,
    });
    return;
  }

  // Handle ErrorResponse from backend (direct objects)
  if (isErrorResponse(error)) {
    showError(error.message, error.messageNepali, {
      closeButton: true,
    });
    return;
  }

  // Handle fetch errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    showError(
      'Network error. Please check your connection.',
      'नेटवर्क त्रुटि। कृपया आफ्नो जडान जाँच गर्नुहोस्।',
      { closeButton: true }
    );
    return;
  }

  // Handle generic Error
  if (error instanceof Error) {
    showError(
      error.message || fallbackMessage || 'An unexpected error occurred.',
      'अप्रत्याशित त्रुटि भयो।',
      { closeButton: true }
    );
    return;
  }

  // Fallback for unknown errors
  showError(
    fallbackMessage || 'An unexpected error occurred.',
    'अप्रत्याशित त्रुटि भयो।',
    { closeButton: true }
  );
}

/**
 * Type guard to check if error is an ErrorResponse
 */
function isErrorResponse(error: unknown): error is ErrorResponse {
  return (
    typeof error === 'object' &&
    error !== null &&
    'success' in error &&
    'message' in error &&
    'errorCode' in error &&
    'statusCode' in error
  );
}

/**
 * Get user-friendly message based on error code
 */
export function getFriendlyErrorMessage(errorCode: ErrorCode): { en: string; ne: string } {
  switch (errorCode) {
    case ErrorCode.NETWORK_ERROR:
      return {
        en: 'Unable to connect to the server. Please check your internet connection.',
        ne: 'सर्भरमा जडान हुन सकेन। कृपया आफ्नो इन्टरनेट जडान जाँच गर्नुहोस्।',
      };
    case ErrorCode.TIMEOUT_ERROR:
      return {
        en: 'Request timed out. Please try again.',
        ne: 'अनुरोध समय समाप्त भयो। कृपया पुन: प्रयास गर्नुहोस्।',
      };
    case ErrorCode.SERVICE_NOT_FOUND:
      return {
        en: 'Service not found. It may have been removed or renamed.',
        ne: 'सेवा फेला परेन। यो हटाइएको वा पुन: नामाकरण गरिएको हुन सक्छ।',
      };
    case ErrorCode.VALIDATION_ERROR:
      return {
        en: 'Please check your input and try again.',
        ne: 'कृपया आफ्नो इनपुट जाँच गर्नुहोस् र पुन: प्रयास गर्नुहोस्।',
      };
    default:
      return {
        en: 'An unexpected error occurred. Please try again later.',
        ne: 'अप्रत्याशित त्रुटि भयो। कृपया पछि पुन: प्रयास गर्नुहोस्।',
      };
  }
}

// Export the toast utilities for convenient access
export const toast = {
  success: showSuccess,
  error: showError,
  warning: showWarning,
  info: showInfo,
  loading: showLoading,
  dismiss: dismissToast,
  handleError: handleApiError,
};
