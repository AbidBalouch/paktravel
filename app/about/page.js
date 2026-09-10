import Image from "next/image";
import BrandsCarousel from "@/components/BrandsCarousel/BrandsCarousel";
import Newsletter from "@/components/Newsletter/Newsletter";
// Header/Footer yahan import nahi karne — ye pehle se app/layout.js mein
// globally render ho rahe hain (sab pages ko wrap karte hain), dobara yahan
// laga dete to page par Header/Footer 2x dikhta.
import { getAboutPageData, safe, stripHtml } from "@/lib/api";
import styles from "./about.module.css";

export const revalidate = 60; // WordPress se har 60s baad fresh data (ISR)

export default async function AboutPage() {
  const about = await safe(getAboutPageData, null);

  if (!about) {
    return (
      <div className={styles.page}>
        <main>
          <div className={styles.errorBox}>
            About page ka data WordPress se load nahi ho saka. Console log check karein.
          </div>
        </main>
      </div>
    );
  }

  const { heading, banner, story, features, standFor } = about;

  // "Built by travelers, for travelers." → pehle comma tak dark, baqi green
  const commaIndex = heading.indexOf(",");
  const headingFirst = commaIndex !== -1 ? heading.slice(0, commaIndex + 1) : heading;
  const headingRest = commaIndex !== -1 ? heading.slice(commaIndex + 1).trim() : "";

  return (
    <div className={styles.page}>
      <main>
        {/* ---------------- Hero / Banner ---------------- */}
        <section className={styles.hero}>
          <div className={styles.heroBg}>
            {banner.backgroundImage && (
              <Image
                src={banner.backgroundImage.url}
                alt={banner.backgroundImage.alt}
                fill
                sizes="100vw"
                priority
                className={styles.heroBgImage}
              />
            )}
          </div>

          {banner.badge && (
            <div className={styles.heroTop}>
              <span className={styles.heroBadge}>{banner.badge}</span>
            </div>
          )}

          <div className={styles.heroInner}>
            <h1 className={styles.heroTitle}>
              {headingFirst}{" "}
              {headingRest && <span className={styles.heroTitleAccent}>{headingRest}</span>}
            </h1>

            {banner.description && <p className={styles.heroText}>{banner.description}</p>}

            {(banner.primaryButton.label || banner.secondaryButton.label) && (
              <div className={styles.heroActions}>
                {banner.primaryButton.label && (
                  <a href={banner.primaryButton.url} className={styles.btnPrimary}>
                    {banner.primaryButton.label}
                  </a>
                )}
                {banner.secondaryButton.label && (
                  <a href={banner.secondaryButton.url} className={styles.btnSecondary}>
                    {banner.secondaryButton.label}
                    <span className={styles.playIcon}>
                      <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                  </a>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ---------------- Our Story ---------------- */}
        <section className={`${styles.story} container`}>
<div>
  {story.badge && (
    <p className={styles.eyebrow}>
      {stripHtml(story.badge)}
    </p>
  )}

  {story.heading && (
    <h2 className={styles.storyHeading}>
      {stripHtml(story.heading)}
    </h2>
  )}

  {story.paragraphs.map((para, i) => (
    <p key={i} className={styles.storyText}>
      {stripHtml(para)}
    </p>
  ))}
</div>

          <div className={styles.storyMedia}>
            <div className={styles.dotGrid} />
            {story.image && (
              <div className={styles.storyImgFrame}>
                <Image
                  src={story.image.url}
                  alt={story.image.alt}
                  width={475}
                  height={664}
                />
              </div>
            )}
            {/* NOTE: Figma mein 2 images hain, lekin WP mein abhi sirf ek
                "story_image" field hai — dusri image ke liye ACF mein
                naya field add karain jab ready ho */}
          </div>
        </section>

        {/* ---------------- Handpicked For You ---------------- */}
        <section className={`${styles.features} container`}>
          {story.badge && <p className={styles.eyebrow}>Handpicked For You</p>}
          {features.length > 0 && (
            <h2 className={styles.featuresHeading}>Top attractions all over Pakistan</h2>
          )}

          <div className={styles.featureGrid}>
            {features.map((feature, i) => (
              <div key={i} className={styles.featureCard}>
                {feature.icon && (
                  <div className={styles.featureIcon}>
                    <Image
                      src={feature.icon.url}
                      alt={feature.icon.alt}
                      width={28}
                      height={28}
                    />
                  </div>
                )}
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureText}>{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- What We Stand For ---------------- */}
        <section className={styles.standFor}>
          {/* Background flag/mountain image — WordPress se ACF field
              "stand_for_background_image" ke zariye dynamic aata hai.
              Section-level par rakha hai (container ke bahar) taake
              100% viewport width tak edge-to-edge bleed kare. */}
          {standFor.backgroundImage && (
            <Image
              src={standFor.backgroundImage.url}
              alt={standFor.backgroundImage.alt}
              fill
              sizes="100vw"
              className={styles.standBg}
            />
          )}

          <div className="container">
            <div className={styles.standWrap}>
              <div className={styles.standCard}>
                {standFor.badge && <p className={styles.eyebrow}>{standFor.badge}</p>}
                {standFor.heading && (
                  <h2 className={styles.standHeading}>{standFor.heading}</h2>
                )}

                <ul className={styles.standList}>
                  {standFor.items.map((item, i) => (
                    <li
                      key={i}
                      className={`${styles.standItem} ${i === 1 ? styles.standItemActive : ""}`}
                    >
                      <span className={styles.standIcon}>
                        {item.icon ? (
                          <Image src={item.icon.url} alt={item.icon.alt} width={50} height={50} />
                        ) : (
                          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      <div>
                        <h3 className={styles.standItemTitle}>{item.title}</h3>
                        <p className={styles.standItemText}>{item.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
        <BrandsCarousel />
        <Newsletter />
      </main>
    </div>
  );
}