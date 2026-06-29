import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';

export default [
  { ignores: ['dist'] },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2024,
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,

      // PRD §12.3: All components have PropTypes defined
      'react/prop-types': 'error',

      // PRD §12.3: No console.log in final code
      'no-console': 'error',

      // PRD §12.3: Max 300 lines per file
      'max-lines': ['warn', { max: 300, skipBlankLines: true, skipComments: true }],

      // Vite HMR safety
      'react-refresh/only-export-components': 'warn',

      // React 18: no need to import React for JSX
      'react/react-in-jsx-scope': 'off',

      // Allow unused vars prefixed with _
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
    settings: { react: { version: '18.3' } },
  },
];
