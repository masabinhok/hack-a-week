// ============================================
// FILE: app/not-found.tsx
// DESCRIPTION: Custom 404 Not Found page
// ============================================

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion, Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex-1 flex items-center justify-center py-16 md:py-24">
      <div className="container-custom text-center">
        {/* Icon */}
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-nepal-crimson-100 to-nepal-crimson-200 flex items-center justify-center text-primary-crimson mx-auto mb-8">
          <FileQuestion className="w-12 h-12" />
        </div>

        {/* Content */}
        <h1 className="text-6xl md:text-8xl font-bold text-foreground mb-4">
          404
        </h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
          Page Not Found
        </h2>
        <p className="text-lg text-foreground-secondary max-w-md mx-auto mb-8">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved to a
          new location.
        </p>

        {/* Actions */}
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Go to Homepage
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/search">
              <Search className="w-4 h-4 mr-2" />
              Search Services
            </Link>
          </Button>
        </div>

        {/* Popular Links */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-foreground-muted mb-4">
            Looking for something specific?
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/categories"
              className="text-sm text-primary-blue hover:underline"
            >
              Browse Categories
            </Link>
            <span className="text-border">•</span>
            <Link
              href="/services"
              className="text-sm text-primary-blue hover:underline"
            >
              All Services
            </Link>
            <span className="text-border">•</span>
            <Link
              href="/offices"
              className="text-sm text-primary-blue hover:underline"
            >
              Find Offices
            </Link>
            <span className="text-border">•</span>
            <Link
              href="/faq"
              className="text-sm text-primary-blue hover:underline"
            >
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
