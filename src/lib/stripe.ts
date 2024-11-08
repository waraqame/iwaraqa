import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export const PACKAGES = {
  basic: {
    id: 'basic',
    priceId: import.meta.env.VITE_STRIPE_BASIC_PRICE_ID,
    name: 'الباقة الأساسية',
    credits: 100,
    price: 100
  },
  pro: {
    id: 'pro',
    priceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID,
    name: 'الباقة المتقدمة',
    credits: 250,
    price: 200
  }
} as const;

export async function createCheckoutSession(
  packageId: keyof typeof PACKAGES,
  successUrl: string,
  cancelUrl: string
): Promise<void> {
  try {
    console.log('[Stripe] Creating checkout session for package:', packageId);
    
    const stripe = await stripePromise;
    if (!stripe) {
      throw new Error('فشل تهيئة Stripe');
    }

    const pkg = PACKAGES[packageId];
    if (!pkg.priceId) {
      throw new Error('معرف السعر غير متوفر');
    }

    const { error } = await stripe.redirectToCheckout({
      mode: 'payment',
      lineItems: [
        {
          price: pkg.priceId,
          quantity: 1,
        },
      ],
      successUrl,
      cancelUrl,
    });

    if (error) {
      console.error('[Stripe] Checkout error:', error);
      throw error;
    }
  } catch (error) {
    console.error('[Stripe] Session creation error:', error);
    throw error;
  }
}

export async function handlePaymentSuccess(sessionId: string): Promise<void> {
  try {
    const response = await fetch('/api/payment-success', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId }),
    });

    if (!response.ok) {
      throw new Error('فشل في التحقق من الدفع');
    }
  } catch (error) {
    console.error('[Stripe] Payment verification error:', error);
    throw error;
  }
}

export async function validatePaymentSession(sessionId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/validate-session?session_id=${sessionId}`);
    if (!response.ok) {
      return false;
    }
    const data = await response.json();
    return data.valid;
  } catch (error) {
    console.error('[Stripe] Session validation error:', error);
    return false;
  }
}