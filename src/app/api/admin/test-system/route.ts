import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { user, creditTransaction, deletedUserEmails } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';
import { CreditsService } from '@/lib/credits';
import { FreeCreditsService } from '@/lib/free-credits';

export async function GET(request: NextRequest) {
  try {
    console.log(`[${new Date().toISOString()}] Starting complete system test...`);
    
    // Test 1: Check if system is properly configured
    console.log('Test 1: Checking system configuration...');
    const isCreditSystemValid = await CreditsService.validateCreditSystem();
    if (!isCreditSystemValid) {
      return NextResponse.json({ 
        error: 'Credit system not properly configured' 
      }, { status: 500 });
    }
    console.log('✓ Credit system is properly configured');
    
    // Test 2: Check existing users
    console.log('Test 2: Checking existing users...');
    const allUsers = await db.select().from(user);
    console.log(`Found ${allUsers.length} users in the system`);
    
    const userDetails = await Promise.all(allUsers.map(async (user) => {
      const transactions = await db.select()
        .from(creditTransaction)
        .where(eq(creditTransaction.userId, user.id))
        .orderBy(desc(creditTransaction.createdAt))
        .limit(5);
      
      return {
        id: user.id,
        email: user.email,
        credits: user.credits,
        hasReceivedFreeCredits: user.hasReceivedFreeCredits,
        previousEmailsForFreeCredits: user.previousEmailsForFreeCredits,
        recentTransactions: transactions.length,
        transactions
      };
    }));
    
    // Test 3: Check deleted emails tracking
    console.log('Test 3: Checking deleted emails tracking...');
    const deletedEmails = await db.select().from(deletedUserEmails);
    console.log(`Found ${deletedEmails.length} deleted emails in tracking system`);
    
    // Test 4: Test operation costs
    console.log('Test 4: Testing operation costs...');
    const operations = await CreditsService.getOperationCosts();
    console.log('Available operations:', operations);
    
    // Test 5: Test welcome credit granting for a test user (if any exist)
    console.log('Test 5: Testing welcome credit system...');
    const testResults = [];
    
    if (allUsers.length > 0) {
      const testUser = allUsers[0];
      console.log(`Testing with user: ${testUser.email}`);
      
      // Test if user would qualify for welcome credits
      const deletedEmailRecord = await db
        .select({ email: deletedUserEmails.email })
        .from(deletedUserEmails)
        .where(eq(deletedUserEmails.email, testUser.email))
        .limit(1);
      
      const hasReceivedCreditsBefore = deletedEmailRecord.length > 0;
      
      testResults.push({
        userId: testUser.id,
        email: testUser.email,
        currentCredits: testUser.credits,
        hasReceivedFreeCredits: testUser.hasReceivedFreeCredits,
        hasReceivedCreditsBefore,
        wouldQualifyForWelcomeCredits: !hasReceivedCreditsBefore && !testUser.hasReceivedFreeCredits
      });
    }
    
    console.log('✓ All tests completed successfully');
    
    return NextResponse.json({
      success: true,
      message: 'System test completed successfully',
      testResults: {
        creditSystemValid: isCreditSystemValid,
        totalUsers: allUsers.length,
        totalDeletedEmails: deletedEmails.length,
        userDetails,
        operations,
        testResults
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error during system test:', error);
    return NextResponse.json({ 
      error: 'Failed to complete system test',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}