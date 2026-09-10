import { cookies } from "next/headers";
import { getDestinationTerms, getAttractionTypes, getContributePageData, getRecentCommunityContributions, safe } from "@/lib/api";
import ContributeForm from "./ContributeForm";
import Image from "next/image";
import OverlayCard from "@/components/Cards/OverlayCard";
import Newsletter from "@/components/Newsletter/Newsletter";
import styles from "./contribute.module.css";


async function getLoginStatus() {
    const token = cookies().get(process.env.JWT_COOKIE_NAME || "travel_pak_token")?.value;
    if (!token) return { loggedIn: false, email: null };

    try {
        const WP_BASE_URL = process.env.NEXT_PUBLIC_WP_API_URL || "http://localhost/travel-pak";
        const res = await fetch(`${WP_BASE_URL}/wp-json/simple-jwt-login/v1/auth/validate`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        });
        const data = await res.json();
        if (!res.ok || !data.success) return { loggedIn: false, email: null };
        return {
            loggedIn: true,
            email: data.data?.user?.user_email || null,
            name: data.data?.user?.display_name || null,
            social: data.data?.user?.user_url || null,
        };
    } catch {
        return { loggedIn: false, email: null, name: null, social: null };
    }
}

export default async function ContributePage() {
    const [destinationTerms, attractionTypes, heroData, recentContributions, loginStatus] = await Promise.all([
        getDestinationTerms(),
        getAttractionTypes(),
        safe(getContributePageData, null),
        safe(getRecentCommunityContributions, []),
        getLoginStatus(),
    ]);

    return (
        <>
            <section
                className={styles.hero}
                style={{
                    backgroundImage: heroData?.backgroundImage
                        ? `url(${heroData.backgroundImage})`
                        : undefined,
                }}
            >
                <div className={styles.heroOverlay} />
                {heroData?.badge && (
                    <span className={styles.heroBadge}>{heroData.badge}</span>
                )}
                <h1 className={styles.heroTitle}>
                    {heroData?.heading || "Add Your Discovery To The Map."}
                </h1>
                {heroData?.description && (
                    <p className={styles.heroSubtitle}>{heroData.description}</p>
                )}
            </section>

            <section className={styles.howItWorks}>
                <div className={styles.howItWorksCard}>
                    <div className={styles.howItWorksNumber}>1</div>
                    <div>
                        <h3>Submit the form</h3>
                        <p>Fill in as much as you can — you can always come back and add more later.</p>
                    </div>
                </div>

                <div className={styles.howItWorksCard}>
                    <div className={styles.howItWorksNumber}>2</div>
                    <div>
                        <h3>We review it</h3>
                        <p>Our team checks the details and photos, usually within 3–5 days.</p>
                    </div>
                </div>

                <div className={styles.howItWorksCard}>
                    <div className={styles.howItWorksNumber}>3</div>
                    <div>
                        <h3>It goes live, credited to you</h3>
                        <p>Once approved, the full page is published with your name and social link attached.</p>
                    </div>
                </div>
            </section>

            <ContributeForm
                destinationTerms={destinationTerms}
                attractionTypes={attractionTypes}
                initialLoggedIn={loginStatus.loggedIn}
                initialEmail={loginStatus.email}
                initialName={loginStatus.name}
                initialSocial={loginStatus.social}
            />
            {recentContributions.length > 0 && (
                <section className={styles.recentSection}>
                    <h2 className={styles.recentTitle}>Recently added by the community.</h2>
                    <div className={styles.recentGrid}>
                        {recentContributions.map((item) => (
                            <OverlayCard
                                key={item.id}
                                href={item.link}
                                image={item.image}
                                alt={item.alt}
                                badge={item.category}
                                title={item.title}
                                excerpt={item.excerpt}
                                footerText={`👤 Added by ${item.addedBy}`}
                            />
                        ))}
                    </div>
                </section>
            )}

            <Newsletter />
        </>
    );
}