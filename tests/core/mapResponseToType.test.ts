import {describe, it, expect} from 'vitest';
import {
    InterfaceMap,
    generateResponseType,
    inferType,
    generateTypeFromObject,
    validateResponseBody,
    convertToPascalCase,
    isOptional,
} from '../../src/core/mapResponseToType';
import {apiResponse} from '../../src/core/callSuppliedApi';

/**
 * Test suite for mapResponseToType module
 * If working correctly, this module should be able to take in
 * an apiResponse and generate a correct type from response.responseBody
 */
describe('mapResponseToType module tests', () => {
    describe('convertToPascalCase function', () => {
        it('should convert strings to PascalCase', () => {
            expect(convertToPascalCase('api_response')).toBe('ApiResponse');
            expect(convertToPascalCase('foo bar')).toBe('FooBar');
            expect(convertToPascalCase('test-case')).toBe('TestCase');
        });
    });

    describe('isOptional function', () => {
        it('should return true for undefined and null', () => {
            expect(isOptional(undefined)).toBe(true);
            expect(isOptional(null)).toBe(true);
        });

        it('should return false for other values', () => {
            expect(isOptional(0)).toBe(false);
            expect(isOptional('')).toBe(false);
            expect(isOptional(false)).toBe(false);
        });
    });

    describe('validateResponseBody function', () => {
        it('should pass with valid object', () => {
            const obj = {a: 1};
            expect(validateResponseBody(obj)).toBe(obj);
        });

        it('should throw error on null, array, or non-object', () => {
            expect(() => validateResponseBody([])).toThrow();
        });
    });

    describe('inferType function', () => {
        it('should infer primitive types correctly', () => {
            const map: InterfaceMap = {};
            expect(inferType('foo', 'bar', map, 'Parent')).toBe('string');
            expect(inferType('flag', true, map, 'Parent')).toBe('boolean');
            expect(inferType('num', 42, map, 'Parent')).toBe('number');
            expect(inferType('empty', null, map, 'Parent')).toBe('null');
        });

        it('should handle arrays and nested objects', () => {
            const map: InterfaceMap = {};
            expect(inferType('arr', [1, 2], map, 'Parent')).toBe('number[]');
            expect(inferType('obj', {a: 1}, map, 'Parent')).toBe('ParentObj');
            expect(map['ParentObj']).toContain('interface ParentObj');
        });

        it('should default empty arrays to any[]', () => {
            const map: InterfaceMap = {};
            expect(inferType('emptyArr', [], map, 'Parent')).toBe('any[]');
        });
    });

    describe('generateTypeFromObject function', () => {
        it('should generate a single interface correctly', () => {
            const map: InterfaceMap = {};
            generateTypeFromObject({id: 1, name: 'John'}, 'User', map);
            expect(map['User']).toMatchInlineSnapshot(`
"interface User {
  id: number;
  name: string;
}"
`);
        });

        it('should generate nested interfaces', () => {
            const map: InterfaceMap = {};
            generateTypeFromObject(
                {
                    id: 1,
                    profile: {
                        age: 30,
                        email: 'a@example.com',
                    },
                },
                'Account',
                map
            );

            expect(Object.keys(map)).toEqual(['AccountProfile', 'Account']);
            expect(map['Account']).toContain('profile: AccountProfile');
        });
    });

    describe('generateResponseType function', () => {
        it('should generate full interface tree from apiResponse', () => {
            const mockResponse: apiResponse = {
                responseStatus: 'OK',
                responseCode: 200,
                responseBody: {
                    userId: 123,
                    name: 'Alice',
                    settings: {
                        darkMode: true,
                        layout: 'grid',
                    },
                    tags: ['admin', 'user'],
                },
            };

            const result = generateResponseType(mockResponse, 'UserResponse');
            expect(result).toContain('interface UserResponse');
            expect(result).toContain('interface UserResponseSettings');
            expect(result).toContain('settings: UserResponseSettings;');
            expect(result).toContain('tags: string[];');
        });

        it('should throw for invalid response body', () => {
            const badResponse: apiResponse = {
                responseStatus: 'OK',
                responseCode: 200,
                responseBody: undefined,
            };

            expect(() => generateResponseType(badResponse, 'Bad')).toThrow();
        });
    });
});
