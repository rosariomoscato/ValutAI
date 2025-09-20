import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "./db"
import { user, session, account, verification, deletedUserEmails } from "./schema"
import { CreditsService } from "./credits"
import { FreeCreditsService } from "./free-credits"
import { eq } from "drizzle-orm"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user,
      session,
      account,
      verification,
    },
  }),
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  logger: {
    level: "debug" as const,
  },
  secret: process.env.BETTER_AUTH_SECRET,
  socialProviders: process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  } : undefined,
  // Automatically grant welcome credits after registration
  onUserCreate: async (event: { user: { id: string; email?: string | null } }) => {
    try {
      console.log(`[${new Date().toISOString()}] 🔥 BETTER AUTH HOOK TRIGGERED - User created: ${event.user.id} (${event.user.email})`);
      console.log(`[${new Date().toISOString()}] 🔥 Hook event data:`, JSON.stringify(event, null, 2));
      
      // Grant welcome credits after user creation
      if (event.user.email) {
        console.log(`[${new Date().toISOString()}] 🔥 Attempting to grant welcome credits to: ${event.user.email}`);
        const { FreeCreditsService } = await import('./free-credits');
        const result = await FreeCreditsService.grantWelcomeCredits(event.user.id, event.user.email);
        
        if (result) {
          console.log(`[${new Date().toISOString()}] ✅ Welcome credits granted to new user: ${event.user.email}`);
        } else {
          console.log(`[${new Date().toISOString()}} ❌ Welcome credits not granted to user: ${event.user.email} (already received before)`);
          // If user has received credits before, ensure they start with 0 credits instead of database default
          const { db } = await import('./db');
          const { user } = await import('./schema');
          const { eq } = await import('drizzle-orm');
          
          await db
            .update(user)
            .set({ credits: 0 })
            .where(eq(user.id, event.user.id));
            
          console.log(`[${new Date().toISOString()}] ⚠️ Set user ${event.user.email} credits to 0 (previously received credits)`);
        }
      } else {
        console.log(`[${new Date().toISOString()}] ❌ No email provided for user: ${event.user.id}`);
      }
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error granting welcome credits to new user:`, error);
    }
  },
})