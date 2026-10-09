"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Plus, Calendar, ShoppingBag, ExternalLink, LayoutDashboard } from "lucide-react";

type Tenant = {
  id: string;
  slug: string;
  business_name: string;
  business_type: string;
  whatsapp_number: string | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [counts, setCounts] = useState({ bookings: 0, orders: 0 });

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: link } = await supabase
        .from("tenant_users")
        .select("tenant_id, tenants(id, slug, business_name, business_type, whatsapp_number)")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!link || !link.tenants) {
        // Nessuna attività → onboarding
        router.push("/onboarding");
        return;
      }

      const t = link.tenants as unknown as Tenant;
      setTenant(t);

      // Conta prenotazioni e ordini
      const { count: bCount } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("tenant_id", t.id);

      const { count: oCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("tenant_id", t.id);

      setCounts({ bookings: bCount || 0, orders: oCount || 0 });
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-soft">
        <Loader2 className="animate-spin text-wa" size={32} />
      </main>
    );
  }

  if (!tenant) return null;

  return (
    <main className="min-h-screen bg-soft pb-16">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-wa flex items-center justify-center text-white font-bold text-lg">
              {tenant.business_name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-night">{tenant.business_name}</h1>
              <p className="text-sm text-gray-500">
                Tipo: {tenant.business_type === "restaurant" ? "Ristorante" : "Servizi"}
              </p>
            </div>
          </div>
        </div>

        {/* Link pubblico */}
        <div className="bg-white rounded-2xl p-5 mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">
              Il tuo link pubblico
            </p>
            <p className="text-sm font-mono text-night break-all">
              prenotly-italia.it/{tenant.slug}
            </p>
          </div>
          <Link
            href={`/${tenant.slug}`}
            target="_blank"
            className="bg-wa hover:bg-waDark text-white px-5 py-2.5 rounded-full font-semibold text-sm inline-flex items-center gap-2 active:scale-95 transition shrink-0"
          >
            <ExternalLink size={16} />
            Vedi la tua pagina
          </Link>
        </div>

        {/* Statistiche */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingBag size={16} className="text-wa" />
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Ordini</p>
            </div>
            <p className="text-3xl font-bold text-night">{counts.orders}</p>
          </div>
          <div className="bg-white rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={16} className="text-violet-500" />
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Prenotazioni</p>
            </div>
            <p className="text-3xl font-bold text-night">{counts.bookings}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-2">
              <LayoutDashboard size={16} className="text-blue-500" />
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Stato</p>
            </div>
            <p className="text-sm font-semibold text-waDark">✅ Attivo</p>
          </div>
        </div>

        {/* Azioni rapide */}
        <h2 className="text-lg font-bold text-night mb-4">Azioni rapide</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/dashboard/servizi"
            className="bg-white rounded-2xl p-5 hover:shadow-lg transition flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-wa/10 flex items-center justify-center">
              <Plus className="text-waDark" size={20} />
            </div>
            <div>
              <p className="font-semibold text-night text-sm">Aggiungi servizi</p>
              <p className="text-xs text-gray-500">Menu o listino</p>
            </div>
          </Link>

          <Link
            href="/dashboard/ordini"
            className="bg-white rounded-2xl p-5 hover:shadow-lg transition flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-wa/10 flex items-center justify-center">
              <ShoppingBag className="text-waDark" size={20} />
            </div>
            <div>
              <p className="font-semibold text-night text-sm">Ordini</p>
              <p className="text-xs text-gray-500">Vedi gli ordini ricevuti</p>
            </div>
          </Link>

          <Link
            href="/dashboard/prenotazioni"
            className="bg-white rounded-2xl p-5 hover:shadow-lg transition flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
              <Calendar className="text-violet-500" size={20} />
            </div>
            <div>
              <p className="font-semibold text-night text-sm">Prenotazioni</p>
              <p className="text-xs text-gray-500">Agenda appuntamenti</p>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
