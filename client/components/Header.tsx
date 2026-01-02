import Link from 'next/link';
import { Search } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-linear-to-r from-blue-900 via-blue-800 to-blue-900 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Title */}
          <Link href="/" className="flex items-center space-x-4 group">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <span className="text-3xl font-bold text-blue-900">सेतु</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold font-mw">Setu</h1>
              <p className="text-xs text-blue-200">Nepal Government Services</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="hover:text-blue-200 transition-colors font-medium">
              Services
            </Link>
            <Link href="/about" className="hover:text-blue-200 transition-colors font-medium">
              About
            </Link>
            <Link href="/contact" className="hover:text-blue-200 transition-colors font-medium">
              Contact
            </Link>
          </nav>

          {/* Search Icon */}
          <button className="p-2 hover:bg-blue-700 rounded-full transition-colors">
            <Search className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
