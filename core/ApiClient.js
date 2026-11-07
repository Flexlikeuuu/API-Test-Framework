import { envConfig } from '../config/env.config.js';
import { CONTENT_TYPES, HEADERS, HTTP_METHODS } from '../config/constants.js';
import { ApiResponse } from './ApiResponse.js';
import { logger } from './Logger.js';
import { DataGenerator } from './DataGenerator.js';
import { ResourceService } from '../services/ResourceService.js';

/**
 * Universal ApiClient wrapping Playwright's APIRequestContext
 */
export class ApiClient {
  /**
   * @param {import('@playwright/test').APIRequestContext} requestContext - Playwright request context
   * @param {object} [options={}] - Custom client options
   * @param {string} [options.baseUrl] - Base URL override
   * @param {object} [options.defaultHeaders] - Default headers to apply to every request
   * @param {import('@playwright/test').TestInfo} [options.testInfo] - Optional Playwright testInfo for HTML report attachments
   */
  constructor(requestContext, options = {}) {
    this.request = requestContext;
    this.baseUrl = options.baseUrl || envConfig.baseUrl;
    this.defaultHeaders = {
      [HEADERS.ACCEPT]: CONTENT_TYPES.JSON,
      [HEADERS.CONTENT_TYPE]: CONTENT_TYPES.JSON,
      [HEADERS.CORRELATION_ID]: DataGenerator.randomUUID(),
      ...(options.defaultHeaders || {}),
    };
    this.testInfo = options.testInfo || null;
  }

  /**
   * Sets or updates an authorization Bearer token for all subsequent requests
   * @param {string} token
   * @returns {this}
   */
  setBearerToken(token) {
    this.defaultHeaders[HEADERS.AUTHORIZATION] = `Bearer ${token}`;
    return this;
  }

  /**
   * Sets or updates Basic Auth for all subsequent requests
   * @param {string} username
   * @param {string} password
   * @returns {this}
   */
  setBasicAuth(username, password) {
    const creds = Buffer.from(`${username}:${password}`).toString('base64');
    this.defaultHeaders[HEADERS.AUTHORIZATION] = `Basic ${creds}`;
    return this;
  }

  /**
   * Sets a custom header
   * @param {string} key
   * @param {string} value
   * @returns {this}
   */
  setHeader(key, value) {
    this.defaultHeaders[key] = value;
    return this;
  }

  /**
   * Removes a header
   * @param {string} key
   * @returns {this}
   */
  removeHeader(key) {
    delete this.defaultHeaders[key];
    return this;
  }

  /**
   * Resolves absolute or relative URL
   * @param {string} url
   */
  _resolveUrl(url) {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const base = this.baseUrl.replace(/\/+$/, '');
    const path = url.replace(/^\/+/, '');
    return `${base}/${path}`;
  }

  /**
   * Core request dispatcher with latency measurement, logging, attachments, and retry logic
   * @param {string} method - HTTP method
   * @param {string} url - Target URL or endpoint path
   * @param {object} [options={}] - Playwright request options (data, params, headers, multipart, etc.)
   * @returns {Promise<ApiResponse>}
   */
  async execute(method, url, options = {}) {
    const targetUrl = this._resolveUrl(url);
    const mergedHeaders = {
      ...this.defaultHeaders,
      ...(options.headers || {}),
    };

    // If multipart is present, remove Content-Type and data property so Playwright handles form boundary
    if (options.multipart) {
      delete mergedHeaders[HEADERS.CONTENT_TYPE];
      delete mergedHeaders[HEADERS.CONTENT_TYPE.toLowerCase()];
    }

    const requestOptions = {
      ...options,
      headers: mergedHeaders,
      timeout: options.timeout || envConfig.timeoutMs,
    };

    if (requestOptions.multipart) {
      delete requestOptions.data;
      delete requestOptions.form;
    } else if (requestOptions.data === null || requestOptions.data === undefined) {
      delete requestOptions.data;
    }

    const retries = options.retries !== undefined ? options.retries : envConfig.retries;
    const retryDelay = options.retryDelayMs !== undefined ? options.retryDelayMs : envConfig.retryDelayMs;

    let attempt = 0;
    let lastError = null;

    while (attempt <= retries) {
      attempt++;
      const startTime = Date.now();
      logger.info(`[HTTP ${method}] --> ${targetUrl} (attempt ${attempt}/${retries + 1})`);
      if (options.data) {
        logger.debug(`[Request Payload]:`, options.data);
      }
      if (options.params) {
        logger.debug(`[Query Params]:`, options.params);
      }

      try {
        const rawResponse = await this.request.fetch(targetUrl, {
          method,
          ...requestOptions,
        });

        const durationMs = Date.now() - startTime;
        const response = new ApiResponse(rawResponse, durationMs, targetUrl, method);

        logger.info(`[HTTP ${method}] <-- ${targetUrl} [${response.status} ${response.statusText}] (${durationMs}ms)`);

        // Attach request/response log to Playwright Test Report if testInfo is available
        await this._attachToReport(method, targetUrl, requestOptions, response);

        // Check retry on 5xx if configured
        if (options.retryOn5xx && response.status >= 500 && attempt <= retries) {
          logger.warn(`Received status ${response.status}. Retrying in ${retryDelay}ms...`);
          await new Promise((r) => setTimeout(r, retryDelay));
          continue;
        }

        return response;
      } catch (err) {
        lastError = err;
        logger.warn(`Request failed on attempt ${attempt}: ${err.message}`);
        if (attempt <= retries) {
          logger.info(`Retrying request in ${retryDelay}ms...`);
          await new Promise((r) => setTimeout(r, retryDelay));
        }
      }
    }

    throw new Error(`[ApiClient] Request [${method} ${targetUrl}] failed after ${attempt} attempts: ${lastError?.message}`);
  }

