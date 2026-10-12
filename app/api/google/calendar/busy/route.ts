import { NextResponse } from "next/server";
import { createCalendarClient } from "@/lib/google/client";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");
    const date = url.searchParams.get("date");

    if (!slug || !date) {
      return NextResponse.json({ error: "Dati mancanti", busy: [] }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: tenant } = await supabase
      .from("tenants")
      .select("id, google_refresh_token, google_calendar_id")
      .eq("slug", slug)
      .single();

    if (!tenant) {
      return NextResponse.json({ busy: [] });
    }

    const busy: { start: string; end: string; source: string }[] = [];

    // 1. Prenotazioni da Supabase
    const startOfDay = new Date(`${date}T00:00:00`).toISOString();
    const endOfDay = new Date(`${date}T23:59:59`).toISOString();

    const { data: bookings } = await supabase
      .from("bookings")
      .select("scheduled_at, duration_minutes, status")
      .eq("tenant_id", tenant.id)
      .gte("scheduled_at", startOfDay)
      .lte("scheduled_at", endOfDay)
      .neq("status", "cancelled");

    (bookings || []).forEach((b) => {
      const start = new Date(b.scheduled_at);
      const duration = b.duration_minutes || 30;
      const end = new Date(start.getTime() + duration * 60000);
      busy.push({
        start: start.toISOString(),
        end: end.toISOString(),
        source: "booking",
      });
    });

    // 2. Eventi Google Calendar (inclusi blocchi)
    if (tenant.google_refresh_token) {
      try {
        const calendar = createCalendarClient(tenant.google_refresh_token);
        const response = await calendar.events.list({
          calendarId: tenant.google_calendar_id || "primary",
          timeMin: startOfDay,
          timeMax: endOfDay,
          singleEvents: true,
          orderBy: "startTime",
        });

        (response.data.items || []).forEach((e) => {
          const start = e.start?.dateTime || e.start?.date;
          const end = e.end?.dateTime || e.end?.date;
          if (start && end) {
            busy.push({
              start,
              end,
              source: e.summary?.startsWith("🚫") ? "block" : "google",
            });
          }
        });
      } catch (gErr) {
        console.error("Google error:", gErr);
      }
    }

    console.log("📅 Busy API:", {
      slug,
      date,
      total: busy.length,
      sources: busy.map((b) => b.source),
    });

    return NextResponse.json({ busy });
  } catch (err) {
    console.error("Busy error:", err);
    return NextResponse.json({ busy: [] });
  }
}
