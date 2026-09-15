"use client";
import { createContext, useContext, useState } from "react";

const AuthStatusContext = createContext(null);

export function AuthStatusProvider({ initialStatus, children }) {
    const [authStatus, setAuthStatus] = useState(initialStatus);
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