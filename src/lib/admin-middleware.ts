import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { user } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function isAdmin(request: NextRequest) {
  // Try to get session from request headers using Better Auth's server-side method
  let session;
  try {
    // Create headers object from request headers
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      headers.append(key, value);
    });
    
    session = await auth.api.getSession({
      headers
    });
  } catch (error) {
    console.error('Session extraction error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // Check if user is admin directly from database
  const result = await db
    .select({ isAdmin: user.isAdmin })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);
  
  if (result.length === 0 || !result[0].isAdmin) {
    return NextResponse.json(
      { error: 'Forbidden - Admin access required' },
      { status: 403 }
    );
  }
  
  return null; // No error, user is admin
}

export async function withAdminAuth(request: NextRequest) {
  const error = await isAdmin(request);
  if (error) {
    return error;
  }
  return null;
}