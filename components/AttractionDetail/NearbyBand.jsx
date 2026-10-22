"use client";
// Nearby essentials — maujooda data (WP relationship posts + OpenStreetMap)
// naye design ki green band me, type tabs ke sath. Har card par Directions
// ka working Google Maps link.
import { useState } from "react";
import { UtensilsCrossed, BedDouble, Fuel, Landmark, Cross, Pill, ShieldCheck, Navigation } from "lucide-react";
import styles from "@/app/attractions/[slug]/attraction-new.module.css";

const TABS = [
  { id: "restaurant", label: "Food", Icon: UtensilsCrossed },
  { id: "stay", label: "Stay", Icon: BedDouble },
  { id: "atm", label: "ATM", Icon: Landmark },
  { id: "hospital", label: "Hospital", Icon: Cross },
  { id: "fuel", label: "Fuel", Icon: Fuel },
  { id: "pharmacy", label: "Pharmacy", Icon: Pill },
  { id: "police", label: "Police", Icon: ShieldCheck },
];

export default function NearbyBand({ items }) {
  const available = TABS.filter((t) => items.some((i) => i.type === t.id));
  const [tab, setTab] = useState(available[0]?.id || "");
  if (available.length === 0) return null;
  const ActiveIcon = (available.find((t) => t.id === tab) || available[0]).Icon;
  const list = items.filter((i) => i.type === tab).slice(0, 6);
  return (
    <div>
      <div className={styles.nearTabs}>
        {available.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            className={tab === id ? styles.nearTabActive : styles.nearTab}
            onClick={() => setTab(id)}
            aria-pressed={tab === id}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>
      <div className={styles.nearGrid}>
        {list.map((n, i) => {
          const name = n.name || n.title || "";
          const dirLink =
            n.lat != null && n.lng != null
              ? `https://www.google.com/maps/dir/?api=1&destination=${n.lat},${n.lng}`
              : n.link && n.link.includes("google.com/maps")
                ? n.link
                : null;
          return (
            <article key={i} className={styles.nearCard}>
              <span className={styles.nearIcon}>
                <ActiveIcon size={22} color="#0E6B45" />
              </span>
              <div className={styles.nearBody}>
                <h3 className={styles.nearName}>{name}</h3>
                <div className={styles.nearMeta}>{n.address || ""}</div>
              </div>
              <div className={styles.nearSide}>
                <span className={styles.nearDist}>{n.distanceKm != null ? `${n.distanceKm.toFixed(1)} km` : ""}</span>
                {dirLink && (
                  <a className={styles.nearLink} href={dirLink} target="_blank" rel="noopener noreferrer">
                    <Navigation size={12} /> Directions
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
