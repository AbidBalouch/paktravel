"use client";
import styles from "../contribute.module.css";

export default function Step2PhotosDescription({ form, updateForm, onNext, onBack }) {
    const isValid = form.photos.length >= 5;

    function handleFileChange(e) {
        const files = Array.from(e.target.files || []);
        updateForm({ photos: [...form.photos, ...files].slice(0, 8) }); // max 8
    }

    function removePhoto(index) {
        updateForm({ photos: form.photos.filter((_, i) => i !== index) });
    }

    return (
        <div>
            <h2 className={styles.panelTitle}>Photo gallery & Description</h2>

            <div className={styles.field}>
                <label>Photo gallery<span className={styles.required}>*</span></label>
                <div className={styles.uploadRow}>
                    <span className={styles.uploadText}>
                        {form.photos.length > 0 ? `${form.photos.length} file(s) chosen` : "No File Chosen"}
                    </span>
                    <label className={styles.uploadBtn}>
                        Upload Photo
                        <input type="file" accept="image/*" multiple hidden onChange={handleFileChange} />
                    </label>
                </div>
                {form.photos.length > 0 && (
                    <div className={styles.photoPreviewGrid}>
                        {form.photos.map((file, i) => (
                            <div key={i} className={styles.photoPreview}>
                                <img src={URL.createObjectURL(file)} alt="" />
                                <button type="button" onClick={() => removePhoto(i)}>×</button>
                            </div>
                        ))}
                    </div>
                )}
                <p className={styles.hint}>Upload 5–8 photos ({form.photos.length}/8)</p>
            </div>

            <div className={styles.field}>
                <label>Description</label>
                <textarea
                    rows={5}
                    placeholder="A few paragraphs on the history, significance, and character of the place."
                    value={form.description}
                    onChange={(e) => updateForm({ description: e.target.value })}
                />
            </div>

            <div className={styles.actions}>
                <button type="button" className={styles.secondaryBtn} onClick={onBack}>Back</button>
                <button type="button" className={styles.primaryBtn} disabled={!isValid} onClick={onNext}>
                    Continue →
                </button>
            </div>
        </div>
    );
}