"use client";
// What this place offers — WP checkbox field (facilities_available) se
// sirf available cheezain; 8 se zyada hon to "Show all" toggle.
import { useState } from "react";
import { Check } from "lucide-react";
import styles from "@/app/attractions/[slug]/attraction-new.module.css";

export default function Facilities({ items }) {
  const [all, setAll] = useState(false);
  if (!items || items.length === 0) return null;
  const shown = all ? items : items.slice(0, 8);
  return (
    <div>
      <div className={styles.facGrid}>
        {shown.map((f) => (
          <div key={f.label} className={styles.facItem}>
            <span className={styles.facCheck}>
              <Check size={15} color="#0E6B45" />
            </span>
            <div>
              <div className={styles.facLabel}>{f.label}</div>
              {f.sub && <div className={styles.facSub}>{f.sub}</div>}
            </div>
          </div>
        ))}
      </div>
      {items.length > 8 && (
        <button type="button" className={styles.readMore} onClick={() => setAll(!all)}>
          {all ? "Show less" : `Show all ${items.length} facilities`}
        </button>
      )}
    </div>
  );
}
