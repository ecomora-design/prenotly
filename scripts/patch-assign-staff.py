path = "app/dashboard/appuntamenti/page.tsx"
with open(path) as f:
    c = f.read()

# 1. State assigningFor
old_state = '  const [staffFilter, setStaffFilter] = useState<string>("all");'
new_state = '  const [staffFilter, setStaffFilter] = useState<string>("all");\n  const [assigningFor, setAssigningFor] = useState<string | null>(null);'

if old_state not in c:
    print("FAIL 1: staffFilter state non trovato")
    exit(1)
if "assigningFor" not in c:
    c = c.replace(old_state, new_state, 1)
    print("✅ 1. State assigningFor")

# 2. Funzione assignStaff dopo updateStatus
import re
match = re.search(r'(const updateStatus = async[^\n]*\{[^}]*?\};)', c, re.DOTALL)
if not match:
    print("FAIL 2: updateStatus non trovato")
    exit(1)

assign_fn = '''

  const assignStaff = async (appointmentId: string, staffId: string | null) => {
    const { error } = await supabase.from("bookings").update({ staff_id: staffId }).eq("id", appointmentId);
    if (error) { alert("Errore: " + error.message); return; }
    setAssigningFor(null);
    await load(false);
  };'''

c = c[:match.end()] + assign_fn + c[match.end():]
print("✅ 2. Funzione assignStaff")

# 3. Sostituisci badge operatore con bottone cliccabile / "Assegna"
old_badge = '''                                  {appointment.staff && (
                                    <span
                                      className="text-[10px] font-black text-white px-2 py-0.5 rounded inline-flex items-center gap-1"
                                      style={{ backgroundColor: appointment.staff.color }}
                                    >
                                      <User size={10} /> {appointment.staff.name}
                                    </span>
                                  )}'''

new_badge = '''                                  {appointment.staff ? (
                                    <button
                                      onClick={() => setAssigningFor(appointment.id)}
                                      className="text-[10px] font-black text-white px-2 py-0.5 rounded inline-flex items-center gap-1 hover:opacity-80 transition"
                                      style={{ backgroundColor: appointment.staff.color }}
                                      title="Clicca per riassegnare"
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

if old_badge not in c:
    print("FAIL 3: badge operatore non trovato")
    exit(1)
if "Clicca per riassegnare" not in c:
    c = c.replace(old_badge, new_badge, 1)
    print("✅ 3. Bottone Assegna / Badge cliccabile")

# 4. Modal assegnazione prima del "// ── MODALE APPUNTAMENTO MANUALE ──"
old_end = '// ── MODALE APPUNTAMENTO MANUALE ──'

new_end = '''{/* MODAL ASSEGNAZIONE OPERATORE */}
      {assigningFor && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setAssigningFor(null)}>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
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
          </motion.div>
        </div>
      )}

      {/* MODALE APPUNTAMENTO MANUALE */}'''

if old_end not in c:
    print("FAIL 4: marker modale manuale non trovato")
    exit(1)
if "MODAL ASSEGNAZIONE OPERATORE" not in c:
    c = c.replace(old_end, new_end, 1)
    print("✅ 4. Modal assegnazione")

with open(path, "w") as f:
    f.write(c)
print("\n🎉 Fatto")
