"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Calendar, 
  Coins, 
  Activity,
  Database,
  Brain,
  Target,
  FileText,
  TrendingUp,
  TrendingDown,
  Clock
} from "lucide-react";
import Link from "next/link";

interface UserDetails {
  id: string;
  name: string;
  email: string;
  credits: number;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  emailVerified: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  hasReceivedFreeCredits: boolean;
}

interface UserStats {
  resources: {
    datasets: number;
    models: number;
    predictions: number;
    reports: number;
  };
  credits: {
    current: number;
    totalSpent: number;
    totalPurchased: number;
    totalBonuses: number;
  };
  operations: {
    total: number;
    breakdown: Array<{
      operationType: string;
      count: number;
      totalCredits: number;
    }>;
  };
}

interface ActivityItem {
  id: string;
  type: string;
  amount: number;
  balance: number;
  description: string;
  operationType: string | null;
  resourceId: string | null;
  createdAt: string;
}

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  
  const [user, setUser] = useState<UserDetails | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadUserData();
    }
  }, [userId]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/admin/users/${userId}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError('Utente non trovato');
        } else {
          setError('Errore nel caricamento dei dati');
        }
        return;
      }
      
      const data = await response.json();
      setUser(data.user);
      setStats(data.stats);
      setRecentActivity(data.recentActivity);
    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Errore di connessione');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('it-IT');
  };

  const formatCredits = (credits: number) => {
    return credits.toLocaleString();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <Coins className="h-4 w-4 text-green-600" />;
      case 'usage':
        return <Activity className="h-4 w-4 text-red-600" />;
      case 'bonus':
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'Acquisto';
      case 'usage':
        return 'Utilizzo';
      case 'bonus':
        return 'Bonus';
      case 'refund':
        return 'Rimborso';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Caricamento dati utente...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">{error || 'Utente non trovato'}</h1>
          <Link href="/admin">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Torna alla Dashboard Admin
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Indietro
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Dettaglio Utente</h1>
            <p className="text-gray-600 mt-1">
              {user.name} ({user.email})
            </p>
          </div>
        </div>
        {user.isAdmin && (
          <Badge variant="default">Admin</Badge>
        )}
      </div>

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informazioni Utente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                Email
              </div>
              <div className="font-medium">{user.email}</div>
              {user.emailVerified && (
                <Badge variant="secondary" className="text-xs">Verificata</Badge>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                Registrazione
              </div>
              <div className="font-medium">{formatDate(user.createdAt)}</div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Activity className="h-4 w-4" />
                Ultimo Accesso
              </div>
              <div className="font-medium">{formatDate(user.updatedAt)}</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Coins className="h-4 w-4" />
                Crediti Attuali
              </div>
              <div className="font-medium text-lg">{formatCredits(user.credits)}</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <TrendingUp className="h-4 w-4" />
                Crediti Bonus
              </div>
              <div className="font-medium">
                {user.hasReceivedFreeCredits ? 'Sì' : 'No'}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Activity className="h-4 w-4" />
                Stato Stripe
              </div>
              <div className="font-medium">
                {user.stripeCustomerId ? 'Cliente' : 'Non cliente'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Risorse</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>📊 Dataset:</span>
                  <span className="font-medium">{stats.resources.datasets}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>🧠 Modelli:</span>
                  <span className="font-medium">{stats.resources.models}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>🎯 Previsioni:</span>
                  <span className="font-medium">{stats.resources.predictions}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>📄 Report:</span>
                  <span className="font-medium">{stats.resources.reports}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Crediti</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Attuali:</span>
                  <span className="font-medium">{formatCredits(stats.credits.current)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Spesi:</span>
                  <span className="font-medium text-red-600">{formatCredits(stats.credits.totalSpent)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Acquistati:</span>
                  <span className="font-medium text-green-600">{formatCredits(stats.credits.totalPurchased)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Bonus:</span>
                  <span className="font-medium text-blue-600">{formatCredits(stats.credits.totalBonuses)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Operazioni</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Totale:</span>
                  <span className="font-medium">{stats.operations.total}</span>
                </div>
                {stats.operations.breakdown.slice(0, 3).map((op) => (
                  <div key={op.operationType} className="flex justify-between text-sm">
                    <span className="capitalize">{op.operationType}:</span>
                    <span className="font-medium">{op.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Media per Operazione</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {stats.operations.breakdown.slice(0, 4).map((op) => (
                  <div key={op.operationType} className="flex justify-between text-sm">
                    <span className="capitalize">{op.operationType}:</span>
                    <span className="font-medium">{Math.round(op.totalCredits / op.count)} crediti</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Attività Recente (ultimi 30 giorni)
          </CardTitle>
          <CardDescription>
            Transazioni e operazioni effettuate dall&apos;utente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nessuna attività recente
              </div>
            ) : (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getActivityIcon(activity.type)}
                    <div>
                      <div className="font-medium">{activity.description}</div>
                      <div className="text-sm text-gray-500">
                        {getActivityTypeLabel(activity.type)} • {formatDate(activity.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${
                      activity.type === 'usage' ? 'text-red-600' : 
                      activity.type === 'purchase' ? 'text-green-600' : 
                      activity.type === 'bonus' ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      {activity.type === 'usage' ? '-' : '+'}{Math.abs(activity.amount)} crediti
                    </div>
                    <div className="text-sm text-gray-500">
                      Saldo: {activity.balance}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}