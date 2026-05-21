import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import security from 'eslint-plugin-security'
import prettier from 'eslint-plugin-prettier/recommended'

export default [
  {
    ignores: ['public/**', 'node_modules/**', 'build/**'],
  },
  {
    files: ['src/**/*.{ts,tsx,js}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      security: security,
    },
    rules: {
      ...typescript.configs.recommended.rules,
      ...security.configs.recommended.rules,
      'no-useless-constructor': 'off',
      'no-use-before-define': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-use-before-define': ['error'],
      camelcase: 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
      'security/detect-object-injection': 'off',
      'security/detect-non-literal-regexp': 'off',
    },
  },
  prettier,
]
