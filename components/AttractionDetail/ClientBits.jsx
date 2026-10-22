"use client";
// Chhote interactive hisse: Save, Share, Open-now status, About read-more
import { useEffect, useState } from "react";
import { Heart, Share2, Check } from "lucide-react";
import styles from "@/app/attractions/[slug]/attraction-new.module.css";

const KEY = "tp-saved-places";

export function SaveButton({ slug, title }) {
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    try {
      const list = JSON.parse(localStorage.getItem(KEY) || "[]");
      setSaved(list.includes(slug));
    } catch {}
  }, [slug]);
  function toggle() {
    try {
      const list = JSON.parse(localStorage.getItem(KEY) || "[]");
      const next = saved ? list.filter((s) => s !== slug) : [...list, slug];
      localStorage.setItem(KEY, JSON.stringify(next));
      setSaved(!saved);
    } catch {}
  }
  return (
    <button type="button" onClick={toggle} className={styles.ghostBtn} aria-pressed={saved}>
      <Heart size={17} fill={saved ? "#0E6B45" : "none"} color={saved ? "#0E6B45" : "#1C2B24"} />
      {saved ? "Saved" : "Save"}
    </button>
  );
}

export function ShareButton({ title }) {
  const [done, setDone] = useState(false);
  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      throw new Error("no-share");
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        setDone(true);
        setTimeout(() => setDone(false), 2000);
      } catch {}
    }
  }
  return (
    <button type="button" onClick={share} className={styles.ghostBtn}>
      {done ? <Check size={17} color="#0E6B45" /> : <Share2 size={17} />}
      {done ? "Link copied" : "Share"}
    </button>
  );
}

// Open/Closed status Pakistan time (Asia/Karachi) ke hisab se browser me
export function OpenNow({ openTime, closeTime }) {
  const [now, setNow] = useState(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);
  if (!openTime || !closeTime) return null;
  const fmt = (t) => {
    const [h, m] = t.split(":").map(Number);
    if (Number.isNaN(h)) return t;
    const hr = ((h + 11) % 12) + 1;
    return `${hr}:${String(m || 0).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
  };
  let open = null;
  if (now) {
    const pkt = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Karachi" }));
    const cur = pkt.getHours() * 60 + pkt.getMinutes();
    const [oh, om] = openTime.split(":").map(Number);
    const [ch, cm] = closeTime.split(":").map(Number);
    if (!Number.isNaN(oh) && !Number.isNaN(ch)) open = cur >= oh * 60 + (om || 0) && cur < ch * 60 + (cm || 0);
  }
  return (
    <div className={styles.visitStatus}>
      <span className={styles.statusDot} style={{ background: open === false ? "#C0392B" : "#1F8A5B" }} />
      <span className={styles.statusText}>{open === false ? "Closed" : "Open now"}</span>
      <span className={styles.statusSub}>Closes {fmt(closeTime)}</span>
    </div>
  );
}

export function AboutText({ title, text }) {
  const [open, setOpen] = useState(false);
  if (!text) return null;
  const long = text.length > 520;
  const shown = open || !long ? text : text.slice(0, 520).trimEnd() + "…";
  return (
    <div>
      <p className={styles.aboutP}>
        <strong>{title}</strong> — {shown}
      </p>
      {long && (
        <button type="button" className={styles.readMore} onClick={() => setOpen(!open)}>
          {open ? "Read less" : "Read more"}
        </button>
      )}
    </div>
  );
}
