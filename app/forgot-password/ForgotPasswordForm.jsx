"use client";
import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import styles from "./forgot-password.module.css";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("submitting");
    setMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setStatus("error");
        setMessage(data.message || "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
      setMessage(
        data.message ||
          "If an account exists with that email, a reset link has been sent.",
      );
    } catch {
      setStatus("error");
      setMessage("Network error — please try again.");
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>Forgot password?</h1>
        <p className={styles.subtitle}>
          Enter your email and we'll send you a link to reset it.
        </p>

        {status === "success" ? (
          <p className={styles.success}>{message}</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label>Email</label>
              <div className={styles.iconInput}>
                <Mail size={16} className={styles.inputIcon} />
                <input
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {status === "error" && <p className={styles.error}>{message}</p>}

            <button type="submit" className={styles.submitBtn} disabled={status === "submitting"}>
              {status === "submitting" ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}

        <p className={styles.switchMode}>
          <Link href="/login">← Back to log in</Link>
        </p>
      </div>
    </div>
  );
}
