import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { user, deletedUserEmails } from '@/lib/schema';
import { CreditsService } from '@/lib/credits';
import { eq, or } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all users and check their credit status
    const allUsers = await db
      .select({
        id: user.id,
        email: user.email,
        credits: user.credits,
        hasReceivedFreeCredits: user.hasReceivedFreeCredits,
        previousEmailsForFreeCredits: user.previousEmailsForFreeCredits,
        createdAt: user.createdAt
      })
      .from(user);

    let fixedCount = 0;
    const issues = [];

    for (const currentUser of allUsers) {
      const userIssues = [];
      
      // Check if user has 0 credits but should have 50 (new user)
      if (currentUser.credits === 0 && !currentUser.hasReceivedFreeCredits) {
        // Check if email is in deleted emails
        const deletedEmail = await db
          .select()
          .from(deletedUserEmails)
          .where(eq(deletedUserEmails.email, currentUser.email))
          .limit(1);

        if (deletedEmail.length === 0) {
          // User should have 50 free credits
          await CreditsService.addCredits(
            currentUser.id,
            50,
            "50 crediti gratuiti di benvenuto (correzione automatica)",
            "bonus",
            "welcome_bonus_correction"
          );

          await db
            .update(user)
            .set({ 
              hasReceivedFreeCredits: true,
              previousEmailsForFreeCredits: [...(Array.isArray(currentUser.previousEmailsForFreeCredits) ? currentUser.previousEmailsForFreeCredits : []), currentUser.email]
            })
            .where(eq(user.id, currentUser.id));

          userIssues.push(`Granted 50 free credits`);
          fixedCount++;
        }
      }

      // Check for other inconsistencies
      if (currentUser.credits === 0 && currentUser.hasReceivedFreeCredits) {
        userIssues.push(`User has received free credits flag but 0 credits`);
      }

      if (userIssues.length > 0) {
        issues.push({
          userId: currentUser.id,
          email: currentUser.email,
          issues: userIssues
        });
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Database audit completed',
      totalUsersChecked: allUsers.length,
      usersFixed: fixedCount,
      issuesFound: issues,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error auditing database:', error);
    return NextResponse.json({ 
      error: 'Failed to audit database' 
    }, { status: 500 });
  }
}