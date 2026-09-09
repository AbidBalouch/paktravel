/**
 * Travel Point section
 * Fields: travel_badge, travel_heading, travel_description, travel_icon,
 *         travel_point_image, travel_point_stats (repeater-jaisa object)
 */
export async function getTravelPointData() {
  const page = await fetchJSON(
    `${WP_BASE_URL}/wp-json/wp/v2/pages/${HOME_PAGE_ID}?acf_format=standard`
  );
  const acf = page.acf || {};

  // travel_icon / travel_point_image kabhi plain media ID (number) hote
  // hain, kabhi acf_format=standard already pura object de deta hai —
  // sirf un values ko media lookup me bhejte hain jo abhi tak object
  // NAHI bane (warna URL me "[object Object]" chala jata hai).
  const mediaIds = [acf.travel_icon, acf.travel_point_image].filter(
    (v) => v && typeof v !== "object"
  );
  let mediaMap = {};
  if (mediaIds.length) {
    const media = await fetchJSON(
      `${WP_BASE_URL}/wp-json/wp/v2/media?include=${mediaIds.join(",")}`
    );
    mediaMap = Object.fromEntries(media.map((m) => [m.id, m]));
  }

  const resolveImage = (value, fallbackAlt) => {
    if (!value) return null;
    // acf_format=standard kabhi kabhi pura object bhi de sakta hai
    if (typeof value === "object") {
      return {
        url: value.url,
        alt: value.alt || fallbackAlt,
        width: value.width || 0,
        height: value.height || 0,
      };
    }
    const media = mediaMap[value];
    return media
      ? {
          url: media.source_url,
          alt: media.alt_text || fallbackAlt,
          width: media.media_details?.width || 0,
          height: media.media_details?.height || 0,
        }
      : null;
  };

  const s = acf.travel_point_stats || {};

  // Design ke postfix (7 / 40+ / 8,611m / 12k+) field-wise hardcoded hain
  // kyunke WordPress raw numbers deta hai (7, 40, 8611, 12) — postfix
  // API me nahi aata.
  const stats = [
    {
      display: s.number_of_provinces != null ? `${s.number_of_provinces}` : "",
      label: s.provinces_ ?? "",
    },
    {
      display: s.number_of_cities != null ? `${s.number_of_cities}+` : "",
      label: s.cities ?? "",
    },
    {
      display:
        s.highest_peak != null ? `${Number(s.highest_peak).toLocaleString()}m` : "",
      label: s.peak_desc ?? "",
    },
    {
      display:
        s.number_of_happy_customer != null ? `${s.number_of_happy_customer}k+` : "",
      label: s.happy_customer ?? "",
    },
  ].filter((stat) => stat.display && stat.label);

  return {
    badge: acf.travel_badge ?? "",
    heading: acf.travel_heading ?? "",
    description: acf.travel_description ?? "",
    image: resolveImage(acf.travel_point_image, "Travel point"),
    icon: resolveImage(acf.travel_icon, "icon"),
    stats,
  };
}
