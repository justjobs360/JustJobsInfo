class BrevoService {
  constructor() {
    this.apiKey = process.env.BREVO_API_KEY;
    this.fromEmail = process.env.JOB_ALERTS_FROM_EMAIL || 'noreply@justjobsinfo.com';
    this.fromName = process.env.JOB_ALERTS_FROM_NAME || 'JustJobsInfo';
    this.appUrl = process.env.APP_URL || 'http://localhost:3000';
    
    if (!this.apiKey) {
      throw new Error('BREVO_API_KEY is required');
    }
  }

  /**
   * Send job alert email to a user
   * @param {Object} params - Email parameters
   * @param {string} params.toEmail - Recipient email
   * @param {string} params.toName - Recipient name
   * @param {Array} params.jobs - Array of job objects
   * @param {string} params.keywords - User's search keywords
   * @param {string} params.locations - User's preferred locations
   * @param {string} params.unsubscribeToken - Unsubscribe token
   */
  async sendJobAlert({ toEmail, toName, jobs, keywords, locations, unsubscribeToken }) {
    try {
      if (!jobs || jobs.length === 0) {
        return { success: false, message: 'No jobs to send' };
      }

      const unsubscribeUrl = `${this.appUrl}/api/job-alerts/unsubscribe?token=${unsubscribeToken}`;
      const managePrefsUrl = `${this.appUrl}/job-alerts`;

      const htmlContent = this.generateJobAlertHTML({
        toName,
        jobs,
        keywords,
        locations,
        unsubscribeUrl,
        managePrefsUrl
      });

      const textContent = this.generateJobAlertText({
        toName,
        jobs,
        keywords,
        locations,
        unsubscribeUrl,
        managePrefsUrl
      });

      const emailData = {
        sender: {
          name: this.fromName,
          email: this.fromEmail
        },
        to: [
          {
            email: toEmail,
            name: toName
          }
        ],
        subject: `New Job Alerts - ${jobs.length} matching position${jobs.length > 1 ? 's' : ''} found`,
        htmlContent: htmlContent,
        textContent: textContent,
        replyTo: {
          email: this.fromEmail,
          name: this.fromName
        }
      };

      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      });

      const result = await response.json();
      
      if (response.ok) {
        return { success: true, messageId: result.messageId };
      } else {
        console.error('Failed to send job alert:', result);
        return { success: false, error: result.message || 'Failed to send email' };
      }
    } catch (error) {
      console.error('Error sending job alert:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate HTML content for job alert email
   */
  generateJobAlertHTML({ toName, jobs, keywords, locations, unsubscribeUrl, managePrefsUrl }) {
    const jobCards = jobs.map(job => `
      <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 16px; background: #ffffff;">
        <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 18px;">
          <a href="${job.url || '#'}" style="color: #2563eb; text-decoration: none;">${job.title}</a>
        </h3>
        <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px; font-weight: 600;">${job.company}</p>
        <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">📍 ${job.location}</p>
        <div style="margin: 0 0 12px 0;">
          <span style="background: #f3f4f6; color: #374151; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-right: 8px;">${job.employment_type || 'Full-time'}</span>
          ${job.is_remote ? '<span style="background: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Remote</span>' : ''}
        </div>
        <p style="margin: 0 0 12px 0; color: #4b5563; font-size: 14px; line-height: 1.5;">${job.description ? job.description.substring(0, 200) + '...' : 'No description available.'}</p>
        <a href="${job.url || '#'}" style="background: #2563eb; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600; display: inline-block;">View Job</a>
      </div>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Job Alerts</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff;">
          <!-- Header -->
          <div style="background: #2563eb; color: white; padding: 24px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">JustJobsInfo</h1>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">Job Alerts</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 24px;">
            <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 20px;">Hi ${toName}!</h2>
            <p style="margin: 0 0 16px 0; color: #4b5563; line-height: 1.6;">
              We found <strong>${jobs.length} new job${jobs.length > 1 ? 's' : ''}</strong> that match your preferences:
            </p>
            
            ${keywords ? `<p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;"><strong>Keywords:</strong> ${keywords}</p>` : ''}
            ${locations ? `<p style="margin: 0 0 16px 0; color: #6b7280; font-size: 14px;"><strong>Locations:</strong> ${locations}</p>` : ''}
            
            <!-- Job Cards -->
            ${jobCards}
            
            <!-- Footer -->
            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 14px;">
                <a href="${managePrefsUrl}" style="color: #2563eb; text-decoration: none;">Manage your job alert preferences</a>
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                <a href="${unsubscribeUrl}" style="color: #9ca3af; text-decoration: none;">Unsubscribe from job alerts</a>
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate text content for job alert email
   */
  generateJobAlertText({ toName, jobs, keywords, locations, unsubscribeUrl, managePrefsUrl }) {
    const jobList = jobs.map((job, index) => `
${index + 1}. ${job.title}
   Company: ${job.company}
   Location: ${job.location}
   Type: ${job.employment_type || 'Full-time'}${job.is_remote ? ' (Remote)' : ''}
   URL: ${job.url || 'N/A'}
   ${job.description ? `Description: ${job.description.substring(0, 150)}...` : ''}
`).join('\n');

    return `
Hi ${toName}!

We found ${jobs.length} new job${jobs.length > 1 ? 's' : ''} that match your preferences:

${keywords ? `Keywords: ${keywords}` : ''}
${locations ? `Locations: ${locations}` : ''}

${jobList}

Manage your job alert preferences: ${managePrefsUrl}

Unsubscribe from job alerts: ${unsubscribeUrl}

Best regards,
JustJobsInfo Team
    `.trim();
  }

  /**
   * Send contact form notification email to admin addresses
   * @param {Object} params - Contact form data
   * @param {string} params.first_name - First name
   * @param {string} params.last_name - Last name
   * @param {string} params.email - Email address
   * @param {string} params.phone - Phone number
   * @param {string} params.message - Message content
   * @param {string} params.formType - Type of form (contact, consultation, etc.)
   */
  async sendContactFormNotification({ first_name, last_name, email, phone, message, formType = 'contact' }) {
    try {
      const adminEmails = ['annedithb@gmail.com', 'hello@justjobs.info'];
      const fullName = `${first_name} ${last_name}`;
      const formTypeLabel = formType === 'consultation' ? 'Free Consultation' : 'Contact Form';

      const htmlContent = this.generateContactFormHTML({
        fullName,
        email,
        phone,
        message,
        formType: formTypeLabel
      });

      const textContent = this.generateContactFormText({
        fullName,
        email,
        phone,
        message,
        formType: formTypeLabel
      });

      const emailData = {
        sender: {
          name: this.fromName,
          email: this.fromEmail
        },
        to: adminEmails.map(email => ({
          email: email,
          name: 'JustJobsInfo Admin'
        })),
        subject: `New ${formTypeLabel} Submission from ${fullName}`,
        htmlContent: htmlContent,
        textContent: textContent,
        replyTo: {
          email: email,
          name: fullName
        }
      };

      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      });

      const result = await response.json();
      
      if (response.ok) {
        return { success: true, messageId: result.messageId };
      } else {
        console.error('Failed to send contact form notification:', result);
        return { success: false, error: result.message || 'Failed to send email' };
      }
    } catch (error) {
      console.error('Error sending contact form notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate HTML content for contact form notification email
   */
  generateContactFormHTML({ fullName, email, phone, message, formType }) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New ${formType} Submission</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff;">
          <!-- Header -->
          <div style="background: #2563eb; color: white; padding: 24px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">JustJobsInfo</h1>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">New ${formType} Submission</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 24px;">
            <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 20px;">New ${formType} Submission</h2>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px;">Contact Details</h3>
              <p style="margin: 0 0 8px 0; color: #4b5563; font-size: 14px;"><strong>Name:</strong> ${fullName}</p>
              <p style="margin: 0 0 8px 0; color: #4b5563; font-size: 14px;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a></p>
              ${phone ? `<p style="margin: 0 0 8px 0; color: #4b5563; font-size: 14px;"><strong>Phone:</strong> <a href="tel:${phone}" style="color: #2563eb; text-decoration: none;">${phone}</a></p>` : ''}
            </div>

            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
              <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px;">Message</h3>
              <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
            </div>

            <!-- Footer -->
            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                This notification was sent automatically from the JustJobsInfo website.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate text content for contact form notification email
   */
  generateContactFormText({ fullName, email, phone, message, formType }) {
    return `
New ${formType} Submission

Contact Details:
Name: ${fullName}
Email: ${email}
${phone ? `Phone: ${phone}` : ''}

Message:
${message}

---
This notification was sent automatically from the JustJobsInfo website.
    `.trim();
  }

  /**
   * Test email sending functionality
   */
  async sendTestEmail(toEmail, toName = 'Test User') {
    const testJobs = [
      {
        title: 'Senior Software Engineer',
        company: 'Tech Corp',
        location: 'San Francisco, CA',
        employment_type: 'Full-time',
        is_remote: true,
        url: 'https://example.com/job/1',
        description: 'We are looking for a senior software engineer to join our team...'
      },
      {
        title: 'Product Manager',
        company: 'StartupXYZ',
        location: 'New York, NY',
        employment_type: 'Full-time',
        is_remote: false,
        url: 'https://example.com/job/2',
        description: 'Join our product team to help shape the future of our platform...'
      }
    ];

    return await this.sendJobAlert({
      toEmail,
      toName,
      jobs: testJobs,
      keywords: 'software engineer, product manager',
      locations: 'San Francisco, New York',
      unsubscribeToken: 'test-token'
    });
  }
}

export default BrevoService;
