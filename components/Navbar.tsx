"use client";
import { useState, useEffect } from "react";
import { Menu, X, User, LogOut, MessageCircle } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
  }, [open]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const links = [
    { href: "/#software", label: "Software" },
    { href: "/prezzi", label: "Prezzi" },
    { href: "/ristoranti", label: "Food" },
    { href: "/pro", label: "Beauty" },
    { href: "/#faq", label: "FAQ" },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled || open
            ? "bg-white/95 backdrop-blur border-b border-gray-100"
            : "bg-transparent"
        }`}
      >
        <div className="container-x py-3 md:py-4 flex items-center justify-between">
          <Link href="/" className="text-xl md:text-2xl font-bold text-night">
            Prenot<span className="text-wa">ly</span>
          </Link>

          <div className="hidden lg:flex items-center gap-7">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="text-gray-700 hover:text-wa transition text-sm font-medium">
                {l.label}
              </Link>
            ))}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="bg-wa hover:bg-waDark text-white px-5 py-2.5 rounded-full font-semibold transition shadow-lg shadow-wa/20 inline-flex items-center gap-2 text-sm"
                >
                  <User size={16} />
                  Dashboard
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 py-2 min-w-[180px]">
                    <Link
                      href="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-soft"
                    >
                      La mia attività
                    </Link>
                    <Link
                      href="/dashboard/impostazioni"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-soft"
                    >
                      Impostazioni
                    </Link>
                    <Link
                      href="/dashboard/abbonamento"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-soft"
                    >
                      Abbonamento
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 inline-flex items-center gap-2"
                    >
                      <LogOut size={14} />
                      Esci
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-wa font-medium transition text-sm">
                  Accedi
                </Link>
                <Link
                  href="/signup"
                  className="bg-wa hover:bg-waDark text-white px-5 py-2.5 rounded-full font-semibold transition shadow-lg shadow-wa/20 text-sm"
                >
                  Attiva ora
                </Link>
              </>
            )}
          </div>

          <button
            className="lg:hidden text-night p-2 -mr-2"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="fixed inset-0 z-40 bg-white pt-20 px-6 lg:hidden overflow-y-auto">
          <div className="flex flex-col gap-1 pb-8">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-night text-lg font-semibold py-4 border-b border-gray-100 active:text-wa"
              >
                {l.label}
              </Link>
            ))}

            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="bg-wa text-white px-6 py-4 rounded-full text-center font-semibold mt-6"
                >
                  Vai alla dashboard
                </Link>
                <button
                  onClick={() => {
                    setOpen(false);
                    handleLogout();
                  }}
                  className="text-red-600 py-4 text-center font-semibold"
                >
                  Esci
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="text-night text-lg font-semibold py-4 text-center border border-gray-200 rounded-full mt-6"
                >
                  Accedi
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="bg-wa text-white px-6 py-4 rounded-full text-center font-semibold mt-3"
                >
                  Attiva ora
                </Link>
              </>
            )}

            <a
              href="https://wa.me/393934842118?text=Ciao%20Prenotly!%20Vorrei%20maggiori%20informazioni"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="text-wa text-center font-semibold py-4 inline-flex items-center justify-center gap-2"
            >
              <MessageCircle size={18} />
              Parla con noi
            </a>
          </div>
        </div>
      )}
    </>
  );
}
