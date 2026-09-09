// app/layout.js

import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";

import { getSiteSettings } from "@/lib/api";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

// ---------------------------------------------------------------------------
// WordPress Site Metadata
// Site Title + Tagline + Favicon
// ---------------------------------------------------------------------------

export async function generateMetadata() {
  const site = await getSiteSettings();

  return {
    title: site.title || "Travel Pakistan",

    description:
      site.tagline ||
      "Discover the beauty of Pakistan with curated destinations, local experiences, and seamless travel planning.",

    icons: site.favicon
      ? {
          icon: site.favicon,
          shortcut: site.favicon,
          apple: site.favicon,
        }
      : undefined,
  };
}

// ---------------------------------------------------------------------------
// Root Layout
// ---------------------------------------------------------------------------

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={plusJakarta.variable}
        suppressHydrationWarning
      >
        <Header />

        <main>{children}</main>

        <Footer />
      </body>
    </html>
  );
}