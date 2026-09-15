"use client";
import { useState } from "react";
import Link from "next/link";
import { Mail, Lock } from "lucide-react";
import styles from "./login.module.css";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [status, setStatus] = useState("idle");
    const [error, setError] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        setStatus("submitting");
        setError("");

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
                setStatus("error");
                setError(data.message || "Invalid email or password.");
                return;
            }

            window.location.href = "/";
        } catch {
            setStatus("error");
            setError("Network error — please try again.");
        }
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.card}>
                <h1 className={styles.title}>Log in</h1>
                <p className={styles.subtitle}>Welcome back to Travel Pakistan.</p>

                <form onSubmit={handleSubmit}>
                    <div className={styles.field}>
                        <label>Email</label>
                        <div className={styles.iconInput}>
                            <Mail size={16} className={styles.inputIcon} />
                            <input type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                    </div>
                    <div className={styles.field}>
                        <label>Password</label>
                        <div className={styles.iconInput}>
                            <Lock size={16} className={styles.inputIcon} />
                            <input type="password" placeholder="Enter your password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                    </div>

                    {error && <p className={styles.error}>{error}</p>}

                    <button type="submit" className={styles.submitBtn} disabled={status === "submitting"}>
                        {status === "submitting" ? "Please wait..." : "Log In"}
                    </button>
                </form>

                <p className={styles.forgotLink}>
                    <Link href="/forgot-password">Forgot password?</Link>
                </p>

                <p className={styles.switchMode}>
                    Don't have an account? <Link href="/signup">Sign up</Link>
                </p>
            </div>
        </div>
    );
}