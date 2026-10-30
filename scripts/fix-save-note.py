path = "app/dashboard/clienti/[id]/page.tsx"
with open(path) as f:
    c = f.read()

# 1. Aggiungi state saved dopo savingNote
old_state = "  const [savingNote, setSavingNote] = useState(false);"
new_state = "  const [savingNote, setSavingNote] = useState(false);\n  const [saved, setSaved] = useState(false);"
if old_state not in c:
    print("FAIL 1: state non trovato"); exit(1)
if "const [saved, setSaved]" not in c:
    c = c.replace(old_state, new_state, 1)
    print("✅ 1. State saved aggiunto")

# 2. Rimuovi la manipolazione DOM e usa setSaved
old_save = '''    setSavingNote(false);
    if (error) alert("Errore: " + error.message);
    else {
      // Feedback visivo
      const btn = document.getElementById("save-note-btn");
      if (btn) {
        btn.textContent = "✓ Salvato";
        setTimeout(() => { if (btn) btn.textContent = "Salva note"; }, 2000);
      }
    }
  };'''
new_save = '''    setSavingNote(false);
    if (error) alert("Errore: " + error.message);
    else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };'''
if old_save not in c:
    print("FAIL 2: blocco saveNote non trovato"); exit(1)
c = c.replace(old_save, new_save, 1)
print("✅ 2. Rimosso getElementById, uso setSaved")

# 3. Riscrivi il bottone per usare lo state
old_btn = '''            <button
              id="save-note-btn"
              onClick={saveNote}
              disabled={savingNote}
              className="inline-flex items-center gap-2 bg-wa hover:bg-waDark disabled:opacity-50 text-white px-6 py-3 rounded-full text-sm font-bold transition"
            >
              {savingNote ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Salva note
            </button>'''
new_btn = '''            <button
              onClick={saveNote}
              disabled={savingNote || saved}
              className={`inline-flex items-center gap-2 text-white px-6 py-3 rounded-full text-sm font-bold transition disabled:opacity-80 ${saved ? "bg-emerald-500" : "bg-wa hover:bg-waDark"}`}
            >
              {savingNote ? (
                <><Loader2 size={14} className="animate-spin" /> Salvataggio...</>
              ) : saved ? (
                <><CheckCircle2 size={14} /> Salvato!</>
              ) : (
                <><Save size={14} /> Salva note</>
              )}
            </button>'''
if old_btn not in c:
    print("FAIL 3: bottone non trovato"); exit(1)
c = c.replace(old_btn, new_btn, 1)
print("✅ 3. Bottone ora usa lo state")

# 4. Fix icona condizionale nel header (key per evitare removeChild)
old_icon = '{hasClientNotes ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Lock size={18} className="text-amber-500" />}'
new_icon = '{hasClientNotes ? <CheckCircle2 key="ok" size={18} className="text-emerald-500" /> : <Lock key="lock" size={18} className="text-amber-500" />}'
if old_icon not in c:
    print("FAIL 4: icona header non trovata"); exit(1)
c = c.replace(old_icon, new_icon, 1)
print("✅ 4. Key aggiunte alle icone condizionali")

with open(path, "w") as f:
    f.write(c)
print("\n🎉 Fatto - ora React non si arrabbia più")
