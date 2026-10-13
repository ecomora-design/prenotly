import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createCalendarClient } from "@/lib/google/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      slug,
      customerName,
      customerPhone,
      serviceId,
      serviceName,
      price,
      durationMinutes,
      scheduledAt,
      bookingType,
      partySize,
      tableId,
      notes,
    } = body;

    if (!slug || !customerName || !customerPhone || !scheduledAt) {
      return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: tenant } = await supabase
      .from("tenants")
      .select("id, business_name, has_table_booking, google_refresh_token, google_calendar_id")
      .eq("slug", slug)
      .single();

    if (!tenant) {
      return NextResponse.json({ error: "Attività non trovata" }, { status: 404 });
    }

    // Verifica feature tavoli
    if (bookingType === "table" && !tenant.has_table_booking) {
      return NextResponse.json(
        { error: "Prenotazione tavoli non attiva" },
        { status: 403 }
      );
    }

    // Anti-doppione tavolo
    if (bookingType === "table" && tableId) {
      const target = new Date(scheduledAt);
      const start = new Date(target.getTime() - 2 * 60 * 60 * 1000);
      const end = new Date(target.getTime() + 2 * 60 * 60 * 1000);

      const { data: existing } = await supabase
        .from("bookings")
        .select("table_id, scheduled_at, duration_minutes")
        .eq("tenant_id", tenant.id)
        .eq("table_id", tableId)
        .neq("status", "cancelled")
        .gte("scheduled_at", start.toISOString())
        .lte("scheduled_at", end.toISOString());

      const hasConflict = (existing || []).some((b) => {
        const bStart = new Date(b.scheduled_at).getTime();
        const bEnd = bStart + (b.duration_minutes || 120) * 60000;
        const tStart = target.getTime();
        const tEnd = tStart + 120 * 60000;
        return tStart < bEnd && tEnd > bStart;
      });

      if (hasConflict) {
        return NextResponse.json(
          { error: "table_taken", message: "Questo tavolo è appena stato prenotato. Scegline un altro." },
          { status: 409 }
        );
      }
    }

    // Anti-doppione appuntamento (beauty)
    if (bookingType === "appointment") {
      const requestedStart = new Date(scheduledAt);
      const requestedDuration = durationMinutes || 30;
      const requestedEnd = new Date(requestedStart.getTime() + requestedDuration * 60000);

      const dayStart = new Date(requestedStart);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(requestedStart);
      dayEnd.setHours(23, 59, 59, 999);

      const { data: existingBookings } = await supabase
        .from("bookings")
        .select("scheduled_at, duration_minutes, status")
        .eq("tenant_id", tenant.id)
        .gte("scheduled_at", dayStart.toISOString())
        .lte("scheduled_at", dayEnd.toISOString())
        .neq("status", "cancelled");

      const hasConflict = (existingBookings || []).some((b) => {
        const bStart = new Date(b.scheduled_at).getTime();
        const bEnd = bStart + (b.duration_minutes || 30) * 60000;
        return requestedStart.getTime() < bEnd && requestedEnd.getTime() > bStart;
      });

      if (hasConflict) {
        return NextResponse.json(
          { error: "slot_taken", message: "Questo orario è appena stato prenotato. Scegline un altro." },
          { status: 409 }
        );
      }
    }

    // Cerca o crea customer
    let customerId: string | null = null;
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("tenant_id", tenant.id)
      .eq("whatsapp_number", customerPhone)
      .maybeSingle();

    if (existingCustomer) {
      customerId = existingCustomer.id;
      await supabase.from("customers").update({ name: customerName }).eq("id", customerId);
    } else {
      const { data: created } = await supabase
        .from("customers")
        .insert({
          tenant_id: tenant.id,
          name: customerName,
          whatsapp_number: customerPhone,
        })
        .select("id")
        .single();
      customerId = created?.id || null;
    }

    const prefix = bookingType === "table" ? "TB-" : "PR-";
    const bookingCode = prefix + Math.random().toString(36).substring(2, 8).toUpperCase();

    const { data: booking, error } = await supabase
      .from("bookings")
      .insert({
        tenant_id: tenant.id,
        customer_id: customerId,
        booking_code: bookingCode,
        booking_type: bookingType === "table" ? "table" : "appointment",
        scheduled_at: scheduledAt,
        duration_minutes: bookingType === "table" ? 120 : durationMinutes || null,
        party_size: partySize || null,
        table_id: tableId || null,
        status: "confirmed",
        notes: notes || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Booking insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Google Calendar (solo appuntamenti)
    if (tenant.google_refresh_token && bookingType !== "table") {
      try {
        const calendar = createCalendarClient(tenant.google_refresh_token);
        const duration = durationMinutes || 30;
        const start = new Date(scheduledAt);
        const end = new Date(start.getTime() + duration * 60000);

        const event = {
          summary: `💇 ${serviceName || "Appuntamento"} - ${customerName}`,
          description: [
            `👤 ${customerName}`,
            `📞 ${customerPhone}`,
            `✂️ ${serviceName || ""}`,
            price ? `💶 €${price}` : "",
            `🔖 ${bookingCode}`,
          ].filter(Boolean).join("\n"),
          start: { dateTime: start.toISOString(), timeZone: "Europe/Rome" },
          end: { dateTime: end.toISOString(), timeZone: "Europe/Rome" },
        };

        const gEvent = await calendar.events.insert({
          calendarId: tenant.google_calendar_id || "primary",
          requestBody: event,
        });

        await supabase
          .from("bookings")
          .update({ google_event_id: gEvent.data.id })
          .eq("id", booking.id);
      } catch (gErr) {
        console.error("Google error:", gErr);
      }
    }

    return NextResponse.json({ booking });
  } catch (err) {
    console.error("API bookings error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Errore" },
      { status: 500 }
    );
  }
}
