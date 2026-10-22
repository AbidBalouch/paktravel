"use client";
// Reviews — rating summary (WP star_rating/total_reviews), dummy review
// cards (abhi ke liye), aur "Write a review" par maujooda WP-connected
// TestimonialForm popup me khulta hai. Koi progress bars nahi.
import { useState } from "react";
import { Star, X, PenLine } from "lucide-react";
import TestimonialForm from "@/components/TestimonialForm/TestimonialForm";
import styles from "@/app/attractions/[slug]/attraction-new.module.css";

function Stars({ n = 5 }) {
  return (
    <span className={styles.stars} aria-label={`${n} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={14} fill={i <= n ? "#E0A21B" : "none"} color="#E0A21B" />
      ))}
    </span>
  );
}

export default function ReviewSection({ rating, totalReviews, reviews, placeName }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.reviewWrap}>
      <div className={styles.reviewSummary}>
        <div className={styles.reviewBig}>{rating ? rating.toFixed(1) : "—"}</div>
        <Stars n={rating ? Math.round(rating) : 5} />
        <div className={styles.reviewFav}>Traveller favourite</div>
        <p className={styles.reviewBased}>
          {totalReviews ? `Based on ${totalReviews.toLocaleString()} traveller reviews` : "Be the first to review this place"}
        </p>
        <button type="button" className={styles.primaryBtn} onClick={() => setOpen(true)}>
          <PenLine size={16} /> Write a review
        </button>
      </div>
      <div className={styles.reviewGrid}>
        {reviews.map((r, i) => (
          <article key={i} className={styles.reviewCard}>
            <div className={styles.reviewHead}>
              <span className={styles.reviewAvatar}>{r.initials}</span>
              <div>
                <div className={styles.reviewName}>{r.name}</div>
                <div className={styles.reviewMeta}>{r.meta}</div>
              </div>
            </div>
            <div className={styles.reviewStarsRow}>
              <Stars n={r.stars} /> <span className={styles.reviewWhen}>· {r.when}</span>
            </div>
            <p className={styles.reviewText}>{r.text}</p>
          </article>
        ))}
      </div>

      {open && (
        <div className={styles.modalOverlay} onClick={() => setOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <button type="button" className={styles.modalClose} onClick={() => setOpen(false)} aria-label="Close">
              <X size={20} />
            </button>
            <h3 className={styles.modalTitle}>Write a review{placeName ? ` — ${placeName}` : ""}</h3>
            <TestimonialForm />
          </div>
        </div>
      )}
    </div>
  );
}
