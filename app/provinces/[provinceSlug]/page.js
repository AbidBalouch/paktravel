// app/destinations/[provinceSlug]/page.js
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------

import { notFound } from "next/navigation";
import { getProvinceArchiveData, getAllProvinceSlugs, safe } from "@/lib/api";
import ProvinceExplorer from "@/components/ProvinceExplorer/ProvinceExplorer";
import BrandsCarousel from "@/components/BrandsCarousel/BrandsCarousel";
import Newsletter from "@/components/Newsletter/Newsletter";
import styles from "./province.module.css";

export const revalidate = 60; // WordPress se har 60s baad fresh data (ISR)

// ---------------------------------------------------------------------------
// SSG: sab provinces (Punjab, Sindh, ...) ke liye build-time pe pages banayein
// ---------------------------------------------------------------------------
export async function generateStaticParams() {
  const slugs = await safe(getAllProvinceSlugs, []);
  return slugs.map((slug) => ({ provinceSlug: slug }));
}

// ---------------------------------------------------------------------------
// SEO metadata — har province ka apna title/description/OG image
// ---------------------------------------------------------------------------
export async function generateMetadata({ params }) {
  const province = await safe(() => getProvinceArchiveData(params.provinceSlug), null);
  if (!province) return {};

  const seoTitle = province.tagline
    ? `${province.title}: ${province.tagline}`
    : `${province.title} — Travel Pakistan`;

  return {
    title: seoTitle,
    description: province.description,
    alternates: { canonical: `/provinces/${province.slug}` },
    openGraph: {
      title: seoTitle,
      description: province.description,
      images: province.heroImage ? [province.heroImage.url] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: province.description,
      images: province.heroImage ? [province.heroImage.url] : [],
    },
  };
}

export default async function ProvincePage({ params }) {
  const province = await safe(() => getProvinceArchiveData(params.provinceSlug), null);

  if (!province) return notFound();

  return (
    <div className={styles.page}>
      <main>
        {/* ---------------- Hero/Banner + Search + Divisions Grid ---------------- */}
        <ProvinceExplorer province={province} />
        <BrandsCarousel />
        <Newsletter />
      </main>
    </div>
  );
}