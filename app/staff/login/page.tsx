"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Mail, Lock, ArrowRight, Loader2, UserCircle2 } from "lucide-react";

function StaffLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
      setError("Email o password non corretti");
      setLoading(false);
      return;
    }

    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) {
      setError("Errore di autenticazione");
      setLoading(false);
      return;
    }

    // Verifica che sia uno staff attivo
    const { data: staffRow } = await supabase
      .from("staff")
      .select("id")
      .eq("user_id", currentUser.id)
      .eq("is_active", true)
      .maybeSingle();

    if (!staffRow) {
      await supabase.auth.signOut();
      setError("Non sei uno staff attivo. Contatta il tuo titolare.");
      setLoading(false);
      return;
    }

    const next = searchParams.get("next") || "/staff/dashboard";
    router.push(next);
    router.refresh();
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
          <UserCircle2 size={28} className="text-blue-500" />
        </div>
        <h1 className="text-2xl font-bold text-night mb-2">Area Operatore</h1>
        <p className="text-sm text-gray-500">Accedi alla tua agenda personale</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm mb-5">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <label className="block">
          <span className="text-sm font-semibold text-night mb-2 block">Email</span>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operatore@email.it"
              required
              className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
            />
          </div>
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-night mb-2 block">Password</span>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="La tua password"
              required
              className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
            />
          </div>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3.5 rounded-full font-bold transition inline-flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          {loading ? <><Loader2 className="animate-spin" size={18} /> Accesso...</> : <>Accedi <ArrowRight size={18} /></>}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-gray-500">
        Sei il titolare? <Link href="/login" className="text-wa font-semibold hover:underline">Vai al login titolare</Link>
      </div>
    </div>
  );
}

export default function StaffLoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="block text-center mb-8">
          <span className="text-3xl font-bold text-night">
            Prenot<span className="text-wa">ly</span>
          </span>
          <p className="text-xs text-gray-500 mt-1">Area Operatore</p>
        </Link>
        <Suspense fallback={<div className="text-center text-gray-500">Caricamento...</div>}>
          <StaffLoginForm />
        </Suspense>
        <p className="text-center text-[10px] text-gray-400 mt-6">
          Aggiungi questa pagina alla schermata Home del tuo telefono per accedervi più velocemente.
        </p>
      </div>
    </main>
  );
}
