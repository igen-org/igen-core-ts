import * as js from '@eslint/js';
import * as globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';

export default defineConfig([
    {
        files: ['src/**/*.{js,mjs,cjs}'],
        plugins: { js },
        extends: ['js/recommended'],
        languageOptions: { globals: globals.node },
        rules: { semi: ['error', 'always'] },
    },
    {
        files: ['src/**/*.{ts,mts,cts}'],
        extends: tseslint.configs.recommendedTypeChecked,
        languageOptions: {
            parserOptions: {
                project: './tsconfig.json',
            },
        },
        rules: {
            semi: ['error', 'always'],
            '@typescript-eslint/strict-boolean-expressions': 'error',
        },
    },
]);
