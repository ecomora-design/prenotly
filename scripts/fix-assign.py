path = "app/dashboard/appuntamenti/page.tsx"
with open(path) as f:
    c = f.read()
changed = 0

# ============================================================
# MODIFICA 1: State assigningFor
# ============================================================
old1 = '  const [staffFilter, setStaffFilter] = useState<string>("all");'
new1 = old1 + '\n  const [assigningFor, setAssigningFor] = useState<string | null>(null);'
if old1 in c and "assigningFor" not in c:
    c = c.replace(old1, new1, 1)
    changed += 1
    print("✅ 1. State assigningFor")

# ============================================================
# MODIFICA 2: Funzione assignStaff (dopo updateStatus)
# ============================================================
import re
m = re.search(r'(const updateStatus = async[^\n]*\{[^}]*?\};)', c, re.DOTALL)
if m and "const assignStaff" not in c:
    fn = '''

  const assignStaff = async (appointmentId: string, staffId: string | null) => {
    const { error } = await supabase.from("bookings").update({ staff_id: staffId }).eq("id", appointmentId);
    if (error) { alert("Errore: " + error.message); return; }
    setAssigningFor(null);
    await load(false);
  };'''
    c = c[:m.end()] + fn + c[m.end():]
    changed += 1
    print("✅ 2. Funzione assignStaff")

# ============================================================
# MODIFICA 3: Sostituisci il badge operatore
# ============================================================
old3 = '''                                  {appointment.staff && (
                                    <span
                                      className="text-[10px] font-black text-white px-2 py-0.5 rounded inline-flex items-center gap-1"
                                      style={{ backgroundColor: appointment.staff.color }}
                                    >
                                      <User size={10} /> {appointment.staff.name}
                                    </span>
                                  )}'''

new3 = '''                                  {appointment.staff ? (
                                    <button
                                      onClick={() => setAssigningFor(appointment.id)}
                                      className="text-[10px] font-black text-white px-2 py-0.5 rounded inline-flex items-center gap-1 hover:opacity-80 transition"
                                      style={{ backgroundColor: appointment.staff.color }}
                                      title="Riassegna"
                                    >
                                      <User size={10} /> {appointment.staff.name}
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => setAssigningFor(appointment.id)}
                                      className="text-[10px] font-black text-violet-700 bg-violet-100 hover:bg-violet-200 px-2 py-0.5 rounded inline-flex items-center gap-1 transition"
                                    >
                                      <User size={10} /> Assegna
                                    </button>
                                  )}'''

if old3 in c and "Assegna" not in c.split("appointment.staff ?")[1][:200] if "appointment.staff ?" in c else True:
    c = c.replace(old3, new3, 1)
    changed += 1
    print("✅ 3. Bottone Assegna / Badge cliccabile")

# ============================================================
# MODIFICA 4: Modal assegnazione (prima di "MODALE APPUNTAMENTO MANUALE")
# ============================================================
marker = '// ── MODALE APPUNTAMENTO MANUALE ──'
modal = '''{/* MODAL ASSEGNAZIONE */}
      {assigningFor && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setAssigningFor(null)}>
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-night">Assegna operatore</h3>
              <button onClick={() => setAssigningFor(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={18} className="text-gray-400" />
              </button>
            </div>
            <div className="space-y-2">
              {staffList.filter(s => s.is_active).map(s => (
                <button
                  key={s.id}
                  onClick={() => assignStaff(assigningFor, s.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-cream transition text-left"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0" style={{ backgroundColor: s.color }}>
                    {s.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-night text-sm">{s.name}</p>
                    <p className="text-[11px] text-gray-500">{s.role || "Operatore"}</p>
                  </div>
                </button>
              ))}
              <button
                onClick={() => assignStaff(assigningFor, null)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 transition text-left border-t border-gray-100 mt-2 pt-3"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 text-gray-400 shrink-0">
                  <X size={18} />
                </div>
                <div>
                  <p className="font-bold text-night text-sm">Rimuovi assegnazione</p>
                  <p className="text-[11px] text-gray-500">Nessun operatore</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      '''
if marker in c and "MODAL ASSEGNAZIONE" not in c:
    c = c.replace(marker, modal + marker, 1)
    changed += 1
    print("✅ 4. Modal assegnazione")

if changed > 0:
    with open(path, "w") as f:
        f.write(c)
    print(f"\n🎉 Salvato con {changed} modifiche")
else:
    print("\n⚠️  Nessuna modifica applicata. Il file potrebbe avere una struttura diversa.")
