"use client";
// components/Header/HeaderClient.jsx
// Global header ka client hissa — design homepage wale header jaisa hi hai
// (tp-style classes), lekin logo / menu / mega menu / buttons sab props se
// aate hain jo server WordPress se fetch karta hai (Header.jsx dekhein).
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useAuthStatus } from "@/components/AuthStatus/AuthStatusContext";
import "./header-global.css";

// Mega menu ke icons (SVG symbols) — pehle ye sirf homepage par load hote
// thay, ab header global hai is liye defs yahin shamil hain.
function TpIconDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}>
      <defs>
        <symbol id="ic-fort" viewBox="0 0 48 48"><path d="M5 42V14h7v5h6v-5h12v5h6v-5h7v28" /><path d="M19 42V33a5 5 0 0110 0v9" /><path d="M3 42h42" /></symbol>
        <symbol id="ic-mountain" viewBox="0 0 48 48"><path d="M3 40l13-21 8 12 5-7 15 16z" /><path d="M12 26l4-3 3 4" /><path d="M36 12l-3 5h6zM36 17v4" /></symbol>
        <symbol id="ic-hiker" viewBox="0 0 48 48"><circle cx="25" cy="9" r="3.5" /><path d="M24 15l-4 11 7 5v11M20 26l-7 6M25 16l6 6 5 5M37 14v28" /></symbol>
        <symbol id="ic-mosque" viewBox="0 0 48 48"><path d="M13 40V27h22v13" /><path d="M15 27a9 9 0 0118 0" /><path d="M24 12v6M22 14h4" /><path d="M5 40V19l2.5-4L10 19v21M38 40V19l2.5-4L43 19v21" /><path d="M3 40h42" /><path d="M21 40v-6a3 3 0 016 0v6" /></symbol>
        <symbol id="ic-compass" viewBox="0 0 48 48"><circle cx="24" cy="24" r="17" /><path d="M32 16l-5 11-11 5 5-11z" /><circle cx="24" cy="24" r="1.5" /></symbol>
        <symbol id="ic-pin" viewBox="0 0 48 48"><path d="M24 43S11 31 11 20a13 13 0 0126 0c0 11-13 23-13 23z" /><circle cx="24" cy="20" r="4.5" /></symbol>
      </defs>
    </svg>
  );
}

