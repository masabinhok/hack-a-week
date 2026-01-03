import type { Metadata } from "next";
import { Merriweather } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";

const merriweather = Merriweather({
  weight: ['300', '400', '700'],
  subsets: ['latin'],
  variable: '--font-merriweather',
})


export const metadata: Metadata = {
  title: "Setu Admin - Government Services Portal",
  description: "Admin panel for managing government services",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${merriweather.className} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
