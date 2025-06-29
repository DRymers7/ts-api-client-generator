/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs';
import {vi, describe, it, expect, beforeEach, afterEach} from 'vitest';
import {
    validateComponentName,
    validateFileExists,
    validateFileCanBeRead,
    validateOutputPath,
    validateProgramArguments,
} from '../../src/util/validationUtils';
import {ValidationError} from '../../src/core/errors';

/**
 * Test suite for validation utilities module. This module is in charge of validating all program
 * args and verifying that there are no errors prior to a run.
 */
describe('Validation Utilities', () => {
    let existsSyncSpy: any;
    let accessSyncSpy: any;

    beforeEach(() => {
        existsSyncSpy = vi.spyOn(fs, 'existsSync');
        accessSyncSpy = vi.spyOn(fs, 'accessSync');
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('validateFileExists function', () => {
        it('returns valid result if file exists', () => {
            existsSyncSpy.mockReturnValue(true);
            const result = validateFileExists('test.txt');
            expect(result.isValid).toBe(true);
        });

        it('returns invalid result if file path is missing', () => {
            const result = validateFileExists(undefined);
            expect(result.isValid).toBe(false);
            expect(result.errorMessage).toMatch(
                /Input file path does not exist/
            );
        });

        it('returns invalid result if file does not exist', () => {
            existsSyncSpy.mockReturnValue(false);
            const result = validateFileExists('missing.txt');
            expect(result.isValid).toBe(false);
            expect(result.errorMessage).toMatch(
                /Input file path does not exist/
            );
        });
    });

    describe('validateFileCanBeRead function', () => {
        it('returns valid result if file is readable', () => {
            accessSyncSpy.mockImplementation(() => {});
            const result = validateFileCanBeRead('readable.txt');
            expect(result.isValid).toBe(true);
        });

        it('returns invalid result if file path is missing', () => {
            const result = validateFileCanBeRead(undefined);
            expect(result.isValid).toBe(false);
            expect(result.errorMessage).toMatch(
                /Input file path does not exist/
            );
        });

        it('returns invalid result if file cannot be read', () => {
            accessSyncSpy.mockImplementation(() => {
                throw new Error('No read access');
            });
            const result = validateFileCanBeRead('unreadable.txt');
            expect(result.isValid).toBe(false);
            expect(result.errorMessage).toMatch(/Input file cannot be read/);
        });
    });

    describe('validateComponentName function', () => {
        it('returns valid result for proper PascalCase name', () => {
            const result = validateComponentName('UserComponent');
            expect(result.isValid).toBe(true);
        });

        it('returns invalid result for empty component name', () => {
            const result = validateComponentName('');
            expect(result.isValid).toBe(false);
            expect(result.errorMessage).toMatch(
                'Component name is required and must be a string'
            );
        });

        it('returns invalid result for lowercase name', () => {
            const result = validateComponentName('userComponent');
            expect(result.isValid).toBe(false);
            expect(result.errorMessage).toMatch(
                /must start with an uppercase letter/
            );
        });

        it('returns invalid result for name with invalid characters', () => {
            const result = validateComponentName('Invalid-Component');
            expect(result.isValid).toBe(false);
            expect(result.errorMessage).toMatch(/contains invalid characters/);
        });

        it('returns invalid result for name too long', () => {
            const longName = 'A'.repeat(101);
            const result = validateComponentName(longName);
            expect(result.isValid).toBe(false);
            expect(result.errorMessage).toMatch(/too long/);
        });
    });

    describe('validateOutputPath function', () => {
        it('returns valid result for good path', () => {
            const result = validateOutputPath('./src/components');
            expect(result.isValid).toBe(true);
        });

        it('returns invalid result for empty path', () => {
            const result = validateOutputPath('');
            expect(result.isValid).toBe(false);
            expect(result.errorMessage).toMatch(
                'Output path is required and must be a string'
            );
        });

        it('returns invalid result for path with invalid characters', () => {
            const result = validateOutputPath('invalid:path');
            expect(result.isValid).toBe(false);
            expect(result.errorMessage).toMatch(/contains invalid characters/);
        });
    });

    describe('validateProgramArguments function', () => {
        it('throws ValidationError if any validation fails', () => {
            existsSyncSpy.mockReturnValue(false);
            expect(() => {
                validateProgramArguments(
                    'missing.txt',
                    './output',
                    'MyComponent'
                );
            }).toThrow(ValidationError);
        });

        it('does not throw if all validations pass', () => {
            existsSyncSpy.mockReturnValue(true);
            accessSyncSpy.mockImplementation(() => {});
            expect(() => {
                validateProgramArguments(
                    'valid.txt',
                    './output',
                    'MyComponent'
                );
            }).not.toThrow();
        });
    });
});
