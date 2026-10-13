import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://prenotly-italia.it";

    if (!slug) {
      return NextResponse.json({
        name: "Prenotly",
        short_name: "Prenotly",
        description: "Prenotazioni e ordini su WhatsApp",
        start_url: "/",
        display: "standalone",
        background_color: "#FFFFFF",
        theme_color: "#25D366",
        orientation: "portrait",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
        ],
      });
    }

    const supabase = createAdminClient();
    const { data: tenant } = await supabase
      .from("tenants")
      .select("business_name, logo_url, brand_color")
      .eq("slug", slug)
      .single();

    if (!tenant) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const brandColor = tenant.brand_color || "#25D366";
    const logoUrl = tenant.logo_url || "/icon-512.png";
    const shortName = tenant.business_name.length > 12
      ? tenant.business_name.slice(0, 12).trim()
      : tenant.business_name;

    return NextResponse.json(
      {
        name: tenant.business_name,
        short_name: shortName,
        description: `Prenota o ordina da ${tenant.business_name}`,
        start_url: `/${slug}`,
        scope: `/${slug}`,
        display: "standalone",
        background_color: "#FFFFFF",
        theme_color: brandColor,
        orientation: "portrait",
        icons: [
          {
            src: logoUrl,
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: logoUrl,
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: logoUrl,
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: logoUrl,
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/manifest+json",
          "Cache-Control": "public, max-age=3600",
        },
      }
    );
  } catch (err) {
    console.error("Manifest error:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
