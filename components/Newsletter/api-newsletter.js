/**
 * Add this helper to your existing lib/api.js file.
 *
 * Fetches the Newsletter section content (badge + heading) from the
 * home page ACF fields: newsletter_badge, newsletter_heading.
 */
export async function getNewsletterData() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_WP_URL}/wp-json/wp/v2/pages/6`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) return null;

  const page = await res.json();
  const acf = page?.acf || {};

  return {
    badge: acf.newsletter_badge || "",
    heading: acf.newsletter_heading || "",
  };
}
