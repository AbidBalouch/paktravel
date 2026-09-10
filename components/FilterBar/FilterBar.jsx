"use client";
// components/FilterBar/FilterBar.jsx
// ---------------------------------------------------------------------------

import { useState, useMemo, useRef, useEffect } from "react";
import styles from "./FilterBar.module.css";

const SORT_OPTIONS = [
  { value: "rating_desc", label: "Rating: High to Low" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Name: A–Z" },
];

function Dropdown({ label, icon, options, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find((o) => o.value === selected)?.label;

  return (
    <div className={styles.dropdownWrap} ref={ref}>
      <button
        type="button"
        className={`${styles.chip} ${selected ? styles.chipActive : ""}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={styles.chipIcon}>{icon}</span>
        {selectedLabel || label}
        <span className={styles.chipCaret}>▾</span>
      </button>

      {open && (
        <div className={styles.dropdownMenu}>
          <button
            type="button"
            className={styles.dropdownItem}
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
          >
            All
          </button>
          {options.length === 0 ? (
            <p className={styles.dropdownEmpty}>No options were found.</p>
          ) : (
            options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`${styles.dropdownItem} ${selected === opt.value ? styles.dropdownItemActive : ""}`}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                {opt.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function FilterBar({ items = [], onChange }) {
  // Category aur Type — dono item.category (taxonomy term) se options banate
  // hain. Agar "Type" ko alag field se chalana ho, yahan alag source de dein.
  const categoryOptions = useMemo(
    () =>
      [...new Set(items.map((i) => i.category).filter(Boolean))].map((c) => ({
        value: c,
        label: c,
      })),
    [items]
  );

  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [sortBy, setSortBy] = useState("");

  const hasActiveFilter = category || type || sortBy;

  function update(partial) {
    const next = {
      category: partial.category ?? category,
      type: partial.type ?? type,
      sortBy: partial.sortBy ?? sortBy,
    };
    setCategory(next.category);
    setType(next.type);
    setSortBy(next.sortBy);
    onChange(next);
  }

  function handleClear() {
    if (!hasActiveFilter) return;
    setCategory("");
    setType("");
    setSortBy("");
    onChange({ category: "", type: "", sortBy: "" });
  }

  return (
    <div className={styles.bar}>
      <Dropdown
        label="Category"
        icon="▦"
        options={categoryOptions}
        selected={category}
        onChange={(v) => update({ category: v })}
      />
      <Dropdown
        label="Type"
        icon="▤"
        options={categoryOptions}
        selected={type}
        onChange={(v) => update({ type: v })}
      />
      <Dropdown
        label="Order By"
        icon="↕"
        options={SORT_OPTIONS}
        selected={sortBy}
        onChange={(v) => update({ sortBy: v })}
      />

      <button
        type="button"
        className={`${styles.clearBtn} ${hasActiveFilter ? styles.clearBtnActive : ""}`}
        onClick={handleClear}
        disabled={!hasActiveFilter}
      >
        Clear filters
      </button>
    </div>
  );
}
