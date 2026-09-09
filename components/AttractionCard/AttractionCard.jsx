// components/AttractionCard/AttractionCard.jsx
// ---------------------------------------------------------------------------
// Badge ab item.category se aata hai — ye "attraction_type" taxonomy ka term
// hai (e.g. "Monument", "Fort", "Mosque"), hardcoded "Attraction" text nahi.
// ---------------------------------------------------------------------------

import ListingCard from "@/components/ListingCard/ListingCard";
import styles from "@/components/ListingCard/ListingCard.module.css";

export default function AttractionCard({ item }) {
  const metaLine = item.rating ? (
    <span>
      <span className={styles.ratingStar}>★</span> {item.rating}
    </span>
  ) : null;

  return (
    <ListingCard
      href={item.link}
      external={Boolean(item.link)} // jab internal single-attraction route banega, external={false} kar dein
      image={item.image}
      alt={item.alt || item.title}
      badge={item.category}
      title={item.title}
      metaLine={metaLine}
      addressLine={item.address}
      excerpt={item.excerpt}
      footerText="View Attraction →"
    />
  );
}
