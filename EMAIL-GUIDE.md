# Email System Guide - JustJobsInfo

**Last Updated**: October 17, 2025  
**Project**: https://justjobs.info

---

## 📑 Table of Contents

1. [Overview](#overview)
2. [Email Verification System](#email-verification-system)
3. [Email Deliverability](#email-deliverability)
4. [Configuration](#configuration)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

---

## Overview

JustJobsInfo uses Firebase Authentication for email verification and Brevo (formerly Sendinblue) for transactional emails. This guide covers both systems and best practices for email deliverability.

### Email Systems

**1. Firebase Authentication (Email Verification)**
- User registration verification
- Password reset emails
- Email change verification

**2. Brevo (Transactional Emails)**
- Job alerts
- Contact form submissions
- Newsletter
- System notifications

---

## Email Verification System

### How It Works

The email verification system ensures users verify their email addresses before accessing the application.

### Registration Process

**Step 1: User Registration**
```
User fills registration form
    ↓
Firebase account created
    ↓
Verification email sent automatically
    ↓
User redirected to verification page
```

**Step 2: Email Verification**
```
User clicks verification link
    ↓
Redirected to /verify-email?oobCode=xxx
    ↓
Page processes verification code
    ↓
Email marked as verified
    ↓
Success message shown
    ↓
Redirected to login page
```

**Step 3: Login Protection**
```
User tries to login
    ↓
System checks email verification status
    ↓
If not verified: Redirect to /verify-email
    ↓
User can request new verification email
    ↓
User verifies and logs in successfully
```

### Files Involved

**Frontend:**
- `src/app/(inner)/register/page.js` - Registration with verification
- `src/app/(inner)/login/page.js` - Login with verification check
- `src/app/(inner)/verify-email/page.js` - Verification page

**Backend:**
- `src/app/api/auth/resend-verification/route.js` - Resend verification emails

### Firebase Configuration

**Environment Variables:**
```env
# Firebase Client Config
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin Config (server-side)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Firebase Console Setup

**1. Enable Email Verification:**
   - Go to Firebase Console → Authentication → Settings
   - Enable "Email verification" in User actions
   - Configure email template

**2. Email Template Configuration:**
   - **Sender name**: JustJobsInfo
   - **From**: noreply@justjobs.info
   - **Subject**: Verify your email for JustJobsInfo
   - **Message**: Custom template with verification link

**3. Custom Domain (Optional):**
   - Add custom domain in Firebase Console
   - Verify domain ownership
   - Update DNS records

### Email Verification Flow

**1. Automatic Email:**
```javascript
// After user registration
await sendEmailVerification(user);
// Email sent automatically by Firebase
```

**2. Manual Resend:**
```javascript
// User can request new verification email
POST /api/auth/resend-verification
Body: { email: "user@example.com" }
```

**3. Verification:**
```javascript
// When user clicks link
await applyActionCode(auth, oobCode);
// Email marked as verified
```

### Security Features

**1. Verification Code Security:**
- One-time use codes
- Time-limited validity (24 hours)
- Secure code generation

**2. Rate Limiting:**
- Firebase limits verification requests
- Prevents spam and abuse
- Automatic throttling

**3. Email Validation:**
- Format validation
- Domain validation
- Prevents invalid addresses

### Error Handling

**Common Errors:**

**1. Invalid Verification Link**
- Link expired (> 24 hours)
- Already verified
- Malformed code

**Solution:**
```javascript
// Request new verification email
- Go to /verify-email
- Click "Resend Verification Email"
- Check inbox/spam folder
```

**2. User Not Found**
- Account deleted
- Never existed
- Wrong email address

**Solution:**
```javascript
// Create new account
- Register again with correct email
- Verify email address
- Login successfully
```

**3. Network Issues**
- Failed to send email
- Connection timeout
- Firebase server issues

**Solution:**
```javascript
// Retry operation
- Check internet connection
- Try again later
- Use different browser
```

---

## Email Deliverability

### Why Emails Go to Spam

**Common Reasons:**
1. Domain reputation issues
2. Missing authentication (SPF, DKIM, DMARC)
3. Spam-like content or formatting
4. High bounce/complaint rates
5. Sending too many emails too quickly

### Domain Authentication

**Essential DNS Records:**

**1. SPF (Sender Policy Framework):**
```dns
justjobs.info. IN TXT "v=spf1 include:_spf.google.com include:_spf.firebase.com ~all"
```

**2. DKIM (DomainKeys Identified Mail):**
```dns
selector._domainkey.justjobs.info. IN TXT "v=DKIM1; k=rsa; p=YOUR_PUBLIC_KEY"
```

**3. DMARC (Domain-based Message Authentication):**
```dns
_dmarc.justjobs.info. IN TXT "v=DMARC1; p=quarantine; rua=mailto:dmarc@justjobs.info"
```

**4. MX Records (if using custom email):**
```dns
justjobs.info. IN MX 10 mail.justjobs.info.
```

### Custom Domain Setup

**Step 1: Add Custom Domain**
1. Go to Firebase Console → Authentication → Settings
2. Click "Add custom domain"
3. Enter: `auth.justjobs.info`
4. Follow verification steps

**Step 2: Configure DNS**
Add DNS records provided by Firebase

**Step 3: Update Email Settings**
- From: noreply@justjobs.info
- Reply-to: support@justjobs.info
- Sender name: JustJobsInfo

### Email Template Optimization

**Professional Email Template:**

**Subject Line:**
- Clear and specific
- Avoid spam trigger words
- Personalize when possible
- Example: "Verify your email for JustJobsInfo"

**Email Body:**
```html
Subject: Verify your email for JustJobsInfo

Hello [NAME],

Thank you for registering with JustJobsInfo!

To complete your registration, please verify your email address by clicking the link below:

[VERIFICATION_LINK]

This link will expire in 24 hours for security reasons.

If you didn't create an account with us, you can safely ignore this email.

Best regards,
The JustJobsInfo Team

---
This email was sent from a notification-only address that cannot accept incoming email.
```

**Best Practices:**
- Clear sender name: "JustJobsInfo"
- Professional subject line
- Clear call-to-action
- Security notice (link expiration)
- Unsubscribe option (for marketing emails)
- Physical address (if required by law)

### Domain Warm-up

**Gradual Volume Increase:**
- Week 1: 10-50 emails/day
- Week 2: 50-100 emails/day
- Week 3: 100-200 emails/day
- Week 4+: 200+ emails/day

**Best Practices:**
- Start with known good addresses
- Monitor bounce rates
- Gradually increase volume
- Use consistent sending patterns

### Content Guidelines

**Do's:**
- ✅ Clear, professional language
- ✅ Include company name and branding
- ✅ Provide clear call-to-action
- ✅ Include unsubscribe links (marketing)
- ✅ Use consistent sending patterns
- ✅ Include physical address (if required)

**Don'ts:**
- ❌ Spam trigger words (FREE, URGENT, ACT NOW)
- ❌ Excessive capitalization
- ❌ Too many links or images
- ❌ Generic domains (gmail, yahoo)
- ❌ Misleading subject lines
- ❌ Purchased email lists

---

## Configuration

### Firebase Authentication Setup

**1. Create Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create new project
   - Enable Authentication

**2. Enable Email/Password:**
   - Go to Authentication → Sign-in method
   - Enable Email/Password
   - Save changes

**3. Configure Email Templates:**
   - Go to Authentication → Templates
   - Customize verification email
   - Set sender information

**4. Get Configuration:**
   - Go to Project Settings
   - Copy Web API Key and other credentials
   - Add to `.env.local`

### Brevo Setup (For Transactional Emails)

**1. Create Brevo Account:**
   - Go to [Brevo](https://www.brevo.com)
   - Sign up for account
   - Verify email

**2. Get API Key:**
   - Go to Account → SMTP & API
   - Create new API key
   - Copy key

**3. Configure in Application:**
```env
BREVO_API_KEY=your_brevo_api_key_here
```

**4. Configure Email Service:**
```javascript
// src/utils/brevoService.js
const brevo = require('@sendinblue/client');
const apiInstance = new brevo.TransactionalEmailsApi();

apiInstance.apiClient.authentications['apiKey'].apiKey = process.env.BREVO_API_KEY;

const sendEmail = async (to, subject, htmlContent) => {
  const sendSmtpEmail = {
    sender: { email: 'noreply@justjobs.info', name: 'JustJobsInfo' },
    to: [{ email: to }],
    subject: subject,
    htmlContent: htmlContent
  };
  
  return await apiInstance.sendTransacEmail(sendSmtpEmail);
};
```

---

## Testing

### Email Testing Tools

**1. Mail Tester**
- URL: https://www.mail-tester.com/
- Free spam score testing
- Provides detailed feedback

**2. GlockApps**
- URL: https://glockapps.com/
- Inbox placement testing
- Multiple provider testing

**3. 250ok**
- URL: https://250ok.com/
- Deliverability monitoring
- Reputation tracking

**4. Sender Score**
- URL: https://senderscore.org/
- IP reputation checking
- Score: 0-100

### Testing Scenarios

**1. New User Registration:**
```bash
# Test complete flow
1. Register new user
2. Check inbox for verification email
3. Click verification link
4. Verify redirect to login
5. Login successfully
```

**2. Email Verification:**
```bash
# Test verification link
1. Click verification link
2. Verify success message
3. Check email is marked verified
4. Test login works
```

**3. Resend Verification:**
```bash
# Test resend functionality
1. Login with unverified email
2. Redirected to verify page
3. Click "Resend Email"
4. New email received
5. Verify works
```

**4. Spam Folder Check:**
```bash
# Test deliverability
1. Send test emails to:
   - Gmail
   - Outlook
   - Yahoo
   - Custom domains
2. Check spam folder placement
3. Verify authentication scores
```

### Monitoring

**Firebase Analytics:**
1. Enable Firebase Analytics
2. Track email delivery rates
3. Monitor verification success rates
4. Set up alerts for issues

**Custom Monitoring:**
```javascript
// Track verification success
const trackVerificationSuccess = async (email) => {
  await fetch('/api/analytics/email-verification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, status: 'success' })
  });
};
```

---

## Troubleshooting

### Emails Not Sending

**Symptoms:**
- No email received
- Firebase showing sent but not delivered
- Email stuck in queue

**Solutions:**
```bash
# Check Firebase configuration
1. Verify API keys are correct
2. Check Firebase project quota
3. Review email template settings
4. Check Firebase Auth is enabled

# Check email address
1. Verify email format is correct
2. Check domain exists
3. Try different email provider
4. Check spam folder

# Check DNS records
1. Verify SPF record
2. Check DKIM configuration
3. Validate DMARC policy
4. Test with MX Toolbox
```

### Verification Links Not Working

**Symptoms:**
- Link shows error
- "Invalid action code"
- Verification fails

**Solutions:**
```bash
# Check link format
1. Ensure link is complete (not broken across lines)
2. Verify oobCode parameter exists
3. Check link hasn't expired (24 hours)

# Check Firebase configuration
1. Verify action URL is correct
2. Check domain whitelist
3. Test with different browser
4. Clear browser cache

# Request new link
1. Go to /verify-email
2. Click "Resend"
3. Check new email
4. Try new link
```

### Emails Going to Spam

**Symptoms:**
- Emails land in spam folder
- Low deliverability rate
- High bounce rate

**Solutions:**
```bash
# Check authentication
1. Verify SPF record: dig TXT justjobs.info
2. Check DKIM: dig TXT selector._domainkey.justjobs.info
3. Verify DMARC: dig TXT _dmarc.justjobs.info

# Test deliverability
1. Use Mail Tester: https://www.mail-tester.com/
2. Check spam score (should be > 5/10)
3. Review feedback and fix issues

# Improve content
1. Remove spam trigger words
2. Add plain text version
3. Include unsubscribe link
4. Add physical address

# Warm up domain
1. Start with low volume
2. Send to engaged users first
3. Gradually increase volume
4. Monitor bounce/complaint rates
```

### High Bounce Rate

**Symptoms:**
- Many emails bouncing
- Delivery failures
- Invalid address errors

**Solutions:**
```bash
# Validate email addresses
1. Implement email validation
2. Use email verification API
3. Remove invalid addresses
4. Update email list regularly

# Check reputation
1. Monitor sender score
2. Review bounce reports
3. Remove hard bounces immediately
4. Handle soft bounces appropriately

# Clean email list
1. Remove inactive users
2. Validate all addresses
3. Use double opt-in
4. Monitor engagement
```

### Slow Email Delivery

**Symptoms:**
- Emails delayed
- Long delivery times
- Timeout errors

**Solutions:**
```bash
# Check Firebase status
1. Visit Firebase Status Dashboard
2. Check for ongoing issues
3. Review service limits

# Optimize configuration
1. Reduce email size
2. Optimize images
3. Minimize external links
4. Use plain text alternative

# Check network
1. Test internet connection
2. Check for firewall blocks
3. Verify DNS resolution
4. Test with different provider
```

---

## Best Practices

### For Email Verification

**1. User Experience:**
- Clear instructions in verification email
- Prominent verification button/link
- Explain why verification is needed
- Provide support contact

**2. Security:**
- Time-limited verification codes
- One-time use links
- Rate limiting on resend requests
- Secure code generation

**3. Error Handling:**
- Clear error messages
- Retry options
- Alternative verification methods
- Support contact information

### For Email Deliverability

**1. Technical Setup:**
- Configure SPF, DKIM, DMARC
- Use dedicated IP (for high volume)
- Warm up IP/domain properly
- Monitor sender reputation

**2. Content Quality:**
- Professional templates
- Clear subject lines
- Valuable content
- Proper formatting

**3. List Management:**
- Double opt-in
- Regular list cleaning
- Handle bounces promptly
- Respect unsubscribes

---

## Related Documentation

- **Admin Panel**: See [ADMIN-GUIDE.md](./ADMIN-GUIDE.md)
- **Features**: See [FEATURES-GUIDE.md](./FEATURES-GUIDE.md)
- **SEO**: See [SEO-GUIDE.md](./SEO-GUIDE.md)
- **Security**: See [SECURITY-GUIDE.md](./SECURITY-GUIDE.md)

---

**Last Updated**: October 17, 2025  
**Version**: 1.0  
**Status**: ✅ PRODUCTION READY

