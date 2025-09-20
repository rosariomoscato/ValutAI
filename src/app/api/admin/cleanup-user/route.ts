import { NextRequest, NextResponse } from 'next/server';
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
  report,
  deletedUserEmails,
  creditTransaction 
} from '@/lib/schema';
import { eq, inArray } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    console.log(`[${new Date().toISOString()}] 🧹 Cleaning up user ros.moscato@gmail.com completely from system`);

    const targetEmail = 'ros.moscato@gmail.com';

    // 1. Find the user
    const userRecord = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, targetEmail))
      .limit(1);

    if (userRecord.length === 0) {
      console.log(`[${new Date().toISOString()}] ✅ User ${targetEmail} not found, system is already clean`);
      return NextResponse.json({ 
        success: true, 
        message: 'User not found, system is already clean' 
      });
    }

    const userId = userRecord[0].id;
    console.log(`[${new Date().toISOString()}] 🧹 Found user ${targetEmail} with ID: ${userId}`);

    // 2. Get all user's datasets to find related data
    const userDatasets = await db
      .select({ id: dataset.id })
      .from(dataset)
      .where(eq(dataset.userId, userId));

    const datasetIds = userDatasets.map(d => d.id);

    // 3. Get all user's models to find related data
    const userModels = await db
      .select({ id: model.id })
      .from(model)
      .where(eq(model.userId, userId));

    const modelIds = userModels.map(m => m.id);

    // 4. Delete all user data in correct order to respect foreign key constraints
    console.log(`[${new Date().toISOString()}] 🧹 Deleting user data...`);

    // Delete reports (depend on models)
    if (modelIds.length > 0) {
      const deletedReports = await db
        .delete(report)
        .where(inArray(report.modelId, modelIds));
      console.log(`[${new Date().toISOString()}] 🧹 Deleted ${deletedReports.count} reports`);
    }

    // Delete predictions (depend on models)
    if (modelIds.length > 0) {
      const deletedPredictions = await db
        .delete(prediction)
        .where(inArray(prediction.modelId, modelIds));
      console.log(`[${new Date().toISOString()}] 🧹 Deleted ${deletedPredictions.count} predictions`);
    }

    // Delete models (depend on datasets)
    const deletedModels = await db
      .delete(model)
      .where(eq(model.userId, userId));
    console.log(`[${new Date().toISOString()}] 🧹 Deleted ${deletedModels.count} models`);

    // Delete quotes (depend on datasets)
    if (datasetIds.length > 0) {
      const deletedQuotes = await db
        .delete(quote)
        .where(inArray(quote.datasetId, datasetIds));
      console.log(`[${new Date().toISOString()}] 🧹 Deleted ${deletedQuotes.count} quotes`);
    }

    // Delete datasets
    const deletedDatasets = await db
      .delete(dataset)
      .where(eq(dataset.userId, userId));
    console.log(`[${new Date().toISOString()}] 🧹 Deleted ${deletedDatasets.count} datasets`);

    // Delete credit transactions
    const deletedTransactions = await db
      .delete(creditTransaction)
      .where(eq(creditTransaction.userId, userId));
    console.log(`[${new Date().toISOString()}] 🧹 Deleted ${deletedTransactions.count} credit transactions`);

    // Delete user sessions
    const deletedSessions = await db
      .delete(session)
      .where(eq(session.userId, userId));
    console.log(`[${new Date().toISOString()}] 🧹 Deleted ${deletedSessions.count} sessions`);

    // Delete user accounts (OAuth connections)
    const deletedAccounts = await db
      .delete(account)
      .where(eq(account.userId, userId));
    console.log(`[${new Date().toISOString()}] 🧹 Deleted ${deletedAccounts.count} accounts`);

    // Delete user verifications
    const deletedVerifications = await db
      .delete(verification)
      .where(eq(verification.identifier, targetEmail));
    console.log(`[${new Date().toISOString()}] 🧹 Deleted ${deletedVerifications.count} verifications`);

    // Delete user
    const deletedUser = await db
      .delete(user)
      .where(eq(user.id, userId));
    console.log(`[${new Date().toISOString()}] 🧹 Deleted ${deletedUser.count} user record`);

    // 5. Remove from deleted emails table if present
    const deletedEmailRecord = await db
      .delete(deletedUserEmails)
      .where(eq(deletedUserEmails.email, targetEmail));
    console.log(`[${new Date().toISOString()}] 🧹 Removed from deleted emails: ${deletedEmailRecord.count} records`);

    console.log(`[${new Date().toISOString()}] ✅ Successfully cleaned up user ${targetEmail} from system`);

    return NextResponse.json({ 
      success: true,
      message: 'User completely removed from system',
      details: {
        userEmail: targetEmail,
        userId: userId,
        deletedReports: modelIds.length > 0 ? 'all user reports' : 'none',
        deletedPredictions: modelIds.length > 0 ? 'all user predictions' : 'none',
        deletedModels: deletedModels.count,
        deletedDatasets: deletedDatasets.count,
        deletedQuotes: datasetIds.length > 0 ? 'all user quotes' : 'none',
        deletedTransactions: deletedTransactions.count,
        deletedSessions: deletedSessions.count,
        deletedAccounts: deletedAccounts.count,
        deletedVerifications: deletedVerifications.count,
        deletedEmailRecord: deletedEmailRecord.count
      }
    });

  } catch (error) {
    console.error('Error cleaning up user:', error);
    return NextResponse.json({ 
      error: 'Failed to clean up user' 
    }, { status: 500 });
  }
}