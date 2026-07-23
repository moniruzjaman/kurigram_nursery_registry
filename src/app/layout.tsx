import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kurigram Nursery Registry",
  description: "GIS & Inventory Management System for Plant Nurseries in Kurigram District, Bangladesh. 137 nurseries with GPS, mobile, and inventory data.",
  keywords: ["nursery", "Kurigram", "GIS", "inventory", "Bangladesh", "plant nursery", "seedlings"],
  authors: [{ name: "DAE Kurigram" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Kurigram Nursery Registry",
    description: "GIS & Inventory Management for Plant Nurseries in Kurigram District",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
