// lib/api.js
// ---------------------------------------------------------------------------
// WordPress (headless) endpoints data fetch
// ---------------------------------------------------------------------------

export const WP_BASE_URL = process.env.NEXT_PUBLIC_WP_API_URL || "https://paktravel.hammanitechdemos.com";
// Kitni dair (seconds) baad Next.js purana cached data chhor kar
// WordPress se dobara fetch kare (ISR revalidate).
const REVALIDATE_SECONDS = 60;

/** Chhota helper — fetch call ko wrap karta hai taake error handling repeat na ho. */
async function fetchJSON(url) {
  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      // Kuch hosting bot-filters sirf non-browser User-Agent (jaise Node's
      // default) ko block karte hain. Ek normal-looking UA bhejne se
      // aksar bypass ho jata hai.
      "User-Agent":
        "Mozilla/5.0 (compatible; NextJS-SSR/1.0; +https://nextjs.org)",
      Accept: "application/json",
    },
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  // WordPress kabhi kabhi (maintenance mode, suspended hosting, permalink
  // reset, security plugin block, PHP fatal error) HTML return karta hai
  // instead of JSON — even with a 200 status. Isko yahin catch kar lo taake
  // error clear ho, na ke cryptic "Unexpected token '<'" JSON.parse crash.
  if (!res.ok || !isJson) {
    const bodyPreview = (await res.text()).slice(0, 200).replace(/\s+/g, " ").trim();

    throw new Error(
      `WordPress did not return JSON for: ${url}\n` +
        `Status: ${res.status} ${res.statusText}\n` +
        `Content-Type: ${contentType || "(none)"}\n` +
        `Response preview: ${bodyPreview}\n\n` +
        `This usually means the WordPress site itself is broken/unreachable ` +
        `(suspended hosting, maintenance mode, reset permalinks, a security ` +
        `plugin blocking the REST API, or a PHP fatal error) — not a bug in ` +
        `this Next.js code. Open ${url} directly in a browser to see the raw response.`
    );
  }

  return res.json();
}

/**
 * Kisi bhi getXxxData() function ko wrap karke use karo agar chahte ho ke
 * WordPress fetch fail hone par poora page crash na ho, sirf wo section
 * fallback value use kare aur error console me log ho jaye.
 *
 * Example:
 *   const banner = await safe(getBannerData, null);
 *   const brands = await safe(getBrandsData, []);
 */
export async function safe(fn, fallback) {
  try {
    return await fn();
  } catch (err) {
    console.error(`[lib/api.js] ${fn.name} failed:`, err.message);
    return fallback;
  }
}

/**
 * WordPress Site Settings
 * Site Title, Tagline and Site Icon
 */
export async function getSiteSettings() {
  const data = await fetchJSON(`${WP_BASE_URL}/wp-json/`);

  return {
    title: data.name || "",
    tagline: data.description || "",
    favicon: data.site_icon_url || "",
    siteUrl: data.url || "",
    homeUrl: data.home || "",
  };
}
/**
 * Header ka data (logo, menu items, buttons)
 */
export async function getHeaderData() {
  return fetchJSON(`${WP_BASE_URL}/wp-json/travel-pakistan/v1/header`);
}

/**
 * Footer ka data (brand, download app, menus, socials)
 * Endpoint: /wp-json/travel-pakistan/v1/footer
 */
export async function getFooterData() {
  return fetchJSON(`${WP_BASE_URL}/wp-json/travel-pakistan/v1/footer`);
}

/**
 * Banner / Hero section ka data — "home" page ke ACF fields se.
 */
const HOME_PAGE_ID = 6;

export async function getBannerData() {
  const data = await fetchJSON(
    `${WP_BASE_URL}/wp-json/wp/v2/pages/${HOME_PAGE_ID}?acf_format=standard`
  );

  const acf = data.acf || {};
  const image = typeof acf.banner_image === "object" ? acf.banner_image : null;

  return {
    badge: acf.hero_badge ?? "",
    heading: acf.banner_heading ?? "",
    description: acf.banner_description ?? "",
    primaryButton: {
      text: acf.primary_button_?.primary_button_text ?? "",
      url: acf.primary_button_?.primary_button_link?.url ?? "#",
      target: acf.primary_button_?.primary_button_link?.target || "_self",
    },
    secondaryButton: {
      text: acf.secondary_button?.secondary_button_title ?? "",
      url: acf.secondary_button?.secondary_button_link?.url ?? "#",
      target: acf.secondary_button?.secondary_button_link?.target || "_self",
    },
    bannerImage: image?.url
      ? {
          url: image.url,
          alt: image.alt || "Travel Pakistan",
          width: image.width || 534,
          height: image.height || 562,
        }
      : null,
  };
}
/**
 * Brands Carousel 
 */
