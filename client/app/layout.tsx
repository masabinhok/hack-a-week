import type { Metadata } from "next";
import { Merriweather, Inter } from "next/font/google";
import { Toaster } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/contexts/AuthContext";
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
  title: "Setu - Nepal Government Services Guide",
  description: "Your comprehensive guide to government services in Nepal. Find office locations, required documents, fees, and step-by-step procedures for citizenship, passport, licenses, and more.",
  keywords: ["Nepal government services", "citizenship certificate", "passport Nepal", "government offices Nepal", "ward office", "district administration office"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${merriweather.variable} ${inter.variable}`}>
      <body className="antialiased min-h-screen flex flex-col bg-background text-foreground">
        <AuthProvider>
          <Header />
          {children}
          <Footer />
          <Toaster 
            position="top-right" 
            richColors 
            closeButton
            duration={4000}
            toastOptions={{
              style: {
                whiteSpace: 'pre-line', // Support multiline for bilingual messages
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
