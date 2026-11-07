import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env configuration file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const environment = (process.env.TEST_ENV || 'dev').toLowerCase();

const baseUrls = {
  dev: process.env.DEV_BASE_URL || process.env.BASE_URL || 'https://api.example.com',
  staging: process.env.STAGING_BASE_URL || process.env.BASE_URL || 'https://staging-api.example.com',
  prod: process.env.PROD_BASE_URL || process.env.BASE_URL || 'https://api.example.com',
  local: process.env.LOCAL_BASE_URL || 'http://localhost:3000',
};

export const envConfig = {
  env: environment,
  baseUrl: process.env.BASE_URL || baseUrls[environment] || baseUrls.dev,
  graphqlUrl: process.env.GRAPHQL_BASE_URL || '',
  timeoutMs: parseInt(process.env.REQUEST_TIMEOUT_MS || '15000', 10),
  retries: parseInt(process.env.REQUEST_RETRIES || '2', 10),
  retryDelayMs: parseInt(process.env.RETRY_DELAY_MS || '1000', 10),
  logLevel: (process.env.LOG_LEVEL || 'INFO').toUpperCase(),
  auth: {
    username: process.env.AUTH_USERNAME || '',
    password: process.env.AUTH_PASSWORD || '',
    bearerToken: process.env.AUTH_BEARER_TOKEN || '',
    apiKey: process.env.API_KEY || '',
    apiKeyHeader: process.env.API_KEY_HEADER || 'x-api-key',
  },
};
