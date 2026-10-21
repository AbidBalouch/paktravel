// components/Header/Header.jsx
// Global dynamic header (server component) — WordPress se data laata hai:
//   Header menu : /wp-json/travel-pakistan/v1/header  (lib/api getHeaderData)
//   Mega menu   : WP menu ke child items se, aur "Destinations" ke liye
//                 destination taxonomy (Region -> Division) se columns
// Design: maujooda homepage wala design (tp-style classes, travel.css).
import { getHeaderData, getDestinationTreeData, buildMenuTree, safe } from "@/lib/api";
import HeaderClient from "./HeaderClient";

const REGION_ICONS = ["#ic-mountain", "#ic-fort", "#ic-mosque", "#ic-hiker", "#ic-compass", "#ic-pin"];
// Har province/region ka apna icon — uski pehchan ke hisaab se:
// Gilgit-Baltistan = pahar, Punjab = qilay, Sindh = masjid/maqbaray,
// KPK = hiker (valleys/treks), Balochistan = compass (coast/desert),
// AJK = pin (lakes/valleys), Islamabad = Faisal Mosque
const REGION_ICON_BY_SLUG = {
  "gilgit-baltistan": "#ic-mountain",
  punjab: "#ic-fort",
  sindh: "#ic-mosque",
  "khyber-pakhtunkhwa": "#ic-hiker",
  balochistan: "#ic-compass",
  "azad-kashmir": "#ic-pin",
  "azad-jammu-kashmir": "#ic-pin",
  islamabad: "#ic-mosque",
  "islamabad-capital-territory": "#ic-mosque",
};

export default async function Header() {
  const [header, tree] = await Promise.all([
    safe(getHeaderData, null),
    safe(getDestinationTreeData, null),
  ]);

  const items = buildMenuTree(header?.menu?.items || []);
  const regions = tree?.regions || [];

  // Har top-level item ke liye mega menu columns tayyar karo
  const mega = {};
  for (const item of items) {
    const url = String(item.url || "");
    const isDestinations =
      url.includes("/provinces") || /destination|places|province/i.test(item.label || "");

    if (item.children?.length) {
      // WP menu me child items hain — agar grandchildren hain to har child
      // ek column, warna saare children ek column me links
      const hasGrandchildren = item.children.some((c) => c.children?.length);
      mega[item.id] = hasGrandchildren
        ? item.children.map((child, i) => ({
            title: child.label,
            url: child.url,
            icon: REGION_ICONS[i % REGION_ICONS.length],
            links: child.children.slice(0, 5).map((gc) => ({ label: gc.label, url: gc.url })),
          }))
        : [
            {
              title: item.label,
              url: item.url,
              icon: "#ic-compass",
              links: item.children.slice(0, 5).map((c) => ({ label: c.label, url: c.url })),
            },
          ];
    } else if (isDestinations && regions.length) {
      // Destinations ka mega menu destination taxonomy se banta hai:
      // column = Region, links = us region ki Divisions
      mega[item.id] = regions.slice(0, 6).map((region, i) => ({
        title: region.name,
        url: `/provinces/${region.slug}`,
        icon: REGION_ICON_BY_SLUG[region.slug] || REGION_ICONS[i % REGION_ICONS.length],
        links: region.divisions.slice(0, 5).map((d) => ({
          label: d.name,
          url: `/provinces/${region.slug}/${d.slug}`,
        })),
      }));
    }
  }

  return (
    <HeaderClient
      logo={header?.logo || null}
      items={items}
      mega={mega}
      buttons={header?.buttons || []}
    />
  );
}
