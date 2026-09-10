"use client";
import { useState } from "react";
import { UtensilsCrossed, BedDouble, Fuel, Landmark, Cross, Pill, ShieldCheck, Star, MapPin } from "lucide-react";
import OverlayCard from "@/components/Cards/OverlayCard";
import styles from "@/app/attractions/[slug]/attractions.module.css";

const TYPE_LABELS = {
    restaurant: "Restaurants",
    stay: "Stays",
    fuel: "Fuel",
    atm: "ATMs",
    hospital: "Hospitals",
    pharmacy: "Pharmacy",
    police: "Police",
};

const TYPE_ICON = {
    restaurant: { Icon: UtensilsCrossed, color: "#e8734a" },
    stay: { Icon: BedDouble, color: "#3b6fd6" },
    fuel: { Icon: Fuel, color: "#e0a800" },
    atm: { Icon: Landmark, color: "#2f80c4" },
    hospital: { Icon: Cross, color: "#d64545" },
    pharmacy: { Icon: Pill, color: "#1f8a3d" },
    police: { Icon: ShieldCheck, color: "#2c3e50" },
};

// Sirf ye 2 types WP se aate hain aur inki photo ho sakti hai — inhi ke
// liye dark photo-overlay card design use hoga. Baaki (OSM se) info-card
// design use karenge.
const PHOTO_TYPES = ["restaurant", "stay"];

const TAB_ORDER = ["restaurant", "stay", "fuel", "atm", "hospital", "pharmacy", "police"];
const ITEMS_PER_PAGE = 8;

export default function NearbyEssentialsTabs({ items }) {
    const availableTypes = TAB_ORDER.filter((type) => items.some((i) => i.type === type));
    const [activeType, setActiveType] = useState(availableTypes[0] || "");
    const [page, setPage] = useState(1);

    const filtered = items.filter((i) => i.type === activeType);
    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    const pageItems = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    function handleTabClick(type) {
        setActiveType(type);
        setPage(1);
    }

    if (availableTypes.length === 0) return null;

    // Restaurant/Stay — photo (ya color-icon fallback agar photo na ho) +
    // dark gradient overlay, jaisa pehle design hua tha.
    function renderPhotoCard(item) {
        return (
            <OverlayCard
                key={item.id}
                href={item.link}
                external={item.link?.startsWith("http")}
                image={item.image}
                alt={item.alt}
                badge={TYPE_LABELS[item.type]}
                FallbackIcon={TYPE_ICON[item.type]?.Icon}
                fallbackColor={TYPE_ICON[item.type]?.color}
                title={item.title}
                metaLine={
                    <>
                        {item.rating != null && <span>⭐ {item.rating}</span>}
                        {item.distanceKm != null && <span>📍 {item.distanceKm} km away</span>}
                    </>
                }
                addressLine={item.address}
                footerText="Get Directions →"
            />
        );
    }

    // Fuel/ATM/Hospital/Pharmacy/Police — koi photo kabhi nahi hoti (OSM se
    // aata hai), is liye light info-card design (Image 3 reference jaisa).
    function renderInfoCard(item) {
        return (

            <a href={item.link}
                key={item.id}
                className={styles.osmCard}
                target={item.link?.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
            >
                <span className={styles.osmBadge}>{TYPE_LABELS[item.type]}</span>
                <h4 className={styles.osmTitle}>{item.title}</h4>

                <div className={styles.osmMetaRow}>
                    {item.rating != null && (
                        <span className={styles.osmMetaItem}>
                            <Star size={14} fill="#f5a623" color="#f5a623" /> {item.rating}
                        </span>
                    )}
                    {item.rating != null && item.distanceKm != null && <span className={styles.osmDivider}>|</span>}
                    {item.distanceKm != null && (
                        <span className={styles.osmMetaItem}>
                            <MapPin size={14} /> {item.distanceKm} km away
                        </span>
                    )}
                </div>

                {
                    item.address && (
                        <div className={styles.osmAddressRow}>
                            <MapPin size={14} />
                            <span>{item.address}</span>
                        </div>
                    )
                }

                <span className={styles.osmLink}>Get Directions →</span>
            </a >
        );
    }

    return (
        <div>
            <div className={styles.nearbyTabs}>
                {availableTypes.map((type) => (
                    <button
                        key={type}
                        type="button"
                        className={`${styles.nearbyTab} ${activeType === type ? styles.nearbyTabActive : ""}`}
                        onClick={() => handleTabClick(type)}
                    >
                        {TYPE_LABELS[type]}
                    </button>
                ))}
            </div>

            <div className={styles.nearbyGrid}>
                {pageItems.map((item) =>
                    PHOTO_TYPES.includes(item.type) ? renderPhotoCard(item) : renderInfoCard(item),
                )}
            </div>

            {totalPages > 1 && (
                <div className={styles.pagination}>
                    <button
                        type="button"
                        disabled={page === 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className={styles.pageNav}
                    >
                        ‹
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                        <button
                            key={n}
                            type="button"
                            onClick={() => setPage(n)}
                            className={`${styles.pageNumber} ${page === n ? styles.pageNumberActive : ""}`}
                        >
                            {n}
                        </button>
                    ))}

                    <button
                        type="button"
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        className={styles.pageNav}
                    >
                        ›
                    </button>
                </div>
            )}
        </div>
    );
}