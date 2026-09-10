import Link from "next/link";
import styles from "./OverlayCard.module.css";

/**
 * Generic dark-overlay photo card — image (ya icon fallback) + badge +
 * gradient overlay + text block. Reusable across Nearby Essentials,
 * Recently Added (Community), aur future Destination/City listing grids.
 */
export default function OverlayCard({
    href,
    external = false,
    image,
    alt = "",
    badge,
    FallbackIcon,
    fallbackColor = "#666",
    title,
    metaLine,
    addressLine,
    excerpt,
    footerText,
}) {
    const content = (
        <>
            {image ? (
                <img src={image} alt={alt} className={styles.image} />
            ) : (
                FallbackIcon && (
                    <div className={styles.iconFallback} style={{ background: fallbackColor }}>
                        <FallbackIcon size={44} color="#fff" strokeWidth={1.5} />
                    </div>
                )
            )}

            {badge && <span className={styles.badge}>{badge}</span>}
            <div className={styles.overlay} />

            <div className={styles.info}>
                {title && <h4 className={styles.title}>{title}</h4>}
                {metaLine && <div className={styles.meta}>{metaLine}</div>}
                {addressLine && <p className={styles.address}>📍 {addressLine}</p>}
                {excerpt && <p className={styles.excerpt}>{excerpt}</p>}
                {footerText && <span className={styles.footer}>{footerText}</span>}
            </div>
        </>
    );

    if (external) {
        return (
            <a href={href} target="_blank" rel="noopener noreferrer" className={styles.card}>
                {content}
            </a>
        );
    }

    return (
        <Link href={href} className={styles.card}>
            {content}
        </Link>
    );
}