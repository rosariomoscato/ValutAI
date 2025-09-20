import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { user, deletedUserEmails, creditTransaction } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    console.log(`[${new Date().toISOString()}] 🔍 Checking if ros.moscato@gmail.com is completely cleaned up`);

    const targetEmail = 'ros.moscato@gmail.com';

    // Check if user exists
    const userCheck = await db
      .select({ id: user.id, email: user.email, credits: user.credits })
      .from(user)
      .where(eq(user.email, targetEmail))
      .limit(1);

    // Check if email exists in deleted emails table
    const deletedEmailCheck = await db
      .select({ email: deletedUserEmails.email, hasReceivedFreeCredits: deletedUserEmails.hasReceivedFreeCredits })
      .from(deletedUserEmails)
      .where(eq(deletedUserEmails.email, targetEmail))
      .limit(1);

    // Check for any remaining transactions (would indicate user ID still exists somewhere)
    const transactionCheck = await db
      .select({ count: creditTransaction.id })
      .from(creditTransaction)
      .leftJoin(user, eq(creditTransaction.userId, user.id))
      .where(eq(user.email, targetEmail))
      .limit(1);

    console.log(`[${new Date().toISOString()}] 🔍 Check results:`);
    console.log(`  - User exists: ${userCheck.length > 0}`);
    console.log(`  - In deleted emails: ${deletedEmailCheck.length > 0}`);
    console.log(`  - Remaining transactions: ${transactionCheck.length > 0}`);

    return NextResponse.json({
      systemStatus: {
        userExists: userCheck.length > 0,
        inDeletedEmails: deletedEmailCheck.length > 0,
        hasRemainingTransactions: transactionCheck.length > 0,
        isCompletelyClean: userCheck.length === 0 && deletedEmailCheck.length === 0 && transactionCheck.length === 0
      },
      details: {
        user: userCheck[0] || null,
        deletedEmail: deletedEmailCheck[0] || null,
        remainingTransactions: transactionCheck.length
      },
      message: userCheck.length === 0 && deletedEmailCheck.length === 0 
        ? '✅ System is completely clean - ready for new user registration' 
        : '❌ System still has traces of the user'
    });

  } catch (error) {
    console.error('Error checking system cleanup:', error);
    return NextResponse.json({ 
      error: 'Failed to check system cleanup' 
    }, { status: 500 });
  }
}