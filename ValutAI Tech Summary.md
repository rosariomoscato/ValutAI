# Riepilogo dell'Architettura Tecnica di ValutAI

## Indice
1. [Panoramica Generale](#panoramica-generale)
2. [Architettura di Alto Livello](#architettura-di-alto-livello)
3. [Architettura Frontend](#architettura-frontend)
4. [Architettura Backend](#architettura-backend)
5. [Architettura Database](#architettura-database)
6. [Autenticazione e Sicurezza](#autenticazione-e-sicurezza)
7. [Pipeline di Machine Learning](#pipeline-di-machine-learning)
8. [Sistema di Crediti](#sistema-di-crediti)
9. [Sistema Admin](#sistema-admin)
10. [Deploy e Infrastruttura](#deploy-e-infrastruttura)
11. [Performance e Scalabilità](#performance-e-scalabilità)
12. [Monitoraggio e Osservabilità](#monitoraggio-e-osservabilità)

---

## Panoramica Generale

ValutAI è costruito su uno stack tecnologico moderno e scalabile, progettato per alte performance, sicurezza e manutenibilità. L'architettura segue principi di codice pulito con chiara separazione delle responsabilità tra gli strati frontend, backend e database.

### Principi di Progettazione Chiave
- **Modularità**: Ogni componente è progettato per essere distribuibile e testabile indipendentemente
- **Sicurezza**: Approccio security-first con autenticazione e autorizzazione appropriate
- **Scalabilità**: Costruito per gestire carichi utente crescenti e volumi di dati
- **Manutenibilità**: Pattern di codice pulito e test completi
- **Performance**: Ottimizzato per previsioni ML in tempo reale ed elaborazione dati

---

## Architettura di Alto Livello

```mermaid
graph TB
    subgraph "Strato Frontend"
        UI[Next.js 15 App Router]
        UI --> Auth[Client Better Auth]
        UI --> API[Chiamate API]
    end
    
    subgraph "Strato Backend"
        API --> Router[Route API Next.js]
        Router --> AuthServer[Server Better Auth]
        Router --> Services[Servizi Logica Business]
        Router --> ML[Servizio Previsioni ML]
        
        Services --> DB[Strato Database]
        ML --> DB
    end
    
    subgraph "Strato Dati"
        DB --> PostgreSQL[(Database PostgreSQL)]
        DB --> Drizzle[Drizzle ORM]
    end
    
    subgraph "Servizi Esterni"
        Stripe[API Stripe]
    end
    
    Services --> Stripe
```

### Flusso dell'Architettura
1. **Interazione Client**: Gli utenti interagiscono con il frontend Next.js
2. **Autenticazione**: Better Auth gestisce l'autenticazione degli utenti
3. **Gateway API**: Le Route API Next.js servono come punto di ingresso
4. **Logica Business**: I servizi gestiscono le operazioni business core
5. **Accesso Dati**: Drizzle ORM gestisce le interazioni con il database
6. **Elaborazione ML**: I modelli di machine learning forniscono previsioni
7. **Integrazione Esterna**: Stripe gestisce l'elaborazione dei pagamenti

---

## Architettura Frontend

### Stack Tecnologico
- **Framework**: Next.js 15 con App Router
- **Linguaggio**: TypeScript
- **Styling**: Tailwind CSS
- **Componenti UI**: Shadcn/ui
- **Autenticazione**: Better Auth
- **Gestione Stato**: React Hooks + Context API
- **Grafici**: Recharts (per implementazione futura)

### Struttura dei Componenti

```mermaid
graph TD
    subgraph "Pagine"
        A[app/page.tsx]
        B[app/dashboard/page.tsx]
        C[app/data/page.tsx]
        D[app/model/page.tsx]
        E[app/scoring/page.tsx]
        F[app/reports/page.tsx]
        G[app/credits/page.tsx]
        H[app/admin/page.tsx]
    end
    
    subgraph "Componenti"
        UI[components/ui/]
        Site[components/site-]
        Forms[components/forms/]
        Charts[components/charts/]
    end
    
    subgraph "Layout"
        Layout[app/layout.tsx]
        Header[components/site-header.tsx]
        Footer[components/site-footer.tsx]
    end
    
    Layout --> Header
    Layout --> Footer
    Pagine --> UI
    Pagine --> Site
    Pagine --> Forms
    Pagine --> Charts
```

### Funzionalità Frontend Chiave
- **Server-Side Rendering**: Ottimizzato per SEO e performance
- **Type Safety**: Implementazione TypeScript completa
- **Design Responsivo**: Approccio mobile-first
- **Flusso Autenticazione**: Autenticazione Better Auth integrata
- **Aggiornamenti Real-time**: Aggiornamenti UI ottimistici
- **Gestione Errori**: Error boundaries completi

---

## Architettura Backend

### Stack Tecnologico
- **Framework**: Route API Next.js 15
- **Linguaggio**: TypeScript
- **Runtime**: Node.js
- **Autenticazione**: Better Auth
- **Database**: PostgreSQL con Drizzle ORM
- **Caricamento File**: Gestione file nativa Next.js
- **Elaborazione ML**: Integrazione Python (futuro)

### Struttura API

```mermaid
graph TD
    subgraph "Route API"
        AuthAPI[app/api/auth/]
        UploadAPI[app/api/upload/]
        PredictionsAPI[app/api/predictions/]
        ReportsAPI[app/api/reports/]
        CreditsAPI[app/api/credits/]
        AdminAPI[app/api/admin/]
    end
    
    subgraph "Servizi"
        AuthService[/lib/auth.ts]
        CreditsService[/lib/credits.ts]
        AdminService[/lib/admin-middleware.ts]
        MLService[/lib/ml/]
    end
    
    subgraph "Database"
        Schema[/lib/schema.ts]
        Migrations[/drizzle/]
        Queries[/lib/db.ts]
    end
    
    Route API --> Services
    Services --> Database
```

### Pattern Backend Chiave
- **Pattern Middleware**: Middleware autenticazione e autorizzazione
- **Strato Servizi**: Logica business separata dalle route API
- **Pattern Repository**: Astrazione accesso dati
- **Gestione Errori**: Gestione errori centralizzata
- **Validazione**: Validazione input a più livelli

---

## Architettura Database

### Design Schema

```mermaid
erDiagram
    USER {
        text id PK
        text name
        text email UK
        boolean emailVerified
        text image
        text role
        boolean isAdmin
        integer credits
        text stripeCustomerId
        text stripeSubscriptionId
        boolean hasReceivedFreeCredits
        jsonb previousEmailsForFreeCredits
        timestamp createdAt
        timestamp updatedAt
    }
    
    SESSION {
        text id PK
        timestamp expiresAt
        text token UK
        timestamp createdAt
        timestamp updatedAt
        text ipAddress
        text userAgent
        text userId FK
    }
    
    DATASET {
        text id PK
        text name
        text description
        text fileName
        integer fileSize
        integer rowCount
        jsonb columnMapping
        text status
        text errorMessage
        text userId FK
        timestamp createdAt
        timestamp updatedAt
    }
    
    MODEL {
        text id PK
        text name
        text description
        text datasetId FK
        text algorithm
        jsonb hyperparameters
        numeric accuracy
        numeric precision
        numeric recall
        numeric f1Score
        numeric aucRoc
        numeric brierScore
        jsonb featureImportance
        text status
        text errorMessage
        integer trainingTime
        text userId FK
        timestamp createdAt
        timestamp updatedAt
    }
    
    PREDICTION {
        text id PK
        text modelId FK
        text customerSector
        text customerSize
        numeric discountPercentage
        numeric totalPrice
        integer deliveryTime
        text channel
        text salesRep
        text leadSource
        numeric winProbability
        numeric confidence
        jsonb featureContributions
        jsonb recommendations
        timestamp createdAt
    }
    
    REPORT {
        text id PK
        text modelId FK
        text title
        jsonb content
        jsonb insights
        timestamp createdAt
        timestamp updatedAt
    }
    
    CREDIT_TRANSACTION {
        text id PK
        text userId FK
        text type
        integer amount
        integer balance
        text description
        text operationType
        text resourceId
        timestamp createdAt
    }
    
    CREDIT_PACKAGE {
        text id PK
        text name
        integer credits
        numeric price
        text currency
        text stripePriceId
        boolean isActive
        boolean isPopular
        integer sortOrder
        timestamp createdAt
        timestamp updatedAt
    }
    
    CREDIT_OPERATION {
        text id PK
        text name
        text description
        integer creditCost
        boolean isActive
        timestamp createdAt
        timestamp updatedAt
    }
    
    USER ||--o{ SESSION : "ha"
    USER ||--o{ DATASET : "carica"
    USER ||--o{ MODEL : "crea"
    USER ||--o{ CREDIT_TRANSACTION : "esegue"
    DATASET ||--o{ MODEL : "usato per"
    MODEL ||--o{ PREDICTION : "genera"
    MODEL ||--o{ REPORT : "produce"
```

### Funzionalità Database
- **Design Relazionale**: Relazioni foreign key appropriate
- **Supporto JSONB**: Storage flessibile per strutture dati complesse
- **Strategia Indicizzazione**: Ottimizzata per performance query
- **Gestione Migrazioni**: Sistema migrazioni Drizzle
- **Integrità Dati**: Vincoli e validazioni

---

## Autenticazione e Sicurezza

### Flusso Autenticazione

```mermaid
sequenceDiagram
    participant U as Utente
    participant F as Frontend
    participant A as Client Better Auth
    participant S as Server Better Auth
    participant DB as Database
    
    U->>F: Richiesta Login
    F->>A: initiateAuth()
    A->>S: Richiesta Autenticazione
    S->>DB: Verifica Credenziali
    DB-->>S: Dati Utente
    S-->>A: Token Sessione
    A-->>F: Dati Sessione
    F-->>U: Login Successo
```

### Misure di Sicurezza
- **Hashing Password**: Storage password sicuro
- **Token JWT**: Gestione sessione stateless
- **Rate Limiting**: Protezione endpoint API
- **Configurazione CORS**: Condivisione risorse cross-origin appropriata
- **Validazione Input**: Prevenzione SQL injection e XSS
- **Variabili Ambiente**: Gestione configurazione sicura

---

## Pipeline di Machine Learning

### Architettura ML

```mermaid
graph TD
    subgraph "Elaborazione Dati"
        A[Caricamento Dati]
        B[Validazione]
        C[Preprocessing]
        D[Feature Engineering]
    end
    
    subgraph "Addestramento Modello"
        E[Selezione Algoritmo]
        F[Addestramento]
        G[Validazione]
        H[Valutazione]
    end
    
    subgraph "Previsione"
        I[Scoring Real-time]
        J[Analisi Feature]
        K[Calcolo Confidenza]
        L[Raccomandazioni]
    end
    
    A --> B --> C --> D --> E --> F --> G --> H
    H --> I --> J --> K --> L
```

### Componenti ML
- **Preprocessing Dati**: Pulizia e normalizzazione
- **Feature Engineering**: Estrazione feature automatica
- **Addestramento Modello**: Supporto algoritmi multipli
- **Valutazione Modello**: Metriche complete
- **API Previsione**: Scoring real-time
- **Monitoraggio Modello**: Tracciamento performance

---

## Sistema di Crediti

### Flusso Crediti

```mermaid
graph TD
    subgraph "Gestione Crediti"
        A[Pacchetti Crediti]
        B[Flusso Acquisto]
        C[Saldo Crediti]
        D[Tracciamento Utilizzo]
    end
    
    subgraph "Operazioni"
        E[Caricamento Dataset]
        F[Addestramento Modello]
        G[Previsione]
        H[Generazione Report]
    end
    
    subgraph "Transazioni"
        I[Addebito Crediti]
        J[Accredito Crediti]
        K[Cronologia Transazioni]
        L[Aggiornamento Saldo]
    end
    
    A --> B --> C --> D
    E --> I --> L
    F --> I --> L
    G --> I --> L
    H --> I --> L
    I --> K
    B --> J --> L
```

### Funzionalità Sistema Crediti
- **Gestione Pacchetti**: Pacchetti crediti flessibili
- **Saldo Real-time**: Tracciamento crediti live
- **Analytics Utilizzo**: Report consumo dettagliati
- **Addebiti Automatici**: Consumo crediti basato su operazioni
- **Integrazione Stripe**: Elaborazione pagamenti sicura

---

## Sistema Admin

### Architettura Admin

```mermaid
graph TD
    subgraph "Componenti Admin"
        A[Dashboard Admin]
        B[Gestione Utenti]
        C[Statistiche Sistema]
        D[Log Audit]
        E[Gestione Crediti]
    end
    
    subgraph "API Admin"
        F[Middleware Admin]
        G[API Utenti]
        H[API Statistiche]
        I[API Audit]
    end
    
    subgraph "Database"
        J[Query Admin]
        K[Query Analytics]
        L[Metriche Sistema]
    end
    
    A --> F
    B --> G
    C --> H
    D --> I
    F --> J
    G --> J
    H --> K
    I --> L
```

### Funzionalità Admin
- **Accesso Basato su Ruoli**: Funzionalità solo admin
- **Gestione Utenti**: Visualizza e gestisci account utente
- **Monitoraggio Sistema**: Statistiche sistema real-time
- **Amministrazione Crediti**: Gestisci pacchetti crediti e transazioni
- **Audit Trail**: Logging attività completo

---

## Deploy e Infrastruttura

### Architettura Deploy

```mermaid
graph TD
    subgraph "Ambiente Produzione"
        A[Load Balancer]
        B[Server Applicazione]
        C[Server Database]
        D[Storage File]
    end
    
    subgraph "Sviluppo"
        E[Sviluppo Locale]
        F[Ambiente Testing]
        G[Ambiente Staging]
    end
    
    subgraph "CI/CD"
        H[GitHub Actions]
        I[Docker]
        J[Deploy Cloud]
    end
    
    A --> B --> C
    B --> D
    E --> F --> G
    H --> I --> J
```

### Stack Infrastruttura
- **Hosting**: Vercel (frontend) / AWS (backend)
- **Database**: PostgreSQL (servizio gestito)
- **Storage File**: Soluzione storage cloud
- **CDN**: Distribuzione contenuti globale
- **Monitoraggio**: Monitoraggio performance applicazione

---

## Performance e Scalabilità

### Ottimizzazione Performance

```mermaid
graph TD
    subgraph "Ottimizzazione Frontend"
        A[Code Splitting]
        B[Lazy Loading]
        C[Caching]
        D[Ottimizzazione Immagini]
    end
    
    subgraph "Ottimizzazione Backend"
        E[Indicizzazione Database]
        F[Ottimizzazione Query]
        G[Connection Pooling]
        H[Caching Risposte API]
    end
    
    subgraph "Scalabilità"
        I[Scaling Orizzontale]
        J[Load Balancing]
        K[Scaling Database]
        L[Integrazione CDN]
    end
    
    A --> E
    B --> F
    C --> G
    D --> H
    I --> J --> K --> L
```

### Funzionalità Performance
- **Ottimizzazione Database**: Indicizzazione e ottimizzazione query
- **Strategia Caching**: Approccio caching multi-livello
- **Load Balancing**: Capacità scaling orizzontale
- **Integrazione CDN**: Distribuzione contenuti globale
- **Monitoraggio**: Tracciamento performance real-time

---

## Monitoraggio e Osservabilità

### Architettura Monitoraggio

```mermaid
graph TD
    subgraph "Componenti Monitoraggio"
        A[Monitoraggio Applicazione]
        B[Monitoraggio Database]
        C[Tracciamento Attività Utente]
        D[Tracciamento Errori]
        E[Metriche Performance]
    end
    
    subgraph "Alerting"
        F[Alert Errori]
        G[Alert Performance]
        H[Alert Sicurezza]
        I[Alert Utilizzo]
    end
    
    subgraph "Analytics"
        J[Analytics Utilizzo]
        K[Analytics Performance]
        L[Analytics Business]
    end
    
    A --> F
    B --> G
    C --> H
    D --> F
    E --> G
    F --> J
    G --> K
    H --> L
```

### Funzionalità Monitoraggio
- **Monitoraggio Real-time**: Tracciamento salute applicazione
- **Tracciamento Errori**: Logging errori completo
- **Metriche Performance**: Tempo risposta e utilizzo risorse
- **Analytics Utente**: Pattern e comportamento utilizzo
- **Business Intelligence**: Metriche ricavo e crescita

---

## Conclusione

L'architettura di ValutAI è progettata per essere scalabile, manutenibile e sicura fornendo al contempo eccellenti performance per l'intelligence business basata su ML. Lo stack tecnologico sfrutta best practice moderni e tecnologie provate per garantire affidabilità e crescita futura.

Il design modulare permette facile estensione e modifica, mentre il monitoraggio e l'osservabilità completi garantiscono salute e performance del sistema. La separazione delle responsabilità tra strati frontend, backend e database fornisce flessibilità e manutenibilità.

Questa architettura supporta la missione della piattaforma di fornire capacità ML accessibili e potenti a imprese di tutte le dimensioni mantenendo gli standard più alti di sicurezza e performance.