# Email Deliverability Guide

This guide explains how to improve email deliverability and reduce the likelihood of verification emails going to spam folders.

## Why Emails Go to Spam

### Common Reasons:
1. **Domain Reputation**: New or poorly configured domains
2. **Email Content**: Spam-like content or formatting
3. **Technical Issues**: Missing or incorrect DNS records
4. **User Behavior**: Users marking emails as spam
5. **Volume**: Sending too many emails too quickly

## Firebase Email Configuration

### 1. Custom Domain Setup (Recommended)

Instead of using the default Firebase domain, set up a custom domain:

#### Step 1: Add Custom Domain in Firebase
1. Go to Firebase Console > Authentication > Settings
2. Click "Add custom domain"
3. Enter your domain (e.g., `auth.yourdomain.com`)
4. Follow the verification steps

#### Step 2: Configure DNS Records
Add these DNS records to your domain:

```
# SPF Record (TXT)
yourdomain.com. IN TXT "v=spf1 include:_spf.google.com ~all"

# DKIM Record (TXT)
selector._domainkey.yourdomain.com. IN TXT "v=DKIM1; k=rsa; p=YOUR_PUBLIC_KEY"

# DMARC Record (TXT)
_dmarc.yourdomain.com. IN TXT "v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com"
```

### 2. Email Template Optimization

#### Professional Email Template:
```html
Subject: Verify your email for JustJobsInfo

Hello [DISPLAY_NAME],

Thank you for registering with JustJobsInfo!

To complete your registration, please verify your email address by clicking the link below:

[VERIFICATION_LINK]

This link will expire in 24 hours for security reasons.

If you didn't create an account with us, you can safely ignore this email.

Best regards,
The JustJobsInfo Team

---
This email was sent from a notification-only address that cannot accept incoming email. Please do not reply to this message.
```

#### Key Template Improvements:
- **Clear sender name**: "JustJobsInfo" instead of generic
- **Professional subject line**: Specific to your app
- **Clear call-to-action**: "Verify your email"
- **Security notice**: Link expiration information
- **Unsubscribe option**: For non-verification emails
- **Physical address**: If required by law

### 3. Firebase Console Settings

#### Authentication Settings:
1. **Sender name**: "JustJobsInfo" (your app name)
2. **From email**: `noreply@yourdomain.com` (custom domain)
3. **Reply-to**: `support@yourdomain.com`
4. **Subject**: "Verify your email for JustJobsInfo"
5. **Message**: Use the optimized template above

#### Advanced Settings:
1. **Action URL**: `https://yourdomain.com/verify-email`
2. **Handle code in app**: Disabled (for security)
3. **Email verification**: Enabled
4. **Password reset**: Enabled

## Technical Improvements

### 1. DNS Configuration

#### Essential DNS Records:
```bash
# SPF Record
yourdomain.com. IN TXT "v=spf1 include:_spf.google.com include:_spf.firebase.com ~all"

# DKIM Record (from Firebase)
selector._domainkey.yourdomain.com. IN TXT "v=DKIM1; k=rsa; p=YOUR_PUBLIC_KEY"

# DMARC Record
_dmarc.yourdomain.com. IN TXT "v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com; ruf=mailto:dmarc@yourdomain.com"

# MX Records (if using custom email)
yourdomain.com. IN MX 10 mail.yourdomain.com.

# A Records
mail.yourdomain.com. IN A YOUR_SERVER_IP
```

### 2. Domain Warm-up

#### Gradual Volume Increase:
- **Week 1**: 10-50 emails per day
- **Week 2**: 50-100 emails per day
- **Week 3**: 100-200 emails per day
- **Week 4**: 200+ emails per day

#### Best Practices:
- Start with known good email addresses
- Monitor bounce rates and spam complaints
- Gradually increase volume over time
- Use consistent sending patterns

### 3. Email Authentication

#### SPF (Sender Policy Framework):
```
v=spf1 include:_spf.google.com include:_spf.firebase.com ~all
```

#### DKIM (DomainKeys Identified Mail):
- Firebase automatically handles DKIM
- Verify in Firebase Console > Authentication > Settings

#### DMARC (Domain-based Message Authentication):
```
v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com
```

## Monitoring and Testing

### 1. Email Testing Tools

#### Free Tools:
- **Mail Tester**: https://www.mail-tester.com/
- **GlockApps**: https://glockapps.com/
- **250ok**: https://250ok.com/
- **Sender Score**: https://senderscore.org/

