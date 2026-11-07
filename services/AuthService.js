import { BaseService } from './BaseService.js';
import { endpoints } from '../config/endpoints.config.js';

/**
 * Universal Authentication Service
 * 
 * Works with any authentication endpoints and payload structures.
 * Endpoints can be customized via constructor or endpoints.config.js.
 */
export class AuthService extends BaseService {
  /**
   * @param {import('../core/ApiClient.js').ApiClient} apiClient
   * @param {object} [options={}] - Custom route configuration
   * @param {string} [options.loginPath] - Override login endpoint
   * @param {string} [options.refreshPath] - Override refresh token endpoint
   * @param {string} [options.mePath] - Override profile/current user endpoint
   * @param {string} [options.logoutPath] - Override logout endpoint
   */
  constructor(apiClient, options = {}) {
    super(apiClient);
    this.endpoints = {
      login: options.loginPath || endpoints.auth.login,
      refresh: options.refreshPath || endpoints.auth.refresh,
      me: options.mePath || endpoints.auth.me,
      logout: options.logoutPath || endpoints.auth.logout,
    };
  }

  /**
   * Sends login credentials (username/password, email/password, or any custom payload)
   * @param {object} credentials - Login credentials payload
   * @param {object} [options={}] - Playwright request options
   * @returns {Promise<import('../core/ApiResponse.js').ApiResponse>}
   */
  async login(credentials, options = {}) {
    return this.client.post(this.endpoints.login, credentials, options);
  }

  /**
   * Retrieves profile of currently authenticated user
   * @param {string} [token] - Optional Bearer token (if not already set on ApiClient)
   * @param {object} [options={}] - Playwright request options
   * @returns {Promise<import('../core/ApiResponse.js').ApiResponse>}
   */
  async getCurrentUserProfile(token = null, options = {}) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return this.client.get(this.endpoints.me, {
      ...options,
      headers: { ...headers, ...(options.headers || {}) },
    });
  }

  /**
   * Refreshes access token
   * @param {object|string} refreshData - Refresh token string or payload object
   * @param {object} [options={}] - Playwright request options
   * @returns {Promise<import('../core/ApiResponse.js').ApiResponse>}
   */
  async refreshToken(refreshData, options = {}) {
    const payload = typeof refreshData === 'string' ? { refreshToken: refreshData } : refreshData;
    return this.client.post(this.endpoints.refresh, payload, options);
  }

  /**
   * Logs out user / revokes session
   * @param {object} [payload=null]
   * @param {object} [options={}]
   * @returns {Promise<import('../core/ApiResponse.js').ApiResponse>}
   */
  async logout(payload = null, options = {}) {
    return this.client.post(this.endpoints.logout, payload, options);
  }
}
