import { NextResponse } from "next/server";
import { createCalendarClient } from "@/lib/google/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const url = new URL(req.url);
    const startDate = url.searchParams.get("start"); // YYYY-MM-DD
    const endDate = url.searchParams.get("end");

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Date mancanti" }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: link } = await admin
      .from("tenant_users")
      .select("tenant_id, tenants(google_refresh_token, google_calendar_id)")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!link || !link.tenants) {
      return NextResponse.json({ events: [], google_connected: false });
    }

    const tenant = link.tenants as any;

    if (!tenant.google_refresh_token) {
      return NextResponse.json({ events: [], google_connected: false });
    }

    const calendar = createCalendarClient(tenant.google_refresh_token);

    const startIso = new Date(`${startDate}T00:00:00`).toISOString();
    const endIso = new Date(`${endDate}T23:59:59`).toISOString();

    const response = await calendar.events.list({
      calendarId: tenant.google_calendar_id || "primary",
      timeMin: startIso,
      timeMax: endIso,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = (response.data.items || []).map((e) => ({
      id: e.id,
      summary: e.summary,
      start: e.start?.dateTime || e.start?.date,
      end: e.end?.dateTime || e.end?.date,
      colorId: e.colorId,
      isBlocked: e.summary?.startsWith("🚫"),
      isBooking: e.summary?.startsWith("💇"),
    }));

    return NextResponse.json({ events, google_connected: true });
  } catch (err) {
    console.error("List events error:", err);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
