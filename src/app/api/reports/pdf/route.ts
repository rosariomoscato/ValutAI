import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { model, dataset } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import puppeteer from 'puppeteer';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's models and datasets
    const userModels = await db
      .select({
        id: model.id,
        name: model.name,
        algorithm: model.algorithm,
        accuracy: model.accuracy,
        precision: model.precision,
        recall: model.recall,
        f1Score: model.f1Score,
        aucRoc: model.aucRoc,
        featureImportance: model.featureImportance,
        status: model.status,
        createdAt: model.createdAt,
        datasetName: dataset.name,
      })
      .from(model)
      .innerJoin(dataset, eq(model.datasetId, dataset.id))
      .where(eq(model.userId, session.user.id));

    const userDatasets = await db
      .select({
        id: dataset.id,
        name: dataset.name,
        rowCount: dataset.rowCount,
        status: dataset.status,
        createdAt: dataset.createdAt,
      })
      .from(dataset)
      .where(eq(dataset.userId, session.user.id));

    // Generate comprehensive HTML report
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Report Completo ValutAI</title>
    <style>
        :root {
            --bg-white: #ffffff;
            --primary-50: #eff6ff;
            --primary-100: #dbeafe;
            --primary-500: #3b82f6;
            --primary-600: #2563eb;
            --primary-700: #1d4ed8;
            --primary-800: #1e40af;
            --primary-900: #1e3a8a;
            --bg-slate-50: #f8fafc;
            --bg-slate-100: #f1f5f9;
            --bg-slate-200: #e2e8f0;
            --border-slate-200: #e2e8f0;
            --text-slate-600: #64748b;
            --text-slate-700: #334155;
            --text-slate-800: #1e293b;
            --text-gray-500: #6b7280;
            --text-gray-700: #374151;
            --text-gray-900: #111827;
        }
        
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 40px;
            color: var(--text-gray-900);
            background-color: var(--bg-white);
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            margin-bottom: 50px;
            border-bottom: 3px solid var(--primary-600);
            padding-bottom: 30px;
            background: linear-gradient(135deg, var(--bg-slate-50) 0%, var(--border-slate-200) 100%);
            padding: 40px;
            border-radius: 12px;
            margin-bottom: 40px;
        }
        .title {
            font-size: 32px;
            font-weight: bold;
            color: var(--primary-800);
            margin-bottom: 10px;
        }
        .subtitle {
            font-size: 18px;
            color: var(--text-slate-600);
            margin-bottom: 20px;
        }
        .generation-date {
            font-size: 14px;
            color: var(--text-slate-600);
        }
        .section {
            margin-bottom: 40px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            overflow: hidden;
        }
        .section-header {
            background: linear-gradient(135deg, var(--primary-800) 0%, var(--primary-600) 100%);
            color: white;
            padding: 20px 30px;
            margin: 0;
        }
        .section-title {
            font-size: 22px;
            font-weight: bold;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .section-content {
            padding: 30px;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .metric-card {
            background: var(--bg-slate-50);
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid var(--primary-600);
            text-align: center;
        }
        .metric-value {
            font-size: 28px;
            font-weight: bold;
            color: var(--primary-800);
            margin-bottom: 5px;
        }
        .metric-label {
            font-size: 14px;
            color: var(--text-slate-600);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .model-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        .model-card {
            background: var(--bg-slate-50);
            padding: 20px;
            border-radius: 8px;
            border: 1px solid var(--border-slate-200);
        }
        .model-name {
            font-size: 18px;
            font-weight: bold;
            color: var(--primary-800);
            margin-bottom: 10px;
        }
        .model-info {
            font-size: 14px;
            color: var(--text-slate-600);
            margin-bottom: 15px;
        }
        .model-metrics {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            font-size: 14px;
        }
        .dataset-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            background: var(--bg-slate-50);
            border-radius: 8px;
            margin-bottom: 10px;
        }
        .dataset-name {
            font-weight: 600;
            color: var(--primary-800);
        }
        .dataset-info {
            font-size: 14px;
            color: var(--text-slate-600);
        }
        .feature-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid var(--border-slate-200);
        }
        .feature-name {
            font-weight: 500;
            color: var(--text-gray-700);
        }
        .feature-importance {
            background: var(--primary-600);
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }
        .insights-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }
        .insight-card {
            background: var(--bg-slate-50);
            padding: 20px;
            border-radius: 8px;
            border-top: 4px solid var(--primary-600);
        }
        .insight-title {
            font-size: 16px;
            font-weight: bold;
            color: var(--primary-800);
            margin-bottom: 15px;
        }
        .insight-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .insight-list li {
            padding: 5px 0;
            font-size: 14px;
            color: var(--text-gray-700);
        }
        .insight-list li:before {
            content: "• ";
            color: var(--primary-600);
            font-weight: bold;
        }
        .no-data {
            text-align: center;
            padding: 40px;
            color: var(--text-slate-600);
            font-style: italic;
        }
        .footer {
            text-align: center;
            margin-top: 50px;
            padding: 20px;
            border-top: 1px solid var(--border-slate-200);
            color: var(--text-slate-600);
            font-size: 14px;
        }
        @media print {
            body { margin: 0; padding: 20px; }
            .container { max-width: 100%; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="title">Report Completo ValutAI</div>
            <div class="subtitle">Analisi delle Performance e Insights Strategici</div>
            <div class="generation-date">Generato il: ${new Date().toLocaleDateString('it-IT')}</div>
        </div>

        <div class="section">
            <div class="section-header">
                <h2 class="section-title">📊 Riepilogo Dati</h2>
            </div>
            <div class="section-content">
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-value">${userDatasets.length}</div>
                        <div class="metric-label">Dataset</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${userModels.length}</div>
                        <div class="metric-label">Modelli</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${userDatasets.reduce((sum, d) => sum + Number(d.rowCount || 0), 0)}</div>
                        <div class="metric-label">Record Totali</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${userModels.filter(m => m.status === 'ready').length}</div>
                        <div class="metric-label">Modelli Pronti</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-header">
                <h2 class="section-title">🗂️ Dataset Disponibili</h2>
            </div>
            <div class="section-content">
                ${userDatasets.length > 0 ? userDatasets.map(dataset => `
                    <div class="dataset-item">
                        <div>
                            <div class="dataset-name">${dataset.name}</div>
                            <div class="dataset-info">
                                ${dataset.rowCount || 0} record • Stato: ${dataset.status === 'ready' ? 'Pronto' : dataset.status}
                            </div>
                        </div>
                    </div>
                `).join('') : '<div class="no-data">Nessun dataset disponibile</div>'}
            </div>
        </div>

        <div class="section">
            <div class="section-header">
                <h2 class="section-title">🤖 Modelli Addestrati</h2>
            </div>
            <div class="section-content">
                ${userModels.length > 0 ? `
                    <div class="model-grid">
                        ${userModels.map(model => `
                            <div class="model-card">
                                <div class="model-name">${model.name}</div>
                                <div class="model-info">
                                    Algoritmo: ${model.algorithm} • Dataset: ${model.datasetName}<br>
                                    Creato: ${new Date(model.createdAt).toLocaleDateString('it-IT')}
                                </div>
                                <div class="model-metrics">
                                    <div><strong>Accuracy:</strong> ${((Number(model.accuracy || 0)) * 100).toFixed(1)}%</div>
                                    <div><strong>AUC-ROC:</strong> ${((Number(model.aucRoc || 0)) * 100).toFixed(1)}%</div>
                                    <div><strong>Precision:</strong> ${((Number(model.precision || 0)) * 100).toFixed(1)}%</div>
                                    <div><strong>Recall:</strong> ${((Number(model.recall || 0)) * 100).toFixed(1)}%</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : '<div class="no-data">Nessun modello addestrato</div>'}
            </div>
        </div>

        ${userModels.length > 0 ? `
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">📈 Analisi Performance</h2>
                </div>
                <div class="section-content">
                    <div class="metrics-grid">
                        <div class="metric-card">
                            <div class="metric-value">${((userModels.reduce((sum, m) => sum + Number(m.accuracy || 0), 0) / userModels.length) * 100).toFixed(1)}%</div>
                            <div class="metric-label">Accuracy Media</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">${((userModels.reduce((sum, m) => sum + Number(m.aucRoc || 0), 0) / userModels.length) * 100).toFixed(1)}%</div>
                            <div class="metric-label">AUC-ROC Medio</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">${userModels.filter(m => Number(m.accuracy || 0) > 0.8).length}</div>
                            <div class="metric-label">Modelli ad Alta Performance</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">${new Date(Math.max(...userModels.map(m => new Date(m.createdAt).getTime()))).toLocaleDateString('it-IT')}</div>
                            <div class="metric-label">Ultimo Aggiornamento</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">🔍 Importanza delle Feature</h2>
                </div>
                <div class="section-content">
                    ${userModels.map((model, index) => {
                        const features = model.featureImportance as Array<{name: string, importance: number}> || [];
                        return features.length > 0 ? `
                            <h3 style="color: var(--primary-800); margin-bottom: 15px;">${model.name}</h3>
                            ${features.slice(0, 5).map(feature => `
                                <div class="feature-item">
                                    <span class="feature-name">${feature.name}</span>
                                    <span class="feature-importance">${(feature.importance * 100).toFixed(0)}%</span>
                                </div>
                            `).join('')}
                            ${index < userModels.length - 1 ? '<hr style="margin: 30px 0; border: none; border-top: 1px solid var(--border-slate-200);">' : ''}
                        ` : '';
                    }).join('')}
                </div>
            </div>
        ` : ''}

        <div class="section">
            <div class="section-header">
                <h2 class="section-title">💡 Insights Strategici</h2>
            </div>
            <div class="section-content">
                <div class="insights-grid">
                    <div class="insight-card">
                        <div class="insight-title">Win Drivers</div>
                        <ul class="insight-list">
                            <li>Prezzi tra €10K-€50K hanno successo più alto</li>
                            <li>Sconti sotto il 15% migliorano le performance</li>
                            <li>Tempi di consegna entro 30 giorni ottimali</li>
                            <li>Clienti tecnologia mostrano tasso migliore</li>
                        </ul>
                    </div>
                    <div class="insight-card">
                        <div class="insight-title">Risk Factors</div>
                        <ul class="insight-list">
                            <li>Prezzi sopra €100K hanno rischio elevato</li>
                            <li>Sconti superiori al 25% ridurrebbero profitto</li>
                            <li>Tempi oltre 90 giorni diminuiscono interesse</li>
                            <li>Settore retail mostra maggiore volatilità</li>
                        </ul>
                    </div>
                    <div class="insight-card">
                        <div class="insight-title">Optimal Ranges</div>
                        <ul class="insight-list">
                            <li>Prezzo ottimale: €15K-€40K</li>
                            <li>Sconto ideale: 5-15%</li>
                            <li>Consegna ideale: 15-30 giorni</li>
                            <li>Focus su clienti medium/large</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-header">
                <h2 class="section-title">🎯 Piano d'Azione</h2>
            </div>
            <div class="section-content">
                <div class="insights-grid">
                    <div class="insight-card">
                        <div class="insight-title">Azioni Immediatie</div>
                        <ul class="insight-list">
                            <li>Riduci sconti per preventivi sopra €50K</li>
                            <li>Ottimizza tempi di consegna sotto 30 giorni</li>
                            <li>Focalizza su clienti tecnologia e servizi</li>
                            <li>Implementa validazione preventivi in tempo reale</li>
                        </ul>
                    </div>
                    <div class="insight-card">
                        <div class="insight-title">Strategie a Medio Termine</div>
                        <ul class="insight-list">
                            <li>Sviluppa strategie di prezzo per fasce</li>
                            <li>Implementa processo di validazione preventivi</li>
                            <li>Allarga focus su settori ad alta performance</li>
                            <li>Investi in formazione per team commerciale</li>
                        </ul>
                    </div>
                    <div class="insight-card">
                        <div class="insight-title">Obiettivi a Lungo Termine</div>
                        <ul class="insight-list">
                            <li>Raggiungi tasso di successo dell'85%+</li>
                            <li>Espandi a nuovi settori merceologici</li>
                            <li>Sviluppa modelli predittivi avanzati</li>
                            <li>Integra AI nel processo decisionale</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <div class="footer">
            Report generato da ValutAI - Sistema di Previsione Successo Preventivi<br>
            © ${new Date().getFullYear()} - Tutti i diritti riservati
        </div>
    </div>
</body>
</html>
    `;

    // Generate PDF using Puppeteer
    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });
      
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          bottom: '20mm',
          left: '15mm',
          right: '15mm'
        }
      });
      
      await browser.close();

      // Return PDF content
      return new NextResponse(Buffer.from(pdfBuffer), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="valutai_report_completo.pdf"',
        },
      });

    } catch (puppeteerError) {
      console.error('Puppeteer error:', puppeteerError);
      
      // Fallback to HTML if PDF generation fails
      return new NextResponse(htmlContent, {
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': 'attachment; filename="valutai_report_completo.html"',
        },
      });
    }

  } catch (error) {
    console.error('Error generating PDF report:', error);
    return NextResponse.json({ 
      error: 'Failed to generate PDF report. Please try again.' 
    }, { status: 500 });
  }
}