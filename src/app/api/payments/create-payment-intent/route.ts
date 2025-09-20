import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PaymentService } from '@/lib/payments';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { packageId } = await request.json();

    if (!packageId) {
      return NextResponse.json({ error: 'Package ID is required' }, { status: 400 });
    }

    const paymentIntent = await PaymentService.createPaymentIntent(session.user.id, packageId);

    return NextResponse.json(paymentIntent);

  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json({ 
      error: 'Failed to create payment intent' 
    }, { status: 500 });
  }
}