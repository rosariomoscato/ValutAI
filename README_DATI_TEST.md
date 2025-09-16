# Dati di Test per ValutAI

Questo file contiene dati fittizi per testare completamente l'applicazione ValutAI.

## File Disponibili

1. **`dati_test_preventivi.csv`** - Formato CSV con virgole
2. **`dati_test_preventivi.xlsx`** - Formato Excel

## Struttura dei Dati

I dati contengono 50 preventivi con le seguenti colonne:

| Campo | Descrizione | Esempi |
|-------|-------------|---------|
| `ID preventivo` | Identificativo univoco del preventivo | QT-001, QT-002 |
| `Settore cliente` | Settore industriale del cliente | Manifatturiero, Edilizio, Servizi IT, Commercio |
| `Dimensione cliente` | Dimensione dell'azienda cliente | Piccolo, Medio, Grande |
| `Prezzo totale (€)` | Valore totale del preventivo | 15420, 89500 |
| `Sconto (%)` | Percentuale di sconto applicato | 15, 8, 20 |
| `Tempi consegna (giorni)` | Giorni necessari per la consegna | 45, 60, 30 |
| `Canale` | Canale di acquisizione | Email, Telefono |
| `Responsabile` | Responsabile commerciale | Mario Rossi, Laura Bianchi, Marco Verdi, Paolo Russo, Anna Gallo |
| `Sorgente lead` | Origine del contatto | Sito web, Fiera, LinkedIn, Google Ads, Passaparola, Email marketing, Consulente |
| `Esito` | Risultato finale | vinto, perso |
| `Data preventivo` | Data di creazione preventivo | 2024-01-05 |
| `Data esito` | Data di definizione esito | 2024-01-25 |
| `Note` | Note aggiuntive sul preventivo | Cliente soddisfatto, consegna puntuale |

## Statistiche dei Dati

- **Totale preventivi**: 50
- **Preventivi vinti**: 30 (60%)
- **Preventivi persi**: 20 (40%)
- **Range prezzi**: €8,750 - €98,700
- **Settori rappresentati**: 4 (Manifatturiero, Edilizio, Servizi IT, Commercio)
- **Dimensioni cliente**: 3 (Piccolo, Medio, Grande)
- **Responsabili**: 5
- **Fonti lead**: 7

## Come Usare i Dati

1. **Importazione in ValutAI**:
   - Vai alla pagina "Gestione Dati"
   - Carica il file CSV o XLSX
   - Mappa le colonne secondo le indicazioni
   - Segui la procedura guidata

2. **Per il Machine Learning**:
   - I dati sono bilanciati (60% vinti, 40% persi)
   - Contengono diverse variabili categoriche e numeriche
   - Include date e note contestuali

3. **Per il Testing**:
   - Copre diversi scenari reali
   - Include preventivi di varie dimensioni
   - Rappresenta diversi settori merceologici
   - Mostra diversi motivi di successo/fallimento

## Mapicatura Consigliata

Quando importi i dati, usa questa mappatura:

| Campo CSV | Campo Database | Note |
|-----------|---------------|------|
| ID preventivo | ID preventivo | Identificativo |
| Settore cliente | Settore cliente | Categorico |
| Dimensione cliente | Dimensione cliente | Categorico |
| Prezzo totale (€) | Prezzo totale | Numerico |
| Sconto (%) | Sconto percentuale | Numerico |
| Tempi consegna (giorni) | Tempi consegna | Numerico |
| Canale | Canale vendita | Categorico |
| Responsabile | Responsabile | Categorico |
| Sorgente lead | Sorgente lead | Categorico |
| Esito | Esito | Target (vinto/perso) |
| Data preventivo | Data creazione | Data |
| Data esito | Data chiusura | Data |
| Note | Note | Testo opzionale |

## Note Tecniche

- **Formato date**: YYYY-MM-DD
- **Separatore CSV**: virgola (,)
- **Separatore XLSX**: punto e virgola (;)
- **Encoding**: UTF-8
- **Valori monetari**: in Euro (€)
- **Sconti**: percentuale (es. 15 = 15%)

## Test Consigliati

1. **Test Importazione**: Verifica che tutti i 50 record vengano importati correttamente
2. **Test Addestramento**: Esegui il training del modello ML con questi dati
3. **Test Previsione**: Usa il form di scoring per testare nuove previsioni
4. **Test Report**: Genera report basati su questi dati storici

I dati sono pronti per essere usati con ValutAI! 🚀