/**
 * Centralized validation utilities for input validation across the application.
 */
import fs, {constants} from 'fs';
import {ValidationError} from '../core/errors';

/**
 * Represents the result of a validation operation.
 * Using a result type instead of throwing exceptions makes validation
 * composable and testable.
 */
interface ValidationResult {
    isValid: boolean;
    errorMessage?: string;
    suggestions?: string[];
}

/**
 * Creates a successful validation result.
 */
const createValidResult = (): ValidationResult => ({isValid: true});

/**
 * Creates a failed validation result with error message and optional suggestions.
 */
const createInvalidResult = (
    errorMessage: string,
    suggestions: string[] = []
): ValidationResult => ({
    isValid: false,
    errorMessage,
    suggestions,
});

/**
 * Validates a file exists on the path.
 *
 * @param filePath path to provided input file.
 * @returns Validation result depending on whether or not the file
 * exists.
 */
const validateFileExists = (filePath: string | undefined): ValidationResult => {
    if (!filePath || filePath === '') {
        return createInvalidResult('Input file path does not exist.', [
            'Please ensure that the file path to the test is correct, and exists.',
        ]);
    }

    if (!fs.existsSync(filePath)) {
        return createInvalidResult('Input file path does not exist.', [
            'Please ensure that the file path to the test is correct, and exists.',
        ]);
    }

    return createValidResult();
};

/**
 * Validates a file can be read.
 *
 * @param filePath path to provided input file.
 * @returns Validation result depending on whether or not the file
 * can be read.
 */
const validateFileCanBeRead = (
    filePath: string | undefined
): ValidationResult => {
    if (!filePath || filePath.trim() === '') {
        return createInvalidResult('Input file path does not exist.', [
            'Please ensure that the file path to the test is correct, and exists.',
        ]);
    }

    try {
        fs.accessSync(filePath, constants.R_OK);
    } catch (error: unknown) {
        return createInvalidResult('Input file cannot be read.', [
            'Please ensure that the provided file has the correct permissions.',
        ]);
    }

    return createValidResult();
};

/**
 * Validates that a component name follows React naming conventions.
 *
 * React component names must:
 * - Start with an uppercase letter (PascalCase)
 * - Contain only letters, numbers, underscores, and dollar signs
 * - Not be empty or just whitespace
 */
const validateComponentName = (
    componentName: string | undefined
): ValidationResult => {
    // Check for null, undefined, or empty string
    if (!componentName || typeof componentName !== 'string') {
        return createInvalidResult(
            'Component name is required and must be a string',
            [
                'Provide a valid component name like "UserComponent" or "DataFetcher"',
            ]
        );
    }

    // Trim whitespace and check if anything remains
    const trimmed = componentName.trim();
    if (trimmed.length === 0) {
        return createInvalidResult(
            'Component name cannot be empty or only whitespace',
            ['Provide a meaningful component name like "ApiComponent"']
        );
    }

    // Check if it starts with uppercase letter (PascalCase requirement)
    if (!/^[A-Z]/.test(trimmed)) {
        return createInvalidResult(
            `Component name "${componentName}" must start with an uppercase letter (PascalCase)`,
            [
                'Examples: "UserComponent", "ApiDataFetcher", "ProfileManager"',
                `Try: "${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}"`,
            ]
        );
    }

    // Check for valid JavaScript identifier characters
    // React components can use letters, numbers, underscores, and dollar signs
    if (!/^[A-Z][A-Za-z0-9_$]*$/.test(trimmed)) {
        return createInvalidResult(
            `Component name "${componentName}" contains invalid characters`,
            [
                'Use only letters, numbers, underscores, and dollar signs',
                'Examples: "UserProfile", "API_Component", "Data$Fetcher"',
            ]
        );
    }

    // Check for reasonable length (very long names are usually mistakes)
    if (trimmed.length > 100) {
        return createInvalidResult(
            `Component name "${componentName}" is too long (${trimmed.length} characters)`,
            [
                'Keep component names concise and descriptive (under 100 characters)',
            ]
        );
    }

    return createValidResult();
};

/**
 * Validates that a file path string is reasonable for use as an output directory.
 *
 * Note: This only validates the format of the path, not whether it exists
 * or is writable. File system operations should be handled separately.
 */
const validateOutputPath = (
    outputPath: string | undefined
): ValidationResult => {
    if (!outputPath || typeof outputPath !== 'string') {
        return createInvalidResult(
            'Output path is required and must be a string',
            [
                'Provide a valid directory path like "./src/components" or "/tmp/generated"',
            ]
        );
    }

    const trimmed = outputPath.trim();
    if (trimmed.length === 0) {
        return createInvalidResult('Output path cannot be empty', [
            'Provide a directory path where the component should be generated',
        ]);
    }

    // Check for obviously invalid path characters (varies by OS, but these are universally bad)
    // eslint-disable-next-line no-control-regex
    const invalidChars = /[<>:"|?*\x00-\x1f]/;
    if (invalidChars.test(trimmed)) {
        return createInvalidResult(
            `Output path "${outputPath}" contains invalid characters`,
            [
                'Avoid characters like < > : " | ? * and control characters',
                'Use forward slashes (/) or backslashes (\\) as path separators',
            ]
        );
    }

    return createValidResult();
};

/**
 * Function to validate all initial program arguments, creating
 * valid/invalid results as validations occur. If any validations fail,
 * a ValidationError will be thrown.
 */
const validateProgramArguments = (
    filePath: string | undefined,
    outputDirectory: string | undefined,
    componentName: string | undefined
): void => {
    const validationResults = [
        validateFileExists(filePath),
        validateFileCanBeRead(filePath),
        validateOutputPath(outputDirectory),
        validateComponentName(componentName),
    ];
    const failingValidations = validationResults.filter(
        (result) => !result.isValid
    );
    if (failingValidations.length !== 0) {
        throw new ValidationError(failingValidations);
    }
};

export {
    ValidationResult,
    validateComponentName,
    validateProgramArguments,
    validateOutputPath,
    validateFileExists,
    validateFileCanBeRead,
};
