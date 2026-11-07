import { BaseService } from './BaseService.js';

/**
 * Universal REST Resource Service
 * 
 * Works with ANY REST API resource without writing custom boilerplate.
 * Supports configurable subpaths and route patterns.
 * 
 * Example usage:
 *   const users = new ResourceService(apiClient, '/api/v1/users');
 *   await users.getAll({ limit: 10 });
 *   await users.create({ name: 'Alice' });
 *   await users.getById(123);
 *   await users.update(123, { name: 'Bob' });
 *   await users.delete(123);
 */
export class ResourceService extends BaseService {
  /**
   * @param {import('../core/ApiClient.js').ApiClient} apiClient - ApiClient instance
   * @param {string} basePath - Base endpoint path for resource (e.g. '/users', '/api/v2/orders')
   * @param {object} [options={}] - Optional path and route configuration
   * @param {string} [options.listPath=''] - Subpath appended for list action
   * @param {string} [options.createPath=''] - Subpath appended for create action
   * @param {string} [options.itemPath='/:id'] - Subpath appended for single item operations
   */
  constructor(apiClient, basePath, options = {}) {
    super(apiClient);
    this.basePath = '/' + basePath.replace(/^\/+|\/+$/g, '');
    this.options = {
      listPath: '',
      createPath: '',
      itemPath: '/:id',
      ...options,
    };
  }

  /**
   * Builds action URL by combining basePath and action subpath
   * @param {string} subpath
   * @param {Record<string, string|number>} [params={}]
   * @returns {string}
   */
  _buildUrl(subpath, params = {}) {
    const combined = subpath ? `${this.basePath}/${subpath.replace(/^\/+/, '')}` : this.basePath;
    return this.formatRoute(combined, params);
  }

  /**
   * GET /resource - Fetch list of resources
   * @param {object} [queryParams={}] - Query parameters (filters, pagination, sorting)
   * @param {object} [options={}] - Playwright request options
   * @returns {Promise<import('../core/ApiResponse.js').ApiResponse>}
   */
  async getAll(queryParams = {}, options = {}) {
    const url = this._buildUrl(this.options.listPath);
    return this.client.get(url, { ...options, params: queryParams });
  }

  /**
   * GET /resource/:id - Fetch single resource by ID
   * @param {string|number} id - Resource identifier
   * @param {object} [queryParams={}] - Optional query parameters
   * @param {object} [options={}] - Playwright request options
   * @returns {Promise<import('../core/ApiResponse.js').ApiResponse>}
   */
  async getById(id, queryParams = {}, options = {}) {
    const url = this._buildUrl(this.options.itemPath, { id });
    return this.client.get(url, { ...options, params: queryParams });
  }

  /**
   * POST /resource - Create a new resource
   * @param {object} data - Payload to send
   * @param {object} [options={}] - Playwright request options
   * @returns {Promise<import('../core/ApiResponse.js').ApiResponse>}
   */
  async create(data, options = {}) {
    const url = this._buildUrl(this.options.createPath);
    return this.client.post(url, data, options);
  }

  /**
   * PUT /resource/:id - Fully update an existing resource
   * @param {string|number} id - Resource identifier
   * @param {object} data - Replacement payload
   * @param {object} [options={}] - Playwright request options
   * @returns {Promise<import('../core/ApiResponse.js').ApiResponse>}
   */
  async update(id, data, options = {}) {
    const url = this._buildUrl(this.options.itemPath, { id });
    return this.client.put(url, data, options);
  }

  /**
   * PATCH /resource/:id - Partially update an existing resource
   * @param {string|number} id - Resource identifier
   * @param {object} partialData - Partial payload
   * @param {object} [options={}] - Playwright request options
   * @returns {Promise<import('../core/ApiResponse.js').ApiResponse>}
   */
  async patch(id, partialData, options = {}) {
    const url = this._buildUrl(this.options.itemPath, { id });
    return this.client.patch(url, partialData, options);
  }

  /**
   * DELETE /resource/:id - Delete a resource by ID
   * @param {string|number} id - Resource identifier
   * @param {object} [options={}] - Playwright request options
   * @returns {Promise<import('../core/ApiResponse.js').ApiResponse>}
   */
  async delete(id, options = {}) {
    const url = this._buildUrl(this.options.itemPath, { id });
    return this.client.delete(url, options);
  }

  /**
   * Execute custom subpath action on resource
   * Example: resource.customAction('/:id/approve', 'POST', { reason: 'ok' }, { id: 10 })
   * @param {string} subpath - Action path (e.g. '/search', '/:id/status')
   * @param {string} [method='GET'] - HTTP method
   * @param {object} [data=null] - Request body
   * @param {object} [options={}] - Playwright request options (headers, params, etc.)
   * @returns {Promise<import('../core/ApiResponse.js').ApiResponse>}
   */
  async customAction(subpath, method = 'GET', data = null, options = {}) {
    const url = this._buildUrl(subpath, options.routeParams || {});
    return this.client.execute(method.toUpperCase(), url, { ...options, data });
  }
}
