export function validateEnv() {
  const requiredEnvVars = [
    'APP_PROJECT_ID',
    'APP_PRIVATE_KEY',
    'APP_CLIENT_EMAIL',
    'APP_DATABASE_URL'
  ];

  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

  if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  }
} 
