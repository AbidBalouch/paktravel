"use client";
import { Fragment } from "react";
import { useTravel } from "./TravelProvider";
import { Button } from "./Button";

export default function TravelUtilities() {
 const { menuOpen, favCount, favN, navItems, menuColumns, menuCta, menuAll, heroChips, mapRegions, mapPins, feat, stats, modes, placeholder, submitLabel, query, onQuery, onSubmit, showResults, results, aiAnswer, suggestChips, interests, regionTabs, divisionItems, districtItems, districtTitle, districtAttractions, districtFootnote, breadcrumb, popularTitle, popular, heroImg, nearImg, footerImg, districtImg, routes, utilities, seasons, footerColumns } = useTravel();
 return (<section className="tp-style-116">
<div className="tp-style-138">
<div className="tp-style-139">
<div className="tp-style-76"><img className="tp-image" src={nearImg} alt={"Desert photo"} /></div>
<div className="tp-style-140"></div>
<div className="tp-style-141">
<div className="tp-style-142">What is near me?</div>
<p className="tp-style-143">Type your city. We show places, stays and buses close to you.</p>
<div className="tp-style-144">
<input className="tp-style-145" placeholder="Your city or district" />
<Button className="tp-style-146" type="button">Go</Button>
</div>
</div>
</div>
{utilities.map((u, itemIndex) => <Fragment key={itemIndex}>
<div className="tp-style-147">
<div className="tp-style-148">{u.glyph}</div>
<div className="tp-style-149">{u.title}</div>
<p className="tp-style-150">{u.body}</p>
<span className="tp-style-151">{u.cta} →</span>
</div>
</Fragment>)}
</div>
</section>);
}
