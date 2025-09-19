"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  FileSpreadsheet, 
  Brain, 
  Target, 
  BarChart3
} from "lucide-react";

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ValutAI
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Previsione intelligente dei preventivi per aumentare il tuo tasso di successo
              </p>
              <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                Importa i tuoi dati storici, addestra un modello predittivo e ricevi raccomandazioni 
                concrete per migliorare le performance di vendita
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/dashboard">
                  Inizia Ora
                  <TrendingUp className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <div className="w-full sm:w-auto">
            <Link 
              href="/data" 
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 h-10 px-6 border-2 border-black bg-white text-black hover:bg-black hover:text-white"
              style={{ 
                backgroundColor: 'white !important', 
                borderColor: 'black !important', 
                color: 'black !important',
                borderWidth: '2px !important'
              }}
            >
              Importa Dati
              <FileSpreadsheet className="h-5 w-5" style={{ color: 'black !important' }} />
            </Link>
          </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Come Funziona ValutAI
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Trasforma i tuoi dati storici in insight azionabili con la nostra piattaforma 
                di intelligenza artificiale dedicata alle vendite
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <FileSpreadsheet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-lg">Import Dati</CardTitle>
                  <CardDescription>
                    Carica file Excel/CSV con i tuoi preventivi storici
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Mappatura guidata delle colonne e validazione automatica dei dati
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle className="text-lg">Modello AI</CardTitle>
                  <CardDescription>
                    Addestra un modello predittivo personalizzato
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Algoritmi avanzati con validazione delle performance e metriche dettagliate
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-lg">Previsioni</CardTitle>
                  <CardDescription>
                    Calcola la probabilità di successo per nuovi preventivi
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Scoring istantaneo con spiegazioni delle variabili influenti
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <CardTitle className="text-lg">Report</CardTitle>
                  <CardDescription>
                    Genera report con raccomandazioni pratiche
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Insight azionabili e suggerimenti per migliorare il tasso di conversione
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">
                  30+
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Righe minime richieste
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-purple-600 dark:text-purple-400">
                  &lt;300ms
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Tempo di previsione
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-green-600 dark:text-green-400">
                  70%+
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  AUC target
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-orange-600 dark:text-orange-400">
                  4-8
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Settimane per risultati
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Pronto per aumentare il tuo tasso di successo?
            </h2>
            <p className="text-xl text-blue-100">
              Inizia oggi con ValutAI e trasforma i tuoi dati in vantaggio competitivo
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
                <Link href="/dashboard">
                  Vai alla Dashboard
                  <TrendingUp className="ml-2 h-5 w-5" />
                </Link>
              </Button>
          <div className="w-full sm:w-auto">
            <Link 
              href="/data" 
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 h-10 px-6 border-2 border-black bg-white text-black hover:bg-black hover:text-white"
              style={{ 
                backgroundColor: 'white !important', 
                borderColor: 'black !important', 
                color: 'black !important',
                borderWidth: '2px !important'
              }}
            >
              Importa Dati
              <FileSpreadsheet className="h-5 w-5" style={{ color: 'black !important' }} />
            </Link>
          </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
