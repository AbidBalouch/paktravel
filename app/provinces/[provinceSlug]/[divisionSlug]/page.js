// app/provinces/[provinceSlug]/[divisionSlug]/page.js
// ---------------------------------------------------------------------------
// Single Division page — bilkul Province page jaisa design/pattern, sirf
// yahan grid mein Districts dikhte hain (Divisions ki jagah). Isi liye
// ProvinceExplorer component seedha reuse kiya hai — getDivisionArchiveData
// (lib/api.js) apna data ProvinceExplorer ki expected shape mein hi return
// karta hai, is liye koi naya component banane ki zaroorat nahi.
// ---------------------------------------------------------------------------

import { notFound } from "next/navigation";
import { getDivisionArchiveData, getAllDivisionParams, safe } from "@/lib/api";
import ProvinceExplorer from "@/components/ProvinceExplorer/ProvinceExplorer";
import BrandsCarousel from "@/components/BrandsCarousel/BrandsCarousel";
import Newsletter from "@/components/Newsletter/Newsletter";
import styles from "./division.module.css";

export const revalidate = 60; // WordPress se har 60s baad fresh data (ISR)

// ---------------------------------------------------------------------------
// SSG: sab {province, division} combinations ke liye build-time pe pages
// ---------------------------------------------------------------------------
export async function generateStaticParams() {
  return safe(getAllDivisionParams, []);
}

// ---------------------------------------------------------------------------
// SEO metadata — har division ka apna title/description/OG image
// ---------------------------------------------------------------------------
export async function generateMetadata({ params }) {
  const division = await safe(() => getDivisionArchiveData(params.divisionSlug), null);
  if (!division) return {};

  const seoTitle = division.tagline
    ? `${division.title}: ${division.tagline}`
    : `${division.title} — Travel Pakistan`;

  return {
    title: seoTitle,
    description: division.description,
    alternates: {
      canonical: `/provinces/${params.provinceSlug}/${division.slug}`,
    },
    openGraph: {
      title: seoTitle,
      description: division.description,
      images: division.heroImage ? [division.heroImage.url] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: division.description,
      images: division.heroImage ? [division.heroImage.url] : [],
    },
  };
}

export default async function DivisionPage({ params }) {
  const division = await safe(() => getDivisionArchiveData(params.divisionSlug), null);

  if (!division) return notFound();

  return (
    <div className={styles.page}>
      <main>
        {/* ---------------- Hero/Banner + Search + Districts Grid ---------------- */}
        <ProvinceExplorer province={division} />
        <BrandsCarousel />
        <Newsletter />
      </main>
    </div>
  );
}
