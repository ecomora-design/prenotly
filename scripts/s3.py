path = "app/dashboard/appuntamenti/page.tsx"
with open(path) as f:
    c = f.read()
old = '''                                  {appointment.staff && (
                                    <span
                                      className="text-[10px] font-black text-white px-2 py-0.5 rounded inline-flex items-center gap-1"
                                      style={{ backgroundColor: appointment.staff.color }}
                                    >
                                      <User size={10} /> {appointment.staff.name}
                                    </span>
                                  )}'''
new = '''                                  {appointment.staff ? (
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
if old not in c:
    print("FAIL: badge operatore non trovato")
    exit(1)
if "Assegna</button>" in c.replace(" ", "").replace("\n",""):
    print("→ già presente")
    exit(0)
c = c.replace(old, new, 1)
with open(path, "w") as f:
    f.write(c)
print("✅ Step 3: bottone Assegna aggiunto")
