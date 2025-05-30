import {describe, it, expect, beforeEach, afterAll, beforeAll} from 'vitest';
import {Project} from 'ts-morph';
import path from 'path';
import fs from 'fs';
import os from 'os'
import {
    addImportStatements,
    addTypeDefinitions,
    addApiCall,
    addReactComponent,
    generateClientCode,
} from '../../src/core/generateClientCode';

/**
 * Test suite for generateClientCode module. If working as intended, this module
 * should generate a react component with a functional implementation of useQuery to
 * fetch data from the provided API.
 */
describe('generateClientCode module tests', () => {
    let sourceFile: ReturnType<Project['createSourceFile']>;
    let tempDir: string;

    beforeAll(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'generated-client-'));
    });

    beforeEach(() => {
        const project = new Project();
        sourceFile = project.createSourceFile(
            path.join(tempDir, 'temp.tsx'),
            '',
            {
                overwrite: true,
            }
        );
    });

    afterAll(() => {
        fs.rmSync(tempDir, {recursive: true, force: true});
        sourceFile.delete();
    });

    describe('addImportStatements function', () => {
        it('should add required imports', () => {
            addImportStatements(sourceFile);
            const printed = sourceFile.getText();

            expect(printed).toContain(
                'import { useQuery } from "@tanstack/react-query";'
            );
            expect(printed).toContain(
                'import { useState, useEffect } from "react";'
            );
            expect(printed).toContain('import axios from "axios";');
        });
    });

    describe('addTypeDefinitions function', () => {
        it('should include both typed interfaces', () => {
            const mockTypedRequest = `interface apiParameters { targetUrl: string; }`;
            const mockTypedResponse = `interface ApiResponse { message: string; }`;

            addTypeDefinitions(sourceFile, mockTypedResponse, mockTypedRequest);
            const printed = sourceFile.getText();

            expect(printed).toContain('interface apiParameters');
            expect(printed).toContain('interface ApiResponse');
        });
    });

    describe('addApiCall function', () => {
        it('should generate fetchData function with axios call', () => {
            addApiCall(sourceFile);
            const printed = sourceFile.getText();

            expect(printed).toContain('async function fetchData');
            expect(printed).toContain('axios({');
            expect(printed).toContain('url: params.targetUrl');
            expect(printed).toContain('return response.responseBody');
        });
    });

    describe('addReactComponent function', () => {
        it('should generate a functional component', () => {
            const serializedRequest = JSON.stringify({
                targetUrl: '/api/test',
                httpMethod: 'GET',
            });

            addReactComponent(sourceFile, 'TestComponent', serializedRequest);
            const printed = sourceFile.getText();

            expect(printed).toContain('const apiRequest: apiParameters =');
            expect(printed).toContain('useQuery');
            expect(printed).toContain('return <div>Loading...</div>');
            expect(printed).toContain(
                '<pre>{JSON.stringify(data, null, 2)}</pre>'
            );
        });
    });

    describe('generateClientCode function', () => {
        it('should create and write the file successfully', async () => {
            const typedRequest = `interface apiParameters {
                targetUrl: string;
                httpMethod: HTTP_METHOD;
                authToken?: string;
                requestHeaders?: Record<string, string>;
                queryParams?: Record<string, string>;
                requestBody?: object;
            };`;

            const typedResponse = `interface ApiResponse {
                responseStatus: string;
                responseCode: number;
                responseBody?: object;
            };`;

            const requestUsed = {
                targetUrl: '/api/test',
                httpMethod: 'POST',
                requestHeaders: {'Content-Type': 'application/json'},
                queryParams: {userId: '123'},
                requestBody: {name: 'John'},
            };

            const result = await generateClientCode(
                typedResponse,
                typedRequest,
                requestUsed,
                'MyGeneratedComponent',
                tempDir
            );

            expect(result.success).toBe(true);
            expect(result.filePath).toContain('MyGeneratedComponent.tsx');

            const fileContent = fs.readFileSync(result.filePath, 'utf-8');
            expect(fileContent).toContain('function MyGeneratedComponent');
            expect(fileContent).toContain('interface ApiResponse');
            expect(fileContent).toContain('interface apiParameters');
        });
    });
});
