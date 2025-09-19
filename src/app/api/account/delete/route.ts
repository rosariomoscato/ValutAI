import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { 
  user, 
  session, 
  account, 
  verification,
  dataset, 
  model, 
  prediction, 
  quote, 
  report 
} from '@/lib/schema';
import { eq, inArray } from 'drizzle-orm';

export async function DELETE(request: NextRequest) {
  try {
    const session_data = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session_data?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session_data.user.id;

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

    // 6. Delete user sessions
    await db
      .delete(session)
      .where(eq(session.userId, userId));

    // 7. Delete user accounts (OAuth connections)
    await db
      .delete(account)
      .where(eq(account.userId, userId));

    // 8. Delete user verifications
    await db
      .delete(verification)
      .where(eq(verification.identifier, session_data.user.email));

    // 9. Finally delete the user
    await db
      .delete(user)
      .where(eq(user.id, userId));

    return NextResponse.json({ 
      message: 'Account and all associated data deleted successfully.' 
    });

  } catch (error) {
    console.error('Error deleting user account:', error);
    return NextResponse.json({ 
      error: 'Failed to delete account. Please try again.' 
    }, { status: 500 });
  }
}