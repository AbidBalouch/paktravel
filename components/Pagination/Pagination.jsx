"use client";
// components/Pagination/Pagination.jsx
// ---------------------------------------------------------------------------
// "1–05 of 18 items" text + first/prev/page-numbers/next/last buttons +
// "Items per page" dropdown — screenshot ke design ke mutabiq.
// Pura client-side hai (data already fetch ho chuka hota hai, sirf slice
// hoti hai) — is liye koi extra API call nahi lagti.
// ---------------------------------------------------------------------------

import styles from "./Pagination.module.css";

const PAGE_SIZE_OPTIONS = [8, 12, 20, 50];

export default function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  function goTo(page) {
    if (page < 1 || page > totalPages) return;
    onPageChange(page);
  }

  return (
    <div className={styles.bar}>
      <span className={styles.info}>
        {String(startItem).padStart(2, "0")}–{String(endItem).padStart(2, "0")} of {totalItems} items
      </span>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.arrow}
          onClick={() => goTo(1)}
          disabled={currentPage === 1}
          aria-label="First page"
        >
          «
        </button>
        <button
          type="button"
          className={styles.arrow}
          onClick={() => goTo(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          ‹
        </button>

        {pages.map((p) => (
          <button
            key={p}
            type="button"
            className={`${styles.page} ${p === currentPage ? styles.pageActive : ""}`}
            onClick={() => goTo(p)}
          >
            {p}
          </button>
        ))}

        <button
          type="button"
          className={styles.arrow}
          onClick={() => goTo(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          ›
        </button>
        <button
          type="button"
          className={styles.arrow}
          onClick={() => goTo(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="Last page"
        >
          »
        </button>
      </div>

      <select
        className={styles.perPage}
        value={itemsPerPage}
        onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
        aria-label="Items per page"
      >
        {PAGE_SIZE_OPTIONS.map((n) => (
          <option key={n} value={n}>
            {n} / page
          </option>
        ))}
      </select>
    </div>
  );
}
