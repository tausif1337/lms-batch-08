import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // ESLint's own no-unused-vars does not count a name being used inside
      // JSX. Without this, every imported component and icon is reported as
      // unused. eslint-plugin-react would normally fix that, but it does not
      // support ESLint 10 yet, so capitalised names are ignored instead.
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z]' }],
    },
  },
])
