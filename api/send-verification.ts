import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { to, verificationUrl } = await req.json();

    await resend.emails.send({
      from: 'verify@waraqa.me',
      to,
      subject: 'تأكيد البريد الإلكتروني - مساعد الأبحاث',
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>مرحباً بك في مساعد الأبحاث</h2>
          <p>شكراً لتسجيلك معنا. يرجى النقر على الرابط أدناه لتأكيد بريدك الإلكتروني:</p>
          <p>
            <a href="${verificationUrl}" style="background: #0d6efd; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              تأكيد البريد الإلكتروني
            </a>
          </p>
          <p>أو يمكنك نسخ الرابط التالي ولصقه في المتصفح:</p>
          <p>${verificationUrl}</p>
          <p>ينتهي هذا الرابط خلال 24 ساعة.</p>
        </div>
      `
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Email send error:', error);
    return new Response(JSON.stringify({ error: 'Failed to send email' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}