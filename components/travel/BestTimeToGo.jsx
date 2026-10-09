"use client";
import { Fragment } from "react";
import { useTravel } from "./TravelProvider";
import { Button } from "./Button";

export default function BestTimeToGo() {
 const { menuOpen, favCount, favN, navItems, menuColumns, menuCta, menuAll, heroChips, mapRegions, mapPins, feat, stats, modes, placeholder, submitLabel, query, onQuery, onSubmit, showResults, results, aiAnswer, suggestChips, interests, regionTabs, divisionItems, districtItems, districtTitle, districtAttractions, districtFootnote, breadcrumb, popularTitle, popular, heroImg, nearImg, footerImg, districtImg, routes, utilities, seasons, footerColumns } = useTravel();
 return (<section className="tp-style-116">
<div className="tp-style-152">
<div className="tp-style-153">
<h2 className="tp-style-154">Best time to go</h2>
<span className="tp-style-48">Go in the right month. Roads stay open. Weather stays kind.</span>
</div>
<div className="tp-style-155">
{seasons.map((s, itemIndex) => <Fragment key={itemIndex}>
<div className="tp-style-156">
<div className="tp-style-157">{s.months}</div>
<div className="tp-style-158">{s.where}</div>
<div className="tp-style-159">{s.note}</div>
</div>
</Fragment>)}
</div>
</div>
</section>);
}
