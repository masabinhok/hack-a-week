// ============================================
// FILE: components/home/Hero.tsx
// DESCRIPTION: Hero section with search and location
// ============================================

"use client";

import {  MapPin, ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/shared/SearchBar";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative bg-gradient-to-b from-nepal-blue via-[#002D75] to-[#001F54] text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-nepal-crimson/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      {/* Nepal Flag Colors Accent */}
      <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-nepal-crimson to-nepal-blue" />

      <div className="container-custom relative z-10 py-16 md:py-24 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm font-medium">
              Your guide to 100+ government services
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
            Navigate Nepal's{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">
              Government Services
            </span>{" "}
            with Ease
          </h1>

          {/* Nepali Subtitle */}
          <p className="text-xl md:text-2xl text-blue-200 mb-6 nepali-text">
            नेपालको सरकारी सेवाहरू सजिलैसँग पहुँच गर्नुहोस्
          </p>

          {/* Description */}
          <p className="text-base md:text-lg text-blue-100 max-w-2xl mx-auto mb-8">
            Find government offices, understand step-by-step procedures, know
            required documents, fees, and timelines for all services—from
            citizenship to business registration.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <SearchBar
              size="lg"
              placeholder="Search for services... (e.g., citizenship, passport, driving license)"
              className="shadow-2xl"
            />
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto bg-nepal-crimson hover:bg-nepal-crimson-dark text-white shadow-lg"
            >
              <Link href="/services">
                Browse All Services
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border-white/30 text-white"
            >
              <Link href="/offices">
                <MapPin className="w-4 h-4 mr-2" />
                Find Offices Near Me
              </Link>
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-3xl mx-auto">
            {[
              { value: "100+", label: "Services" },
              { value: "6,743", label: "Ward Offices" },
              { value: "77", label: "Districts" },
              { value: "2026", label: "Updated" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="text-center p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <div className="text-2xl md:text-3xl font-bold text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-blue-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-blue-200">
          <span className="text-sm">Explore Services</span>
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </div>
      </div>
    </section>
  );
}

export default Hero;
