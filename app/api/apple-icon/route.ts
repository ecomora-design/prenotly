import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");

    let logoUrl = "/apple-touch-icon.png";

    if (slug) {
      const supabase = createAdminClient();
      const { data: tenant } = await supabase
        .from("tenants")
        .select("logo_url")
        .eq("slug", slug)
        .single();

      if (tenant?.logo_url) {
        // Se il logo è un URL esterno, redirect diretto
        if (tenant.logo_url.startsWith("http")) {
          return NextResponse.redirect(tenant.logo_url);
        }
        logoUrl = tenant.logo_url;
      }
    }

    // Redirect all'icona di default
    return NextResponse.redirect(new URL(logoUrl, req.url));
  } catch (err) {
    console.error("Apple icon error:", err);
    return NextResponse.redirect(new URL("/apple-touch-icon.png", req.url));
  }
}
