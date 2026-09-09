"use client";
// components/Attractions/AttractionsSlider.jsx
// ---------------------------------------------------------------------------
// Client component — scroll-snap slider + custom prev/next arrows
// (design ke mutabiq: prev = outlined circle, next = solid green circle).
// Koi external library nahi.
// ---------------------------------------------------------------------------

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import styles from "./Attractions.module.css";

export default function AttractionsSlider({ items }) {
  const trackRef = useRef(null);

  // Arrows disable karne ke liye start/end detection
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const updateArrows = () => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 5);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 5);
  };

  useEffect(() => {
    updateArrows();
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows);
  }, []);

  // Ek card + gap jitna scroll — width dynamically li jati hai taake
  // har breakpoint par sahi distance move ho.
  const scrollByCard = (direction) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector(`.${styles.card}`);
    const step = card ? card.offsetWidth + 20 : el.clientWidth * 0.8;
    el.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  return (
    <>
      {/* ---------- Arrows (heading row ke right side me) ---------- */}
      <div className={styles.arrows}>
        <button
          type="button"
          className={`${styles.arrow} ${styles.arrowGhost}`}
          onClick={() => scrollByCard(-1)}
          disabled={atStart}
          aria-label="Previous attractions"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          className={`${styles.arrow} ${styles.arrowSolid}`}
          onClick={() => scrollByCard(1)}
          disabled={atEnd}
          aria-label="Next attractions"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* ---------- Track ---------- */}
      <div className={styles.track} ref={trackRef} onScroll={updateArrows}>
        {items.map((item) => (
          <a href={item.link} key={item.id} className={styles.card} aria-label={item.title}>
            {item.image && (
              <Image
                src={item.image}
                alt={item.alt}
                fill
                sizes="(max-width: 600px) 80vw, (max-width: 1024px) 45vw, 25vw"
                className={styles.image}
              />
            )}
            {/* Neeche gradient taake white text har image par readable rahe */}
            <span className={styles.overlay} />
            <span className={styles.cardText}>
              <span className={styles.cardTitle}>{item.title}</span>
              {item.location && <span className={styles.cardMeta}>{item.location}</span>}
            </span>
          </a>
        ))}
      </div>
    </>
  );
}
