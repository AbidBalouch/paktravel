"use client";
import { useState } from "react";
import { Headphones } from "lucide-react";
import Link from "next/link";
import AuthModal from "@/components/AuthModal/AuthModal";
import Step1BasicInfo from "./steps/Step1BasicInfo";
import Step2PhotosDescription from "./steps/Step2PhotosDescription";
import Step3AdditionalInfo from "./steps/Step3AdditionalInfo";
import Step4YourInfo from "./steps/Step4YourInfo";
import styles from "./contribute.module.css";

const STEPS = [
    { id: 1, title: "Basic information", desc: "Tell us who you are to get started." },
    { id: 2, title: "Photo gallery & Description", desc: "Upload 5–8 photos for the gallery mosaic at the top of the page." },
    { id: 3, title: "Additional information", desc: "History, significance, and character of the place." },
    { id: 4, title: "Your Information", desc: "So we can credit you once this goes live." },
];

const EMPTY_FORM = {
    // Step 1
    placeName: "",
    categoryId: "",
    tagline: "",
    specialRecognition: "",
    destinationTermId: null,
    // Step 2
    photos: [], // File[]
    description: "",
    // Step 3
    whatToDo: [""],
    whatToBuy: [""],
    bestSeason: [""],
    policies: [""],
    healthSafety: [""],
    howToReach: [{ mode: "", detail: "" }],
    additionalTips: [""],
    // Step 4
    yourName: "",
    yourEmail: "",
    socialLink: "",
};

