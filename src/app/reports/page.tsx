"use client";

import { useSession } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, BarChart3, Download, FileText, TrendingUp, AlertCircle } from "lucide-react";

export default function ReportsPage() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-8">
            <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-2">Accesso Protetto</h1>
            <p className="text-muted-foreground mb-6">
              È necessario accedere per visualizzare i report
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Report e Analisi</h1>
          <p className="text-muted-foreground">
            Genera report dettagliati con insights e raccomandazioni per migliorare le performance
          </p>
        </div>
        <Button disabled>
          <Download className="mr-2 h-4 w-4" />
          Esporta PDF
        </Button>
      </div>

      {/* Model Status */}
      <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
            <AlertCircle className="h-5 w-5" />
            Dati Non Disponibili
          </CardTitle>
          <CardDescription className="text-orange-700 dark:text-orange-300">
            Per generare report, è necessario prima caricare dati e addestrare un modello
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">
              <FileText className="mr-2 h-4 w-4" />
              Carica Dati
            </Button>
            <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">
              <TrendingUp className="mr-2 h-4 w-4" />
              Addestra Modello
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Sections */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Model Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Modello
            </CardTitle>
            <CardDescription>
              Metriche di valutazione del modello predittivo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-gray-400">-</div>
                  <div className="text-sm text-gray-500">AUC-ROC</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-gray-400">-</div>
                  <div className="text-sm text-gray-500">Accuracy</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-gray-400">-</div>
                  <div className="text-sm text-gray-500">Precision</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-gray-400">-</div>
                  <div className="text-sm text-gray-500">Recall</div>
                </div>
              </div>
              <p className="text-sm text-gray-500 text-center">
                Addestra un modello per vedere le metriche di performance
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Feature Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analisi Feature
            </CardTitle>
            <CardDescription>
              Variabili più influenti per la predizione
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Prezzo Totale", impact: "Non disponibile", color: "gray" },
                { name: "Sconto %", impact: "Non disponibile", color: "gray" },
                { name: "Tempi Consegna", impact: "Non disponibile", color: "gray" },
                { name: "Settore Cliente", impact: "Non disponibile", color: "gray" },
                { name: "Dimensione Cliente", impact: "Non disponibile", color: "gray" },
              ].map((feature, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{feature.name}</span>
                  <span className={`text-sm text-${feature.color}-500`}>{feature.impact}</span>
                </div>
              ))}
              <p className="text-sm text-gray-500 text-center mt-4">
                Le analisi saranno disponibili dopo l&apos;addestramento
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
          <CardDescription>
            Scoperte principali e raccomandazioni strategiche
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Win Drivers</h4>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                <li>• Analisi non disponibile</li>
                <li>• Modello non addestrato</li>
                <li>• Dati insufficienti</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Risk Factors</h4>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                <li>• Analisi non disponibile</li>
                <li>• Modello non addestrato</li>
                <li>• Dati insufficienti</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Optimal Ranges</h4>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                <li>• Analisi non disponibile</li>
                <li>• Modello non addestrato</li>
                <li>• Dati insufficienti</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle>Piano d&apos;Azione</CardTitle>
          <CardDescription>
            Raccomandazioni concrete per migliorare il tasso di successo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium">Short-term Wins</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Azioni immediate che possono migliorare le performance
                </p>
                <p className="text-xs text-gray-500 mt-1">Non disponibile - richiede dati</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium">Medium-term Strategy</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Iniziative strategiche per miglioramenti sostenibili
                </p>
                <p className="text-xs text-gray-500 mt-1">Non disponibile - richiede dati</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium">Long-term Goals</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Obiettivi a lungo termine per la crescita
                </p>
                <p className="text-xs text-gray-500 mt-1">Non disponibile - richiede dati</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Report Generati
          </CardTitle>
          <CardDescription>
            Storico dei report creati
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Nessun report generato
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Genera il tuo primo report dopo aver addestrato un modello
            </p>
            <Button disabled>
              <Download className="mr-2 h-4 w-4" />
              Genera Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}