// ============================================
// FILE: components/home/Stats.tsx
// DESCRIPTION: Platform statistics section with animated counters
// ============================================

"use client";

import { useEffect, useState, useRef } from "react";
import { FileText, MapPin, Building2, Users } from "lucide-react";

const STATS = [
  {
    label: "Government Services",
    labelNepali: "सरकारी सेवाहरू",
    value: 150,
    suffix: "+",
    icon: FileText,
    description: "Comprehensive guides available",
  },
  {
    label: "Districts Covered",
    labelNepali: "जिल्लाहरू",
    value: 77,
    suffix: "",
    icon: MapPin,
    description: "All districts of Nepal",
  },
  {
    label: "Government Offices",
    labelNepali: "सरकारी कार्यालयहरू",
    value: 500,
    suffix: "+",
    icon: Building2,
    description: "Offices in our database",
  },
  {
    label: "Monthly Users",
    labelNepali: "मासिक प्रयोगकर्ता",
    value: 50000,
    suffix: "+",
    icon: Users,
    description: "Citizens helped every month",
  },
];

function AnimatedCounter({
  value,
  suffix,
  duration = 2000,
  shouldAnimate,
}: {
  value: number;
  suffix: string;
  duration?: number;
  shouldAnimate: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!shouldAnimate) return;

    const startTime = Date.now();
    const endValue = value;

    const updateCount = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out quad
      const easeProgress = 1 - (1 - progress) * (1 - progress);
      const currentValue = Math.floor(easeProgress * endValue);

      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      }
    };

    requestAnimationFrame(updateCount);
  }, [value, duration, shouldAnimate]);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return num.toLocaleString("en-IN");
    }
    return num.toString();
  };

  return (
    <span>
      {formatNumber(count)}
      {suffix}
    </span>
  );
}

export function Stats() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-24 bg-gradient-to-br from-primary-blue to-nepal-blue-800"
    >
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Trusted by Citizens Across Nepal
          </h2>
          <p className="text-white/80">
            Setu is becoming the go-to platform for government service
            information, helping thousands of Nepali citizens every day.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {STATS.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="text-center p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 animate-fade-in opacity-0"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: "forwards",
                }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 text-white mb-4">
                  <Icon className="w-6 h-6" />
                </div>

                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  <AnimatedCounter
                    value={stat.value}
                    suffix={stat.suffix}
                    shouldAnimate={isVisible}
                  />
                </div>

                <div className="text-sm font-medium text-white mb-1">
                  {stat.label}
                </div>
                <div className="text-xs text-white/70 nepali-text">
                  {stat.labelNepali}
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center items-center gap-8 mt-12 pt-12 border-t border-white/20">
          <div className="flex items-center gap-2 text-white/80">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2L3.5 6.5v5.5c0 5 3.6 9.5 8.5 11 4.9-1.5 8.5-6 8.5-11V6.5L12 2zm-1 15l-4-4 1.5-1.5L11 14l5.5-5.5L18 10l-7 7z" />
            </svg>
            <span className="text-sm">Secure & Private</span>
          </div>
          <div className="flex items-center gap-2 text-white/80">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z" />
            </svg>
            <span className="text-sm">Always Up-to-date</span>
          </div>
          <div className="flex items-center gap-2 text-white/80">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <span className="text-sm">Verified Information</span>
          </div>
          <div className="flex items-center gap-2 text-white/80">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm0 11.18L4.24 9.83 12 6.09l7.76 3.74L12 14.18zM5 13.18v4L12 21l7-3.82v-4l-7 3.82-7-3.82z" />
            </svg>
            <span className="text-sm">Free Forever</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Stats;
