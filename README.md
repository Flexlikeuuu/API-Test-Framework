# Universal API Test Automation Framework

A fully project-agnostic, enterprise-grade API test automation framework built with **JavaScript (ES Modules)** and **Playwright Test** (`@playwright/test`).

This framework contains **no hardcoded API paths or project-specific lock-in**. It is designed as a universal template that any QA engineer or team can pull and start writing tests against **any API** (REST, GraphQL, microservices, third-party integrations, webhook/background jobs) within minutes.

---

## 📁 Architecture Overview

```
APITestFramework/
├── config/
│   ├── constants.js          # HTTP methods, status codes, standard headers, content types
│   ├── endpoints.config.js   # Central registry for customizable endpoint paths
│   └── env.config.js         # Multi-environment configuration loader (dev, staging, prod, local)
├── core/
│   ├── ApiClient.js          # Universal HTTP engine wrapping Playwright APIRequestContext
│   ├── ApiResponse.js        # Fluent response wrapper with latency & assertion helpers
│   ├── AuthManager.js        # Auth generator (Bearer, Basic, API Key, cached tokens)
│   ├── DataGenerator.js      # Synthetic data generator wrapping @faker-js/faker
│   ├── FileHelper.js         # Multipart uploads, binary file handling, JSON utilities
│   ├── Logger.js             # Structured logger with color coding and sensitive data masking
│   ├── Poller.js             # Universal polling helper for asynchronous workflows
│   ├── SchemaValidator.js    # Ajv JSON schema validation with readable error formatting
│   └── TestDataProvider.js   # Universal CSV and JSON test data loader for data-driven testing
├── fixtures/
│   └── apiFixtures.js        # Custom Playwright fixtures injecting clients, services & tools
├── services/                 # Universal API Object Model (AOM) Layer
│   ├── BaseService.js        # Abstract base service with route formatting & HTTP shortcuts
│   ├── ResourceService.js    # Universal REST CRUD service for ANY resource endpoint
│   ├── AuthService.js        # Configurable Authentication Service (login, refresh, me)
│   └── GraphQLService.js     # Universal GraphQL query & mutation executor
├── schemas/                  # JSON Schemas directory (schema contract validation)
│   ├── error.schema.json     # Standard error schema template
│   └── example.schema.json   # Sample entity schema template
├── scripts/
│   ├── generateSchema.js     # CLI tool to automatically generate JSON Schemas from live APIs
│   └── mockServer.js         # Zero-dependency local mock server for offline testing
├── tests/                    # Test suites directory (ready for your test cases)
│   └── example.spec.js       # Starter test template demonstrating all framework capabilities
├── .github/workflows/
│   └── api-tests.yml         # GitHub Actions CI/CD workflow matrix
├── .env.example              # Sample environment variables template
├── .env                      # Local environment configuration
├── playwright.config.js      # Playwright test runner configuration
└── package.json              # Dependencies and execution scripts
```

---

## 🚀 Getting Started

### 1. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 2. Configure Environment (`.env`)
Copy `.env.example` to `.env` and set your API base URL:
```bash
cp .env.example .env
```

Configure your target server:
```ini
# Base URL for API under test
BASE_URL=https://api.yourcompany.com

# Target Environment (dev | staging | prod | local)
TEST_ENV=dev

# Optional: Timeout, Retries, Logging
REQUEST_TIMEOUT_MS=15000
REQUEST_RETRIES=2
LOG_LEVEL=INFO
```

---

## 💡 How to Test ANY API

### 1. Universal REST CRUD with `ResourceService`
No need to write a new service class for every single resource! You can create a full CRUD client for **any** endpoint in one line:

```javascript
import { test, expect } from '../fixtures/apiFixtures.js';
import { HTTP_STATUS } from '../config/constants.js';

test('Manage any resource', async ({ createResource, dataGenerator }) => {
  // Instantly attach to ANY resource endpoint (e.g., '/orders', '/api/v1/customers')
  const orders = createResource('/api/v1/orders');

  // GET /api/v1/orders
  const listResponse = await orders.getAll({ status: 'active', limit: 10 });
  listResponse.expectStatus(HTTP_STATUS.OK);

  // POST /api/v1/orders
  const createResponse = await orders.create({
    item: 'Widget',
    quantity: 2,
    orderId: dataGenerator.randomUUID(),
  });
  createResponse.expectStatus(HTTP_STATUS.CREATED);
  const created = await createResponse.json();

  // GET /api/v1/orders/:id
  const getResponse = await orders.getById(created.id);
  getResponse.expectStatus(HTTP_STATUS.OK);

  // PUT /api/v1/orders/:id
  await orders.update(created.id, { quantity: 5 });

  // DELETE /api/v1/orders/:id
  await orders.delete(created.id);
});
```

