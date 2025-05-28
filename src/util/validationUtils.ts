/**
 * Centralized validation utilities for input validation across the application.
 * 
 * This module follows the principle of separation of concerns by:
 * 1. Separating validation logic from business logic
 * 2. Making validation functions pure (no side effects)
 * 3. Returning validation results rather than throwing errors
 * 4. Being reusable across different contexts
 */

/**
 * Represents the result of a validation operation.
 * Using a result type instead of throwing exceptions makes validation
 * composable and testable.
 */
export interface ValidationResult {
    isValid: boolean;
    errorMessage?: string;
    suggestions?: string[];
}

/**
 * Creates a successful validation result.
 */
function createValidResult(): ValidationResult {
    return { isValid: true };
}

/**
 * Creates a failed validation result with error message and optional suggestions.
 */
function createInvalidResult(
    errorMessage: string, 
    suggestions: string[] = []
): ValidationResult {
    return { 
        isValid: false, 
        errorMessage, 
        suggestions 
    };
}

/**
 * Validates that a component name follows React naming conventions.
 * 
 * React component names must:
 * - Start with an uppercase letter (PascalCase)
 * - Contain only letters, numbers, underscores, and dollar signs
 * - Not be empty or just whitespace
 * 
 * This is more permissive than my original validation, aligning with
 * actual React and JavaScript identifier rules.
 */
export function validateComponentName(componentName: string): ValidationResult {
    // Check for null, undefined, or empty string
    if (!componentName || typeof componentName !== 'string') {
        return createInvalidResult(
            'Component name is required and must be a string',
            ['Provide a valid component name like "UserComponent" or "DataFetcher"']
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
                `Try: "${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}"`
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
                'Examples: "UserProfile", "API_Component", "Data$Fetcher"'
            ]
        );
    }

    // Check for reasonable length (very long names are usually mistakes)
    if (trimmed.length > 100) {
        return createInvalidResult(
            `Component name "${componentName}" is too long (${trimmed.length} characters)`,
            ['Keep component names concise and descriptive (under 100 characters)']
        );
    }

    return createValidResult();
}

/**
 * Validates that a string appears to contain TypeScript interface definitions.
 * 
 * This is intentionally basic validation since full TypeScript parsing would
 * require a complete TypeScript compiler. We check for reasonable indicators
 * that the string contains interface definitions.
 */
export function validateTypeScriptInterface(
    interfaceString: string, 
    context: string = 'interface'
): ValidationResult {
    if (!interfaceString || typeof interfaceString !== 'string') {
        return createInvalidResult(
            `${context} definition is required and must be a string`,
            ['Provide a valid TypeScript interface definition']
        );
    }

    const trimmed = interfaceString.trim();
    if (trimmed.length === 0) {
        return createInvalidResult(
            `${context} definition cannot be empty`,
            ['Provide a TypeScript interface like "interface ApiResponse { data: string; }"']
        );
    }

    // Check for basic interface syntax indicators
    const hasInterfaceKeyword = /\binterface\s+\w+/.test(trimmed);
    const hasOpeningBrace = trimmed.includes('{');
    const hasClosingBrace = trimmed.includes('}');

    if (!hasInterfaceKeyword) {
        return createInvalidResult(
            `${context} definition must contain valid interface declarations`,
            [
                'Start with "interface" keyword followed by interface name',
                'Example: "interface ApiResponse { data: string; status: number; }"'
            ]
        );
    }

    if (!hasOpeningBrace || !hasClosingBrace) {
        return createInvalidResult(
            `${context} definition appears to have malformed interface syntax`,
            [
                'Ensure interfaces have opening and closing braces',
                'Example: "interface MyInterface { property: type; }"'
            ]
        );
    }

    // Basic check for balanced braces (not perfect but catches common mistakes)
    const openBraces = (trimmed.match(/{/g) || []).length;
    const closeBraces = (trimmed.match(/}/g) || []).length;
    
    if (openBraces !== closeBraces) {
        return createInvalidResult(
            `${context} definition has unbalanced braces (${openBraces} opening, ${closeBraces} closing)`,
            [
                'Check that all interface definitions have matching opening and closing braces',
                'Use a TypeScript-aware editor to help identify syntax errors'
            ]
        );
    }

    return createValidResult();
}

/**
 * Validates that a file path string is reasonable for use as an output directory.
 * 
 * Note: This only validates the format of the path, not whether it exists
 * or is writable. File system operations should be handled separately.
 */
export function validateOutputPath(outputPath: string): ValidationResult {
    if (!outputPath || typeof outputPath !== 'string') {
        return createInvalidResult(
            'Output path is required and must be a string',
            ['Provide a valid directory path like "./src/components" or "/tmp/generated"']
        );
    }

    const trimmed = outputPath.trim();
    if (trimmed.length === 0) {
        return createInvalidResult(
            'Output path cannot be empty',
            ['Provide a directory path where the component should be generated']
        );
    }

    // Check for obviously invalid path characters (varies by OS, but these are universally bad)
    const invalidChars = /[<>:"|?*\x00-\x1f]/;
    if (invalidChars.test(trimmed)) {
        return createInvalidResult(
            `Output path "${outputPath}" contains invalid characters`,
            [
                'Avoid characters like < > : " | ? * and control characters',
                'Use forward slashes (/) or backslashes (\\) as path separators'
            ]
        );
    }

    // Check for reasonable length
    if (trimmed.length > 500) {
        return createInvalidResult(
            `Output path is too long (${trimmed.length} characters)`,
            ['Keep file paths under 500 characters for compatibility']
        );
    }

    return createValidResult();
}

/**
 * Combines multiple validation results into a single result.
 * This is useful when you need to validate multiple inputs and want to
 * collect all the validation errors at once.
 */
export function combineValidationResults(
    ...results: ValidationResult[]
): ValidationResult {
    const failedResults = results.filter(result => !result.isValid);
    
    if (failedResults.length === 0) {
        return createValidResult();
    }

    // Combine all error messages and suggestions
    const allErrors = failedResults
        .map(result => result.errorMessage)
        .filter(Boolean) as string[];
    
    const allSuggestions = failedResults
        .flatMap(result => result.suggestions || []);

    return createInvalidResult(
        allErrors.join('; '),
        allSuggestions
    );
}

/**
 * Helper function to throw a specific error type based on validation results.
 * This bridges the gap between our pure validation functions and the error
 * handling patterns used elsewhere in the application.
 */
export function throwIfInvalid<T extends Error>(
    validationResult: ValidationResult,
    createError: (message: string) => T
): void {
    if (!validationResult.isValid) {
        let message = validationResult.errorMessage || 'Validation failed';
        
        // Add suggestions to the error message if available
        if (validationResult.suggestions && validationResult.suggestions.length > 0) {
            message += '\n\nSuggestions:\n' + 
                validationResult.suggestions.map(s => `  • ${s}`).join('\n');
        }
        
        throw createError(message);
    }
}