// ============================================
// FILE: components/home/PopularServices.tsx
// DESCRIPTION: Popular services showcase section
// ============================================

import Link from "next/link";
import {
  ArrowRight,
  Clock,
  Banknote,
  Globe,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import type { Service } from "@/lib/types";

interface PopularServicesProps {
  services: Service[];
}

export function PopularServices({ services }: PopularServicesProps) {
  // Show top 6 services
  const displayServices = services.slice(0, 6);

  return (
    <section className="py-16 md:py-24 bg-background-secondary">
      <div className="container-custom">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Popular Services
            </h2>
            <p className="text-foreground-secondary">
              Most frequently accessed government services by citizens
            </p>
          </div>
          <Button asChild variant="outline" className="w-fit">
            <Link href="/services">
              View all services
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayServices.map((service, index) => (
            <Link
              key={service.id}
              href={`/services/${service.slug}`}
              className="group"
            >
              <Card
                variant="interactive"
                className="h-full animate-fade-in opacity-0"
                style={{
                  animationDelay: `${index * 75}ms`,
                  animationFillMode: "forwards",
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-foreground group-hover:text-nepal-blue transition-colors line-clamp-2">
                        {service.name}
                      </h3>
                      {service.nameNepali && (
                        <p className="text-sm text-foreground-muted nepali-text mt-1">
                          {service.nameNepali}
                        </p>
                      )}
                    </div>
                    <PriorityBadge priority={service.priority} showLabel={false} />
                  </div>

                  {service.description && (
                    <p className="text-sm text-foreground-secondary mb-4 line-clamp-2">
                      {service.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 flex-wrap">
                    {service.isOnlineEnabled && (
                      <Badge variant="status-online" className="gap-1">
                        <Globe className="w-3 h-3" />
                        Online Available
                      </Badge>
                    )}
                    {service.categories && service.categories.length > 0 && (
                      <Badge variant="secondary">
                        {service.categories[0].name}
                      </Badge>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-foreground-muted">
                      {service._count?.children ? (
                        <span>{service._count.children} sub-services</span>
                      ) : service._count?.steps ? (
                        <span>{service._count.steps} steps</span>
                      ) : null}
                    </div>
                    <span className="text-sm text-nepal-blue font-medium group-hover:underline flex items-center gap-1">
                      Learn more
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PopularServices;
