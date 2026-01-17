import swc from 'unplugin-swc';
import { defineConfig, ViteUserConfig } from 'vitest/config';
import path from 'path';

const createVitestTestConfig = (testingType: string): ViteUserConfig => {
    return defineConfig({
        test: {
            root: './',
            globals: true,
            isolate: false,
            passWithNoTests: true,
            include: [`test/${testingType}/**/*.spec.ts`],
            pool: 'forks',
        },
        plugins: [swc.vite()],
        resolve: {
            alias: {
                '@test': path.resolve(__dirname, './test'),
                '@src': path.resolve(__dirname, './src'),
                '@commons': path.resolve(__dirname, './src/commons'),
                '@core': path.resolve(__dirname, './src/core'),
                '@external': path.resolve(__dirname, './src/external'),
                '@modules': path.resolve(__dirname, './src/modules'),
            },
        },
    });
};

export default createVitestTestConfig;
