import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

import { createVitestTestConfig } from './vitest.config.builder';

export default defineConfig({
    test: createVitestTestConfig('unit'),
    plugins: [swc.vite()],
});
