/**
 * Module responsible for accepting the result of callSuppliedApi and subsequently
 * mapping that response to a specific type that can be used in a react component.
 */
import {appendFile} from 'fs';
import {apiResponse} from './callSuppliedApi';
import {PRIMITIVE} from './types';

interface InterfaceMap {
    [key: string]: string;
}

/**
 * Generates a typed response type from a given apiResponse.
 *
 * @param restCallResponse
 * @returns
 */
const generateResponseType = (
    restCallResponse: apiResponse,
    rootName: string = 'ApiResponse'
): string => {
    const responseBody = validateResponseBody(restCallResponse.responseBody);

    const interfaces: InterfaceMap = {};
    const rootTypeName = convertToPascalCase(rootName);
    generateTypeFromObject(responseBody, rootTypeName, interfaces);

    return Object.values(interfaces).join('\n\n');
};

/**
 *
 *
 * @param key
 * @param value
 * @param interfaces
 * @param parentTypeName
 * @returns
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
 * Recursively generates an interface for a given object and stores it in InterfaceMap
 *
 * @param obj
 * @param typeName
 * @param interfaces
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
 *
 *
 * @param responseBody
 * @returns
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
 * Simple method to convert a given input string to pascalCase
 *
 * @param inputString input value to convert
 * @returns original string in pascal casing
 */
const convertToPascalCase = (inputString: string): string => {
    return inputString
        .replace(/[^a-zA-Z0-9]/g, ' ')
        .replace(/\s+(.)/g, (_, group1) => group1.toUpperCase())
        .replace(/^\w/, (character) => character.toUpperCase());
};

/**
 * Verifies that a given value is optional from the JSON response
 *
 * @param value json value in api response
 * @returns boolean value indicating whether or not this is an optional value
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
    isOptional
};
