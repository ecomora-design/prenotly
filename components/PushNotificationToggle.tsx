"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Loader2, X } from "lucide-react";

type Props = {
  staffId: string;
  tenantId: string;
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotificationToggle({ staffId, tenantId }: Props) {
  const [status, setStatus] = useState<"loading" | "unsupported" | "denied" | "subscribed" | "not_subscribed">("loading");
  const [working, setWorking] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    async function check() {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setStatus("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        setStatus("denied");
        return;
      }
      try {
        const reg = await navigator.serviceWorker.register("/sw.js");
        const sub = await reg.pushManager.getSubscription();
        setStatus(sub ? "subscribed" : "not_subscribed");
      } catch (err) {
        console.error("SW register error:", err);
        setStatus("not_subscribed");
      }
    }
    check();

    // Banner dismissed in questa sessione?
    const dismissed = sessionStorage.getItem("push-banner-dismissed");
    if (dismissed === "1") setBannerDismissed(true);
  }, []);

  async function subscribe() {
    setWorking(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("denied");
        setWorking(false);
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        alert("Errore: VAPID key non configurata");
        setWorking(false);
        return;
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: sub.toJSON(),
          staffId,
          tenantId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Errore iscrizione");
      }

      setStatus("subscribed");
    } catch (err: any) {
      console.error("subscribe error:", err);
      alert("Errore: " + (err.message || "Impossibile attivare le notifiche"));
    } finally {
      setWorking(false);
    }
  }

  async function unsubscribe() {
    setWorking(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setStatus("not_subscribed");
    } catch (err) {
      console.error("unsubscribe error:", err);
    } finally {
      setWorking(false);
    }
  }

  function dismissBanner() {
    setBannerDismissed(true);
    sessionStorage.setItem("push-banner-dismissed", "1");
  }

  // 1. Unsupported (browser vecchio o iOS senza PWA installata)
  if (status === "unsupported") {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 mb-4 flex items-start gap-2">
        <BellOff size={16} className="text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800">
          <p className="font-bold mb-0.5">Notifiche non supportate</p>
          <p className="text-amber-700/80">Il tuo browser non supporta le notifiche push. Su iPhone, installa l&apos;app dalla schermata Home.</p>
        </div>
      </div>
    );
  }

  // 2. Permission denied
  if (status === "denied") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-3 mb-4 flex items-start gap-2">
        <BellOff size={16} className="text-red-600 shrink-0 mt-0.5" />
        <div className="text-xs text-red-800">
          <p className="font-bold mb-0.5">Notifiche bloccate</p>
          <p className="text-red-700/80">Hai negato il permesso. Per riattivarle, vai nelle impostazioni del browser → Notifiche → consenti per questo sito.</p>
        </div>
      </div>
    );
  }

  // 3. Loading
  if (status === "loading") {
    return null;
  }

  // 4. Già iscritto → mostro piccolo pulsante "disattiva" nell'header (non banner)
  if (status === "subscribed") {
    return (
      <button
        onClick={unsubscribe}
        disabled={working}
        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
        title="Notifiche attive · clicca per disattivare"
      >
        {working ? <Loader2 size={18} className="animate-spin" /> : <Bell size={18} />}
      </button>
    );
  }

  // 5. Non iscritto → banner "Attiva notifiche" (dismissibile)
  if (status === "not_subscribed" && !bannerDismissed) {
    return (
      <div className="bg-gradient-to-r from-[#25D366]/10 to-[#128C7E]/10 border border-[#25D366]/30 rounded-2xl p-3 mb-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#25D366]/20 flex items-center justify-center shrink-0">
          <Bell size={18} className="text-[#0F766E]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-night leading-tight">Attiva le notifiche</p>
          <p className="text-[11px] text-night/60 leading-tight mt-0.5">Ricevi avvisi quando arrivano nuove prenotazioni o ordini</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={subscribe}
            disabled={working}
            className="bg-[#25D366] hover:bg-[#128C7E] text-white px-3 py-2 rounded-full text-xs font-bold transition active:scale-95 disabled:opacity-50"
          >
            {working ? <Loader2 size={12} className="animate-spin" /> : "Attiva"}
          </button>
          <button
            onClick={dismissBanner}
            className="p-2 text-night/40 hover:text-night rounded-lg transition"
            aria-label="Chiudi"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    );
  }

  return null;
}
