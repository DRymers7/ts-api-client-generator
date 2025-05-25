import {defineConfig} from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        watch: false, // prevents auto-restarting when files change
        isolate: false, // runs all tests in the same process
    },
});
