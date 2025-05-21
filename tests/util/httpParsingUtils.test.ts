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

describe('Test suite for http file parsing utility functions', () => {
    const httpFilePath = path.join(__dirname, 'test_files/test-request.http');
    const rawContent = fs.readFileSync(httpFilePath, 'utf-8');
    const fileContentArray: string[] = splitAndFilterLines(rawContent);
    const extractedMethodAndUrl: string[] = extractMethodAndUrl(fileContentArray);

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
            expect(extractedMethodAndUrl[1]).toEqual('https://api.example.com/v1/users/create');
        });

        it('should throw an error if method or URL is missing', () => {
            const emptyFileLines: string[] = ['', '']
            expect(() => extractMethodAndUrl(emptyFileLines)).toThrowError();
        });
    });
});
