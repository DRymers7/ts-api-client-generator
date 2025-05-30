/**
 * Main library entry point for ts-api-client-generator
 *
 * This package helps developers generate TypeScript-typed React components
 * with TanStack Query integration from API request files.
 */

/**
 * Core functional exports
 */
export {
    apiParameters,
    apiResponse,
    callResult,
    callSuppliedApi,
} from './core/callSuppliedApi';
export {
    generateClientCode,
    FileCreationResult,
} from './core/generateClientCode';
export {generateResponseType, InterfaceMap} from './core/mapResponseToType';
export {parseProvidedFile} from './core/parseProvidedFile';

/**
 * Custom type definitions
 */
export {HTTP_METHOD, staticTypedRequest} from './core/types';

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
 * Utility functions for file parsing mechanisms
 */
export {
    splitAndFilterLines,
    extractMethodAndUrl,
    createRecordOfHeaders,
    parseRequestBody,
    parseAuthHeader,
} from './util/httpParsingUtils';

export {
    extractHttpMethod,
    extractTargetUrl,
    extractHeadersFromRequest,
    extractJsonBodyFromRequest,
    extractAuthHeader as extractAuthHeaderFromJson,
} from './util/jsonParsingUtils';

export {
    extractTokensFromRequest,
    extractAuthHeader as extractAuthHeaderFromTxt,
    extractMethod,
    extractHeaders,
    extractBody,
    extractUrl,
} from './util/txtParsingUtils';

/**
 * Validation utility functions
 */
export {validateProgramArguments} from './util/validationUtils';
