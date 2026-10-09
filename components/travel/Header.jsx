"use client";
import { Fragment } from "react";
import { useTravel } from "./TravelProvider";
import { Button } from "./Button";

export default function Header() {
 const { menuOpen, favCount, favN, navItems, menuColumns, menuCta, menuAll, heroChips, mapRegions, mapPins, feat, stats, modes, placeholder, submitLabel, query, onQuery, onSubmit, showResults, results, aiAnswer, suggestChips, interests, regionTabs, divisionItems, districtItems, districtTitle, districtAttractions, districtFootnote, breadcrumb, popularTitle, popular, heroImg, nearImg, footerImg, districtImg, routes, utilities, seasons, footerColumns } = useTravel();
 return (<header className="tp-style-2">
<div className="tp-style-3">
<a className="tp-style-4" href="#top">
<svg width="40" height="34" viewBox="0 0 40 34" fill="none" stroke="#0E5C36" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 31L14 10l7 10 4-5.5L38 31z" /><path d="M10.5 16.5l3.5 3 3-2.5M23 18l2.5 2.5 3-2" /><path d="M26 6.5a3 3 0 110 .01" /></svg>
<span className="tp-style-5">Travel <span className="tp-style-6">Pakistan</span></span>
</a>
<nav className="tp-style-7">
{navItems.map((nav, itemIndex) => <Fragment key={itemIndex}>
<Button className="tp-style-8" onClick={nav.onClick} type="button" style={{"--tp-dynamic-0":"3px solid " + String(nav.ul),"--tp-dynamic-1":nav.bg,"--tp-dynamic-2":nav.fg}}>
            {nav.label}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 9l7 7 7-7" /></svg>
</Button>
</Fragment>)}
<a className="tp-style-9" href="#regionmap">
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0E5C36" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s-7-6.5-7-12a7 7 0 0114 0c0 5.5-7 12-7 12z" /><circle cx="12" cy="10" r="2.5" /></svg>
          Map
        </a>
<a className="tp-style-9" href="#popular">
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0E5C36" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 10-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 000-7.8z" /></svg>
          Favourites
          <span className="tp-style-10">{favN}</span>
</a>
</nav>
<div className="tp-style-11">
<a className="tp-style-12" href="#explorer" aria-label="Search">
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
</a>
<span className="tp-style-13"></span>
<span className="tp-style-14"><strong className="tp-style-6">EN</strong><span className="tp-style-15">/</span><span className="tp-style-16">اردو</span></span>
</div>
</div>
{Boolean(menuOpen) && <>
<div className="tp-style-17">
<div className="tp-style-18">
<div className="tp-style-19">
{menuColumns.map((col, itemIndex) => <Fragment key={itemIndex}>
<div className="tp-style-20" style={{"--tp-dynamic-0":col.br,"--tp-dynamic-1":col.bb}}>
<svg className="tp-style-21" width="58" height="58" viewBox="0 0 48 48" fill="none" stroke="#0E5C36" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><use href={col.icon} /></svg>
<div className="tp-style-22">
<div className="tp-style-23">{col.title}</div>
<div className="tp-style-24">
{col.links.map((lk, itemIndex) => <Fragment key={itemIndex}>
<a className="tp-style-25" href="#explorer">
<span>{lk}</span>
<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7B8A81" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7" /></svg>
</a>
</Fragment>)}
</div>
</div>
</div>
</Fragment>)}
</div>
<div className="tp-style-26">
<svg width="34" height="34" viewBox="0 0 48 48" fill="none" stroke="#0E5C36" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><use href="#ic-pin" /></svg>
<div className="tp-style-27">Have a destination in mind?</div>
<select className="tp-style-28">
<option>Choose a city</option><option>Lahore</option><option>Islamabad</option><option>Karachi</option><option>Peshawar</option><option>Quetta</option><option>Gilgit</option><option>Skardu</option><option>Bahawalpur</option>
</select>
<a className="tp-style-29" href="#explorer">{menuCta}</a>
<span className="tp-style-30"></span>
<a className="tp-style-31" href="#explorer">{menuAll}</a>
</div>
</div>
</div>
</>}
</header>);
}
