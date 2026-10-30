path = "app/dashboard/impostazioni/page.tsx"
with open(path) as f:
    c = f.read()

# 1. Import Gift
if "\n  Gift," not in c:
    lucide_pos = c.find('from "lucide-react"')
    brace_pos = c.rfind("{", 0, lucide_pos)
    c = c[:brace_pos+1] + "\n  Gift," + c[brace_pos+1:]
    print("✅ 1. Gift importato")
else:
    print("→ 1. Gift già presente")

# 2. Type Tenant
if "web_discount_enabled:" not in c:
    c = c.replace("  has_delivery: boolean | null;", "  has_delivery: boolean | null;\n  web_discount_enabled: boolean | null;\n  web_discount_percent: number | null;", 1)
    print("✅ 2. Type aggiornato")
else:
    print("→ 2. Type già aggiornato")

# 3. Form iniziale
if "web_discount_enabled: false," not in c:
    c = c.replace("    has_delivery: true,", "    has_delivery: true,\n    web_discount_enabled: false,\n    web_discount_percent: 0,", 1)
    print("✅ 3. Form iniziale")
else:
    print("→ 3. Form già aggiornato")

# 4. Popolamento
if "web_discount_enabled: t.web_discount_enabled" not in c:
    c = c.replace("        has_delivery: t.has_delivery ?? true,", "        has_delivery: t.has_delivery ?? true,\n        web_discount_enabled: t.web_discount_enabled ?? false,\n        web_discount_percent: t.web_discount_percent || 0,", 1)
    print("✅ 4. Popolamento")
else:
    print("→ 4. Popolamento già presente")

# 5. Salvataggio
if "web_discount_enabled: form.web_discount_enabled," not in c:
    c = c.replace("        has_delivery: form.has_delivery,", "        has_delivery: form.has_delivery,\n        web_discount_enabled: form.web_discount_enabled,\n        web_discount_percent: form.web_discount_enabled ? (Number(form.web_discount_percent) || 0) : 0,", 1)
    print("✅ 5. Salvataggio")
else:
    print("→ 5. Salvataggio già presente")

# 6. UI
if "SCONTO PRENOTAZIONE WEB" not in c:
    marker = "        {/* TURNI PRENOTAZIONE */}"
    if marker not in c:
        print("FAIL 6: marker UI non trovato"); exit(1)
    ui = '''        {/* SCONTO PRENOTAZIONE WEB */}
        <Section
          icon={Gift}
          title="Sconto prenotazione web"
          subtitle="Incentiva i clienti a prenotare dalla web app"
        >
          <div className="flex items-center justify-between p-4 rounded-2xl bg-cream mb-4">
            <div>
              <p className="font-semibold text-night text-sm">Attiva sconto</p>
              <p className="text-xs text-night/50 mt-1">Banner + sconto su carrello o prenotazione</p>
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, web_discount_enabled: !form.web_discount_enabled })}
              className={`w-12 h-6 rounded-full transition relative shrink-0 ${form.web_discount_enabled ? "bg-wa" : "bg-gray-300"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${form.web_discount_enabled ? "left-6" : "left-0.5"}`} />
            </button>
          </div>
          {form.web_discount_enabled && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-100">
              <label className="block">
                <span className="text-sm font-semibold text-night mb-2 block">Percentuale sconto (1-30%)</span>
                <div className="flex items-center gap-3">
                  <input
                    type="number" min={1} max={30}
                    value={form.web_discount_percent}
                    onChange={(e) => setForm({ ...form, web_discount_percent: Number(e.target.value) })}
                    className="w-24 bg-white border border-emerald-200 rounded-xl px-4 py-3 text-lg font-black text-center focus:border-wa focus:outline-none transition"
                  />
                  <span className="text-2xl font-black text-night/40">%</span>
                </div>
              </label>
              <p className="text-xs text-emerald-700 mt-3">💡 I clienti vedranno: <strong>Risparmia il {form.web_discount_percent || 0}%</strong></p>
            </div>
          )}
        </Section>

'''
    c = c.replace(marker, ui + marker, 1)
    print("✅ 6. UI inserita")
else:
    print("→ 6. UI già presente")

with open(path, "w") as f:
    f.write(c)
print("\n🎉 Fatto")
