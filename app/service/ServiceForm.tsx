"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, CheckCircle2, Send } from "lucide-react";

export default function ServiceForm() {
  const supabase = createClient();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    business_name: "",
    business_type: "",
    budget_range: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("service_requests").insert({
      user_id: user?.id || null,
      full_name: form.full_name,
      email: form.email,
      phone: form.phone || null,
      business_name: form.business_name || null,
      business_type: form.business_type || null,
      budget_range: form.budget_range || null,
      message: form.message,
      status: "new",
    });

    setLoading(false);

    if (error) {
      setError("Qualcosa è andato storto. Riprova o scrivici su App.");
      return;
    }

    setSent(true);
  };

  if (sent) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10 text-center border border-gray-100">
        <div className="w-20 h-20 mx-auto rounded-full bg-blue-50 flex items-center justify-center mb-5">
          <CheckCircle2 className="text-blue-600" size={40} />
        </div>
        <h3 className="text-2xl font-bold text-night mb-3">Richiesta inviata!</h3>
        <p className="text-gray-600 mb-6">
          Grazie per averci contattato. Il nostro team ti risponderà entro <strong className="text-night">24 ore</strong> all&apos;indirizzo che hai indicato.
        </p>
        <a
          href="https://wa.me/message/LLEKTVFCRCPVB1"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-wa hover:bg-waDark text-white px-6 py-3 rounded-full font-bold transition active:scale-95"
        >
          Scrivici su App
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-gray-100 space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-semibold text-night mb-2 block">Nome e cognome *</span>
          <input
            type="text"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-night mb-2 block">Email *</span>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none"
          />
        </label>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-semibold text-night mb-2 block">Telefono</span>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+39 333 1234567"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-night mb-2 block">Nome attività</span>
          <input
            type="text"
            value={form.business_name}
            onChange={(e) => setForm({ ...form, business_name: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none"
          />
        </label>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-semibold text-night mb-2 block">Tipo di attività</span>
          <input
            type="text"
            value={form.business_type}
            onChange={(e) => setForm({ ...form, business_type: e.target.value })}
            placeholder="Es. studio medico, palestra..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-night mb-2 block">Budget indicativo</span>
          <select
            value={form.budget_range}
            onChange={(e) => setForm({ ...form, budget_range: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none bg-white"
          >
            <option value="">Seleziona...</option>
            <option value="< 1000">Meno di €1.000</option>
            <option value="1000-3000">€1.000 - €3.000</option>
            <option value="3000-5000">€3.000 - €5.000</option>
            <option value="5000-10000">€5.000 - €10.000</option>
            <option value="> 10000">Oltre €10.000</option>
          </select>
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-semibold text-night mb-2 block">Raccontaci il tuo progetto *</span>
        <textarea
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Descrivi le funzionalità che ti servono, i tuoi obiettivi, eventuali integrazioni con sistemi esistenti..."
          rows={5}
          required
          className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none resize-none"
        />
      </label>

      <button
        type="submit"
        disabled={loading || !form.full_name || !form.email || !form.message}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-full font-bold transition inline-flex items-center justify-center gap-2 active:scale-[0.98]"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={18} />
            Invio in corso...
          </>
        ) : (
          <>
            <Send size={18} />
            Invia richiesta
          </>
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Ti risponderemo entro 24 ore. Nessuno spam, nessuna condivisione dei tuoi dati.
      </p>
    </form>
  );
}
