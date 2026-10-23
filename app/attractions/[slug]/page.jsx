import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  Star, MapPin, Clock, Ticket, Hourglass, CalendarDays, Sun, CloudSun, Cloud,
  CloudFog, CloudDrizzle, CloudRain, CloudSnow, CloudLightning, ShieldCheck,
  Camera, ClipboardList, HeartPulse, Navigation, ChevronRight, Sparkles,
} from "lucide-react";
import { getAttractionBySlug, weatherCodeLabel } from "@/lib/api";
import AttractionMap from "@/components/AttractionMap/AttractionMap";
import NewsletterBand from "@/components/AttractionDetail/NewsletterBand";
import GalleryMosaic from "@/components/AttractionDetail/GalleryMosaic";
import MonthChart from "@/components/AttractionDetail/MonthChart";
import Facilities from "@/components/AttractionDetail/Facilities";
import ReviewSection from "@/components/AttractionDetail/ReviewSection";
import NearbyBand from "@/components/AttractionDetail/NearbyBand";
import { SaveButton, ShareButton, OpenNow, AboutText } from "@/components/AttractionDetail/ClientBits";
import styles from "./attraction-new.module.css";

export const revalidate = 60; // WordPress se har 60s baad fresh data (ISR)

// ISR on-demand (build-time static params Vercel build ko slow karte thay)
export async function generateStaticParams() {
  return [];
}

const MONTH_NAMES = [
  ["january", "jan"], ["february", "feb"], ["march", "mar"], ["april", "apr"],
  ["may", "may"], ["june", "jun"], ["july", "jul"], ["august", "aug"],
  ["september", "sep"], ["october", "oct"], ["november", "nov"], ["december", "dec"],
];
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// Best-season points ke text se month names parh kar 12-month guide banana.
// Koi month na mile to null (section seedha season list dikhayega).
function buildMonthGuide(bestSeason) {
  const text = (bestSeason || []).join(" ").toLowerCase();
  const best = new Set();
  MONTH_NAMES.forEach(([full, abbr], i) => {
    if (new RegExp(`\\b(${full}|${abbr})\\b`).test(text)) best.add(i);
  });
  if (best.size === 0) return null;
  const ok = new Set();
  best.forEach((i) => { ok.add((i + 1) % 12); ok.add((i + 11) % 12); });
  ok.forEach((i) => { if (best.has(i)) ok.delete(i); });
  return MONTH_SHORT.map((m, i) => {
    const level = best.has(i) ? "best" : ok.has(i) ? "ok" : "hot";
    const point = (bestSeason || []).find((s) =>
      new RegExp(`\\b(${MONTH_NAMES[i][0]}|${MONTH_NAMES[i][1]})\\b`).test(s.toLowerCase()));
    return {
      m, full: MONTH_FULL[i], level,
      note: point || (level === "best" ? "One of the best months to visit." : level === "ok" ? "A decent month — check the weather before you go." : "Harsh weather is likely — plan an early start and keep the visit short."),
    };
  });
}

const FACILITY_SUBS = {
  "By air": "Fly in to the nearest airport",
  "By road": "Reachable by road",
  "By train": "Railway station nearby",
  "4x4 jeep required": "Only 4x4 vehicles on the last stretch",
  "Parking": "Parking available nearby",
  "Washrooms": "Available on site",
  "Food": "Food options nearby",
  "Mobile signal": "Coverage available",
  "Public transport": "Bus and wagon routes nearby",
  "Trek required": "Some walking or trekking involved",
  "Licensed guides": "Guides available at the entrance",
  "Prayer area": "Prayer space nearby",
  "Wheelchair access": "Step-free access in most areas",
  "Family friendly": "Good for kids and elders",
  "Photography": "Photography allowed",
  "Drones": "Prior permission usually required",
  "Camping": "Camping allowed nearby",
  "ATM on site": "ATM available nearby",
};

