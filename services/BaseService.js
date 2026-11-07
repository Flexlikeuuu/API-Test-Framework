import { endpoints } from '../config/endpoints.config.js';

/**
 * Universal Base Service for API Object Model (AOM)
 * 
 * Provides core HTTP methods and route parameter interpolation.
 * Inherit from this class to implement custom domain-specific API services.
 */
export class BaseService {
  /**
   * @param {import('../core/ApiClient.js').ApiClient} apiClient
   */
  constructor(apiClient) {
    if (!apiClient) {
      throw new Error('ApiClient instance must be provided to Service');
    }
    this.client = apiClient;
  }

  /**
   * Formats a route path with given route params (e.g. '/items/:id')
   * @param {string} route
   * @param {Record<string, string|number>} params
   * @returns {string}
   */
  formatRoute(route, params = {}) {
    return endpoints.format(route, params);
  }

  /**
   * GET request wrapper
   */
  async get(url, options = {}) {
    return this.client.get(url, options);
  }

  /**
   * POST request wrapper
   */
  async post(url, data = null, options = {}) {
    return this.client.post(url, data, options);
  }

  /**
   * PUT request wrapper
   */
  async put(url, data = null, options = {}) {
    return this.client.put(url, data, options);
  }

  /**
   * PATCH request wrapper
   */
  async patch(url, data = null, options = {}) {
    return this.client.patch(url, data, options);
  }

  /**
   * DELETE request wrapper
   */
  async delete(url, options = {}) {
    return this.client.delete(url, options);
  }
}
