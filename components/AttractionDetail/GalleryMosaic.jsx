"use client";
// Simple gallery mosaic — pehli image bari, baqi chhoti grid me.
// "View all" se poori gallery khul jati hai (koi complex lightbox nahi).
import { useState } from "react";
import Image from "next/image";
import { LayoutGrid } from "lucide-react";
import styles from "@/app/attractions/[slug]/attraction-new.module.css";

export default function GalleryMosaic({ images, title }) {
  const [all, setAll] = useState(false);
  if (!images || images.length === 0) return null;
  const shown = all ? images : images.slice(0, 5);
  return (
    <div>
      <div className={styles.mosaic}>
        {shown.map((img, i) => (
          <div key={img.id || i} className={i === 0 ? styles.mosaicMain : styles.mosaicCell}>
            <Image src={img.url} alt={img.alt || title} fill sizes="(max-width: 768px) 100vw, 40vw" style={{ objectFit: "cover" }} />
            {!all && i === 4 && images.length > 5 && (
              <button type="button" className={styles.viewAllBtn} onClick={() => setAll(true)}>
                <LayoutGrid size={16} /> View all {images.length} photos
              </button>
            )}
          </div>
        ))}
      </div>
      {all && images.length > 5 && (
        <button type="button" className={styles.readMore} onClick={() => setAll(false)}>
          Show fewer photos
        </button>
      )}
    </div>
  );
}
