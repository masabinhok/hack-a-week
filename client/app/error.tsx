'use client';

import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center bg-gray-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <AlertCircle className="w-24 h-24 text-red-600 mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-gray-900 mb-4 font-mw">
            Something went wrong!
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            We encountered an error while loading this page. Please try again.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => reset()}
              className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-lg font-semibold transition-all shadow-lg"
            >
              Try Again
            </button>
            <a
              href="/"
              className="bg-white hover:bg-gray-50 text-gray-900 px-8 py-4 rounded-lg font-semibold transition-all shadow-lg border border-gray-300"
            >
              Go Home
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
