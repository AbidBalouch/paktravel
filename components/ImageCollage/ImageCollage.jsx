// components/ImageCollage/ImageCollage.jsx
// ---------------------------------------------------------------------------
// Ab ye ek SINGLE flat image dikhata hai (ACF field: "collage_image") — ye
// gallery/mosaic nahi hai, poora collage designer ne ek hi image ke tor par
// pehle se bana ke upload kiya hai.
// ---------------------------------------------------------------------------

import Image from "next/image";
import styles from "./ImageCollage.module.css";

export default function ImageCollage({ image, districtName = "" }) {
  if (!image?.url) return null;

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.frame}>
          <Image
            src={image.url}
            alt={image.alt || districtName}
            fill
            sizes="(max-width: 768px) 100vw, 1200px"
            className={styles.image}
            priority={false}
          />
        </div>
      </div>
    </section>
  );
}
