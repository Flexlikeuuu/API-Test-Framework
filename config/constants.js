/**
 * Universal Constants for API Testing Framework
 */

export const HTTP_METHODS = Object.freeze({
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
  HEAD: 'HEAD',
  OPTIONS: 'OPTIONS',
});

export const HTTP_STATUS = Object.freeze({
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
});

export const CONTENT_TYPES = Object.freeze({
  JSON: 'application/json',
  FORM_URLENCODED: 'application/x-www-form-urlencoded',
  MULTIPART_FORM_DATA: 'multipart/form-data',
  XML: 'application/xml',
  TEXT_PLAIN: 'text/plain',
  OCTET_STREAM: 'application/octet-stream',
});

export const HEADERS = Object.freeze({
  CONTENT_TYPE: 'Content-Type',
  ACCEPT: 'Accept',
  AUTHORIZATION: 'Authorization',
  API_KEY: 'x-api-key',
  USER_AGENT: 'User-Agent',
  CORRELATION_ID: 'x-correlation-id',
});
