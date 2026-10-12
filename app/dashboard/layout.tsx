"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard, Utensils, ShoppingBag, Calendar, CalendarDays, Inbox, CreditCard,
  Settings, LogOut, Menu, X, Loader2, ExternalLink,
  Users
} from "lucide-react";

type Tenant = {
  id: string;
  slug: string;
  business_name: string;
  business_type: string;
  product_type: string | null;
  subscription_status: string | null;
  trial_ends_at: string | null;
};

const ADMIN_EMAIL = "movisicily@gmail.com";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: link } = await supabase
        .from("tenant_users")
        .select("tenant_id, tenants(id, slug, business_name, business_type, product_type, subscription_status, trial_ends_at)")
        .eq("user_id", user.id)
        .maybeSingle();

      setUser(user);
      if (!link || !link.tenants) { router.push("/onboarding"); return; }

      setTenant(link.tenants as unknown as Tenant);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => { setMobileMenuOpen(false); }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-soft">
        <Loader2 className="animate-spin text-wa" size={32} />
      </main>
    );
  }

  if (!tenant) return null;

  const isFood = tenant.product_type === "food" || tenant.business_type === "restaurant";
  const isAdmin = user?.email === ADMIN_EMAIL;

  const navItems = [
    { href: "/dashboard", label: "Panoramica", icon: LayoutDashboard },
    { href: "/dashboard/servizi", label: isFood ? "Menu" : "Servizi", icon: Utensils },
    ...(isFood
      ? [{ href: "/dashboard/ordini", label: "Ordini", icon: ShoppingBag }]
      : [
          { href: "/dashboard/prenotazioni", label: "Prenotazioni", icon: Calendar },
          { href: "/dashboard/calendario", label: "Calendario", icon: CalendarDays },
        ]),
    { href: "/dashboard/clienti", label: "Clienti", icon: Users },
    { href: "/dashboard/pagamenti", label: "Pagamenti", icon: CreditCard },
    ...(isAdmin
      ? [{ href: "/admin/richieste", label: "🛠️ Richieste Service", icon: Inbox }]
      : []),
    { href: "/dashboard/impostazioni", label: "Impostazioni", icon: Settings },
    { href: "/dashboard/abbonamento", label: "Abbonamento", icon: CreditCard },
  ];

  const trialHoursLeft = tenant.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(tenant.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60)))
    : 0;

  const showTrialBanner = tenant.subscription_status === "trial" && trialHoursLeft > 0;

  return (
    <div className="min-h-screen bg-soft">
      {showTrialBanner && (
        <div className="bg-gradient-to-r from-waDark to-wa text-white px-4 py-2.5 text-center text-xs md:text-sm sticky top-0 z-40">
          ⏰ <strong>Demo attiva</strong> — {trialHoursLeft} ore rimanenti.{" "}
          <Link href="/dashboard/abbonamento" className="underline font-bold">Attiva ora</Link>
        </div>
      )}

      <div className="flex">
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 min-h-screen sticky top-0 h-screen">
          <div className="p-5 border-b border-gray-100">
            <Link href="/" className="text-xl font-bold text-night">
              Prenot<span className="text-wa">ly</span>
            </Link>
          </div>

          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-wa flex items-center justify-center text-white font-bold shrink-0">
                {tenant.business_name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-night text-sm truncate">{tenant.business_name}</p>
                <p className="text-xs text-gray-500 capitalize">{tenant.product_type || tenant.business_type}</p>
              </div>
            </div>
            <Link href={`/${tenant.slug}`} target="_blank" className="mt-3 text-xs text-gray-600 hover:text-wa inline-flex items-center gap-1.5">
              <ExternalLink size={12} />
              prenotly-italia.it/{tenant.slug}
            </Link>
          </div>

          <nav className="flex-1 p-3 overflow-y-auto">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition mb-1 ${
                    active ? "bg-wa/10 text-waDark" : "text-gray-600 hover:bg-soft"
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-3 border-t border-gray-100">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-red-600 hover:bg-red-50 transition">
              <LogOut size={18} />
              Esci
            </button>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
            <button onClick={() => setMobileMenuOpen(true)} className="p-2 -ml-2 text-night" aria-label="Menu">
              <Menu size={24} />
            </button>
            <Link href="/" className="text-lg font-bold text-night">
              Prenot<span className="text-wa">ly</span>
            </Link>
            <div className="w-9 h-9 rounded-xl bg-wa flex items-center justify-center text-white font-bold text-sm">
              {tenant.business_name.charAt(0)}
            </div>
          </header>

          {mobileMenuOpen && (
            <div className="fixed inset-0 z-50 bg-white lg:hidden">
              <div className="p-4 flex items-center justify-between border-b border-gray-100">
                <span className="font-bold text-night">Menu</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 -mr-2" aria-label="Chiudi">
                  <X size={24} />
                </button>
              </div>

              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-wa flex items-center justify-center text-white font-bold">
                    {tenant.business_name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-night">{tenant.business_name}</p>
                    <p className="text-xs text-gray-500 capitalize">{tenant.product_type || tenant.business_type}</p>
                  </div>
                </div>
              </div>

              <nav className="p-3">
                {navItems.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium text-base transition mb-1 ${
                        active ? "bg-wa/10 text-waDark" : "text-gray-700 active:bg-soft"
                      }`}
                    >
                      <item.icon size={20} />
                      {item.label}
                    </Link>
                  );
                })}

                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium text-base text-red-600 active:bg-red-50 mt-2">
                  <LogOut size={20} />
                  Esci
                </button>
              </nav>
            </div>
          )}

          <div className="p-4 md:p-8 pb-24 lg:pb-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
