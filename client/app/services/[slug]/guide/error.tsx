// ============================================
// FILE: app/services/[slug]/guide/error.tsx
// DESCRIPTION: Client-side error boundary for guide page
// ============================================

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ApiError } from '@/lib/api';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GuideError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to error reporting service
    console.error('Guide page error:', error);
  }, [error]);

  // Check if it's our custom ApiError
  const isApiError = error instanceof ApiError || (error as any).errorCode;
  const message = error.message || 'Failed to load guide';
  const messageNepali = (error as any).messageNepali || 'गाइड लोड गर्न असफल भयो।';

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Something Went Wrong
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            केही गलत भयो
          </p>

          <div className="bg-gray-50 rounded p-4 mb-6 text-sm">
            <p className="text-gray-700 mb-1">{message}</p>
            {isApiError && <p className="text-gray-600">{messageNepali}</p>}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={reset}
              className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors text-center"
            >
              Try Again
            </button>
            
            <Link
              href="/services"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-center"
            >
              Browse Services
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
