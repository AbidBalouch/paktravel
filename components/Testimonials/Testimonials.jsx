// components/Testimonials/Testimonials.jsx
// ---------------------------------------------------------------------------
// Server component — home page ACF se badge/heading (testimonials_badge /
// testimonial_heading) aur "testimonial" custom post type se reviews
// fetch karta hai. Slider client component me hai.
// ---------------------------------------------------------------------------

import { getTestimonialsData } from "@/lib/api";
import TestimonialsSlider from "./TestimonialsSlider";
import styles from "./Testimonials.module.css";

export default async function Testimonials() {
  const data = await getTestimonialsData();

  if (!data.items.length) return null;

  return (
    <section className={styles.section}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.head}>
          {data.badge && <span className={styles.badge}>{data.badge}</span>}
          {data.heading && <h2 className={styles.heading}>{data.heading}</h2>}
        </div>

        <TestimonialsSlider items={data.items} />
      </div>
    </section>
  );
}
