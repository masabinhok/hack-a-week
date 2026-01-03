import type { Metadata } from "next";
import { Merriweather } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";

const merriweather = Merriweather({
  weight: ['300', '400', '700'],
  subsets: ['latin'],
  variable: '--font-merriweather',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Setu Admin - Premium Government Services Dashboard",
  description: "Advanced administration panel for managing Nepal government services, offices, and categories",
  keywords: ['Setu', 'Nepal', 'Government', 'Admin', 'Dashboard', 'Services'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${merriweather.className} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
