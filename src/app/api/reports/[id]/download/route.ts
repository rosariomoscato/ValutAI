import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { report, model } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reportId = params.id;

    // Get the report with user verification
    const reportRecord = await db
      .select({
        id: report.id,
        title: report.title,
        content: report.content,
        insights: report.insights,
        createdAt: report.createdAt,
        modelName: model.name,
      })
      .from(report)
      .innerJoin(model, eq(report.modelId, model.id))
      .where(and(eq(report.id, reportId), eq(model.userId, session.user.id)))
      .limit(1);

    if (reportRecord.length === 0) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    const reportData = reportRecord[0];
    
    // Type guard for report content
    const content = reportData.content as {
      performanceScore: number;
      performance: {
        accuracy: number;
        aucRoc: number;
        precision: number;
        recall: number;
      };
      keyMetrics: {
        totalPredictions: number;
        averageWinProbability: number;
        topPerformingSector: string;
        optimalPriceRange: string;
      };
      featureAnalysis: Array<{
        name: string;
        importance: number;
      }>;
      recommendations: {
        immediate: string[];
        strategic: string[];
        longTerm: string[];
      };
    };

    // Generate PDF content as HTML
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${reportData.title}</title>
    <style>
        :root {
            --primary-50: #eff6ff;
            --primary-100: #dbeafe;
            --primary-500: #3b82f6;
            --primary-600: #2563eb;
            --primary-700: #1d4ed8;
            --primary-800: #1e40af;
            --primary-900: #1e3a8a;
            --sky-500: #0ea5e9;
            --sky-600: #0284c7;
            --sky-700: #0369a1;
            --sky-800: #075985;
            --bg-slate-50: #f8fafc;
            --bg-blue-50: #dbeafe;
            --bg-blue-100: #eff6ff;
            --border-slate-200: #e2e8f0;
            --text-gray-500: #6b7280;
            --text-gray-700: #374151;
            --text-gray-900: #111827;
        }
        
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 40px;
            color: var(--text-gray-900);
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 2px solid var(--primary-600);
            padding-bottom: 20px;
        }
        .title {
            font-size: 24px;
            font-weight: bold;
            color: var(--primary-800);
            margin-bottom: 10px;
        }
        .subtitle {
            font-size: 16px;
            color: var(--text-gray-500);
            margin-bottom: 5px;
        }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: var(--primary-800);
            margin-bottom: 15px;
            border-left: 4px solid var(--primary-600);
            padding-left: 10px;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-bottom: 20px;
        }
        .metric-card {
            background: var(--bg-slate-50);
            padding: 15px;
            border-radius: 8px;
            border: 1px solid var(--border-slate-200);
        }
        .metric-label {
            font-size: 12px;
            color: var(--text-gray-500);
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        .metric-value {
            font-size: 20px;
            font-weight: bold;
            color: var(--primary-800);
        }
        .performance-score {
            text-align: center;
            background: var(--bg-blue-50);
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .score-value {
            font-size: 36px;
            font-weight: bold;
            color: var(--primary-800);
        }
        .score-label {
            font-size: 14px;
            color: var(--text-gray-500);
            margin-top: 5px;
        }
        .feature-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid var(--border-slate-200);
        }
        .feature-name {
            font-weight: 500;
        }
        .feature-importance {
            background: var(--primary-600);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
        }
        .recommendations-list {
            list-style: none;
            padding: 0;
        }
        .recommendation-item {
            background: var(--bg-blue-50);
            padding: 12px;
            margin-bottom: 10px;
            border-radius: 6px;
            border-left: 4px solid var(--sky-500);
        }
        .recommendation-category {
            font-weight: bold;
            color: var(--sky-700);
            margin-bottom: 8px;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            color: var(--text-gray-500);
            font-size: 12px;
            border-top: 1px solid var(--border-slate-200);
            padding-top: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">${reportData.title}</div>
        <div class="subtitle">Modello: ${reportData.modelName}</div>
        <div class="subtitle">Generato il: ${new Date(reportData.createdAt).toLocaleDateString('it-IT')}</div>
    </div>

    <div class="section">
        <div class="section-title">Punteggio Performance</div>
        <div class="performance-score">
            <div class="score-value">${content.performanceScore}/100</div>
            <div class="score-label">Punteggio Complessivo</div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Metriche di Performance</div>
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-label">Accuracy</div>
                <div class="metric-value">${(content.performance.accuracy * 100).toFixed(1)}%</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">AUC-ROC</div>
                <div class="metric-value">${(content.performance.aucRoc * 100).toFixed(1)}%</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Precision</div>
                <div class="metric-value">${(content.performance.precision * 100).toFixed(1)}%</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Recall</div>
                <div class="metric-value">${(content.performance.recall * 100).toFixed(1)}%</div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Metriche Chiave</div>
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-label">Previsioni Totali</div>
                <div class="metric-value">${content.keyMetrics.totalPredictions}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Probabilità Media</div>
                <div class="metric-value">${(content.keyMetrics.averageWinProbability * 100).toFixed(1)}%</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Settore Top</div>
                <div class="metric-value">${content.keyMetrics.topPerformingSector}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Range Prezzo Ottimale</div>
                <div class="metric-value">${content.keyMetrics.optimalPriceRange}</div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Importanza delle Feature</div>
        ${content.featureAnalysis.map((feature) => `
            <div class="feature-item">
                <span class="feature-name">${feature.name}</span>
                <span class="feature-importance">${(feature.importance * 100).toFixed(0)}%</span>
            </div>
        `).join('')}
    </div>

    <div class="section">
        <div class="section-title">Raccomandazioni</div>
        <div class="recommendations-list">
            <div class="recommendation-item">
                <div class="recommendation-category">Azioni Immediati</div>
                ${content.recommendations.immediate.map((rec) => `<p>• ${rec}</p>`).join('')}
            </div>
            <div class="recommendation-item">
                <div class="recommendation-category">Strategico</div>
                ${content.recommendations.strategic.map((rec) => `<p>• ${rec}</p>`).join('')}
            </div>
            <div class="recommendation-item">
                <div class="recommendation-category">Lungo Termine</div>
                ${content.recommendations.longTerm.map((rec) => `<p>• ${rec}</p>`).join('')}
            </div>
        </div>
    </div>

    <div class="footer">
        Report generato da ValutAI - Sistema di Previsione Successo Preventivi<br>
        © ${new Date().getFullYear()} ValutAI by RoMoS. Tutti i diritti riservati
    </div>
</body>
</html>
    `;

    // Return HTML content
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="${reportData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html"`,
      },
    });

  } catch (error) {
    console.error('Error downloading report:', error);
    return NextResponse.json({ 
      error: 'Failed to download report. Please try again.' 
    }, { status: 500 });
  }
}