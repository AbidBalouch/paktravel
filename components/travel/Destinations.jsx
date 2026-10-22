"use client";
import { Fragment } from "react";
import { useTravel } from "./TravelProvider";
import { Button } from "./Button";

export default function Destinations() {
 const { menuOpen, favCount, favN, navItems, menuColumns, menuCta, menuAll, heroChips, mapRegions, mapPins, feat, stats, modes, placeholder, submitLabel, query, onQuery, onSubmit, showResults, results, aiAnswer, suggestChips, interests, regionTabs, divisionItems, districtItems, districtTitle, districtAttractions, districtFootnote, districtHref, breadcrumb, popularTitle, popular, heroImg, nearImg, footerImg, districtImg, routes, utilities, seasons, footerColumns } = useTravel();
 return (<section className="tp-style-85" id="explorer">
<div className="tp-style-86">
<div className="tp-style-87">
<div className="tp-style-64">The full list</div>
<h2 className="tp-style-88">Province → division → district</h2>
<p className="tp-style-89">Click a region. Then a division. Then a district. You see all its places right here. No new page.</p>
</div>
<div className="tp-style-90">
        You are in <strong className="tp-style-91">{breadcrumb}</strong>
</div>
</div>
<div className="tp-style-92">
{regionTabs.map((rg, itemIndex) => <Fragment key={itemIndex}>
<Button className="tp-style-93" onClick={rg.onClick} type="button" style={{"--tp-dynamic-0":"1.5px solid " + String(rg.bd),"--tp-dynamic-1":rg.bg,"--tp-dynamic-2":rg.fg}}>
<div className="tp-style-94">{rg.name}</div>
<div className="tp-style-95">{rg.meta}</div>
</Button>
</Fragment>)}
</div>
<div className="tp-style-96">
<div className="tp-style-97">
<div className="tp-style-98">Divisions</div>
<div className="tp-style-99">
{divisionItems.map((dv, itemIndex) => <Fragment key={itemIndex}>
<Button className="tp-style-100" onClick={dv.onClick} type="button" style={{"--tp-dynamic-0":dv.bg,"--tp-dynamic-1":dv.fg,"--tp-dynamic-2":dv.w}}>
<span>{dv.name}</span><span className="tp-style-101">{dv.n}</span>
</Button>
</Fragment>)}
</div>
</div>
<div className="tp-style-97">
<div className="tp-style-98">Districts</div>
<div className="tp-style-99">
{districtItems.map((ds, itemIndex) => <Fragment key={itemIndex}>
<Button className="tp-style-102" onClick={ds.onClick} type="button" style={{"--tp-dynamic-0":ds.bg,"--tp-dynamic-1":ds.fg,"--tp-dynamic-2":ds.w}}>
<span>{ds.name}</span><span className="tp-style-103" style={{"--tp-dynamic-0":ds.tagFg}}>{ds.tag}</span>
</Button>
</Fragment>)}
</div>
</div>
<div className="tp-style-104">
<div className="tp-style-76"><img className="tp-image" src={districtImg} alt={"District photo"} /></div>
<div className="tp-style-105"></div>
<div className="tp-style-106">
<div className="tp-style-107">
<div className="tp-style-87">
<div className="tp-style-108">Places in</div>
<div className="tp-style-109">{districtTitle}</div>
</div>
<a className="tp-style-110" href={districtHref}>Open this district →</a>
</div>
<div className="tp-style-111">
{districtAttractions.map((at, itemIndex) => <Fragment key={itemIndex}>
{at.link ? <a className="tp-style-112" href={at.link} style={{textDecoration:"none",color:"inherit"}}>
<div className="tp-style-113">{at.name}</div>
<div className="tp-style-114">{at.type}</div>
</a> : <div className="tp-style-112">
<div className="tp-style-113">{at.name}</div>
<div className="tp-style-114">{at.type}</div>
</div>}
</Fragment>)}
</div>
<div className="tp-style-115">{districtFootnote}</div>
</div>
</div>
</div>
</section>);
}
