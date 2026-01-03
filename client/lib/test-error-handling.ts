// ============================================
// FILE: lib/test-error-handling.ts
// DESCRIPTION: Test script to verify error handling works
// ============================================

import { ApiError } from './api';
import { ErrorCode } from './error-types';
import { toast } from './toast';

/**
 * Test the error handling system
 * Run this in the browser console to test
 */
export function testErrorHandling() {
  console.log('Testing error handling system...\n');

  // Test 1: Create ApiError
  console.log('Test 1: Creating ApiError');
  const apiError = new ApiError(
    ErrorCode.SERVICE_NOT_FOUND,
    404,
    'Service not found',
    'सेवा फेला परेन'
  );
  console.log('ApiError created:', apiError);
  console.log('- errorCode:', apiError.errorCode);
  console.log('- statusCode:', apiError.statusCode);
  console.log('- message:', apiError.message);
  console.log('- messageNepali:', apiError.messageNepali);

  // Test 2: Toast notifications
  console.log('\nTest 2: Testing toast notifications');
  
  setTimeout(() => {
    console.log('Showing success toast...');
    toast.success('Test success', 'परीक्षण सफल');
  }, 500);

  setTimeout(() => {
    console.log('Showing error toast...');
    toast.error('Test error', 'परीक्षण त्रुटि');
  }, 1500);

  setTimeout(() => {
    console.log('Showing warning toast...');
    toast.warning('Test warning', 'परीक्षण चेतावनी');
  }, 2500);

  setTimeout(() => {
    console.log('Showing info toast...');
    toast.info('Test info', 'परीक्षण जानकारी');
  }, 3500);

  // Test 3: Handle ApiError with toast
  setTimeout(() => {
    console.log('\nTest 3: Handling ApiError with toast');
    toast.handleError(apiError);
  }, 4500);

  console.log('\nAll tests scheduled. Watch for toasts on screen.');
}

// Make it available globally for testing
if (typeof window !== 'undefined') {
  (window as any).testErrorHandling = testErrorHandling;
  console.log('Error handling test available: run testErrorHandling() in console');
}
