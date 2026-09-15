"use client";
import { useState } from "react";
import Link from "next/link";
import { FaFacebook, FaInstagram, FaYoutube, FaTiktok } from "react-icons/fa6";
import { Phone } from "lucide-react";
import styles from "./signup.module.css";

export default function SignupForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [facebook, setFacebook] = useState("");
    const [instagram, setInstagram] = useState("");
    const [youtube, setYoutube] = useState("");
    const [tiktok, setTiktok] = useState("");
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
                body: JSON.stringify({ email, password, name, phone, facebook, instagram, youtube, tiktok }),
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
                    <div className={styles.row2}>
                        <div className={styles.field}>
                            <label>Full Name</label>
                            <input type="text" placeholder="Exp. Ali Ahmad" required value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className={styles.field}>
                            <label>Email</label>
                            <input type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                    </div>

                    <div className={styles.row2}>
                        <div className={styles.field}>
                            <label>Password</label>
                            <input type="password" placeholder="Enter your password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <div className={styles.field}>
                            <label>Confirm Password</label>
                            <input type="password" placeholder="Re-enter your password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label>Phone Number <span className={styles.optional}>(optional, kept private)</span></label>
                        <div className={styles.iconInput}>
                            <Phone size={16} className={styles.inputIcon} />
                            <input type="tel" placeholder="Exp. +92 300 1234567" value={phone} onChange={(e) => setPhone(e.target.value)} />
                        </div>
                    </div>

                    <p className={styles.sectionLabel}>Social links <span className={styles.optional}>(optional)</span></p>
                    <div className={styles.socialGrid}>
                        <div className={styles.iconInput}>
                            <FaFacebook size={16} className={styles.inputIcon} style={{ color: "#1877f2" }} />
                            <input type="text" placeholder="Facebook" value={facebook} onChange={(e) => setFacebook(e.target.value)} />
                        </div>
                        <div className={styles.iconInput}>
                            <FaInstagram size={16} className={styles.inputIcon} style={{ color: "#dc2743" }} />
                            <input type="text" placeholder="Instagram" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
                        </div>
                        <div className={styles.iconInput}>
                            <FaYoutube size={16} className={styles.inputIcon} style={{ color: "#ff0000" }} />
                            <input type="text" placeholder="YouTube" value={youtube} onChange={(e) => setYoutube(e.target.value)} />
                        </div>
                        <div className={styles.iconInput}>
                            <FaTiktok size={16} className={styles.inputIcon} />
                            <input type="text" placeholder="TikTok" value={tiktok} onChange={(e) => setTiktok(e.target.value)} />
                        </div>
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