// ============================================
// FILE: components/shared/ErrorFallback.tsx
// DESCRIPTION: Reusable error fallback UI component
// ============================================

import Link from 'next/link';

interface ErrorFallbackProps {
  title?: string;
  titleNepali?: string;
  message?: string;
  messageNepali?: string;
  showRetry?: boolean;
  onRetry?: () => void;
  showBackHome?: boolean;
}

export default function ErrorFallback({
  title = 'Something went wrong',
  titleNepali = 'केही गलत भयो',
  message = 'We encountered an error while loading this content.',
  messageNepali = 'यो सामग्री लोड गर्दा हामीले त्रुटि सामना गर्यौं।',
  showRetry = true,
  onRetry,
  showBackHome = true,
}: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] px-4 py-16">
      <div className="max-w-md w-full text-center space-y-4">
        {/* Error Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* Error Title */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-lg text-gray-700 mt-1">{titleNepali}</p>
        </div>

        {/* Error Message */}
        <div className="text-gray-600">
          <p>{message}</p>
          <p className="mt-1">{messageNepali}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          {showRetry && onRetry && (
            <button
              onClick={onRetry}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              Try Again / पुन: प्रयास गर्नुहोस्
            </button>
          )}
          
          {showBackHome && (
            <Link
              href="/"
              className="px-6 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Back to Home / गृहपृष्ठमा फर्कनुहोस्
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
