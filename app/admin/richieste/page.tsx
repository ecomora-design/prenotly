"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Loader2, MessageCircle, Mail, Phone, Building2,
  Calendar, Euro, Filter, RefreshCw, CheckCircle2
} from "lucide-react";

type ServiceRequest = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  business_name: string | null;
  business_type: string | null;
  budget_range: string | null;
  message: string;
  status: string;
  created_at: string;
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new: { label: "Nuova", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  contacted: { label: "Contattato", color: "bg-blue-50 text-blue-700 border-blue-200" },
  quoted: { label: "Preventivo inviato", color: "bg-violet-50 text-violet-700 border-violet-200" },
  won: { label: "Cliente acquisito", color: "bg-green-50 text-green-700 border-green-200" },
  lost: { label: "Perso", color: "bg-red-50 text-red-700 border-red-200" },
};

// ⚠️ SOSTITUISCI con la tua email Supabase
const ADMIN_EMAIL = "movisicily@gmail.com";

export default function RichiestePage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [filter, setFilter] = useState<string>("tutti");

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    // Verifica se è admin (l'email corrisponde)
    if (user.email !== ADMIN_EMAIL) {
      router.push("/dashboard");
      return;
    }

    const { data } = await supabase
      .from("service_requests")
      .select("*")
      .order("created_at", { ascending: false });

    setRequests(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("service_requests").update({ status }).eq("id", id);
    await load();
  };

  const filtered = filter === "tutti" ? requests : requests.filter((r) => r.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-night mb-1">
            🛠️ Richieste Service
          </h1>
          <p className="text-gray-500 text-sm">
            {requests.length} {requests.length === 1 ? "richiesta" : "richieste"} totali
          </p>
        </div>
        <button
          onClick={load}
          className="bg-white border border-gray-200 hover:border-night text-night px-4 py-2.5 rounded-full font-semibold text-sm inline-flex items-center gap-2 transition"
        >
          <RefreshCw size={16} />
          Aggiorna
        </button>
      </div>

      {/* Filtri */}
      <div className="scroll-x flex gap-2 mb-6 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
        {["tutti", "new", "contacted", "quoted", "won", "lost"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-xs md:text-sm font-semibold whitespace-nowrap transition shrink-0 ${
              filter === f ? "bg-night text-white" : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {f === "tutti" ? "Tutte" : STATUS_CONFIG[f]?.label || f}
            {f !== "tutti" && (
              <span className="ml-1.5 text-xs opacity-70">
                ({requests.filter((r) => r.status === f).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <div className="text-5xl mb-4">📬</div>
          <h2 className="text-lg font-bold text-night mb-2">Nessuna richiesta</h2>
          <p className="text-gray-500 text-sm">
            {filter === "tutti"
              ? "Quando qualcuno compilerà il form di /service, apparirà qui"
              : "Nessuna richiesta in questo stato"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => {
            const config = STATUS_CONFIG[req.status] || STATUS_CONFIG.new;
            return (
              <div key={req.id} className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${config.color}`}>
                        {config.label.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar size={11} />
                        {new Date(req.created_at).toLocaleString("it-IT", {
                          day: "2-digit", month: "2-digit", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <h3 className="font-bold text-night text-lg">{req.full_name}</h3>
                    {req.business_name && (
                      <p className="text-sm text-gray-600 flex items-center gap-2 mt-0.5">
                        <Building2 size={13} />
                        {req.business_name}
                        {req.business_type && ` · ${req.business_type}`}
                      </p>
                    )}
                  </div>
                  {req.budget_range && (
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Budget</p>
                      <p className="font-bold text-night flex items-center gap-1">
                        <Euro size={14} />
                        {req.budget_range}
                      </p>
                    </div>
                  )}
                </div>

                {/* Contatti */}
                <div className="bg-soft rounded-xl p-3 mb-4 space-y-1.5 text-sm">
                  <a href={`mailto:${req.email}`} className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition">
                    <Mail size={14} className="text-gray-400 shrink-0" />
                    <span className="truncate">{req.email}</span>
                  </a>
                  {req.phone && (
                    <a href={`tel:${req.phone}`} className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition">
                      <Phone size={14} className="text-gray-400 shrink-0" />
                      {req.phone}
                    </a>
                  )}
                </div>

                {/* Messaggio */}
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 mb-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Progetto
                  </p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {req.message}
                  </p>
                </div>

                {/* Azioni */}
                <div className="border-t border-gray-100 pt-3 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex gap-2 flex-wrap">
                    {req.status === "new" && (
                      <button onClick={() => updateStatus(req.id, "contacted")} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-full transition">
                        Segna come contattato
                      </button>
                    )}
                    {req.status === "contacted" && (
                      <button onClick={() => updateStatus(req.id, "quoted")} className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold px-4 py-2 rounded-full transition">
                        Preventivo inviato
                      </button>
                    )}
                    {req.status === "quoted" && (
                      <>
                        <button onClick={() => updateStatus(req.id, "won")} className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2 rounded-full transition">
                          Cliente acquisito
                        </button>
                        <button onClick={() => updateStatus(req.id, "lost")} className="text-red-600 hover:bg-red-50 text-xs font-semibold px-4 py-2 rounded-full transition">
                          Perso
                        </button>
                      </>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={`mailto:${req.email}?subject=Riguardo%20al%20tuo%20progetto%20Prenotly%20Service`}
                      className="text-blue-600 hover:bg-blue-50 text-xs font-semibold px-3 py-2 rounded-full transition inline-flex items-center gap-1.5"
                    >
                      <Mail size={14} />
                      Email
                    </a>
                    {req.phone && (
                      <a
                        href={`https://wa.me/${req.phone.replace(/\D/g, "")}?text=Ciao%20${encodeURIComponent(req.full_name)}!%20Riguardo%20al%20tuo%20progetto%20Prenotly%20Service`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-wa hover:bg-wa/10 text-xs font-semibold px-3 py-2 rounded-full transition inline-flex items-center gap-1.5"
                      >
                        <MessageCircle size={14} />
                        WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
