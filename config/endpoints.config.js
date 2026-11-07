/**
 * Configurable API Endpoints Registry
 * 
 * Customize endpoints here or override them via environment variables (.env).
 * This makes the framework completely adaptable to any API structure.
 */

export const endpoints = {
  // Authentication endpoints
  auth: {
    login: process.env.ENDPOINT_AUTH_LOGIN || '/auth/login',
    logout: process.env.ENDPOINT_AUTH_LOGOUT || '/auth/logout',
    refresh: process.env.ENDPOINT_AUTH_REFRESH || '/auth/refresh',
    me: process.env.ENDPOINT_AUTH_ME || '/auth/me',
  },

  // GraphQL endpoint
  graphql: process.env.ENDPOINT_GRAPHQL || '/graphql',

  // Health check / status endpoint
  health: process.env.ENDPOINT_HEALTH || '/health',

  /**
   * Helper to format parameterized route paths
   * Example: endpoints.format('/users/:id/orders/:orderId', { id: 5, orderId: 42 }) => '/users/5/orders/42'
   * @param {string} route
   * @param {Record<string, string|number>} params
   * @returns {string}
   */
  format(route, params = {}) {
    let formatted = route;
    for (const [key, value] of Object.entries(params)) {
      formatted = formatted.replace(new RegExp(`:${key}\\b`, 'g'), encodeURIComponent(String(value)));
    }
    return formatted;
  },
};
