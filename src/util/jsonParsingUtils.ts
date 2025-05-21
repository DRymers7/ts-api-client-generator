/**
 * Module with utilities to help parsing JSON files with
 * postman requests
 */
import {json} from 'stream/consumers';
import {apiParameters} from '../core/callSuppliedApi';

/**
 * Extracts the HTTP method from the json request
 *
 * @param jsonRequest JSON value of postman request
 * @returns string of HTTP method, defaulting to GET
 */
const extractHttpMethod = (jsonRequest: any): any => {
    return jsonRequest.method ?? 'GET';
};

/**
 * Extracts target URL from json request
 *
 * @param jsonRequest JSON value of postman request
 * @returns string of target URL, or empty string
 */
const extractTargetUrl = (jsonRequest: any): any => {
    const url =
        typeof jsonRequest.url === 'string'
            ? jsonRequest.url
            : (jsonRequest.url?.raw ??
              (Array.isArray(jsonRequest.url?.host) &&
              Array.isArray(jsonRequest.url?.path)
                  ? `https://${jsonRequest.url.host.join('.')}/${jsonRequest.url.path.join('/')}`
                  : ''));
    return url;
};

/**
 * Extracts headers from JSON request
 *
 * @param jsonRequest JSON value of postman request
 * @returns Record<string, string> of request headers
 */
const extractHeadersFromRequest = (
    jsonRequest: any
): Record<string, string> => {
    const headers: Record<string, string> = {};
    for (const h of jsonRequest.header ?? []) {
        if (h.key && h.value) {
            headers[h.key] = h.value;
        }
    }
    return headers;
};

/**
 * Extracts request body from JSON request
 *
 * @param jsonRequest JSON of postman request
 * @returns request body of postman request
 */
const extractJsonBodyFromRequest = (jsonRequest: any): any => {
    const rawBody = jsonRequest.body?.raw;
    let parsedBody: object | undefined;
    try {
        parsedBody = rawBody ? JSON.parse(rawBody) : undefined;
        return parsedBody;
    } catch {
        throw new Error('Invalid JSON in Postman request body');
    }
};

/**
 * Extracts auth header from JSON request
 *
 * @param requestHeaders record of request headers
 * @returns string value of auth header used in request
 */
const extractAuthHeader = (requestHeaders: Record<string, string>): any => {
    const authHeader: string =
        requestHeaders['Authorization'] ?? requestHeaders['authorization'];
    if (authHeader?.toLowerCase().startsWith('bearer')) {
        delete requestHeaders['Authorization'];
        delete requestHeaders['authorization'];
    }
    return authHeader;
};

export {
    extractHttpMethod,
    extractTargetUrl,
    extractHeadersFromRequest,
    extractJsonBodyFromRequest,
    extractAuthHeader,
};
