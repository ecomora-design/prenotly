"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Mail, Lock, User, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/onboarding");
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-soft to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="block text-center mb-8">
          <span className="text-3xl font-bold text-night">
            Prenot<span className="text-wa">ly</span>
          </span>
        </Link>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-night mb-2">Crea il tuo account</h1>
            <p className="text-sm text-gray-500">14 giorni gratis. Nessuna carta di credito.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-night mb-2 block">Nome e cognome</span>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Mario Rossi"
                  required
                  className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 focus:border-wa focus:outline-none focus:ring-2 focus:ring-wa/10"
                />
              </div>
            </label>

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
                  placeholder="Minimo 6 caratteri"
                  required
                  minLength={6}
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
                  Creazione account...
                </>
              ) : (
                <>
                  Crea account
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Hai già un account?{" "}
            <Link href="/login" className="text-wa font-semibold hover:underline">
              Accedi
            </Link>
          </div>
        </div>

        <ul className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-gray-500">
          {["14 giorni gratis", "Nessuna carta", "Disdici quando vuoi"].map((t) => (
            <li key={t} className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-wa" /> {t}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
