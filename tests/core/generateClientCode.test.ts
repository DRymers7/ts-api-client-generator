import {describe, it, expect} from 'vitest';
import {generateClientCode} from '../../src';
import fs from 'fs';
import path from 'path';

describe('generateClientCode', () => {
    it('generates a minimal functional React component file', async () => {
        // --- Sample values
        const typedResponse = `type CountryResponse = {
  foo: number;
  bar: string;
}[];`;

        const typedRequest = `interface apiParameters {
  targetUrl: string;
  httpMethod: HTTP_METHOD;
  authToken?: string;
  requestHeaders?: Record<string, string>;
  queryParams?: Record<string, string>;
  requestBody?: object;
};`;

        const requestUsed = {
            targetUrl: 'https://api.example.com/endpoint',
            httpMethod: 'GET',
            requestHeaders: {Accept: 'application/json'},
        };
        const componentName = 'CountryComponent';
        const outputDir = './tmp-test-gen';

        // Clean up before test (idempotent)
        try {
            fs.rmSync(outputDir, {recursive: true});
        } catch {}

        // --- Run the code generator
        const result = await generateClientCode(
            typedResponse,
            typedRequest,
            requestUsed,
            componentName,
            outputDir
        );

        expect(result.success).toBe(true);
        expect(result.filePath).toContain(componentName + '.tsx');
        expect(fs.existsSync(result.filePath)).toBe(true);

        // --- Read and verify generated file content
        const generated = fs.readFileSync(result.filePath, 'utf-8');

        // Check for expected code pieces
        expect(generated).toContain('type HTTP_METHOD = "GET"');
        expect(generated).toContain('interface apiParameters');
        expect(generated).toContain('type CountryResponse = {');
        expect(generated).toContain('export function ' + componentName);
        expect(generated).toContain('useQuery');
        expect(generated).toContain('axios');

        // Should use the right props for apiRequest
        expect(generated).toContain('const apiRequest: apiParameters =');
        expect(generated).toContain('targetUrl');
        expect(generated).toContain('httpMethod');

        // Clean up after
        fs.rmSync(outputDir, {recursive: true});
    });

    it('throws if there is a file system error', async () => {
        // Make outputDir unwritable to simulate error
        // (On Unix, "/" is unwritable to normal user)
        const outputDir = '/';

        const dummyRequest = `interface apiParameters {
  targetUrl: string;
  httpMethod: HTTP_METHOD;
};`;

        await expect(
            generateClientCode(
                'type Dummy = number;',
                dummyRequest,
                {},
                'DummyComponent',
                outputDir
            )
        ).rejects.toThrow();
    });
});
