import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/lib/payments';
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    await PaymentService.handleWebhook(signature, Buffer.from(body));

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ 
      error: 'Webhook handler failed' 
    }, { status: 400 });
  }
}