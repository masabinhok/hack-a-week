// ============================================
// FILE: app/loading.tsx
// DESCRIPTION: Global loading state component
// ============================================

export default function Loading() {
  return (
    <main className="flex-1 flex items-center justify-center py-16 md:py-24">
      <div className="text-center">
        {/* Nepal Flag Inspired Loader */}
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-border" />
          <div className="absolute inset-0 rounded-full border-4 border-primary-crimson border-t-transparent animate-spin" />
          <div className="absolute inset-2 rounded-full border-4 border-primary-blue border-b-transparent animate-spin animation-reverse" style={{ animationDuration: '1.5s' }} />
        </div>

        {/* Text */}
        <p className="text-foreground-secondary font-medium">
          Loading...
        </p>
        <p className="text-sm text-foreground-muted nepali-text mt-1">
          कृपया पर्खनुहोस्
        </p>
      </div>
    </main>
  );
}