You can also use `apiClient.resource('/any-path')` directly:
```javascript
test('Using apiClient.resource directly', async ({ apiClient }) => {
  const users = apiClient.resource('/users');
  const response = await users.getAll();
  response.expectStatus(200);
});
```

---

### 2. Direct HTTP Requests with Fluent `ApiResponse`
For endpoints that don't follow standard REST conventions, use `apiClient` directly:

```javascript
test('Direct HTTP request with chainable assertions', async ({ apiClient }) => {
  const response = await apiClient.get('/api/health');

  // Fluent chainable assertions:
  response
    .expectStatus(HTTP_STATUS.OK)
    .expectContentType('application/json')
    .expectTimeLessThan(1000); // Latency / SLA check

  const body = await response.json();
  expect(body.status).toBe('UP');
});
```

---

### 3. Authentication (Bearer, Basic, API Key, Custom Headers)
The framework supports any authentication mechanism:

```javascript
test('Authenticate requests', async ({ apiClient, authManager }) => {
  // 1. Bearer Token
  apiClient.setBearerToken('your-jwt-access-token');

  // 2. Basic Auth
  apiClient.setBasicAuth('username', 'password');

  // 3. Custom API Key header
  apiClient.setHeader('x-api-key', 'your-secret-key');

  const response = await apiClient.get('/secure-data');
  response.expectStatus(200);
});
```

---

### 4. JSON Schema Contract Validation
Validate that your API responses adhere to strict JSON Schema contracts using `Ajv`:

```javascript
import { FileHelper } from '../core/FileHelper.js';

test('Validate JSON Schema contract', async ({ apiClient }) => {
  const schema = FileHelper.readJson('./schemas/example.schema.json');
  const response = await apiClient.get('/users/1');

  // Asserts schema validity with detailed path/message error reporting
  await response.expectSchema(schema);
});
```

> **Tip:** You can automatically generate a JSON Schema from any API response or URL using the built-in generator:
> ```bash
> npm run schema:generate https://api.yourcompany.com/users/1 user.schema.json
> ```

---

### 5. GraphQL Queries & Mutations
Execute GraphQL queries or mutations against any GraphQL endpoint:

```javascript
test('Execute GraphQL query', async ({ graphqlService }) => {
  const query = `
    query GetProduct($id: ID!) {
      product(id: $id) {
        name
        price
      }
    }
  `;

  const response = await graphqlService.execute(query, { id: 'prod_123' });
  response.expectStatus(200);

  const data = await response.json();
  expect(data.data.product.name).toBeDefined();
});
```

---

### 6. Multipart Form-Data & File Uploads
Upload and download binary files easily with `FileHelper`:

```javascript
test('Upload file via multipart/form-data', async ({ apiClient, fileHelper }) => {
  const file = fileHelper.createMultipartFile(
    'document.pdf',
    'Sample content or file buffer',
    'application/pdf'
  );

  const response = await apiClient.post('/documents/upload', null, {
    multipart: {
      file,
      category: 'invoices',
    },
  });

  response.expectStatus(201);
});
```

---

### 7. Polling for Asynchronous / Eventual Consistency APIs
Poll background jobs, message queues, or async tasks until a condition is satisfied:

```javascript
test('Poll async operation until ready', async ({ apiClient, poller }) => {
  const job = await poller.pollUntil(
    async () => (await apiClient.get('/jobs/task-456')).json(),
    (res) => res.status === 'COMPLETED',
    {
      timeoutMs: 30000,
      intervalMs: 1500,
      backoffMultiplier: 1.2,
      description: 'Wait for background export completion',
    }
  );

  expect(job.downloadUrl).toBeDefined();
});
```

---

### 8. Creating Custom Domain Services
If your project has complex business workflows, inherit from `BaseService`:

```javascript
import { BaseService } from './BaseService.js';

export class CheckoutService extends BaseService {
  async checkoutCart(cartId, paymentInfo) {
    return this.post(this.formatRoute('/carts/:cartId/checkout', { cartId }), paymentInfo);
  }
}
```

---

## 🏃 Running Tests

```bash
# Run all tests
npm test

# Run tests targeting a specific environment
npm run test:dev
npm run test:staging
npm run test:prod

# Run in UI mode
npm run test:ui

# View HTML Test Report
npm run test:report
```

---

## 📊 Playwright HTML Report
Every API request and response is automatically formatted and attached to the Playwright HTML Report under each test step, including:
- HTTP Method & Target URL
- Request Headers & Query Parameters
- Request Payload (sanitized for passwords and secrets)
- Response Status & Latency (ms)
- Response Headers & Body Preview
