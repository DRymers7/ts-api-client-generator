import { ValidationResult } from "../util/validationUtils";

/**
 * Thrown when a provided input file cannot be read or parsed as valid JSON.
 * 
 * @example
 * throw new FileParseError('/path/to/file.json', 'Unexpected token');
 */
export class FileParseError extends Error {
  /**
   * @param filePath - The path of the file that failed to parse.
   * @param message - Optional additional message describing the parsing issue.
   */
  constructor(filePath: string, message?: string) {
    super(`Failed to parse input file "${filePath}": ${message}`);
    this.name = 'FileParseError';
  }
}

/**
 * Thrown when an API call fails, e.g., due to a network error or 4xx/5xx response.
 *
 * @example
 * throw new ApiCallError(404, 'Not Found');
 */
export class ApiCallError extends Error {
  /**
   * @param statusCode - The HTTP status code from the failed request.
   * @param statusText - A human-readable status message (e.g., "Not Found").
   */
  constructor(statusCode: number, statusText: string) {
    super(`API call failed with status ${statusCode} (${statusText})`);
    this.name = 'ApiCallError';
  }
}

/**
 * Thrown when response body type inference fails, usually due to malformed or empty data.
 *
 * @example
 * throw new ResponseTypeGenerationError();
 */
export class ResponseTypeGenerationError extends Error {
  constructor() {
    super(`Unable to generate response type from API response`);
    this.name = 'ResponseTypeGenerationError';
  }
}

/**
 * Thrown when an error occurs while generating or writing the React component file.
 *
 * @example
 * throw new ClientCodeGenerationError('/output/MyComponent.tsx', 'Permission denied');
 */
export class ClientCodeGenerationError extends Error {
  /**
   * @param filePath - The intended output file path for the component.
   * @param message - Optional underlying error message for additional context.
   */
  constructor(filePath: string, message?: string) {
    super(`Failed to generate client code at "${filePath}": ${message}`);
    this.name = 'ClientCodeGenerationError';
  }
}

/**
 * Thrown when an error occurs while validating the initial arguments.
 *
 * @example
 * throw new ValidationError(validationResults);
 */
export class ValidationError extends Error {
  /**
   * @param validationResults - array of validation result interfaces containing
   * more context on what failed. The error message will contain all failing validations.
   */
  constructor(validationResults: ValidationResult[]) {
    super(`Failed to validate arguments/results ${console.log("")}}`);
    this.name = 'ValidationError';
  }
}