export default function ContributeForm({ destinationTerms, attractionTypes, initialLoggedIn, initialEmail, initialName, initialSocial }) {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState(() => ({
        ...EMPTY_FORM,
        yourEmail: initialEmail || "",
        yourName: initialName || "",
        socialLink: initialSocial || "",
    }));
    const [status, setStatus] = useState("idle"); // idle | submitting | success | error
    const [errorMsg, setErrorMsg] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(initialLoggedIn);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState("login");
    const [loggedInEmail, setLoggedInEmail] = useState(initialEmail || "");
    const [logoutSuccess, setLogoutSuccess] = useState(false);

    function updateForm(patch) {
        setForm((prev) => ({ ...prev, ...patch }));
    }

    function goNext() {
        setStep((s) => Math.min(4, s + 1));
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
    function goBack() {
        setStep((s) => Math.max(1, s - 1));
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function handleSubmit() {
        if (!isLoggedIn) {
            const exists = await checkAccountExists(form.yourEmail);
            setAuthMode(exists ? "login" : "register");
            setShowAuthModal(true);
            return;
        }
        await performSubmit();
    }

    async function checkAccountExists(email) {
        try {
            const res = await fetch("/api/auth/check-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            return !!data.exists;
        } catch {
            return false; // fail-safe — register flow dikha dein
        }
    }

    function handleAuthSuccess(email, name, social) {
        setIsLoggedIn(true);
        setShowAuthModal(false);
        setLoggedInEmail(email);
        updateForm({ yourEmail: email, yourName: name || "", socialLink: social || form.socialLink });
        // performSubmit();
        // Auto-submit nahi karte — user ko Step 4 mein updated (locked) values
        // dikhani hain review ke liye, phir wo khud Submit dobara click karega.
    }

    async function handleLogout() {
        await fetch("/api/auth/logout", { method: "POST" });
        setIsLoggedIn(false);
        setLoggedInEmail("");
        updateForm({ yourEmail: "", yourName: "", socialLink: "" });
        setStep(4); // logout ke baad Step 4 pe hi rakhein, taake user dekh sake fields clear ho gayi
        setLogoutSuccess(true);
        setTimeout(() => setLogoutSuccess(false), 1800);
    }

    async function performSubmit() {
        setStatus("submitting");
        setErrorMsg("");

        try {
            const formData = new FormData();

            formData.append("placeName", form.placeName);
            formData.append("categoryId", form.categoryId);
            formData.append("tagline", form.tagline);
            formData.append("specialRecognition", form.specialRecognition);
            formData.append("destinationTermId", form.destinationTermId ?? "");
            formData.append("description", form.description);
            formData.append("whatToDo", JSON.stringify(form.whatToDo.filter(Boolean)));
            formData.append("whatToBuy", JSON.stringify(form.whatToBuy.filter(Boolean)));
            formData.append("bestSeason", JSON.stringify(form.bestSeason.filter(Boolean)));
            formData.append("policies", JSON.stringify(form.policies.filter(Boolean)));
            formData.append("healthSafety", JSON.stringify(form.healthSafety.filter(Boolean)));
            formData.append(
                "howToReach",
                JSON.stringify(form.howToReach.filter((r) => r.mode.trim() || r.detail.trim())),
            );
            formData.append("additionalTips", JSON.stringify(form.additionalTips.filter(Boolean)));
            formData.append("yourName", form.yourName);
            formData.append("yourEmail", form.yourEmail);
            formData.append("socialLink", form.socialLink);

            form.photos.forEach((file) => {
                formData.append("photos", file);
            });

            const res = await fetch("/api/contribute", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                setStatus("error");
                setErrorMsg(data.message || "Submission failed. Please try again.");
                return;
            }

            setStatus("success");
        } catch (err) {
            console.error("Contribute submit error:", err);
            setStatus("error");
            setErrorMsg("Network error — please try again.");
        }
    }

    if (status === "success") {
        return (
            <div className={styles.successWrapper}>
                <h2>Thank you for your contribution! 🎉</h2>
                <p>Our team will review it within 3–5 days. Once approved, it'll go live with your name credited.</p>
            </div>
        );
    }

    return (
        <div className={styles.wizardWrapper}>
            {showAuthModal && (
                <AuthModal
                    prefillName={form.yourName}
                    prefillEmail={form.yourEmail}
                    prefillSocial={form.socialLink}
                    initialMode={authMode}
                    onSuccess={handleAuthSuccess}
                    onClose={() => setShowAuthModal(false)}
                />
            )}

            {logoutSuccess && (
                <div className={styles.toastBackdrop}>
                    <div className={styles.toast}>
                        <div className={styles.toastIcon}>✓</div>
                        <p>Logged out successfully</p>
                    </div>
                </div>
            )}
            <aside className={styles.sidebar}>
                <div className={styles.timeline}>
                    <div className={styles.timelineLine} />
                    <div
                        className={styles.timelineLineActive}
                        style={{
                            height: `${((Math.min(step, STEPS.length) - 1) / (STEPS.length - 1)) * 100}%`,
                        }}
                    />
                    {STEPS.map((s) => (
                        <div key={s.id} className={styles.sidebarStep}>
                            <div className={`${styles.stepBadge} ${step >= s.id ? styles.stepBadgeActive : ""}`}>
                                {s.id}
                            </div>
                            <div>
                                <h4 className={step === s.id ? styles.stepTitleActive : ""}>{s.title}</h4>
                                <p>{s.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <Link href="/contact" className={styles.helpBox}>
                    <div>
                        <strong>Need a help?</strong>
                        <p>chat with us</p>
                    </div>
                    <span className={styles.helpIcon}>
                        <Headphones size={18} strokeWidth={1.75} />
                    </span>
                </Link>
            </aside>

            <div className={styles.formPanel}>

                {isLoggedIn && (
                    <div className={styles.loggedInBar}>
                        <span>Logged in as <strong>{loggedInEmail}</strong></span>
                        <button type="button" onClick={handleLogout} className={styles.logoutBtn}>
                            Logout
                        </button>
                    </div>
                )}

                {step === 1 && (
                    <Step1BasicInfo
                        form={form}
                        updateForm={updateForm}
                        attractionTypes={attractionTypes}
                        destinationTerms={destinationTerms}
                        onNext={goNext}
                    />
                )}
                {step === 2 && (
                    <Step2PhotosDescription
                        form={form}
                        updateForm={updateForm}
                        onNext={goNext}
                        onBack={goBack}
                    />
                )}
                {step === 3 && (
                    <Step3AdditionalInfo
                        form={form}
                        updateForm={updateForm}
                        onNext={goNext}
                        onBack={goBack}
                    />
                )}
                {step === 4 && (
                    <Step4YourInfo
                        form={form}
                        updateForm={updateForm}
                        onBack={goBack}
                        onSubmit={handleSubmit}
                        status={status}
                        errorMsg={errorMsg}
                        isLoggedIn={isLoggedIn}
                    />
                )}
            </div>
        </div>
    );
}