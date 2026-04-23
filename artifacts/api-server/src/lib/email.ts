import { Resend } from "resend";
import { logger } from "./logger";
import { LOGO_B64 } from "./logo-b64";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = "support@chouiaartravel.com";
const SENDER_NAME = "وكالة شويعر للسياحة والأسفار";

function getResend() {
  if (!RESEND_API_KEY) {
    logger.warn("RESEND_API_KEY not set — email sending disabled");
    return null;
  }
  return new Resend(RESEND_API_KEY);
}

export async function sendPasswordResetEmail(toEmail: string, code: string): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  try {
    const { error } = await resend.emails.send({
      from: `${SENDER_NAME} <${FROM_EMAIL}>`,
      to: toEmail,
      subject: "رمز استعادة كلمة المرور — وكالة شويعر للسياحة",
      attachments: [
        {
          filename: "logo.jpg",
          content: Buffer.from(LOGO_B64, "base64"),
        },
      ],
      html: `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<body style="margin:0;padding:0;background:#f2f4f8;font-family:Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f2f4f8;padding:32px 16px;">
    <tr>
      <td align="center">

        <table width="520" cellpadding="0" cellspacing="0"
          style="max-width:520px;width:100%;background:#ffffff;border-radius:16px;
                 overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.10);">

          <tr>
            <td style="padding:0;line-height:0;">
              <img src="cid:logo.jpg"
                alt="وكالة شويعر للسياحة والأسفار"
                width="520"
                style="width:100%;max-width:520px;height:auto;display:block;" />
            </td>
          </tr>

          <tr>
            <td style="padding:32px 28px 24px 28px;text-align:center;">

              <h2 style="color:#1a1a2e;margin:0 0 12px 0;font-size:20px;">
                استعادة كلمة المرور
              </h2>
              <p style="color:#555;font-size:14px;line-height:1.9;margin:0 0 24px 0;">
                تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك.<br>
                استخدم الرمز التالي لإتمام العملية:
              </p>

              <div style="background:#c0392b;border-radius:12px;padding:20px 24px;margin:0 auto 24px auto;max-width:320px;">
                <p style="margin:0 0 6px 0;color:#f5c6c2;font-size:12px;">
                  رمز إعادة تعيين كلمة المرور
                </p>
                <span style="font-size:46px;font-weight:bold;letter-spacing:16px;
                              color:#ffffff;font-family:'Courier New',monospace;">
                  ${code}
                </span>
              </div>

              <p style="color:#888;font-size:13px;margin:0 0 6px 0;">
                ⚠️ هذا الرمز صالح لمدة <strong>30 دقيقة</strong> فقط.
              </p>
              <p style="color:#aaa;font-size:12px;margin:0;">
                إذا لم تطلب إعادة تعيين كلمة المرور، تجاهل هذا البريد.
              </p>

            </td>
          </tr>

          <tr>
            <td style="background:#f8f9fa;border-top:1px solid #eee;padding:14px 24px;text-align:center;">
              <p style="color:#aaa;font-size:11px;margin:0;line-height:1.8;">
                © 2026 وكالة شويعر للسياحة والأسفار — CHOUIAAR TRAVEL AGENCY<br>
                <span style="font-size:10px;">هذه رسالة آلية، يرجى عدم الرد عليها</span>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`,
    });

    if (error) {
      logger.error({ error, toEmail }, "Resend API error");
      return false;
    }

    logger.info({ toEmail }, "Password reset email sent via Resend");
    return true;
  } catch (err) {
    logger.error({ err, toEmail }, "Failed to send password reset email");
    return false;
  }
}

export interface MailAttachment {
  name: string;
  type: string;
  data: string;
}

export async function sendMail({
  to,
  subject,
  html,
  attachments = [],
}: {
  to: string;
  subject: string;
  html: string;
  attachments?: MailAttachment[];
}): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  try {
    const { error } = await resend.emails.send({
      from: `${SENDER_NAME} <${FROM_EMAIL}>`,
      to,
      subject,
      html,
      attachments: attachments.map((f) => ({
        filename: f.name,
        content: Buffer.from(f.data, "base64"),
      })),
    });

    if (error) {
      logger.error({ error, to }, "Resend API error");
      return false;
    }

    logger.info({ to, subject }, "Email sent via Resend");
    return true;
  } catch (err) {
    logger.error({ err, to }, "Failed to send email");
    return false;
  }
}
