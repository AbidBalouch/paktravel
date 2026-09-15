"use client";
// components/DistrictExplorer/DistrictExplorer.jsx

// ---------------------------------------------------------------------------

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import ImageCollage from "@/components/ImageCollage/ImageCollage";
import FilterBar from "@/components/FilterBar/FilterBar";
import AttractionCard from "@/components/AttractionCard/AttractionCard";
import StayCard from "@/components/StayCard/StayCard";
import TourCard from "@/components/TourCard/TourCard";
import EventCard from "@/components/EventCard/EventCard";
import RestaurantCard from "@/components/RestaurantCard/RestaurantCard";
import Pagination from "@/components/Pagination/Pagination";
import styles from "./DistrictExplorer.module.css";

const TABS = [
  { key: "about", label: "About" },
  { key: "attractions", label: "Attractions" },
  { key: "stays", label: "Stays" },
  { key: "tours", label: "Tours" },
  { key: "events", label: "Events" },
  { key: "restaurants", label: "Restaurants" },
];

// Har tab key ke liye sahi dedicated card component
const CARD_COMPONENTS = {
  attractions: AttractionCard,
  stays: StayCard,
  tours: TourCard,
  events: EventCard,
  restaurants: RestaurantCard,
};

export default function DistrictExplorer({ district }) {
  const {
    badge,
    title,
    tagline,
    description,
    heroImage,
    collageImage,
    aboutHtml,
    tabs,
  } = district;

  const [activeTab, setActiveTab] = useState("about");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({ category: "", activity: "", recommended: false });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  const activeLabel = TABS.find((t) => t.key === activeTab)?.label || "";
  const rawList = activeTab === "about" ? [] : tabs[activeTab] || [];
  const ActiveCard = CARD_COMPONENTS[activeTab];

  const filteredList = useMemo(() => {
    let list = rawList;

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          (item.excerpt || "").toLowerCase().includes(q)
      );
    }

    if (filters.category) {
      list = list.filter((item) => item.category === filters.category);
    }
    if (filters.activity) {
      list = list.filter((item) => (item.activities || []).includes(filters.activity));
    }
    if (filters.recommended) {
      list = list.filter((item) => item.recommended);
    }

    return list;
  }, [rawList, query, filters]);

  // Filter/search/tab badalte hi hamesha page 1 pe wapas jayein
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, query, filters, itemsPerPage]);

  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(start, start + itemsPerPage);
  }, [filteredList, currentPage, itemsPerPage]);

  function handleTabClick(key) {
    setActiveTab(key);
    setQuery("");
    setFilters({ category: "", activity: "", recommended: false });
  }

  return (
    <>
      {/* ================= Hero / Banner (search bar included) ================= */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          {heroImage && (
            <Image
              src={heroImage.url}
              alt={heroImage.alt}
              fill
              sizes="100vw"
              priority
              className={styles.heroBgImage}
            />
          )}
        </div>

        {badge && (
          <div className={styles.heroTop}>
            <span className={styles.heroBadge}>{badge}</span>
          </div>
        )}

        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>
            <span className={styles.heroTitleAccent}>{title}</span>
            {tagline && <>: {tagline}</>}
          </h1>

          {description && <p className={styles.heroText}>{description}</p>}

          <div className={styles.searchBarWrap}>
            <div className={styles.searchBar}>
              <span className={styles.searchIconLeft} aria-hidden="true">
                🧭
              </span>
              <input
                type="text"
                placeholder={
                  activeTab === "about" ? "Search Attractions" : `Search ${activeLabel}`
                }
                value={query}
                onChange={(e) => {
                  if (activeTab === "about") setActiveTab("attractions");
                  setQuery(e.target.value);
                }}
                onFocus={() => {
                  if (activeTab === "about") setActiveTab("attractions");
                }}
                className={styles.searchInput}
                aria-label={`Search ${activeLabel || "Attractions"}`}
              />
              <span className={styles.searchIconRight} aria-hidden="true">
                ⌕
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= Image Collage (single image) ================= */}
      <ImageCollage image={collageImage} districtName={title} />

{/* ================= Tabs + Filters + Grid ================= */}
<section className={styles.section}>
  <div className="container">
    {/* ---------------- Tab bar ---------------- */}
    <div className={styles.tabBar} role="tablist">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          role="tab"
          aria-selected={activeTab === tab.key}
          className={`${styles.tab} ${
            activeTab === tab.key ? styles.tabActive : ""
          }`}
          onClick={() => handleTabClick(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>

    {/* ---------------- Panels ---------------- */}
    {activeTab === "about" ? (
      <div className={styles.aboutPanel}>
        {aboutHtml ? (
          <div
            className={styles.aboutContent}
            dangerouslySetInnerHTML={{ __html: aboutHtml }}
          />
        ) : (
          <p className={styles.noResults}>
            Details about {title} have not been added yet.
          </p>
        )}
      </div>
    ) : (
      <>
        {/* ---------------- Filter chips ---------------- */}
        <FilterBar items={rawList} onChange={setFilters} />

        {filteredList.length === 0 ? (
          <p className={styles.noResults}>
            There is currently no entry available for {title} in this category.
          </p>
        ) : (
          <>
            {/* ---------------- Cards Grid ---------------- */}
            <div className={styles.grid}>
              {paginatedList.map((item) => (
                <ActiveCard key={item.id} item={item} />
              ))}
            </div>

            {/* ---------------- Pagination ---------------- */}
            {filteredList.length > 8 && (
              <Pagination
                currentPage={currentPage}
                totalItems={filteredList.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            )}
          </>
        )}
      </>
    )}
  </div>
</section>
    </>
  );
}
