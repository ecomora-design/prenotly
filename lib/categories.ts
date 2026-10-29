export const CATEGORIES = [
  {
    slug: 'ristoranti',
    name: 'Ristoranti',
    seoTitle: 'Software di Prenotazione per Ristoranti | Prenotly',
    seoDescription: 'Gestisci tavoli, turni e ordini con il software di prenotazione per ristoranti che riduce i no-show. Prova Prenotly gratis per 48 ore.',
    heroTitle: 'Il software di prenotazione pensato per i ristoranti.',
    heroSubtitle: 'Menu digitale, gestione tavoli e ordini d\'asporto. I tuoi clienti prenotano online, tu riempi la sala senza telefonate.',
    features: [
      'Gestione turni e capienza in tempo reale',
      'Promemoria automatici per ridurre i no-show',
      'Menu digitale con allergeni e prezzi',
      'Ordini d\'asporto e domicilio integrati',
      'Dashboard con statistiche sui coperti'
    ]
  },
  {
    slug: 'pizzerie',
    name: 'Pizzerie',
    seoTitle: 'Gestionale per Pizzerie: Prenotazioni e Asporto | Prenotly',
    seoDescription: 'Il software per pizzerie che gestisce prenotazioni tavoli e ordini d\'asporto in un unico posto. Semplifica il lavoro in cucina.',
    heroTitle: 'Più pizze, meno caos.',
    heroSubtitle: 'Gestisci le prenotazioni dei tavoli e gli ordini d\'asporto contemporaneamente. Il gestionale perfetto per la tua pizzeria.',
    features: [
      'Prenotazioni tavoli con slot orari',
      'Ordini d\'asporto senza commissioni',
      'Invio comande in cucina',
      'Storico clienti e preferenze',
      'Statistiche sulle pizze più vendute'
    ]
  },
  {
    slug: 'servizi',
    name: 'Servizi e Professionisti',
    seoTitle: 'Software per Appuntamenti e Consulenze | Prenotly',
    seoDescription: 'Il software di prenotazione per consulenti, avvocati, centri benessere e tutti i professionisti. Agenda intelligente e sync con Google Calendar.',
    heroTitle: 'La tua agenda, sempre in ordine.',
    heroSubtitle: 'Per consulenti, centri benessere, avvocati e tutti i professionisti che lavorano su appuntamento. I clienti prenotano, tu lavori.',
    features: [
      'Agenda intelligente con slot liberi',
      'Sincronizzazione con Google Calendar',
      'Durata variabile per i servizi',
      'Pagamenti in-app (opzionale)',
      'Promemoria anti no-show'
    ]
  },
  {
    slug: 'dentisti',
    name: 'Studi Dentistici',
    seoTitle: 'Software di Prenotazione per Dentisti | Prenotly',
    seoDescription: 'Gestionale per studi dentistici: agenda intelligente, promemoria per i pazienti e sincronizzazione con Google Calendar. Prova la demo.',
    heroTitle: 'Meno telefonate, più pazienti.',
    heroSubtitle: 'Il software che aiuta il tuo studio dentistico a gestire le visite, ridurre le assenze e organizzare l\'agenda in automatico.',
    features: [
      'Agenda medica con slot dedicati',
      'Promemoria via App per i pazienti',
      'Gestione delle urgenze',
      'Sincronizzazione con Google Calendar',
      'Fascicolo cliente integrato'
    ]
  },
  {
    slug: 'parrucchieri',
    name: 'Parrucchieri ed Estetisti',
    seoTitle: 'Gestionale per Parrucchieri ed Estetisti | Prenotly',
    seoDescription: 'Software di prenotazione per parrucchieri e centri estetici. Gestisci i servizi, gli operatori e l\'agenda in un unico posto.',
    heroTitle: 'Ogni taglio al suo posto.',
    heroSubtitle: 'Gestisci la tua agenda di parrucchiere o estetista senza stress. Servizi, durate e operatori sempre sotto controllo.',
    features: [
      'Servizi con durata personalizzata',
      'Multi-operatore (gestisci il tuo team)',
      'Agenda con sync Google Calendar',
      'Promemoria per i clienti',
      'Statistiche sui servizi più richiesti'
    ]
  }
]

export function getCategoryBySlug(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug)
}
