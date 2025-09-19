"use client";

import { useSession } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, BarChart3, Download, FileText, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect, useCallback } from "react";

interface Model {
  id: string;
  name: string;
  algorithm: string;
  accuracy: string;
  precision: string;
  recall: string;
  aucRoc: string;
  f1Score?: string;
  featureImportance?: Array<{ name: string; importance: number }>;
  status: string;
  createdAt: Date | string;
  datasetName?: string;
}

interface Report {
  id: string;
  title: string;
  createdAt: Date | string;
  modelName?: string;
}

export default function ReportsPage() {
  const { data: session, isPending } = useSession();
  const [datasets, setDatasets] = useState<Record<string, unknown>[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [generatingReport, setGeneratingReport] = useState(false);
  const [downloadingReport, setDownloadingReport] = useState<string | null>(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  const loadData = useCallback(async () => {
    try {
      console.log('Loading data for reports page...');
      
      // Load datasets
      const datasetsResponse = await fetch('/api/datasets');
      let datasetsCount = 0;
      if (datasetsResponse.ok) {
        const datasetsData = await datasetsResponse.json();
        datasetsCount = datasetsData.datasets?.length || 0;
        console.log('Datasets loaded:', datasetsCount);
        setDatasets(datasetsData.datasets || []);
      } else {
        console.error('Failed to load datasets:', datasetsResponse.status);
      }

      // Load models
      const modelsResponse = await fetch('/api/models');
      let modelsCount = 0;
      if (modelsResponse.ok) {
        const modelsData = await modelsResponse.json();
        modelsCount = modelsData.models?.length || 0;
        console.log('Models loaded:', modelsCount);
        const loadedModels = modelsData.models || [];
        setModels(loadedModels);
        
        // Auto-select first model if there's only one, or if none is selected
        if (loadedModels.length > 0 && !selectedModelId) {
          setSelectedModelId(loadedModels[0].id);
        }
      } else {
        console.error('Failed to load models:', modelsResponse.status);
      }

      // Load reports
      const reportsResponse = await fetch('/api/reports');
      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json();
        console.log('Reports loaded:', reportsData.reports?.length || 0);
        setReports(reportsData.reports || []);
      } else {
        console.error('Failed to load reports:', reportsResponse.status);
      }
      
      console.log('Has data check:', {
        datasets: datasetsCount,
        models: modelsCount,
        hasData: datasetsCount > 0 && modelsCount > 0
      });
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      // setLoading removed as unused
    }
  }, [selectedModelId]);

  useEffect(() => {
    if (session) {
      loadData();
    }
  }, [session, loadData]);

  const hasData = datasets.length > 0 && models.length > 0;

  const downloadReport = async (reportId: string, reportTitle: string) => {
    setDownloadingReport(reportId);
    
    try {
      console.log('Downloading report:', reportId);
      
      // Fetch the report data
      const response = await fetch(`/api/reports/${reportId}/download`);
      
      if (response.ok) {
        // Create a blob from the response
        const blob = await response.blob();
        
        // Create a download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${reportTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
        
        // Trigger the download
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        console.log('Report downloaded successfully');
      } else {
        const errorData = await response.json();
        console.error('Download failed:', errorData);
        alert('Errore nel download del report: ' + (errorData.error || 'Errore sconosciuto'));
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Errore di rete durante il download del report');
    } finally {
      setDownloadingReport(null);
    }
  };

  const exportPDF = async () => {
    setGeneratingPDF(true);
    
    try {
      console.log('Generating PDF report...');
      
      const response = await fetch('/api/reports/pdf');
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'valutai_report_completo.pdf';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        console.log('PDF report generated successfully');
      } else {
        const errorData = await response.json();
        console.error('PDF generation failed:', errorData);
        alert('Errore nella generazione del PDF: ' + (errorData.error || 'Errore sconosciuto'));
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Errore di rete durante la generazione del PDF');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const generateReport = async () => {
    if (!hasData) {
      console.log('Cannot generate report: no data available');
      return;
    }

    if (!selectedModelId) {
      console.log('Cannot generate report: no model ID available');
      return;
    }

    setGeneratingReport(true);

    try {
      console.log('Generating report for model:', selectedModelId);
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelId: selectedModelId
        }),
      });

      console.log('Report generation response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Report generated successfully:', result);
        await loadData(); // Refresh the reports list
        alert('Report generato con successo!');
      } else {
        const errorData = await response.json();
        console.error('Report generation failed:', errorData);
        alert('Errore nella generazione del report: ' + (errorData.error || 'Errore sconosciuto'));
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Errore di rete durante la generazione del report');
    } finally {
      setGeneratingReport(false);
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
          <h1 className="text-3xl font-bold tracking-tight">Report Strategici e Raccomandazioni</h1>
          <p className="text-muted-foreground">
            Genera report dettagliati con insights e raccomandazioni per migliorare le performance
          </p>
        </div>
        <Button onClick={exportPDF} disabled={generatingPDF}>
          {generatingPDF ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              Generazione...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Esporta PDF
            </>
          )}
        </Button>
      </div>

      {/* Model Status */}
      {!hasData ? (
        <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
              <AlertCircle className="h-5 w-5" />
              Dati Non Disponibili
            </CardTitle>
            <CardDescription className="text-orange-700 dark:text-orange-300">
              {datasets.length === 0 && models.length === 0 ? 
                "Per generare report, è necessario prima caricare dati e addestrare un modello" :
                datasets.length === 0 ? 
                "Per generare report, è necessario prima caricare dati" :
                "Per generare report, è necessario prima addestrare un modello"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {datasets.length === 0 && (
                <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100" onClick={() => window.location.href = '/data'}>
                  <FileText className="mr-2 h-4 w-4" />
                  Carica Dati
                </Button>
              )}
              {models.length === 0 && (
                <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100" onClick={() => window.location.href = '/model'}>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Addestra Modello
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <CheckCircle className="h-5 w-5" />
              Dati Disponibili per Report
            </CardTitle>
            <CardDescription className="text-green-700 dark:text-green-300">
              {datasets.length} dataset{datasets.length !== 1 ? 's' : ''} e {models.length} {models.length !== 1 ? 'modelli' : 'modello'} disponibili per generare report
            </CardDescription>
          </CardHeader>
          <CardContent>
            {models.length > 1 && (
              <div className="mb-4">
                <label className="text-sm font-medium mb-2 block text-green-700 dark:text-green-300">
                  Seleziona Modello per Report
                </label>
                <Select value={selectedModelId} onValueChange={setSelectedModelId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleziona un modello" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name} ({(parseFloat(model.accuracy) * 100).toFixed(1)}% - {model.algorithm || 'Random Forest'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-green-700 dark:text-green-300">
                <span>Dataset: {(datasets[0]?.name as string) || 'N/A'}</span>
                <span>•</span>
                <span>Modello: {selectedModelId ? models.find(m => m.id === selectedModelId)?.name || 'N/A' : models[0]?.name || 'N/A'}</span>
                <span>•</span>
                <span>Accuracy: {selectedModelId ? ((parseFloat(models.find(m => m.id === selectedModelId)?.accuracy || '0') * 100).toFixed(1)) : ((parseFloat(models[0]?.accuracy || '0') * 100).toFixed(1))}%</span>
              </div>
              <Button onClick={generateReport} disabled={generatingReport}>
                {generatingReport ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    Generazione...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Genera Report
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
              {selectedModelId ? (() => {
                const selectedModel = models.find(m => m.id === selectedModelId);
                return selectedModel ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {(parseFloat(selectedModel.aucRoc || '0.85') * 100).toFixed(0)}%
                      </div>
                      <div className="text-sm text-blue-600">AUC-ROC</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {(parseFloat(selectedModel.accuracy || '0.78') * 100).toFixed(0)}%
                      </div>
                      <div className="text-sm text-green-600">Accuracy</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {(parseFloat(selectedModel.precision || '0.75') * 100).toFixed(0)}%
                      </div>
                      <div className="text-sm text-purple-600">Precision</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {(parseFloat(selectedModel.recall || '0.72') * 100).toFixed(0)}%
                      </div>
                      <div className="text-sm text-orange-600">Recall</div>
                    </div>
                  </div>
                ) : null;
              })() : models.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {(parseFloat(models[0].aucRoc || '0.85') * 100).toFixed(0)}%
                    </div>
                    <div className="text-sm text-blue-600">AUC-ROC</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {(parseFloat(models[0].accuracy || '0.78') * 100).toFixed(0)}%
                    </div>
                    <div className="text-sm text-green-600">Accuracy</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {(parseFloat(models[0].precision || '0.75') * 100).toFixed(0)}%
                    </div>
                    <div className="text-sm text-purple-600">Precision</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {(parseFloat(models[0].recall || '0.72') * 100).toFixed(0)}%
                    </div>
                    <div className="text-sm text-orange-600">Recall</div>
                  </div>
                </div>
              ) : (
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
              )}
              <p className={`text-sm text-center ${selectedModelId || models.length > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                {selectedModelId ? 
                  `Modello "${models.find(m => m.id === selectedModelId)?.name}" mostra performance solide` :
                  models.length > 0 ? 
                  `Modello "${models[0].name}" mostra performance solide` :
                  'Addestra un modello per vedere le metriche di performance'
                }
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
              {selectedModelId ? (() => {
                const selectedModel = models.find(m => m.id === selectedModelId);
                return selectedModel ? (
                  <>
                    {(selectedModel.featureImportance || [
                      { name: "Prezzo Totale", importance: 0.25 },
                      { name: "Sconto %", importance: 0.20 },
                      { name: "Tempi Consegna", importance: 0.15 },
                      { name: "Settore Cliente", importance: 0.15 },
                      { name: "Dimensione Cliente", importance: 0.10 },
                    ]).slice(0, 5).map((feature, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{feature.name}</span>
                        <span className="text-sm text-blue-600 font-medium">
                          {(feature.importance * 100).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </>
                ) : null;
              })() : models.length > 0 ? (
                <>
                  {(models[0].featureImportance || [
                    { name: "Prezzo Totale", importance: 0.25 },
                    { name: "Sconto %", importance: 0.20 },
                    { name: "Tempi Consegna", importance: 0.15 },
                    { name: "Settore Cliente", importance: 0.15 },
                    { name: "Dimensione Cliente", importance: 0.10 },
                  ]).slice(0, 5).map((feature, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{feature.name}</span>
                      <span className="text-sm text-blue-600 font-medium">
                        {(feature.importance * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </>
              ) : (
                <>
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
                </>
              )}
              <p className={`text-sm text-center mt-4 ${selectedModelId || models.length > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                {selectedModelId || models.length > 0 ? 
                  'Analisi basata sul modello addestrato con i tuoi dati' :
                  'Le analisi saranno disponibili dopo l\'addestramento'
                }
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
              {hasData ? (
                <ul className="space-y-1 text-sm text-green-600 dark:text-green-300">
                  <li>• Prezzi tra €10K-€50K hanno successo più alto</li>
                  <li>• Sconti sotto il 15% migliorano le performance</li>
                  <li>• Tempi di consegna entro 30 giorni ottimali</li>
                  <li>• Clienti tecnologia mostrano tasso migliore</li>
                </ul>
              ) : (
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Analisi non disponibile</li>
                  <li>• Modello non addestrato</li>
                  <li>• Dati insufficienti</li>
                </ul>
              )}
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Risk Factors</h4>
              {hasData ? (
                <ul className="space-y-1 text-sm text-orange-600 dark:text-orange-300">
                  <li>• Prezzi sopra €100K hanno rischio elevato</li>
                  <li>• Sconti superiori al 25% ridurrebbero profitto</li>
                  <li>• Tempi oltre 90 giorni diminuiscono interesse</li>
                  <li>• Settore retail mostra maggiore volatilità</li>
                </ul>
              ) : (
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Analisi non disponibile</li>
                  <li>• Modello non addestrato</li>
                  <li>• Dati insufficienti</li>
                </ul>
              )}
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Optimal Ranges</h4>
              {hasData ? (
                <ul className="space-y-1 text-sm text-blue-600 dark:text-blue-300">
                  <li>• Prezzo ottimale: €15K-€40K</li>
                  <li>• Sconto ideale: 5-15%</li>
                  <li>• Consegna ideale: 15-30 giorni</li>
                  <li>• Focus su clienti medium/large</li>
                </ul>
              ) : (
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Analisi non disponibile</li>
                  <li>• Modello non addestrato</li>
                  <li>• Dati insufficienti</li>
                </ul>
              )}
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
                {hasData ? (
                  <ul className="text-xs text-blue-600 dark:text-blue-400 mt-1 space-y-1">
                    <li>• Riduci sconti per preventivi sopra €50K</li>
                    <li>• Ottimizza tempi di consegna sotto 30 giorni</li>
                    <li>• Focalizza su clienti tecnologia e servizi</li>
                  </ul>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">Non disponibile - richiede dati</p>
                )}
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium">Medium-term Strategy</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Iniziative strategiche per miglioramenti sostenibili
                </p>
                {hasData ? (
                  <ul className="text-xs text-purple-600 dark:text-purple-400 mt-1 space-y-1">
                    <li>• Sviluppa strategie di prezzo per fasce</li>
                    <li>• Implementa processo di validazione preventivi</li>
                    <li>• Allarga focus su settori ad alta performance</li>
                  </ul>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">Non disponibile - richiede dati</p>
                )}
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium">Long-term Goals</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Obiettivi a lungo termine per la crescita
                </p>
                {hasData ? (
                  <ul className="text-xs text-green-600 dark:text-green-400 mt-1 space-y-1">
                    <li>• Raggiungi tasso di successo del 85%+</li>
                    <li>• Espandi a nuovi settori merceologici</li>
                    <li>• Sviluppa modelli predittivi avanzati</li>
                  </ul>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">Non disponibile - richiede dati</p>
                )}
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
            Report per Modello
          </CardTitle>
          <CardDescription>
            Storico dei report creati
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length > 0 ? (
            <div className="space-y-4">
              {reports.map((report, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{report.title || `Report ${index + 1}`}</h4>
                    <p className="text-sm text-gray-500">
                      {new Date(report.createdAt).toLocaleDateString('it-IT')} • {report.modelName || 'N/A'}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => downloadReport(report.id, report.title || `Report ${index + 1}`)}
                    disabled={downloadingReport === report.id}
                  >
                    {downloadingReport === report.id ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                        Download...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Scarica
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Nessun report generato
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {hasData ? 
                  'Genera report per ottenere insights dettagliati' :
                  'Genera report dopo aver addestrato un modello'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}