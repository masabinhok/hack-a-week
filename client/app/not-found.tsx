import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center bg-gray-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <AlertCircle className="w-24 h-24 text-blue-600 mx-auto mb-6" />
          <h1 className="text-6xl font-bold text-gray-900 mb-4 font-mw">404</h1>
          <h2 className="text-3xl font-bold text-gray-700 mb-4">Page Not Found</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            The service or page you're looking for doesn't exist or may have been moved.
          </p>
          <Link 
            href="/"
            className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-lg font-semibold transition-all shadow-lg"
          >
            Return to Homepage
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
