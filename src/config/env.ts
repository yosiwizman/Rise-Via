
interface EnvConfig {
  DATABASE_URL: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_UPLOAD_PRESET: string;
  STRIPE_PUBLISHABLE_KEY: string;
  RESEND_API_KEY: string;
  IS_PRODUCTION: boolean;
}

function getEnvVar(key: string, fallback: string = ''): string {
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).__ENV && (window as any).__ENV[key]) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (window as any).__ENV[key];
    }
  }
  
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (import.meta && (import.meta as any).env && (import.meta as any).env[key]) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (import.meta as any).env[key];
    }
  } catch {
    return fallback;
  }
  
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  
  return fallback;
}

export const env: EnvConfig = {
  DATABASE_URL: getEnvVar('VITE_DATABASE_URL', getEnvVar('DATABASE_URL', '')),
  CLOUDINARY_CLOUD_NAME: getEnvVar('VITE_CLOUDINARY_CLOUD_NAME', 'dxvffqjvs'),
  CLOUDINARY_API_KEY: getEnvVar('VITE_CLOUDINARY_API_KEY', ''),
  CLOUDINARY_UPLOAD_PRESET: getEnvVar('VITE_CLOUDINARY_UPLOAD_PRESET', 'risevia_products'),
  STRIPE_PUBLISHABLE_KEY: getEnvVar('VITE_STRIPE_PUBLISHABLE_KEY', 'pk_test_'),
  RESEND_API_KEY: getEnvVar('VITE_RESEND_API_KEY', ''),
  IS_PRODUCTION: getEnvVar('NODE_ENV', 'development') === 'production'
};

export function validateEnv(): void {
  const required = ['DATABASE_URL'];
  const missing = required.filter(key => !env[key as keyof EnvConfig]);
  
  if (missing.length > 0 && env.IS_PRODUCTION) {
    console.warn('Missing environment variables:', missing);
  }
}
