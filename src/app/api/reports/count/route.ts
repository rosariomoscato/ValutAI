import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { report, model } from '@/lib/schema';
import { eq, and, count } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get report count for user's models
    const reportsResult = await db
      .select({ count: count() })
      .from(report)
      .innerJoin(model, eq(report.modelId, model.id))
      .where(eq(model.userId, session.user.id));

    const reportCount = reportsResult[0]?.count || 0;

    return NextResponse.json({ 
      count: reportCount
    });

  } catch (error) {
    console.error('Error fetching reports count:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch reports count. Please try again.' 
    }, { status: 500 });
  }
}