// app/layout.jsx
// Global root layout — Header/Footer ab GLOBAL hain (har page par), aur
// dono dynamic hain (WordPress se data aata hai, components/Header|Footer).
// Purana working layout "layout---.js" backup me tha; ye usi ka restored
// version hai + naye homepage design ki travel.css bhi shamil hai taake
// dono designs (purane pages + naya homepage) sahi chalein.
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import "../components/travel/travel.css";

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

export async function generateMetadata() {
  const site = await safe(getSiteSettings, null);
  return {
    // Testing phase: poori site noindex/nofollow — live karne par Henry index karega
    robots: { index: false, follow: false },
    title: site?.title || "Travel Pakistan",
    description:
      site?.tagline ||
      "Discover the beauty of Pakistan with curated destinations, local experiences, and seamless travel planning.",
    icons: site?.favicon
      ? { icon: site.favicon, shortcut: site.favicon, apple: site.favicon }
      : undefined,
  };
}

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
