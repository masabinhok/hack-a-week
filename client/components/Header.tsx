// ============================================
// FILE: components/Header.tsx
// DESCRIPTION: Main navigation header with mobile menu
// ============================================

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Menu,
  X,
  Globe,
  Building2,
  FileText,
  Grid3X3,
  Info,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { label: "Home", labelNepali: "गृहपृष्ठ", href: "/", icon: Grid3X3 },
  { label: "Services", labelNepali: "सेवाहरू", href: "/services", icon: FileText },
  { label: "Categories", labelNepali: "वर्गहरू", href: "/categories", icon: Grid3X3 },
  { label: "Offices", labelNepali: "कार्यालयहरू", href: "/offices", icon: Building2 },
  { label: "About", labelNepali: "हाम्रोबारे", href: "/about", icon: Info },
  { label: "FAQ", labelNepali: "प्रश्नोत्तर", href: "/faq", icon: HelpCircle },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [language, setLanguage] = useState<"en" | "ne">("en");
  const pathname = usePathname();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          isScrolled
            ? "bg-card/95 backdrop-blur-md shadow-md border-b border-border"
            : "bg-gradient-to-r from-nepal-blue via-[#002D75] to-nepal-blue"
        )}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 group"
              aria-label="Setu Home"
            >
              <div
                className={cn(
                  "w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center font-bold transition-all duration-200 group-hover:scale-105",
                  isScrolled
                    ? "bg-nepal-crimson text-white"
                    : "bg-white text-nepal-blue"
                )}
              >
                <span className="text-lg md:text-xl">सेतु</span>
              </div>
              <div className="hidden sm:block">
                <h1
                  className={cn(
                    "text-xl md:text-2xl font-bold transition-colors",
                    isScrolled ? "text-foreground" : "text-white"
                  )}
                >
                  Setu
                </h1>
                <p
                  className={cn(
                    "text-xs transition-colors",
                    isScrolled
                      ? "text-foreground-muted"
                      : "text-blue-200"
                  )}
                >
                  Nepal Government Services
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      isScrolled
                        ? isActive
                          ? "bg-nepal-blue text-white"
                          : "text-foreground-secondary hover:bg-background-secondary hover:text-foreground"
                        : isActive
                          ? "bg-white/20 text-white"
                          : "text-white/80 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {language === "ne" ? item.labelNepali : item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Search Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
                className={cn(
                  "rounded-lg",
                  isScrolled
                    ? "text-foreground-secondary hover:text-foreground hover:bg-background-secondary"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                )}
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Language Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLanguage(language === "en" ? "ne" : "en")}
                className={cn(
                  "hidden sm:flex items-center gap-1.5 rounded-lg font-medium",
                  isScrolled
                    ? "text-foreground-secondary hover:text-foreground hover:bg-background-secondary"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                )}
              >
                <Globe className="h-4 w-4" />
                <span className="text-sm">
                  {language === "en" ? "नेपाली" : "EN"}
                </span>
              </Button>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={cn(
                  "lg:hidden rounded-lg",
                  isScrolled
                    ? "text-foreground-secondary hover:text-foreground hover:bg-background-secondary"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                )}
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={cn(
          "fixed top-16 md:top-20 right-0 z-40 w-full max-w-sm h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] bg-card border-l border-border shadow-xl transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto",
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <nav className="p-4">
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors",
                    isActive
                      ? "bg-nepal-blue text-white"
                      : "text-foreground-secondary hover:bg-background-secondary hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{language === "ne" ? item.labelNepali : item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="border-t border-border mt-4 pt-4">
            <button
              onClick={() => setLanguage(language === "en" ? "ne" : "en")}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-foreground-secondary hover:bg-background-secondary hover:text-foreground transition-colors"
            >
              <Globe className="h-5 w-5" />
              <span className="font-medium">
                {language === "en" ? "नेपालीमा हेर्नुहोस्" : "View in English"}
              </span>
            </button>
          </div>
        </nav>
      </div>

      {/* Search Modal */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-20 md:pt-32 px-4"
          onClick={() => setIsSearchOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-card rounded-2xl shadow-2xl overflow-hidden animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
                <input
                  type="text"
                  placeholder="Search for services... (e.g., citizenship, passport)"
                  className="w-full h-14 pl-12 pr-4 text-lg border-0 bg-background-secondary rounded-xl focus:outline-none focus:ring-2 focus:ring-nepal-blue"
                  autoFocus
                />
              </div>
            </div>
            <div className="border-t border-border p-4">
              <p className="text-sm text-foreground-muted mb-3">
                Popular searches
              </p>
              <div className="flex flex-wrap gap-2">
                {["Citizenship", "Passport", "Driving License", "Land Registration"].map(
                  (term) => (
                    <Link
                      key={term}
                      href={`/search?q=${encodeURIComponent(term)}`}
                      onClick={() => setIsSearchOpen(false)}
                      className="px-3 py-1.5 text-sm bg-background-secondary rounded-full hover:bg-nepal-blue hover:text-white transition-colors"
                    >
                      {term}
                    </Link>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
