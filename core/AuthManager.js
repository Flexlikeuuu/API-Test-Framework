import { HEADERS } from '../config/constants.js';
import { logger } from './Logger.js';

/**
 * Universal Authentication & Authorization Manager
 */
export class AuthManager {
  constructor() {
    this.tokenCache = new Map();
  }

  /**
   * Creates Bearer Authorization header object
   * @param {string} token - JWT or Bearer access token
   * @returns {object} Header object { Authorization: 'Bearer ...' }
   */
  static getBearerAuth(token) {
    if (!token) {
      throw new Error('Bearer token must be provided');
    }
    return { [HEADERS.AUTHORIZATION]: `Bearer ${token}` };
  }

  /**
   * Creates Basic Authentication header object
   * @param {string} username
   * @param {string} password
   * @returns {object} Header object { Authorization: 'Basic ...' }
   */
  static getBasicAuth(username, password) {
    const credentials = Buffer.from(`${username}:${password}`).toString('base64');
    return { [HEADERS.AUTHORIZATION]: `Basic ${credentials}` };
  }

  /**
   * Creates API Key authentication header or query object
   * @param {string} apiKey - API Key value
   * @param {string} [headerName='x-api-key'] - Header name
   * @returns {object} Header object
   */
  static getApiKeyHeader(apiKey, headerName = HEADERS.API_KEY) {
    return { [headerName]: apiKey };
  }

  /**
   * Generates or retrieves a cached OAuth token using a custom token fetcher function
   * @param {string} cacheKey - Unique key for token in cache
   * @param {Function} tokenFetcherFn - Async function returning { token, expiresInSeconds }
   * @returns {Promise<string>} Valid token
   */
  async getCachedOAuthToken(cacheKey, tokenFetcherFn) {
    const cached = this.tokenCache.get(cacheKey);
    const now = Date.now();

    // Check if token exists and has at least 30s before expiration buffer
    if (cached && cached.expiresAt > now + 30000) {
      logger.debug(`[AuthManager] Returning cached token for key: "${cacheKey}"`);
      return cached.token;
    }

    logger.debug(`[AuthManager] Requesting fresh token for key: "${cacheKey}"`);
    const { token, expiresInSeconds = 3600 } = await tokenFetcherFn();
    const expiresAt = now + expiresInSeconds * 1000;

    this.tokenCache.set(cacheKey, { token, expiresAt });
    return token;
  }

  /**
   * Clears cached tokens
   */
  clearCache() {
    this.tokenCache.clear();
  }
}

export const authManager = new AuthManager();
