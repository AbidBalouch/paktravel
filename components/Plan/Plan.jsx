// components/Plan/Plan.jsx
// Server component — "Why plan here" section

import Image from "next/image";
import { getPlanData } from "@/lib/api";
import styles from "./Plan.module.css";

const planIcons = [
  "/images/transport.svg",
  "/images/guide.svg",
  "/images/events.svg",
];

export default async function Plan() {
  const data = await getPlanData();

  return (
    <section className={styles.section}>
      <div className={`container ${styles.inner}`}>
        {/* ---------- Left: content + feature list ---------- */}
        <div className={styles.content}>
          {data.badge && (
            <span className={styles.badge}>{data.badge}</span>
          )}

          {data.heading && (
            <h2
              className={styles.heading}
              dangerouslySetInnerHTML={{ __html: data.heading }}
            />
          )}

          {data.description && (
            <p className={styles.description}>{data.description}</p>
          )}

          <ul className={styles.list}>
            {data.items.map((item, index) => (
              <li key={item.key} className={styles.listItem}>
                <span className={styles.iconBox}>
                  {planIcons[index] && (
                    <Image
                      src={planIcons[index]}
                      alt=""
                      width={40}
                      height={40}
                      className={styles.icon}
                    />
                  )}
                </span>

                <div>
                  <h3 className={styles.itemTitle}>{item.title}</h3>

                  {item.description && (
                    <p className={styles.itemText}>
                      {item.description}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* ---------- Right: image + decorative shapes ---------- */}
        <div className={styles.media}>
          <span className={styles.dots} aria-hidden="true" />

          {data.image?.url && (
            <Image
              src={data.image.url}
              alt={data.image.alt || "Plan your trip"}
              width={620}
              height={520}
              className={styles.image}
            />
          )}
        </div>
      </div>
    </section>
  );
}