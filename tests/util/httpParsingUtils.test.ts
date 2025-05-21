import {describe, it, expect, beforeAll} from 'vitest';
import {
    splitAndFilterLines,
    extractMethodAndUrl,
    createRecordOfHeaders,
    parseRequestBody,
    parseAuthHeader,
} from '../../src/util/httpParsingUtils';
import path from 'path';
import fs from 'fs';

/**
 * Module tests for httpParsingUtils. Follows a progressive pattern
 * to build upon each function call, as it does in the actual code implementation.
 *
 * To extend test coverage, simply point this to different .http files and run each.
 */
describe('Test suite for http file parsing utility functions', () => {
    const httpFilePath = path.join(__dirname, 'test_files/test-request.http');
    const rawContent = fs.readFileSync(httpFilePath, 'utf-8');
    const fileContentArray: string[] = splitAndFilterLines(rawContent);
    const extractedMethodAndUrl: string[] =
        extractMethodAndUrl(fileContentArray);
    const [parsedHeaders, updatedBodyStartIndex] = createRecordOfHeaders(
        fileContentArray,
        1
    );
    const parsedBody = parseRequestBody(
        fileContentArray,
        updatedBodyStartIndex
    );
    // pass a shallow copy to preserve the original in other tests
    const extractedAuthHeader = parseAuthHeader({...parsedHeaders});

    beforeAll(() => {});

    describe('splitAndFilterLines function', () => {
        it('should return an array of strings', () => {
            expect(Array.isArray(fileContentArray)).toBe(true);
            fileContentArray.forEach((item) => {
                expect(typeof item).toBe('string');
            });
        });

        it('should have the expected number of lines', () => {
            expect(fileContentArray.length).toEqual(9);
        });
    });

    describe('extractMethodAndUrl function', () => {
        it('should return an array of all string values', () => {
            expect(Array.isArray(extractedMethodAndUrl)).toBe(true);
            extractedMethodAndUrl.forEach((item) => {
                expect(typeof item).toBe('string');
            });
        });

        it('should have the expected number of lines and correct values', () => {
            expect(extractedMethodAndUrl.length).toEqual(2);
            expect(extractedMethodAndUrl[0]).toEqual('POST');
            expect(extractedMethodAndUrl[1]).toEqual(
                'https://api.example.com/v1/users/create'
            );
        });

        it('should throw an error if method or URL is missing', () => {
            const emptyFileLines: string[] = ['', ''];
            expect(() => extractMethodAndUrl(emptyFileLines)).toThrowError();
        });
    });

    describe('createRecordOfHeaders function', () => {
        it('should return an object with all parsed headers', () => {
            expect(typeof parsedHeaders).toBe('object');
            expect(parsedHeaders).toHaveProperty('Content-Type');
            expect(parsedHeaders['Content-Type']).toBe('application/json');
        });

        it('should trim header keys and values correctly', () => {
            Object.entries(parsedHeaders).forEach(([key, value]) => {
                expect(key).toBe(key.trim());
                expect(value).toBe(value.trim());
            });
        });

        it('should skip lines without a colon', () => {
            const keys = Object.keys(parsedHeaders);
            expect(keys).not.toContain('Authorization Bearer token'); // malformed headers skipped
        });

        it('should stop parsing when the body starts (i.e., at a JSON block)', () => {
            // Confirm the next line in the file is the body start
            const nextLine = fileContentArray[updatedBodyStartIndex];
            expect(nextLine.startsWith('{') || nextLine.startsWith('[')).toBe(
                true
            );
        });

        it('should increase bodyStartIndex based on valid headers', () => {
            // Assuming headers span lines 1-3, we expect bodyStartIndex = 4
            expect(updatedBodyStartIndex).toBeGreaterThan(1);
        });
    });

    describe('parseRequestBody function', () => {
        it('should return a valid JSON object from the body', () => {
            expect(typeof parsedBody).toBe('object');
            expect(parsedBody).not.toBeNull();
            expect(parsedBody).toHaveProperty('name'); // or a property in your test body
        });

        it('should correctly parse nested JSON if present', () => {
            if (parsedBody && typeof parsedBody === 'object') {
                const keys = Object.keys(parsedBody);
                expect(keys.length).toBeGreaterThan(0);
            }
        });

        it('should return undefined if there is no body content', () => {
            const linesWithoutBody = fileContentArray.slice(
                0,
                updatedBodyStartIndex
            ); // chop off JSON
            const body = parseRequestBody(
                linesWithoutBody,
                updatedBodyStartIndex
            );
            expect(body).toBeUndefined();
        });

        it('should throw an error for invalid JSON', () => {
            const brokenJsonLines = [
                'POST https://api.example.com',
                'Content-Type: application/json',
                '',
                '{ "name": "John", "age": 30,, }', // invalid JSON
            ];
            expect(() => parseRequestBody(brokenJsonLines, 3)).toThrowError(
                'Invalid JSON body in .http file'
            );
        });
    });

    describe('parseAuthHeader function', () => {
        it('should extract a Bearer token if Authorization header is present', () => {
            const headers = {
                Authorization: 'Bearer my-secret-token',
                'Content-Type': 'application/json',
            };

            const token = parseAuthHeader({...headers});
            expect(token).toBe('Bearer my-secret-token');
        });

        it('should extract token from lowercase "authorization" key', () => {
            const headers = {
                authorization: 'Bearer lower-case-token',
            };

            const token = parseAuthHeader({...headers});
            expect(token).toBe('Bearer lower-case-token');
        });

        it('should remove the Authorization header after parsing', () => {
            const headers = {
                Authorization: 'Bearer cleanup-token',
                'X-Other-Header': 'value',
            };

            const token = parseAuthHeader(headers);
            expect(token).toBe('Bearer cleanup-token');
            expect(headers).not.toHaveProperty('Authorization');
        });

        it('should return undefined if no Authorization header is present', () => {
            const headers = {
                'Content-Type': 'application/json',
            };

            const token = parseAuthHeader(headers);
            expect(token).toBeUndefined();
        });

        it('should not delete non-Bearer authorization headers', () => {
            const headers = {
                Authorization: 'Basic abc123',
            };

            const token = parseAuthHeader(headers);
            expect(token).toBe('Basic abc123');
            expect(headers).toHaveProperty('Authorization'); // not deleted
        });
    });
});
