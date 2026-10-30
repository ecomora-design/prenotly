path = "app/dashboard/appuntamenti/page.tsx"
with open(path) as f:
    c = f.read()
old = '''  const updateStatus = async (id: string, status: string) => {
    await supabase.from("bookings").update({ status }).eq("id", id);
    await load(false);
  };'''
new = old + '''

  const assignStaff = async (appointmentId: string, staffId: string | null) => {
    const { error } = await supabase.from("bookings").update({ staff_id: staffId }).eq("id", appointmentId);
    if (error) { alert("Errore: " + error.message); return; }
    setAssigningFor(null);
    await load(false);
  };'''
if old not in c:
    print("FAIL: updateStatus non trovato")
    exit(1)
if "const assignStaff" in c:
    print("→ già presente")
    exit(0)
c = c.replace(old, new, 1)
with open(path, "w") as f:
    f.write(c)
print("✅ Step 2: assignStaff aggiunto")
