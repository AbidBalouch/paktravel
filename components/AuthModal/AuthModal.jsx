"use client";
import { useState } from "react";
import styles from "./AuthModal.module.css";

export default function AuthModal({ prefillName, prefillEmail, prefillSocial, initialMode, onSuccess, onClose }) {
    const [mode, setMode] = useState(initialMode || "login");
    const [email, setEmail] = useState(prefillEmail || "");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [name, setName] = useState(prefillName || "");
    const [social, setSocial] = useState(prefillSocial || "");
    const [status, setStatus] = useState("idle"); // idle | submitting | success | error
    const [error, setError] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        if (mode === "register" && password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setStatus("submitting");

        try {
            const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                    mode === "login" ? { email, password } : { email, password, name, social },
                ),
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
                setStatus("error");
                setError(data.message || "Something went wrong.");
                return;
            }

            // Success state dikhayein, phir thodi dair baad submission continue karein
            setStatus("success");
            setTimeout(() => {
                onSuccess(data.email, data.name, data.social);
            }, 1200);
        } catch (err) {
            setStatus("error");
            setError("Network error — please try again.");
        }
    }

    return (
        <div className={styles.backdrop} onClick={status === "success" ? undefined : onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {status !== "success" && (
                    <button type="button" className={styles.closeBtn} onClick={onClose}>×</button>
                )}

                {status === "success" ? (
                    <div className={styles.successBox}>
                        <div className={styles.successIcon}>✓</div>
                        <h2>{mode === "login" ? "Login successful!" : "Account created successfully!"}</h2>
                        <p className={styles.subtitle}>Submitting your contribution...</p>
                    </div>
                ) : (
                    <>
                        <h2>{mode === "login" ? "Log in to continue" : "Create an account"}</h2>
                        <p className={styles.subtitle}>
                            {mode === "login"
                                ? "Please log in before submitting your contribution."
                                : "Sign up to submit your contribution."}
                        </p>

                        <form onSubmit={handleSubmit}>
                            {mode === "register" && (
                                <div className={styles.field}>
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        placeholder="Exp. John Carter"
                                        required
                                        value={name}
                                        readOnly={!!prefillName}
                                        className={prefillName ? styles.readOnlyInput : ""}
                                    />
                                </div>
                            )}

                            {mode === "register" && (
                                <div className={styles.field}>
                                    <label>Social Media Link <span className={styles.optional}>(optional)</span></label>
                                    <input
                                        type="text"
                                        placeholder="Exp. https://instagram.com/yourhandle"
                                        value={social}
                                        readOnly={!!prefillSocial}
                                        className={prefillSocial ? styles.readOnlyInput : ""}
                                        onChange={(e) => !prefillSocial && setSocial(e.target.value)}
                                        onBlur={() => {
                                            if (!prefillSocial && social && !/^https?:\/\//i.test(social)) {
                                                setSocial(`https://${social}`);
                                            }
                                        }}
                                    />
                                </div>
                            )}

                            <div className={styles.field}>
                                <label>Email</label>
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    required
                                    value={email}
                                    readOnly={!!prefillEmail}
                                    className={prefillEmail ? styles.readOnlyInput : ""}
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

                            {mode === "register" && (
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
                            )}

                            {error && <p className={styles.error}>{error}</p>}

                            <button type="submit" className={styles.submitBtn} disabled={status === "submitting"}>
                                {status === "submitting" ? "Please wait..." : mode === "login" ? "Log In" : "Sign Up"}
                            </button>
                        </form>

                        <p className={styles.switchMode}>
                            {mode === "login" ? (
                                <>Don't have an account? <button type="button" onClick={() => setMode("register")}>Sign up</button></>
                            ) : (
                                <>Already have an account? <button type="button" onClick={() => setMode("login")}>Log in</button></>
                            )}
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}