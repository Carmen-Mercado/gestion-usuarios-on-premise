import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

if (!process.env.APP_PROJECT_ID || !process.env.APP_PRIVATE_KEY || !process.env.APP_CLIENT_EMAIL || !process.env.APP_DATABASE_URL) {
  throw new Error('Missing required Firebase configuration environment variables');
}

// Initialize Firebase Admin SDK with service account
const serviceAccount = {
  type: 'service_account',
  project_id: process.env.APP_PROJECT_ID,
  private_key: process.env.APP_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.APP_CLIENT_EMAIL
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  databaseURL: process.env.APP_DATABASE_URL
});

// Export database instance
export const db = admin.database();

// Export functions with correct CORS settings
export const functionConfig = {
  cors: true,
  maxInstances: 10,
  timeoutSeconds: 540,
  memory: '256MB' as const,
  minInstances: 0,
  ingressSettings: 'ALLOW_ALL' as const,
  invoker: 'public'
}; 
