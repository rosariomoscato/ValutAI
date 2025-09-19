import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { 
  dataset, 
  model, 
  prediction, 
  quote, 
  report 
} from '@/lib/schema';
import { eq, inArray } from 'drizzle-orm';

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get all user's datasets to find related data
    const userDatasets = await db
      .select({ id: dataset.id })
      .from(dataset)
      .where(eq(dataset.userId, userId));

    const datasetIds = userDatasets.map(d => d.id);

    // Get all user's models to find related data
    const userModels = await db
      .select({ id: model.id })
      .from(model)
      .where(eq(model.userId, userId));

    const modelIds = userModels.map(m => m.id);

    // Delete all user data in correct order to respect foreign key constraints
    
    // 1. Delete reports (depend on models)
    if (modelIds.length > 0) {
      await db
        .delete(report)
        .where(inArray(report.modelId, modelIds));
    }

    // 2. Delete predictions (depend on models)
    if (modelIds.length > 0) {
      await db
        .delete(prediction)
        .where(inArray(prediction.modelId, modelIds));
    }

    // 3. Delete models (depend on datasets)
    await db
      .delete(model)
      .where(eq(model.userId, userId));

    // 4. Delete quotes (depend on datasets)
    if (datasetIds.length > 0) {
      await db
        .delete(quote)
        .where(inArray(quote.datasetId, datasetIds));
    }

    // 5. Delete datasets
    await db
      .delete(dataset)
      .where(eq(dataset.userId, userId));

    return NextResponse.json({ 
      message: 'All user data reset successfully. Account has been preserved.' 
    });

  } catch (error) {
    console.error('Error resetting user data:', error);
    return NextResponse.json({ 
      error: 'Failed to reset data. Please try again.' 
    }, { status: 500 });
  }
}