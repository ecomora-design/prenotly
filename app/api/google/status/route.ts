import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const admin = createAdminClient();

    const { data: link } = await admin
      .from("tenant_users")
      .select("tenant_id, tenants(google_email, google_connected_at, google_refresh_token)")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!link || !link.tenants) {
      return NextResponse.json({ connected: false });
    }

    const t = link.tenants as any;

    return NextResponse.json({
      connected: !!t.google_refresh_token,
      email: t.google_email,
      connected_at: t.google_connected_at,
    });
  } catch (err) {
    console.error("Google status error:", err);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
