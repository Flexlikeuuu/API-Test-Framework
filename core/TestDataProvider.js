import fs from 'fs';
import path from 'path';

/**
 * Universal Test Data Provider
 * 
 * Loads and parses external test datasets (JSON, CSV) for data-driven testing.
 */
export class TestDataProvider {
  /**
   * Loads and parses a JSON file containing an array of test cases
   * @template T
   * @param {string} filePath - Path to JSON file
   * @returns {T[]}
   */
  static loadJson(filePath) {
    const resolved = path.resolve(filePath);
    if (!fs.existsSync(resolved)) {
      throw new Error(`[TestDataProvider] File not found: ${resolved}`);
    }
    const content = fs.readFileSync(resolved, 'utf-8');
    return JSON.parse(content);
  }

  /**
   * Loads and parses a simple CSV file into an array of objects
   * @param {string} filePath - Path to CSV file
   * @param {string} [delimiter=','] - Column delimiter
   * @returns {Array<Record<string, string>>}
   */
  static loadCsv(filePath, delimiter = ',') {
    const resolved = path.resolve(filePath);
    if (!fs.existsSync(resolved)) {
      throw new Error(`[TestDataProvider] File not found: ${resolved}`);
    }

    const lines = fs
      .readFileSync(resolved, 'utf-8')
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0);

    if (lines.length === 0) return [];

    const headers = lines[0].split(delimiter).map((h) => h.trim().replace(/^["']|["']$/g, ''));
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(delimiter).map((v) => v.trim().replace(/^["']|["']$/g, ''));
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] !== undefined ? values[index] : '';
      });
      rows.push(row);
    }

    return rows;
  }
}
