"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

function LoginForm() {
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

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Email o password non corretti");
      setLoading(false);
      return;
    }

    const next = searchParams.get("next") || "/dashboard";
    router.push(next);
    router.refresh();
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-night mb-2">Bentornato</h1>
        <p className="text-sm text-gray-500">Accedi alla tua area riservata</p>
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
              placeholder="tua@email.it"
              required
              className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 focus:border-wa focus:outline-none focus:ring-2 focus:ring-wa/10"
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
              className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 focus:border-wa focus:outline-none focus:ring-2 focus:ring-wa/10"
            />
          </div>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-wa hover:bg-waDark disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3.5 rounded-full font-bold transition inline-flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Accesso...
            </>
          ) : (
            <>
              Accedi
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        Non hai un account?{" "}
        <Link href="/signup" className="text-wa font-semibold hover:underline">
          Registrati gratis
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-soft to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="block text-center mb-8">
          <span className="text-3xl font-bold text-night">
            Prenot<span className="text-wa">ly</span>
          </span>
        </Link>
        <Suspense fallback={<div className="text-center text-gray-500">Caricamento...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
