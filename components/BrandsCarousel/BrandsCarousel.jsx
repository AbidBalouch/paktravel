// components/BrandsCarousel/BrandsCarousel.jsx
// ---------------------------------------------------------------------------
// Server component — home page ke ACF "brands_carousel" field se partner
// logos fetch karta hai aur ek infinite-loop marquee (auto-scrolling row)
// me chalata hai. Animation pure CSS se hai (koi JS interactivity nahi
// chahiye), isliye ye "use client" ke bina bhi kaam karta hai.
// ---------------------------------------------------------------------------

import Image from "next/image";
import { getBrandsData } from "@/lib/api";
import styles from "./BrandsCarousel.module.css";

export default async function BrandsCarousel() {
  const brands = await getBrandsData();

  // Agar WordPress se koi brand na aaye to section hi render na karo
  if (brands.length === 0) return null;

  // Seamless infinite-loop effect ke liye list ko duplicate kar dete hain.
  // Animation jab pehli list ke end tak pohanchti hai to duplicate list
  // wahin se shuru ho jati hai — isliye koi visible "jump/reset" nahi dikhta.
  const loopBrands = [...brands, ...brands];

  return (
    <section className={styles.section}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.track}>
          {loopBrands.map((brand, index) => (
            // key me index bhi shamil hai kyunki list duplicate hai,
            // sirf brand.id se React ko duplicate keys milte
            <div className={styles.logoWrap} key={`${brand.id}-${index}`}>
              <Image
                src={brand.url}
                alt={brand.alt}
                width={brand.width}
                height={brand.height}
                className={styles.logo}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
