import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

// Forza la generazione statica durante la build
export const dynamic = "force-static";
export const revalidate = 3600; // rigenera ogni ora

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.prenotly-italia.it";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: tenants } = await supabase
      .from("tenants")
      .select("slug, updated_at")
      .eq("is_active", true);

    const tenantPages: MetadataRoute.Sitemap = (tenants || []).map((t) => ({
      url: `${BASE_URL}/${t.slug}`,
      lastModified: t.updated_at ? new Date(t.updated_at) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const staticPages: MetadataRoute.Sitemap = [
      {
        url: BASE_URL,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1.0,
      },
      {
        url: `${BASE_URL}/prezzi`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      },
      {
        url: `${BASE_URL}/ristoranti`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.6,
      },
      {
        url: `${BASE_URL}/pro`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
      },
    ];

    return [...staticPages, ...tenantPages];
  } catch (err) {
    console.error("Sitemap generation error:", err);
    return [
      {
        url: BASE_URL,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1.0,
      },
    ];
  }
}
