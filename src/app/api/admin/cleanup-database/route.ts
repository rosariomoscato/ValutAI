import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { user, dataset, model, creditTransaction, deletedUserEmails } from '@/lib/schema';
import { sql } from 'drizzle-orm';
import { eq } from 'drizzle-orm';

// This endpoint is for admin/database cleanup purposes
// In production, this should be protected with proper authentication
export async function POST(request: NextRequest) {
  try {
    console.log(`[${new Date().toISOString()}] Starting database cleanup...`);

    // Delete all credit transactions
    const deletedTransactions = await db.delete(creditTransaction).returning({ id: creditTransaction.id });
    console.log(`[${new Date().toISOString()}] Deleted ${deletedTransactions.length} credit transactions`);

    // Delete all models
    const deletedModels = await db.delete(model).returning({ id: model.id });
    console.log(`[${new Date().toISOString()}] Deleted ${deletedModels.length} models`);

    // Delete all datasets
    const deletedDatasets = await db.delete(dataset).returning({ id: dataset.id });
    console.log(`[${new Date().toISOString()}] Deleted ${deletedDatasets.length} datasets`);

    // Delete all deleted email records
    const deletedEmails = await db.delete(deletedUserEmails).returning({ id: deletedUserEmails.id });
    console.log(`[${new Date().toISOString()}] Deleted ${deletedEmails.length} deleted email records`);

    // Delete all users (this will cascade delete sessions and accounts due to foreign key constraints)
    const deletedUsers = await db.delete(user).returning({ 
      id: user.id, 
      email: user.email,
      credits: user.credits 
    });
    console.log(`[${new Date().toISOString()}] Deleted ${deletedUsers.length} users`);
    
    // Log the users that were deleted
    deletedUsers.forEach(u => {
      console.log(`  - User ${u.email} (${u.id}) with ${u.credits} credits`);
    });

    // Reset the credit system to ensure new users get 50 credits
    // This is handled by the database default value in the schema

    return NextResponse.json({
      success: true,
      message: 'Database cleaned successfully',
      deletedCounts: {
        users: deletedUsers.length,
        datasets: deletedDatasets.length,
        models: deletedModels.length,
        transactions: deletedTransactions.length,
        deletedEmails: deletedEmails.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Database cleanup error:', error);
    return NextResponse.json({ 
      error: 'Failed to cleanup database' 
    }, { status: 500 });
  }
}