import { readdirSync } from 'node:fs'

import eslint from '@eslint/js'
import eslintComments from 'eslint-plugin-eslint-comments'
import importPlugin from 'eslint-plugin-import-x'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import reactHooks from 'eslint-plugin-react-hooks'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import prettier from 'eslint-config-prettier'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const featureNames = readdirSync(new URL('./src/client/features', import.meta.url), { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .map(entry => entry.name)

const featureBoundaries = featureNames.map(featureName => ({
  files: [`src/client/features/${featureName}/**/*.{ts,tsx}`],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['./**', '../**'],
            message: 'Use the @/ alias for TypeScript imports.',
          },
          ...featureNames
            .filter(otherFeature => otherFeature !== featureName)
            .map(otherFeature => ({
              group: [`@/client/features/${otherFeature}/**`],
              message: 'Features must not import from other features. Compose them in the application layer.',
            })),
        ],
      },
    ],
  },
}))

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**'],
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
  },
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  jsxA11y.flatConfigs.strict,
  reactHooks.configs.flat['recommended-latest'],
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'eslint-comments': eslintComments,
      'import-x': importPlugin,
      'simple-import-sort': simpleImportSort,
    },
    settings: {
      'import-x/resolver': {
        typescript: {
          alwaysTryTypes: true,
          noWarnOnMultipleProjects: true,
          project: ['./tsconfig.json', './tsconfig.server.json'],
        },
      },
    },
    rules: {
      complexity: ['error', 12],
      curly: ['error', 'all'],
      eqeqeq: ['error', 'always'],
      'max-depth': ['error', 4],
      'max-len': [
        'error',
        {
          code: 140,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreUrls: true,
        },
      ],
      'max-lines': ['error', { max: 500, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['error', { max: 100, skipBlankLines: true, skipComments: true, IIFEs: true }],
      'max-nested-callbacks': ['error', 3],
      'max-params': ['error', 5],
      'no-else-return': 'error',
      'no-nested-ternary': 'error',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['./**', '../**'],
              message: 'Use the @/ alias for TypeScript imports.',
            },
          ],
        },
      ],
      'object-shorthand': 'error',
      'prefer-const': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/no-invalid-void-type': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-unnecessary-type-conversion': 'off',
      '@typescript-eslint/no-unnecessary-type-parameters': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        {
          allowNumber: true,
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'eslint-comments/disable-enable-pair': ['error', { allowWholeFile: false }],
      'eslint-comments/no-unlimited-disable': 'error',
      'eslint-comments/require-description': 'error',
      'import-x/no-cycle': ['error', { ignoreExternal: true }],
      'simple-import-sort/exports': 'error',
      'simple-import-sort/imports': 'error',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  ...featureBoundaries,
  {
    files: ['src/client/components/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['./**', '../**'],
              message: 'Use the @/ alias for TypeScript imports.',
            },
            {
              group: ['@/client/features/**'],
              message: 'Shared client modules must not import feature modules.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/**/*.test.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/unbound-method': 'off',
    },
  },
  {
    files: ['src/client/**/routing/*.ts'],
    rules: {
      '@typescript-eslint/only-throw-error': 'off',
    },
  },
  {
    files: ['src/server/**/*.module.ts'],
    rules: {
      '@typescript-eslint/no-extraneous-class': 'off',
    },
  },
  {
    files: ['src/server/database/migrations/**/*.ts'],
    rules: {
      'max-lines': 'off',
      'max-lines-per-function': 'off',
    },
  },
  prettier,
)
