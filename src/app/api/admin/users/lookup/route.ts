import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { user } from '@/lib/schema';
import { eq, ilike } from 'drizzle-orm';
import { withAdminAuth } from '@/lib/admin-middleware';

export async function GET(request: NextRequest) {
  try {
    // Check admin authorization
    const authError = await withAdminAuth(request);
    if (authError) {
      return authError;
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    // Search for user by email (case-insensitive)
    const users = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        credits: user.credits,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
        emailVerified: user.emailVerified,
      })
      .from(user)
      .where(ilike(user.email, email))
      .limit(10);

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // If we found exactly one match, return it
    if (users.length === 1) {
      return NextResponse.json({
        user: users[0],
        exactMatch: true,
      });
    }

    // If multiple matches found, return all of them
    return NextResponse.json({
      users,
      exactMatch: false,
      count: users.length,
    });

  } catch (error) {
    console.error('Error looking up user by email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}