path = "app/[slug]/page.tsx"
with open(path) as f:
    c = f.read()

# Rimuovo la riga 158 (8 spazi indent, sbagliata) tenendo quella a 10 spazi (riga 171)
old = '''          whatsappNumber={tenant.whatsapp_number || ""}
        webDiscountPercent={tenant.web_discount_enabled ? (tenant.web_discount_percent || 0) : 0}
          services={services || []}'''

new = '''          whatsappNumber={tenant.whatsapp_number || ""}
          services={services || []}'''

if old not in c:
    print("FAIL: pattern non trovato")
    exit(1)

c = c.replace(old, new, 1)
with open(path, "w") as f:
    f.write(c)
print("✅ Duplicato rimosso (riga 158)")
