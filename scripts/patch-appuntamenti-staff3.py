path = "app/dashboard/appuntamenti/page.tsx"
with open(path) as f:
    c = f.read()

# ============================================================
# 1. Inserisci la select "Operatore" dopo il blocco Servizio
# ============================================================
old_service = '''              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-black text-night/40 uppercase tracking-widest mb-2">Orario</p>'''

new_service = '''              </select>
            </div>

            {staffList.length > 0 && (
              <div>
                <p className="text-[10px] font-black text-night/40 uppercase tracking-widest mb-2">Operatore (opzionale)</p>
                <select
                  value={form.staffId}
                  onChange={(e) => setForm({ ...form, staffId: e.target.value })}
                  className="w-full bg-[#FAFAFA] border border-night/[0.08] rounded-xl px-4 py-3 text-sm font-bold focus:border-night/30 focus:outline-none"
                >
                  <option value="">Nessun operatore</option>
                  {staffList.filter(s => s.is_active).map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-black text-night/40 uppercase tracking-widest mb-2">Orario</p>'''

if old_service not in c:
    print("FAIL 1: blocco Servizio non trovato")
    exit(1)
if "Operatore (opzionale)" not in c:
    c = c.replace(old_service, new_service, 1)
    print("✅ 1. Select Operatore aggiunta al form")

# ============================================================
# 2. Card: icona colorata con colore staff (se presente)
# ============================================================
old_icon = '''                              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: config.accent + "15" }}>
                                <Scissors size={20} style={{ color: config.accent }} />
                              </div>'''

new_icon = '''                              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: (appointment.staff?.color || config.accent) + "15" }}>
                                <Scissors size={20} style={{ color: appointment.staff?.color || config.accent }} />
                              </div>'''

if old_icon not in c:
    print("FAIL 2: icona card non trovata")
    exit(1)
if "appointment.staff?.color || config.accent" not in c:
    c = c.replace(old_icon, new_icon, 1)
    print("✅ 2. Icona card colorata con staff")

# ============================================================
# 3. Card: badge con nome operatore
# ============================================================
old_badge = '''                                  {appointment.duration_minutes && (
                                    <span className="text-[10px] font-bold text-night/50 bg-cream px-2 py-0.5 rounded flex items-center gap-1">
                                      <Timer size={10} /> {appointment.duration_minutes} min
                                    </span>
                                  )}'''

new_badge = '''                                  {appointment.duration_minutes && (
                                    <span className="text-[10px] font-bold text-night/50 bg-cream px-2 py-0.5 rounded flex items-center gap-1">
                                      <Timer size={10} /> {appointment.duration_minutes} min
                                    </span>
                                  )}
                                  {appointment.staff && (
                                    <span
                                      className="text-[10px] font-black text-white px-2 py-0.5 rounded inline-flex items-center gap-1"
                                      style={{ backgroundColor: appointment.staff.color }}
                                    >
                                      <User size={10} /> {appointment.staff.name}
                                    </span>
                                  )}'''

if old_badge not in c:
    print("FAIL 3: badge duration non trovato")
    exit(1)
if "appointment.staff.name" not in c.split("appointment.staff &&")[1][:300] if "appointment.staff &&" in c else True:
    c = c.replace(old_badge, new_badge, 1)
    print("✅ 3. Badge operatore aggiunto alla card")

with open(path, "w") as f:
    f.write(c)
print("\n🎉 Parte 3 completata")
