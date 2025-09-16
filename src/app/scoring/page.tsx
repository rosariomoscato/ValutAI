"use client";

import { useSession } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Target, Brain, TrendingUp, AlertCircle, Info } from "lucide-react";
import { useState } from "react";

export default function ScoringPage() {
  const { data: session, isPending } = useSession();
  const [formData, setFormData] = useState({
    customerSector: "",
    customerSize: "",
    totalPrice: "",
    discountPercentage: "",
    deliveryTime: "",
    channel: "",
    salesRep: "",
    leadSource: ""
  });

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
              È necessario accedere per effettuare previsioni
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement prediction API call
    console.log("Prediction request:", formData);
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scoring Preventivi</h1>
          <p className="text-muted-foreground">
            Calcola la probabilità di successo per i tuoi nuovi preventivi
          </p>
        </div>
      </div>

      {/* Model Status */}
      <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
            <AlertCircle className="h-5 w-5" />
            Modello Non Disponibile
          </CardTitle>
          <CardDescription className="text-orange-700 dark:text-orange-300">
            Per effettuare previsioni, è necessario prima addestrare un modello con i tuoi dati storici
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">
            <Brain className="mr-2 h-4 w-4" />
            Vai ai Modelli
          </Button>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Nuovo Preventivo
            </CardTitle>
            <CardDescription>
              Inserisci i dati del preventivo per ottenere una previsione
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Settore Cliente</label>
                  <select 
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    value={formData.customerSector}
                    onChange={(e) => handleInputChange("customerSector", e.target.value)}
                    disabled
                  >
                    <option value="">Seleziona settore</option>
                    <option value="technology">Tecnologia</option>
                    <option value="manufacturing">Produzione</option>
                    <option value="services">Servizi</option>
                    <option value="retail">Retail</option>
                    <option value="healthcare">Sanità</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Dimensione Cliente</label>
                  <select 
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    value={formData.customerSize}
                    onChange={(e) => handleInputChange("customerSize", e.target.value)}
                    disabled
                  >
                    <option value="">Seleziona dimensione</option>
                    <option value="small">Piccola</option>
                    <option value="medium">Media</option>
                    <option value="large">Grande</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Prezzo Totale (€)</label>
                  <input 
                    type="number" 
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    placeholder="10000"
                    value={formData.totalPrice}
                    onChange={(e) => handleInputChange("totalPrice", e.target.value)}
                    disabled
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Sconto (%)</label>
                  <input 
                    type="number" 
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    placeholder="10"
                    value={formData.discountPercentage}
                    onChange={(e) => handleInputChange("discountPercentage", e.target.value)}
                    disabled
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Tempi Consegna (giorni)</label>
                  <input 
                    type="number" 
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    placeholder="30"
                    value={formData.deliveryTime}
                    onChange={(e) => handleInputChange("deliveryTime", e.target.value)}
                    disabled
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Canale Vendite</label>
                  <select 
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    value={formData.channel}
                    onChange={(e) => handleInputChange("channel", e.target.value)}
                    disabled
                  >
                    <option value="">Seleziona canale</option>
                    <option value="direct">Diretto</option>
                    <option value="partner">Partner</option>
                    <option value="online">Online</option>
                    <option value="retail">Retail</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Responsabile</label>
                  <input 
                    type="text" 
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    placeholder="Mario Rossi"
                    value={formData.salesRep}
                    onChange={(e) => handleInputChange("salesRep", e.target.value)}
                    disabled
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Lead Source</label>
                  <select 
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    value={formData.leadSource}
                    onChange={(e) => handleInputChange("leadSource", e.target.value)}
                    disabled
                  >
                    <option value="">Seleziona source</option>
                    <option value="website">Sito Web</option>
                    <option value="referral">Referal</option>
                    <option value="cold">Cold Call</option>
                    <option value="event">Evento</option>
                    <option value="social">Social Media</option>
                  </select>
                </div>
              </div>
              
              <Button type="submit" disabled className="w-full">
                <TrendingUp className="mr-2 h-4 w-4" />
                Calcola Previsione
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Prediction Result */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Risultato Previsione
            </CardTitle>
            <CardDescription>
              Probabilità di successo e fattori influenti
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Nessuna Previsione
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Compila il form e addestra un modello per ottenere previsioni
              </p>
              <div className="space-y-2">
                <Button disabled variant="outline" className="w-full">
                  Addestra Modello
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Importance */}
      <Card>
        <CardHeader>
          <CardTitle>Fattori Influenti</CardTitle>
          <CardDescription>
            Variabili che più influenzano la probabilità di successo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-2">-</div>
              <div className="text-sm font-medium">Prezzo Totale</div>
              <div className="text-xs text-gray-500">Impact non disponibile</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-2">-</div>
              <div className="text-sm font-medium">Sconto %</div>
              <div className="text-xs text-gray-500">Impact non disponibile</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-2">-</div>
              <div className="text-sm font-medium">Tempi Consegna</div>
              <div className="text-xs text-gray-500">Impact non disponibile</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Raccomandazioni</CardTitle>
          <CardDescription>
            Suggerimenti per migliorare la probabilità di successo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Info className="mx-auto h-8 w-8 text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Le raccomandazioni appariranno dopo aver effettuato una previsione
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}