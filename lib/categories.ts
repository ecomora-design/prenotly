export const CATEGORIES = [
  { slug: 'ristoranti', name: 'Ristoranti', description: 'Prenota un tavolo nei migliori ristoranti.' },
  { slug: 'pizzerie', name: 'Pizzerie', description: 'Ordina o prenota la tua pizza preferita.' },
  { slug: 'beauty', name: 'Centri Estetici', description: 'Prenota i tuoi trattamenti di bellezza.' },
  { slug: 'dentisti', name: 'Studi Dentistici', description: 'Fissa la tua prossima visita dentistica.' },
  { slug: 'parrucchieri', name: 'Parrucchieri', description: 'Prenota il tuo appuntamento dal parrucchiere.' },
]

export function getCategoryBySlug(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug)
}
