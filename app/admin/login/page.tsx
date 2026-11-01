"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Mail, Lock, ArrowRight, Loader2, Shield } from "lucide-react";

const ADMIN_EMAIL = "movisicily@gmail.com";

function AdminLoginForm() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError("Credenziali non valide");
      setLoading(false);
      return;
    }

    const { data: { user: currentUser } } = await supabase.auth.getUser();

    if (!currentUser || currentUser.email !== ADMIN_EMAIL) {
      await supabase.auth.signOut();
      setError("Accesso riservato agli amministratori");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="bg-[#0F0F17] rounded-3xl shadow-2xl border border-white/[0.08] p-8 text-white">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-wa to-waDark flex items-center justify-center mx-auto mb-4">
          <Shield size={26} className="text-white" />
        </div>
        <p className="text-[10px] font-bold text-wa uppercase tracking-widest mb-2">Super Admin</p>
        <h1 className="text-2xl font-bold mb-1">Prenotly Admin</h1>
        <p className="text-xs text-white/50 font-mono">RESTRICTED ACCESS</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 text-sm mb-5">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <label className="block">
          <span className="text-[11px] font-bold text-white/60 uppercase tracking-widest mb-2 block">Email Admin</span>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={18} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@email.it"
              required
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-white/20 focus:border-wa focus:outline-none focus:ring-2 focus:ring-wa/20"
            />
          </div>
        </label>

        <label className="block">
          <span className="text-[11px] font-bold text-white/60 uppercase tracking-widest mb-2 block">Password</span>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={18} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password admin"
              required
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-white/20 focus:border-wa focus:outline-none focus:ring-2 focus:ring-wa/20"
            />
          </div>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-wa to-waDark hover:opacity-90 disabled:opacity-50 text-white py-3.5 rounded-full font-bold transition inline-flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          {loading ? <><Loader2 className="animate-spin" size={18} /> Accesso...</> : <>Accedi <ArrowRight size={18} /></>}
        </button>
      </form>

      <p className="text-center text-[10px] text-white/30 mt-6 font-mono">
        UNAUTHORIZED ACCESS PROHIBITED
      </p>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-wa/[0.08] to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="w-full max-w-md relative">
        <Suspense fallback={<div className="text-center text-white/40">Caricamento...</div>}>
          <AdminLoginForm />
        </Suspense>
      </div>
    </main>
  );
}
