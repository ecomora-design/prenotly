import { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_APP_URL || "https://www.prenotly-italia.it";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/admin/", "/api/", "/onboarding/"],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
