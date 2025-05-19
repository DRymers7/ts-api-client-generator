/**
 * Module with utilities to help parsing txt files with
 * generic cURL requests
 */
import {parse as shellParse} from 'shell-quote';
import {apiParameters} from '../core/callSuppliedApi';

/**
 * Extracts the tokens from the raw txt file content
 *
 * @param fileContent raw txt file as string
 * @returns any[] of tokens from file
 */
const extractTokensFromRequest = (fileContent: string): any[] => {
    const tokens = (shellParse(fileContent) as string[]).map((t) =>
        typeof t === 'object' ? (t as any).op : t
    );
    return tokens;
};

/**
 * Extracts the auth header from the headers record
 *
 * @param headers record of headers extracted from request
 * @returns string value of auth header
 */
const extractAuthHeader = (headers: Record<string, string>): string => {
    const authHeader = headers['Authorization'] ?? headers['authorization'];
    if (authHeader?.toLowerCase().startsWith('bearer')) {
        delete headers['Authorization'];
        delete headers['authorization'];
    }
    return authHeader;
};

/**
 * Extracts HTTP method from request
 *
 * @param tokens any[] of tokens extracted from raw file
 * @returns HTTP method or defaults to GET
 */
function extractMethod(tokens: string[]): apiParameters['httpMethod'] {
    const methodIndex = tokens.findIndex(
        (t) => t === '-X' || t === '--request'
    );
    if (methodIndex !== -1 && tokens[methodIndex + 1]) {
        return tokens[
            methodIndex + 1
        ].toUpperCase() as apiParameters['httpMethod'];
    }
    return 'GET';
}

/**
 * Extracts headers from provided tokens
 *
 * @param tokens tokens from raw string request
 * @returns record of <string, string> for each header in request
 */
function extractHeaders(tokens: string[]): Record<string, string> {
    const headers: Record<string, string> = {};
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i] === '-H' || tokens[i] === '--header') {
            const header = tokens[i + 1];
            if (header) {
                const [key, ...rest] = header.split(':');
                if (key && rest.length) {
                    headers[key.trim()] = rest.join(':').trim();
                }
            }
        }
    }
    return headers;
}

/**
 * Extracts body from request
 *
 * @param tokens tokens from raw string of original request
 * @returns object or undefined union type of request body
 */
function extractBody(tokens: string[]): object | undefined {
    for (let i = 0; i < tokens.length; i++) {
        if (
            ['-d', '--data', '--data-raw', '--data-binary'].includes(
                tokens[i]
            ) &&
            tokens[i + 1]
        ) {
            try {
                return JSON.parse(tokens[i + 1]);
            } catch (e) {
                throw new Error(
                    `Invalid JSON body in curl command: ${tokens[i + 1]}`
                );
            }
        }
    }
    return undefined;
}

/**
 * Extracts URL from request tokens
 *
 * @param tokens raw string tokens from original request
 * @returns target URL for rest request
 */
function extractUrl(tokens: string[]): string {
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (
            token.startsWith('http') &&
            !token.startsWith('-') &&
            !['-X', '--request', '-H', '--header', '-d', '--data'].includes(
                tokens[i - 1]
            )
        ) {
            return token.replace(/^['"]|['"]$/g, '');
        }
    }
    throw new Error('Could not determine URL from curl command.');
}

export {
    extractTokensFromRequest,
    extractAuthHeader,
    extractMethod,
    extractHeaders,
    extractBody,
    extractUrl,
};
