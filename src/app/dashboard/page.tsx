"use client";

import { useSession } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, FileSpreadsheet, Brain, Target, BarChart3, Upload } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const [stats, setStats] = useState({
    datasets: 0,
    models: 0,
    predictions: 0,
    reports: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      loadStats();
    }
  }, [session]);

  const loadStats = async () => {
    try {
      // Check user credits first
      const creditsResponse = await fetch('/api/credits');
      if (creditsResponse.ok) {
        const creditsData = await creditsResponse.json();
        
        // Only try to grant welcome credits if user has 0 credits (truly new user)
        if (creditsData.credits === 0) {
          console.log(`User has ${creditsData.credits} credits, attempting to grant welcome credits...`);
          try {
            const grantResponse = await fetch('/api/credits/grant-free', {
              method: 'POST',
            });
            
            if (grantResponse.ok) {
              const grantData = await grantResponse.json();
              if (grantData.creditsGranted) {
                console.log('Welcome credits granted successfully');
              }
            }
          } catch (grantError) {
            console.error('Error granting welcome credits:', grantError);
          }
        }
      }

      // Carica dataset
      const datasetsResponse = await fetch('/api/datasets');
      const datasetsData = await datasetsResponse.json();
      const datasetCount = datasetsData.datasets?.length || 0;

      // Carica modelli
      const modelsResponse = await fetch('/api/models');
      const modelsData = await modelsResponse.json();
      const modelCount = modelsData.models?.length || 0;

      // Carica previsioni
      const predictionsResponse = await fetch('/api/predictions/count');
      const predictionsData = await predictionsResponse.json();
      const predictionCount = predictionsData.count || 0;

      // Carica report
      const reportsResponse = await fetch('/api/reports/count');
      const reportsData = await reportsResponse.json();
      const reportCount = reportsData.count || 0;

      setStats({
        datasets: datasetCount,
        models: modelCount,
        predictions: predictionCount,
        reports: reportCount,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
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
              È necessario accedere per visualizzare la dashboard
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
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Benvenuto, {session.user.name}. Ecco una panoramica della tua attività.
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dataset</CardTitle>
            <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-' : stats.datasets}</div>
            <p className="text-xs text-muted-foreground">
              {stats.datasets === 0 ? 'Nessun dataset caricato' : 
               stats.datasets === 1 ? '1 dataset caricato' : 
               `${stats.datasets} dataset caricati`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modelli</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-' : stats.models}</div>
            <p className="text-xs text-muted-foreground">
              {stats.models === 0 ? 'Nessun modello addestrato' : 
               stats.models === 1 ? '1 modello addestrato' : 
               `${stats.models} modelli addestrati`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Previsioni</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-' : stats.predictions}</div>
            <p className="text-xs text-muted-foreground">
              {stats.predictions === 0 ? 'Nessuna previsione effettuata' : 
               stats.predictions === 1 ? '1 previsione effettuata' : 
               `${stats.predictions} previsioni effettuate`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Report</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-' : stats.reports}</div>
            <p className="text-xs text-muted-foreground">
              {stats.reports === 0 ? 'Nessun report generato' : 
               stats.reports === 1 ? '1 report generato' : 
               `${stats.reports} report generati`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Carica Dati
            </CardTitle>
            <CardDescription>
              Inizia caricando i tuoi preventivi storici in formato Excel o CSV
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/data">
                Vai alla Gestione Dati
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Addestra Modello
            </CardTitle>
            <CardDescription>
              Addestra un modello predittivo con i tuoi dati storici
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/model">
                Vai ai Modelli
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Nuova Previsione
            </CardTitle>
            <CardDescription>
              Calcola la probabilità di successo per un nuovo preventivo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/scoring">
                Vai allo Scoring
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle>Per Iniziare</CardTitle>
          <CardDescription>
            Segui questi passaggi per iniziare a utilizzare ValutAI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">1</span>
              </div>
              <div>
                <h4 className="font-medium">Carica i tuoi dati</h4>
                <p className="text-sm text-muted-foreground">
                  Importa un file Excel/CSV con almeno 30 righe di preventivi storici
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-purple-600 dark:text-purple-400">2</span>
              </div>
              <div>
                <h4 className="font-medium">Addestra il modello</h4>
                <p className="text-sm text-muted-foreground">
                  Lascia che l&apos;IA analizzi i tuoi dati e crei un modello predittivo
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-green-600 dark:text-green-400">3</span>
              </div>
              <div>
                <h4 className="font-medium">Ottieni previsioni</h4>
                <p className="text-sm text-muted-foreground">
                  Inserisci i dati di nuovi preventivi per conoscere la probabilità di successo
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-orange-600 dark:text-orange-400">4</span>
              </div>
              <div>
                <h4 className="font-medium">Migliora le performance</h4>
                <p className="text-sm text-muted-foreground">
                  Analizza i report per identificare opportunità di miglioramento
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
