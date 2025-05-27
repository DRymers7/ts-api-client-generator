export type HTTP_METHOD =
    | 'GET'
    | 'POST'
    | 'PUT'
    | 'DELETE'
    | 'PATCH'
    | 'OPTIONS'
    | 'HEAD';

export const staticTypedRequest: string = `interface apiParameters {
    targetUrl: string;
    httpMethod: HTTP_METHOD;
    authToken?: string;
    requestHeaders?: Record<string, string>;
    queryParams?: Record<string, string>;
    requestBody?: object;
};`;