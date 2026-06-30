import { ENV } from "./env";

export type EmailPayload = {
  to: string;
  subject: string;
  htmlContent: string;
};

const buildEmailEndpointUrl = (baseUrl: string): string => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL("webdevtoken.v1.WebDevService/SendEmail", normalizedBase).toString();
};

/**
 * Sends an email to a user through the Manus Email Service.
 * Returns `true` if the email was sent successfully, `false` otherwise.
 */
export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  if (!payload.to || !payload.subject || !payload.htmlContent) {
    console.error("[Email] Missing required fields:", { to: !!payload.to, subject: !!payload.subject, htmlContent: !!payload.htmlContent });
    return false;
  }

  if (!ENV.forgeApiUrl) {
    console.error("[Email] Email service URL is not configured");
    return false;
  }

  if (!ENV.forgeApiKey) {
    console.error("[Email] Email service API key is not configured");
    return false;
  }

  const endpoint = buildEmailEndpointUrl(ENV.forgeApiUrl);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1",
      },
      body: JSON.stringify({
        to: payload.to,
        subject: payload.subject,
        htmlContent: payload.htmlContent,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Email] Failed to send email (${response.status} ${response.statusText})${
          detail ? `: ${detail}` : ""
        }`
      );
      return false;
    }

    console.log("[Email] Email sent successfully to", payload.to);
    return true;
  } catch (error) {
    console.error("[Email] Error sending email:", error);
    return false;
  }
}

/**
 * Sends an OTP verification email to a new user
 */
export async function sendVerificationEmail(
  email: string,
  userName: string,
  otp: string,
  _verificationUrl?: string  // kept for backward compat, not used
): Promise<boolean> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; margin: 0; padding: 0; }
          .wrapper { max-width: 600px; margin: 0 auto; padding: 20px; }
          .card { background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%); color: white; padding: 32px 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
          .header p { margin: 8px 0 0; opacity: 0.85; font-size: 14px; }
          .content { padding: 32px 24px; }
          .otp-box { background: #f8f4ff; border: 2px dashed #7c3aed; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
          .otp-label { font-size: 13px; color: #6b7280; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
          .otp-code { font-size: 42px; font-weight: 900; color: #7c3aed; letter-spacing: 8px; font-family: monospace; }
          .expiry { font-size: 13px; color: #9ca3af; margin-top: 8px; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px; font-size: 13px; color: #92400e; margin-top: 20px; }
          .footer { padding: 20px 24px; background: #f9fafb; text-align: center; font-size: 12px; color: #9ca3af; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="card">
            <div class="header">
              <h1>✨ Lumae AI</h1>
              <p>Email Verification</p>
            </div>
            <div class="content">
              <p>Hi <strong>${userName || "there"}</strong>,</p>
              <p>Welcome to Lumae AI! Use the OTP below to verify your email address and unlock all features.</p>
              <div class="otp-box">
                <div class="otp-label">Your Verification Code</div>
                <div class="otp-code">${otp}</div>
                <div class="expiry">⏱ Expires in 10 minutes</div>
              </div>
              <p>Enter this code on the verification page to complete your registration.</p>
              <div class="warning">
                🔒 Never share this code with anyone. Lumae AI will never ask for your OTP.
              </div>
            </div>
            <div class="footer">
              <p>© 2026 Lumae AI. All rights reserved.</p>
              <p>If you didn't create this account, you can safely ignore this email.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `${otp} is your Lumae AI verification code`,
    htmlContent,
  });
}
