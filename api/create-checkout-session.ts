import { Resend } from 'resend';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16'
});

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { packageId, successUrl, cancelUrl } = await req.json();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: packageId === 'basic' 
            ? process.env.VITE_STRIPE_BASIC_PRICE_ID 
            : process.env.VITE_STRIPE_PRO_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return new Response(JSON.stringify({ sessionId: session.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Stripe API error:', err);
    return new Response(JSON.stringify({ message: 'فشل في إنشاء جلسة الدفع' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}