export const CATEGORIES = [
  {
    slug: 'ristoranti',
    name: 'Ristoranti',
    seoTitle: 'Software di Prenotazione per Ristoranti | Prenotly',
    seoDescription: 'Gestisci tavoli, turni e ordini con il software di prenotazione per ristoranti che riduce i no-show. Prova Prenotly gratis per 48 ore.',
    heroTitle: 'Il software di prenotazione pensato per i ristoranti.',
    heroSubtitle: "Menu digitale, gestione tavoli e ordini d'asporto. I tuoi clienti prenotano online, tu riempi la sala senza telefonate.",
    features: [
      'Gestione turni e capienza in tempo reale',
      'Promemoria automatici per ridurre i no-show',
      'Menu digitale con allergeni e prezzi',
      "Ordini d'asporto e domicilio integrati",
      'Dashboard con statistiche sui coperti'
    ],
    howItWorks: [
      { step: '1', title: 'Il cliente prenota', text: 'Dal tuo link pubblico, senza scaricare app.' },
      { step: '2', title: 'Ricevi la notifica', text: 'Sul telefono, via App o email. Tavolo già assegnato.' },
      { step: '3', title: 'La sala si riempie', text: 'Niente telefonate, niente doppie prenotazioni.' }
    ],
    recommendedPlan: {
      name: 'Food + Ordini',
      price: '29,99',
      period: '/mese',
      description: 'Il piano perfetto per ristoranti che vogliono gestire tavoli e ordini.',
      features: [
        'Menu digitale personalizzabile',
        'Prenotazioni tavoli illimitate',
        "Ordini d'asporto e domicilio",
        'Dashboard con statistiche',
        'Zero commissioni'
      ]
    },
    faqs: [
      { q: "I miei clienti devono scaricare un'app?", a: 'No, prenotano dal browser in 30 secondi.' },
      { q: 'Posso gestire più sale?', a: 'Sì, ogni sala ha la sua capienza e i suoi turni.' },
      { q: 'Cosa succede se un cliente non si presenta?', a: "Prenotly gli invia un promemoria automatico prima dell'orario." }
    ]
  },
  {
    slug: 'pizzerie',
    name: 'Pizzerie',
    seoTitle: 'Gestionale per Pizzerie: Prenotazioni e Asporto | Prenotly',
    seoDescription: "Il software per pizzerie che gestisce prenotazioni tavoli e ordini d'asporto in un unico posto. Semplifica il lavoro in cucina.",
    heroTitle: 'Più pizze, meno caos.',
    heroSubtitle: "Gestisci le prenotazioni dei tavoli e gli ordini d'asporto contemporaneamente. Il gestionale perfetto per la tua pizzeria.",
    features: [
      'Prenotazioni tavoli con slot orari',
      "Ordini d'asporto senza commissioni",
      'Invio comande in cucina',
      'Storico clienti e preferenze',
      'Statistiche sulle pizze più vendute'
    ],
    howItWorks: [
      { step: '1', title: 'Il cliente ordina o prenota', text: 'Da un unico link, sia per tavoli che per asporto.' },
      { step: '2', title: 'La comanda arriva in cucina', text: 'Senza errori di trascrizione, con tutti i dettagli.' },
      { step: '3', title: 'Tu gestisci tutto da una dashboard', text: 'Ordini, tavoli e statistiche in tempo reale.' }
    ],
    recommendedPlan: {
      name: 'Food + Ordini',
      price: '29,99',
      period: '/mese',
      description: 'Il piano ideale per pizzerie con tavoli e servizio d\'asporto.',
      features: [
        'Prenotazioni tavoli illimitate',
        "Ordini d'asporto e domicilio",
        'Menu digitale personalizzabile',
        'Invio comande in cucina',
        'Zero commissioni'
      ]
    },
    faqs: [
      { q: "Devo pagare commissioni sugli ordini d'asporto?", a: 'No, zero commissioni. Paghi solo l\'abbonamento mensile.' },
      { q: 'Posso ricevere ordini anche quando sono chiuso?', a: 'Sì, gli ordini vengono salvati e li vedi appena riapri.' },
      { q: 'I clienti possono ordinare con lo stesso link delle prenotazioni?', a: 'Sì, un solo link gestisce sia tavoli che asporto.' }
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
    ],
    howItWorks: [
      { step: '1', title: 'Il cliente sceglie il servizio', text: 'Dal tuo link pubblico, con durata e prezzo visibili.' },
      { step: '2', title: 'Trova lo slot libero', text: "L'agenda mostra solo gli orari davvero disponibili." },
      { step: '3', title: 'Conferma e riceve il promemoria', text: "Tutto automatico, senza scambi di messaggi." }
    ],
    recommendedPlan: {
      name: 'Prenotly Pro',
      price: '29,99',
      period: '/mese',
      description: 'Il piano pensato per chi gestisce appuntamenti su prenotazione.',
      features: [
        'Agenda intelligente illimitata',
        'Sincronizzazione Google Calendar',
        'Promemoria anti no-show',
        'Multi-operatore (team)',
        'Zero commissioni'
      ]
    },
    faqs: [
      { q: 'Posso collegare la mia agenda Google?', a: 'Sì, la sincronizzazione è automatica e bidirezionale.' },
      { q: 'Posso gestire più servizi con durate diverse?', a: 'Sì, ogni servizio ha la sua durata e il suo prezzo.' },
      { q: 'I clienti possono pagare direttamente online?', a: 'Sì, con pagamenti in-app opzionali (Stripe integrato).' }
    ]
  },
  {
    slug: 'dentisti',
    name: 'Studi Dentistici',
    seoTitle: 'Software di Prenotazione per Dentisti | Prenotly',
    seoDescription: 'Gestionale per studi dentistici: agenda intelligente, promemoria per i pazienti e sincronizzazione con Google Calendar. Prova la demo.',
    heroTitle: 'Meno telefonate, più pazienti.',
    heroSubtitle: "Il software che aiuta il tuo studio dentistico a gestire le visite, ridurre le assenze e organizzare l'agenda in automatico.",
    features: [
      'Agenda medica con slot dedicati',
      'Promemoria via App per i pazienti',
      'Gestione delle urgenze',
      'Sincronizzazione con Google Calendar',
      'Fascicolo cliente integrato'
    ],
    howItWorks: [
      { step: '1', title: 'Il paziente prenota la visita', text: 'Dal link dello studio, senza telefonare.' },
      { step: '2', title: 'Riceve conferma e promemoria', text: 'Il giorno prima, in automatico, per ridurre i no-show.' },
      { step: '3', title: 'Tu hai tutto in agenda', text: 'Visite, urgenze e note del paziente in un unico posto.' }
    ],
    recommendedPlan: {
      name: 'Prenotly Pro',
      price: '29,99',
      period: '/mese',
      description: 'Il piano per studi dentistici che vogliono un\'agenda intelligente.',
      features: [
        'Agenda medica illimitata',
        'Promemoria ai pazienti',
        'Sincronizzazione Google Calendar',
        'Gestione delle urgenze',
        'Zero commissioni'
      ]
    },
    faqs: [
      { q: 'I dati dei pazienti sono al sicuro?', a: 'Sì, i dati sono criptati e ospitati su server europei (GDPR compliant).' },
      { q: 'Posso gestire più dottori nello stesso studio?', a: 'Sì, ogni dottore ha il suo calendario, tutti sotto lo stesso account.' },
      { q: 'I pazienti possono spostare la visita da soli?', a: 'Sì, dal link di conferma possono modificare o cancellare la prenotazione.' }
    ]
  },
  {
    slug: 'parrucchieri',
    name: 'Parrucchieri ed Estetisti',
    seoTitle: 'Gestionale per Parrucchieri ed Estetisti | Prenotly',
    seoDescription: "Software di prenotazione per parrucchieri e centri estetici. Gestisci i servizi, gli operatori e l'agenda in un unico posto.",
    heroTitle: 'Ogni taglio al suo posto.',
    heroSubtitle: 'Gestisci la tua agenda di parrucchiere o estetista senza stress. Servizi, durate e operatori sempre sotto controllo.',
    features: [
      'Servizi con durata personalizzata',
      'Multi-operatore (gestisci il tuo team)',
      'Agenda con sync Google Calendar',
      'Promemoria per i clienti',
      'Statistiche sui servizi più richiesti'
    ],
    howItWorks: [
      { step: '1', title: 'Il cliente sceglie il servizio', text: 'Taglio, colore, trattamento: con durata e prezzo visibili.' },
      { step: '2', title: 'Trova lo slot libero', text: "L'agenda mostra solo gli orari davvero disponibili per il tuo team." },
      { step: '3', title: 'Conferma e riceve il promemoria', text: 'Il giorno prima, in automatico. Meno no-show.' }
    ],
    recommendedPlan: {
      name: 'Prenotly Pro',
      price: '29,99',
      period: '/mese',
      description: 'Il piano per parrucchieri ed estetisti con team e servizi multipli.',
      features: [
        'Servizi con durata variabile',
        'Multi-operatore (team)',
        'Sincronizzazione Google Calendar',
        'Promemoria ai clienti',
        'Statistiche sui servizi'
      ]
    },
    faqs: [
      { q: 'Posso gestire più operatori?', a: 'Sì, ogni operatore ha il suo calendario e il cliente sceglie chi preferisce.' },
      { q: 'Posso impostare prezzi diversi per servizi diversi?', a: 'Sì, ogni servizio ha il suo prezzo e la sua durata.' },
      { q: 'I clienti possono vedere i servizi prima di prenotare?', a: 'Sì, dal link pubblico vedono tutti i servizi con prezzi e durata.' }
    ]
  }
]

export function getCategoryBySlug(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug)
}
