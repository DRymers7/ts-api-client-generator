import {json} from 'stream/consumers';
import {apiParameters} from '../core/callSuppliedApi';

const extractHttpMethod = (jsonRequest: any): any => {
    return jsonRequest.method ?? 'GET';
};

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
