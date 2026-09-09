// components/DivisionCard/DivisionCard.jsx
// ---------------------------------------------------------------------------
// Ek division/region ka card — image, attraction count badge (top-left),
// title, aur short description. Poora card clickable link hai us division
// ke apne page ki taraf (/destinations/[province]/[division]).
// ---------------------------------------------------------------------------

import Image from "next/image";
import Link from "next/link";
import styles from "./DivisionCard.module.css";

export default function DivisionCard({ division }) {
  return (
    <Link href={division.link} className={styles.card} aria-label={division.title}>
      {division.image && (
        <Image
          src={division.image}
          alt={division.alt}
          fill
          sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={styles.image}
        />
      )}

      <div className={styles.overlay} />

      {division.attractionsCount > 0 && (
        <span className={styles.countBadge}>
          {division.attractionsCount} Attraction{division.attractionsCount === 1 ? "" : "s"}
        </span>
      )}

      <div className={styles.text}>
        <h3>{division.title}</h3>
        {division.excerpt && <p>{division.excerpt}</p>}
      </div>
    </Link>
  );
}
