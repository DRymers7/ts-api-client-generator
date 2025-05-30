/**
 * Rollup configuration for ts-api-client-generator
 *
 * This config generates:
 * - CommonJS (CJS) and ES Module (ESM) bundles for the main library.
 * - A Node CLI bundle with a shebang for global installs.
 * - A single .d.ts declaration file for consumers.
 *
 * External modules (Node built-ins and runtime dependencies) are excluded
 * from the bundle to reduce package size.
 */

import resolve from '@rollup/plugin-node-resolve'; // Resolves node_modules dependencies
import commonjs from '@rollup/plugin-commonjs'; // Converts CommonJS modules to ES6
import typescript from '@rollup/plugin-typescript'; // TypeScript support
import {dts} from 'rollup-plugin-dts'; // TypeScript declaration bundling
import {defineConfig} from 'rollup'; // Type-safe Rollup config definition

/**
 * List of external dependencies to exclude from the bundle.
 * These are runtime dependencies or Node built-ins that shouldn't be bundled.
 */
const EXTERNAL_RUNTIME = [
    'ts-morph',
    'prettier',
    'path',
    'fs',
    'fs/promises',
    'commander'
];

/**
 * Rollup configuration array.
 *
 * @type {import('rollup').RollupOptions[]}
 */
export default defineConfig([
    // -----------------------
    // Main library bundle (CJS & ESM)
    // -----------------------
    {
        input: 'src/index.ts',
        output: [
            {
                file: 'dist/index.js',
                format: 'cjs',
                sourcemap: true
            },
            {
                file: 'dist/index.esm.js',
                format: 'es',
                sourcemap: true
            }
        ],
        external: EXTERNAL_RUNTIME,
        plugins: [
            resolve(),
            commonjs(),
            typescript({
                tsconfig: './tsconfig.json',
                outputToFilesystem: true,
                declaration: false
            })
        ]
    },

    // -----------------------
    // CLI executable bundle
    // -----------------------
    {
        input: 'src/cli/cli.ts',
        output: {
            file: 'dist/bin/cli.js',
            format: 'cjs',
            banner: '#!/usr/bin/env node',
            sourcemap: true
        },
        external: [
            ...EXTERNAL_RUNTIME,
            'ts-api-client-generator'
        ],
        plugins: [
            resolve(),
            commonjs(),
            typescript({
                tsconfig: './tsconfig.json',
                outputToFilesystem: true,
                declaration: false
            })
        ]
    },

    // -----------------------
    // TypeScript declaration bundle
    // -----------------------
    {
        input: 'src/index.ts',
        output: {
            file: 'dist/index.d.ts',
            format: 'es'
        },
        external: EXTERNAL_RUNTIME,
        plugins: [dts()]
    }
]);
