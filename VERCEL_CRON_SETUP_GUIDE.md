# 🕐 Complete Vercel Cron Setup Guide

## 📋 **Step-by-Step Instructions**

### **Step 1: Verify Your Files Are Ready** ✅

Make sure these files exist in your project:
- ✅ `vercel.json` (cron configuration)
- ✅ `src/app/api/cron/prewarm-cache/route.js` (cron endpoint)
- ✅ `src/utils/jobCacheManager.js` (cache management)
- ✅ Environment variables in `.env.local`

### **Step 2: Deploy to Vercel**

1. **Push your changes to Git:**
   ```bash
   git add .
   git commit -m "Add Vercel cron job for cache prewarming"
   git push origin main
   ```

2. **Deploy to Vercel:**
   - If using Vercel CLI: `vercel --prod`
   - If using Git integration: Push to your connected branch

### **Step 3: Configure Environment Variables in Vercel**

1. **Go to Vercel Dashboard:**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Select your project

2. **Navigate to Settings:**
   - Click on your project
   - Go to "Settings" tab
   - Click "Environment Variables"

3. **Add/Verify These Variables:**
   ```
   JSEARCH_API_KEY=your_jsearch_api_key
   JSEARCH_MONTHLY_LIMIT=100
   CRON_SECRET=E4VdNX$Xvxr7Av6m
   MONGODB_URI=your_mongodb_uri
   ```

4. **Important:** Make sure to set these for **Production** environment

### **Step 4: Verify Cron Job Configuration**

1. **Check `vercel.json` exists in your project root:**
   ```json
   {
     "crons": [
       {
         "path": "/api/cron/prewarm-cache",
         "schedule": "0 */12 * * *"
       }
     ]
   }
   ```

2. **Schedule Explanation:**
   - `0 */12 * * *` = Every 12 hours at minute 0
   - Runs at: 00:00, 12:00 (UTC time)
   - If you want different times, adjust the schedule

### **Step 5: Test the Cron Endpoint**

1. **Manual Test:**
   ```bash
   curl -X GET "https://your-domain.vercel.app/api/cron/prewarm-cache"
   ```

2. **Expected Response:**
   ```json
   {
     "success": true,
     "message": "Cache prewarming completed",
     "cached": 10,
     "searches": [...],
     "timestamp": "2024-01-15T12:00:00.000Z"
   }
   ```

### **Step 6: Monitor Cron Jobs in Vercel**

1. **Go to Vercel Dashboard:**
   - Select your project
   - Go to "Functions" tab
   - Look for cron job executions

2. **Check Logs:**
   - Click on function executions
   - View logs for any errors

### **Step 7: Verify It's Working**

1. **Check Admin Dashboard:**
   - Go to `/admin` (as super admin)
   - Look at "API Usage Monitoring" section
   - Should show cache status and last prewarm time

2. **Check MongoDB:**
   - Look at `api_cache` collection
   - Should see cached job data

## 🔧 **Troubleshooting**

### **Common Issues:**

#### **1. Cron Job Not Running**
- **Check:** Vercel project is on Pro plan (cron jobs require Pro)
- **Check:** `vercel.json` is in project root
- **Check:** Environment variables are set in Vercel dashboard

#### **2. 401 Unauthorized Error**
- **Check:** `CRON_SECRET` is set in Vercel environment variables
- **Check:** The endpoint is accessible from Vercel cron

#### **3. API Calls Failing**
- **Check:** `JSEARCH_API_KEY` is valid and has remaining quota
- **Check:** `MONGODB_URI` is correct and accessible

#### **4. Cache Not Updating**
- **Check:** MongoDB connection is working
- **Check:** `api_cache` collection exists
- **Check:** Cron job is actually running (check Vercel logs)

### **Debug Steps:**

1. **Check Vercel Function Logs:**
   ```bash
   vercel logs --follow
   ```

2. **Test Endpoint Manually:**
   ```bash
   curl -X POST "https://your-domain.vercel.app/api/cron/prewarm-cache" \
     -H "Content-Type: application/json" \
     -d '{"force": true}'
   ```

3. **Check API Stats:**
   ```bash
   curl -X GET "https://your-domain.vercel.app/api/jobs/cache-stats"
   ```

## 📊 **Monitoring Your Cron Job**

### **Vercel Dashboard:**
- Go to your project → Functions tab
- Look for `/api/cron/prewarm-cache` executions
- Check execution times and durations

### **Admin Dashboard:**
- Visit `/admin` as super admin
- Check "API Usage Monitoring" section
- Monitor cache status and API usage

### **MongoDB:**
- Check `api_cache` collection for cached data
- Look at `api_usage` collection for usage tracking

## 🎯 **Expected Results**

After setup, you should see:

1. **Automatic Cache Prewarming:**
   - Runs every 12 hours (00:00 and 12:00 UTC)
   - Caches 10 popular job searches
   - Only runs if API budget allows (< 80% usage)

2. **Reduced API Calls:**
   - From 1000+ calls/month to <100 calls/month
   - 99% reduction in external API usage

3. **Better Performance:**
   - Faster job search responses
   - Cached data served instantly

4. **Budget Protection:**
   - Never exceeds monthly API limit
   - Graceful fallback to stale cache

## 🔄 **Schedule Options**

If you want to change the schedule, modify `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/prewarm-cache",
      "schedule": "0 */6 * * *"    // Every 6 hours
    }
  ]
}
```

**Common Schedules:**
- `0 */6 * * *` - Every 6 hours
- `0 */12 * * *` - Every 12 hours (current)
- `0 0 * * *` - Daily at midnight
- `0 0 */2 * *` - Every 2 days at midnight

## ✅ **Success Checklist**

- [ ] `vercel.json` created and deployed
- [ ] Cron endpoint accessible
- [ ] Environment variables set in Vercel
- [ ] Manual test successful
- [ ] Cron job appears in Vercel Functions
- [ ] Admin dashboard shows API monitoring
- [ ] Cache data appears in MongoDB
- [ ] Job searches work faster

## 🆘 **Need Help?**

If you encounter issues:

1. **Check Vercel Status:** [status.vercel.com](https://status.vercel.com)
2. **Vercel Documentation:** [vercel.com/docs/cron-jobs](https://vercel.com/docs/cron-jobs)
3. **Check Function Logs:** Use `vercel logs` command
4. **Test Endpoints:** Use curl to test manually

Your cron job should now run automatically every 12 hours, keeping your job cache fresh while staying within API limits!
