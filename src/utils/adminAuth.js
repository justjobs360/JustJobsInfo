import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      })
    });
  } catch (e) {
    // ignore double init
  }
}

export async function requireAdmin(request) {
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { ok: false, status: 401, error: 'Missing Authorization header' };
  }
  const idToken = authHeader.slice('Bearer '.length);
  try {
    const decoded = await admin.auth().verifyIdToken(idToken, true);
    const userDoc = await admin.firestore().collection('users').doc(decoded.uid).get();
    if (!userDoc.exists) {
      return { ok: false, status: 404, error: 'User not found' };
    }
    const data = userDoc.data();
    const isAdmin = data.role === 'admin' || data.role === 'super_admin';
    if (!isAdmin) {
      return { ok: false, status: 403, error: 'Admin privileges required' };
    }
    return { ok: true, uid: decoded.uid, role: data.role, permissions: data.permissions || [] };
  } catch (e) {
    return { ok: false, status: 401, error: 'Invalid token' };
  }
}
