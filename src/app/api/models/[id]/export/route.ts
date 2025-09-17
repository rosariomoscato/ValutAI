import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { model, dataset } from '@/lib/schema';
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

    const modelId = params.id;

    // Get the model with user verification and dataset info
    const modelRecord = await db
      .select({
        id: model.id,
        name: model.name,
        algorithm: model.algorithm,
        status: model.status,
        accuracy: model.accuracy,
        precision: model.precision,
        recall: model.recall,
        f1Score: model.f1Score,
        aucRoc: model.aucRoc,
        brierScore: model.brierScore,
        featureImportance: model.featureImportance,
        hyperparameters: model.hyperparameters,
        createdAt: model.createdAt,
        updatedAt: model.updatedAt,
        datasetName: dataset.name,
        datasetId: dataset.id,
      })
      .from(model)
      .innerJoin(dataset, eq(model.datasetId, dataset.id))
      .where(and(eq(model.id, modelId), eq(model.userId, session.user.id)))
      .limit(1);

    if (modelRecord.length === 0) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    const modelData = modelRecord[0];
    
    // Type guard for model metrics
    const metrics = {
      aucRoc: Number(modelData.aucRoc || 0),
      accuracy: Number(modelData.accuracy || 0),
      precision: Number(modelData.precision || 0),
      recall: Number(modelData.recall || 0),
      f1Score: Number(modelData.f1Score || 0),
      brierScore: Number(modelData.brierScore || 0),
    };

    // Type guard for hyperparameters
    const hyperparameters = modelData.hyperparameters as Record<string, unknown>;

    // Type guard for feature importance
    const featureImportance = modelData.featureImportance as Array<{
      name: string;
      importance: number;
    }>;

    // Generate JSON export content
    const exportData = {
      model: {
        id: modelData.id,
        name: modelData.name,
        algorithm: modelData.algorithm,
        status: modelData.status,
        createdAt: modelData.createdAt,
        updatedAt: modelData.updatedAt,
      },
      dataset: {
        name: modelData.datasetName,
        id: modelData.datasetId,
      },
      metrics: {
        aucRoc: metrics.aucRoc,
        accuracy: metrics.accuracy,
        precision: metrics.precision,
        recall: metrics.recall,
        f1Score: metrics.f1Score,
        brierScore: metrics.brierScore,
      },
      hyperparameters: hyperparameters,
      featureImportance: featureImportance.map(feature => ({
        name: feature.name,
        importance: feature.importance,
      })),
      exportedAt: new Date().toISOString(),
      exportedBy: session.user.email,
    };

    // Return JSON content
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${modelData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_model_export.json"`,
      },
    });

  } catch (error) {
    console.error('Error exporting model:', error);
    return NextResponse.json({ 
      error: 'Failed to export model. Please try again.' 
    }, { status: 500 });
  }
}