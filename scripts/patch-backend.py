import re

# ============================================================
# ORDERS/CREATE
# ============================================================
path = "app/api/orders/create/route.ts"
with open(path) as f:
    c = f.read()

# 1. Aggiungi i campi sconto e delivery_fee al select del tenant
old_sel = '.select("id").eq("slug", slug).single();'
new_sel = '.select("id, web_discount_enabled, web_discount_percent, delivery_fee").eq("slug", slug).single();'
if old_sel not in c:
    print("FAIL orders 1: select non trovato"); exit(1)
if "web_discount_enabled" not in c:
    c = c.replace(old_sel, new_sel, 1)
    print("✅ orders 1: select aggiornato")

# 2. Aggiungi il ricalcolo server-side prima dell'insert
old_insert = '    const { data: order, error: orderError } = await supabase.from("orders").insert({'
new_insert = '''    // Ricalcolo server-side: ignora il total dal client (anti-manomissione)
    const serverSubtotal = items.reduce((sum: number, i: Item) => sum + (Number(i.price) * Number(i.qty)), 0);
    const serverDelivery = orderType === "delivery" ? (Number((tenant as any).delivery_fee) || 0) : 0;
    const serverDiscount = ((tenant as any).web_discount_enabled && (tenant as any).web_discount_percent > 0)
      ? Math.round(serverSubtotal * (tenant as any).web_discount_percent) / 100
      : 0;
    const serverTotal = Math.max(0, serverSubtotal + serverDelivery - serverDiscount);

    const { data: order, error: orderError } = await supabase.from("orders").insert({'''

if old_insert not in c:
    print("FAIL orders 2: insert non trovato"); exit(1)
if "serverSubtotal" not in c:
    c = c.replace(old_insert, new_insert, 1)
    print("✅ orders 2: ricalcolo aggiunto")

# 3. Sostituisci il totale con quello calcolato
old_total = 'total: Number(total) || 0,'
new_total = 'total: serverTotal,'
if old_total not in c:
    print("FAIL orders 3: total non trovato"); exit(1)
c = c.replace(old_total, new_total, 1)
print("✅ orders 3: total usa serverTotal")

with open(path, "w") as f:
    f.write(c)

# ============================================================
# BOOKINGS/CREATE
# ============================================================
path = "app/api/bookings/create/route.ts"
with open(path) as f:
    c = f.read()

# 1. Aggiungi sconto al select del tenant
old_sel_b = '.select("id, business_name, has_table_booking, enable_table_bookings, google_refresh_token, google_calendar_id")'
new_sel_b = '.select("id, business_name, has_table_booking, enable_table_bookings, google_refresh_token, google_calendar_id, web_discount_enabled, web_discount_percent")'
if old_sel_b not in c:
    print("FAIL bookings 1: select non trovato"); exit(1)
if "web_discount_enabled" not in c:
    c = c.replace(old_sel_b, new_sel_b, 1)
    print("✅ bookings 1: select aggiornato")

# 2. Calcola il prezzo server-side (solo per appuntamenti, non tavoli)
# Inserisco il calcolo prima della chiamata a Google Calendar
# Cerco "Google Calendar (solo appuntamenti)"
old_gcal = '    // Google Calendar (solo appuntamenti)\n    if (tenant.google_refresh_token && bookingType !== "table") {'
new_gcal = '''    // Ricalcolo server-side del prezzo (anti-manomissione)
    let serverPrice: number | null = null;
    if (bookingType !== "table") {
      let originalPrice = Number(price) || 0;
      if (serviceId) {
        const { data: svc } = await supabase
          .from("services")
          .select("price")
          .eq("id", serviceId)
          .eq("tenant_id", tenant.id)
          .maybeSingle();
        if (svc) originalPrice = Number(svc.price) || 0;
      }
      serverPrice = ((tenant as any).web_discount_enabled && (tenant as any).web_discount_percent > 0)
        ? Math.round(originalPrice * (1 - (tenant as any).web_discount_percent / 100) * 100) / 100
        : originalPrice;
    }

    // Google Calendar (solo appuntamenti)
    if (tenant.google_refresh_token && bookingType !== "table") {'''

if old_gcal not in c:
    print("FAIL bookings 2: blocco Google Calendar non trovato"); exit(1)
if "serverPrice" not in c:
    c = c.replace(old_gcal, new_gcal, 1)
    print("✅ bookings 2: ricalcolo prezzo aggiunto")

# 3. Usa serverPrice nella description del Google Calendar
old_price_desc = '            price ? `💶 €${price}` : "",'
new_price_desc = '            serverPrice !== null ? `💶 €${serverPrice.toFixed(2)}` : "",'
if old_price_desc not in c:
    print("FAIL bookings 3: price desc non trovato"); exit(1)
c = c.replace(old_price_desc, new_price_desc, 1)
print("✅ bookings 3: price desc usa serverPrice")

with open(path, "w") as f:
    f.write(c)

print("\n🎉 Backend: ricalcolo server-side completato")
