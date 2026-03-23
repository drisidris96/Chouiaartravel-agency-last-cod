import nodemailer from "nodemailer";
import { logger } from "./logger";
import { LOGO_B64 } from "./logo-b64";

const GMAIL_USER = "chouiaartravelagency@gmail.com";
const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD;

const LOGO_SRC = `data:image/jpeg;base64,${LOGO_B64}`;

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
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<body style="margin:0;padding:0;background:#0d2152;font-family:Arial,sans-serif;">

  <!-- Blue outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0"
    style="background:linear-gradient(160deg,#0a1a3a 0%,#1a3a7a 50%,#0a1a3a 100%);padding:32px 16px;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="520" cellpadding="0" cellspacing="0"
          style="max-width:520px;width:100%;border-radius:16px;overflow:hidden;
                 box-shadow:0 12px 50px rgba(0,0,0,0.5);border:1px solid rgba(201,168,76,0.3);">

          <!-- Logo header (blue bg) -->
          <tr>
            <td style="background:linear-gradient(180deg,#0d2152 0%,#1a3a7a 100%);
                        padding:20px 20px 0 20px;text-align:center;">
              ${LOGO_SRC ? `
              <img src="${LOGO_SRC}"
                alt="وكالة شويعر للسياحة والأسفار"
                width="400"
                style="max-width:100%;height:auto;border-radius:10px;display:block;margin:0 auto;" />
              ` : `
              <div style="padding:20px 0;">
                <h1 style="color:#c9a84c;margin:0;font-size:24px;">وكالة شويعر للسياحة والأسفار</h1>
                <p style="color:#a0b4d0;margin:4px 0 0;font-size:13px;">CHOUIAAR TRAVEL AGENCY</p>
              </div>
              `}
            </td>
          </tr>

          <!-- Gold divider -->
          <tr>
            <td style="background:linear-gradient(180deg,#1a3a7a 0%,#1e4080 100%);padding:14px 24px;">
              <div style="height:2px;background:linear-gradient(90deg,transparent,#c9a84c,transparent);"></div>
            </td>
          </tr>

          <!-- White content -->
          <tr>
            <td style="background:#ffffff;padding:32px 28px;">

              <h2 style="color:#0d2152;margin:0 0 10px 0;font-size:21px;text-align:center;">
                🔐 استعادة كلمة المرور
              </h2>
              <p style="color:#555;font-size:14px;line-height:1.8;margin:0 0 22px 0;text-align:center;">
                تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك.<br>
                استخدم الرمز أدناه لإتمام العملية:
              </p>

              <!-- Code box -->
              <div style="background:linear-gradient(135deg,#eef3ff 0%,#f5f0ff 100%);
                           border:2px dashed #3b5bdb;border-radius:12px;
                           padding:24px;text-align:center;margin:0 0 24px 0;">
                <p style="margin:0 0 8px 0;color:#666;font-size:12px;letter-spacing:1px;">
                  رمز التحقق الخاص بك
                </p>
                <span style="font-size:44px;font-weight:bold;letter-spacing:14px;
                              color:#0d2152;font-family:'Courier New',monospace;">
                  ${code}
                </span>
              </div>

              <!-- Warning box -->
              <div style="background:#fff8e6;border-right:4px solid #c9a84c;
                           border-radius:6px;padding:12px 16px;margin-bottom:8px;">
                <p style="color:#7a5c00;font-size:13px;margin:0;line-height:1.7;">
                  ⚠️ هذا الرمز صالح لمدة <strong>30 دقيقة</strong> فقط.<br>
                  إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد.
                </p>
              </div>

            </td>
          </tr>

          <!-- Footer (blue) -->
          <tr>
            <td style="background:linear-gradient(180deg,#1a3a7a 0%,#0d2152 100%);
                        padding:18px 24px;text-align:center;">
              <div style="height:1px;background:linear-gradient(90deg,transparent,#c9a84c,transparent);
                           margin-bottom:14px;"></div>
              <p style="color:#a0b4d0;font-size:11px;margin:0;line-height:1.8;">
                © 2026 وكالة شويعر للسياحة والأسفار — CHOUIAAR TRAVEL AGENCY<br>
                <span style="color:#6080a0;font-size:10px;">هذه رسالة آلية، يرجى عدم الرد عليها</span>
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
    logger.info({ toEmail }, "Password reset email sent");
    return true;
  } catch (err) {
    logger.error({ err, toEmail }, "Failed to send password reset email");
    return false;
  }
}
