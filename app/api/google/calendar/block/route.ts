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

    const body = await req.json();
    const { date, startTime, endTime, reason } = body;

    if (!date || !startTime || !endTime) {
      return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: link } = await admin
      .from("tenant_users")
      .select("tenant_id, tenants(google_refresh_token, google_calendar_id, business_name)")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!link || !link.tenants) {
      return NextResponse.json({ error: "Tenant non trovato" }, { status: 404 });
    }

    const tenant = link.tenants as any;

    if (!tenant.google_refresh_token) {
      return NextResponse.json(
        { error: "Google Calendar non collegato" },
        { status: 400 }
      );
    }

    const calendar = createCalendarClient(tenant.google_refresh_token);

    const startDate = new Date(`${date}T${startTime}:00`);
    const endDate = new Date(`${date}T${endTime}:00`);

    const event = {
      summary: `🚫 Bloccato - ${reason || "Non disponibile"}`,
      description: `Fascia oraria bloccata dalla dashboard Prenotly`,
      start: { dateTime: startDate.toISOString(), timeZone: "Europe/Rome" },
      end: { dateTime: endDate.toISOString(), timeZone: "Europe/Rome" },
      colorId: "11", // rosso
      transparency: "opaque",
    };

    const response = await calendar.events.insert({
      calendarId: tenant.google_calendar_id || "primary",
      requestBody: event,
    });

    return NextResponse.json({
      success: true,
      eventId: response.data.id,
    });
  } catch (err) {
    console.error("Block slot error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Errore" },
      { status: 500 }
    );
  }
}
