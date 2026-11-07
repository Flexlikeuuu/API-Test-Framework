import fs from 'fs';
import path from 'path';

/**
 * Universal File Helper for multipart uploads, downloads, and payloads
 */
export class FileHelper {
  /**
   * Reads a file from disk into a Buffer
   * @param {string} filePath - Absolute or relative path to file
   * @returns {Buffer}
   */
  static readFileAsBuffer(filePath) {
    const resolvedPath = path.resolve(filePath);
    return fs.readFileSync(resolvedPath);
  }

  /**
   * Prepares a multipart file upload payload for Playwright request
   * @param {string} filename - Target filename (e.g. 'document.pdf', 'report.txt')
   * @param {string|Buffer} contentOrPath - File content string, Buffer, or file path
   * @param {string} [mimeType='text/plain'] - MIME type (e.g. 'application/pdf', 'image/png', 'text/plain')
   */
  static createMultipartFile(filename, contentOrPath, mimeType = 'text/plain') {
    let buffer;
    if (Buffer.isBuffer(contentOrPath)) {
      buffer = contentOrPath;
    } else if (typeof contentOrPath === 'string' && fs.existsSync(contentOrPath)) {
      buffer = fs.readFileSync(contentOrPath);
    } else {
      buffer = Buffer.from(contentOrPath, 'utf-8');
    }

    return {
      name: filename,
      mimeType,
      buffer,
    };
  }

  /**
   * Saves buffer/binary response to a file on disk
   * @param {Buffer} buffer
   * @param {string} destinationPath
   */
  static saveBufferToFile(buffer, destinationPath) {
    const resolvedDir = path.dirname(path.resolve(destinationPath));
    if (!fs.existsSync(resolvedDir)) {
      fs.mkdirSync(resolvedDir, { recursive: true });
    }
    fs.writeFileSync(destinationPath, buffer);
  }

  /**
   * Reads and parses a JSON file
   * @param {string} filePath
   */
  static readJson(filePath) {
    const raw = fs.readFileSync(path.resolve(filePath), 'utf-8');
    return JSON.parse(raw);
  }
}
