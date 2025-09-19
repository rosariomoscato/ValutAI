# ValutAI

![ValutAI App Screenshot](/public/screenshot-app.jpg)

Piattaforma di intelligenza artificiale per la previsione della probabilità di successo dei preventivi dedicata alle PMI italiane.

## 🎯 Cos'è ValutAI

ValutAI è una web application che aiuta le piccole e medie imprese italiane a prendere decisioni commerciali più informate attraverso l'analisi predittiva dei preventivi. La piattaforma utilizza algoritmi di machine learning per calcolare la probabilità di chiusura di nuovi preventivi sulla base di dati storici.

### Scopo Principale

- **Previsione Preventivi**: Calcola la probabilità di successo per nuovi preventivi
- **Analisi Storica**: Importa e analizza dati storici dei preventivi (minimo 30 righe)
- **Raccomandazioni Pratiche**: Genera report con suggerimenti concreti per migliorare il tasso di successo
- **Ottimizzazione Tempo**: Riduce il tempo speso su opportunità a bassa probabilità

## 💡 Benefici

### Per le PMI
- **Aumento del Win Rate**: Migliora le percentuali di successo del 20-30% in 4-8 settimane
- **Decisioni Data-Driven**: Basa le scelte commerciali su dati oggettivi anziché intuizioni
- **Ottimizzazione Risorse**: Concentra gli sforzi sui preventivi con maggiore probabilità di successo
- **Competitività**: Accedi a strumenti di analisi avanzata prima disponibili solo alle grandi aziende

### Caratteristiche Principali
- 📊 **Dashboard Intuitiva**: Panoramica completa delle metriche chiave
- 📁 **Gestione Dati**: Importazione guidata di file Excel/CSV
- 🤖 **Machine Learning**: Modelli predittivi leggeri e interpretabili
- 📝 **Report Dettagliati**: Analisi con raccomandazioni pratiche
- 🔐 **Sicurezza**: Autenticazione Google OAuth e dati protetti

## 🛠️ Come Funziona

### 1. Importazione Dati
- Carica file Excel/CSV con i tuoi preventivi storici
- Mappatura guidata delle colonne
- Validazione automatica dei dati
- Requisito minimo: 30 righe di dati storici

### 2. Feature Engineering
La piattaforma elabora automaticamente:
- Settore e dimensione del cliente
- Percentuali di sconto
- Prezzo totale e tempi di consegna
- Canale di vendita e responsabile
- Sorgente del lead ed esito finale
- Calcolo di metriche derivate (sconto medio, tempo di risposta)

### 3. Addestramento Modello
- Algoritmo: Regressione Logistica per massima interpretabilità
- Validazione: Cross-validation 5-fold
- Metriche: AUC-ROC, precision, recall, calibration
- Versionamento automatico dei modelli

### 4. Previsione in Tempo Reale
Compila un form per i nuovi preventivi e ottieni:
- Probabilità di successo in percentuale
- Fattori chiave che influenzano la previsione
- Suggerimenti contestuali per migliorare le probabilità

### 5. Report Pratici
Genera documenti PDF con:
- Driver di successo e fattori di rischio
- Regole operative per ottimizzare gli sconti
- Segmenti di clientela da prioritizzare
- Quick wins per migliorare la struttura dei preventivi

## 🏗️ Ambiente Tecnologico

### Frontend
- **Next.js 15**: Framework React con App Router
- **TypeScript**: Tipizzazione statica per maggiore sicurezza
- **Tailwind CSS**: Framework CSS per design moderno
- **shadcn/ui**: Componenti UI accessibili e personalizzabili
- **Lucide React**: Icone consistenti e moderne

### Backend
- **API Routes**: Endpoints serverless integrati in Next.js
- **Better Auth**: Sistema di autenticazione moderno
- **Drizzle ORM**: Type-safe database query builder
- **PostgreSQL**: Database relazionale robusto

### Machine Learning
- **Node.js/TypeScript**: Pipeline ML server-side
- **Algoritmi Leggeri**: Regressione Logistica, Random Forest
- **Feature Importance**: Interpretazione dei risultati
- **Metriche di Performance**: Validazione rigorosa

