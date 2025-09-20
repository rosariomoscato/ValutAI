import { db } from './db';
import { user, creditTransaction, creditPackage, creditOperation } from './schema';
import { eq, desc, sql } from 'drizzle-orm';

// Helper function for database transactions
async function executeInTransaction<T>(callback: () => Promise<T>): Promise<T> {
  return await db.transaction(async (tx) => {
    return await callback();
  });
}

export interface CreditTransactionInput {
  userId: string;
  type: 'purchase' | 'usage' | 'refund' | 'bonus';
  amount: number;
  description: string;
  operationType?: string;
  resourceId?: string;
}

export class CreditsService {
  static async getUserCredits(userId: string): Promise<number> {
    const userRecord = await db
      .select({ credits: user.credits })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    const credits = userRecord[0]?.credits || 0;
    console.log(`[${new Date().toISOString()}] getUserCredits for user ${userId}:`);
    console.log(`  - Database record:`, userRecord[0]);
    console.log(`  - Credits returned: ${credits}`);
    
    return credits;
  }

  static async hasEnoughCredits(userId: string, requiredCredits: number): Promise<boolean> {
    const userCredits = await this.getUserCredits(userId);
    return userCredits >= requiredCredits;
  }

  static async deductCredits(userId: string, amount: number, description: string, operationType?: string, resourceId?: string): Promise<boolean> {
    try {
      return await executeInTransaction(async () => {
        // Get current credits within transaction for accurate balance check
        const userRecord = await db
          .select({ credits: user.credits })
          .from(user)
          .where(eq(user.id, userId))
          .for('update') // Lock the row for update
          .limit(1);

        const currentCredits = userRecord[0]?.credits || 0;
        
        if (currentCredits < amount) {
          return false;
        }

        const newBalance = currentCredits - amount;

        // Update user credits
        await db
          .update(user)
          .set({ 
            credits: newBalance,
            updatedAt: new Date()
          })
          .where(eq(user.id, userId));

        // Record transaction
        await db.insert(creditTransaction).values({
          id: sql`gen_random_uuid()`,
          userId,
          type: 'usage',
          amount: -amount,
          balance: newBalance,
          description,
          operationType,
          resourceId,
        });

        return true;
      });
    } catch (error) {
      console.error('Error deducting credits:', error);
      return false;
    }
  }

  static async addCredits(userId: string, amount: number, description: string, type: 'purchase' | 'refund' | 'bonus' = 'purchase', operationType?: string, resourceId?: string): Promise<boolean> {
    try {
      return await executeInTransaction(async () => {
        // Get current credits within transaction for accurate balance
        const userRecord = await db
          .select({ credits: user.credits })
          .from(user)
          .where(eq(user.id, userId))
          .for('update') // Lock the row for update
          .limit(1);

        const currentCredits = userRecord[0]?.credits || 0;
        const newBalance = currentCredits + amount;

        // Update user credits
        await db
          .update(user)
          .set({ 
            credits: newBalance,
            updatedAt: new Date()
          })
          .where(eq(user.id, userId));

        // Record transaction
        await db.insert(creditTransaction).values({
          id: sql`gen_random_uuid()`,
          userId,
          type,
          amount,
          balance: newBalance,
        description,
        operationType,
        resourceId,
      });

        return true;
      });
    } catch (error) {
      console.error('Error adding credits:', error);
      return false;
    }
  }

  static async getTransactionHistory(userId: string, limit: number = 50) {
    return await db
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
      .where(eq(creditTransaction.userId, userId))
      .orderBy(desc(creditTransaction.createdAt))
      .limit(limit);
  }

  static async getCreditPackages() {
    return await db
      .select({
        id: creditPackage.id,
        name: creditPackage.name,
        credits: creditPackage.credits,
        price: creditPackage.price,
        currency: creditPackage.currency,
        stripePriceId: creditPackage.stripePriceId,
        isActive: creditPackage.isActive,
        isPopular: creditPackage.isPopular,
        sortOrder: creditPackage.sortOrder,
      })
      .from(creditPackage)
      .where(eq(creditPackage.isActive, true))
      .orderBy(creditPackage.sortOrder);
  }

  static async getOperationCosts() {
    return await db
      .select({
        id: creditOperation.id,
        name: creditOperation.name,
        description: creditOperation.description,
        creditCost: creditOperation.creditCost,
        isActive: creditOperation.isActive,
      })
      .from(creditOperation)
      .where(eq(creditOperation.isActive, true));
  }

  static async getOperationCost(operationType: string): Promise<number> {
    const operations = await this.getOperationCosts();
    const operation = operations.find(op => op.id === operationType);
    
    if (!operation) {
      throw new Error(`Operation type '${operationType}' not found in credit system`);
    }
    
    return operation.creditCost;
  }

  static async validateCreditSystem(): Promise<boolean> {
    try {
      const operations = await this.getOperationCosts();
      const requiredOperations = ['dataset_upload', 'model_training', 'prediction', 'report_generation'];
      
      for (const op of requiredOperations) {
        if (!operations.find(o => o.id === op)) {
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('Credit system validation failed:', error);
      return false;
    }
  }

  static async initializeDefaultOperations() {
    const defaultOperations = [
      {
        id: 'dataset_upload',
        name: 'Caricamento Dataset',
        description: 'Costo per caricare un nuovo dataset',
        creditCost: 10,
      },
      {
        id: 'model_training',
        name: 'Addestramento Modello',
        description: 'Costo per addestrare un modello di machine learning',
        creditCost: 10,
      },
      {
        id: 'prediction',
        name: 'Predizione',
        description: 'Costo per ogni singola predizione',
        creditCost: 2,
      },
      {
        id: 'report_generation',
        name: 'Generazione Report',
        description: 'Costo per generare un report dettagliato',
        creditCost: 50,
      },
    ];

    for (const operation of defaultOperations) {
      const existing = await db
        .select()
        .from(creditOperation)
        .where(eq(creditOperation.id, operation.id))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(creditOperation).values({
          id: operation.id,
          name: operation.name,
          description: operation.description,
          creditCost: operation.creditCost,
        });
      }
    }
  }

  static async initializeDefaultPackages() {
    const defaultPackages = [
      {
        id: 'starter',
        name: 'Starter',
        credits: 100,
        price: '50',
        currency: 'EUR',
        sortOrder: 1,
      },
      {
        id: 'professional',
        name: 'Professional',
        credits: 250,
        price: '115',
        currency: 'EUR',
        isPopular: true,
        sortOrder: 2,
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        credits: 500,
        price: '200',
        currency: 'EUR',
        sortOrder: 3,
      },
    ];

    for (const pkg of defaultPackages) {
      const existing = await db
        .select()
        .from(creditPackage)
        .where(eq(creditPackage.id, pkg.id))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(creditPackage).values(pkg);
      }
    }
  }
}