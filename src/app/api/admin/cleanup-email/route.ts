import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { deletedUserEmails } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Remove email from deletedUserEmails table
    const deletedResult = await db
      .delete(deletedUserEmails)
      .where(eq(deletedUserEmails.email, email))
      .returning();

    // Verify the email is no longer in the system
    const checkDeleted = await db
      .select()
      .from(deletedUserEmails)
      .where(eq(deletedUserEmails.email, email));

    return NextResponse.json({ 
      success: true,
      message: `Email ${email} rimossa dal sistema`,
      recordsDeleted: deletedResult.length,
      emailStillInSystem: checkDeleted.length > 0
    });

  } catch (error) {
    console.error('Error cleaning up user email:', error);
    return NextResponse.json({ 
      error: 'Failed to cleanup user email' 
    }, { status: 500 });
  }
}