module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    env: {
        browser: true,
        es2021: true,
        node: true,
        jest: false,
    },
    settings: {
        'import/resolver': {
            typescript: {
                project: ['./tsconfig.json', './tsconfig.test.json'], // include test config
            },
        },
    },
    extends: [
        'airbnb-base', // Airbnb JS style guide
        'plugin:@typescript-eslint/recommended',
        'prettier', // Prettier compatibility
    ],
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module',
    },
    rules: {
        indent: ['error', 4],
        'object-curly-spacing': ['error', 'never'],
        'no-console': 'off',
        'import/extensions': [
            'error',
            'ignorePackages',
            {
                js: 'never',
                jsx: 'never',
                ts: 'never',
                tsx: 'never',
            },
        ],
        'space-before-function-paren': [
            'error',
            {
                anonymous: 'always',
                named: 'never',
                asyncArrow: 'always',
            },
        ],
    },
    overrides: [
        {
            files: [
                '**/*.test.ts',
                '**/*.spec.ts',
                'tests/**/*.ts',
                'vitest.config.ts',
            ],
            env: {
                jest: true,
            },
            rules: {
                'import/no-extraneous-dependencies': 'off',
            },
        },
        {
            files: ['rollup.config.mjs'],
            rules: {
                'import/no-extraneous-dependencies': 'off'
            }
        }
    ],
};
