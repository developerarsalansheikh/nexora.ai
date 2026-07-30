import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import pluginPrettier from 'eslint-plugin-prettier';

export default [
  js.configs.recommended,
  prettier,
  {
    plugins: {
      prettier: pluginPrettier,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // Node.js globals
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        console: 'readonly',
      },
    },
    rules: {
      // ── Prettier integration ──────────────────────────────────────────
      'prettier/prettier': 'error',

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
      'arrow-body-style': ['warn', 'as-needed'],

      // ── Console policy: only warn/error allowed in production code ────
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],

      // ── Async safety ─────────────────────────────────────────────────
      'no-return-await': 'error',
      'require-await': 'warn',

      // ── General cleanliness ──────────────────────────────────────────
      'no-shadow': 'warn',
      'no-param-reassign': ['warn', { props: false }],
    },
  },
  {
    // ── Test file overrides ───────────────────────────────────────────
    files: ['**/*.test.js', '**/*.spec.js'],
    rules: {
      'no-console': 'off',
    },
  },
];
