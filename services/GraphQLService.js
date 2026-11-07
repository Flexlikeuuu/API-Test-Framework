import { BaseService } from './BaseService.js';
import { envConfig } from '../config/env.config.js';
import { endpoints } from '../config/endpoints.config.js';

/**
 * Universal GraphQL Service
 * 
 * Works with any GraphQL endpoint for executing queries and mutations.
 */
export class GraphQLService extends BaseService {
  /**
   * @param {import('../core/ApiClient.js').ApiClient} apiClient
   * @param {string} [endpoint] - Custom GraphQL endpoint URL or path
   */
  constructor(apiClient, endpoint = null) {
    super(apiClient);
    this.endpoint = endpoint || envConfig.graphqlUrl || endpoints.graphql;
  }

  /**
   * Executes a GraphQL Query or Mutation
   * @param {string} query - GraphQL query/mutation document string
   * @param {object} [variables={}] - Query/mutation variables
   * @param {object} [options={}] - Custom request options (headers, etc.)
   * @returns {Promise<import('../core/ApiResponse.js').ApiResponse>}
   */
  async execute(query, variables = {}, options = {}) {
    const targetUrl = options.endpoint || this.endpoint;
    return this.client.post(targetUrl, { query, variables }, options);
  }

  /**
   * Alias for execute query
   */
  async query(queryString, variables = {}, options = {}) {
    return this.execute(queryString, variables, options);
  }

  /**
   * Alias for execute mutation
   */
  async mutate(mutationString, variables = {}, options = {}) {
    return this.execute(mutationString, variables, options);
  }
}
