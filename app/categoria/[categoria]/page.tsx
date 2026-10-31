import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCategoryBySlug, CATEGORIES } from '@/lib/categories'
import type { Metadata } from 'next'
import {
  Check, ArrowRight, Sparkles, HelpCircle,
  Calendar, Clock, Bell, Users, TrendingUp, BarChart3,
  MousePointerClick, Zap, ChevronDown, Star, AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AppButton from '@/components/AppButton'

type PageProps = { params: Promise<{ categoria: string }> }

const FEATURE_ICONS = [Calendar, Clock, Bell, Users, TrendingUp, BarChart3]
const STEP_ICONS = [MousePointerClick, Bell, Zap]

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categoria } = await params
  const category = getCategoryBySlug(categoria)
  if (!category) return { title: 'Categoria non trovata' }
  return {
    title: category.seoTitle,
    description: category.seoDescription,
    alternates: { canonical: '/categoria/' + category.slug },
  }
}

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ categoria: c.slug }))
}

export default async function CategoryPage({ params }: PageProps) {
  const { categoria } = await params
  const category = getCategoryBySlug(categoria)
  if (!category) notFound()

  const supabase = await createClient()
  const { data: tenants } = await supabase
    .from('tenants')
    .select('*')
    .eq('category', category.slug)

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* HERO 2 COLONNE */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 bg-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-b from-[#25D366]/[0.08] to-transparent rounded-full blur-3xl" />
        </div>
        <div className="container-x relative">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white border border-[#E6EBF1] rounded-full px-4 py-1.5 mb-6 shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />
                <span className="text-[11px] font-semibold text-[#0A2540]/70 uppercase tracking-wider">Soluzione per {category.name}</span>
              </div>
              <h1 className="text-[36px] leading-[1.05] md:text-5xl md:leading-[1.05] font-bold text-[#0A2540] tracking-[-0.03em] mb-6">
                {category.heroTitle}
              </h1>
              <p className="text-base md:text-lg text-[#425466] leading-relaxed mb-8">
                {category.heroSubtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Link
                  href="/signup"
                  className="group bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#128C7E] hover:to-[#0F766E] text-white px-7 py-4 rounded-full font-bold text-sm transition-all shadow-lg shadow-[#25D366]/30 inline-flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  Prova 7 giorni gratis
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-[#425466]/70">
                {["Nessuna carta richiesta", "Attivo in 10 minuti", "Disdici quando vuoi"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5 font-medium">
                    <Check size={14} className="text-[#22C55E]" strokeWidth={3} />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* MOCKUP DINAMICO */}
            <div className="relative">
              <div className="absolute inset-0 bg-[#25D366]/10 blur-3xl rounded-full" />
              <div className="relative bg-white rounded-2xl shadow-2xl shadow-[#0A2540]/20 p-5 border border-[#E6EBF1] max-w-sm mx-auto">
                <div className="flex items-center justify-between pb-4 border-b border-[#E6EBF1]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center text-white font-bold text-lg">
                      {category.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-[#0A2540] text-sm">{category.mockup.title}</p>
                      <p className="text-[11px] text-[#425466]/60">{category.name}</p>
                    </div>
                  </div>
                  <Star size={16} className="text-[#25D366] fill-[#25D366]" />
                </div>
                <div className="pt-4 space-y-2">
                  {category.mockup.items.map((apt, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-[#FAFBFC] rounded-xl border border-[#E6EBF1]">
                      <div className="w-14 h-12 rounded-lg bg-gradient-to-br from-[#25D366]/15 to-[#128C7E]/15 text-[#0A2540] flex flex-col items-center justify-center">
                        <span className="text-[10px] font-bold">{apt.time}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#0A2540] truncate">{apt.label}</p>
                        <p className="text-xs text-[#425466]/60">{apt.status}</p>
                      </div>
                      <div className={'w-2 h-2 rounded-full shrink-0 ' + (apt.status === 'Confermato' ? 'bg-[#22C55E]' : 'bg-amber-400')} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* IL PROBLEMA */}
      <section className="py-16 md:py-24 bg-[#0A2540] text-white">
        <div className="container-x max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-5">
              <AlertCircle size={12} className="text-[#25D366]" />
              <span className="text-[11px] font-semibold text-white/80 uppercase tracking-wider">Il problema</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight mb-4">
              Lo sai anche tu.<br />
              <span className="text-[#25D366]">Il sistema attuale non funziona.</span>
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Se gestisci {category.name.toLowerCase()} e ti riconosci in questi problemi, allora sei nel posto giusto.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {category.problems.map((problem, i) => (
              <div key={i} className="flex items-start gap-4 bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/[0.08] transition">
                <div className="text-2xl shrink-0">{problem.split(' ')[0]}</div>
                <p className="text-white/90 text-sm leading-relaxed">{problem.split(' ').slice(1).join(' ')}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COME FUNZIONA */}
      <section className="py-16 md:py-24 bg-[#FAFBFC]">
        <div className="container-x max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-white border border-[#E6EBF1] rounded-full px-4 py-1.5 mb-5 shadow-sm">
              <Sparkles size={12} className="text-[#25D366]" />
              <span className="text-[11px] font-semibold text-[#0A2540]/70 uppercase tracking-wider">Come funziona</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-[#0A2540] tracking-tight leading-tight mb-4">
              La soluzione.<br />
              <span className="text-[#425466]">In tre passaggi.</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {category.howItWorks.map((step, i) => {
              const Icon = STEP_ICONS[i] || Zap
              return (
                <div key={i} className="group bg-white rounded-3xl p-7 border border-[#E6EBF1] hover:border-[#25D366]/30 hover:shadow-xl transition-all relative">
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center text-white shadow-lg shadow-[#25D366]/30 group-hover:scale-110 transition-transform">
                      <Icon size={22} strokeWidth={2} />
                    </div>
                    <span className="text-5xl font-bold text-[#0A2540]/[0.06] tracking-tighter">0{step.step}</span>
                  </div>
                  <h3 className="font-bold text-[#0A2540] mb-2 text-lg leading-tight">{step.title}</h3>
                  <p className="text-sm text-[#425466] leading-relaxed">{step.text}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-x max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-white border border-[#E6EBF1] rounded-full px-4 py-1.5 mb-5 shadow-sm">
              <Sparkles size={12} className="text-[#25D366]" />
              <span className="text-[11px] font-semibold text-[#0A2540]/70 uppercase tracking-wider">Cosa ottieni</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-[#0A2540] tracking-tight leading-tight">
              Tutto quello<br />
              <span className="text-[#425466]">che ti serve.</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {category.features.map((feature, i) => {
              const Icon = FEATURE_ICONS[i] || Check
              return (
                <div key={i} className="group bg-white rounded-2xl p-6 border border-[#E6EBF1] hover:border-[#25D366]/30 hover:shadow-lg transition-all">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#25D366]/15 to-[#128C7E]/15 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon size={20} className="text-[#128C7E]" strokeWidth={2} />
                  </div>
                  <p className="text-sm font-semibold text-[#0A2540] leading-relaxed">{feature}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* PIANO CONSIGLIATO */}
      <section className="py-16 md:py-24 bg-[#FAFBFC]">
        <div className="container-x max-w-md mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-bold text-[#0A2540] tracking-tight leading-tight mb-4">
              Meno di 1€<br />
              <span className="text-[#425466]">al giorno.</span>
            </h2>
            <p className="text-[#425466] mt-4">{category.recommendedPlan.description}</p>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#25D366]/30 to-[#128C7E]/30 blur-2xl rounded-full opacity-60" />
            <div className="relative bg-white rounded-3xl p-8 border-2 border-[#25D366]/20 shadow-2xl shadow-[#25D366]/10">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bold text-[#0A2540]">{category.recommendedPlan.name}</h3>
                <span className="inline-flex items-center gap-1 bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                  <Star size={10} className="fill-white" /> Consigliato
                </span>
              </div>
              <div className="flex items-baseline gap-1 mb-4 pb-4 border-b border-[#E6EBF1]">
                <span className="text-xs font-semibold text-[#425466]">€</span>
                <span className="text-5xl font-bold text-[#0A2540] tracking-tight">{category.recommendedPlan.price}</span>
                <span className="text-sm text-[#425466]/60 font-semibold">{category.recommendedPlan.period}</span>
              </div>
              <div className="bg-[#FFF8E1] border border-amber-200 rounded-xl p-3 mb-6">
                <p className="text-xs text-amber-900 leading-relaxed">
                  💡 <strong>Confronto onesto:</strong> {category.recommendedPlan.competitorNote}
                </p>
              </div>
              <ul className="space-y-3 mb-8">
                {category.recommendedPlan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm">
                    <div className="w-5 h-5 rounded-full bg-[#25D366]/15 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={11} className="text-[#128C7E]" strokeWidth={3} />
                    </div>
                    <span className="text-[#425466]">{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="w-full bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#128C7E] hover:to-[#0F766E] text-white py-4 rounded-full font-bold text-sm transition inline-flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/30 active:scale-[0.98]"
              >
                Prova 7 giorni gratis
                <ArrowRight size={15} />
              </Link>
              <p className="text-[10px] text-[#425466]/50 text-center mt-3">Nessuna carta richiesta · Disdici quando vuoi</p>
            </div>
          </div>
        </div>
      </section>

      {/* ATTIVITÀ */}
      {tenants && tenants.length > 0 && (
        <section className="py-16 md:py-24 bg-white">
          <div className="container-x max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-[#0A2540] mb-4">Chi ci ha già scelto</h2>
              <p className="text-[#425466]">Scopri chi ha già scelto la nostra soluzione per {category.name.toLowerCase()}.</p>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tenants.map((tenant) => (
                <li key={tenant.id} className="bg-[#FAFBFC] border border-[#E6EBF1] p-6 rounded-2xl shadow-sm hover:border-[#25D366]/30 hover:shadow-md transition-all">
                  <a href={'/' + tenant.slug} className="text-base font-bold text-[#0A2540] hover:text-[#25D366] transition flex items-center justify-between gap-2">
                    <span className="truncate">{tenant.business_name}</span>
                    <ArrowRight size={16} className="shrink-0" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-[#FAFBFC]">
        <div className="container-x max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-white border border-[#E6EBF1] rounded-full px-4 py-1.5 mb-5 shadow-sm">
              <HelpCircle size={12} className="text-[#25D366]" />
              <span className="text-[11px] font-semibold text-[#0A2540]/70 uppercase tracking-wider">Domande frequenti</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-[#0A2540] tracking-tight leading-tight">
              Le domande<br />
              <span className="text-[#425466]">più comuni.</span>
            </h2>
          </div>
          <div className="space-y-3">
            {category.faqs.map((faq, i) => (
              <details key={i} className="group bg-white rounded-2xl border border-[#E6EBF1] overflow-hidden hover:border-[#25D366]/30 transition">
                <summary className="flex items-center justify-between gap-4 p-5 cursor-pointer list-none">
                  <h3 className="font-bold text-[#0A2540] text-[15px] leading-tight">{faq.q}</h3>
                  <div className="shrink-0 w-8 h-8 rounded-full bg-[#FAFBFC] flex items-center justify-center group-open:bg-[#25D366]/15 transition">
                    <ChevronDown size={16} className="text-[#0A2540] transition-transform group-open:rotate-180" />
                  </div>
                </summary>
                <div className="px-5 pb-5 text-sm text-[#425466] leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINALE */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-x max-w-4xl">
          <div className="relative rounded-[40px] overflow-hidden bg-gradient-to-br from-[#0A2540] via-[#0A2540] to-[#128C7E] p-10 md:p-16 text-white text-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#25D366]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-[1.1] mb-4">
                Prova gratis.<br />
                <span className="text-[#25D366]">Poi decidi tu.</span>
              </h2>
              <p className="text-white/70 text-base md:text-lg mb-8 max-w-lg mx-auto">
                7 giorni di prova completa. Nessuna carta richiesta. Se non ti convince, un click e sei fuori.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-white hover:bg-[#FAFBFC] text-[#0A2540] px-8 py-4 rounded-full font-bold text-sm transition shadow-xl active:scale-[0.98]"
              >
                Inizia adesso
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <AppButton />
    </main>
  )
}
