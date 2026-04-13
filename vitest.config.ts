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
                '@src': path.resolve(__dirname, './src'),
                '@commons': path.resolve(__dirname, './src/commons'),
                '@infrastructure': path.resolve(__dirname, './src/infrastructure'),
                '@integrations': path.resolve(__dirname, './src/integrations'),
                '@features': path.resolve(__dirname, './src/features'),
                '@test': path.resolve(__dirname, './test'),
            },
        },
    });
};

export default createVitestTestConfig;
