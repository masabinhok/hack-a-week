// ============================================
// FILE: app/about/page.tsx
// DESCRIPTION: About page for Setu platform
// ============================================

import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbTrail } from "@/components/shared";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Target,
  Users,
  Shield,
  Heart,
  Code,
  Github,
  Mail,
  CheckCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Setu",
  description:
    "Learn about Setu - Nepal's comprehensive government services guide. Our mission is to make government services accessible to every Nepali citizen.",
};

const TEAM_MEMBERS = [
  {
    name: "Sabin Shrestha",
    role: "Full Stack Developer",
    description: "Building the technical infrastructure",
  },
  {
    name: "Rhythm Adhikari",
    role: "Full Stack Developer",
    description: "Designing user experiences",
  },
];

const VALUES = [
  {
    icon: Shield,
    title: "Accuracy",
    description:
      "We verify all information directly from official government sources to ensure accuracy.",
  },
  {
    icon: Users,
    title: "Accessibility",
    description:
      "Our platform is designed to be accessible to everyone, regardless of technical expertise.",
  },
  {
    icon: Heart,
    title: "Service",
    description:
      "We are committed to serving Nepali citizens by simplifying government procedures.",
  },
  {
    icon: Code,
    title: "Open Source",
    description:
      "Our codebase is open source, allowing community contributions and transparency.",
  },
];

export default function AboutPage() {
  const breadcrumbs = [
    { label: "About", href: "/about" },
  ];

  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary-blue to-nepal-blue-800">
        <div className="container-custom">
          <BreadcrumbTrail items={breadcrumbs} className="mb-8 text-white/70" />

          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Making Government Services
              <span className="text-nepal-crimson-300"> Accessible </span>
              for Every Nepali
            </h1>
            <p className="text-xl text-white/80 leading-relaxed">
              Setu (सेतु) means &quot;bridge&quot; in Nepali. We bridge the gap between
              citizens and government services by providing clear, accurate, and
              comprehensive information about government procedures.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 md:py-24">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-primary-crimson mb-4">
                <Target className="w-5 h-5" />
                <span className="font-semibold">Our Mission</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                Simplifying Government Procedures for 30 Million Nepalis
              </h2>
              <p className="text-foreground-secondary leading-relaxed mb-6">
                Navigating government services in Nepal can be confusing and
                time-consuming. Citizens often need to visit multiple offices,
                gather various documents, and follow complex procedures without
                clear guidance.
              </p>
              <p className="text-foreground-secondary leading-relaxed mb-8">
                Setu aims to change this by providing a single platform where
                anyone can find step-by-step guides for any government service,
                complete with required documents, fees, timelines, and office
                locations.
              </p>

              <div className="space-y-3">
                {[
                  "150+ government services documented",
                  "All 77 districts covered",
                  "Bilingual support (English & Nepali)",
                  "Completely free to use",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-nepal-crimson-50 to-nepal-blue-50 rounded-3xl p-8 md:p-12">
                <blockquote className="text-xl md:text-2xl font-medium text-foreground leading-relaxed">
                  &quot;Every citizen deserves clear information about their rights
                  and how to access government services.&quot;
                </blockquote>
                <div className="mt-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-crimson flex items-center justify-center text-white font-bold">
                    S
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      Setu Team
                    </p>
                    <p className="text-sm text-foreground-muted">
                      Founding Vision
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24 bg-surface">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Our Values
            </h2>
            <p className="text-foreground-secondary">
              These core values guide everything we do at Setu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card
                  key={value.title}
                  className="text-center animate-fade-in opacity-0"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: "forwards",
                  }}
                >
                  <CardContent className="p-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-nepal-crimson-100 to-nepal-crimson-200 flex items-center justify-center text-primary-crimson mx-auto mb-4">
                      <Icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {value.title}
                    </h3>
                    <p className="text-sm text-foreground-secondary">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 md:py-24">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Meet the Team
            </h2>
            <p className="text-foreground-secondary">
              Built with ❤️ by developers passionate about civic tech.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {TEAM_MEMBERS.map((member, index) => (
              <Card
                key={member.name}
                className="animate-fade-in opacity-0"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: "forwards",
                }}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-blue to-primary-crimson flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                    {member.name.charAt(0)}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {member.name}
                  </h3>
                  <p className="text-sm text-primary-crimson mb-2">
                    {member.role}
                  </p>
                  <p className="text-sm text-foreground-secondary">
                    {member.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary-crimson to-nepal-crimson-700">
        <div className="container-custom text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Want to Contribute?
          </h2>
          <p className="text-white/80 max-w-xl mx-auto mb-8">
            Setu is an open-source project. We welcome contributions from
            developers, designers, and anyone passionate about making government
            services more accessible.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="bg-white text-primary-crimson hover:bg-white/90"
            >
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="w-5 h-5 mr-2" />
                View on GitHub
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              <Link href="/contact">
                <Mail className="w-5 h-5 mr-2" />
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
