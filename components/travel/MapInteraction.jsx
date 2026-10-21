"use client";
import { Fragment } from "react";
import { useTravel } from "./TravelProvider";
import { Button } from "./Button";

export default function MapInteraction() {
 const { homeHeadings, menuOpen, favCount, favN, navItems, menuColumns, menuCta, menuAll, heroChips, mapRegions, mapPins, feat, stats, modes, placeholder, submitLabel, query, onQuery, onSubmit, showResults, results, aiAnswer, suggestChips, interests, regionTabs, divisionItems, districtItems, districtTitle, districtAttractions, districtFootnote, breadcrumb, popularTitle, popular, heroImg, nearImg, footerImg, districtImg, routes, utilities, seasons, footerColumns } = useTravel();
 return (<section className="tp-style-62" id="regionmap">
<div className="tp-style-63">
<div>
<div className="tp-style-64">{homeHeadings?.mapBadge || "Explore by map"}</div>
<h2 className="tp-style-65">{homeHeadings?.mapHeading || "Pick a region on the map"}</h2>
</div>
<span className="tp-style-66">{homeHeadings?.mapDescription || "Tap a region or a city dot. The card on the right changes."}</span>
</div>
<div className="tp-style-67">
<div className="tp-style-68">
<div className="tp-style-69">
<svg className="tp-style-70" viewBox="0 0 940 640" role="img" aria-label="Map of Pakistan">
{mapRegions.map((r, itemIndex) => <Fragment key={itemIndex}>
<path className="tp-reg" d={r.d} fill={r.fill} stroke="#FFFFFF" strokeWidth="2.5" strokeLinejoin="round" onClick={r.onClick} />
</Fragment>)}
{mapRegions.map((r, itemIndex) => <Fragment key={itemIndex}>
<g className="tp-style-71">
<polyline points={r.line} fill="none" stroke="#7B8A81" strokeWidth="1" />
<circle cx={r.ax} cy={r.ay} r="3" fill="#0A2E1E" />
</g>
</Fragment>)}
{mapPins.map((p, itemIndex) => <Fragment key={itemIndex}>
<g className="tp-style-72" onClick={p.onClick}>
<circle cx={p.x} cy={p.y} r={p.ring} fill="#FFFFFF" fillOpacity="0.9" stroke="#0A2E1E" strokeWidth="1.5" />
<circle cx={p.x} cy={p.y} r="3" fill={p.dot} />
</g>
</Fragment>)}
</svg>
{mapRegions.map((r, itemIndex) => <Fragment key={itemIndex}>
<Button className="tp-style-73" onClick={r.onClick} type="button" style={{"--tp-dynamic-0":r.lpx,"--tp-dynamic-1":r.tpx,"--tp-dynamic-2":r.tf}}>{r.name}</Button>
</Fragment>)}
{mapPins.map((p, itemIndex) => <Fragment key={itemIndex}>
<Button className="tp-style-74" onClick={p.onClick} type="button" style={{"--tp-dynamic-0":p.lpx,"--tp-dynamic-1":p.tpx}}>{p.name}</Button>
</Fragment>)}
</div>
</div>
<div className="tp-style-75">
<div className="tp-style-76"><img className="tp-image" src={feat.img} alt={feat.name} /></div>
<div className="tp-style-77"></div>
<div className="tp-style-78">
<span className="tp-style-79">Featured Region</span>
<div className="tp-style-80">{feat.name}</div>
<p className="tp-style-81">{feat.desc}</p>
<div className="tp-style-82">{feat.meta}</div>
<div className="tp-style-83">Top places: {feat.picks}</div>
<Button className="tp-style-84" onClick={feat.onExplore} type="button">Explore Region →</Button>
</div>
</div>
</div>
</section>);
}
