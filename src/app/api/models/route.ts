import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { model, dataset } from '@/lib/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const models = await db
      .select({
        id: model.id,
        name: model.name,
        algorithm: model.algorithm,
        status: model.status,
        accuracy: model.accuracy,
        precision: model.precision,
        recall: model.recall,
        aucRoc: model.aucRoc,
        featureImportance: model.featureImportance,
        hyperparameters: model.hyperparameters,
        createdAt: model.createdAt,
        updatedAt: model.updatedAt,
        datasetName: dataset.name,
        datasetId: model.datasetId,
      })
      .from(model)
      .leftJoin(dataset, eq(model.datasetId, dataset.id))
      .where(eq(model.userId, session.user.id))
      .orderBy(desc(model.createdAt));

    return NextResponse.json({ 
      models: models.map(m => ({
        ...m,
        metrics: {
          aucRoc: Number(m.aucRoc || 0),
          accuracy: Number(m.accuracy || 0),
          precision: Number(m.precision || 0),
          recall: Number(m.recall || 0),
          trainingSize: (m.hyperparameters as Record<string, unknown>)?.trainingSize as number || 0,
          validationSize: (m.hyperparameters as Record<string, unknown>)?.validationSize as number || 0,
        },
        featureImportance: m.featureImportance as Record<string, unknown>,
        hyperparameters: m.hyperparameters as Record<string, unknown>,
      }))
    });

  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch models. Please try again.' 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const modelId = searchParams.get('modelId');

    if (!modelId) {
      return NextResponse.json({ error: 'Model ID is required' }, { status: 400 });
    }

    // Verify model exists and belongs to user
    const existingModel = await db
      .select()
      .from(model)
      .where(and(
        eq(model.id, modelId),
        eq(model.userId, session.user.id)
      ))
      .limit(1);

    if (existingModel.length === 0) {
      return NextResponse.json({ error: 'Model not found or access denied' }, { status: 404 });
    }

    // Delete the model
    await db
      .delete(model)
      .where(eq(model.id, modelId));

    return NextResponse.json({ 
      success: true,
      message: 'Modello eliminato con successo'
    });

  } catch (error) {
    console.error('Error deleting model:', error);
    return NextResponse.json({ 
      error: 'Failed to delete model. Please try again.' 
    }, { status: 500 });
  }
}