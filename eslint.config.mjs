import {defineConfig} from 'eslint/config';
import shinyCodeConfig from 'eslint-config-shiny-code';

export default defineConfig([
    {
        ...shinyCodeConfig.configs.ts,
        files: ['src/**/*.{ts,js,tsx}'],
        ignores: ['node_modules', '.bin', 'dist', '.spec', '.agents'],
    },
]);
