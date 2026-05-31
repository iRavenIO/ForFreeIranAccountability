/**
 * Application configuration loader.
 * Reads environment variables with validation and defaults.
 */

export interface AppConfig {
  databasePath: string;
  internalAdminToken: string;
  siteUrl: string;
  nodeEnv: string;
  port: number;
}

function getEnv(key: string, fallback?: string): string {
  const val = process.env[key];
  if (val) return val;
  if (fallback !== undefined) return fallback;
  throw new Error(`Missing required environment variable: ${key}`);
}

export const config: AppConfig = {
  databasePath: getEnv('DATABASE_PATH', './db/accountability.db'),
  internalAdminToken: getEnv('INTERNAL_ADMIN_TOKEN', 'change-me'),
  siteUrl: getEnv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000'),
  nodeEnv: getEnv('NODE_ENV', 'development'),
  port: parseInt(getEnv('PORT', '3000'), 10),
};

/**
 * Validate configuration on startup. Exits if critical vars are missing.
 */
export function validateConfig(): void {
  if (!config.databasePath) {
    console.error('[config] DATABASE_PATH is not set');
    if (config.nodeEnv === 'production') process.exit(1);
  }
  if (!config.internalAdminToken || config.internalAdminToken === 'change-me') {
    console.warn('[config] INTERNAL_ADMIN_TOKEN is default; reload endpoint is insecure');
  }
}

/**
 * Placeholder for loading optional env vars (for development only).
 */
export function loadEnvFile(): void {
  // In Next.js, .env files are loaded automatically
}
