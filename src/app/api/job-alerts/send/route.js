import { NextResponse } from 'next/server';
import JobAlertService from '@/utils/jobAlertService';
import JobMatchingService from '@/utils/jobMatchingService';
import { fetchCombinedJobsForSubscriber } from '@/utils/jobAlertsFetcher';
import BrevoService from '@/utils/brevoService';

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      testMode = false, 
      testEmail = null,
      maxUsers = 50,
      dryRun = false 
    } = body;

    console.log('Starting job alert sending process...', { testMode, testEmail, maxUsers, dryRun });

    const jobAlertService = new JobAlertService();
    const jobMatchingService = new JobMatchingService();
    const brevoService = new BrevoService();

    let results = {
      totalUsers: 0,
      emailsSent: 0,
      errors: [],
      skipped: []
    };

    try {
      // Get active subscribers
      const subscribersResult = await jobAlertService.getActiveSubscribers();
      
      if (!subscribersResult.success) {
        throw new Error(`Failed to get subscribers: ${subscribersResult.error}`);
      }

      let subscribers = subscribersResult.subscribers;
      
      // Filter for test mode
      if (testMode && testEmail) {
        subscribers = subscribers.filter(sub => sub.email === testEmail);
        if (subscribers.length === 0) {
          return NextResponse.json({
            success: false,
            error: `Test email ${testEmail} not found in subscribers`
          }, { status: 404 });
        }
      }

      // Limit number of users for processing
      if (maxUsers && subscribers.length > maxUsers) {
        subscribers = subscribers.slice(0, maxUsers);
      }

      results.totalUsers = subscribers.length;
      console.log(`Processing ${results.totalUsers} subscribers...`);

      // Process each subscriber
      for (const subscriber of subscribers) {
        try {
          console.log(`Processing subscriber: ${subscriber.email}`);

          // Skip if user has frequency restrictions
          if (subscriber.frequency === 'daily' || subscriber.frequency === 'weekly') {
            const lastSent = subscriber.lastSentAt;
            const now = new Date();
            
            if (lastSent) {
              const hoursSinceLastSent = (now - new Date(lastSent)) / (1000 * 60 * 60);
              
              if (subscriber.frequency === 'daily' && hoursSinceLastSent < 24) {
                results.skipped.push({
                  email: subscriber.email,
                  reason: 'Daily frequency limit not reached'
                });
                continue;
              }
              
              if (subscriber.frequency === 'weekly' && hoursSinceLastSent < 168) { // 7 days
                results.skipped.push({
                  email: subscriber.email,
                  reason: 'Weekly frequency limit not reached'
                });
                continue;
              }
            }
          }

          // Fetch combined jobs (admin + external via cached search)
          const matchingJobs = await fetchCombinedJobsForSubscriber(request.nextUrl.origin, subscriber, 20);

          // Skip if no matching jobs found
          if (matchingJobs.length === 0) {
            results.skipped.push({
              email: subscriber.email,
              reason: 'No matching jobs found'
            });
            continue;
          }

          // Skip if user already received these jobs recently
          if (subscriber.lastSentAt) {
            const recentJobs = matchingJobs.filter(job => 
              new Date(job.posted_at) <= new Date(subscriber.lastSentAt)
            );
            
            if (recentJobs.length === matchingJobs.length) {
              results.skipped.push({
                email: subscriber.email,
                reason: 'No new jobs since last alert'
              });
              continue;
            }
          }

          if (dryRun) {
            console.log(`[DRY RUN] Would send ${matchingJobs.length} jobs to ${subscriber.email}`);
            results.emailsSent++;
            continue;
          }

          // Send email via Brevo
          const emailResult = await brevoService.sendJobAlert({
            toEmail: subscriber.email,
            toName: subscriber.name,
            jobs: matchingJobs,
            keywords: subscriber.keywords.join(', '),
            locations: subscriber.locations.join(', '),
            unsubscribeToken: subscriber.unsubscribeToken
          });

          if (emailResult.success) {
            // Update last sent timestamp
            await jobAlertService.updateLastSent(subscriber.email, matchingJobs.length);
            
            results.emailsSent++;
            console.log(`Successfully sent alert to ${subscriber.email} with ${matchingJobs.length} jobs`);
          } else {
            results.errors.push({
              email: subscriber.email,
              error: `Failed to send email: ${emailResult.error}`
            });
          }

          // Add small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
          console.error(`Error processing subscriber ${subscriber.email}:`, error);
          results.errors.push({
            email: subscriber.email,
            error: error.message
          });
        }
      }

      console.log('Job alert sending process completed:', results);

      return NextResponse.json({
        success: true,
        message: `Job alerts processed successfully`,
        results
      });

    } finally {
      // Clean up connections
      await jobAlertService.disconnect();
      await jobMatchingService.disconnect();
    }

  } catch (error) {
    console.error('Error in job alerts send API:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint for manual triggering (admin use)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const testEmail = searchParams.get('testEmail');
    const dryRun = searchParams.get('dryRun') === 'true';

    if (testEmail) {
      // Test mode - send to specific email
      const result = await fetch(`${request.nextUrl.origin}/api/job-alerts/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testMode: true,
          testEmail,
          dryRun
        })
      });

      const data = await result.json();
      return NextResponse.json(data);
    } else {
      // Regular mode - send to all subscribers
      const result = await fetch(`${request.nextUrl.origin}/api/job-alerts/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testMode: false,
          dryRun
        })
      });

      const data = await result.json();
      return NextResponse.json(data);
    }

  } catch (error) {
    console.error('Error in job alerts send GET API:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
