path = "app/[slug]/MenuClient.tsx"
with open(path) as f:
    c = f.read()

# ============================================================
# 1. Aggiungi prop webDiscountPercent al type Props
# ============================================================
old_type = "  minOrderDelivery?: number;\n};"
new_type = "  minOrderDelivery?: number;\n  webDiscountPercent?: number;\n};"
if old_type not in c:
    print("FAIL 1: type Props non trovato"); exit(1)
if "webDiscountPercent?: number;" not in c:
    c = c.replace(old_type, new_type, 1)
    print("✅ 1. Prop webDiscountPercent aggiunta al type")

# ============================================================
# 2. Aggiungi alla destrutturazione
# ============================================================
old_destr = "  minOrderDelivery = 0,"
new_destr = "  minOrderDelivery = 0,\n  webDiscountPercent = 0,"
if old_destr not in c:
    print("FAIL 2: destrutturazione non trovata"); exit(1)
if "  webDiscountPercent = 0," not in c:
    c = c.replace(old_destr, new_destr, 1)
    print("✅ 2. Destrutturazione aggiornata")

# ============================================================
# 3. Ricalcola cartTotal con sconto
# ============================================================
old_calc = """  const cartSubtotal = cartItems.reduce((sum, i) => sum + i.qty * Number(i.service.price), 0);
  const deliveryCost = orderType === "delivery" ? deliveryFee : 0;
  const cartTotal = cartSubtotal + deliveryCost;"""
new_calc = """  const cartSubtotal = cartItems.reduce((sum, i) => sum + i.qty * Number(i.service.price), 0);
  const deliveryCost = orderType === "delivery" ? deliveryFee : 0;
  const webDiscountEnabled = webDiscountPercent > 0;
  const webDiscountAmount = webDiscountEnabled ? (cartSubtotal * webDiscountPercent / 100) : 0;
  const cartTotalBeforeDiscount = cartSubtotal + deliveryCost;
  const cartTotal = cartTotalBeforeDiscount - webDiscountAmount;"""
if old_calc not in c:
    print("FAIL 3: calcolo totale non trovato"); exit(1)
if "webDiscountAmount" not in c:
    c = c.replace(old_calc, new_calc, 1)
    print("✅ 3. Totale ricalcolato con sconto")

# ============================================================
# 4. Banner sconto in cima al carrello
# ============================================================
# Marker univoco: la coppia <div className="p-5"> + <div className="space-y-3 mb-6">
old_banner = """              <div className="p-5">
                <div className="space-y-3 mb-6">"""
new_banner = """              <div className="p-5">
                {webDiscountEnabled && cartCount > 0 && (
                  <div className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl p-4 mb-4 flex items-center gap-3 shadow-lg shadow-emerald-500/20">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <span className="text-xl">🎁</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-black text-sm">Risparmia il {webDiscountPercent}%!</p>
                      <p className="text-white/80 text-xs mt-0.5">Sconto applicato automaticamente al totale</p>
                    </div>
                  </div>
                )}
                <div className="space-y-3 mb-6">"""
if old_banner not in c:
    print("FAIL 4: marker carrello non trovato"); exit(1)
if "Risparmia il {webDiscountPercent}%!" not in c:
    c = c.replace(old_banner, new_banner, 1)
    print("✅ 4. Banner sconto aggiunto al carrello")

# ============================================================
# 5. Riga sconto + totale barrato nel riepilogo
# ============================================================
old_summary = """                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <span className="font-bold text-night">{t.total}</span>
                    <span className="font-bold text-night text-2xl">€{cartTotal.toFixed(2)}</span>
                  </div>"""
new_summary = """                  {webDiscountEnabled && (
                    <div className="flex justify-between items-center text-sm bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl px-3 py-2.5 -mx-1 border border-emerald-100">
                      <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                        🎁 Sconto web ({webDiscountPercent}%)
                      </span>
                      <span className="font-black text-emerald-700">-€{webDiscountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <span className="font-bold text-night">{t.total}</span>
                    <div className="text-right">
                      {webDiscountEnabled && (
                        <div className="text-xs text-gray-400 line-through">€{cartTotalBeforeDiscount.toFixed(2)}</div>
                      )}
                      <span className="font-bold text-night text-2xl">€{cartTotal.toFixed(2)}</span>
                    </div>
                  </div>"""
if old_summary not in c:
    print("FAIL 5: riepilogo non trovato"); exit(1)
if "Sconto web (" not in c:
    c = c.replace(old_summary, new_summary, 1)
    print("✅ 5. Riga sconto e totale barrato aggiunti")

with open(path, "w") as f:
    f.write(c)

print("\n🎉 MenuClient: tutte le modifiche completate")
