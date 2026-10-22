"use client";
// Best time to visit — 12 months ka simple chart (WP best-season points se
// month names parh kar levels bante hain: best / okay / harsh)
import { useState } from "react";
import styles from "@/app/attractions/[slug]/attraction-new.module.css";

const COLORS = { best: "#1F8A5B", ok: "#E0B04B", hot: "#C9D2CD" };
const LABELS = { best: "Best time", ok: "Okay", hot: "Very hot or rainy" };

export default function MonthChart({ months }) {
  const firstBest = Math.max(0, months.findIndex((m) => m.level === "best"));
  const [sel, setSel] = useState(firstBest);
  const cur = months[sel];
  return (
    <div className={styles.monthCard}>
      <div className={styles.monthHead}>
        <h3 className={styles.monthTitle}>Best time to visit</h3>
        <div className={styles.monthLegend}>
          {Object.keys(COLORS).map((k) => (
            <span key={k} className={styles.legendItem}>
              <span className={styles.legendSwatch} style={{ background: COLORS[k] }} /> {LABELS[k]}
            </span>
          ))}
        </div>
      </div>
      <div className={styles.monthGrid}>
        {months.map((m, i) => (
          <button
            key={m.m}
            type="button"
            className={styles.monthBtn}
            style={{ border: i === sel ? "2px solid #0B3D2A" : "2px solid transparent" }}
            onClick={() => setSel(i)}
            aria-pressed={i === sel}
          >
            <span className={styles.monthBar} style={{ background: COLORS[m.level] }} />
            <span style={{ fontWeight: i === sel ? 800 : 500 }}>{m.m}</span>
          </button>
        ))}
      </div>
      <div className={styles.monthDetail}>
        <span className={styles.monthDetailBar} style={{ background: COLORS[cur.level] }} />
        <div>
          <div className={styles.monthDetailTitle}>
            {cur.full} · {LABELS[cur.level]}
          </div>
          <div className={styles.monthDetailNote}>{cur.note}</div>
        </div>
      </div>
    </div>
  );
}
