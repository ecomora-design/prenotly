"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Loader2, CheckCircle2, MessageCircle, ExternalLink,
  AlertCircle, Info, X
} from "lucide-react";

export default function CallMeBotSetup() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [whatsappNumber, setWhatswhatsappNumber] = useState("");
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"ok" | "ko" | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: link } = await supabase
        .from("tenant_users")
        .select(
          "tenant_id, tenants(whatsapp_number, callmebot_api_key, whatsapp_notifications_enabled)"
        )
        .eq("user_id", user.id)
        .maybeSingle();

      if (link?.tenants) {
        const t = link.tenants as any;
        setApiKey(t.callmebot_api_key || "");
        setWhatswhatsappNumber(t.whatsapp_number || "");
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: link } = await supabase
      .from("tenant_users")
      .select("tenant_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!link) return;

    await supabase
      .from("tenants")
      .update({
        callmebot_api_key: apiKey || null,
        whatsapp_number: whatsappNumber,
      })
      .eq("id", link.tenant_id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleTest = async () => {
    if (!apiKey || !whatsappNumber) return;
    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/app/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: whatsappNumber, apiKey }),
      });

      const data = await res.json();
      setTestResult(data.success ? "ok" : "ko");
    } catch (err) {
      setTestResult("ko");
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm flex items-center justify-center">
        <Loader2 className="animate-spin text-wa" size={20} />
      </div>
    );
  }

  const isConnected = !!apiKey;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-start gap-4 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center shrink-0">
          <MessageCircle className="text-green-600" size={24} />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-night mb-1">
            Notifiche App
          </h2>
          <p className="text-xs text-gray-500">
            Ricevi un messaggio App automatico per ogni prenotazione
          </p>
        </div>
        {isConnected && (
          <span className="text-[10px] font-bold bg-green-50 text-green-700 px-2 py-1 rounded-full inline-flex items-center gap-1">
            <CheckCircle2 size={10} /> ATTIVO
          </span>
        )}
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-100 text-green-700 rounded-xl px-4 py-3 text-sm mb-4 flex items-center gap-2">
          <CheckCircle2 size={16} /> Salvato
        </div>
      )}

      {/* Come attivare */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-5">
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="flex items-center gap-2 w-full text-left"
        >
          <Info className="text-blue-600 shrink-0" size={16} />
          <span className="text-sm font-semibold text-night flex-1">
            Come attivare le notifiche gratuite
          </span>
          <span className="text-xs text-blue-600 font-bold">
            {showGuide ? "Chiudi" : "Apri guida"}
          </span>
        </button>

        {showGuide && (
          <div className="mt-4 pt-4 border-t border-blue-200 space-y-3 text-xs text-gray-700">
            <p className="font-bold text-night">
              🎯 3 semplici passaggi (2 minuti):
            </p>
            <div>
              <p className="font-semibold mb-1">1. Salva questo contatto su App:</p>
              <p className="bg-white rounded-lg px-3 py-2 font-mono text-sm">
                +34 644 51 95 23
              </p>
            </div>
            <div>
              <p className="font-semibold mb-1">2. Invia questo messaggio:</p>
              <p className="bg-white rounded-lg px-3 py-2 font-mono text-sm">
                I allow callmebot to send me messages
              </p>
            </div>
            <div>
              <p className="font-semibold mb-1">3. Riceverai una risposta con la tua API key:</p>
              <p className="bg-white rounded-lg px-3 py-2 text-xs">
                "API Activated for your phone number. Your APIKEY is <strong>123456</strong>"
              </p>
            </div>
            <p className="text-gray-600 italic">
              Copia il numero della APIKEY e incollalo qui sotto 👇
            </p>
          </div>
        )}
      </div>

      {/* Form */}
      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-semibold text-night mb-2 block">
            Numero App (dove ricevere le notifiche) *
          </span>
          <input
            type="tel"
            value={whatsappNumber}
            onChange={(e) => setWhatswhatsappNumber(e.target.value)}
            placeholder="+39 333 1234567"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-wa focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-night mb-2 block">
            API Key di CallMeBot *
          </span>
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Es. 123456"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-wa focus:outline-none font-mono"
          />
        </label>
      </div>

      {testResult === "ok" && (
        <div className="bg-green-50 border border-green-100 text-green-700 rounded-xl px-4 py-3 text-sm mt-4 flex items-center gap-2">
          <CheckCircle2 size={16} />
          Test riuscito! Controlla App sul numero indicato.
        </div>
      )}

      {testResult === "ko" && (
        <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm mt-4 flex items-center gap-2">
          <AlertCircle size={16} />
          Test fallito. Controlla il numero e l'API key.
        </div>
      )}

      <div className="flex gap-3 mt-5 flex-wrap">
        <button
          onClick={handleSave}
          disabled={saving || !whatsappNumber || !apiKey}
          className="flex-1 bg-wa hover:bg-waDark disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3.5 rounded-full font-bold transition inline-flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          {saving ? (
            <>
              <Loader2 className="animate-spin" size={18} /> Salvataggio...
            </>
          ) : (
            <>Salva</>
          )}
        </button>

        <button
          onClick={handleTest}
          disabled={testing || !whatsappNumber || !apiKey}
          className="flex-1 border border-gray-200 hover:border-wa text-night py-3.5 rounded-full font-bold transition inline-flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {testing ? (
            <>
              <Loader2 className="animate-spin" size={18} /> Invio test...
            </>
          ) : (
            <>Invia messaggio di test</>
          )}
        </button>
      </div>

      {isConnected && (
        <div className="mt-5 pt-5 border-t border-gray-100">
          <div className="flex items-start gap-2 text-xs text-gray-600">
            <CheckCircle2 className="text-wa shrink-0 mt-0.5" size={14} />
            <span>
              Quando un cliente prenota, ricevi un messaggio App su{" "}
              <strong className="text-night">{whatsappNumber}</strong> con tutti i dettagli.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
