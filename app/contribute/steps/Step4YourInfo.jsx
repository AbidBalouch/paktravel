"use client";
import styles from "../contribute.module.css";

export default function Step4YourInfo({ form, updateForm, onBack, onSubmit, status, errorMsg, isLoggedIn }) {
    const isValid = form.yourName.trim() && form.yourEmail.trim();

    return (
        <div>
            <h2 className={styles.panelTitle}>Your Details</h2>

            <div className={styles.row2}>
                <div className={styles.field}>
                    <label>Your name<span className={styles.required}>*</span></label>
                    <input
                        type="text"
                        placeholder="Exp. John Carter"
                        value={form.yourName}
                        onChange={(e) => updateForm({ yourName: e.target.value })}
                        readOnly={isLoggedIn}
                        className={isLoggedIn ? styles.readOnlyInput : ""}
                    />
                    {isLoggedIn && (
                        <p className={styles.hint}>This is your account name — contact us to change it.</p>
                    )}
                </div>
                <div className={styles.field}>
                    <label>Your email<span className={styles.required}>*</span></label>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={form.yourEmail}
                        onChange={(e) => updateForm({ yourEmail: e.target.value })}
                        readOnly={isLoggedIn}
                        className={isLoggedIn ? styles.readOnlyInput : ""}
                    />
                    {isLoggedIn && (
                        <p className={styles.hint}>This is your account email and can't be changed here.</p>
                    )}
                </div>
            </div>

            <div className={styles.field}>
                <label>Social media link</label>
                <input
                    type="text"
                    placeholder="Exp. https://instagram.com/yourhandle"
                    value={form.socialLink}
                    onChange={(e) => updateForm({ socialLink: e.target.value })}
                    readOnly={isLoggedIn}
                    className={isLoggedIn ? styles.readOnlyInput : ""}
                />
                {isLoggedIn && (
                    <p className={styles.hint}>This is your account's social link — contact us to change it.</p>
                )}
            </div>

            {status === "error" && <p className={styles.errorMsg}>{errorMsg}</p>}

            <div className={styles.actions}>
                <button type="button" className={styles.secondaryBtn} onClick={onBack}>Back</button>
                <button
                    type="button"
                    className={styles.primaryBtn}
                    disabled={!isValid || status === "submitting"}
                    onClick={onSubmit}
                >
                    {status === "submitting" ? "Submitting..." : "Submit →"}
                </button>
            </div>
        </div>
    );
}