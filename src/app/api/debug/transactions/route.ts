import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { user, creditTransaction } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    console.log(`[${new Date().toISOString()}] 📊 Debug transaction history endpoint called`);

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

    // Get ALL transaction history for this user (no limit for debugging)
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
      .orderBy(desc(creditTransaction.createdAt));

    // Also get total count
    const transactionCount = await db
      .select({ count: creditTransaction.id })
      .from(creditTransaction)
      .where(eq(creditTransaction.userId, userId));

    console.log(`[${new Date().toISOString()}] 📊 Transaction debug results:`);
    console.log(`  - User: ${userEmail}`);
    console.log(`  - Current credits: ${currentUser[0]?.credits || 0}`);
    console.log(`  - Transaction count: ${transactionCount.length}`);
    console.log(`  - Transactions found: ${transactions.length}`);
    console.log(`  - First transaction: ${transactions.length > 0 ? JSON.stringify(transactions[0]) : 'None'}`);
    console.log(`  - Last transaction: ${transactions.length > 0 ? JSON.stringify(transactions[transactions.length - 1]) : 'None'}`);

    // If no transactions, create a test one to verify the system works
    if (transactions.length === 0) {
      console.log(`[${new Date().toISOString()}] 📊 No transactions found, creating test transaction...`);
      
      const testTransactionId = crypto.randomUUID();
      const currentCredits = currentUser[0]?.credits || 0;
      
      await db.insert(creditTransaction).values({
        id: testTransactionId,
        userId: userId,
        type: 'bonus',
        amount: 5,
        balance: currentCredits + 5,
        description: 'Transazione di test per debug',
        operationType: 'debug_test',
        createdAt: new Date(),
      });

      // Update user credits
      await db
        .update(user)
        .set({ 
          credits: currentCredits + 5,
          updatedAt: new Date()
        })
        .where(eq(user.id, userId));

      console.log(`[${new Date().toISOString()}] 📊 Test transaction created: ${testTransactionId}`);
    }

    return NextResponse.json({
      debug: {
        userId,
        userEmail,
        currentCredits: currentUser[0]?.credits || 0,
        transactionCount: transactionCount.length,
        transactions: transactions,
        testTransactionCreated: transactions.length === 0,
        message: transactions.length === 0 ? 'Created test transaction for debugging' : 'Transactions found'
      }
    });

  } catch (error) {
    console.error('Error debugging transaction history:', error);
    return NextResponse.json({ 
      error: 'Failed to debug transaction history' 
    }, { status: 500 });
  }
}