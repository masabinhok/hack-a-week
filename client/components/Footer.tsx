// ============================================
// FILE: components/Footer.tsx
// DESCRIPTION: Main footer with links and info
// ============================================

import Link from "next/link";
import {
  Facebook,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Heart,
} from "lucide-react";

const FOOTER_LINKS = {
  services: [
    { label: "All Services", href: "/services" },
    { label: "Citizenship", href: "/services/citizenship" },
    { label: "Passport", href: "/services/passport" },
    { label: "Driving License", href: "/services/driving-license" },
    { label: "Land Registration", href: "/services/land-registration" },
  ],
  resources: [
    { label: "Find Offices", href: "/offices" },
    { label: "Categories", href: "/categories" },
    { label: "FAQ", href: "/faq" },
    { label: "About Us", href: "/about" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Disclaimer", href: "/disclaimer" },
  ],
};

const SOCIAL_LINKS = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Youtube, href: "#", label: "YouTube" },
];

export default function Footer() {
  return (
    <footer className="bg-nepal-blue text-white mt-auto">
      {/* Main Footer Content */}
      <div className="container-custom py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* About Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold text-nepal-blue">
                  सेतु
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold">Setu</h3>
                <p className="text-xs text-blue-200">सरकारी सेवा मार्गदर्शक</p>
              </div>
            </div>
            <p className="text-sm text-blue-100 leading-relaxed mb-4">
              Your comprehensive guide to government services in Nepal. Find
              offices, understand procedures, required documents, fees, and
              timelines for all government services.
            </p>
            <p className="text-sm text-blue-200">
              नेपालमा सरकारी सेवाहरूको लागि तपाईंको पूर्ण मार्गदर्शक।
            </p>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-nepal-crimson rounded-full" />
              Popular Services
            </h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.services.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-blue-100 hover:text-white transition-colors inline-flex items-center gap-1 group"
                  >
                    {link.label}
                    <ExternalLink className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-nepal-crimson rounded-full" />
              Resources
            </h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-blue-100 hover:text-white transition-colors inline-flex items-center gap-1 group"
                  >
                    {link.label}
                    <ExternalLink className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-nepal-crimson rounded-full" />
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="tel:+977-1-XXXXXXX"
                  className="text-sm text-blue-100 hover:text-white transition-colors flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  +977-1-XXXXXXX
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@setu.gov.np"
                  className="text-sm text-blue-100 hover:text-white transition-colors flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  info@setu.gov.np
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-blue-100">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span>Singha Durbar, Kathmandu, Nepal</span>
              </li>
            </ul>

            {/* Social Links */}
            <div className="mt-6">
              <p className="text-sm text-blue-200 mb-3">Follow us</p>
              <div className="flex items-center gap-3">
                {SOCIAL_LINKS.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      aria-label={social.label}
                      className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="border-t border-white/10">
        <div className="container-custom py-4">
          <p className="text-xs text-blue-200 text-center">
            <strong className="text-blue-100">Disclaimer:</strong> This platform
            provides general guidance on government services. Always verify
            information with the respective government office. Data is updated
            regularly but may not reflect real-time changes.
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-[#002366]">
        <div className="container-custom py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-blue-200">
              © {new Date().getFullYear()} Setu - Nepal Government Services
              Guide
            </p>
            <div className="flex items-center gap-4 text-sm">
              {FOOTER_LINKS.legal.map((link, index) => (
                <span key={link.href} className="flex items-center gap-4">
                  <Link
                    href={link.href}
                    className="text-blue-200 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                  {index < FOOTER_LINKS.legal.length - 1 && (
                    <span className="text-blue-400">•</span>
                  )}
                </span>
              ))}
            </div>
          </div>
          <div className="text-center mt-4 text-xs text-blue-300 flex items-center justify-center gap-1">
            Made with <Heart className="w-3 h-3 text-nepal-crimson fill-current" /> for Nepal
          </div>
        </div>
      </div>
    </footer>
  );
}
