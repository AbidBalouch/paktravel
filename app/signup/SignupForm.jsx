"use client";
import { useState } from "react";
import Link from "next/link";
import styles from "./signup.module.css";

export default function SignupForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [social, setSocial] = useState("");
    const [status, setStatus] = useState("idle");
    const [error, setError] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setStatus("submitting");

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, name, social }),
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
                setStatus("error");
                setError(data.message || "Something went wrong.");
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
                <h1 className={styles.title}>Create an account</h1>
                <p className={styles.subtitle}>Join Travel Pakistan to submit your discoveries.</p>

                <form onSubmit={handleSubmit}>
                    <div className={styles.field}>
                        <label>Full Name</label>
                        <input
                            type="text"
                            placeholder="Exp. John Carter"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className={styles.field}>
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className={styles.field}>
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className={styles.field}>
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            placeholder="Re-enter your password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    <div className={styles.field}>
                        <label>Social Media Link <span className={styles.optional}>(optional)</span></label>
                        <input
                            type="text"
                            placeholder="Exp. https://instagram.com/yourhandle"
                            value={social}
                            onChange={(e) => setSocial(e.target.value)}
                            onBlur={() => {
                                if (social && !/^https?:\/\//i.test(social)) {
                                    setSocial(`https://${social}`);
                                }
                            }}
                        />
                    </div>

                    {error && <p className={styles.error}>{error}</p>}

                    <button type="submit" className={styles.submitBtn} disabled={status === "submitting"}>
                        {status === "submitting" ? "Please wait..." : "Sign Up"}
                    </button>
                </form>

                <p className={styles.switchMode}>
                    Already have an account? <Link href="/login">Log in</Link>
                </p>
            </div>
        </div>
    );
}