import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { prediction, model } from '@/lib/schema';
import { eq, and, count } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get prediction count for user's models
    const predictionsResult = await db
      .select({ count: count() })
      .from(prediction)
      .innerJoin(model, eq(prediction.modelId, model.id))
      .where(eq(model.userId, session.user.id));

    const predictionCount = predictionsResult[0]?.count || 0;

    return NextResponse.json({ 
      count: predictionCount
    });

  } catch (error) {
    console.error('Error fetching predictions count:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch predictions count. Please try again.' 
    }, { status: 500 });
  }
}