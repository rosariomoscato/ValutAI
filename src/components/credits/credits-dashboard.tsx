"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Coins, 
  TrendingUp, 
  Clock, 
  Plus,
  CreditCard,
  History,
  Package,
  Zap
} from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

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

interface CreditsDashboardProps {
  initialCredits: number;
  initialPackages: CreditPackage[];
  initialTransactions: Transaction[];
}

export function CreditsDashboard({ 
  initialCredits, 
  initialPackages, 
  initialTransactions 
}: CreditsDashboardProps) {
  const [credits, setCredits] = useState(initialCredits);
  const [packages] = useState(initialPackages);
  const [transactions] = useState(initialTransactions);
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchaseCredits = async (packageId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ packageId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret, amount, packageName } = await response.json();
      
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe not loaded');
      }

      const { error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: {
            // In a real app, you would collect card details using Stripe Elements
            token: 'tok_visa', // This is a test token
          },
        },
      });

      if (error) {
        throw error;
      }

      // Refresh credits after successful payment
      const creditsResponse = await fetch('/api/credits');
      const { credits: newCredits } = await creditsResponse.json();
      setCredits(newCredits);

      alert(`Successfully purchased ${packageName}!`);
    } catch (error) {
      console.error('Error purchasing credits:', error);
      alert('Failed to purchase credits. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <Plus className="h-4 w-4 text-green-600" />;
      case 'usage':
        return <Zap className="h-4 w-4 text-red-600" />;
      case 'bonus':
        return <Coins className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionAmount = (type: string, amount: number) => {
    const sign = type === 'usage' ? '-' : '+';
    return `${sign}${Math.abs(amount)}`;
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'purchase':
      case 'bonus':
        return 'text-green-600';
      case 'usage':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Credits Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            I Tuoi Crediti
          </CardTitle>
          <CardDescription>
            Gestisci i tuoi crediti per utilizzare le funzionalità della piattaforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-primary">
                {credits.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Crediti disponibili</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">
                Ultima operazione: {transactions[0]?.createdAt ? new Date(transactions[0].createdAt).toLocaleDateString('it-IT') : 'Nessuna'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credit Packages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Pacchetti Crediti
          </CardTitle>
          <CardDescription>
            Acquista crediti per utilizzare tutte le funzionalità della piattaforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {packages.map((pkg) => (
              <Card 
                key={pkg.id} 
                className={`relative ${pkg.isPopular ? 'ring-2 ring-primary' : ''}`}
              >
                {pkg.isPopular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    Più Popolare
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-lg">{pkg.name}</CardTitle>
                  <div className="text-3xl font-bold text-primary">
                    {pkg.credits.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Crediti</div>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div className="text-2xl font-bold">
                    €{pkg.price}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {((pkg.price / pkg.credits) * 100).toFixed(2)} centesimi per credito
                  </div>
                  <Button 
                    onClick={() => handlePurchaseCredits(pkg.id)}
                    disabled={isLoading}
                    className="w-full"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {isLoading ? 'Elaborazione...' : 'Acquista Ora'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Operation Costs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Costi Operazione
          </CardTitle>
          <CardDescription>
            Crediti necessari per ogni operazione
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-blue-600" />
                <span>Caricamento Dataset</span>
              </div>
              <Badge variant="secondary">10 crediti</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span>Addestramento Modello</span>
              </div>
              <Badge variant="secondary">10 crediti</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-600" />
                <span>Predizione</span>
              </div>
              <Badge variant="secondary">2 crediti</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-orange-600" />
                <span>Generazione Report</span>
              </div>
              <Badge variant="secondary">50 crediti</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Storico Transazioni
          </CardTitle>
          <CardDescription>
            Ultime operazioni con i tuoi crediti
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.slice(0, 10).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getTransactionIcon(transaction.type)}
                  <div>
                    <div className="font-medium">{transaction.description}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(transaction.createdAt).toLocaleDateString('it-IT')} • {transaction.operationType}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-medium ${getTransactionColor(transaction.type)}`}>
                    {getTransactionAmount(transaction.type, transaction.amount)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Saldo: {transaction.balance}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}