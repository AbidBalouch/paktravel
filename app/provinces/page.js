// app/destinations/page.js
import Image from "next/image";
import Destinations from "@/components/Destinations/Destinations";
import Testimonials from "@/components/Testimonials/Testimonials";
import Newsletter from "@/components/Newsletter/Newsletter";
import BrandsCarousel from "@/components/BrandsCarousel/BrandsCarousel";
import { getProvinceBannerData, safe } from "@/lib/api";
import styles from "./provinces.module.css"; // ya jo bhi aapka CSS module hai

export const revalidate = 60;

export default async function DestinationsPage() {
  const banner = await safe(getProvinceBannerData, null);

  if (!banner) {
    return (
      <div className={styles.page}>
        <main>
          <div className={styles.errorBox}>
            Province banner ka data WordPress se load nahi ho saka. Console log check karein.
          </div>
        </main>
      </div>
    );
  }

  // "Unveil The Soul Of Pakistan" → last word green, baqi dark
  const words = banner.heading.trim().split(" ");
  const headingRest = words.pop(); // "Pakistan"
  const headingFirst = words.join(" "); // "Unveil The Soul Of"

  return (
    <div className={styles.page}>
      <main>
        <section className={styles.hero}>
          <div className={styles.heroBg}>
            {banner.backgroundImage && (
              <Image
                src={banner.backgroundImage.url}
                alt={banner.backgroundImage.alt}
                fill
                sizes="100vw"
                priority
                className={styles.heroBgImage}
              />
            )}
          </div>

          {banner.badge && (
            <div className={styles.heroTop}>
              <span className={styles.heroBadge}>{banner.badge}</span>
            </div>
          )}

          <div className={styles.heroInner}>
            <h1 className={styles.heroTitle}>
              {headingFirst}{" "}
              {headingRest && <span className={styles.heroTitleAccent}>{headingRest}</span>}
            </h1>

            {banner.description && <p className={styles.heroText}>{banner.description}</p>}
          </div>
        </section>
        
        <div className={styles.destinationsCentered}>
          <Destinations />
        </div>
        <Testimonials />
        <BrandsCarousel />
        <Newsletter />
      </main>
    </div>
  );
}