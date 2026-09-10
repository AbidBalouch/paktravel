"use client";
// app/contact/ContactForm.jsx
// ---------------------------------------------------------------------------
// CLIENT COMPONENT — form ka STRUCTURE (fields/labels/options) server se
// `fields` prop ke zariye aata hai, dynamic render hota hai. Sirf
// INTERACTIVITY (typing, submit, status) client-side hai.
//
// Submits directly to CF7's built-in REST feedback endpoint — CF7 core
// v5.1+ mein by default available, alag plugin ki zaroorat nahi.
// ---------------------------------------------------------------------------

import { useState } from "react";
import styles from "./contact.module.css";

// text/email jaisi chhoti fields ko consecutive pairs mein group karta hai
// (Full Name + Email jaisa 2-column row), taake design ka side-by-side
// layout bane rahe. textarea/select hamesha standalone (full-width) rehte hain.
const ROW_ELIGIBLE_TYPES = ["text", "email"];

function groupFieldsIntoRows(fields) {
    const rows = [];
    let pending = null;

    fields.forEach((field, index) => {
        const isRowEligible = ROW_ELIGIBLE_TYPES.includes(field.type);

        if (!isRowEligible) {
            if (pending) {
                rows.push([pending]);
                pending = null;
            }
            rows.push([{ field, index }]);
            return;
        }

        if (pending) {
            rows.push([pending, { field, index }]);
            pending = null;
        } else {
            pending = { field, index };
        }
    });

    if (pending) rows.push([pending]);

    return rows;
}

export default function ContactForm({ formId, fields, submitLabel }) {
    const [status, setStatus] = useState("idle"); // idle | sending | success | error
    const [errorMsg, setErrorMsg] = useState("");
    // Controlled values keyed by CF7 field name (e.g. "your-name")
    const [values, setValues] = useState(() =>
        Object.fromEntries(fields.map((f) => [f.name, ""])),
    );

    function handleChange(name, value) {
        setValues((prev) => ({ ...prev, [name]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setStatus("sending");
        setErrorMsg("");

        const formData = new FormData();
        Object.entries(values).forEach(([name, value]) => {
            formData.append(name, value);
        });

        formData.append("_wpcf7", formId);
        formData.append("_wpcf7_version", "6.1.7.0");
        formData.append("_wpcf7_locale", "en_US");
        formData.append("_wpcf7_unit_tag", `wpcf7-f${formId}-p0-o1`);
        formData.append("_wpcf7_container_post", "0");

        const endpoint = `${process.env.NEXT_PUBLIC_WP_API_URL}/wp-json/contact-form-7/v1/contact-forms/${formId}/feedback`;

        try {
            const res = await fetch(endpoint, {
                method: "POST",
                body: formData,
            });
            const data = await res.json();

            // CF7 returns status: "mail_sent" on success, "validation_failed" /
            // "mail_failed" / "spam" on failure — even with an HTTP 200/403.
            if (data.status === "mail_sent") {
                setStatus("success");
                setValues(Object.fromEntries(fields.map((f) => [f.name, ""])));
            } else {
                setStatus("error");
                setErrorMsg(
                    data.message || "Submission failed. Please check the form fields.",
                );
            }
        } catch (err) {
            console.error("CF7 submit error:", err);
            setStatus("error");
            setErrorMsg("Network error — please try again.");
        }
    }

    // Ek field ko uske "type" ke hisaab se sahi input render karta hai
    function renderField(field, index) {
        // Duplicate option values (CF7 admin ka data issue) ko safe React key
        // dene ke liye index bhi shamil kiya gaya hai.
        const key = `${field.name}-${index}`;

        if (field.type === "textarea") {
            return (
                <div className={styles.field} key={key}>
                    <label htmlFor={field.name}>{field.placeholder || field.name}</label>
                    <textarea
                        id={field.name}
                        name={field.name}
                        rows={5}
                        placeholder={field.placeholder}
                        required={field.required}
                        value={values[field.name] ?? ""}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                    />
                </div>
            );
        }

        if (field.type === "select") {
            return (
                <div className={styles.field} key={key}>
                    <label htmlFor={field.name}>Subject</label>
                    <select
                        id={field.name}
                        name={field.name}
                        required={field.required}
                        value={values[field.name] ?? field.options[0] ?? ""}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                    >
                        {field.options.map((opt, i) => (
                            <option key={`${opt}-${i}`} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>
            );
        }

        // text, email, aur baaki CF7 basetypes text-like input mein fallback
        return (
            <div className={styles.field} key={key}>
                <label htmlFor={field.name}>{field.placeholder || field.name}</label>
                <input
                    id={field.name}
                    name={field.name}
                    type={field.type === "email" ? "email" : "text"}
                    placeholder={field.placeholder}
                    required={field.required}
                    value={values[field.name] ?? ""}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                />
            </div>
        );
    }

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <h2 className={styles.formTitle}>Send Us a Message</h2>

            {groupFieldsIntoRows(fields).map((group, i) =>
                group.length === 1 ? (
                    renderField(group[0].field, group[0].index)
                ) : (
                    <div className={styles.row} key={`row-${i}`}>
                        {group.map(({ field, index }) => renderField(field, index))}
                    </div>
                ),
            )}

            <button type="submit" className={styles.submitBtn} disabled={status === "sending"}>
                {status === "sending" ? "Sending..." : submitLabel}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            {status === "success" && (
                <p className={styles.successMsg}>Thank you — your message has been sent!</p>
            )}
            {status === "error" && <p className={styles.errorMsg}>{errorMsg}</p>}
        </form>
    );
}