import { db } from '../lib/db';

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  try {
    console.log('[Email] Sending verification email to:', email);
    
    const verificationUrl = `${window.location.origin}/verify-email?token=${token}`;
    
    // In development, just log the verification URL
    if (process.env.NODE_ENV === 'development') {
      console.log('[Email] Verification URL:', verificationUrl);
      return;
    }

    const response = await fetch('/api/send-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: email,
        verificationUrl,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send verification email');
    }

    console.log('[Email] Verification email sent successfully');
  } catch (error) {
    console.error('[Email] Send verification error:', error);
    throw new Error('حدث خطأ أثناء إرسال رابط التحقق');
  }
}

export async function verifyEmail(token: string): Promise<boolean> {
  try {
    console.log('[Email] Verifying email with token:', token);
    
    const user = await db.users.where('verificationToken').equals(token).first();
    
    if (!user) {
      console.log('[Email] No user found with token:', token);
      return false;
    }

    await db.users.update(user.id!, {
      isVerified: true,
      verificationToken: null
    });

    console.log('[Email] Email verified successfully for user:', user.email);
    return true;
  } catch (error) {
    console.error('[Email] Email verification failed:', error);
    return false;
  }
}