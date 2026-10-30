path = "app/dashboard/appuntamenti/page.tsx"
with open(path) as f:
    c = f.read()

# 1. Trova il blocco MODAL ASSEGNAZIONE (da "{/* MODAL ASSEGNAZIONE */}" fino a ")}" che chiude)
# Il blocco è fuori dal componente. Devo prenderlo e spostarlo.

# Cerco l'inizio del blocco fuori scope
start_marker = '{/* MODAL ASSEGNAZIONE */}'
start_idx = c.find(start_marker)
if start_idx == -1:
    print("FAIL 1: marker MODAL ASSEGNAZIONE non trovato")
    exit(1)

# Trovo la fine del blocco: cerco il pattern "{assigningFor && (" e poi mi fermo al primo ")}" a livello radice
# Più semplice: prendo fino al prossimo "// ── MODALE APPUNTAMENTO MANUALE ──"
end_marker = '// ── MODALE APPUNTAMENTO MANUALE ──'
end_idx = c.find(end_marker, start_idx)
if end_idx == -1:
    print("FAIL 2: marker MODALE APPUNTAMENTO MANUALE non trovato")
    exit(1)

# Estraggo il blocco (senza il marker di fine)
block = c[start_idx:end_idx].rstrip() + "\n\n      "

# Rimuovo il blocco dal posto sbagliato
c = c[:start_idx] + c[end_idx:]

# 2. Trovo il punto dove reinserirlo: prima di "</div>\n  );\n}" del componente principale
# Pattern: "      </AnimatePresence>\n    </div>\n  );\n}" (chiusura return componente)
insert_marker = "      </AnimatePresence>\n    </div>\n  );\n}"
insert_idx = c.find(insert_marker)
if insert_idx == -1:
    # Provo con varianti
    insert_marker = "    </div>\n  );\n}"
    insert_idx = c.find(insert_marker)
    if insert_idx == -1:
        print("FAIL 3: chiusura componente non trovata")
        exit(1)

# Inserisco il blocco PRIMA di "</div>" (dentro il return)
# Devo trovare il punto giusto: dopo "</AnimatePresence>" e prima di "</div>"
new_insert = block + "    </div>\n  );\n}"
c = c[:insert_idx] + new_insert + c[insert_idx + len(insert_marker):]

with open(path, "w") as f:
    f.write(c)
print("✅ Modal spostato dentro il componente")

# Verifica
with open(path) as f:
    verify = f.read()
if "{assigningFor && (" in verify:
    # Conta quante volte appare prima di "function ManualAppointmentModal"
    main_part = verify.split("function ManualAppointmentModal")[0]
    if "{assigningFor && (" in main_part:
        print("✅ Verifica: modal assegnazione è dentro il componente principale")
    else:
        print("⚠️  Verifica: modal ancora fuori scope")
