import { test, expect } from '../fixtures/apiFixtures.js';
import { HTTP_STATUS } from '../config/constants.js';

/**
 * Starter API Test Template
 * 
 * Replace sample endpoints ('/your-endpoint') with your actual API routes.
 * Configure your target BASE_URL in the .env file.
 */
test.describe('API Test Suite - Template', () => {

  test('GET Request - Fetch data with status & schema validation', async ({ apiClient, schemaValidator }) => {
    // 1. Send GET request to any endpoint
    const response = await apiClient.get('/health'); // Replace with your endpoint

    // 2. Chain fluent assertions (status, content-type, SLA latency)
    response
      .expectStatus(HTTP_STATUS.OK)
      .expectTimeLessThan(2000);

    // 3. Parse JSON response body
    const body = await response.json();
    expect(body).toBeDefined();

    // 4. (Optional) Validate against a JSON schema:
    // const schema = FileHelper.readJson('./schemas/example.schema.json');
    // await response.expectSchema(schema);
  });

  test('POST Request - Create entity using ResourceService', async ({ createResource, dataGenerator }) => {
    // 1. Create a universal resource client for ANY endpoint path
    const items = createResource('/items'); // e.g., '/users', '/orders', '/products'

    // 2. Generate synthetic data or provide custom payload
    const newPayload = {
      title: 'Automated Test Item',
      uuid: dataGenerator.randomUUID(),
      // ...your fields
    };

    // 3. Send create request
    const response = await items.create(newPayload);
    response.expectStatus(HTTP_STATUS.CREATED);

    const createdItem = await response.json();
    expect(createdItem).toBeDefined();
  });

  test('Authentication - Request with Bearer Token or API Key', async ({ apiClient, authManager }) => {
    // Set Bearer token for subsequent requests
    apiClient.setBearerToken('your-access-token');

    // Or set custom API Key / Basic Auth:
    // apiClient.setHeader('x-api-key', 'your-api-key');
    // apiClient.setBasicAuth('username', 'password');

    const response = await apiClient.get('/secure-profile');
    response.expectStatus(HTTP_STATUS.OK);
  });

  test('Polling - Wait for an asynchronous background job / webhook', async ({ apiClient, poller }) => {
    // Poll an endpoint until your condition is met
    const result = await poller.pollUntil(
      async () => {
        const res = await apiClient.get('/jobs/123');
        return res.json();
      },
      (job) => job.status === 'COMPLETED',
      {
        timeoutMs: 15000,
        intervalMs: 1000,
        description: 'Waiting for job 123 completion',
      }
    );

    expect(result.status).toBe('COMPLETED');
  });

});
