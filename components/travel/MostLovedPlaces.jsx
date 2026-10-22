"use client";
import { Fragment } from "react";
import { useTravel } from "./TravelProvider";

export default function MostLovedPlaces() {
 const { homeHeadings, menuOpen, favCount, favN, navItems, menuColumns, menuCta, menuAll, heroChips, mapRegions, mapPins, feat, stats, modes, placeholder, submitLabel, query, onQuery, onSubmit, showResults, results, aiAnswer, suggestChips, interests, regionTabs, divisionItems, districtItems, districtTitle, districtAttractions, districtFootnote, breadcrumb, popularTitle, popular, heroImg, nearImg, footerImg, districtImg, routes, utilities, seasons, footerColumns } = useTravel();
 return (<section className="tp-style-116" id="popular">
<div className="tp-style-117">
<h2 className="tp-style-118">{homeHeadings?.popularHeading || popularTitle}</h2>
<a className="tp-style-119" href="/provinces">See all places →</a>
</div>
<div className="tp-style-120">
{popular.map((p, itemIndex) => <Fragment key={itemIndex}>
<a className="tp-style-121" href={p.link || "/provinces"} style={{textDecoration:"none",color:"inherit"}}>
<div className="tp-style-122">
<img className="tp-image" src={p.img} alt={p.name} />
<span className="tp-style-123" role="button" aria-label="Save place" onClick={(e) => { e.preventDefault(); e.stopPropagation(); p.onFav(); }} style={{"--tp-dynamic-0":p.favColor, cursor:"pointer"}}>♥</span>
<div className="tp-style-124">{p.tag}</div>
</div>
<div className="tp-style-125">
<div className="tp-style-126">{p.name}</div>
<div className="tp-style-127">{p.where}</div>
<div className="tp-style-128">
<span className="tp-style-129">Best time: {p.season}</span>
<span className="tp-style-130">Open →</span>
</div>
</div>
</a>
</Fragment>)}
</div>
</section>);
}
