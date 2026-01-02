// ============================================
// FILE: app/offices/page.tsx
// DESCRIPTION: Office finder page with location filters
// ============================================

import type { Metadata } from "next";
import { BreadcrumbTrail } from "@/components/shared";
import { OfficesClient } from "./OfficesClient";

export const metadata: Metadata = {
  title: "Find Government Offices",
  description:
    "Find government offices in Nepal by location. Get addresses, contact information, working hours, and directions for ward offices, district offices, and more.",
};

export default async function OfficesPage() {
  const breadcrumbs = [
    { label: "Find Offices", href: "/offices" },
  ];

  return (
    <main className="flex-1 py-8 md:py-12">
      <div className="container-custom">
        {/* Breadcrumb */}
        <BreadcrumbTrail items={breadcrumbs} className="mb-6" />

        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Find Government Offices
          </h1>
          <p className="text-lg text-foreground-secondary max-w-2xl">
            Locate government offices near you. Filter by location to find ward
            offices, district administration offices, and other government
            buildings.
          </p>
        </div>

        {/* Client Component with Filters and Results */}
        <OfficesClient />
      </div>
    </main>
  );
}
