import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCategoryBySlug, CATEGORIES } from '@/lib/categories'
import type { Metadata } from 'next'
import { Check, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

export async function generateMetadata({ params }: { params: { categoria: string } }): Promise<Metadata> {
  const category = getCategoryBySlug(params.categoria)
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

export default async function CategoryPage({ params }: { params: { categoria: string } }) {
  const category = getCategoryBySlug(params.categoria)
  if (!category) notFound()

  const supabase = await createClient()
  const { data: tenants } = await supabase
    .from('tenants')
    .select('*')
    .eq('category', category.slug)

  return (
    <main className="min-h-screen bg-white">
      {/* HERO SECTION */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 bg-[#FAFBFC] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-b from-[#25D366]/[0.08] to-transparent rounded-full blur-3xl" />
        </div>
        <div className="container-x relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-[#E6EBF1] rounded-full px-4 py-1.5 mb-6 shadow-sm">
            <Sparkles size={12} className="text-[#25D366]" />
            <span className="text-[11px] font-semibold text-[#0A2540]/70 uppercase tracking-wider">Soluzione per {category.name}</span>
          </div>
          <h1 className="text-[36px] leading-[1.1] md:text-5xl md:leading-[1.1] font-bold text-[#0A2540] tracking-tight mb-6">
            {category.heroTitle}
          </h1>
          <p className="text-base md:text-lg text-[#425466] leading-relaxed mb-8 max-w-2xl mx-auto">
            {category.heroSubtitle}
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white px-8 py-4 rounded-full font-bold text-sm transition shadow-lg shadow-[#25D366]/30 active:scale-[0.98]"
          >
            Prova 48 ore gratis
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* FEATURES SPECIFICHE */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-x max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-[#0A2540] mb-4">
              Perché scegliere Prenotly per {category.name}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {category.features.map((feature, i) => (
              <div key={i} className="flex items-start gap-3 bg-[#FAFBFC] p-5 rounded-xl border border-[#E6EBF1]">
                <div className="w-6 h-6 rounded-full bg-[#25D366]/15 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={14} className="text-[#128C7E]" strokeWidth={3} />
                </div>
                <span className="text-[#0A2540] font-medium text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ELENCO ATTIVITA' (se presenti) */}
      <section className="py-16 md:py-24 bg-[#FAFBFC]">
        <div className="container-x max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-[#0A2540] mb-4">
              Attività che usano Prenotly
            </h2>
            <p className="text-[#425466]">
              Scopri chi ha già scelto la nostra soluzione per {category.name.toLowerCase()}.
            </p>
          </div>
          {(!tenants || tenants.length === 0) ? (
            <div className="text-center p-10 bg-white rounded-2xl border border-dashed border-[#E6EBF1]">
              <p className="text-[#425466]">Nessuna attività in questa categoria per ora. Torna presto!</p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tenants.map((tenant) => (
                <li key={tenant.id} className="bg-white border border-[#E6EBF1] p-6 rounded-xl shadow-sm hover:border-[#25D366]/30 transition">
                  <a href={'/' + tenant.slug} className="text-lg font-bold text-[#0A2540] hover:text-[#25D366] transition flex items-center justify-between">
                    {tenant.business_name}
                    <ArrowRight size={16} />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  )
}