// Abhi ke liye dummy reviews (Henry ki hidayat) — rating summary asal
// WP star_rating/total_reviews se ata hai.
const REVIEW_POOL = [
  { name: "Ayesha K.", meta: "Karachi · Family trip", when: "August 2026", stars: 5, text: "Went with my parents and kids and everyone enjoyed it. Go early — it gets hot and crowded by noon." },
  { name: "Hamza R.", meta: "Islamabad · Solo", when: "July 2026", stars: 5, text: "Hired a local guide and it was worth it. You miss half the stories without one." },
  { name: "Sarah M.", meta: "United Kingdom · Couple", when: "June 2026", stars: 4, text: "Easy to reach and well kept. Combine it with the nearby sights and make a full day of it." },
  { name: "Usman T.", meta: "Lahore · Friends", when: "May 2026", stars: 4, text: "Beautiful place, though some areas could use better signs. Wear comfortable shoes." },
  { name: "Fatima S.", meta: "Faisalabad · Family trip", when: "April 2026", stars: 5, text: "The views alone are worth the trip. Best light is early morning or just before sunset." },
  { name: "James W.", meta: "Australia · Solo", when: "March 2026", stars: 5, text: "One of the highlights of my Pakistan trip. The history here is incredible and the locals are welcoming." },
  { name: "Mahnoor A.", meta: "Rawalpindi · Couple", when: "February 2026", stars: 4, text: "Peaceful on a weekday morning. Carry water in summer and take your time exploring." },
  { name: "Bilal H.", meta: "Multan · Friends", when: "January 2026", stars: 5, text: "Photos do not do it justice. A must-visit if you are anywhere nearby." },
];

function pickReviews(slug) {
  let h = 0;
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) % 997;
  const start = h % REVIEW_POOL.length;
  return [0, 1, 2, 3].map((k) => {
    const r = REVIEW_POOL[(start + k) % REVIEW_POOL.length];
    return { ...r, initials: r.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() };
  });
}

function weatherTip(w) {
  if (!w) return "";
  if ([61, 63, 65, 80, 81, 82].includes(w.code)) return "Carry an umbrella today";
  if ([71, 73, 75].includes(w.code)) return "Dress warm — snow expected";
  if (w.tempC >= 38) return "Very hot — go early morning";
  if (w.tempC >= 30) return "Go before 11 AM";
  if (w.tempC >= 18) return "Pleasant day for a visit";
  return "Carry a light jacket";
}

function WeatherIcon({ code, size = 22 }) {
  const p = { size, color: "#0E6B45", strokeWidth: 1.75 };
  if (code === 0) return <Sun {...p} />;
  if (code === 1 || code === 2) return <CloudSun {...p} />;
  if (code === 3) return <Cloud {...p} />;
  if (code === 45 || code === 48) return <CloudFog {...p} />;
  if ([51, 53, 55].includes(code)) return <CloudDrizzle {...p} />;
  if ([61, 63, 65, 80, 81, 82].includes(code)) return <CloudRain {...p} />;
  if ([71, 73, 75].includes(code)) return <CloudSnow {...p} />;
  if (code === 95) return <CloudLightning {...p} />;
  return <Cloud {...p} />;
}

