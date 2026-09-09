"use client";
// components/Testimonials/TestimonialsSlider.jsx
// ---------------------------------------------------------------------------
// Client component — center me ek waqt par ek testimonial card,
// dono taraf round arrows (left = solid green, right = outlined) aur
// neeche dots. Slider CSS scroll-snap se chalta hai (koi library nahi),
// mobile par swipe bhi work karta hai.
// ---------------------------------------------------------------------------

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import styles from "./Testimonials.module.css";

export default function TestimonialsSlider({ items }) {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);

  // Scroll position se active slide nikalte hain (dots ke liye)
  const updateActive = () => {
    const el = trackRef.current;
    if (!el) return;
    setActive(Math.round(el.scrollLeft / el.clientWidth));
  };

  useEffect(() => {
    updateActive();
    window.addEventListener("resize", updateActive);
    return () => window.removeEventListener("resize", updateActive);
  }, []);

  // Loop wala behaviour: aakhri slide ke baad wapas pehli par
  const go = (direction) => {
    const el = trackRef.current;
    if (!el) return;
    const next = (active + direction + items.length) % items.length;
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
  };

  const goTo = (index) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className={styles.sliderWrap}>
      {/* Decorative dotted pattern (design ke top-right corner wala) */}
      <span className={styles.dotPattern} aria-hidden="true" />

      <button
        type="button"
        className={`${styles.arrow} ${styles.arrowLeft}`}
        onClick={() => go(-1)}
        aria-label="Previous testimonial"
      >
        <svg width="25" height="25" viewBox="0 0 24 24" fill="none">
          <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className={styles.track} ref={trackRef} onScroll={updateActive}>
        {items.map((item) => (
          <div className={styles.slide} key={item.id}>
            <article className={styles.card}>
              {/* Avatar — featured image na ho to naam ka pehla letter */}
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.alt}
                  width={72}
                  height={72}
                  className={styles.avatar}
                />
              ) : (
                <span className={styles.avatarFallback}>
                  {item.title?.charAt(0) || "?"}
                </span>
              )}

              <h3 className={styles.name}>{item.title}</h3>
              <p className={styles.role}>{item.role}</p>

              {/* Rating — WordPress me abhi rating field nahi hai,
                  isliye 5 stars static hain. ACF field add ho to
                  item.rating map kar dena. */}
              <div className={styles.stars} aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>

              <p className={styles.quote}>{item.content}</p>
            </article>
          </div>
        ))}
      </div>

      <button
        type="button"
        className={`${styles.arrow} ${styles.arrowRight}`}
        onClick={() => go(1)}
        aria-label="Next testimonial"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* ---------- Dots ---------- */}
      <div className={styles.dots}>
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={`${styles.dot} ${index === active ? styles.dotActive : ""}`}
            onClick={() => goTo(index)}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
