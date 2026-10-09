"use client";
import { Fragment } from "react";
import { useTravel } from "./TravelProvider";
import { Button } from "./Button";

export default function EventsTrips() {
 const { menuOpen, favCount, favN, navItems, menuColumns, menuCta, menuAll, heroChips, mapRegions, mapPins, feat, stats, modes, placeholder, submitLabel, query, onQuery, onSubmit, showResults, results, aiAnswer, suggestChips, interests, regionTabs, divisionItems, districtItems, districtTitle, districtAttractions, districtFootnote, breadcrumb, popularTitle, popular, heroImg, nearImg, footerImg, districtImg, routes, utilities, seasons, footerColumns } = useTravel();
 return (<section className="tp-style-116">
<h2 className="tp-style-131">Ready-made trips</h2>
<div className="tp-style-132">
{routes.map((r, itemIndex) => <Fragment key={itemIndex}>
<div className="tp-style-133">
<img className="tp-image" src={r.img} alt={r.name} />
<div className="tp-style-134"></div>
<div className="tp-style-135">
<div className="tp-style-108">{r.days}</div>
<div className="tp-style-136">{r.name}</div>
<div className="tp-style-137">{r.stops}</div>
</div>
</div>
</Fragment>)}
</div>
</section>);
}
