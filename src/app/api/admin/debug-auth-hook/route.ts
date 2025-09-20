import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { user, deletedUserEmails } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    console.log(`[${new Date().toISOString()}] Debug endpoint called - checking auth hook status`);

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

    // Check user's current state
    const currentUser = await db
      .select({ 
        credits: user.credits, 
        hasReceivedFreeCredits: user.hasReceivedFreeCredits,
        previousEmailsForFreeCredits: user.previousEmailsForFreeCredits
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    // Check if email exists in deleted emails table
    const deletedEmailRecord = await db
      .select({ email: deletedUserEmails.email, hasReceivedFreeCredits: deletedUserEmails.hasReceivedFreeCredits })
      .from(deletedUserEmails)
      .where(eq(deletedUserEmails.email, userEmail))
      .limit(1);

    const hasReceivedCreditsBefore = deletedEmailRecord.length > 0;

    // Manually trigger welcome credits check (simulating what the auth hook should do)
    console.log(`[${new Date().toISOString()}] Manually checking welcome credits for user ${userEmail}`);
    console.log(`[${new Date().toISOString()}] Current user state:`, currentUser[0]);
    console.log(`[${new Date().toISOString()}] Email found in deleted table:`, hasReceivedCreditsBefore);

    let result = false;
    if (currentUser.length > 0) {
      const { FreeCreditsService } = await import('@/lib/free-credits');
      result = await FreeCreditsService.grantWelcomeCredits(userId, userEmail);
      console.log(`[${new Date().toISOString()}] Manual credit grant result:`, result);
    }

    return NextResponse.json({
      debug: {
        userId,
        userEmail,
        currentUserState: currentUser[0] || null,
        hasReceivedCreditsBefore,
        manualCreditGrantResult: result,
        message: hasReceivedCreditsBefore 
          ? 'User should have 0 credits (email found in deleted table)'
          : 'User should have 50 credits (new user)'
      }
    });

  } catch (error) {
    console.error('Error in debug auth hook:', error);
    return NextResponse.json({ 
      error: 'Failed to debug auth hook' 
    }, { status: 500 });
  }
}