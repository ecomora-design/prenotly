path = "app/[slug]/BookingClient.tsx"
with open(path) as f:
    c = f.read()

# 1. Aggiungi prop al type Props
# Cerco il blocco "whatsappNumber: string;" nel type
old_type = "  whatsappNumber: string;"
new_type = "  whatsappNumber: string;\n  webDiscountPercent?: number;"
if old_type not in c:
    print("FAIL 1: type Props non trovato"); exit(1)
if "webDiscountPercent?: number;" not in c:
    c = c.replace(old_type, new_type, 1)
    print("✅ 1. Prop webDiscountPercent nel type")

# 2. Aggiungi alla destrutturazione
old_destr = "  whatsappNumber,"
new_destr = "  whatsappNumber,\n  webDiscountPercent = 0,"
if old_destr not in c:
    print("FAIL 2: destrutturazione non trovata"); exit(1)
if "  webDiscountPercent = 0," not in c:
    c = c.replace(old_destr, new_destr, 1)
    print("✅ 2. Destrutturazione aggiornata")

# 3. Nel submit, salva il prezzo scontato
# Cerco "price: selectedService.price,"
old_price = "          price: selectedService.price,"
new_price = """          price: webDiscountPercent > 0 
            ? Math.round(selectedService.price * (1 - webDiscountPercent / 100) * 100) / 100 
            : selectedService.price,"""
if old_price not in c:
    print("FAIL 3: price:selectedService non trovato"); exit(1)
if "webDiscountPercent > 0 \n            ?" not in c:
    c = c.replace(old_price, new_price, 1)
    print("✅ 3. Prezzo scontato inviato al server")

# 4. Nella UI, mostra prezzo pieno barrato + scontato
# Cerco il punto dove mostra il prezzo del servizio selezionato
# Riga ~471 prima: <span className="text-lg font-black text-night">€{Number(selectedService.price).toFixed(2)}</span>
old_ui = '<span className="text-lg font-black text-night">€{Number(selectedService.price).toFixed(2)}</span>'
new_ui = '''{webDiscountPercent > 0 ? (
                      <div className="text-right">
                        <div className="text-xs text-night/40 line-through">€{Number(selectedService.price).toFixed(2)}</div>
                        <span className="text-lg font-black text-emerald-600">€{(Number(selectedService.price) * (1 - webDiscountPercent / 100)).toFixed(2)}</span>
                        <div className="text-[10px] text-emerald-600 font-bold">-{webDiscountPercent}%</div>
                      </div>
                    ) : (
                      <span className="text-lg font-black text-night">€{Number(selectedService.price).toFixed(2)}</span>
                    )}'''
count = c.count(old_ui)
if count == 0:
    print("FAIL 4: prezzo UI non trovato"); exit(1)
if "webDiscountPercent > 0 ? (" not in c:
    # Sostituisce solo la prima occorrenza (il prezzo grande nel riepilogo)
    c = c.replace(old_ui, new_ui, 1)
    print(f"✅ 4. Prezzo UI aggiornato ({count} occorrenze trovate, sostituita la prima)")

with open(path, "w") as f:
    f.write(c)
print("\n🎉 BookingClient aggiornato")
