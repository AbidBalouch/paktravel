// components/TourCard/TourCard.jsx
// ---------------------------------------------------------------------------
// Badge ab item.category se aata hai — "tour_type" taxonomy ka term.
// ---------------------------------------------------------------------------

import ListingCard from "@/components/ListingCard/ListingCard";
import styles from "@/components/ListingCard/ListingCard.module.css";

export default function TourCard({ item }) {
  const metaLine = (
    <>
      {item.rating && (
        <span>
          <span className={styles.ratingStar}>★</span> {item.rating}
        </span>
      )}
      {item.price && <span>{item.price}</span>}
    </>
  );

  return (
    <ListingCard
      href={item.link}
      external={Boolean(item.link)}
      image={item.image}
      alt={item.alt || item.title}
      badge={item.category}
      title={item.title}
      metaLine={metaLine}
      addressLine={item.address}
      excerpt={item.excerpt}
      footerText="View Tour →"
    />
  );
}
