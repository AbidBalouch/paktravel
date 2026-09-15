"use client";
import { useState } from "react";
import { User, Mail, Lock, Phone } from "lucide-react";
import { FaFacebook, FaInstagram, FaYoutube, FaTiktok } from "react-icons/fa6";
import styles from "./AuthModal.module.css";

export default function AuthModal({ prefillName, prefillEmail, initialMode, onSuccess, onClose }) {
    const [mode, setMode] = useState(initialMode || "login");
    const [email, setEmail] = useState(prefillEmail || "");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [name, setName] = useState(prefillName || "");
    const [phone, setPhone] = useState("");
    const [facebook, setFacebook] = useState("");
    const [instagram, setInstagram] = useState("");
    const [youtube, setYoutube] = useState("");
    const [tiktok, setTiktok] = useState("");
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
                    mode === "login"
                        ? { email, password }
                        : { email, password, name, phone, facebook, instagram, youtube, tiktok },
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
                onSuccess(data.email, data.name);
            }, 500);
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
                                    <div className={styles.iconInput}>
                                        <User size={16} className={styles.inputIcon} />
                                        <input
                                            type="text"
                                            placeholder="Exp. John Carter"
                                            required
                                            value={name}
                                            readOnly={!!prefillName}
                                            className={prefillName ? styles.readOnlyInput : ""}
                                            onChange={(e) => !prefillName && setName(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className={styles.field}>
                                <label>Email</label>
                                <div className={styles.iconInput}>
                                    <Mail size={16} className={styles.inputIcon} />
                                    <input
                                        type="email"
                                        placeholder="you@example.com"
                                        required
                                        value={email}
                                        readOnly={!!prefillEmail}
                                        className={prefillEmail ? styles.readOnlyInput : ""}
                                        onChange={(e) => !prefillEmail && setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className={styles.field}>
                                <label>Password</label>
                                <div className={styles.iconInput}>
                                    <Lock size={16} className={styles.inputIcon} />
                                    <input
                                        type="password"
                                        placeholder="Enter your password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            {mode === "register" && (
                                <div className={styles.field}>
                                    <label>Confirm Password</label>
                                    <div className={styles.iconInput}>
                                        <Lock size={16} className={styles.inputIcon} />
                                        <input
                                            type="password"
                                            placeholder="Re-enter your password"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            {mode === "register" && (
                                <div className={styles.field}>
                                    <label>Phone Number <span className={styles.optional}>(optional, kept private)</span></label>
                                    <div className={styles.iconInput}>
                                        <Phone size={16} className={styles.inputIcon} />
                                        <input
                                            type="tel"
                                            placeholder="Exp. +92 300 1234567"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            {mode === "register" && (
                                <div className={styles.socialGrid}>
                                    <div className={styles.field}>
                                        <label>Facebook <span className={styles.optional}>(optional)</span></label>
                                        <div className={styles.iconInput}>
                                            <FaFacebook size={15} className={styles.inputIcon} style={{ color: "#1877f2" }} />
                                            <input type="text" placeholder="facebook.com/you" value={facebook} onChange={(e) => setFacebook(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className={styles.field}>
                                        <label>Instagram <span className={styles.optional}>(optional)</span></label>
                                        <div className={styles.iconInput}>
                                            <FaInstagram size={15} className={styles.inputIcon} style={{ color: "#dc2743" }} />
                                            <input type="text" placeholder="instagram.com/you" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className={styles.field}>
                                        <label>YouTube <span className={styles.optional}>(optional)</span></label>
                                        <div className={styles.iconInput}>
                                            <FaYoutube size={15} className={styles.inputIcon} style={{ color: "#ff0000" }} />
                                            <input type="text" placeholder="youtube.com/@you" value={youtube} onChange={(e) => setYoutube(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className={styles.field}>
                                        <label>TikTok <span className={styles.optional}>(optional)</span></label>
                                        <div className={styles.iconInput}>
                                            <FaTiktok size={15} className={styles.inputIcon} />
                                            <input type="text" placeholder="tiktok.com/@you" value={tiktok} onChange={(e) => setTiktok(e.target.value)} />
                                        </div>
                                    </div>
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