import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { CreditsService } from '@/lib/credits';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const credits = await CreditsService.getUserCredits(session.user.id);
    const transactions = await CreditsService.getTransactionHistory(session.user.id, 20);

    return NextResponse.json({ 
      credits,
      transactions,
    });

  } catch (error) {
    console.error('Error fetching credits:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch credits' 
    }, { status: 500 });
  }
}