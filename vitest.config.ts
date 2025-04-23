import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';
import { createVitestTestConfig } from './vitest.config.builder';
import * as path from 'node:path';

export default defineConfig({
    test: createVitestTestConfig('(unit|e2e)'),
    plugins: [swc.vite()],
    resolve: {
        alias: {
            '@src': path.resolve(__dirname, './src'),
            '@config': path.resolve(__dirname, './src/config'),
            '@commons': path.resolve(__dirname, './src/commons'),
            '@modules': path.resolve(__dirname, './src/modules'),
            '@database': path.resolve(__dirname, './src/database'),
        },
    },
});
