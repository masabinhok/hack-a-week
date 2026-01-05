// ============================================
// FILE: app/services/[slug]/guide/page.tsx
// DESCRIPTION: Server component for service guide page with safe error handling
// ============================================

import type { Metadata } from "next";
import { getSafeServiceGuide, ApiError } from "@/lib/api-wrapper";
import { GuideClient } from "./GuideClient";
import { GuideErrorPage } from "./error-page";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const [service, error] = await getSafeServiceGuide(slug);

  if (error || !service) {
    return {
      title: "Service Guide Not Found",
      description: "The requested service guide is not available.",
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
  
  // Use safe API wrapper that returns [data, error] tuple
  const [service, error] = await getSafeServiceGuide(slug);

  // If we have an error, show the error page
  if (error) {
    // Only log unexpected errors (not SERVICE_NOT_FOUND which is handled gracefully)
    const isExpectedError = error instanceof ApiError && 
      (error.errorCode === 'SERVICE_NOT_FOUND' || error.statusCode === 404);
    
    if (!isExpectedError) {
      console.error(`[Guide Error] ${slug}:`, error.message);
    }
    
    return <GuideErrorPage error={error} />;
  }

  // If no service data returned, show error page
  if (!service) {
    return <GuideErrorPage error={new Error('Service not found')} />;
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
  // console.log(serializedService)

  return <GuideClient service={serializedService} slug={slug} breadcrumbs={breadcrumbs} />;
}
