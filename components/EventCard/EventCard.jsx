// components/EventCard/EventCard.jsx
// ---------------------------------------------------------------------------
// Badge ab item.category se aata hai — "event_type" taxonomy ka term
// (e.g. "Festival", "Ceremony"). Meta line mein rating ki jagah date/time.
// ---------------------------------------------------------------------------

import ListingCard from "@/components/ListingCard/ListingCard";

export default function EventCard({ item }) {
  const metaLine =
    item.date && (item.time ? `${item.date} • ${item.time}` : item.date);

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
      footerText="View Event →"
    />
  );
}
