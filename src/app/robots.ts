import type { MetadataRoute } from "next";

const site = "https://zerospenders.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard"],
      },
    ],
    sitemap: `${site}/sitemap.xml`,
    host: site,
  };
}
