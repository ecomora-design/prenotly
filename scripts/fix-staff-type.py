path = "app/dashboard/staff/page.tsx"
with open(path) as f:
    c = f.read()

old = 'type Staff = { id: string; name: string; role: string | null; color: string; is_active: boolean; sort_order: number; };'
new = 'type Staff = { id: string; name: string; role: string | null; color: string; is_active: boolean; sort_order: number; email: string | null; user_id: string | null; };'

if old not in c:
    print("FAIL: tipo Staff non trovato")
    exit(1)
if "email: string | null" in c and "user_id: string | null" in c:
    print("→ già presente")
    exit(0)

c = c.replace(old, new, 1)
with open(path, "w") as f:
    f.write(c)
print("✅ Tipo Staff aggiornato (email + user_id)")
