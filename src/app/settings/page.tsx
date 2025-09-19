"use client";

import { useSession } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Lock, 
  User, 
  Download, 
  Trash2, 
  Users, 
  ChevronDown,
  ChevronUp,
  Settings
} from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

export default function SettingsPage() {
  const { data: session, isPending } = useSession();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const userRole = (session?.user as { role?: string })?.role || "viewer";
  const isOwner = userRole === "owner";

  const handleExportData = async () => {
    if (isExporting) return;
    
    setIsExporting(true);
    
    try {
      const response = await fetch('/api/export/data', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      // Get the filename from the response headers
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/['"]/g, '') || 'valutai_export.json'
        : 'valutai_export.json';
      
      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (error) {
      console.error('Export error:', error);
      // You could add a toast notification here
      alert('Esportazione fallita. Riprova più tardi.');
    } finally {
      setIsExporting(false);
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
              È necessario accedere per gestire le impostazioni
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Impostazioni</h1>
        </div>
        <p className="text-muted-foreground">
          Gestisci il tuo account e le preferenze della piattaforma
        </p>
      </div>

      {/* Profilo Account */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profilo Account
          </CardTitle>
          <CardDescription>
            Informazioni personali e dettagli del tuo account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Profile Info */}
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
                <div className="border rounded-md px-3 py-2 bg-gray-50 dark:bg-gray-800 flex items-center gap-2">
                  <span className="capitalize">{userRole}</span>
                  <Badge variant="secondary" className="text-xs">
                    {userRole === "owner" ? "Amministratore" : "Utente"}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Membro dal</label>
                <div className="border rounded-md px-3 py-2 bg-gray-50 dark:bg-gray-800">
                  {new Date(session.user.createdAt || Date.now()).toLocaleDateString('it-IT')}
                </div>
              </div>
            </div>
            
            {/* Logout Section */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Disconnessione</h4>
                  <p className="text-sm text-muted-foreground">
                    Disconnettiti dal tuo account
                  </p>
                </div>
                <SignOutButton />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Team & Collaborazione */}
      {isOwner && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team & Collaborazione
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
                  <p className="text-sm text-muted-foreground">
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
                  <p className="text-sm text-muted-foreground">
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

      {/* Impostazioni Avanzate */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Impostazioni Avanzate
          </CardTitle>
          <CardDescription>
            Funzionalità avanzate e gestione dati
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Toggle Button */}
            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full justify-between"
            >
              {showAdvanced ? "Nascondi avanzate" : "Mostra avanzate"}
              {showAdvanced ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            
            {/* Advanced Settings */}
            {showAdvanced && (
              <div className="space-y-4 pt-4 border-t">
                {/* Data Export */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Esporta Dati</h4>
                    <p className="text-sm text-muted-foreground">
                      Scarica tutti i tuoi dati in formato JSON
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleExportData}
                    disabled={isExporting}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {isExporting ? 'Esportando...' : 'Esporta'}
                  </Button>
                </div>
                
                {/* Active Sessions */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Sessioni Attive</h4>
                    <p className="text-sm text-muted-foreground">
                      Disconnetti sessioni su altri dispositivi
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        Disconnetti Tutti
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Disconnetti Tutti i Dispositivi</AlertDialogTitle>
                        <AlertDialogDescription>
                          Questa azione terminerà tutte le sessioni attive eccetto quella corrente. Dovrai accedere nuovamente sugli altri dispositivi.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annulla</AlertDialogCancel>
                        <AlertDialogAction>Continua</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                
                {/* Danger Zone */}
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-medium text-red-600 dark:text-red-400">Azioni Permanenti</h4>
                  
                  {/* Reset Data */}
                  <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950">
                    <div>
                      <h4 className="font-medium text-red-800 dark:text-red-200">Resetta Dati</h4>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Cancella tutti i dati ma mantieni l&apos;account
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100" size="sm">
                          Resetta Dati
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Resetta Dati</AlertDialogTitle>
                          <AlertDialogDescription>
                            Questa azione cancellerà permanentemente tutti i tuoi dati inclusi modelli, dataset e report. Il tuo account verrà mantenuto ma tutti i dati andranno persi.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annulla</AlertDialogCancel>
                          <AlertDialogAction className="bg-red-600 hover:bg-red-700">Resetta Dati</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  
                  {/* Delete Account */}
                  <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950">
                    <div>
                      <h4 className="font-medium text-red-800 dark:text-red-200">Elimina Account</h4>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Cancella permanentemente il tuo account e tutti i dati
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Elimina
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Elimina Account</AlertDialogTitle>
                          <AlertDialogDescription>
                            Questa azione cancellerà permanentemente il tuo account e tutti i dati associati. Questa operazione non può essere annullata.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annulla</AlertDialogCancel>
                          <AlertDialogAction className="bg-red-600 hover:bg-red-700">Elimina Account</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>



    </div>
  );
}