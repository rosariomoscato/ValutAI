import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { user } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    console.log(`[${new Date().toISOString()}] Setting user credits to 0 for deleted email re-registration...`);

    // Get the current user
    const users = await db.select().from(user);
    
    if (users.length === 0) {
      return NextResponse.json({ 
        error: 'No users found' 
      }, { status: 404 });
    }

    const currentUser = users[0];
    const oldCredits = currentUser.credits;
    
    // This user has already received credits before (email is in deletedUserEmails)
    // So they should have 0 credits, not the database default
    const correctCredits = 0;
    
    console.log(`Setting user ${currentUser.email} credits from ${oldCredits} to ${correctCredits} (deleted email re-registration)`);

    // Update user credits to 0
    await db
      .update(user)
      .set({ 
        credits: correctCredits,
        updatedAt: new Date()
      })
      .where(eq(user.id, currentUser.id));

    return NextResponse.json({ 
      success: true,
      message: 'User credits set to 0 for deleted email re-registration',
      correction: {
        userId: currentUser.id,
        email: currentUser.email,
        oldCredits: oldCredits,
        newCredits: correctCredits,
        reason: 'User re-registered with deleted email, should have 0 credits'
      }
    });

  } catch (error) {
    console.error('Error setting user credits to 0:', error);
    return NextResponse.json({ 
      error: 'Failed to set user credits to 0' 
    }, { status: 500 });
  }
}