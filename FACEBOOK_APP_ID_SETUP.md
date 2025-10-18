# Facebook App ID Setup Guide

## What is fb:app_id?

The `fb:app_id` meta tag links your website to a Facebook App, allowing you to:
- Track sharing analytics via Facebook Insights
- Moderate comments if you use Facebook Comments plugin
- Access Facebook's debugging tools with more detail
- Ensure proper attribution of content shared from your site

## How to Get Your Facebook App ID

### Step 1: Create a Facebook App

1. Go to [Facebook for Developers](https://developers.facebook.com/)
2. Click **"My Apps"** in the top right
3. Click **"Create App"**
4. Select **"Business"** as the app type
5. Fill in the details:
   - **App Name**: JustJobsInfo (or your preferred name)
   - **App Contact Email**: Your business email
   - **Business Account**: Select or create one
6. Click **"Create App"**

### Step 2: Get Your App ID

1. Once the app is created, you'll see the **Dashboard**
2. At the top of the page, you'll see **"App ID"** - this is a numeric value
3. Copy this App ID (e.g., `1234567890123456`)

### Step 3: Configure Your App

1. In the left sidebar, click **"Settings"** → **"Basic"**
2. Add your website domain:
   - **App Domains**: `justjobs.info`
   - **Site URL**: `https://justjobs.info/`
3. Add your **Privacy Policy URL**: `https://justjobs.info/privacy-policy`
4. Add your **Terms of Service URL**: `https://justjobs.info/terms-of-use`
5. Click **"Save Changes"**

### Step 4: Make Your App Live

1. In the top right, you'll see a toggle that says **"In Development"**
2. Switch it to **"Live"** (you may need to complete additional verification)
3. For basic sharing, you can keep it in Development mode initially

## Adding the App ID to Your Website

### Option 1: Environment Variable (Recommended)

1. Create or edit your `.env.local` file in the project root:
   ```bash
   NEXT_PUBLIC_FACEBOOK_APP_ID=1234567890123456
   ```

2. Replace `1234567890123456` with your actual Facebook App ID

3. Restart your development server:
   ```bash
   npm run dev
   ```

### Option 2: Direct Replacement

If you don't want to use environment variables, you can directly edit the `src/app/layout.js` file:

```javascript
other: {
  'fb:app_id': '1234567890123456',  // Replace with your actual App ID
},
```

## Verifying the Setup

1. After deploying your changes, go to [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
2. Enter your URL: `https://justjobs.info/`
3. Click **"Debug"** or **"Scrape Again"**
4. The warning about missing `fb:app_id` should now be gone
5. You should see your App ID listed in the meta tags

## Production Deployment

For Vercel deployment:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name**: `NEXT_PUBLIC_FACEBOOK_APP_ID`
   - **Value**: Your Facebook App ID
   - **Environments**: Production, Preview, Development
4. Click **"Save"**
5. Redeploy your application

## Troubleshooting

### App ID Not Showing Up

- Make sure you've restarted your development server after adding the environment variable
- Check that the environment variable name starts with `NEXT_PUBLIC_` (required for client-side access in Next.js)
- Verify the App ID is correctly copied (it should be a numeric value)

### Facebook Debugger Still Shows Warning

- Clear the cache by clicking **"Scrape Again"** on the Facebook Debugger
- Wait a few minutes for Facebook to update its cache
- Verify the meta tag appears in your page source (View Page Source and search for `fb:app_id`)

### App is in Development Mode

This is fine for testing. To make it live:
1. Complete the Facebook App Review process (if required)
2. Add a Privacy Policy and Terms of Service
3. Verify your business information
4. Toggle the app to "Live" mode

## Benefits of Adding Facebook App ID

✅ **Analytics**: Track how content from your site is shared on Facebook  
✅ **Insights**: See engagement metrics for your shared links  
✅ **Moderation**: If using Facebook Comments, manage comments effectively  
✅ **Debugging**: Better error messages in Facebook's debugging tools  
✅ **Verification**: Shows Facebook you're a legitimate business  

## Note

The Facebook App ID is **optional** for basic sharing functionality. Your Open Graph tags will still work without it, but Facebook recommends adding it for better insights and control over how your content appears on their platform.

## Support

If you need help:
- [Facebook for Developers Documentation](https://developers.facebook.com/docs/)
- [Facebook Support](https://developers.facebook.com/support/)
- [Open Graph Protocol](https://ogp.me/)

