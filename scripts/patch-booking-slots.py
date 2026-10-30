path = "app/[slug]/BookingClient.tsx"
with open(path) as f:
    c = f.read()

# 1. Aggiungi state per slot occupati + capacità
old_state = '  const [selectedTime, setSelectedTime] = useState<string | null>(null);'
new_state = '''  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [occupiedSlots, setOccupiedSlots] = useState<Record<string, number>>({});
  const [capacity, setCapacity] = useState<number>(1);'''

if old_state not in c:
    print("FAIL 1: state selectedTime non trovato")
    exit(1)
if "occupiedSlots" not in c:
    c = c.replace(old_state, new_state, 1)
    print("✅ 1. State slot occupati")

# 2. Aggiungi useEffect che carica gli slot quando cambia la data
# Cerco un punto stabile: subito prima di "return (" principale
# Uso una funzione helper isSlotFull
old_helpers = '  const groupedSlots = useMemo(() => {'
new_helpers = '''  const isSlotFull = (time: string) => (occupiedSlots[time] || 0) >= capacity;

  useEffect(() => {
    if (!selectedDate) return;
    const dateStr = new Date(selectedDate).toISOString().split("T")[0];
    fetch(`/api/bookings/slots-availability?slug=${encodeURIComponent(slug)}&date=${dateStr}`)
      .then(r => r.json())
      .then(data => {
        setOccupiedSlots(data.occupied || {});
        setCapacity(data.capacity || 1);
        // Se lo slot selezionato è diventato pieno, deseleziona
        setSelectedTime(prev => {
          if (prev && (data.occupied?.[prev] || 0) >= (data.capacity || 1)) return null;
          return prev;
        });
      })
      .catch(() => {});
  }, [selectedDate, slug]);

  const groupedSlots = useMemo(() => {'''

if old_helpers not in c:
    print("FAIL 2: groupedSlots non trovato")
    exit(1)
if "isSlotFull" not in c:
    c = c.replace(old_helpers, new_helpers, 1)
    print("✅ 2. Load slot occupati")

# 3. Modifica il rendering dei bottoni
old_btn = '''                          {group.slots.map((time) => {
                            const isSelected = selectedTime === time;
                            return (
                              <button
                                key={time}
                                onClick={() => setSelectedTime(time)}
                                className={`py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${
                                  isSelected 
                                    ? "text-white shadow-md border-transparent" 
                                    : "bg-white border-night/[0.06] text-night hover:border-night/20"
                                }`}
                                style={isSelected ? { backgroundColor: brandColor } : undefined}
                              >
                                {time}
                              </button>
                            );
                          })}'''

new_btn = '''                          {group.slots.map((time) => {
                            const isSelected = selectedTime === time;
                            const isFull = isSlotFull(time);
                            return (
                              <button
                                key={time}
                                onClick={() => !isFull && setSelectedTime(time)}
                                disabled={isFull}
                                className={`py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${
                                  isFull
                                    ? "bg-night/5 border-night/[0.06] text-night/25 cursor-not-allowed line-through"
                                    : isSelected 
                                      ? "text-white shadow-md border-transparent" 
                                      : "bg-white border-night/[0.06] text-night hover:border-night/20"
                                }`}
                                style={isSelected && !isFull ? { backgroundColor: brandColor } : undefined}
                                title={isFull ? "Orario non disponibile" : undefined}
                              >
                                {time}
                              </button>
                            );
                          })}'''

if old_btn not in c:
    print("FAIL 3: bottoni slot non trovati")
    exit(1)
if "isSlotFull(time)" not in c:
    c = c.replace(old_btn, new_btn, 1)
    print("✅ 3. Bottoni disabilitati se pieni")

with open(path, "w") as f:
    f.write(c)
print("\n🎉 Fatto")
