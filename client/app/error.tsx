// ============================================
// FILE: app/error.tsx
// DESCRIPTION: Global error boundary page
// ============================================

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <main className="flex-1 flex items-center justify-center py-16 md:py-24">
      <div className="container-custom text-center">
        {/* Icon */}
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center text-red-500 mx-auto mb-8">
          <AlertTriangle className="w-12 h-12" />
        </div>

        {/* Content */}
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
          Something Went Wrong
        </h1>
        <p className="text-lg text-foreground-secondary max-w-md mx-auto mb-8">
          We encountered an unexpected error while loading this page. Please try
          again or return to the homepage.
        </p>

        {/* Error Details (development only) */}
        {process.env.NODE_ENV === "development" && error.message && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg max-w-2xl mx-auto text-left">
            <p className="text-sm font-mono text-red-700">{error.message}</p>
            {error.digest && (
              <p className="text-xs text-red-500 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap justify-center gap-4">
          <Button onClick={reset} size="lg">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Go to Homepage
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
