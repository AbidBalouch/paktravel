// components/RestaurantCard/RestaurantCard.jsx
// ---------------------------------------------------------------------------
// Badge ab item.category se aata hai. Agar "restaurant_type" taxonomy
// WordPress mein nahi banayi, ye automatically "Restaurant" fallback ho
// jata hai (api.js ke andar getPostsByDestinationTerm mein handle hota hai).
// ---------------------------------------------------------------------------

import ListingCard from "@/components/ListingCard/ListingCard";
import styles from "@/components/ListingCard/ListingCard.module.css";

export default function RestaurantCard({ item }) {
  const metaLine = item.rating ? (
    <span>
      <span className={styles.ratingStar}>★</span> {item.rating}
    </span>
  ) : null;
  // NOTE: screenshot mein "3.1 km away" bhi hai — ye user ki live location
  // (geolocation) aur restaurant coordinates ke beech calculate hota hai,
  // WordPress data nahi hai. Filhaal skip kiya hai.

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
      footerText="Get Directions →"
    />
  );
}
