"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock } from "lucide-react";
import styles from "./reset-password.module.css";

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  // WordPress apna native reset-email format use karta hai agar JWT Login
  // ki "Reset Password URL" setting configure na ho: ?login=...&key=...
  // JWT Login ka apna custom format hone par: ?code=...&email=...
  // Dono ko support kar rahe hain — jo bhi mile, wahi use hoga.
  const code = searchParams.get("code") || searchParams.get("key") || "";
  const email = searchParams.get("email") || searchParams.get("login") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    if (password.length < 8) {
      setStatus("error");
      setMessage("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    setStatus("submitting");
    setMessage("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, email, password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setStatus("error");
        setMessage(data.message || "This reset link is invalid or has expired.");
        return;
      }

      setStatus("success");
      setMessage("Your password has been reset. You can now log in.");
    } catch {
      setStatus("error");
      setMessage("Network error — please try again.");
    }
  }

  if (!code || !email) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <h1 className={styles.title}>Invalid link</h1>
          <p className={styles.subtitle}>
            This password reset link is missing or invalid. Please request a new one.
          </p>
          <p className={styles.switchMode}>
            <Link href="/forgot-password">Request a new reset link</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>Reset password</h1>
        <p className={styles.subtitle}>Choose a new password for {email}'s account.</p>

        {status === "success" ? (
          <>
            <p className={styles.success}>{message}</p>
            <p className={styles.switchMode}>
              <Link href="/login">Go to log in</Link>
            </p>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label>New password</label>
              <div className={styles.iconInput}>
                <Lock size={16} className={styles.inputIcon} />
                <input
                  type="password"
                  placeholder="Enter new password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label>Confirm password</label>
              <div className={styles.iconInput}>
                <Lock size={16} className={styles.inputIcon} />
                <input
                  type="password"
                  placeholder="Re-enter new password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            {status === "error" && <p className={styles.error}>{message}</p>}

            <button type="submit" className={styles.submitBtn} disabled={status === "submitting"}>
              {status === "submitting" ? "Resetting..." : "Reset password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
