"use client";
// components/TestimonialForm/TestimonialForm.jsx

// ---------------------------------------------------------------------------

import { useState, useRef, useEffect } from "react";
import styles from "./TestimonialForm.module.css";

const STARS = [1, 2, 3, 4, 5];

export default function TestimonialForm() {
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");
  const fileInputRef = useRef(null);

  // Object URL cleanup — memory leak se bachne ke liye
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function removeImage() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function resetForm() {
    setName("");
    setDesignation("");
    setReview("");
    setRating(0);
    removeImage();
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!name.trim()) {
      setStatus("error");
      setMessage("Please enter your name.");
      return;
    }
    if (!review.trim()) {
      setStatus("error");
      setMessage("Please write your review.");
      return;
    }
    if (rating < 1) {
      setStatus("error");
      setMessage("Please select a star rating.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("designation", designation.trim());
      formData.append("review", review.trim());
      formData.append("rating", String(rating));
      if (image) formData.append("image", image);

      const res = await fetch("/api/testimonials", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setStatus("error");
        setMessage(data.message || "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
      setMessage(data.message || "Thank you! Your review has been submitted.");
      resetForm();
    } catch {
      setStatus("error");
      setMessage("Unable to submit right now. Please try again later.");
    }
  }

  const displayRating = hoverRating || rating;

  return (
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>Share Your Experience</span>
          <h2 className={styles.heading}>Leave a review for fellow travelers</h2>
          <p className={styles.subheading}>
            Your story helps others plan their next trip across Pakistan.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.topRow}>
            {/* ---------------- Photo upload (optional) ---------------- */}
            <div className={styles.avatarField}>
              <input
                ref={fileInputRef}
                id="testimonial-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className={styles.avatarInput}
              />
              <label htmlFor="testimonial-image" className={styles.avatarLabel}>
                {previewUrl ? (
                  <img src={previewUrl} alt="" className={styles.avatarPreview} />
                ) : (
                  <span className={styles.avatarPlaceholder} aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M4 16.5V6a2 2 0 0 1 2-2h3l1.6-2h3.8L16 4h2a2 2 0 0 1 2 2v10.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
                      <circle cx="12" cy="11" r="3.4" />
                    </svg>
                  </span>
                )}
                <span className={styles.avatarBadge} aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </span>
              </label>
              {previewUrl && (
                <button type="button" onClick={removeImage} className={styles.removePhoto}>
                  Remove photo
                </button>
              )}
              <span className={styles.avatarHint}>Photo (optional)</span>
            </div>

            {/* ---------------- Name + Destination ---------------- */}
            <div className={styles.fields}>
              <div className={styles.field}>
                <label htmlFor="testimonial-name" className={styles.label}>
                  Your name
                </label>
                <input
                  id="testimonial-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ayesha Khan"
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="testimonial-designation" className={styles.label}>
                  Where did you travel to?
                </label>
                <input
                  id="testimonial-designation"
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Hunza Valley, Gilgit-Baltistan"
                  className={styles.input}
                />
              </div>
            <div className={styles.field}>
            <label htmlFor="testimonial-review" className={styles.label}>
              Your review
            </label>
            <textarea
              id="testimonial-review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Tell fellow travelers about your experience…"
              className={styles.textarea}
              rows={4}
              required
            />
            </div>
            </div>
          </div>


          {/* ---------------- Star rating ---------------- */}
          <div className={styles.ratingField}>
            <span className={styles.label}>Your rating</span>
            <div
              className={styles.stars}
              role="radiogroup"
              aria-label="Star rating"
              onMouseLeave={() => setHoverRating(0)}
            >
              {STARS.map((star) => (
                <button
                  key={star}
                  type="button"
                  role="radio"
                  aria-checked={rating === star}
                  aria-label={`${star} star${star > 1 ? "s" : ""}`}
                  className={styles.starBtn}
                  onMouseEnter={() => setHoverRating(star)}
                  onFocus={() => setHoverRating(star)}
                  onClick={() => setRating(star)}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="34"
                    height="34"
                    fill={star <= displayRating ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="1.4"
                    className={star <= displayRating ? styles.starFilled : styles.starEmpty}
                  >
                    <path d="M12 3.5l2.6 5.35 5.9.86-4.27 4.16 1.01 5.88L12 16.9l-5.24 2.85 1.01-5.88L3.5 9.71l5.9-.86L12 3.5Z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={status === "loading"}>
            {status === "loading" ? "Submitting…" : "Submit review"}
          </button>

          {message && (
            <p className={`${styles.note} ${status === "error" ? styles.noteError : styles.noteSuccess}`}>
              {message}
            </p>
          )}
        </form>
      </div>
  );
}
