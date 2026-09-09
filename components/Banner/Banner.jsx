// components/Banner/Banner.jsx
// Server component — home page ACF fields se banner ka data fetch karta hai.

import Image from "next/image";
import { getBannerData } from "@/lib/api";
import styles from "./Banner.module.css";

export default async function Banner() {
  const data = await getBannerData();

  return (
    <section className={styles.hero}>
      {/* Decorative blurred blobs — Figma design ka background effect,
          in ka koi API data nahi hai isliye purely CSS/SVG se banaya hai */}
      <div className={styles.blobTopRight} />
      <div className={styles.blobBottomLeft} />

      <div className={`container ${styles.inner}`}>
        {/* ---------- Left: content ---------- */}
        <div className={styles.content}>
          {data.badge && (
            <div className={styles.badge}>
              <span>{data.badge}</span>
              <span className={styles.badgeDot} />
            </div>
          )}

          {/* banner_heading WordPress se HTML ke sath aata hai
              (jaise: From Mountains <span>to Memories</span>.)
              isliye dangerouslySetInnerHTML use kiya hai — content
              trusted WordPress admin se aa raha hai. */}
          {data.heading && (
            <h1
              className={styles.heading}
              dangerouslySetInnerHTML={{ __html: data.heading }}
            />
          )}

          {data.description && <p className={styles.description}>{data.description}</p>}

          <div className={styles.buttonRow}>
            {data.primaryButton?.text && (
              <a
                href={data.primaryButton.url}
                target={data.primaryButton.target}
                className={styles.primaryBtn}
              >
                {data.primaryButton.text}
              </a>
            )}
            {data.secondaryButton?.text && (
              <a
                href={data.secondaryButton.url}
                target={data.secondaryButton.target}
                className={styles.secondaryBtn}
              >
                {data.secondaryButton.text}
                <Image src="/images/secondar_btn.svg" alt="btn" width={20}height={20}/>
              </a>
            )}
          </div>
        </div>

        {/* ---------- Right: image ---------- */}
        <div className={styles.imageWrap}>
          {data.bannerImage ? (
            <Image
              src={data.bannerImage.url}
              alt={data.bannerImage.alt}
              width={data.bannerImage.width}
              height={data.bannerImage.height}
              className={styles.image}
              priority
            />
          ) : (
            <div className={styles.imagePlaceholder} />
          )}
        </div>
      </div>
    </section>
  );
}

function ArrowIcon({ dark }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke={dark ? "#1b1b1b" : "#ffffff"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlaneIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M21 3 3 10l7 2 2 7 9-16Z"
        stroke="#003f0d"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MarkerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 22s7-7.2 7-12a7 7 0 1 0-14 0c0 4.8 7 12 7 12Z"
        fill="#ffffff"
      />
      <circle cx="12" cy="10" r="2.5" fill="#003f0d" />
    </svg>
  );
}
