path = "app/dashboard/appuntamenti/page.tsx"
with open(path) as f:
    c = f.read()

# ============================================================
# 1. Aggiorna firma componente: aggiungi staffList props
# ============================================================
old_sig = 'function ManualAppointmentModal({ tenantId, onClose, onSaved, selectedDate }: { tenantId: string; onClose: () => void; onSaved: () => void; selectedDate: Date }) {'
new_sig = 'function ManualAppointmentModal({ tenantId, onClose, onSaved, selectedDate, staffList }: { tenantId: string; onClose: () => void; onSaved: () => void; selectedDate: Date; staffList: StaffMember[] }) {'

if old_sig not in c:
    print("FAIL 1: firma componente non trovata")
    exit(1)
c = c.replace(old_sig, new_sig, 1)
print("✅ 1. Firma componente aggiornata")

# ============================================================
# 2. Aggiungi staffId al form state
# ============================================================
old_form = '''    duration: 30,
    time: "10:00",
    notes: "",
    status: "confirmed",
  });'''
new_form = '''    duration: 30,
    time: "10:00",
    notes: "",
    status: "confirmed",
    staffId: "",
  });'''

if old_form not in c:
    print("FAIL 2: form state non trovato")
    exit(1)
if 'staffId: ""' not in c.split("const [form, setForm]")[1][:500]:
    c = c.replace(old_form, new_form, 1)
    print("✅ 2. staffId nel form state")

# ============================================================
# 3. Aggiungi staff_id all'insert
# ============================================================
old_insert = '''        service_id: form.serviceId || null,
        status: form.status,
        notes: form.notes || null,
      });'''
new_insert = '''        service_id: form.serviceId || null,
        staff_id: form.staffId || null,
        status: form.status,
        notes: form.notes || null,
      });'''

if old_insert not in c:
    print("FAIL 3: insert non trovato")
    exit(1)
if "staff_id: form.staffId" not in c:
    c = c.replace(old_insert, new_insert, 1)
    print("✅ 3. staff_id nell'insert")

with open(path, "w") as f:
    f.write(c)
print("\n🎉 Parte 2 completata (firma, state, insert)")
