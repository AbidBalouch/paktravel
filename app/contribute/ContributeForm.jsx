"use client";

import { useState, useEffect } from "react";
import { Headphones } from "lucide-react";
import Link from "next/link";
import { useAuthStatus } from "@/components/AuthStatus/AuthStatusContext";
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
};

export default function ContributeForm({ destinationTerms, attractionTypes, initialLoggedIn, initialEmail, initialName, initialSocial }) {
    const { authStatus, setAuthStatus } = useAuthStatus();
    const [step, setStep] = useState(1);
    const [form, setForm] = useState(() => ({
        ...EMPTY_FORM,
        yourEmail: initialEmail || "",
        yourName: initialName || "",
        socialLink: initialSocial || "",
    }));
    const [status, setStatus] = useState("idle"); // idle | submitting | success | error
    const [errorMsg, setErrorMsg] = useState("");
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState("login");
    const [logoutSuccess, setLogoutSuccess] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Ab Context hi single source of truth hai — Header se logout ho ya
    // yahan se, dono jagah instantly sync rahenge.
    const isLoggedIn = authStatus.loggedIn;
    const loggedInEmail = authStatus.email;

    // Agar login status kahin bhi (Header se ya yahan se) false ho jaye,
    // form ko bhi reset kar dein taake stale data na reh jaye.
    useEffect(() => {
        if (!isLoggedIn) {
            updateForm({ yourEmail: "", yourName: "", socialLink: "" });
            setStep(1);
        }
    }, [isLoggedIn]);

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
        // Login pehle hi ho chuka hai (gate se) — seedha confirm modal
        setShowConfirmModal(true);
    }

    async function confirmAndSubmit() {
        setShowConfirmModal(false);
        await performSubmit();
    }

    function handleAuthSuccess(email, name) {
        setShowAuthModal(false);
        updateForm({ yourEmail: email, yourName: name || "" });
        setAuthStatus({ loggedIn: true, email, name: name || null });
    }

    async function handleLogout() {
        await fetch("/api/auth/logout", { method: "POST" });
        updateForm({ yourEmail: "", yourName: "", socialLink: "" });
        setStep(1); // fresh start — logout ke baad wapis shuru se
        setLogoutSuccess(true);
        setTimeout(() => setLogoutSuccess(false), 1800);
        setAuthStatus({ loggedIn: false, email: null, name: null, social: null });
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
                <div className={styles.successIconBig}>✓</div>
                <h2>Thank you for your contribution! 🎉</h2>
                <p className={styles.successSubtitle}>
                    Here's what happens next:
                </p>

                <div className={styles.successTimeline}>
                    <div className={styles.successStep}>
                        <div className={styles.successStepBadge}>✓</div>
                        <div>
                            <h4>Submitted</h4>
                            <p>Your contribution has been received.</p>
                        </div>
                    </div>
                    <div className={styles.successStep}>
                        <div className={styles.successStepBadge}>2</div>
                        <div>
                            <h4>Under Review</h4>
                            <p>Our team checks the details and photos, usually within 3–5 days.</p>
                        </div>
                    </div>
                    <div className={styles.successStep}>
                        <div className={styles.successStepBadge}>3</div>
                        <div>
                            <h4>Goes Live</h4>
                            <p>Once approved, the full page is published with your name and social link attached.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const category = attractionTypes.find((t) => String(t.id) === String(form.categoryId));

    const SECTION_LABELS = [
        { key: "whatToDo", label: "What To Do" },
        { key: "whatToBuy", label: "What To Buy" },
        { key: "bestSeason", label: "Best Season to Visit" },
        { key: "policies", label: "Policies & Info" },
        { key: "healthSafety", label: "Health & Safety" },
        { key: "additionalTips", label: "Additional Tips" },
    ];

    function getFilledSectionsCount() {
        let count = SECTION_LABELS.filter(
            (s) => form[s.key].some((v) => v.trim && v.trim()),
        ).length;
        if (form.howToReach.some((r) => r.mode.trim() || r.detail.trim())) count += 1;
        return count;
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

            {showConfirmModal && (
                <div className={styles.confirmBackdrop} onClick={() => setShowConfirmModal(false)}>
                    <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
                        <h3>Ready to submit?</h3>
                        <p>
                            You're about to submit <strong>{form.placeName || "this place"}</strong> for
                            review. Our team will check the details within 3–5 days before it goes live.
                        </p>

                        <div className={styles.summaryBox}>
                            <div className={styles.summaryRow}>
                                <span>📍 Place</span>
                                <strong>{form.placeName || "—"}</strong>
                            </div>
                            <div className={styles.summaryRow}>
                                <span>🏷️ Category</span>
                                <strong>{category?.name || "—"}</strong>
                            </div>
                            <div className={styles.summaryRow}>
                                <span>📸 Photos</span>
                                <strong>{form.photos.length} photo{form.photos.length !== 1 ? "s" : ""}</strong>
                            </div>
                            <div className={styles.summaryRow}>
                                <span>📝 Sections filled</span>
                                <strong>{getFilledSectionsCount()} of {SECTION_LABELS.length + 1}</strong>
                            </div>
                        </div>

                        <div className={styles.confirmActions}>
                            <button
                                type="button"
                                className={styles.secondaryBtn}
                                onClick={() => setShowConfirmModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className={styles.primaryBtn}
                                onClick={confirmAndSubmit}
                            >
                                Yes, Submit
                            </button>
                        </div>
                    </div>
                </div>
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
                        <a href="/my-contributions" className={styles.myContributionsLink}>
                            My Contributions
                        </a>
                        <button type="button" onClick={handleLogout} className={styles.logoutBtn}>
                            Logout
                        </button>
                    </div>
                )}

                {!isLoggedIn ? (
                    <div className={styles.gateCard}>
                        <h2 className={styles.panelTitle}>Log in to get started</h2>
                        <p className={styles.gateText}>
                            Please log in or create a free account before adding a new place —
                            this helps us credit your contribution and keep submissions accountable.
                        </p>
                        <div className={styles.gateActions}>
                            <button
                                type="button"
                                className={styles.secondaryBtn}
                                onClick={() => {
                                    setAuthMode("login");
                                    setShowAuthModal(true);
                                }}
                            >
                                Log In
                            </button>
                            <button
                                type="button"
                                className={styles.primaryBtn}
                                onClick={() => {
                                    setAuthMode("register");
                                    setShowAuthModal(true);
                                }}
                            >
                                Sign Up
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
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
                    </>
                )}
            </div>
        </div>
    );
}