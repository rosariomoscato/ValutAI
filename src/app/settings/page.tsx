"use client";

import { useSession } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, User, Shield, Database, Bell, Download, Trash2, Users } from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";

export default function SettingsPage() {
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
              È necessario accedere per gestire le impostazioni
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
          <h1 className="text-3xl font-bold tracking-tight">Impostazioni</h1>
          <p className="text-muted-foreground">
            Gestisci il tuo account e le preferenze della piattaforma
          </p>
        </div>
      </div>

      {/* User Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profilo Utente
          </CardTitle>
          <CardDescription>
            Informazioni personali e dettagli dell&apos;account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Nome</label>
                <div className="border rounded-md px-3 py-2 bg-gray-50 dark:bg-gray-800">
                  {session.user.name}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <div className="border rounded-md px-3 py-2 bg-gray-50 dark:bg-gray-800">
                  {session.user.email}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Ruolo</label>
                <div className="border rounded-md px-3 py-2 bg-gray-50 dark:bg-gray-800 capitalize">
                  {((session.user as { role?: string }).role || "viewer")}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Membro dal</label>
                <div className="border rounded-md px-3 py-2 bg-gray-50 dark:bg-gray-800">
                  {new Date(session.user.createdAt || Date.now()).toLocaleDateString('it-IT')}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Sicurezza Account
          </CardTitle>
          <CardDescription>
            Gestisci la sicurezza del tuo account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Autenticazione Google</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Account connesso con Google OAuth
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">Attivo</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Sessioni Attive</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Disconnetti sessioni su altri dispositivi
                </p>
              </div>
              <Button variant="outline" size="sm">
                Gestisci Sessioni
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Gestione Dati
          </CardTitle>
          <CardDescription>
            Gestisci i tuoi dati e preferenze
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Esporta Dati</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Scarica tutti i tuoi dati in formato JSON
                </p>
              </div>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Esporta
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg">
              <div>
                <h4 className="font-medium text-red-600 dark:text-red-400">Elimina Account</h4>
                <p className="text-sm text-red-500 dark:text-red-400">
                  Cancella permanentemente il tuo account e tutti i dati
                </p>
              </div>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Elimina
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifiche
          </CardTitle>
          <CardDescription>
            Configura le preferenze di notifica
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Email Notifications</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Ricevi notifiche importanti via email
                </p>
              </div>
              <Button variant="outline" size="sm">
                Configura
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Training Completato</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Notifica quando il modello è pronto
                </p>
              </div>
              <Button variant="outline" size="sm">
                Configura
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Management (solo per owner) */}
      {(session.user as { role?: string }).role === "owner" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gestione Team
            </CardTitle>
            <CardDescription>
              Gestisci gli utenti e i permessi del tuo team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Invita Utenti</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Aggiungi nuovi membri al tuo team
                  </p>
                </div>
                <Button size="sm">
                  Invita Utente
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Gestisci Permessi</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Configura i ruoli e gli accessi
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Gestisci Ruoli
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <Shield className="h-5 w-5" />
            Zona Pericolosa
          </CardTitle>
          <CardDescription className="text-red-600 dark:text-red-400">
            Azioni irreversibili che cancelleranno i tuoi dati
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950">
              <div>
                <h4 className="font-medium text-red-800 dark:text-red-200">Disconnetti Tutti i Dispositivi</h4>
                <p className="text-sm text-red-600 dark:text-red-400">
                  Termina tutte le sessioni attive eccetto quella corrente
                </p>
              </div>
              <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100" size="sm">
                Disconnetti Tutti
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950">
              <div>
                <h4 className="font-medium text-red-800 dark:text-red-200">Resetta Dati</h4>
                <p className="text-sm text-red-600 dark:text-red-400">
                  Cancella tutti i dati ma mantieni l&apos;account
                </p>
              </div>
              <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100" size="sm">
                Resetta Dati
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logout */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Disconnessione</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Disconnettiti dal tuo account
              </p>
            </div>
            <SignOutButton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}