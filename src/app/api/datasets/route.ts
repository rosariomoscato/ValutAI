import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { dataset } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const datasets = await db
      .select({
        id: dataset.id,
        name: dataset.name,
        fileName: dataset.fileName,
        fileSize: dataset.fileSize,
        recordCount: dataset.rowCount,
        status: dataset.status,
        createdAt: dataset.createdAt,
        updatedAt: dataset.updatedAt,
      })
      .from(dataset)
      .where(eq(dataset.userId, session.user.id))
      .orderBy(desc(dataset.createdAt));

    return NextResponse.json({ datasets });

  } catch (error) {
    console.error('Error fetching datasets:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch datasets' 
    }, { status: 500 });
  }
}