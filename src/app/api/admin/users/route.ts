import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { user, creditTransaction, dataset, model, prediction, report } from '@/lib/schema';
import { count, eq, and, gte, desc, sql } from 'drizzle-orm';
import { withAdminAuth } from '@/lib/admin-middleware';

export async function GET(request: NextRequest) {
  try {
    // Check admin authorization
    const authError = await withAdminAuth(request);
    if (authError) {
      return authError;
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    // Build search condition
    const searchCondition = search
      ? sql`(${user.name} ILIKE ${'%' + search + '%'} OR ${user.email} ILIKE ${'%' + search + '%'})`
      : sql`1=1`;

    // Get users with basic info only (essential columns for simplified table)
    const usersQuery = db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        credits: user.credits,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
        lastLogin: user.updatedAt,
      })
      .from(user)
      .where(searchCondition)
      .orderBy(desc(user.createdAt))
      .limit(limit)
      .offset(offset);

    const users = await usersQuery;

    // Get total count for pagination
    const totalQuery = db
      .select({ count: count() })
      .from(user)
      .where(searchCondition);

    const totalResult = await totalQuery;
    const total = totalResult[0].count;

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}