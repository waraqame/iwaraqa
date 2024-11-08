import { db } from '../../src/lib/db';

// Verify webhook signature
function verifySignature(payload: string, signature: string, secret: string): boolean {
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', secret);
  const calculatedSignature = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(calculatedSignature)
  );
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const signature = req.headers.get('resend-signature');
    if (!signature) {
      return new Response('Missing signature', { status: 401 });
    }

    const payload = await req.text();
    const isValid = verifySignature(
      payload,
      signature,
      process.env.RESEND_WEBHOOK_SECRET || ''
    );

    if (!isValid) {
      return new Response('Invalid signature', { status: 401 });
    }

    const event = JSON.parse(payload);

    // Handle different event types
    switch (event.type) {
      case 'email.delivered':
        console.log('Email delivered:', event.data);
        break;

      case 'email.bounced':
        // Mark user's email as invalid
        const email = event.data.to;
        await db.users
          .where('email')
          .equals(email)
          .modify({ isVerified: false });
        console.log('Email bounced:', event.data);
        break;

      case 'email.complained':
        // Handle spam complaints
        console.log('Spam complaint:', event.data);
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: 'Webhook processing failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}