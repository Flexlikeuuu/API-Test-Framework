import { logger } from './Logger.js';

/**
 * Universal Polling utility for asynchronous operations, background jobs, and eventual consistency
 */
export class Poller {
  /**
   * Polls an asynchronous operation until predicate condition is satisfied or timeout occurs
   * @param {Function} asyncFn - Async function returning data / response
   * @param {Function} predicate - Condition callback: (result) => boolean
   * @param {object} options - Polling options
   * @param {number} [options.timeoutMs=30000] - Total maximum timeout in ms
   * @param {number} [options.intervalMs=1000] - Interval between checks in ms
   * @param {number} [options.backoffMultiplier=1.0] - Backoff multiplier for dynamic intervals
   * @param {string} [options.description='Async polling operation'] - Description for logs
   * @returns {Promise<any>} The result of asyncFn when predicate returns true
   */
  static async pollUntil(
    asyncFn,
    predicate,
    {
      timeoutMs = 30000,
      intervalMs = 1000,
      backoffMultiplier = 1.0,
      description = 'Polling operation',
    } = {}
  ) {
    const startTime = Date.now();
    let currentInterval = intervalMs;
    let attempt = 1;

    logger.debug(`[Poller] Starting "${description}" (timeout: ${timeoutMs}ms, initial interval: ${intervalMs}ms)`);

    while (Date.now() - startTime < timeoutMs) {
      try {
        const result = await asyncFn();
        const satisfied = await predicate(result);

        if (satisfied) {
          logger.debug(`[Poller] "${description}" succeeded on attempt ${attempt} (${Date.now() - startTime}ms elapsed)`);
          return result;
        }
      } catch (err) {
        logger.warn(`[Poller] "${description}" attempt ${attempt} encountered error: ${err.message}`);
      }

      await new Promise((resolve) => setTimeout(resolve, currentInterval));
      currentInterval = Math.round(currentInterval * backoffMultiplier);
      attempt++;
    }

    throw new Error(
      `[Poller] Timeout reached (${timeoutMs}ms) for "${description}" after ${attempt} attempts.`
    );
  }
}
