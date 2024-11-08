import Stripe from 'stripe';
import { addCredits } from './credits';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16'
});

const CREDIT_PACKAGES = {
  basic: {
    id: 'basic',
    credits: 13,
    price: 100,
    priceId: process.env.STRIPE_BASIC_PRICE_ID
  },
  pro: {
    id: 'pro',
    credits: 30,
    price: 200,
    priceId: process.env.STRIPE_PRO_PRICE_ID
  }
} as const;

export async function createCheckoutSession(userId: number, packageId: keyof typeof CREDIT_PACKAGES) {
  const package_ = CREDIT_PACKAGES[packageId];
  if (!package_) {
    throw new Error('Invalid package');
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: package_.priceId,
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.APP_URL}/credits/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.APP_URL}/credits`,
    metadata: {
      userId: userId.toString(),
      packageId,
      credits: package_.credits.toString()
    },
  });

  return session;
}

export async function handleWebhook(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const { userId, credits } = session.metadata || {};
      
      if (userId && credits) {
        await addCredits(
          parseInt(userId), 
          parseInt(credits),
          `شراء باقة ${credits} رصيد`
        );
      }
      break;
    }
  }
}