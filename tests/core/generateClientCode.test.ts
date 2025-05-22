import {describe, it, expect, beforeEach} from 'vitest';
import {Project} from 'ts-morph';
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

    beforeEach(() => {
        const project = new Project();
        sourceFile = project.createSourceFile('temp.tsx', '', {
            overwrite: true,
        });
    });

    
});
