import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { dataset, quote, model, prediction, report } from '@/lib/schema';
import { eq, desc, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const datasets = await db
      .select({
        id: dataset.id,
        name: dataset.name,
        fileName: dataset.fileName,
        fileSize: dataset.fileSize,
        recordCount: dataset.rowCount,
        status: dataset.status,
        createdAt: dataset.createdAt,
        updatedAt: dataset.updatedAt,
      })
      .from(dataset)
      .where(eq(dataset.userId, session.user.id))
      .orderBy(desc(dataset.createdAt));

    return NextResponse.json({ datasets });

  } catch (error) {
    console.error('Error fetching datasets:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch datasets' 
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
    const datasetId = searchParams.get('id');

    if (!datasetId) {
      return NextResponse.json({ error: 'Dataset ID is required' }, { status: 400 });
    }

    // Verify the dataset belongs to the current user
    const existingDataset = await db
      .select()
      .from(dataset)
      .where(and(eq(dataset.id, datasetId), eq(dataset.userId, session.user.id)))
      .limit(1);

    if (existingDataset.length === 0) {
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });
    }

    // Delete related data in correct order to respect foreign key constraints
    // 1. Delete reports
    await db
      .delete(report)
      .where(eq(report.modelId, datasetId));

    // 2. Delete predictions
    await db
      .delete(prediction)
      .where(eq(prediction.modelId, datasetId));

    // 3. Delete models
    await db
      .delete(model)
      .where(eq(model.datasetId, datasetId));

    // 4. Delete quotes
    await db
      .delete(quote)
      .where(eq(quote.datasetId, datasetId));

    // 5. Finally delete the dataset
    await db
      .delete(dataset)
      .where(eq(dataset.id, datasetId));

    return NextResponse.json({ 
      message: 'Dataset and all related data deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting dataset:', error);
    return NextResponse.json({ 
      error: 'Failed to delete dataset' 
    }, { status: 500 });
  }
}