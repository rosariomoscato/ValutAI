import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { user, creditTransaction } from '@/lib/schema';
import { eq, or, isNull } from 'drizzle-orm';
import { CreditsService } from '@/lib/credits';

// This endpoint fixes users who have less than 50 credits
// It ensures all users have the correct starting amount
export async function POST(request: NextRequest) {
  try {
    console.log(`[${new Date().toISOString()}] Starting fix for new users...`);

    // Find users who have less than 50 credits OR haven't received free credits
    const usersToFix = await db
      .select({
        id: user.id,
        email: user.email,
        currentCredits: user.credits,
        hasReceivedFreeCredits: user.hasReceivedFreeCredits,
        name: user.name
      })
      .from(user)
      .where(
        or(
          eq(user.credits, 20), // Users with old default of 20
          eq(user.hasReceivedFreeCredits, false) // Users marked as not receiving free credits
        )
      );

    console.log(`[${new Date().toISOString()}] Found ${usersToFix.length} users to fix`);

    const corrections = [];
    let totalCreditsAdded = 0;

    for (const userToFix of usersToFix) {
      const creditsNeeded = 50 - userToFix.currentCredits;
      
      if (creditsNeeded > 0) {
        console.log(`[${new Date().toISOString()}] Fixing user ${userToFix.email}:`);
        console.log(`  - Current credits: ${userToFix.currentCredits}`);
        console.log(`  - Credits needed: ${creditsNeeded}`);

        // Update user credits and mark as having received free credits
        await db
          .update(user)
          .set({ 
            credits: 50,
            hasReceivedFreeCredits: true,
            updatedAt: new Date()
          })
          .where(eq(user.id, userToFix.id));

        // Create a transaction record for the credit adjustment
        await db.insert(creditTransaction).values({
          id: crypto.randomUUID(),
          userId: userToFix.id,
          type: 'bonus',
          amount: creditsNeeded,
          balance: 50,
          description: `${creditsNeeded} crediti di benvenuto aggiustati`,
          operationType: 'welcome_bonus_adjustment',
          createdAt: new Date(),
        });

        corrections.push({
          userId: userToFix.id,
          email: userToFix.email,
          name: userToFix.name,
          oldCredits: userToFix.currentCredits,
          creditsAdded: creditsNeeded,
          newCredits: 50,
          action: 'granted_welcome_bonus_adjustment'
        });

        totalCreditsAdded += creditsNeeded;

        console.log(`[${new Date().toISOString()}] Fixed user ${userToFix.email}: ${userToFix.currentCredits} → 50 credits`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Users fixed successfully',
      usersFixed: usersToFix.length,
      totalCreditsAdded,
      corrections
    });

  } catch (error) {
    console.error('Error fixing users:', error);
    return NextResponse.json({ 
      error: 'Failed to fix users' 
    }, { status: 500 });
  }
}