export async function getBrandsData() {
  const page = await fetchJSON(
    `${WP_BASE_URL}/wp-json/wp/v2/pages/${HOME_PAGE_ID}?acf_format=standard`
  );
  const acf = page.acf || {};
  const rawBrands = Array.isArray(acf.brands_carousel) ? acf.brands_carousel : [];

  if (rawBrands.length === 0) return [];

  // Case 1: pehle hi element se pata chal jata hai ke ye object hai ya plain ID
  const isObjectFormat = typeof rawBrands[0] === "object" && rawBrands[0] !== null;

  if (isObjectFormat) {
    return rawBrands.map((img) => ({
      id: img.id,
      url: img.url || img.sizes?.medium || "",
      alt: img.alt || img.title || "Brand logo",
      width: img.width || 140,
      height: img.height || 40,
    }));
  }

  const media = await fetchJSON(
    `${WP_BASE_URL}/wp-json/wp/v2/media?include=${rawBrands.join(",")}&orderby=include`
  );

  return media.map((item) => ({
    id: item.id,
    url: item.source_url,
    alt: item.alt_text || item.title?.rendered || "Brand logo",
    width: item.media_details?.width || 140,
    height: item.media_details?.height || 40,
  }));
}

/**
 * Destinations section
 */
export async function getDestinationsData() {
  const page = await fetchJSON(
    `${WP_BASE_URL}/wp-json/wp/v2/pages/${HOME_PAGE_ID}?acf_format=standard`
  );

  const acf = page.acf || {};
  const gridCount = Number(acf.number_of_destinations) || 6;

  // Get only main/parent destination taxonomy terms
  const destinations = await fetchJSON(
    `${WP_BASE_URL}/wp-json/wp/v2/destination?parent=0&per_page=${gridCount}&orderby=name&order=asc&acf_format=standard`
  );

  const mapped = destinations.map((destination) => {
    const image = destination.acf?.destination_image;

    return {
      id: destination.id,
      title: destination.name || "",
      excerpt: (destination.description || "")
        .replace(/<[^>]+>/g, "")
        .trim(),

      // ACF destination_image
      image: image?.url || null,
      alt: image?.alt || destination.name || "",

      link: destination.link,
      slug: destination.slug,
    };
  });

  return {
    badge: acf.destinations__badge ?? "",
    heading: acf.destinations_heading ?? "",
    items: mapped,
  };
}

/**
 * Travel Point section
 */
