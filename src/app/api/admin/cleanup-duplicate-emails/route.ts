import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { deletedUserEmails } from '@/lib/schema';
import { eq, sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    console.log(`[${new Date().toISOString()}] 🔧 Cleaning up duplicate deleted emails`);

    // Get all duplicate emails
    const duplicateEmails = await db
      .select({ email: deletedUserEmails.email })
      .from(deletedUserEmails)
      .groupBy(deletedUserEmails.email)
      .having(sql`count(*) > 1`);

    console.log(`[${new Date().toISOString()}] Found ${duplicateEmails.length} duplicate email groups`);

    let totalCleaned = 0;

    // For each duplicate email, keep only the most recent record
    for (const { email } of duplicateEmails) {
      // Get all records for this email, ordered by creation date (newest first)
      const allRecords = await db
        .select({ 
          id: deletedUserEmails.id, 
          deletedAt: deletedUserEmails.deletedAt 
        })
        .from(deletedUserEmails)
        .where(eq(deletedUserEmails.email, email))
        .orderBy(deletedUserEmails.deletedAt);

      if (allRecords.length > 1) {
        // Keep the newest record, delete the rest
        const keepId = allRecords[0].id;
        const deleteIds = allRecords.slice(1).map(r => r.id);

        console.log(`[${new Date().toISOString()}] Cleaning email ${email}: keeping ${keepId}, deleting ${deleteIds.length} duplicates`);

        // Delete duplicate records
        for (const deleteId of deleteIds) {
          await db
            .delete(deletedUserEmails)
            .where(eq(deletedUserEmails.id, deleteId));
        }

        totalCleaned += deleteIds.length;
      }
    }

    console.log(`[${new Date().toISOString()}] ✅ Cleaned up ${totalCleaned} duplicate email records`);

    return NextResponse.json({ 
      success: true,
      message: `Cleaned up ${totalCleaned} duplicate email records`,
      duplicateGroupsFound: duplicateEmails.length,
      totalRecordsCleaned: totalCleaned
    });

  } catch (error) {
    console.error('Error cleaning up duplicate emails:', error);
    return NextResponse.json({ 
      error: 'Failed to clean up duplicate emails' 
    }, { status: 500 });
  }
}