// app/contact/page.jsx
// ---------------------------------------------------------------------------
// SERVER COMPONENT — data fetch (page content + CF7 form structure) yahin
// server pe hota hai. ContactForm (client component) ko fields prop se
// pass kar diya jata hai — form ka structure ab dynamic hai, CF7 se.
// ---------------------------------------------------------------------------

import Image from "next/image";
import { getContactPageData, getContactFormFields, getNewsletterData, safe } from "@/lib/api";
import ContactForm from "./ContactForm";
import Newsletter from "@/components/Newsletter/Newsletter";
import styles from "./contact.module.css";

// TODO: move to an ACF field once one exists for it — hardcoded for now
const CF7_FORM_ID = 347;

export default async function ContactPage() {
    const [data, formSchema, newsletter] = await Promise.all([
        safe(getContactPageData, null),
        safe(getContactFormFields.bind(null, CF7_FORM_ID), null),
        safe(getNewsletterData, null),
    ]);

    return (
        <>
            {/* Hero */}
            <section
                className={styles.hero}
                style={{
                    backgroundImage: data?.backgroundImage
                        ? `url(${data.backgroundImage})`
                        : undefined,
                }}
            >
                <div className={styles.heroOverlay} />
                {data?.badge && <span className={styles.heroBadge}>{data.badge}</span>}
                <h1 className={styles.heroTitle}>{data?.heading || "Let's Craft Your Journey"}</h1>
                {data?.description && (
                    <p className={styles.heroSubtitle}>{data.description}</p>
                )}
            </section>

            {/* Form + Side Image — newsletter section intentionally skipped for now */}
            <section className={styles.contentGrid}>
                <div className={styles.formCard}>
                    <ContactForm
                        formId={CF7_FORM_ID}
                        fields={formSchema?.fields || []}
                        submitLabel={formSchema?.submitLabel || "Send Message"}
                    />
                </div>

                {data?.sideImage && (
                    <div className={styles.sideImageWrap}>
                        <Image
                            src={data.sideImage}
                            alt={data.sideImageAlt}
                            fill
                            sizes="(max-width: 900px) 100vw, 45vw"
                            className={styles.sideImage}
                        />
                    </div>
                )}
            </section>

            <Newsletter
                badge={newsletter?.badge}
                heading={newsletter?.heading}
            />
        </>
    );
}