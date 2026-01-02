// ============================================
// FILE: app/faq/page.tsx
// DESCRIPTION: Frequently Asked Questions page
// ============================================

import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbTrail } from "@/components/shared";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  HelpCircle,
  MessageCircle,
  FileText,
  Building2,
  Globe,
  Clock,
  Mail,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Find answers to common questions about using Setu for government services in Nepal. Learn how to search services, find offices, and understand procedures.",
};

const FAQ_CATEGORIES = [
  {
    title: "General Questions",
    icon: HelpCircle,
    faqs: [
      {
        question: "What is Setu?",
        answer:
          "Setu (सेतु) is a comprehensive guide to government services in Nepal. We provide step-by-step procedures, required documents, fees, and office locations for various government services like citizenship, passport, driving license, and more.",
      },
      {
        question: "Is Setu an official government website?",
        answer:
          "No, Setu is not an official government website. We are an independent platform that aggregates and organizes information from official sources to help citizens navigate government services more easily. Always verify information with the relevant government office.",
      },
      {
        question: "Is Setu free to use?",
        answer:
          "Yes, Setu is completely free to use. We believe access to government service information should be available to everyone without any cost.",
      },
      {
        question: "How accurate is the information on Setu?",
        answer:
          "We strive to keep our information as accurate and up-to-date as possible by sourcing from official government publications and websites. However, procedures and fees may change, so we recommend confirming with the relevant office before your visit.",
      },
    ],
  },
  {
    title: "Using the Platform",
    icon: FileText,
    faqs: [
      {
        question: "How do I search for a service?",
        answer:
          "You can search for services using the search bar on the homepage or the search page. Simply type keywords like 'citizenship', 'passport', or 'license' and we'll show you relevant services. You can also browse by category.",
      },
      {
        question: "How do I find the right government office?",
        answer:
          "On any service page, you'll see a list of offices where you can apply. You can also use our 'Find Offices' page to search for offices by location (Province, District, Municipality, Ward).",
      },
      {
        question: "Can I save services for later?",
        answer:
          "Currently, we don't have a save/bookmark feature, but it's on our roadmap. In the meantime, you can bookmark pages in your browser or share them with yourself.",
      },
      {
        question: "Is the information available in Nepali?",
        answer:
          "Yes, we provide Nepali translations (नेपाली) for service names, office names, and key information wherever available. We're continuously working to improve our Nepali language support.",
      },
    ],
  },
  {
    title: "Government Services",
    icon: Building2,
    faqs: [
      {
        question: "What services are covered on Setu?",
        answer:
          "Setu covers a wide range of government services including citizenship certificates, passports, driving licenses, vehicle registration, land registration, business registration, vital records (birth, death, marriage certificates), tax services, and more.",
      },
      {
        question: "Can I apply for services online through Setu?",
        answer:
          "Setu is an information platform only. We don't process applications. However, we indicate which services have official online application options and provide links to those portals where available.",
      },
      {
        question: "How do I know what documents I need?",
        answer:
          "Each service guide includes a detailed list of required documents. We specify whether originals or copies are needed, and any special requirements. Always check the step-by-step guide for your specific service.",
      },
      {
        question: "Are the fees listed accurate?",
        answer:
          "We try to keep fee information current, but government fees can change. The fees listed are for reference purposes. Please confirm the current fees at the relevant office before paying.",
      },
    ],
  },
  {
    title: "Online Services",
    icon: Globe,
    faqs: [
      {
        question: "Which services can be applied for online?",
        answer:
          "Several services now have online application options, including passport applications (through the Department of Passports portal), some tax services, and certain business registrations. Services with online availability are marked with an 'Online Available' badge.",
      },
      {
        question: "Where can I apply for a passport online?",
        answer:
          "Passport applications can be submitted online through the official Department of Passports website. Our service guide for passports includes the link and step-by-step instructions for the online process.",
      },
      {
        question: "Are online applications faster?",
        answer:
          "Online applications can save time by reducing office visits for initial submission. However, you'll still need to visit the office for verification and to collect your documents. Processing times vary by service and office.",
      },
    ],
  },
  {
    title: "Technical & Support",
    icon: MessageCircle,
    faqs: [
      {
        question: "I found incorrect information. How do I report it?",
        answer:
          "We appreciate your help in keeping Setu accurate! Please contact us through our contact form or email with details about the incorrect information, and we'll investigate and update as needed.",
      },
      {
        question: "How can I contribute to Setu?",
        answer:
          "Setu is an open-source project. You can contribute by reporting issues, suggesting improvements, or contributing code through our GitHub repository. We also welcome content contributions from people familiar with government procedures.",
      },
      {
        question: "Does Setu have a mobile app?",
        answer:
          "Currently, Setu is a web-only platform optimized for mobile browsers. A dedicated mobile app is on our roadmap for future development.",
      },
      {
        question: "How do I contact Setu for support?",
        answer:
          "You can reach us through the contact form on our website or email us directly. We try to respond to all inquiries within 48 hours.",
      },
    ],
  },
];

export default function FAQPage() {
  const breadcrumbs = [
    { label: "FAQ", href: "/faq" },
  ];

  return (
    <main className="flex-1 py-8 md:py-12">
      <div className="container-custom">
        {/* Breadcrumb */}
        <BreadcrumbTrail items={breadcrumbs} className="mb-6" />

        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-foreground-secondary">
            Find answers to common questions about Setu and government services
            in Nepal.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
            <Input
              type="text"
              placeholder="Search FAQ..."
              className="pl-12 h-12"
            />
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-12">
          {FAQ_CATEGORIES.map((category, categoryIndex) => {
            const Icon = category.icon;
            return (
              <section
                key={category.title}
                className="animate-fade-in opacity-0"
                style={{
                  animationDelay: `${categoryIndex * 100}ms`,
                  animationFillMode: "forwards",
                }}
              >
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nepal-crimson-100 to-nepal-crimson-200 flex items-center justify-center text-primary-crimson">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">
                    {category.title}
                  </h2>
                </div>

                {/* FAQs */}
                <Card>
                  <CardContent className="p-0">
                    <Accordion type="single" collapsible className="w-full">
                      {category.faqs.map((faq, faqIndex) => (
                        <AccordionItem
                          key={faqIndex}
                          value={`${categoryIndex}-${faqIndex}`}
                          className="border-b border-border last:border-b-0"
                        >
                          <AccordionTrigger className="px-6 py-4 hover:bg-surface-hover text-left">
                            <span className="font-medium text-foreground">
                              {faq.question}
                            </span>
                          </AccordionTrigger>
                          <AccordionContent className="px-6 pb-4">
                            <p className="text-foreground-secondary leading-relaxed">
                              {faq.answer}
                            </p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </section>
            );
          })}
        </div>

        {/* Still Have Questions */}
        <section className="mt-16 text-center">
          <Card className="bg-gradient-to-br from-nepal-blue-50 to-nepal-crimson-50 border-0">
            <CardContent className="p-8 md:p-12">
              <MessageCircle className="w-12 h-12 text-primary-blue mx-auto mb-4" />
              <h2 className="text-xl font-bold text-foreground mb-2">
                Still Have Questions?
              </h2>
              <p className="text-foreground-secondary max-w-md mx-auto mb-6">
                Can&apos;t find the answer you&apos;re looking for? Our team is here to help.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild>
                  <Link href="/contact">
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Us
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/about">Learn More About Setu</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
