import re
path = "app/[slug]/page.tsx"
with open(path) as f:
    c = f.read()

# Rimuovi le occorrenze duplicate consecutive di webDiscountPercent
# (sia con spazi che senza)
pattern = re.compile(
    r'(\s*webDiscountPercent=\{tenant\.web_discount_enabled \? \(tenant\.web_discount_percent \|\| 0\) : 0\}\s*)(\s*webDiscountPercent=\{tenant\.web_discount_enabled \? \(tenant\.web_discount_percent \|\| 0\) : 0\}\s*)',
    re.MULTILINE
)
matches = pattern.findall(c)
if matches:
    c = pattern.sub(r'\1', c)
    print(f"✅ Rimossi {len(matches)} duplicati")
else:
    # Prova con varianti (a capo diverse)
    lines = c.split("\n")
    new_lines = []
    prev_was_duplicate = False
    count_removed = 0
    for line in lines:
        if "webDiscountPercent=" in line and prev_was_duplicate:
            count_removed += 1
            continue  # salta questa riga (duplicato)
        new_lines.append(line)
        prev_was_duplicate = "webDiscountPercent=" in line
    c = "\n".join(new_lines)
    if count_removed > 0:
        print(f"✅ Rimossi {count_removed} duplicati (line-by-line)")
    else:
        print("⚠️ Nessun duplicato trovato. Verifica manuale con sed.")

with open(path, "w") as f:
    f.write(c)
print("\n🎉 Fix completato")
