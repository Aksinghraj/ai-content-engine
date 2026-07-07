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


/**
 * Sends a payment receipt email after successful Razorpay payment
 */
export async function sendPaymentReceiptEmail(
  email: string,
  userName: string,
  paymentDetails: {
    orderId: string;
    amount: number;
    currency: string;
    creditsAdded: number;
    paymentMethod: string;
    transactionDate: string;
  }
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
          .success-badge { background: #d1fae5; border: 2px solid #10b981; border-radius: 12px; padding: 16px; text-align: center; margin: 20px 0; }
          .success-badge .icon { font-size: 32px; margin-bottom: 8px; }
          .success-badge .text { color: #065f46; font-weight: 600; font-size: 16px; }
          .receipt-section { background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .receipt-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .receipt-row:last-child { border-bottom: none; }
          .receipt-label { color: #6b7280; font-size: 14px; }
          .receipt-value { color: #1f2937; font-weight: 600; font-size: 14px; }
          .credits-highlight { background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0; }
          .credits-amount { font-size: 28px; font-weight: 900; color: #d97706; }
          .credits-label { font-size: 12px; color: #92400e; margin-top: 4px; }
          .footer { padding: 20px 24px; background: #f9fafb; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%); color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 16px; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="card">
            <div class="header">
              <h1>✨ Lumae AI</h1>
              <p>Payment Receipt</p>
            </div>
            <div class="content">
              <p>Hi <strong>${userName || "there"}</strong>,</p>
              <p>Thank you for your purchase! Your payment has been processed successfully.</p>
              
              <div class="success-badge">
                <div class="icon">✅</div>
                <div class="text">Payment Successful</div>
              </div>

              <div class="receipt-section">
                <div class="receipt-row">
                  <span class="receipt-label">Transaction ID</span>
                  <span class="receipt-value">${paymentDetails.orderId}</span>
                </div>
                <div class="receipt-row">
                  <span class="receipt-label">Amount Paid</span>
                  <span class="receipt-value">${paymentDetails.currency} ${(paymentDetails.amount / 100).toFixed(2)}</span>
                </div>
                <div class="receipt-row">
                  <span class="receipt-label">Payment Method</span>
                  <span class="receipt-value">${paymentDetails.paymentMethod}</span>
                </div>
                <div class="receipt-row">
                  <span class="receipt-label">Date & Time</span>
                  <span class="receipt-value">${new Date(paymentDetails.transactionDate).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div class="credits-highlight">
                <div class="credits-amount">+${paymentDetails.creditsAdded}</div>
                <div class="credits-label">Credits Added to Your Account</div>
              </div>

              <p>Your credits are now available in your Lumae AI account. You can use them to:</p>
              <ul>
                <li>Generate AI content across all platforms</li>
                <li>Create unlimited social media posts</li>
                <li>Access advanced analytics</li>
                <li>Automate content scheduling</li>
              </ul>

              <p style="text-align: center;">
                <a href="https://lumae.co.in/my-credits" class="cta-button">View My Credits</a>
              </p>
            </div>
            <div class="footer">
              <p>© 2026 Lumae AI. All rights reserved.</p>
              <p>If you have any questions, contact us at imankitsingh.in@gmail.com</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `Payment Receipt: ${paymentDetails.creditsAdded} Credits Added to Your Lumae AI Account`,
    htmlContent,
  });
}

/**
 * Sends a contact form submission email to the owner
 */
export async function sendContactFormEmail(
  contactData: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }
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
          .contact-info { background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .info-row { margin: 12px 0; }
          .info-label { color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
          .info-value { color: #1f2937; font-weight: 600; font-size: 14px; margin-top: 4px; }
          .message-box { background: #f0f9ff; border-left: 4px solid #0284c7; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .message-box p { margin: 0; color: #0c4a6e; line-height: 1.8; }
          .footer { padding: 20px 24px; background: #f9fafb; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
          .badge { display: inline-block; background: #7c3aed; color: white; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; margin-top: 8px; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="card">
            <div class="header">
              <h1>📬 New Contact Form Submission</h1>
              <p>Lumae AI</p>
            </div>
            <div class="content">
              <p>You have received a new contact form submission:</p>
              
              <div class="contact-info">
                <div class="info-row">
                  <div class="info-label">From</div>
                  <div class="info-value">${contactData.name}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Email</div>
                  <div class="info-value">
                    <a href="mailto:${contactData.email}" style="color: #0284c7; text-decoration: none;">${contactData.email}</a>
                  </div>
                </div>
                <div class="info-row">
                  <div class="info-label">Subject</div>
                  <div class="info-value">${contactData.subject}</div>
                </div>
              </div>

              <h3 style="color: #1f2937; margin: 20px 0 12px;">Message:</h3>
              <div class="message-box">
                <p>${contactData.message.replace(/\n/g, '<br>')}</p>
              </div>

              <p style="margin-top: 20px;">
                <a href="mailto:${contactData.email}" style="display: inline-block; background: #7c3aed; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600;">Reply to ${contactData.name}</a>
              </p>
            </div>
            <div class="footer">
              <p>© 2026 Lumae AI. All rights reserved.</p>
              <p>This is an automated notification from your contact form.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  // Send to owner email
  const ownerEmail = "imankitsingh.in@gmail.com";
  return sendEmail({
    to: ownerEmail,
    subject: `New Contact Form: ${contactData.subject} from ${contactData.name}`,
    htmlContent,
  });
}
