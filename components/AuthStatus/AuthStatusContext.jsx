"use client";
import { createContext, useContext, useState, useEffect } from "react";

const AuthStatusContext = createContext(null);

const LOGGED_OUT_DEFAULT = {
  loggedIn: false,
  email: null,
  name: null,
  social: null,
};

export function AuthStatusProvider({ initialStatus, children }) {
  // initialStatus ab layout se nahi aati (server-side cookies() read hata
  // di gayi hai) — is liye "logged out" default se shuru karte hain, phir
  // mount hote hi client-side /api/auth/status se asal status fetch karte
  // hain. Isse koi bhi page render (chahe kitna bhi nested/static ho) is
  // fetch se bilkul unaffected rehta hai.
  const [authStatus, setAuthStatus] = useState(initialStatus || LOGGED_OUT_DEFAULT);

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
