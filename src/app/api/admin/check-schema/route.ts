import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { user } from '@/lib/schema';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    console.log(`[${new Date().toISOString()}] 🔍 Checking database schema for user table`);

    // Check the current default value of the credits column
    const result = await db.execute(sql`
      SELECT column_name, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'user' 
      AND column_name = 'credits'
    `);

    console.log(`[${new Date().toISOString()}] Schema check result:`, result);

    // Also check a sample of users to see their current credits
    const sampleUsers = await db
      .select({ id: user.id, email: user.email, credits: user.credits })
      .from(user)
      .limit(5);

    console.log(`[${new Date().toISOString()}] Sample users:`, sampleUsers);

    return NextResponse.json({
      schemaInfo: result,
      sampleUsers,
      message: 'Schema check completed'
    });

  } catch (error) {
    console.error('Error checking schema:', error);
    return NextResponse.json({ 
      error: 'Failed to check schema' 
    }, { status: 500 });
  }
}