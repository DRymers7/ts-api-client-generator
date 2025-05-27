#!/usr/bin/env node
import {apiParameters, callResult, callSuppliedApi} from './core/callSuppliedApi';
import {generateClientCode} from './core/generateClientCode';
import {generateResponseType} from './core/mapResponseToType';
import { parseProvidedFile } from './core/parseProvidedFile';
import { staticTypedRequest } from './core/types';
import { FileParseError, ApiCallError, ResponseTypeGenerationError, ClientCodeGenerationError } from './core/errors';
import path from 'path';
import fs from 'fs';
import {Command} from 'commander';

const program = new Command();

program
  .name('generate-client')
  .description('Generate a React component leveraging useQuery to call an api from a request file')
  .option('-f, --file <path>', 'Path to request file (JSON, http, cURL as txt)')
  .option('-o, --output <dir>', 'Directory to output the component', process.cwd())
  .option('-n, --name <componentName>', 'React component name', 'GeneratedApiComponent')
  .parse();

const options = program.opts();

/**
 * Main invocation point of the utility. Does the following:
 * 
 * 1. Parses the user provided file path to derive an HTTP request object
 * 2. Calls the target API with that request object. 
 */
const main = async () => {
    try {
        const requestContent: apiParameters = await parseProvidedFile(options.file);
        const rawApiResponse: callResult = await callSuppliedApi(requestContent);
        const typedApiResponse: string = generateResponseType(rawApiResponse.response);
        const result = await generateClientCode(
            typedApiResponse, 
            staticTypedRequest, 
            requestContent, 
            options.name,
            options.output
        );
        console.log(`✅ Component generated: ${result.filePath}`);
    } catch (error: any) {
        if (error instanceof FileParseError ||
            error instanceof ApiCallError ||
            error instanceof ResponseTypeGenerationError ||
            error instanceof ClientCodeGenerationError) {
            console.error(`❌ ${error.message}`);
        } else {
            console.error(`❌ Unexpected error: ${error.message}`);
        }
        process.exit(1);
    }
}