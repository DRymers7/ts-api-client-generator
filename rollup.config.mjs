import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { dts } from 'rollup-plugin-dts';
import { defineConfig } from 'rollup';

const EXTERNAL_RUNTIME = [
  // Node.js built-ins and other things you don't want bundled
  "fs", "path", "os", "util", "stream", "events",
  "child_process", "assert", "http", "https", "url", "zlib", "crypto"
];

// If you want to automatically externalize all deps/peerDeps too, uncomment this:
/*
import pkg from './package.json' assert { type: "json" };
const EXTERNAL_RUNTIME = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
  "fs", "path", "os", "util", "stream", "events",
  "child_process", "assert", "http", "https", "url", "zlib", "crypto"
];
*/

export default defineConfig([
  // JS (CommonJS + ESM)
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: 'dist/index.esm.js',
        format: 'esm',
        sourcemap: true,
      },
    ],
    external: EXTERNAL_RUNTIME,
    plugins: [
      resolve({
        preferBuiltins: true,
      }),
      commonjs(),
      json(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false, // Type declarations handled below
      }),
    ],
  },
  // Types (.d.ts)
  {
    input: 'src/index.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dts()],
    external: EXTERNAL_RUNTIME,
  }
]);
