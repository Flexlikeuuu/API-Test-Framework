import { envConfig } from '../config/env.config.js';

const LOG_LEVELS = {
  DEBUG: 1,
  INFO: 2,
  WARN: 3,
  ERROR: 4,
  NONE: 5,
};

class Logger {
  constructor(name = 'API-Framework') {
    this.name = name;
  }

  get currentLevel() {
    return LOG_LEVELS[envConfig.logLevel] || LOG_LEVELS.INFO;
  }

  _format(level, message, meta) {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` | ${typeof meta === 'object' ? JSON.stringify(meta, this._sanitize) : meta}` : '';
    return `[${timestamp}] [${level.padEnd(5)}] [${this.name}] ${message}${metaStr}`;
  }

  _sanitize(key, value) {
    const sensitiveKeys = ['authorization', 'token', 'password', 'secret', 'apikey', 'api-key', 'cookie'];
    if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
      return '***REDACTED***';
    }
    return value;
  }

  debug(message, meta) {
    if (this.currentLevel <= LOG_LEVELS.DEBUG) {
      console.log('\x1b[34m%s\x1b[0m', this._format('DEBUG', message, meta));
    }
  }

  info(message, meta) {
    if (this.currentLevel <= LOG_LEVELS.INFO) {
      console.log('\x1b[32m%s\x1b[0m', this._format('INFO', message, meta));
    }
  }

  warn(message, meta) {
    if (this.currentLevel <= LOG_LEVELS.WARN) {
      console.warn('\x1b[33m%s\x1b[0m', this._format('WARN', message, meta));
    }
  }

  error(message, meta) {
    if (this.currentLevel <= LOG_LEVELS.ERROR) {
      console.error('\x1b[31m%s\x1b[0m', this._format('ERROR', message, meta));
    }
  }
}

export const logger = new Logger();
export { Logger };
