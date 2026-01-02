import type { Metadata } from "next";
import { Merriweather, Inter } from "next/font/google";
import "./globals.css";

// Primary font for body text (serif for government/formal feel)
const merriweather = Merriweather({
  weight: ['300', '400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-merriweather',
});

// Secondary font for UI elements (sans-serif for readability)
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: "Setu - Nepal Government Services Guide",
    template: "%s | Setu"
  },
  description: "Your comprehensive guide to government services in Nepal. Find office locations, required documents, fees, and step-by-step procedures for citizenship, passport, licenses, and more.",
  keywords: ["Nepal government services", "citizenship certificate", "passport Nepal", "government offices Nepal", "ward office", "district administration office"],
  authors: [{ name: "Sabin Shrestha" }, {name: "Rhythm Adhikari"}],
  creator: "Setu",
  publisher: "Setu",
  openGraph: {
    type: "website",
    locale: "en_NP",
    url: "https://setu.gov.np",
    siteName: "Setu - Nepal Government Services",
    title: "Setu - Your Guide to Nepal Government Services",
    description: "Find government offices, required documents, and step-by-step procedures for all government services in Nepal.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Setu - Nepal Government Services Guide",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Setu - Nepal Government Services Guide",
    description: "Your comprehensive guide to government services in Nepal",
    images: ["/twitter-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${merriweather.variable} ${inter.variable}`}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
