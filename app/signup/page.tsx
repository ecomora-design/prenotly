"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import {
  Mail, Lock, User, ArrowRight, Loader2, Check,
  Eye, EyeOff, Sparkles, Clock, Euro, Zap,
  Shield, Smartphone, CheckCircle2, X
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calcola forza password
  const passwordStrength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    return score;
  }, [password]);

  const strengthInfo = useMemo(() => {
    if (password.length === 0) return { label: "", color: "", width: "0%" };
    if (password.length < 8) return { label: "Troppo corta", color: "bg-red-500", width: "25%" };
    if (passwordStrength <= 2) return { label: "Debole", color: "bg-orange-500", width: "50%" };
    if (passwordStrength === 3) return { label: "Media", color: "bg-yellow-500", width: "75%" };
    return { label: "Forte", color: "bg-green-500", width: "100%" };
  }, [password, passwordStrength]);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const canSubmit = useMemo(() => {
    return (
      fullName.trim().length >= 2 &&
      isValidEmail(email) &&
      password.length >= 8 &&
      acceptTerms
    );
  }, [fullName, email, password, acceptTerms]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!canSubmit) {
      setError("Controlla i campi e accetta i termini.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim() },
        emailRedirectTo: `${window.location.origin}/onboarding`,
      },
    });

    if (error) {
      if (error.message.includes("already registered")) {
        setError("Questa email è già registrata. Prova ad accedere.");
      } else if (error.message.includes("rate limit")) {
        setError("Troppi tentativi. Riprova tra qualche minuto.");
      } else {
        setError(error.message);
      }
      setLoading(false);
      return;
    }

    router.push("/onboarding");
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-cream">
      {/* Navbar minimal */}
      <div className="absolute top-0 left-0 right-0 z-20 px-6 py-5">
        <Link href="/" className="text-xl font-bold text-night">
          Prenot<span className="text-waDark">ly</span>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* COLONNA SINISTRA — MARKETING */}
        <div className="hidden lg:flex flex-col justify-center bg-night text-white p-12 xl:p-20 relative overflow-hidden">
          {/* Decorazioni */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-wa/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-wa/10 rounded-full blur-3xl" />

          <div className="relative max-w-md">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-wa/20 text-wa rounded-full px-4 py-1.5 mb-8"
            >
              <Sparkles size={14} />
              <span className="text-xs font-bold uppercase tracking-wider">
                Prova gratuita 48 ore
              </span>
            </motion.div>

            {/* Titolo principale */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl xl:text-5xl font-bold tracking-tight leading-[1.1] mb-6"
            >
              In <span className="text-wa">10 minuti</span> la tua web app è online.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-white/70 text-lg leading-relaxed mb-10"
            >
              Menu, ordini e prenotazioni automatiche su App.
              Nessuna commissione. Nessuna app da scaricare.
            </motion.p>

            {/* Punti chiave */}
            <div className="space-y-5 mb-10">
              {[
                {
                  icon: Clock,
                  title: "Online in 10 minuti",
                  desc: "Registri, carichi menu o servizi, sei subito operativo.",
                },
                {
                  icon: Euro,
                  title: "Da 9,99 €/mese, zero commissioni",
                  desc: "Non tratteniamo nulla sui tuoi incassi.",
                },
                {
                  icon: Smartphone,
                  title: "App + Google Calendar",
                  desc: "Tutto integrato con gli strumenti che già usi.",
                },
                {
                  icon: Shield,
                  title: "Dati al sicuro",
                  desc: "GDPR compliant. Server in Europa.",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-wa/20 flex items-center justify-center shrink-0">
                    <item.icon size={18} className="text-wa" />
                  </div>
                  <div>
                    <p className="font-bold text-white">{item.title}</p>
                    <p className="text-sm text-white/60 mt-0.5">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Trust line */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="pt-8 border-t border-white/10"
            >
              <p className="text-sm text-white/50 mb-3">
                Già scelto da ristoranti e professionisti in tutta Italia
              </p>
              <div className="flex flex-wrap gap-2">
                {["Ristoranti", "Pizzerie", "Parrucchieri", "Studi", "Palestre"].map((t) => (
                  <span
                    key={t}
                    className="text-xs bg-white/5 text-white/70 px-3 py-1.5 rounded-full border border-white/10"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* COLONNA DESTRA — FORM */}
        <div className="flex flex-col justify-center px-6 md:px-12 py-16 lg:py-12 bg-white lg:bg-transparent">
          <div className="w-full max-w-md mx-auto">
            {/* Intro mobile (visibile solo su mobile) */}
            <div className="lg:hidden mb-8 text-center">
              <div className="inline-flex items-center gap-2 bg-night text-white rounded-full px-4 py-1.5 mb-5">
                <Sparkles size={12} className="text-wa" />
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  10 minuti · da 9,99 €/mese
                </span>
              </div>
              <h1 className="text-3xl font-bold text-night tracking-tight mb-3">
                La tua web app in 10 minuti
              </h1>
              <p className="text-night/60 text-sm">
                Prova gratuita 48 ore. Nessuna carta richiesta.
              </p>
            </div>

            {/* Header form desktop */}
            <div className="hidden lg:block mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-night tracking-tight mb-2">
                Crea il tuo account
              </h2>
              <p className="text-night/60 text-sm">
                Ci vogliono 30 secondi. Poi sei dentro.
              </p>
            </div>

            {/* Errore */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-100 text-red-600 rounded-2xl px-4 py-3 text-sm mb-5 flex items-start gap-2"
              >
                <X size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
              {/* Nome */}
              <label className="block">
                <span className="text-sm font-semibold text-night mb-2 block">
                  Nome e cognome
                </span>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Mario Rossi"
                    required
                    autoComplete="name"
                    className="w-full bg-cream border border-transparent rounded-2xl pl-11 pr-4 py-3.5 text-[15px] focus:bg-white focus:border-night/20 focus:outline-none transition"
                  />
                </div>
              </label>

              {/* Email */}
              <label className="block">
                <span className="text-sm font-semibold text-night mb-2 block">
                  Email
                </span>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tua@email.it"
                    required
                    autoComplete="email"
                    className="w-full bg-cream border border-transparent rounded-2xl pl-11 pr-4 py-3.5 text-[15px] focus:bg-white focus:border-night/20 focus:outline-none transition"
                  />
                  {email && isValidEmail(email) && (
                    <CheckCircle2 className="absolute right-3.5 top-1/2 -translate-y-1/2 text-green-500" size={18} />
                  )}
                </div>
              </label>

              {/* Password */}
              <label className="block">
                <span className="text-sm font-semibold text-night mb-2 block">
                  Password
                </span>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimo 8 caratteri"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="w-full bg-cream border border-transparent rounded-2xl pl-11 pr-12 py-3.5 text-[15px] focus:bg-white focus:border-night/20 focus:outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-night transition"
                    aria-label={showPassword ? "Nascondi password" : "Mostra password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Barra forza password */}
                {password.length > 0 && (
                  <div className="mt-2.5">
                    <div className="h-1 bg-cream rounded-full overflow-hidden">
                      <div
                        className={`h-full ${strengthInfo.color} transition-all duration-300`}
                        style={{ width: strengthInfo.width }}
                      />
                    </div>
                    <p className="text-xs text-night/50 mt-1.5 flex items-center gap-1.5">
                      <span>Sicurezza:</span>
                      <span className="font-semibold">{strengthInfo.label}</span>
                    </p>
                  </div>
                )}
              </label>

              {/* Checkbox termini */}
              <label className="flex items-start gap-3 cursor-pointer py-2">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 w-5 h-5 rounded border-gray-300 text-waDark focus:ring-waDark shrink-0 cursor-pointer"
                />
                <span className="text-xs text-night/60 leading-relaxed">
                  Accetto i{" "}
                  <Link href="/termini" target="_blank" className="text-waDark font-semibold underline">
                    Termini di Servizio
                  </Link>
                  {" "}e l&apos;
                  <Link href="/privacy" target="_blank" className="text-waDark font-semibold underline">
                    Informativa Privacy
                  </Link>
                  . Confermo di avere almeno 18 anni.
                </span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !canSubmit}
                className="w-full bg-night hover:bg-night/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold text-[15px] transition inline-flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg shadow-night/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Creazione account...
                  </>
                ) : (
                  <>
                    Inizia gratis
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <p className="text-xs text-night/50 text-center">
                Prova gratuita 48 ore · Nessuna carta richiesta
              </p>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-night/10" />
              <span className="text-xs text-night/40 font-semibold uppercase tracking-wider">
                oppure
              </span>
              <div className="flex-1 h-px bg-night/10" />
            </div>

            {/* Contatto App */}
            <a
              href="https://wa.me/message/LLEKTVFCRCPVB1"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full border border-night/15 hover:border-night text-night py-4 rounded-2xl font-semibold text-[15px] transition inline-flex items-center justify-center gap-2 active:scale-[0.98] bg-white"
            >
              Parla con noi prima
            </a>

            {/* Login link */}
            <p className="text-center text-sm text-night/60 mt-6">
              Hai già un account?{" "}
              <Link href="/login" className="text-waDark font-semibold hover:underline">
                Accedi
              </Link>
            </p>

            {/* Trust badges */}
            <div className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[11px] text-night/40">
              {[
                { icon: Shield, label: "GDPR compliant" },
                { icon: Zap, label: "Setup in 10 min" },
                { icon: Check, label: "Disdici quando vuoi" },
              ].map((b) => (
                <span key={b.label} className="flex items-center gap-1.5">
                  <b.icon size={12} />
                  {b.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
