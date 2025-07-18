# Security & Spam Protection Setup Guide

This guide will help you configure comprehensive spam protection for your registration system, including Google reCAPTCHA, email validation, rate limiting, and more.

## 🔒 Security Features Implemented

- **Google reCAPTCHA v2** - Bot detection and verification
- **Advanced Email Validation** - Blocks temporary/suspicious email domains
- **Rate Limiting** - Prevents registration flooding from single IPs
- **Honeypot Fields** - Hidden fields to catch automated submissions
- **Enhanced Password Validation** - Strength requirements and pattern detection
- **Name Validation** - Detects fake/generated names
- **Multiple Validation Layers** - Client-side and server-side validation

## 🚀 Quick Setup

### 1. Configure Google reCAPTCHA

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Click "Create" to register a new site
3. Fill in the details:
   - **Label**: Your site name (e.g., "JobsFair Registration")
   - **reCAPTCHA type**: Select "reCAPTCHA v2" > "I'm not a robot" Checkbox
   - **Domains**: Add your domain(s):
     - `localhost` (for development)
     - `yourdomain.com` (for production)
     - `www.yourdomain.com`
4. Accept the terms and click "Submit"
5. Copy your **Site Key** and **Secret Key**

### 2. Update Environment Variables

Update your `.env.local` file with the reCAPTCHA keys:

```env
# Google reCAPTCHA Configuration
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key_here
RECAPTCHA_SECRET_KEY=your_secret_key_here
```

**Important**: 
- The `NEXT_PUBLIC_` prefix makes the site key available to the client
- The secret key should NOT have the `NEXT_PUBLIC_` prefix (server-only)
- Never commit real keys to version control

### 3. Configure Anti-Spam Settings

You can customize the anti-spam settings in `.env.local`:

```env
# Anti-Spam Configuration
REGISTRATION_RATE_LIMIT_PER_IP=5              # Max registrations per IP
REGISTRATION_RATE_LIMIT_WINDOW_MINUTES=60     # Time window in minutes
BLOCKED_EMAIL_DOMAINS=1.com,temp-mail.org,10minutemail.com,mailinator.com,guerrillamail.com
HONEYPOT_FIELD_NAME=website_url               # Name of the honeypot field
```

## 📋 Environment Variables Reference

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Google reCAPTCHA site key (public) | Required |
| `RECAPTCHA_SECRET_KEY` | Google reCAPTCHA secret key (private) | Required |
| `REGISTRATION_RATE_LIMIT_PER_IP` | Max registration attempts per IP | 5 |
| `REGISTRATION_RATE_LIMIT_WINDOW_MINUTES` | Rate limit time window | 60 |
| `BLOCKED_EMAIL_DOMAINS` | Comma-separated list of blocked domains | See defaults |
| `HONEYPOT_FIELD_NAME` | Name of the hidden honeypot field | website_url |

## 🛡️ Security Features Details

### Email Validation
- **Format validation**: Proper email structure
- **Domain blocking**: Temporary email services (10minutemail, mailinator, etc.)
- **Pattern detection**: Suspicious usernames (test123, user1234, etc.)
- **Auto-generated detection**: Too many numbers in username

### Password Security
- **Minimum length**: 8 characters
- **Complexity requirements**: At least 3 of: uppercase, lowercase, numbers, special chars
- **Common pattern blocking**: No "password", "123", "abc", etc.

### Name Validation
- **Real name patterns**: Must have proper capitalization
- **Fake name detection**: Blocks "test", "fake", "admin", etc.
- **Bot detection**: Catches repeated characters, all caps/lowercase

### Rate Limiting
- **Per-IP limits**: Configurable attempts per time window
- **Automatic reset**: Counters reset after time window expires
- **Graceful handling**: Clear error messages with retry times

### Honeypot Protection
- **Hidden fields**: Invisible to humans, filled by bots
- **Multiple techniques**: CSS hiding, off-screen positioning
- **Instant detection**: Any filled honeypot = spam

## 🧪 Testing the System

### Test Valid Registration
1. Fill out the form with valid data
2. Complete reCAPTCHA
3. Should register successfully

### Test Spam Protection
1. **Email blocking**: Try `test@1.com` - should be rejected
2. **Rate limiting**: Make 6+ rapid attempts from same IP
3. **Weak passwords**: Try "password123" - should be rejected
4. **Fake names**: Try "test test" or "JOHN DOE" - should be rejected

### Test reCAPTCHA
1. **Missing verification**: Submit without completing reCAPTCHA
2. **Expired token**: Wait 2+ minutes after verification, then submit
3. **Failed verification**: Network issues should show appropriate errors

## 🔧 Customization Options

### Adding More Blocked Domains
Update the `BLOCKED_EMAIL_DOMAINS` environment variable:
```env
BLOCKED_EMAIL_DOMAINS=1.com,temp-mail.org,10minutemail.com,youradditionaldomain.com
```

### Adjusting Rate Limits
For stricter protection:
```env
REGISTRATION_RATE_LIMIT_PER_IP=3              # Fewer attempts
REGISTRATION_RATE_LIMIT_WINDOW_MINUTES=120    # Longer wait time
```

### Custom Validation Rules
Edit `src/utils/spamProtection.js` to add custom validation patterns:
```javascript
// Add to suspiciousPatterns array
const suspiciousPatterns = [
    /\d{4,}\.com$/,
    /^[a-z]\.com$/,
    /your-custom-pattern/i,  // Your addition
];
```

## 🚨 Production Considerations

### 1. Rate Limiting Storage
The current implementation uses in-memory storage for rate limiting. For production:
- Consider using Redis for distributed rate limiting
- Implement database-backed rate limiting for persistence
- Add IP whitelisting for trusted sources

### 2. Monitoring & Logging
- Log all blocked registration attempts
- Monitor reCAPTCHA success/failure rates
- Track common spam patterns for pattern updates

### 3. Performance
- reCAPTCHA adds ~200-500ms to form submission
- Consider implementing reCAPTCHA v3 for invisible verification
- Cache validation results where appropriate

### 4. Compliance
- Ensure reCAPTCHA usage complies with GDPR/privacy laws
- Add reCAPTCHA privacy notice to your privacy policy
- Consider cookie consent for reCAPTCHA

## 🐛 Troubleshooting

### reCAPTCHA Not Loading
- Check that `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is set correctly
- Verify domain is registered in reCAPTCHA admin console
- Check browser console for JavaScript errors

### Rate Limiting Too Aggressive
- Increase `REGISTRATION_RATE_LIMIT_PER_IP` value
- Decrease `REGISTRATION_RATE_LIMIT_WINDOW_MINUTES` value
- Clear rate limiting storage (restart server for in-memory)

### Valid Emails Being Blocked
- Review `BLOCKED_EMAIL_DOMAINS` list
- Check email validation patterns in `spamProtection.js`
- Test with various email formats

### False Positives on Names
- Review name validation patterns
- Consider making validation less strict
- Add whitelist for known valid patterns

## 📞 Support

For issues with this security implementation:
1. Check the browser console for JavaScript errors
2. Review server logs for API errors
3. Test with different browsers/devices
4. Verify all environment variables are set correctly

Remember: Security is a balance between protection and user experience. Monitor registration success rates and adjust settings as needed. 