import axios from 'axios';
import {ApiCallError} from './errors';
import {HTTP_METHOD} from './types';

/**
 * Parameters used for REST request to an API
 */
interface apiParameters {
    targetUrl: string;
    httpMethod: HTTP_METHOD;
    authToken?: string;
    requestHeaders?: Record<string, string>;
    queryParams?: Record<string, string>;
    requestBody?: object;
}

/**
 * Representation of REST API response
 */
interface apiResponse {
    responseStatus: string;
    responseCode: number;
    responseBody?: object;
}

/**
 * Wrapped object of working request/response
 */
interface callResult {
    response: apiResponse;
    requestUsed: apiParameters;
}

/**
 * Calls the provided REST API using Axios and returns a structured response.
 * Now throws ApiCallError for any failures to provide consistent error handling.
 *
 * @param {apiParameters} parameters - Configuration for the API request, including URL, method, headers, query params, and body.
 * @returns {Promise<callResult>} - Structured response containing status, code, and optional body.
 * @throws {ApiCallError} - When the API call fails for any reason (network, HTTP error, etc.)
 */
const callSuppliedApi = async (
    parameters: apiParameters
): Promise<callResult> => {
    try {
        const {
            targetUrl,
            httpMethod,
            authToken,
            requestHeaders,
            queryParams,
            requestBody,
        } = parameters;

        const headers: Record<string, string> = {
            ...requestHeaders,
            ...(authToken ? {Authorization: `Bearer ${authToken}`} : {}),
        };

        const config = {
            method: httpMethod,
            url: targetUrl,
            headers,
            params: queryParams,
            data: requestBody,
        };

        const result = await axios(config);

        return {
            response: {
                responseStatus: result.statusText,
                responseCode: result.status,
                responseBody: result.data as object,
            },
            requestUsed: parameters,
        };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response) {
                throw new ApiCallError(
                    error.response.status,
                    error.response.statusText || 'HTTP Error'
                );
            } else if (error.request) {
                throw new ApiCallError(
                    0,
                    'Network Error: Unable to reach the server'
                );
            } else {
                throw new ApiCallError(0, `Request Error: ${error.message}`);
            }
        } else if (error instanceof Error) {
            throw new ApiCallError(0, `Unknown error: ${error.message}`);
        } else {
            throw new ApiCallError(0, 'An unknown error occurred.');
        }
    }
};

export {callSuppliedApi, apiParameters, apiResponse, callResult};
