import {describe, it, expect} from 'vitest';
import {
    apiParameters,
    apiResponse,
    callSuppliedApi,
} from '../../src/core/callSuppliedApi';
import {ApiCallError} from '../../src/core/errors';
import {HTTP_METHOD} from '../../src/core/types';

const OPEN_URL: string = 'https://restcountries.com/v3.1/all';

/**
 * Tests for callSuppliedApi. If working correctly, these tests
 * should:
 *
 * 1. Call the countries rest api and verify that the correct response was received
 * 2. Call an api that does not exist and verify that a correct ApiCallError was thrown
 * 3. Test different types of API failures to ensure proper error categorization
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

    it('should throw ApiCallError for network failures (bad domain)', async () => {
        const parameters: apiParameters = {
            targetUrl: 'https://this-domain-definitely-does-not-exist.com/api',
            httpMethod: 'GET',
            authToken: undefined,
            requestHeaders: undefined,
            queryParams: undefined,
            requestBody: undefined,
        };

        // Method 1: Using rejects.toThrow (recommended for specific error types)
        await expect(callSuppliedApi(parameters)).rejects.toThrow(ApiCallError);

        // Method 2: More detailed assertions about the error
        await expect(callSuppliedApi(parameters)).rejects.toThrow(
            expect.objectContaining({
                name: 'ApiCallError',
            })
        );
    }, 10000);

    it('should throw ApiCallError for HTTP error responses (404)', async () => {
        const parameters: apiParameters = {
            targetUrl: 'https://httpbin.org/status/404', // httpbin returns 404
            httpMethod: 'GET',
            authToken: undefined,
            requestHeaders: undefined,
            queryParams: undefined,
            requestBody: undefined,
        };

        // Test that we get the right type of error with correct status code
        try {
            await callSuppliedApi(parameters);
            // If we reach this point, the test should fail because no error was thrown
            expect(true).toBe(false); // Force failure with descriptive message
        } catch (error: any) {
            expect(error).toBeInstanceOf(ApiCallError);
            expect(error.message).toContain('404');
        }
    }, 10000);

    it('should preserve request parameters in the response', async () => {
        const parameters: apiParameters = {
            targetUrl: OPEN_URL,
            httpMethod: 'GET',
            authToken: 'test-token',
            requestHeaders: {'X-Test': 'value'},
            queryParams: {param: 'test'},
            requestBody: undefined,
        };

        const result = await callSuppliedApi(parameters);

        // Verify that the original request parameters are preserved
        expect(result.requestUsed).toEqual(parameters);
        expect(result.requestUsed.authToken).toBe('test-token');
        expect(result.requestUsed.requestHeaders).toEqual({'X-Test': 'value'});
    }, 10000);
});
