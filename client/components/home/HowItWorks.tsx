// ============================================
// FILE: components/home/HowItWorks.tsx
// DESCRIPTION: 3-step process explanation section
// ============================================

import { Search, MapPin, CheckSquare, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const STEPS = [
  {
    number: "01",
    title: "Choose Your Service",
    titleNepali: "आफ्नो सेवा छान्नुहोस्",
    description:
      "Browse through categories or search for the specific government service you need. From citizenship to business registration, we have them all covered.",
    icon: Search,
    color: "bg-blue-500",
  },
  {
    number: "02",
    title: "Find Your Office",
    titleNepali: "आफ्नो कार्यालय खोज्नुहोस्",
    description:
      "Select your location (Province, District, Municipality, Ward) to find the nearest government office where you can apply for the service.",
    icon: MapPin,
    color: "bg-amber-500",
  },
  {
    number: "03",
    title: "Follow the Guide",
    titleNepali: "गाइड पालना गर्नुहोस्",
    description:
      "Get detailed step-by-step instructions, required documents checklist, fee breakdown, estimated timelines, and responsible authorities.",
    icon: CheckSquare,
    color: "bg-green-500",
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            How Setu Works
          </h2>
          <p className="text-foreground-secondary">
            Get information about any government service in three simple steps.
            No more confusion or multiple visits to offices.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-24 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-0.5 bg-border" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="relative text-center lg:text-left animate-fade-in opacity-0"
                  style={{
                    animationDelay: `${index * 150}ms`,
                    animationFillMode: "forwards",
                  }}
                >
                  {/* Step Number and Icon */}
                  <div className="flex flex-col lg:flex-row items-center gap-4 mb-6">
                    <div
                      className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center text-white shadow-lg relative z-10`}
                    >
                      <Icon className="w-8 h-8" />
                    </div>
                    <div className="text-4xl font-bold text-border">
                      {step.number}
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-foreground-muted nepali-text mb-3">
                    {step.titleNepali}
                  </p>
                  <p className="text-foreground-secondary leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button asChild size="lg">
            <Link href="/services">
              Get Started Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
