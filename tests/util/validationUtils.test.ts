import {describe, test, expect, vi, beforeEach, afterEach} from 'vitest';
import {
    validateComponentName,
    validateFileCanBeRead,
    validateFileExists,
    validateOutputPath,
    validateProgramArguments,
    ValidationResult,
} from '../../src/util/validationUtils';
import {ValidationError} from '../../src/core/errors';

// Fully mock 'fs' module at the top level
vi.mock('fs', () => {
    return {
        existsSync: vi.fn(),
        accessSync: vi.fn(),
        constants: {R_OK: 4},
    };
});

// Import after mock
import * as fs from 'fs';

describe('Validation Utilities', () => {
    const mockedExistsSync = fs.existsSync as vi.Mock;
    const mockedAccessSync = fs.accessSync as vi.Mock;

    beforeEach(() => {
        mockedExistsSync.mockReset();
        mockedAccessSync.mockReset();
    });

    // ─────────── validateComponentName ───────────
    test('validateComponentName: valid', () => {
        expect(validateComponentName('MyComponent')).toEqual({isValid: true});
    });

    test('validateComponentName: empty', () => {
        const result = validateComponentName('');
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toMatch(/empty/);
    });

    test('validateComponentName: lowercase start', () => {
        const result = validateComponentName('component');
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toMatch(/uppercase/);
    });

    test('validateComponentName: invalid characters', () => {
        const result = validateComponentName('Invalid@Name!');
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toMatch(/invalid characters/);
    });

    test('validateComponentName: too long', () => {
        const result = validateComponentName('A'.repeat(101));
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toMatch(/too long/);
    });

    // ─────────── validateOutputPath ───────────
    test('validateOutputPath: valid', () => {
        expect(validateOutputPath('./src/components')).toEqual({isValid: true});
    });

    test('validateOutputPath: empty', () => {
        const result = validateOutputPath('');
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toMatch(/empty/);
    });

    test('validateOutputPath: invalid characters', () => {
        const result = validateOutputPath('C:\\invalid|path');
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toMatch(/invalid characters/);
    });

    // ─────────── validateFileExists ───────────
    test('validateFileExists: exists', () => {
        mockedExistsSync.mockReturnValue(true);
        const result = validateFileExists('file.txt');
        expect(result.isValid).toBe(true);
    });

    test('validateFileExists: missing', () => {
        mockedExistsSync.mockReturnValue(false);
        const result = validateFileExists('missing.txt');
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toMatch(/does not exist/);
    });

    test('validateFileExists: null input', () => {
        const result = validateFileExists(null as any);
        expect(result.isValid).toBe(false);
    });

    // ─────────── validateFileCanBeRead ───────────
    test('validateFileCanBeRead: readable', () => {
        mockedAccessSync.mockImplementation(() => {});
        const result = validateFileCanBeRead('file.txt');
        expect(result.isValid).toBe(true);
    });

    test('validateFileCanBeRead: unreadable', () => {
        mockedAccessSync.mockImplementation(() => {
            throw new Error('fail');
        });
        const result = validateFileCanBeRead('file.txt');
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toMatch(/cannot be read/);
    });

    // ─────────── validateProgramArguments ───────────
    test('validateProgramArguments: all valid', () => {
        mockedExistsSync.mockReturnValue(true);
        mockedAccessSync.mockImplementation(() => {});
        expect(() => {
            validateProgramArguments('input.txt', './out', 'MyComponent');
        }).not.toThrow();
    });

    test('validateProgramArguments: throws on invalid component name', () => {
        mockedExistsSync.mockReturnValue(true);
        mockedAccessSync.mockImplementation(() => {});
        expect(() => {
            validateProgramArguments('input.txt', './out', 'my_component');
        }).toThrow(ValidationError);
    });

    test('validateProgramArguments: throws on unreadable file', () => {
        mockedExistsSync.mockReturnValue(true);
        mockedAccessSync.mockImplementation(() => {
            throw new Error('no access');
        });
        expect(() => {
            validateProgramArguments('input.txt', './out', 'MyComponent');
        }).toThrow(ValidationError);
    });

    test('validateProgramArguments: throws on file not existing', () => {
        mockedExistsSync.mockReturnValue(false);
        expect(() => {
            validateProgramArguments('input.txt', './out', 'MyComponent');
        }).toThrow(ValidationError);
    });

    test('validateProgramArguments: throws on bad output path', () => {
        mockedExistsSync.mockReturnValue(true);
        mockedAccessSync.mockImplementation(() => {});
        expect(() => {
            validateProgramArguments('input.txt', '', 'MyComponent');
        }).toThrow(ValidationError);
    });
});
