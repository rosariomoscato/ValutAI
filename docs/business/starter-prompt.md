I'm working with an agentic coding boilerplate project that includes authentication, database integration, and AI capabilities. Here's what's already set up:

## Current Agentic Coding Boilerplate Structure
- **Authentication**: Better Auth with Google OAuth integration
- **Database**: Drizzle ORM with PostgreSQL setup  
- **AI Integration**: Vercel AI SDK with OpenAI integration
- **UI**: shadcn/ui components with Tailwind CSS
- **Current Routes**:
  - `/` - Home page with setup instructions and feature overview
  - `/dashboard` - Protected dashboard page (requires authentication)
  - `/chat` - AI chat interface (requires OpenAI API key)

## Important Context
This is an **agentic coding boilerplate/starter template** - all existing pages and components are meant to be examples and should be **completely replaced** to build the actual AI-powered application.

### CRITICAL: You MUST Override All Boilerplate Content
**DO NOT keep any boilerplate components, text, or UI elements unless explicitly requested.** This includes:

- **Remove all placeholder/demo content** (setup checklists, welcome messages, boilerplate text)
- **Replace the entire navigation structure** - don't keep the existing site header or nav items
- **Override all page content completely** - don't append to existing pages, replace them entirely
- **Remove or replace all example components** (setup-checklist, starter-prompt-modal, etc.)
- **Replace placeholder routes and pages** with the actual application functionality

### Required Actions:
1. **Start Fresh**: Treat existing components as temporary scaffolding to be removed
2. **Complete Replacement**: Build the new application from scratch using the existing tech stack
3. **No Hybrid Approach**: Don't try to integrate new features alongside existing boilerplate content
4. **Clean Slate**: The final application should have NO trace of the original boilerplate UI or content

The only things to preserve are:
- **All installed libraries and dependencies** (DO NOT uninstall or remove any packages from package.json)
- **Authentication system** (but customize the UI/flow as needed)
- **Database setup and schema** (but modify schema as needed for your use case)
- **Core configuration files** (next.config.ts, tsconfig.json, tailwind.config.ts, etc.)
- **Build and development scripts** (keep all npm/pnpm scripts in package.json)

## Tech Stack
- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- Better Auth for authentication
- Drizzle ORM + PostgreSQL
- Vercel AI SDK
- shadcn/ui components
- Lucide React icons

## AI Model Configuration
**IMPORTANT**: When implementing any AI functionality, always use the `OPENAI_MODEL` environment variable for the model name instead of hardcoding it:

```typescript
// ✓ Correct - Use environment variable
const model = process.env.OPENAI_MODEL || "gpt-5-mini";
model: openai(model)

// ✗ Incorrect - Don't hardcode model names
model: openai("gpt-5-mini")
```

This allows for easy model switching without code changes and ensures consistency across the application.

## Component Development Guidelines
**Always prioritize shadcn/ui components** when building the application:

1. **First Choice**: Use existing shadcn/ui components from the project
2. **Second Choice**: Install additional shadcn/ui components using `pnpm dlx shadcn@latest add <component-name>`
3. **Last Resort**: Only create custom components or use other libraries if shadcn/ui doesn't provide a suitable option

