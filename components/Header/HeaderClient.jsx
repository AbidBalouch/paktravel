"use client";

// components/Header/HeaderClient.jsx
// ---------------------------------------------------------------------------

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./Header.module.css";

export default function HeaderClient({ logo, menu, buttons }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Scroll position track karke header ka background toggle karte hain
  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 20);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Page reload hote hi agar already scrolled ho to state sahi set ho
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Mobile menu khula ho to body scroll lock kar dete hain
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const loginButton = buttons?.find((b) => b.name.toLowerCase() === "login");
  const signupButton = buttons?.find((b) => b.name.toLowerCase() === "sign up");

  return (
    <header className={`${styles.header} ${isScrolled ? styles.headerScrolled : ""}`}>
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
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

        {/* Desktop nav */}
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

        {/* Desktop buttons */}
        <div className={styles.actions}>
          {loginButton && (
            <a href={loginButton.url} className={styles.loginLink}>
              {loginButton.name}
            </a>
          )}
          {signupButton && (
            <a href={signupButton.url} className={styles.signupBtn}>
              {signupButton.name}
            </a>
          )}
        </div>

        {/* Mobile hamburger */}
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

      {/* Mobile menu panel */}
      <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ""}`}>
        <ul className={styles.mobileNavList}>
          {menu?.items?.map((item) => (
            <li key={item.id}>
              <a
                href={item.url}
                target={item.target || "_self"}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <div className={styles.mobileActions}>
          {loginButton && (
            <a href={loginButton.url} className={styles.loginLink}>
              {loginButton.name}
            </a>
          )}
          {signupButton && (
            <a href={signupButton.url} className={styles.signupBtn}>
              {signupButton.name}
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
