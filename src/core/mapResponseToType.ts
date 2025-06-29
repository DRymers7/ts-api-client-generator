import { apiResponse } from './callSuppliedApi';
import { ResponseTypeGenerationError } from './errors';

/**
 * Infers a top-level TypeScript type for a given object.
 * All nested objects/arrays are typed as Record<string, any> or any[].
 */
function inferTopLevelType(obj: any): string {
    if (Array.isArray(obj)) {
        // Get the first element, type its fields, but use Record for nested
        if (obj.length === 0) return "any[]";
        if (typeof obj[0] === "object" && obj[0] !== null) {
            return `${inferTopLevelType(obj[0]).replace(/;$/,"")}[]`;
        }
        // array of primitive
        return `${typeof obj[0]}[]`;
    }
    if (typeof obj === "object" && obj !== null) {
        const fields = Object.entries(obj).map(([k, v]) => {
            let fieldType: string;
            if (Array.isArray(v)) {
                fieldType = "any[]";
            } else if (typeof v === "object" && v !== null) {
                fieldType = "Record<string, any>";
            } else if (typeof v === "string") {
                fieldType = "string";
            } else if (typeof v === "number") {
                fieldType = "number";
            } else if (typeof v === "boolean") {
                fieldType = "boolean";
            } else if (v === null) {
                fieldType = "null";
            } else {
                fieldType = "any";
            }
            return `  ${k}: ${fieldType};`;
        }).join("\n");
        return `{\n${fields}\n}`;
    }
    // fallback for primitive (shouldn't occur per your requirements)
    return typeof obj;
}

/**
 * Generates a TypeScript type alias from the top-level fields of an API response.
 * Nested objects/arrays are typed as Record<string, any> or any[].
 * 
 * @param restCallResponse - The API call result.
 * @param rootName - The name for the type alias.
 * @returns The type alias as a string.
 */
const generateResponseType = (
    restCallResponse: apiResponse,
    rootName: string = 'ApiResponse'
): string => {
    try {
        const responseBody = restCallResponse.responseBody;
        if (responseBody === undefined || responseBody === null) {
            throw new Error("Response body must not be undefined or null.");
        }
        let typeAlias: string;
        if (Array.isArray(responseBody)) {
            // Arrays of object: type MyType = { ... }[]
            typeAlias = `type ${rootName} = ${inferTopLevelType(responseBody)};`;
        } else if (typeof responseBody === "object") {
            // Object
            typeAlias = `type ${rootName} = ${inferTopLevelType(responseBody)};`;
        } else {
            // Should not happen for your apiResponse, but fallback
            typeAlias = `type ${rootName} = ${typeof responseBody};`;
        }
        return typeAlias;
    } catch (error) {
        throw new ResponseTypeGenerationError();
    }
};

export {
    generateResponseType,
};
