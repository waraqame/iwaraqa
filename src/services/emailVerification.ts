import { db } from '../lib/db';

interface VerificationResponse {
  success: boolean;
  message: string;
}

export async function sendVerificationEmail(email: string): Promise<VerificationResponse> {
  try {
    const user = await db.users.where('email').equals(email).first();

    if (!user) {
      return {
        success: false,
        message: 'البريد الإلكتروني غير مسجل'
      };
    }

    // Generate token
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Token expires in 24 hours

    // Store verification token
    await db.transaction('rw', db.users, async () => {
      await db.users.update(user.id!, {
        verificationToken: token,
        verificationTokenExpires: expiresAt
      });
    });

    // In a real app, send email here
    console.log('Verification URL:', `${window.location.origin}/verify-email?token=${token}`);

    return {
      success: true,
      message: 'تم إرسال رابط التأكيد بنجاح'
    };
  } catch (error) {
    console.error('Email verification error:', error);
    return {
      success: false,
      message: 'حدث خطأ أثناء إرسال رابط التأكيد'
    };
  }
}

export async function verifyEmail(token: string): Promise<VerificationResponse> {
  try {
    const user = await db.users
      .where('verificationToken')
      .equals(token)
      .first();

    if (!user) {
      return {
        success: false,
        message: 'رابط التأكيد غير صالح'
      };
    }

    if (!user.verificationTokenExpires || new Date() > user.verificationTokenExpires) {
      return {
        success: false,
        message: 'انتهت صلاحية رابط التأكيد'
      };
    }

    // Update user verification status
    await db.transaction('rw', db.users, async () => {
      await db.users.update(user.id!, {
        isVerified: true,
        verificationToken: null,
        verificationTokenExpires: null
      });
    });

    return {
      success: true,
      message: 'تم تأكيد البريد الإلكتروني بنجاح'
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return {
      success: false,
      message: 'حدث خطأ أثناء تأكيد البريد الإلكتروني'
    };
  }
}