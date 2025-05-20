import {describe, it, expect, beforeAll} from 'vitest';
import {
    splitAndFilterLines,
    extractMethodAndUrl,
    createRecordOfHeaders,
    parseRequestBody,
    parseAuthHeader
} from '../../src/util/httpParsingUtils';
import path from 'path';
import fs from 'fs';

describe('Test suite for http file parsing utility functions', () => {
    
    const httpFilePath = path.join(__dirname, 'test_files/test-request.http');
    const rawContent = fs.readFileSync(httpFilePath, 'utf-8');

    beforeAll(() => {

    });

    describe('splitAndFilterLines should correctly return a string array of the raw content', () => {
        const fileContentArray: string[] = splitAndFilterLines(rawContent);
        expect(fileContentArray).toBe('array');
        
    });
})