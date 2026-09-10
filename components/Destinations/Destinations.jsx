// components/Destinations/Destinations.jsx
// ---------------------------------------------------------------------------

import Image from "next/image";
import Link from "next/link";
import { getDestinationsData } from "@/lib/api";
import styles from "./Destinations.module.css";

export default async function Destinations() {
  const data = await getDestinationsData();

  // Featured + baqi items ko ek hi list me combine kar dete hain —
  // pehla item hamesha featured (bada) card hoga.
  const cards = data.featured ? [data.featured, ...data.items] : data.items;

  if (cards.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={`container ${styles.inner}`}>
        {data.badge && (
          <span className={styles.badge}>{data.badge}</span>
        )}

        {data.heading && (
          <h2 className={styles.heading}>{data.heading}</h2>
        )}

        <div className={styles.grid}>
          {cards.map((item, index) => {
            const isFeatured = index === 0;

            // lib/api.js ab already ready-made headless "link"
            // (/provinces/<slug>) bhej raha hai — DivisionCard jaisa
            // reliable pattern. Fallback sirf tab chalega agar kabhi
            // "link" field missing ho.
            const href = item.link || (item.slug ? `/provinces/${item.slug}` : null);

            if (!href) return null;

            return (
              <Link
                href={href}
                key={item.id}
                className={`${styles.card} ${
                  isFeatured ? styles.featuredCard : ""
                }`}
                aria-label={item.title}
              >
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    sizes={
                      isFeatured
                        ? "(max-width: 900px) 100vw, 50vw"
                        : "(max-width: 900px) 50vw, 25vw"
                    }
                    className={styles.cardImage}
                    priority={isFeatured}
                  />
                )}

                <div className={styles.cardOverlay} />

                <div className={styles.cardText}>
                  <h3>{item.title}</h3>
                  <p>{item.excerpt}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}