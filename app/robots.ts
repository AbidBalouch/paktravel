import type { MetadataRoute } from "next";

// Filhal poori site noindex hai (testing phase) — Henry ke index karne par
// yahan allow rules ayenge.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
