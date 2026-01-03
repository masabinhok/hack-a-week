// ============================================
// FILE: app/services/[slug]/guide/page.tsx
// DESCRIPTION: Server component for service guide page
// ============================================

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServiceGuide } from "@/lib/api";
import { GuideClient } from "./GuideClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  let service = null;
  try {
    service = await getServiceGuide(slug);
  } catch {
    return {
      title: "Service Guide Not Found",
    };
  }

  return {
    title: `${service.name} - Complete Guide`,
    description:
      service.description ||
      `Step-by-step guide for ${service.name}. Find required documents, fees, process steps, and office locations.`,
    openGraph: {
      title: `${service.name} - Step by Step Guide`,
      description:
        service.description ||
        `Learn how to apply for ${service.name} in Nepal with our comprehensive guide.`,
    },
  };
}

export default async function ServiceGuidePage({ params }: PageProps) {
  const { slug } = await params;
  
  let service = null;
  try {
    service = await getServiceGuide(slug);
  } catch (error) {
    console.error("Failed to fetch service guide:", error);
    notFound();
  }

  if (!service) {
    notFound();
  }

  // Build breadcrumbs using the breadcrumb data from API
  const breadcrumbs = [
    { label: "Services", href: "/services" },
    ...(service.breadcrumb || []).map((item) => ({
      label: item.name,
      href: `/services/${item.slug}`,
    })),
    { label: "Guide", href: `/services/${slug}/guide` },
  ];

  // Serialize the service data to ensure proper transfer to client component
  const serializedService = JSON.parse(JSON.stringify(service));
  console.log(serializedService)

  return <GuideClient service={serializedService} slug={slug} breadcrumbs={breadcrumbs} />;
}
