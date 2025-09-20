import { db } from '@/lib/db';
import { user, creditTransaction, deletedUserEmails } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export class FreeCreditsService {
  /**
   * Grants welcome credits to a new user after registration
   * Checks if email has already received free credits in the past
   */
  static async grantWelcomeCredits(userId: string, userEmail: string) {
    try {
      console.log(`[${new Date().toISOString()}] Checking welcome credits for user ${userId} (${userEmail})`);

      // Check if this email has already received free credits in the past
      const deletedEmailRecord = await db
        .select({ email: deletedUserEmails.email, hasReceivedFreeCredits: deletedUserEmails.hasReceivedFreeCredits })
        .from(deletedUserEmails)
        .where(eq(deletedUserEmails.email, userEmail))
        .limit(1);

      const hasReceivedCreditsBefore = deletedEmailRecord.length > 0;
      
      if (hasReceivedCreditsBefore) {
        console.log(`[${new Date().toISOString()}] User ${userEmail} has received credits before, skipping welcome bonus`);
        return false;
      }

      // Check if user already has 100 credits
      const currentUser = await db
        .select({ credits: user.credits, hasReceivedFreeCredits: user.hasReceivedFreeCredits })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);

      if (currentUser.length === 0) {
        console.log(`[${new Date().toISOString()}] User ${userId} not found, cannot grant credits`);
        return false;
      }

      const { credits: currentCredits, hasReceivedFreeCredits } = currentUser[0];

      // If user has already received free credits (regardless of current amount), skip
      if (hasReceivedFreeCredits) {
        console.log(`[${new Date().toISOString()}] User ${userEmail} has already received free credits before, skipping welcome bonus`);
        return false;
      }

      try {
        // Always grant exactly 100 welcome credits
        console.log(`[${new Date().toISOString()}] Granting 100 welcome credits to user ${userEmail}`);

      // Update user credits (add 100 to current balance)
      const newCreditTotal = currentCredits + 100;
      await db
        .update(user)
        .set({ 
          credits: newCreditTotal,
          hasReceivedFreeCredits: true,
          updatedAt: new Date()
        })
        .where(eq(user.id, userId));

      // Create transaction record
      await db.insert(creditTransaction).values({
        id: crypto.randomUUID(),
        userId: userId,
        type: 'bonus',
        amount: 100,
        balance: newCreditTotal,
        description: `100 crediti gratuiti di benvenuto`,
        operationType: 'welcome_bonus',
        createdAt: new Date(),
      });

        // Trigger credit update event for real-time UI updates
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('creditsUpdated'));
        }

        console.log(`[${new Date().toISOString()}] Successfully granted 100 welcome credits to user ${userEmail} (total: ${newCreditTotal})`);
        return true;
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Error granting welcome credits to user ${userId}:`, error);
        return false;
      }

      return false;
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error granting welcome credits to user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Ensures a user has at least 100 credits
   * Can be called as a safety check
   */
  static async ensureMinimumCredits(userId: string) {
    try {
      const currentUser = await db
        .select({ credits: user.credits, email: user.email, hasReceivedFreeCredits: user.hasReceivedFreeCredits })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);

      if (currentUser.length === 0) {
        return false;
      }

      const { credits: currentCredits, email, hasReceivedFreeCredits } = currentUser[0];

      if (currentCredits < 100 && !hasReceivedFreeCredits) {
        console.log(`[${new Date().toISOString()}] User ${email} has only ${currentCredits} credits and hasn't received welcome bonus yet`);
        return await this.grantWelcomeCredits(userId, email);
      }

      return true;
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error ensuring minimum credits for user ${userId}:`, error);
      return false;
    }
  }
}