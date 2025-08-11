
interface EnvConfig {
  DATABASE_URL: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_UPLOAD_PRESET: string;
  STRIPE_PUBLISHABLE_KEY: string;
  RESEND_API_KEY: string;
  FLOURISH_API_KEY: string;
  FLOURISH_API_URL: string;
  AEROPAY_MERCHANT_ID: string;
  IS_PRODUCTION: boolean;
}

function getEnvVar(key: string, fallback: string = ''): string {
  if (typeof window !== 'undefined') {
    if ((window as any).__ENV && (window as any).__ENV[key]) {
      return (window as any).__ENV[key];
    }
  }
  
  try {
    if (import.meta && import.meta.env && typeof import.meta.env === 'object') {
      const value = (import.meta.env as any)[key];
      if (value !== undefined) return value;
    }
  } catch (e) {
  }
  
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  
  return fallback;
}

export const env: EnvConfig = {
  DATABASE_URL: getEnvVar('VITE_DATABASE_URL', getEnvVar('DATABASE_URL', 'postgresql://neondb_owner:neonpassword@ep-rough-cherry-a5ixqhqr.us-east-1.aws.neon.tech/neondb?sslmode=require')),
  CLOUDINARY_CLOUD_NAME: getEnvVar('VITE_CLOUDINARY_CLOUD_NAME', 'dxvffqjvs'),
  CLOUDINARY_API_KEY: getEnvVar('VITE_CLOUDINARY_API_KEY', ''),
  CLOUDINARY_UPLOAD_PRESET: getEnvVar('VITE_CLOUDINARY_UPLOAD_PRESET', 'risevia_products'),
  STRIPE_PUBLISHABLE_KEY: getEnvVar('VITE_STRIPE_PUBLISHABLE_KEY', 'pk_test_'),
  RESEND_API_KEY: getEnvVar('VITE_RESEND_API_KEY', 're_'),
  FLOURISH_API_KEY: getEnvVar('VITE_FLOURISH_API_KEY', ''),
  FLOURISH_API_URL: getEnvVar('VITE_FLOURISH_API_URL', 'https://flourishsoftware.com/api/v1'),
  AEROPAY_MERCHANT_ID: getEnvVar('VITE_AEROPAY_MERCHANT_ID', 'default'),
  IS_PRODUCTION: getEnvVar('NODE_ENV', 'development') === 'production'
};

export function validateEnv(): void {
  console.log('🔧 Environment configured for development');
  console.log('DATABASE_URL:', env.DATABASE_URL ? 'configured' : 'missing');
  console.log('CLOUDINARY_CLOUD_NAME:', env.CLOUDINARY_CLOUD_NAME);
  
  const required = ['DATABASE_URL'];
  const missing = required.filter(key => !env[key as keyof EnvConfig]);
  
  if (missing.length > 0) {
    console.warn('Missing environment variables:', missing);
  }
}
