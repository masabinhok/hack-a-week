// ============================================
// FILE: app/services/[slug]/guide/error-page.tsx
// DESCRIPTION: Simple error page for service guide with bilingual support
// ============================================

import Link from 'next/link';
import { ApiError } from '@/lib/api';

interface ErrorPageProps {
  error: ApiError | Error;
  slug?: string; // Optional since we're not using it currently
}

export function GuideErrorPage({ error }: ErrorPageProps) {
  const isApiError = error instanceof ApiError;
  
  const message = error.message || 'Failed to load service guide';
  const messageNepali = isApiError && error.messageNepali 
    ? error.messageNepali 
    : 'सेवा गाइड लोड गर्न असफल भयो।';

  return (
    <main className="grow">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {/* Simple heading */}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Guide Not Available
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              गाइड उपलब्ध छैन
            </p>

            {/* Error message */}
            <div className="bg-gray-50 rounded p-4 mb-6 text-sm">
              <p className="text-gray-700 mb-1">{message}</p>
              <p className="text-gray-600">{messageNepali}</p>
            </div>

            {/* Simple action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/services"
                className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors text-center"
              >
                Browse Services
              </Link>
              
              <Link
                href="/"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-center"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
