import {HTTP_METHOD} from './types';
import axios from 'axios';

/**
 * Wrapped object of working request/response
 */
interface callResult {
    response: apiResponse;
    requestUsed: apiParameters;
}

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
 * Calls the provided REST API using Axios and returns a structured response.
 *
 * @param {apiParameters} parameters - Configuration for the API request, including URL, method, headers, query params, and body.
 * @returns {Promise<callResult>} - Structured response containing status, code, and optional body.
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
    } catch (error: any) {
        return {
            response: {
                responseStatus: error.response?.statusText || 'Network Error',
                responseCode: error.response?.status || 500,
                responseBody: error.response?.data || {error: error.message},
            },
            requestUsed: parameters,
        };
    }
};

export {callSuppliedApi, apiParameters, apiResponse, callResult};
