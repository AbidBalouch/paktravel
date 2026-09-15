import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import MyContributionsList from "./MyContributionsList";
import styles from "./my-contributions.module.css";
import { getMyContributionsPageData, safe } from "@/lib/api";
import Newsletter from "@/components/Newsletter/Newsletter";

async function getLoginStatus() {
    const WP_BASE_URL = process.env.NEXT_PUBLIC_WP_API_URL || "http://localhost/travel-pak";
    const token = cookies().get(process.env.JWT_COOKIE_NAME || "travel_pak_token")?.value;
    if (!token) return { loggedIn: false };

    try {
        const res = await fetch(`${WP_BASE_URL}/wp-json/simple-jwt-login/v1/auth/validate`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        });
        const data = await res.json();
        if (!res.ok || !data.success) return { loggedIn: false };
        return { loggedIn: true, email: data.data?.user?.user_email };
    } catch {
        return { loggedIn: false };
    }
}

export default async function MyContributionsPage() {
    const { loggedIn } = await getLoginStatus();

    // Login-protected page — agar login nahi hai, /contribute pe bhej dein
    if (!loggedIn) {
        redirect("/contribute");
    }

    const heroData = await safe(getMyContributionsPageData, null);

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
                    {heroData?.heading || "My Contributions"}
                </h1>
                {heroData?.description && (
                    <p className={styles.heroSubtitle}>{heroData.description}</p>
                )}
            </section>
            <MyContributionsList />
            <Newsletter />
        </>
    );
}