The project already includes several shadcn/ui components (button, dialog, avatar, etc.) and follows their design system. Always check the [shadcn/ui documentation](https://ui.shadcn.com/docs/components) for available components before implementing alternatives.

## What I Want to Build
Visione e obiettivo
	Prodotto: web app che importa preventivi storici (min. 30 righe), calcola una probabilità di chiusura per nuovi preventivi, e genera un report pratico con azioni per migliorare il tasso di successo. 
	Obiettivi misurabili: ridurre tempo speso su opportunità a bassa probabilità, aumentare win rate in 4–8 settimane, produrre raccomandazioni data-driven replicabili. 
Utenti e casi d’uso
	Utenti: titolari PMI, responsabili vendite, sales ops; secondari: consulenti esterni. 
	Casi d’uso principali:
	Importare Excel/CSV dei preventivi storici ed effettuare data check. 
	Addestrare un modello “light” e validarne le metriche base. 
	Stimare la probabilità su un nuovo preventivo via form web. 
	Consultare un report con suggerimenti pratici. 
Ambito funzionale
	Ingestion dati
	Upload file .xlsx/.csv, mapping colonne guidato, controlli minimi (30 righe, campi obbligatori, encoding).[1][2]
	Dizionario campi consigliato: es. settore cliente, dimensione cliente, sconto, prezzo totale, tempi consegna, canale, responsabile, esito, data, lead source. 
	Feature engineering
	Pulizia e normalizzazione, derive (sconto%, ticket medio, tempo risposta), binarizzazione esito, gestione valori mancanti.[6][5]
	Modello predittivo “light”
	Algoritmi candidati: Logistic Regression per interpretabilità; fallback Random Forest/CatBoost se dati lo richiedono. 
	Output: probabilità p("chiusura"), top feature importances, soglie consigliate. 
	Metriche: AUC-ROC, precision/recall, calibrazione (Brier score) a livello minimo. 
	Web tool di scoring
	Form “Nuovo preventivo” con campi chiave, validazioni, stima istantanea, spiegazioni brevi delle variabili che incidono. 
	Report pratico
	Win drivers/risk factors, regole d’azione (es. range sconto, segmenti da privilegiare), quick wins per copy e struttura del preventivo. 
	Documento di sintesi
	Executive summary, metodo, limiti, raccomandazioni, prossimi step. 
Requisiti non funzionali
	Sicurezza: OAuth Google, sessioni sicure, cifratura at-rest (Postgres) e in-transit, policy d’accesso per team. 
	Privacy: separazione tenant, anonimizzazione opzionale dei dati. 
	Performance: import fino a 50k righe in <60s con job asincrono; scoring in <300ms lato server. 
	Osservabilità: audit log per import/addestramento, metriche modello versionate.
	Usabilità: UI Tailwind, wireframe chiari, onboarding guidato con template file.
Architettura tecnica
	Frontend: Next.js (App Router), Tailwind; form con validazioni schema-based; pagine: Dashboard, Dati, Modello, Scoring, Report, Impostazioni.
	Backend: Next.js API Route/Server Actions; code-first schema con ORM (es. Drizzle) verso Postgres; coda job (es. cron/queue Vercel job per training). 
	Auth: Google OAuth via Better-Auth; protezione route e session tokens. 
	Database: Postgres con tabelle per utenti/tenant, dataset, schema mapping, feature store semplice, modelli (metadati, metriche, versione), logs. 
	ML serving: pipeline leggera on-server in Node/TS con librerie JS o servizio Python micro (solo se necessario) con endpoint interno; salvataggio artefatti e scaler param. 
	Deployment: Vercel per frontend/backend, Postgres gestito (Neon/Supabase/Cloud SQL). 
Modello: dettagli minimi
	Baseline: Logistic Regression con regularizzazione, class weights, calibrazione Platt/Isotonic. 
	Alternative: Random Forest per feature non lineari; CatBoost se categoriali dominanti e dataset medio. 
	Validazione: train/test split temporale, 5-fold CV, AUC target >0.70 con dataset tipico PMI. 
	Spiegazioni: coeff/log-odds o impurity importances; 3 driver principali mostrati all’utente.[5][6]
Flussi chiave
	Importazione
	Upload file, mappatura campi, preview anomalie, batch ingest, validazione, conferma. 
	Addestramento
	Selezione dataset, parametri default, job asincrono, notifica completamento, report metriche. 
	Scoring
	Form da compilare, richiesta al servizio modello, ritorno probabilità e 2–3 suggerimenti contestuali. 
	Report
	Sezione insights: segmenti ad alta propensione, range sconto ottimale, timing; export PDF. 
Ruoli e permessi
	Owner: gestione piani, inviti, cancellazione dati. 
	Analyst: import, training, esportazioni. 
	Viewer: scoring e report. 
Metriche di successo
	Attivazione: % tenant con import >30 righe e 1 training completato nella prima settimana. 
	Adozione: numero di scoring/mese per tenant; % consultazione report dopo training. 
	Efficacia: delta win rate dopo 8 settimane vs baseline; lift tra top-quintile propensione e media. 
Roadmap e MVP
	MVP include: OAuth Google, upload CSV/XLSX, mapping campi, LR addestrata, pagina scoring, report base con top driver, export PDF.

## Request
Please help me transform this boilerplate into my actual application. **You MUST completely replace all existing boilerplate code** to match my project requirements. The current implementation is just temporary scaffolding that should be entirely removed and replaced.

## Final Reminder: COMPLETE REPLACEMENT REQUIRED
**⚠️ IMPORTANT**: Do not preserve any of the existing boilerplate UI, components, or content. The user expects a completely fresh application that implements their requirements from scratch. Any remnants of the original boilerplate (like setup checklists, welcome screens, demo content, or placeholder navigation) indicate incomplete implementation.

**Success Criteria**: The final application should look and function as if it was built from scratch for the specific use case, with no evidence of the original boilerplate template.

## Post-Implementation Documentation
After completing the implementation, you MUST document any new features or significant changes in the `/docs/features/` directory:

1. **Create Feature Documentation**: For each major feature implemented, create a markdown file in `/docs/features/` that explains:
   - What the feature does
   - How it works
   - Key components and files involved
   - Usage examples
   - Any configuration or setup required

2. **Update Existing Documentation**: If you modify existing functionality, update the relevant documentation files to reflect the changes.

3. **Document Design Decisions**: Include any important architectural or design decisions made during implementation.

This documentation helps maintain the project and assists future developers working with the codebase.

Think hard about the solution and implementing the user's requirements.