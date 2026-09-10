"use client";
import LocationTreeSelect from "@/components/LocationTreeSelect/LocationTreeSelect";
import styles from "../contribute.module.css";

export default function Step1BasicInfo({ form, updateForm, attractionTypes, destinationTerms, onNext }) {
    const isValid = form.placeName.trim() && form.categoryId && form.destinationTermId;

    return (
        <div>
            <h2 className={styles.panelTitle}>Basic information</h2>

            <div className={styles.row2}>
                <div className={styles.field}>
                    <label>Location / place name<span className={styles.required}>*</span></label>
                    <input
                        type="text"
                        placeholder="Exp. Lahore Fort"
                        value={form.placeName}
                        onChange={(e) => updateForm({ placeName: e.target.value })}
                    />
                </div>
                <div className={styles.field}>
                    <label>Category<span className={styles.required}>*</span></label>
                    <select
                        value={form.categoryId}
                        onChange={(e) => updateForm({ categoryId: e.target.value })}
                    >
                        <option value="">Select category</option>
                        {attractionTypes.map((t) => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className={styles.field}>
                <label>Tagline / subtitle<span className={styles.required}>*</span></label>
                <input
                    type="text"
                    placeholder="Exp. An architectural masterpiece..."
                    value={form.tagline}
                    onChange={(e) => updateForm({ tagline: e.target.value })}
                />
            </div>

            <div className={styles.field}>
                <label>Special recognition <span className={styles.optional}>(optional)</span></label>
                <input
                    type="text"
                    placeholder="Exp. UNESCO World Heritage Site"
                    value={form.specialRecognition}
                    onChange={(e) => updateForm({ specialRecognition: e.target.value })}
                />
            </div>

            <div className={styles.field}>
                <label>Province / Division / District<span className={styles.required}>*</span></label>
                <LocationTreeSelect
                    terms={destinationTerms}
                    value={form.destinationTermId}
                    onChange={(id) => updateForm({ destinationTermId: id })}
                />
            </div>

            <div className={styles.actions}>
                <button type="button" className={styles.primaryBtn} disabled={!isValid} onClick={onNext}>
                    Continue →
                </button>
            </div>
        </div>
    );
}