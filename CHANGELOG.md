# Changelog

## [1.0.0] - 2025-05-30

🎉 **Initial Release**

- Generate React components using TanStack Query from API request files (.http, .json, .txt).
- Supported request file formats:
  - **HTTP**: VS Code REST Client style files.
  - **TXT (cURL)**: Plain text curl commands.
  - **Postman JSON**: Basic Postman collection exports.
- Features:
  - Parses request files into structured API parameters.
  - Makes a live API call with Axios to generate a sample response.
  - Generates fully-typed TypeScript interfaces from the response.
  - Outputs a fully-typed React functional component using `useQuery` from TanStack Query.
- Command line interface:
  - `generate-api-client --file <path> [--output <dir>] [--name <ComponentName>] [--dry-run]`
- Built with:
  - TypeScript
  - Rollup
  - ESLint & Prettier
  - Vitest (with UI support)
- Peer dependencies:
  - React (17 or 18)
  - TanStack Query (v4 or v5)

Ready for your next code-generation adventure!
