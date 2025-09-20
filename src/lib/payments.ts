import Stripe from 'stripe';
import { db } from './db';
import { user, creditPackage } from './schema';
import { eq } from 'drizzle-orm';
import { CreditsService } from './credits';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export class PaymentService {
  static async createPaymentIntent(userId: string, packageId: string) {
    try {
      // Get the credit package
      const packages = await db
        .select()
        .from(creditPackage)
        .where(eq(creditPackage.id, packageId))
        .limit(1);

      if (packages.length === 0) {
        throw new Error('Credit package not found');
      }

      const creditPackageData = packages[0];

      // Create or get Stripe customer
      let stripeCustomerId;
      const userRecord = await db
        .select({ stripeCustomerId: user.stripeCustomerId })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);

      if (userRecord[0]?.stripeCustomerId) {
        stripeCustomerId = userRecord[0].stripeCustomerId;
      } else {
        // Create new Stripe customer
        const customer = await stripe.customers.create({
          email: (await db.select({ email: user.email }).from(user).where(eq(user.id, userId)).limit(1))[0].email,
          metadata: {
            userId: userId,
          },
        });

        // Update user with Stripe customer ID
        await db
          .update(user)
          .set({ stripeCustomerId: customer.id })
          .where(eq(user.id, userId));

        stripeCustomerId = customer.id;
      }

      // Create PaymentIntent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(Number(creditPackageData.price) * 100), // Convert to cents
        currency: creditPackageData.currency.toLowerCase(),
        customer: stripeCustomerId,
        metadata: {
          userId: userId,
          packageId: packageId,
          credits: creditPackageData.credits.toString(),
        },
        description: `Purchase of ${creditPackageData.credits} credits`,
      });

      return {
        clientSecret: paymentIntent.client_secret,
        amount: creditPackageData.price,
        credits: creditPackageData.credits,
        packageName: creditPackageData.name,
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  static async handleWebhook(signature: string, payload: Buffer) {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );

      // Handle the event
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          await this.handleSuccessfulPayment(paymentIntent);
          break;
        case 'payment_intent.payment_failed':
          const failedPayment = event.data.object as Stripe.PaymentIntent;
          console.log('Payment failed:', failedPayment.id);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      console.error('Webhook error:', error);
      throw error;
    }
  }

  private static async handleSuccessfulPayment(paymentIntent: Stripe.PaymentIntent) {
    try {
      const { userId, packageId, credits } = paymentIntent.metadata;

      if (!userId || !packageId || !credits) {
        console.error('Missing metadata in payment intent:', paymentIntent.id);
        return;
      }

      const creditsAmount = parseInt(credits);

      // Add credits to user
      await CreditsService.addCredits(
        userId,
        creditsAmount,
        `Purchase of ${credits} credits (${packageId})`,
        'purchase',
        'credit_purchase',
        paymentIntent.id
      );

      console.log(`Successfully added ${creditsAmount} credits to user ${userId}`);
    } catch (error) {
      console.error('Error handling successful payment:', error);
    }
  }

  static async getUserPaymentMethods(userId: string) {
    try {
      const userRecord = await db
        .select({ stripeCustomerId: user.stripeCustomerId })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);

      if (!userRecord[0]?.stripeCustomerId) {
        return [];
      }

      const paymentMethods = await stripe.paymentMethods.list({
        customer: userRecord[0].stripeCustomerId,
        type: 'card',
      });

      return paymentMethods.data;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return [];
    }
  }
}