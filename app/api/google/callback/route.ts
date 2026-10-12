import { NextResponse } from "next/server";
import { createOAuth2Client } from "@/lib/google/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { google } from "googleapis";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const userId = url.searchParams.get("state");

    if (!code || !userId) {
      return NextResponse.redirect(
        new URL("/dashboard/impostazioni?google=error", req.url)
      );
    }

    const oauth2Client = createOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {
      return NextResponse.redirect(
        new URL("/dashboard/impostazioni?google=no_refresh", req.url)
      );
    }

    // Recupera email Google
    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    // Salva nel DB
    const admin = createAdminClient();

    const { data: link } = await admin
      .from("tenant_users")
      .select("tenant_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (!link) {
      return NextResponse.redirect(
        new URL("/dashboard/impostazioni?google=error", req.url)
      );
    }

    await admin
      .from("tenants")
      .update({
        google_refresh_token: tokens.refresh_token,
        google_calendar_id: "primary",
        google_email: userInfo.email || null,
        google_connected_at: new Date().toISOString(),
      })
      .eq("id", link.tenant_id);

    return NextResponse.redirect(
      new URL("/dashboard/impostazioni?google=success", req.url)
    );
  } catch (err) {
    console.error("Google callback error:", err);
    return NextResponse.redirect(
      new URL("/dashboard/impostazioni?google=error", req.url)
    );
  }
}
