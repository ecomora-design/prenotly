import { NextResponse } from "next/server";
import { createCalendarClient } from "@/lib/google/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const { eventId } = await req.json();

    if (!eventId) {
      return NextResponse.json({ error: "Event ID mancante" }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: link } = await admin
      .from("tenant_users")
      .select("tenant_id, tenants(google_refresh_token, google_calendar_id)")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!link || !link.tenants) {
      return NextResponse.json({ error: "Tenant non trovato" }, { status: 404 });
    }

    const tenant = link.tenants as any;

    if (!tenant.google_refresh_token) {
      return NextResponse.json({ error: "Google non collegato" }, { status: 400 });
    }

    const calendar = createCalendarClient(tenant.google_refresh_token);

    await calendar.events.delete({
      calendarId: tenant.google_calendar_id || "primary",
      eventId,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete event error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Errore" },
      { status: 500 }
    );
  }
}
