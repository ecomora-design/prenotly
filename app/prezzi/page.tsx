import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AppButton from "@/components/AppButton";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, Check, X, MessageCircle, Sparkles,
  Utensils, Scissors, Code2, Shield, Zap, Users, Clock,
  CreditCard, Headphones, TrendingUp, Star, Lock, Crown, QrCode
} from "lucide-react";

export const metadata = {
  title: "Prezzi — Prenotly Menu, Food, Premium, Servizi e Service",
  description:
    "Prenotly Menu da €9,99/mese, Food da €29,99/mese, Premium Pro da €99,99/mese. Servizi €29,99/mese. Service su preventivo. Demo gratuita 48 ore.",
};

export default function PrezziPage() {
  const foodPlans = [
    {
      id: "food_menu",
      icon: Utensils,
      name: "Menu Digitale",
      subtitle: "Solo visualizzazione",
      description: "Il menu del tuo locale online, sempre aggiornato e accessibile via QR Code.",
      price: "9,99",
      color: "#64748B",
      features: [
        "Menu digitale personalizzabile",
        "Categorie, foto e allergeni",
        "QR Code per il tavolo",
        "Web app brandizzata",
        "Aggiornamenti illimitati",
      ],
      upgradeNote: "Nessun ordine o prenotazione incluso",
      cta: "Attiva Menu",
      highlight: false,
      link: "/signup?plan=food_menu",
    },
    {
      id: "food_standard",
      icon: CalendarIcon,
      name: "Food + Ordini",
      subtitle: "Menu, Ordini e Tavoli",
      description: "Tutto il necessario per gestire ordini e prenotazioni in un unico strumento.",
      price: "29,99",
      color: "#25D366",
      features: [
        "✨ Tutto del Menu Digitale",
        "🛍️ Ordini asporto e domicilio",
        "📅 Prenotazione tavoli online",
        "🔔 Notifiche realtime in dashboard",
        "👥 Gestione capienza e turni",
        "📊 Statistiche di base",
      ],
      upgradeNote: null,
      cta: "Attiva Food",
      highlight: true,
      badge: "POPOLARE",
      link: "/signup?plan=food_standard",
    },
    {
      id: "food_premium",
      icon: Crown,
      name: "Premium Pro",
      subtitle: "Pagamenti, QR e Fatturazione",
      description: "Software completo con pagamenti, ordini da QR e fatturazione automatica.",
      price: "99,99",
      color: "#8B5CF6",
      features: [
        "✨ Tutto di Food + Ordini",
        "💳 Pagamenti in-app (Stripe)",
        "📱 Ordini diretti da QR Code",
        "🧾 Fatturazione automatica",
        "🗄️ Database e report su misura",
        "🔒 Sicurezza avanzata",
      ],
      upgradeNote: "Software interno per comande e cucina",
      cta: "Attiva Premium",
      highlight: false,
      badge: "TUTTO INCLUSO",
      link: "/signup?plan=food_premium",
    },
  ];

  const otherPlans = [
    {
      id: "servizi",
      icon: Scissors,
      name: "Prenotly Servizi",
      subtitle: "Agenda intelligente",
      description: "Per parrucchieri, estetiste, studi e professionisti su appuntamento.",
      price: "29,99",
      color: "#8B5CF6",
      features: [
        "Agenda intelligente",
        "Prenotazioni con slot in tempo reale",
        "Sync Google Calendar",
        "Promemoria anti no-show",
        "Multi-operatore",
      ],
      cta: "Attiva Servizi",
      link: "/signup?plan=servizi",
    },
    {
      id: "service",
      icon: Code2,
      name: "Prenotly Service",
      subtitle: "Software su misura",
      description: "Hai esigenze particolari? Progettiamo un software completamente custom.",
      price: null,
      color: "#3B82F6",
      features: [
        "Analisi delle esigenze",
        "Progettazione UX/UI",
        "Sviluppo completamente custom",
        "Integrazione con i tuoi strumenti",
        "Supporto dedicato",
      ],
      cta: "Richiedi preventivo",
      link: "https://wa.me/393934842118?text=Ciao%20Prenotly!%20Vorrei%20un%20preventivo%20per%20un%20software%20su%20misura",
    },
  ];

  const reasons = [
    { icon: Zap, title: "Attivo in 10 minuti", text: "Registrati, configuri e la tua web app è subito online. Nessuna installazione." },
    { icon: Clock, title: "Demo gratuita 48 ore", text: "Provi tutto gratis per 48 ore. Se ti piace attivi, altrimenti non paghi nulla." },
    { icon: Shield, title: "Disdici quando vuoi", text: "Nessun vincolo, nessuna penale. Se non fa per te, un click e sei fuori." },
    { icon: CreditCard, title: "Pagamento sicuro", text: "Carta o IBAN dalla dashboard. Fatturazione elettronica inclusa." },
    { icon: Headphones, title: "Supporto in italiano", text: "Ti aiutiamo via App, sempre. Anche quando configuri la prima volta." },
    { icon: TrendingUp, title: "Zero commissioni", text: "Nessuna commissione sulle tue prenotazioni o ordini. Paghi solo l'abbonamento." },
  ];

  return (
    <main>
      <Navbar />

      {/* HERO */}
      <section className="relative pt-28 pb-12 md:pt-40 md:pb-20 bg-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-[#25D366]/[0.08] to-transparent rounded-full blur-3xl" />
        </div>

        <div className="container-x relative max-w-3xl text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#425466] hover:text-[#0A2540] mb-8 transition">
            <ArrowLeft size={16} /> Torna alla home
          </Link>

          <div className="inline-flex items-center gap-2 bg-white border border-[#E6EBF1] rounded-full px-4 py-1.5 mb-6 shadow-sm">
            <Sparkles size={12} className="text-[#25D366]" />
            <span className="text-[11px] font-semibold text-[#0A2540]/70">Prezzi chiari, nessuna sorpresa</span>
          </div>

          <h1 className="text-[40px] leading-[1.05] md:text-6xl md:leading-[1.02] font-bold text-[#0A2540] tracking-[-0.03em] mb-6">
            Il prezzo giusto per<br />
            <span className="bg-gradient-to-r from-[#128C7E] via-[#25D366] to-[#0F766E] bg-clip-text text-transparent">
              far crescere il locale.
            </span>
          </h1>
          <p className="text-[#425466] text-base md:text-xl leading-relaxed max-w-2xl mx-auto">
            Scegli il piano adatto a te: dal menu base a <strong className="text-[#0A2540]">9,99 €/mese</strong> fino al software completo con pagamenti e QR. <strong className="text-[#0A2540]">Demo 48 ore gratis</strong>, nessuna carta richiesta.
          </p>
        </div>
      </section>

      {/* PIANI FOOD */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container-x">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-[10px] font-black text-[#25D366] uppercase tracking-[0.3em] mb-3">Per ristoranti e locali</p>
            <h2 className="text-3xl md:text-5xl font-bold text-[#0A2540] tracking-tight">
              I piani <span className="bg-gradient-to-r from-[#128C7E] to-[#25D366] bg-clip-text text-transparent">Food</span>.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {foodPlans.map((plan) => {
              const Icon = plan.icon;
              return (
                <div
                  key={plan.id}
                  className={"relative flex flex-col bg-white rounded-3xl p-7 md:p-8 transition-all " +
                    (plan.highlight
                      ? "border-2 border-[#25D366]/30 shadow-2xl shadow-[#25D366]/10 md:scale-[1.02]"
                      : "border border-[#E6EBF1] hover:border-[#0A2540]/20 hover:shadow-lg")
                  }
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg">
                        <Star size={10} fill="white" /> {plan.badge}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: plan.color + "15" }}>
                      <Icon size={22} style={{ color: plan.color }} strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#0A2540] leading-tight">{plan.name}</h3>
                      <p className="text-xs text-[#425466]/70 mt-0.5">{plan.subtitle}</p>
                    </div>
                  </div>

                  <p className="text-sm text-[#425466] leading-relaxed mb-6 min-h-[40px]">
                    {plan.description}
                  </p>

                  <div className="pb-6 mb-6 border-b border-[#E6EBF1]">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs font-semibold text-[#425466]">€</span>
                      <span className="text-5xl font-bold text-[#0A2540] tracking-tight">{plan.price}</span>
                      <span className="text-sm text-[#425466]/60 font-semibold">/mese</span>
                    </div>
                    <p className="text-[11px] text-[#425466]/60 mt-2">Fatturazione mensile + IVA</p>
                  </div>

                  <ul className="space-y-2.5 mb-6 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: plan.color + "15" }}>
                          <Check size={10} style={{ color: plan.color }} strokeWidth={3} />
                        </div>
                        <span className="text-[#425466]">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.upgradeNote && (
                    <div className="mb-5 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-100 text-[11px] font-bold text-amber-800 flex items-start gap-1.5">
                      <Sparkles size={11} className="shrink-0 mt-0.5" />
                      <span>{plan.upgradeNote}</span>
                    </div>
                  )}

                  <Link
                    href={plan.link}
                    className={"group inline-flex items-center justify-center gap-2 py-3.5 rounded-full font-bold text-sm transition-all active:scale-[0.98] " +
                      (plan.highlight
                        ? "bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#128C7E] hover:to-[#0F766E] text-white shadow-lg shadow-[#25D366]/30"
                        : "bg-[#0A2540] hover:bg-[#0A2540]/90 text-white")
                    }
                  >
                    {plan.cta}
                    <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                  </Link>

                  <p className="text-[10px] text-[#425466]/50 text-center mt-3">✓ Demo gratuita 48 ore inclusa</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ALTRI PIANI */}
      <section className="py-16 md:py-24 bg-[#FAFBFC]">
        <div className="container-x">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-[10px] font-black text-[#8B5CF6] uppercase tracking-[0.3em] mb-3">Per altri settori</p>
            <h2 className="text-3xl md:text-5xl font-bold text-[#0A2540] tracking-tight">
              Servizi e <span className="text-[#3B82F6]">Service</span>.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {otherPlans.map((plan) => {
              const Icon = plan.icon;
              const isExternal = plan.link.startsWith("http");
              return (
                <div key={plan.id} className="relative flex flex-col bg-white rounded-3xl p-7 md:p-8 border border-[#E6EBF1] hover:border-[#0A2540]/20 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: plan.color + "15" }}>
                      <Icon size={22} style={{ color: plan.color }} strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#0A2540] leading-tight">{plan.name}</h3>
                      <p className="text-xs text-[#425466]/70 mt-0.5">{plan.subtitle}</p>
                    </div>
                  </div>

                  <p className="text-sm text-[#425466] leading-relaxed mb-6 min-h-[40px]">{plan.description}</p>

                  <div className="pb-6 mb-6 border-b border-[#E6EBF1]">
                    {plan.price ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs font-semibold text-[#425466]">€</span>
                        <span className="text-5xl font-bold text-[#0A2540] tracking-tight">{plan.price}</span>
                        <span className="text-sm text-[#425466]/60 font-semibold">/mese</span>
                      </div>
                    ) : (
                      <div>
                        <p className="text-3xl font-bold text-[#0A2540] tracking-tight">Su preventivo</p>
                        <p className="text-xs text-[#425466]/60 mt-1">Gratuito e senza impegno</p>
                      </div>
                    )}
                    {plan.price && <p className="text-[11px] text-[#425466]/60 mt-2">Fatturazione mensile + IVA</p>}
                  </div>

                  <ul className="space-y-2.5 mb-6 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: plan.color + "15" }}>
                          <Check size={10} style={{ color: plan.color }} strokeWidth={3} />
                        </div>
                        <span className="text-[#425466]">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {isExternal ? (
                    <a
                      href={plan.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center justify-center gap-2 py-3.5 rounded-full font-bold text-sm transition-all active:scale-[0.98] bg-white border-2 border-[#0A2540] text-[#0A2540] hover:bg-[#0A2540] hover:text-white"
                    >
                      <MessageCircle size={15} />
                      {plan.cta}
                    </a>
                  ) : (
                    <Link
                      href={plan.link}
                      className="group inline-flex items-center justify-center gap-2 py-3.5 rounded-full font-bold text-sm transition-all active:scale-[0.98] bg-[#0A2540] hover:bg-[#0A2540]/90 text-white"
                    >
                      {plan.cta}
                      <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PERCHÉ SCEGLIERCI */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-x">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-white border border-[#E6EBF1] rounded-full px-4 py-1.5 mb-5 shadow-sm">
              <Sparkles size={12} className="text-[#25D366]" />
              <span className="text-[11px] font-semibold text-[#0A2540]/70 uppercase tracking-wider">Perché Prenotly</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-[#0A2540] tracking-tight leading-tight">
              Sei buone ragioni<br />
              <span className="text-[#425466]">per iniziare oggi.</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {reasons.map((r) => (
              <div key={r.title} className="group bg-white p-6 rounded-2xl border border-[#E6EBF1] hover:border-[#25D366]/30 hover:shadow-lg transition-all">
                <div className="w-11 h-11 rounded-xl bg-[#25D366]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <r.icon className="text-[#128C7E]" size={20} strokeWidth={2} />
                </div>
                <h3 className="font-bold text-[#0A2540] mb-1.5 text-sm">{r.title}</h3>
                <p className="text-xs text-[#425466] leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONFRONTO */}
      <section className="py-16 md:py-24 bg-[#FAFBFC]">
        <div className="container-x max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-5xl font-bold text-[#0A2540] tracking-tight leading-tight mb-4">
              La differenza è netta.
            </h2>
            <p className="text-[#425466] text-base md:text-lg">Prenotly vs i metodi tradizionali</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-red-50/50 rounded-3xl p-7 border border-red-100">
              <h3 className="text-lg font-bold text-red-600 mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <X size={16} className="text-red-600" strokeWidth={3} />
                </div>
                Senza Prenotly
              </h3>
              <ul className="space-y-3 text-[#425466] text-sm">
                {[
                  "Telefono che squilla mentre lavori",
                  "Prenotazioni scritte su carta",
                  "Clienti che non si presentano (30% no-show)",
                  "Commissioni su ogni prenotazione",
                  "Nessuna visibilità su ordini e agenda",
                  "Zero dati per decidere",
                ].map((t, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                      <X size={9} className="text-red-500" strokeWidth={3} />
                    </div>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#25D366]/[0.05] rounded-3xl p-7 border border-[#25D366]/20">
              <h3 className="text-lg font-bold text-[#128C7E] mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#25D366]/15 flex items-center justify-center">
                  <Check size={16} className="text-[#128C7E]" strokeWidth={3} />
                </div>
                Con Prenotly
              </h3>
              <ul className="space-y-3 text-[#425466] text-sm">
                {[
                  "Notifiche realtime in dashboard 24/7",
                  "Agenda digitale sempre aggiornata",
                  "Promemoria anti no-show (fino -80%)",
                  "Zero commissioni sulle prenotazioni",
                  "Dashboard con statistiche in tempo reale",
                  "Dati per far crescere l'attività",
                ].map((t, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-[#25D366]/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={9} className="text-[#128C7E]" strokeWidth={3} />
                    </div>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FIDUCIA */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-x max-w-3xl text-center">
          <div className="flex justify-center gap-1 mb-5">
            {[1,2,3,4,5].map((i) => (
              <Star key={i} size={20} className="fill-[#25D366] text-[#25D366]" />
            ))}
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-[#0A2540] tracking-tight leading-tight mb-4">
            Provalo 48 ore gratis.<br />
            <span className="text-[#425466]">Poi decidi.</span>
          </h2>
          <p className="text-[#425466] text-base md:text-lg mb-8 max-w-lg mx-auto">
            Nessuna carta di credito richiesta per iniziare.<br className="hidden md:block" />
            Se in 48 ore capisci che non fa per te, non paghi nulla.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="group bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#128C7E] hover:to-[#0F766E] text-white px-8 py-4 rounded-full font-bold text-sm transition-all shadow-lg shadow-[#25D366]/30 hover:shadow-xl inline-flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              Inizia la demo gratuita
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="https://wa.me/393934842118?text=Ciao%20Prenotly!%20Vorrei%20maggiori%20informazioni%20sui%20prezzi"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white hover:bg-[#FAFBFC] border border-[#E6EBF1] hover:border-[#0A2540]/20 text-[#0A2540] px-8 py-4 rounded-full font-bold text-sm transition inline-flex items-center justify-center gap-2"
            >
              <MessageCircle size={16} />
              Parla con noi
            </a>
          </div>
        </div>
      </section>

      {/* CTA FINALE */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-x max-w-4xl">
          <div className="relative rounded-[40px] overflow-hidden bg-gradient-to-br from-[#0A2540] via-[#0A2540] to-[#128C7E] p-10 md:p-16 text-white text-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#25D366]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00D4FF]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-4 py-1.5 mb-6">
                <Lock size={12} className="text-[#25D366]" />
                <span className="text-[11px] font-semibold text-white/90">Pagamento sicuro · SSL</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-[1.1] mb-4">
                Pronto a far crescere<br />
                <span className="text-[#25D366]">la tua attività?</span>
              </h2>
              <p className="text-white/70 text-base md:text-lg mb-8 max-w-lg mx-auto">
                Attiva la demo gratuita 48 ore. Nessuna carta, nessun vincolo.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/signup"
                  className="group bg-white hover:bg-[#FAFBFC] text-[#0A2540] px-8 py-4 rounded-full font-bold text-sm transition-all shadow-xl inline-flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  Inizia ora
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <a
                  href="https://wa.me/393934842118?text=Ciao%20Prenotly!"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-white/30 hover:bg-white/10 text-white px-8 py-4 rounded-full font-bold text-sm transition inline-flex items-center justify-center gap-2"
                >
                  <MessageCircle size={16} />
                  Parla con noi
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <AppButton />
    </main>
  );
}

// Icona calendar (per non importare Calendar già usato)
function CalendarIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}