### Infrastruttura
- **Vercel**: Deploy e hosting
- **PostgreSQL Gestito**: Neon/Supabase/Cloud SQL
- **OAuth 2.0**: Autenticazione sicura
- **HTTPS**: Comunicazioni cifrate end-to-end

## 📋 Prerequisiti

### Sistema Operativo
- Windows, macOS, o Linux
- Node.js 18.0 o superiore
- Git per il controllo versione

### Servizi Esterni
- **Database PostgreSQL**: Locale o cloud (Neon/Supabase consigliato)
- **Google Cloud Console**: Per OAuth credentials
- **OpenAI API Key**: Opzionale per funzionalità AI avanzate

### Competenze Tecniche
- Conoscenza base di JavaScript/TypeScript
- Familiarità con React e Next.js
- Nozioni di database SQL
- Comprensione di concetti ML base (non necessario per l'uso)

## 🚀 Installazione e Configurazione

### 1. Clona il Repository

```bash
git clone https://github.com/tuorepo/valutai.git
cd valutai
```

### 2. Installa le Dipendenze

```bash
npm install
```

### 3. Configurazione Ambiente

Crea il file `.env` partendo dal template:

```env
# Database PostgreSQL
POSTGRES_URL="postgresql://username:password@localhost:5432/valutai"

# Autenticazione Better Auth
BETTER_AUTH_SECRET="tua-chiave-segreta-32-caratteri"

# Google OAuth
GOOGLE_CLIENT_ID="tuo-google-client-id"
GOOGLE_CLIENT_SECRET="tuo-google-client-secret"

# OpenAI API (opzionale)
OPENAI_API_KEY="sk-tua-api-key"
OPENAI_MODEL="gpt-5-mini"

# URL Applicazione
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Setup Database

Genera e applica le migrazioni:

```bash
npm run db:generate
npm run db:migrate
```

### 5. Avvia il Server di Sviluppo

```bash
npm run dev
```

L'applicazione sarà disponibile all'indirizzo [http://localhost:3000](http://localhost:3000)

## 🔧 Configurazione Servizi

### Database PostgreSQL su Neon

1. Registrati su [Neon](https://neon.tech)
2. Crea un nuovo progetto database
3. Copia la connection string dal dashboard
4. Aggiungila al tuo file `.env`

### Google OAuth Credentials

1. Vai su [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuovo progetto o selezionane uno esistente
3. Naviga in **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
4. Imposta application type come **Web application**
5. Aggiungi gli URI di redirect:
   - `http://localhost:3000/api/auth/callback/google` (sviluppo)
   - `https://tuodominio.com/api/auth/callback/google` (produzione)

### OpenAI API Key

1. Vai su [OpenAI Platform](https://platform.openai.com/)
2. Naviga in **API Keys**
3. Crea un nuovo secret key
4. Aggiungila al file `.env`

## 📁 Struttura del Progetto

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Autenticazione
│   │   └── test-db/       # Test connessione
│   ├── dashboard/         # Dashboard principale
│   ├── data/              # Gestione dati
│   ├── model/             # Training modelli
│   ├── scoring/           # Previsione preventivi
│   ├── reports/           # Report e analisi
│   ├── settings/          # Impostazioni utente
│   └── page.tsx           # Home page
├── components/            # Componenti React
│   ├── auth/             # Componenti autenticazione
│   ├── charts/           # Grafici e visualizzazioni
│   ├── forms/            # Form e input
│   ├── ui/               # shadcn/ui components
│   └── site-footer.tsx   # Footer
├── lib/                  # Librerie e configurazioni
│   ├── auth.ts           # Configurazione Better Auth
│   ├── auth-client.ts    # Client auth utilities
│   ├── db.ts             # Connessione database
│   ├── schema.ts         # Schema database
│   └── utils.ts          # Funzioni utility
└── docs/                 # Documentazione
    ├── business/         # Documentazione business
    └── features/         # Dettagli funzionalità
```

## 🎯 Ruoli e Permessi

### Owner (Proprietario)
- Gestione piani e fatturazione
- Inviti e gestione team
- Cancellazione completa dati
- Accesso a tutte le funzionalità

### Analyst (Analista)
- Importazione dati storici
- Addestramento modelli
- Esportazione report
- Analisi avanzate

### Viewer (Visualizzatore)
- Previsione preventivi
- Consultazione report
- Visualizzazione dashboard
- Accesso limitato ai dati

## 📊 Metriche di Successo

### Attivazione
- % di tenant con import >30 righe e primo training completato
- Tempo medio per il primo addestramento del modello

### Adozione
- Numero di scoring al mese per tenant
- % di consultazione report dopo training
- Frequenza di utilizzo della piattaforma

### Efficacia
- Delta win rate dopo 8 settimane vs baseline
- Lift tra top-quintile propensione e media
- ROI generato dalla piattaforma

## 🚀 Deployment su Vercel

1. Installa Vercel CLI:

```bash
npm install -g vercel
```

2. Deploy dell'applicazione:

```bash
vercel --prod
```

3. Configura le variabili d'ambiente nel dashboard Vercel:
   - `POSTGRES_URL`
   - `BETTER_AUTH_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `OPENAI_API_KEY` (opzionale)
   - `NEXT_PUBLIC_APP_URL`

## 🔒 Sicurezza e Privacy

### Protezione Dati
- Autenticazione OAuth 2.0 con Google
- Sessioni sicure con token JWT
- Cifratura dati at-rest in PostgreSQL
- Comunicazioni cifrate in-transit (HTTPS)

### Privacy
- Separazione tenant per dati aziendali
- Anonimizzazione opzionale dei dati
- Audit log per tutte le operazioni
- Policy di accesso granulari

## 🛡️ Requisiti di Sicurezza

### Server/Backend
- Validazione input su tutti gli endpoint
- Rate limiting per API requests
- Protezione contro SQL injection
- Sanitizzazione dati user-generated

### Frontend
- Protezione XSS e CSRF
- Secure cookies configuration
- Content Security Policy
- Validazione lato client

## 🔄 Flussi di Lavoro Principali

### Importazione Dati
1. Upload file Excel/CSV
2. Mappatura guidata delle colonne
3. Preview e validazione dati
4. Importazione batch e conferma

### Training Modello
1. Selezione dataset storico
2. Configurazione parametri default
3. Esecuzione job asincrono
4. Notifica completamento
5. Analisi metriche performance

### Previsione Preventivi
1. Compilazione form nuovo preventivo
2. Request al servizio ML
3. Calcolo probabilità in tempo reale
4. Restituzione risultati e suggerimenti

### Generazione Report
1. Analisi dei driver di successo
2. Identificazione fattori di rischio
3. Generazione raccomandazioni
4. Export PDF con executive summary

## 📈 Roadmap di Sviluppo

### MVP (Corrente)
- ✅ Autenticazione Google OAuth
- ✅ Upload file CSV/XLSX
- ✅ Mappatura campi guidata
- ✅ Modello di Regressione Logistica
- ✅ Pagina scoring preventivi
- ✅ Report base con top driver
- ✅ Export PDF

### Prossime Release
- 🔄 Integrazione più provider cloud
- 🔄 Modelli ML avanzati (Random Forest, XGBoost)
- 🔄 Dashboard interattiva con drill-down
- 🔄 Alert e notifiche intelligenti
- 🔄 API per integrazioni esterne
- 🔄 Mobile app nativa

## 🤝 Contributi

I contributi sono benvenuti! Per contribuire:

1. Forka il repository
2. Crea un branch feature (`git checkout -b feature/nuova-funzionalita`)
3. Commit delle modifiche (`git commit -m 'Aggiungi nuova funzionalità'`)
4. Push del branch (`git push origin feature/nuova-funzionalita`)
5. Apri una Pull Request

## 📄 Licenza

Questo progetto è licenziato sotto la MIT License - vedi il file [LICENSE](LICENSE) per i dettagli.

## 🆘 Supporto

Per assistenza e supporto:

1. Consulta la documentazione in `docs/`
2. Controlla le [Issues](https://github.com/tuorepo/valutai/issues) esistenti
3. Crea una nuova issue con informazioni dettagliate
4. Contatta il supporto tecnico per problemi urgenti

---

**ValutAI - Trasforma i tuoi dati in decisioni vincenti. 🚀**