path = "app/api/bookings/create/route.ts"
with open(path) as f:
    c = f.read()

# Trova il blocco anti-doppione appuntamento
old_block = '''    // Anti-doppione appuntamento (beauty)
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
    }'''

new_block = '''    // Anti-doppione appuntamento (beauty)
    if (bookingType === "appointment") {
      const requestedStart = new Date(scheduledAt);
      const requestedDuration = durationMinutes || 30;
      const requestedEnd = new Date(requestedStart.getTime() + requestedDuration * 60000);

      const dayStart = new Date(requestedStart);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(requestedStart);
      dayEnd.setHours(23, 59, 59, 999);

      // Solo appuntamenti (esclude i tavoli)
      const { data: existingBookings } = await supabase
        .from("bookings")
        .select("scheduled_at, duration_minutes, status")
        .eq("tenant_id", tenant.id)
        .eq("booking_type", "appointment")
        .gte("scheduled_at", dayStart.toISOString())
        .lte("scheduled_at", dayEnd.toISOString())
        .neq("status", "cancelled");

      // Conta quante prenotazioni si sovrappongono all'orario richiesto
      const overlappingCount = (existingBookings || []).filter((b) => {
        const bStart = new Date(b.scheduled_at).getTime();
        const bEnd = bStart + (b.duration_minutes || 30) * 60000;
        return requestedStart.getTime() < bEnd && requestedEnd.getTime() > bStart;
      }).length;

      // Capacità = numero di operatori attivi (o 1 di default)
      const { data: activeStaff } = await supabase
        .from("staff")
        .select("id")
        .eq("tenant_id", tenant.id)
        .eq("is_active", true);
      const capacity = (activeStaff && activeStaff.length > 0) ? activeStaff.length : 1;

      if (overlappingCount >= capacity) {
        return NextResponse.json(
          { error: "slot_taken", message: "Tutti gli operatori sono occupati in questo orario. Scegli un altro orario." },
          { status: 409 }
        );
      }
    }'''

if old_block not in c:
    print("FAIL: blocco anti-doppione non trovato")
    exit(1)

c = c.replace(old_block, new_block, 1)
with open(path, "w") as f:
    f.write(c)
print("✅ Anti-doppione riscritto (esclude tavoli + capacità operatori)")
