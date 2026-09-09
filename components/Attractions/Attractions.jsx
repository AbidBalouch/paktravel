// components/Attractions/Attractions.jsx
// ---------------------------------------------------------------------------
// Server component — home page ACF se badge/heading/count
// (attractions_badge, attractions_heading, number_of_attractions) aur
// "attraction" CPT se cards fetch karta hai.
// Slider ki interactivity client component me hai: AttractionsSlider.jsx
// ---------------------------------------------------------------------------

import { getAttractionsData } from "@/lib/api";
import AttractionsSlider from "./AttractionsSlider";
import styles from "./Attractions.module.css";

export default async function Attractions() {
  const data = await getAttractionsData();

  if (!data.items.length) return null;

  return (
    <section className={styles.section}>
      <div className={`container ${styles.inner}`}>
        {/* Heading left + arrows right — arrows slider ke andar hain
            (unhein positioning ke liye .inner relative chahiye) */}
        <div className={styles.head}>
          {data.badge && <span className={styles.badge}>{data.badge}</span>}
          {data.heading && <h2 className={styles.heading}>{data.heading}</h2>}
        </div>

        <AttractionsSlider items={data.items} />
      </div>
    </section>
  );
}
