/**
 * Module with utilities to help parsing http files with
 * generic http requests
 */

/**
 * Splits the file content into different lines and filters out empty lines
 *
 * @param fileContent raw string content of an input http file
 * @returns string array of each line
 */
const splitAndFilterLines = (fileContent: string): string[] =>
    fileContent
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

/**
 * Inspects the array of file lines and return the HTTP method and target URL
 *
 * @param fileLines string array of each file line
 * @returns string array containing HTTP method and URL
 */
const extractMethodAndUrl = (fileLines: string[]): string[] => {
    const [method, url] = fileLines[0].split(/\s+/);
    if (!method || !url) {
        throw new Error(`Invalid request line: "${fileLines[0]}"`);
    }
    return [method, url];
};

/**
 * Creates a record of request headers and increments the bodyStartIndex until the first
 * likely value of a JSON object.
 *
 * @param fileLines string[] of file lines extracted from original content
 * @param bodyStartIndex starting value of request body in this request
 * @returns tuple of the [headers, bodyStartIndex]
 */
const createRecordOfHeaders = (
    fileLines: string[],
    initialBodyStartIndex: number
): [Record<string, string>, number] => {
    // Find where the body likely starts (first line that looks like JSON)
    const bodyStartIndex = fileLines.findIndex(
        (line, i) =>
            i >= initialBodyStartIndex &&
            (line.startsWith('{') || line.startsWith('['))
    );
    const headerLines = fileLines.slice(
        initialBodyStartIndex,
        bodyStartIndex === -1 ? fileLines.length : bodyStartIndex
    );

    const headers = headerLines.reduce(
        (acc, line) => {
            const [key, ...rest] = line.split(':');
            if (key && rest.length > 0) {
                acc[key.trim()] = rest.join(':').trim();
            }
            return acc;
        },
        {} as Record<string, string>
    );

    return [headers, bodyStartIndex === -1 ? fileLines.length : bodyStartIndex];
};

/**
 * Parses request body to a JSON object or undefined if it does not exist
 *
 * @param fileLines string[] of file lines
 * @param bodyStartIndex number indicating the index of where the request body starts
 * @returns JSON object of the parsed request body or undefined.
 */
const parseRequestBody = (
    fileLines: string[],
    bodyStartIndex: number
): object | undefined => {
    const rawBody = fileLines.slice(bodyStartIndex).join('\n');
    let parsedBody: object | undefined;

    try {
        parsedBody = rawBody ? JSON.parse(rawBody) : undefined;
        return parsedBody;
    } catch (e) {
        throw new Error('Invalid JSON body in .http file');
    }
};

/**
 * Parses auth header from record of request headers and returns the value, if it exists.
 *
 * @param requestHeaders record of request headers from given request
 * @returns string value of auth header, if exists
 */
const parseAuthHeader = (requestHeaders: Record<string, string>): string => {
    const authHeader =
        requestHeaders.Authorization ?? requestHeaders.authorization;
    if (authHeader?.toLowerCase().startsWith('bearer')) {
        // eslint-disable-next-line no-param-reassign
        delete requestHeaders.Authorization;
        // eslint-disable-next-line no-param-reassign
        delete requestHeaders.authorization;
    }
    return authHeader;
};

export {
    splitAndFilterLines,
    extractMethodAndUrl,
    createRecordOfHeaders,
    parseRequestBody,
    parseAuthHeader,
};
