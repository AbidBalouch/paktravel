// app/provinces/[provinceSlug]/[divisionSlug]/[districtSlug]/page.js
// ---------------------------------------------------------------------------
// Single District page — Province page ke pattern jaisa: page.js sirf data
// fetch + metadata karta hai, poora Hero+Search+Collage+Tabs+Filters+Grid
// DistrictExplorer.jsx (client component) ke andar hai, kyunke search/filter/
// active-tab state sab jagah share hota hai.
// ---------------------------------------------------------------------------

import { notFound } from "next/navigation";
import Link from "next/link";
import { getDistrictPageData, getAllDistrictParams, safe } from "@/lib/api";
import DistrictExplorer from "@/components/DistrictExplorer/DistrictExplorer";
import Newsletter from "@/components/Newsletter/Newsletter";
import styles from "./district.module.css";

export const revalidate = 60;

export async function generateStaticParams() {
  return safe(getAllDistrictParams, []);
}

export async function generateMetadata({ params }) {
  const district = await safe(() => getDistrictPageData(params.districtSlug), null);
  if (!district) return {};

  const seoTitle = district.tagline
    ? `${district.title}: ${district.tagline}`
    : `${district.title} — Travel Pakistan`;

  return {
    title: seoTitle,
    description: district.description,
    alternates: {
      canonical: `/provinces/${params.provinceSlug}/${params.divisionSlug}/${district.slug}`,
    },
    openGraph: {
      title: seoTitle,
      description: district.description,
      images: district.heroImage ? [district.heroImage.url] : [],
      type: "website",
    },
  };
}

export default async function DistrictPage({ params }) {
  const district = await safe(() => getDistrictPageData(params.districtSlug), null);

  if (!district) return notFound();

  return (
    <div className={styles.page}>
      <main>
        {/* ---------------- Hero/Banner + Search + Collage + Tabs/Filters/Grid ---------------- */}
        <DistrictExplorer district={district} />
        <Newsletter />

        {/* ---------------- JSON-LD structured data (SEO) ---------------- */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "TouristDestination",
              name: district.title,
              description: district.description,
              image: district.heroImage?.url,
            }),
          }}
        />
      </main>
    </div>
  );
}
