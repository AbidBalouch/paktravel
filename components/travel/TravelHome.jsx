"use client";
import { TravelProvider } from "./TravelProvider";
import IconDefinitions from "./IconDefinitions";
import Banner from "./Banner";
import WhatYouLike from "./WhatYouLike";
import MapInteraction from "./MapInteraction";
import Destinations from "./Destinations";
import MostLovedPlaces from "./MostLovedPlaces";
import EventsTrips from "./EventsTrips";
import BestTimeToGo from "./BestTimeToGo";

// NOTE: Header/Footer yahan se hata diye gaye hain — wo ab GLOBAL hain
// (app/layout.jsx -> components/Header + components/Footer, WordPress se dynamic).
export default function TravelHome({ dynamic = null }) { return <TravelProvider dynamic={dynamic}><div className="tp-page"><IconDefinitions /><Banner /><WhatYouLike /><MapInteraction /><Destinations /><MostLovedPlaces /><EventsTrips /><BestTimeToGo /></div></TravelProvider>; }
