"use client";
import { Fragment } from "react";
import { useTravel } from "./TravelProvider";
import { Button } from "./Button";

export default function Banner() {
 const { banner, menuOpen, favCount, favN, navItems, menuColumns, menuCta, menuAll, heroChips, mapRegions, mapPins, feat, stats, modes, placeholder, submitLabel, query, onQuery, onSubmit, showResults, results, aiAnswer, suggestChips, interests, regionTabs, divisionItems, districtItems, districtTitle, districtAttractions, districtFootnote, breadcrumb, popularTitle, popular, heroImg, nearImg, footerImg, districtImg, routes, utilities, seasons, footerColumns } = useTravel();
 return (<section className="tp-style-32" id="top">
<div className="tp-style-33">
<img className="tp-image" src={banner?.bannerImage?.url || "https://paktravel.hammanitechdemos.com/wp-content/uploads/2026/10/banner.png"} alt={banner?.bannerImage?.alt || "Travel Pakistan"} />
</div>
<div className="tp-style-34"></div>
<div className="tp-style-35">
<div className="tp-style-36">
<div className="tp-style-37">{banner?.badge || "Discover • Explore • Experience"}</div>
<h1 className="tp-style-38">{(() => { const lines = String(banner?.heading || "Find your place\nin Pakistan.").split("\n").map(x => x.trim()).filter(Boolean); const first = lines[0] || ""; const rest = (lines.slice(1).join(" ") || "").split(" "); const restFirst = rest[0] || ""; const restGreen = rest.slice(1).join(" "); return <>{first}<br />{restFirst}{restGreen ? <> <span className="tp-style-6">{restGreen}</span></> : null}</>; })()}</h1>
<p className="tp-style-39">{banner?.description || "Explore cities, districts and attractions."}</p>
<div className="tp-style-40">
<div className="tp-style-41">
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6E7B73" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
<input className="tp-style-42" value={query} onChange={onQuery} placeholder="Search a city, district or attraction" />
<Button className="tp-style-43" onClick={onSubmit} type="button">Search</Button>
</div>
{Boolean(showResults) && <>
<div className="tp-style-44">
{results.map((r, itemIndex) => <Fragment key={itemIndex}>
<Button className="tp-style-45" onClick={r.onClick} type="button">
<span className="tp-style-46">{r.kind}</span>
<span className="tp-style-47">{r.name}</span>
<span className="tp-style-48">{r.where}</span>
</Button>
</Fragment>)}
</div>
</>}
</div>
<div className="tp-style-49">
{heroChips.map((c, itemIndex) => <Fragment key={itemIndex}>
<Button className="tp-style-50" onClick={c.onClick} type="button">
{Boolean(c.pin) && <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0E5C36" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s-7-6.5-7-12a7 7 0 0114 0c0 5.5-7 12-7 12z" /><circle cx="12" cy="10" r="2.5" /></svg></>}
              {c.label}
            </Button>
</Fragment>)}
<a className="tp-style-51" href="#regionmap">
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0E5C36" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s-7-6.5-7-12a7 7 0 0114 0c0 5.5-7 12-7 12z" /><circle cx="12" cy="10" r="2.5" /></svg>
            Explore on map
          </a>
</div>
</div>
</div>
</section>);
}
