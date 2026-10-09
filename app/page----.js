// app/page.js
import Banner from "@/components/Banner/Banner";
import BrandsCarousel from "@/components/BrandsCarousel/BrandsCarousel";
import Destinations from "@/components/Destinations/Destinations";
import TravelPoint from "@/components/TravelPoint/TravelPoint";
import Attractions from "@/components/Attractions/Attractions";
import Testimonials from "@/components/Testimonials/Testimonials";
import Newsletter from "@/components/Newsletter/Newsletter";
import Plan from "@/components/Plan/Plan"; 

export default function HomePage() {
  return (
    <>
      <Banner />
      <BrandsCarousel />
      <Destinations />
      <TravelPoint />
      <Attractions />
      <Testimonials />
      <Plan />
      <Newsletter />
      {/* Aage aap next sections yahan add karte jayen, jaise:
          <Attractions />, <TravelPoint />, waghera — jaise jaise
          image + JSON milta jaye, waise waise component banate jayenge. */}
    </>
  );
}
