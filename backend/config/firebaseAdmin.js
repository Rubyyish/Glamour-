const admin = require('firebase-admin');

let db, auth, storage;
let firebaseInitialized = false;

// To use Firebase Admin, you need to provide a service account.
// You can either provide a path to a service account JSON file
// or provide the individual fields via environment variables.
// Firebase is optional for MongoDB-based systems.

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_PATH 
  ? require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
  : {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

// Only initialize Firebase if service account is properly configured
if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
  if (!admin.apps.length) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.projectId}.firebasestorage.app`
      });
      db = admin.firestore();
      auth = admin.auth();
      storage = admin.storage();
      firebaseInitialized = true;
      console.log('✓ Firebase Admin initialized successfully');
    } catch (error) {
      console.warn('⚠ Firebase initialization failed, using MongoDB only:', error.message);
      firebaseInitialized = false;
    }
  }
} else {
  console.log('ℹ Firebase service account not configured, using MongoDB only');
  firebaseInitialized = false;
}

module.exports = { admin, db, auth, storage, firebaseInitialized };
