import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import security from 'eslint-plugin-security'
import prettier from 'eslint-plugin-prettier/recommended'

// Rules that need type information: they catch `any` that comes from untyped
// APIs (JSON.parse, require, library callbacks) without the word `any` in the code
const typeAwareRules = {
  '@typescript-eslint/no-unsafe-assignment': 'error',
  '@typescript-eslint/no-unsafe-member-access': 'error',
  '@typescript-eslint/no-unsafe-call': 'error',
  '@typescript-eslint/no-unsafe-return': 'error',
  '@typescript-eslint/no-unsafe-argument': 'error',
}

const sharedRules = {
  ...typescript.configs.recommended.rules,
  ...security.configs.recommended.rules,
  'no-useless-constructor': 'off',
  'no-use-before-define': 'off',
  '@typescript-eslint/explicit-function-return-type': 'off',
  '@typescript-eslint/no-use-before-define': ['error'],
  camelcase: 'off',
  '@typescript-eslint/no-explicit-any': 'error',
  'no-restricted-syntax': [
    'error',
    {
      selector:
        "TSAsExpression[expression.type='TSAsExpression'][expression.typeAnnotation.type='TSUnknownKeyword']",
      message: 'Do not use `as unknown as`; fix the type instead.',
    },
  ],
  '@typescript-eslint/no-require-imports': 'off',
  '@typescript-eslint/no-unused-vars': [
    'error',
    { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
  ],
  'security/detect-object-injection': 'off',
  'security/detect-non-literal-regexp': 'off',
}

export default [
  {
    ignores: [
      'dist/**',
      '.ava-build/**',
      'public/**',
      'node_modules/**',
      'client/build/**',
      'client/public/**',
      'migrations/**',
    ],
  },
  {
    files: ['src/**/*.ts', 'client/src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
    },
    plugins: { '@typescript-eslint': typescript, security },
    rules: sharedRules,
  },
  // tsconfig.test.json covers all of src/, including the tests
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parserOptions: { project: './tsconfig.test.json', tsconfigRootDir: import.meta.dirname },
    },
    rules: typeAwareRules,
  },
  {
    files: ['client/src/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: { project: './client/tsconfig.json', tsconfigRootDir: import.meta.dirname },
    },
    rules: typeAwareRules,
  },
  prettier,
]
