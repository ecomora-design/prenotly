path = "app/[slug]/page.tsx"
with open(path) as f:
    c = f.read()

# 1. Aggiungi a MenuClient (dopo minOrderDelivery)
old_menu = "          minOrderDelivery={Number(tenant.min_order_delivery) || 0}"
new_menu = "          minOrderDelivery={Number(tenant.min_order_delivery) || 0}\n          webDiscountPercent={tenant.web_discount_enabled ? (tenant.web_discount_percent || 0) : 0}"
if old_menu not in c:
    print("FAIL 1: MenuClient non trovato"); exit(1)
if "webDiscountPercent={tenant.web_discount_enabled" not in c:
    c = c.replace(old_menu, new_menu, 1)
    print("✅ 1. webDiscountPercent aggiunto a MenuClient")

# 2. Aggiungi a BookingClient (dopo whatsappNumber)
old_booking = '        whatsappNumber={tenant.whatsapp_number || ""}'
new_booking = '''        whatsappNumber={tenant.whatsapp_number || ""}
        webDiscountPercent={tenant.web_discount_enabled ? (tenant.web_discount_percent || 0) : 0}'''
count = c.count(old_booking)
if count == 0:
    print("FAIL 2: BookingClient whatsappNumber non trovato"); exit(1)
# Sostituisce SOLO la seconda occorrenza (BookingClient), non la prima (MenuClient già modificata sopra)
# Ma ora la prima (MenuClient) è diversa perché abbiamo aggiunto webDiscountPercent,
# quindi se la stringa 'whatsappNumber={tenant.whatsapp_number || ""}' appare 2+ volte, è BookingClient
if 'webDiscountPercent={tenant.web_discount_enabled ? (tenant.web_discount_percent || 0) : 0}\n        services' not in c:
    # Non ancora modificato
    c = c.replace(old_booking, new_booking, 1)  # la prima occorrenza rimanente è MenuClient ma è già stata modificata, quindi prende BookingClient
    print("✅ 2. webDiscountPercent aggiunto a BookingClient")

with open(path, "w") as f:
    f.write(c)
print("\n🎉 page.tsx aggiornato")
