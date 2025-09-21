import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { user, creditTransaction, dataset, model, prediction, report } from '@/lib/schema';
import { eq, and, desc, sql, gte, lt, count } from 'drizzle-orm';
import { withAdminAuth } from '@/lib/admin-middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Check admin authorization
    const authError = await withAdminAuth(request);
    if (authError) {
      return authError;
    }

    const { userId } = await params;

    // Get user basic info
    const userInfo = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        credits: user.credits,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        emailVerified: user.emailVerified,
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: user.stripeSubscriptionId,
        hasReceivedFreeCredits: user.hasReceivedFreeCredits,
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (userInfo.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userInfo[0];

    // Get resource counts
    const [datasetsCount, modelsCount, predictionsCount, reportsCount] = await Promise.all([
      db.select({ count: count() }).from(dataset).where(eq(dataset.userId, userId)),
      db.select({ count: count() }).from(model).where(eq(model.userId, userId)),
      db.select({ count: count() })
        .from(prediction)
        .innerJoin(model, eq(prediction.modelId, model.id))
        .where(eq(model.userId, userId)),
      db.select({ count: count() })
        .from(report)
        .innerJoin(model, eq(report.modelId, model.id))
        .where(eq(model.userId, userId)),
    ]);

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivity = await db
      .select({
        id: creditTransaction.id,
        type: creditTransaction.type,
        amount: creditTransaction.amount,
        balance: creditTransaction.balance,
        description: creditTransaction.description,
        operationType: creditTransaction.operationType,
        resourceId: creditTransaction.resourceId,
        createdAt: creditTransaction.createdAt,
      })
      .from(creditTransaction)
      .where(
        and(
          eq(creditTransaction.userId, userId),
          gte(creditTransaction.createdAt, thirtyDaysAgo)
        )
      )
      .orderBy(desc(creditTransaction.createdAt))
      .limit(50);

    // Get credit usage statistics
    const creditStats = await db
      .select({
        totalSpent: sql<number>`SUM(CASE WHEN ${creditTransaction.type} = 'usage' THEN ABS(${creditTransaction.amount}) ELSE 0 END)`,
        totalPurchased: sql<number>`SUM(CASE WHEN ${creditTransaction.type} = 'purchase' THEN ${creditTransaction.amount} ELSE 0 END)`,
        totalBonuses: sql<number>`SUM(CASE WHEN ${creditTransaction.type} = 'bonus' THEN ${creditTransaction.amount} ELSE 0 END)`,
        operationCount: count(),
      })
      .from(creditTransaction)
      .where(eq(creditTransaction.userId, userId));

    // Get operations breakdown
    const operationsBreakdown = await db
      .select({
        operationType: creditTransaction.operationType,
        count: count(),
        totalCredits: sql<number>`SUM(ABS(${creditTransaction.amount}))`,
      })
      .from(creditTransaction)
      .where(
        and(
          eq(creditTransaction.userId, userId),
          eq(creditTransaction.type, 'usage'),
          sql`${creditTransaction.operationType} IS NOT NULL`
        )
      )
      .groupBy(creditTransaction.operationType)
      .orderBy(desc(sql`SUM(ABS(${creditTransaction.amount}))`));

    // Get monthly usage trend (last 6 months)
    const monthlyTrend = await db
      .select({
        month: sql<string>`TO_CHAR(${creditTransaction.createdAt}, 'YYYY-MM')`,
        creditsUsed: sql<number>`SUM(CASE WHEN ${creditTransaction.type} = 'usage' THEN ABS(${creditTransaction.amount}) ELSE 0 END)`,
        operationsCount: count(),
      })
      .from(creditTransaction)
      .where(
        and(
          eq(creditTransaction.userId, userId),
          eq(creditTransaction.type, 'usage'),
          gte(creditTransaction.createdAt, sql`CURRENT_DATE - INTERVAL '6 months'`)
        )
      )
      .groupBy(sql`TO_CHAR(${creditTransaction.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${creditTransaction.createdAt}, 'YYYY-MM')`);

    return NextResponse.json({
      user: userData,
      stats: {
        resources: {
          datasets: datasetsCount[0].count,
          models: modelsCount[0].count,
          predictions: predictionsCount[0].count,
          reports: reportsCount[0].count,
        },
        credits: {
          current: userData.credits,
          totalSpent: creditStats[0].totalSpent || 0,
          totalPurchased: creditStats[0].totalPurchased || 0,
          totalBonuses: creditStats[0].totalBonuses || 0,
        },
        operations: {
          total: creditStats[0].operationCount || 0,
          breakdown: operationsBreakdown,
        },
      },
      recentActivity,
      monthlyTrend,
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}