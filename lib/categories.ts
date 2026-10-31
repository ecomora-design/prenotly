export const CATEGORIES = [
  {
    slug: 'ristoranti',
    name: 'Ristoranti',
    seoTitle: 'Software di Prenotazione per Ristoranti | Prenotly',
    seoDescription: 'Il software che riempie i tavoli del tuo ristorante: prenotazioni online, promemoria anti no-show, menu digitale. Prova gratis 7 giorni.',
    heroTitle: 'Il tuo ristorante merita una sala piena. Senza telefonate.',
    heroSubtitle: 'Prenotazioni online, promemoria anti no-show, gestione tavoli e turni. Tutto in un unico posto, a un prezzo che nessun competitor può offrirti.',
    problems: [
      '📞 Il telefono squilla mentre sei in cucina e perdi prenotazioni',
      '❌ Il 30% dei clienti non si presenta e non lo sai in anticipo',
      '📝 Prenotazioni scritte su carta che si perdono o si sovrappongono',
      '💸 I competitor ti chiedono 3-5 volte tanto per le stesse funzioni'
    ],
    features: [
      'Gestione turni e capienza in tempo reale',
      'Promemoria automatici che riducono i no-show fino all\'80%',
      'Menu digitale con allergeni e prezzi',
      "Ordini d'asporto e domicilio integrati",
      'Dashboard con statistiche sui coperti'
    ],
    howItWorks: [
      { step: '1', title: 'Il cliente prenota', text: 'Dal tuo link pubblico, in 30 secondi, senza scaricare app.' },
      { step: '2', title: 'Tu ricevi la notifica', text: 'Tavolo assegnato, orario confermato. Nessuna telefonata.' },
      { step: '3', title: 'La sala si riempie', text: 'Promemoria automatici, niente no-show, niente doppie prenotazioni.' }
    ],
    recommendedPlan: {
      name: 'Food + Ordini',
      price: '29,99',
      period: '/mese',
      description: 'Tutto quello che serve al tuo ristorante. Meno di 1€ al giorno.',
      competitorNote: 'I competitor chiedono 79-149€/mese per le stesse funzioni.',
      features: [
        'Menu digitale personalizzabile',
        'Prenotazioni tavoli illimitate',
        "Ordini d'asporto e domicilio",
        'Dashboard con statistiche',
        'Zero commissioni sulle prenotazioni'
      ]
    },
    faqs: [
      { q: "Quanto costa davvero, considerando tutto?", a: "29,99€/mese, tutto incluso. Niente costi nascosti, niente commissioni. Meno di 1€ al giorno." },
      { q: "I miei clienti devono scaricare un'app?", a: 'No, prenotano dal browser in 30 secondi. Zero attrito.' },
      { q: "Posso provarlo prima di pagare?", a: 'Sì, 7 giorni gratis senza carta di credito. Se non ti convince, disdici con un click.' }
    ],
    mockup: {
      title: 'Prenotazioni di oggi',
      items: [
        { time: '19:30', label: 'Tavolo 4 · 2 persone', status: 'Confermato' },
        { time: '20:00', label: 'Tavolo 8 · 4 persone', status: 'Confermato' },
        { time: '20:30', label: 'Tavolo 2 · 2 persone', status: 'In attesa' }
      ]
    }
  },
  {
    slug: 'pizzerie',
    name: 'Pizzerie e Paninerie',
    seoTitle: 'Gestionale per Pizzerie e Paninerie: Prenotazioni e Asporto | Prenotly',
    seoDescription: "Il software per pizzerie e paninerie: gestisci prenotazioni tavoli e ordini d'asporto in un unico posto. Prova gratis 7 giorni.",
    heroTitle: 'Più pizze, meno caos. Anche con le paninerie.',
    heroSubtitle: "Prenotazioni tavoli e ordini d'asporto in un unico sistema. La comanda arriva direttamente in cucina. Tu pensi solo a cucinare.",
    problems: [
      '📋 Le comande scritte a mano finiscono sbagliate o si perdono',
      "📞 Telefonate continue per ordini d'asporto mentre sei in forno",
      '🔀 Doppie prenotazioni perché l\'agenda è su carta',
      '💸 I competitor ti spillano 3-5 volte tanto per le stesse funzioni'
    ],
    features: [
      'Prenotazioni tavoli con slot orari',
      "Ordini d'asporto senza commissioni",
      'Invio comande direttamente in cucina',
      'Storico clienti e preferenze',
      'Statistiche sulle voci più vendute'
    ],
    howItWorks: [
      { step: '1', title: 'Il cliente prenota o ordina', text: 'Da un unico link, sia per tavoli che per asporto.' },
      { step: '2', title: 'La comanda arriva in cucina', text: 'Senza errori di trascrizione, con tutti i dettagli.' },
      { step: '3', title: 'Tu gestisci tutto da una dashboard', text: 'Ordini, tavoli e statistiche in tempo reale.' }
    ],
    recommendedPlan: {
      name: 'Food + Ordini',
      price: '29,99',
      period: '/mese',
      description: "Tutto quello che serve alla tua pizzeria o panineria. Meno di 1€ al giorno.",
      competitorNote: 'I competitor chiedono 79-149€/mese per le stesse funzioni.',
      features: [
        'Prenotazioni tavoli illimitate',
        "Ordini d'asporto e domicilio",
        'Menu digitale personalizzabile',
        'Invio comande in cucina',
        'Zero commissioni sugli ordini'
      ]
    },
    faqs: [
      { q: "Devo pagare commissioni sugli ordini d'asporto?", a: "No, zero commissioni. Paghi solo l'abbonamento mensile di 29,99€." },
      { q: 'Posso ricevere ordini anche quando sono chiuso?', a: 'Sì, gli ordini vengono salvati e li vedi appena riapri.' },
      { q: 'I clienti possono ordinare con lo stesso link delle prenotazioni?', a: 'Sì, un solo link gestisce sia tavoli che asporto.' }
    ],
    mockup: {
      title: 'Ordini e prenotazioni',
      items: [
        { time: '19:45', label: 'Asporto · 2 Margherite', status: 'In preparazione' },
        { time: '20:15', label: 'Tavolo 3 · 4 persone', status: 'Confermato' },
        { time: '20:30', label: 'Domicilio · Via Roma', status: 'In attesa' }
      ]
    }
  },
  {
    slug: 'servizi',
    name: 'Consulenti e Professionisti',
    seoTitle: 'Software per Consulenti, Avvocati e Professionisti | Prenotly',
    seoDescription: 'Il software di prenotazione per consulenti, avvocati e centri benessere. Agenda intelligente, sync Google Calendar, promemoria anti no-show.',
    heroTitle: 'La tua agenda, sempre in ordine. Anche quando sei pieno.',
    heroSubtitle: 'Per consulenti, avvocati, centri benessere e tutti i professionisti che lavorano su appuntamento. I clienti prenotano, tu lavori. Fine delle telefonate.',
    problems: [
      '📅 Agenda su tre fogli diversi, appuntamenti che si sovrappongono',
      '📞 Il telefono squilla mentre sei in consulenza e perdi il cliente',
      '❌ Il 25% dei clienti si dimentica l\'appuntamento e non si presenta',
      '💸 I competitor chiedono 79-149€/mese solo per l\'agenda'
    ],
    features: [
      'Agenda intelligente con slot liberi in tempo reale',
      'Sincronizzazione bidirezionale con Google Calendar',
      'Durata variabile per i servizi',
      'Pagamenti in-app (opzionale)',
      'Promemoria anti no-show automatici'
    ],
    howItWorks: [
      { step: '1', title: 'Il cliente sceglie il servizio', text: 'Dal tuo link pubblico, con durata e prezzo visibili.' },
      { step: '2', title: 'Trova lo slot libero', text: "L'agenda mostra solo gli orari davvero disponibili." },
      { step: '3', title: 'Conferma e riceve il promemoria', text: 'Tutto automatico, senza scambi di messaggi.' }
    ],
    recommendedPlan: {
      name: 'Prenotly Pro',
      price: '29,99',
      period: '/mese',
      description: 'Tutto quello che serve ai professionisti. Meno di 1€ al giorno.',
      competitorNote: 'I competitor chiedono 79-149€/mese per le stesse funzioni.',
      features: [
        'Agenda intelligente illimitata',
        'Sincronizzazione Google Calendar',
        'Promemoria anti no-show',
        'Multi-operatore (team)',
        'Zero commissioni'
      ]
    },
    faqs: [
      { q: 'Posso collegare la mia agenda Google?', a: 'Sì, la sincronizzazione è automatica e bidirezionale in tempo reale.' },
      { q: 'Posso gestire più servizi con durate diverse?', a: 'Sì, ogni servizio ha la sua durata e il suo prezzo.' },
      { q: 'I clienti possono pagare direttamente online?', a: 'Sì, con pagamenti in-app opzionali (Stripe integrato).' }
    ],
    mockup: {
      title: 'Appuntamenti di oggi',
      items: [
        { time: '09:00', label: 'Consulenza · 45 min', status: 'Confermato' },
        { time: '11:30', label: 'Incontro · 60 min', status: 'Confermato' },
        { time: '15:00', label: 'Chiamata · 30 min', status: 'In attesa' }
      ]
    }
  },
  {
    slug: 'dentisti',
    name: 'Studi Dentistici',
    seoTitle: 'Software di Prenotazione per Studi Dentistici | Prenotly',
    seoDescription: 'Il gestionale per studi dentistici: agenda medica, promemoria per i pazienti, gestione urgenze. Prova gratis 7 giorni.',
    heroTitle: 'Meno telefonate, più pazienti in poltrona.',
    heroSubtitle: 'Il software che aiuta il tuo studio dentistico a gestire le visite, ridurre le assenze e organizzare agenda e urgenze in automatico. A 1/3 del prezzo dei competitor.',
    problems: [
      '📞 La segretaria passa la giornata al telefono invece di gestire i pazienti',
      '❌ Il 30% dei pazienti non si presenta e ti fa perdere lo slot',
      '🦷 Le urgenze scombussolano un\'agenda già piena',
      '💸 I gestionali dentali tradizionali costano 100-200€/mese'
    ],
    features: [
      'Agenda medica con slot dedicati per ogni tipo di visita',
      'Promemoria automatici ai pazienti (riduce i no-show)',
      'Gestione delle urgenze in tempo reale',
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
      description: "Tutto quello che serve al tuo studio. Meno di 1€ al giorno.",
      competitorNote: 'I gestionali dentali tradizionali costano 100-200€/mese.',
      features: [
        'Agenda medica illimitata',
        'Promemoria automatici ai pazienti',
        'Sincronizzazione Google Calendar',
        'Gestione delle urgenze',
        'Zero commissioni'
      ]
    },
    faqs: [
      { q: 'I dati dei pazienti sono al sicuro?', a: 'Sì, i dati sono criptati e ospitati su server europei (GDPR compliant).' },
      { q: 'Posso gestire più dottori nello stesso studio?', a: 'Sì, ogni dottore ha il suo calendario, tutti sotto lo stesso account.' },
      { q: 'I pazienti possono spostare la visita da soli?', a: 'Sì, dal link di conferma possono modificare o cancellare la prenotazione.' }
    ],
    mockup: {
      title: 'Visite di oggi',
      items: [
        { time: '09:15', label: 'Igiene dentale · 30 min', status: 'Confermato' },
        { time: '10:30', label: 'Controllo · 20 min', status: 'Confermato' },
        { time: '14:00', label: 'Urgenza · da confermare', status: 'In attesa' }
      ]
    }
  },
  {
    slug: 'parrucchieri',
    name: 'Parrucchieri e Saloni di Bellezza',
    seoTitle: 'Gestionale per Parrucchieri e Saloni di Bellezza | Prenotly',
    seoDescription: 'Il software per parrucchieri, estetisti e saloni di bellezza. Gestisci servizi, operatori e agenda in un unico posto. Prova gratis 7 giorni.',
    heroTitle: 'Ogni taglio, colore e trattamento al suo posto.',
    heroSubtitle: 'Gestisci la tua agenda di parrucchiere, estetista o salone di bellezza senza stress. Servizi, durate e operatori sempre sotto controllo. A 1/3 del prezzo dei competitor.',
    problems: [
      '📞 Chiami per un appuntamento mentre hai le mani nei capelli di un cliente',
      '🔀 Doppie prenotazioni perché l\'agenda è su carta',
      '❌ Il 30% delle clienti non si presenta, slot perso',
      '💸 I gestionali per saloni costano 79-149€/mese'
    ],
    features: [
      'Servizi con durata personalizzata (taglio 30min, colore 90min, ecc.)',
      'Multi-operatore: ogni membro del team ha il suo calendario',
      'Sincronizzazione con Google Calendar',
      'Promemoria automatici anti no-show',
      'Statistiche sui servizi più richiesti'
    ],
    howItWorks: [
      { step: '1', title: 'La cliente sceglie il servizio', text: 'Taglio, colore, trattamento: con durata e prezzo visibili.' },
      { step: '2', title: 'Trova lo slot libero', text: "L'agenda mostra solo gli orari davvero disponibili per il tuo team." },
      { step: '3', title: 'Conferma e riceve il promemoria', text: 'Il giorno prima, in automatico. Meno no-show.' }
    ],
    recommendedPlan: {
      name: 'Prenotly Pro',
      price: '29,99',
      period: '/mese',
      description: 'Tutto quello che serve al tuo salone. Meno di 1€ al giorno.',
      competitorNote: 'I gestionali per saloni costano 79-149€/mese.',
      features: [
        'Servizi con durata variabile',
        'Multi-operatore (team)',
        'Sincronizzazione Google Calendar',
        'Promemoria automatici alle clienti',
        'Statistiche sui servizi'
      ]
    },
    faqs: [
      { q: 'Posso gestire più operatori?', a: 'Sì, ogni operatore ha il suo calendario e la cliente sceglie chi preferisce.' },
      { q: 'Posso impostare prezzi diversi per servizi diversi?', a: 'Sì, ogni servizio ha il suo prezzo e la sua durata.' },
      { q: 'Le clienti possono vedere i servizi prima di prenotare?', a: 'Sì, dal link pubblico vedono tutti i servizi con prezzi e durata.' }
    ],
    mockup: {
      title: 'Appuntamenti di oggi',
      items: [
        { time: '10:00', label: 'Taglio + Piega · 45 min', status: 'Confermato' },
        { time: '12:30', label: 'Colore · 90 min', status: 'Confermato' },
        { time: '16:00', label: 'Trattamento viso · 60 min', status: 'In attesa' }
      ]
    }
  }
]

export function getCategoryBySlug(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug)
}
