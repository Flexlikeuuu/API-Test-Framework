import { test as baseTest, expect } from '@playwright/test';
import { ApiClient } from '../core/ApiClient.js';
import { AuthService } from '../services/AuthService.js';
import { ResourceService } from '../services/ResourceService.js';
import { GraphQLService } from '../services/GraphQLService.js';
import { DataGenerator } from '../core/DataGenerator.js';
import { schemaValidator } from '../core/SchemaValidator.js';
import { FileHelper } from '../core/FileHelper.js';
import { Poller } from '../core/Poller.js';
import { authManager, AuthManager } from '../core/AuthManager.js';
import { TestDataProvider } from '../core/TestDataProvider.js';
import { endpoints } from '../config/endpoints.config.js';

/**
 * Universal Playwright test fixture extending base test with flexible API tools
 */
export const test = baseTest.extend({
  /**
   * Universal ApiClient instance injected with current Playwright request and testInfo
   */
  apiClient: async ({ request }, use, testInfo) => {
    const client = new ApiClient(request, { testInfo });
    await use(client);
  },

  /**
   * Factory function to instantiate a ResourceService for any endpoint path
   * Example: const users = createResource('/users');
   */
  createResource: async ({ apiClient }, use) => {
    await use((basePath, options = {}) => new ResourceService(apiClient, basePath, options));
  },

  /**
   * Universal Authentication Service instance
   */
  authService: async ({ apiClient }, use) => {
    await use(new AuthService(apiClient));
  },

  /**
   * Universal GraphQL Service instance
   */
  graphqlService: async ({ apiClient }, use) => {
    await use(new GraphQLService(apiClient));
  },

  /**
   * Synthetic Data Generator
   */
  dataGenerator: async ({}, use) => {
    await use(DataGenerator);
  },

  /**
   * JSON Schema Validator
   */
  schemaValidator: async ({}, use) => {
    await use(schemaValidator);
  },

  /**
   * Multipart & Binary File Helper
   */
  fileHelper: async ({}, use) => {
    await use(FileHelper);
  },

  /**
   * Universal Poller for async assertions & eventual consistency
   */
  poller: async ({}, use) => {
    await use(Poller);
  },

  /**
   * Authentication Manager for tokens and credentials
   */
  authManager: async ({}, use) => {
    await use(authManager);
  },

  /**
   * Universal Test Data Provider for loading JSON/CSV datasets
   */
  testDataProvider: async ({}, use) => {
    await use(TestDataProvider);
  },

  /**
   * Configurable Endpoints Registry
   */
  endpoints: async ({}, use) => {
    await use(endpoints);
  },
});

export { expect, AuthManager };
