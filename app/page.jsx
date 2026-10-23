import TravelHome from "../components/travel/TravelHome";
import {
  getRankMathSeo,
  getBannerData,
  getDestinationTreeData,
  getHomeAttractionsData,
  getAttractionCategories,
  getReadyMadeTrips,
  safe,
} from "@/lib/api";

// SEO title/description WordPress ke Home page (ID 6) ke Rank Math fields se
// ate hain — WP me badlo, frontend meta khud update ho jayega.
export async function generateMetadata() {
  const seo = await getRankMathSeo("pages", 6);
  return {
    title: seo?.title || "Travel Pakistan — Discover, Explore, Experience",
    description:
      seo?.description ||
      "Explore Pakistan’s regions, districts, most loved places, trips and best travel seasons.",
    openGraph: { title: "Travel Pakistan", description: "Find your place in Pakistan.", type: "website" },
    twitter: { card: "summary_large_image" },
  };
}

// WordPress se har 60s fresh data (ISR) — WP me change karo, Vercel par khud ajayega
export const revalidate = 60;

export default async function HomePage() {
  const [banner, tree, homeAttractions, categoriesData, readyTripsData] = await Promise.all([
    safe(getBannerData, null),
    safe(getDestinationTreeData, null),
    safe(getHomeAttractionsData, null),
    safe(getAttractionCategories, null),
    safe(getReadyMadeTrips, null),
  ]);

  // Homepage ke dynamic hisse — TravelModel inhe istemal karta hai, jahan
  // WP data na mile wahan design ka fallback chalta rehta hai:
  //   banner          -> Home page ACF (badge, heading, description, image, section headings)
  //   explorerRegions -> destination taxonomy tree (Region > Division > District)
  //   regionInfo      -> map card (region description / image)
  //   placesByDistrict-> har district ke attractions (attraction post type)
  //   popular         -> Most Loved Places (attraction posts)
  const dynamic = {
    banner,
    explorerRegions: tree?.explorerRegions || [],
    regionInfo: tree?.regionInfo || {},
    placesByDistrict: homeAttractions?.placesByDistrict || {},
    popular: homeAttractions?.popular || [],
    timeToGo: banner?.timeToGo || [],
    categories: categoriesData?.categories || [],
    totalAttractions: categoriesData?.totalAttractions || 0,
    readyTrips: readyTripsData?.trips || [],
    tripsHeading: readyTripsData?.heading || "",
  };

  return <TravelHome dynamic={dynamic} />;
}
