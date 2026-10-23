import { getSimplePageData, safe } from "@/lib/api";
import { getRankMathSeo } from "@/lib/api";
import styles from "@/app/contact/contact.module.css"; // Hero styles reuse

// SEO: WordPress page (ID 3) ke Rank Math fields se
export async function generateMetadata() {
  const seo = await getRankMathSeo("pages", 3);
  return {
    title: seo?.title || "Privacy Policy — Travel Pakistan",
    description: seo?.description || "How Travel Pakistan collects, uses and protects your information when you use our website and services.",
  };
}

export default async function PrivacyPolicyPage() {
    const data = await safe(() => getSimplePageData("privacy-policy"), null);

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
                <h1 className={styles.heroTitle}>{data?.heading || "Privacy Policy"}</h1>
                {data?.description && <p className={styles.heroSubtitle}>{data.description}</p>}
            </section>

            <div style={{ maxWidth: 800, margin: "60px auto", padding: "0 20px", lineHeight: 1.7 }}
                dangerouslySetInnerHTML={{ __html: data?.content || "" }}
            />
        </>
    );
}