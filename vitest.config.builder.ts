// import { defineConfig } from 'vite';

export const createVitestTestConfig = (testingType: string) => {
    return {
        root: './',
        globals: true,
        isolate: false,
        passWithNoTests: true,
        include: [`test/${testingType}/**/*.test.ts`],
    };
};
