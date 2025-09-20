import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { user, deletedUserEmails } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { FreeCreditsService } from '@/lib/free-credits';

export async function POST(request: NextRequest) {
  try {
    console.log(`[${new Date().toISOString()}] 🧪 Testing user creation flow manually`);

    // Simulate creating a test user to see if the credit logic works
    const testEmail = `test-${Date.now()}@example.com`;
    const testUserId = crypto.randomUUID();

    console.log(`[${new Date().toISOString()}] 🧪 Creating test user: ${testEmail} (${testUserId})`);

    // First check if email exists in deleted emails table
    const deletedEmailRecord = await db
      .select({ email: deletedUserEmails.email })
      .from(deletedUserEmails)
      .where(eq(deletedUserEmails.email, testEmail))
      .limit(1);

    const hasReceivedCreditsBefore = deletedEmailRecord.length > 0;
    console.log(`[${new Date().toISOString()}] 🧪 Email in deleted table: ${hasReceivedCreditsBefore}`);

    // Create test user
    await db.insert(user).values({
      id: testUserId,
      name: 'Test User',
      email: testEmail,
      emailVerified: true,
      role: 'viewer',
      credits: 0, // Start with 0
      hasReceivedFreeCredits: false,
      previousEmailsForFreeCredits: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log(`[${new Date().toISOString()}] 🧪 Test user created with 0 credits`);

    // Now test the credit granting logic
    const creditResult = await FreeCreditsService.grantWelcomeCredits(testUserId, testEmail);
    console.log(`[${new Date().toISOString()}] 🧪 Credit grant result: ${creditResult}`);

    // Check user after credit grant
    const userAfterCredit = await db
      .select({ 
        credits: user.credits, 
        hasReceivedFreeCredits: user.hasReceivedFreeCredits 
      })
      .from(user)
      .where(eq(user.id, testUserId))
      .limit(1);

    console.log(`[${new Date().toISOString()}] 🧪 User after credit grant:`, userAfterCredit[0]);

    // Clean up test user
    await db.delete(user).where(eq(user.id, testUserId));
    console.log(`[${new Date().toISOString()}] 🧪 Test user cleaned up`);

    return NextResponse.json({
      test: {
        testEmail,
        testUserId,
        hasReceivedCreditsBefore,
        creditGrantResult: creditResult,
        userAfterCredit: userAfterCredit[0],
        testStatus: creditResult ? 'SUCCESS' : 'FAILED'
      }
    });

  } catch (error) {
    console.error('Error in user creation test:', error);
    return NextResponse.json({ 
      error: 'Failed to test user creation' 
    }, { status: 500 });
  }
}