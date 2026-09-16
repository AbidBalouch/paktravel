"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useAuthStatus } from "@/components/AuthStatus/AuthStatusContext";
import styles from "./Header.module.css";

export default function HeaderClient({ logo, menu, buttons }) {
  const { authStatus: loginStatus, setAuthStatus } = useAuthStatus();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Server hamesha "logged out" HTML bhejta hai (server ko cookie ka pata
  // nahi hota). Client par turant hi sahi state pata chal jati hai, lekin
  // agar hum use turant render kar dein to React ka hydration pehle wale
  // (galat) HTML ke sath match nahi karega — isi mismatch ki wajah se
  // "pehle Login/Signup, phir Account" wala flash dikhta hai. "mounted"
  // gate lagane se hum tab tak kuch bhi render nahi karte jab tak client
  // fully mount na ho jaye — isse flash khatam ho jata hai.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Dropdown ke bahar click hone pe band ho jaye
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loginButtonLabel = buttons?.find((b) => b.name.toLowerCase() === "login")?.name || "Login";
  const signupButtonLabel = buttons?.find((b) => b.name.toLowerCase() === "sign up")?.name || "Sign Up";

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setAuthStatus({ loggedIn: false, email: null, name: null, social: null }); // instant update
  }

  const initials = loginStatus?.name
    ? loginStatus.name.trim().charAt(0).toUpperCase()
    : loginStatus?.email?.charAt(0).toUpperCase() || "?";

  return (
    <header className={`${styles.header} ${isScrolled ? styles.headerScrolled : ""}`}>
      <div className={`container ${styles.inner}`}>
        <a href="/" className={styles.logoWrap}>
          {logo && (
            <Image
              src={logo}
              alt="Travel Pakistan"
              width={160}
              height={32}
              priority
              className={styles.logoImg}
            />
          )}
        </a>

        <nav className={styles.nav}>
          <ul className={styles.navList}>
            {menu?.items?.map((item) => (
              <li key={item.id}>
                <a href={item.url} target={item.target || "_self"} className={styles.navLink}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Desktop buttons / account dropdown */}
        <div className={styles.actions}>
          {!mounted ? (
            // Server/client hydration match karne ke liye — koi bhi button
            // decide karne se pehle khali jagah (fixed width taake layout
            // shift na ho)
            <div className={styles.authPlaceholder} aria-hidden="true" />
          ) : loginStatus?.loggedIn ? (
            <div className={styles.accountWrap} ref={dropdownRef}>
              <button
                type="button"
                className={styles.accountBtn}
                onClick={() => setIsDropdownOpen((v) => !v)}
              >
                <span className={styles.avatar}>{initials}</span>
                <span className={styles.accountName}>{loginStatus.name || loginStatus.email}</span>
              </button>

              {isDropdownOpen && (
                <div className={styles.dropdown}>
                  <a href="/my-contributions" className={styles.dropdownItem}>
                    My Contributions
                  </a>
                  <button type="button" className={styles.dropdownItem} onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <a href="/login" className={styles.loginLink}>
                {loginButtonLabel}
              </a>
              <a href="/signup" className={styles.signupBtn}>
                {signupButtonLabel}
              </a>
            </>
          )}
        </div>

        <button
          className={styles.burger}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
        >
          <span className={isMobileMenuOpen ? styles.burgerLineOpenTop : styles.burgerLine} />
          <span className={isMobileMenuOpen ? styles.burgerLineOpenMid : styles.burgerLine} />
          <span className={isMobileMenuOpen ? styles.burgerLineOpenBottom : styles.burgerLine} />
        </button>
      </div>

      <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ""}`}>
        <ul className={styles.mobileNavList}>
          {menu?.items?.map((item) => (
            <li key={item.id}>

              <a href={item.url}
                target={item.target || "_self"}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <div className={styles.mobileActions}>
          {!mounted ? null : loginStatus?.loggedIn ? (
            <>
              <a href="/my-contributions" className={styles.loginLink} onClick={() => setIsMobileMenuOpen(false)}>
                My Contributions
              </a>
              <button type="button" className={styles.signupBtn} onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <a href="/login" className={styles.loginLink}>
                {loginButtonLabel}
              </a>
              <a href="/signup" className={styles.signupBtn}>
                {signupButtonLabel}
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  );
}