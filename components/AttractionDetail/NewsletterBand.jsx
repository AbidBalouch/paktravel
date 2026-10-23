"use client";
// Design wala newsletter band — peeche WordPress ka maujooda CF7
// "Newsletter" form (ID 467) hi call hota hai (pehle wale component
// wali hi proven integration), sirf look nayi design ki hai.
import { useState } from "react";
import { Mail, CheckCircle2, AlertCircle } from "lucide-react";
import styles from "@/app/attractions/[slug]/attraction-new.module.css";

const CF7_FORM_ID = 467;
const CF7_EMAIL_FIELD_NAME = "your-email";

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
      const formData = new FormData();
      formData.append(CF7_EMAIL_FIELD_NAME, email);
      formData.append("_wpcf7", CF7_FORM_ID);
      formData.append("_wpcf7_version", "5.9");
      formData.append("_wpcf7_locale", "en_US");
      formData.append("_wpcf7_unit_tag", `wpcf7-f${CF7_FORM_ID}-p0-o1`);
      formData.append("_wpcf7_container_post", "0");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_WP_URL}/wp-json/contact-form-7/v1/contact-forms/${CF7_FORM_ID}/feedback`,
        { method: "POST", body: formData },
      );
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
  );
}
