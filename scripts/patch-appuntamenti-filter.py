path = "app/dashboard/appuntamenti/page.tsx"
with open(path) as f:
    c = f.read()

# ============================================================
# 1. Aggiungi state staffFilter (dopo staffList)
# ============================================================
old_state = '  const [staffList, setStaffList] = useState<StaffMember[]>([]);'
new_state = '  const [staffList, setStaffList] = useState<StaffMember[]>([]);\n  const [staffFilter, setStaffFilter] = useState<string>("all");'

if old_state not in c:
    print("FAIL 1: staffList state non trovato")
    exit(1)
if "staffFilter" not in c.split("staffList")[1][:300]:
    c = c.replace(old_state, new_state, 1)
    print("✅ 1. State staffFilter aggiunto")

# ============================================================
# 2. Filtra dailyAppointments per operatore
# ============================================================
old_filter = '''  const selectedDateStr = selectedDate.toISOString().split("T")[0];
  const dailyAppointments = appointments.filter(
    (a) => a.scheduled_at.split("T")[0] === selectedDateStr
  );'''

new_filter = '''  const selectedDateStr = selectedDate.toISOString().split("T")[0];
  const dailyAppointments = appointments.filter((a) => {
    if (a.scheduled_at.split("T")[0] !== selectedDateStr) return false;
    if (staffFilter !== "all") {
      if (staffFilter === "none") {
        if (a.staff_id !== null) return false;
      } else {
        if (a.staff_id !== staffFilter) return false;
      }
    }
    return true;
  });'''

if old_filter not in c:
    print("FAIL 2: dailyAppointments non trovato")
    exit(1)
if "staffFilter === \"none\"" not in c:
    c = c.replace(old_filter, new_filter, 1)
    print("✅ 2. Filtro applicato a dailyAppointments")

# ============================================================
# 3. Aggiungi UI filtro operatori sopra la timeline
# ============================================================
# Cerco l'inizio della sezione TIMELINE
old_timeline = '''      {/* TIMELINE */}
      <div className="px-4 sm:px-6 lg:px-8">
        {sortedTimes.length === 0 ? ('''

new_timeline = '''      {/* FILTRO OPERATORI */}
      {staffList.length > 0 && (
        <div className="px-4 sm:px-6 lg:px-8 mb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-1 px-1 hide-scrollbar">
            <button
              onClick={() => setStaffFilter("all")}
              className={`px-4 py-2 rounded-full text-xs font-black whitespace-nowrap transition shrink-0 ${
                staffFilter === "all"
                  ? "bg-night text-white shadow-md"
                  : "bg-white text-night/60 hover:bg-cream border border-night/[0.06]"
              }`}
            >
              Tutti
            </button>
            {staffList.filter(s => s.is_active).map(s => (
              <button
                key={s.id}
                onClick={() => setStaffFilter(s.id)}
                className={`px-4 py-2 rounded-full text-xs font-black whitespace-nowrap transition shrink-0 flex items-center gap-2 ${
                  staffFilter === s.id
                    ? "text-white shadow-md"
                    : "bg-white text-night/70 hover:bg-cream border border-night/[0.06]"
                }`}
                style={staffFilter === s.id ? { backgroundColor: s.color } : {}}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: s.color }}
                />
                {s.name}
              </button>
            ))}
            <button
              onClick={() => setStaffFilter("none")}
              className={`px-4 py-2 rounded-full text-xs font-black whitespace-nowrap transition shrink-0 ${
                staffFilter === "none"
                  ? "bg-night text-white shadow-md"
                  : "bg-white text-night/60 hover:bg-cream border border-night/[0.06]"
              }`}
            >
              Senza operatore
            </button>
          </div>
        </div>
      )}

      {/* TIMELINE */}
      <div className="px-4 sm:px-6 lg:px-8">
        {sortedTimes.length === 0 ? ('''

if old_timeline not in c:
    print("FAIL 3: timeline section non trovata")
    exit(1)
if "FILTRO OPERATORI" not in c:
    c = c.replace(old_timeline, new_timeline, 1)
    print("✅ 3. UI filtro operatori aggiunta")

with open(path, "w") as f:
    f.write(c)
print("\n🎉 Fatto")
