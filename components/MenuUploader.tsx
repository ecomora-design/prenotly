"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Upload, Loader2, CheckCircle2, X, Sparkles,
  FileText, Trash2, Plus, AlertCircle, RefreshCw,
  ImagePlus,
} from "lucide-react";

type ExtractedItem = {
  name: string;
  description?: string;
  category?: string;
  price: number;
  duration_minutes?: number;
};

type Props = {
  tenantId: string;
  businessType: "food" | "services";
  onComplete: () => void;
  onCancel: () => void;
};

export default function MenuUploader({ tenantId, businessType, onComplete, onCancel }: Props) {
  const supabase = createClient();

  const [step, setStep] = useState<"upload" | "review" | "saving">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ExtractedItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<Record<number, string>>({});
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const isFood = businessType === "food";

  const handleFile = (f: File) => {
    setError(null);
    if (f.size > 10 * 1024 * 1024) { setError("File troppo grande. Max 10MB."); return; }
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg", "application/pdf"];
    if (!validTypes.includes(f.type)) { setError("Formato non supportato. Usa JPG, PNG, WEBP o PDF."); return; }
    setFile(f);
    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(f);
    } else { setPreview(null); }
  };

  const handleExtract = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("businessType", businessType);
      const res = await fetch("/api/menu/extract", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Errore durante l'analisi"); setLoading(false); return; }
      setItems(data.items || []);
      setStep("review");
      setLoading(false);
      if ("vibrate" in navigator) navigator.vibrate(30);
    } catch (err) {
      console.error(err);
      setError("Errore di connessione. Riprova.");
      setLoading(false);
    }
  };

  const updateItem = (index: number, field: keyof ExtractedItem, value: any) => {
    setItems((prev) => { const copy = [...prev]; copy[index] = { ...copy[index], [field]: value }; return copy; });
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
    setImageUrls((prev) => { const copy = { ...prev }; delete copy[index]; return copy; });
  };

  const addItem = () => {
    setItems((prev) => [...prev, { name: "", description: "", category: "", price: 0, duration_minutes: isFood ? undefined : 30 }]);
  };

  // Upload foto manuale per il singolo item
  const handleImageUpload = async (index: number, f: File) => {
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setError("Foto troppo grande. Max 5MB."); return; }
    if (!f.type.startsWith("image/")) { setError("Deve essere un'immagine."); return; }

    setUploadingIndex(index);
    setError(null);

    try {
      const ext = f.name.split(".").pop() || "jpg";
      const fileName = `${tenantId}/services/${Date.now()}-${index}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("tenant-assets")
        .upload(fileName, f, { cacheControl: "3600", upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("tenant-assets")
        .getPublicUrl(fileName);

      setImageUrls((prev) => ({ ...prev, [index]: urlData.publicUrl }));
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Errore upload");
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleSaveAll = async () => {
    const validItems = items.filter((i) => i.name && i.name.trim());
    if (validItems.length === 0) { setError("Aggiungi almeno un elemento con nome."); return; }

    setStep("saving");
    setError(null);

    const { count } = await supabase.from("services").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId);
    const startOrder = (count || 0) + 1;

    const toInsert = validItems.map((i, idx) => {
      const originalIndex = items.indexOf(i);
      return {
        tenant_id: tenantId,
        name: i.name.trim(),
        description: i.description?.trim() || null,
        category: i.category?.trim() || null,
        price: Number(i.price) || 0,
        duration_minutes: i.duration_minutes ? Number(i.duration_minutes) : null,
        image_url: imageUrls[originalIndex] || null,
        is_available: true,
        sort_order: startOrder + idx,
      };
    });

    const { error: insertError } = await supabase.from("services").insert(toInsert);
    if (insertError) { setError(insertError.message); setStep("review"); return; }

    if ("vibrate" in navigator) navigator.vibrate([10, 30, 10]);
    onComplete();
  };

  // ═══════════ UPLOAD FILE MENU ═══════════
  if (step === "upload") {
    return (
      <div className="space-y-5">
        <div className="bg-white rounded-2xl border border-night/[0.06] p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-wa to-waDark flex items-center justify-center shrink-0 shadow-lg shadow-wa/30">
              <Sparkles size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-night">Carica il tuo {isFood ? "menu" : "listino servizi"}</h2>
              <p className="text-xs text-night/50">Foto o PDF → l&apos;AI lo legge e crea tutto in automatico</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm mb-4 flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" /><span>{error}</span>
            </div>
          )}

          {!file ? (
            <label className="block cursor-pointer">
              <div className="border-2 border-dashed border-night/10 hover:border-wa rounded-2xl p-8 md:p-12 text-center transition bg-night/[0.02] hover:bg-wa/[0.04]">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-white flex items-center justify-center mb-4 shadow-sm">
                  <Upload className="text-waDark" size={28} />
                </div>
                <p className="font-semibold text-night mb-1">Trascina o clicca per caricare</p>
                <p className="text-xs text-night/50">JPG, PNG, WEBP o PDF · Max 10MB</p>
              </div>
              <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} className="hidden" />
            </label>
          ) : (
            <div>
              {preview && (
                <div className="mb-4 rounded-2xl overflow-hidden border border-night/[0.06]">
                  <img src={preview} alt="Anteprima" className="w-full max-h-80 object-contain bg-night/[0.02]" />
                </div>
              )}
              {file.type === "application/pdf" && (
                <div className="mb-4 flex items-center gap-3 bg-night/[0.03] rounded-xl p-4">
                  <FileText size={24} className="text-waDark shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-night truncate">{file.name}</p>
                    <p className="text-xs text-night/50">{(file.size / 1024).toFixed(0)} KB</p>
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={() => { setFile(null); setPreview(null); }} className="flex-1 border border-night/[0.08] hover:border-night/20 text-night py-3.5 rounded-2xl font-semibold text-sm transition">Cambia file</button>
                <button onClick={handleExtract} disabled={loading} className="flex-1 bg-gradient-to-r from-wa to-waDark hover:from-waDark hover:to-waDark disabled:from-gray-300 disabled:to-gray-300 text-white py-3.5 rounded-2xl font-bold text-sm transition inline-flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg shadow-wa/30">
                  {loading ? (<><Loader2 className="animate-spin" size={16} />Analisi AI...</>) : (<><Sparkles size={16} />Analizza con AI</>)}
                </button>
              </div>
              {loading && (
                <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                  <Loader2 className="animate-spin text-blue-600 shrink-0 mt-0.5" size={16} />
                  <div className="text-xs text-blue-800">
                    <p className="font-semibold">L&apos;AI sta leggendo il tuo menu...</p>
                    <p className="text-blue-600 mt-0.5">Ci vogliono 10-30 secondi. Non chiudere la pagina.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <button onClick={onCancel} className="w-full text-night/60 hover:text-night py-3 text-sm font-medium transition">Annulla</button>
      </div>
    );
  }

  // ═══════════ REVIEW ═══════════
  if (step === "review") {
    return (
      <div className="space-y-5">
        <div className="bg-white rounded-2xl border border-night/[0.06] p-6">
          <div className="flex items-start justify-between mb-5 gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-green-50 flex items-center justify-center shrink-0">
                <CheckCircle2 size={22} className="text-green-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-night">Ecco cosa ho trovato ✨</h2>
                <p className="text-xs text-night/50">{items.length} {isFood ? "piatti" : "servizi"} · Controlla, modifica, aggiungi foto</p>
              </div>
            </div>
            <button onClick={() => { setItems([]); setFile(null); setPreview(null); setStep("upload"); setImageUrls({}); }} className="text-xs font-semibold text-night/50 hover:text-night inline-flex items-center gap-1.5 transition">
              <RefreshCw size={12} />Ricomincia
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm mb-4 flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" /><span>{error}</span>
            </div>
          )}

          <div className="space-y-3 mb-5 max-h-[60vh] overflow-y-auto">
            {items.map((item, i) => (
              <div key={i} className="bg-night/[0.02] rounded-2xl p-4 border border-night/[0.04]">
                <div className="flex items-start gap-3 mb-3">
                  <span className="w-7 h-7 rounded-lg bg-white border border-night/[0.06] flex items-center justify-center text-xs font-bold text-night/60 shrink-0 mt-0.5">{i + 1}</span>
                  <input type="text" value={item.name} onChange={(e) => updateItem(i, "name", e.target.value)} placeholder={isFood ? "Nome piatto" : "Nome servizio"} className="flex-1 bg-white border border-night/[0.06] rounded-xl px-3 py-2.5 text-sm font-semibold focus:border-wa focus:outline-none transition" />
                  <button onClick={() => removeItem(i)} className="w-9 h-9 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 transition shrink-0 flex items-center justify-center"><Trash2 size={14} /></button>
                </div>

                {/* FOTO: upload manuale */}
                <div className="pl-10 mb-3 flex items-center gap-3">
                  {imageUrls[i] ? (
                    <div className="relative group shrink-0">
                      <img src={imageUrls[i]} alt={item.name} className="w-16 h-16 rounded-xl object-cover border border-night/[0.06]" />
                      <button onClick={() => setImageUrls((prev) => { const copy = { ...prev }; delete copy[i]; return copy; })} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 transition"><X size={10} /></button>
                    </div>
                  ) : (
                    <label className="cursor-pointer shrink-0">
                      <div className="w-16 h-16 rounded-xl border-2 border-dashed border-night/15 hover:border-wa hover:bg-wa/[0.04] flex flex-col items-center justify-center gap-0.5 transition">
                        {uploadingIndex === i ? (
                          <Loader2 className="animate-spin text-waDark" size={16} />
                        ) : (
                          <>
                            <ImagePlus size={14} className="text-night/40" />
                            <span className="text-[8px] font-bold text-night/40 uppercase">Foto</span>
                          </>
                        )}
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(i, e.target.files[0])} />
                    </label>
                  )}
                  <p className="text-[11px] text-night/40 leading-tight">
                    {imageUrls[i] ? "✓ Foto caricata" : "Clicca per caricare una foto (facoltativo)"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pl-10">
                  <input type="text" value={item.description || ""} onChange={(e) => updateItem(i, "description", e.target.value)} placeholder="Descrizione" className="col-span-2 bg-white border border-night/[0.06] rounded-xl px-3 py-2 text-xs focus:border-wa focus:outline-none transition" />
                  <input type="text" value={item.category || ""} onChange={(e) => updateItem(i, "category", e.target.value)} placeholder="Categoria" className="bg-white border border-night/[0.06] rounded-xl px-3 py-2 text-xs focus:border-wa focus:outline-none transition" />
                  <div className="flex gap-2">
                    <input type="number" step="0.01" value={item.price || ""} onChange={(e) => updateItem(i, "price", e.target.value)} placeholder="€" className="flex-1 bg-white border border-night/[0.06] rounded-xl px-3 py-2 text-xs focus:border-wa focus:outline-none transition" />
                    {!isFood && (<input type="number" value={item.duration_minutes || ""} onChange={(e) => updateItem(i, "duration_minutes", e.target.value)} placeholder="min" className="w-20 bg-white border border-night/[0.06] rounded-xl px-3 py-2 text-xs focus:border-wa focus:outline-none transition" />)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button onClick={addItem} className="w-full border-2 border-dashed border-night/10 hover:border-wa text-night/60 hover:text-waDark py-3 rounded-2xl font-semibold text-sm transition inline-flex items-center justify-center gap-2 mb-4">
            <Plus size={16} />Aggiungi manualmente
          </button>

          <button onClick={handleSaveAll} className="w-full bg-gradient-to-r from-wa to-waDark hover:from-waDark hover:to-waDark text-white py-4 rounded-2xl font-bold transition inline-flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg shadow-wa/30">
            <CheckCircle2 size={18} />Salva tutti ({items.filter((i) => i.name?.trim()).length})
          </button>
        </div>

        <button onClick={onCancel} className="w-full text-night/60 hover:text-night py-3 text-sm font-medium transition">Annulla</button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-night/[0.06] p-12 text-center">
      <Loader2 className="animate-spin text-waDark mx-auto mb-4" size={32} />
      <p className="font-semibold text-night">Salvataggio in corso...</p>
      <p className="text-xs text-night/50 mt-1">Un attimo e ci siamo</p>
    </div>
  );
}
