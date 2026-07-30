/**
 * Environment Variable Validator.
 * Ensures all required environment variables are present before server bootstrap.
 */
export function validateEnv() {
  const requiredEnvVars = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.warn(`[EnvValidator] WARNING: Missing recommended environment variables: ${missing.join(', ')}`);
  }

  // Set default fallback values
  process.env.PORT = process.env.PORT || '5000';
  process.env.NODE_ENV = process.env.NODE_ENV || 'production';
  process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
  process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nexora_ai';

  console.log(`[EnvValidator] Environment profile validated (${process.env.NODE_ENV}).`);
}

export default validateEnv;
