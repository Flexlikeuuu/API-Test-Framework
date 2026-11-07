#!/usr/bin/env node
import http from 'http';
import { URL } from 'url';

const PORT = parseInt(process.env.MOCK_PORT || '3000', 10);

// In-memory store
const items = [
  { id: 1, title: 'Mock Item 1', status: 'ACTIVE' },
  { id: 2, title: 'Mock Item 2', status: 'PENDING' },
];

let pollCount = 0;

/**
 * Universal Zero-Dependency Native Mock HTTP Server
 */
const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Handle delay if requested
  const delayParam = parsedUrl.searchParams.get('delay');
  if (delayParam) {
    await new Promise((resolve) => setTimeout(resolve, parseInt(delayParam, 10)));
  }

  // Parse body for POST/PUT/PATCH
  let body = null;
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    const buffers = [];
    for await (const chunk of req) {
      buffers.push(chunk);
    }
    const rawBody = Buffer.concat(buffers).toString();
    try {
      body = rawBody ? JSON.parse(rawBody) : null;
    } catch {
      body = rawBody;
    }
  }

  const sendJson = (status, data) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };

  // Route: GET /health
  if (method === 'GET' && pathname === '/health') {
    return sendJson(200, { status: 'UP', timestamp: new Date().toISOString() });
  }

  // Route: POST /auth/login
  if (method === 'POST' && pathname === '/auth/login') {
    return sendJson(200, {
      accessToken: 'mock-jwt-token-xyz-123',
      refreshToken: 'mock-refresh-token-456',
      user: { id: 1, username: body?.username || 'mock_user' },
    });
  }

  // Route: GET /auth/me
  if (method === 'GET' && pathname === '/auth/me') {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendJson(401, { error: 'Unauthorized: Missing or invalid Bearer token' });
    }
    return sendJson(200, { id: 1, username: 'mock_user', role: 'admin' });
  }

  // Route: GET /jobs/:id (simulates async job completion after 3 checks)
  if (method === 'GET' && pathname.startsWith('/jobs/')) {
    pollCount++;
    const status = pollCount >= 3 ? 'COMPLETED' : 'IN_PROGRESS';
    return sendJson(200, {
      jobId: pathname.split('/')[2],
      status,
      attempts: pollCount,
    });
  }

  // Route: GET /items
  if (method === 'GET' && pathname === '/items') {
    return sendJson(200, { items, total: items.length });
  }

  // Route: POST /items
  if (method === 'POST' && pathname === '/items') {
    const newItem = { id: items.length + 1, ...(body || {}), createdAt: new Date().toISOString() };
    items.push(newItem);
    return sendJson(201, newItem);
  }

  // Route: GET /items/:id
  const itemMatch = pathname.match(/^\/items\/(\d+)$/);
  if (itemMatch) {
    const id = parseInt(itemMatch[1], 10);
    const item = items.find((i) => i.id === id);

    if (method === 'GET') {
      return item ? sendJson(200, item) : sendJson(404, { error: 'Item not found' });
    }
    if (method === 'PUT') {
      if (!item) return sendJson(404, { error: 'Item not found' });
      Object.assign(item, body);
      return sendJson(200, item);
    }
    if (method === 'DELETE') {
      const idx = items.findIndex((i) => i.id === id);
      if (idx === -1) return sendJson(404, { error: 'Item not found' });
      items.splice(idx, 1);
      return sendJson(200, { message: `Item ${id} deleted`, id });
    }
  }

  // Route: Status simulator /status/:code
  const statusMatch = pathname.match(/^\/status\/(\d+)$/);
  if (statusMatch) {
    const code = parseInt(statusMatch[1], 10);
    return sendJson(code, { statusCode: code, message: `Simulated status ${code}` });
  }

  // Default 404
  return sendJson(404, { error: 'Endpoint not found', path: pathname });
});

server.listen(PORT, () => {
  console.log(`[MockServer] Running locally at http://localhost:${PORT}`);
});
