"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, MessageCircle, Search, Users } from "lucide-react";

type Customer = {
  id: string;
  name: string | null;
  whatsapp_number: string;
  email: string | null;
  created_at: string;
};

export default function ClientiPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: link } = await supabase
        .from("tenant_users")
        .select("tenant_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!link) { router.push("/onboarding"); return; }

      const { data } = await supabase
        .from("customers")
        .select("*")
        .eq("tenant_id", link.tenant_id)
        .order("created_at", { ascending: false });

      setCustomers(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = customers.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (c.name || "").toLowerCase().includes(q) ||
      c.whatsapp_number.includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-wa" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-night mb-1">Clienti</h1>
        <p className="text-gray-500 text-sm">
          {customers.length} {customers.length === 1 ? "cliente" : "clienti"} nel tuo database
        </p>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cerca per nome o numero..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-soft border border-gray-100 rounded-full pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-gray-300"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-full bg-soft flex items-center justify-center mb-4">
            <Users className="text-gray-400" size={28} />
          </div>
          <h2 className="text-lg font-bold text-night mb-2">Nessun cliente</h2>
          <p className="text-gray-500 text-sm">
            {search ? "Nessun risultato per la ricerca" : "Quando riceverai un ordine o una prenotazione, il cliente apparirà qui"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => {
            const phone = c.whatsapp_number.replace(/\D/g, "");
            return (
              <div key={c.id} className="bg-white rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-wa/10 flex items-center justify-center text-waDark font-bold shrink-0">
                    {(c.name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-night text-sm truncate">
                      {c.name || "Cliente anonimo"}
                    </p>
                    <p className="text-xs text-gray-500">{c.whatsapp_number}</p>
                  </div>
                </div>
                <a
                  href={`https://wa.me/${phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-wa/10 hover:bg-wa/20 flex items-center justify-center text-waDark transition shrink-0"
                  aria-label="Contatta su WhatsApp"
                >
                  <MessageCircle size={18} />
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
