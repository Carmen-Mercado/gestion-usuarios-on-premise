import * as functions from 'firebase-functions';

export const config = {
  firebase: {
    projectId: process.env.APP_PROJECT_ID || functions.config().app?.project_id,
    privateKey: process.env.APP_PRIVATE_KEY?.replace(/\\n/g, '\n') || functions.config().app?.private_key,
    clientEmail: process.env.APP_CLIENT_EMAIL || functions.config().app?.client_email,
    databaseUrl: process.env.APP_DATABASE_URL || functions.config().app?.database_url,
  },
  api: {
    prefix: process.env.API_PREFIX || '/api/v1',
  },
  environment: process.env.NODE_ENV || 'development',
}; 
