import Stripe from 'stripe';
import { db } from '../../src/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!endpointSecret || !signature) {
      throw new Error('Missing webhook secret or signature');
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      console.error('[Stripe] Webhook signature verification failed:', err);
      return new Response(
        JSON.stringify({ error: 'Webhook signature verification failed' }), 
        { status: 400 }
      );
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      const userId = session.metadata?.userId;
      const credits = session.metadata?.credits;

      if (!userId || !credits) {
        throw new Error('Missing user ID or credits in session metadata');
      }

      await db.transaction('rw', [db.users, db.creditTransactions], async () => {
        const user = await db.users.get(parseInt(userId));
        if (!user) throw new Error('User not found');

        await db.users.update(parseInt(userId), {
          credits: (user.credits || 0) + parseInt(credits)
        });

        await db.creditTransactions.add({
          userId: parseInt(userId),
          amount: parseInt(credits),
          type: 'purchase',
          description: `شراء ${credits} رصيد`,
          createdAt: new Date()
        });
      });

      console.log('[Stripe] Credits added successfully for user:', userId);
    }

    return new Response(JSON.stringify({ received: true }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('[Stripe] Webhook error:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Webhook handler failed' }), 
      { status: 400 }
    );
  }
}