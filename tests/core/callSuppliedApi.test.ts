import {describe, it, expect} from 'vitest';
import {
    apiParameters,
    apiResponse,
    callSuppliedApi,
} from '../../src/core/callSuppliedApi';
import {HTTP_METHOD} from '../../src/core/types';

const OPEN_URL: string = 'https://restcountries.com/v3.1/all';

/**
 * Tests for callSuppliedApi. If working correctly, these tests
 * should:
 *
 * 1. Call the countries rest api and verify that the correct response was received
 * 2. Call an api that does not exist and verify that a correct error was returned
 *
 * This simply calls an open api and verifies we can get the response. As such,
 * the timeout for this test is intentionally long.
 */
describe('callSuppliedApi module tests', () => {
    it('should successfully call a real downstream API and return a valid response', async () => {
        const parameters: apiParameters = {
            targetUrl: OPEN_URL,
            httpMethod: 'GET',
            authToken: undefined,
            requestHeaders: undefined,
            queryParams: undefined,
            requestBody: undefined,
        };

        const result = await callSuppliedApi(parameters);

        expect(result.response.responseCode).toBe(200);
        expect(result.response.responseStatus).toBe('OK');
        expect(typeof result.response.responseBody).toBe('object');
        expect(Array.isArray(result.response.responseBody)).toBe(true);
    }, 10000);

    it('should handle errors gracefully for a bad URL', async () => {
        const parameters: apiParameters = {
            targetUrl: 'https://this-api-does-not-exist.com/bad-endpoint',
            httpMethod: 'GET',
            authToken: undefined,
            requestHeaders: undefined,
            queryParams: undefined,
            requestBody: undefined,
        };

        const result = await callSuppliedApi(parameters);

        expect(result.response.responseCode).toBeGreaterThanOrEqual(400);
        expect(typeof result.response.responseBody).toBe('object');
        expect(result.response.responseStatus).toBeDefined();
    }, 10000);
});
