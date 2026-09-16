"use client";
import { createContext, useContext, useState, useEffect } from "react";

const AuthStatusContext = createContext(null);

const LOGGED_OUT_DEFAULT = {
  loggedIn: false,
  email: null,
  name: null,
  social: null,
};

//  non-sensitive "hint" cookie hai (httpOnly NAHI) 

const LOGIN_HINT_COOKIE = "tp_logged_in";

function readLoginHintCookie() {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split("; ")
    .some((row) => row.startsWith(`${LOGIN_HINT_COOKIE}=1`));
}

export function AuthStatusProvider({ initialStatus, children }) {

  const [authStatus, setAuthStatus] = useState(() => {
    if (initialStatus) return initialStatus;
    return readLoginHintCookie()
      ? { ...LOGGED_OUT_DEFAULT, loggedIn: true }
      : LOGGED_OUT_DEFAULT;
  });

  useEffect(() => {
    let cancelled = false;

    fetch("/api/auth/status")
      .then((res) => (res.ok ? res.json() : LOGGED_OUT_DEFAULT))
      .then((data) => {
        if (!cancelled) setAuthStatus(data);
      })
      .catch(() => {
        if (!cancelled) setAuthStatus(LOGGED_OUT_DEFAULT);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AuthStatusContext.Provider value={{ authStatus, setAuthStatus }}>
      {children}
    </AuthStatusContext.Provider>
  );
}

export function useAuthStatus() {
  const ctx = useContext(AuthStatusContext);
  if (!ctx) throw new Error("useAuthStatus must be used within AuthStatusProvider");
  return ctx;
}