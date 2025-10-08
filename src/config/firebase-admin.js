import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
// To use this in production, you need to:
// 1. Go to Firebase Console > Project Settings > Service Accounts
// 2. Click "Generate new private key" to download the service account JSON
// 3. Add the following environment variables to your .env.local:
//    FIREBASE_PROJECT_ID=your-project-id
//    FIREBASE_PRIVATE_KEY_ID=your-private-key-id
//    FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
//    FIREBASE_CLIENT_EMAIL=your-service-account-email
//    FIREBASE_CLIENT_ID=your-client-id
//    FIREBASE_CLIENT_CERT_URL=your-client-cert-url

const apps = getApps();

if (!apps.length) {
  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
  };

  // Only initialize if we have the required credentials
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
    try {
      initializeApp({
        credential: cert(serviceAccount),
        databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
      });
      console.log('✅ Firebase Admin SDK initialized successfully');
    } catch (error) {
      console.error('❌ Firebase Admin SDK initialization error:', error);
    }
  } else {
    console.log('⚠️ Firebase Admin SDK not initialized - missing credentials');
  }
}

const adminDb = getFirestore();

export { adminDb }; 
