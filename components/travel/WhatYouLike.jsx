"use client";
import { Fragment } from "react";
import { useTravel } from "./TravelProvider";
import { Button } from "./Button";

export default function WhatYouLike() {
 const { menuOpen, favCount, favN, navItems, menuColumns, menuCta, menuAll, heroChips, mapRegions, mapPins, feat, stats, modes, placeholder, submitLabel, query, onQuery, onSubmit, showResults, results, aiAnswer, suggestChips, interests, regionTabs, divisionItems, districtItems, districtTitle, districtAttractions, districtFootnote, breadcrumb, popularTitle, popular, heroImg, nearImg, footerImg, districtImg, routes, utilities, seasons, footerColumns } = useTravel();
 return (<section className="tp-style-52">
<div className="tp-style-53">
<div className="tp-style-54">
<h2 className="tp-style-55">What do you like?</h2>
<span className="tp-style-48">Pick one. The places below change.</span>
</div>
<div className="tp-style-56">
{interests.map((it, itemIndex) => <Fragment key={itemIndex}>
<Button className="tp-style-57" onClick={it.onClick} type="button" style={{"--tp-dynamic-0":"1.5px solid " + String(it.bd),"--tp-dynamic-1":it.fg}}>
<img className="tp-image" src={it.img} alt={it.label} />
<span className="tp-style-58" style={{"--tp-dynamic-0":it.scrim}}></span>
<span className="tp-style-59">
<span className="tp-style-60">{it.label}</span>
<span className="tp-style-61">{it.count} places</span>
</span>
</Button>
</Fragment>)}
</div>
</div>
</section>);
}
