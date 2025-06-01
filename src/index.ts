/**
 * Main library entry point for ts-api-client-generator
 *
 * This package helps developers generate TypeScript-typed React components
 * with TanStack Query integration from API request files.
 */
import parseProvidedFile from './core/parseProvidedFile';

/**
 * Core functional exports
 */
export {callSuppliedApi,} from './core/callSuppliedApi';
export {generateClientCode} from './core/generateClientCode';
export {generateResponseType} from './core/mapResponseToType';
export {parseProvidedFile};

/**
 * Custom type definitions
 */
export {staticTypedRequest} from './core/types';

/**
 * Application level error classes
 */
export {
    FileParseError,
    ApiCallError,
    ResponseTypeGenerationError,
    ClientCodeGenerationError,
    ValidationError,
} from './core/errors';

/**
 * Validation utility functions
 */
export {validateProgramArguments} from './util/validationUtils';
