"use client";
import { TravelProvider } from "./TravelProvider";
import IconDefinitions from "./IconDefinitions";
import Header from "./Header";
import Banner from "./Banner";
import WhatYouLike from "./WhatYouLike";
import MapInteraction from "./MapInteraction";
import Destinations from "./Destinations";
import MostLovedPlaces from "./MostLovedPlaces";
import EventsTrips from "./EventsTrips";
import TravelUtilities from "./TravelUtilities";
import BestTimeToGo from "./BestTimeToGo";
import Footer from "./Footer";

export default function TravelHome() { return <TravelProvider><div className="tp-page"><IconDefinitions /><Header /><Banner /><WhatYouLike /><MapInteraction /><Destinations /><MostLovedPlaces /><EventsTrips /><TravelUtilities /><BestTimeToGo /><Footer /></div></TravelProvider>; }
