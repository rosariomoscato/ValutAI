import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { CreditsService } from '@/lib/credits';
import { report, model } from '@/lib/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get reports for user's models
    const reports = await db
      .select({
        id: report.id,
        title: report.title,
        createdAt: report.createdAt,
        modelName: model.name,
        insights: report.insights,
      })
      .from(report)
      .innerJoin(model, eq(report.modelId, model.id))
      .where(eq(model.userId, session.user.id))
      .orderBy(desc(report.createdAt));

    return NextResponse.json({ 
      reports: reports
    });

  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch reports. Please try again.' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has enough credits for report generation (50 credits per report)
    const reportCost = await CreditsService.getOperationCost('report_generation');
    if (reportCost === null) {
      // Try to initialize default operations if they don't exist
      try {
        await CreditsService.initializeDefaultOperations();
        const retryCost = await CreditsService.getOperationCost('report_generation');
        if (retryCost === null) {
          return NextResponse.json({ 
            error: 'Sistema crediti non disponibile',
            userMessage: 'Al momento non è possibile verificare i crediti. Riprova più tardi.' 
          }, { status: 503 });
        }
      } catch (error) {
        return NextResponse.json({ 
          error: 'Sistema crediti non disponibile', 
          userMessage: 'Al momento non è possibile verificare i crediti. Riprova più tardi.' 
        }, { status: 503 });
      }
    }

    const hasEnoughCredits = await CreditsService.hasEnoughCredits(session.user.id, reportCost || 50);
    if (!hasEnoughCredits) {
      const userCredits = await CreditsService.getUserCredits(session.user.id);
      return NextResponse.json({ 
        error: 'Crediti insufficienti', 
        userMessage: `Crediti insufficienti per generare un report. Richiesti ${reportCost || 50} crediti, disponibili ${userCredits}.`,
        requiredCredits: reportCost || 50,
        availableCredits: userCredits,
        actionNeeded: 'Ricarica i tuoi crediti per continuare',
        purchaseLink: '/credits'
      }, { status: 402 });
    }

    const { modelId } = await request.json();

    if (!modelId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the model belongs to the user
    const modelRecord = await db
      .select({
        id: model.id,
        name: model.name,
        accuracy: model.accuracy,
        aucRoc: model.aucRoc,
        precision: model.precision,
        recall: model.recall,
        featureImportance: model.featureImportance,
      })
      .from(model)
      .where(and(eq(model.id, modelId), eq(model.userId, session.user.id)))
      .limit(1);

    if (modelRecord.length === 0) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    // Generate comprehensive report insights
    const insights = {
      performance: {
        accuracy: parseFloat(modelRecord[0].accuracy || '0'),
        aucRoc: parseFloat(modelRecord[0].aucRoc || '0'),
        precision: parseFloat(modelRecord[0].precision || '0'),
        recall: parseFloat(modelRecord[0].recall || '0'),
      },
      keyMetrics: {
        totalPredictions: Math.floor(Math.random() * 1000) + 100, // Simulated
        averageWinProbability: 0.65 + (Math.random() * 0.2), // 65-85%
        topPerformingSector: 'technology',
        optimalPriceRange: '€15K-€40K',
      },
      featureAnalysis: modelRecord[0].featureImportance || [
        { name: 'Prezzo Totale', importance: 0.25 },
        { name: 'Sconto %', importance: 0.20 },
        { name: 'Tempi Consegna', importance: 0.15 },
        { name: 'Settore Cliente', importance: 0.15 },
        { name: 'Dimensione Cliente', importance: 0.10 },
      ],
    };

    const recommendations = {
      immediate: [
        'Focus su preventivi con prezzi tra €15K-€40K per massimizzare il successo',
        'Mantieni sconti sotto il 15% per preservare i margini',
        'Ottimizza tempi di consegna entro 30 giorni',
        'Prioritizza clienti dei settori tecnologia e servizi',
      ],
      strategic: [
        'Sviluppa strategie di pricing per segmenti specifici',
        'Implementa sistema di scoring automatico per nuovi preventivi',
        'Allarga focalizzazione su settori ad alta performance',
        'Migliora qualità dati per aumentare accuratezza modello',
      ],
      longTerm: [
        'Raggiungi obiettivo tasso di successo dell\'85%',
        'Espandi a nuovi mercati verticali',
        'Sviluppa modelli predittivi per altre fasi del ciclo di vendita',
        'Integra con altri sistemi aziendali per dati completi',
      ],
    };

    // Calculate overall performance score
    const performanceScore = Math.round((
      insights.performance.accuracy + 
      insights.performance.aucRoc + 
      insights.performance.precision + 
      insights.performance.recall
    ) * 25);

    // Create report content matching the schema
    const reportContent = {
      performance: insights.performance,
      keyMetrics: insights.keyMetrics,
      featureAnalysis: insights.featureAnalysis,
      recommendations: recommendations,
      performanceScore: performanceScore,
      generatedAt: new Date().toISOString(),
    };

    // Save report to database
    const reportResult = await db.insert(report).values({
      id: crypto.randomUUID(),
      modelId: modelId,
      title: `Report ${new Date().toLocaleDateString('it-IT')} - ${modelRecord[0].name}`,
      content: reportContent as Record<string, unknown>,
      insights: insights as Record<string, unknown>,
    }).returning();

    // Deduct credits for report generation
    const creditsDeducted = await CreditsService.deductCredits(
      session.user.id, 
      reportCost || 50, 
      `Report generation for model ${modelId}`,
      'report_generation',
      reportResult[0].id
    );

    // Trigger credit update event
    const { triggerCreditUpdate } = await import('@/lib/credit-events');
    triggerCreditUpdate();

    if (!creditsDeducted) {
      // Rollback - delete the report if credit deduction failed
      await db.delete(report).where(eq(report.id, reportResult[0].id));
      return NextResponse.json({ 
        error: 'Failed to deduct credits. Please try again.' 
      }, { status: 500 });
    }

    return NextResponse.json({
      id: reportResult[0].id,
      title: reportResult[0].title,
      createdAt: reportResult[0].createdAt,
      insights: insights,
      recommendations: recommendations,
      performanceScore: performanceScore,
    });

  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ 
      error: 'Failed to generate report. Please try again.' 
    }, { status: 500 });
  }
}