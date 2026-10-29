import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCategoryBySlug, CATEGORIES } from '@/lib/categories'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { categoria: string } }): Promise<Metadata> {
  const category = getCategoryBySlug(params.categoria)
  if (!category) return { title: 'Categoria non trovata' }
  return {
    title: category.name + ' | Prenotly',
    description: category.description,
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
    <div className="p-10 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{category.name}</h1>
      <p className="text-gray-600 mb-8">{category.description}</p>
      {(!tenants || tenants.length === 0) ? (
        <p>Nessuna attività trovata in questa categoria per ora.</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tenants.map((tenant) => (
            <li key={tenant.id} className="border p-4 rounded-lg shadow-sm">
              <a href={'/' + tenant.slug} className="text-lg font-semibold text-blue-600 hover:underline">
                {tenant.business_name}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