export default async function AttractionDetailPage({ params }) {
  const { slug } = params;
  const a = await getAttractionBySlug(slug);
  if (!a) notFound();

  const galleryImages = [
    ...(a.featuredImage ? [{ id: "featured", url: a.featuredImage, alt: a.title }] : []),
    ...a.gallery.filter((g) => g.url !== a.featuredImage),
  ];
  const monthGuide = buildMonthGuide(a.bestSeason);
  const facilities = (a.facilities || []).map((label) => ({ label, sub: FACILITY_SUBS[label] || "" }));
  const guides = [
    a.policies.length ? { title: "Policies & info", Icon: ClipboardList, items: a.policies } : null,
    a.healthSafety.length ? { title: "Health & safety", Icon: HeartPulse, items: a.healthSafety } : null,
    a.photographyTips.length ? { title: "Photography tips", Icon: Camera, items: a.photographyTips } : null,
  ].filter(Boolean);
  const hospital = a.nearbyEssentials.find((n) => n.type === "hospital");
  const district = a.destinationPath[a.destinationPath.length - 1];
  const region = a.destinationPath[0];
  const dirLink = a.stats.lat != null
    ? `https://www.google.com/maps/dir/?api=1&destination=${a.stats.lat},${a.stats.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a.title + " Pakistan")}`;
  const reviews = pickReviews(slug);

  const facts = [
    a.openTime || a.closeTime ? { Icon: Clock, label: "Opening hours", value: `${a.openTime || ""} – ${a.closeTime || ""}`.trim(), sub: "" } : null,
    a.entryFee ? { Icon: Ticket, label: "Entry fee", value: a.entryFee.split("·")[0].trim(), sub: a.entryFee.includes("·") ? "· " + a.entryFee.split("·").slice(1).join("·").trim() : "" } : null,
    a.visitDuration ? { Icon: Hourglass, label: "Visit duration", value: a.visitDuration, sub: "" } : null,
    a.stats.rating ? { Icon: Star, label: "Rating", value: String(a.stats.rating), sub: a.stats.reviews ? `· ${a.stats.reviews.toLocaleString()} reviews` : "" } : null,
    a.bestTimeShort ? { Icon: CalendarDays, label: "Best time to visit", value: a.bestTimeShort, sub: "" } : null,
  ].filter(Boolean);

  const tabs = [
    { id: "overview", label: "Overview", show: true },
    { id: "things", label: "Things to do", show: a.topSpots.length > 0 },
    { id: "plan", label: "Plan your visit", show: !!(monthGuide || guides.length) },
    { id: "facilities", label: "Facilities", show: facilities.length > 0 },
    { id: "nearby", label: "Nearby", show: a.nearbyEssentials.length > 0 },
    { id: "reviews", label: "Reviews", show: true },
  ].filter((t) => t.show);

  return (
    <div className={styles.page}>
      <div className={styles.wrap}>
        {/* Breadcrumb */}
        <nav className={styles.crumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          {a.destinationPath.map((seg, i) => (
            <span key={i} style={{ display: "contents" }}>
              <ChevronRight size={14} />
              <Link href={`/provinces/${a.destinationPath.slice(0, i + 1).map((s) => s.slug).join("/")}`}>{seg.name}</Link>
            </span>
          ))}
          <ChevronRight size={14} />
          <span className={styles.crumbCurrent}>{a.title}</span>
        </nav>

        {/* Title block */}
        <div className={styles.titleRow}>
          <div>
            <div className={styles.badges}>
              {a.badge && <span className={styles.badge}>{a.badge}</span>}
              {a.typeName && <span className={styles.badge}>{a.typeName}</span>}
            </div>
            <h1 className={styles.h1}>{a.title}</h1>
            {a.destinationPath.length > 0 && (
              <div className={styles.subline}>
                <MapPin size={15} style={{ verticalAlign: "-2px" }} /> {[...new Set(a.destinationPath.map((s) => s.name).filter(Boolean))].reverse().join(", ")}
              </div>
            )}
            <div className={styles.metaRow}>
              {a.stats.rating && (
                <span className={styles.metaItem}>
                  <Star size={16} fill="#E0A21B" color="#E0A21B" /> <strong>{a.stats.rating}</strong>
                  {a.stats.reviews ? <span className={styles.metaMuted}>{a.stats.reviews.toLocaleString()} reviews</span> : null}
                </span>
              )}
              {a.typeName && (<><span className={styles.metaDot}>•</span><span className={styles.metaMuted}>{a.typeName}</span></>)}
            </div>
          </div>
          <div className={styles.actions}>
            <ShareButton title={a.title} />
            <SaveButton slug={slug} title={a.title} />
          </div>
        </div>

        {/* Gallery — maujooda gallery images, simple mosaic */}
        <GalleryMosaic images={galleryImages} title={a.title} />

        {/* Sticky tabs */}
        <div className={styles.tabsBar}>
          <div className={styles.tabsInner}>
            {tabs.map((t) => (
              <a key={t.id} className={styles.tabLink} href={`#${t.id}`}>{t.label}</a>
            ))}
          </div>
        </div>

        <div className={styles.cols}>
          <main className={styles.main}>
            {/* Quick facts */}
            {facts.length > 0 && (
              <section id="overview" className={styles.facts} data-count={facts.length}>
                {facts.map((f, i) => (
                  <div key={i} className={styles.fact}>
                    <span className={styles.factIcon}><f.Icon size={19} color="#0E6B45" /></span>
                    <span className={styles.factLabel}>{f.label}</span>
                    <span className={styles.factValue}>{f.value}</span>
                    {f.sub && <span className={styles.factSub}>{f.sub}</span>}
                  </div>
                ))}
              </section>
            )}

            {/* Highlights */}
            {a.highlights.length > 0 && (
              <section className={styles.hlList}>
                {a.highlights.map((h, i) => (
                  <div key={i} className={styles.hlRow}>
                    <span className={styles.hlDot} />
                    <div>
                      <div className={styles.hlTitle}>{h.title}</div>
                      {h.text && <div className={styles.hlText}>{h.text}</div>}
                    </div>
                  </div>
                ))}
              </section>
            )}

            {/* About — timeline ab About text ke baghair bhi dikhta hai */}
            {(a.description || a.timeline.length > 0) && (
              <section>
                <div className={styles.sectionHead}>
                  <h2 className={styles.h2}>About {a.title}</h2>
                </div>
                {a.description && <AboutText title={a.title} text={a.description} />}
                {a.timeline.length > 0 && (
                  <div className={styles.timeline}>
                    {a.timeline.map((t, i) => (
                      <div key={i} className={styles.tlRow}>
                        <span className={styles.tlYear}>{t.year}</span>{" "}
                        <span className={styles.tlWhat}><span className={styles.tlWho}>{t.who}</span>{t.what ? ` — ${t.what}` : ""}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Top things to do */}
            {a.topSpots.length > 0 && (
              <section id="things">
                <div className={styles.sectionHead}>
                  <div className={styles.eyebrow}>Don&apos;t miss</div>
                  <h2 className={styles.h2}>Top things to do</h2>
                </div>
                <div className={styles.spotsGrid}>
                  {a.topSpots.map((s, i) => (
                    <article key={i} className={styles.spotCard}>
                      <h3 className={styles.spotName}>{s.name}</h3>
                      {s.desc && <p className={styles.spotDesc}>{s.desc}</p>}
                      {s.time && <span className={styles.spotTime}><Clock size={13} /> {s.time}</span>}
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* What to do / buy (maujooda WP lists) */}
            {(a.whatToDo.length > 0 || a.whatToBuy.length > 0) && (
              <section>
                <div className={styles.guidesGrid} style={{ marginTop: 0 }}>
                  {a.whatToDo.length > 0 && (
                    <div className={styles.guideCard}>
                      <div className={styles.guideHead}>
                        <span className={styles.guideIcon}><Sparkles size={18} color="#0E6B45" /></span>
                        <h3 className={styles.guideTitle}>What to do</h3>
                      </div>
                      <ul className={styles.guideList}>{a.whatToDo.map((x, i) => <li key={i}>{x}</li>)}</ul>
                    </div>
                  )}
                  {a.whatToBuy.length > 0 && (
                    <div className={styles.guideCard}>
                      <div className={styles.guideHead}>
                        <span className={styles.guideIcon}><Ticket size={18} color="#0E6B45" /></span>
                        <h3 className={styles.guideTitle}>What to buy</h3>
                      </div>
                      <ul className={styles.guideList}>{a.whatToBuy.map((x, i) => <li key={i}>{x}</li>)}</ul>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Plan your visit */}
            {(monthGuide || guides.length > 0) && (
              <section id="plan">
                <div className={styles.sectionHead}>
                  <div className={styles.eyebrow}>Plan</div>
                  <h2 className={styles.h2}>Plan your visit</h2>
                </div>
                {monthGuide ? (
                  <MonthChart months={monthGuide} />
                ) : a.bestSeason.length > 0 ? (
                  <div className={styles.monthCard}>
                    <h3 className={styles.monthTitle}>Best season to visit</h3>
                    <ul className={styles.guideList} style={{ marginTop: 12 }}>
                      {a.bestSeason.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                ) : null}
                {guides.length > 0 && (
                  <div className={styles.guidesGrid}>
                    {guides.map((g, i) => (
                      <div key={i} className={styles.guideCard}>
                        <div className={styles.guideHead}>
                          <span className={styles.guideIcon}><g.Icon size={18} color="#0E6B45" /></span>
                          <h3 className={styles.guideTitle}>{g.title}</h3>
                        </div>
                        <ul className={styles.guideList}>{g.items.map((x, j) => <li key={j}>{x}</li>)}</ul>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Facilities */}
            {facilities.length > 0 && (
              <section id="facilities">
                <div className={styles.sectionHead}>
                  <div className={styles.eyebrow}>Facilities</div>
                  <h2 className={styles.h2}>What this place offers</h2>
                </div>
                <Facilities items={facilities} />
              </section>
            )}

            {/* Location map */}
            {a.stats.lat != null && a.stats.lng != null && (
              <section>
                <div className={styles.sectionHead}>
                  <h2 className={styles.h2}>Location</h2>
                </div>
                <div className={styles.mapBox}>
                  <AttractionMap lat={a.stats.lat} lng={a.stats.lng} title={a.title} />
                </div>
              </section>
            )}
          </main>

          {/* Sidebar */}
          <aside className={styles.aside}>
            <div className={styles.visitCard}>
              <OpenNow openTime={a.openTime} closeTime={a.closeTime} />
              {a.weather && (
                <div className={styles.visitBox}>
                  <div className={styles.visitRow}>
                    <WeatherIcon code={a.weather.code} />
                    <div className={styles.visitRowBody}>
                      <div className={styles.visitRowLabel}>Today in {district?.name || a.title}</div>
                      <div className={styles.visitRowValue}>
                        {Math.round(a.weather.tempC)}°C · {weatherCodeLabel(a.weather.code)}
                      </div>
                    </div>
                    <span className={styles.visitRowSide}>{weatherTip(a.weather)}</span>
                  </div>
                  <div className={styles.visitRow}>
                    <div className={styles.visitRowBody}>
                      <div className={styles.visitRowLabel}>Feels like · Humidity · Wind</div>
                      <div className={styles.visitRowValue}>
                        {Math.round(a.weather.feelsLikeC)}° · {a.weather.humidity}% · {Math.round(a.weather.windKmh)} km/h
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <a className={styles.primaryBtn} href={dirLink} target="_blank" rel="noopener noreferrer">
                <Navigation size={17} /> Get directions
              </a>
              {a.entryFee && <p className={styles.visitNote}>Entry fee: {a.entryFee}</p>}
            </div>

            <div className={styles.emCard}>
              <h3 className={styles.emTitle}><ShieldCheck size={17} color="#B42318" /> In an emergency</h3>
              <div className={styles.emRow}><span>Rescue</span><span className={styles.emNum}>1122</span></div>
              <div className={styles.emRow}><span>Police</span><span className={styles.emNum}>15</span></div>
              {hospital && (
                <div className={styles.emRow}>
                  <span>{hospital.name || hospital.title}</span>
                  <span className={styles.emDist}>{hospital.distanceKm != null ? `~${hospital.distanceKm.toFixed(1)} km` : ""}</span>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Nearby essentials band */}
      {a.nearbyEssentials.length > 0 && (
        <section className={styles.band} id="nearby">
          <div className={styles.bandInner}>
            <div className={styles.sectionHead}>
              <div className={styles.eyebrow}>On the ground</div>
              <h2 className={styles.h2}>Nearby essentials</h2>
            </div>
            <NearbyBand items={a.nearbyEssentials} />
          </div>
        </section>
      )}

      <div className={styles.wrap}>
        {/* Reviews */}
        <section id="reviews" style={{ paddingTop: 64 }}>
          <div className={styles.sectionHead}>
            <div className={styles.eyebrow}>Reviews</div>
            <h2 className={styles.h2}>What travellers say</h2>
          </div>
          <ReviewSection rating={a.stats.rating} totalReviews={a.stats.reviews} reviews={reviews} placeName={a.title} />
        </section>

        {/* Also near */}
        {a.related.length > 0 && (
          <section style={{ paddingTop: 64 }}>
            <div className={styles.sectionHead}>
              <div className={styles.eyebrow}>Keep exploring</div>
              <h2 className={styles.h2}>Also near {a.title}</h2>
            </div>
            <div className={styles.alsoGrid}>
              {a.related.map((r) => (
                <Link key={r.id} className={styles.alsoCard} href={`/attractions/${r.slug}`}>
                  <div className={styles.alsoImg}>
                    {r.img && <Image src={r.img} alt={r.title} fill sizes="(max-width: 768px) 100vw, 25vw" style={{ objectFit: "cover" }} />}
                  </div>
                  <div className={styles.alsoBody}>
                    <h3 className={styles.alsoName}>{r.title}</h3>
                    <div className={styles.alsoMeta}>
                      <span>{r.distanceKm != null ? `${r.distanceKm.toFixed(1)} km away` : ""}</span>
                      {r.tag && <span className={styles.alsoTag}>{r.tag}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {district && (
              <div className={styles.ctaBanner}>
                <span className={styles.ctaIcon}><MapPin size={24} color="#fff" /></span>
                <div className={styles.ctaBody}>
                  <div className={styles.ctaTitle}>One day in {district.name}</div>
                  <div className={styles.ctaText}>{[a.title, ...a.related.map((r) => r.title)].join(" · ")}</div>
                </div>
                <Link className={styles.ctaBtn} href={`/provinces/${a.destinationPath.map((s) => s.slug).join("/")}`}>
                  See itinerary <ChevronRight size={16} />
                </Link>
              </div>
            )}
          </section>
        )}
      </div>

      {/* Newsletter — design wala band, WP CF7 form se connected */}
      <div className={styles.wrap} style={{ paddingTop: 72, paddingBottom: 8 }}>
        <NewsletterBand />
      </div>
    </div>
  );
}
