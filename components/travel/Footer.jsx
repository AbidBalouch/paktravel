"use client";
import { Fragment } from "react";
import { useTravel } from "./TravelProvider";
import { Button } from "./Button";

export default function Footer() {
 const { menuOpen, favCount, favN, navItems, menuColumns, menuCta, menuAll, heroChips, mapRegions, mapPins, feat, stats, modes, placeholder, submitLabel, query, onQuery, onSubmit, showResults, results, aiAnswer, suggestChips, interests, regionTabs, divisionItems, districtItems, districtTitle, districtAttractions, districtFootnote, breadcrumb, popularTitle, popular, heroImg, nearImg, footerImg, districtImg, routes, utilities, seasons, footerColumns } = useTravel();
 return (<footer className="tp-style-160">
<div className="tp-style-161">
<img className="tp-image" src={footerImg} alt={"Footer photo"} />
</div>
<div className="tp-style-162"></div>
<div className="tp-style-163">
<div className="tp-style-164">
{footerColumns.map((f, itemIndex) => <Fragment key={itemIndex}>
<div className="tp-style-87">
<div className="tp-style-165">{f.title}</div>
<div className="tp-style-166">
{f.links.map((fl, itemIndex) => <Fragment key={itemIndex}>
<a className="tp-style-167" href="#explorer">{fl}</a>
</Fragment>)}
</div>
</div>
</Fragment>)}
</div>
<div className="tp-style-168">
<span>Travel Pakistan — a free guide to every district in the country.</span>
<span>© 2026 · Privacy · Terms · Contact</span>
</div>
</div>
</footer>);
}
