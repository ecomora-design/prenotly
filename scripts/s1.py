path = "app/dashboard/appuntamenti/page.tsx"
with open(path) as f:
    c = f.read()
old = '  const [staffFilter, setStaffFilter] = useState<string>("all");'
new = old + '\n  const [assigningFor, setAssigningFor] = useState<string | null>(null);'
if old not in c:
    print("FAIL: staffFilter non trovato")
    exit(1)
if "assigningFor" in c:
    print("→ già presente")
    exit(0)
c = c.replace(old, new, 1)
with open(path, "w") as f:
    f.write(c)
print("✅ Step 1: assigningFor aggiunto")
