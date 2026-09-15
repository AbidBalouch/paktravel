"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./my-contributions.module.css";

const STATUS_CONFIG = {
    publish: { label: "Published", color: "#00821c", bg: "#eef7ef" },
    pending: { label: "Under Review", color: "#b8860b", bg: "#fdf6e3" },
    rejected: { label: "Rejected", color: "#d92d20", bg: "#fdecea" },
};

export default function MyContributionsList() {
    const [contributions, setContributions] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch("/api/my-contributions")
            .then((res) => res.json())
            .then((data) => {
                if (!data.success) {
                    setError(data.message || "Failed to load your contributions.");
                    return;
                }
                setContributions(data.contributions);
            })
            .catch(() => setError("Network error — please try again."));
    }, []);

    if (error) return <p className={styles.error}>{error}</p>;
    if (contributions === null) return <p className={styles.loading}>Loading...</p>;

    return (
        <div className={styles.wrapper}>
            <div className={styles.titleRow}>
                <h2 className={styles.pageTitle}>List of Contributions</h2>
                <Link href="/contribute" className={styles.addBtn}>
                    + Add Contribution
                </Link>
            </div>

            {contributions.length === 0 ? (
                <p className={styles.empty}>You haven't submitted any places yet.</p>
            ) : (
                <div className={styles.list}>
                    {contributions.map((item) => {
                        const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
                        return (
                            <div key={item.id} className={styles.card}>
                                {item.image && (
                                    <img src={item.image} alt={item.title} className={styles.thumb} />
                                )}
                                <div className={styles.info}>
                                    <h3>{item.title}</h3>
                                    <span
                                        className={styles.statusBadge}
                                        style={{ color: status.color, background: status.bg }}
                                    >
                                        {status.label}
                                    </span>
                                    {item.status === "rejected" && item.rejectionReason && (
                                        <p className={styles.rejectionReason}>
                                            <strong>Reason:</strong> {item.rejectionReason}
                                        </p>
                                    )}
                                    {item.status === "publish" && (
                                        <a href={item.link} target="_blank" rel="noopener noreferrer" className={styles.viewLink}>
                                            View Live →
                                        </a>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}