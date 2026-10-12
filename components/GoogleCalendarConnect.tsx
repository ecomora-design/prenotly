"use client";

import { useEffect, useState } from "react";
import {
  Loader2, Calendar, CheckCircle2, AlertCircle,
  ExternalLink, RefreshCw, Unlink, Mail
} from "lucide-react";

export default function GoogleCalendarConnect() {
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);
  const [status, setStatus] = useState<any>(null);

  async function loadStatus() {
    try {
      const res = await fetch("/api/google/status");
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStatus();

    // Auto-refresh se arriva da callback
    const url = new URL(window.location.href);
    if (url.searchParams.get("google") === "success") {
      setTimeout(loadStatus, 500);
    }
  }, []);

  const handleDisconnect = async () => {
    if (!confirm("Vuoi scollegare Google Calendar? Non riceverai più le prenotazioni in automatico.")) return;
    setDisconnecting(true);
    await fetch("/api/google/disconnect", { method: "POST" });
    await loadStatus();
    setDisconnecting(false);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm flex items-center justify-center">
        <Loader2 className="animate-spin text-wa" size={20} />
      </div>
    );
  }

  const url = new URL(typeof window !== "undefined" ? window.location.href : "http://localhost");
  const success = url.searchParams.get("google") === "success";
  const errorParam = url.searchParams.get("google") === "error";

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-start gap-4 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
          <Calendar className="text-red-500" size={24} />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-night mb-1">Google Calendar</h2>
          <p className="text-xs text-gray-500">
            Collega il tuo calendario per ricevere gli appuntamenti automaticamente
          </p>
        </div>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-100 text-green-700 rounded-xl px-4 py-3 text-sm mb-4 flex items-center gap-2">
          <CheckCircle2 size={16} />
          Google Calendar collegato con successo!
        </div>
      )}

      {errorParam && (
        <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm mb-4 flex items-center gap-2">
          <AlertCircle size={16} />
          Errore durante il collegamento. Riprova.
        </div>
      )}

      {status?.connected ? (
        <>
          <div className="bg-green-50 border border-green-100 rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="text-green-600" size={18} />
              <p className="font-semibold text-night text-sm">Collegato</p>
            </div>
            {status.email && (
              <p className="text-xs text-gray-600 flex items-center gap-2">
                <Mail size={12} />
                {status.email}
              </p>
            )}
            {status.connected_at && (
              <p className="text-[10px] text-gray-400 mt-2">
                Connesso il {new Date(status.connected_at).toLocaleDateString("it-IT", {
                  day: "2-digit", month: "long", year: "numeric",
                })}
              </p>
            )}
          </div>

          <div className="bg-soft rounded-xl p-4 mb-4 text-xs text-gray-600 space-y-2">
            <p>✅ Gli appuntamenti ricevuti appariranno automaticamente sul tuo calendario Google</p>
            <p>✅ Puoi gestirli anche da Google Calendar come faresti normalmente</p>
            <p>✅ Le modifiche si sincronizzano in entrambi i sensi</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={loadStatus}
              className="flex-1 border border-gray-200 hover:border-night text-night py-3 rounded-full font-semibold text-sm transition inline-flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} />
              Aggiorna
            </button>
            <button
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="flex-1 border border-red-200 hover:border-red-400 text-red-600 py-3 rounded-full font-semibold text-sm transition inline-flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {disconnecting ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                <Unlink size={14} />
              )}
              Scollega
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="bg-soft rounded-2xl p-5 mb-5 space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-wa mt-0.5 shrink-0" />
              <span className="text-gray-700">
                Gli appuntamenti vanno <strong className="text-night">direttamente sul tuo Google Calendar</strong>
              </span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-wa mt-0.5 shrink-0" />
              <span className="text-gray-700">
                <strong className="text-night">Sincronizzazione bidirezionale</strong>: modifica da Google o da qui
              </span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-wa mt-0.5 shrink-0" />
              <span className="text-gray-700">
                <strong className="text-night">Zero doppioni</strong>: il sistema legge la tua disponibilità reale
              </span>
            </div>
          </div>

          <a
            href="/api/google/connect"
            className="w-full bg-wa hover:bg-waDark text-white py-3.5 rounded-full font-bold transition inline-flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <ExternalLink size={18} />
            Collega Google Calendar
          </a>
        </>
      )}
    </div>
  );
}
