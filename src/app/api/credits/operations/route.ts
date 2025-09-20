import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { CreditsService } from '@/lib/credits';

export async function GET(request: NextRequest) {
  try {
    const operations = await CreditsService.getOperationCosts();
    return NextResponse.json({ operations });
  } catch (error) {
    console.error('Error fetching operation costs:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch operation costs' 
    }, { status: 500 });
  }
}