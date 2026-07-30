import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-config-prettier';
import pluginPrettier from 'eslint-plugin-prettier';

export default [
  { ignores: ['dist', 'build', 'node_modules'] },
  js.configs.recommended,
  prettier,
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      prettier: pluginPrettier,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        FormData: 'readonly',
        FileReader: 'readonly',
        Blob: 'readonly',
        Event: 'readonly',
        CustomEvent: 'readonly',
      },
      settings: {
        react: { version: '19' },
      },
    },
    rules: {
      // ── Prettier integration ──────────────────────────────────────────
      'prettier/prettier': 'error',

      // ── React rules ──────────────────────────────────────────────────
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/display-name': 'warn',
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-undef': 'error',
      'react/no-unknown-property': 'error',
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'error',

      // ── React Hooks rules ─────────────────────────────────────────────
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // ── React Refresh (Vite HMR) ──────────────────────────────────────
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // ── Variable hygiene ─────────────────────────────────────────────
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-var': 'error',
      'prefer-const': 'error',

      // ── Import quality ───────────────────────────────────────────────
      'no-duplicate-imports': 'error',

      // ── Code safety ──────────────────────────────────────────────────
      'no-unreachable': 'error',
      'consistent-return': 'error',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],

      // ── Code style ───────────────────────────────────────────────────
      'object-shorthand': ['error', 'always'],

      // ── Console policy ────────────────────────────────────────────────
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
];