  /**
   * Attaches request and response details into Playwright Test Report
   */
  async _attachToReport(method, url, requestOptions, response) {
    if (!this.testInfo) return;

    try {
      let responseBodyPreview = '<binary or empty>';
      const contentType = response.headers['content-type'] || '';
      if (contentType.includes('json') || contentType.includes('text') || contentType.includes('xml')) {
        const text = await response.text();
        responseBodyPreview = text.length > 5000 ? text.substring(0, 5000) + '... (truncated)' : text;
      }

      const logAttachment = {
        request: {
          method,
          url,
          headers: requestOptions.headers,
          params: requestOptions.params,
          data: requestOptions.data,
        },
        response: {
          status: response.status,
          statusText: response.statusText,
          durationMs: response.durationMs,
          headers: response.headers,
          body: responseBodyPreview,
        },
      };

      await this.testInfo.attach(`API-Call: ${method} ${url}`, {
        body: JSON.stringify(logAttachment, null, 2),
        contentType: 'application/json',
      });
    } catch (err) {
      logger.debug(`Could not attach API log to report: ${err.message}`);
    }
  }

  /**
   * HTTP GET
   * @param {string} url
   * @param {object} [options={}]
   * @returns {Promise<ApiResponse>}
   */
  async get(url, options = {}) {
    return this.execute(HTTP_METHODS.GET, url, options);
  }

  /**
   * HTTP POST
   * @param {string} url
   * @param {object} [data] - JSON body or multipart payload
   * @param {object} [options={}]
   * @returns {Promise<ApiResponse>}
   */
  async post(url, data, options = {}) {
    return this.execute(HTTP_METHODS.POST, url, { ...options, data });
  }

  /**
   * HTTP PUT
   * @param {string} url
   * @param {object} [data]
   * @param {object} [options={}]
   * @returns {Promise<ApiResponse>}
   */
  async put(url, data, options = {}) {
    return this.execute(HTTP_METHODS.PUT, url, { ...options, data });
  }

  /**
   * HTTP PATCH
   * @param {string} url
   * @param {object} [data]
   * @param {object} [options={}]
   * @returns {Promise<ApiResponse>}
   */
  async patch(url, data, options = {}) {
    return this.execute(HTTP_METHODS.PATCH, url, { ...options, data });
  }

  /**
   * HTTP DELETE
   * @param {string} url
   * @param {object} [options={}]
   * @returns {Promise<ApiResponse>}
   */
  async delete(url, options = {}) {
    return this.execute(HTTP_METHODS.DELETE, url, options);
  }

  /**
   * HTTP HEAD
   * @param {string} url
   * @param {object} [options={}]
   * @returns {Promise<ApiResponse>}
   */
  async head(url, options = {}) {
    return this.execute(HTTP_METHODS.HEAD, url, options);
  }

  /**
   * HTTP OPTIONS
   * @param {string} url
   * @param {object} [options={}]
   * @returns {Promise<ApiResponse>}
   */
  async options(url, options = {}) {
    return this.execute(HTTP_METHODS.OPTIONS, url, options);
  }

  /**
   * Creates a universal ResourceService for any endpoint path
   * @param {string} basePath - Base endpoint path (e.g. '/users', '/orders', '/api/v1/items')
   * @param {object} [options={}] - Optional path and route configuration
   * @returns {ResourceService}
   */
  resource(basePath, options = {}) {
    return new ResourceService(this, basePath, options);
  }

  /**
   * Executes a GraphQL Query or Mutation
   * @param {string} query - GraphQL query/mutation string
   * @param {object} [variables={}] - GraphQL variables
   * @param {object} [options={}] - Request options (headers, etc.)
   * @returns {Promise<ApiResponse>}
   */
  async graphql(query, variables = {}, options = {}) {
    const url = options.url || envConfig.graphqlUrl;
    return this.post(url, { query, variables }, options);
  }
}
