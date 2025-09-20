import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { FreeCreditsService } from '@/lib/free-credits';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const userEmail = session.user.email;

    // Use the FreeCreditsService to grant welcome credits
    const result = await FreeCreditsService.grantWelcomeCredits(userId, userEmail);

    if (result) {
      return NextResponse.json({ 
        message: '50 free credits granted successfully',
        creditsGranted: true,
        creditsAdded: 50 
      });
    } else {
      return NextResponse.json({ 
        message: 'User already has 50 credits or has received them before',
        creditsGranted: false 
      });
    }

  } catch (error) {
    console.error('Error granting free credits:', error);
    return NextResponse.json({ 
      error: 'Failed to grant free credits. Please try again.' 
    }, { status: 500 });
  }
}