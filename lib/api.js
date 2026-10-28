// lib/api.js
// ---------------------------------------------------------------------------
// WordPress (headless) endpoints data fetch
// ---------------------------------------------------------------------------

export const WP_BASE_URL =
  process.env.NEXT_PUBLIC_WP_API_URL || "https://paktravel.hammanitechdemos.com";
// Kitni dair (seconds) baad Next.js purana cached data chhor kar
// WordPress se dobara fetch kare (ISR revalidate).
const REVALIDATE_SECONDS = 60;

/** Chhota helper — fetch call ko wrap karta hai taake error handling repeat na ho. */
async function fetchJSON(url, { revalidate = REVALIDATE_SECONDS } = {}) {
  const res = await fetch(url, {
    next: { revalidate },
    // Koi bhi WordPress request 15s se zyada latke nahi — warna page/build
    // hang ho jata hai (yehi attraction pages slow hone ki bari wajah thi)
    signal: AbortSignal.timeout(15000),
    headers: {
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
    const bodyPreview = (await res.text())
      .slice(0, 200)
      .replace(/\s+/g, " ")
      .trim();

    throw new Error(
      `WordPress did not return JSON for: ${url}\n` +
        `Status: ${res.status} ${res.statusText}\n` +
        `Content-Type: ${contentType || "(none)"}\n` +
        `Response preview: ${bodyPreview}\n\n` +
        `This usually means the WordPress site itself is broken/unreachable ` +
        `(suspended hosting, maintenance mode, reset permalinks, a security ` +
        `plugin blocking the REST API, or a PHP fatal error) — not a bug in ` +
        `this Next.js code. Open ${url} directly in a browser to see the raw response.`,
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
 * Flat WP menu items (jin me "parent" field hota hai) ko nested tree me
 * convert karta hai — mega menu / dropdown isi tree se banta hai.
 * Har item: { id, label, url, target, parent, children: [...] }
 */
export function buildMenuTree(items) {
  const list = Array.isArray(items) ? items : [];
  const byId = new Map();
  for (const item of list) {
    byId.set(item.id, { ...item, children: [] });
  }
  const roots = [];
  for (const node of byId.values()) {
    const parent = node.parent ? byId.get(node.parent) : null;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }
  return roots;
}

/**
 * Footer ka data (brand, download app, menus, socials)
 * Endpoint: /wp-json/travel-pakistan/v1/footer
 */
export async function getFooterData() {
  return fetchJSON(`${WP_BASE_URL}/wp-json/travel-pakistan/v1/footer`);
}

/**
 * Rank Math SEO (title/description) kisi WP page/post ke meta se.
 * Rank Math fields: rank_math_title / rank_math_description (REST me exposed).
 */
export async function getRankMathSeo(type = "pages", id) {
  if (!id) return null;
  // Pehla rasta: site ka apna REST endpoint (Code Snippets wala) —
  // Rank Math ke asal saved values deta hai, front page ke liye
  // Rank Math ki Homepage settings se.
  try {
    const seo = await fetchJSON(
      `${WP_BASE_URL}/wp-json/travel-pakistan/v1/seo?id=${id}`,
    );
    const title = seo?.title ? stripTags(String(seo.title)).trim() : "";
    const description = seo?.description
      ? stripTags(String(seo.description)).trim()
      : "";
    if (title || description) return { title, description };
  } catch {
    /* endpoint na ho to head-parse fallback */
  }
  // Dusra rasta: WP page ke <head> se parse (purana tareeqa, backup)
  try {
    const post = await fetchJSON(`${WP_API}/${type}/${id}?_fields=link`);
    if (post?.link) return await getSeoFromWpHead(post.link);
  } catch {
    /* dono raste band — caller fallback title use karega */
  }
  return null;
}

// WordPress page ke asal <head> se Rank Math ka title + description.
// Rank Math ye fields REST meta me expose nahi karta, lekin WP frontend
// ke head me print karta hai — wahi se parhna sab se reliable hai.
async function getSeoFromWpHead(url) {
  try {
    const bust = url.includes("?") ? "&seo_fetch=2" : "?seo_fetch=2";
    const res = await fetch(url + bust, {
      headers: { "User-Agent": "TravelPakistan-NextJS/1.0" },
      signal: AbortSignal.timeout(25000),
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const head = html.slice(0, html.indexOf("</head>") + 7 || 20000);
    const title = head.match(/<title>([^<]*)<\/title>/i)?.[1] || "";
    const description =
      head.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1] ||
      head.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i)?.[1] ||
      "";
    const clean = (s) =>
      String(s || "")
        .replace(/&#0?39;|&#8217;|&rsquo;/g, "'")
        .replace(/&#038;|&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#8211;/g, "–")
        .replace(/&#8212;/g, "—")
        .trim();
    const out = { title: clean(title), description: clean(description) };
    return out.title || out.description ? out : null;
  } catch {
    return null;
  }
}

/**
 * Kisi post ka SEO data slug se: Rank Math title/description (meta),
 * warna post title + excerpt fallback ke liye.
 */
export async function getPostSeoBySlug(type, slug) {
  if (!slug) return null;
  try {
    const posts = await fetchJSON(
      `${WP_API}/${type}?slug=${encodeURIComponent(slug)}&_fields=title,excerpt`,
    );
    const post = Array.isArray(posts) ? posts[0] : null;
    if (!post) return null;
    const name = post.title?.rendered ? stripTags(post.title.rendered).trim() : "";
    const excerpt = post.excerpt?.rendered ? stripTags(post.excerpt.rendered).trim() : "";
    return { name, excerpt, title: "", description: "" };
  } catch {
    return null;
  }
}

/**
 * Banner / Hero section ka data — "home" page ke ACF fields se.
 * NOTE (21 Oct 2026 fix): WordPress me Home page ke asal field names ye hain
 * (SCF/ACF export se live verify kiye gaye):
 *   bannder_badge  (naam me typo "bannder" hi asal key hai)
 *   banner_heading (kabhi kabhi stray HTML jese "</span>" shamil hota hai — clean kiya jata hai)
 *   banner_description, banner_image (object)
 *   like_places_heading, map_badge, map_heading, map_description,
 *   attractions_badge, time_to_go (repeater, aksar khali)
 * Purana code "hero_badge" dhoond raha tha jo exist hi nahi karta — isi liye
 * banner kabhi dynamic nahi hua.
 */
const HOME_PAGE_ID = 6;

function stripTags(value) {
  // WP REST naam/text HTML-encoded bhejta hai (masalan "Forts &amp; Palaces",
  // ya "Islamabad&#8217;s") — entities decode karo warna frontend par
  // "&amp;" / "&#8217;" likha nazar ayega
  const decodeNumeric = (s) =>
    s
      .replace(/&#(\d+);/g, (_, n) => {
        const c = Number(n);
        return c > 0 && c < 0x110000 ? String.fromCodePoint(c) : _;
      })
      .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => {
        const c = parseInt(h, 16);
        return c > 0 && c < 0x110000 ? String.fromCodePoint(c) : _;
      });
  return decodeNumeric(
    String(value ?? "").replace(/<[^>]*>/g, ""),
  )
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+\n/g, "\n")
    .trim();
}

export async function getBannerData() {
  const data = await fetchJSON(
    `${WP_BASE_URL}/wp-json/wp/v2/pages/${HOME_PAGE_ID}?acf_format=standard`,
  );

  const acf = data.acf || {};
  const image = typeof acf.banner_image === "object" && acf.banner_image ? acf.banner_image : null;

  return {
    badge: acf.bannder_badge ?? acf.hero_badge ?? "",
    heading: stripTags(acf.banner_heading ?? ""),
    description: stripTags(acf.banner_description ?? ""),
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
          width: image.width || 1200,
          height: image.height || 896,
        }
      : null,
    // Homepage ke baqi sections ki headings bhi isi page ke ACF se aati hain
    likeHeading: stripTags(acf.like_places_heading ?? ""),
    likeDescription: stripTags(acf.like_places_description ?? ""),
    mapBadge: stripTags(acf.map_badge ?? ""),
    mapHeading: stripTags(acf.map_heading ?? ""),
    mapDescription: stripTags(acf.map_description ?? ""),
    attractionsBadge: stripTags(acf.attractions_badge ?? ""),
    attractionsTitle: stripTags(acf.attractions_title ?? ""),
    favoritePlacesHeading: stripTags(acf.favorite_places_heading ?? ""),
    timeToGoHeading: stripTags(acf.time_to_go_heading ?? ""),
    timeToGoDescription: stripTags(acf.time_to_go_description ?? ""),
    // "Best time to go" repeater — WP me filhaal khali (false) hai; jab
    // admin rows add karega to ye rows frontend par ajayengi, warna
    // frontend apna design fallback use karta hai.
    timeToGo: Array.isArray(acf.time_to_go)
      ? acf.time_to_go.map((row) => ({
          months: stripTags(row?.best_time_period ?? row?.months ?? row?.month ?? row?.season ?? row?.title ?? ""),
          where: stripTags(row?.destinitions ?? row?.destinations ?? row?.where ?? row?.places ?? row?.region ?? row?.destination ?? ""),
          note: stripTags(row?.description ?? row?.note ?? row?.notes ?? ""),
        })).filter((r) => r.months)
      : [],
  };
}

/**
 * Destinations taxonomy ka poora tree — Region (parent=0) -> Division ->
 * District. Taxonomy: "destination" (hierarchical), har term par ACF:
 * tagline, destination_image, about, collage_image.
 * Return shape homepage explorer, mega menu aur footer teeno use karte hain.
 */
export async function getDestinationTreeData() {
  // 1) Saare terms (light fields) — pagination ke sath
  const allTerms = [];
  let page = 1;
  while (true) {
    const batch = await fetchJSON(
      `${WP_BASE_URL}/wp-json/wp/v2/destination?per_page=100&page=${page}&_fields=id,name,slug,parent,description,count`,
    );
    if (!batch || batch.length === 0) break;
    allTerms.push(...batch);
    if (batch.length < 100) break;
    page += 1;
    if (page > 10) break; // safety
  }

  // 2) Sirf top-level (Region) terms ke ACF (tagline + image) — alag light call
  let regionAcf = {};
  try {
    const tops = await fetchJSON(
      `${WP_BASE_URL}/wp-json/wp/v2/destination?per_page=100&parent=0&acf_format=standard&_fields=id,acf.tagline,acf.destination_image`,
    );
    for (const t of tops || []) {
      const img = t.acf?.destination_image;
      regionAcf[t.id] = {
        tagline: t.acf?.tagline || "",
        image: img && typeof img === "object" ? { url: img.url || null, alt: img.alt || t.name || "" } : null,
      };
    }
  } catch {
    regionAcf = {};
  }

  const byId = Object.fromEntries(allTerms.map((t) => [t.id, t]));
  const childrenOf = (pid) => allTerms.filter((t) => t.parent === pid);

  const regions = childrenOf(0).map((region) => {
    const divisions = childrenOf(region.id).map((division) => {
      const districts = childrenOf(division.id).map((district) => ({
        id: district.id,
        name: stripTags(district.name),
        slug: district.slug,
        count: district.count || 0,
      }));
      return {
        id: division.id,
        name: stripTags(division.name),
        slug: division.slug,
        count: division.count || 0,
        districts,
      };
    });
    const districtCount = divisions.reduce((n, d) => n + d.districts.length, 0);
    return {
      id: region.id,
      name: stripTags(region.name),
      slug: region.slug,
      description: stripTags(region.description || ""),
      count: region.count || 0,
      tagline: regionAcf[region.id]?.tagline || "",
      image: regionAcf[region.id]?.image || null,
      divisions,
      meta: `${divisions.length} division${divisions.length === 1 ? "" : "s"} · ${districtCount} district${districtCount === 1 ? "" : "s"}`,
    };
  });

  // Homepage explorer (TravelModel) ki shape: { name, meta, divisions: { Division: [District, ...] } }
  const explorerRegions = regions.filter((r) => r.divisions.length > 0).map((r) => ({
    name: r.name,
    meta: r.meta + (r.description ? ` · ${r.description.split(".")[0]}` : ""),
    divisions: Object.fromEntries(r.divisions.map((d) => [d.name, d.districts.map((x) => x.name)])),
  }));

  // Map section ke liye region info (description / image / top districts)
  const regionInfo = Object.fromEntries(
    regions.map((r) => [
      r.name,
      {
        desc: r.description || r.tagline || "",
        img: r.image?.url || null,
        picks: r.divisions.flatMap((d) => d.districts.slice(0, 2).map((x) => x.name)).slice(0, 3).join(", "),
      },
    ]),
  );

  // Naam ke aliases: frontend map "Azad Jammu & Kashmir" naam use karta hai
  // jabke WordPress term ka naam "Azad Kashmir" hai — dono key par info rakho
  // taake map ki featured card ko WP image/description hamesha mile.
  if (regionInfo["Azad Kashmir"]) regionInfo["Azad Jammu & Kashmir"] = regionInfo["Azad Kashmir"];
  if (regionInfo["Islamabad"]) regionInfo["Islamabad Capital Territory"] = regionInfo["Islamabad"];

  return { regions, explorerRegions, regionInfo, termById: byId, allTerms };
}

/**
 * Har District ke Attractions — "destination" taxonomy ke deepest term se
 * group karke. Homepage explorer ka "Places in <District>" isi se banta hai.
 * Sath me Most Loved (popular) list bhi: title, type, district/region, image.
 */
/**
 * "What do you like?" section ke liye attraction categories:
 * WordPress ki attraction-type taxonomy se naam, slug, description aur
 * har category me kitni attractions hain (count). All places ke liye
 * kul attractions ki tadaad bhi sath.
 */
// ACF image field ki value object/array/string teenon shaklon me aa sakti hai
function acfImageUrl(image) {
  if (!image) return "";
  if (typeof image === "string") return image;
  if (Array.isArray(image)) return acfImageUrl(image[0]);
  return image.url || image.source_url || image.guid || "";
}

export async function getAttractionCategories() {
  const [terms, allAttractions] = await Promise.all([
    fetchJSON(`${WP_BASE_URL}/wp-json/wp/v2/attraction-type?per_page=100&acf_format=standard&_fields=id,name,slug,count,description,acf`),
    fetchJSON(`${WP_BASE_URL}/wp-json/wp/v2/attraction?per_page=100&_fields=id`),
  ]);
  const categories = (terms || [])
    .map((term) => ({
      name: stripTags(term.name || ""),
      slug: term.slug,
      count: term.count || 0,
      description: stripTags(term.description || ""),
      // Admin term edit screen par "Category Image" field (SCF) — WP se image
      img: acfImageUrl(term.acf?.category_image),
    }))
    .filter((c) => c.name && c.count > 0)
    .sort((a, b) => b.count - a.count);
  return { categories, totalAttractions: Array.isArray(allAttractions) ? allAttractions.length : 0 };
}

// Ready-made trips: Home page ki SCF repeater "ready_made_trips" se —
// har row: trip_image + trip_days + trip_title + trip_stops. Admin Home page
// edit karke trips badal sakta hai; repeater khaali ho to design ke static
// routes fallback ke tor par rehte hain.
export async function getReadyMadeTrips() {
  const home = await fetchJSON(`${WP_BASE_URL}/wp-json/wp/v2/pages/6?acf_format=standard&_fields=acf`);
  const rows = home?.acf?.ready_made_trips;
  const trips = Array.isArray(rows)
    ? rows
        .map((row) => ({
          name: stripTags(row.trip_title || ""),
          days: stripTags(row.trip_days || ""),
          stops: stripTags(row.trip_stops || ""),
          img: acfImageUrl(row.trip_image),
        }))
        .filter((r) => r.name)
    : [];
  return { heading: stripTags(home?.acf?.ready_trips_heading || ""), trips };
}

export async function getHomeAttractionsData() {
  // Attraction-type names (id -> name)
  let typeNames = {};
  try {
    const types = await fetchJSON(
      `${WP_BASE_URL}/wp-json/wp/v2/attraction-type?per_page=100&_fields=id,name`,
    );
    typeNames = Object.fromEntries((types || []).map((t) => [t.id, stripTags(t.name)]));
  } catch {
    typeNames = {};
  }

  const tree = await getDestinationTreeData().catch(() => null);
  const termById = tree?.termById || {};
  const depthOf = (term) => {
    let d = 0, cur = term;
    while (cur && cur.parent) { d += 1; cur = termById[cur.parent]; }
    return d;
  };
  const ancestorNames = (term) => {
    const names = [];
    let cur = term;
    while (cur) { names.unshift(stripTags(cur.name)); cur = cur.parent ? termById[cur.parent] : null; }
    return names; // [Region, Division?, District?]
  };

  const posts = [];
  let page = 1;
  while (true) {
    const batch = await fetchJSON(
      `${WP_BASE_URL}/wp-json/wp/v2/attraction?per_page=100&page=${page}&_embed&acf_format=standard`,
    );
    if (!batch || batch.length === 0) break;
    posts.push(...batch);
    if (batch.length < 100) break;
    page += 1;
    if (page > 5) break; // safety: max 500 attractions
  }

  const placesByDistrict = {};
  const popular = [];

  for (const post of posts) {
    const destIds = Array.isArray(post.destination) ? post.destination : [];
    const terms = destIds.map((id) => termById[id]).filter(Boolean);
    if (!terms.length) continue;
    terms.sort((a, b) => depthOf(b) - depthOf(a));
    const deepest = terms[0];
    const districtName = stripTags(deepest.name);
    const typeName = typeNames[post["attraction-type"]?.[0]] || "Place";
    const title = stripTags(post.title?.rendered || "");
    if (!title) continue;

    if (!placesByDistrict[districtName]) placesByDistrict[districtName] = [];
    placesByDistrict[districtName].push({ name: title, type: typeName });

    const media = post._embedded?.["wp:featuredmedia"]?.[0];
    const chain = ancestorNames(deepest);
    const postAcf = post.acf || {};
    // Card par description: WordPress excerpt, na ho to content ka pehla hissa,
    // dono khali hon to graceful fallback taake card ka footer khali na lage
    // (masalan Red Fort ka excerpt/content dono khali thay)
    const descText = stripTags(post.excerpt?.rendered || "") ||
      stripTags(post.content?.rendered || "").slice(0, 160) ||
      "Discover this place — photos, map and the best time to visit on the place page.";
    // "Best time" card par attraction ke apne ACF (best_season_to_visit
    // repeater) ki pehli row dikhayein — khali ho to card par kuch nahi ayega
    const seasonRows = Array.isArray(postAcf.best_season_to_visit) ? postAcf.best_season_to_visit : [];
    const season = seasonRows.map((r) => stripTags(r?.season_point ?? "")).filter(Boolean)[0] || "";
    popular.push({
      name: title,
      slug: post.slug,
      where: chain.length > 1 ? `${chain[chain.length - 1]} · ${chain[0]}` : chain[0] || "",
      tag: typeName,
      typeName,
      season,
      desc: descText,
      rating: postAcf.star_rating != null ? Number(postAcf.star_rating) || 0 : 0,
      reviews: postAcf.total_reviews != null ? Number(postAcf.total_reviews) || 0 : 0,
      img: media?.source_url || null,
      link: `/attractions/${post.slug}`,
    });
  }

  // Most Loved = sab se zyada rating, phir sab se zyada reviews wali
  // attractions pehle. Admin ko kuch extra nahi karna — attraction ke ACF
  // me star_rating / total_reviews maintain karna hi kaafi hai.
  popular.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);

  return { placesByDistrict, popular: popular.slice(0, 16) };
}
/**
 * Brands Carousel
 */
export async function getBrandsData() {
  const page = await fetchJSON(
    `${WP_BASE_URL}/wp-json/wp/v2/pages/${HOME_PAGE_ID}?acf_format=standard`,
  );
  const acf = page.acf || {};
  const rawBrands = Array.isArray(acf.brands_carousel)
    ? acf.brands_carousel
    : [];

  if (rawBrands.length === 0) return [];

  // Case 1: pehle hi element se pata chal jata hai ke ye object hai ya plain ID
  const isObjectFormat =
    typeof rawBrands[0] === "object" && rawBrands[0] !== null;

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
    `${WP_BASE_URL}/wp-json/wp/v2/media?include=${rawBrands.join(",")}&orderby=include`,
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
    `${WP_BASE_URL}/wp-json/wp/v2/pages/${HOME_PAGE_ID}?acf_format=standard`,
  );
  const acf = page.acf || {};
  const gridCount = Number(acf.number_of_destinations) || 6;

  // "destination" ek TAXONOMY hai (post type nahi) — sirf top-level
  // (Province) terms chahiye home page grid ke liye. Taxonomy REST
  // controller "orderby=date" accept nahi karta (terms ki date nahi hoti).
  const terms = await fetchJSON(
    `${WP_BASE_URL}/wp-json/wp/v2/destination?per_page=${gridCount + 1}&parent=0&orderby=name&order=asc&acf_format=standard`,
  );

  const mapped = terms.map((term) => {
    const termAcf = term.acf || {};
    // TODO: field names confirm hote hi update karna hai (Desinations Field Group)
    const image =
      typeof termAcf.destination_image === "object"
        ? termAcf.destination_image
        : null;
    return {
      id: term.id,
      title: term.name ?? "",
      excerpt: term.description ?? "",
      image: image?.url || null,
      alt: image?.alt || term.name || "",
      link: `/provinces/${term.slug}`,
    };
  });

  return {
    badge: acf.destinations__badge ?? "",
    heading: acf.destinations_heading ?? "",
    featured: mapped[0] || null,
    items: mapped.slice(1),
  };
}

/**
 * Travel Point section
 */
export async function getTravelPointData() {
  const page = await fetchJSON(
    `${WP_BASE_URL}/wp-json/wp/v2/pages/${HOME_PAGE_ID}?acf_format=standard`,
  );
  const acf = page.acf || {};

  const mediaIds = [acf.travel_icon, acf.travel_point_image].filter(
    (v) => v && typeof v !== "object",
  );
  let mediaMap = {};
  if (mediaIds.length) {
    const media = await fetchJSON(
      `${WP_BASE_URL}/wp-json/wp/v2/media?include=${mediaIds.join(",")}`,
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
        s.highest_peak != null
          ? `${Number(s.highest_peak).toLocaleString()}m`
          : "",
      label: s.peak_desc ?? "",
    },
    {
      display:
        s.number_of_happy_customer != null
          ? `${s.number_of_happy_customer}k+`
          : "",
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
    `${WP_BASE_URL}/wp-json/wp/v2/pages/${HOME_PAGE_ID}?acf_format=standard`,
  );

  const acf = page.acf || {};
  const count = Number(acf.number_of_attractions) || 6;

  const posts = await fetchJSON(
    `${WP_BASE_URL}/wp-json/wp/v2/attraction?per_page=${count}&orderby=date&order=desc&_embed&acf_format=standard`,
  );

  return {
    badge: acf.attractions_badge ?? "",
    heading: acf.attractions_heading ?? "",

    items: posts.map((post) => {
      const media = post._embedded?.["wp:featuredmedia"]?.[0];
      const postAcf = post.acf || {};

      return {
        id: post.id,
        slug: post.slug,
        title: post.title?.rendered ?? "",
        location: postAcf.locations ?? "",
        image: media?.source_url || null,
        alt: media?.alt_text || post.title?.rendered || "",
        link: `/attractions/${post.slug}`,
      };
    }),
  };
}
/**
 * Testimonials section
 */
export async function getTestimonialsData() {
  const page = await fetchJSON(
    `${WP_BASE_URL}/wp-json/wp/v2/pages/${HOME_PAGE_ID}?acf_format=standard`,
  );
  const acf = page.acf || {};

  const posts = await fetchJSON(
    `${WP_BASE_URL}/wp-json/wp/v2/testimonial?per_page=10&orderby=date&order=asc&_embed`,
  );

  return {
    badge: acf.testimonials_badge ?? "",
    heading: acf.testimonial_heading ?? "",
    items: posts.map((post) => {
      const media = post._embedded?.["wp:featuredmedia"]?.[0];
      const postAcf = post.acf || {};

      return {
        id: post.id,
        title: post.title?.rendered ?? "", // author name
        // Name ke neeche wali line — ACF "designation"/"role", warna default
        role: postAcf.designation || postAcf.role || "Travel Enthusiast",
        content: (post.content?.rendered ?? "")
          .replace(/<[^>]+>/g, "") // HTML tags remove
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
    `${WP_BASE_URL}/wp-json/wp/v2/pages/${HOME_PAGE_ID}?acf_format=standard`,
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
      `${WP_BASE_URL}/wp-json/wp/v2/media?include=${ids.join(",")}&per_page=${ids.length}`,
    );
    mediaMap = Object.fromEntries(
      media.map((m) => [
        m.id,
        { url: m.source_url, alt: m.alt_text || m.title?.rendered || "" },
      ]),
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
    `${WP_BASE_URL}/wp-json/wp/v2/pages/${HOME_PAGE_ID}?acf_format=standard`,
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
    `${WP_BASE_URL}/wp-json/wp/v2/pages/${ABOUT_PAGE_ID}?acf_format=standard`,
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
      `${WP_BASE_URL}/wp-json/wp/v2/media?include=${mediaIds.join(",")}&per_page=${mediaIds.length}`,
    );
    mediaMap = Object.fromEntries(
      media.map((m) => [
        m.id,
        { url: m.source_url, alt: m.alt_text || m.title?.rendered || "" },
      ]),
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
        description:
          acf.comprehensive_insights?.comprehensive_description ?? "",
        icon: resolveImage(
          acf.comprehensive_insights?.comprehensive_image,
          "Comprehensive Insights",
        ),
      },
      {
        title: acf.local_expertise?.local_expertise_title ?? "",
        description: acf.local_expertise?.local_expertise__description ?? "",
        icon: resolveImage(
          acf.local_expertise?.local_expertise__image,
          "Local Expertise",
        ),
      },
      {
        title: acf.detailed_logistics?.logistics_title ?? "",
        description: acf.detailed_logistics?.logistics_description ?? "",
        icon: resolveImage(
          acf.detailed_logistics?.logistics_image,
          "Detailed Logistics",
        ),
      },
      {
        title: acf.cultural_depth?.cultural_depth_title ?? "",
        description: acf.cultural_depth?.cultural_depth_description ?? "",
        icon: resolveImage(
          acf.cultural_depth?.cultural_depth_icon,
          "Cultural Depth",
        ),
      },
    ],

    standFor: {
      badge: acf.stand_for_badge ?? "",
      heading: acf.stand_for_title ?? "",
      // "What We Stand For" section ka background photo (ACF field: "stand_for_background_image")
      backgroundImage: resolveImage(
        acf.stand_for_background_image,
        "Pakistan flag over the mountains",
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
 * Contact page data — Banner tab ke fields reuse ho rahe hain (same shared
 * ACF field group jo Home page bhi use karta hai), plus "form_side_image"
 * jo sirf Contact page ke "Images" tab mein hai.
 */
export async function getContactPageData() {
  const pages = await fetchJSON(
    `${WP_BASE_URL}/wp-json/wp/v2/pages?slug=contact&_embed&acf_format=standard`,
  );

  if (!pages || pages.length === 0) return null;

  const page = pages[0];
  const acf = page.acf || {};

  const bannerImage =
    typeof acf.banner_image === "object" ? acf.banner_image : null;
  const sideImage =
    typeof acf.form_side_image === "object" ? acf.form_side_image : null;

  return {
    badge: acf.hero_badge ?? "",
    heading: acf.banner_heading || page.title?.rendered || "",
    description: acf.banner_description ?? "",
    backgroundImage: bannerImage?.url || null,
    sideImage: sideImage?.url || null,
    sideImageAlt: sideImage?.alt || "Travel Pakistan",
  };
}

/**
 * CF7 form ka field structure — custom endpoint se (functions.php mein
 * register kiya hua). CF7 core ka apna GET endpoint admin-only hai (mail
 * settings expose karta), isliye ye alag route use ho raha hai.
 */
export async function getContactFormFields(formId) {
  return fetchJSON(
    `${WP_BASE_URL}/wp-json/travel-pakistan/v1/contact-form/${formId}`,
  );
}

/**
 * Single Attraction data fetch by Slug (Detail Page ke liye)
 */

const NEARBY_POST_TYPE_MAP = {
  restaurant: "restaurant",
  stay: "stay",
};

/**
 * SCF Relationship field ko normalize karta hai ("Post Object" format
 * confirmed hai dono fields — nearby_essentials aur tour_itinerary — ke liye).
 */
function resolveRelationshipPosts(value) {
  if (!value) return [];
  const items = Array.isArray(value) ? value : [value];
  if (items.length === 0) return [];

  const isObjectFormat = typeof items[0] === "object" && items[0] !== null;

  if (isObjectFormat) {
    return items.map((p) => ({
      id: p.ID ?? p.id,
      title: p.post_title ?? p.title?.rendered ?? "",
      type: p.post_type ?? "",
    }));
  }

  return items.map((id) => ({ id, title: "", type: "" }));
}

/**
 * Har related post (Restaurant/Stay) ka poora data (image, rating, lat/lng)
 * parallel fetch karta hai, aur origin (Tour/Attraction) ki location se
 * Haversine distance calculate karta hai.
 */
async function enrichNearbyPosts(refs, originLat, originLng) {
  if (!refs.length) return [];

  // Parallel fetch (pehle sequential tha — slow WP par page generation
  // atak jata tha aur items khamoshi se gir jate thay). Har item ke liye
  // 1 retry, taake aik hichki se restaurant/stay gayab na ho.
  const enriched = [];
  await Promise.all(refs.map(async (ref) => {
    const restBase = NEARBY_POST_TYPE_MAP[ref.type];
    if (!restBase) return;

    try {
      const full = await fetchJSON(
        `${WP_BASE_URL}/wp-json/wp/v2/${restBase}/${ref.id}?_embed&acf_format=standard`,
      ).catch(() => fetchJSON(
        `${WP_BASE_URL}/wp-json/wp/v2/${restBase}/${ref.id}?_embed&acf_format=standard`,
      ));
      const acf = full.acf || {};
      const media = full._embedded?.["wp:featuredmedia"]?.[0];
      const lat = acf.latitude ? Number(acf.latitude) : null;
      const lng = acf.longitude ? Number(acf.longitude) : null;

      enriched.push({
        id: full.id,
        title: full.title?.rendered ?? ref.title,
        type: ref.type,
        link: full.link,
        image: media?.source_url || null,
        alt: media?.alt_text || full.title?.rendered || "",
        rating: acf.star_rating != null ? Number(acf.star_rating) : null,
        reviews: acf.total_reviews != null ? Number(acf.total_reviews) : null,
        lat,
        lng,
        address: await reverseGeocode(lat, lng),
        distanceKm: haversineDistanceKm(originLat, originLng, lat, lng),
      });
    } catch (err) {
      console.error(
        `[lib/api.js] enrichNearbyPosts failed for ${ref.type} #${ref.id}:`,
        err.message,
      );
    }
  }));
  return enriched;
}

/** Do lat/lng points ke beech distance (km mein) — Haversine formula. */
function haversineDistanceKm(lat1, lng1, lat2, lng2) {
  if (lat1 == null || lng1 == null || lat2 == null || lng2 == null) {
    return null;
  }
  const R = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c * 10) / 10;
}

const ATTRACTION_POST_TYPE = "attraction";

// Gallery: pehle ACF hero_gallery ki images, phir is post se ATTACHED
// media (wp-admin me post edit screen se upload ki gayi tasaveer khud
// attach ho jati hain) — duplicates hata kar, zyada se zyada 12.
async function buildGallery(post, heroGallery, featuredImage) {
  const base = heroGallery.map((img) => ({
    id: img.id,
    url: img.url || img.source_url,
    alt: img.alt || "",
  })).filter((g) => g.url);
  try {
    const media = await fetchJSON(
      `${WP_BASE_URL}/wp-json/wp/v2/media?parent=${post.id}&per_page=50&_fields=id,source_url,alt_text,mime_type`,
    );
    const seen = new Set(base.map((g) => g.url));
    for (const m of Array.isArray(media) ? media : []) {
      if (!String(m.mime_type || "").startsWith("image/")) continue;
      if (!m.source_url || seen.has(m.source_url) || m.source_url === featuredImage) continue;
      seen.add(m.source_url);
      base.push({ id: m.id, url: m.source_url, alt: m.alt_text || "" });
    }
  } catch { /* attached media na mile to sirf ACF gallery */ }
  return base.slice(0, 12);
}

export async function getAttractionBySlug(slug) {
  const posts = await fetchJSON(
    `${WP_BASE_URL}/wp-json/wp/v2/${ATTRACTION_POST_TYPE}?slug=${slug}&_embed&acf_format=standard`,
  );

  if (!posts || posts.length === 0) return null;

  const post = posts[0];
  const acf = post.acf || {};

  const heroGallery = Array.isArray(acf.hero_gallery) ? acf.hero_gallery : [];
  const featuredImage =
    post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
    heroGallery[0]?.url ||
    null;

  const rawExcerpt = post.excerpt?.rendered || "";
  const excerpt = rawExcerpt
    .replace(/<[^>]+>/g, "")
    .replace(/&#8217;/g, "'")
    .trim();

  // Description section — main post content (WP editor); content khaali
  // ho to excerpt fallback (kuch attractions ka content khaali hai)
  const description = ((post.content?.rendered ?? "").replace(/<[^>]+>/g, "").trim()
    ? (post.content?.rendered ?? "")
    : (post.excerpt?.rendered ?? ""))
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .replace(/&#8217;/g, "'")
    .trim();

  const mapRepeater = (rows, key) =>
    Array.isArray(rows) ? rows.map((r) => r[key] ?? "").filter(Boolean) : [];

  const howToReach = Array.isArray(acf.how_to_reach)
    ? acf.how_to_reach.map((r) => ({
        mode: r.transport_mode ?? "",
        detail: r.transport_detail ?? "",
      }))
    : [];

  const lat = acf.latitude ? Number(acf.latitude) : null;
  const lng = acf.longitude ? Number(acf.longitude) : null;

  // Terms: attraction-type (category) + destination chain (breadcrumb ke liye)
  const termGroups = post._embedded?.["wp:term"] || [];
  const flatTerms = termGroups.flat().filter(Boolean);
  const typeTerm = flatTerms.find((x) => x.taxonomy === "attraction-type");
  const typeName = typeTerm ? stripTags(typeTerm.name) : "";
  const destTerms = flatTerms.filter((x) => x.taxonomy === "destination");
  let destinationPath = [];
  if (destTerms.length) {
    const allDest = await fetchJSON(
      `${WP_BASE_URL}/wp-json/wp/v2/destination?per_page=100&_fields=id,name,slug,parent`,
    ).catch(() => null);
    const byId = new Map((allDest || []).map((x) => [x.id, x]));
    // sab se gehri (leaf) term se parent chain banao
    let leaf = destTerms[0];
    for (const dt of destTerms) {
      let d = 0, c = dt;
      while (c && c.parent) { d++; c = byId.get(c.parent); }
      let dl = 0, cl = leaf;
      while (cl && cl.parent) { dl++; cl = byId.get(cl.parent); }
      if (d > dl) leaf = dt;
    }
    const chain = [];
    let cur = byId.get(leaf.id) || leaf;
    while (cur) { chain.unshift({ name: stripTags(cur.name), slug: cur.slug }); cur = cur.parent ? byId.get(cur.parent) : null; }
    destinationPath = chain;
  }

  // Also near: pehle usi district/division ki attractions, phir same type.
  // Distance lat/lng se (haversine) — dono ke coords hon tab hi.
  let related = [];
  try {
    const relPosts = await fetchJSON(
      `${WP_BASE_URL}/wp-json/wp/v2/${ATTRACTION_POST_TYPE}?per_page=12&exclude=${post.id}&_embed`,
    );
    const mine = destTerms.map((x) => x.id);
    related = (relPosts || [])
      .map((rp) => {
        const rTerms = (rp._embedded?.["wp:term"] || []).flat().filter(Boolean);
        const sameDest = rTerms.some((x) => x.taxonomy === "destination" && mine.includes(x.id));
        const sameType = typeTerm ? rTerms.some((x) => x.taxonomy === "attraction-type" && x.id === typeTerm.id) : false;
        const rLat = rp.acf?.latitude ? Number(rp.acf.latitude) : null;
        const rLng = rp.acf?.longitude ? Number(rp.acf.longitude) : null;
        return {
          id: rp.id,
          slug: rp.slug,
          title: stripTags(rp.title?.rendered || ""),
          img: rp._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null,
          tag: stripTags((rTerms.find((x) => x.taxonomy === "attraction-type") || {}).name || ""),
          score: (sameDest ? 2 : 0) + (sameType ? 1 : 0),
          distanceKm: lat != null && rLat != null ? haversineDistanceKm(lat, lng, rLat, rLng) : null,
        };
      })
      .filter(
        (r) =>
          r.title &&
          (r.score >= 2 ||
            (r.distanceKm != null && r.distanceKm <= 150) ||
            (r.score >= 1 && r.distanceKm == null)),
      )
      .sort((a, b) => b.score - a.score || ((a.distanceKm ?? 999) - (b.distanceKm ?? 999)))
      .slice(0, 4);
  } catch { related = []; }

  const nearbyRefs = resolveRelationshipPosts(acf.nearby_essentials);
  const [nearbyEssentials, weather] = await Promise.all([
    getAllNearbyEssentials(nearbyRefs, lat, lng),
    getWeatherData(lat, lng).catch((err) => {
      console.error("[lib/api.js] getWeatherData failed:", err.message);
      return null;
    }),
  ]);

  return {
    id: post.id,
    slug: post.slug,
    title: post.title?.rendered ?? "",
    excerpt,
    description,
    badge: acf.hero_badge ?? "",
    featuredImage,
    gallery: await buildGallery(post, heroGallery, featuredImage),

    whatToDo: mapRepeater(acf.what_to_do, "point"),
    whatToBuy: mapRepeater(acf.what_to_buy, "item"),
    bestSeason: mapRepeater(acf.best_season_to_visit, "season_point"),
    policies: mapRepeater(acf.policies_and_info, "policy_point"),
    healthSafety: mapRepeater(acf.health_and_safety, "safety_point"),
    howToReach,
    // Text Area field — client se newline-separated tips expect kar rahe
    // hain (jaisa design mein checklist hai). Agar single paragraph likha
    // hai to ek hi bullet ban jayega.
    photographyTips: (acf.photography_tips ?? "")
      .split(/\r?\n/)
      .map((p) => p.trim())
      .filter(Boolean),

    stats: {
      rating: acf.star_rating != null ? Number(acf.star_rating) : null,
      reviews: acf.total_reviews != null ? Number(acf.total_reviews) : null,
      lat,
      lng,
    },

    // --- New design (Oct 2026) ke fields ---
    openTime: stripTags(acf.open_time || ""),
    closeTime: stripTags(acf.close_time || ""),
    entryFee: stripTags(acf.entry_fee || ""),
    visitDuration: stripTags(acf.visit_duration || ""),
    bestTimeShort: stripTags(acf.best_time_short || ""),
    highlights: Array.isArray(acf.highlights)
      ? acf.highlights.map((r) => ({ title: stripTags(r.hl_title || ""), text: stripTags(r.hl_text || "") })).filter((r) => r.title || r.text)
      : [],
    timeline: Array.isArray(acf.history_timeline)
      ? acf.history_timeline.map((r) => ({ year: stripTags(r.t_year || ""), who: stripTags(r.t_who || ""), what: stripTags(r.t_what || "") })).filter((r) => r.year || r.what)
      : [],
    topSpots: Array.isArray(acf.top_spots)
      ? acf.top_spots.map((r) => ({ name: stripTags(r.spot_name || ""), desc: stripTags(r.spot_desc || ""), time: stripTags(r.spot_time || "") })).filter((r) => r.name)
      : [],
    facilities: Array.isArray(acf.facilities_available) ? acf.facilities_available.map((f) => stripTags(String(f))).filter(Boolean) : [],
    typeName,
    destinationPath,
    related,

    nearbyEssentials,
    weather,
    submittedBy: acf.submitter_name
      ? {
          name: acf.submitter_name,
          facebook: acf.submitter_facebook || null,
          instagram: acf.submitter_instagram || null,
          youtube: acf.submitter_youtube || null,
          tiktok: acf.submitter_tiktok || null,
        }
      : null,
  };
}

const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";

/**
 * Open-Meteo se current weather + agle 3 din ka forecast. Koi API key
 * nahi chahiye — sirf lat/lng (jo Global Stats se already mil rahe hain).
 */
export async function getWeatherData(lat, lng) {
  if (lat == null || lng == null) return null;
  try {
    return await fetchWeatherData(lat, lng);
  } catch {
    // Weather sirf extra maloomat hai — API slow/fail ho to page nahi rukni
    return null;
  }
}

async function fetchWeatherData(lat, lng) {

  const url =
    `${OPEN_METEO_URL}?latitude=${lat}&longitude=${lng}` +
    `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,apparent_temperature` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
    `&timezone=auto&forecast_days=4`;

  const res = await fetch(url, { next: { revalidate: 1800 }, signal: AbortSignal.timeout(6000) }); // 30 minutes
  if (!res.ok) {
    throw new Error(`Open-Meteo request failed: ${res.status}`);
  }
  const data = await res.json();

  const current = data.current || {};
  const daily = data.daily || {};

  // Index 0 = aaj, is liye 1..3 le rahe hain "Next 3 days" ke liye
  const days = (daily.time || []).slice(1, 4).map((date, i) => ({
    date,
    label: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
    tempMax: daily.temperature_2m_max?.[i + 1] ?? null,
    tempMin: daily.temperature_2m_min?.[i + 1] ?? null,
    code: daily.weather_code?.[i + 1] ?? null,
  }));

  return {
    tempC: current.temperature_2m ?? null,
    feelsLikeC: current.apparent_temperature ?? null,
    humidity: current.relative_humidity_2m ?? null,
    windKmh: current.wind_speed_10m ?? null,
    code: current.weather_code ?? null,
    days,
  };
}

/** WMO weather code (Open-Meteo standard) -> short readable label */
export function weatherCodeLabel(code) {
  const map = {
    0: "Clear",
    1: "Mainly Clear",
    2: "Partly Cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Fog",
    51: "Drizzle",
    53: "Drizzle",
    55: "Drizzle",
    61: "Rain",
    63: "Rain",
    65: "Rain",
    71: "Snow",
    73: "Snow",
    75: "Snow",
    80: "Showers",
    81: "Showers",
    82: "Showers",
    95: "Storm",
  };
  return map[code] ?? "—";
}

/**
 * OpenStreetMap Overpass API se nearby fuel/ATM/hospital/pharmacy/police
 * ka live data fetch karta hai — koi API key nahi chahiye. WP mein koi CPT
 * na hone ki wajah se ye 5 categories real-world OSM data se aati hain.
 */

// Aik endpoint band/slow ho to doosra try hota hai — warna nearby band
// khaali cache ho jata tha.
const OVERPASS_URLS = [
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass-api.de/api/interpreter",
  "https://overpass.nchc.org.tw/api/interpreter",
];
const OSM_RADIUS_METERS = 3000;

const OSM_AMENITY_MAP = {
  fuel: "fuel",
  atm: "atm",
  hospital: "hospital",
  pharmacy: "pharmacy",
  police: "police",
};

/**
 * OpenStreetMap Overpass API se nearby fuel/ATM/hospital/pharmacy/police
 * ka live data fetch karta hai — koi API key nahi chahiye. WP mein koi CPT
 * na hone ki wajah se ye 5 categories real-world OSM data se aati hain.
 */
export async function getNearbyOSMPlaces(lat, lng) {
  if (lat == null || lng == null) return [];

  const amenityFilters = Object.values(OSM_AMENITY_MAP)
    .map(
      (tag) =>
        `node["amenity"="${tag}"](around:${OSM_RADIUS_METERS},${lat},${lng});`,
    )
    .join("\n");

  // Food + Stay bhi OSM se — WP post types sirf kuch attractions par lage
  // hain; Henry ki hidayat: nearby me restaurants/stays har jagah ayen.
  // In ke liye radius thora bara (5km) rakha hai.
  const FOOD_TAGS = ["restaurant", "cafe", "fast_food"];
  const STAY_TAGS = ["hotel", "guest_house", "hostel", "apartment"];
  const foodFilters = FOOD_TAGS
    .map((tag) => `node["amenity"="${tag}"](around:5000,${lat},${lng});`)
    .join("\n");
  const stayFilters = STAY_TAGS
    .map((tag) => `node["tourism"="${tag}"](around:5000,${lat},${lng});`)
    .join("\n");

  const query = `[out:json][timeout:25];(${amenityFilters}\n${foodFilters}\n${stayFilters});out body;`;

  // Har endpoint ko 9s ka mauqa — pehla jo jawab de, usi ka data.
  let data = null;
  let lastError = null;
  for (const url of OVERPASS_URLS) {
    try {
      const res = await fetch(url, {
        method: "POST",
        body: `data=${encodeURIComponent(query)}`,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent":
            "TravelPakistan-NextJS/1.0 (contact: your-email@example.com)",
        },
        signal: AbortSignal.timeout(9000),
        next: { revalidate: 86400 }, // 24 hours — fuel stations/ATMs/hospitals rarely change
      });
      if (!res.ok) throw new Error(`Overpass ${res.status} @ ${url}`);
      data = await res.json();
      break;
    } catch (err) {
      lastError = err;
    }
  }
  if (!data) throw lastError || new Error("Overpass: tamam endpoints fail");
  const elements = Array.isArray(data.elements) ? data.elements : [];

  return elements
    .map((el) => {
      const tags = el.tags || {};
      // Type resolve: food -> restaurant, lodging -> stay, warna amenity
      let type = null;
      if (["restaurant", "cafe", "fast_food"].includes(tags.amenity)) type = "restaurant";
      else if (["hotel", "guest_house", "hostel", "apartment"].includes(tags.tourism)) type = "stay";
      else if (Object.values(OSM_AMENITY_MAP).includes(tags.amenity)) type = tags.amenity;
      if (!type) return null;
      if (!tags.name) return null;

      const street = tags["addr:street"];
      const city = tags["addr:city"];
      const address = [street, city].filter(Boolean).join(", ");

      return {
        id: `osm-${el.id}`,
        title: tags.name || "Unnamed",
        type, // "restaurant" | "stay" | "fuel" | "atm" | "hospital" | "pharmacy" | "police"
        image: null,
        rating: null,
        address: address || null,
        lat: el.lat,
        lng: el.lon,
        distanceKm: haversineDistanceKm(lat, lng, el.lat, el.lon),
        link: `https://www.google.com/maps/dir/?api=1&destination=${el.lat},${el.lon}`,
      };
    })
    .filter(Boolean)
    .sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
}

/**
 * WP-based (Restaurant/Stay) aur OSM-based (Fuel/ATM/Hospital/Pharmacy/
 * Police) dono ko ek combined list mein merge karta hai.
 */
async function getAllNearbyEssentials(nearbyRefs, lat, lng) {
  const [wpItems, osmItems] = await Promise.all([
    enrichNearbyPosts(nearbyRefs, lat, lng),
    getNearbyOSMPlaces(lat, lng).catch((err) => {
      console.error(
        "[lib/api.js] getNearbyOSMPlaces failed:",
        err.message,
        err.cause,
      );
      return [];
    }),
  ]);

  // Dedupe: aik hi naam WP aur OSM dono me ho to WP wala rakho.
  // Har type ke max 10 items (band saaf rehta hai), WP pehle, phir
  // OSM faslay ke hisaab se.
  const seen = new Set();
  const byType = new Map();
  for (const item of [...wpItems, ...osmItems]) {
    const key = (item.title || item.name || "").trim().toLowerCase();
    if (key && seen.has(key)) continue;
    if (key) seen.add(key);
    if (!byType.has(item.type)) byType.set(item.type, []);
    byType.get(item.type).push(item);
  }
  const merged = [];
  for (const items of byType.values()) merged.push(...items.slice(0, 10));
  return merged;
}

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";

/**
 * Lat/lng se readable address nikalta hai (Nominatim — free, no API key).
 * Restaurant/Stay CPT mein koi address field nahi hai, is liye ye unki
 * lat/lng se address derive karta hai. 7-day cache kyunki address
 * shayad hi kabhi change ho.
 */
async function reverseGeocode(lat, lng) {
  if (lat == null || lng == null) return null;

  try {
    const res = await fetch(
      `${NOMINATIM_URL}?lat=${lat}&lon=${lng}&format=json&zoom=18`,
      {
        headers: { "User-Agent": "TravelPakistan-NextJS/1.0" },
        next: { revalidate: 604800 }, // 7 days
      },
    );
    if (!res.ok) return null;

    const data = await res.json();
    const addr = data.address || {};
    const parts = [
      addr.road,
      addr.suburb || addr.city_district || addr.neighbourhood,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(", ") : null;
  } catch (err) {
    console.error("[lib/api.js] reverseGeocode failed:", err.message);
    return null;
  }
}

/**
+ * Contribute page ka Hero data — Banner tab ke shared fields se
+ * (Contact page jaisa hi pattern).
+ */
export async function getContributePageData() {
  const pages = await fetchJSON(
    `${WP_BASE_URL}/wp-json/wp/v2/pages?slug=contribute&_embed&acf_format=standard`,
  );

  if (!pages || pages.length === 0) return null;

  const page = pages[0];
  const acf = page.acf || {};
  const bannerImage =
    typeof acf.banner_image === "object" ? acf.banner_image : null;

  return {
    badge: acf.hero_badge ?? "",
    heading: acf.banner_heading || page.title?.rendered || "",
    description: acf.banner_description ?? "",
    backgroundImage: bannerImage?.url || null,
  };
}

/**
 * Destinations taxonomy ka poora flat list — Province + Division + District
 * sab levels ek saath. `parent` field se hierarchy client-side tree mein
 * convert hoti hai (LocationTreeSelect component mein).
 */
export async function getDestinationTerms() {
  const allTerms = [];
  let page = 1;
  // WP REST API max 100 per request deta hai — poori taxonomy (300+ terms
  // ho sakti hain) laane ke liye pages loop karte hain jab tak khali
  // response na aaye.
  while (true) {
    const batch = await fetchJSON(
      `${WP_BASE_URL}/wp-json/wp/v2/destination?per_page=100&page=${page}&_fields=id,name,parent`,
    );
    if (!batch || batch.length === 0) break;

    allTerms.push(...batch);
    if (batch.length < 100) break; // last page tha
    page += 1;
  }

  return allTerms;
}

/**
 * Attraction Types taxonomy — Category dropdown ke liye (Contribute form).
 */
export async function getAttractionTypes() {
  return fetchJSON(
    `${WP_BASE_URL}/wp-json/wp/v2/attraction-type?per_page=100&_fields=id,name`,
  );
}

/**
 * "Recently added by the community" grid ke liye — sirf wo published
 * Attractions jinke paas submitter_name meta hai (matlab Contribute form
 * se aayi thin, admin-seeded nahi). Latest 4, taxonomy terms embedded.
 */
export async function getRecentCommunityContributions(limit = 4) {
  const posts = await fetchJSON(
    `${WP_BASE_URL}/wp-json/wp/v2/attraction?per_page=10&orderby=date&order=desc&_embed&acf_format=standard`,
  );

  const withSubmitter = posts.filter((p) => p.acf?.submitter_name);

  return withSubmitter.slice(0, limit).map((post) => {
    const media = post._embedded?.["wp:featuredmedia"]?.[0];
    // wp:term embed array ka order post-type ki registered taxonomies
    // (attraction-type, destination) ke hisaab se hota hai — pehla index
    // attraction-type hota hai.
    const categoryTerm = post._embedded?.["wp:term"]?.[0]?.[0];

    const rawExcerpt = post.excerpt?.rendered || "";
    const excerpt = rawExcerpt
      .replace(/<[^>]+>/g, "")
      .replace(/&#8217;/g, "'")
      .trim();

    return {
      id: post.id,
      title: post.title?.rendered ?? "",
      excerpt,
      category: categoryTerm?.name || "",
      image: media?.source_url || null,
      alt: media?.alt_text || post.title?.rendered || "",
      link: `/attractions/${post.slug}`,
      addedBy: post.acf?.submitter_name || "",
    };
  });
}

export async function checkEmailExists(email) {
  const data = await fetchJSON(
    `${WP_BASE_URL}/wp-json/travel-pakistan/v1/check-email?email=${encodeURIComponent(email)}`,
    { revalidate: 0 }, // hamesha fresh check, kabhi cache nahi
  );
  return !!data.exists;
}

// ---------------------------------------------------------------------------
// Province / District / Division pages (from live site — kept as-is)
// ---------------------------------------------------------------------------

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
// NOTE: ATTRACTION_POST_TYPE already declared above (used by getAttractionBySlug) — reused here.

export function stripHtml(html) {
  return (html || "").replace(/<[^>]+>/g, "").trim();
}

/** Kisi bhi division/term ki "attraction" posts ka total count nikalta hai (X-WP-Total header se) */
async function getAttractionCount(termId) {
  const res = await fetch(
    `${WP_BASE_URL}/wp-json/wp/v2/${ATTRACTION_POST_TYPE}?${DESTINATION_TAXONOMY}=${termId}&per_page=1`,
    {
      // "no-store" build ko dynamic force kar raha tha (static export ke
      // sath conflict) — baaki file ki tarah ISR revalidate use karo.
      next: { revalidate: REVALIDATE_SECONDS },
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

/** generateStaticParams ke liye — sab attractions ke slugs (taake unke
 *  pages build time par hi ban jayen aur click par foran khulen) */
export async function getAllAttractionSlugs() {
  const slugs = [];
  let page = 1;
  while (true) {
    const batch = await fetchJSON(
      `${WP_BASE_URL}/wp-json/wp/v2/${ATTRACTION_POST_TYPE}?per_page=100&page=${page}&_fields=slug`
    );
    if (!batch || batch.length === 0) break;
    slugs.push(...batch.map((x) => x.slug).filter(Boolean));
    if (batch.length < 100) break;
    page += 1;
    if (page > 10) break; // safety
  }
  return slugs;
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
        slug: post.slug,
        link:
        postType === "attraction"
        ? `/attractions/${post.slug}`
        : post.link,// filhaal WordPress permalink; jab single post pages Next.js mein banenge to internal route se replace karein
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
    aboutHtml: acf.about || acf.full_description || "",
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
    breadcrumb: {
      province: province ? { name: province.name, slug: province.slug } : null,
    },
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



export async function getMyContributions(email) {
  return fetchJSON(
    `${WP_BASE_URL}/wp-json/travel-pakistan/v1/my-contributions?email=${encodeURIComponent(email)}`,
    { revalidate: 0 }, // hamesha fresh — status change ho sakta hai kabhi bhi
  );
}

/**
 * My Contributions page ka Hero data — Banner tab ke shared fields se
 * (Contact/Contribute page jaisa hi pattern).
 */
export async function getMyContributionsPageData() {
  const pages = await fetchJSON(
    `${WP_BASE_URL}/wp-json/wp/v2/pages?slug=my-contributions&_embed&acf_format=standard`,
  );

  if (!pages || pages.length === 0) return null;

  const page = pages[0];
  const acf = page.acf || {};
  const bannerImage =
    typeof acf.banner_image === "object" ? acf.banner_image : null;

  return {
    badge: acf.hero_badge ?? "",
    heading: acf.banner_heading || page.title?.rendered || "",
    description: acf.banner_description ?? "",
    backgroundImage: bannerImage?.url || null,
  };
}

/**
 * Privacy Policy / Terms & Conditions jaisi simple pages ke liye reusable
 * function — Banner tab (shared ACF fields) + standard WP page content
 * (body text, Block/Classic editor se).
 */
export async function getSimplePageData(slug) {
  const pages = await fetchJSON(
    `${WP_BASE_URL}/wp-json/wp/v2/pages?slug=${slug}&_embed&acf_format=standard`,
  );

  if (!pages || pages.length === 0) return null;

  const page = pages[0];
  const acf = page.acf || {};
  const bannerImage =
    typeof acf.banner_image === "object" ? acf.banner_image : null;

  return {
    badge: acf.hero_badge ?? "",
    heading: acf.banner_heading || page.title?.rendered || "",
    description: acf.banner_description ?? "",
    backgroundImage: bannerImage?.url || null,
    content: page.content?.rendered ?? "",
  };
}
