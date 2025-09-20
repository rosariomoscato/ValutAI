import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { user } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { FreeCreditsService } from '@/lib/free-credits';

export async function POST(request: NextRequest) {
  try {
    console.log(`[${new Date().toISOString()}] 🔧 Fixing user credits via server-side check`);

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

    if (!userEmail) {
      return NextResponse.json({ 
        error: 'User email not found' 
      }, { status: 400 });
    }

    // Get current user state
    const currentUser = await db
      .select({ 
        credits: user.credits, 
        hasReceivedFreeCredits: user.hasReceivedFreeCredits 
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (currentUser.length === 0) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }

    const { credits: currentCredits, hasReceivedFreeCredits } = currentUser[0];

    console.log(`[${new Date().toISOString()}] 🔧 Current user state: ${userEmail} - Credits: ${currentCredits}, HasReceived: ${hasReceivedFreeCredits}`);

    // If user already has 50+ credits and has received free credits, they're good
    if (currentCredits >= 50 && hasReceivedFreeCredits) {
      console.log(`[${new Date().toISOString()}] ✅ User already has proper credits: ${currentCredits}`);
      return NextResponse.json({
        fixed: false,
        message: 'User already has proper credits',
        credits: currentCredits,
        hasReceivedFreeCredits
      });
    }

    // If user has received free credits, they may have less than 50 if they used them
    // This is normal behavior - they used their credits legitimately
    if (hasReceivedFreeCredits) {
      console.log(`[${new Date().toISOString()}] ✅ User has ${currentCredits} credits (received welcome bonus, may have used some), no correction needed`);
      return NextResponse.json({
        fixed: false,
        message: `User has ${currentCredits} credits (received welcome bonus, may have used some)`,
        credits: currentCredits,
        hasReceivedFreeCredits
      });
    }

    // If user hasn't received free credits, try to grant them
    if (!hasReceivedFreeCredits) {
      console.log(`[${new Date().toISOString()}] 🔧 Attempting to grant welcome credits to user`);
      const result = await FreeCreditsService.grantWelcomeCredits(userId, userEmail);
      
      if (result) {
        // Trigger credit update event
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('creditsUpdated'));
        }

        return NextResponse.json({
          fixed: true,
          message: 'Welcome credits granted successfully',
          credits: 50,
          hasReceivedFreeCredits: true
        });
      } else {
        // If credits couldn't be granted (email was found in deleted table), set to 0
        console.log(`[${new Date().toISOString()}] 🔧 Setting user credits to 0 (email found in deleted table)`);
        await db
          .update(user)
          .set({ 
            credits: 0,
            hasReceivedFreeCredits: true, // Mark as processed to prevent future checks
            updatedAt: new Date()
          })
          .where(eq(user.id, userId));

        // Trigger credit update event
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('creditsUpdated'));
        }

        return NextResponse.json({
          fixed: true,
          message: 'User credits set to 0 (previously received credits)',
          credits: 0,
          hasReceivedFreeCredits: true
        });
      }
    }

    return NextResponse.json({
      fixed: false,
      message: 'No action needed',
      credits: currentCredits,
      hasReceivedFreeCredits
    });

  } catch (error) {
    console.error('Error fixing user credits:', error);
    return NextResponse.json({ 
      error: 'Failed to fix user credits' 
    }, { status: 500 });
  }
}