# 🚀 TypeScript API Client Generator

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)

> **Note**: This package is currently in development. Once published to npm, installation instructions will be available.

Automatically generate fully-typed React components with TanStack Query integration from your API request files. Turn your Postman collections, cURL commands, or HTTP files into production-ready React components in seconds.

## ✨ Why This Tool Exists

As developers, we often find ourselves in this cycle:

1. 📝 Design an API endpoint (maybe in Postman)
2. 🧪 Test it manually to understand the response structure
3. 💻 Write TypeScript interfaces for the request and response
4. ⚛️ Create a React component with useQuery to fetch the data
5. 🔧 Handle loading states, error states, and data transformation

This tool automates steps 3-5, letting you go from a working API request to a production-ready React component instantly.

## 🎯 Features

- **🔄 Multiple Input Formats**: Support for `.http` files (VS Code REST Client), Postman JSON exports, and cURL commands
- **🏗️ Full TypeScript Generation**: Automatically infer and generate TypeScript interfaces from real API responses
- **⚛️ React + TanStack Query**: Generate components using modern React patterns with built-in data fetching
- **🛡️ Type Safety**: End-to-end type safety from API request to React component
- **📁 Flexible Output**: Configurable component names and output directories
- **🔍 Smart Error Handling**: Comprehensive error reporting with helpful suggestions
- **⚡ CLI & Library**: Use as a command-line tool or integrate into your build process

## 🚀 Quick Start

### Installation

```bash
# Install globally for CLI usage
npm install -g ts-api-client-generator

# Or install locally in your project
npm install --save-dev ts-api-client-generator
```

### Basic Usage

```bash
# Generate from an HTTP file
generate-api-client -f my-request.http -n UserApiComponent

# Generate from a Postman export
generate-api-client -f postman-collection.json -o ./src/components

# Generate from a cURL command
generate-api-client -f curl-command.txt --dry-run
```

### Your First Generated Component

Let's walk through a complete example using the REST Countries API:

1. **Create a request file** (`countries.http`):

```http
GET https://restcountries.com/v3.1/name/germany
Accept: application/json
```

2. **Generate the component**:

```bash
generate-api-client -f countries.http -n CountrySearchComponent
```

3. **Use in your React app**:

```tsx
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import CountrySearchComponent from './CountrySearchComponent';

const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <CountrySearchComponent />
        </QueryClientProvider>
    );
}
```

That's it! You now have a fully-typed, production-ready component that fetches country data.

## 📋 Supported File Formats

### HTTP Files (`.http`)

Perfect for VS Code REST Client users:

```http
POST https://api.example.com/users
Content-Type: application/json
Authorization: Bearer your-token-here

{
  "name": "John Doe",
  "email": "john@example.com"
}
```

### Postman JSON (`.json`)

Export any Postman request:

```json
{
    "method": "GET",
    "header": [{"key": "Authorization", "value": "Bearer token"}],
    "url": {
        "raw": "https://api.example.com/users/123"
    }
}
```

### cURL Commands (`.txt`)

Save your cURL commands:

```bash
curl -X POST 'https://api.example.com/users' \
  -H 'Content-Type: application/json' \
  -d '{"name": "Jane Doe"}'
```

## 🛠️ CLI Options

```
Usage: generate-api-client [options]

Options:
  -f, --file <path>           Path to request file (.http, .json, or .txt)
  -o, --output <dir>          Output directory (default: current directory)
  -n, --name <componentName>  React component name (default: "GeneratedApiComponent")
  --dry-run                   Preview what would be generated
  -h, --help                  Display help information

Examples:
  generate-api-client -f api-request.http -n UserDataComponent
  generate-api-client -f postman-export.json -o ./src/hooks
  generate-api-client -f curl-commands.txt --dry-run --verbose
```

## 📚 Programmatic Usage

You can also use this tool as a library in your build scripts or custom tooling:

