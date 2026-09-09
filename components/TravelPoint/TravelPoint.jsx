// components/TravelPoint/TravelPoint.jsx
// Server component — home page ACF fields se "Travel Point" section ka
// data fetch karta hai (getTravelPointData, lib/api.js me add karna hai).

import Image from "next/image";
import { getTravelPointData } from "@/lib/api";
import styles from "./TravelPoint.module.css";

export default async function TravelPoint() {
  const data = await getTravelPointData();

  return (
    <section className={styles.section}>
      <div className={styles.row}>
        {/* ---------- Left: full-bleed image (viewport edge tak) ---------- */}
        <div className={styles.imageCol}>
          {data.image ? (
            <Image
              src={data.image.url}
              alt={data.image.alt}
              fill
              sizes="(max-width: 900px) 100vw, 55vw"
              className={styles.image}
              priority={false}
            />
          ) : (
            <div className={styles.imagePlaceholder} />
          )}
        </div>

        {/* ---------- Right: content (container width ke andar) ---------- */}
        <div className={styles.content}>
          {data.badge && <span className={styles.badge}>{data.badge}</span>}

          {data.heading && <h2 className={styles.heading}>{data.heading}</h2>}

          {data.description && (
            <p className={styles.description}>{data.description}</p>
          )}

          {data.stats.length > 0 && (
            <div className={styles.statsWrap}>
              <div className={styles.statsGrid}>
                {data.stats.map((stat) => (
                  <div className={styles.statCard} key={stat.label}>
                    <div className={styles.statValue}>{stat.display}</div>
                    <div className={styles.statLabel}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* travel_icon ACF field — agar WordPress se icon na mile to
                  fallback ke tor par phone SVG dikha dete hain. */}
              <span className={styles.iconBadge} aria-hidden="true">
                {data.icon ? (
                  <Image
                    src={data.icon.url}
                    alt={data.icon.alt}
                    width={26}
                    height={26}
                  />
                ) : (
                  <PhoneIcon />
                )}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function PhoneIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.2 1.2.4 2.5.6 3.8.6.6 0 1.1.5 1.1 1.1v3.6c0 .6-.5 1.1-1.1 1.1C10.7 21.6 2.4 13.3 2.4 3.7c0-.6.5-1.1 1.1-1.1H7c.6 0 1.1.5 1.1 1.1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.2 1.1L6.6 10.8Z"
        fill="#003f0d"
      />
    </svg>
  );
}
