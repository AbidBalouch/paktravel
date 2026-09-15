// components/Breadcrumb/Breadcrumb.jsx
// ---------------------------------------------------------------------------
// Generic breadcrumb trail — "items" ek array hai jahan har item
// { label, href } hota hai. Aakhri item hamesha current page hai (link
// nahi banta, sirf text dikhta hai).
//
// Example (District page):
//   <Breadcrumb
//     items={[
//       { label: "Home", href: "/" },
//       { label: district.breadcrumb.province?.name, href: `/provinces/${district.breadcrumb.province?.slug}` },
//       { label: district.breadcrumb.division?.name, href: `/provinces/${district.breadcrumb.province?.slug}/${district.breadcrumb.division?.slug}` },
//       { label: district.title }, // current page — no href
//     ]}
//   />
// ---------------------------------------------------------------------------

import Link from "next/link";
import styles from "./Breadcrumb.module.css";

export default function Breadcrumb({ items = [] }) {
  const validItems = items.filter((item) => item?.label);

  if (validItems.length === 0) return null;

  return (
    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
      <ol className={styles.list}>
        {validItems.map((item, i) => {
          const isLast = i === validItems.length - 1;

          return (
            <li key={i} className={styles.item}>
              {!isLast && item.href ? (
                <Link href={item.href} className={styles.link}>
                  {item.label}
                </Link>
              ) : (
                <span className={styles.current} aria-current={isLast ? "page" : undefined}>
                  {item.label}
                </span>
              )}

              {!isLast && (
                <span className={styles.separator} aria-hidden="true">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
