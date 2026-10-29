import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const baseUrl = 'https://www.prenotly-italia.it'

  const staticPages = ['', '/prezzi', '/pro', '/ristoranti', '/login', '/signup'].map((route) => ({
    url: baseUrl + route,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }))

  const { data: tenants } = await supabase.from('tenants').select('slug, updated_at')
  const tenantPages = (tenants ?? []).map((t) => ({
    url: baseUrl + '/' + t.slug,
    lastModified: t.updated_at ? new Date(t.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const categories = ['ristoranti', 'beauty', 'dentisti', 'parrucchieri']
  const categoryPages = categories.map((cat) => ({
    url: baseUrl + '/categoria/' + cat,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...tenantPages, ...categoryPages]
}
