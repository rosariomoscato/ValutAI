import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { user, creditTransaction } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    console.log(`[${new Date().toISOString()}] Debug transaction history endpoint called`);

    // Get current user
    const session_data = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session_data?.user?.id) {
      return NextResponse.json({ 
        error: 'No authenticated user found' 
      }, { status: 401 });
    }

    const userId = session_data.user.id;
    const userEmail = session_data.user.email;

    // Get user's current credit balance
    const currentUser = await db
      .select({ credits: user.credits })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    // Get transaction history for this user
    const transactions = await db
      .select({
        id: creditTransaction.id,
        type: creditTransaction.type,
        amount: creditTransaction.amount,
        balance: creditTransaction.balance,
        description: creditTransaction.description,
        operationType: creditTransaction.operationType,
        createdAt: creditTransaction.createdAt,
      })
      .from(creditTransaction)
      .where(eq(creditTransaction.userId, userId))
      .orderBy(desc(creditTransaction.createdAt))
      .limit(50);

    // Create a test transaction to see if the system works
    const testTransactionId = crypto.randomUUID();
    console.log(`[${new Date().toISOString()}] Creating test transaction ${testTransactionId} for user ${userEmail}`);

    const currentCredits = currentUser[0]?.credits || 0;
    
    await db.insert(creditTransaction).values({
      id: testTransactionId,
      userId: userId,
      type: 'bonus',
      amount: 10,
      balance: currentCredits + 10,
      description: 'Transazione di test per debug',
      operationType: 'debug_test',
      createdAt: new Date(),
    });

    // Also update user credits
    await db
      .update(user)
      .set({ 
        credits: currentCredits + 10,
        updatedAt: new Date()
      })
      .where(eq(user.id, userId));

    // Get updated transactions list
    const updatedTransactions = await db
      .select({
        id: creditTransaction.id,
        type: creditTransaction.type,
        amount: creditTransaction.amount,
        balance: creditTransaction.balance,
        description: creditTransaction.description,
        operationType: creditTransaction.operationType,
        createdAt: creditTransaction.createdAt,
      })
      .from(creditTransaction)
      .where(eq(creditTransaction.userId, userId))
      .orderBy(desc(creditTransaction.createdAt))
      .limit(50);

    return NextResponse.json({
      debug: {
        userId,
        userEmail,
        currentCredits: currentUser[0]?.credits || 0,
        transactionCount: transactions.length,
        transactions: transactions,
        testTransactionCreated: true,
        testTransactionId: testTransactionId,
        updatedTransactions: updatedTransactions,
        updatedTransactionCount: updatedTransactions.length
      }
    });

  } catch (error) {
    console.error('Error debugging transaction history:', error);
    return NextResponse.json({ 
      error: 'Failed to debug transaction history' 
    }, { status: 500 });
  }
}