```typescript
import {
    parseProvidedFile,
    callSuppliedApi,
    generateResponseType,
    generateClientCode,
} from 'ts-api-client-generator';

async function generateComponent() {
    try {
        // Parse the request file
        const requestParams = await parseProvidedFile('./my-request.http');

        // Call the API to get response structure
        const apiResult = await callSuppliedApi(requestParams);

        // Generate TypeScript interfaces
        const responseTypes = generateResponseType(apiResult.response);

        // Generate React component
        const result = await generateClientCode(
            responseTypes,
            staticTypedRequest,
            requestParams,
            'MyComponent',
            './output'
        );

        console.log(`Generated: ${result.filePath}`);
    } catch (error) {
        console.error('Generation failed:', error.message);
    }
}
```

## 🏗️ What Gets Generated

For each API request, the tool generates:

### TypeScript Interfaces

```typescript
interface ApiResponse {
    id: number;
    name: string;
    email: string;
    profile: ApiResponseProfile;
}

interface ApiResponseProfile {
    bio: string;
    avatar: string;
}
```

### React Component with TanStack Query

```tsx
export function UserApiComponent(): JSX.Element {
    const apiRequest: apiParameters = {
        targetUrl: 'https://api.example.com/users/123',
        httpMethod: 'GET',
        // ... other parameters
    };

    const {data, isLoading, isError} = useQuery({
        queryKey: ['fetchedApi'],
        queryFn: () => fetchData(apiRequest),
    });

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error fetching data</div>;

    return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
```

## 🔧 Advanced Usage

### Environment Variables and Dynamic Values

The generated components include the exact request you tested, but you can easily modify them for dynamic usage:

```tsx
// Generated component uses static values
const apiRequest: apiParameters = {
    targetUrl: 'https://api.example.com/users/123',
    // ...
};

// Modify for dynamic usage
const apiRequest: apiParameters = {
    targetUrl: `https://api.example.com/users/${userId}`,
    authToken: process.env.REACT_APP_API_TOKEN,
    // ...
};
```

### Custom Query Options

Enhance the generated components with additional TanStack Query features:

```tsx
const {data, isLoading, isError} = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchData(apiRequest),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    enabled: !!userId,
});
```

## 🔥 Try It Yourself

1. Clone this repository and install dependencies:

```bash
    git clone https://github.com/DRymers7/ts-api-client-generator.git
    cd ts-api-client-generator
    npm install
    cd examples
    npm run dev -- -f countries.postman.json -n CountrySearchComponent
```

## 🐛 Troubleshooting

### Common Issues

**File not found or parsing errors**

- Ensure your file path is correct and the file exists
- Check that your file follows the correct format for its type
- Use `--verbose` flag to see detailed error information

**API call failures**

- Verify your API endpoint is accessible
- Check authentication tokens and headers
- Consider API rate limiting or network issues

**TypeScript compilation errors**

- Ensure you have the required peer dependencies installed
- Check that your API response structure is consistent
- Verify component names follow React naming conventions (PascalCase)

### Getting Help

If you encounter issues:

1. Run with `--dry-run` to see what would be generated
2. Check the [GitHub Issues](https://github.com/DRymers7/ts-api-client-generator/issues)
3. Review the [examples directory](./examples) for working samples

## 🤝 Contributing

Contributions are welcome! This project aims to make API client generation seamless and type-safe.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/DRymers7/ts-api-client-generator.git
cd ts-api-client-generator

# Install dependencies
npm install

# Run tests
npm test

# Build the project
npm run build
```

### Project Structure

```
src/
├── core/           # Main business logic
├── util/           # File parsing utilities
├── cli/            # Command-line interface
└── index.ts        # Library exports

tests/              # Comprehensive test suite
examples/           # Sample request files
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [TanStack Query](https://tanstack.com/query) for excellent data fetching
- [ts-morph](https://ts-morph.com/) for TypeScript AST manipulation
- [Axios](https://axios-http.com/) for reliable HTTP requests
- The React and TypeScript communities for continuous inspiration

---

**Made with ❤️ by developers, for developers**

_Transform your API requests into production-ready React components in seconds._
