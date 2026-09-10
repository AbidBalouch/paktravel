"use client";
import styles from "../contribute.module.css";

// Config-driven — 7 sections almost identical structure hain, isliye
// hardcode karne ki bajaye ek array se render kar rahe hain.
const REPEATER_SECTIONS_BEFORE_REACH = [
    { key: "whatToDo", label: "What to do", placeholder: "Activity Title", addLabel: "+ Add another activity" },
    { key: "whatToBuy", label: "What to buy", placeholder: "Local crafts, markets, or souvenirs worth calling out", addLabel: "+ Add another item" },
    { key: "bestSeason", label: "Best season to visit", placeholder: "Summer", addLabel: "+ Add about another season" },
    { key: "policies", label: "Policies & info", placeholder: "One rule or tip per line — dress code, conduct, littering, guide fees, etc.", addLabel: "+ Add another point" },
    { key: "healthSafety", label: "Health & safety", placeholder: "Anything a traveler should know before visiting — footwear, hydration, crowd safety, etc.", addLabel: "+ Add another point" },
    { key: "additionalTips", label: "Additional Tips", placeholder: "Photography tips", addLabel: "+ Add another tip" },
];

const REPEATER_SECTIONS_AFTER_REACH = [
    { key: "additionalTips", label: "Additional Tips", placeholder: "Photography tips", addLabel: "+ Add another tip" },
];

export default function Step3AdditionalInfo({ form, updateForm, onNext, onBack }) {
    function updateItem(key, index, value) {
        const list = [...form[key]];
        list[index] = value;
        updateForm({ [key]: list });
    }

    function addItem(key) {
        updateForm({ [key]: [...form[key], ""] });
    }

    function removeItem(key, index) {
        const list = form[key].filter((_, i) => i !== index);
        updateForm({ [key]: list.length ? list : [""] });
    }

    // How to Reach — WP field mein 2 sub-fields hain (transport_mode +
    // transport_detail), is liye generic single-input repeater use nahi
    // ho sakta, alag se handle kar rahe hain.
    function updateHowToReach(index, field, value) {
        const list = [...form.howToReach];
        list[index] = { ...list[index], [field]: value };
        updateForm({ howToReach: list });
    }
    function addHowToReach() {
        updateForm({ howToReach: [...form.howToReach, { mode: "", detail: "" }] });
    }
    function removeHowToReach(index) {
        const list = form.howToReach.filter((_, i) => i !== index);
        updateForm({ howToReach: list.length ? list : [{ mode: "", detail: "" }] });
    }

    return (
        <div>
            <h2 className={styles.panelTitle}>Additional information</h2>

            {REPEATER_SECTIONS_BEFORE_REACH.map((section) => (
                <div key={section.key} className={styles.repeaterBlock}>
                    <label>{section.label}</label>
                    {form[section.key].map((value, i) => (
                        <div key={i} className={styles.repeaterRow}>
                            <input
                                type="text"
                                placeholder={section.placeholder}
                                value={value}
                                onChange={(e) => updateItem(section.key, i, e.target.value)}
                            />
                            {form[section.key].length > 1 && (
                                <button type="button" className={styles.removeBtn} onClick={() => removeItem(section.key, i)}>
                                    ×
                                </button>
                            )}
                        </div>
                    ))}
                    <button type="button" className={styles.addBtn} onClick={() => addItem(section.key)}>
                        {section.addLabel}
                    </button>
                </div>
            ))}

            <div className={styles.repeaterBlock}>
                <label>How to reach</label>
                {form.howToReach.map((row, i) => (
                    <div key={i} className={styles.repeaterRow}>
                        <input
                            type="text"
                            placeholder="By car"
                            value={row.mode}
                            onChange={(e) => updateHowToReach(i, "mode", e.target.value)}
                            style={{ flex: "0 0 35%" }}
                        />
                        <input
                            type="text"
                            placeholder="Details — distance, duration, directions, etc."
                            value={row.detail}
                            onChange={(e) => updateHowToReach(i, "detail", e.target.value)}
                        />
                        {form.howToReach.length > 1 && (
                            <button type="button" className={styles.removeBtn} onClick={() => removeHowToReach(i)}>
                                ×
                            </button>
                        )}
                    </div>
                ))}
                <button type="button" className={styles.addBtn} onClick={addHowToReach}>
                    + Add another way
                </button>
            </div>

            {REPEATER_SECTIONS_AFTER_REACH.map((section) => (
                <div key={section.key} className={styles.repeaterBlock}>
                    <label>{section.label}</label>
                    {form[section.key].map((value, i) => (
                        <div key={i} className={styles.repeaterRow}>
                            <input
                                type="text"
                                placeholder={section.placeholder}
                                value={value}
                                onChange={(e) => updateItem(section.key, i, e.target.value)}
                            />
                            {form[section.key].length > 1 && (
                                <button type="button" className={styles.removeBtn} onClick={() => removeItem(section.key, i)}>
                                    ×
                                </button>
                            )}
                        </div>
                    ))}
                    <button type="button" className={styles.addBtn} onClick={() => addItem(section.key)}>
                        {section.addLabel}
                    </button>
                </div>
            ))}

            <div className={styles.actions}>
                <button type="button" className={styles.secondaryBtn} onClick={onBack}>Back</button>
                <button type="button" className={styles.primaryBtn} onClick={onNext}>Continue →</button>
            </div>
        </div>
    );
}