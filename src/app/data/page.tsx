"use client";

import { useSession } from "@/lib/auth-client";
import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Upload, FileSpreadsheet, Database, CheckCircle, Upload as UploadIcon, AlertCircle, CheckCircle2 } from "lucide-react";

export default function DataPage() {
  const { data: session, isPending } = useSession();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setUploadStatus('idle');
    setUploadMessage('');
    console.log("File selezionato:", file.name);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus('error');
      setUploadMessage('Per favore seleziona un file prima di procedere.');
      return;
    }

    setIsUploading(true);
    setUploadStatus('uploading');
    setUploadMessage('Caricamento in corso...');

    try {
      // Simula l'elaborazione del file
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simula la lettura del file
      const fileContent = await readFileContent(selectedFile);
      console.log('Contenuto del file:', fileContent);

      setUploadStatus('success');
      setUploadMessage(`File "${selectedFile.name}" caricato con successo! Processati ${fileContent.length} righe.`);
      
      // Resetta il file selezionato dopo l'upload riuscito
      setTimeout(() => {
        setSelectedFile(null);
        setUploadStatus('idle');
        setUploadMessage('');
      }, 3000);

    } catch (error) {
      setUploadStatus('error');
      setUploadMessage(`Errore durante il caricamento: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const readFileContent = (file: File): Promise<Record<string, string>[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter(line => line.trim());
          const headers = lines[0].split(',').map(h => h.trim());
          const data = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
            const row: Record<string, string> = {};
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });
            return row;
          });
          resolve(data);
        } catch {
          reject(new Error('Formato file non valido'));
        }
      };
      reader.onerror = () => reject(new Error('Errore nella lettura del file'));
      reader.readAsText(file);
    });
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setUploadStatus('idle');
    setUploadMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file && (file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || 
                 file.type === "application/vnd.ms-excel" || 
                 file.type === "text/csv")) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const downloadTemplate = () => {
    // Create and download the CSV template
    const csvContent = `ID preventivo,Settore cliente,Dimensione cliente,Prezzo totale (€),Sconto (%),Tempi consegna (giorni),Canale,Responsabile,Sorgente lead,Esito,Data preventivo,Data esito,Note
QT-001,Manifatturiero,Medio,15420,15,45,Email,Mario Rossi,Sito web,vinto,2024-01-05,2024-01-25,"Cliente soddisfatto, consegna puntuale"
QT-002,Edilizio,Grande,89500,8,60,Telefono,Laura Bianchi,Fiera,perso,2024-01-08,2024-02-15,"Prezzo troppo elevato rispetto a concorrenza"`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_valutai.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
              È necessario accedere per gestire i dati
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
          <h1 className="text-3xl font-bold tracking-tight">Gestione Dati</h1>
          <p className="text-muted-foreground">
            Carica e gestisci i tuoi dataset di preventivi storici
          </p>
        </div>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Carica Nuovo Dataset
          </CardTitle>
          <CardDescription>
            Carica un file Excel o CSV con i tuoi preventivi storici per iniziare ad analizzarli
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragging
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={openFileDialog}
            >
              <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Carica file Excel o CSV</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Trascina il file qui o clicca per selezionarlo
                </p>
                {selectedFile && (
                  <div className="mt-4 space-y-3">
                    <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border-2 border-green-300 dark:border-green-600">
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        File selezionato: {selectedFile.name}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-300">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    
                    {uploadStatus === 'uploading' && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <div className="flex items-center gap-2">
                          <UploadIcon className="h-4 w-4 text-blue-500 animate-spin" />
                          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                            {uploadMessage}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {uploadStatus === 'success' && (
                      <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium text-green-800 dark:text-green-200">
                            {uploadMessage}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {uploadStatus === 'error' && (
                      <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          <span className="text-sm font-medium text-red-800 dark:text-red-200">
                            {uploadMessage}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2 justify-center">
                      <Button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleUpload();
                        }} 
                        disabled={isUploading || uploadStatus === 'uploading'}
                        className="flex items-center gap-2"
                      >
                        <UploadIcon className="h-4 w-4" />
                        {isUploading ? 'Caricamento...' : 'Carica File'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          resetUpload();
                        }}
                        disabled={isUploading}
                      >
                        Annulla
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              {!selectedFile && (
                <Button className="mt-4" type="button" onClick={(e) => e.stopPropagation()}>
                  Seleziona File
                </Button>
              )}
            </div>
            
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Formati: .xlsx, .csv</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Minimo 30 righe</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Max 50MB</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Required Fields */}
      <Card>
        <CardHeader>
          <CardTitle>Campi Richiesti</CardTitle>
          <CardDescription>
            Assicurati che il tuo file contenga almeno i seguenti campi per un&apos;analisi ottimale
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Campi Obbligatori</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Esito (won/lost)</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Prezzo totale</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Data preventivo</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Campi Consigliati</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Settore cliente</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Dimensione cliente</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Sconto (%)</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Tempi consegna</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Canale vendite</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Responsabile</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dataset List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            I Tuoi Dataset
          </CardTitle>
          <CardDescription>
            Dataset caricati e pronti per l&apos;analisi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Nessun dataset caricato
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Carica il tuo primo dataset per iniziare a utilizzare ValutAI
            </p>
            <Button onClick={openFileDialog}>
              Carica Dataset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Template Download */}
      <Card>
        <CardHeader>
          <CardTitle>Template di Esempio</CardTitle>
          <CardDescription>
            Scarica un template Excel con la struttura consigliata per i tuoi dati
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Template ValutAI</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                File Excel con campi pre-configurati e istruzioni
              </p>
            </div>
            <Button variant="outline" onClick={downloadTemplate}>
              Scarica Template
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}