export async function getTravelPointData() {
  const page = await fetchJSON(
    `${WP_BASE_URL}/wp-json/wp/v2/pages/${HOME_PAGE_ID}?acf_format=standard`
  );
  const acf = page.acf || {};


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

export async function getAttractionsData() {
  const page = await fetchJSON(
    `${WP_BASE_URL}/wp-json/wp/v2/pages/${HOME_PAGE_ID}?acf_format=standard`
  );

  const acf = page.acf || {};
  const count = Number(acf.number_of_attractions) || 6;

  const posts = await fetchJSON(
    `${WP_BASE_URL}/wp-json/wp/v2/attraction?per_page=${count}&orderby=date&order=desc&_embed&acf_format=standard`
  );

  return {
    badge: acf.attractions_badge ?? "",
    heading: acf.attractions_heading ?? "",

    items: posts.map((post) => {
      const media = post._embedded?.["wp:featuredmedia"]?.[0];
      const postAcf = post.acf || {};

      return {
        id: post.id,
        title: post.title?.rendered ?? "",
        location: postAcf.locations ?? "",
        image: media?.source_url || null,
        alt: media?.alt_text || post.title?.rendered || "",
        link: post.link,
      };
    }),
  };
}
/**
 * Testimonials section
 */
export async function getTestimonialsData() {
  const page = await fetchJSON(
    `${WP_BASE_URL}/wp-json/wp/v2/pages/${HOME_PAGE_ID}?acf_format=standard`
  );
  const acf = page.acf || {};

  const posts = await fetchJSON(
    `${WP_BASE_URL}/wp-json/wp/v2/testimonial?per_page=10&orderby=date&order=asc&_embed`
  );

  return {
    badge: acf.testimonials_badge ?? "",
    heading: acf.testimonial_heading ?? "",
    items: posts.map((post) => {
      const media = post._embedded?.["wp:featuredmedia"]?.[0];
      const postAcf = post.acf || {};

      return {
        id: post.id,
        title: post.title?.rendered ?? "",   // author name
        // Name ke neeche wali line — ACF "designation"/"role", warna default
        role: postAcf.designation || postAcf.role || "Travel Enthusiast",
        content: (post.content?.rendered ?? "")
          .replace(/<[^>]+>/g, "")           // HTML tags remove
          .replace(/&nbsp;/g, " ")
          .replace(/&#8217;/g, "’")
          .trim(),
        image: media?.source_url || null,
        alt: media?.alt_text || post.title?.rendered || "",
      };
    }),
  };
}

/**
 * Plan Section ("Why plan here")
 */
export async function getPlanData() {
  const page = await fetchJSON(
    `${WP_BASE_URL}/wp-json/wp/v2/pages/${HOME_PAGE_ID}?acf_format=standard`
  );

  const acf = page.acf || {};
  const list = acf.plan_list || {};

  /** ACF value se ya to object nikal lo, ya sirf ID (number) return kar do */
  const pick = (val) => {
    if (!val) return null;
    // { type: "media_library", value: "183" } wala shape
    const v = typeof val === "object" && "value" in val ? val.value : val;
    if (typeof v === "object") return { url: v.url, alt: v.alt || "" }; // pura object
    return { id: Number(v) }; // sirf ID — niche media call se resolve hoga
  };

  // Main image + 3 icons
  const raw = {
    image: pick(acf.plan_image),
    transport: pick(list.transport_icon),
    guides: pick(list.guides_icon),
    events: pick(list.events_icon),
  };

  // Jin values sirf ID hain, un sab ko ek hi media request me resolve karo
  const ids = Object.values(raw)
    .filter((v) => v && v.id)
    .map((v) => v.id);

  let mediaMap = {};
  if (ids.length) {
    const media = await fetchJSON(
      `${WP_BASE_URL}/wp-json/wp/v2/media?include=${ids.join(",")}&per_page=${ids.length}`
    );
    mediaMap = Object.fromEntries(
      media.map((m) => [
        m.id,
        { url: m.source_url, alt: m.alt_text || m.title?.rendered || "" },
      ])
    );
  }

  const resolve = (v) => (!v ? null : v.url ? v : mediaMap[v.id] || null);

  return {
    badge: acf.plan_badge ?? "",
    heading: acf.plan_heading ?? "",
    description: acf.plan_description ?? "",
    image: resolve(raw.image),
    // List ka order design ke mutabiq: Transport -> Attractions -> Events
    items: [
      {
        key: "transport",
        icon: resolve(raw.transport),
        title: list.transport_heading ?? "",
        description: list.transport_description ?? "",
      },
      {
        key: "guides",
        icon: resolve(raw.guides),
        title: list.local_attraction_heading ?? "",
        description: list.attraction_description ?? "",
      },
      {
        key: "events",
        icon: resolve(raw.events),
        title: list.events_heading ?? "",
        description: list.events_description ?? "",
      },
    ].filter((item) => item.title), // khali items skip
  };
}
/**
 * Newsletter 
 */
export async function getNewsletterData() {
  const page = await fetchJSON(
    `${WP_BASE_URL}/wp-json/wp/v2/pages/${HOME_PAGE_ID}?acf_format=standard`
  );
  const acf = page.acf || {};

  return {
    badge: acf.newsletter_badge ?? "",
    heading: acf.newsletter_heading ?? "",
  };
}

/**
 * About Us page ka data — banner, our story, "handpicked for you" features,
 * aur "what we stand for" section.
 * Endpoint: /wp-json/wp/v2/pages/242 (slug: about-us)
 */
const ABOUT_PAGE_ID = 242;

export async function getAboutPageData() {
  const page = await fetchJSON(
    `${WP_BASE_URL}/wp-json/wp/v2/pages/${ABOUT_PAGE_ID}?acf_format=standard`
  );
  const acf = page.acf || {};

  // NOTE: "integrity" ACF group ke andar "real-time_relevance" aur
  // "unbiased_reporting" nested hain (jaisa ACF export mein aaya hai) —
  // hyphen ki wajah se bracket notation zaroori hai.
  const realTime = acf.integrity?.["real-time_relevance"] || {};
  const unbiased = acf.integrity?.unbiased_reporting || {};

  // Sab image/icon media IDs ek hi request mein resolve karne ke liye collect
  const mediaIds = [
    acf.about_banner_image,
    acf.stand_for_background_image,
    acf.story_image,
    acf.comprehensive_insights?.comprehensive_image,
    acf.local_expertise?.local_expertise__image,
    acf.detailed_logistics?.logistics_image,
    acf.cultural_depth?.cultural_depth_icon,
    acf.integrity?.integrity_icon,
    realTime["real-time_icon"],
    unbiased.unbiased_icon,
  ].filter((id) => id && typeof id !== "object");

  let mediaMap = {};
  if (mediaIds.length) {
    const media = await fetchJSON(
      `${WP_BASE_URL}/wp-json/wp/v2/media?include=${mediaIds.join(",")}&per_page=${mediaIds.length}`
    );
    mediaMap = Object.fromEntries(
      media.map((m) => [
        m.id,
        { url: m.source_url, alt: m.alt_text || m.title?.rendered || "" },
      ])
    );
  }

  const resolveImage = (value, fallbackAlt) => {
    if (!value) return null;
    if (typeof value === "object") {
      return { url: value.url, alt: value.alt || fallbackAlt };
    }
    const media = mediaMap[value];
    return media ? { ...media, alt: media.alt || fallbackAlt } : null;
  };

  return {
    // Page ka WP post-title hi hero heading hai (ACF "banner_heading" is page
    // par khali hai) — "Built by travelers," / "for travelers." split render
    // ke liye page.jsx pehle comma par split karta hai.
    heading: page.title?.rendered ?? "",

    banner: {
      badge: acf.banner_badge ?? "",
      description: acf.about_banner_description ?? "",
      // Hero section ka background photo (ACF field: "about_banner_image")
      backgroundImage: resolveImage(acf.about_banner_image, "Travel Pakistan"),
      primaryButton: {
        label: acf.banner_buttons?.primary_button_label ?? "",
        url: acf.banner_buttons?.primary_button_url ?? "#",
      },
      secondaryButton: {
        label: acf.banner_buttons?.secondary_button_label ?? "",
        url: acf.banner_buttons?.secondary_button_url ?? "#",
      },
    },

    story: {
      badge: acf.title_badge ?? "",
      heading: acf.story_heading_ ?? "",
      paragraphs: (acf.story_description ?? "")
        .split(/\r?\n/)
        .map((p) => p.trim())
        .filter(Boolean),
      image: resolveImage(acf.story_image, "Our story"),
    },

    features: [
      {
        title: acf.comprehensive_insights?.comprehensive_title ?? "",
        description: acf.comprehensive_insights?.comprehensive_description ?? "",
        icon: resolveImage(
          acf.comprehensive_insights?.comprehensive_image,
          "Comprehensive Insights"
        ),
      },
      {
        title: acf.local_expertise?.local_expertise_title ?? "",
        description: acf.local_expertise?.local_expertise__description ?? "",
        icon: resolveImage(
          acf.local_expertise?.local_expertise__image,
          "Local Expertise"
        ),
      },
      {
        title: acf.detailed_logistics?.logistics_title ?? "",
        description: acf.detailed_logistics?.logistics_description ?? "",
        icon: resolveImage(
          acf.detailed_logistics?.logistics_image,
          "Detailed Logistics"
        ),
      },
      {
        title: acf.cultural_depth?.cultural_depth_title ?? "",
        description: acf.cultural_depth?.cultural_depth_description ?? "",
        icon: resolveImage(acf.cultural_depth?.cultural_depth_icon, "Cultural Depth"),
      },
    ],

    standFor: {
      badge: acf.stand_for_badge ?? "",
      heading: acf.stand_for_title ?? "",
      // "What We Stand For" section ka background photo (ACF field: "stand_for_background_image")
      backgroundImage: resolveImage(
        acf.stand_for_background_image,
        "Pakistan flag over the mountains"
      ),
      items: [
        {
          title: acf.integrity?.integrity_title ?? "",
          description: acf.integrity?.integrity_description ?? "",
          icon: resolveImage(acf.integrity?.integrity_icon, "Data Integrity"),
        },
        {
          title: realTime["real-time_title"] ?? "",
          // NOTE: WP field key has a typo ("desccription") — kept as-is so it
          // actually reads the value from the API.
          description: realTime["real-time_desccription"] ?? "",
          icon: resolveImage(realTime["real-time_icon"], "Real-Time Relevance"),
        },
        {
          title: unbiased.unbiased_reporting_title ?? "",
          description: unbiased.unbiased_reporting_description ?? "",
          icon: resolveImage(unbiased.unbiased_icon, "Unbiased Reporting"),
        },
      ],
    },
  };
}
/**
 * Province/Destinations archive banner data
 * ACF Options Page: "Province Banner"
 * Endpoint: /wp-json/custom/v1/province-banner
 */
export async function getProvinceBannerData() {
  const data = await fetchJSON(`${WP_BASE_URL}/wp-json/custom/v1/province-banner`);

  // Raw ACF keys ko component-friendly shape mein map kar dete hain
  return {
    badge: data.province_banner_badge ?? "",
    heading: data.province_banner_heading ?? "",
    description: data.province_banner_description ?? "",
    backgroundImage: data.province_banner_image?.url
      ? {
          url: data.province_banner_image.url,
          alt: data.province_banner_image.alt || data.province_banner_heading || "",
          width: data.province_banner_image.width || 1440,
          height: data.province_banner_image.height || 600,
        }
      : null,
  };
}

/**
 * Single Province page
 * -------------------------------------------------------------------------
 * Destination taxonomy hierarchy: Province (parent) -> Division (child) ->
 * District. Is function ka kaam:
 *   1) Province term khud (banner: title, tagline, description, hero image)
 *   2) Uske seedhe children (Divisions) ka grid — har division ke sath us
 *      division ko assign "attraction" post type ka total count
 * Endpoint (province term):  /wp-json/wp/v2/destination?slug=<slug>
 * Endpoint (children):       /wp-json/wp/v2/destination?parent=<id>
 * Endpoint (count):          /wp-json/wp/v2/attraction?destination=<id>
 * -------------------------------------------------------------------------
 */
const DESTINATION_TAXONOMY = "destination"; // REST base — taxonomy register karte waqt jo rest_base diya hai
const ATTRACTION_POST_TYPE = "attraction";  // REST base — post type register karte waqt jo rest_base diya hai

function stripHtml(html) {
  return (html || "").replace(/<[^>]+>/g, "").trim();
}

/** Kisi bhi division/term ki "attraction" posts ka total count nikalta hai (X-WP-Total header se) */
async function getAttractionCount(termId) {
  const res = await fetch(
    `${WP_BASE_URL}/wp-json/wp/v2/${ATTRACTION_POST_TYPE}?${DESTINATION_TAXONOMY}=${termId}&per_page=1`,
    {
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; NextJS-SSR/1.0; +https://nextjs.org)",
        Accept: "application/json",
      },
    }
  );
  if (!res.ok) return 0;
  return Number(res.headers.get("X-WP-Total")) || 0;
}

export async function getProvinceArchiveData(slug) {
  const terms = await fetchJSON(
    `${WP_BASE_URL}/wp-json/wp/v2/${DESTINATION_TAXONOMY}?slug=${slug}&acf_format=standard`
  );

  const province = terms?.[0];
  if (!province) return null;

  const acf = province.acf || {};

  // Is province ke seedhe children (Divisions) laayein
  const children = await fetchJSON(
    `${WP_BASE_URL}/wp-json/wp/v2/${DESTINATION_TAXONOMY}?parent=${province.id}&per_page=100&orderby=name&order=asc&acf_format=standard`
  );

  // Har division ke liye attraction count parallel mein fetch karein
  const divisions = await Promise.all(
    children.map(async (child) => {
      const childAcf = child.acf || {};
      const count = await getAttractionCount(child.id);
      const childImage = childAcf.destination_image;

      return {
        id: child.id,
        title: child.name,
        slug: child.slug,
        excerpt: childAcf.short_description || stripHtml(child.description),
        image: childImage?.url || null,
        alt: childImage?.alt || child.name,
        attractionsCount: count,
        link: `/provinces/${province.slug}/${child.slug}`,
      };
    })
  );

  return {
    id: province.id,
    title: province.name,
    slug: province.slug,
    // Figma: badge province ka apna naam hai (e.g. "Punjab"), generic text nahi
    badge: province.name,
    tagline: acf.tagline || "",
    description: acf.short_description || stripHtml(province.description),
    heroImage: acf.destination_image?.url
      ? { url: acf.destination_image.url, alt: acf.destination_image.alt || province.name }
      : null,
    divisions,
  };
}

/** generateStaticParams ke liye — sab top-level provinces ke slugs */
export async function getAllProvinceSlugs() {
  const provinces = await fetchJSON(
    `${WP_BASE_URL}/wp-json/wp/v2/${DESTINATION_TAXONOMY}?parent=0&per_page=100`
  );
  return provinces.map((p) => p.slug);
}

/* ===========================================================================
   DISTRICT PAGE
   ---------------------------------------------------------------------------
   Single District: Banner + Image Collage + Tabs (About, Attractions, Stays,
   Tours, Events, Restaurants) — har tab ka data us post-type se aata hai jise
   is District term (destination taxonomy) se assign kiya gaya ho.

   Route:  app/provinces/[provinceSlug]/[divisionSlug]/[districtSlug]/page.js
   =========================================================================== */

// Post types jo District page ke tabs mein dikhne hain — REST base names.
// Agar WordPress mein rest_base alag rakha hai to yahan update karein.
const TAB_POST_TYPES = {
  attractions: "attraction",
  stays: "stay",
  tours: "tour",
  events: "event",
  restaurants: "restaurant",
};

// Har post type ki apni "type" taxonomy — card ka top-left badge isi taxonomy
// ke term se aata hai (e.g. Attraction pe "Monument"/"Fort"/"Mosque", Stay pe
// "Hotel"/"Guest House"). Ye slugs aapke WordPress setup se exact match
// karte hain — agar koi rename ho to yahan update karein.
//   attraction  -> attraction-type
//   event       -> event-type
//   restaurant  -> cuisine-type
//   stay        -> stay-type
//   tour        -> abhi confirm nahi hai, null rakha hai (fallback "Tour")
const TYPE_TAXONOMIES = {
  attraction: "attraction-type",
  stay: "stay-type",
  tour: null, // TODO: Tour ki taxonomy slug confirm karke yahan daal dein
  event: "event-type",
  restaurant: "cuisine-type",
};

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/**
 * Post ke "_embedded['wp:term']" (jo _embed=true se aata hai) ke andar se
 * di gayi taxonomy ka pehla term name nikalta hai. Agar taxonomy exist nahi
 * karti ya koi term assign nahi hai, null return karta hai (crash nahi).
 */
function extractTypeTermName(post, taxonomySlug) {
  const termGroups = post._embedded?.["wp:term"] || [];
  const flat = termGroups.flat();
  const match = flat.find((t) => t.taxonomy === taxonomySlug);
  return match?.name || null;
}

/**
 * Kisi bhi post type ki wo posts laata hai jo diye gaye District term
 * (destination taxonomy id) se assigned hain.
 */
async function getPostsByDestinationTerm(postType, termId) {
  const posts = await fetchJSON(
    `${WP_BASE_URL}/wp-json/wp/v2/${postType}?${DESTINATION_TAXONOMY}=${termId}&per_page=50&acf_format=standard&_embed`
  ).catch(() => []); // agar post type exist nahi karta ya empty hai, crash na ho

  const typeTaxonomy = TYPE_TAXONOMIES[postType];

  return (posts || []).map((post) => {
    const acf = post.acf || {};
    const gallery = Array.isArray(acf.gallery) ? acf.gallery : [];
    const featuredImage =
      post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null;

    // Card ka badge + "Category" filter dono isi value se chalte hain —
    // e.g. Attraction pe "Mosque", Stay pe "Hotel". Agar koi term assign
    // nahi hai to post-type ka generic naam fallback hota hai ("Attraction").
    const typeLabel = extractTypeTermName(post, typeTaxonomy) || capitalize(postType);

    return {
      id: post.id,
      title: stripHtml(post.title?.rendered) || post.title,
      excerpt: acf.description
        ? stripHtml(acf.description).slice(0, 140)
        : stripHtml(post.excerpt?.rendered).slice(0, 140),
      image: gallery[0]?.url || featuredImage,
      alt: gallery[0]?.alt || stripHtml(post.title?.rendered) || "",
      price: acf.price || null,
      rating: acf.rating ?? acf.average_rating ?? acf.star_rating ?? acf.stars ?? null,
      date: acf.date || null,
      time: acf.time || null,
      // ListingCard ki addressLine prop ke liye — Stay/Tour/Restaurant/
      // Facility mein "contact"/"address" ACF field se aata hai
      address: acf.address || acf.contact || null,
      // Card badge + "Category" filter — dynamic taxonomy term
      category: typeLabel,
      // "Activities" filter ke liye — WordPress mein "activities" ACF field
      // (checkbox/select multiple) add karein taake ye kaam kare
      activities: Array.isArray(acf.activities) ? acf.activities : [],
      recommended: Boolean(acf.recommended),
      link: post.link, // filhaal WordPress permalink; jab single post pages Next.js mein banenge to internal route se replace karein
    };
  });
}

/** Kisi term ko id se fetch karta hai — breadcrumb (Province/Division names) ke liye */
async function getTermById(id) {
  if (!id) return null;
  return fetchJSON(
    `${WP_BASE_URL}/wp-json/wp/v2/${DESTINATION_TAXONOMY}/${id}?acf_format=standard`
  ).catch(() => null);
}

/**
 * District page ka poora data ek call mein: banner, collage, breadcrumb,
 * aur sab 5 tabs (attractions/stays/tours/events/restaurants) ki lists.
 */
export async function getDistrictPageData(districtSlug) {
  const terms = await fetchJSON(
    `${WP_BASE_URL}/wp-json/wp/v2/${DESTINATION_TAXONOMY}?slug=${districtSlug}&acf_format=standard`
  );

  const district = terms?.[0];
  if (!district) return null;

  const acf = district.acf || {};

  // Breadcrumb ke liye parent chain: District -> Division -> Province
  const division = await getTermById(district.parent);
  const province = division ? await getTermById(division.parent) : null;

  // Collage image — ab ye ek SINGLE image field hai (multiple gallery photos
  // nahi), ACF field name: "collage_image"
  const collageImage = acf.collage_image?.url
    ? { url: acf.collage_image.url, alt: acf.collage_image.alt || district.name }
    : null;

  // Sab tabs ka data parallel mein fetch karein
  const [attractions, stays, tours, events, restaurants] = await Promise.all([
    getPostsByDestinationTerm(TAB_POST_TYPES.attractions, district.id),
    getPostsByDestinationTerm(TAB_POST_TYPES.stays, district.id),
    getPostsByDestinationTerm(TAB_POST_TYPES.tours, district.id),
    getPostsByDestinationTerm(TAB_POST_TYPES.events, district.id),
    getPostsByDestinationTerm(TAB_POST_TYPES.restaurants, district.id),
  ]);

  return {
    id: district.id,
    title: district.name,
    slug: district.slug,
    badge: district.name,
    tagline: acf.tagline || "",
    description: acf.short_description || stripHtml(district.description),
    aboutHtml: acf.full_description || "",
    heroImage: acf.destination_image?.url
      ? { url: acf.destination_image.url, alt: acf.destination_image.alt || district.name }
      : null,
    collageImage,
    breadcrumb: {
      province: province ? { name: province.name, slug: province.slug } : null,
      division: division ? { name: division.name, slug: division.slug } : null,
    },
    tabs: { attractions, stays, tours, events, restaurants },
  };
}

/**
 * generateStaticParams ke liye — poori hierarchy (province/division/district
 * slugs ka combination) build karta hai taake nested dynamic route SSG ho sake.
 */
export async function getAllDistrictParams() {
  const allTerms = await fetchJSON(
    `${WP_BASE_URL}/wp-json/wp/v2/${DESTINATION_TAXONOMY}?per_page=100`
  ).catch(() => []);

  const byId = Object.fromEntries(allTerms.map((t) => [t.id, t]));

  // Sirf wo terms jinka koi parent hai aur unka parent bhi ek parent rakhta
  // hai — matlab ye teesri level (District) hain.
  return allTerms
    .filter((t) => t.parent && byId[t.parent]?.parent)
    .map((district) => {
      const division = byId[district.parent];
      const province = byId[division.parent];
      return {
        provinceSlug: province.slug,
        divisionSlug: division.slug,
        districtSlug: district.slug,
      };
    });
}

/* ===========================================================================
   DIVISION PAGE
   ---------------------------------------------------------------------------
   Single Division: bilkul Province page jaisa design — banner (Division ki
   apni ACF fields) + uske children (Districts) ka grid, har District ka
   attraction count ke sath. Isi liye return shape EXACTLY getProvinceArchiveData
   jaisi hai (divisions: [...]) — taake ProvinceExplorer component seedha
   reuse ho sake, bina kisi naye component ke.

   Route: app/provinces/[provinceSlug]/[divisionSlug]/page.js
   =========================================================================== */

export async function getDivisionArchiveData(divisionSlug) {
  const terms = await fetchJSON(
    `${WP_BASE_URL}/wp-json/wp/v2/${DESTINATION_TAXONOMY}?slug=${divisionSlug}&acf_format=standard`
  );

  const division = terms?.[0];
  if (!division) return null;

  const acf = division.acf || {};

  // Parent Province — link banane aur breadcrumb ke liye
  const province = await getTermById(division.parent);

  // Is Division ke seedhe children (Districts) laayein
  const children = await fetchJSON(
    `${WP_BASE_URL}/wp-json/wp/v2/${DESTINATION_TAXONOMY}?parent=${division.id}&per_page=100&orderby=name&order=asc&acf_format=standard`
  );

  const districts = await Promise.all(
    children.map(async (child) => {
      const childAcf = child.acf || {};
      const childImage = childAcf.destination_image;
      const count = await getAttractionCount(child.id);

      return {
        id: child.id,
        title: child.name,
        slug: child.slug,
        excerpt: childAcf.short_description || stripHtml(child.description),
        image: childImage?.url || null,
        alt: childImage?.alt || child.name,
        attractionsCount: count,
        // Poora 3-level path — District detail page yahi route use karta hai
        link: `/provinces/${province?.slug || ""}/${division.slug}/${child.slug}`,
      };
    })
  );

  return {
    id: division.id,
    title: division.name,
    slug: division.slug,
    badge: division.name,
    tagline: acf.tagline || "",
    description: acf.short_description || stripHtml(division.description),
    heroImage: acf.destination_image?.url
      ? { url: acf.destination_image.url, alt: acf.destination_image.alt || division.name }
      : null,
    // "divisions" naam isliye rakha hai — ProvinceExplorer component isi
    // prop key ko expect karta hai; yahan actual data Districts ka hai
    divisions: districts,
    province: province ? { name: province.name, slug: province.slug } : null,
  };
}

/** generateStaticParams ke liye — sab {provinceSlug, divisionSlug} combinations */
export async function getAllDivisionParams() {
  const allTerms = await fetchJSON(
    `${WP_BASE_URL}/wp-json/wp/v2/${DESTINATION_TAXONOMY}?per_page=100`
  ).catch(() => []);

  const byId = Object.fromEntries(allTerms.map((t) => [t.id, t]));

  // Division = jiska parent hai, lekin us parent ka apna koi parent nahi
  // (matlab parent khud ek top-level Province hai)
  return allTerms
    .filter((t) => t.parent && byId[t.parent] && !byId[t.parent].parent)
    .map((division) => {
      const province = byId[division.parent];
      return { provinceSlug: province.slug, divisionSlug: division.slug };
    });
}