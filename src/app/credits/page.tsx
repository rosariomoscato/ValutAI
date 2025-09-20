"use client";

import { useSession } from "@/lib/auth-client";
import { CreditsDashboard } from "@/components/credits/credits-dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  currency: string;
  isPopular: boolean;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  balance: number;
  description: string;
  operationType?: string;
  createdAt: string;
}

interface CreditsData {
  credits: number;
  transactions: Transaction[];
}

export default function CreditsPage() {
  const { data: session, isPending } = useSession();
  const [creditsData, setCreditsData] = useState<CreditsData>({ credits: 0, transactions: [] });
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCreditsData = useCallback(async () => {
    try {
      console.log('Fetching credits data...');
      const response = await fetch('/api/credits', {
        cache: 'no-store',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch credits data');
      }
      
      const data = await response.json();
      console.log('Credits data received:', data);
      setCreditsData(data);
      
      // Always try to fix user credits on page load to ensure they have the correct amount
      console.log(`User has ${data.credits} credits, running credit fix check...`);
      try {
        const fixResponse = await fetch('/api/credits/fix-user-credits', {
          method: 'POST',
          cache: 'no-store',
        });
        
        if (fixResponse.ok) {
          const fixData = await fixResponse.json();
          console.log('Credit fix response:', fixData);
          if (fixData.fixed) {
            console.log('User credits fixed, refreshing data...');
            // Refresh credits data after fix
            const refreshResponse = await fetch('/api/credits', {
              cache: 'no-store',
            });
            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              console.log('Refreshed credits data after fix:', refreshData);
              setCreditsData(refreshData);
            }
          }
        }
      } catch (fixError) {
        console.error('Error fixing user credits:', fixError);
      }
    } catch (error) {
      console.error('Error fetching credits data:', error);
      setCreditsData({ credits: 0, transactions: [] });
    }
  }, []);

  const fetchCreditPackages = useCallback(async () => {
    try {
      const response = await fetch('/api/credits/packages', {
        cache: 'no-store',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch credit packages');
      }
      
      const data = await response.json();
      setPackages(data.packages || []);
    } catch (error) {
      console.error('Error fetching credit packages:', error);
      setPackages([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) {
      fetchCreditsData();
      fetchCreditPackages();
    } else if (!isPending) {
      setIsLoading(false);
    }
  }, [session, isPending, fetchCreditsData, fetchCreditPackages]);

  // Add event listener for credit updates
  useEffect(() => {
    const handleCreditUpdate = () => {
      if (session) {
        fetchCreditsData();
      }
    };

    window.addEventListener('creditsUpdated', handleCreditUpdate);
    return () => window.removeEventListener('creditsUpdated', handleCreditUpdate);
  }, [session, fetchCreditsData]);

  if (isPending || isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Caricamento...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <CardTitle>Accesso Protetto</CardTitle>
              <CardDescription>
                Per accedere alla gestione dei crediti, devi prima effettuare l&apos;accesso.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full">
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Torna al Dashboard
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestione Crediti</h1>
          <p className="text-muted-foreground">
            Acquista e gestisci i tuoi crediti per utilizzare tutte le funzionalità di ValutAI
          </p>
          <div className="mt-2 text-sm text-blue-600">
            Debug: Credits from API: {creditsData.credits} | Loading: {isLoading ? 'Yes' : 'No'}
          </div>
        </div>
        <Button 
          onClick={fetchCreditsData} 
          variant="outline" 
          size="sm"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Aggiorna
        </Button>
      </div>
      
      <CreditsDashboard 
        initialCredits={creditsData.credits}
        initialPackages={packages}
        initialTransactions={creditsData.transactions}
      />
    </div>
  );
}