"use client";
// components/ProvinceExplorer/ProvinceExplorer.jsx
// ---------------------------------------------------------------------------

import { useState, useMemo } from "react";
import Image from "next/image";
import DivisionCard from "@/components/DivisionCard/DivisionCard";
import styles from "./ProvinceExplorer.module.css";

export default function ProvinceExplorer({ province }) {
  const { heroImage, badge, title, tagline, description, divisions = [] } = province;
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return divisions;
    const q = query.toLowerCase();
    return divisions.filter(
      (d) =>
        d.title.toLowerCase().includes(q) || d.excerpt.toLowerCase().includes(q)
    );
  }, [query, divisions]);

  return (
    <>
      {/* ================= Hero / Banner (search bar included) ================= */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          {heroImage && (
            <Image
              src={heroImage.url}
              alt={heroImage.alt}
              fill
              sizes="100vw"
              priority
              className={styles.heroBgImage}
            />
          )}
        </div>

        {badge && (
          <div className={styles.heroTop}>
            <span className={styles.heroBadge}>{badge}</span>
          </div>
        )}

        <div className={styles.heroInner}>
          {/* Figma: "Punjab" (green) : The Enduring Spirit Of Pakistan (dark) */}
          <h1 className={styles.heroTitle}>
            <span className={styles.heroTitleAccent}>{title}</span>
            {tagline && <>: {tagline}</>}
          </h1>

          {description && <p className={styles.heroText}>{description}</p>}

          <div className={styles.searchBarWrap}>
            <div className={styles.searchBar}>
              <span className={styles.searchIconLeft} aria-hidden="true">
                🍃
              </span>
              <input
                type="text"
                placeholder="Search Destination"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className={styles.searchInput}
                aria-label="Search destination"
              />
              <span className={styles.searchIconRight} aria-hidden="true">
                ⌕
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= Divisions Grid (separate section, plain bg) ================= */}
      <section className={styles.section}>
        <div className="container">
          {divisions.length === 0 ? (
            <p className={styles.noResults}>
              “No divisions have been added for this province yet.”
            </p>
          ) : filtered.length === 0 ? (
            <p className={styles.noResults}>“No destination was found with this name.”</p>
          ) : (
            <div className={styles.grid}>
              {filtered.map((division) => (
                <DivisionCard key={division.id} division={division} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
