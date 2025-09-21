import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { user, creditTransaction, dataset, model, prediction, report, creditPackage } from '@/lib/schema';
import { count, eq, and, desc, sql, gte, isNotNull } from 'drizzle-orm';
import { withAdminAuth } from '@/lib/admin-middleware';

export async function GET(request: NextRequest) {
  try {
    // Check admin authorization
    const authError = await withAdminAuth(request);
    if (authError) {
      return authError;
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Get basic system stats
    const [
      totalUsers,
      activeUsers,
      totalDatasets,
      totalModels,
      totalPredictions,
      totalReports,
      totalCreditsSold,
      totalCreditsUsed
    ] = await Promise.all([
      db.select({ count: count() }).from(user),
      db.select({ count: count() }).from(user).where(gte(user.updatedAt, cutoffDate)),
      db.select({ count: count() }).from(dataset),
      db.select({ count: count() }).from(model),
      db.select({ count: count() }).from(prediction),
      db.select({ count: count() }).from(report),
      db
        .select({ total: sql<number>`SUM(amount)` })
        .from(creditTransaction)
        .where(eq(sql`"type"`, 'purchase')),
      db
        .select({ total: sql<number>`SUM(ABS(amount))` })
        .from(creditTransaction)
        .where(eq(sql`"type"`, 'usage')),
    ]);

    // Get new users by day (last 30 days)
    const newUsersByDay = await db
      .select({
        date: sql<string>`TO_CHAR(${user.createdAt}, 'YYYY-MM-DD')`,
        count: count(),
      })
      .from(user)
      .where(gte(user.createdAt, cutoffDate))
      .groupBy(sql`TO_CHAR(${user.createdAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`TO_CHAR(${user.createdAt}, 'YYYY-MM-DD')`);

    // Get credit usage by operation type
    const creditUsageByOperation = await db
      .select({
        operationType: creditTransaction.operationType,
        count: count(),
        totalCredits: sql<number>`SUM(ABS(amount))`,
      })
      .from(creditTransaction)
      .where(
        and(
          eq(sql`"type"`, 'usage'),
          isNotNull(creditTransaction.operationType),
          gte(creditTransaction.createdAt, cutoffDate)
        )
      )
      .groupBy(creditTransaction.operationType)
      .orderBy(desc(sql`SUM(ABS(amount))`));

    // Get top users by credits spent
    const topUsers = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        creditsSpent: sql<number>`COALESCE((SELECT SUM(ABS(ct.amount)) FROM ${creditTransaction} ct WHERE ct."userId" = ${user.id} AND ct."type" = 'usage'), 0)`,
        operationsCount: sql<number>`COALESCE((SELECT COUNT(*) FROM ${creditTransaction} ct WHERE ct."userId" = ${user.id} AND ct."type" = 'usage'), 0)`,
        lastActive: user.updatedAt,
      })
      .from(user)
      .where(gte(user.updatedAt, cutoffDate))
      .orderBy(desc(sql`COALESCE((SELECT SUM(ABS(ct.amount)) FROM ${creditTransaction} ct WHERE ct."userId" = ${user.id} AND ct."type" = 'usage'), 0)`))
      .limit(10);

    // Get credit packages revenue
    const packageStats = await db
      .select({
        name: creditPackage.name,
        credits: creditPackage.credits,
        price: creditPackage.price,
        purchasesCount: sql<number>`COALESCE((SELECT COUNT(*) FROM ${creditTransaction} ct WHERE ct.description ILIKE '%' || ${creditPackage.name} || '%' AND ct.type = 'purchase'), 0)`,
        revenue: sql<number>`COALESCE((SELECT SUM(ct.amount / ${creditPackage.credits} * ${creditPackage.price}) FROM ${creditTransaction} ct WHERE ct.description ILIKE '%' || ${creditPackage.name} || '%' AND ct.type = 'purchase'), 0)`,
      })
      .from(creditPackage)
      .where(eq(creditPackage.isActive, true))
      .orderBy(desc(creditPackage.price));

    // Get daily stats for charts
    const dailyStats = await db
      .select({
        date: sql<string>`TO_CHAR(${creditTransaction.createdAt}, 'YYYY-MM-DD')`,
        newUsers: sql<number>`COALESCE((SELECT COUNT(*) FROM ${user} u WHERE TO_CHAR(u."createdAt", 'YYYY-MM-DD') = TO_CHAR(${creditTransaction.createdAt}, 'YYYY-MM-DD')), 0)`,
        creditsSold: sql<number>`COALESCE(SUM(CASE WHEN "type" = 'purchase' THEN amount ELSE 0 END), 0)`,
        creditsUsed: sql<number>`COALESCE(SUM(CASE WHEN "type" = 'usage' THEN ABS(amount) ELSE 0 END), 0)`,
        operationsCount: count(),
      })
      .from(creditTransaction)
      .where(gte(creditTransaction.createdAt, cutoffDate))
      .groupBy(sql`TO_CHAR(${creditTransaction.createdAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`TO_CHAR(${creditTransaction.createdAt}, 'YYYY-MM-DD')`);

    // Calculate totals
    const totalCreditsSoldNum = totalCreditsSold[0]?.total || 0;
    const totalCreditsUsedNum = totalCreditsUsed[0]?.total || 0;

    return NextResponse.json({
      overview: {
        totalUsers: totalUsers[0].count,
        activeUsers: activeUsers[0].count,
        totalDatasets: totalDatasets[0].count,
        totalModels: totalModels[0].count,
        totalPredictions: totalPredictions[0].count,
        totalReports: totalReports[0].count,
        totalCreditsSold: totalCreditsSoldNum,
        totalCreditsUsed: totalCreditsUsedNum,
        averageCreditsPerUser: totalUsers[0].count > 0 ? Math.round(totalCreditsUsedNum / totalUsers[0].count) : 0,
      },
      charts: {
        newUsersByDay,
        dailyStats,
      },
      breakdowns: {
        creditUsageByOperation,
        topUsers,
        packageStats,
      },
      period: {
        days,
        startDate: cutoffDate.toISOString(),
        endDate: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching system stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}