#### Testing Process:
1. Send test emails to these services
2. Check spam folder placement
3. Review authentication scores
4. Fix any issues identified

### 2. Monitoring Setup

#### Firebase Analytics:
1. Enable Firebase Analytics
2. Track email delivery rates
3. Monitor verification success rates
4. Set up alerts for delivery issues

#### Custom Monitoring:
```javascript
// Track email verification success
const trackVerificationSuccess = async (email) => {
  try {
    await fetch('/api/analytics/email-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, status: 'success' })
    });
  } catch (error) {
    console.error('Analytics error:', error);
  }
};
```

## Best Practices

### 1. Content Guidelines

#### Do's:
- ✅ Use clear, professional language
- ✅ Include your company name and branding
- ✅ Provide clear call-to-action buttons
- ✅ Include unsubscribe links (for marketing emails)
- ✅ Use consistent sending patterns
- ✅ Include physical address if required

#### Don'ts:
- ❌ Use spam trigger words (FREE, URGENT, ACT NOW)
- ❌ Use excessive capitalization or punctuation
- ❌ Include too many links or images
- ❌ Send from generic domains (gmail, yahoo)
- ❌ Use misleading subject lines
- ❌ Send to purchased email lists

### 2. Technical Guidelines

#### Do's:
- ✅ Set up proper DNS records
- ✅ Use custom domain for sending
- ✅ Implement proper authentication
- ✅ Monitor delivery rates
- ✅ Handle bounces properly
- ✅ Use consistent "From" addresses

#### Don'ts:
- ❌ Send from shared hosting IPs
- ❌ Use dynamic IP addresses
- ❌ Ignore bounce reports
- ❌ Send to invalid email addresses
- ❌ Use inconsistent sending patterns

### 3. User Experience

#### Clear Messaging:
- Explain why the email was sent
- Provide clear next steps
- Include support contact information
- Set proper expectations for timing

#### Error Handling:
- Handle verification failures gracefully
- Provide alternative verification methods
- Clear error messages for users
- Support for common issues

## Implementation Steps

### Step 1: Domain Setup
1. Purchase a domain (if not already done)
2. Configure DNS records for email authentication
3. Set up custom domain in Firebase
4. Verify domain ownership

### Step 2: Email Template
1. Create professional email template
2. Test with email deliverability tools
3. Optimize based on test results
4. Implement in Firebase Console

### Step 3: Monitoring
1. Set up email delivery monitoring
2. Configure alerts for delivery issues
3. Track verification success rates
4. Monitor spam complaints

### Step 4: Testing
1. Send test emails to various providers
2. Check spam folder placement
3. Verify authentication scores
4. Test with different email clients

## Troubleshooting

### Common Issues:

#### 1. Emails Going to Spam
- Check DNS records (SPF, DKIM, DMARC)
- Verify domain reputation
- Review email content for spam triggers
- Test with email deliverability tools

#### 2. Low Delivery Rates
- Monitor bounce rates
- Clean email list regularly
- Use proper authentication
- Follow sending best practices

#### 3. Authentication Failures
- Verify DNS records are correct
- Check for DNS propagation delays
- Ensure Firebase configuration is correct
- Test with authentication checkers

## Advanced Configuration

### Custom Email Service (Optional)

For even better deliverability, consider using a dedicated email service:

#### Popular Options:
- **SendGrid**: Excellent deliverability, good free tier
- **Mailgun**: Developer-friendly, good API
- **Amazon SES**: Cost-effective, high deliverability
- **Postmark**: Specialized in transactional emails

#### Implementation:
```javascript
// Example with SendGrid
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendVerificationEmail = async (email, verificationLink) => {
  const msg = {
    to: email,
    from: 'noreply@yourdomain.com',
    subject: 'Verify your email for JustJobsInfo',
    html: verificationEmailTemplate(verificationLink),
  };
  
  return sgMail.send(msg);
};
```

## Conclusion

By following these guidelines, you can significantly improve email deliverability and reduce spam folder placement. The key is to:

1. **Use proper authentication** (SPF, DKIM, DMARC)
2. **Send from a custom domain** with good reputation
3. **Use professional email templates** with clear content
4. **Monitor and test** regularly
5. **Follow best practices** for sending patterns

Remember that email deliverability is an ongoing process that requires monitoring and optimization over time. 