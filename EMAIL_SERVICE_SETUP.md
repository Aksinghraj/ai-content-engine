# Email Service Setup Guide

## Step 3: Email Service Configuration

### Overview
This guide covers setting up email services for transactional emails, newsletters, and notifications.

### Supported Email Services

#### Option 1: SendGrid (Recommended)
**Best for:** High volume, reliable delivery, excellent support

1. **Create SendGrid Account**
   - Visit: https://sendgrid.com
   - Sign up for free account
   - Verify email address

2. **Get API Key**
   - Go to Settings → API Keys
   - Create new API key
   - Copy the key

3. **Configure in Environment**
   - Add to `.env`: `SENDGRID_API_KEY=your_key_here`
   - Add to `.env`: `SENDGRID_FROM_EMAIL=noreply@yourdomain.com`

4. **Implementation**
   ```typescript
   import sgMail from '@sendgrid/mail';
   
   sgMail.setApiKey(process.env.SENDGRID_API_KEY);
   
   await sgMail.send({
     to: user.email,
     from: process.env.SENDGRID_FROM_EMAIL,
     subject: 'Welcome to AI Content Engine',
     html: '<h1>Welcome!</h1>',
   });
   ```

#### Option 2: Mailgun
**Best for:** Developers, flexible API, good pricing

1. **Create Mailgun Account**
   - Visit: https://mailgun.com
   - Sign up
   - Verify domain

2. **Get Credentials**
   - API Key from dashboard
   - Domain name

3. **Configure**
   - `MAILGUN_API_KEY=your_key`
   - `MAILGUN_DOMAIN=mg.yourdomain.com`

#### Option 3: AWS SES
**Best for:** AWS infrastructure, high volume, cost-effective

1. **Enable SES**
   - Go to AWS Console
   - Navigate to SES
   - Verify email/domain

2. **Create IAM User**
   - Create user with SES permissions
   - Generate access keys

3. **Configure**
   - `AWS_ACCESS_KEY_ID=xxx`
   - `AWS_SECRET_ACCESS_KEY=xxx`
   - `AWS_SES_REGION=us-east-1`

### Email Templates

#### Welcome Email
```html
<h1>Welcome to AI Content Engine!</h1>
<p>Get started with your free account:</p>
<ul>
  <li>5 generations/day</li>
  <li>3 automations</li>
  <li>Community access</li>
</ul>
<a href="{{loginUrl}}">Sign In</a>
```

#### Payment Confirmation
```html
<h1>Payment Received</h1>
<p>Thank you for your subscription to {{plan}}!</p>
<p>Amount: ${{amount}}</p>
<p>Invoice: {{invoiceUrl}}</p>
```

#### Content Generated
```html
<h1>Your Content is Ready!</h1>
<p>{{contentTitle}} has been generated successfully.</p>
<a href="{{contentUrl}}">View Content</a>
```

### Transactional Email Triggers

1. **User Registration**
   - Welcome email
   - Email verification

2. **Payment Events**
   - Payment confirmation
   - Invoice receipt
   - Subscription renewal
   - Payment failed

3. **Content Generation**
   - Content ready notification
   - Automation executed
   - Batch generation complete

4. **Account Events**
   - Password reset
   - Email change
   - Subscription upgrade/downgrade
   - Account deletion

### Newsletter Setup

#### Option 1: Mailchimp
1. Create account at mailchimp.com
2. Create audience
3. Get API key
4. Integrate with platform

#### Option 2: ConvertKit
1. Create account at convertkit.com
2. Create form
3. Get API key
4. Integrate with platform

#### Option 3: Substack
1. Create publication at substack.com
2. Get API credentials
3. Integrate with platform

### Implementation in tRPC

```typescript
// server/routers/email.ts
import sgMail from '@sendgrid/mail';

export const emailRouter = router({
  sendWelcome: protectedProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      try {
        await sgMail.send({
          to: input.email,
          from: process.env.SENDGRID_FROM_EMAIL,
          subject: 'Welcome to AI Content Engine',
          html: welcomeEmailTemplate(),
        });
        return { success: true };
      } catch (error) {
        console.error('Email send failed:', error);
        return { success: false, error: error.message };
      }
    }),

  sendPaymentConfirmation: protectedProcedure
    .input(z.object({ 
      email: z.string().email(),
      amount: z.number(),
      plan: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        await sgMail.send({
          to: input.email,
          from: process.env.SENDGRID_FROM_EMAIL,
          subject: 'Payment Confirmation',
          html: paymentConfirmationTemplate(input),
        });
        return { success: true };
      } catch (error) {
        console.error('Email send failed:', error);
        return { success: false, error: error.message };
      }
    }),
});
```

### Testing Email Service

```bash
# Test SendGrid connection
curl -X POST https://api.sendgrid.com/v3/mail/send \
  -H "Authorization: Bearer $SENDGRID_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "personalizations": [{"to": [{"email": "test@example.com"}]}],
    "from": {"email": "noreply@yourdomain.com"},
    "subject": "Test Email",
    "content": [{"type": "text/html", "value": "<h1>Test</h1>"}]
  }'
```

### Monitoring & Troubleshooting

1. **Check Email Logs**
   - SendGrid: Dashboard → Mail Activity
   - Mailgun: Logs → Message History
   - AWS SES: Sending Statistics

2. **Common Issues**
   - Email marked as spam: Check sender reputation
   - Delivery failures: Verify domain/email
   - Rate limiting: Implement queue system

3. **Best Practices**
   - Use transactional email service (not marketing)
   - Implement retry logic
   - Log all email events
   - Monitor delivery rates
   - Use email templates
   - Implement unsubscribe links

### Production Checklist

- [ ] Email service account created
- [ ] API keys configured
- [ ] Email templates created
- [ ] Transactional emails tested
- [ ] Newsletter setup (optional)
- [ ] Email logging configured
- [ ] Bounce handling implemented
- [ ] Unsubscribe links added
- [ ] SPF/DKIM records configured
- [ ] Monitoring alerts set up

---

**Recommended:** SendGrid (easiest to set up, reliable, good support)

**Next:** Configure analytics & monitoring (Step 5)
