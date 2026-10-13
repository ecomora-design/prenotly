import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");

    if (!slug) {
      // Manifest di default (Prenotly)
      return NextResponse.json({
        name: "Prenotly",
        short_name: "Prenotly",
        description: "Prenotazioni e ordini su WhatsApp",
        start_url: "/",
        display: "standalone",
        background_color: "#FFFFFF",
        theme_color: "#25D366",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
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
    const logoUrl = tenant.logo_url || "/icon-192.png";

    return NextResponse.json({
      name: tenant.business_name,
      short_name: tenant.business_name.slice(0, 12),
      description: `Prenota o ordina da ${tenant.business_name}`,
      start_url: `/${slug}`,
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
          purpose: "any maskable",
        },
      ],
    });
  } catch (err) {
    console.error("Manifest error:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
