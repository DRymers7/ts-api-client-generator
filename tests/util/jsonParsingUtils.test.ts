/* eslint-disable @typescript-eslint/no-explicit-any */
import {describe, it, expect} from 'vitest';
import path from 'path';
import fs from 'fs';
import {
    extractHttpMethod,
    extractTargetUrl,
    extractHeadersFromRequest,
    extractJsonBodyFromRequest,
    extractAuthHeader,
} from '../../src/util/jsonParsingUtils';
import {PostmanRequest} from '../../src/core/types';

/**
 * Module tests for jsonParsingUtils. Follows a progressive pattern
 * to build upon each function call, as it does in the actual code implementation.
 */
describe('Test suite for json file parsing utility functions', () => {
    const jsonFilePath = path.join(
        __dirname,
        'test_files/test-request_json.json'
    );
    const rawJson = fs.readFileSync(jsonFilePath, 'utf-8');
    const jsonFileContent: any = JSON.parse(rawJson);
    const httpMethod: any = extractHttpMethod(jsonFileContent);
    const targetUrl: any = extractTargetUrl(jsonFileContent);
    const requestHeaders = extractHeadersFromRequest(jsonFileContent);
    const requestBody = extractJsonBodyFromRequest(jsonFileContent);

    describe('extractHttpMethod function', () => {
        it('should successfully retrieve the defined HTTP method', () => {
            expect(httpMethod).toBe('POST');
        });

        it('should default to GET if no method is available', () => {
            const emptyRequest: any = {};
            expect(extractHttpMethod(emptyRequest)).toBe('GET');
        });
    });

    describe('extractTargetUrl function', () => {
        it('should extract the raw URL string if available', () => {
            expect(typeof targetUrl).toBe('string');
            expect(targetUrl).toBe('https://api.example.com/v1/users/create');
        });

        it('should build the URL from host and path if raw is not present', () => {
            const fallbackRequest = {
                url: {
                    host: ['api', 'example', 'com'],
                    path: ['v1', 'projects', 'list'],
                },
            };
            const result = extractTargetUrl(fallbackRequest);
            expect(result).toBe('https://api.example.com/v1/projects/list');
        });

        it('should return an empty string if URL is not present', () => {
            expect(extractTargetUrl({})).toBe('');
        });
    });

    describe('extractHeadersFromRequest function', () => {
        it('should return a record of header key-value pairs', () => {
            expect(typeof requestHeaders).toBe('object');
            expect(requestHeaders).toHaveProperty('Content-Type');
            expect(requestHeaders).toHaveProperty('Authorization');
        });

        it('should not include undefined or null headers', () => {
            const requestWithBadHeaders: PostmanRequest = {
                header: [
                    {key: 'X-Test', value: '123'},
                    {key: '', value: 'abc'},
                    {key: 'Invalid', value: ''},
                ],
            };
            const headers = extractHeadersFromRequest(requestWithBadHeaders);
            expect(headers).toEqual({'X-Test': '123'});
        });
    });

    describe('extractJsonBodyFromRequest function', () => {
        it('should return a parsed object from the raw body', () => {
            expect(typeof requestBody).toBe('object');
            expect(requestBody).toHaveProperty('name');
            expect(requestBody).toHaveProperty('email');
        });

        it('should return undefined if raw body is missing', () => {
            const noBodyRequest = {body: {}};
            expect(extractJsonBodyFromRequest(noBodyRequest)).toBeUndefined();
        });

        it('should throw an error if raw body is invalid JSON', () => {
            const badRequest = {
                body: {
                    raw: '{ "invalid": true,, }',
                },
            };
            expect(() => extractJsonBodyFromRequest(badRequest)).toThrowError(
                'Invalid JSON in Postman request body'
            );
        });
    });

    describe('extractAuthHeader function', () => {
        it('should return a Bearer token and remove the Authorization header', () => {
            const headers = {
                Authorization: 'Bearer my-secret-token',
                'Content-Type': 'application/json',
            };
            const token = extractAuthHeader(headers);
            expect(token).toBe('Bearer my-secret-token');
            expect(headers).not.toHaveProperty('Authorization');
        });

        it('should return undefined if no Authorization header exists', () => {
            const headers = {'X-Other': 'value'};
            expect(extractAuthHeader(headers)).toBeUndefined();
        });

        it('should preserve non-Bearer auth headers', () => {
            const headers = {Authorization: 'Basic abc123'};
            const token = extractAuthHeader(headers);
            expect(token).toBe('Basic abc123');
            expect(headers).toHaveProperty('Authorization');
        });
    });
});
