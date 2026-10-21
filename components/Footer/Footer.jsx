// components/Footer/Footer.jsx
// Global dynamic footer (server component) — design maujooda homepage wala
// hi hai (tp-style classes, travel.css), lekin saara content WordPress se:
//   Menus / brand / socials / app links : /wp-json/travel-pakistan/v1/footer
//   Regions column                     : destination taxonomy (Region terms)
import { getFooterData, getDestinationTreeData, safe } from "@/lib/api";
import "./footer-global.css";

// Design wali footer photo ka fallback (TravelModel bhi yahi use karta tha)
const FOOTER_PHOTO_FALLBACK = "https://loremflickr.com/1600/700/mountain,snow?lock=45";

const SOCIAL_LABELS = { facebook: "Facebook", x: "X", twitter: "X", instagram: "Instagram", youtube: "YouTube" };

export default async function Footer() {
  const [data, tree] = await Promise.all([
    safe(getFooterData, null),
    safe(getDestinationTreeData, null),
  ]);

  const regions = tree?.regions || [];
  const menus = data?.menus || [];
  const otherMenu = menus.find((m) => /other/i.test(m.title || ""));

  // Columns: pehle Regions (taxonomy), phir WordPress footer menus
  const columns = [
    ...(regions.length
      ? [
          {
            title: "Regions",
            links: regions.slice(0, 5).map((r) => ({ label: r.name, url: `/provinces/${r.slug}` })),
          },
        ]
      : []),
    ...menus.map((menu) => ({
      title: menu.title,
      links: (menu.items || []).map((item) => ({
        label: item.label,
        url: item.url,
        target: item.target || "_self",
      })),
    })),
  ];

  const description =
    data?.brand?.description ||
    "Travel Pakistan — a free guide to every district in the country.";
  const year = new Date().getFullYear();

  return (
    <footer className="tp-style-160">
      <div className="tp-style-161">
        <img className="tp-image" src={FOOTER_PHOTO_FALLBACK} alt="Footer photo" />
      </div>
      <div className="tp-style-162"></div>
      <div className="tp-style-163">
        <div className="tp-style-164">
          {columns.map((col, i) => (
            <div key={i} className="tp-style-87">
              <div className="tp-style-165">{col.title}</div>
              <div className="tp-style-166">
                {col.links.map((link, j) => (
                  <a
                    key={j}
                    className="tp-style-167"
                    href={link.url}
                    target={link.target || "_self"}
                    rel={link.target === "_blank" ? "noopener noreferrer" : undefined}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Download app — WordPress footer endpoint se */}
        {(data?.download_app?.app_store_url || data?.download_app?.google_play_url) && (
          <div className="gf-apps">
            <span className="gf-apps-title">{data.download_app.title || "Download App"}</span>
            {data.download_app.app_store_url && (
              <a href={data.download_app.app_store_url} target="_blank" rel="noopener noreferrer">App Store</a>
            )}
            {data.download_app.google_play_url && (
              <a href={data.download_app.google_play_url} target="_blank" rel="noopener noreferrer">Google Play</a>
            )}
          </div>
        )}

        <div className="tp-style-168 gf-bottom">
          <span>{description}</span>
          <span className="gf-bottom-right">
            <span>
              © {year}
              {otherMenu?.items?.length
                ? otherMenu.items.map((item, i) => (
                    <span key={i}> · <a href={item.url}>{item.label}</a></span>
                  ))
                : <> · <a href="/privacy-policy">Privacy</a> · <a href="/terms-conditions">Terms</a> · <a href="/contact">Contact</a></>}
            </span>
            {data?.socials?.length > 0 && (
              <span className="gf-socials">
                {data.socials.map((s, i) => (
                  <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.platform}>
                    {SOCIAL_LABELS[String(s.icon || s.platform || "").toLowerCase()] || s.platform}
                  </a>
                ))}
              </span>
            )}
          </span>
        </div>
      </div>
    </footer>
  );
}
