'use client';

import { useRouter } from 'next/navigation';

interface AdminHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export default function AdminHeader({ title, description, actions }: AdminHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-gray-200/80 shadow-sm">
      <div className="px-8 py-6">
        <div className="flex items-center justify-between">
          {/* Header Content */}
          <div className="flex-1">
            <div className="flex items-center gap-4">
              {/* Decorative Element */}
              <div className="hidden sm:flex items-center justify-center w-12 h-12 bg-gradient-to-br from-nepal-blue-600 to-nepal-blue-800 rounded-xl shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-nepal-blue-900 via-nepal-blue-800 to-nepal-crimson-600 bg-clip-text text-transparent">
                  {title}
                </h1>
                {description && (
                  <p className="mt-1.5 text-sm text-gray-600 font-medium flex items-center gap-2">
                    <span className="w-1 h-1 bg-nepal-blue-600 rounded-full"></span>
                    {description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          {actions && (
            <div className="flex items-center gap-3 ml-4">
              {actions}
            </div>
          )}
        </div>

        {/* Optional Breadcrumb/Meta Section */}
        <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Last updated: {new Date().toLocaleDateString()}</span>
          </div>
          <span className="text-gray-300">|</span>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">System Operational</span>
          </div>
        </div>
      </div>
    </div>
  );
}
