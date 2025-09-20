import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { CreditsService } from '@/lib/credits';

export async function GET(request: NextRequest) {
  try {
    const packages = await CreditsService.getCreditPackages();
    return NextResponse.json({ packages });
  } catch (error) {
    console.error('Error fetching credit packages:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch credit packages' 
    }, { status: 500 });
  }
}