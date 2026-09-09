// components/Footer/Footer.jsx

import Image from "next/image";
import { getFooterData } from "@/lib/api";
import styles from "./Footer.module.css";

// Small inline social icons — no extra icon library required
const SOCIAL_ICONS = {
  facebook: (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z" />
    </svg>
  ),

  twitter: (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M22 5.9c-.7.3-1.5.6-2.3.7a4 4 0 0 0 1.8-2.2 8 8 0 0 1-2.5 1 4 4 0 0 0-6.9 3.6A11.4 11.4 0 0 1 3.9 4.9a4 4 0 0 0 1.3 5.4c-.6 0-1.2-.2-1.7-.5v.1a4 4 0 0 0 3.2 4 4 0 0 1-1.8.1 4 4 0 0 0 3.8 2.8A8.1 8.1 0 0 1 2 18.4a11.4 11.4 0 0 0 6.2 1.8c7.4 0 11.5-6.2 11.5-11.5v-.5c.8-.6 1.5-1.3 2.3-2.2Z" />
    </svg>
  ),

  instagram: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0-3-3Zm5.25-3.25a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z" />
    </svg>
  ),
};

export default async function Footer() {
  const data = await getFooterData();

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.top}`}>
        {/* Brand column */}
        <div className={styles.brand}>
          <div className={styles.brandHeading}>
            {data.brand?.logo && (
              <Image
                src={data.brand.logo}
                alt="Travel Pakistan"
                width={140}
                height={26}
                className={styles.brandLogo}
              />
            )}
          </div>

          <p className={styles.brandDesc}>
            {data.brand?.description}
          </p>

          {/* Download App */}
          {data.download_app?.title && (
            <p className={styles.downloadTitle}>
              {data.download_app.title}
            </p>
          )}

          <div className={styles.storeButtons}>
            {/* App Store */}
            {data.download_app?.app_store_url && (
              <a
                href={data.download_app.app_store_url}
                className={styles.storeBtn}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Download on the App Store"
              >
                <Image
                  src="/images/appstore.svg"
                  alt="Download on the App Store"
                  width={140}
                  height={42}
                  className={styles.storeImage}
                />
              </a>
            )}

            {/* Google Play */}
            {data.download_app?.google_play_url && (
              <a
                href={data.download_app.google_play_url}
                className={styles.storeBtn}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Get it on Google Play"
              >
                <Image
                  src="/images/goggle.svg"
                  alt="Get it on Google Play"
                  width={140}
                  height={42}
                  className={styles.storeImage}
                />
              </a>
            )}
          </div>
        </div>

        {/* Menu columns — WordPress menus render dynamically */}
        <div className={styles.menus}>
          {data.menus?.map((menu) => (
            <div key={menu.menu_id} className={styles.menuCol}>
              <h4 className={styles.menuTitle}>
                {menu.title}
              </h4>

              <ul>
                {menu.items?.map((item) => (
                  <li key={item.id}>
                    <a
                      href={item.url}
                      target={item.target || "_self"}
                      rel={
                        item.target === "_blank"
                          ? "noopener noreferrer"
                          : undefined
                      }
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Social bar */}
      <div className={styles.socialBar}>
        <div className={`container ${styles.socialInner}`}>
          {data.socials?.map((social) => (
            <a
              key={social.platform}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.platform}
              className={styles.socialIcon}
            >
              {SOCIAL_ICONS[social.icon] ||
                social.platform?.charAt(0)}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}