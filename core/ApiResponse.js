import { expect } from '@playwright/test';
import { schemaValidator } from './SchemaValidator.js';

/**
 * Universal API Response Wrapper
 * Provides fluent assertions, latency tracking, and response parsing helpers
 */
export class ApiResponse {
  /**
   * @param {import('@playwright/test').APIResponse} rawResponse - Playwright raw response
   * @param {number} durationMs - Request duration in milliseconds
   * @param {string} endpoint - Request endpoint/URL for debug context
   * @param {string} method - HTTP method used
   */
  constructor(rawResponse, durationMs, endpoint, method) {
    this.raw = rawResponse;
    this.durationMs = durationMs;
    this.endpoint = endpoint;
    this.method = method;
    this.status = rawResponse.status();
    this.statusText = rawResponse.statusText();
    this.ok = rawResponse.ok();
    this.headers = rawResponse.headers();

    this._cachedJson = null;
    this._cachedText = null;
    this._cachedBody = null;
  }

  /**
   * Returns response body as parsed JSON object
   * @returns {Promise<any>}
   */
  async json() {
    if (this._cachedJson === null) {
      this._cachedJson = await this.raw.json();
    }
    return this._cachedJson;
  }

  /**
   * Returns response body as raw text
   * @returns {Promise<string>}
   */
  async text() {
    if (this._cachedText === null) {
      this._cachedText = await this.raw.text();
    }
    return this._cachedText;
  }

  /**
   * Returns response body as Buffer
   * @returns {Promise<Buffer>}
   */
  async body() {
    if (this._cachedBody === null) {
      this._cachedBody = await this.raw.body();
    }
    return this._cachedBody;
  }

  /**
   * Asserts HTTP status code matches expected
   * @param {number} expected
   * @returns {this}
   */
  expectStatus(expected) {
    expect(
      this.status,
      `Expected [${this.method} ${this.endpoint}] status to be ${expected}, got ${this.status}`
    ).toBe(expected);
    return this;
  }

  /**
   * Asserts HTTP status code is one of allowed statuses
   * @param {number[]} allowedStatuses
   * @returns {this}
   */
  expectStatusIn(allowedStatuses) {
    expect(
      allowedStatuses,
      `Expected [${this.method} ${this.endpoint}] status ${this.status} to be one of [${allowedStatuses.join(', ')}]`
    ).toContain(this.status);
    return this;
  }

  /**
   * Asserts response time is within maximum threshold
   * @param {number} maxMs - Maximum allowed response time in ms
   * @returns {this}
   */
  expectTimeLessThan(maxMs) {
    expect(
      this.durationMs,
      `Expected [${this.method} ${this.endpoint}] response time (${this.durationMs}ms) to be less than ${maxMs}ms`
    ).toBeLessThanOrEqual(maxMs);
    return this;
  }

  /**
   * Asserts header equality
   * @param {string} headerName
   * @param {string} expectedValue
   * @returns {this}
   */
  expectHeader(headerName, expectedValue) {
    const actual = this.headers[headerName.toLowerCase()];
    expect(
      actual,
      `Expected header "${headerName}" to equal "${expectedValue}", got "${actual}"`
    ).toBe(expectedValue);
    return this;
  }

  /**
   * Asserts header contains substring
   * @param {string} headerName
   * @param {string} substring
   * @returns {this}
   */
  expectHeaderContains(headerName, substring) {
    const actual = this.headers[headerName.toLowerCase()] || '';
    expect(
      actual,
      `Expected header "${headerName}" to contain "${substring}", got "${actual}"`
    ).toContain(substring);
    return this;
  }

  /**
   * Asserts Content-Type header
   * @param {string} expectedType - e.g. 'application/json'
   * @returns {this}
   */
  expectContentType(expectedType) {
    return this.expectHeaderContains('content-type', expectedType);
  }

  /**
   * Asserts response JSON matches given schema
   * @param {object} schema - JSON schema object
   * @returns {Promise<this>}
   */
  async expectSchema(schema) {
    const data = await this.json();
    schemaValidator.assertValid(schema, data);
    return this;
  }

  /**
   * Asserts response JSON contains partial object properties
   * @param {object} expectedPartial
   * @returns {Promise<this>}
   */
  async expectJsonMatch(expectedPartial) {
    const data = await this.json();
    expect(data).toMatchObject(expectedPartial);
    return this;
  }
}
