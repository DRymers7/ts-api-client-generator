/**
 * Module responsible for taking working instances of client requests and API
 * responses, and then generating react components to handle those REST calls.
 */
import {CodeBlockWriter, Project, SourceFile} from 'ts-morph';
import path from 'path';
import {ClientCodeGenerationError} from './errors';

/**
 * Result of successful file creation operation
 * Note: This interface now only represents success cases since errors are thrown
 */
interface FileCreationResult {
    success: boolean;
    filePath: string;
    componentName?: string;
}

/**
 * Generates a React component that uses useQuery to fetch API data using a known working request,
 * and types the response using a generated TypeScript interface.
 *
 * @param typedResponse - The interface string for the API response.
 * @param typedRequest - The interface string for the API request (apiParameters).
 * @param requestUsed - The actual, working apiParameters object used for the request.
 * @param outputDir - The directory to output the generated functional component, defaulting to the current working directory.
 * @returns A promise that resolves with the file creation result.
 * @throws ClientCodeGenerationError when errors occur while writing.
 */
const generateClientCode = async (
    typedResponse: string,
    typedRequest: string,
    requestUsed: object,
    componentName: string = 'GeneratedApiComponent',
    outputDir: string = process.cwd()
): Promise<FileCreationResult> => {
    try {
        const fileName = `${componentName}.tsx`;
        const filePath = path.join(outputDir, fileName);
        const project = new Project();
        const sourceFile = project.createSourceFile(filePath, '', {
            overwrite: true,
        });
        addImportStatements(sourceFile);
        addTypeDefinitions(sourceFile, typedResponse, typedRequest);
        addApiCall(sourceFile);
        const serializedRequest = JSON.stringify(requestUsed, null, 2);
        addReactComponent(sourceFile, componentName, serializedRequest);
        await project.save();

        return {
            success: true,
            filePath,
            componentName,
        };
    } catch (error: any) {
        throw new ClientCodeGenerationError(
            path.join(outputDir, componentName),
            error.message
        );
    }
};

/**
 * Adds import statements to the top of the source file.
 * (React + TanStack Query + Axios imports)
 *
 * @param sourceFile SourceFile object from ts-morph, in the current project.
 */
const addImportStatements = (sourceFile: SourceFile): void => {
    sourceFile.addImportDeclaration({
        namedImports: ['useQuery'],
        moduleSpecifier: '@tanstack/react-query',
    });
    sourceFile.addImportDeclaration({
        namedImports: ['useState', 'useEffect'],
        moduleSpecifier: 'react',
    });
    sourceFile.addImportDeclaration({
        defaultImport: 'axios',
        moduleSpecifier: 'axios',
    });
};

/**
 * Adds the generated type definitions of the working request and actual API response.
 * (interface apiParameters + typed API response)
 *
 * @param sourceFile SourceFile object from ts-morph, in the current project.
 * @param typedResponse generated type response from mapResponseToType
 * @param typedRequest working instance of successful type request
 */
const addTypeDefinitions = (
    sourceFile: SourceFile,
    typedResponse: string,
    typedRequest: string
): void => {
    sourceFile.addStatements([typedRequest, '', typedResponse, '']);
};

/**
 * Adds the fetchData function to the react component to call the target API
 * with axios and working request instance.
 *
 * @param sourceFile SourceFile object from ts-morph, in the current project.
 */
const addApiCall = (sourceFile: SourceFile): void => {
    sourceFile.addFunction({
        name: 'fetchData',
        isAsync: true,
        parameters: [{name: 'params', type: 'apiParameters'}],
        returnType: 'Promise<ApiResponse>',
        statements: (writer) => {
            writer.writeLine(`const response = await axios({`);
            writer.writeLine(`  url: params.targetUrl,`);
            writer.writeLine(`  method: params.httpMethod,`);
            writer.writeLine(`  headers: params.requestHeaders,`);
            writer.writeLine(`  params: params.queryParams,`);
            writer.writeLine(`  data: params.requestBody,`);
            writer.writeLine(`});`);
            writer.writeLine(`return response.responseBody;`);
        },
    });
};

/**
 * Add the React component to the current source file.
 *
 * @param sourceFile SourceFile object from ts-morph, in the current project.
 * @param componentName component name passed in via configuration args, defaulting to GeneratedApiComponent
 * @param serializedRequest stringified instance of working API request object
 * @returns JSX.Element
 */
const addReactComponent = (
    sourceFile: SourceFile,
    componentName: string,
    serializedRequest: string
): void => {
    sourceFile.addFunction({
        name: componentName,
        isExported: true,
        returnType: 'JSX.Element',
        statements: (writer: CodeBlockWriter) => {
            writer.writeLine(
                `const apiRequest: apiParameters = ${serializedRequest};`
            );
            writer.blankLine();
            writer.writeLine(`const { data, isLoading, isError } = useQuery({`);
            writer.writeLine(`  queryKey: ['fetchedApi'],`);
            writer.writeLine(`  queryFn: () => fetchData(apiRequest),`);
            writer.writeLine(`});`);
            writer.blankLine();
            writer.writeLine(`if (isLoading) return <div>Loading...</div>;`);
            writer.writeLine(
                `if (isError) return <div>Error fetching data</div>;`
            );
            writer.blankLine();
            writer
                .writeLine(`return (`)
                .indent(() => {
                    writer.writeLine(
                        `<pre>{JSON.stringify(data, null, 2)}</pre>`
                    );
                })
                .writeLine(`);`);
        },
    });
};

export {
    FileCreationResult,
    generateClientCode,
    addImportStatements,
    addTypeDefinitions,
    addApiCall,
    addReactComponent,
};
