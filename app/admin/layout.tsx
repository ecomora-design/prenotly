"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, ShoppingBag, Inbox, Clock,
  Euro, LogOut, Menu, X, Loader2, Shield, Home,
  Activity, Zap, ChevronRight, Bell
} from "lucide-react";

const ADMIN_EMAIL = "movisicily@gmail.com";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(0);

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      if (user.email !== ADMIN_EMAIL) { router.push("/dashboard"); return; }
      setUserEmail(user.email);
      setLoading(false);

      // Conta trial in scadenza
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const { count } = await supabase
        .from("tenants")
        .select("*", { count: "exact", head: true })
        .eq("subscription_status", "trial")
        .gte("trial_ends_at", now.toISOString())
        .lte("trial_ends_at", tomorrow.toISOString());

      setNotifications(count || 0);
    }
    check();
  }, []);

  useEffect(() => { setMobileMenuOpen(false); }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0A0A0F]">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="animate-spin text-wa mx-auto mb-4" size={36} />
            <div className="absolute inset-0 blur-xl bg-wa/30 animate-pulse" />
          </div>
          <p className="text-xs text-white/40 font-mono tracking-wider">
            LOADING ADMIN PANEL...
          </p>
        </div>
      </main>
    );
  }

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, code: "01" },
    { href: "/admin/clienti", label: "Clienti", icon: Users, code: "02" },
    { href: "/admin/scadenze", label: "Scadenze", icon: Clock, code: "03", badge: notifications },
    { href: "/admin/incassi", label: "Incassi", icon: Euro, code: "04" },
    { href: "/admin/ordini", label: "Ordini", icon: ShoppingBag, code: "05" },
    { href: "/admin/richieste", label: "Richieste", icon: Inbox, code: "06" },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <div className="flex">
        {/* SIDEBAR DESKTOP */}
        <aside className="hidden lg:flex flex-col w-72 bg-[#0F0F17] border-r border-white/[0.06] min-h-screen sticky top-0 h-screen relative overflow-hidden">
          {/* Glow decorativo */}
          <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-wa/[0.08] to-transparent pointer-events-none" />

          {/* Logo */}
          <div className="p-6 border-b border-white/[0.06] relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-wa to-waDark flex items-center justify-center">
                  <Shield size={18} className="text-white" />
                </div>
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-[#0F0F17] animate-pulse" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-wa uppercase tracking-widest leading-none mb-1">
                  Super Admin
                </p>
                <p className="text-sm font-bold leading-none">
                  Prenot<span className="text-wa">ly</span>
                </p>
              </div>
            </div>

            {/* Status pill */}
            <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-1.5">
              <Activity size={10} className="text-green-400" />
              <span className="text-[10px] font-mono text-white/50">
                SYSTEM ONLINE
              </span>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-3 overflow-y-auto relative">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-3 pt-3 pb-2">
              Controllo
            </p>

            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition mb-0.5 ${
                    active
                      ? "bg-gradient-to-r from-wa/20 to-transparent text-white"
                      : "text-white/50 hover:text-white hover:bg-white/[0.03]"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="active-admin-item"
                      className="absolute left-0 top-2 bottom-2 w-0.5 bg-wa rounded-full shadow-[0_0_12px_#25D366]"
                    />
                  )}
                  <span
                    className={`text-[10px] font-mono font-bold ${
                      active ? "text-wa" : "text-white/20"
                    }`}
                  >
                    {item.code}
                  </span>
                  <item.icon size={16} className={active ? "text-wa" : ""} />
                  <span className="flex-1 font-medium">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-[0_0_8px_rgba(239,68,68,0.6)]">
                      {item.badge}
                    </span>
                  )}
                  {active && <ChevronRight size={14} className="text-wa/50" />}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-white/[0.06] relative">
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 mb-2">
              <p className="text-[10px] font-mono text-white/30 mb-1">LOGGED AS</p>
              <p className="text-xs font-semibold text-white/70 truncate">
                {userEmail}
              </p>
            </div>

            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/[0.03] transition mb-0.5"
            >
              <Home size={16} />
              Vai alla dashboard cliente
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition"
            >
              <LogOut size={16} />
              Esci
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <div className="flex-1 min-w-0">
          {/* Header mobile */}
          <header className="lg:hidden sticky top-0 z-30 bg-[#0F0F17] border-b border-white/[0.06]">
            <div className="px-4 py-3 flex items-center justify-between">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 -ml-2 text-white"
                aria-label="Menu"
              >
                <Menu size={24} />
              </button>
              <div className="flex items-center gap-2">
                <Shield size={14} className="text-wa" />
                <span className="text-xs font-mono tracking-wider text-white/70">
                  ADMIN
                </span>
              </div>
              <div className="w-9 relative">
                {notifications > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">
                    {notifications}
                  </span>
                )}
              </div>
            </div>
          </header>

          {/* Menu mobile fullscreen */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-[#0A0A0F] lg:hidden overflow-y-auto"
              >
                <div className="p-4 flex items-center justify-between border-b border-white/[0.06] sticky top-0 bg-[#0A0A0F] z-10">
                  <div className="flex items-center gap-2">
                    <Shield size={18} className="text-wa" />
                    <span className="font-bold text-sm">Super Admin</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 -mr-2"
                    aria-label="Chiudi"
                  >
                    <X size={24} />
                  </button>
                </div>

                <nav className="p-3">
                  {navItems.map((item) => {
                    const active =
                      pathname === item.href ||
                      (item.href !== "/admin" && pathname.startsWith(item.href));
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium text-base transition mb-1 ${
                          active
                            ? "bg-gradient-to-r from-wa/20 to-transparent text-white"
                            : "text-white/60 active:bg-white/[0.03]"
                        }`}
                      >
                        <span
                          className={`text-[10px] font-mono font-bold ${
                            active ? "text-wa" : "text-white/20"
                          }`}
                        >
                          {item.code}
                        </span>
                        <item.icon size={20} className={active ? "text-wa" : ""} />
                        <span className="flex-1">{item.label}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}

                  <div className="mt-4 pt-4 border-t border-white/[0.06]">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium text-base text-white/60 active:bg-white/[0.03]"
                    >
                      <Home size={20} />
                      Dashboard cliente
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium text-base text-red-400 active:bg-red-500/10"
                    >
                      <LogOut size={20} />
                      Esci
                    </button>
                  </div>
                </nav>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Content */}
          <div className="p-4 md:p-8 pb-16">{children}</div>
        </div>
      </div>
    </div>
  );
}
