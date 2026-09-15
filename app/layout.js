// app/layout.js

import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { AuthStatusProvider } from "@/components/AuthStatus/AuthStatusContext";
import { getLoginStatus } from "@/lib/auth";

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
  // safe() ke bina agar WordPress ka fetch fail ho (timeout/downtime), to
  // poori build crash ho jati hai — chahe koi bhi page ho, kyunke ye
  // root layout ka hissa hai. Fallback null milne par neeche defaults
  // use ho jayenge.
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

export default async function RootLayout({ children }) {
  // Isko bhi safe() se wrap kiya — login-status check bhi har page ke
  // sath chalta hai, is liye yahan koi bhi temporary failure poori build
  // crash kar sakta tha. Fallback null se AuthStatusProvider "logged out"
  // jaisa hi treat kar lega.
  const loginStatus = await safe(getLoginStatus, null);

  return (
    <html lang="en">
      <body className={plusJakarta.variable} suppressHydrationWarning>
        <AuthStatusProvider initialStatus={loginStatus}>
          <Header />
          <main>{children}</main>
          <Footer />
        </AuthStatusProvider>
      </body>
    </html>
  );
}