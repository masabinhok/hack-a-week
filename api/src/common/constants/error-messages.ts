// ============================================
// FILE: src/common/constants/error-messages.ts
// DESCRIPTION: Bilingual error messages mapping
// ============================================

import { ErrorCode, BilingualMessage } from '../types/error.types';

export const ERROR_MESSAGES: Record<ErrorCode, BilingualMessage> = {
  [ErrorCode.INTERNAL_SERVER_ERROR]: {
    en: 'An unexpected error occurred. Please try again later.',
    ne: 'अप्रत्याशित त्रुटि भयो। कृपया पछि पुन: प्रयास गर्नुहोस्।',
  },
  [ErrorCode.BAD_REQUEST]: {
    en: 'Invalid request. Please check your input.',
    ne: 'अवैध अनुरोध। कृपया आफ्नो इनपुट जाँच गर्नुहोस्।',
  },
  [ErrorCode.UNAUTHORIZED]: {
    en: 'You are not authorized to access this resource.',
    ne: 'तपाईंलाई यो स्रोत पहुँच गर्न अधिकार छैन।',
  },
  [ErrorCode.FORBIDDEN]: {
    en: 'Access to this resource is forbidden.',
    ne: 'यो स्रोतमा पहुँच निषेधित छ।',
  },
  [ErrorCode.NOT_FOUND]: {
    en: 'The requested resource was not found.',
    ne: 'अनुरोध गरिएको स्रोत फेला परेन।',
  },
  [ErrorCode.CONFLICT]: {
    en: 'A conflict occurred. The resource may already exist.',
    ne: 'द्वन्द्व भयो। स्रोत पहिले नै अवस्थित हुन सक्छ।',
  },
  [ErrorCode.VALIDATION_ERROR]: {
    en: 'Validation failed. Please check your input.',
    ne: 'प्रमाणीकरण असफल भयो। कृपया आफ्नो इनपुट जाँच गर्नुहोस्।',
  },
  [ErrorCode.SERVICE_NOT_FOUND]: {
    en: 'Service not found. Please check the service name or ID.',
    ne: 'सेवा फेला परेन। कृपया सेवाको नाम वा आईडी जाँच गर्नुहोस्।',
  },
  [ErrorCode.CATEGORY_NOT_FOUND]: {
    en: 'Category not found. Please check the category name or ID.',
    ne: 'श्रेणी फेला परेन। कृपया श्रेणीको नाम वा आईडी जाँच गर्नुहोस्।',
  },
  [ErrorCode.OFFICE_NOT_FOUND]: {
    en: 'Office not found. Please check the office details.',
    ne: 'कार्यालय फेला परेन। कृपया कार्यालयको विवरण जाँच गर्नुहोस्।',
  },
  [ErrorCode.LOCATION_NOT_FOUND]: {
    en: 'Location not found. Please select a valid location.',
    ne: 'स्थान फेला परेन। कृपया मान्य स्थान चयन गर्नुहोस्।',
  },
  [ErrorCode.DATABASE_ERROR]: {
    en: 'A database error occurred. Please try again later.',
    ne: 'डाटाबेस त्रुटि भयो। कृपया पछि पुन: प्रयास गर्नुहोस्।',
  },
  [ErrorCode.DATABASE_CONNECTION_ERROR]: {
    en: 'Could not connect to database. Please try again later.',
    ne: 'डाटाबेसमा जडान हुन सकेन। कृपया पछि पुन: प्रयास गर्नुहोस्।',
  },
  [ErrorCode.EXTERNAL_API_ERROR]: {
    en: 'External service is unavailable. Please try again later.',
    ne: 'बाह्य सेवा उपलब्ध छैन। कृपया पछि पुन: प्रयास गर्नुहोस्।',
  },
  [ErrorCode.FILE_TOO_LARGE]: {
    en: 'File size exceeds the maximum limit.',
    ne: 'फाइल साइज अधिकतम सीमा भन्दा बढी छ।',
  },
  [ErrorCode.INVALID_FILE_TYPE]: {
    en: 'Invalid file type. Please upload a valid file.',
    ne: 'अवैध फाइल प्रकार। कृपया मान्य फाइल अपलोड गर्नुहोस्।',
  },
};

/**
 * Get bilingual error message for a given error code
 */
export function getErrorMessage(errorCode: ErrorCode): BilingualMessage {
  return (
    ERROR_MESSAGES[errorCode] || ERROR_MESSAGES[ErrorCode.INTERNAL_SERVER_ERROR]
  );
}

/**
 * Create a custom error message with context
 */
export function createCustomMessage(
  baseCode: ErrorCode,
  customEn?: string,
  customNe?: string,
): BilingualMessage {
  const base = getErrorMessage(baseCode);
  return {
    en: customEn || base.en,
    ne: customNe || base.ne,
  };
}
