import Ajv from 'ajv';
import addFormats from 'ajv-formats';

class SchemaValidator {
  constructor(options = {}) {
    this.ajv = new Ajv({
      allErrors: true,
      verbose: true,
      strict: false,
      ...options,
    });
    addFormats(this.ajv);
  }

  /**
   * Validates target object against provided JSON schema
   * @param {object} schema - JSON schema object
   * @param {any} data - Data to validate
   * @returns {{ isValid: boolean, errors: Array<object>, formattedErrors: string }}
   */
  validate(schema, data) {
    const validateFn = this.ajv.compile(schema);
    const isValid = validateFn(data);

    if (isValid) {
      return { isValid: true, errors: [], formattedErrors: '' };
    }

    const errors = validateFn.errors || [];
    const formattedErrors = errors
      .map((err) => `Path: '${err.instancePath || '/'}' | Message: ${err.message} | Details: ${JSON.stringify(err.params)}`)
      .join('\n');

    return {
      isValid: false,
      errors,
      formattedErrors,
    };
  }

  /**
   * Asserts that data matches schema, throwing descriptive error if not
   * @param {object} schema - JSON schema object
   * @param {any} data - Data to validate
   */
  assertValid(schema, data) {
    const result = this.validate(schema, data);
    if (!result.isValid) {
      throw new Error(`JSON Schema Validation Failed:\n${result.formattedErrors}`);
    }
  }
}

export const schemaValidator = new SchemaValidator();
export { SchemaValidator };
