import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const admin = createAdminClient();

    const { data: link } = await admin
      .from("tenant_users")
      .select("tenant_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!link) {
      return NextResponse.json({ error: "Tenant non trovato" }, { status: 404 });
    }

    await admin
      .from("tenants")
      .update({
        google_refresh_token: null,
        google_email: null,
        google_connected_at: null,
      })
      .eq("id", link.tenant_id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Google disconnect error:", err);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
