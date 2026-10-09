// app/layout.js

import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { AuthStatusProvider } from "@/components/AuthStatus/AuthStatusContext";

import { getSiteSettings, safe } from "@/lib/api";

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
  const site = await safe(getSiteSettings, null);

  return {
    title: site?.title || "Travel Pakistan",

    description:
      site?.tagline ||
      "Discover the beauty of Pakistan with curated destinations, local experiences, and seamless travel planning.",

    icons: site?.favicon
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
// NOTE: getLoginStatus() (jo next/headers ka cookies() use karta hai) ab
// yahan call NAHI ho raha — isi wajah se deeply nested dynamic routes
// (/provinces/[province]/[division]/[district]) "Page changed from static
// to dynamic at runtime" crash de rahe the. Login status ab
// AuthStatusProvider khud client-side mount hote hi /api/auth/status se
// fetch karta hai (dekhein components/AuthStatus/AuthStatusContext.jsx).
// Isse layout — aur is se wrapped har page — hamesha static/ISR-safe rehta
// hai.
// ---------------------------------------------------------------------------

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={plusJakarta.variable} suppressHydrationWarning>
        <AuthStatusProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </AuthStatusProvider>
      </body>
    </html>
  );
}
