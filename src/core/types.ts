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

export interface PostmanRequest {
    method?: string;
    url?:
        | string
        | {
              raw?: string;
              host?: string[];
              path?: string[];
          };
    header?: {key: string; value: string}[];
    body?: {raw?: string};
}

export type ShellToken = string | { op: string };
