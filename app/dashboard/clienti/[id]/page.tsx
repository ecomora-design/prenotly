"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { planHasFeature } from "@/lib/planFeatures";
import {
  Loader2, ArrowLeft, MessageCircle, Phone, Calendar, ShoppingBag,
  TrendingUp, Clock, CheckCircle2, Lock, Crown, Save, AlertCircle
} from "lucide-react";

type Customer = {
  id: string;
  tenant_id: string;
  name: string | null;
  whatsapp_number: string;
  email: string | null;
  created_at: string;
};

type Note = {
  id?: string;
  note: string | null;
  tags: string[];
  birthday: string | null;
};

type Order = {
  id: string;
  order_code: string;
  total: number;
  created_at: string;
  status: string;
};

type Booking = {
  id: string;
  booking_code: string;
  scheduled_at: string;
  status: string;
};

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [note, setNote] = useState<Note>({ note: "", tags: [], birthday: null });
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [planType, setPlanType] = useState<string | null>(null);
  const [savingNote, setSavingNote] = useState(false);
  const [saved, setSaved] = useState(false);

  const hasClientNotes = planHasFeature(planType, "clientNotes");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: link } = await supabase
        .from("tenant_users")
        .select("tenant_id, tenants(plan_type)")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!link) { router.push("/onboarding"); return; }
      const t: any = link.tenants;
      setPlanType(t?.plan_type || null);

      // Carica cliente (deve appartenere al suo tenant)
      const { data: c } = await supabase
        .from("customers")
        .select("*")
        .eq("id", id)
        .eq("tenant_id", link.tenant_id)
        .maybeSingle();

      if (!c) { router.push("/dashboard/clienti"); return; }
      setCustomer(c);

      // Carica note (solo se premium)
      if (planHasFeature(t?.plan_type, "clientNotes")) {
        const { data: n } = await supabase
          .from("customer_notes")
          .select("*")
          .eq("customer_id", id)
          .maybeSingle();
        if (n) {
          setNote({
            id: n.id,
            note: n.note,
            tags: n.tags || [],
            birthday: n.birthday,
          });
        }
      }

      // Storico ordini e prenotazioni
      const [ordersRes, bookingsRes] = await Promise.all([
        supabase.from("orders").select("id, order_code, total, created_at, status").eq("customer_id", id).order("created_at", { ascending: false }).limit(20),
        supabase.from("bookings").select("id, booking_code, scheduled_at, status").eq("customer_id", id).order("scheduled_at", { ascending: false }).limit(20),
      ]);

      setOrders(ordersRes.data || []);
      setBookings(bookingsRes.data || []);
      setLoading(false);
    }
    load();
  }, [id]);

  const saveNote = async () => {
    if (!customer) return;
    setSavingNote(true);
    const payload = {
      tenant_id: customer.tenant_id,
      customer_id: customer.id,
      note: note.note?.trim() || null,
      tags: note.tags,
      birthday: note.birthday || null,
    };

    let error;
    if (note.id) {
      ({ error } = await supabase.from("customer_notes").update(payload).eq("id", note.id));
    } else {
      const res = await supabase.from("customer_notes").insert(payload).select().single();
      error = res.error;
      if (res.data) setNote({ ...note, id: res.data.id });
    }

    setSavingNote(false);
    if (error) alert("Errore: " + error.message);
    else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  if (loading || !customer) {
    return <div className="flex items-center justify-center h-[70vh]"><Loader2 className="animate-spin text-wa" size={32} /></div>;
  }

  const phone = customer.whatsapp_number.replace(/\D/g, "");
  const totalSpent = orders.reduce((sum, o) => sum + Number(o.total), 0);

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/dashboard/clienti" className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-night transition uppercase tracking-widest mb-4">
        <ArrowLeft size={14} /> Torna ai clienti
      </Link>

      {/* HEADER */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-wa/10 flex items-center justify-center text-waDark font-black text-2xl shrink-0">
              {(customer.name || "?").charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-night">{customer.name || "Cliente anonimo"}</h1>
              <p className="text-sm text-gray-500 mt-1">{customer.whatsapp_number}</p>
              {customer.email && <p className="text-xs text-gray-400">{customer.email}</p>}
            </div>
          </div>
          <a
            href={`https://wa.me/${phone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-wa hover:bg-waDark text-white px-4 py-2.5 rounded-full text-xs font-bold transition"
          >
            <MessageCircle size={14} /> Contatta
          </a>
        </div>
      </div>

      {/* KPI RAPIDI */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingBag size={14} className="text-blue-500" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Ordini</p>
          </div>
          <p className="text-2xl font-black text-night">{orders.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={14} className="text-purple-500" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Prenotazioni</p>
          </div>
          <p className="text-2xl font-black text-night">{bookings.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} className="text-emerald-500" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Speso</p>
          </div>
          <p className="text-2xl font-black text-night">€{totalSpent.toFixed(2)}</p>
        </div>
      </div>

      {/* FASCICOLO (premium gate) */}
      <div className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-night flex items-center gap-2">
            {hasClientNotes ? <CheckCircle2 key="ok" size={18} className="text-emerald-500" /> : <Lock key="lock" size={18} className="text-amber-500" />}
            Fascicolo cliente
          </h2>
          {!hasClientNotes && (
            <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <Crown size={10} /> PREMIUM
            </span>
          )}
        </div>

        {!hasClientNotes ? (
          <div className="p-8 text-center">
            <Lock size={32} className="text-amber-400 mx-auto mb-3" />
            <h3 className="font-bold text-night mb-1">Funzione Premium</h3>
            <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
              Salva note, allergie, preferenze e data di compleanno dei tuoi clienti. Tutto in un unico posto.
            </p>
            <Link href="/dashboard/abbonamento" className="inline-flex items-center gap-2 bg-night hover:bg-night/90 text-white px-6 py-2.5 rounded-full text-sm font-bold transition">
              <Crown size={14} /> Scopri Premium Pro
            </Link>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Note private</label>
              <textarea
                value={note.note || ""}
                onChange={(e) => setNote({ ...note, note: e.target.value })}
                rows={4}
                placeholder="Es. Allergia ai crostacei, preferisce il tavolo vicino alla finestra, cliente abituale del venerdì..."
                className="w-full bg-soft border border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-wa focus:outline-none focus:bg-white transition resize-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Tag</label>
              <input
                type="text"
                value={note.tags.join(", ")}
                onChange={(e) => setNote({ ...note, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })}
                placeholder="VIP, abituale, vegano, problematico (separati da virgola)"
                className="w-full bg-soft border border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-wa focus:outline-none focus:bg-white transition"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Data di compleanno</label>
              <input
                type="date"
                value={note.birthday || ""}
                onChange={(e) => setNote({ ...note, birthday: e.target.value || null })}
                className="bg-soft border border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-wa focus:outline-none focus:bg-white transition"
              />
            </div>
            <button
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
            </button>
          </div>
        )}
      </div>

      {/* STORICO ORDINI */}
      {orders.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-night flex items-center gap-2"><ShoppingBag size={16} className="text-blue-500" /> Storico ordini</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {orders.map(o => (
              <div key={o.id} className="px-6 py-3 flex items-center justify-between text-sm">
                <div>
                  <p className="font-mono font-bold text-night">{o.order_code}</p>
                  <p className="text-xs text-gray-400">{new Date(o.created_at).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" })}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-night">€{Number(o.total).toFixed(2)}</p>
                  <p className="text-xs text-gray-400 capitalize">{o.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STORICO PRENOTAZIONI */}
      {bookings.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-night flex items-center gap-2"><Calendar size={16} className="text-purple-500" /> Storico prenotazioni</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {bookings.map(b => (
              <div key={b.id} className="px-6 py-3 flex items-center justify-between text-sm">
                <div>
                  <p className="font-mono font-bold text-night">{b.booking_code}</p>
                  <p className="text-xs text-gray-400">{new Date(b.scheduled_at).toLocaleString("it-IT", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                <span className="text-xs font-bold uppercase bg-purple-50 text-purple-700 px-2 py-1 rounded">{b.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {orders.length === 0 && bookings.length === 0 && (
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
          <Clock size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Nessuno storico ancora per questo cliente.</p>
        </div>
      )}
    </div>
  );
}
