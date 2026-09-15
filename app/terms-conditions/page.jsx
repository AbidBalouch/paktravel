import { getSimplePageData, safe } from "@/lib/api";
import styles from "@/app/contact/contact.module.css";

export default async function TermsPage() {
    const data = await safe(() => getSimplePageData("terms-conditions"), null);

    return (
        <>
            <section
                className={styles.hero}
                style={{
                    backgroundImage: data?.backgroundImage ? `url(${data.backgroundImage})` : undefined,
                }}
            >
                <div className={styles.heroOverlay} />
                {data?.badge && <span className={styles.heroBadge}>{data.badge}</span>}
                <h1 className={styles.heroTitle}>{data?.heading || "Terms & Conditions"}</h1>
                {data?.description && <p className={styles.heroSubtitle}>{data.description}</p>}
            </section>

            <div style={{ maxWidth: 800, margin: "60px auto", padding: "0 20px", lineHeight: 1.7 }}
                dangerouslySetInnerHTML={{ __html: data?.content || "" }}
            />
        </>
    );
}