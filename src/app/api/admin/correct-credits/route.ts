import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { user } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    console.log(`[${new Date().toISOString()}] Manually correcting user credits...`);

    // Get the current user
    const users = await db.select().from(user);
    
    if (users.length === 0) {
      return NextResponse.json({ 
        error: 'No users found' 
      }, { status: 404 });
    }

    const currentUser = users[0];
    const oldCredits = currentUser.credits;
    
    // Based on the transactions we saw:
    // - Welcome bonus: +50 (initial)
    // - Dataset upload: -10 
    // - Model training: -10
    // - Extra welcome bonus: +10 (this was the error)
    // Net should be: 50 - 10 - 10 = 30 credits
    
    const correctCredits = 30;
    
    console.log(`Correcting user ${currentUser.email} credits from ${oldCredits} to ${correctCredits}`);

    // Update user credits to the correct amount
    await db
      .update(user)
      .set({ 
        credits: correctCredits,
        updatedAt: new Date()
      })
      .where(eq(user.id, currentUser.id));

    return NextResponse.json({ 
      success: true,
      message: 'User credits corrected successfully',
      correction: {
        userId: currentUser.id,
        email: currentUser.email,
        oldCredits: oldCredits,
        newCredits: correctCredits,
        reason: 'Removed duplicate welcome bonus credits'
      }
    });

  } catch (error) {
    console.error('Error correcting user credits:', error);
    return NextResponse.json({ 
      error: 'Failed to correct user credits' 
    }, { status: 500 });
  }
}