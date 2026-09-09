"use client";

import { useState } from "react";
import styles from "./Newsletter.module.css";
export default function Newsletter({
  badge = "SUBSCRIBE TO OUR NEWSLETTER",
  heading = "Prepare yourself and let’s explore the beauty of the Pakistan",
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const endpoint = `${process.env.NEXT_PUBLIC_WP_URL}/wp-json/simple-newsletter/v1/subscribe`;

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email.trim()) {
      setStatus("error");
      setMessage("Please enter your email address.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          source: "homepage",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setStatus("error");
        setMessage(
          data.message || "Something went wrong. Please try again."
        );
        return;
      }

      setStatus("success");
      setMessage(data.message);
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage(
        "Unable to subscribe right now. Please try again later."
      );
    }
  }

  return (
    <section className={styles.section}>

      {/* Left decorative contour lines */}
      <div className={styles.waves} aria-hidden="true">
      <img src="images/Newletter_immg.svg" alt="" />
      </div>

      <div className={styles.container}>
        <div className={styles.card}>

          {badge && (
            <span className={styles.badge}>
              {badge}
            </span>
          )}

          <h2 className={styles.heading}>
            {heading}
          </h2>

          <form
            onSubmit={handleSubmit}
            className={styles.form}
          >
            <label
              htmlFor="newsletter-email"
              className={styles.srOnly}
            >
              Email address
            </label>

            <span className={styles.mailIcon} aria-hidden="true">
<svg
  width="30"
  height="30"
  viewBox="0 0 30 26"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  preserveAspectRatio="xMidYMid meet"
>
  <path
    fillRule="evenodd"
    clipRule="evenodd"
    d="M8.02326 0C5.76981 0 3.73207 0.567264 2.25301 1.95056C0.759935 3.347 0 5.42072 0 8.08108V17.9189C0 20.5794 0.759935 22.653 2.25301 24.0494C3.73207 25.4328 5.76981 26 8.02326 26H21.9767C24.2302 26 26.268 25.4328 27.7469 24.0494C29.2401 22.653 30 20.5794 30 17.9189V8.08108C30 5.42072 29.2401 3.347 27.7469 1.95056C26.268 0.567264 24.2302 0 21.9767 0H8.02326ZM25.0863 7.88756C25.5435 7.53162 25.6278 6.86965 25.2744 6.40901C24.9211 5.94836 24.2639 5.86349 23.8065 6.21944L16.0663 12.2433C15.4383 12.7323 14.5616 12.7323 13.9334 12.2433L6.1934 6.21944C5.73604 5.86349 5.07882 5.94836 4.72542 6.40901C4.37202 6.86965 4.45628 7.53162 4.91364 7.88756L12.6537 13.9115C14.0357 14.987 15.9642 14.987 17.3461 13.9115L25.0863 7.88756Z"
    fill="#BDC3C7"
  />
</svg>
            </span>

            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              className={styles.input}
              required
            />

            <button
              type="submit"
              disabled={status === "loading"}
              className={styles.button}
            >
              {status === "loading"
                ? "Submitting..."
                : "Subscribe"}
            </button>
          </form>

          {message && (
            <p
              className={`${styles.note} ${
                status === "error" ? styles.noteError : ""
              }`}
            >
              {message}
            </p>
          )}

        </div>
      </div>
    </section>
  );
}