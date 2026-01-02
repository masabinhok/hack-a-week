// ============================================
// FILE: components/services/ServiceSidebar.tsx
// DESCRIPTION: Sidebar component for service detail page
// ============================================

import Link from "next/link";
import {
  Building2,
  MapPin,
  Clock,
  FileText,
  DollarSign,
  Globe,
  Phone,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Service, Office } from "@/lib/types";
import { formatNPR } from "@/lib/utils";

interface ServiceSidebarProps {
  service: Service;
  offices?: Office[];
  className?: string;
}

export function ServiceSidebar({
  service,
  offices = [],
  className = "",
}: ServiceSidebarProps) {
  // Calculate totals from steps if available
  const totalSteps = service._count?.steps || service.steps?.length || 0;
  const totalDocuments = service.steps?.reduce(
    (sum, step) => sum + (step.documents?.length || 0),
    0
  ) || 0;
  const totalFees = service.steps?.reduce(
    (sum, step) =>
      sum +
      (step.fees?.reduce((feeSum, fee) => feeSum + (fee.amount || 0), 0) || 0),
    0
  ) || 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Quick Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Online Availability */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-surface">
            <Globe
              className={`w-5 h-5 ${
                service.isOnlineAvailable
                  ? "text-green-500"
                  : "text-foreground-muted"
              }`}
            />
            <div>
              <p className="text-sm font-medium text-foreground">
                Online Application
              </p>
              <p className="text-xs text-foreground-secondary">
                {service.isOnlineAvailable
                  ? "Available online"
                  : "In-person only"}
              </p>
            </div>
            {service.isOnlineAvailable && (
              <Badge className="ml-auto bg-green-100 text-green-700">
                Available
              </Badge>
            )}
          </div>

          {/* Steps */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-surface">
            <FileText className="w-5 h-5 text-primary-blue" />
            <div>
              <p className="text-sm font-medium text-foreground">
                {totalSteps} Steps
              </p>
              <p className="text-xs text-foreground-secondary">
                Process steps to follow
              </p>
            </div>
          </div>

          {/* Documents */}
          {totalDocuments > 0 && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-surface">
              <FileText className="w-5 h-5 text-amber-500" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {totalDocuments} Documents
                </p>
                <p className="text-xs text-foreground-secondary">
                  Required documents
                </p>
              </div>
            </div>
          )}

          {/* Total Fees */}
          {totalFees > 0 && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-surface">
              <DollarSign className="w-5 h-5 text-primary-crimson" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {formatNPR(totalFees)}
                </p>
                <p className="text-xs text-foreground-secondary">
                  Estimated total fees
                </p>
              </div>
            </div>
          )}

          {/* Estimated Time */}
          {service.estimatedTime && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-surface">
              <Clock className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {service.estimatedTime}
                </p>
                <p className="text-xs text-foreground-secondary">
                  Estimated processing time
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Offices Card */}
      {offices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Where to Apply
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {offices.slice(0, 3).map((office) => (
              <Link
                key={office.id}
                href={`/offices/${office.id}`}
                className="block p-3 rounded-lg bg-surface hover:bg-surface-hover transition-colors"
              >
                <p className="text-sm font-medium text-foreground">
                  {office.name}
                </p>
                {office.nameNepali && (
                  <p className="text-xs text-foreground-muted nepali-text">
                    {office.nameNepali}
                  </p>
                )}
                {office.location && (
                  <p className="text-xs text-foreground-secondary flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {office.location.municipality?.name},{" "}
                    {office.location.district?.name}
                  </p>
                )}
              </Link>
            ))}

            {offices.length > 3 && (
              <Button asChild variant="outline" className="w-full">
                <Link href={`/offices?service=${service.slug}`}>
                  View All {offices.length} Offices
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Help Card */}
      <Card className="bg-gradient-to-br from-nepal-blue-50 to-nepal-blue-100 border-nepal-blue-200">
        <CardContent className="p-6 text-center">
          <Phone className="w-10 h-10 text-primary-blue mx-auto mb-3" />
          <p className="font-medium text-foreground mb-2">
            Need Help?
          </p>
          <p className="text-sm text-foreground-secondary mb-4">
            Contact the relevant government office for assistance with your
            application.
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link href="/offices">Find Office Contact</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default ServiceSidebar;
