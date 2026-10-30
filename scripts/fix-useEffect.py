path = "app/[slug]/BookingClient.tsx"
with open(path) as f:
    c = f.read()

# Cerca l'import di React/useState
import re
# 1. Pattern: import { useState, useMemo } from "react";
m = re.search(r'import\s*\{([^}]+)\}\s*from\s*["\']react["\']', c)
if not m:
    print("FAIL: import react non trovato")
    exit(1)

imports = m.group(1)
if "useEffect" in imports:
    print("→ useEffect già importato")
    exit(0)

# Aggiungi useEffect
new_imports = imports.rstrip() + ", useEffect" if not imports.rstrip().endswith(",") else imports.rstrip() + " useEffect"
c = c[:m.start(1)] + new_imports + c[m.end(1):]

with open(path, "w") as f:
    f.write(c)
print("✅ useEffect aggiunto agli import")
