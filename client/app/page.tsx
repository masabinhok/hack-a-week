// ============================================
// FILE: app/page.tsx
// DESCRIPTION: Homepage for Setu - Nepal Government Services Guide
// ============================================

import type { Metadata } from "next";
import { getCategories, getRootServices } from "@/lib/api";
import { Hero, CategoryGrid, PopularServices, HowItWorks, Stats } from "@/components/home";

export const metadata: Metadata = {
  title: "Setu | Nepal Government Services Guide",
  description:
    "Your comprehensive guide to Nepal government services. Find step-by-step procedures, required documents, fees, timelines, and office locations for any government service.",
  keywords: [
    "Nepal government services",
    "government procedures",
    "citizenship Nepal",
    "passport Nepal",
    "driving license Nepal",
    "government offices Nepal",
  ],
  openGraph: {
    title: "Setu - Nepal Government Services Guide",
    description:
      "Find step-by-step guides for all Nepal government services. Documents, fees, offices & more.",
    type: "website",
  },
};

export default async function HomePage() {
  // Fetch data in parallel
  const [categories, services] = await Promise.all([
    getCategories().catch(() => []),
    getRootServices().catch(() => []),
  ]);

  // Get popular services (first 6 for display)
  const popularServices = services.slice(0, 6);

  return (
    <main className="flex-1">
      {/* Hero Section with Search */}
      <Hero />

      {/* Category Grid */}
      <CategoryGrid categories={categories} />

      {/* Popular Services */}
      <PopularServices services={popularServices} />

      {/* How It Works */}
      <HowItWorks />

      {/* Platform Stats */}
      <Stats />
    </main>
  );
}
