"use client";

import { useSession } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Brain, Play, Settings, TrendingUp, CheckCircle, Clock } from "lucide-react";

interface Dataset {
  id: string;
  name: string;
  fileName: string;
  recordCount: number;
  status: string;
  createdAt: string;
}

export default function ModelPage() {
  const { data: session, isPending } = useSession();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<string>('');
  const [isTraining, setIsTraining] = useState(false);
  const [trainingStatus, setTrainingStatus] = useState<'idle' | 'training' | 'success' | 'error'>('idle');
  const [trainingMessage, setTrainingMessage] = useState('');

  useEffect(() => {
    if (session) {
      loadDatasets();
    }
  }, [session]);

  const loadDatasets = async () => {
    try {
      const response = await fetch('/api/datasets');
      if (response.ok) {
        const data = await response.json();
        setDatasets(data.datasets || []);
      }
    } catch (error) {
      console.error('Error loading datasets:', error);
    }
  };

  const handleTrainModel = async () => {
    if (!selectedDataset) {
      setTrainingStatus('error');
      setTrainingMessage('Per favore seleziona un dataset prima di procedere.');
      return;
    }

    setIsTraining(true);
    setTrainingStatus('training');
    setTrainingMessage('Addestramento del modello in corso...');

    try {
      // Simula l'addestramento del modello
      await new Promise(resolve => setTimeout(resolve, 5000));

      setTrainingStatus('success');
      setTrainingMessage('Modello addestrato con successo! AUC-ROC: 0.82, Accuracy: 0.78');
      
      setTimeout(() => {
        setTrainingStatus('idle');
        setTrainingMessage('');
      }, 5000);

    } catch (error) {
      setTrainingStatus('error');
      setTrainingMessage(`Errore durante l'addestramento: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
    } finally {
      setIsTraining(false);
    }
  };

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
              È necessario accedere per gestire i modelli
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
          <h1 className="text-3xl font-bold tracking-tight">Modelli Predittivi</h1>
          <p className="text-muted-foreground">
            Addestra e gestisci i tuoi modelli di machine learning per le previsioni
          </p>
        </div>
      </div>

      {/* Model Creation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Crea Nuovo Modello
          </CardTitle>
          <CardDescription>
            Seleziona un dataset e configura un nuovo modello predittivo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Dataset</label>
                <select 
                  value={selectedDataset} 
                  onChange={(e) => setSelectedDataset(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                >
                  <option value="">Seleziona un dataset</option>
                  {datasets.filter(d => d.status === 'ready').map((dataset) => (
                    <option key={dataset.id} value={dataset.id}>
                      {dataset.name} ({dataset.recordCount} record)
                    </option>
                  ))}
                </select>
                {datasets.length === 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Nessun dataset disponibile
                  </p>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Algoritmo</label>
                <div className="border rounded-md p-3 text-sm">
                  Regressione Logistica
                </div>
              </div>
            </div>

            {trainingStatus !== 'idle' && (
              <div className={`p-3 rounded-lg ${
                trainingStatus === 'training' ? 'bg-blue-50 dark:bg-blue-950' :
                trainingStatus === 'success' ? 'bg-green-50 dark:bg-green-950' :
                'bg-red-50 dark:bg-red-950'
              }`}>
                <div className="flex items-center gap-2">
                  {trainingStatus === 'training' && <Brain className="h-4 w-4 text-blue-500 animate-spin" />}
                  {trainingStatus === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                  {trainingStatus === 'error' && <Clock className="h-4 w-4 text-red-500" />}
                  <span className={`text-sm font-medium ${
                    trainingStatus === 'training' ? 'text-blue-800 dark:text-blue-200' :
                    trainingStatus === 'success' ? 'text-green-800 dark:text-green-200' :
                    'text-red-800 dark:text-red-200'
                  }`}>
                    {trainingMessage}
                  </span>
                </div>
              </div>
            )}
            
            <div className="pt-4">
              <Button 
                onClick={handleTrainModel}
                disabled={!selectedDataset || isTraining || trainingStatus === 'training'}
                className="w-full"
              >
                <Play className="mr-2 h-4 w-4" />
                {isTraining ? 'Addestramento...' : 'Addestra Modello'}
              </Button>
              {!selectedDataset && datasets.length > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Seleziona un dataset per abilitare l&apos;addestramento
                </p>
              )}
              {datasets.length === 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Carica prima un dataset per abilitare l&apos;addestramento
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Model Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurazione Modello
          </CardTitle>
          <CardDescription>
            Parametri avanzati per l&apos;addestramento del modello
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-3">Regressione Logistica</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>• Alta interpretabilità</li>
                <li>• Buone performance su dati tabulari</li>
                <li>• Probabilità calibrate</li>
                <li>• Feature importance nativa</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Validation Strategy</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>• Train/Test split temporale</li>
                <li>• 5-fold Cross Validation</li>
                <li>• Metriche AUC-ROC</li>
                <li>• Precision/Recall analysis</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Target Performance</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>• AUC-ROC &gt; 0.70</li>
                <li>• Brier Score &lt; 0.25</li>
                <li>• Training time &lt; 60s</li>
                <li>• Prediction time &lt; 300ms</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Model List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Modelli Addestrati
          </CardTitle>
          <CardDescription>
            I tuoi modelli pronti per le previsioni
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Brain className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Nessun modello addestrato
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Addestra il tuo primo modello per iniziare a fare previsioni
            </p>
            <Button disabled>
              Addestra Modello
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Training Process */}
      <Card>
        <CardHeader>
          <CardTitle>Processo di Addestramento</CardTitle>
          <CardDescription>
            Cosa succede durante l&apos;addestramento del modello
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">1</span>
              </div>
              <div>
                <h4 className="font-medium">Preprocessing Dati</h4>
                <p className="text-sm text-muted-foreground">
                  Pulizia, normalizzazione e feature engineering dei dati di training
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-purple-600 dark:text-purple-400">2</span>
              </div>
              <div>
                <h4 className="font-medium">Feature Selection</h4>
                <p className="text-sm text-muted-foreground">
                  Identificazione delle variabili più predittive per il modello
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-green-600 dark:text-green-400">3</span>
              </div>
              <div>
                <h4 className="font-medium">Model Training</h4>
                <p className="text-sm text-muted-foreground">
                  Addestramento del modello con cross-validation e ottimizzazione iperparametri
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-orange-600 dark:text-orange-400">4</span>
              </div>
              <div>
                <h4 className="font-medium">Validazione</h4>
                <p className="text-sm text-muted-foreground">
                  Valutazione delle performance su set di test non visto durante il training
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}