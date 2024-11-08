import { db } from '../lib/db';

export async function verifyEmailToken(token: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const verificationToken = await db.verificationTokens
      .where('token')
      .equals(token)
      .first();

    if (!verificationToken) {
      return {
        success: false,
        message: 'رابط التحقق غير صالح'
      };
    }

    if (new Date() > verificationToken.expiresAt) {
      return {
        success: false,
        message: 'انتهت صلاحية رابط التحقق'
      };
    }

    const user = await db.users.get(verificationToken.userId);
    if (!user) {
      return {
        success: false,
        message: 'المستخدم غير موجود'
      };
    }

    await db.transaction('rw', [db.users, db.verificationTokens], async () => {
      await db.users.update(user.id!, {
        isVerified: true
      });

      await db.verificationTokens
        .where('userId')
        .equals(user.id!)
        .delete();
    });

    return {
      success: true,
      message: 'تم تأكيد البريد الإلكتروني بنجاح'
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return {
      success: false,
      message: 'حدث خطأ أثناء التحقق من البريد الإلكتروني'
    };
  }
}