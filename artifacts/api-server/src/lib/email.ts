import nodemailer from "nodemailer";
import { logger } from "./logger";

const GMAIL_USER = "chouiaartravelagency@gmail.com";
const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD;

function createTransport() {
  if (!GMAIL_PASS) {
    logger.warn("GMAIL_APP_PASSWORD not set — email sending disabled");
    return null;
  }
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: GMAIL_USER, pass: GMAIL_PASS },
  });
}

export async function sendPasswordResetEmail(toEmail: string, code: string): Promise<boolean> {
  const transport = createTransport();
  if (!transport) {
    logger.warn({ toEmail }, "Email not sent (no GMAIL_APP_PASSWORD)");
    return false;
  }

  try {
    await transport.sendMail({
      from: `"وكالة شويعر للسياحة" <${GMAIL_USER}>`,
      to: toEmail,
      subject: "رمز استعادة كلمة المرور — وكالة شويعر",
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background: #f9f9f9; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="color: #1a2a4a; margin: 0;">وكالة شويعر للسياحة والأسفار</h2>
            <p style="color: #666; font-size: 13px; margin-top: 4px;">CHOUIAAR TRAVEL AGENCY</p>
          </div>
          <div style="background: #fff; border-radius: 10px; padding: 24px; border: 1px solid #e5e7eb;">
            <h3 style="color: #1a2a4a; margin-top: 0;">استعادة كلمة المرور</h3>
            <p style="color: #444; line-height: 1.6;">
              تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك.
              استخدم الرمز التالي لإتمام العملية:
            </p>
            <div style="background: #f0f4ff; border: 2px dashed #4f6ef7; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #1a2a4a;">${code}</span>
            </div>
            <p style="color: #888; font-size: 13px; line-height: 1.5;">
              ⚠️ هذا الرمز صالح لمدة <strong>30 دقيقة</strong> فقط.<br>
              إذا لم تطلب إعادة تعيين كلمة المرور، تجاهل هذا البريد.
            </p>
          </div>
          <p style="text-align: center; color: #aaa; font-size: 11px; margin-top: 16px;">
            © 2026 وكالة شويعر للسياحة والأسفار
          </p>
        </div>
      `,
    });
    logger.info({ toEmail }, "Password reset email sent");
    return true;
  } catch (err) {
    logger.error({ err, toEmail }, "Failed to send password reset email");
    return false;
  }
}
