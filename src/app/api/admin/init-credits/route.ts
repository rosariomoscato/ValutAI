import { NextRequest, NextResponse } from 'next/server';
import { CreditsService } from '@/lib/credits';

export async function POST(request: NextRequest) {
  try {
    // Initialize default operations
    await CreditsService.initializeDefaultOperations();
    
    // Initialize default packages
    await CreditsService.initializeDefaultPackages();
    
    return NextResponse.json({ 
      success: true,
      message: 'Credits system initialized successfully' 
    });
  } catch (error) {
    console.error('Error initializing credits system:', error);
    return NextResponse.json({ 
      error: 'Failed to initialize credits system' 
    }, { status: 500 });
  }
}