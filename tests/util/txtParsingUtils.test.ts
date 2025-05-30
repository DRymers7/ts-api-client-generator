import {describe, it, expect} from 'vitest';
import path from 'path';
import fs from 'fs';
import {
    extractTokensFromRequest,
    extractAuthHeader,
    extractMethod,
    extractBody,
    extractHeaders,
    extractUrl,
} from '../../src/util/txtParsingUtils';

/**
 * Module tests for txtParsingUtils. Follows a progressive pattern
 * to build upon each function call, as it does in the actual code implementation.
 */
describe('Test suite for txt file parsing utility functions', () => {
    const curlFilePath = path.join(
        __dirname,
        'test_files/test-request_cURL.txt'
    );
    const rawCurlContent = fs.readFileSync(curlFilePath, 'utf-8');

    // Shared tokens extracted from the file
    const curlTokens = extractTokensFromRequest(rawCurlContent);
    const httpMethod = extractMethod(curlTokens);
    const targetUrl = extractUrl(curlTokens);
    const headers = extractHeaders(curlTokens);
    const body = extractBody(curlTokens);

    describe('extractTokensFromRequest function', () => {
        it('should return an array of string tokens', () => {
            expect(Array.isArray(curlTokens)).toBe(true);
            curlTokens.forEach((token) => expect(typeof token).toBe('string'));
        });

        it('should include common flags like --request and --header', () => {
            expect(curlTokens).toContain('--request');
            expect(curlTokens).toContain('--header');
        });
    });

    describe('extractMethod function', () => {
        it('should correctly extract the HTTP method from tokens', () => {
            expect(httpMethod).toBe('POST'); // adjust based on file content
        });
    });

    describe('extractUrl', () => {
        it('should correctly extract the target URL', () => {
            expect(typeof targetUrl).toBe('string');
            expect(targetUrl).toMatch(/^https?:\/\//);
        });

        it('should throw an error if no valid URL is present', () => {
            const badTokens = ['curl', '--request', 'POST'];
            expect(() => extractUrl(badTokens)).toThrowError(
                'Could not determine URL'
            );
        });
    });

    describe('extractHeaders', () => {
        it('should return a record of header keys and values', () => {
            expect(typeof headers).toBe('object');
            expect(headers).toHaveProperty('Content-Type');
        });

        it('should correctly trim keys and values', () => {
            Object.entries(headers).forEach(([key, value]) => {
                expect(key).toBe(key.trim());
                expect(value).toBe(value.trim());
            });
        });
    });

    describe('extractBody', () => {
        it('should return a valid parsed JSON object', () => {
            expect(typeof body).toBe('object');
            expect(body).toHaveProperty('name'); // adjust based on test body
        });

        it('should throw an error on invalid JSON', () => {
            const tokens = ['--data-raw', '{"badJson": true,, }'];
            expect(() => extractBody(tokens)).toThrowError(
                'Invalid JSON body in curl command'
            );
        });

        it('should return undefined if no body is present', () => {
            const tokens = ['curl', '--request', 'GET', 'https://example.com'];
            expect(extractBody(tokens)).toBeUndefined();
        });
    });

    describe('extractAuthHeader', () => {
        it('should extract the bearer token and remove the Authorization header', () => {
            const testHeaders = {
                Authorization: 'Bearer abc123',
                'Content-Type': 'application/json',
            };
            const result = extractAuthHeader(testHeaders);
            expect(result).toBe('Bearer abc123');
            expect(testHeaders).not.toHaveProperty('Authorization');
        });

        it('should return undefined if no Authorization header exists', () => {
            const testHeaders = {'X-Test': 'value'};
            const result = extractAuthHeader(testHeaders);
            expect(result).toBeUndefined();
        });

        it('should not delete non-Bearer auth schemes', () => {
            const testHeaders = {Authorization: 'Basic abc123'};
            const result = extractAuthHeader(testHeaders);
            expect(result).toBe('Basic abc123');
            expect(testHeaders).toHaveProperty('Authorization');
        });
    });
});
