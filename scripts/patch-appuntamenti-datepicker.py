path = "app/dashboard/appuntamenti/page.tsx"
with open(path) as f:
    c = f.read()

# ============================================================
# 1. Rendi dateStrip dinamico intorno a selectedDate
# ============================================================
old_strip = '''  const dateStrip = useMemo(() => {
    const days = [];
    for (let i = -2; i < 12; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  }, []);'''

new_strip = '''  const dateStrip = useMemo(() => {
    const days = [];
    // Rigenera 14 giorni intorno alla data selezionata
    for (let i = -2; i < 12; i++) {
      const d = new Date(selectedDate);
      d.setDate(selectedDate.getDate() + i);
      days.push(d);
    }
    return days;
  }, [selectedDate]);'''

if old_strip not in c:
    print("FAIL 1: dateStrip non trovato")
    exit(1)
c = c.replace(old_strip, new_strip, 1)
print("✅ 1. dateStrip ora dinamico su selectedDate")

# ============================================================
# 2. Aggiungi header con bottone "Oggi" + input date
# ============================================================
old_header = '''      {/* DATE PICKER */}
      <div className="px-4 sm:px-6 lg:px-8 mb-6">
        <div className="bg-white rounded-3xl p-3 border border-night/[0.06] shadow-sm">
          <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar snap-x px-1">'''

new_header = '''      {/* DATE PICKER */}
      <div className="px-4 sm:px-6 lg:px-8 mb-6">
        <div className="bg-white rounded-3xl p-3 border border-night/[0.06] shadow-sm">
          {/* Header: oggi + date picker */}
          <div className="flex items-center justify-between gap-2 mb-2 px-1">
            <button
              onClick={() => setSelectedDate(new Date())}
              className={`px-3 py-1.5 rounded-full text-xs font-black transition ${
                selectedDate.toDateString() === new Date().toDateString()
                  ? "bg-night text-white"
                  : "bg-cream text-night/60 hover:bg-cream/70"
              }`}
            >
              Oggi
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-night/40 uppercase tracking-widest">
                Vai a
              </span>
              <input
                type="date"
                value={selectedDate.toISOString().split("T")[0]}
                onChange={(e) => {
                  if (e.target.value) {
                    const [y, m, d] = e.target.value.split("-").map(Number);
                    setSelectedDate(new Date(y, m - 1, d));
                  }
                }}
                className="bg-cream border border-night/[0.06] rounded-lg px-2.5 py-1.5 text-xs font-bold text-night focus:outline-none focus:border-night/20"
              />
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar snap-x px-1">'''

if old_header not in c:
    print("FAIL 2: date picker header non trovato")
    exit(1)
if "Vai a" not in c:
    c = c.replace(old_header, new_header, 1)
    print("✅ 2. Header con data picker aggiunto")

with open(path, "w") as f:
    f.write(c)
print("\n🎉 Fatto")