export default function HeaderClient({ logo, items = [], mega = {}, buttons = [] }) {
  const { authStatus: loginStatus, setAuthStatus } = useAuthStatus();
  const [openId, setOpenId] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const accountRef = useRef(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    function onDocClick(e) {
      if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const loginLabel = buttons?.find((b) => b.name?.toLowerCase() === "login")?.name || "Login";
  const signupLabel = buttons?.find((b) => /sign\s?up/i.test(b.name || ""))?.name || "Sign Up";

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setAuthStatus({ loggedIn: false, email: null, name: null, social: null });
    setAccountOpen(false);
  }

  const initials = loginStatus?.name
    ? loginStatus.name.trim().charAt(0).toUpperCase()
    : loginStatus?.email?.charAt(0).toUpperCase() || "?";

  const openItem = items.find((i) => i.id === openId);
  const openColumns = openId ? mega[openId] || [] : [];

  return (
    <header className="tp-style-2 gh-header">
      <TpIconDefs />
      <div className="tp-style-3">
        <a className="tp-style-4" href="/">
          {logo ? (
            <Image src={logo} alt="Travel Pakistan" width={160} height={34} priority className="gh-logo" />
          ) : (
            <>
              <svg width="40" height="34" viewBox="0 0 40 34" fill="none" stroke="#0E5C36" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 31L14 10l7 10 4-5.5L38 31z" /><path d="M10.5 16.5l3.5 3 3-2.5M23 18l2.5 2.5 3-2" /><path d="M26 6.5a3 3 0 110 .01" /></svg>
              <span className="tp-style-5">Travel <span className="tp-style-6">Pakistan</span></span>
            </>
          )}
        </a>

        <nav className="tp-style-7 gh-nav">
          {items.map((item) => {
            const hasMega = (mega[item.id] || []).length > 0;
            if (hasMega) {
              const isOpen = openId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className="tp-style-8"
                  style={{
                    "--tp-dynamic-0": "3px solid " + (isOpen ? "var(--tp-color-13)" : "transparent"),
                    "--tp-dynamic-1": isOpen ? "var(--tp-color-5)" : "transparent",
                    "--tp-dynamic-2": isOpen ? "var(--tp-color-4)" : "var(--tp-color-3)",
                  }}
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  aria-expanded={isOpen}
                >
                  {item.label}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 9l7 7 7-7" /></svg>
                </button>
              );
            }
            return (
              <a key={item.id} className="tp-style-8 gh-navlink" href={item.url} target={item.target || "_self"}>
                {item.label}
              </a>
            );
          })}
          <a className="tp-style-9" href="/#regionmap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0E5C36" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s-7-6.5-7-12a7 7 0 0114 0c0 5.5-7 12-7 12z" /><circle cx="12" cy="10" r="2.5" /></svg>
            Map
          </a>
        </nav>

        <div className="tp-style-11 gh-actions">
          {!mounted ? (
            <span className="gh-auth-placeholder" aria-hidden="true" />
          ) : loginStatus?.loggedIn ? (
            <div className="gh-account" ref={accountRef}>
              <button type="button" className="gh-account-btn" onClick={() => setAccountOpen((v) => !v)}>
                <span className="gh-avatar">{initials}</span>
                <span className="gh-account-name">{loginStatus.name || loginStatus.email}</span>
              </button>
              {accountOpen && (
                <div className="gh-dropdown">
                  <a href="/my-contributions" className="gh-dropdown-item">My Contributions</a>
                  <button type="button" className="gh-dropdown-item" onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <a href="/login" className="gh-login">{loginLabel}</a>
              <a href="/signup" className="gh-signup">{signupLabel}</a>
            </>
          )}
          <button
            type="button"
            className="gh-burger"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* Mega menu panel — columns WordPress se aate hain (Header.jsx) */}
      {openItem && openColumns.length > 0 && (
        <div className="tp-style-17">
          <div className="tp-style-18">
            <div className="tp-style-19">
              {openColumns.map((col, i) => (
                <div
                  key={i}
                  className="tp-style-20"
                  style={{
                    "--tp-dynamic-0": i % 3 === 2 ? "0" : "1px solid var(--tp-color-2)",
                    "--tp-dynamic-1": i < 3 ? "1px solid var(--tp-color-2)" : "0",
                  }}
                >
                  <svg className="tp-style-21" width="58" height="58" viewBox="0 0 48 48" fill="none" stroke="#0E5C36" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><use href={col.icon || "#ic-pin"} /></svg>
                  <div className="tp-style-22">
                    <div className="tp-style-23">
                      {col.url ? <a href={col.url} onClick={() => setOpenId(null)}>{col.title}</a> : col.title}
                    </div>
                    <div className="tp-style-24">
                      {col.links.map((lk, j) => (
                        <a key={j} className="tp-style-25" href={lk.url} onClick={() => setOpenId(null)}>
                          <span>{lk.label}</span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7B8A81" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7" /></svg>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="gh-mobile">
          {items.map((item) => (
            <div key={item.id} className="gh-mobile-group">
              <a href={item.url} className="gh-mobile-link" onClick={() => setMobileOpen(false)}>{item.label}</a>
              {(mega[item.id] || []).map((col, i) => (
                <div key={i} className="gh-mobile-col">
                  <span className="gh-mobile-col-title">{col.title}</span>
                  {col.links.slice(0, 6).map((lk, j) => (
                    <a key={j} href={lk.url} className="gh-mobile-sub" onClick={() => setMobileOpen(false)}>{lk.label}</a>
                  ))}
                </div>
              ))}
              {!(mega[item.id] || []).length && item.children?.map((c) => (
                <a key={c.id} href={c.url} className="gh-mobile-sub" onClick={() => setMobileOpen(false)}>{c.label}</a>
              ))}
            </div>
          ))}
          <div className="gh-mobile-actions">
            {mounted && loginStatus?.loggedIn ? (
              <>
                <a href="/my-contributions" className="gh-login" onClick={() => setMobileOpen(false)}>My Contributions</a>
                <button type="button" className="gh-signup" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <a href="/login" className="gh-login">{loginLabel}</a>
                <a href="/signup" className="gh-signup">{signupLabel}</a>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
