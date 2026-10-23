"use client";
// Design wala newsletter band — peeche WordPress ka CF7 "Newsletter"
// form (ID 467) hai, lekin call server wale raste (/api/newsletter)
// se jati hai taake browser-side env par inhisaar na ho.
import { useState } from "react";
import { Mail, CheckCircle2, AlertCircle } from "lucide-react";
import styles from "./newsletter-band.module.css";

export default function NewsletterBand() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");

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
      // Server wale raste se — seedha WP call NEXT_PUBLIC_WP_URL na hone
      // par gir jata tha (Vercel par wo variable set nahi hai).
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.status === "mail_sent") {
        setStatus("success");
        setMessage(data.message || "Thank you — you're subscribed!");
        setEmail("");
        return;
      }
      setStatus("error");
      setMessage(data.invalid_fields?.[0]?.message || data.message || "Something went wrong. Please try again.");
    } catch {
      setStatus("error");
      setMessage("Unable to subscribe right now. Please try again later.");
    }
  }

  return (
    <div className={styles.newsWrap}>
    <section className={styles.newsBand}>
      <div className={styles.newsText}>
        <h2 className={styles.newsTitle}>Get travel updates</h2>
        <p className={styles.newsSub}>Road closures, new places and seasonal tips. Once a month.</p>
      </div>
      <div>
        <form className={styles.newsForm} onSubmit={handleSubmit}>
          <span className={styles.newsInputWrap}>
            <Mail size={16} color="#52615A" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              aria-label="Email address"
              className={styles.newsInput}
            />
          </span>
          <button type="submit" className={styles.newsBtn} disabled={status === "loading"}>
            {status === "loading" ? "Subscribing…" : "Subscribe"}
          </button>
        </form>
        {message && (
          <p className={status === "success" ? styles.newsOk : styles.newsErr}>
            {status === "success" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />} {message}
          </p>
        )}
      </div>
    </section>
    </div>
  );
}
