import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { 
  user, 
  dataset, 
  model, 
  prediction, 
  quote, 
  report 
} from '@/lib/schema';
import { eq, and, isNotNull, inArray } from 'drizzle-orm';

interface ExportData {
  userInfo: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    exportedAt: string;
  };
  datasets: Array<{
    id: string;
    name: string;
    description: string | null;
    fileName: string;
    fileSize: number;
    rowCount: number;
    status: string;
    createdAt: string;
    updatedAt: string;
  }>;
  models: Array<{
    id: string;
    name: string;
    description: string | null;
    algorithm: string;
    status: string;
    accuracy: number | null;
    precision: number | null;
    recall: number | null;
    f1Score: number | null;
    aucRoc: number | null;
    trainingTime: number | null;
    createdAt: string;
    updatedAt: string;
  }>;
  predictions: Array<{
    id: string;
    modelId: string;
    winProbability: number;
    confidence: number;
    customerSector: string | null;
    customerSize: string | null;
    discountPercentage: number | null;
    totalPrice: number | null;
    deliveryTime: number | null;
    channel: string | null;
    salesRep: string | null;
    leadSource: string | null;
    createdAt: string;
  }>;
  quotes: Array<{
    id: string;
    datasetId: string;
    customerSector: string | null;
    customerSize: string | null;
    discountPercentage: number | null;
    totalPrice: number | null;
    deliveryTime: number | null;
    channel: string | null;
    salesRep: string | null;
    leadSource: string | null;
    outcome: string;
    outcomeDate: string | null;
    responseTime: number | null;
    createdAt: string;
    updatedAt: string;
  }>;
  reports: Array<{
    id: string;
    modelId: string;
    title: string;
    content: Record<string, unknown>;
    insights: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
  }>;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user info
    const userRecord = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (userRecord.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userInfo = userRecord[0];

    // Get user's datasets
    const datasets = await db
      .select({
        id: dataset.id,
        name: dataset.name,
        description: dataset.description,
        fileName: dataset.fileName,
        fileSize: dataset.fileSize,
        rowCount: dataset.rowCount,
        status: dataset.status,
        createdAt: dataset.createdAt,
        updatedAt: dataset.updatedAt,
      })
      .from(dataset)
      .where(eq(dataset.userId, userId));

    // Get user's models
    const models = await db
      .select({
        id: model.id,
        name: model.name,
        description: model.description,
        algorithm: model.algorithm,
        status: model.status,
        accuracy: model.accuracy,
        precision: model.precision,
        recall: model.recall,
        f1Score: model.f1Score,
        aucRoc: model.aucRoc,
        trainingTime: model.trainingTime,
        createdAt: model.createdAt,
        updatedAt: model.updatedAt,
      })
      .from(model)
      .where(eq(model.userId, userId));

    // Get model IDs for fetching related data
    const modelIds = models.map(m => m.id);

    // Get predictions for user's models
    let predictions: Array<{
      id: string;
      modelId: string;
      winProbability: number;
      confidence: number;
      customerSector: string | null;
      customerSize: string | null;
      discountPercentage: number | null;
      totalPrice: number | null;
      deliveryTime: number | null;
      channel: string | null;
      salesRep: string | null;
      leadSource: string | null;
      createdAt: string;
    }> = [];

    if (modelIds.length > 0) {
      const rawPredictions = await db
        .select({
          id: prediction.id,
          modelId: prediction.modelId,
          winProbability: prediction.winProbability,
          confidence: prediction.confidence,
          customerSector: prediction.customerSector,
          customerSize: prediction.customerSize,
          discountPercentage: prediction.discountPercentage,
          totalPrice: prediction.totalPrice,
          deliveryTime: prediction.deliveryTime,
          channel: prediction.channel,
          salesRep: prediction.salesRep,
          leadSource: prediction.leadSource,
          createdAt: prediction.createdAt,
        })
        .from(prediction)
        .where(
          and(
            inArray(prediction.modelId, modelIds),
            isNotNull(prediction.winProbability)
          )
        )
        .limit(1000); // Limit to prevent oversized exports

      predictions = rawPredictions.map(p => ({
        ...p,
        winProbability: Number(p.winProbability),
        confidence: Number(p.confidence),
        discountPercentage: p.discountPercentage ? Number(p.discountPercentage) : null,
        totalPrice: p.totalPrice ? Number(p.totalPrice) : null,
        createdAt: p.createdAt.toISOString(),
      }));
    }

    // Get dataset IDs for fetching quotes
    const datasetIds = datasets.map(d => d.id);

    // Get quotes for user's datasets
    let quotes: Array<{
      id: string;
      datasetId: string;
      customerSector: string | null;
      customerSize: string | null;
      discountPercentage: number | null;
      totalPrice: number | null;
      deliveryTime: number | null;
      channel: string | null;
      salesRep: string | null;
      leadSource: string | null;
      outcome: string;
      outcomeDate: string | null;
      responseTime: number | null;
      createdAt: string;
      updatedAt: string;
    }> = [];

    if (datasetIds.length > 0) {
      const rawQuotes = await db
        .select({
          id: quote.id,
          datasetId: quote.datasetId,
          customerSector: quote.customerSector,
          customerSize: quote.customerSize,
          discountPercentage: quote.discountPercentage,
          totalPrice: quote.totalPrice,
          deliveryTime: quote.deliveryTime,
          channel: quote.channel,
          salesRep: quote.salesRep,
          leadSource: quote.leadSource,
          outcome: quote.outcome,
          outcomeDate: quote.outcomeDate,
          responseTime: quote.responseTime,
          createdAt: quote.createdAt,
          updatedAt: quote.updatedAt,
        })
        .from(quote)
        .where(inArray(quote.datasetId, datasetIds))
        .limit(2000); // Limit to prevent oversized exports

      quotes = rawQuotes.map(q => ({
        ...q,
        discountPercentage: q.discountPercentage ? Number(q.discountPercentage) : null,
        totalPrice: q.totalPrice ? Number(q.totalPrice) : null,
        responseTime: q.responseTime ? Number(q.responseTime) : null,
        outcomeDate: q.outcomeDate ? q.outcomeDate.toISOString() : null,
        createdAt: q.createdAt.toISOString(),
        updatedAt: q.updatedAt.toISOString(),
      }));
    }

    // Get reports for user's models
    let reports: Array<{
      id: string;
      modelId: string;
      title: string;
      content: Record<string, unknown>;
      insights: Record<string, unknown>;
      createdAt: string;
      updatedAt: string;
    }> = [];

    if (modelIds.length > 0) {
      const rawReports = await db
        .select({
          id: report.id,
          modelId: report.modelId,
          title: report.title,
          content: report.content,
          insights: report.insights,
          createdAt: report.createdAt,
          updatedAt: report.updatedAt,
        })
        .from(report)
        .where(inArray(report.modelId, modelIds));

      reports = rawReports.map(r => ({
        ...r,
        content: r.content as Record<string, unknown>,
        insights: r.insights as Record<string, unknown>,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      }));
    }

    // Prepare export data
    const exportData: ExportData = {
      userInfo: {
        id: userInfo.id,
        name: userInfo.name,
        email: userInfo.email,
        role: userInfo.role,
        createdAt: userInfo.createdAt.toISOString(),
        exportedAt: new Date().toISOString(),
      },
      datasets: datasets.map(ds => ({
        ...ds,
        createdAt: ds.createdAt.toISOString(),
        updatedAt: ds.updatedAt.toISOString(),
      })),
      models: models.map(m => ({
        ...m,
        accuracy: m.accuracy ? Number(m.accuracy) : null,
        precision: m.precision ? Number(m.precision) : null,
        recall: m.recall ? Number(m.recall) : null,
        f1Score: m.f1Score ? Number(m.f1Score) : null,
        aucRoc: m.aucRoc ? Number(m.aucRoc) : null,
        createdAt: m.createdAt.toISOString(),
        updatedAt: m.updatedAt.toISOString(),
      })),
      predictions: predictions,
      quotes: quotes,
      reports: reports,
    };

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const safeEmail = userInfo.email.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${safeEmail}_valutai_export_${timestamp}.json`;

    // Return JSON content with download headers
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error) {
    console.error('Error exporting user data:', error);
    return NextResponse.json({ 
      error: 'Failed to export data. Please try again.' 
    }, { status: 500 });
  }
}