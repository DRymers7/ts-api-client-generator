#!/usr/bin/env node
import {Command} from 'commander';
import path from 'path';
import fs from 'fs';
import {
    parseProvidedFile,
    callSuppliedApi,
    generateResponseType,
    generateClientCode,
    staticTypedRequest,
    FileParseError,
    ApiCallError,
    ResponseTypeGenerationError,
    ClientCodeGenerationError,
    validateProgramArguments,
    ValidationError
} from '../index';

const program = new Command();

/**
 * Program definition. Ensure that GH actions always bump this version number to match the package version.
 */
program
    .name('generate-api-client')
    .description('Generate React components with TanStack Query from API request files')
    .version('1.0.0')
    .option('-f, --file <path>', 'Path to request file (.http, .json, or .txt)')
    .option('-o, --output <dir>', 'Output directory', process.cwd())
    .option('-n, --name <componentName>', 'Component name', 'GeneratedApiComponent')
    .option('--dry-run', 'Show what would be generated without writing files')
    .parse();

const options = program.opts();

/**
 * Entrypoint of the application. 
 */
const main = async () => {
    try {
        if (!options.file) {
            console.error('Error: --file option is required');
            program.help();
            return;
        }

        if (!fs.existsSync(options.file)) {
            console.error(`Error: File not found: ${options.file}`);
            process.exit(1);
        }

        const requestContent = await parseProvidedFile(options.file);
        const rawApiResponse = await callSuppliedApi(requestContent);
        const typedApiResponse = generateResponseType(
            rawApiResponse.response,
            options.name + 'Response'
        );

        if (options.dryRun) {
            console.log('Component would be generated with:');
            console.log(`File: ${options.name}.tsx`);
            console.log(`Location: ${path.resolve(options.output)}`);
            console.log('\nGenerated interfaces:');
            console.log(typedApiResponse);
            console.log('\nComponent would use request:');
            console.log(JSON.stringify(requestContent, null, 2));
        } else {
            const result = await generateClientCode(
                typedApiResponse,
                staticTypedRequest,
                requestContent,
                options.name,
                options.output
            );
            console.log(`Component generated: ${result.componentName} at ${result.filePath}`);
        }
    } catch (error: any) {
        if (error instanceof FileParseError ||
            error instanceof ApiCallError ||
            error instanceof ResponseTypeGenerationError ||
            error instanceof ClientCodeGenerationError) {
            console.error(`Error: ${error.message}`);
        } else if (error instanceof ValidationError) {
            console.error("Validation failed with the following issues:\n");
            for (const result of error.failingValidations) {
                console.error(`- ${result.errorMessage}`);
                if (result.suggestions && result.suggestions.length > 0) {
                    console.error(`  Suggestions:`);
                    for (const suggestion of result.suggestions) {
                        console.error(`    • ${suggestion}`);
                    }
                }
            }
        } else {
            console.error(`Unexpected error: ${error.message}`);
        }
        process.exit(1);
    }
};

main();