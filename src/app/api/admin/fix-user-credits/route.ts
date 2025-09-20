import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { user, creditTransaction } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    console.log(`[${new Date().toISOString()}] Fixing user credit state...`);

    // Get the current user
    const users = await db.select().from(user);
    
    if (users.length === 0) {
      return NextResponse.json({ 
        error: 'No users found' 
      }, { status: 404 });
    }

    const currentUser = users[0];
    console.log(`Processing user: ${currentUser.email} (current credits: ${currentUser.credits})`);

    // Get all transactions for this user
    const transactions = await db.select()
      .from(creditTransaction)
      .where(eq(creditTransaction.userId, currentUser.id))
      .orderBy(desc(creditTransaction.createdAt));

    console.log(`Found ${transactions.length} transactions`);

    // Count welcome bonus transactions
    const welcomeBonusTransactions = transactions.filter(t => 
      t.operationType === 'welcome_bonus' || t.description.includes('benvenuto')
    );

    console.log(`Found ${welcomeBonusTransactions.length} welcome bonus transactions`);

    if (welcomeBonusTransactions.length > 1) {
      // Remove all welcome bonus transactions except the first one
      const transactionsToDelete = welcomeBonusTransactions.slice(1);
      console.log(`Removing ${transactionsToDelete.length} duplicate welcome bonus transactions`);

      for (const transaction of transactionsToDelete) {
        await db.delete(creditTransaction).where(eq(creditTransaction.id, transaction.id));
        console.log(`Deleted transaction: ${transaction.id} (${transaction.description})`);
      }

      // Calculate correct credit balance
      const validTransactions = transactions.filter(t => 
        !transactionsToDelete.some(toDelete => toDelete.id === t.id)
      );

      const totalCredits = validTransactions.reduce((sum, t) => sum + t.amount, 0);
      console.log(`Calculated correct credit balance: ${totalCredits}`);

      // Update user credits
      await db
        .update(user)
        .set({ 
          credits: totalCredits,
          updatedAt: new Date()
        })
        .where(eq(user.id, currentUser.id));

      console.log(`Updated user credits to: ${totalCredits}`);

      return NextResponse.json({ 
        success: true,
        message: 'User credit state fixed successfully',
        corrections: {
          userId: currentUser.id,
          email: currentUser.email,
          oldCredits: currentUser.credits,
          newCredits: totalCredits,
          transactionsRemoved: transactionsToDelete.length,
          remainingTransactions: validTransactions.length
        }
      });
    } else {
      return NextResponse.json({ 
        success: true,
        message: 'No duplicate transactions found, user state is correct'
      });
    }

  } catch (error) {
    console.error('Error fixing user credit state:', error);
    return NextResponse.json({ 
      error: 'Failed to fix user credit state' 
    }, { status: 500 });
  }
}