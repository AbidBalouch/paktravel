import TravelHome from "../components/travel/TravelHome";

export const metadata = {
 title: "Travel Pakistan — Discover, Explore, Experience",
 description: "Explore Pakistan’s regions, districts, most loved places, trips and best travel seasons.",
 openGraph: { title: "Travel Pakistan", description: "Find your place in Pakistan.", type: "website" },
 twitter: { card: "summary_large_image" }
};

export default function HomePage() { return <TravelHome />; }
