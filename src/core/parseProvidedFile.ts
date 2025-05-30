/**
 * Module responsible for parsing user provided .http, JSON, or txt files to derive
 * information on how to construct the appropriate REST request. This information will be used
 * in callSuppliedApi to retrieve a response and then generate the react hook.
 */
import fs from 'fs/promises';
import path from 'path';
import {apiParameters} from './callSuppliedApi';
import {
    splitAndFilterLines,
    extractMethodAndUrl,
    createRecordOfHeaders,
    parseRequestBody,
    parseAuthHeader,
} from '../util/httpParsingUtils';
import {
    extractTokensFromRequest,
    extractAuthHeader,
    extractMethod,
    extractHeaders,
    extractBody,
    extractUrl,
} from '../util/txtParsingUtils';
import {
    extractHeadersFromRequest,
    extractHttpMethod,
    extractJsonBodyFromRequest,
    extractTargetUrl,
} from '../util/jsonParsingUtils';
import {FileParseError} from './errors';

const HTTP_EXTENSION = '.http';
const TXT_EXTENSION = '.txt';
const JSON_EXTENSION = '.json';

/**
 * Parses provided file to create REST request. Supports JSON, TXT (cURL) and .http files.
 * This is the main entry point that handles file reading and delegates to appropriate parsers.
 *
 * @param filePath path to the provided file
 * @returns extracted apiParameters for making the API call
 * @throws {FileParseError} when file cannot be read or parsed
 */
const parseProvidedFile = async (filePath: string): Promise<apiParameters> => {
    try {
        // Read file content once, then pass to appropriate parser
        const content = await fs.readFile(filePath, 'utf-8');
        const extension = path.extname(filePath).toLowerCase();
        switch (extension) {
            case HTTP_EXTENSION:
                return parseHttpFile(content);
            case TXT_EXTENSION:
                return parseTxtFile(content);
            case JSON_EXTENSION:
                return parseJsonFile(content);
            default:
                throw new FileParseError(
                    filePath,
                    `Unsupported file type: ${extension}`
                );
        }
    } catch (error: any) {
        // Propagate error if it is already this type.
        if (error instanceof FileParseError) {
            throw error;
        }
        throw new FileParseError(filePath, error.message);
    }
};

/**
 * Parses a .http file into an apiParameters object.
 * HTTP files follow the VS Code REST Client format.
 *
 * @param {string} fileContent - Raw text content of the .http file.
 * @returns {apiParameters} - Structured request object suitable for use in callSuppliedApi.
 */
const parseHttpFile = (fileContent: string): apiParameters => {
    const fileLines: string[] = splitAndFilterLines(fileContent);
    const [method, url] = extractMethodAndUrl(fileLines);
    let initialIndex = 1;
    const [headers, bodyStartIndex] = createRecordOfHeaders(
        fileLines,
        initialIndex
    );
    const requestBody: object | undefined = parseRequestBody(
        fileLines,
        bodyStartIndex
    );
    const authHeader = parseAuthHeader(headers);

    return {
        targetUrl: url,
        httpMethod: method.toUpperCase() as apiParameters['httpMethod'],
        authToken: authHeader?.replace(/^Bearer\s+/i, ''),
        requestHeaders: Object.keys(headers).length > 0 ? headers : undefined,
        requestBody: requestBody,
        queryParams: undefined,
    };
};

/**
 * Parses a cURL command string into an apiParameters object.
 *
 * @param {string} content - Raw curl command as a string.
 * @returns {apiParameters} - Structured API request parameters.
 */
const parseTxtFile = (fileContent: string): apiParameters => {
    const tokens = extractTokensFromRequest(fileContent);
    const url = extractUrl(tokens);
    const method = extractMethod(tokens);
    const headers = extractHeaders(tokens);
    const body = extractBody(tokens);
    const authHeader = extractAuthHeader(headers);
    return {
        targetUrl: url,
        httpMethod: method,
        authToken: authHeader?.replace(/^Bearer\s+/i, ''),
        requestHeaders: Object.keys(headers).length ? headers : undefined,
        requestBody: body,
        queryParams: undefined,
    };
};

/**
 * Parses a Postman collection JSON string into an apiParameters object.
 * Uses the first request found in the collection.
 *
 * @param {string} content - Raw JSON from a Postman collection export.
 * @returns {apiParameters} - Structured API request parameters.
 */
const parseJsonFile = (fileContent: string): apiParameters => {
    const request = JSON.parse(fileContent);
    if (!request || !request.url) {
        throw new Error('Invalid Postman request JSON: missing "url" field.');
    }
    const method: any = extractHttpMethod(request);
    const url: any = extractTargetUrl(request);
    const headers: Record<string, string> = extractHeadersFromRequest(request);
    const parsedBody: any = extractJsonBodyFromRequest(request);
    const authHeader = extractAuthHeader(request);
    return {
        targetUrl: url,
        httpMethod: method.toUpperCase() as apiParameters['httpMethod'],
        authToken: authHeader?.replace(/^Bearer\s+/i, ''),
        requestHeaders: Object.keys(headers).length ? headers : undefined,
        requestBody: parsedBody,
        queryParams: undefined,
    };
};

export {parseProvidedFile};
