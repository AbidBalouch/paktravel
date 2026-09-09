// components/PostCard/PostCard.jsx
// ---------------------------------------------------------------------------
// Ye component "type" (attractions/stays/tours/events/restaurants) dekh kar
// OverlayCard ko sahi props bhejta hai — isi wajah se pehle "badge"/naam
// dikhna band tha: PostCard purana version OverlayCard use hi nahi kar raha
// tha. Ab sab 5 tabs isi ek OverlayCard design se render hote hain,
// sirf badge/meta-line/footer text type ke hisab se badalte hain.
// ---------------------------------------------------------------------------

import OverlayCard from "@/components/OverlayCard/OverlayCard";

// Har tab type ke liye: singular badge label + footer text
const TYPE_CONFIG = {
  attractions: { badge: "Attraction", footerText: "View Attraction →" },
  stays: { badge: "Stay", footerText: "View Stay →" },
  tours: { badge: "Tour", footerText: "View Tour →" },
  events: { badge: "Event", footerText: "View Event →" },
  restaurants: { badge: "Restaurant", footerText: "Get Directions →" },
};

function buildMetaLine(item, type) {
  const parts = [];

  if (item.rating) parts.push(`★ ${item.rating}`);

  if (type === "events" && item.date) {
    parts.push(item.time ? `${item.date} • ${item.time}` : item.date);
  } else if (item.price) {
    parts.push(item.price);
  }

  if (parts.length === 0) return null;

  return (
    <>
      {parts.map((p, i) => (
        <span key={i}>{p}</span>
      ))}
    </>
  );
}

export default function PostCard({ item, type }) {
  const config = TYPE_CONFIG[type] || { badge: "", footerText: "View →" };

  return (
    <OverlayCard
      href={item.link}
      external={Boolean(item.link)} // filhaal WordPress permalink hai; jab internal single-post route banega to external={false} kar dein
      image={item.image}
      alt={item.alt || item.title}
      badge={config.badge}
      title={item.title}
      metaLine={buildMetaLine(item, type)}
      addressLine={item.address}
      excerpt={item.excerpt}
      footerText={config.footerText}
    />
  );
}
