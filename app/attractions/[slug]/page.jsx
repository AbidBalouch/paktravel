import { getAttractionBySlug, weatherCodeLabel } from "@/lib/api";
import { notFound } from "next/navigation";
import Image from "next/image";
import AttractionMap from "@/components/AttractionMap/AttractionMap";
import NearbyEssentialsTabs from "@/components/NearbyEssentialsTabs/NearbyEssentialsTabs";
import Newsletter from "@/components/Newsletter/Newsletter";
import styles from "./attractions.module.css";
import {
    Sun, CloudSun, Cloud, CloudFog, CloudDrizzle, CloudRain, CloudSnow, CloudLightning, Camera, BookOpen, Footprints, ShoppingBag, ClipboardList, HeartPulse, Signpost,
} from "lucide-react";

export default async function AttractionDetailPage({ params }) {
    const { slug } = params;
    const attraction = await getAttractionBySlug(slug);

    if (!attraction) {
        notFound();
    }

    function getWeatherIcon(code) {
        if (code === 0) return Sun;
        if (code === 1 || code === 2) return CloudSun;
        if (code === 3) return Cloud;
        if (code === 45 || code === 48) return CloudFog;
        if ([51, 53, 55].includes(code)) return CloudDrizzle;
        if ([61, 63, 65, 80, 81, 82].includes(code)) return CloudRain;
        if ([71, 73, 75].includes(code)) return CloudSnow;
        if (code === 95) return CloudLightning;
        return Cloud;
    }

    return (
        <div className={styles.mainWrapper}>
            {/* 1. Hero Banner */}
            <section className={styles.hero}>
                {attraction.featuredImage && (
                    <div className={styles.heroBackground}>
                        <Image
                            src={attraction.featuredImage}
                            alt={attraction.title}
                            fill
                            priority
                            style={{ objectFit: "cover" }}
                        />
                    </div>
                )}
                <div className={styles.heroOverlay}></div>
                {attraction.badge && (
                    <div className={styles.heroBadge}>{attraction.badge}</div>
                )}
                <h1 className={styles.heroTitle}>{attraction.title}</h1>
                {attraction.excerpt && (
                    <p className={styles.heroSubtitle}>{attraction.excerpt}</p>
                )}
            </section>

            {/* 2. Gallery */}
            <div className={styles.container}>
                <div className={styles.contentWrapper}>
                    <div className={styles.content}>
                        {attraction.gallery.length > 0 && (
                            <div className={styles.galleryGrid}>
                                {attraction.gallery.map((image, index) => (
                                    <div
                                        key={image.id || index}
                                        className={`${styles.galleryItem} ${styles[`item${index + 1}`] || ""}`}
                                    >
                                        <Image
                                            src={image.url}
                                            alt={image.alt}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                            className={styles.galleryImage}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* 3. Description */}
                        {attraction.description && (
                            <section className={styles.card}>
                                <h2 className={styles.cardTitle}>
                                    <BookOpen size={20} strokeWidth={1.75} /> Description
                                </h2>
                                <p className={styles.description}>
                                    <strong>{attraction.title}</strong> — {attraction.description}
                                </p>
                            </section>
                        )}

                        {/* 4. What To Do / What To Buy (side-by-side) */}
                        <div className={styles.twoCol}>
                            {attraction.whatToDo.length > 0 && (
                                <section className={styles.card}>
                                    <h2 className={styles.cardTitle}>
                                        <Footprints size={20} strokeWidth={1.75} /> What To Do
                                    </h2>
                                    <ul className={styles.checkList}>
                                        {attraction.whatToDo.map((point, i) => (
                                            <li key={i}>{point}</li>
                                        ))}
                                    </ul>
                                </section>
                            )}

                            {attraction.whatToBuy.length > 0 && (
                                <section className={styles.card}>
                                    <h2 className={styles.cardTitle}>
                                        <ShoppingBag size={20} strokeWidth={1.75} /> What To Buy
                                    </h2>
                                    <ul className={styles.checkList}>
                                        {attraction.whatToBuy.map((item, i) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                </section>
                            )}
                        </div>

                        {/* 5. Best Season */}
                        {attraction.bestSeason.length > 0 && (
                            <section className={styles.card}>
                                <h2 className={styles.cardTitle}>
                                    <CloudSun size={20} strokeWidth={1.75} /> Best Season to Visit
                                </h2>
                                <ul className={styles.checkList}>
                                    {attraction.bestSeason.map((s, i) => (
                                        <li key={i}>{s}</li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {/* 6. Policies / Health & Safety (side-by-side) */}
                        <div className={styles.twoCol}>
                            {attraction.policies.length > 0 && (
                                <section className={styles.card}>
                                    <h2 className={styles.cardTitle}>
                                        <ClipboardList size={20} strokeWidth={1.75} /> Policies & Info
                                    </h2>
                                    <ul className={styles.checkList}>
                                        {attraction.policies.map((p, i) => (
                                            <li key={i}>{p}</li>
                                        ))}
                                    </ul>
                                </section>
                            )}

                            {attraction.healthSafety.length > 0 && (
                                <section className={styles.card}>
                                    <h2 className={styles.cardTitle}>
                                        <HeartPulse size={20} strokeWidth={1.75} /> Health & Safety
                                    </h2>
                                    <ul className={styles.checkList}>
                                        {attraction.healthSafety.map((h, i) => (
                                            <li key={i}>{h}</li>
                                        ))}
                                    </ul>
                                </section>
                            )}
                        </div>

                        {/* 7. How to Reach */}
                        {attraction.howToReach.length > 0 && (
                            <section className={styles.card}>
                                <h2 className={styles.cardTitle}>
                                    <Signpost size={20} strokeWidth={1.75} /> How to Reach
                                </h2>
                                <ul className={styles.checkList}>
                                    {attraction.howToReach.map((r, i) => (
                                        <li key={i}>
                                            <strong>{r.mode}</strong> — {r.detail}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {/* 8. Weather + Photography Tips (side-by-side, 898:320 ratio) */}
                        <div className={styles.weatherPhotoGrid}>
                            {attraction.weather && (
                                <section className={`${styles.card} ${styles.weatherCard}`}>
                                    <p className={styles.weatherPlaceName}>{attraction.title}</p>
                                    <div className={styles.weatherHeader}>
                                        {(() => {
                                            const Icon = getWeatherIcon(attraction.weather.code);
                                            return <Icon size={32} color="#fff" strokeWidth={1.5} />;
                                        })()}
                                        <span className={styles.weatherTemp}>
                                            {Math.round(attraction.weather.tempC)}°C
                                        </span>
                                        <span className={styles.weatherDash}>–</span>
                                        <span className={styles.weatherCondition}>
                                            {weatherCodeLabel(attraction.weather.code)}
                                        </span>
                                    </div>
                                    <div className={styles.weatherStats}>
                                        <div>
                                            <p>Feels</p>
                                            <strong>{Math.round(attraction.weather.feelsLikeC)}°</strong>
                                        </div>
                                        <div>
                                            <p>Humidity</p>
                                            <strong>{attraction.weather.humidity}%</strong>
                                        </div>
                                        <div>
                                            <p>Wind</p>
                                            <strong>{Math.round(attraction.weather.windKmh)} km/h</strong>
                                        </div>
                                    </div>
                                    <p className={styles.weatherLabel}>Next 3 days</p>
                                    <div className={styles.weatherForecast}>
                                        {attraction.weather.days.map((d) => {
                                            const DayIcon = getWeatherIcon(d.code);
                                            return (
                                                <div key={d.date} className={styles.forecastDay}>
                                                    <span className={styles.forecastDayLabel}>{d.label}</span>
                                                    <DayIcon size={22} color="#fff" strokeWidth={1.5} />
                                                    <span>{weatherCodeLabel(d.code)}</span>
                                                    <span className={styles.forecastTemp}>
                                                        {Math.round(d.tempMax)}°/{Math.round(d.tempMin)}°
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            )}

                            {attraction.photographyTips.length > 0 && (
                                <section className={`${styles.card} ${styles.photoCard}`}>
                                    <div className={styles.photoIconBadge}>
                                        <Camera size={26} color="#0f3d24" strokeWidth={1.5} />
                                    </div>
                                    <h2 className={styles.photoTitle}>Photography Tips</h2>
                                    <ul className={styles.checkList}>
                                        {attraction.photographyTips.map((tip, i) => (
                                            <li key={i} className={styles.photoTip}>{tip}</li>
                                        ))}
                                    </ul>
                                    <a href="#gallery" className={styles.viewGalleryBtn}>
                                        View Gallery
                                    </a>
                                </section>
                            )}
                        </div>
                    </div>
                </div>
                <div className={styles.nearbyEssentialsWrapper}>
                    <div className={styles.nearbyEssentials}>

                        {/* 9. Nearby Essentials */}
                        {attraction.nearbyEssentials.length > 0 && (
                            <section className={styles.section}>
                                <h2 className={styles.sectionTitle}>Nearby Essentials & Facilities</h2>
                                <NearbyEssentialsTabs items={attraction.nearbyEssentials} />
                            </section>
                        )}

                        {/* 10. Location Map */}
                        {attraction.stats.lat != null && attraction.stats.lng != null && (
                            <section className={styles.section}>
                                <h2 className={styles.sectionTitle}>Location Map</h2>
                                <AttractionMap
                                    lat={attraction.stats.lat}
                                    lng={attraction.stats.lng}
                                    title={attraction.title}
                                />
                            </section>
                        )}
                    </div>
                </div>
            </div>

            {/* 11. Newsletter */}
            <Newsletter />
        </div>
    );
}