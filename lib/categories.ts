export const CATEGORIES = [
  { slug: 'ristoranti', name: 'Ristoranti', description: 'Prenota un tavolo nei migliori ristoranti.' },
  { slug: 'pizzerie', name: 'Pizzerie', description: 'Ordina o prenota la tua pizza preferita.' },
  { slug: 'servizi', name: 'Servizi e Professionisti', description: 'Prenota consulenze, visite e appuntamenti.' },
  { slug: 'dentisti', name: 'Studi Dentistici', description: 'Fissa la tua prossima visita dentistica.' },
  { slug: 'parrucchieri', name: 'Parrucchieri ed Estetisti', description: 'Prenota il tuo appuntamento per bellezza e cura.' },
]

export function getCategoryBySlug(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug)
}
