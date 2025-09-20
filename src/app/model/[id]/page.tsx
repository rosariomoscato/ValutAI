"use client";

import { useSession } from "@/lib/auth-client";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter, useParams } from "next/navigation";
import { Lock, ArrowLeft, Brain, BarChart3, TrendingUp, Settings, Trash2, Download, Target, Lightbulb } from "lucide-react";

interface ModelDetail {
  id: string;
  name: string;
  algorithm: string;
  status: string;
  metrics: {
    aucRoc: number;
    accuracy: number;
    precision: number;
    recall: number;
    trainingSize: number;
    validationSize: number;
  };
  featureImportance: Array<{
    name: string;
    importance: number;
  }>;
  hyperparameters: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  datasetName: string;
  datasetId: string;
}

export default function ModelDetailPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const params = useParams();
  const modelId = params.id as string;
  const [model, setModel] = useState<ModelDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadModelDetail = useCallback(async () => {
    try {
      const response = await fetch('/api/models');
      if (response.ok) {
        const data = await response.json();
        const foundModel = data.models.find((m: ModelDetail) => m.id === modelId);
        if (foundModel) {
          setModel(foundModel);
        } else {
          setError('Modello non trovato');
        }
      } else {
        setError('Errore nel caricamento del modello');
      }
    } catch (error) {
      console.error('Error loading model detail:', error);
      setError('Errore nel caricamento del modello');
    } finally {
      setLoading(false);
    }
  }, [modelId]);

  useEffect(() => {
    if (session && modelId) {
      loadModelDetail();
    }
  }, [session, modelId, loadModelDetail]);

  const handleDeleteModel = async () => {
    if (!model) return;
    
    if (confirm('Sei sicuro di voler eliminare questo modello? Questa azione è irreversibile.')) {
      try {
        const response = await fetch(`/api/models?modelId=${model.id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          router.push('/model');
        } else {
          setError('Errore durante l&apos;eliminazione del modello');
        }
      } catch (error) {
        console.error('Error deleting model:', error);
        setError('Errore durante l&apos;eliminazione del modello');
      }
    }
  };

  const handleExportModel = async () => {
    if (!model) return;
    
    try {
      const response = await fetch(`/api/models/${model.id}/export`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${model.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_model_export.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('Errore durante l&apos;esportazione del modello');
      }
    } catch (error) {
      console.error('Error exporting model:', error);
      setError('Errore durante l&apos;esportazione del modello');
    }
  };

  if (isPending || loading) {
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
              È necessario accedere per visualizzare i dettagli del modello
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !model) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Errore</h1>
          <p className="text-muted-foreground mb-6">{error || 'Modello non trovato'}</p>
          <Button onClick={() => router.push('/model')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Torna ai Modelli
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push('/model')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Indietro
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{model.name}</h1>
            <p className="text-muted-foreground">
              Dettagli del modello predittivo
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportModel}>
            <Download className="mr-2 h-4 w-4" />
            Esporta
          </Button>
          <Button 
            variant="outline" 
            className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
            onClick={handleDeleteModel}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Elimina
          </Button>
        </div>
      </div>

      {/* Model Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Algoritmo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{model.algorithm}</div>
            <p className="text-xs text-muted-foreground">{model.status}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Dataset</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{model.datasetName}</div>
            <p className="text-xs text-muted-foreground">{model.metrics.trainingSize} record</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Creato</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Date(model.createdAt).toLocaleDateString('it-IT')}</div>
            <p className="text-xs text-muted-foreground">
              {Math.floor((Date.now() - new Date(model.createdAt).getTime()) / (1000 * 60 * 60 * 24))} giorni fa
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{(model.metrics.accuracy * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Accuracy</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Metriche di Performance
          </CardTitle>
          <CardDescription>
            Risultati della valutazione del modello sul set di test
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {model.metrics.aucRoc}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">AUC-ROC</div>
              <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                Capacità di discriminazione
              </p>
            </div>

            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {model.metrics.accuracy}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">Accuracy</div>
              <p className="text-xs text-green-500 dark:text-green-400 mt-1">
                Previsioni corrette
              </p>
            </div>

            <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {model.metrics.precision}
              </div>
              <div className="text-sm text-purple-600 dark:text-purple-400">Precision</div>
              <p className="text-xs text-purple-500 dark:text-purple-400 mt-1">
                Affidabilità previsioni positive
              </p>
            </div>

            <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {model.metrics.recall}
              </div>
              <div className="text-sm text-orange-600 dark:text-orange-400">Recall</div>
              <p className="text-xs text-orange-500 dark:text-orange-400 mt-1">
                Copertura casi positivi
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Importance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Importanza delle Feature
          </CardTitle>
          <CardDescription>
            Variabili più influenti per le previsioni del modello
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {model.featureImportance.slice(0, 10).map((feature, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    index < 3 ? 'bg-green-500' : index < 6 ? 'bg-blue-500' : 'bg-gray-500'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="font-medium">{feature.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${feature.importance * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300 min-w-[45px]">
                    {(feature.importance * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurazione del Modello
          </CardTitle>
          <CardDescription>
            Parametri e impostazioni utilizzati per l&apos;addestramento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Parametri di Addestramento</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Validation Split:</span>
                  <span className="font-medium">{((Number(model.hyperparameters?.validationSplit) || 0.2) * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Cross Validation Folds:</span>
                  <span className="font-medium">{Number(model.hyperparameters?.crossValidationFolds) || 5}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Random Seed:</span>
                  <span className="font-medium">{Number(model.hyperparameters?.randomSeed) || 42}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Statistiche di Training</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Training Size:</span>
                  <span className="font-medium">{model.metrics.trainingSize} record</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Validation Size:</span>
                  <span className="font-medium">{model.metrics.validationSize} record</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Data Addestramento:</span>
                  <span className="font-medium">{new Date(model.createdAt).toLocaleString('it-IT')}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Raccomandazioni per l&apos;Uso
          </CardTitle>
          <CardDescription>
            Suggerimenti basati sulle performance del modello
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 text-green-700 dark:text-green-400">Punti di Forza</h4>
              <ul className="space-y-2 text-sm">
                {model.metrics.aucRoc > 0.8 && (
                  <li className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Ottima capacità di discriminazione tra casi positivi e negativi</span>
                  </li>
                )}
                {model.metrics.accuracy > 0.8 && (
                  <li className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Alta accuratezza nelle previsioni generali</span>
                  </li>
                )}
                {model.metrics.precision > 0.8 && (
                  <li className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Previsioni positive molto affidabili</span>
                  </li>
                )}
                <li className="flex items-start gap-2">
                  <Target className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Modello stabile e consistente</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-3 text-orange-700 dark:text-orange-400">Aree di Miglioramento</h4>
              <ul className="space-y-2 text-sm">
                {model.metrics.recall < 0.7 && (
                  <li className="flex items-start gap-2">
                    <Brain className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span>Possibile miglioramento nella copertura dei casi positivi</span>
                  </li>
                )}
                {model.metrics.precision < 0.7 && (
                  <li className="flex items-start gap-2">
                    <Brain className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span>Ridurre i falsi positivi nelle previsioni</span>
                  </li>
                )}
                <li className="flex items-start gap-2">
                  <Brain className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Considerare più dati di training per migliorare la generalizzazione</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}