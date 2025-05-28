/**
 * Module responsible for accepting the result of callSuppliedApi and subsequently
 * mapping that response to a specific type that can be used in a react component.
 */
import {apiResponse} from './callSuppliedApi';
import { ResponseTypeGenerationError } from './errors';

/**
 * A mapping of interface names to their stringified TypeScript definitions.
 */
interface InterfaceMap {
    [key: string]: string;
}

/**
 * Generates a complete TypeScript interface definition string from an `apiResponse`.
 *
 * @param restCallResponse - The result object returned by a REST API call.
 * @param rootName - The name of the root interface to be generated (default: 'ApiResponse').
 * @returns A string containing one or more TypeScript interfaces. It must be done this way because
 * of TS runtime erasure.
 */
const generateResponseType = (
    restCallResponse: apiResponse,
    rootName: string = 'ApiResponse'
): string => {
    try {
        const responseBody = validateResponseBody(restCallResponse.responseBody);

        const interfaces: InterfaceMap = {};
        const rootTypeName = convertToPascalCase(rootName);
        generateTypeFromObject(responseBody, rootTypeName, interfaces);

        return Object.values(interfaces).join('\n\n');
    } catch (error: any) {
        throw new ResponseTypeGenerationError();
    }
};

/**
 * Infers a TypeScript type for a given key-value pair from a JSON object.
 *
 * @param key - The property name from the object.
 * @param value - The value corresponding to the key.
 * @param interfaces - A shared map used to accumulate interface definitions.
 * @param parentTypeName - The name of the parent interface (used for nested naming).
 * @returns The inferred TypeScript type as a string.
 */
const inferType = (
    key: string,
    value: any,
    interfaces: InterfaceMap,
    parentTypeName: string
): string => {
    if (value === null) return 'null';
    if (Array.isArray(value)) {
        if (value.length === 0) return 'any[]';
        const first = value[0];
        const arrayType = inferType(key, first, interfaces, parentTypeName);
        return `${arrayType}[]`;
    }
    if (typeof value === 'object') {
        const nestedTypeName = convertToPascalCase(`${parentTypeName}_${key}`);
        generateTypeFromObject(value, nestedTypeName, interfaces);
        return nestedTypeName;
    }
    if (typeof value === 'string') return 'string';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number')
        return Number.isInteger(value) ? 'number' : 'number';
    return 'any';
};

/**
 * Recursively generates TypeScript interface definitions for a given object.
 *
 * @param obj - The object to inspect.
 * @param typeName - The name of the interface to create.
 * @param interfaces - A shared map to accumulate all interface definitions.
 */
const generateTypeFromObject = (
    obj: object,
    typeName: string,
    interfaces: InterfaceMap
): void => {
    const lines: string[] = [`interface ${typeName} {`];

    for (const [key, value] of Object.entries(obj)) {
        const optionalFlag = isOptional(value) ? '?' : '';
        const fieldType = inferType(key, value, interfaces, typeName);
        lines.push(`  ${key}${optionalFlag}: ${fieldType};`);
    }

    lines.push('}');
    interfaces[typeName] = lines.join('\n');
};

/**
 * Validates that the response body is a non-null, non-array object.
 *
 * @param responseBody - The body of the API response.
 * @returns The validated response body if it is an object.
 * @throws If the input is null, undefined, an array, or not an object.
 */
const validateResponseBody = (responseBody?: object): object => {
    if (
        !responseBody ||
        typeof responseBody !== 'object' ||
        Array.isArray(responseBody)
    ) {
        throw new Error('Response body must be a non-null object');
    }
    return responseBody;
};

/**
 * Converts a string to PascalCase. Removes special characters and capitalizes words.
 *
 * @param inputString - The input string to convert.
 * @returns A PascalCase version of the input.
 */
const convertToPascalCase = (inputString: string): string => {
    return inputString
        .replace(/[^a-zA-Z0-9]/g, ' ')
        .replace(/\s+(.)/g, (_, group1) => group1.toUpperCase())
        .replace(/^\w/, (character) => character.toUpperCase());
};

/**
 * Checks whether a value is considered "optional" in the context of an interface.
 *
 * @param value - The value to inspect.
 * @returns `true` if the value is `undefined` or `null`, otherwise `false`.
 */
const isOptional = (value: any): boolean => {
    return value === undefined || value === null;
};

export {
    InterfaceMap,
    generateResponseType,
    inferType,
    generateTypeFromObject,
    validateResponseBody,
    convertToPascalCase,
    isOptional,
};
