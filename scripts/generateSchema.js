#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

/**
 * Infer JSON Schema type and properties from any JS value
 * @param {any} val
 * @returns {object}
 */
function inferSchema(val) {
  if (val === null) {
    return { type: 'null' };
  }
  if (Array.isArray(val)) {
    return {
      type: 'array',
      items: val.length > 0 ? inferSchema(val[0]) : {},
    };
  }
  const type = typeof val;
  if (type === 'number') {
    return { type: Number.isInteger(val) ? 'integer' : 'number' };
  }
  if (type === 'string') {
    const isIsoDate = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?/.test(val);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    const schema = { type: 'string' };
    if (isIsoDate) schema.format = 'date-time';
    if (isEmail) schema.format = 'email';
    return schema;
  }
  if (type === 'boolean') {
    return { type: 'boolean' };
  }
  if (type === 'object') {
    const properties = {};
    const required = [];
    for (const [key, propVal] of Object.entries(val)) {
      properties[key] = inferSchema(propVal);
      required.push(key);
    }
    return {
      type: 'object',
      required,
      properties,
      additionalProperties: true,
    };
  }
  return {};
}

/**
 * CLI Usage:
 * node scripts/generateSchema.js <path-to-json-file-or-url> <output-schema-filename>
 */
async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log('Usage: node scripts/generateSchema.js <input-json-file-or-url> <output-filename.schema.json>');
    process.exit(1);
  }

  const [inputSource, outputFilename] = args;
  let jsonData;

  if (inputSource.startsWith('http://') || inputSource.startsWith('https://')) {
    console.log(`Fetching sample data from ${inputSource}...`);
    const res = await fetch(inputSource);
    jsonData = await res.json();
  } else {
    console.log(`Reading JSON from file ${inputSource}...`);
    const content = fs.readFileSync(path.resolve(inputSource), 'utf-8');
    jsonData = JSON.parse(content);
  }

  const schema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: path.basename(outputFilename, '.schema.json'),
    ...inferSchema(jsonData),
  };

  const outputPath = path.resolve('schemas', outputFilename);
  fs.writeFileSync(outputPath, JSON.stringify(schema, null, 2), 'utf-8');
  console.log(`Successfully generated JSON schema at: ${outputPath}`);
}

main().catch((err) => {
  console.error('Failed to generate schema:', err);
  process.exit(1);
});
